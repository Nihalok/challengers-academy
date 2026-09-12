import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, NavLink } from 'react-router-dom';
import {
  CheckCircle2, ChevronRight, ChevronLeft, CreditCard, Shield,
  Calendar, Download, Loader2, Info, FileText,
  MapPin, Clock, Users, Lock, Sparkles, Check, AlertCircle, ArrowRight,
  Search, X, HelpCircle, ChevronDown, ChevronUp, QrCode, Smartphone, ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { domToCanvas } from 'modern-screenshot';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import SEO from './components/SEO';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with live publishable key (safely check if provided)
const stripePublishableKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Session Item Interface
export interface SessionItem {
  id: string;
  name: string;
  category: string;
  students: string;
  sessionDuration: string;
  packageCount: string;
  ageGroup: string;
  skillLevel: string;
  location: string;
  locationAddress: string;
  schedule: string;
  dates: string;
  time: string;
  price: number;
  priceNote?: string;
  capacity: number;
  filled: number;
  coach: string;
  description: string;
  features: string[];
  popular?: boolean;
}

// 7 Official Academy Training Packages
const OFFICIAL_SESSIONS: SessionItem[] = [
  {
    id: 'tryout-session',
    name: 'Tryout Session & Evaluation',
    category: 'Assessment',
    students: '1 Student / Group',
    sessionDuration: '2 Hours',
    packageCount: '1 Session',
    ageGroup: 'All Ages / Prospective Athletes',
    skillLevel: 'Placement Evaluation',
    location: 'Fremont · Manteca · Mountain House · San Jose',
    locationAddress: 'Fremont (Kerala House) · Manteca (Courtside Sports) · Mountain House (Hansen Elementary) · San Jose',
    schedule: 'Weekly Tryout Batches',
    dates: 'Upcoming Weekend Batch',
    time: '2 Hours Assessment',
    price: 30,
    priceNote: 'evaluation fee',
    capacity: 20,
    filled: 9,
    coach: 'Head Coach Wilson Mathew',
    description: 'Comprehensive court evaluation, baseline physical assessment, and coach feedback to determine ideal program placement.',
    features: ['Court Evaluation', 'Mechanics & Skill Audit', 'Roster Level Recommendation', 'No Long-Term Commitment'],
    popular: false
  },
  {
    id: 'gym-training-1hr',
    name: 'Gym Training Package',
    category: 'Gym Training',
    students: 'Group',
    sessionDuration: '1 Hour',
    packageCount: '4 Sessions',
    ageGroup: 'All Ages / Group',
    skillLevel: 'Beginner to Advanced',
    location: 'Fremont · Manteca · Mountain House · San Jose',
    locationAddress: 'Fremont (Kerala House) · Manteca (Courtside Sports) · Mountain House (Hansen Elementary) · San Jose',
    schedule: 'Weekly Batches',
    dates: 'Starting Next Weekend',
    time: '1 Hour per Session',
    price: 100,
    priceNote: 'package fee',
    capacity: 25,
    filled: 10,
    coach: 'Head Coach Wilson Mathew & Coaching Team',
    description: 'Indoor gym training — 4 focused 1-hour sessions covering volleyball mechanics, passing precision, and drills.',
    features: ['Indoor Gym Facility', 'Coach Mentorship', 'Drills & Rotations', 'Skill Progression'],
    popular: false
  },
  {
    id: 'gym-training-4',
    name: 'Gym Training Package',
    category: 'Gym Training',
    students: 'Group',
    sessionDuration: '2 Hours',
    packageCount: '4 Sessions',
    ageGroup: 'All Ages / Group',
    skillLevel: 'Beginner to Advanced',
    location: 'Fremont · Manteca · Mountain House · San Jose',
    locationAddress: 'Fremont (Kerala House) · Manteca (Courtside Sports) · Mountain House (Hansen Elementary) · San Jose',
    schedule: 'Weekly Batches',
    dates: 'Starting Next Weekend',
    time: '2 Hours per Session',
    price: 200,
    priceNote: 'package fee',
    capacity: 25,
    filled: 14,
    coach: 'Head Coach Wilson Mathew & Coaching Team',
    description: 'Indoor gym training sessions covering volleyball mechanics, passing precision, agility, and scrimmages.',
    features: ['Indoor Gym Facility', 'Rotations & Tactics', 'Coach Mentorship', 'Skill Progression'],
    popular: false
  },
  {
    id: 'gym-training-12',
    name: 'Gym Training Package (Best Value)',
    category: 'Gym Training',
    students: 'Group',
    sessionDuration: '2 Hours',
    packageCount: '12 Sessions',
    ageGroup: 'All Ages / Group',
    skillLevel: 'All Skill Levels (Best Value)',
    location: 'Fremont · Manteca · Mountain House · San Jose',
    locationAddress: 'Fremont (Kerala House) · Manteca (Courtside Sports) · Mountain House (Hansen Elementary) · San Jose',
    schedule: '3 Days / Week Batches',
    dates: 'Rolling Monthly Batches',
    time: '2 Hours per Session',
    price: 550,
    priceNote: 'package fee (Save $50)',
    capacity: 25,
    filled: 18,
    coach: 'Head Coach Wilson Mathew & Senior Staff',
    description: 'Comprehensive 12-session indoor gym training for full athlete progression.',
    features: ['Best Value Package', 'Position Specialization', 'School & Club Tryout Prep', 'Full Athlete Progression'],
    popular: true
  },
  {
    id: 'open-park-group',
    name: 'Open Park – Group Training',
    category: 'Open Park Group',
    students: 'Group Training',
    sessionDuration: '2 Hours',
    packageCount: '4 Sessions',
    ageGroup: 'All Youth & Juniors',
    skillLevel: 'Fundamental & Repetitive Drills',
    location: 'Open Park Facilities',
    locationAddress: 'Outdoor Open Park Courts',
    schedule: 'Saturday & Sunday Mornings',
    dates: 'Starting Next Weekend',
    time: '2 Hours per Session',
    price: 150,
    priceNote: 'per student',
    capacity: 12,
    filled: 9,
    coach: 'Head Coach Wilson Mathew & Assistants',
    description: 'High-repetition group training sessions in open park atmosphere building stamina and ball control.',
    features: ['Outdoor Open Air Training', 'High-Rep Passing & Defense', 'Economical Group Rate', 'Stamina & Ball Control'],
    popular: false
  },
  {
    id: 'open-park-travel',
    name: 'Private Coaching – Open Park (Short Distance)',
    category: 'Private Coaching',
    students: '1 Student',
    sessionDuration: '1 Hour',
    packageCount: '4 Sessions',
    ageGroup: '1 Student Dedicated',
    skillLevel: 'Convenient Travel Coaching',
    location: 'Short Distance',
    locationAddress: 'Coach travels to your preferred nearby location',
    schedule: 'Flexible Weekend / Weekday Times',
    dates: 'Book on Demand',
    time: '1 Hour per Session',
    price: 320,
    priceNote: 'package fee',
    capacity: 10,
    filled: 4,
    coach: 'Certified Academy Coach',
    description: 'Personalized private sessions with coach traveling to a convenient nearby park facility.',
    features: ['4 x 1-Hour Sessions', 'Nearby Park Location', 'Skill Acceleration', 'Personalized Coaching'],
    popular: false
  },
  {
    id: 'open-park-private',
    name: 'Private Coaching – Open Park (Long Distance)',
    category: 'Private Coaching',
    students: '1 Student',
    sessionDuration: '1 Hour',
    packageCount: '4 Sessions',
    ageGroup: '1 Student Dedicated',
    skillLevel: 'Personalized Progression',
    location: 'Long Distance',
    locationAddress: 'Coach travels to your preferred location',
    schedule: 'Flexible Scheduling',
    dates: 'Book on Demand',
    time: '1 Hour per Session',
    price: 360,
    priceNote: 'package fee',
    capacity: 10,
    filled: 6,
    coach: 'Dedicated Master Coach',
    description: 'One-on-one private coaching sessions at your preferred open park. Long distance travel included.',
    features: ['4 x 1-Hour Sessions', '100% Focused 1-on-1', 'Long Distance Travel Included', 'Personal Mechanics Coaching'],
    popular: false
  },
  {
    id: 'summer-camp-7day',
    name: '7-Day Intensive Summer Clinic',
    category: 'Summer Camp',
    students: 'Youth & Junior',
    sessionDuration: '4 Hours Daily',
    packageCount: '7 Days',
    ageGroup: 'Youth & Junior',
    skillLevel: 'Technique Refinement',
    location: 'Fremont Arena / Regional Facility',
    locationAddress: 'Bay Area Training Facility',
    schedule: 'Mon - Fri (9:00 AM - 1:00 PM)',
    dates: 'June & July 2026',
    time: '9:00 AM - 1:00 PM',
    price: 350,
    priceNote: 'clinic fee',
    capacity: 25,
    filled: 14,
    coach: 'Wilson Mathew & Coaching Staff',
    description: 'Comprehensive 7-day clinic focused on rapid skill acceleration, positional mastery, and match play.',
    features: ['7 Days Intensive Training', 'Technique Refinement', 'Match Play Scrimmages', 'Professional Mentorship'],
    popular: false
  },
  {
    id: 'summer-camp-10day',
    name: '10-Day Elite Summer Intensive',
    category: 'Summer Camp',
    students: 'Youth & Junior',
    sessionDuration: '4 Hours Daily',
    packageCount: '10 Days',
    ageGroup: 'Youth & Junior',
    skillLevel: 'Game Strategy & Tactics',
    location: 'Fremont Arena / Regional Facility',
    locationAddress: 'Bay Area Training Facility',
    schedule: 'Mon - Fri (9:00 AM - 1:00 PM)',
    dates: 'June & July 2026',
    time: '9:00 AM - 1:00 PM',
    price: 480,
    priceNote: 'intensive fee',
    capacity: 25,
    filled: 18,
    coach: 'Wilson Mathew & Senior Staff',
    description: 'Position-specific mastery, advanced rotational systems, high-rep scrimmage sets, and agility conditioning.',
    features: ['10 Days Elite Bootcamp', 'Rotational Tactics (5-1)', 'Block & Defense Timing', 'Conditioning & Scrimmages'],
    popular: true
  },
  {
    id: 'summer-camp-15day',
    name: '15-Day Masterclass Camp',
    category: 'Summer Camp',
    students: 'Youth & Junior',
    sessionDuration: '4 Hours Daily',
    packageCount: '15 Days',
    ageGroup: 'Youth & Junior',
    skillLevel: 'Competitive Club & High School Prep',
    location: 'Fremont Arena / Regional Facility',
    locationAddress: 'Bay Area Training Facility',
    schedule: 'Mon - Fri (9:00 AM - 1:00 PM)',
    dates: 'June & July 2026',
    time: '9:00 AM - 1:00 PM',
    price: 650,
    priceNote: 'masterclass fee',
    capacity: 25,
    filled: 19,
    coach: 'Wilson Mathew & Master Staff',
    description: 'Full biomechanical breakdown, video analysis, college recruitment guidance, and high-speed match play.',
    features: ['15 Days Full Masterclass', 'Biomechanical & Video Review', 'High-Speed Match Play', 'Tournament Showcase'],
    popular: false
  }
];

export default function Register() {
  const [searchParams] = useSearchParams();
  const confirmationRef = useRef<HTMLDivElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Available sessions
  const [sessions, setSessions] = useState<SessionItem[]>(OFFICIAL_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('gym-training-4');

  // Modal Pop-up State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 3-Step Wizard inside Modal (1: Registration & Waiver, 2: Payment, 3: Confirmation)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Search and Filter State for catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Form State
  const [formData, setFormData] = useState({
    playerName: '',
    parentName: '',
    email: '',
    phone: '',
    dob: '',
    preferredLocation: 'Fremont (Kerala House)',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalNotes: '',
    waiverAccepted: false,
    hasSibling: false,
    siblingName: '',
    siblingDob: '',
    siblingGender: 'Co-ed',
    siblingMedicalNotes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showWaiverDetails, setShowWaiverDetails] = useState(false);

  // Payment & Confirmation State
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [registrationRecord, setRegistrationRecord] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Stripe Payment State
  const [paymentOption, setPaymentOption] = useState<'card' | 'qr'>('card');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [stripeCheckoutUrl, setStripeCheckoutUrl] = useState<string | null>(null);
  const [activeRegistrationId, setActiveRegistrationId] = useState<string | null>(null);

  // Check if returning from a mobile Stripe checkout redirect or 3D Secure authentication
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const completed = params.get('completed');
    const redirectStatus = params.get('redirect_status');
    const paymentIntentId = params.get('payment_intent');
    const regId = params.get('registrationId') || params.get('regId');
    const lId = params.get('leadId');

    if (completed === 'true' || redirectStatus === 'succeeded' || paymentIntentId) {
      // Clear URL params immediately so subsequent interactions/reloads are completely clean
      window.history.replaceState({}, document.title, window.location.pathname);

      const verifyPayload: any = {
        paymentMethod: 'Card',
        paymentIntentId: paymentIntentId || undefined,
        registrationId: regId || undefined,
        leadId: lId || undefined
      };

      fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyPayload)
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.registration) {
            setRegistrationRecord(data.registration);
            setCurrentStep(3);
            setIsModalOpen(true);
            modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            confetti({
              particleCount: 140,
              spread: 90,
              origin: { y: 0.55 },
              colors: ['#D62828', '#F9BC00', '#071A2D', '#22C55E']
            });
          } else if (regId) {
            // Secondary status fallback
            fetch(`/api/registration-status/${regId}`)
              .then(r => r.json())
              .then(sData => {
                if (sData.success && sData.registration) {
                  setRegistrationRecord(sData.registration);
                  setCurrentStep(3);
                  setIsModalOpen(true);
                  modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              })
              .catch(console.error);
          }
        })
        .catch(err => {
          console.error('Redirect payment verification error:', err);
        });
    }
  }, []);



  // Fetch session catalog on mount and merge with official packages
  useEffect(() => {
    fetch('/api/sessions')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.sessions) && data.sessions.length > 0) {
          const campSessions: SessionItem[] = [];
          const otherServerSessions: SessionItem[] = [];

          // Augment or add from database — split camps vs others
          data.sessions.filter((s: any) => s.id !== 'large-group-training').forEach((s: any) => {
            const isCamp = (s.category || '').toLowerCase().includes('summer') ||
                           (s.id || '').toLowerCase().includes('summer-camp') ||
                           (s.id || '').toLowerCase().includes('camp');
            const isPrivate = s.category?.includes('Private') || s.id?.includes('private') || s.id?.includes('travel');
            const sessionItem: SessionItem = {
              id: s.id,
              name: s.name,
              category: s.category || 'Coaching Program',
              students: isPrivate ? '1 Student' : 'Group',
              sessionDuration: s.duration || (isPrivate || s.id?.includes('1hr') ? '1 Hour' : '2 Hours'),
              packageCount: 'Coaching Package',
              ageGroup: s.ageGroup || 'All Ages',
              skillLevel: s.skillLevel || s.bestFor || 'All Levels',
              location: s.location || 'Fremont Arena',
              locationAddress: s.locationAddress || 'Bay Area Facility',
              schedule: s.schedule || 'Scheduled Sessions',
              dates: s.months || s.dates || 'Rolling Enrollment',
              time: s.time || (isPrivate || s.id?.includes('1hr') ? '1 Hour per Session' : '2 Hours per Session'),
              price: Number(s.price) || 200,
              priceNote: 'package fee',
              capacity: Number(s.capacity) || 25,
              filled: Number(s.filled) || 0,
              coach: s.coach || 'Head Coach Wilson Mathew & Coaches',
              description: s.description || 'Comprehensive academy volleyball coaching.',
              features: ['Professional Mentorship', 'Court Drills', 'Tactics', 'Technique Review'],
              popular: false
            };
            if (isCamp) {
              campSessions.push(sessionItem);
            } else if (!OFFICIAL_SESSIONS.find(o => o.id === s.id) && !s.id.toLowerCase().includes('duplicate') && s.id !== 'large-group-training') {
              otherServerSessions.push(sessionItem);
            }
          });

          // Separate non-camps and summer camps from official list
          const baseNonCamps = OFFICIAL_SESSIONS.filter(s => !s.id.includes('camp') && !s.category.toLowerCase().includes('camp'));
          const baseCamps = OFFICIAL_SESSIONS.filter(s => s.id.includes('camp') || s.category.toLowerCase().includes('camp'));

          const finalCamps = [...baseCamps];
          campSessions.forEach(cs => {
            const idx = finalCamps.findIndex(f => f.id === cs.id);
            if (idx !== -1) finalCamps[idx] = cs;
            else finalCamps.push(cs);
          });

          // Order: Regular Packages first → other custom server sessions → Summer Camps at the bottom
          setSessions([...baseNonCamps, ...otherServerSessions, ...finalCamps]);
        }
      })
      .catch(() => {
        // Fallback already initialized with OFFICIAL_SESSIONS (with camps at bottom)
      });
  }, []);

  // Prevent background scrolling and pause Lenis smooth scroll when pop-up modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      (window as any).__lenis?.stop();
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      (window as any).__lenis?.start();
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      (window as any).__lenis?.start();
    };
  }, [isModalOpen]);

  // Preselect from URL query param (e.g. ?session=gym-training-12 or ?program=tryout-session)
  useEffect(() => {
    const progParam = searchParams.get('program') || searchParams.get('session');
    if (progParam) {
      const match = sessions.find(s => 
        s.id.toLowerCase().includes(progParam.toLowerCase()) || 
        s.name.toLowerCase().includes(progParam.toLowerCase())
      );
      if (match) {
        setSelectedSessionId(match.id);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, sessions]);

  // Filtered Sessions for catalog
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory === 'gym') return s.category.includes('Gym') || s.id.includes('gym');
    if (activeCategory === 'park') return s.category.includes('Park') || s.id.includes('park');
    if (activeCategory === 'private') return s.category.includes('Private') || s.id.includes('private') || s.id.includes('travel');
    if (activeCategory === 'tryout') return s.id.includes('tryout') || s.category.includes('Assessment');
    if (activeCategory === 'camp') return s.category.toLowerCase().includes('camp') || s.id.includes('camp') || s.name.toLowerCase().includes('camp') || s.name.toLowerCase().includes('clinic');
    return true;
  });

  const selectedSession = sessions.find(s => s.id === selectedSessionId) || sessions[0] || OFFICIAL_SESSIONS[0];
  const spotsLeft = Math.max(0, selectedSession.capacity - selectedSession.filled);

  // Generate dynamic Stripe QR Code data URL when checkout URL is available
  useEffect(() => {
    if (stripeCheckoutUrl) {
      QRCode.toDataURL(stripeCheckoutUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#071A2D',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error('Error generating Stripe QR code:', err);
      });
    }
  }, [stripeCheckoutUrl]);

  // Real-time auto-detection for Stripe mobile QR payments
  useEffect(() => {
    if (currentStep !== 2 || !activeRegistrationId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/registration-status/${activeRegistrationId}`);
        const data = await res.json();
        if (data.success && data.confirmed && data.registration) {
          clearInterval(interval);
          setRegistrationRecord(data.registration);
          setCurrentStep(3);
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#D62828', '#F9BC00', '#071A2D', '#22C55E']
          });
        }
      } catch (err) {
        // Silent poll error
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [currentStep, activeRegistrationId]);

  // Calculate athlete age from DOB
  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const athleteAge = calculateAge(formData.dob);
  const siblingAge = calculateAge(formData.siblingDob);
  const isMinor = (athleteAge !== null && athleteAge < 18) || (formData.hasSibling && siblingAge !== null && siblingAge < 18);

  // Pricing calculations
  const singlePrice = selectedSession.price;
  const isSiblingSelected = formData.hasSibling;
  const siblingDiscount = isSiblingSelected ? 50 : 0;
  const totalRegistrationFee = isSiblingSelected ? Math.max(0, (singlePrice * 2) - siblingDiscount) : singlePrice;

  // DOB date constraints (Min age: 5 years, Max age: 35 years)
  const todayObj = new Date();
  const maxDobString = new Date(todayObj.getFullYear() - 5, todayObj.getMonth(), todayObj.getDate()).toISOString().split('T')[0];
  const minDobString = new Date(todayObj.getFullYear() - 35, todayObj.getMonth(), todayObj.getDate()).toISOString().split('T')[0];

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleInputChange = (field: string, value: any) => {
    let finalValue = value;
    if (field === 'phone' || field === 'emergencyContactPhone') {
      finalValue = formatPhoneNumber(value);
    } else if (field === 'email') {
      // Disallow commas, semicolons, and spaces directly as typed
      finalValue = value.replace(/[\s,;]+/g, '').toLowerCase();
    } else if (field === 'emergencyContactName' || field === 'playerName' || field === 'parentName' || field === 'siblingName') {
      // Disallow numeric digits in name fields
      finalValue = value.replace(/[0-9]/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: finalValue }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSelectPackage = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};

    // 1. Athlete Full Name
    const trimmedPlayerName = formData.playerName.trim();
    if (!trimmedPlayerName) {
      errors.playerName = 'Athlete full name is required.';
    } else if (/\d/.test(trimmedPlayerName) || !/^[a-zA-Z\s''-]{2,}$/.test(trimmedPlayerName)) {
      errors.playerName = 'Please enter a valid name using letters only.';
    } else if (trimmedPlayerName.split(/\s+/).length < 2) {
      errors.playerName = 'Please provide both first and last name.';
    }

    // 2. Single Email Address
    const trimmedEmail = formData.email.trim();
    const singleEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail) {
      errors.email = 'Email address is required for registration confirmation.';
    } else if (trimmedEmail.includes(',') || trimmedEmail.includes(';') || (trimmedEmail.match(/@/g) || []).length !== 1) {
      errors.email = 'Multiple email addresses are not permitted. Please provide one email.';
    } else if (!singleEmailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    // 3. Primary Phone Number (10 digits, area code cannot start with 0 or 1)
    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (digitsOnly.length !== 10) {
      errors.phone = 'Please enter a complete 10-digit phone number.';
    } else if (digitsOnly[0] === '0' || digitsOnly[0] === '1') {
      errors.phone = 'Invalid phone number: area code cannot start with 0 or 1.';
    } else if (digitsOnly[3] === '0' || digitsOnly[3] === '1') {
      errors.phone = 'Invalid phone number: exchange code cannot start with 0 or 1.';
    }

    // 4. Date of Birth Validation (strictly prohibits children born this year or under 5)
    if (!formData.dob) {
      errors.dob = 'Athlete date of birth is required.';
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      const birthYear = dobDate.getFullYear();
      const currentYear = today.getFullYear();
      const age = calculateAge(formData.dob);

      if (isNaN(dobDate.getTime()) || dobDate >= today) {
        errors.dob = 'Invalid date of birth. Future dates are not permitted.';
      } else if (birthYear >= currentYear || (age !== null && age < 5)) {
        errors.dob = 'Athletes must be at least 5 years old. Children born this year cannot be enrolled.';
      } else if (age !== null && age > 35) {
        errors.dob = 'Athlete age exceeds academy program maximum limit (35 years).';
      }
    }

    // 5. Sibling Validation (if sibling enrollment is enabled)
    if (formData.hasSibling) {
      const trimmedSibling = (formData.siblingName || '').trim();
      if (!trimmedSibling) {
        errors.siblingName = 'Sibling athlete full name is required.';
      } else if (/\d/.test(trimmedSibling) || !/^[a-zA-Z\s''-]{2,}$/.test(trimmedSibling)) {
        errors.siblingName = 'Please enter a valid sibling name using letters only.';
      } else if (trimmedSibling.split(/\s+/).length < 2) {
        errors.siblingName = 'Please provide both first and last name for sibling.';
      } else if (trimmedSibling.toLowerCase() === trimmedPlayerName.toLowerCase()) {
        errors.siblingName = 'Sibling name cannot be identical to primary athlete name.';
      }

      if (!formData.siblingDob) {
        errors.siblingDob = 'Sibling date of birth is required.';
      } else {
        const sibDobDate = new Date(formData.siblingDob);
        const today = new Date();
        const birthYear = sibDobDate.getFullYear();
        const currentYear = today.getFullYear();
        const sAge = calculateAge(formData.siblingDob);

        if (isNaN(sibDobDate.getTime()) || sibDobDate >= today) {
          errors.siblingDob = 'Invalid date of birth for sibling.';
        } else if (birthYear >= currentYear || (sAge !== null && sAge < 5)) {
          errors.siblingDob = 'Sibling must be at least 5 years old to enroll.';
        } else if (sAge !== null && sAge > 35) {
          errors.siblingDob = 'Sibling age exceeds academy maximum limit (35 years).';
        }
      }
    }

    // 6. Parent / Guardian Name (strictly required if either athlete is under 18)
    const trimmedParent = formData.parentName.trim();
    if (isMinor) {
      if (!trimmedParent) {
        errors.parentName = 'Parent / Guardian name is required for athletes under 18.';
      } else if (/\d/.test(trimmedParent)) {
        errors.parentName = 'Parent/guardian name cannot contain numbers.';
      } else if (trimmedParent.split(/\s+/).length < 2) {
        errors.parentName = 'Please enter parent/guardian first and last name.';
      }
    }

    // 7. Emergency Contact Person & Phone
    const trimmedEmergencyName = formData.emergencyContactName.trim();
    if (!trimmedEmergencyName) {
      errors.emergencyContactName = 'Emergency contact person is required.';
    } else if (/\d/.test(trimmedEmergencyName)) {
      errors.emergencyContactName = 'Emergency contact person must be a person\'s name (letters only), not numbers.';
    } else if (trimmedEmergencyName.replace(/[^a-zA-Z]/g, '').length < 2) {
      errors.emergencyContactName = 'Please enter a valid emergency contact name (e.g. Sarah Miller).';
    }

    const emergencyDigits = formData.emergencyContactPhone.replace(/\D/g, '');
    if (!formData.emergencyContactPhone.trim()) {
      errors.emergencyContactPhone = 'Emergency contact phone number is required.';
    } else if (emergencyDigits.length !== 10) {
      errors.emergencyContactPhone = 'Please enter a complete 10-digit emergency phone number.';
    } else if (emergencyDigits[0] === '0' || emergencyDigits[0] === '1') {
      errors.emergencyContactPhone = 'Invalid emergency phone: area code cannot start with 0 or 1.';
    } else if (emergencyDigits === digitsOnly) {
      errors.emergencyContactPhone = 'Emergency phone should be different from primary contact phone.';
    }

    // 8. Safety Waiver Acceptance
    if (!formData.waiverAccepted) {
      errors.waiverAccepted = 'You must read and accept the Safety & Liability Waiver to proceed.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          price: selectedSession.price,
          location: formData.preferredLocation,
          preferredLocation: formData.preferredLocation,
          ...formData
        })
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = { success: false, message: `Server error (${res.status}). Please try Instant Mobile QR or Manual payment.` };
      }

      if (data && data.success) {
        setClientSecret(data.clientSecret);
        setLeadId(data.leadId);
        setStripeCheckoutUrl(data.checkoutUrl || null);
        setActiveRegistrationId(data.registrationId || null);
        setCurrentStep(2);
      } else {
        alert(data?.message || 'Unable to initialize payment checkout. Please try again or use Instant Mobile QR.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error initializing payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };


  const handleDownloadReceipt = async () => {
    if (!confirmationRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const canvas = await domToCanvas(confirmationRef.current, { scale: 2, backgroundColor: '#FFFFFF' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const props = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (props.height * pdfWidth) / props.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Challengers_Registration_${registrationRecord?.registrationId || 'Receipt'}.pdf`);
    } catch (e) {
      console.error('PDF generation error:', e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] font-sans pt-28 sm:pt-32 md:pt-36 pb-24 text-slate-900">
      <SEO
        title="Enroll Now - Academy Programs & Training"
        description="Official enrollment portal for Challengers Volleyball Academy. Select coaching programs, accept waivers, and complete registration with instant confirmation."
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

        {/* ── Page Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 mb-3 px-3.5 py-1 rounded-full bg-[#D62828]/10 text-[#D62828] text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Enrollment Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-slate-900 leading-tight font-black">
            Enroll in Training &amp; <span className="text-[#D62828] italic">Programs.</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
            Choose your coaching program below. Selecting any package opens your enrollment registration and checkout instantly.
          </p>
        </div>

        {/* ── Non-Refundable Policy Alert Banner ── */}
        <div className="mb-8 max-w-4xl mx-auto bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xs text-amber-900 leading-relaxed font-medium">
            <span className="font-bold uppercase tracking-wider text-[11px] block text-amber-800 mb-1">
              ⚠️ IMPORTANT ENROLLMENT POLICY:
            </span>
            All coaching program fees and registrations are <strong className="bg-red-600 text-white px-2 py-0.5 rounded-md font-bold shadow-sm inline-block mx-1">non-refundable</strong> once enrolled to guarantee court bookings, equipment reservations, and master coach allocations.
          </div>
        </div>

        {/* ── COURSE CATALOG SECTION ── */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[#D62828] text-[10px] font-black uppercase tracking-widest block">Available Offerings</span>
              <h2 className="text-xl sm:text-2xl font-condensed font-black uppercase text-slate-900 mt-0.5">
                Search &amp; Select Coaching Program
              </h2>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">Click any package to register &amp; reserve your spot</p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px] sm:min-w-[320px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Gym, Private, Park, Tryout..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-900 font-medium outline-none focus:border-[#D62828] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
            {[
              { id: 'all', label: `All Packages (${sessions.length})` },
              { id: 'gym', label: 'Gym Training ($200 - $550)' },
              { id: 'park', label: 'Open Park Groups ($150)' },
              { id: 'private', label: 'Private 1-on-1 ($320 - $360)' },
              { id: 'tryout', label: 'Tryout Session ($30)' },
              { id: 'camp', label: 'Summer Camps ($350 - $650)' },
            ].map(tab => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all shadow-sm ${
                    isActive
                      ? 'bg-[#D62828] text-white ring-2 ring-[#D62828]/20 scale-[1.02]'
                      : 'bg-white text-slate-700 hover:text-slate-950 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSessions.map((session) => {
              const isSelected = selectedSessionId === session.id;
              
              // Helper to get custom background theme & image per package type
              const getTheme = (id: string, category: string) => {
                if (id.includes('tryout') || category.includes('Assessment')) {
                  return {
                    bgClass: 'bg-white border-espresso/15',
                    badgeClass: 'bg-[#F3722C] text-white font-black',
                    bgImage: '/vb_tryout.jpg',
                    btnBg: '#F3722C',
                    btnShadow: '#A84308',
                    btnTextColor: '#FFFFFF',
                    btnIconClass: 'bg-white/20 text-white group-hover/btn:bg-white group-hover/btn:text-[#F3722C]'
                  };
                }
                if (id.includes('gym-training-12')) {
                  return {
                    bgClass: 'bg-white border-espresso/15',
                    badgeClass: 'bg-[#D62828] text-white font-black',
                    bgImage: '/vb_intensive.jpg',
                    btnBg: '#D62828',
                    btnShadow: '#851010',
                    btnTextColor: '#FFFFFF',
                    btnIconClass: 'bg-white/20 text-white group-hover/btn:bg-white group-hover/btn:text-[#D62828]'
                  };
                }
                if (id.includes('gym-training') || category.includes('Gym Training')) {
                  return {
                    bgClass: 'bg-white border-espresso/15',
                    badgeClass: 'bg-[#D62828] text-white font-black',
                    bgImage: '/vb_gym.jpg',
                    btnBg: '#D62828',
                    btnShadow: '#851010',
                    btnTextColor: '#FFFFFF',
                    btnIconClass: 'bg-white/20 text-white group-hover/btn:bg-white group-hover/btn:text-[#D62828]'
                  };
                }
                if (id.includes('park-group') || category.includes('Park')) {
                  return {
                    bgClass: 'bg-white border-espresso/15',
                    badgeClass: 'bg-[#0B5D51] text-white font-black',
                    bgImage: '/vb_park.jpg',
                    btnBg: '#0B5D51',
                    btnShadow: '#063A32',
                    btnTextColor: '#FFFFFF',
                    btnIconClass: 'bg-white/20 text-white group-hover/btn:bg-white group-hover/btn:text-[#0B5D51]'
                  };
                }
                if (id.includes('private') || id.includes('travel') || category.includes('Private') || category.includes('Travel')) {
                  return {
                    bgClass: 'bg-white border-espresso/15',
                    badgeClass: 'bg-[#F9BC00] text-espresso font-black',
                    bgImage: '/vb_private.jpg',
                    btnBg: '#F9BC00',
                    btnShadow: '#B88500',
                    btnTextColor: '#1B1B1D',
                    btnIconClass: 'bg-espresso/15 text-espresso group-hover/btn:bg-espresso group-hover/btn:text-white'
                  };
                }
                if (id.includes('large-group') || category.includes('Large Group')) {
                  return {
                    bgClass: 'bg-white border-espresso/15',
                    badgeClass: 'bg-blue-600 text-white font-black',
                    bgImage: '/vb_gym.jpg',
                    btnBg: '#D62828',
                    btnShadow: '#851010',
                    btnTextColor: '#FFFFFF',
                    btnIconClass: 'bg-white/20 text-white group-hover/btn:bg-white group-hover/btn:text-[#D62828]'
                  };
                }
                // Fallback / Camp theme
                return {
                  bgClass: 'bg-white border-espresso/15',
                  badgeClass: 'bg-[#D62828] text-white font-black',
                  bgImage: '/vb_intensive.jpg',
                  btnBg: '#D62828',
                  btnShadow: '#851010',
                  btnTextColor: '#FFFFFF',
                  btnIconClass: 'bg-white/20 text-white group-hover/btn:bg-white group-hover/btn:text-[#D62828]'
                };
              };

              const theme = getTheme(session.id, session.category);

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectPackage(session.id)}
                  className={`group text-left p-6 rounded-[1.8rem] border transition-all duration-500 relative flex flex-col justify-between cursor-pointer overflow-hidden hover:shadow-2xl hover:border-espresso/30 hover:-translate-y-1.5 ${theme.bgClass} ${
                    isSelected ? 'ring-4 ring-[#D62828]/30 scale-[1.02] shadow-xl' : 'shadow-lg'
                  }`}
                >
                  {/* Background Image Overlay — same as Programs page */}
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <img
                      src={theme.bgImage}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover opacity-40 group-hover:opacity-65 scale-105 group-hover:scale-110 transition-all duration-700 filter brightness-105 contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-white/30" />
                  </div>

                  {session.popular && (
                    <div className="absolute -top-3 right-4 bg-[#D62828] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md z-20">
                      BEST VALUE
                    </div>
                  )}

                  <div className="relative z-10">
                    {/* Top Row: Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-espresso text-white shrink-0">
                        PKG
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${theme.badgeClass}`}>
                        {session.category}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-condensed font-black tracking-tighter text-espresso">
                        ${session.price}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-espresso/60">
                        / {session.priceNote || 'package'}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="font-condensed font-black text-xl uppercase tracking-tight text-espresso mb-1 leading-tight group-hover:text-[#D62828] transition-colors">
                      {session.name}
                    </h3>
                    <div className="text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-3">
                      {session.ageGroup}
                    </div>

                    {/* Feature List */}
                    <ul className="space-y-2 mb-4">
                      {[session.sessionDuration, session.packageCount, session.students, 'Certified Coaches'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs font-bold text-espresso/85">
                          <div className="w-1.5 h-1.5 rounded-full bg-espresso/40 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Enroll Button — 3D Minimal style */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPackage(session.id);
                    }}
                    style={{
                      '--btn-bg': theme.btnBg,
                      '--btn-shadow': theme.btnShadow,
                      '--btn-text': theme.btnTextColor
                    } as React.CSSProperties}
                    className="btn-3d relative z-10 flex items-center justify-between w-full px-6 py-3.5 rounded-xl font-black uppercase tracking-[0.16em] text-[10px] group/btn cursor-pointer"
                  >
                    <span>ENROLL NOW</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${theme.btnIconClass}`}>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 text-sm font-medium">No coaching packages found matching "{searchQuery}".</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-3 text-xs text-[#D62828] font-bold underline"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          POP-UP MODAL OVERLAY FOR REGISTRATION, WAIVER & CHECKOUT FLOW
          Rendered with z-[100] to overlay cleanly above the sticky navigation bar
      ══════════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div 
            data-lenis-prevent="true"
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8 overscroll-none"
            onClick={(e) => {
              // Prevent accidental backdrop dismissal during active registration (Steps 1 & 2)
              if (e.target === e.currentTarget && currentStep === 3) {
                setIsModalOpen(false);
              }
            }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <motion.div
              data-lenis-prevent="true"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[88vh] max-h-[88vh] overflow-hidden overscroll-contain my-auto"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Modal Header & Progress Indicator */}
              <div className="bg-[#071A2D] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-black uppercase tracking-wider">
                  <span className={`px-3 py-1 rounded-lg ${currentStep === 1 ? 'bg-[#D62828] text-white' : 'text-slate-400'}`}>
                    1. Athlete &amp; Waiver
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className={`px-3 py-1 rounded-lg ${currentStep === 2 ? 'bg-[#D62828] text-white' : 'text-slate-400'}`}>
                    2. Payment
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className={`px-3 py-1 rounded-lg ${currentStep === 3 ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
                    3. Confirmation
                  </span>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  title="Close popup"
                  aria-label="Close popup"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div 
                ref={modalBodyRef}
                data-lenis-prevent="true"
                className="overflow-y-auto overscroll-contain p-5 sm:p-8 space-y-6 flex-1"
                onWheel={(e) => e.stopPropagation()}
              >

                {/* ── STEP 1: STUDENT REGISTRATION & SAFETY WAIVER ── */}
                {currentStep === 1 && (
                  <div>
                    {/* Selected Program Summary Banner */}
                    <div className="bg-[#071A2D] text-white rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black tracking-widest uppercase text-[#F9BC00] bg-white/10 px-2 py-0.5 rounded">
                            Selected Program
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            ● {spotsLeft} spots remaining
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
                          {selectedSession.name}
                        </h3>
                        <p className="text-xs text-white/70 mt-0.5">
                          {selectedSession.sessionDuration} · {selectedSession.packageCount} · {selectedSession.students} Format · Coach: {selectedSession.coach}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10 relative z-10 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-2xl sm:text-3xl font-serif font-black text-[#F9BC00]">
                            ${selectedSession.price}
                          </span>
                          <span className="text-[10px] text-white/60 block uppercase font-bold">
                            {selectedSession.priceNote || 'package fee'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="text-[11px] text-[#F9BC00] hover:underline font-bold mt-1"
                        >
                          Change Program
                        </button>
                      </div>
                    </div>

                    {/* Non-refundable Reminder */}
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-xs mb-6 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Non-Refundable Policy:</strong> Program fee of <strong>${selectedSession.price}</strong> is final and non-refundable upon submission.
                      </div>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleContinueToPayment} className="space-y-6">
                      <div className="border-b border-slate-200 pb-2">
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">
                          Athlete &amp; Contact Details
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">Please enter accurate details for academy rosters and emergency protocols.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Player Full Name */}
                        <div data-error={!!formErrors.playerName}>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Athlete / Student Full Name <span className="text-[#D62828]">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.playerName}
                            onChange={(e) => handleInputChange('playerName', e.target.value)}
                            placeholder="e.g. Jordan Miller"
                            className={`w-full bg-[#F8FAFC] border rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-all ${
                              formErrors.playerName ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-[#D62828] focus:bg-white'
                            }`}
                          />
                          {formErrors.playerName && (
                            <span className="text-[10px] text-red-600 font-bold block mt-1">{formErrors.playerName}</span>
                          )}
                        </div>

                        {/* Parent / Guardian Name */}
                        <div data-error={!!formErrors.parentName}>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Parent / Guardian Name {isMinor ? <span className="text-[#D62828] font-bold">* (Required - under 18)</span> : <span className="text-slate-400 font-normal">(if under 18)</span>}
                          </label>
                          <input
                            type="text"
                            value={formData.parentName}
                            onChange={(e) => handleInputChange('parentName', e.target.value)}
                            placeholder="e.g. David Miller"
                            className={`w-full bg-[#F8FAFC] border rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-all ${
                              formErrors.parentName ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-[#D62828] focus:bg-white'
                            }`}
                          />
                          {formErrors.parentName && (
                            <span className="text-[10px] text-red-600 font-bold block mt-1">{formErrors.parentName}</span>
                          )}
                        </div>

                        {/* Email Address */}
                        <div data-error={!!formErrors.email}>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Email Address <span className="text-[#D62828]">*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="e.g. parent@example.com (single email only)"
                            className={`w-full bg-[#F8FAFC] border rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-all ${
                              formErrors.email ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-[#D62828] focus:bg-white'
                            }`}
                          />
                          {formErrors.email && (
                            <span className="text-[10px] text-red-600 font-bold block mt-1">{formErrors.email}</span>
                          )}
                        </div>

                        {/* Phone Number */}
                        <div data-error={!!formErrors.phone}>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Phone Number <span className="text-[#D62828]">*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="e.g. (510) 555-0199"
                            maxLength={14}
                            className={`w-full bg-[#F8FAFC] border rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-all ${
                              formErrors.phone ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-[#D62828] focus:bg-white'
                            }`}
                          />
                          {formErrors.phone && (
                            <span className="text-[10px] text-red-600 font-bold block mt-1">{formErrors.phone}</span>
                          )}
                        </div>

                        {/* Date of Birth */}
                        <div data-error={!!formErrors.dob}>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Athlete Date of Birth <span className="text-[#D62828]">* (Min age 5)</span>
                          </label>
                          <input
                            type="date"
                            min={minDobString}
                            max={maxDobString}
                            value={formData.dob}
                            onChange={(e) => handleInputChange('dob', e.target.value)}
                            className={`w-full bg-[#F8FAFC] border rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-all ${
                              formErrors.dob ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-[#D62828] focus:bg-white'
                            }`}
                          />
                          {/* Live age indicator */}
                          {formData.dob && (
                            <div className="mt-1 text-[11px] font-bold">
                              {athleteAge !== null && athleteAge < 5 && (
                                <span className="text-red-600 flex items-center gap-1">⚠️ Age {athleteAge}: Too young (minimum enrollment age is 5 years)</span>
                              )}
                              {athleteAge !== null && athleteAge >= 5 && athleteAge < 18 && (
                                <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                                  👶 Youth Athlete ({athleteAge} years old) · Parent/Guardian required
                                </span>
                              )}
                              {athleteAge !== null && athleteAge >= 18 && athleteAge <= 35 && (
                                <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                                  👤 Adult Athlete ({athleteAge} years old)
                                </span>
                              )}
                            </div>
                          )}
                          {formErrors.dob && (
                            <span className="text-[10px] text-red-600 font-bold block mt-1">{formErrors.dob}</span>
                          )}
                        </div>

                        {/* ── SIBLING ENROLLMENT OPTION CARD (-$50 DISCOUNT) ── */}
                        <div className={`rounded-2xl border transition-all ${
                          formData.hasSibling 
                            ? 'bg-emerald-50/80 border-emerald-300 shadow-sm p-4 sm:p-5' 
                            : 'bg-gradient-to-r from-amber-50/90 to-orange-50/60 border-amber-200/90 p-4'
                        }`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                formData.hasSibling ? 'bg-emerald-500 text-white shadow-sm' : 'bg-amber-500/20 text-amber-800'
                              }`}>
                                <Users className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                                    Register with a Sibling
                                  </span>
                                  <span className="bg-[#D62828] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                                    Save $50 Instant Discount
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                  Enrolling brothers, sisters, or family members together? Add your sibling athlete to get a <strong>$50 family discount</strong> automatically applied to your total package fee.
                                </p>
                              </div>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                              <input
                                type="checkbox"
                                checked={formData.hasSibling}
                                onChange={(e) => handleInputChange('hasSibling', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                          </div>

                          {/* Expanded Sibling Details Form */}
                          {formData.hasSibling && (
                            <div className="mt-4 pt-4 border-t border-emerald-200/80 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Sibling (Athlete 2) Information
                                </span>
                                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/90 px-2.5 py-0.5 rounded-md">
                                  -$50 Family Discount Active
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Sibling Full Name */}
                                <div data-error={!!formErrors.siblingName}>
                                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                                    Sibling Full Name <span className="text-[#D62828]">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={formData.siblingName}
                                    onChange={(e) => handleInputChange('siblingName', e.target.value)}
                                    placeholder="e.g. Liam Miller"
                                    className={`w-full bg-white border rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-all ${
                                      formErrors.siblingName ? 'border-red-500 bg-red-50/50' : 'border-emerald-300 focus:border-emerald-600'
                                    }`}
                                  />
                                  {formErrors.siblingName && (
                                    <span className="text-[10px] text-red-600 font-bold block mt-1">{formErrors.siblingName}</span>
                                  )}
                                </div>

                                {/* Sibling Date of Birth */}
                                <div data-error={!!formErrors.siblingDob}>
                                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                                    Sibling Date of Birth <span className="text-[#D62828]">* (Min age 5)</span>
                                  </label>
                                  <input
                                    type="date"
                                    min={minDobString}
                                    max={maxDobString}
                                    value={formData.siblingDob}
                                    onChange={(e) => handleInputChange('siblingDob', e.target.value)}
                                    className={`w-full bg-white border rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-all ${
                                      formErrors.siblingDob ? 'border-red-500 bg-red-50/50' : 'border-emerald-300 focus:border-emerald-600'
                                    }`}
                                  />
                                  {formData.siblingDob && (
                                    <div className="mt-1 text-[11px] font-bold">
                                      {siblingAge !== null && siblingAge < 5 && (
                                        <span className="text-red-600">⚠️ Age {siblingAge}: Minimum age is 5 years</span>
                                      )}
                                      {siblingAge !== null && siblingAge >= 5 && siblingAge < 18 && (
                                        <span className="text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md inline-block">
                                          👶 Youth Athlete ({siblingAge} yrs old)
                                        </span>
                                      )}
                                      {siblingAge !== null && siblingAge >= 18 && siblingAge <= 35 && (
                                        <span className="text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md inline-block">
                                          👤 Adult Athlete ({siblingAge} yrs old)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {formErrors.siblingDob && (
                                    <span className="text-[10px] text-red-600 font-bold block mt-1">{formErrors.siblingDob}</span>
                                  )}
                                </div>
                              </div>

                              {/* Live Sibling Fee Breakdown Box */}
                              <div className="bg-white/95 rounded-xl p-3.5 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                                <div className="space-y-0.5">
                                  <div className="text-slate-600 text-[11px]">
                                    2 Athletes ({formData.playerName || 'Athlete 1'} + {formData.siblingName || 'Athlete 2'}): <span className="line-through text-slate-400 font-bold">${singlePrice * 2}.00</span>
                                  </div>
                                  <div className="text-emerald-700 font-black text-xs flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Sibling Family Discount: -$50.00 (Applied)
                                  </div>
                                </div>
                                <div className="text-left sm:text-right border-t sm:border-t-0 pt-1.5 sm:pt-0">
                                  <span className="text-[10px] text-slate-400 font-black uppercase block">Total Package Fee</span>
                                  <span className="font-serif font-black text-xl text-emerald-800">${totalRegistrationFee}.00 USD</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Preferred Training Location (Available for Every Session) */}
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Preferred Training Location <span className="text-[#D62828]">*</span>
                          </label>
                          <select
                            value={formData.preferredLocation}
                            onChange={(e) => handleInputChange('preferredLocation', e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#D62828] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-all cursor-pointer font-bold"
                          >
                            <option value="Fremont (Kerala House)">Fremont (Kerala House)</option>
                            <option value="Manteca (Courtside Sports)">Manteca (Courtside Sports)</option>
                            <option value="Mountain House (Hansen Elementary)">Mountain House (Hansen Elementary)</option>
                            <option value="San Jose">San Jose</option>
                          </select>
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">Select your primary court location</span>
                        </div>

                        {/* Emergency Contact Person */}
                        <div data-error={!!formErrors.emergencyContactName}>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Emergency Contact Person <span className="text-[#D62828]">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.emergencyContactName}
                            onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                            placeholder="e.g. Sarah Miller (Mother)"
                            className={`w-full bg-[#F8FAFC] border rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-all ${
                              formErrors.emergencyContactName ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-[#D62828] focus:bg-white'
                            }`}
                          />
                          {formErrors.emergencyContactName && (
                            <span className="text-[10px] text-red-600 font-bold block mt-1">{formErrors.emergencyContactName}</span>
                          )}
                        </div>

                        {/* Emergency Contact Phone */}
                        <div data-error={!!formErrors.emergencyContactPhone}>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Emergency Contact Phone <span className="text-[#D62828]">*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.emergencyContactPhone}
                            onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                            placeholder="e.g. (510) 555-0198"
                            maxLength={14}
                            className={`w-full bg-[#F8FAFC] border rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-all ${
                              formErrors.emergencyContactPhone ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-[#D62828] focus:bg-white'
                            }`}
                          />
                          {formErrors.emergencyContactPhone && (
                            <span className="text-[10px] text-red-600 font-bold block mt-1">{formErrors.emergencyContactPhone}</span>
                          )}
                        </div>
                      </div>

                      {/* Medical Notes */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                          Medical / Allergy Considerations <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                          value={formData.medicalNotes}
                          onChange={(e) => handleInputChange('medicalNotes', e.target.value)}
                          rows={2}
                          placeholder="List any asthma, allergies, past injuries, or conditions coaches should know..."
                          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 font-medium outline-none focus:border-[#D62828] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Safety & Liability Waiver Box */}
                      <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200 space-y-3" data-error={!!formErrors.waiverAccepted}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#D62828]" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                              Safety, Liability &amp; Non-Refundable Waiver
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowWaiverDetails(!showWaiverDetails)}
                            className="text-[11px] text-[#D62828] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>{showWaiverDetails ? 'Hide Legal Text' : 'Read Full Waiver'}</span>
                            {showWaiverDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Collapsible Full Waiver Agreement */}
                        {showWaiverDetails && (
                          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-3 max-h-64 overflow-y-auto leading-relaxed divide-y divide-slate-100">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900 text-xs">1. General Waiver &amp; Risk Assumption</p>
                              <p>
                                I understand that observation of or physical activity in, including but not limited to hitting, passing, jumping and blocking can be a dangerous activity and that, by participating in those activities like (&ldquo;Volleyball Coaching&rdquo;), I am taking a risk that my child may be injured. I hereby assume all the risk described above, even if the Challengers Volleyball Coaching Center like Clinics, Camps and training activities organized by Wilson Mathew Challengers Volleyball Coaching Center program at any Gym, School, Park or facility in California. Any of the aforementioned Parties, Owners, Members, Coaches, Employees or Agents, through negligence or otherwise, are deemed liable. I hereby release, waive, discharge covenant not to sue Challengers Volleyball Coaching Center, California or any of the aforementioned Parties&rsquo; Owners, Members, Coaches, Employees or Agents (individually and together herein referred to as &ldquo;Released Parties&rdquo;).
                              </p>
                            </div>

                            <div className="pt-2.5 space-y-1">
                              <p className="font-bold text-slate-900 text-xs">2. Consent to Use of Likeness (Photo &amp; Video Release)</p>
                              <p>
                                I understand and agree that photographs, Videos and other recordings of participants may be taken, and that such pictures or videos of me and/or my child may be used for promotional purposes. I hereby consent to the publication and use of my and/or my child&rsquo;s name or likeness for the purpose for the promotion, publicity, advertising, or other manner or media by the city or any other representative authorized to act on behalf of the aforementioned entities. I agree that the actual material involved is and shall continue to the property of the city and that neither I, nor my child, shall have any right of review or approval regarding the use of me and/or my child&rsquo;s likeness in such material.
                              </p>
                            </div>

                            <div className="pt-2.5 space-y-1">
                              <p className="font-bold text-slate-900 text-xs">3. Premises, Equipment &amp; Facility Liability Release</p>
                              <p>
                                Owners and tenants of premises used to conduct the Volleyball Activities, from any and all liability arising out of my or my child&rsquo;s observation of and participation in the Volleyball Activities and/or event, even if the liability arises out of negligence that may not be foreseeable at this time. I understand that by signing this Waiver and Release, I expressly and willingly agree to assume complete responsibility for any risk of injury or damages that may arise from the related activity. On behalf of myself, my children, heirs, assigns and next of kin, I waive all claims for damages, injuries, and death sustained to me, my children or my property, that I may have against the above-named Released Parties, any of its owners, employees or representatives relating to such activity. I understand that the activities that I or my child will participate in are inherently dangerous and may cause serious injuries, including body injury, damage to personal property and/or death. By this waiver, I assume any and all risk, and take full responsibility and waive any and all claims of personal injury upon myself or my child, including severe body injury, damage to personal property and death relating to all activities associated with the activity, including but not limited to practice, receiving lessons at the facility, using the facility and its equipment and related activities on and off the activity premises.
                              </p>
                            </div>

                            <div className="pt-2.5 space-y-1">
                              <p className="font-bold text-slate-900 text-xs">4. Physical Condition &amp; Negligence Disclaimer</p>
                              <p>
                                If I or my children are injured from said activity, I will not hold the above named Released Parties responsible even if the injuries were caused by negligence on my part or the Released Parties, any of its owners, employees or representatives, or any other party under or affiliated with the above named Released Parties. I represent that my minor child or I are in sufficiently good physical condition to participate in the programs and activities without jeopardizing our health.
                              </p>
                            </div>

                            <div className="pt-2.5 space-y-1">
                              <p className="font-bold text-slate-900 text-xs">5. Voluntary Agreement &amp; Binding Effect</p>
                              <p>
                                I understand that I have given up substantial rights by signing this waiver and release, and sign it voluntarily. This waiver and release also binds my heirs and assigners. The undersigned, my parent or legal guardian, and I if I am a minor, in consideration of being allowed participating in the activity, and all related events and activities.
                              </p>
                            </div>

                            <div className="pt-2.5 p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-950 font-bold text-[10.5px]">
                              *HOLD HARMLESS MEDICAL RELEASE: DUE TO THE NATURE OF ACTIVITY, IT IS UNDERSTOOD THAT I RELEASE THE RELEASED PARTIES (DEFINED ABOVE) FROM ALL LIABILITY OF ANY SORT, AND THAT THEY BE HELD HARMLESS AND INDEMNIFIED FOR ANY ACCIDENT OR INJURIES SUSTAINED BY ME/MY CHILDREN WHILE INVOLVED IN THE VOLLEYBALL ACTIVITY.
                            </div>

                            <div className="pt-2.5 space-y-1">
                              <p className="font-bold text-slate-900 text-xs">6. Emergency Medical Treatment Release</p>
                              <p>
                                I authorize Challengers Volleyball Academy coaches and staff to secure emergency medical treatment, hospitalization, or paramedic care if I cannot be reached promptly in an emergency.
                              </p>
                            </div>

                            <div className="pt-2.5 space-y-1">
                              <p className="font-bold text-slate-900 text-xs">7. Strict Non-Refundable Enrollment Policy</p>
                              <p>
                                All registration fees (${totalRegistrationFee}.00) are 100% non-refundable once registered. Court bookings, insurance, and coach allocations are finalized immediately upon registration submission.
                              </p>
                            </div>

                            <div className="pt-2.5 space-y-1">
                              <p className="font-bold text-slate-900 text-xs">8. Attendance &amp; Makeup Class Policy</p>
                              <p>
                                Students who miss regular training classes will be eligible for 1 makeup class quarterly, subject to academy scheduling and court availability.
                              </p>
                            </div>
                          </div>
                        )}

                        <label className="flex items-start gap-3 cursor-pointer pt-2">
                          <input
                            type="checkbox"
                            checked={formData.waiverAccepted}
                            onChange={(e) => handleInputChange('waiverAccepted', e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#D62828] focus:ring-[#D62828] cursor-pointer"
                          />
                          <span className="text-xs text-slate-800 font-medium leading-tight">
                            I have read, agree to, and accept the <strong>Challengers Volleyball Academy Safety &amp; Liability Waiver</strong>, and acknowledge that all fees (${totalRegistrationFee}.00) are <strong>strictly non-refundable</strong>. <span className="text-[#D62828]">*</span>
                          </span>
                        </label>
                        {formErrors.waiverAccepted && (
                          <span className="text-[10px] text-red-600 font-bold block">{formErrors.waiverAccepted}</span>
                        )}
                      </div>

                      {/* Modal Footer Buttons */}
                      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="px-8 py-3.5 rounded-xl bg-[#D62828] hover:bg-[#b01c1c] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Preparing Checkout...</span>
                            </>
                          ) : (
                            <>
                              <span>Proceed to Payment (${totalRegistrationFee})</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ── STEP 2: SECURE STRIPE PAYMENT ── */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" /> Edit Registration Details
                      </button>
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-[11px] font-bold">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit Encrypted Checkout
                      </div>
                    </div>

                    {/* Order Summary Recap */}
                    <div className="bg-[#071A2D] text-white rounded-2xl p-6 shadow-md">
                      <span className="text-[10px] font-black tracking-widest uppercase text-[#F9BC00] block mb-1">
                        Order Summary
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-serif font-black text-white">{selectedSession.name}</h3>
                            {formData.hasSibling && (
                              <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                                2 Athletes (Sibling Discount)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/70">{selectedSession.sessionDuration} · {selectedSession.location}</p>
                          
                          {formData.hasSibling ? (
                            <div className="mt-2.5 bg-white/10 rounded-xl p-3 border border-white/10 space-y-1 text-xs max-w-md">
                              <div className="flex justify-between text-white/80 text-[11px]">
                                <span>Athlete 1 ({formData.playerName}):</span>
                                <span className="font-mono">${singlePrice}.00</span>
                              </div>
                              <div className="flex justify-between text-white/80 text-[11px]">
                                <span>Sibling Athlete 2 ({formData.siblingName}):</span>
                                <span className="font-mono">${singlePrice}.00</span>
                              </div>
                              <div className="flex justify-between text-emerald-400 font-bold text-[11px] pt-1 border-t border-white/10">
                                <span>Family Sibling Discount:</span>
                                <span className="font-mono">-$50.00</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-white/60 mt-1">
                              Athlete: <strong className="text-white">{formData.playerName}</strong> ({formData.email})
                            </p>
                          )}
                        </div>

                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10 shrink-0">
                          <span className="text-3xl font-serif font-black text-[#F9BC00]">${totalRegistrationFee}.00</span>
                          <span className="text-[10px] text-white/60 block font-bold">
                            {formData.hasSibling ? 'Total Fee (Save $50)' : 'Total Non-Refundable Fee'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Selector Tabs */}
                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => { setPaymentOption('card'); setPaymentError(null); }}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          paymentOption === 'card'
                            ? 'bg-[#071A2D] text-white shadow-md'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <CreditCard className={`w-4 h-4 ${paymentOption === 'card' ? 'text-[#D62828]' : 'text-slate-500'}`} />
                        <span>Credit / Debit Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setPaymentOption('qr'); setPaymentError(null); }}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          paymentOption === 'qr'
                            ? 'bg-[#071A2D] text-white shadow-md'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <QrCode className={`w-4 h-4 ${paymentOption === 'qr' ? 'text-[#F9BC00]' : 'text-slate-500'}`} />
                        <span>Mobile QR &amp; Wallets</span>
                      </button>
                    </div>

                    {/* ── OPTION A: SCAN & PAY VIA STRIPE INSTANT MOBILE QR ── */}
                    {paymentOption === 'qr' && (
                      <div className="space-y-5">
                        <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                              <QrCode className="w-4 h-4 text-[#D62828]" />
                              <span>Instant Mobile QR Checkout (Stripe Secure)</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                              <span className="bg-black text-white px-2.5 py-0.5 rounded-full font-bold"> Apple Pay</span>
                              <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold">G Pay</span>
                              <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold">Cards</span>
                            </div>
                          </div>

                          {/* QR Card + Instructions */}
                          <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            {/* Stripe QR Code Visual */}
                            <div className="shrink-0 flex flex-col items-center">
                              <div className="relative p-3 bg-white border-2 border-[#D62828]/30 rounded-2xl shadow-md flex items-center justify-center group">
                                {qrDataUrl ? (
                                  <img 
                                    src={qrDataUrl} 
                                    alt="Scan to Pay via Phone" 
                                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
                                  />
                                ) : (
                                  <div className="w-48 h-48 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#D62828]" />
                                  </div>
                                )}
                                {/* Scan corner targets */}
                                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#D62828] rounded-tl" />
                                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#D62828] rounded-tr" />
                                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#D62828] rounded-bl" />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#D62828] rounded-br" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2 text-center">
                                Point Phone Camera at QR
                              </span>
                            </div>

                            {/* Pay Info + Auto Detection State */}
                            <div className="flex-1 w-full space-y-4 text-xs">
                              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Due</span>
                                  <span className="text-xl font-black text-slate-900">${totalRegistrationFee}.00 <span className="text-xs font-bold text-slate-500">USD</span></span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                    {formData.hasSibling ? 'Athletes (2)' : 'Athlete'}
                                  </span>
                                  <span className="text-xs font-bold text-slate-800">
                                    {formData.playerName || 'Student'}{formData.hasSibling ? ` & ${formData.siblingName || 'Sibling'}` : ''}
                                  </span>
                                </div>
                              </div>

                              {/* Live Auto-Detector Banner */}
                              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 flex items-center gap-3">
                                <div className="relative flex h-3.5 w-3.5 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                                </div>
                                <div className="text-xs text-emerald-950 leading-tight">
                                  <strong className="font-black block text-emerald-900 mb-0.5">Live Scan Listener Active</strong>
                                  Scan with iPhone or Android to pay with Apple Pay, Google Pay, or Card. Confirmation receipt and email will trigger automatically.
                                </div>
                              </div>

                              {/* Direct Mobile Link */}
                              {stripeCheckoutUrl && (
                                <a
                                  href={stripeCheckoutUrl}
                                  className="w-full bg-[#071A2D] hover:bg-[#D62828] text-white py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md text-center cursor-pointer"
                                >
                                  <Smartphone className="w-4 h-4 text-amber-400" />
                                  <span>Already on Phone? Tap to Open Stripe Checkout</span>
                                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── OPTION B: CREDIT / DEBIT CARD via Real Stripe Elements ── */}
                    {paymentOption === 'card' && (
                      !stripePromise ? (
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-4 rounded-xl text-xs flex flex-col gap-2">
                          <div className="flex items-center gap-2 font-bold">
                            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                            <span>Stripe Card Checkout is currently not configured.</span>
                          </div>
                          <p className="text-amber-800">
                            Please select <strong>Instant Mobile QR (Apple Pay, Google Pay, Cards)</strong> above or <strong>Manual Confirmation</strong> to complete enrollment.
                          </p>
                        </div>
                      ) : clientSecret ? (
                        <Elements
                          stripe={stripePromise}
                          options={{
                            clientSecret,
                            appearance: {
                              theme: 'stripe',
                              variables: {
                                colorPrimary: '#D62828',
                                colorBackground: '#FFFFFF',
                                colorText: '#1e293b',
                                colorDanger: '#ef4444',
                                fontFamily: 'Inter, system-ui, sans-serif',
                                borderRadius: '12px',
                                spacingUnit: '5px',
                              },
                              rules: {
                                '.Input': {
                                  border: '1px solid #e2e8f0',
                                  boxShadow: 'none',
                                  fontSize: '13px',
                                  padding: '10px 14px',
                                },
                                '.Input:focus': {
                                  border: '1px solid #D62828',
                                  boxShadow: '0 0 0 3px rgba(214,40,40,0.08)',
                                },
                                '.Label': {
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.08em',
                                  color: '#475569',
                                },
                              }
                            }
                          }}
                        >
                          <StripeCardForm
                            selectedSession={selectedSession}
                            totalAmount={totalRegistrationFee}
                            hasSibling={formData.hasSibling}
                            siblingName={formData.siblingName}
                            leadId={leadId}
                            activeRegistrationId={activeRegistrationId}
                            formData={formData}
                            setRegistrationRecord={setRegistrationRecord}
                            setCurrentStep={setCurrentStep}
                            setIsModalOpen={setIsModalOpen}
                            modalBodyRef={modalBodyRef}
                            paymentError={paymentError}
                            setPaymentError={setPaymentError}
                            isProcessing={isProcessing}
                            setIsProcessing={setIsProcessing}
                          />
                        </Elements>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-4 rounded-xl text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Card checkout is initializing. Please wait a moment and try again.</span>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* ── STEP 3: REGISTRATION CONFIRMED 🎉 ── */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Official Receipt Card for PDF Screenshot */}
                    <div 
                      ref={confirmationRef}
                      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-slate-900 relative overflow-hidden"
                    >
                      {/* Top Header */}
                      <div className="text-center pb-6 border-b border-slate-100">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D62828] block mb-1">
                          Challengers Volleyball Academy
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-slate-900">
                          Enrollment Confirmed! 🎉
                        </h2>
                        <p className="text-slate-500 text-xs mt-1">
                          Spot officially secured in the coaching roster. Welcome to the academy!
                        </p>
                      </div>

                      {/* Receipt Data Table */}
                      <div className="py-5 space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-xl">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Registration ID</span>
                            <span className="font-black text-slate-900 text-sm">{registrationRecord?.registrationId || 'CVA-10245'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Status</span>
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-black text-[10px]">
                              <Check className="w-3 h-3" /> PAID (${registrationRecord?.amountPaid || totalRegistrationFee})
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Primary Athlete:</span>
                            <strong className="text-slate-900">{registrationRecord?.playerName || formData.playerName}</strong>
                          </div>

                          {(registrationRecord?.hasSibling || formData.hasSibling) && (
                            <>
                              <div className="flex justify-between py-2 border-b border-slate-100 bg-emerald-50/50 px-2 rounded-lg">
                                <span className="text-emerald-800 font-bold">Sibling Athlete (Athlete 2):</span>
                                <strong className="text-emerald-900">{registrationRecord?.siblingName || formData.siblingName || 'Sibling'}</strong>
                              </div>
                              <div className="flex justify-between py-2 border-b border-slate-100 px-2">
                                <span className="text-slate-500 font-medium">Sibling Family Discount:</span>
                                <strong className="text-emerald-600 font-black">-$50.00 USD (Applied)</strong>
                              </div>
                            </>
                          )}

                          {formData.parentName && (
                            <div className="flex justify-between py-2 border-b border-slate-100">
                              <span className="text-slate-500 font-medium">Parent / Guardian:</span>
                              <strong className="text-slate-900">{formData.parentName}</strong>
                            </div>
                          )}

                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Enrolled Program:</span>
                            <strong className="text-slate-900">{registrationRecord?.sessionName || selectedSession.name}</strong>
                          </div>

                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Schedule:</span>
                            <strong className="text-slate-900">{registrationRecord?.schedule || selectedSession.schedule}</strong>
                          </div>

                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Location:</span>
                            <strong className="text-slate-900 text-right">{registrationRecord?.location || registrationRecord?.preferredLocation || formData.preferredLocation || selectedSession.location}</strong>
                          </div>

                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Payment Method:</span>
                            <strong className="text-slate-900">
                              {registrationRecord?.paymentMethod === 'QR Code' ? 'QR Code Instant Transfer' : (registrationRecord?.paymentMethod || (paymentOption === 'qr' ? 'QR Code Instant Transfer' : 'Credit / Debit Card'))}
                            </strong>
                          </div>

                          {registrationRecord?.transactionId && (
                            <div className="flex justify-between py-2 border-b border-slate-100">
                              <span className="text-slate-500 font-medium">Transaction / Stripe ID:</span>
                              <strong className="text-slate-900 font-mono">{registrationRecord.transactionId}</strong>
                            </div>
                          )}

                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Email Confirmation Sent To:</span>
                            <strong className="text-slate-900">{registrationRecord?.email || formData.email}</strong>
                          </div>

                          <div className="flex justify-between py-2 text-sm pt-2">
                            <span className="font-black text-slate-900">Total Amount Paid:</span>
                            <span className="font-serif font-black text-xl text-[#071A2D]">${registrationRecord?.amountPaid || totalRegistrationFee}.00 USD</span>
                          </div>
                        </div>
                      </div>

                      {/* Policy notice */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          Please save or download your receipt. All session instructions have also been sent to <strong>{formData.email}</strong>.
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={handleDownloadReceipt}
                        disabled={isDownloadingPdf}
                        className="w-full sm:flex-1 bg-[#071A2D] hover:bg-[#0c2847] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isDownloadingPdf ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#F9BC00]" />
                            <span>Generating PDF...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download Receipt (PDF)</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="w-full sm:flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center shadow-sm cursor-pointer"
                      >
                        Done &amp; Close
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stripe Card Form (must be inside <Elements> provider)
// ─────────────────────────────────────────────────────────────
interface StripeCardFormProps {
  selectedSession: SessionItem;
  totalAmount: number;
  hasSibling: boolean;
  siblingName?: string;
  leadId: string | null;
  activeRegistrationId: string | null;
  formData: any;
  setRegistrationRecord: (r: any) => void;
  setCurrentStep: (s: 1 | 2 | 3) => void;
  setIsModalOpen: (open: boolean) => void;
  modalBodyRef: React.RefObject<HTMLDivElement | null>;
  paymentError: string | null;
  setPaymentError: (e: string | null) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

function StripeCardForm({
  selectedSession,
  totalAmount,
  hasSibling,
  siblingName,
  leadId,
  activeRegistrationId,
  formData,
  setRegistrationRecord,
  setCurrentStep,
  setIsModalOpen,
  modalBodyRef,
  paymentError,
  setPaymentError,
  isProcessing,
  setIsProcessing,
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleStripeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setPaymentError('Stripe is still loading. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // 1. Confirm the payment with Stripe - pass return_url for redirect/3DS support
      const returnUrl = `${window.location.origin}/register?completed=true&leadId=${leadId || ''}&registrationId=${activeRegistrationId || ''}`;
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(error.message || 'Payment failed. Please check your card details and try again.');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
        // 2. Payment confirmed - now verify on our server and trigger confirmation emails
        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: 'Card',
            paymentIntentId: paymentIntent.id,
            leadId,
            registrationId: activeRegistrationId,
            sessionId: selectedSession?.id,
            studentData: formData,
            location: formData.preferredLocation,
            preferredLocation: formData.preferredLocation,
            hasSibling: formData.hasSibling,
            siblingName: formData.siblingName,
            siblingDob: formData.siblingDob,
            siblingGender: formData.siblingGender,
            playerName: formData.playerName,
            parentName: formData.parentName,
            email: formData.email,
            phone: formData.phone,
            dob: formData.dob
          }),
        });

        const data = await res.json();
        const finalReg = (data.success && data.registration) ? data.registration : {
          registrationId: activeRegistrationId || `CVA-${Math.floor(10000 + Math.random() * 90000)}`,
          sessionId: selectedSession?.id,
          sessionName: selectedSession?.name,
          playerName: formData.playerName,
          parentName: formData.parentName,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          location: formData.preferredLocation || selectedSession?.location,
          schedule: selectedSession?.schedule,
          amountPaid: totalAmount,
          paymentStatus: 'PAID',
          paymentMethod: 'Credit / Debit Card',
          transactionId: paymentIntent.id,
          stripePaymentIntentId: paymentIntent.id,
          hasSibling: formData.hasSibling,
          siblingName: formData.siblingName,
          siblingDob: formData.siblingDob,
          discountAmount: formData.hasSibling ? 50 : 0,
          registeredAt: Date.now()
        };

        setRegistrationRecord(finalReg);
        setCurrentStep(3);
        setIsModalOpen(true);
        modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Confetti celebration
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#D62828', '#F9BC00', '#071A2D', '#22C55E'],
        });
      } else if (paymentIntent?.status === 'requires_action') {
        setPaymentError('Additional authentication required. Please complete the 3D Secure verification step.');
      } else {
        setPaymentError(`Payment status: ${paymentIntent?.status}. Please try again.`);
      }
    } catch (err: any) {
      console.error('Stripe submit error:', err);
      setPaymentError(err.message || 'An unexpected error occurred during card checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleStripeSubmit} className="space-y-5">
      {/* Secure badge */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-bold text-slate-800">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#D62828]" />
          <span>Credit / Debit Card - Secure Checkout</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span className="text-emerald-700 font-bold">256-Bit SSL</span>
        </div>
      </div>

      {/* Stripe's hosted payment element (card number, expiry, CVV auto-included) */}
      <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {},
          }}
        />
      </div>

      {/* Amount reminder */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-600 font-medium block">Total Charge Amount</span>
          {hasSibling && (
            <span className="text-[10px] text-emerald-600 font-bold">Includes -$50.00 Sibling Discount</span>
          )}
        </div>
        <span className="font-black text-[#D62828] text-base">${totalAmount}.00 USD</span>
      </div>

      {/* Error message */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{paymentError}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-[#D62828] hover:bg-[#b01c1c] text-white py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 text-white/80" />
            <span>Pay ${totalAmount}.00 &amp; Confirm Enrollment</span>
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-slate-500 leading-relaxed font-medium">
        Powered by Stripe · 256-bit encrypted · Your card is never stored on our servers.
        Program fees are non-refundable. Email confirmation sent instantly upon payment.
      </p>
    </form>
  );
}
