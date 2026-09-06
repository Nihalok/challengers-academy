import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import { nanoid } from 'nanoid';
import { MongoClient, Db, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';

// MongoDB Client Initialization
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

async function getMongoDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (mongoDb) return mongoDb;
  try {
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    const dbName = process.env.MONGODB_DB_NAME || 'challengers_academy';
    mongoDb = mongoClient.db(dbName);
    console.log(` Connected to MongoDB Database: "${dbName}"`);
    return mongoDb;
  } catch (err: any) {
    console.warn('⚠️ MongoDB connection error:', err.message);
    return null;
  }
}

// ============================================================
// AUTH HELPERS
// ============================================================
const JWT_SECRET = process.env.JWT_SECRET || 'challengers-dev-secret-change-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
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
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;

  const host = process.env.EMAIL_HOST;
  if (process.env.EMAIL_SERVICE === 'gmail' || user.includes('@gmail.com') || host === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: process.env.EMAIL_PORT === '465',
    auth: { user, pass },
  });
}

async function sendPasswordResetEmail(email: string, resetToken: string) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/login?reset=${resetToken}`;
  const transporter = getMailTransporter();
  if (!transporter) {
    console.log(`\n[PASSWORD RESET EMAIL]\nTo: ${email}\nReset URL: ${resetUrl}\n`);
    return;
  }
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
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
    location: 'Open Park Facilities (Halcyon Park)',
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
    id: 'large-group-training',
    title: 'Large Group Training (13+ Students)',
    phase: 'TEAM / SQUAD',
    description: 'Economical team training for school squads, clubs, and large youth groups.',
    longDescription: '4 sessions (2 hours each) designed for groups with 13 or more students. Focuses on team tactical systems, transition defense, communication, and scrimmage reps ($120 per student).',
    image: 'https://images.unsplash.com/photo-1592656670411-b91990822650?q=80&w=1200&auto=format&fit=crop',
    ageRange: '13+ Students',
    ageGroups: ['11-14', '15-18'],
    features: ['4 x 2-Hour Sessions', '$120 Per Student', 'Team Systems & Play', 'Coach Mentorship'],
    price: 120,
    schedule: 'Custom Team Schedule (2 Hours / Session)',
    location: 'Designated Gym / Park Court',
    capacity: 40,
    filled: 26,
    coach: 'Full Academy Coaching Staff',
    isActive: true,
    order: 6
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
      { $setOnInsert: { ...prog, createdAt: new Date() } },
      { upsert: true }
    );
  }
  // Clean only obsolete legacy test IDs so admin-created courses remain intact
  const legacyIds = ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'little-spikers', 'foundations-clinic'];
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
      { $setOnInsert: { ...camp, createdAt: new Date() } },
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
    location: 'Open Park Facilities',
    locationAddress: 'Halcyon Park & Regional Courts',
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
    locationAddress: 'Halcyon Park / San Leandro Courts',
    schedule: 'Weekend & Weekday Slots',
    dates: 'Weekly Batches',
    time: '2 Hours per Session',
    price: 150,
    capacity: 20,
    filled: 11,
    coach: 'Academy Coaching Staff',
    description: '4 outdoor group training sessions (2 hours each). High reps, agility, ball control, and defense ($150 per student).'
  },
  'large-group-training': {
    id: 'large-group-training',
    name: 'Large Group Training (13+ Students)',
    category: 'Large Group / Team',
    ageGroup: '13 or More Students',
    skillLevel: 'Team & Squad Level',
    location: 'Designated Gym / Park Court',
    locationAddress: 'Bay Area Training Centers',
    schedule: 'Custom Team Schedule',
    dates: 'Scheduled with Coach',
    time: '2 Hours per Session',
    price: 120,
    capacity: 40,
    filled: 26,
    coach: 'Full Academy Coaching Staff',
    description: '4 sessions (2 hours each) for teams, schools, or groups with 13+ athletes. $120 per student.'
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
    description: '2-hour comprehensive tryout evaluation session. Direct coach feedback, skill testing, and tier placement ($30).'
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
async function sendAdminNotificationEmail(reg: RegistrationRecord) {
  const adminEmail = process.env.ACADEMY_ADMIN_EMAIL || process.env.ADMIN_SEED_EMAIL || process.env.EMAIL_USER || 'kenznajeeb@gmail.com';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const transporter = getMailTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@challengersvolleyball.com';

  console.log(`\n======================================================`);
  console.log(`📧 [EMAIL DISPATCH] → ADMIN NOTIFICATION`);
  console.log(`To: ${adminEmail}`);
  console.log(`Subject: New Registration: ${reg.playerName} ($${reg.amountPaid})`);
  console.log(`======================================================\n`);

  const isQrTransfer = reg.paymentMethod === 'QR Code' || reg.paymentMethod === 'qr';
  const emailSubject = isQrTransfer
    ? `🔔 [Zelle / QR Transfer] ${reg.playerName} - Ref: ${reg.transactionId || 'Pending'} ($${reg.amountPaid})`
    : `🚨 [New Paid Registration] ${reg.playerName} - ${reg.sessionName} ($${reg.amountPaid})`;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Challengers Academy" <${from}>`,
        to: adminEmail,
        subject: emailSubject,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f0; margin: 0; padding: 24px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #eae5db; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
              <div style="background: #1B1B1D; padding: 28px; text-align: center;">
                <div style="display: inline-block; background: ${isQrTransfer ? '#f59e0b' : '#ea580c'}; color: #ffffff; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; padding: 6px 14px; border-radius: 50px; margin-bottom: 12px;">
                  ${isQrTransfer ? 'Zelle / QR Transfer Submitted' : 'New Paid Registration'}
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
                  ${reg.playerName}
                </h1>
                <p style="color: #ea580c; margin: 4px 0 0 0; font-size: 16px; font-weight: bold;">
                  $${reg.amountPaid} USD - ${reg.sessionName}
                </p>
              </div>

              <div style="padding: 28px;">
                ${isQrTransfer ? `
                <div style="background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 700;">
                    ⚠️ Direct Transfer / Zelle Payment
                  </p>
                  <p style="margin: 4px 0 0 0; color: #78350f; font-size: 12px; line-height: 1.5;">
                    The customer reported transferring <strong>$${reg.amountPaid}</strong> with Transaction/Ref ID: <strong style="font-family: monospace;">${reg.transactionId || 'N/A'}</strong>. Please verify this payment in your bank or Zelle statement.
                  </p>
                </div>
                ` : ''}

                <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #8c827a; margin: 0 0 16px 0;">
                  Athlete & Parent Details
                </h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                  <tr style="border-bottom: 1px solid #f2ede4;">
                    <td style="padding: 10px 0; color: #736b63; font-weight: 600; width: 40%;">Registration ID:</td>
                    <td style="padding: 10px 0; color: #1B1B1D; font-weight: 900;">${reg.registrationId}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f2ede4;">
                    <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Player Name:</td>
                    <td style="padding: 10px 0; color: #1B1B1D; font-weight: bold;">${reg.playerName}</td>
                  </tr>
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
      console.log(` Admin notification email sent successfully to ${adminEmail}`);
    } catch (err: any) {
      console.error(' Admin email dispatch error:', err.message);
    }
  }
}

