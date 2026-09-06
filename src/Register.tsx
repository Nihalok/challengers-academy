import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, NavLink } from 'react-router-dom';
import {
  CheckCircle2, ChevronRight, ChevronLeft, CreditCard, Shield,
  Calendar, Download, Loader2, Info, FileText,
  MapPin, Clock, Users, Lock, Sparkles, Check, AlertCircle, ArrowRight,
  Search, X, HelpCircle, ChevronDown, ChevronUp, QrCode, Smartphone, Copy, ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { domToCanvas } from 'modern-screenshot';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import SEO from './components/SEO';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with live publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

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
    id: 'gym-training-4',
    name: 'Gym Training (4 Sessions)',
    category: 'Gym Training',
    students: 'Group',
    sessionDuration: '2 Hours',
    packageCount: '4 Sessions',
    ageGroup: 'All Ages / Group',
    skillLevel: 'Beginner to Advanced',
    location: 'Fremont Arena / Tracy Facility',
    locationAddress: '43575 Mission Blvd, Fremont, CA',
    schedule: 'Weekly Batches (2 Hours / Session)',
    dates: 'Starting Next Weekend',
    time: '2 Hours per Session',
    price: 200,
    priceNote: 'package fee',
    capacity: 25,
    filled: 14,
    coach: 'Wilson Mathew & Coaching Team',
    description: '4 indoor gym training sessions (2 hours each) covering volleyball mechanics, passing precision, agility, and scrimmages.',
    features: ['4 x 2-Hour Sessions', 'Indoor Gym Facility', 'Rotations & Tactics', 'Coach Mentorship'],
    popular: false
  },
  {
    id: 'gym-training-12',
    name: 'Gym Training (12 Sessions - Best Value)',
    category: 'Gym Training',
    students: 'Group',
    sessionDuration: '2 Hours',
    packageCount: '12 Sessions',
    ageGroup: 'All Ages / Group',
    skillLevel: 'All Skill Levels (Best Value)',
    location: 'Fremont Arena / Tracy Facility',
    locationAddress: '43575 Mission Blvd, Fremont, CA',
    schedule: '3 Days / Week (2 Hours / Session)',
    dates: 'Rolling Monthly Batches',
    time: '2 Hours per Session',
    price: 550,
    priceNote: 'package fee (Save $50)',
    capacity: 25,
    filled: 18,
    coach: 'Wilson Mathew & Senior Staff',
    description: '12 comprehensive group training sessions in our indoor gym facility. 2 hours per session for full athlete progression.',
    features: ['12 x 2-Hour Sessions', 'Best Value Package', 'Position Specialization', 'School & Club Tryout Prep'],
    popular: true
  },
  {
    id: 'open-park-private',
    name: 'Open Park (Private Coaching 1-on-1)',
    category: 'Private Coaching',
    students: '1 Student',
    sessionDuration: '1 Hour',
    packageCount: '4 Sessions',
    ageGroup: '1 Student Dedicated',
    skillLevel: 'Personalized Progression',
    location: 'Open Park Facilities (Halcyon Park)',
    locationAddress: 'Halcyon Park & Regional Courts',
    schedule: 'Flexible Scheduling',
    dates: 'Book on Demand',
    time: '1 Hour per Session',
    price: 360,
    priceNote: 'package fee',
    capacity: 10,
    filled: 6,
    coach: 'Dedicated Master Coach',
    description: '4 one-on-one private coaching sessions (1 hour each) in open park. 100% focused personal mechanics coaching.',
    features: ['4 x 1-Hour Sessions', '100% Focused 1-on-1', 'Targeted Weakness Elimination', 'Custom Progression'],
    popular: false
  },
  {
    id: 'open-park-travel',
    name: 'Open Park (Short Distance Travel)',
    category: 'Private Coaching',
    students: '1 Student',
    sessionDuration: '1 Hour',
    packageCount: '4 Sessions',
    ageGroup: '1 Student Dedicated',
    skillLevel: 'Convenient Travel Coaching',
    location: 'Nearby Park Court of Choice',
    locationAddress: 'Short-distance travel regional parks',
    schedule: 'Flexible Weekend / Weekday Times',
    dates: 'Book on Demand',
    time: '1 Hour per Session',
    price: 320,
    priceNote: 'package fee',
    capacity: 10,
    filled: 4,
    coach: 'Certified Academy Coach',
    description: '4 personalized private sessions (1 hour each) with coach traveling to a convenient nearby park facility.',
    features: ['4 x 1-Hour Sessions', 'Nearby Park Location', 'Skill Acceleration', 'Flexible Scheduling'],
    popular: false
  },
  {
    id: 'open-park-group',
    name: 'Open Park Group Training',
    category: 'Open Park Group',
    students: 'Group',
    sessionDuration: '2 Hours',
    packageCount: '4 Sessions',
    ageGroup: 'All Youth & Juniors',
    skillLevel: 'Fundamental & Repetitive Drills',
    location: 'Open Park Courts (Halcyon Park)',
    locationAddress: 'Halcyon Park, San Leandro / Bay Area',
    schedule: 'Saturday & Sunday Mornings',
    dates: 'Starting Next Weekend',
    time: '2 Hours per Session',
    price: 150,
    priceNote: 'per student',
    capacity: 24,
    filled: 15,
    coach: 'Wilson Mathew & Assistants',
    description: '4 high-repetition group training sessions (2 hours each) in open park atmosphere building stamina and ball control.',
    features: ['4 x 2-Hour Sessions', 'Outdoor Open Air Training', 'High-Rep Passing & Defense', 'Economical Group Rate'],
    popular: false
  },
  {
    id: 'large-group-training',
    name: 'Large Group Training (13+ Students)',
    category: 'Large Group',
    students: '13 or more students',
    sessionDuration: '2 Hours',
    packageCount: '4 Sessions',
    ageGroup: 'School Squads / Large Teams',
    skillLevel: 'Team Tactics & Scrimmage',
    location: 'Fremont Arena / Regional Courts',
    locationAddress: '43575 Mission Blvd, Fremont, CA',
    schedule: 'Scheduled with Team Coordinator',
    dates: 'Custom Team Batches',
    time: '2 Hours per Session',
    price: 120,
    priceNote: 'per student (Min 13)',
    capacity: 35,
    filled: 22,
    coach: 'Wilson Mathew & Master Staff',
    description: '4 tactical team sessions (2 hours each) designed for school teams, clubs, or organized squads of 13+ players.',
    features: ['4 x 2-Hour Sessions', 'Team Tactical Systems', 'Court Communication & Chemistry', 'Best Per-Student Value'],
    popular: false
  },
  {
    id: 'tryout-session',
    name: 'Tryout Session & Evaluation',
    category: 'Assessment',
    students: '1 Student / Group',
    sessionDuration: '2 Hours',
    packageCount: '1 Session',
    ageGroup: 'All Ages / Prospective Athletes',
    skillLevel: 'Placement Evaluation',
    location: 'Fremont Arena / Halcyon Park',
    locationAddress: 'Academy Training Facilities',
    schedule: 'Weekly Tryout Batches',
    dates: 'Upcoming Weekend Batch',
    time: '2 Hours Assessment',
    price: 30,
    priceNote: 'evaluation fee',
    capacity: 20,
    filled: 9,
    coach: 'Wilson Mathew',
    description: 'Comprehensive 2-hour court evaluation, baseline physical assessment, and coach feedback to determine ideal program placement.',
    features: ['2-Hour Court Evaluation', 'Mechanics & Skill Audit', 'Roster Level Recommendation', 'No Long-Term Commitment'],
    popular: false
  }
];

