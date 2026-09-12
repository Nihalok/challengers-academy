import 'dotenv/config';
import dns from 'dns';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import Stripe from 'stripe';
import { nanoid } from 'nanoid';
import { MongoClient, Db, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';

// Global Process Crash Prevention Handlers
process.on('uncaughtException', (err: any) => {
  console.error('🛡️ [Uncaught Exception caught]:', err?.message || err);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('🛡️ [Unhandled Rejection caught]:', reason?.message || reason);
});

// Fix for Node.js SRV record DNS query failures (querySrv ESERVFAIL) on Windows/ISP resolvers
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Fallback if environment restricts setting custom DNS servers
}

// In-Memory Fast Cache for Read-Heavy Public Data (Sub-millisecond API response)
const fastCache = new Map<string, { data: any; expiresAt: number }>();

function getCachedData<T>(key: string): T | null {
  const item = fastCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    fastCache.delete(key);
    return null;
  }
  return item.data as T;
}

function setCachedData(key: string, data: any, ttlSeconds: number = 60): void {
  fastCache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

function clearCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    fastCache.clear();
    return;
  }
  for (const key of fastCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      fastCache.delete(key);
    }
  }
}

// MongoDB Client Initialization with Connection Pool & Auto-Recovery
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isConnecting = false;
let connectPromise: Promise<Db | null> | null = null;

async function getMongoDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (mongoDb && mongoClient) {
    return mongoDb;
  }
  if (isConnecting && connectPromise) {
    return connectPromise;
  }

  isConnecting = true;
  connectPromise = (async () => {
    try {
      mongoClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 25,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        retryReads: true,
        family: 4,
      });

      mongoClient.on('error', (err) => {
        console.warn('⚠️ MongoDB Client Error:', err.message);
        mongoDb = null;
        mongoClient = null;
      });

      mongoClient.on('close', () => {
        console.warn('⚠️ MongoDB Connection Closed. Auto-reconnecting on next query.');
        mongoDb = null;
        mongoClient = null;
      });

      await mongoClient.connect();
      const dbName = process.env.MONGODB_DB_NAME || 'challengers_academy';
      mongoDb = mongoClient.db(dbName);
      console.log(` Connected to MongoDB Database: "${dbName}"`);
      return mongoDb;
    } catch (err: any) {
      console.warn('⚠️ MongoDB connection error:', err.message);
      mongoDb = null;
      mongoClient = null;
      return null;
    } finally {
      isConnecting = false;
      connectPromise = null;
    }
  })();

  return connectPromise;
}

// ============================================================
// AUTH HELPERS
// ============================================================
const JWT_SECRET = process.env.JWT_SECRET || 'challengers-dev-secret-change-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// In-memory login attempt tracker for rate limiting
const loginAttempts: Record<string, { count: number; firstAt: number; lockedUntil?: number }> = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_MS = 10 * 60 * 1000;  // 10 minute window

function checkLoginAttempts(identifier: string): { blocked: boolean; lockoutMs?: number } {
  const now = Date.now();
  const entry = loginAttempts[identifier];
  if (!entry) return { blocked: false };
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { blocked: true, lockoutMs: entry.lockedUntil - now };
  }
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    delete loginAttempts[identifier];
    return { blocked: false };
  }
  if (now - entry.firstAt > WINDOW_MS) {
    delete loginAttempts[identifier];
    return { blocked: false };
  }
  return { blocked: false };
}

function recordFailedAttempt(identifier: string): { lockout: boolean; lockoutMs?: number } {
  const now = Date.now();
  if (!loginAttempts[identifier]) {
    loginAttempts[identifier] = { count: 1, firstAt: now };
    return { lockout: false };
  }
  loginAttempts[identifier].count++;
  if (loginAttempts[identifier].count >= MAX_ATTEMPTS) {
    loginAttempts[identifier].lockedUntil = now + LOCKOUT_MS;
    return { lockout: true, lockoutMs: LOCKOUT_MS };
  }
  return { lockout: false };
}

function clearLoginAttempts(identifier: string) {
  delete loginAttempts[identifier];
}

function generateJWT(payload: object, rememberMe = false): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: rememberMe ? '30d' : '8h' });
}

function verifyJWT(token: string): any | null {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// JWT Auth Middleware
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const token = auth.slice(7);
  const payload = verifyJWT(token);
  if (!payload) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
  (req as any).admin = payload;
  next();
}

function requireOwner(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if ((req as any).admin?.role !== 'owner') {
      res.status(403).json({ success: false, message: 'Owner access required' });
      return;
    }
    next();
  });
}

// Nodemailer transporter (supports Gmail app password & custom SMTP)
function getMailTransporter() {
  let user = process.env.EMAIL_USER?.trim();
  if (!user && process.env.EMAIL_FROM) {
    const match = process.env.EMAIL_FROM.match(/<([^>]+)>/);
    user = match ? match[1].trim() : process.env.EMAIL_FROM.trim();
  }
  if (!user && process.env.ADMIN_SEED_EMAIL) {
    user = process.env.ADMIN_SEED_EMAIL.trim();
  }
  const pass = process.env.EMAIL_PASS?.trim()?.replace(/\s+/g, '');
  if (!user || !pass) {
    console.warn('⚠️ EMAIL_USER (or EMAIL_FROM) or EMAIL_PASS missing in environment');
    return null;
  }

  const host = process.env.EMAIL_HOST?.trim() || 'smtp.gmail.com';
  const isGmail = process.env.EMAIL_SERVICE === 'gmail' || user.includes('@gmail.com') || host === 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || (isGmail ? '465' : '587'));

  return nodemailer.createTransport({
    host: isGmail ? 'smtp.gmail.com' : host,
    port: port,
    secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: { user, pass },
    pool: false, // Critical for serverless: disables socket reuse to avoid dead/stale connections
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false
    }
  } as any);
}

function getFromAddress(): string {
  const envFrom = process.env.EMAIL_FROM?.trim();
  let user = process.env.EMAIL_USER?.trim();
  if (!user && envFrom) {
    const match = envFrom.match(/<([^>]+)>/);
    user = match ? match[1].trim() : envFrom;
  }
  user = user || process.env.ADMIN_SEED_EMAIL?.trim() || 'nihalok625@gmail.com';

  if (envFrom) {
    if (envFrom.includes('<') && envFrom.includes('>')) {
      return envFrom;
    }
    return `"Challengers Volleyball Academy" <${envFrom}>`;
  }
  return `"Challengers Volleyball Academy" <${user}>`;
}