async function sendCustomerConfirmationEmail(reg: RegistrationRecord) {
  const transporter = getMailTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@challengersvolleyball.com';
  const customerName = reg.parentName || reg.playerName;

  console.log(`\n======================================================`);
  console.log(`📧 [EMAIL DISPATCH] → CUSTOMER CONFIRMATION`);
  console.log(`To: ${reg.email}`);
  console.log(`Subject: Registration Confirmed! 🎉 - Challengers Volleyball Academy`);
  console.log(`======================================================\n`);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Challengers Volleyball Academy" <${from}>`,
        to: reg.email,
        subject: `🎉 Registration Confirmed: ${reg.sessionName} (${reg.registrationId})`,
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
                    <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Athlete Name:</td>
                    <td style="padding: 10px 0; color: #1B1B1D; font-weight: bold;">${reg.playerName}</td>
                  </tr>
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
                    <td style="padding: 10px 0; color: #736b63; font-weight: 600;">Amount Paid:</td>
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

                <div style="text-align: center; border-top: 1px solid #f2ede4; pt-6; padding-top: 20px; color: #8c827a; font-size: 12px;">
                  Have questions or need assistance? Reply directly to this email or call us at (510) 555-0199.<br />
                  <strong>Challengers Volleyball Academy</strong> - Bay Area, CA
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      });
      console.log(` Customer confirmation email sent successfully to ${reg.email}`);
    } catch (err: any) {
      console.error(' Customer confirmation email dispatch error:', err.message);
    }
  }
}