export default function Register() {
  const [searchParams] = useSearchParams();
  const confirmationRef = useRef<HTMLDivElement>(null);

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
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalNotes: '',
    waiverAccepted: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showWaiverDetails, setShowWaiverDetails] = useState(false);

  // Payment & Confirmation State
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [registrationRecord, setRegistrationRecord] = useState<any>(null);
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // QR Code & Multi-Payment Options State
  const [paymentOption, setPaymentOption] = useState<'qr' | 'card'>('qr');
  const [qrReferenceId, setQrReferenceId] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [stripeCheckoutUrl, setStripeCheckoutUrl] = useState<string | null>(null);
  const [activeRegistrationId, setActiveRegistrationId] = useState<string | null>(null);
  const [qrMode, setQrMode] = useState<'stripe' | 'zelle'>('stripe');
  const [paymentSettings, setPaymentSettings] = useState<any>({
    zellePhone: '+1 (863) 845-9913',
    zelleEmail: 'kenznajeeb@gmail.com',
    zelleName: 'Wilson Mathew / Challengers Academy',
    venmoHandle: '@Challengers-Academy',
    cashAppHandle: '$ChallengersAcademy',
    upiId: '18638459913@upi',
    qrCustomImageUrl: '',
    paymentInstructions: 'Scan the official Academy QR Code with your Banking App, Zelle, Venmo, Cash App, or UPI. Enter your transaction/reference ID below to complete enrollment.',
    enableQrPayment: true,
    enableCardPayment: true
  });

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Check if returning from a mobile Stripe checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const completed = params.get('completed');
    const regId = params.get('registrationId') || params.get('regId');
    if (completed && regId) {
      fetch(`/api/registration-status/${regId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.registration) {
            setRegistrationRecord(data.registration);
            setCurrentStep(3);
            confetti({
              particleCount: 140,
              spread: 90,
              origin: { y: 0.55 },
              colors: ['#D62828', '#F9BC00', '#071A2D', '#22C55E']
            });
          }
        })
        .catch(console.error);
    }
  }, []);

  // Fetch dynamic payment settings from server
  useEffect(() => {
    fetch('/api/payment-settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setPaymentSettings((prev: any) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(err => console.error('Error fetching payment settings:', err));
  }, []);

  // Fetch session catalog on mount and merge with official packages
  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.sessions) && data.sessions.length > 0) {
          const uniqueMap = new Map<string, SessionItem>();
          
          // Seed official training sessions first
          OFFICIAL_SESSIONS.forEach(item => {
            uniqueMap.set(item.id, item);
          });

          // Augment or add from database
          data.sessions.forEach((s: any) => {
            if (uniqueMap.has(s.id)) {
              const existing = uniqueMap.get(s.id)!;
              uniqueMap.set(s.id, {
                ...existing,
                price: Number(s.price) || existing.price,
                capacity: Number(s.capacity) || existing.capacity,
                filled: Number(s.filled) || existing.filled,
                location: s.location || existing.location,
              });
            } else if (!s.id.toLowerCase().includes('duplicate')) {
              uniqueMap.set(s.id, {
                id: s.id,
                name: s.name,
                category: s.category || 'Coaching Program',
                students: s.category?.includes('Private') ? '1 Student' : 'Group',
                sessionDuration: '2 Hours',
                packageCount: '4 Sessions',
                ageGroup: s.ageGroup || 'All Ages',
                skillLevel: s.skillLevel || 'All Levels',
                location: s.location || 'Fremont Arena',
                locationAddress: s.locationAddress || 'Bay Area Facility',
                schedule: s.schedule || 'Scheduled Sessions',
                dates: s.dates || 'Rolling Enrollment',
                time: s.time || '2 Hours per Session',
                price: Number(s.price) || 200,
                priceNote: 'package fee',
                capacity: Number(s.capacity) || 25,
                filled: Number(s.filled) || 0,
                coach: s.coach || 'Wilson Mathew & Coaches',
                description: s.description || 'Comprehensive academy volleyball coaching.',
                features: ['Professional Mentorship', 'Court Drills', 'Tactics', 'Technique Review'],
                popular: false
              });
            }
          });

          setSessions(Array.from(uniqueMap.values()));
        }
      })
      .catch(() => {
        // Fallback already initialized with OFFICIAL_SESSIONS
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

  // Handle return from redirect payment methods
  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    if (paymentIntentId && (redirectStatus === 'succeeded' || !redirectStatus)) {
      setIsProcessing(true);
      fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.registration) {
            setRegistrationRecord(data.registration);
            setCurrentStep(3);
            setIsModalOpen(true);
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.55 },
              colors: ['#D62828', '#F9BC00', '#071A2D', '#22C55E']
            });
          }
        })
        .catch(err => console.error('Redirect verification error:', err))
        .finally(() => setIsProcessing(false));
    }
  }, [searchParams]);

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
    return true;
  });

  const selectedSession = sessions.find(s => s.id === selectedSessionId) || sessions[0] || OFFICIAL_SESSIONS[0];
  const spotsLeft = Math.max(0, selectedSession.capacity - selectedSession.filled);

  // Generate dynamic QR Code data URL when session is selected or mode changes
  useEffect(() => {
    // 1. If in Stripe QR mode and checkout URL is available, generate Stripe QR!
    if (qrMode === 'stripe' && stripeCheckoutUrl) {
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
      return;
    }

    // 2. Custom uploaded QR image for Zelle
    if (paymentSettings?.qrCustomImageUrl) {
      setQrDataUrl(paymentSettings.qrCustomImageUrl);
      return;
    }

    // 3. Dynamic Venmo / Zelle fallback
    if (selectedSession) {
      const recipientName = paymentSettings?.zelleName || 'Challengers Volleyball Academy';
      const amount = selectedSession.price;
      const note = `Athlete: ${formData.playerName || 'Student'} - ${selectedSession.name}`;
      
      let qrPayload = '';
      if (paymentSettings?.venmoHandle) {
        const venmoUser = paymentSettings.venmoHandle.replace('@', '').trim();
        qrPayload = `https://venmo.com/${venmoUser}?txn=pay&amount=${amount}&note=${encodeURIComponent(note)}`;
      } else if (paymentSettings?.zellePhone || paymentSettings?.zelleEmail) {
        qrPayload = `Zelle Pay: ${recipientName} | ${paymentSettings.zellePhone || paymentSettings.zelleEmail} | Amount: $${amount} | Memo: ${note}`;
      } else if (paymentSettings?.upiId) {
        qrPayload = `upi://pay?pa=${paymentSettings.upiId}&pn=${encodeURIComponent(recipientName)}&am=${amount}&cu=USD&tn=${encodeURIComponent(note)}`;
      } else {
        qrPayload = `Challengers Academy | $${amount} | ${note}`;
      }

      QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#071A2D',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [selectedSession, paymentSettings, formData.playerName, stripeCheckoutUrl, qrMode]);

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
  const isMinor = athleteAge !== null && athleteAge < 18;

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
    } else if (field === 'emergencyContactName' || field === 'playerName' || field === 'parentName') {
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

    // 5. Parent / Guardian Name (strictly required if athlete is under 18)
    const currentAge = calculateAge(formData.dob);
    const requiresParent = currentAge !== null && currentAge < 18;
    const trimmedParent = formData.parentName.trim();
    if (requiresParent) {
      if (!trimmedParent) {
        errors.parentName = 'Parent / Guardian name is required for athletes under 18.';
      } else if (/\d/.test(trimmedParent)) {
        errors.parentName = 'Parent/guardian name cannot contain numbers.';
      } else if (trimmedParent.split(/\s+/).length < 2) {
        errors.parentName = 'Please enter parent/guardian first and last name.';
      }
    }

    // 6. Emergency Contact Person & Phone
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

    // 7. Safety Waiver Acceptance
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
          ...formData
        })
      });

      const data = await res.json();
      if (data.success) {
        setClientSecret(data.clientSecret);
        setLeadId(data.leadId);
        setPaymentIntentId(data.paymentIntentId || null);
        setStripeCheckoutUrl(data.checkoutUrl || null);
        setActiveRegistrationId(data.registrationId || null);
        setCardHolderName(formData.parentName || formData.playerName);
        setCurrentStep(2);
      } else {
        alert(data.message || 'Unable to initialize payment checkout. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error initializing payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmQrPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!qrReferenceId.trim() || qrReferenceId.trim().length < 3) {
      setPaymentError('Please enter a valid Transaction ID, UTR, or Reference Number from your payment receipt.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'QR Code',
          transactionId: qrReferenceId.trim(),
          leadId,
          sessionId: selectedSession?.id,
          studentData: formData
        })
      });

      const data = await res.json();
      if (data.success && data.registration) {
        setRegistrationRecord(data.registration);
        setCurrentStep(3);

        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#D62828', '#F9BC00', '#071A2D', '#22C55E']
        });
      } else {
        setPaymentError(data.message || 'Unable to confirm QR payment. Please check your reference ID.');
      }
    } catch (err: any) {
      console.error(err);
      setPaymentError('Network error confirming payment. Please try again.');
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
            <span className="font-bold uppercase tracking-wider text-[11px] block text-amber-800 mb-0.5">
              ⚠️ Important Enrollment Policy:
            </span>
            All coaching program fees and registrations are <strong className="text-amber-950 underline decoration-amber-500 font-black">strictly non-refundable</strong> once enrolled to guarantee court bookings, equipment reservations, and master coach allocations.
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

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectPackage(session.id)}
                  className={`group text-left p-6 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                    isSelected
                      ? 'border-[#D62828] bg-white ring-2 ring-[#D62828]/20 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {session.popular && (
                    <div className="absolute -top-3 right-4 bg-[#D62828] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      Best Value
                    </div>
                  )}

                  <div>
                    {/* Top Row: Category & Fee */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {session.category}
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-serif font-black text-[#D62828] leading-none block">
                          ${session.price}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">
                          {session.priceNote || 'fee'}
                        </span>
                      </div>
                    </div>

                    {/* Course Title */}
                    <h3 className="font-serif font-black text-lg text-slate-900 mb-2 group-hover:text-[#D62828] transition-colors leading-snug">
                      {session.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed font-medium">
                      {session.description}
                    </p>

                    {/* Program Details Chips */}
                    <div className="space-y-1.5 py-3 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#D62828] shrink-0" />
                        <span>{session.sessionDuration} · {session.packageCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Format: <strong className="text-slate-800">{session.students}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{session.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enroll Button - Clean Crimson Accent with high-contrast White Text */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPackage(session.id);
                    }}
                    className="mt-4 w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md bg-[#D62828] hover:bg-[#b01c1c] active:scale-[0.98] text-white"
                  >
                    <span>Select Package</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
              // Clicking outside the modal container closes it
              if (e.target === e.currentTarget) setIsModalOpen(false);
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
                        <strong>Non-Refundable Policy:</strong> Registration fee of <strong>${selectedSession.price}</strong> is final and non-refundable upon submission.
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
                          <div className="bg-white p-4 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-2 max-h-48 overflow-y-auto">
                            <p className="font-bold text-slate-900">1. Assumption of Risk &amp; Physical Activity</p>
                            <p>I acknowledge that volleyball and athletic conditioning carry inherent physical risks including sprains, fractures, and collisions. The athlete is physically cleared to engage in rigorous training.</p>
                            <p className="font-bold text-slate-900">2. Emergency Medical Release</p>
                            <p>I authorize Challengers Volleyball Academy coaches to secure emergency medical treatment or paramedic care if I cannot be reached promptly.</p>
                            <p className="font-bold text-slate-900">3. Strict Non-Refundable Enrollment Policy</p>
                            <p>All fees are 100% non-refundable once registered. Court bookings and coach assignments are finalized upon registration submission.</p>
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
                            I have read, agree to, and accept the <strong>Challengers Volleyball Academy Safety &amp; Liability Waiver</strong>, and acknowledge that all fees (${selectedSession.price}.00) are <strong>strictly non-refundable</strong>. <span className="text-[#D62828]">*</span>
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
                              <span>Proceed to Payment (${selectedSession.price})</span>
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
                        <div>
                          <h3 className="text-xl font-serif font-black text-white">{selectedSession.name}</h3>
                          <p className="text-xs text-white/70">{selectedSession.sessionDuration} · {selectedSession.location}</p>
                          <p className="text-[11px] text-white/60 mt-1">
                            Athlete: <strong className="text-white">{formData.playerName}</strong> ({formData.email})
                          </p>
                        </div>
                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                          <span className="text-3xl font-serif font-black text-[#F9BC00]">${selectedSession.price}.00</span>
                          <span className="text-[10px] text-white/60 block font-bold">Total Non-Refundable Fee</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Selector Tabs */}
                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
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
                        <span>Scan &amp; Pay (QR Code)</span>
                        <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                          Direct
                        </span>
                      </button>

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
                    </div>

                    {/* ── OPTION A: SCAN & PAY VIA QR CODE ── */}
                    {paymentOption === 'qr' && (
                      <div className="space-y-5">
                        {qrMode === 'stripe' ? (
                          /* ───────── SUB-OPTION A1: STRIPE INSTANT MOBILE QR ───────── */
                          <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                <QrCode className="w-4 h-4 text-[#D62828]" />
                                <span>Instant Mobile QR Checkout (Stripe Powered)</span>
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
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Registration Fee</span>
                                    <span className="text-xl font-black text-slate-900">${selectedSession.price}.00 <span className="text-xs font-bold text-slate-500">USD</span></span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Athlete</span>
                                    <span className="text-xs font-bold text-slate-800">{formData.playerName || 'Student Athlete'}</span>
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
                                    Scan with iPhone or Android to pay with Apple Pay, Google Pay, or Card. Both student &amp; admin will receive confirmation emails automatically.
                                  </div>
                                </div>

                                {/* Direct Mobile Link */}
                                {stripeCheckoutUrl && (
                                  <a
                                    href={stripeCheckoutUrl}
                                    className="w-full bg-[#071A2D] hover:bg-[#D62828] text-white py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md text-center cursor-pointer"
                                  >
                                    <Smartphone className="w-4 h-4 text-amber-400" />
                                    <span>Already on Phone? Tap to Open Payment</span>
                                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                                  </a>
                                )}

                                {/* Switch to Zelle manual */}
                                <div className="pt-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setQrMode('zelle')}
                                    className="text-[11px] font-bold text-slate-600 hover:text-[#D62828] transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <span>Prefer manual bank transfer via Zelle or Venmo? Click here</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* ───────── SUB-OPTION A2: MANUAL ZELLE / VENMO TRANSFER ───────── */
                          <form onSubmit={handleConfirmQrPayment} className="space-y-5">
                            <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                  <QrCode className="w-4 h-4 text-[#D62828]" />
                                  <span>Zelle / Direct Banking Transfer</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setQrMode('stripe')}
                                  className="text-[11px] font-bold text-[#D62828] hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                  <span>Back to Stripe Instant QR</span>
                                </button>
                              </div>

                              {/* Payee Details with 1-Click Copy */}
                              <div className="space-y-3 text-xs bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Recipient Account</span>
                                  <strong className="text-slate-900">{paymentSettings.zelleName || 'Wilson Mathew / Challengers Academy'}</strong>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {paymentSettings.zellePhone && (
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                                      <div className="truncate pr-2">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-purple-700 block">Zelle (Phone)</span>
                                        <span className="font-mono font-bold text-slate-800 text-[11px] truncate block">{paymentSettings.zellePhone}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(paymentSettings.zellePhone, 'zelle')}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
                                        title="Copy Zelle Number"
                                      >
                                        {copiedField === 'zelle' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  )}

                                  {paymentSettings.venmoHandle && (
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                                      <div className="truncate pr-2">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 block">Venmo Tag</span>
                                        <span className="font-mono font-bold text-slate-800 text-[11px] truncate block">{paymentSettings.venmoHandle}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(paymentSettings.venmoHandle, 'venmo')}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
                                        title="Copy Venmo Handle"
                                      >
                                        {copiedField === 'venmo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  )}

                                  {paymentSettings.cashAppHandle && (
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                                      <div className="truncate pr-2">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-green-700 block">Cash App $Cashtag</span>
                                        <span className="font-mono font-bold text-slate-800 text-[11px] truncate block">{paymentSettings.cashAppHandle}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(paymentSettings.cashAppHandle, 'cashapp')}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
                                        title="Copy Cash App Handle"
                                      >
                                        {copiedField === 'cashapp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  )}

                                  {paymentSettings.zelleEmail && (
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                                      <div className="truncate pr-2">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-purple-700 block">Zelle (Email)</span>
                                        <span className="font-mono font-bold text-slate-800 text-[11px] truncate block">{paymentSettings.zelleEmail}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(paymentSettings.zelleEmail, 'zelleemail')}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
                                        title="Copy Zelle Email"
                                      >
                                        {copiedField === 'zelleemail' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  )}

                                  <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70 flex items-center justify-between">
                                    <div>
                                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-900 block">Exact Fee Due</span>
                                      <span className="font-black text-slate-900 text-xs">${selectedSession.price}.00 USD</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(String(selectedSession.price), 'price')}
                                      className="p-1.5 text-amber-700 hover:bg-amber-200/60 rounded-lg transition-colors cursor-pointer"
                                      title="Copy Exact Amount"
                                    >
                                      {copiedField === 'price' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Transaction / Reference ID Input */}
                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                                  Transaction ID / Reference Number / UTR <span className="text-[#D62828]">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={qrReferenceId}
                                  onChange={(e) => setQrReferenceId(e.target.value)}
                                  placeholder="e.g. ZEL-982341209384, Venmo ID, or bank ref"
                                  required
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-bold outline-none focus:border-[#D62828] tracking-wider"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  Found on your payment app receipt screen after completing the transfer.
                                </span>
                              </div>
                            </div>

                            {paymentError && (
                              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{paymentError}</span>
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={isProcessing}
                              className="w-full bg-[#D62828] hover:bg-[#b01c1c] text-white py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                                  <span>Verifying Transfer &amp; Enrolling...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 text-white" />
                                  <span>Confirm QR Payment &amp; Complete Enrollment (${selectedSession.price})</span>
                                </>
                              )}
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* ── OPTION B: CREDIT / DEBIT CARD via Real Stripe Elements ── */}
                    {paymentOption === 'card' && (
                      clientSecret ? (
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
                            leadId={leadId}
                            setRegistrationRecord={setRegistrationRecord}
                            setCurrentStep={setCurrentStep}
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
                              <Check className="w-3 h-3" /> PAID (${registrationRecord?.amountPaid || selectedSession.price})
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Athlete Name:</span>
                            <strong className="text-slate-900">{registrationRecord?.playerName || formData.playerName}</strong>
                          </div>

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
                            <strong className="text-slate-900 text-right">{registrationRecord?.location || selectedSession.location}</strong>
                          </div>

                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Payment Method:</span>
                            <strong className="text-slate-900">
                              {registrationRecord?.paymentMethod === 'QR Code' ? 'QR Code Instant Transfer' : (registrationRecord?.paymentMethod || (paymentOption === 'qr' ? 'QR Code Instant Transfer' : 'Credit / Debit Card'))}
                            </strong>
                          </div>

                          {(registrationRecord?.transactionId || qrReferenceId) && (
                            <div className="flex justify-between py-2 border-b border-slate-100">
                              <span className="text-slate-500 font-medium">Transaction / Ref ID:</span>
                              <strong className="text-slate-900 font-mono">{registrationRecord?.transactionId || qrReferenceId}</strong>
                            </div>
                          )}

                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Email Confirmation Sent To:</span>
                            <strong className="text-slate-900">{registrationRecord?.email || formData.email}</strong>
                          </div>

                          <div className="flex justify-between py-2 text-sm pt-2">
                            <span className="font-black text-slate-900">Total Amount Paid:</span>
                            <span className="font-serif font-black text-xl text-[#071A2D]">${registrationRecord?.amountPaid || selectedSession.price}.00</span>
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
  leadId: string | null;
  setRegistrationRecord: (r: any) => void;
  setCurrentStep: (s: 1 | 2 | 3) => void;
  paymentError: string | null;
  setPaymentError: (e: string | null) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

function StripeCardForm({
  selectedSession,
  leadId,
  setRegistrationRecord,
  setCurrentStep,
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

    // 1. Confirm the payment with Stripe - this charges the real card
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      // Stripe declined or error occurred
      setPaymentError(error.message || 'Payment failed. Please check your card details and try again.');
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      // 2. Payment charged - now verify on our server and trigger emails
      try {
        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: 'Card',
            paymentIntentId: paymentIntent.id,
            leadId,
          }),
        });
        const data = await res.json();
        if (data.success && data.registration) {
          setRegistrationRecord(data.registration);
          setCurrentStep(3);
          // Confetti celebration
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#D62828', '#F9BC00', '#071A2D', '#22C55E'],
          });
        } else {
          setPaymentError(data.message || 'Payment was charged but confirmation failed. Please contact support with your payment receipt.');
        }
      } catch (err: any) {
        console.error('Verify payment error:', err);
        setPaymentError('Payment was charged but confirmation failed. Please contact support.');
      }
    } else if (paymentIntent?.status === 'requires_action') {
      setPaymentError('Additional authentication required. Please complete the 3D Secure step.');
    } else {
      setPaymentError(`Payment status: ${paymentIntent?.status}. Please try again.`);
    }

    setIsProcessing(false);
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
        <span className="text-slate-600 font-medium">Total Charge Amount</span>
        <span className="font-black text-[#D62828] text-base">${selectedSession.price}.00 USD</span>
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
            <span>Pay ${selectedSession.price}.00 &amp; Confirm Enrollment</span>
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