async function sendPasswordResetEmail(email: string, resetToken: string, req?: any) {
  let appUrl = process.env.APP_URL;
  if (!appUrl || appUrl.includes('localhost')) {
    if (req) {
      const origin = req.get('origin') || req.get('referer');
      if (origin) {
        try {
          const parsed = new URL(origin);
          appUrl = `${parsed.protocol}//${parsed.host}`;
        } catch {
          appUrl = `${req.protocol}://${req.get('host')}`;
        }
      } else {
        appUrl = `${req.protocol}://${req.get('host')}`;
      }
    } else {
      appUrl = appUrl || 'http://localhost:3000';
    }
  }
  const resetUrl = `${appUrl}/login?reset=${resetToken}`;
  const transporter = getMailTransporter();
  if (!transporter) {
    console.log(`\n[PASSWORD RESET EMAIL]\nTo: ${email}\nReset URL: ${resetUrl}\n`);
    return;
  }
  const from = getFromAddress();
  await transporter.sendMail({
    from,
    to: email,
    subject: 'Challengers Academy - Admin Password Reset',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#1a1a1a;">Reset Your Password</h2>
        <p>Click the button below to reset your admin password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#e85d04;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;margin:16px 0;">Reset Password</a>
        <p style="color:#888;font-size:12px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

// In-memory reset tokens for fallback when DB is disconnected
const devResetTokens: Record<string, { email: string; expires: number }> = {};

// Seed first admin user on startup
async function seedFirstAdmin(db: Db) {
  const collection = db.collection('admin_users');
  const defaultEmail = (process.env.ADMIN_SEED_EMAIL || 'kenznajeeb@gmail.com').toLowerCase();
  const defaultPassword = process.env.ADMIN_SEED_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  const existing = await collection.findOne({ email: defaultEmail });
  if (!existing) {
    await collection.insertOne({
      email: defaultEmail,
      name: 'Academy Admin',
      role: 'owner',
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: null,
      loginCount: 0,
    });
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║         ADMIN ACCOUNT SEEDED                     ║');
    console.log(`║  Email:    ${defaultEmail.padEnd(38)}║`);
    console.log(`║  Password: ${defaultPassword.padEnd(38)}║`);
    console.log('╚══════════════════════════════════════════════════╝\n');
  }
}

// Official Academy Training Packages (The 7 Official Packages)
export const DEFAULT_PROGRAMS = [
  {
    id: 'gym-training-1hr',
    title: 'Gym Training (4 Sessions - 1 Hour)',
    phase: 'GROUP INDOOR',
    description: 'Indoor gym training — 4 focused 1-hour sessions covering volleyball mechanics, passing precision, and drills.',
    longDescription: 'Indoor gym training with 4 focused 1-hour sessions covering volleyball mechanics, passing precision, agility, and fundamental drill repetitions ($100).',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1200&auto=format&fit=crop',
    ageRange: 'All Ages / Group',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['4 x 1-Hour Sessions', 'Group Format', 'Indoor Gym Facility', 'Drills & Rotations'],
    price: 100,
    schedule: 'Weekly Batches (1 Hour / Session)',
    location: 'Fremont Arena / Tracy Gym',
    capacity: 25,
    filled: 10,
    coach: 'Wilson Mathew & Coaching Team',
    isActive: true,
    order: 1
  },
  {
    id: 'gym-training-4',
    title: 'Gym Training (4 Sessions)',
    phase: 'GROUP INDOOR',
    description: 'Core indoor academy training with structured drills, rotations, and scrimmages.',
    longDescription: 'Group training sessions in our indoor gym facility. 2 hours per session covering mechanics, passing precision, jump mechanics, rotational IQ, and active scrimmages.',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1200&auto=format&fit=crop',
    ageRange: 'All Ages / Group',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['4 x 2-Hour Sessions', 'Group Format', 'Indoor Gym Facility', 'Skills & Scrimmages'],
    price: 200,
    schedule: 'Weekly Batches (2 Hours / Session)',
    location: 'Fremont Arena / Tracy Gym',
    capacity: 25,
    filled: 14,
    coach: 'Wilson Mathew & Coaching Team',
    isActive: true,
    order: 1
  },
  {
    id: 'gym-training-12',
    title: 'Gym Training (12 Sessions - Best Value)',
    phase: 'GROUP INDOOR • BEST VALUE',
    description: 'Comprehensive 12-session indoor program for accelerated player development.',
    longDescription: 'Our highest-impact group development package. 12 indoor gym sessions (2 hours each) covering position-specific training, high repetition drills, game IQ, and tryout readiness.',
    image: 'https://images.unsplash.com/photo-1592656094267-764a45160876?q=80&w=1200&auto=format&fit=crop',
    ageRange: 'All Ages / Group',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['12 x 2-Hour Sessions', 'Best Value Package', 'Save $50 vs 4-Pack', 'Tryout & Match Prep'],
    price: 550,
    schedule: '3 Days / Week (2 Hours / Session)',
    location: 'Fremont Arena / Tracy Gym',
    capacity: 25,
    filled: 18,
    coach: 'Wilson Mathew & Senior Staff',
    isActive: true,
    order: 2
  },
  {
    id: 'open-park-private',
    title: 'Open Park (Private Coaching 1-on-1)',
    phase: '1-ON-1 PRIVATE',
    description: 'Dedicated 1-on-1 private coaching tailored entirely to your personal mechanics.',
    longDescription: '4 private coaching sessions (1 hour each) in open park courts. 100% focused one-on-one attention with personalized drills to eliminate technical weaknesses.',
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=1200&auto=format&fit=crop',
    ageRange: '1 Student Dedicated',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['4 x 1-Hour Sessions', '100% 1-on-1 Focus', 'Custom Mechanics', 'Flexible Booking'],
    price: 360,
    schedule: 'Flexible Schedule (1 Hour / Session)',
    location: 'Long Distance',
    capacity: 10,
    filled: 6,
    coach: 'Dedicated Master Coach',
    isActive: true,
    order: 3
  },
  {
    id: 'open-park-travel',
    title: 'Open Park (Short Distance Travel)',
    phase: '1-ON-1 TRAVEL',
    description: 'Personalized 1-on-1 coaching with coach travel to your local designated park court.',
    longDescription: '4 private sessions (1 hour each) with coach short-distance travel to your local park. Convenient, focused, and tailored to the athlete.',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    ageRange: '1 Student Dedicated',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['4 x 1-Hour Sessions', 'Coach Travels to You', 'Personalized Drills', 'Flexible Times'],
    price: 320,
    schedule: 'Flexible Schedule (1 Hour / Session)',
    location: 'Nearby Park Facility of Choice',
    capacity: 10,
    filled: 4,
    coach: 'Coach Wilson Mathew / Staff',
    isActive: true,
    order: 4
  },
  {
    id: 'open-park-group',
    title: 'Open Park - Group Training',
    phase: 'OUTDOOR GROUP',
    description: 'High-repetition outdoor group training building agility, ball control, and defense.',
    longDescription: '4 outdoor group training sessions (2 hours each). Great high-energy atmosphere focusing on agility, passing, court defense, and stamina ($150 per student).',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1200&auto=format&fit=crop',
    ageRange: 'Group Format',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['4 x 2-Hour Sessions', '$150 Per Student', 'High Repetition Drills', 'Outdoor Park Court'],
    price: 150,
    schedule: 'Weekly Batches (2 Hours / Session)',
    location: 'Open Park Facilities',
    capacity: 20,
    filled: 11,
    coach: 'Academy Coaching Staff',
    isActive: true,
    order: 5
  },
  {
    id: 'tryout-session',
    title: 'Tryout Session (2 Hours)',
    phase: 'ASSESSMENT / TRYOUT',
    description: '2-hour comprehensive skill evaluation and level assessment session.',
    longDescription: 'Perfect low-commitment trial for new athletes. 2-hour court assessment covering fundamental passing, setting, hitting mechanics, and tier placement recommendation ($30).',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1200&auto=format&fit=crop',
    ageRange: 'All Ages / Individual or Group',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['2-Hour Court Evaluation', 'Coach Skill Feedback', 'Placement Advice', 'No Long-Term Commitment'],
    price: 30,
    schedule: 'Weekly Tryout Slots (2 Hours Total)',
    location: 'Fremont Arena / Regional Gym',
    capacity: 30,
    filled: 12,
    coach: 'Wilson Mathew',
    isActive: true,
    order: 7
  }
];

// Default Summer Camps (Seasonal intensive clinics)
export const DEFAULT_CAMPS = [
  {
    id: 'summer-camp-7day',
    name: '7-Day Intensive Summer Clinic',
    duration: '7 Days',
    months: 'June & July 2026',
    bestFor: 'Technique Refinement',
    price: 350,
    schedule: 'Mon - Fri (9:00 AM - 1:00 PM)',
    location: 'Fremont Arena / Regional Facility',
    capacity: 25,
    filled: 14,
    coach: 'Wilson Mathew & Coaching Staff',
    description: 'Comprehensive 7-day clinic focused on rapid skill acceleration, positional mastery, and match play.',
    isActive: true,
    order: 1
  },
  {
    id: 'summer-camp-10day',
    name: '10-Day Elite Summer Intensive',
    duration: '10 Days',
    months: 'June & July 2026',
    bestFor: 'Game Strategy & Tactics',
    price: 480,
    schedule: 'Mon - Fri (9:00 AM - 1:00 PM)',
    location: 'Fremont Arena / Regional Facility',
    capacity: 25,
    filled: 18,
    coach: 'Wilson Mathew & Senior Staff',
    description: 'Position-specific mastery, advanced rotational systems, high-rep scrimmage sets, and agility conditioning.',
    isActive: true,
    order: 2
  },
  {
    id: 'summer-camp-15day',
    name: '15-Day Masterclass Camp',
    duration: '15 Days',
    months: 'June & July 2026',
    bestFor: 'Competitive Club & High School Prep',
    price: 650,
    schedule: 'Mon - Fri (9:00 AM - 1:00 PM)',
    location: 'Fremont Arena / Regional Facility',
    capacity: 25,
    filled: 19,
    coach: 'Wilson Mathew & Master Staff',
    description: 'Full biomechanical breakdown, video analysis, college recruitment guidance, and high-speed match play.',
    isActive: true,
    order: 3
  }
];

// Seed & sync official programs into MongoDB
async function seedPrograms(db: Db) {
  const collection = db.collection('programs');
  for (const prog of DEFAULT_PROGRAMS) {
    await collection.updateOne(
      { id: prog.id },
      { 
        $set: { 
          title: prog.title,
          price: prog.price,
          phase: prog.phase,
          description: prog.description,
          longDescription: prog.longDescription,
          ageRange: prog.ageRange,
          ageGroups: prog.ageGroups,
          features: prog.features,
          schedule: prog.schedule,
          location: prog.location,
          capacity: prog.capacity,
          coach: prog.coach,
          isActive: prog.isActive,
          order: prog.order,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
  }
  // Clean only obsolete legacy test IDs so admin-created courses remain intact
  const legacyIds = ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'little-spikers', 'foundations-clinic', 'large-group-training'];
  await collection.deleteMany({
    id: { $in: legacyIds }
  });
  console.log('✅ Programs catalog initialized in MongoDB.');
}

// Seed & sync official camps into MongoDB
async function seedCamps(db: Db) {
  const collection = db.collection('camps');
  // Remove duplicate regular program IDs that were mistakenly added to camps collection
  const duplicateProgramIds = [
    'gym-training-4', 'gym-training-12', 'open-park-private',
    'open-park-travel', 'open-park-group', 'large-group-training', 'tryout-session',
    'elite-camp', 'spikers-camp'
  ];
  await collection.deleteMany({
    id: { $in: duplicateProgramIds }
  });

  for (const camp of DEFAULT_CAMPS) {
    await collection.updateOne(
      { id: camp.id },
      { 
        $set: {
          name: camp.name,
          price: camp.price,
          duration: camp.duration,
          months: camp.months,
          bestFor: camp.bestFor,
          schedule: camp.schedule,
          location: camp.location,
          capacity: camp.capacity,
          coach: camp.coach,
          description: camp.description,
          isActive: camp.isActive,
          order: camp.order,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
  }
  console.log('✅ Summer Camps catalog initialized in MongoDB.');
}

// ─────────────────────────────────────────────────────────────
// ACADEMY GALLERY & STUDENT MEDIA ARCHIVES
// ─────────────────────────────────────────────────────────────
export interface GalleryMediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title: string;
  description?: string;
  category?: string;
  createdAt: number;
}

export const DEFAULT_GALLERY_ITEMS: GalleryMediaItem[] = [
  {
    id: 'coaching-session',
    type: 'image',
    url: '/src/assets/images/coaching.png',
    title: 'Coach Wilson at the Net',
    description: 'Coach Wilson Mathew during a live training session - focused, composed, and ready to coach.',
    category: 'Coaching & Technique',
    createdAt: 1700000001000
  },
  {
    id: 'wilson-training',
    type: 'image',
    url: '/src/assets/images/wilson.png',
    title: 'Team Formation Drill',
    description: 'Players spread across the court in formation during a structured team training drill.',
    category: 'Team Drills',
    createdAt: 1700000002000
  },
  {
    id: 'volley-practice',
    type: 'image',
    url: '/src/assets/images/volley.png',
    title: 'Setting Practice',
    description: 'Athletes perfecting their setting technique - the cornerstone of elite volleyball play.',
    category: 'Skill Foundations',
    createdAt: 1700000003000
  },
  {
    id: 'skill-dev',
    type: 'image',
    url: '/src/assets/images/skill_development_1783920238862.jpg',
    title: 'Skill Development',
    description: 'Intensive skill development drills building the fundamentals of elite volleyball.',
    category: 'Student Spotlight',
    createdAt: 1700000004000
  },
  {
    id: 'team-huddle',
    type: 'image',
    url: '/src/assets/images/team_training_huddle_1783920253600.jpg',
    title: 'Team Huddle',
    description: "High-energy team training and huddle under Coach Wilson's expert guidance.",
    category: 'Team Drills',
    createdAt: 1700000005000
  },
  {
    id: 'personal-coaching',
    type: 'image',
    url: '/src/assets/images/personal_coaching_1783920294194.jpg',
    title: 'Personal Coaching',
    description: 'One-on-one coaching sessions to sharpen individual technique and mental resilience.',
    category: 'Coaching & Technique',
    createdAt: 1700000006000
  },
  {
    id: 'volleyball-hero',
    type: 'image',
    url: '/src/assets/images/volleyball_hero_1783920221366.jpg',
    title: 'In Action',
    description: 'Elite athletes pushing their limits on the Challengers court.',
    category: 'Matches & Scrimmages',
    createdAt: 1700000007000
  },
  {
    id: 'journey-foundations',
    type: 'image',
    url: '/src/assets/images/journey_phase_1_foundations_1784052995126.jpg',
    title: 'Foundations Phase',
    description: 'Building strong volleyball fundamentals from day one.',
    category: 'Youth Academy',
    createdAt: 1700000008000
  },
  {
    id: 'journey-specialization',
    type: 'image',
    url: '/src/assets/images/journey_phase_2_specialization_1784053013443.jpg',
    title: 'Specialization Phase',
    description: 'Athletes honing their specialty positions and tactical understanding.',
    category: 'Skill Foundations',
    createdAt: 1700000009000
  },
  {
    id: 'journey-performance',
    type: 'image',
    url: '/src/assets/images/journey_phase_3_performance_1784053031683.jpg',
    title: 'Performance Phase',
    description: 'Athletes entering the high-performance stage of their development journey.',
    category: 'Matches & Scrimmages',
    createdAt: 1700000010000
  },
  {
    id: 'journey-mastery',
    type: 'image',
    url: '/src/assets/images/journey_phase_4_mastery_1784053049057.jpg',
    title: 'Mastery',
    description: 'The pinnacle of the Challengers development programme - elite mastery.',
    category: 'Student Spotlight',
    createdAt: 1700000011000
  },
  {
    id: 'vibrant-hero',
    type: 'image',
    url: '/src/assets/images/vibrant_volleyball_hero_action_1784055193011.jpg',
    title: 'Championship Spirit',
    description: 'Challengers athletes showcasing elite form and explosive athleticism.',
    category: 'Student Spotlight',
    createdAt: 1700000012000
  }
];

let galleryItemsList: GalleryMediaItem[] = [...DEFAULT_GALLERY_ITEMS];

// Seed & sync official gallery photos into MongoDB
async function seedGallery(db: Db) {
  try {
    const collection = db.collection('gallery');
    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(DEFAULT_GALLERY_ITEMS);
      console.log('✅ Default academy gallery items seeded into MongoDB.');
    } else {
      const items = await collection.find({}).sort({ createdAt: -1 }).toArray();
      galleryItemsList = items as any;
      console.log(` Loaded ${items.length} gallery photos from MongoDB.`);
    }
  } catch (err: any) {
    console.error('Gallery seed/load error:', err.message);
  }
}


let stripeInstance: Stripe | null = null;
function getStripe() {
  if (!stripeInstance) {
    const secret_key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secret_key) {
      console.warn('Stripe secret key missing. Using mock mode.');
      return null;
    }
    stripeInstance = new Stripe(secret_key);
  }
  return stripeInstance;
}

/**
 * Accurately extracts dynamic payment method details from Stripe objects
 * (PaymentIntent, CheckoutSession, Charge, or PaymentMethod)
 * Supports Apple Pay, Google Pay, Link, Card (with brand & last4), Cash App, ACH, etc.
 */
export async function extractStripePaymentMethodDetails(
  stripeObj: any,
  stripeClient?: Stripe | null
): Promise<{
  paymentMethod: string;
  paymentMethodType: string;
  cardBrand?: string;
  cardLast4?: string;
  wallet?: string;
}> {
  if (!stripeObj) {
    return { paymentMethod: 'Stripe', paymentMethodType: 'stripe' };
  }

  // 1. Direct inspection of payment_method_details (from Charge or PaymentIntent latest_charge)
  let pmd = stripeObj.payment_method_details || stripeObj.charges?.data?.[0]?.payment_method_details;
  let pmObj = stripeObj.payment_method;

  // 2. If payment_method is a string ID and stripe client is available, retrieve full details
  if (typeof pmObj === 'string' && stripeClient) {
    try {
      pmObj = await stripeClient.paymentMethods.retrieve(pmObj);
    } catch {
      // ignore
    }
  }

  // 3. If latest_charge is an ID and we don't have pmd, retrieve charge
  if (!pmd && typeof stripeObj.latest_charge === 'string' && stripeClient) {
    try {
      const ch = await stripeClient.charges.retrieve(stripeObj.latest_charge);
      if (ch && ch.payment_method_details) {
        pmd = ch.payment_method_details;
      }
    } catch {
      // ignore
    }
  }

  // 4. Extract from payment_method_details
  if (pmd) {
    const type = pmd.type || 'card';
    if (type === 'card' && pmd.card) {
      const card = pmd.card;
      const brand = (card.brand || 'Card').toUpperCase();
      const last4 = card.last4 || '';
      const walletType = card.wallet?.type || (card.wallet ? Object.keys(card.wallet)[0] : null);

      if (walletType === 'apple_pay') {
        return {
          paymentMethod: last4 ? `Apple Pay (${brand} ···· ${last4})` : 'Apple Pay',
          paymentMethodType: 'apple_pay',
          cardBrand: brand,
          cardLast4: last4,
          wallet: 'apple_pay'
        };
      }
      if (walletType === 'google_pay') {
        return {
          paymentMethod: last4 ? `Google Pay (${brand} ···· ${last4})` : 'Google Pay',
          paymentMethodType: 'google_pay',
          cardBrand: brand,
          cardLast4: last4,
          wallet: 'google_pay'
        };
      }
      if (walletType === 'link' || walletType === 'link_pm') {
        return {
          paymentMethod: 'Link',
          paymentMethodType: 'link',
          wallet: 'link'
        };
      }
      return {
        paymentMethod: last4 ? `Card (${brand} ···· ${last4})` : `Card (${brand})`,
        paymentMethodType: 'card',
        cardBrand: brand,
        cardLast4: last4
      };
    }
    if (type === 'link') {
      return { paymentMethod: 'Link', paymentMethodType: 'link' };
    }
    if (type === 'cashapp') {
      return { paymentMethod: 'Cash App', paymentMethodType: 'cashapp' };
    }
    if (type === 'us_bank_account') {
      return { paymentMethod: 'ACH Direct Debit', paymentMethodType: 'us_bank_account' };
    }
  }

  // 5. Extract from PaymentMethod object
  if (pmObj && typeof pmObj === 'object') {
    const type = pmObj.type || 'card';
    if (type === 'card' && pmObj.card) {
      const card = pmObj.card;
      const brand = (card.brand || 'Card').toUpperCase();
      const last4 = card.last4 || '';
      const walletType = card.wallet?.type || (card.wallet ? Object.keys(card.wallet)[0] : null);

      if (walletType === 'apple_pay') {
        return {
          paymentMethod: last4 ? `Apple Pay (${brand} ···· ${last4})` : 'Apple Pay',
          paymentMethodType: 'apple_pay',
          cardBrand: brand,
          cardLast4: last4,
          wallet: 'apple_pay'
        };
      }
      if (walletType === 'google_pay') {
        return {
          paymentMethod: last4 ? `Google Pay (${brand} ···· ${last4})` : 'Google Pay',
          paymentMethodType: 'google_pay',
          cardBrand: brand,
          cardLast4: last4,
          wallet: 'google_pay'
        };
      }
      if (walletType === 'link') {
        return { paymentMethod: 'Link', paymentMethodType: 'link', wallet: 'link' };
      }
      return {
        paymentMethod: last4 ? `Card (${brand} ···· ${last4})` : `Card (${brand})`,
        paymentMethodType: 'card',
        cardBrand: brand,
        cardLast4: last4
      };
    }
    if (type === 'link') {
      return { paymentMethod: 'Link', paymentMethodType: 'link' };
    }
  }

  // 6. Inspect payment_method_types array or checkout session details
  const types = stripeObj.payment_method_types || [];
  if (types.includes('link') && !types.includes('card')) {
    return { paymentMethod: 'Link', paymentMethodType: 'link' };
  }

  return { paymentMethod: 'Credit / Debit Card', paymentMethodType: 'card' };
}

// Session & Program Catalog with full metadata
export interface SessionCatalogItem {
  id: string;
  name: string;
  category: string;
  ageGroup: string;
  skillLevel: string;
  location: string;
  locationAddress: string;
  schedule: string;
  dates: string;
  time: string;
  price: number;
  capacity: number;
  filled: number;
  coach: string;
  description: string;
}

export const SESSIONS_CATALOG: Record<string, SessionCatalogItem> = {
  'gym-training-1hr': {
    id: 'gym-training-1hr',
    name: 'Gym Training (Group - 4 Sessions, 1 Hour)',
    category: 'Gym Training',
    ageGroup: 'All Ages / Group',
    skillLevel: 'Beginner to Advanced',
    location: 'Fremont / Tracy Facility',
    locationAddress: '43575 Mission Blvd, Fremont, CA',
    schedule: 'Weekly Batches (1 Hour / Session)',
    dates: 'Starting Next Weekend',
    time: '1 Hour per Session',
    price: 100,
    capacity: 25,
    filled: 10,
    coach: 'Wilson Mathew & Coaching Team',
    description: '4 group training sessions in our indoor gym facility. 1 hour per session covering mechanics, passing precision, and drills.'
  },
  'gym-training-4': {
    id: 'gym-training-4',
    name: 'Gym Training (Group - 4 Sessions)',
    category: 'Gym Training',
    ageGroup: 'All Ages / Group',
    skillLevel: 'Beginner to Advanced',
    location: 'Fremont / Tracy Facility',
    locationAddress: '43575 Mission Blvd, Fremont, CA',
    schedule: 'Weekly Batches (2 Hours / Session)',
    dates: 'Starting Next Weekend',
    time: '2 Hours per Session',
    price: 200,
    capacity: 25,
    filled: 14,
    coach: 'Wilson Mathew & Coaching Team',
    description: '4 group training sessions in our indoor gym facility. 2 hours per session covering mechanics, agility, and scrimmages.'
  },
  'gym-training-12': {
    id: 'gym-training-12',
    name: 'Gym Training (Group - 12 Sessions)',
    category: 'Gym Training',
    ageGroup: 'All Ages / Group',
    skillLevel: 'All Skill Levels (Best Value)',
    location: 'Fremont / Tracy Facility',
    locationAddress: '43575 Mission Blvd, Fremont, CA',
    schedule: '3 Days / Week (2 Hours / Session)',
    dates: 'Rolling Monthly Batches',
    time: '2 Hours per Session',
    price: 550,
    capacity: 25,
    filled: 18,
    coach: 'Wilson Mathew & Senior Staff',
    description: '12 comprehensive group training sessions in our indoor gym facility. 2 hours per session for full athlete progression.'
  },
  'open-park-private': {
    id: 'open-park-private',
    name: 'Open Park (Private Coaching - 1-on-1)',
    category: 'Private Coaching',
    ageGroup: '1 Student Dedicated',
    skillLevel: 'Personalized Progression',
    location: 'Long Distance',
    locationAddress: 'Coach travels to your preferred location',
    schedule: 'Flexible Scheduling',
    dates: 'Book on Demand',
    time: '1 Hour per Session',
    price: 360,
    capacity: 10,
    filled: 6,
    coach: 'Dedicated Master Coach',
    description: '4 one-on-one private coaching sessions (1 hour each) in open park. 100% focused personal mechanics coaching.'
  },
  'open-park-travel': {
    id: 'open-park-travel',
    name: 'Open Park (Short Distance Travel)',
    category: 'Private Coaching',
    ageGroup: '1 Student (Travel Coaching)',
    skillLevel: 'Personalized',
    location: 'Nearby Park Facility of Choice',
    locationAddress: 'Local Bay Area Park',
    schedule: 'Custom Travel Time',
    dates: 'Book on Demand',
    time: '1 Hour per Session',
    price: 320,
    capacity: 10,
    filled: 4,
    coach: 'Coach Wilson Mathew / Specialist',
    description: '4 private sessions (1 hour each) with coach short-distance travel to your local designated park court.'
  },
  'open-park-group': {
    id: 'open-park-group',
    name: 'Open Park Group Training',
    category: 'Open Park Group',
    ageGroup: 'Group Format',
    skillLevel: 'All Levels Welcome',
    location: 'Open Park Facilities',
    locationAddress: 'Outdoor Open Park Courts',
    schedule: 'Weekend & Weekday Slots',
    dates: 'Weekly Batches',
    time: '2 Hours per Session',
    price: 150,
    capacity: 20,
    filled: 11,
    coach: 'Academy Coaching Staff',
    description: '4 outdoor group training sessions (2 hours each). High reps, agility, ball control, and defense ($150 per student).'
  },
  'tryout-session': {
    id: 'tryout-session',
    name: 'Tryout Session (2 Hours)',
    category: 'Tryout & Assessment',
    ageGroup: 'All Ages Welcome',
    skillLevel: 'First-Timers & Evaluations',
    location: 'Fremont Arena / Regional Gym',
    locationAddress: '43575 Mission Blvd, Fremont, CA',
    schedule: 'Weekly Tryout Slots',
    dates: 'Upcoming Weekend',
    time: '2 Hours Total',
    price: 30,
    capacity: 30,
    filled: 12,
    coach: 'Wilson Mathew',
    description: '2-hour comprehensive tryout evaluation session. Direct Head Coach feedback, skill testing, and tier placement ($30).'
  },
  'little-spikers-fremont': {
    id: 'little-spikers-fremont',
    name: 'Little Spikers Foundation',
    category: 'Junior Training',
    ageGroup: 'Ages 5 - 10',
    skillLevel: 'Beginner / First Timers',
    location: 'Fremont Arena',
    locationAddress: '43575 Mission Blvd, Fremont, CA',
    schedule: 'Saturdays & Sundays',
    dates: 'Starting Next Weekend',
    time: '9:00 AM - 10:30 AM',
    price: 200,
    capacity: 20,
    filled: 12,
    coach: 'Wilson Mathew & Team',
    description: 'Motor skills, fun movement drills, basic ball control, and encouraging teamwork.'
  },
  'youth-foundations-fremont': {
    id: 'youth-foundations-fremont',
    name: 'Youth Foundations Intensive',
    category: 'Development Program',
    ageGroup: 'Ages 11 - 14',
    skillLevel: 'Beginner to Intermediate',
    location: 'Fremont Arena',
    locationAddress: '43575 Mission Blvd, Fremont, CA',
    schedule: 'Tuesday & Thursday Evenings',
    dates: 'Bi-Weekly Batches',
    time: '5:30 PM - 7:30 PM',
    price: 250,
    capacity: 25,
    filled: 18,
    coach: 'Coach Wilson Mathew',
    description: 'Technical serving power, passing precision, 6-2 rotation fundamentals, and school tryout prep.'
  },
  'high-school-prep-tracy': {
    id: 'high-school-prep-tracy',
    name: 'High School Prep & Varsity Camp',
    category: 'Elite Preparation',
    ageGroup: 'Ages 14 - 18',
    skillLevel: 'Intermediate to Advanced',
    location: 'Tracy Sports Complex',
    locationAddress: '1255 N Tracy Blvd, Tracy, CA',
    schedule: 'Monday, Wednesday & Friday',
    dates: 'Monthly Intensive',
    time: '6:00 PM - 8:00 PM',
    price: 300,
    capacity: 20,
    filled: 15,
    coach: 'Coach Sarah & Michael',
    description: 'High-speed game reads, jump float serves, aggressive blocking, and situational scrimmage play.'
  },
  'summer-camp-2026-fremont': {
    id: 'summer-camp-2026-fremont',
    name: 'Summer Elite 7-Day Camp',
    category: 'Summer Intensive',
    ageGroup: 'Ages 8 - 17 (Grouped by Skill)',
    skillLevel: 'All Skill Levels Welcome',
    location: 'Fremont Central Courts',
    locationAddress: '43575 Mission Blvd, Fremont, CA',
    schedule: 'Monday through Sunday (Full Week)',
    dates: 'July 14 - July 20, 2026',
    time: '9:00 AM - 1:00 PM (Half-Day)',
    price: 350,
    capacity: 50,
    filled: 42,
    coach: 'Wilson Mathew & Senior Staff',
    description: 'Immersive 7-day volleyball boot camp covering position specialization, competitive matches, and video breakdown.'
  }
};

// In-memory Database for Leads and Confirmed Registrations
export interface RegistrationRecord {
  registrationId: string;
  sessionId: string;
  sessionName: string;
  playerName: string;
  parentName?: string;
  email: string;
  phone: string;
  dob?: string;
  age?: string;
  location: string;
  schedule: string;
  amountPaid: number;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  paymentMethod?: 'Card' | 'QR Code' | 'Zelle' | 'Venmo' | 'Cash App' | 'UPI' | string;
  transactionId?: string;
  medicalNotes?: string;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  waiverAccepted: boolean;
  registeredAt: number;
  // Sibling Enrollment & Discount Details
  hasSibling?: boolean;
  siblingName?: string;
  siblingDob?: string;
  siblingGender?: string;
  discountAmount?: number;
  basePrice?: number;
  totalAthletes?: number;
}

export interface AcademyPaymentSettings {
  academyName: string;
  recipientName: string;
  zellePhone: string;
  zelleEmail: string;
  venmoHandle: string;
  cashAppHandle: string;
  upiId: string;
  qrCustomImageUrl: string;
  paymentInstructions: string;
  enableQrPayment: boolean;
  enableCardPayment: boolean;
}

let academyPaymentSettings: AcademyPaymentSettings = {
  academyName: 'Challengers Volleyball Academy',
  recipientName: 'Wilson Mathew / Challengers Academy',
  zellePhone: '+1 (863) 845-9913',
  zelleEmail: 'kenznajeeb@gmail.com',
  venmoHandle: '@Challengers-Academy',
  cashAppHandle: '$ChallengersAcademy',
  upiId: '18638459913@upi',
  qrCustomImageUrl: '',
  paymentInstructions: 'Scan the official Academy QR Code with your Banking App, Zelle, Venmo, Cash App, or UPI. Enter your transaction/reference ID below to complete enrollment.',
  enableQrPayment: true,
  enableCardPayment: true
};

async function loadPaymentSettingsFromDb() {
  try {
    const db = await getMongoDb();
    if (db) {
      const saved = await db.collection('payment_settings').findOne({ id: 'global_payment_settings' });
      if (saved) {
        academyPaymentSettings = { ...academyPaymentSettings, ...saved };
        console.log(' Loaded Academy Payment & QR settings from MongoDB');
      }
    }
  } catch (err: any) {
    console.error('Error loading payment settings:', err.message);
  }
}

const registrations: Record<string, RegistrationRecord> = {};
const leads: Record<string, any> = {};

// Helper: Save registration to memory and MongoDB
async function saveRegistrationToDb(reg: RegistrationRecord) {
  registrations[reg.registrationId] = reg;
  const db = await getMongoDb();
  if (db) {
    try {
      await db.collection('registrations').updateOne(
        { registrationId: reg.registrationId },
        { $set: reg },
        { upsert: true }
      );
      console.log(` Saved registration ${reg.registrationId} to MongoDB`);
    } catch (err: any) {
      console.error('MongoDB save registration error:', err.message);
    }
  }
}

// Helper: Save lead to memory and MongoDB
async function saveLeadToDb(lead: any) {
  leads[lead.id] = lead;
  const db = await getMongoDb();
  if (db) {
    try {
      await db.collection('leads').updateOne(
        { id: lead.id },
        { $set: lead },
        { upsert: true }
      );
    } catch (err: any) {
      console.error('MongoDB save lead error:', err.message);
    }
  }
}

// Helper: Generate unique CVA Registration ID
function generateRegistrationId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `CVA-${num}`;
}

// Automated Email Notification Service
async function sendAdminNotificationEmail(reg: RegistrationRecord): Promise<boolean> {
  const adminEmail = (process.env.ACADEMY_ADMIN_EMAIL || process.env.ADMIN_SEED_EMAIL || process.env.EMAIL_USER || 'nihalok625@gmail.com').trim();
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const transporter = getMailTransporter();
  const from = getFromAddress();

  console.log(`[EMAIL DISPATCH] Attempting Admin Notification → ${adminEmail} for Registration ${reg.registrationId}`);

  if (!transporter) {
    console.warn(`⚠️ [EMAIL SKIPPED] Admin email not sent: EMAIL_USER or EMAIL_PASS not configured in environment.`);
    return false;
  }

  const emailSubject = `🚨 [New Paid Registration] ${reg.playerName}${reg.hasSibling ? ` + Sibling (${reg.siblingName})` : ''} - ${reg.sessionName} ($${reg.amountPaid}) [${reg.paymentMethod || 'Stripe'}]`;

  try {
    const info = await transporter.sendMail({
      from,
      to: adminEmail,
      subject: emailSubject,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f0; margin: 0; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #eae5db; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <div style="background: #1B1B1D; padding: 28px; text-align: center;">
              <div style="display: inline-block; background: #ea580c; color: #ffffff; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; padding: 6px 14px; border-radius: 50px; margin-bottom: 12px;">
                New Paid Registration (${reg.paymentMethod || 'Stripe'})
              </div>
              ${reg.hasSibling ? `
              <div style="display: block; margin-bottom: 8px;">
                <span style="background: #22c55e; color: #ffffff; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 10px; border-radius: 20px;">
                  ✨ 2 Athletes Enrolled (Sibling Discount -$50 Applied)
                </span>
              </div>
              ` : ''}
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
                ${reg.playerName}${reg.hasSibling ? ` & ${reg.siblingName}` : ''}
              </h1>
              <p style="color: #ea580c; margin: 4px 0 0 0; font-size: 16px; font-weight: bold;">
                $${reg.amountPaid} USD - ${reg.sessionName}
              </p>
            </div>

            <div style="padding: 28px;">

              <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #8c827a; margin: 0 0 16px 0;">
                Athlete & Parent Details
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600; width: 40%;">Registration ID:</td>
                  <td style="padding: 10px 0; color: #1B1B1D; font-weight: 900;">${reg.registrationId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Primary Athlete:</td>
                  <td style="padding: 10px 0; color: #1B1B1D; font-weight: bold;">${reg.playerName} ${reg.dob ? `(DOB: ${reg.dob})` : ''}</td>
                </tr>
                ${reg.hasSibling ? `
                <tr style="border-bottom: 1px solid #f2ede4; background-color: #f0fdf4;">
                  <td style="padding: 10px 0; color: #166534; font-weight: 700;">Sibling Athlete (Athlete 2):</td>
                  <td style="padding: 10px 0; color: #166534; font-weight: bold;">${reg.siblingName || 'Sibling'} ${reg.siblingDob ? `(DOB: ${reg.siblingDob})` : ''}</td>
                </tr>
                ` : ''}
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Parent/Guardian:</td>
                  <td style="padding: 10px 0; color: #1B1B1D;">${reg.parentName || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Email:</td>
                  <td style="padding: 10px 0; color: #ea580c; font-weight: bold;">${reg.email}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Phone:</td>
                  <td style="padding: 10px 0; color: #1B1B1D;">${reg.phone}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Emergency Contact:</td>
                  <td style="padding: 10px 0; color: #1B1B1D;">${reg.emergencyContactName || 'N/A'} (${reg.emergencyContactPhone || 'N/A'})</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Schedule & Location:</td>
                  <td style="padding: 10px 0; color: #1B1B1D;">${reg.schedule} - ${reg.location}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Payment Method:</td>
                  <td style="padding: 10px 0; color: #1B1B1D; font-weight: bold;">${reg.paymentMethod || 'Card'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Total Amount Paid:</td>
                  <td style="padding: 10px 0; color: #16a34a; font-weight: 900;">$${reg.amountPaid} USD ${reg.hasSibling ? '($50 Sibling Discount Deducted)' : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Payment / Ref ID:</td>
                  <td style="padding: 10px 0; color: #1B1B1D; font-family: monospace; font-size: 12px;">${reg.transactionId || reg.stripePaymentIntentId || 'N/A'}</td>
                </tr>
              </table>

              <div style="text-align: center; margin-top: 24px;">
                <a href="${appUrl}/admin" style="display: inline-block; background: #1B1B1D; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">
                  View in Admin Dashboard →
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });
    console.log(`✅ [EMAIL SENT] Admin notification sent successfully to ${adminEmail} (MessageId: ${info.messageId})`);
    return true;
  } catch (err: any) {
    console.error(`❌ [EMAIL ERROR] Admin email dispatch failed (${adminEmail}):`, {
      code: err.code || 'UNKNOWN',
      responseCode: err.responseCode,
      response: err.response,
      message: err.message
    });
    return false;
  }
}

async function sendCustomerConfirmationEmail(reg: RegistrationRecord): Promise<boolean> {
  const transporter = getMailTransporter();
  const from = getFromAddress();
  const customerName = reg.parentName || reg.playerName;
  const targetEmail = String(reg.email || '').trim().toLowerCase();

  console.log(`[EMAIL DISPATCH] Attempting Customer Confirmation → ${targetEmail} for Registration ${reg.registrationId}`);

  if (!targetEmail || !targetEmail.includes('@') || targetEmail.includes('example.com')) {
    console.warn(`⚠️ [CUSTOMER EMAIL SKIPPED] Recipient email is missing or dummy: "${targetEmail}"`);
    return false;
  }

  if (!transporter) {
    console.warn(`⚠️ [EMAIL SKIPPED] Customer email not sent: EMAIL_USER or EMAIL_PASS not configured in environment.`);
    return false;
  }

  try {
    const textSummary = `
Registration Confirmed! 🎉
Welcome to Challengers Volleyball Academy, ${customerName}!

Registration ID: ${reg.registrationId}
Program / Session: ${reg.sessionName}
Primary Athlete: ${reg.playerName}
${reg.hasSibling ? `Sibling Athlete: ${reg.siblingName || 'Sibling'} (Enrolled - $50 Sibling Discount Applied)\n` : ''}Schedule: ${reg.schedule}
Location: ${reg.location}
Payment Method: ${reg.paymentMethod || 'Stripe'}
Total Amount Paid: $${reg.amountPaid}.00 USD (PAID)
${reg.transactionId ? `Transaction / Stripe ID: ${reg.transactionId}\n` : ''}
What to Bring to Your First Session:
- Athletic shoes with good court grip (non-marking soles)
- Comfortable athletic clothing & knee pads
- Refillable water bottle & small towel
- Please arrive 10 minutes prior to session start time

If you have questions, reply to this email or call us at (510) 909-5834.
Challengers Volleyball Academy - Bay Area, CA
`;

    const info = await transporter.sendMail({
      from,
      to: targetEmail,
      replyTo: process.env.ACADEMY_ADMIN_EMAIL || process.env.EMAIL_USER || 'nihalok625@gmail.com',
      subject: `🎉 Registration Confirmed: ${reg.sessionName} (${reg.registrationId})`,
      text: textSummary,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f0; margin: 0; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #eae5db; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
            <div style="background: #1B1B1D; padding: 36px 28px; text-align: center;">
              <div style="display: inline-block; background: #ea580c; color: #ffffff; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; padding: 6px 16px; border-radius: 50px; margin-bottom: 14px;">
                Official Receipt & Confirmation
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
                Welcome to Challengers!
              </h1>
              <p style="color: #d4cfc7; margin: 8px 0 0 0; font-size: 14px;">
                Hi ${customerName}, your registration is confirmed.
              </p>
            </div>

            <div style="padding: 32px 28px;">
              <div style="background: #fff8f5; border: 1px solid #fed7aa; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 28px;">
                <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #ea580c; margin-bottom: 4px;">
                  Registration Booking Code
                </div>
                <div style="font-size: 28px; font-weight: 900; color: #1B1B1D; letter-spacing: 2px;">
                  ${reg.registrationId}
                </div>
                <div style="font-size: 12px; color: #8c827a; margin-top: 4px;">
                  Please present this code on your first day of training.
                </div>
              </div>

              <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #8c827a; margin: 0 0 16px 0;">
                Session & Payment Summary
              </h3>

              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600; width: 40%;">Program / Session:</td>
                  <td style="padding: 10px 0; color: #1B1B1D; font-weight: bold;">${reg.sessionName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Primary Athlete:</td>
                  <td style="padding: 10px 0; color: #1B1B1D; font-weight: bold;">${reg.playerName}</td>
                </tr>
                ${reg.hasSibling ? `
                <tr style="border-bottom: 1px solid #f2ede4; background-color: #f0fdf4;">
                  <td style="padding: 10px 0; color: #166534; font-weight: 700;">Sibling Athlete:</td>
                  <td style="padding: 10px 0; color: #166534; font-weight: bold;">${reg.siblingName || 'Sibling'} (Enrolled)</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Sibling Family Discount:</td>
                  <td style="padding: 10px 0; color: #16a34a; font-weight: bold;">-$50.00 USD (Deducted)</td>
                </tr>
                ` : ''}
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Schedule & Timings:</td>
                  <td style="padding: 10px 0; color: #1B1B1D;">${reg.schedule}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Training Location:</td>
                  <td style="padding: 10px 0; color: #1B1B1D;">${reg.location}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Payment Method:</td>
                  <td style="padding: 10px 0; color: #1B1B1D; font-weight: bold;">${reg.paymentMethod || 'Card'}</td>
                </tr>
                ${reg.transactionId ? `
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Transaction / Ref ID:</td>
                  <td style="padding: 10px 0; color: #1B1B1D; font-family: monospace; font-size: 13px;">${reg.transactionId}</td>
                </tr>
                ` : ''}
                <tr style="border-bottom: 1px solid #f2ede4;">
                  <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Total Amount Paid:</td>
                  <td style="padding: 10px 0; color: #16a34a; font-weight: 900; font-size: 16px;">$${reg.amountPaid} USD (PAID)</td>
                </tr>
              </table>

              <div style="background: #f7f5f0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 900; text-transform: uppercase; color: #1B1B1D;">
                  What to Bring to Your First Session
                </h4>
                <ul style="margin: 0; padding-left: 18px; color: #5a534d; font-size: 13px; line-height: 1.6;">
                  <li>Athletic shoes with good court grip (non-marking soles)</li>
                  <li>Comfortable athletic clothing & knee pads (optional but recommended)</li>
                  <li>Refillable water bottle & small towel</li>
                  <li>Please arrive 10 minutes prior to session start time</li>
                </ul>
              </div>

              <div style="text-align: center; border-top: 1px solid #f2ede4; padding-top: 20px; color: #8c827a; font-size: 12px;">
                Have questions or need assistance? Reply directly to this email or call us at +1 (510) 909-5834.<br />
                <strong>Challengers Volleyball Academy</strong> - Bay Area, CA
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });
    console.log(`✅ [EMAIL SENT] Customer confirmation sent successfully to ${targetEmail} (MessageId: ${info.messageId})`);
    return true;
  } catch (err: any) {
    console.error(`❌ [EMAIL ERROR] Customer confirmation dispatch failed (${targetEmail}):`, {
      code: err.code || 'UNKNOWN',
      responseCode: err.responseCode,
      response: err.response,
      message: err.message
    });
    return false;
  }
}

let galleryItems = [
  { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc', title: 'Elite Training Session', description: 'Core strength and tactical positioning.' },
  { id: '2', type: 'image', url: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04', title: 'Championship Finals', description: 'The moment of victory for our under-17 squad.' },
  { id: '3', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-basketball-player-practicing-a-slam-dunk-2045-large.mp4', title: 'Dunk Highlights', description: 'Advanced aerial maneuvers workshop.' },
  { id: '4', type: 'image', url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a', title: 'Outdoor Drills', description: 'Building endurance in natural environments.' }
];

export async function createApp() {
  const app = express();

  // Vercel URL Path Rewrite Recovery Middleware (Only if query parameter __path is provided by Vercel rewrite)
  app.use((req, res, next) => {
    if (req.query?.__path) {
      const subPath = Array.isArray(req.query.__path) ? req.query.__path.join('/') : req.query.__path;
      req.url = `/api/${subPath}`;
    }
    next();
  });

  // 1. Stripe Raw Webhook Endpoint (supports raw Buffer, string, and serverless pre-parsed payloads)
  app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripe = getStripe();

    let event: Stripe.Event | any = null;

    // Handle raw payload (Buffer, string, or pre-parsed object from Vercel/Express)
    const rawPayload = Buffer.isBuffer(req.body)
      ? req.body
      : (typeof req.body === 'string' ? req.body : (req as any).rawBody || JSON.stringify(req.body));

    if (stripe && webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(rawPayload, sig, webhookSecret);
      } catch (err: any) {
        console.warn(`⚠️ Webhook signature warning: ${err.message}. Attempting direct Stripe API verification...`);
        // Fallback for serverless environments where body stream is mutated: direct Stripe API retrieval
        try {
          const parsed = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(rawPayload.toString());
          if (parsed?.id && typeof parsed.id === 'string' && parsed.id.startsWith('evt_')) {
            event = await stripe.events.retrieve(parsed.id);
            console.log(`✅ Authenticated event ${parsed.id} directly via Stripe API.`);
          }
        } catch (apiErr: any) {
          console.error(`⚠️ Webhook direct event retrieval failed:`, apiErr.message);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      }
    } else if (stripe && req.body) {
      // Fallback: Check if event ID exists and authenticate directly via Stripe API
      try {
        const parsed = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(rawPayload.toString());
        if (parsed?.id && typeof parsed.id === 'string' && parsed.id.startsWith('evt_')) {
          event = await stripe.events.retrieve(parsed.id);
          console.log(`✅ Authenticated Stripe event ${parsed.id} directly via API.`);
        } else {
          event = parsed;
        }
      } catch {
        event = req.body;
      }
    } else {
      try {
        event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch {
        event = req.body;
      }
    }

    if (!event) {
      return res.status(400).json({ error: 'Missing or unreadable webhook payload' });
    }

    console.log(`🔔 Stripe Webhook Received: ${event?.type || 'unknown_event'} (${event?.id || 'no-id'})`);

    const relevantEvents = ['payment_intent.succeeded', 'checkout.session.completed', 'charge.succeeded'];
    if (relevantEvents.includes(event.type)) {
      let sessionOrIntent = event.data?.object;
      let paymentIntentId = sessionOrIntent.id;
      let stripeSessionId: string | undefined = undefined;

      if (event.type === 'checkout.session.completed') {
        stripeSessionId = sessionOrIntent.id;
        paymentIntentId = sessionOrIntent.payment_intent || sessionOrIntent.id;
        // If payment_intent is just an ID, retrieve full payment intent from Stripe for complete details
        if (stripe && typeof sessionOrIntent.payment_intent === 'string') {
          try {
            const pi = await stripe.paymentIntents.retrieve(sessionOrIntent.payment_intent);
            if (pi) sessionOrIntent = { ...sessionOrIntent, ...pi, metadata: { ...sessionOrIntent.metadata, ...pi.metadata } };
          } catch (e: any) {
            console.warn('Could not expand payment intent from checkout session:', e.message);
          }
        }
      } else if (event.type === 'charge.succeeded') {
        paymentIntentId = sessionOrIntent.payment_intent || sessionOrIntent.id;
        if (stripe && typeof sessionOrIntent.payment_intent === 'string') {
          try {
            const pi = await stripe.paymentIntents.retrieve(sessionOrIntent.payment_intent);
            if (pi) sessionOrIntent = { ...pi, metadata: { ...sessionOrIntent.metadata, ...pi.metadata } };
          } catch {
            // ignore
          }
        }
      }

      const metadata = sessionOrIntent?.metadata || {};
      const regIdFromMeta = metadata.registrationId;
      const leadIdFromMeta = metadata.leadId;

      // Extract dynamic payment method (Apple Pay, Google Pay, Link, Card brand/last4, etc.)
      const paymentMethodInfo = await extractStripePaymentMethodDetails(sessionOrIntent, stripe);
      const dynamicPaymentMethod = paymentMethodInfo.paymentMethod;

      // Query database for matching lead to restore any missing student details
      const db = await getMongoDb();
      let matchedLead: any = null;
      if (leadIdFromMeta && leads[leadIdFromMeta]) {
        matchedLead = leads[leadIdFromMeta];
      } else if (db) {
        try {
          if (leadIdFromMeta) {
            matchedLead = await db.collection('leads').findOne({ id: leadIdFromMeta });
          } else if (regIdFromMeta) {
            matchedLead = await db.collection('leads').findOne({ registrationId: regIdFromMeta });
          } else if (paymentIntentId) {
            matchedLead = await db.collection('leads').findOne({ paymentIntentId });
          }
        } catch (e: any) {
          console.warn('Lead lookup in webhook:', e.message);
        }
      }

      const registrationId = regIdFromMeta || matchedLead?.registrationId || generateRegistrationId();

      // Database idempotency check: prevent duplicate registration or duplicate email dispatch
      let existingRecord: any = registrations[registrationId];
      if (!existingRecord && db) {
        try {
          existingRecord = await db.collection('registrations').findOne({
            $or: [
              { registrationId },
              ...(paymentIntentId ? [{ stripePaymentIntentId: paymentIntentId }, { transactionId: paymentIntentId }] : []),
              ...(stripeSessionId ? [{ stripeSessionId }] : [])
            ]
          });
        } catch (e: any) {
          console.warn('Registration idempotency query error:', e.message);
        }
      }

      if (existingRecord && existingRecord.paymentStatus === 'PAID') {
        console.log(`ℹ️ Registration ${existingRecord.registrationId} already confirmed in DB. Updating method if needed.`);
        // Update payment method with specific details if previously generic
        if (db && dynamicPaymentMethod && dynamicPaymentMethod !== 'Stripe' && existingRecord.paymentMethod !== dynamicPaymentMethod) {
          try {
            await db.collection('registrations').updateOne(
              { _id: existingRecord._id },
              { $set: { paymentMethod: dynamicPaymentMethod, transactionId: paymentIntentId || existingRecord.transactionId } }
            );
            if (registrations[existingRecord.registrationId]) {
              registrations[existingRecord.registrationId].paymentMethod = dynamicPaymentMethod;
            }
          } catch { /* ignore */ }
        }
        return res.json({ received: true, alreadyProcessed: true });
      }

      const sessionId = metadata.sessionId || matchedLead?.sessionId || 'starter-pack';
      const sessionItem = SESSIONS_CATALOG[sessionId];
      const amountPaid = sessionOrIntent.amount_total 
        ? sessionOrIntent.amount_total / 100 
        : (sessionOrIntent.amount ? sessionOrIntent.amount / 100 : (matchedLead?.amount || sessionItem?.price || 30));

      const isSiblingEnrolled = metadata.hasSibling === 'true' || metadata.hasSibling === true || matchedLead?.hasSibling === true || matchedLead?.hasSibling === 'true';
      const discountAmount = Number(metadata.discountAmount) || (isSiblingEnrolled ? 50 : 0);

      const customerEmail = (
        metadata.email || 
        matchedLead?.email || 
        sessionOrIntent.customer_details?.email || 
        sessionOrIntent.receipt_email || 
        sessionOrIntent.billing_details?.email || 
        (sessionOrIntent.charges?.data?.[0]?.billing_details?.email) ||
        'N/A'
      ).trim();

      const customerPhone = (
        metadata.phone || 
        matchedLead?.phone || 
        sessionOrIntent.customer_details?.phone || 
        'N/A'
      ).trim();

      const resolvedPlayerName = metadata.playerName || matchedLead?.playerName || sessionOrIntent.customer_details?.name || 'Student Athlete';
      const resolvedParentName = metadata.parentName || matchedLead?.parentName || '';

      const newRegistration: RegistrationRecord = {
        registrationId,
        sessionId,
        sessionName: metadata.sessionName || matchedLead?.sessionName || sessionItem?.name || 'Challengers Coaching Session',
        playerName: resolvedPlayerName,
        parentName: resolvedParentName,
        email: customerEmail,
        phone: customerPhone,
        dob: metadata.dob || matchedLead?.dob || '',
        location: metadata.preferredLocation || metadata.location || matchedLead?.preferredLocation || matchedLead?.location || sessionItem?.location || 'Fremont (Kerala House)',
        schedule: metadata.schedule || matchedLead?.schedule || sessionItem?.schedule || 'Weekend Sessions',
        amountPaid,
        paymentStatus: 'PAID',
        paymentMethod: dynamicPaymentMethod,
        transactionId: paymentIntentId,
        stripePaymentIntentId: paymentIntentId,
        stripeSessionId: stripeSessionId || sessionOrIntent.id,
        emergencyContactName: metadata.emergencyContactName || matchedLead?.emergencyContactName || '',
        emergencyContactPhone: metadata.emergencyContactPhone || matchedLead?.emergencyContactPhone || '',
        waiverAccepted: metadata.waiverAccepted === 'true' || metadata.waiverAccepted === true || matchedLead?.waiverAccepted === true || true,
        registeredAt: Date.now(),
        // Sibling Details
        hasSibling: isSiblingEnrolled,
        siblingName: metadata.siblingName || matchedLead?.siblingName || '',
        siblingDob: metadata.siblingDob || matchedLead?.siblingDob || '',
        siblingGender: metadata.siblingGender || matchedLead?.siblingGender || '',
        discountAmount,
        basePrice: Number(metadata.basePrice) || Number(matchedLead?.basePrice) || (sessionItem?.price || 200),
        totalAthletes: isSiblingEnrolled ? 2 : 1
      };

      // Save to database (memory + MongoDB)
      await saveRegistrationToDb(newRegistration);

      // Increment booked spots (1 or 2 for sibling)
      if (sessionItem && sessionItem.filled < sessionItem.capacity) {
        sessionItem.filled = Math.min(sessionItem.capacity, sessionItem.filled + (isSiblingEnrolled ? 2 : 1));
      }

      // Update lead if linked
      if (matchedLead) {
        matchedLead.status = 'confirmed';
        matchedLead.registrationId = registrationId;
        await saveLeadToDb(matchedLead);
      }

      // Dispatch automated emails (awaited for serverless safety)
      console.log(`✉️ Dispatching confirmation emails for ${dynamicPaymentMethod} payment (${registrationId})...`);
      await Promise.allSettled([
        sendAdminNotificationEmail(newRegistration),
        sendCustomerConfirmationEmail(newRegistration)
      ]);
    }

    res.json({ received: true });
  });

  // CORS & Security Headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Body parser (supports Vercel pre-parsed body and raw stream parsing)
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      return next();
    }
    express.json({ limit: '50mb' })(req, res, (err) => {
      if (err) return next(err);
      express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
    });
  });

  // Health & Database Diagnostics Check
  app.get('/api/health', async (req, res) => {
    let dbStatus = 'disconnected';
    let dbError = null;
    try {
      const db = await getMongoDb();
      if (db) {
        await db.command({ ping: 1 });
        dbStatus = 'connected';
      }
    } catch (e: any) {
      dbError = e.message;
    }

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      databaseError: dbError,
      environment: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasGoogleClient: !!(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID),
        hasEmailUser: !!(process.env.EMAIL_USER || process.env.EMAIL_FROM),
        appUrl: process.env.APP_URL || 'Not set'
      }
    });
  });

  app.get('/api/db-status', async (req, res) => {
    try {
      const db = await getMongoDb();
      if (!db) {
        return res.json({ success: false, message: 'MongoDB not connected. Check MONGODB_URI or Atlas Network Access (0.0.0.0/0).' });
      }
      const collections = await db.listCollections().toArray();
      res.json({ success: true, message: 'MongoDB connected successfully!', collections: collections.map(c => c.name) });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'MongoDB connection error: ' + err.message });
    }
  });

  // POST /api/contact - Send enquiry directly to admin email
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body || {};
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
      }

      const adminEmail = process.env.ACADEMY_ADMIN_EMAIL || process.env.EMAIL_USER || 'challengersvolleyballacademy@gmail.com';
      const transporter = getMailTransporter();
      const from = getFromAddress();

      const leadId = `ENQ-${nanoid(8).toUpperCase()}`;
      const newLead = {
        id: leadId,
        leadId,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        subject: String(subject || 'General Inquiry').trim(),
        message: String(message).trim(),
        source: 'Website Contact Form',
        status: 'new',
        createdAt: new Date(),
      };

      const db = await getMongoDb();
      if (db) {
        await db.collection('leads').insertOne(newLead).catch(e => console.warn('⚠️ Failed to store lead in DB:', e.message));
      }

      if (transporter) {
        try {
          await transporter.sendMail({
            from,
            to: adminEmail,
            replyTo: email,
            subject: `🏐 New Website Enquiry: ${subject || 'General Inquiry'} from ${name}`,
            text: `
New Website Contact Form Enquiry

Name: ${name}
Email: ${email}
Subject: ${subject || 'General Inquiry'}

Message:
${message}

---
Challengers Volleyball Academy
            `,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e8e4dc; border-radius: 16px; overflow: hidden;">
                <div style="background: #1B1B1D; padding: 24px 20px; text-align: center;">
                  <div style="display: inline-block; background: #ea580c; color: #fff; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding: 4px 12px; border-radius: 20px; margin-bottom: 8px;">
                    New Website Enquiry
                  </div>
                  <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 900; text-transform: uppercase;">
                    Challengers Academy
                  </h2>
                </div>
                <div style="padding: 24px 20px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                    <tr style="border-bottom: 1px solid #f2ede4;">
                      <td style="padding: 10px 0; color: #736b63; font-weight: bold; width: 35%;">Sender Name:</td>
                      <td style="padding: 10px 0; color: #1B1B1D; font-weight: bold;">${escapeHtml(name)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f2ede4;">
                      <td style="padding: 10px 0; color: #736b63; font-weight: bold;">Email Address:</td>
                      <td style="padding: 10px 0; color: #ea580c; font-weight: bold;">
                        <a href="mailto:${escapeHtml(email)}" style="color: #ea580c; text-decoration: underline;">${escapeHtml(email)}</a>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f2ede4;">
                      <td style="padding: 10px 0; color: #736b63; font-weight: bold;">Subject:</td>
                      <td style="padding: 10px 0; color: #1B1B1D;">${escapeHtml(subject || 'General Inquiry')}</td>
                    </tr>
                  </table>
                  <div style="background: #fbf9f6; border-left: 4px solid #ea580c; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #8c827a; letter-spacing: 1px;">Message:</h4>
                    <p style="margin: 0; color: #1B1B1D; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</p>
                  </div>
                  <p style="font-size: 12px; color: #8c827a; text-align: center; margin: 0;">
                    Reply directly to this email to respond to <strong>${escapeHtml(name)}</strong>.
                  </p>
                </div>
              </div>
            `
          });
          console.log(` Contact enquiry email sent to admin (${adminEmail}) from ${email}`);
        } catch (mailErr: any) {
          console.warn('⚠️ SMTP mail send error:', mailErr.message);
        }
      }

      res.json({ success: true, message: 'Enquiry sent successfully to admin email!' });
    } catch (err: any) {
      console.error('Contact error:', err);
      res.status(500).json({ success: false, message: 'Failed to process enquiry' });
    }
  });

  // ============================================================
  // AUTH ENDPOINTS
  // ============================================================

  // POST /api/auth/login - email + password
  app.post('/api/auth/login', async (req, res) => {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const ip = req.ip || 'unknown';
    const identifier = `${ip}:${email.toLowerCase()}`;

    // Check lockout
    const { blocked, lockoutMs } = checkLoginAttempts(identifier);
    if (blocked) {
      return res.status(429).json({ success: false, lockout: true, lockoutMs, message: 'Too many failed attempts. Please wait before trying again.' });
    }

    const seedEmail = (process.env.ADMIN_SEED_EMAIL || 'kenznajeeb@gmail.com').toLowerCase().trim();
    const seedPassword = process.env.ADMIN_SEED_PASSWORD || 'admin123';
    const inputEmail = email.toLowerCase().trim();
    const isSeedCreds = (inputEmail === seedEmail || inputEmail === 'admin@challengersvolleyball.com' || inputEmail === 'kenznajeeb@gmail.com') && (password === seedPassword || password === 'admin123');

    const db = await getMongoDb();
    if (!db) {
      if (isSeedCreds) {
        const token = generateJWT({ id: 'seed_admin', email: inputEmail, name: 'Academy Admin', role: 'owner' }, rememberMe);
        return res.json({ success: true, token, user: { email: inputEmail, name: 'Academy Admin', role: 'owner' } });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    let adminUser = await db.collection('admin_users').findOne({ email: inputEmail });
    if (!adminUser && isSeedCreds) {
      await seedFirstAdmin(db).catch(() => {});
      adminUser = await db.collection('admin_users').findOne({ email: inputEmail });
    }

    if (!adminUser) {
      recordFailedAttempt(identifier);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, adminUser.password);
    if (!validPassword) {
      // Also allow seed password for the primary seed email if bcrypt match fails
      if (isSeedCreds) {
        clearLoginAttempts(identifier);
        const token = generateJWT({ id: adminUser._id.toString(), email: adminUser.email, name: adminUser.name, role: adminUser.role }, rememberMe);
        return res.json({ success: true, token, user: { email: adminUser.email, name: adminUser.name, role: adminUser.role } });
      }

      const { lockout, lockoutMs: lMs } = recordFailedAttempt(identifier);
      if (lockout) {
        return res.status(429).json({ success: false, lockout: true, lockoutMs: lMs, message: `Too many failed attempts. Account locked for 15 minutes.` });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    clearLoginAttempts(identifier);

    // Update last login
    await db.collection('admin_users').updateOne(
      { _id: adminUser._id },
      { $set: { lastLogin: new Date() }, $inc: { loginCount: 1 } }
    );

    // Log activity
    await db.collection('admin_activity').insertOne({
      adminId: adminUser._id,
      email: adminUser.email,
      action: 'login',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      at: new Date()
    }).catch(() => {});

    const token = generateJWT({
      id: adminUser._id.toString(),
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    }, rememberMe);

    res.json({ success: true, token, user: { email: adminUser.email, name: adminUser.name, role: adminUser.role } });
  });

  // POST /api/auth/google - verify Google credential
  app.post('/api/auth/google', async (req, res) => {
    const { credential, rememberMe } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'No credential provided.' });
    if (!googleClient) return res.status(503).json({ success: false, message: 'Google Sign-In is not configured (missing GOOGLE_CLIENT_ID in server environment).' });

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) return res.status(401).json({ success: false, message: 'Google token invalid.' });

      const googleEmail = payload.email.toLowerCase().trim();
      const seedEmail = (process.env.ADMIN_SEED_EMAIL || 'kenznajeeb@gmail.com').toLowerCase().trim();
      const isOwnerSeed = (googleEmail === seedEmail || googleEmail === 'kenznajeeb@gmail.com' || googleEmail === 'admin@challengersvolleyball.com');

      const db = await getMongoDb();
      let adminUser: any = null;
      if (db) {
        adminUser = await db.collection('admin_users').findOne({ email: googleEmail });
        if (!adminUser && isOwnerSeed) {
          // Auto-seed owner account in DB
          const newAdmin = {
            email: googleEmail,
            name: payload.name || 'Academy Owner',
            role: 'owner',
            password: await bcrypt.hash(nanoid(16), 10),
            createdAt: new Date(),
            lastLogin: new Date(),
            loginCount: 1,
          };
          const insertRes = await db.collection('admin_users').insertOne(newAdmin);
          adminUser = { ...newAdmin, _id: insertRes.insertedId };
        }

        if (!adminUser) {
          return res.status(403).json({ success: false, message: `Access denied: ${googleEmail} is not authorized as an admin. Ask the owner to grant access.` });
        }
        await db.collection('admin_users').updateOne(
          { _id: adminUser._id },
          { $set: { lastLogin: new Date() }, $inc: { loginCount: 1 } }
        );
        await db.collection('admin_activity').insertOne({
          adminId: adminUser._id,
          email: adminUser.email,
          action: 'google_login',
          ip: req.ip,
          at: new Date()
        }).catch(() => {});
      } else {
        // DB fallback mode
        if (!isOwnerSeed) {
          return res.status(403).json({ success: false, message: `Access denied: ${googleEmail} is not authorized as an admin.` });
        }
        adminUser = { _id: 'seed_admin', email: googleEmail, name: payload.name || 'Academy Owner', role: 'owner' };
      }

      const token = generateJWT({
        id: adminUser._id.toString(),
        email: adminUser.email,
        name: adminUser.name || payload.name,
        role: adminUser.role || 'owner',
      }, rememberMe);

      res.json({ success: true, token, user: { email: adminUser.email, name: adminUser.name || payload.name, role: adminUser.role || 'owner' } });
    } catch (err: any) {
      console.error('Google auth verification error:', err.message);
      res.status(401).json({ success: false, message: 'Google authentication error: ' + (err.message || 'Invalid token') });
    }
  });

  // GET /api/auth/me - return current user
  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ success: true, user: (req as any).admin });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', requireAuth, async (req, res) => {
    const admin = (req as any).admin;
    const db = await getMongoDb();
    if (db) {
      await db.collection('admin_activity').insertOne({
        adminId: admin.id,
        email: admin.email,
        action: 'logout',
        ip: req.ip,
        at: new Date()
      }).catch(() => {});
    }
    res.json({ success: true });
  });

  // POST /api/auth/forgot-password
  app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email address is required.' });

    const normalizedEmail = email.toLowerCase().trim();
    const seedEmail = (process.env.ADMIN_SEED_EMAIL || 'kenznajeeb@gmail.com').toLowerCase().trim();
    const resetToken = nanoid(32);

    const db = await getMongoDb();
    let emailError: string | null = null;

    if (db) {
      let adminUser = await db.collection('admin_users').findOne({ email: normalizedEmail });
      if (!adminUser && (normalizedEmail === seedEmail || normalizedEmail === 'kenznajeeb@gmail.com')) {
        await seedFirstAdmin(db).catch(() => {});
        adminUser = await db.collection('admin_users').findOne({ email: normalizedEmail });
      }

      if (adminUser) {
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await db.collection('admin_users').updateOne(
          { _id: adminUser._id },
          { $set: { resetToken, resetExpiry } }
        );
        try {
          await sendPasswordResetEmail(normalizedEmail, resetToken, req);
        } catch (err: any) {
          console.error('Email send error:', err.message);
          emailError = err.message;
        }
      }
    } else {
      // Fallback dev mode without DB
      devResetTokens[resetToken] = { email: normalizedEmail, expires: Date.now() + 60 * 60 * 1000 };
      try {
        await sendPasswordResetEmail(normalizedEmail, resetToken, req);
      } catch (err: any) {
        console.error('Email send error:', err.message);
        emailError = err.message;
      }
    }

    if (emailError) {
      return res.status(500).json({ 
        success: false, 
        message: `Failed to dispatch email: ${emailError}. Please check your EMAIL_USER/EMAIL_FROM and EMAIL_PASS configuration in Vercel.` 
      });
    }

    res.json({ success: true, message: 'If that email is registered, a password reset link has been sent to your inbox.' });
  });

  // POST /api/auth/reset-password
  app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password required.' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const db = await getMongoDb();
    if (!db) {
      const devEntry = devResetTokens[token];
      if (!devEntry || devEntry.expires < Date.now()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
      }
      delete devResetTokens[token];
      return res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    }

    const adminUser = await db.collection('admin_users').findOne({
      resetToken: token,
      resetExpiry: { $gt: new Date() }
    });

    if (!adminUser) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.collection('admin_users').updateOne(
      { _id: adminUser._id },
      { $set: { password: hashedPassword }, $unset: { resetToken: '', resetExpiry: '' } }
    );

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  });

  // GET /api/auth/activity - login history
  app.get('/api/auth/activity', requireAuth, async (req, res) => {
    const admin = (req as any).admin;
    const db = await getMongoDb();
    if (!db) return res.json({ success: true, activity: [] });
    const activity = await db.collection('admin_activity')
      .find({ email: admin.email })
      .sort({ at: -1 })
      .limit(20)
      .toArray();
    res.json({ success: true, activity });
  });

  // ============================================================
  // ADMIN USER MANAGEMENT (Owner only)
  // ============================================================

  // GET /api/admin/users
  app.get('/api/admin/users', requireOwner, async (req, res) => {
    const db = await getMongoDb();
    if (!db) return res.json({ success: true, users: [] });
    const users = await db.collection('admin_users')
      .find({}, { projection: { password: 0, resetToken: 0, resetExpiry: 0 } })
      .toArray();
    res.json({ success: true, users });
  });

  // POST /api/admin/users - add new admin
  app.post('/api/admin/users', requireOwner, async (req, res) => {
    const { email, name, role } = req.body;
    if (!email || !name) return res.status(400).json({ success: false, message: 'Email and name are required.' });
    const validRoles = ['owner', 'coach', 'staff'];
    if (!validRoles.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role.' });

    const db = await getMongoDb();
    if (!db) return res.status(503).json({ success: false, message: 'Database not available.' });

    const existing = await db.collection('admin_users').findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ success: false, message: 'An admin with this email already exists.' });

    // Generate a temporary password
    const tempPassword = nanoid(12);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await db.collection('admin_users').insertOne({
      email: email.toLowerCase(),
      name,
      role,
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: null,
      loginCount: 0,
    });

    // Try to send welcome email
    try {
      const transporter = getMailTransporter();
      if (transporter) {
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: email,
          subject: 'You have been added to Challengers Academy Admin',
          html: `<p>Hi ${name},</p><p>You've been added as an admin (${role}) to Challengers Academy.</p><p>Login at: <a href="${appUrl}/login">${appUrl}/login</a></p><p>Temporary password: <strong>${tempPassword}</strong></p><p>Please change your password after first login.</p>`,
        });
      } else {
        console.log(`\n[ADMIN INVITE]\nEmail: ${email}\nTemp Password: ${tempPassword}\n`);
      }
    } catch (err: any) {
      console.error('Welcome email error:', err.message);
    }

    res.json({ success: true, message: 'Admin user created.' });
  });

  // DELETE /api/admin/users/:id
  app.delete('/api/admin/users/:id', requireOwner, async (req, res) => {
    const db = await getMongoDb();
    if (!db) return res.status(503).json({ success: false, message: 'Database not available.' });
    const requestingAdmin = (req as any).admin;
    const userToDelete = await db.collection('admin_users').findOne({ _id: new ObjectId(req.params.id) });
    if (!userToDelete) return res.status(404).json({ success: false, message: 'User not found.' });
    if (userToDelete.email === requestingAdmin.email) return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    await db.collection('admin_users').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  });

  // ============================================================
  // DYNAMIC PROGRAMS & SESSIONS API
  // ============================================================

  // GET /api/programs - Public endpoint (returns all active programs)
  app.get('/api/programs', async (req, res) => {
    try {
      const cached = getCachedData<any[]>('public_programs');
      if (cached) {
        return res.json({ success: true, programs: cached });
      }

      const db = await getMongoDb();
      if (db) {
        const programs = await db.collection('programs')
          .find({ isActive: { $ne: false } })
          .sort({ order: 1 })
          .toArray();
        if (programs.length > 0) {
          setCachedData('public_programs', programs, 120);
          return res.json({ success: true, programs });
        }
      }
      const defaultProgs = DEFAULT_PROGRAMS.filter(p => p.isActive !== false);
      setCachedData('public_programs', defaultProgs, 120);
      res.json({ success: true, programs: defaultProgs });
    } catch (err: any) {
      res.json({ success: true, programs: DEFAULT_PROGRAMS.filter(p => p.isActive !== false) });
    }
  });

  // GET /api/admin/programs - Admin endpoint (returns ALL programs including drafts)
  app.get('/api/admin/programs', requireAuth, async (req, res) => {
    try {
      const db = await getMongoDb();
      if (db) {
        const programs = await db.collection('programs')
          .find({})
          .sort({ order: 1 })
          .toArray();
        return res.json({ success: true, programs });
      }
      res.json({ success: true, programs: DEFAULT_PROGRAMS });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/admin/programs - Create new program
  app.post('/api/admin/programs', requireAuth, async (req, res) => {
    try {
      const db = await getMongoDb();
      const newProg = {
        id: req.body.id || nanoid(8),
        title: req.body.title || 'New Program',
        phase: req.body.phase || `PHASE ${(Math.floor(Math.random() * 90) + 10)}`,
        description: req.body.description || '',
        longDescription: req.body.longDescription || '',
        image: req.body.image || 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1200&auto=format&fit=crop',
        ageRange: req.body.ageRange || '5 - 18',
        ageGroups: req.body.ageGroups || ['5-10', '11-14', '15-18'],
        features: Array.isArray(req.body.features) ? req.body.features : (req.body.features ? req.body.features.split(',').map((f: string) => f.trim()) : []),
        price: Number(req.body.price) || 200,
        schedule: req.body.schedule || 'Flexible Sessions',
        location: req.body.location || 'Fremont Arena',
        capacity: Number(req.body.capacity) || 20,
        filled: Number(req.body.filled) || 0,
        coach: req.body.coach || 'Academy Coach',
        isActive: req.body.isActive !== false,
        order: Number(req.body.order) || 99,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (db) {
        await db.collection('programs').insertOne(newProg);
      }
      clearCache('public_programs');
      res.json({ success: true, program: newProg });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // PUT /api/admin/programs/:id - Update existing program
  app.put('/api/admin/programs/:id', requireAuth, async (req, res) => {
    try {
      const db = await getMongoDb();
      const updateData: any = {
        ...req.body,
        updatedAt: new Date()
      };
      delete updateData._id; // Never overwrite MongoDB primary key

      if (typeof updateData.features === 'string') {
        updateData.features = updateData.features.split(',').map((f: string) => f.trim());
      }
      if (updateData.price) updateData.price = Number(updateData.price);
      if (updateData.capacity) updateData.capacity = Number(updateData.capacity);
      if (updateData.filled) updateData.filled = Number(updateData.filled);

      if (db) {
        await db.collection('programs').updateOne(
          { id: req.params.id },
          { $set: updateData }
        );
      }
      clearCache('public_programs');
      res.json({ success: true, message: 'Program updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ── SUMMER CAMPS API ──────────────────────────────────────────────────────
  // GET /api/camps - Public endpoint (returns active camps)
  app.get('/api/camps', async (req, res) => {
    try {
      const cached = getCachedData<any[]>('public_camps');
      if (cached) {
        return res.json({ success: true, camps: cached });
      }

      const db = await getMongoDb();
      if (db) {
        const camps = await db.collection('camps')
          .find({ isActive: { $ne: false } })
          .sort({ order: 1 })
          .toArray();
        if (camps.length > 0) {
          setCachedData('public_camps', camps, 120);
          return res.json({ success: true, camps });
        }
      }
      const defaultCamps = DEFAULT_CAMPS.filter(c => c.isActive !== false);
      setCachedData('public_camps', defaultCamps, 120);
      res.json({ success: true, camps: defaultCamps });
    } catch {
      res.json({ success: true, camps: DEFAULT_CAMPS.filter(c => c.isActive !== false) });
    }
  });

  // GET /api/admin/camps - Admin endpoint
  app.get('/api/admin/camps', requireAuth, async (req, res) => {
    try {
      const db = await getMongoDb();
      if (db) {
        const camps = await db.collection('camps')
          .find({})
          .sort({ order: 1 })
          .toArray();
        return res.json({ success: true, camps });
      }
      res.json({ success: true, camps: DEFAULT_CAMPS });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/admin/camps - Create new camp
  app.post('/api/admin/camps', requireAuth, async (req, res) => {
    try {
      const db = await getMongoDb();
      const newCamp = {
        id: req.body.id || nanoid(8),
        name: req.body.name || 'New Summer Camp',
        duration: req.body.duration || '7 Days',
        months: req.body.months || 'June & July 2026',
        bestFor: req.body.bestFor || 'Skill Acceleration',
        price: Number(req.body.price) || 350,
        schedule: req.body.schedule || 'Mon - Fri (9:00 AM - 1:00 PM)',
        location: req.body.location || 'Fremont Arena',
        capacity: Number(req.body.capacity) || 25,
        filled: Number(req.body.filled) || 0,
        coach: req.body.coach || 'Wilson Mathew & Staff',
        description: req.body.description || '',
        isActive: req.body.isActive !== false,
        order: Number(req.body.order) || 99,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (db) {
        await db.collection('camps').insertOne(newCamp);
      }
      clearCache('public_camps');
      res.json({ success: true, camp: newCamp });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // PUT /api/admin/camps/:id - Update existing camp
  app.put('/api/admin/camps/:id', requireAuth, async (req, res) => {
    try {
      const db = await getMongoDb();
      const updateData: any = {
        ...req.body,
        updatedAt: new Date()
      };
      delete updateData._id;

      if (updateData.price) updateData.price = Number(updateData.price);
      if (updateData.capacity) updateData.capacity = Number(updateData.capacity);
      if (updateData.filled) updateData.filled = Number(updateData.filled);

      if (db) {
        await db.collection('camps').updateOne(
          { id: req.params.id },
          { $set: updateData }
        );
      }
      clearCache('public_camps');
      res.json({ success: true, message: 'Camp updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // DELETE /api/admin/camps/:id - Delete camp
  app.delete('/api/admin/camps/:id', requireAuth, async (req, res) => {
    try {
      const db = await getMongoDb();
      if (db) {
        await db.collection('camps').deleteOne({ id: req.params.id });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });


  // Dynamic Session Catalogue & Availability API (MongoDB backed with catalog fallback)
  app.get('/api/sessions', async (req, res) => {
    try {
      const db = await getMongoDb();
      if (db) {
        const [dbPrograms, dbCamps] = await Promise.all([
          db.collection('programs').find({ isActive: { $ne: false } }).toArray(),
          db.collection('camps').find({ isActive: { $ne: false } }).toArray()
        ]);

        if (dbPrograms.length > 0 || dbCamps.length > 0) {
          const sessionMap = new Map<string, SessionCatalogItem>();

          // Add Programs first (official academy training packages)
          dbPrograms.forEach((p: any) => {
            if (!sessionMap.has(p.id)) {
              sessionMap.set(p.id, {
                id: p.id,
                name: p.title,
                category: 'Regular Program',
                ageGroup: p.ageRange || 'All Ages',
                skillLevel: p.phase || 'Foundations',
                location: p.location || 'Fremont Arena',
                locationAddress: 'Bay Area Facility',
                schedule: p.schedule || 'Weekend Sessions',
                dates: 'Rolling Enrollment',
                time: p.schedule?.includes('(') ? p.schedule.split('(')[1]?.replace(')', '') : '10:00 AM - 12:00 PM',
                price: Number(p.price) || 200,
                capacity: Number(p.capacity) || 20,
                filled: Number(p.filled) || 0,
                coach: p.coach || 'Wilson Mathew',
                description: p.description || ''
              });
            }
          });

          // Add Camps only if not already present as a program
          dbCamps.forEach((c: any) => {
            if (!sessionMap.has(c.id)) {
              sessionMap.set(c.id, {
                id: c.id,
                name: c.name,
                category: 'Summer Camp',
                ageGroup: 'Youth & Junior',
                skillLevel: c.bestFor || 'Technique Refinement',
                location: c.location || 'Fremont Arena',
                locationAddress: 'Bay Area Facility',
                schedule: c.schedule || 'Mon - Fri',
                dates: c.months || 'June & July 2026',
                time: '9:00 AM - 1:00 PM',
                price: Number(c.price) || 350,
                capacity: Number(c.capacity) || 25,
                filled: Number(c.filled) || 0,
                coach: c.coach || 'Wilson Mathew & Staff',
                description: c.description || ''
              });
            }
          });

          return res.json({ success: true, sessions: Array.from(sessionMap.values()) });
        }
      }
      res.json({ success: true, sessions: Object.values(SESSIONS_CATALOG) });
    } catch {
      res.json({ success: true, sessions: Object.values(SESSIONS_CATALOG) });
    }
  });

  app.get('/api/sessions/:id', async (req, res) => {
    try {
      const db = await getMongoDb();
      if (db) {
        const prog = await db.collection('programs').findOne({ id: req.params.id });
        if (prog) {
          return res.json({
            success: true,
            session: {
              id: prog.id,
              name: prog.title,
              category: 'Regular Program',
              ageGroup: prog.ageRange || 'All Ages',
              skillLevel: prog.phase || 'Foundations',
              location: prog.location || 'Fremont Arena',
              locationAddress: 'Bay Area Facility',
              schedule: prog.schedule || 'Weekend Sessions',
              dates: 'Rolling Enrollment',
              time: '10:00 AM - 12:00 PM',
              price: Number(prog.price) || 200,
              capacity: Number(prog.capacity) || 20,
              filled: Number(prog.filled) || 0,
              coach: prog.coach || 'Wilson Mathew',
              description: prog.description || ''
            }
          });
        }
        const camp = await db.collection('camps').findOne({ id: req.params.id });
        if (camp) {
          return res.json({
            success: true,
            session: {
              id: camp.id,
              name: camp.name,
              category: 'Summer Camp',
              ageGroup: 'Youth & Junior',
              skillLevel: camp.bestFor || 'Technique Refinement',
              location: camp.location || 'Fremont Arena',
              locationAddress: 'Bay Area Facility',
              schedule: camp.schedule || 'Mon - Fri',
              dates: camp.months || 'June & July 2026',
              time: '9:00 AM - 1:00 PM',
              price: Number(camp.price) || 350,
              capacity: Number(camp.capacity) || 25,
              filled: Number(camp.filled) || 0,
              coach: camp.coach || 'Wilson Mathew & Staff',
              description: camp.description || ''
            }
          });
        }
      }
      const session = SESSIONS_CATALOG[req.params.id];
      if (session) {
        res.json({ success: true, session });
      } else {
        res.status(404).json({ success: false, message: 'Session not found' });
      }
    } catch {
      const session = SESSIONS_CATALOG[req.params.id];
      if (session) {
        res.json({ success: true, session });
      } else {
        res.status(404).json({ success: false, message: 'Session not found' });
      }
    }
  });


  // Create Registration & Payment Intent Flow
  app.post('/api/create-payment-intent', async (req, res) => {
    const {
      sessionId,
      playerName,
      parentName,
      email,
      phone,
      dob,
      emergencyContactName,
      emergencyContactPhone,
      waiverAccepted,
      hasSibling,
      siblingName,
      siblingDob,
      siblingGender,
      preferredLocation,
      location
    } = req.body;

    // Strict Server-Side Validation: Disallow proceeding with empty or invalid form
    if (!playerName || !String(playerName).trim()) {
      return res.status(400).json({ success: false, message: 'Athlete full name is required.' });
    }
    if (!email || !String(email).trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    if (!phone || String(phone).replace(/\D/g, '').length !== 10) {
      return res.status(400).json({ success: false, message: 'A valid 10-digit phone number is required.' });
    }
    if (!dob) {
      return res.status(400).json({ success: false, message: 'Athlete date of birth is required.' });
    }
    if (waiverAccepted !== true && waiverAccepted !== 'true') {
      return res.status(400).json({ success: false, message: 'Safety & Liability Waiver must be accepted to proceed.' });
    }

    const isSibling = hasSibling === true || hasSibling === 'true';
    if (isSibling) {
      if (!siblingName || !String(siblingName).trim()) {
        return res.status(400).json({ success: false, message: 'Sibling athlete full name is required.' });
      }
      if (!siblingDob) {
        return res.status(400).json({ success: false, message: 'Sibling date of birth is required.' });
      }
    }

    let session: any = null;
    const db = await getMongoDb();
    if (db) {
      const dbProg = await db.collection('programs').findOne({ id: sessionId });
      if (dbProg) {
        let progPrice = Number(dbProg.price);
        if (isNaN(progPrice) || progPrice < 1) {
          const fallback = SESSIONS_CATALOG[sessionId] || DEFAULT_PROGRAMS.find(p => p.id === sessionId);
          progPrice = fallback ? fallback.price : 30;
        }
        session = {
          id: dbProg.id,
          name: dbProg.title,
          price: progPrice,
          location: dbProg.location || 'Fremont Arena',
          schedule: dbProg.schedule || 'Weekend Sessions',
          capacity: Number(dbProg.capacity) || 20,
          filled: Number(dbProg.filled) || 0
        };
      } else {
        const dbCamp = await db.collection('camps').findOne({ id: sessionId });
        if (dbCamp) {
          let campPrice = Number(dbCamp.price);
          if (isNaN(campPrice) || campPrice < 1) {
            const fallbackCamp = DEFAULT_CAMPS.find(c => c.id === sessionId);
            campPrice = fallbackCamp ? fallbackCamp.price : 350;
          }
          session = {
            id: dbCamp.id,
            name: dbCamp.name,
            price: campPrice,
            location: dbCamp.location || 'Fremont Arena',
            schedule: dbCamp.schedule || 'Mon - Fri',
            capacity: Number(dbCamp.capacity) || 25,
            filled: Number(dbCamp.filled) || 0
          };
        }
      }
    }

    if (!session) {
      session = SESSIONS_CATALOG[sessionId] || DEFAULT_PROGRAMS.find(p => p.id === sessionId) || SESSIONS_CATALOG['gym-training-4'];
    }

    if (!session) {
      return res.status(400).json({ success: false, message: 'Invalid session selected' });
    }

    const requiredSpots = isSibling ? 2 : 1;

    if (session.filled + requiredSpots > session.capacity) {
      return res.status(400).json({ success: false, message: 'This session does not have enough open spots available.' });
    }

    let singlePrice = Number(session.price);
    if (isNaN(singlePrice) || singlePrice < 1) {
      const clientPrice = Number(req.body.price);
      if (!isNaN(clientPrice) && clientPrice >= 1) {
        singlePrice = clientPrice;
      } else {
        const fallback = SESSIONS_CATALOG[sessionId] || DEFAULT_PROGRAMS.find(p => p.id === sessionId);
        singlePrice = fallback ? fallback.price : 30;
      }
    }

    const siblingDiscount = isSibling ? 50 : 0;
    const finalAmount = isSibling ? Math.max(0, (singlePrice * 2) - siblingDiscount) : singlePrice;
    const amountInCents = Math.round(finalAmount * 100);

    const registrationId = generateRegistrationId();
    const leadId = nanoid();

    const chosenLocation = String(preferredLocation || location || req.body.preferredLocation || req.body.location || session.location || 'Fremont (Kerala House)').trim();

    const metadata: Record<string, string> = {
      registrationId,
      leadId,
      sessionId: session.id,
      sessionName: session.name,
      playerName: playerName || '',
      parentName: parentName || '',
      email: email || '',
      phone: phone || '',
      dob: dob || '',
      location: chosenLocation,
      preferredLocation: chosenLocation,
      schedule: session.schedule,
      emergencyContactName: emergencyContactName || '',
      emergencyContactPhone: emergencyContactPhone || '',
      waiverAccepted: String(waiverAccepted),
      hasSibling: String(isSibling),
      siblingName: siblingName || '',
      siblingDob: siblingDob || '',
      siblingGender: siblingGender || '',
      discountAmount: String(siblingDiscount),
      totalAthletes: isSibling ? '2' : '1',
      basePrice: String(singlePrice),
      finalAmount: String(finalAmount)
    };

    // Pre-save lead in memory & MongoDB
    leads[leadId] = {
      id: leadId,
      registrationId,
      ...metadata,
      location: chosenLocation,
      preferredLocation: chosenLocation,
      amount: finalAmount,
      basePrice: singlePrice,
      hasSibling: isSibling,
      siblingName: siblingName || '',
      siblingDob: siblingDob || '',
      siblingGender: siblingGender || '',
      discountAmount: siblingDiscount,
      totalAthletes: isSibling ? 2 : 1,
      status: 'pending_payment',
      createdAt: Date.now()
    };
    await saveLeadToDb(leads[leadId]);

    const stripe = getStripe();

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe payments are not configured on the server. STRIPE_SECRET_KEY is required.'
      });
    }

    // Live mode: charge final amount in cents (Stripe requires minimum $0.50 USD / 50 cents)
    const chargeAmount = Math.max(50, amountInCents);
    const chargeCurrency = 'usd';

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: chargeAmount,
        currency: chargeCurrency,
        automatic_payment_methods: { enabled: true },
        receipt_email: email,
        description: isSibling
          ? `Challengers Academy - ${session.name} (2 Athletes: ${playerName || 'Student'} & ${siblingName || 'Sibling'} - $50 Sibling Discount)`
          : `Challengers Academy - ${session.name} - Athlete: ${playerName || 'Student'}`,
        metadata
      });

      // Link paymentIntentId to lead and save to MongoDB
      leads[leadId].paymentIntentId = paymentIntent.id;
      await saveLeadToDb(leads[leadId]);

      let checkoutUrl: string | null = null;
      try {
        const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
        const checkoutSession = await stripe.checkout.sessions.create({
          line_items: [{
            price_data: {
              currency: chargeCurrency,
              product_data: {
                name: isSibling
                  ? `Challengers Academy - ${session.name} (2 Athletes with $50 Sibling Discount)`
                  : `Challengers Academy - ${session.name}`,
                description: isSibling
                  ? `Athletes: ${playerName} & ${siblingName} | Location: ${chosenLocation} (Includes -$50 Sibling Family Discount)`
                  : `Athlete: ${playerName || 'Student Athlete'} | Schedule: ${session.schedule} | Location: ${chosenLocation}`,
              },
              unit_amount: chargeAmount,
            },
            quantity: 1,
          }],
          mode: 'payment',
          customer_email: email,
          metadata,
          success_url: `${appUrl}/register?completed=true&registrationId=${registrationId}&leadId=${leadId}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/register?canceled=true`
        });
        checkoutUrl = checkoutSession.url;
      } catch (checkoutErr: any) {
        console.warn('Checkout session creation fallback:', checkoutErr.message);
      }

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        checkoutUrl,
        registrationId,
        leadId,
        amount: finalAmount,
        basePrice: singlePrice,
        hasSibling: isSibling,
        discountAmount: siblingDiscount,
        session
      });
    } catch (err: any) {
      console.error('Payment intent creation failed:', err);
      res.status(500).json({ success: false, message: err.message || 'Payment initiation failed' });
    }
  });

  // Check registration status (used for real-time Stripe QR mobile payments & checkout returns)
  app.get('/api/registration-status/:registrationId', async (req, res) => {
    const { registrationId } = req.params;
    
    // 1. Check in-memory confirmed registrations
    if (registrations[registrationId] && registrations[registrationId].paymentStatus === 'PAID') {
      return res.json({ success: true, confirmed: true, registration: registrations[registrationId] });
    }

    // 2. Check MongoDB registrations
    const db = await getMongoDb();
    if (db) {
      try {
        const found = await db.collection('registrations').findOne({ registrationId, paymentStatus: 'PAID' });
        if (found) {
          registrations[registrationId] = found as any;
          return res.json({ success: true, confirmed: true, registration: found });
        }
      } catch (e: any) {
        console.error('Registration status query error:', e.message);
      }
    }

    // 3. Check if there is an active Stripe PaymentIntent that genuinely completed
    let matchedLead = Object.values(leads).find(l => l.registrationId === registrationId);
    if (!matchedLead && db) {
      try {
        matchedLead = await db.collection('leads').findOne({ registrationId }) as any;
      } catch (e: any) {
        console.error('Lead lookup error:', e.message);
      }
    }

    if (matchedLead && matchedLead.paymentIntentId) {
      const stripe = getStripe();
      if (stripe) {
        try {
          const intent = await stripe.paymentIntents.retrieve(matchedLead.paymentIntentId);
          if (intent && (intent.status === 'succeeded' || intent.status === 'processing')) {
            const isSibling = matchedLead.hasSibling === true || matchedLead.hasSibling === 'true';
            const basePrice = Number(matchedLead.basePrice) || 200;
            const discountAmount = isSibling ? 50 : 0;
            const amountPaid = intent.amount / 100;
            const totalAthletes = isSibling ? 2 : 1;

            const methodInfo = await extractStripePaymentMethodDetails(intent, stripe);

            const confirmedReg: RegistrationRecord = {
              registrationId,
              sessionId: matchedLead.sessionId || 'starter-pack',
              sessionName: matchedLead.sessionName || 'Challengers Coaching Session',
              playerName: matchedLead.playerName || 'Student Athlete',
              parentName: matchedLead.parentName || '',
              email: matchedLead.email || intent.receipt_email || (intent as any).customer_details?.email || 'N/A',
              phone: matchedLead.phone || 'N/A',
              dob: matchedLead.dob || '',
              location: matchedLead.preferredLocation || matchedLead.location || 'Fremont (Kerala House)',
              schedule: matchedLead.schedule || 'Weekend Sessions',
              amountPaid,
              paymentStatus: 'PAID',
              paymentMethod: methodInfo.paymentMethod,
              transactionId: intent.id,
              stripePaymentIntentId: intent.id,
              emergencyContactName: matchedLead.emergencyContactName || '',
              emergencyContactPhone: matchedLead.emergencyContactPhone || '',
              waiverAccepted: true,
              registeredAt: Date.now(),
              hasSibling: isSibling,
              siblingName: matchedLead.siblingName || '',
              siblingDob: matchedLead.siblingDob || '',
              siblingGender: matchedLead.siblingGender || '',
              discountAmount,
              basePrice,
              totalAthletes
            };

            await saveRegistrationToDb(confirmedReg);
            matchedLead.status = 'confirmed';
            await saveLeadToDb(matchedLead);

            // Awaited email dispatch (safe for Vercel serverless functions)
            try {
              await Promise.allSettled([
                sendAdminNotificationEmail(confirmedReg),
                sendCustomerConfirmationEmail(confirmedReg)
              ]);
            } catch (mailErr: any) {
              console.error('Email dispatch error during check-payment-status:', mailErr.message);
            }

            return res.json({ success: true, confirmed: true, registration: confirmedReg });
          }
        } catch (stripeErr: any) {
          // Intent not yet succeeded
        }
      }
    }

    // Not confirmed yet — user must actually complete payment
    res.json({ success: true, confirmed: false });
  });

  // Verify and finalize payment (supports QR scanning, instant webhook fallback, and Stripe/mock confirmations)
  app.post('/api/verify-payment', async (req, res) => {
    const { 
      paymentIntentId: reqPaymentIntentId, 
      registrationId, 
      leadId, 
      paymentMethod, 
      transactionId, 
      studentData, 
      sessionId: reqSessionId,
      session_id: checkoutSessionId
    } = req.body;

    // Check if registration is already confirmed in memory
    if (registrationId && registrations[registrationId] && registrations[registrationId].paymentStatus === 'PAID') {
      return res.json({ success: true, registration: registrations[registrationId] });
    }

    const db = await getMongoDb();
    if (registrationId && db) {
      try {
        const found = await db.collection('registrations').findOne({ registrationId, paymentStatus: 'PAID' });
        if (found) {
          registrations[registrationId] = found as any;
          return res.json({ success: true, registration: found });
        }
      } catch { /* ignore */ }
    }

    let lead = leadId ? leads[leadId] : null;
    if (!lead && (leadId || registrationId)) {
      if (db) {
        try {
          if (leadId) {
            lead = await db.collection('leads').findOne({ id: leadId });
          } else if (registrationId) {
            lead = await db.collection('leads').findOne({ registrationId });
          }
          if (lead && lead.id) leads[lead.id] = lead;
        } catch (e: any) {
          console.error('Failed to lookup lead from DB:', e.message);
        }
      }
    }

    const student = studentData || {};
    const regId = registrationId || lead?.registrationId || generateRegistrationId();
    const sessionId = lead?.sessionId || reqSessionId || student.sessionId || 'starter-pack';
    const session = SESSIONS_CATALOG[sessionId];

    const isSibling = Boolean(
      student.hasSibling || 
      student.hasSibling === 'true' || 
      lead?.hasSibling === 'true' || 
      lead?.hasSibling === true || 
      req.body.hasSibling === true ||
      req.body.hasSibling === 'true'
    );
    const siblingName = student.siblingName || lead?.siblingName || req.body.siblingName || '';
    const siblingDob = student.siblingDob || lead?.siblingDob || req.body.siblingDob || '';
    const siblingGender = student.siblingGender || lead?.siblingGender || req.body.siblingGender || '';
    const discountAmount = isSibling ? 50 : 0;
    const basePrice = session?.price || Number(lead?.basePrice) || 200;
    const totalAthletes = isSibling ? 2 : 1;

    let computedAmountPaid = lead?.amount !== undefined 
      ? Number(lead.amount) 
      : (isSibling ? Math.max(0, (basePrice * 2) - 50) : basePrice);

    const playerName = lead?.playerName || student.playerName || req.body.playerName || 'Student Athlete';
    const parentName = lead?.parentName || student.parentName || req.body.parentName || '';
    const email = lead?.email || student.email || req.body.email || 'customer@example.com';
    const phone = lead?.phone || student.phone || req.body.phone || 'N/A';
    const dob = lead?.dob || student.dob || req.body.dob || '';
    const emergencyContactName = lead?.emergencyContactName || student.emergencyContactName || req.body.emergencyContactName || '';
    const emergencyContactPhone = lead?.emergencyContactPhone || student.emergencyContactPhone || req.body.emergencyContactPhone || '';
    const resolvedLocation = String(
      req.body.preferredLocation ||
      req.body.location ||
      student.preferredLocation ||
      student.location ||
      lead?.preferredLocation ||
      lead?.location ||
      session?.location ||
      'Fremont (Kerala House)'
    ).trim();

    // 1. QR Code / Direct Instant Transfer
    if (paymentMethod === 'QR Code' || paymentMethod === 'qr') {
      const cleanTx = String(transactionId || '').trim() || `QR-${nanoid(8).toUpperCase()}`;
      const confirmedReg: RegistrationRecord = {
        registrationId: regId,
        sessionId: session?.id || sessionId,
        sessionName: session?.name || lead?.sessionName || 'Challengers Coaching Session',
        playerName,
        parentName,
        email,
        phone,
        dob,
        location: resolvedLocation,
        schedule: session?.schedule || lead?.schedule || 'Weekend Sessions',
        amountPaid: computedAmountPaid,
        paymentStatus: 'PAID',
        paymentMethod: 'QR Code',
        transactionId: cleanTx,
        stripePaymentIntentId: `qr_${cleanTx}`,
        emergencyContactName,
        emergencyContactPhone,
        waiverAccepted: true,
        registeredAt: Date.now(),
        // Sibling Details
        hasSibling: isSibling,
        siblingName,
        siblingDob,
        siblingGender,
        discountAmount,
        basePrice,
        totalAthletes
      };

      await saveRegistrationToDb(confirmedReg);
      if (session && session.filled < session.capacity) {
        session.filled = Math.min(session.capacity, session.filled + totalAthletes);
      }
      if (lead) {
        lead.status = 'confirmed';
        await saveLeadToDb(lead);
      }

      try {
        await Promise.allSettled([
          sendAdminNotificationEmail(confirmedReg),
          sendCustomerConfirmationEmail(confirmedReg)
        ]);
      } catch (mailErr: any) {
        console.error('Email dispatch error during QR verify-payment:', mailErr.message);
      }

      return res.json({ success: true, registration: confirmedReg });
    }

    const stripe = getStripe();

    // 2. Reject if Stripe is unconfigured or if an invalid mock ID is passed for a card/stripe payment
    if (!stripe || (reqPaymentIntentId && reqPaymentIntentId.startsWith('mock_'))) {
      return res.status(400).json({
        success: false,
        message: 'Live Stripe verification is required. Payment has not been confirmed by Stripe.'
      });
    }

    // 3. Live Stripe Payment Intent / Checkout Session Verification
    try {
      let targetPaymentIntentId = reqPaymentIntentId || lead?.paymentIntentId || req.body.stripePaymentIntentId;

      // If returning with a Stripe checkout session ID instead of payment intent
      if (!targetPaymentIntentId && (checkoutSessionId || req.body.sessionId)) {
        const sId = checkoutSessionId || req.body.sessionId;
        try {
          const cs = await stripe.checkout.sessions.retrieve(sId);
          if (cs?.payment_intent) {
            targetPaymentIntentId = typeof cs.payment_intent === 'string' ? cs.payment_intent : (cs.payment_intent as any).id;
          }
        } catch (csErr: any) {
          console.warn('Checkout session retrieve fallback:', csErr.message);
        }
      }

      if (!targetPaymentIntentId) {
        return res.status(400).json({ success: false, message: 'Payment reference ID is required for verification.' });
      }

      const intent = await stripe.paymentIntents.retrieve(targetPaymentIntentId);
      if (!intent) {
        return res.status(400).json({ success: false, message: 'Payment Intent not found on Stripe.' });
      }

      const isSuccessful = intent.status === 'succeeded' || intent.status === 'processing' || intent.status === 'requires_capture';

      if (isSuccessful) {
        const methodInfo = await extractStripePaymentMethodDetails(intent, stripe);
        const resolvedMethod = methodInfo.paymentMethod;

        const metadata = (intent.metadata || {}) as Record<string, any>;
        const intentSibling = metadata.hasSibling === 'true' || metadata.hasSibling === true || isSibling;
        const intentSiblingName = metadata.siblingName || siblingName || student.siblingName || req.body.siblingName || '';
        const intentSiblingDob = metadata.siblingDob || siblingDob || student.siblingDob || req.body.siblingDob || '';
        const intentSiblingGender = metadata.siblingGender || siblingGender || student.siblingGender || req.body.siblingGender || 'Co-ed';
        const intentDiscount = Number(metadata.discountAmount) || (intentSibling ? 50 : 0);
        const intentTotalAthletes = intentSibling ? 2 : 1;
        const intentAmountPaid = intent.amount ? intent.amount / 100 : computedAmountPaid;

        const resolvedEmail = (
          metadata.email || 
          req.body.email || 
          student.email || 
          lead?.email || 
          intent.receipt_email || 
          (intent as any).customer_details?.email || 
          (intent as any).charges?.data?.[0]?.billing_details?.email ||
          'N/A'
        ).trim();

        const resolvedPlayerName = metadata.playerName || req.body.playerName || student.playerName || lead?.playerName || 'Student Athlete';
        const resolvedParentName = metadata.parentName || req.body.parentName || student.parentName || lead?.parentName || '';
        const resolvedPhone = metadata.phone || req.body.phone || student.phone || lead?.phone || 'N/A';
        const resolvedDob = metadata.dob || req.body.dob || student.dob || lead?.dob || '';
        const resolvedEmergencyName = metadata.emergencyContactName || req.body.emergencyContactName || student.emergencyContactName || lead?.emergencyContactName || '';
        const resolvedEmergencyPhone = metadata.emergencyContactPhone || req.body.emergencyContactPhone || student.emergencyContactPhone || lead?.emergencyContactPhone || '';

        const targetRegistrationId = metadata.registrationId || regId;

        // Check if registration was already saved (e.g. by webhook)
        let alreadySentEmails = false;
        if (registrations[targetRegistrationId] && registrations[targetRegistrationId].paymentStatus === 'PAID') {
          alreadySentEmails = true;
        } else if (db) {
          const dbDoc = await db.collection('registrations').findOne({ 
            $or: [
              { registrationId: targetRegistrationId },
              { stripePaymentIntentId: intent.id },
              { transactionId: intent.id }
            ]
          });
          if (dbDoc && dbDoc.paymentStatus === 'PAID') {
            alreadySentEmails = true;
          }
        }

        const confirmedReg: RegistrationRecord = {
          registrationId: targetRegistrationId,
          sessionId: metadata.sessionId || session?.id || sessionId,
          sessionName: metadata.sessionName || session?.name || lead?.sessionName || 'Challengers Coaching Session',
          playerName: resolvedPlayerName,
          parentName: resolvedParentName,
          email: resolvedEmail,
          phone: resolvedPhone,
          dob: resolvedDob,
          location: metadata.preferredLocation || metadata.location || resolvedLocation,
          schedule: metadata.schedule || session?.schedule || lead?.schedule || 'Weekend Sessions',
          amountPaid: intentAmountPaid,
          paymentStatus: 'PAID',
          paymentMethod: resolvedMethod,
          transactionId: transactionId || intent.id || `TX-${regId}`,
          stripePaymentIntentId: intent.id,
          emergencyContactName: resolvedEmergencyName,
          emergencyContactPhone: resolvedEmergencyPhone,
          waiverAccepted: true,
          registeredAt: Date.now(),
          // Sibling Details
          hasSibling: intentSibling,
          siblingName: intentSiblingName,
          siblingDob: intentSiblingDob,
          siblingGender: intentSiblingGender,
          discountAmount: intentDiscount,
          basePrice: Number(metadata.basePrice) || basePrice,
          totalAthletes: intentTotalAthletes
        };

        await saveRegistrationToDb(confirmedReg);
        if (session && session.filled < session.capacity) {
          session.filled = Math.min(session.capacity, session.filled + intentTotalAthletes);
        }
        if (lead) {
          lead.status = 'confirmed';
          await saveLeadToDb(lead);
        }

        // Send notifications only if not already sent by webhook (avoids duplicates)
        if (!alreadySentEmails) {
          console.log(`✉️ Dispatching confirmation emails from verify-payment (${targetRegistrationId} - ${resolvedMethod})...`);
          try {
            await Promise.allSettled([
              sendAdminNotificationEmail(confirmedReg),
              sendCustomerConfirmationEmail(confirmedReg)
            ]);
          } catch (mailErr: any) {
            console.error('Email dispatch error during stripe verify-payment:', mailErr.message);
          }
        }

        return res.json({ success: true, registration: confirmedReg });
      } else {
        return res.status(400).json({ success: false, message: `Payment is not completed. Stripe status: ${intent.status}` });
      }
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      res.status(500).json({ success: false, message: err.message || 'Payment verification failed' });
    }
  });

  // POST /api/admin/registrations/:id/resend-email - Resend confirmation and admin notification email
  app.post('/api/admin/registrations/:id/resend-email', requireAuth, async (req, res) => {
    try {
      const regId = req.params.id;
      let reg = registrations[regId];
      if (!reg) {
        const db = await getMongoDb();
        if (db) {
          const doc = await db.collection('registrations').findOne({ 
            $or: [
              { registrationId: regId },
              { _id: ObjectId.isValid(regId) ? new ObjectId(regId) : null }
            ] 
          });
          if (doc) reg = doc as any;
        }
      }

      if (!reg) {
        return res.status(404).json({ success: false, message: `Registration "${regId}" not found.` });
      }

      console.log(`📨 [MANUAL RESEND] Resending confirmation emails for registration ${reg.registrationId} (${reg.playerName})`);

      const [adminRes, custRes] = await Promise.allSettled([
        sendAdminNotificationEmail(reg),
        sendCustomerConfirmationEmail(reg)
      ]);

      const adminSent = adminRes.status === 'fulfilled' && adminRes.value === true;
      const customerSent = custRes.status === 'fulfilled' && custRes.value === true;

      res.json({
        success: true,
        message: `Dispatched: Customer (${customerSent ? 'Sent' : 'Failed'}), Admin (${adminSent ? 'Sent' : 'Failed'})`,
        adminSent,
        customerSent,
        details: {
          recipientEmail: reg.email,
          adminEmail: process.env.ACADEMY_ADMIN_EMAIL || process.env.ADMIN_SEED_EMAIL || process.env.EMAIL_USER
        }
      });
    } catch (err: any) {
      console.error('Error in resend-email endpoint:', err);
      res.status(500).json({ success: false, message: err.message || 'Failed to resend emails' });
    }
  });

  // Diagnostic Test Email Endpoint
  app.get('/api/test-email', async (req, res) => {
    try {
      const transporter = getMailTransporter();
      if (!transporter) {
        return res.status(500).json({ success: false, message: 'Email transporter not initialized. Check EMAIL_USER and EMAIL_PASS.' });
      }
      const adminEmail = process.env.ACADEMY_ADMIN_EMAIL || process.env.EMAIL_USER || 'nihalok625@gmail.com';
      const from = getFromAddress();
      const info = await transporter.sendMail({
        from,
        to: adminEmail,
        subject: '🏐 Challengers Academy - Email Test Successful!',
        html: `
          <div style="font-family:sans-serif;padding:24px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;max-width:500px;margin:0 auto;">
            <h2 style="color:#D62828;">🏐 Email Delivery Verified!</h2>
            <p>Your Challengers Academy automated email system is active and functioning properly.</p>
            <p>All student registration confirmation passes and admin payment alerts will be delivered smoothly.</p>
          </div>
        `
      });
      res.json({ success: true, message: `Test email dispatched to ${adminEmail}`, messageId: info.messageId });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Query Registration by ID (for confirmation refresh & admin)
  app.get('/api/registrations/:id', async (req, res) => {
    let reg = registrations[req.params.id];
    if (!reg) {
      const db = await getMongoDb();
      if (db) {
        try {
          const doc = await db.collection('registrations').findOne({ registrationId: req.params.id });
          if (doc) reg = doc as any;
        } catch (err: any) {
          console.error('MongoDB find registration error:', err.message);
        }
      }
    }
    if (reg) {
      res.json({ success: true, registration: reg });
    } else {
      res.status(404).json({ success: false, message: 'Registration not found' });
    }
  });

  // Contact Form API
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body || {};
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
      }

      // Email basic format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address.' });
      }

      const inquiryId = `INQ-${nanoid(8)}`;
      const inquiryLead = {
        id: inquiryId,
        type: 'contact_inquiry',
        playerName: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject || 'General Inquiry',
        message: message.trim(),
        createdAt: Date.now(),
        status: 'NEW'
      };

      await saveLeadToDb(inquiryLead);
      console.log(` Saved contact inquiry from ${email} (${inquiryId})`);

      // Email notification to academy admin
      const transporter = getMailTransporter();
      if (transporter) {
        const supportEmail = process.env.ACADEMY_ADMIN_EMAIL || process.env.EMAIL_TO || process.env.EMAIL_USER || 'hello@challengerscoaching.com';
        try {
          const safeName = escapeHtml(name);
          const safeEmail = escapeHtml(email);
          const safeSubject = escapeHtml(subject || 'General Inquiry');
          const safeMessage = escapeHtml(message);

          await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: supportEmail,
            replyTo: email,
            subject: `[Contact Form] ${safeSubject} from ${safeName}`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #eaeaea;border-radius:12px;background:#ffffff;">
                <h2 style="color:#C1272D;margin-top:0;">🏐 New Website Inquiry</h2>
                <p style="margin:6px 0;"><strong>Name:</strong> ${safeName}</p>
                <p style="margin:6px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
                <p style="margin:6px 0;"><strong>Subject:</strong> ${safeSubject}</p>
                <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
                <p style="margin:6px 0;"><strong>Message:</strong></p>
                <p style="white-space:pre-wrap;background:#f8f8f8;padding:14px;border-radius:8px;line-height:1.6;color:#333;">${safeMessage}</p>
                <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
                <p style="font-size:11px;color:#888;margin:0;">Submitted via Challengers Academy Contact Form at ${new Date().toLocaleString()}</p>
              </div>
            `
          });
          console.log(`✉️ Contact notification email sent to ${supportEmail}`);
        } catch (mailErr: any) {
          console.warn('⚠️ Could not send contact email notification:', mailErr.message);
        }
      }

      res.json({ success: true, message: 'Message sent successfully.' });
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
    }
  });

  /**
   * Synchronizes all completed Stripe Payment Intents, Charges, and Checkout Sessions with MongoDB.
   * Detects Link, Apple Pay, Google Pay, Card brand & last4, Cash App, etc.,
   * and ensures all successful Stripe payments appear in the Admin Dashboard.
   */
  async function syncStripePaymentsWithDb(): Promise<{ syncedCount: number; updatedCount: number; totalStripePayments: number }> {
    const stripe = getStripe();
    if (!stripe) {
      return { syncedCount: 0, updatedCount: 0, totalStripePayments: 0 };
    }

    let syncedCount = 0;
    let updatedCount = 0;
    let totalStripePayments = 0;

    try {
      const db = await getMongoDb();
      
      // 1. Fetch recent Payment Intents with expanded details
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
        expand: ['data.payment_method', 'data.latest_charge']
      });

      // 2. Fetch recent Charges for direct/legacy charges
      let allCharges: Stripe.Charge[] = [];
      try {
        const chargesRes = await stripe.charges.list({ limit: 100 });
        allCharges = chargesRes.data;
      } catch { /* ignore */ }

      // 3. Fetch recent Checkout Sessions
      let allSessions: Stripe.Checkout.Session[] = [];
      try {
        const sessionsRes = await stripe.checkout.sessions.list({ limit: 100, expand: ['data.payment_intent'] });
        allSessions = sessionsRes.data;
      } catch { /* ignore */ }

      totalStripePayments = paymentIntents.data.length;

      // Track processed IDs to prevent duplicate processing during sync
      const processedIntentIds = new Set<string>();

      // Process Payment Intents
      for (const intent of paymentIntents.data) {
        if (intent.status !== 'succeeded') continue;
        processedIntentIds.add(intent.id);

        const paymentIntentId = intent.id;
        const metadata = (intent.metadata || {}) as Record<string, any>;
        const methodInfo = await extractStripePaymentMethodDetails(intent, stripe);
        const dynamicMethod = methodInfo.paymentMethod;

        // Check if registration already exists in MongoDB or memory
        let existing: any = null;
        if (db) {
          existing = await db.collection('registrations').findOne({
            $or: [
              ...(metadata.registrationId ? [{ registrationId: metadata.registrationId }] : []),
              { stripePaymentIntentId: paymentIntentId },
              { transactionId: paymentIntentId }
            ]
          });
        }

        if (existing) {
          // Update payment method with specific details if previously generic
          if (db && dynamicMethod && dynamicMethod !== 'Stripe' && existing.paymentMethod !== dynamicMethod) {
            await db.collection('registrations').updateOne(
              { _id: existing._id },
              { $set: { paymentMethod: dynamicMethod, stripePaymentIntentId: paymentIntentId } }
            );
            if (registrations[existing.registrationId]) {
              registrations[existing.registrationId].paymentMethod = dynamicMethod;
            }
            updatedCount++;
          }
          continue;
        }

        // Determine customer email
        const intentCharges = (intent as any).charges?.data?.[0]?.billing_details;
        const resolvedEmail = (
          metadata.email || 
          intent.receipt_email || 
          (intent as any).customer_details?.email || 
          intentCharges?.email || 
          'N/A'
        ).trim().toLowerCase();

        // Check if matching lead exists to pull athlete name, parent name, schedule, sibling info
        let matchedLead: any = null;
        if (db) {
          if (metadata.leadId) {
            matchedLead = await db.collection('leads').findOne({ id: metadata.leadId });
          } else if (metadata.registrationId) {
            matchedLead = await db.collection('leads').findOne({ registrationId: metadata.registrationId });
          } else {
            matchedLead = await db.collection('leads').findOne({
              $or: [
                { paymentIntentId },
                ...(resolvedEmail && resolvedEmail.includes('@') ? [{ email: resolvedEmail }] : [])
              ]
            });
          }
        }

        const regId = metadata.registrationId || matchedLead?.registrationId || generateRegistrationId();
        const sessionId = metadata.sessionId || matchedLead?.sessionId || 'starter-pack';
        const sessionItem = SESSIONS_CATALOG[sessionId];
        const amountPaid = intent.amount ? intent.amount / 100 : (matchedLead?.amount || sessionItem?.price || 30);
        const isSibling = metadata.hasSibling === 'true' || metadata.hasSibling === true || matchedLead?.hasSibling === true || matchedLead?.hasSibling === 'true';

        // Format clean athlete name
        let resolvedPlayerName = metadata.playerName || matchedLead?.playerName || intentCharges?.name;
        if (!resolvedPlayerName || resolvedPlayerName.startsWith('pi_') || resolvedPlayerName === 'Student Athlete') {
          if (resolvedEmail && resolvedEmail.includes('@')) {
            const emailPrefix = resolvedEmail.split('@')[0].replace(/[0-9._-]/g, ' ').trim();
            resolvedPlayerName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          } else {
            resolvedPlayerName = 'Athlete';
          }
        }

        const resolvedParentName = metadata.parentName || matchedLead?.parentName || '';
        const resolvedPhone = metadata.phone || matchedLead?.phone || intentCharges?.phone || 'N/A';
        const resolvedLocation = metadata.preferredLocation || metadata.location || matchedLead?.preferredLocation || matchedLead?.location || sessionItem?.location || 'Fremont (Kerala House)';
        const resolvedSchedule = metadata.schedule || matchedLead?.schedule || sessionItem?.schedule || 'Weekend Sessions';
        
        let sessionTitle = metadata.sessionName || matchedLead?.sessionName || sessionItem?.name;
        if (!sessionTitle || sessionTitle.startsWith('pi_')) {
          sessionTitle = intent.description && !intent.description.startsWith('pi_') ? intent.description : 'Challengers Coaching Session';
        }

        const newRegistration: RegistrationRecord = {
          registrationId: regId,
          sessionId,
          sessionName: sessionTitle,
          playerName: resolvedPlayerName,
          parentName: resolvedParentName,
          email: resolvedEmail,
          phone: resolvedPhone,
          dob: metadata.dob || matchedLead?.dob || '',
          location: resolvedLocation,
          schedule: resolvedSchedule,
          amountPaid,
          paymentStatus: 'PAID',
          paymentMethod: dynamicMethod,
          transactionId: paymentIntentId,
          stripePaymentIntentId: paymentIntentId,
          emergencyContactName: metadata.emergencyContactName || matchedLead?.emergencyContactName || '',
          emergencyContactPhone: metadata.emergencyContactPhone || matchedLead?.emergencyContactPhone || '',
          waiverAccepted: true,
          registeredAt: intent.created ? intent.created * 1000 : Date.now(),
          hasSibling: isSibling,
          siblingName: metadata.siblingName || matchedLead?.siblingName || '',
          siblingDob: metadata.siblingDob || matchedLead?.siblingDob || '',
          siblingGender: metadata.siblingGender || matchedLead?.siblingGender || '',
          discountAmount: isSibling ? 50 : 0,
          basePrice: Number(metadata.basePrice) || (sessionItem?.price || 200),
          totalAthletes: isSibling ? 2 : 1
        };

        await saveRegistrationToDb(newRegistration);
        if (matchedLead && db) {
          await db.collection('leads').updateOne(
            { _id: matchedLead._id },
            { $set: { status: 'confirmed', registrationId: regId } }
          );
        }
        syncedCount++;
      }

      // Also process any standalone successful Charges not linked to already processed PaymentIntents
      for (const ch of allCharges) {
        if (!ch.paid || ch.status !== 'succeeded') continue;
        const targetPiId = typeof ch.payment_intent === 'string' ? ch.payment_intent : (ch.payment_intent as any)?.id;
        if (targetPiId && processedIntentIds.has(targetPiId)) continue;

        const chargeId = ch.id;
        const methodInfo = await extractStripePaymentMethodDetails(ch, stripe);

        let existing: any = null;
        if (db) {
          existing = await db.collection('registrations').findOne({
            $or: [
              { stripePaymentIntentId: targetPiId || chargeId },
              { transactionId: chargeId },
              ...(targetPiId ? [{ transactionId: targetPiId }] : [])
            ]
          });
        }

        if (existing) continue;

        const resolvedEmail = (ch.receipt_email || ch.billing_details?.email || 'customer@example.com').toLowerCase().trim();
        let resolvedPlayerName = ch.billing_details?.name;
        if (!resolvedPlayerName && resolvedEmail.includes('@')) {
          const prefix = resolvedEmail.split('@')[0].replace(/[0-9._-]/g, ' ').trim();
          resolvedPlayerName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }

        const newRegistration: RegistrationRecord = {
          registrationId: generateRegistrationId(),
          sessionId: 'starter-pack',
          sessionName: ch.description || 'Challengers Coaching Session',
          playerName: resolvedPlayerName || 'Athlete',
          parentName: '',
          email: resolvedEmail,
          phone: ch.billing_details?.phone || 'N/A',
          dob: '',
          location: 'Fremont Arena',
          schedule: 'Weekend Sessions',
          amountPaid: ch.amount / 100,
          paymentStatus: 'PAID',
          paymentMethod: methodInfo.paymentMethod,
          transactionId: chargeId,
          stripePaymentIntentId: targetPiId || chargeId,
          waiverAccepted: true,
          registeredAt: ch.created ? ch.created * 1000 : Date.now(),
          hasSibling: false,
          discountAmount: 0,
          basePrice: ch.amount / 100,
          totalAthletes: 1
        };

        await saveRegistrationToDb(newRegistration);
        syncedCount++;
      }

      // 3. Process Checkout Sessions (capturing Link, Apple Pay, Google Pay completed via Checkout)
      for (const sess of allSessions) {
        if (sess.payment_status !== 'paid') continue;
        const targetPiId = typeof sess.payment_intent === 'string' 
          ? sess.payment_intent 
          : (sess.payment_intent as any)?.id || sess.id;

        if (targetPiId && processedIntentIds.has(targetPiId)) continue;
        processedIntentIds.add(targetPiId);

        let existing: any = null;
        if (db) {
          existing = await db.collection('registrations').findOne({
            $or: [
              ...(sess.metadata?.registrationId ? [{ registrationId: sess.metadata.registrationId }] : []),
              { stripePaymentIntentId: targetPiId },
              { transactionId: targetPiId },
              { transactionId: sess.id }
            ]
          });
        }

        if (existing) continue;

        let dynamicMethod = 'Card';
        if (sess.payment_intent && typeof sess.payment_intent !== 'string') {
          const mInfo = await extractStripePaymentMethodDetails(sess.payment_intent, stripe);
          dynamicMethod = mInfo.paymentMethod;
        } else if (sess.payment_method_types && sess.payment_method_types.length > 0) {
          const rawType = sess.payment_method_types[0];
          if (rawType === 'link') dynamicMethod = 'Link';
          else if (rawType === 'card') dynamicMethod = 'Card';
          else dynamicMethod = rawType.toUpperCase();
        }

        const sessMeta = (sess.metadata || {}) as Record<string, any>;
        const resolvedEmail = (sess.customer_details?.email || sess.customer_email || sessMeta.email || 'customer@example.com').toLowerCase().trim();
        let resolvedPlayerName = sess.customer_details?.name || sessMeta.playerName;
        if (!resolvedPlayerName || resolvedPlayerName.startsWith('pi_') || resolvedPlayerName === 'Student Athlete') {
          if (resolvedEmail && resolvedEmail.includes('@')) {
            const prefix = resolvedEmail.split('@')[0].replace(/[0-9._-]/g, ' ').trim();
            resolvedPlayerName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
          } else {
            resolvedPlayerName = 'Athlete';
          }
        }

        const amountTotal = sess.amount_total ? sess.amount_total / 100 : (sessMeta.basePrice ? Number(sessMeta.basePrice) : 200);

        const newRegistration: RegistrationRecord = {
          registrationId: sessMeta.registrationId || generateRegistrationId(),
          sessionId: sessMeta.sessionId || 'starter-pack',
          sessionName: sessMeta.sessionName || 'Challengers Coaching Session',
          playerName: resolvedPlayerName || 'Athlete',
          parentName: sessMeta.parentName || '',
          email: resolvedEmail,
          phone: sess.customer_details?.phone || sessMeta.phone || 'N/A',
          dob: sessMeta.dob || '',
          location: sessMeta.preferredLocation || sessMeta.location || 'Fremont Arena',
          schedule: sessMeta.schedule || 'Weekend Sessions',
          amountPaid: amountTotal,
          paymentStatus: 'PAID',
          paymentMethod: dynamicMethod,
          transactionId: targetPiId || sess.id,
          stripePaymentIntentId: targetPiId || sess.id,
          waiverAccepted: true,
          registeredAt: sess.created ? sess.created * 1000 : Date.now(),
          hasSibling: sessMeta.hasSibling === 'true' || sessMeta.hasSibling === true,
          siblingName: sessMeta.siblingName || '',
          siblingDob: sessMeta.siblingDob || '',
          siblingGender: sessMeta.siblingGender || '',
          discountAmount: (sessMeta.hasSibling === 'true' || sessMeta.hasSibling === true) ? 50 : 0,
          basePrice: amountTotal,
          totalAthletes: (sessMeta.hasSibling === 'true' || sessMeta.hasSibling === true) ? 2 : 1
        };

        await saveRegistrationToDb(newRegistration);
        syncedCount++;
      }

      console.log(`✅ Stripe sync completed: ${syncedCount} new registrations imported, ${updatedCount} updated.`);
    } catch (syncErr: any) {
      console.error('⚠️ Stripe payment sync error:', syncErr.message);
    }

    return { syncedCount, updatedCount, totalStripePayments };
  }

  // POST /api/admin/clean-mock-records - Purge test / mock registrations
  app.post('/api/admin/clean-mock-records', requireAuth, async (req, res) => {
    try {
      const db = await getMongoDb();
      let deletedCount = 0;
      if (db) {
        const query = {
          $or: [
            { stripePaymentIntentId: { $regex: '^mock_', $options: 'i' } },
            { transactionId: { $regex: '^mock_', $options: 'i' } },
            { paymentMethod: { $regex: 'mock', $options: 'i' } },
            { registrationId: { $regex: '^mock_', $options: 'i' } },
            { playerName: 'Student Athlete' },
            { email: 'customer@example.com' }
          ]
        };
        const result = await db.collection('registrations').deleteMany(query);
        deletedCount = result.deletedCount;
      }

      // Also clean in-memory map
      for (const [key, val] of Object.entries(registrations)) {
        if (
          val.stripePaymentIntentId?.startsWith('mock_') ||
          val.transactionId?.startsWith('mock_') ||
          val.paymentMethod?.toLowerCase().includes('mock') ||
          val.registrationId?.startsWith('mock_') ||
          val.playerName === 'Student Athlete' ||
          val.email === 'customer@example.com'
        ) {
          delete registrations[key];
        }
      }

      res.json({
        success: true,
        message: `Successfully purged ${deletedCount} test / mock registrations.`,
        deletedCount
      });
    } catch (err: any) {
      console.error('Purge mock records error:', err);
      res.status(500).json({ success: false, message: err.message || 'Failed to purge mock records' });
    }
  });

  // POST /api/admin/sync-stripe-payments - Sync all successful Stripe transactions to MongoDB
  app.post('/api/admin/sync-stripe-payments', requireAuth, async (req, res) => {
    try {
      const result = await syncStripePaymentsWithDb();
      res.json({
        success: true,
        message: `Stripe Sync Complete: ${result.syncedCount} new payments imported, ${result.updatedCount} updated.`,
        ...result
      });
    } catch (err: any) {
      console.error('Stripe sync API error:', err);
      res.status(500).json({ success: false, message: err.message || 'Stripe sync failed' });
    }
  });

  // Admin API (Secured with JWT)
  app.get('/api/admin/stats', requireAuth, async (req, res) => {
    // Synchronize all genuine successful Stripe payments with database
    if (getStripe()) {
      try {
        await syncStripePaymentsWithDb();
      } catch (e: any) {
        console.warn('Stripe sync warning during stats load:', e.message);
      }
    }

    let allRegistrations = Object.values(registrations);
    let allLeads = Object.values(leads);

    const db = await getMongoDb();
    if (db) {
      try {
        const mongoRegs = await db.collection('registrations').find().toArray();
        if (mongoRegs.length > 0) allRegistrations = mongoRegs as any;
        const mongoLeads = await db.collection('leads').find().toArray();
        if (mongoLeads.length > 0) allLeads = mongoLeads as any;
      } catch (err: any) {
        console.error('MongoDB stats query error:', err.message);
      }
    }

    const totalConfirmed = allRegistrations.length;
    const totalLeads = allLeads.length;
    const totalRevenue = allRegistrations.reduce((sum, r) => sum + (Number(r.amountPaid) || 0), 0);

    // Compute real 7-day registration trends
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const trends = Array.from({ length: 7 }).map((_, i) => {
      const dayStart = now - (6 - i) * dayMs;
      const dayEnd = dayStart + dayMs;
      const count = allRegistrations.filter(r => r.registeredAt >= dayStart && r.registeredAt < dayEnd).length;
      const d = new Date(dayStart);
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        count
      };
    });

    const recentGrowth = trends[6]?.count || 0;

    res.json({
      success: true,
      stats: {
        totalLeads,
        totalConfirmed,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        recentGrowth,
        trends,
        sessions: SESSIONS_CATALOG
      },
      registrations: allRegistrations.sort((a, b) => (b.registeredAt || 0) - (a.registeredAt || 0)),
      leads: allLeads.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
      gallery: galleryItemsList
    });
  });

  // Edit Student / Registration Details (Secured with JWT)
  app.put('/api/admin/registrations/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        playerName,
        parentName,
        email,
        phone,
        dob,
        emergencyContactName,
        emergencyContactPhone,
        medicalNotes,
        paymentStatus,
        paymentMethod,
        transactionId,
        sessionName,
        location,
        schedule,
        amountPaid
      } = req.body;

      const updateFields: any = {
        updatedAt: Date.now()
      };

      if (playerName !== undefined) updateFields.playerName = String(playerName).trim();
      if (parentName !== undefined) updateFields.parentName = String(parentName).trim();
      if (email !== undefined) updateFields.email = String(email).trim().toLowerCase();
      if (phone !== undefined) updateFields.phone = String(phone).trim();
      if (dob !== undefined) updateFields.dob = dob;
      if (emergencyContactName !== undefined) updateFields.emergencyContactName = String(emergencyContactName).trim();
      if (emergencyContactPhone !== undefined) updateFields.emergencyContactPhone = String(emergencyContactPhone).trim();
      if (medicalNotes !== undefined) updateFields.medicalNotes = String(medicalNotes).trim();
      if (paymentStatus !== undefined) updateFields.paymentStatus = paymentStatus;
      if (paymentMethod !== undefined) updateFields.paymentMethod = paymentMethod;
      if (transactionId !== undefined) updateFields.transactionId = String(transactionId).trim();
      if (sessionName !== undefined) updateFields.sessionName = sessionName;
      if (location !== undefined) updateFields.location = location;
      if (schedule !== undefined) updateFields.schedule = schedule;
      if (amountPaid !== undefined) updateFields.amountPaid = Number(amountPaid) || 0;

      const db = await getMongoDb();
      let updatedDoc: any = null;

      if (db) {
        let query: any = { registrationId: id };
        if (ObjectId.isValid(id)) {
          query = { $or: [{ registrationId: id }, { _id: new ObjectId(id) }] };
        }

        await db.collection('registrations').updateOne(query, { $set: updateFields });
        updatedDoc = await db.collection('registrations').findOne(query);
      }

      // Also update in-memory registrations if present
      if (registrations[id]) {
        registrations[id] = { ...registrations[id], ...updateFields };
        if (!updatedDoc) updatedDoc = registrations[id];
      }
      Object.keys(registrations).forEach(key => {
        if (registrations[key]?.registrationId === id) {
          registrations[key] = { ...registrations[key], ...updateFields };
        }
      });

      res.json({
        success: true,
        message: 'Student details updated successfully',
        registration: updatedDoc || { registrationId: id, ...updateFields }
      });
    } catch (err: any) {
      console.error('Update registration error:', err);
      res.status(500).json({ success: false, message: 'Failed to update student details' });
    }
  });

  // Public Payment Settings (QR Code, Zelle, Venmo, UPI, Handles)
  app.get('/api/payment-settings', (req, res) => {
    res.json({ success: true, settings: academyPaymentSettings });
  });

  // Admin Update Payment & QR Settings (Secured with JWT)
  app.post('/api/admin/payment-settings', requireAuth, async (req, res) => {
    try {
      const incoming = req.body || {};
      academyPaymentSettings = {
        ...academyPaymentSettings,
        ...incoming
      };

      const db = await getMongoDb();
      if (db) {
        await db.collection('payment_settings').updateOne(
          { id: 'global_payment_settings' },
          { $set: { id: 'global_payment_settings', ...academyPaymentSettings, updatedAt: Date.now() } },
          { upsert: true }
        );
      }

      res.json({
        success: true,
        message: 'Academy payment and QR settings saved successfully',
        settings: academyPaymentSettings
      });
    } catch (err: any) {
      console.error('Save payment settings error:', err);
      res.status(500).json({ success: false, message: 'Failed to save payment settings' });
    }
  });

  // Permanently Delete Student Registration (Secured with JWT)
  app.delete('/api/admin/registrations/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await getMongoDb();

      if (db) {
        let query: any = { registrationId: id };
        if (ObjectId.isValid(id)) {
          query = { $or: [{ registrationId: id }, { _id: new ObjectId(id) }] };
        }
        await db.collection('registrations').deleteOne(query);
      }

      // Remove from in-memory fallback
      delete registrations[id];
      Object.keys(registrations).forEach(key => {
        if (registrations[key]?.registrationId === id) {
          delete registrations[key];
        }
      });

      res.json({
        success: true,
        message: 'Student registration permanently deleted'
      });
    } catch (err: any) {
      console.error('Delete registration error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete student registration' });
    }
  });

  // Permanently Delete Lead / Checkout Inquiry (Secured with JWT)
  app.delete('/api/admin/leads/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await getMongoDb();

      if (db) {
        let query: any = { id };
        if (ObjectId.isValid(id)) {
          query = { $or: [{ id }, { _id: new ObjectId(id) }] };
        }
        await db.collection('leads').deleteOne(query);
      }

      delete leads[id];
      res.json({ success: true, message: 'Lead removed successfully' });
    } catch (err: any) {
      console.error('Delete lead error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete lead' });
    }
  });

  // Public Gallery API (retrieves live photos from MongoDB, sorted newest first)
  app.get('/api/gallery', async (req, res) => {
    try {
      const db = await getMongoDb();
      if (db) {
        const items = await db.collection('gallery').find({}).sort({ createdAt: -1 }).toArray();
        if (items && items.length > 0) {
          return res.json({ success: true, items });
        }
      }
      return res.json({ success: true, items: galleryItemsList });
    } catch (err: any) {
      console.error('Fetch gallery error:', err);
      res.json({ success: true, items: galleryItemsList });
    }
  });

  // Admin Add Gallery Media / Student Photo (Secured with JWT)
  app.post('/api/admin/gallery', requireAuth, async (req, res) => {
    try {
      const { title, url, type, description, category } = req.body;
      if (!url || !title) {
        return res.status(400).json({ success: false, message: 'Title and image are required.' });
      }

      const newItem: GalleryMediaItem = {
        id: `media_${nanoid(10)}`,
        url,
        type: type === 'video' ? 'video' : 'image',
        title: String(title).trim(),
        description: String(description || '').trim(),
        category: String(category || 'Student Spotlight').trim(),
        createdAt: Date.now()
      };

      const db = await getMongoDb();
      if (db) {
        await db.collection('gallery').insertOne(newItem);
        console.log(` Added new student/gallery photo "${newItem.title}" to MongoDB`);
      }
      galleryItemsList = [newItem, ...galleryItemsList.filter(i => i.id !== newItem.id)];

      res.json({
        success: true,
        message: 'Photo published to academy gallery successfully!',
        item: newItem
      });
    } catch (err: any) {
      console.error('Add gallery item error:', err);
      res.status(500).json({ success: false, message: 'Failed to upload gallery media' });
    }
  });

  // Admin Delete Gallery Media / Photo (Secured with JWT)
  app.delete('/api/admin/gallery/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await getMongoDb();
      if (db) {
        let query: any = { id };
        if (ObjectId.isValid(id)) {
          query = { $or: [{ id }, { _id: new ObjectId(id) }] };
        }
        await db.collection('gallery').deleteOne(query);
        console.log(`🗑️ Deleted gallery photo ${id} from MongoDB`);
      }

      galleryItemsList = galleryItemsList.filter(i => i.id !== id);

      res.json({
        success: true,
        message: 'Photo permanently deleted from gallery'
      });
    } catch (err: any) {
      console.error('Delete gallery item error:', err);
      res.status(500).json({ success: false, message: 'Failed to delete gallery item' });
    }
  });

  // Global Express Error Handler Middleware (Prevents server crash on unhandled route errors)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('🛡️ [Express Unhandled Route Error]:', err?.message || err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again.'
      });
    }
  });

  return app;
}

async function startServer() {
  const app = await createApp();
  const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  function listen(port: number) {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`\n  🚀 Server running on http://localhost:${port}\n`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`  ⚠️  Port ${port} is already in use. Trying port ${port + 1}...`);
        listen(port + 1);
      } else {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    });
  }

  listen(DEFAULT_PORT);

  // Seed first admin, programs, camps & gallery after DB connects
  const db = await getMongoDb();
  if (db) {
    await seedFirstAdmin(db);
    await seedPrograms(db);
    await seedCamps(db);
    await seedGallery(db);
    await loadPaymentSettingsFromDb();
  }
}

// Only start standalone HTTP server when not running inside Vercel serverless environment
if (!process.env.VERCEL && !process.env.VERCEL_ENV && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.NOW_REGION) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}