let galleryItems = [
  { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc', title: 'Elite Training Session', description: 'Core strength and tactical positioning.' },
  { id: '2', type: 'image', url: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04', title: 'Championship Finals', description: 'The moment of victory for our under-17 squad.' },
  { id: '3', type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-basketball-player-practicing-a-slam-dunk-2045-large.mp4', title: 'Dunk Highlights', description: 'Advanced aerial maneuvers workshop.' },
  { id: '4', type: 'image', url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a', title: 'Outdoor Drills', description: 'Building endurance in natural environments.' }
];

async function startServer() {
  const app = express();
  const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // 1. Stripe Raw Webhook Endpoint (MUST be before express.json() for signature verification)
  app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripe = getStripe();

    let event: Stripe.Event | any = null;

    if (stripe && webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error(`⚠️ Webhook signature verification failed:`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    } else if (process.env.NODE_ENV !== 'production') {
      // Fallback parser ONLY for local testing/mock webhook events
      try {
        event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch {
        event = req.body;
      }
    } else {
      console.error('⚠️ Rejected unverified Stripe webhook: missing signature or webhook secret in production.');
      return res.status(400).send('Webhook signature verification required in production.');
    }

    console.log(`🔔 Stripe Webhook Received: ${event?.type || 'unknown_event'}`);

    if (event?.type === 'payment_intent.succeeded' || event?.type === 'checkout.session.completed') {
      const sessionOrIntent = event.data?.object;
      const metadata = sessionOrIntent?.metadata || {};
      const registrationId = metadata.registrationId || `CVA-${Math.floor(10000 + Math.random() * 90000)}`;

      // Idempotency check: prevent duplicate registration if already confirmed
      if (registrations[registrationId]) {
        console.log(`ℹ️ Registration ${registrationId} already confirmed. Skipping duplicate.`);
        return res.json({ received: true, alreadyProcessed: true });
      }

      const sessionId = metadata.sessionId || 'starter-pack';
      const sessionItem = SESSIONS_CATALOG[sessionId];
      const amountPaid = sessionOrIntent.amount_total 
        ? sessionOrIntent.amount_total / 100 
        : (sessionOrIntent.amount ? sessionOrIntent.amount / 100 : (sessionItem?.price || 200));

      const newRegistration: RegistrationRecord = {
        registrationId,
        sessionId,
        sessionName: metadata.sessionName || sessionItem?.name || 'Challengers Coaching Session',
        playerName: metadata.playerName || metadata.studentName || 'Student Athlete',
        parentName: metadata.parentName || '',
        email: metadata.email || metadata.primaryEmail || sessionOrIntent.customer_details?.email || 'customer@example.com',
        phone: metadata.phone || metadata.primaryPhone || 'N/A',
        dob: metadata.dob || '',
        location: metadata.location || sessionItem?.location || 'Fremont Arena',
        schedule: metadata.schedule || sessionItem?.schedule || 'Weekend Sessions',
        amountPaid,
        paymentStatus: 'PAID',
        stripePaymentIntentId: sessionOrIntent.payment_intent || sessionOrIntent.id,
        stripeSessionId: sessionOrIntent.id,
        emergencyContactName: metadata.emergencyContactName || '',
        emergencyContactPhone: metadata.emergencyContactPhone || '',
        waiverAccepted: metadata.waiverAccepted === 'true' || metadata.waiverAccepted === true,
        registeredAt: Date.now()
      };

      // Save to database (memory + Firestore)
      await saveRegistrationToDb(newRegistration);

      // Increment booked spots
      if (sessionItem && sessionItem.filled < sessionItem.capacity) {
        sessionItem.filled += 1;
      }

      // Update lead if linked
      if (metadata.leadId && leads[metadata.leadId]) {
        leads[metadata.leadId].status = 'confirmed';
        leads[metadata.leadId].registrationId = registrationId;
      }

      // Dispatch automated emails
      await sendAdminNotificationEmail(newRegistration);
      await sendCustomerConfirmationEmail(newRegistration);
    }

    res.json({ received: true });
  });

  // Standard JSON and urlencoded parser with 50MB limit for high-resolution photo uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
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

    const db = await getMongoDb();
    if (!db) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database connection temporarily unavailable. Please try again shortly.' });
      }
      // Fallback: dev mode without DB ONLY
      const seedEmail = (process.env.ADMIN_SEED_EMAIL || 'kenznajeeb@gmail.com').toLowerCase();
      const seedPassword = process.env.ADMIN_SEED_PASSWORD || 'admin123';
      const inputEmail = email.toLowerCase().trim();

      if ((inputEmail === seedEmail || inputEmail === 'admin@challengersvolleyball.com' || inputEmail === 'kenznajeeb@gmail.com') && (password === seedPassword || password === 'admin123')) {
        const token = generateJWT({ id: 'dev', email: inputEmail, name: 'Admin', role: 'owner' }, rememberMe);
        return res.json({ success: true, token, user: { email: inputEmail, name: 'Admin', role: 'owner' } });
      }
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const adminUser = await db.collection('admin_users').findOne({ email: email.toLowerCase() });
    if (!adminUser) {
      recordFailedAttempt(identifier);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, adminUser.password);
    if (!validPassword) {
      const { lockout, lockoutMs } = recordFailedAttempt(identifier);
      if (lockout) {
        return res.status(429).json({ success: false, lockout: true, lockoutMs, message: `Too many failed attempts. Account locked for 15 minutes.` });
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
    });

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
    if (!googleClient) return res.status(503).json({ success: false, message: 'Google Sign-In not configured on this server.' });

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) return res.status(401).json({ success: false, message: 'Google token invalid.' });

      const db = await getMongoDb();
      let adminUser: any = null;
      if (db) {
        adminUser = await db.collection('admin_users').findOne({ email: payload.email.toLowerCase() });
        if (!adminUser) {
          return res.status(403).json({ success: false, message: 'This Google account does not have admin access.' });
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
        });
      } else {
        if (process.env.NODE_ENV === 'production') {
          return res.status(503).json({ success: false, message: 'Database connection currently unavailable. Please try again shortly.' });
        }
        // Dev fallback ONLY for local offline testing
        adminUser = { _id: 'dev', email: payload.email, name: payload.name, role: 'owner' };
      }

      const token = generateJWT({
        id: adminUser._id.toString(),
        email: adminUser.email,
        name: adminUser.name || payload.name,
        role: adminUser.role,
      }, rememberMe);

      res.json({ success: true, token });
    } catch (err: any) {
      console.error('Google auth error:', err.message);
      res.status(401).json({ success: false, message: 'Google sign-in failed.' });
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
    if (!email) return res.status(400).json({ success: false, message: 'Email required.' });

    const normalizedEmail = email.toLowerCase().trim();
    const resetToken = nanoid(32);

    const db = await getMongoDb();
    if (db) {
      const adminUser = await db.collection('admin_users').findOne({ email: normalizedEmail });
      if (adminUser) {
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await db.collection('admin_users').updateOne(
          { _id: adminUser._id },
          { $set: { resetToken, resetExpiry } }
        );
        try {
          await sendPasswordResetEmail(normalizedEmail, resetToken);
        } catch (err: any) {
          console.error('Email send error:', err.message);
        }
      }
    } else {
      // Fallback dev mode without DB
      devResetTokens[resetToken] = { email: normalizedEmail, expires: Date.now() + 60 * 60 * 1000 };
      try {
        await sendPasswordResetEmail(normalizedEmail, resetToken);
      } catch (err: any) {
        console.error('Email send error:', err.message);
      }
    }
    res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
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
      const db = await getMongoDb();
      if (db) {
        const programs = await db.collection('programs')
          .find({ isActive: { $ne: false } })
          .sort({ order: 1 })
          .toArray();
        if (programs.length > 0) return res.json({ success: true, programs });
      }
      res.json({ success: true, programs: DEFAULT_PROGRAMS.filter(p => p.isActive !== false) });
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
      res.json({ success: true, message: 'Program updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ── SUMMER CAMPS API ──────────────────────────────────────────────────────
  // GET /api/camps - Public endpoint (returns active camps)
  app.get('/api/camps', async (req, res) => {
    try {
      const db = await getMongoDb();
      if (db) {
        const camps = await db.collection('camps')
          .find({ isActive: { $ne: false } })
          .sort({ order: 1 })
          .toArray();
        if (camps.length > 0) return res.json({ success: true, camps });
      }
      res.json({ success: true, camps: DEFAULT_CAMPS.filter(c => c.isActive !== false) });
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
      waiverAccepted
    } = req.body;

    let session: any = null;
    const db = await getMongoDb();
    if (db) {
      const dbProg = await db.collection('programs').findOne({ id: sessionId });
      if (dbProg) {
        session = {
          id: dbProg.id,
          name: dbProg.title,
          price: Number(dbProg.price) || 200,
          location: dbProg.location || 'Fremont Arena',
          schedule: dbProg.schedule || 'Weekend Sessions',
          capacity: Number(dbProg.capacity) || 20,
          filled: Number(dbProg.filled) || 0
        };
      } else {
        const dbCamp = await db.collection('camps').findOne({ id: sessionId });
        if (dbCamp) {
          session = {
            id: dbCamp.id,
            name: dbCamp.name,
            price: Number(dbCamp.price) || 350,
            location: dbCamp.location || 'Fremont Arena',
            schedule: dbCamp.schedule || 'Mon - Fri',
            capacity: Number(dbCamp.capacity) || 25,
            filled: Number(dbCamp.filled) || 0
          };
        }
      }
    }

    if (!session) {
      session = SESSIONS_CATALOG[sessionId] || SESSIONS_CATALOG['starter-pack'];
    }

    if (!session) {
      return res.status(400).json({ success: false, message: 'Invalid session selected' });
    }

    if (session.filled >= session.capacity) {
      return res.status(400).json({ success: false, message: 'This session is currently at full capacity.' });
    }

    const registrationId = generateRegistrationId();
    const leadId = nanoid();
    const amountInCents = Math.round(session.price * 100);

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
      location: session.location,
      schedule: session.schedule,
      emergencyContactName: emergencyContactName || '',
      emergencyContactPhone: emergencyContactPhone || '',
      waiverAccepted: String(waiverAccepted)
    };

    // Pre-save lead in memory
    leads[leadId] = {
      id: leadId,
      registrationId,
      ...metadata,
      amount: session.price,
      status: 'pending_payment',
      createdAt: Date.now()
    };

    const stripe = getStripe();

    if (!stripe) {
      // Mock clientSecret for development/testing when Stripe key is not configured
      const mockSecret = `mock_pi_${registrationId}_secret_${nanoid(8)}`;
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      return res.json({
        success: true,
        clientSecret: mockSecret,
        checkoutUrl: `${appUrl}/register?completed=true&registrationId=${registrationId}`,
        registrationId,
        leadId,
        amount: session.price,
        session
      });
    }

    // Live mode: charge the actual session price
    const chargeAmount = amountInCents; // Full session price in cents
    const chargeCurrency = 'usd';

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: chargeAmount,
        currency: chargeCurrency,
        automatic_payment_methods: { enabled: true },
        receipt_email: email,
        description: `Challengers Academy - ${session.name} - Athlete: ${playerName || 'Student'}`,
        metadata
      });

      let checkoutUrl: string | null = null;
      try {
        const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
        const checkoutSession = await stripe.checkout.sessions.create({
          line_items: [{
            price_data: {
              currency: chargeCurrency,
              product_data: {
                name: `Challengers Academy - ${session.name}`,
                description: `Athlete: ${playerName || 'Student Athlete'} | Schedule: ${session.schedule} | Location: ${session.location}`,
              },
              unit_amount: chargeAmount,
            },
            quantity: 1,
          }],
          mode: 'payment',
          customer_email: email,
          metadata,
          success_url: `${appUrl}/register?completed=true&registrationId=${registrationId}`,
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
        amount: session.price,
        session
      });
    } catch (err: any) {
      console.error('Payment intent creation failed:', err);
      res.status(500).json({ success: false, message: err.message || 'Payment initiation failed' });
    }
  });

  // Check registration status (used for real-time Stripe QR mobile payments)
  app.get('/api/registration-status/:registrationId', async (req, res) => {
    const { registrationId } = req.params;
    if (registrations[registrationId]) {
      return res.json({ success: true, confirmed: true, registration: registrations[registrationId] });
    }
    const db = await getMongoDb();
    if (db) {
      try {
        const found = await db.collection('registrations').findOne({ registrationId });
        if (found) {
          registrations[registrationId] = found as any;
          return res.json({ success: true, confirmed: true, registration: found });
        }
      } catch (e: any) {
        console.error('Registration status query error:', e.message);
      }
    }
    res.json({ success: true, confirmed: false });
  });

  // Verify and finalize payment (supports QR scanning, instant webhook fallback, and Stripe/mock confirmations)
  app.post('/api/verify-payment', async (req, res) => {
    const { paymentIntentId, registrationId, leadId, paymentMethod, transactionId, studentData } = req.body;

    // Check if webhook already confirmed this registration
    if (registrationId && registrations[registrationId]) {
      return res.json({ success: true, registration: registrations[registrationId] });
    }

    let lead = leadId ? leads[leadId] : null;
    if (!lead && leadId) {
      const db = await getMongoDb();
      if (db) {
        try {
          lead = await db.collection('leads').findOne({ id: leadId });
          if (lead) leads[leadId] = lead;
        } catch (e: any) {
          console.error('Failed to lookup lead from DB:', e.message);
        }
      }
    }

    const student = studentData || {};
    const regId = registrationId || lead?.registrationId || generateRegistrationId();
    const sessionId = lead?.sessionId || req.body.sessionId || student.sessionId || 'starter-pack';
    const session = SESSIONS_CATALOG[sessionId];

    const playerName = lead?.playerName || student.playerName || 'Student Athlete';
    const parentName = lead?.parentName || student.parentName || '';
    const email = lead?.email || student.email || 'customer@example.com';
    const phone = lead?.phone || student.phone || 'N/A';
    const dob = lead?.dob || student.dob || '';
    const emergencyContactName = lead?.emergencyContactName || student.emergencyContactName || '';
    const emergencyContactPhone = lead?.emergencyContactPhone || student.emergencyContactPhone || '';

    // 1. QR Code / Direct Instant Transfer
    if (paymentMethod === 'QR Code' || paymentMethod === 'qr') {
      const cleanTx = String(transactionId || '').trim() || `QR-${nanoid(8).toUpperCase()}`;
      const confirmedReg: RegistrationRecord = {
        registrationId: regId,
        sessionId: session?.id || 'starter-pack',
        sessionName: session?.name || 'Challengers Coaching Session',
        playerName,
        parentName,
        email,
        phone,
        dob,
        location: session?.location || 'Fremont Arena',
        schedule: session?.schedule || 'Weekend Sessions',
        amountPaid: session?.price || 200,
        paymentStatus: 'PAID',
        paymentMethod: 'QR Code',
        transactionId: cleanTx,
        stripePaymentIntentId: `qr_${cleanTx}`,
        emergencyContactName,
        emergencyContactPhone,
        waiverAccepted: true,
        registeredAt: Date.now()
      };

      await saveRegistrationToDb(confirmedReg);
      if (session && session.filled < session.capacity) {
        session.filled += 1;
      }
      if (lead) {
        lead.status = 'confirmed';
      }

      await sendAdminNotificationEmail(confirmedReg);
      await sendCustomerConfirmationEmail(confirmedReg);

      return res.json({ success: true, registration: confirmedReg });
    }

    const stripe = getStripe();

    if (!stripe || (paymentIntentId && paymentIntentId.startsWith('mock_'))) {
      // Confirmed in development / mock mode
      const confirmedReg: RegistrationRecord = {
        registrationId: regId,
        sessionId: session?.id || 'starter-pack',
        sessionName: session?.name || 'Challengers Coaching Session',
        playerName,
        parentName,
        email,
        phone,
        dob,
        location: session?.location || 'Fremont Arena',
        schedule: session?.schedule || 'Weekend Sessions',
        amountPaid: session?.price || 200,
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod || 'Card',
        transactionId: transactionId || paymentIntentId || `mock_pi_${regId}`,
        stripePaymentIntentId: paymentIntentId || `mock_pi_${regId}`,
        emergencyContactName,
        emergencyContactPhone,
        waiverAccepted: true,
        registeredAt: Date.now()
      };

      await saveRegistrationToDb(confirmedReg);
      if (session && session.filled < session.capacity) {
        session.filled += 1;
      }
      if (lead) {
        lead.status = 'confirmed';
      }

      await sendAdminNotificationEmail(confirmedReg);
      await sendCustomerConfirmationEmail(confirmedReg);

      return res.json({ success: true, registration: confirmedReg });
    }

    try {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (intent.status === 'succeeded') {
        // Idempotency check: prevent duplicate registration or seat count if already processed
        let existingReg = Object.values(registrations).find(r => r.stripePaymentIntentId === intent.id);
        if (!existingReg) {
          const db = await getMongoDb();
          if (db) {
            try {
              const doc = await db.collection('registrations').findOne({ stripePaymentIntentId: intent.id });
              if (doc) existingReg = doc as any;
            } catch (err: any) {
              console.error('MongoDB duplicate check error:', err.message);
            }
          }
        }

        if (existingReg) {
          return res.json({ success: true, registration: existingReg });
        }

        const metadata = intent.metadata || {};
        const confirmedReg: RegistrationRecord = {
          registrationId: regId,
          sessionId: metadata.sessionId || session?.id || 'starter-pack',
          sessionName: metadata.sessionName || session?.name || 'Challengers Coaching Session',
          playerName: metadata.playerName || lead?.playerName || 'Student Athlete',
          parentName: metadata.parentName || lead?.parentName || '',
          email: metadata.email || lead?.email || intent.receipt_email || 'customer@example.com',
          phone: metadata.phone || lead?.phone || 'N/A',
          dob: metadata.dob || lead?.dob || '',
          location: metadata.location || session?.location || 'Fremont Arena',
          schedule: metadata.schedule || session?.schedule || 'Weekend Sessions',
          amountPaid: intent.amount / 100,
          paymentStatus: 'PAID',
          paymentMethod: paymentMethod || 'Card',
          transactionId: transactionId || intent.id,
          stripePaymentIntentId: intent.id,
          emergencyContactName: metadata.emergencyContactName || '',
          emergencyContactPhone: metadata.emergencyContactPhone || '',
          waiverAccepted: true,
          registeredAt: Date.now()
        };

        await saveRegistrationToDb(confirmedReg);
        if (session && session.filled < session.capacity) {
          session.filled += 1;
        }

        await sendAdminNotificationEmail(confirmedReg);
        await sendCustomerConfirmationEmail(confirmedReg);

        res.json({ success: true, registration: confirmedReg });
      } else {
        res.status(400).json({ success: false, message: `Payment status: ${intent.status}` });
      }
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      res.status(500).json({ success: false, message: 'Verification error' });
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

  // Admin API (Secured with JWT)
  app.get('/api/admin/stats', requireAuth, async (req, res) => {
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
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

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

