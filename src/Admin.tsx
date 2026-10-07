import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Save, RefreshCcw, Plus, Trash2, ArrowLeft, BarChart3, Settings, Eye, 
  LayoutDashboard, Image as ImageIcon, Users, TrendingUp, Search, 
  ExternalLink, CheckCircle2, Clock, Filter, Trash, LogOut, Shield, UserPlus, Mail, ChevronDown,
  Layers, Edit3, DollarSign, Calendar, MapPin, Check, X, Tag, QrCode, Smartphone, CreditCard, Copy, Upload,
  FileText, Download, Receipt, Sparkles, Menu
} from 'lucide-react';
import { usePerformance } from './PerformanceContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ASSETS } from './assets/images';
import { useAuth } from './hooks/useAuth';
import SessionTimeoutModal from './components/SessionTimeoutModal';
import DownloadStatementModal from './components/DownloadStatementModal';
import { generateBankStatementPdf } from './utils/statementPdfGenerator';

type MediaItem = {
  id: string;
  url: string;
  type: 'image' | 'video';
  title: string;
  description?: string;
  category?: string;
  date?: string;
  createdAt?: number;
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'programs' | 'camps' | 'media' | 'analytics' | 'settings' | 'users'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>([]);
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [newMedia, setNewMedia] = useState({ title: '', url: '', type: 'image', description: '', category: 'Student Spotlight' });
  const [mediaFilePreview, setMediaFilePreview] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('staff');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic Programs State
  const [programs, setPrograms] = useState<any[]>([]);
  const [isEditingProgram, setIsEditingProgram] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programForm, setProgramForm] = useState({
    title: '',
    phase: 'PHASE 01',
    description: '',
    longDescription: '',
    price: 200,
    ageRange: '5 - 10',
    ageGroups: '5-10',
    features: 'Motor Skills, Fun Drills, Basic Rules, Team Play',
    schedule: 'Saturdays & Sundays (9:00 AM - 10:30 AM)',
    location: 'Fremont Arena',
    capacity: 20,
    filled: 0,
    coach: 'Head Coach Wilson Mathew & Team',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1200&auto=format&fit=crop',
    isActive: true,
  });

  // Dynamic Camps State
  const [camps, setCamps] = useState<any[]>([]);
  const [isEditingCamp, setIsEditingCamp] = useState(false);
  const [editingCampId, setEditingCampId] = useState<string | null>(null);
  const [campForm, setCampForm] = useState({
    name: '',
    duration: '7 Days',
    months: 'June & July 2026',
    bestFor: 'Technique Refinement',
    price: 350,
    schedule: 'Mon - Fri (9:00 AM - 1:00 PM)',
    location: 'Fremont Arena',
    capacity: 25,
    filled: 0,
    coach: 'Head Coach Wilson Mathew & Staff',
    description: '',
    isActive: true,
  });

  const [registrationsList, setRegistrationsList] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'card' | 'apple_pay' | 'google_pay' | 'link' | 'qr'>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | 'fremont' | 'mountain_house' | 'san_jose'>('all');
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [copiedStripeId, setCopiedStripeId] = useState<string | null>(null);
  const [isSyncingStripe, setIsSyncingStripe] = useState(false);
  const [isProcessingEmails, setIsProcessingEmails] = useState(false);
  const [onlyRealPayments, setOnlyRealPayments] = useState(true);
  const [isPurgingMock, setIsPurgingMock] = useState(false);
  const [unifiedStatusFilter, setUnifiedStatusFilter] = useState<'confirmed' | 'pending' | 'all'>('confirmed');
  const [trendRange, setTrendRange] = useState<7 | 30>(7);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Live');
  const isFetchingRef = useRef(false);
  const trendScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trendRange === 30 && trendScrollRef.current) {
      setTimeout(() => {
        if (trendScrollRef.current) {
          trendScrollRef.current.scrollLeft = trendScrollRef.current.scrollWidth;
        }
      }, 50);
    }
  }, [trendRange]);

  // Bank Statement PDF Modal & Real-time Export State
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [initialStatementType, setInitialStatementType] = useState<'all' | 'payments_only' | 'leads_only'>('all');
  const [isQuickDownloadingStatement, setIsQuickDownloadingStatement] = useState(false);
  const [statementSuccessToast, setStatementSuccessToast] = useState<string | null>(null);

  // Edit Student Registration Modal State
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);
  const [studentEditForm, setStudentEditForm] = useState({
    playerName: '',
    parentName: '',
    email: '',
    phone: '',
    dob: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalNotes: '',
    paymentStatus: 'PAID',
    paymentMethod: 'Card',
    transactionId: '',
    amountPaid: 0,
    sessionName: '',
    location: '',
    schedule: '',
  });

  // Admin Payment & Stripe Settings State
  const [adminPaymentSettings, setAdminPaymentSettings] = useState<any>({
    enableQrPayment: true,
    enableCardPayment: true
  });
  const [isSavingPaymentSettings, setIsSavingPaymentSettings] = useState(false);
  const [paymentSettingsSaved, setPaymentSettingsSaved] = useState(false);

  // Deduplicate and filter leads safely for clean, non-repetitive administrative viewing
  const deduplicatedLeads = useMemo(() => {
    const map = new Map<string, any>();
    for (const lead of leads) {
      const emailKey = String(lead.email || '').toLowerCase().trim();
      const athleteKey = String(lead.playerName || lead.studentName || lead.fullName || lead.name || '').toLowerCase().trim().replace(/\s+/g, ' ');
      const key = emailKey && athleteKey ? `${emailKey}___${athleteKey}` : (emailKey || lead.id);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, lead);
      } else {
        const isExistingPaid = existing.status === 'confirmed';
        const isCurrentPaid = lead.status === 'confirmed';
        if (!isExistingPaid && isCurrentPaid) {
          map.set(key, { ...existing, ...lead, status: 'confirmed' });
        } else if (new Date(lead.createdAt || 0).getTime() > new Date(existing.createdAt || 0).getTime()) {
          map.set(key, { ...existing, ...lead, status: (isExistingPaid || isCurrentPaid) ? 'confirmed' : (lead.status || existing.status) });
        }
      }
    }
    return Array.from(map.values());
  }, [leads]);

  // Location Matching Helper for 3 Academy Locations
  const matchesLocationFilter = (locRaw: any, filter: string): boolean => {
    if (filter === 'all') return true;
    const l = String(locRaw || 'Fremont (Kerala House)').toLowerCase();
    if (filter === 'fremont') return l.includes('fremont') || l.includes('kerala');
    if (filter === 'mountain_house') return l.includes('mountain') || l.includes('hansen');
    if (filter === 'san_jose') return l.includes('san jose') || l.includes('sanjose') || l.includes('jose');
    return true;
  };

  // Search Query Matching Helper supporting athlete names, contact, codes, programs, and locations
  const matchesSearchQuery = (item: any, query: string): boolean => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    const qNorm = q.replace(/[^a-z0-9]/g, '');

    const loc = String(item.location || item.preferredLocation || 'Fremont (Kerala House)').toLowerCase();
    const locNorm = loc.replace(/[^a-z0-9]/g, '');

    const playerName = String(item.playerName || item.studentName || item.fullName || item.name || '').toLowerCase();
    const parentName = String(item.parentName || '').toLowerCase();
    const email = String(item.email || item.primaryEmail || '').toLowerCase();
    const phone = String(item.phone || '').toLowerCase();
    const sessionName = String(item.sessionName || item.sessionId || item.programId || '').toLowerCase();
    const regId = String(item.registrationId || item.id || '').toLowerCase();
    const stripeId = String(item.stripePaymentIntentId || item.paymentIntentId || item.transactionId || '').toLowerCase();
    const paymentMethod = String(item.paymentMethod || '').toLowerCase();

    return (
      playerName.includes(q) ||
      parentName.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      sessionName.includes(q) ||
      regId.includes(q) ||
      stripeId.includes(q) ||
      paymentMethod.includes(q) ||
      loc.includes(q) ||
      (qNorm.length >= 3 && locNorm.includes(qNorm))
    );
  };

  // Extract truly pending leads that did not complete checkout or pay
  const pendingLeadsList = useMemo(() => {
    return deduplicatedLeads.filter(l => {
      const isPaid = l.status === 'confirmed' || registrationsList.some(r =>
        (r.email && l.email && r.email.toLowerCase().trim() === l.email.toLowerCase().trim() && l.email.includes('@') && !l.email.includes('example.com')) ||
        (r.registrationId && l.registrationId && r.registrationId === l.registrationId) ||
        (r.transactionId && l.paymentIntentId && r.transactionId === l.paymentIntentId) ||
        (r.stripePaymentIntentId && l.paymentIntentId && r.stripePaymentIntentId === l.paymentIntentId)
      );
      return !isPaid;
    }).map(l => ({
      ...l,
      registrationId: l.registrationId || `LEAD-${(l.id || '').slice(-5).toUpperCase() || 'INQ'}`,
      playerName: l.playerName || l.studentName || l.fullName || 'Prospective Athlete',
      sessionName: l.sessionName || l.sessionId || l.programId || 'Inquiry / Session',
      schedule: l.schedule || 'Flexible',
      location: l.location || l.preferredLocation || 'Fremont (Kerala House)',
      amountPaid: l.amount || l.price || 0,
      paymentStatus: 'PENDING_PAYMENT',
      paymentMethod: l.paymentMethod || 'Incomplete Checkout',
      stripePaymentIntentId: l.paymentIntentId || '',
      registeredAt: l.createdAt || Date.now(),
      createdAt: l.createdAt || Date.now(),
      isLead: true,
    }));
  }, [deduplicatedLeads, registrationsList]);

  const displayedLeads = pendingLeadsList;

  const isMockPayment = (reg: any) => {
    const piId = String(reg.stripePaymentIntentId || '').toLowerCase();
    const txId = String(reg.transactionId || '').toLowerCase();
    const regId = String(reg.registrationId || '').toLowerCase();
    const method = String(reg.paymentMethod || '').toLowerCase();

    // Genuine Stripe transactions (pi_..., ch_..., cs_...) are ALWAYS preserved as real!
    if (piId.startsWith('pi_') || txId.startsWith('pi_') || txId.startsWith('ch_') || piId.startsWith('cs_')) {
      return false;
    }

    return (
      piId.startsWith('mock_') ||
      txId.startsWith('mock_') ||
      regId.startsWith('mock_') ||
      method.includes('mock')
    );
  };

  const getRegTimestamp = (r: any): number => {
    if (!r) return 0;
    if (typeof r.registeredAt === 'number') return r.registeredAt;
    if (r.registeredAt) {
      const t = new Date(r.registeredAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (typeof r.createdAt === 'number') return r.createdAt;
    if (r.createdAt) {
      const t = new Date(r.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    return 0;
  };

  // Master Unified Athletes List (Combines Confirmed Registrations & Incomplete Leads with active tab selection)
  const unifiedAthletesList = useMemo(() => {
    const list: any[] = [];

    // 1. Confirmed Paid Registrations
    if (unifiedStatusFilter === 'confirmed' || unifiedStatusFilter === 'all') {
      for (const reg of registrationsList) {
        if (onlyRealPayments && isMockPayment(reg)) continue;
        list.push({ ...reg, isLead: false });
      }
    }

    // 2. Pending Incomplete Leads
    if (unifiedStatusFilter === 'pending' || unifiedStatusFilter === 'all') {
      for (const lead of pendingLeadsList) {
        list.push(lead);
      }
    }

    return list.filter(item => {
      // Payment method filter (applies if not pending, or if pending matched)
      if (paymentFilter !== 'all') {
        const pm = String(item.paymentMethod || '').toLowerCase();
        if (paymentFilter === 'apple_pay' && !pm.includes('apple')) return false;
        if (paymentFilter === 'google_pay' && !pm.includes('google') && !pm.includes('gpay')) return false;
        if (paymentFilter === 'link' && !pm.includes('link')) return false;
        if (paymentFilter === 'qr' && !pm.includes('qr') && !pm.includes('zelle') && !pm.includes('venmo')) return false;
        if (paymentFilter === 'card' && (pm.includes('apple') || pm.includes('google') || pm.includes('link') || pm.includes('qr'))) return false;
      }
      // Filter by Academy Locations
      if (!matchesLocationFilter(item.location || item.preferredLocation, locationFilter)) {
        return false;
      }
      // Filter by Search Query
      if (!matchesSearchQuery(item, regSearchQuery)) {
        return false;
      }
      return true;
    });
  }, [registrationsList, pendingLeadsList, unifiedStatusFilter, onlyRealPayments, paymentFilter, locationFilter, regSearchQuery]);

  const filteredRegistrations = unifiedAthletesList;

  // Compute reactive Registration Trends with complete daily breakdown & visible numbers
  const trendData = useMemo(() => {
    const numDays = trendRange;
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    const realRegs = registrationsList.filter(r => !isMockPayment(r));
    const dataset = onlyRealPayments ? realRegs : registrationsList;

    const days: {
      dayLabel: string;
      dateLabel: string;
      fullDate: string;
      count: number;
      revenue: number;
      isToday: boolean;
      students: string[];
    }[] = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const dayStart = todayMidnight - i * dayMs;
      const dayEnd = dayStart + dayMs;
      const d = new Date(dayStart);

      const dayRegs = dataset.filter(r => {
        const t = getRegTimestamp(r);
        return t >= dayStart && t < dayEnd;
      });

      const dayRevenue = dayRegs.reduce((sum, r) => sum + (Number(r.amountPaid) || 0), 0);
      const isToday = i === 0;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = `${d.getMonth() + 1}/${d.getDate()}`;

      days.push({
        dayLabel: numDays === 7 ? dayName : (i % 5 === 0 || isToday ? monthDay : ''),
        dateLabel: monthDay,
        fullDate: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        count: dayRegs.length,
        revenue: Math.round(dayRevenue),
        isToday,
        students: dayRegs.map(r => r.playerName || 'Student').filter(Boolean)
      });
    }

    const maxCount = Math.max(...days.map(d => d.count), 1);
    const totalCount = days.reduce((sum, d) => sum + d.count, 0);
    const totalRevenue = days.reduce((sum, d) => sum + d.revenue, 0);

    return { days, maxCount, totalCount, totalRevenue };
  }, [trendRange, registrationsList, onlyRealPayments]);

  const pendingLeadsCount = useMemo(() => {
    return deduplicatedLeads.filter(l => {
      const isPaid = l.status === 'confirmed' || registrationsList.some(r =>
        (r.email && l.email && r.email.toLowerCase().trim() === l.email.toLowerCase().trim() && l.email.includes('@') && !l.email.includes('example.com')) ||
        (r.registrationId && l.registrationId && r.registrationId === l.registrationId) ||
        (r.transactionId && l.paymentIntentId && r.transactionId === l.paymentIntentId) ||
        (r.stripePaymentIntentId && l.paymentIntentId && r.stripePaymentIntentId === l.paymentIntentId)
      );
      return !isPaid;
    }).length;
  }, [deduplicatedLeads, registrationsList]);

  const confirmedLeadsCount = deduplicatedLeads.length - pendingLeadsCount;

  // Editable Academy Settings
  const [academySettings, setAcademySettings] = useState(() => {
    const saved = localStorage.getItem('challengers_academy_settings');
    return saved ? JSON.parse(saved) : {
      academyName: 'Challengers Volleyball Academy',
      primaryLocation: 'Fremont & Bay Area, CA',
      supportEmail: 'challengersvolleyballacademy@gmail.com',
      contactPhone: '+1 (510) 909-5834',
      taxRate: 0,
      currency: 'USD ($)',
      allowWaitlist: true,
      autoEmailReceipts: true,
    };
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('challengers_academy_settings', JSON.stringify(academySettings));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPaymentSettings(true);
    const token = getToken();
    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminPaymentSettings)
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSettingsSaved(true);
        setTimeout(() => setPaymentSettingsSaved(false), 3000);
      } else {
        alert(data.message || 'Failed to save payment settings');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving payment settings');
    } finally {
      setIsSavingPaymentSettings(false);
    }
  };

  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminPaymentSettings((prev: any) => ({
          ...prev,
          qrCustomImageUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout, getToken, isOwner } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);


  const fetchData = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    const token = getToken();

    try {
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsRes.status === 401) {
        await logout();
        navigate('/login');
        return;
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.success) {
          setStats(data.stats);
          setLeads(data.leads || []);
          setRegistrationsList(data.registrations || []);
          if (data.gallery?.length) {
            setGalleryItems(data.gallery);
          }
          setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncSuccessMessage(null);
    try {
      await Promise.all([fetchData(), fetchPrograms(), fetchCamps(), isOwner ? fetchAdminUsers() : Promise.resolve()]);
      setSyncSuccessMessage('Database & Stripe Synced!');
      setTimeout(() => setSyncSuccessMessage(null), 3000);
    } catch {
      setSyncSuccessMessage('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncStripe = async () => {
    setIsSyncingStripe(true);
    const token = getToken();
    try {
      const res = await fetch('/api/admin/sync-stripe-payments', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSyncSuccessMessage(data.message || 'Stripe payments synced!');
        await fetchData();
        setTimeout(() => setSyncSuccessMessage(null), 4000);
      } else {
        alert(data.message || 'Stripe sync failed');
      }
    } catch (err: any) {
      alert('Error syncing with Stripe: ' + err.message);
    } finally {
      setIsSyncingStripe(false);
    }
  };

  const handlePurgeMockRecords = async () => {
    if (!confirm('Are you sure you want to permanently delete all mock/test payment records from the database?\n\nThis will remove test enrollments and keep only genuine live payments.')) {
      return;
    }
    setIsPurgingMock(true);
    const token = getToken();
    try {
      const res = await fetch('/api/admin/clean-mock-records', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Purge complete: ${data.message}`);
        await fetchData();
      } else {
        alert(data.message || 'Failed to purge mock records');
      }
    } catch (err: any) {
      alert('Error purging mock records: ' + err.message);
    } finally {
      setIsPurgingMock(false);
    }
  };

  const handleProcessEmailQueue = async () => {
    setIsProcessingEmails(true);
    const token = getToken();
    try {
      const res = await fetch('/api/admin/process-email-queue', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSyncSuccessMessage(`Emails Processed: ${data.sent} sent, ${data.failed} failed (${data.processed} total).`);
        await fetchData();
        setTimeout(() => setSyncSuccessMessage(null), 4000);
      } else {
        alert(data.message || 'Email queue processing failed');
      }
    } catch (err: any) {
      alert('Error processing email queue: ' + err.message);
    } finally {
      setIsProcessingEmails(false);
    }
  };

  const handleCopyStripeId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedStripeId(id);
    setTimeout(() => setCopiedStripeId(null), 2000);
  };

  const handleOpenStatementModal = (type: 'all' | 'payments_only' | 'leads_only' = 'all') => {
    setInitialStatementType(type);
    setIsStatementModalOpen(true);
  };

  const handleQuickDownloadPdf = async (type: 'all' | 'payments_only' | 'leads_only' = 'all') => {
    setIsQuickDownloadingStatement(true);
    try {
      const realRegs = onlyRealPayments ? registrationsList.filter(r => !isMockPayment(r)) : registrationsList;
      const res = await generateBankStatementPdf(realRegs, leads, {
        statementType: type,
        periodLabel: 'Live Dashboard Ledger',
        generatedBy: `${user?.name || 'Administrator'} (${user?.role || 'Admin'})`,
      });
      if (res.success) {
        setStatementSuccessToast(`Statement (${res.filename}) generated successfully!`);
        setTimeout(() => setStatementSuccessToast(null), 4000);
      } else {
        alert(res.error || 'Failed to download statement');
      }
    } catch (e: any) {
      alert(e?.message || 'Error generating statement');
    } finally {
      setIsQuickDownloadingStatement(false);
    }
  };

  const renderPaymentMethodBadge = (reg: any) => {
    const raw = String(reg.paymentMethod || '').toLowerCase();
    if (raw.includes('apple pay') || raw.includes('apple_pay')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-sm border border-slate-700">
          <span className="text-[12px] font-serif leading-none"></span>
          <span>{reg.paymentMethod || 'Apple Pay'}</span>
        </span>
      );
    }
    if (raw.includes('google pay') || raw.includes('google_pay') || raw.includes('gpay')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span>{reg.paymentMethod || 'Google Pay'}</span>
        </span>
      );
    }
    if (raw.includes('link')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#00D66F]/15 text-[#008746] border border-[#00D66F]/30">
          <span className="w-2 h-2 rounded-full bg-[#00D66F] inline-block animate-pulse" />
          <span>Link (Stripe)</span>
        </span>
      );
    }
    if (raw.includes('qr') || raw.includes('zelle') || raw.includes('venmo') || raw.includes('upi')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
          <QrCode className="w-3.5 h-3.5 text-purple-600" />
          <span>{reg.paymentMethod || 'QR Transfer'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
        <CreditCard className="w-3.5 h-3.5 text-slate-600" />
        <span>{reg.paymentMethod || 'Credit / Debit Card'}</span>
      </span>
    );
  };

  const renderEmailStatusBadge = (reg: any) => {
    const status = reg.emailStatus || (reg.email && reg.email.includes('@') && !reg.email.includes('example.com') && reg.email !== 'n/a' ? 'sent' : 'pending');
    if (status === 'sent') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Email Sent</span>
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 cursor-help" title={reg.emailLastError || 'Email delivery failed. Click Retry Email Queue above.'}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>Email Failed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span>Queued</span>
      </span>
    );
  };


  const fetchAdminUsers = async () => {
    const token = getToken();
    try {
      const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAdminUsers(data.users);
    } catch { /* ignore */ }
  };

  const fetchPrograms = async () => {
    const token = getToken();
    try {
      const res = await fetch('/api/admin/programs', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setPrograms(data.programs);
    } catch { /* ignore */ }
  };

  const fetchCamps = async () => {
    const token = getToken();
    try {
      const res = await fetch('/api/admin/camps', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setCamps(data.camps);
    } catch { /* ignore */ }
  };

  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch('/api/payment-settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setAdminPaymentSettings((prev: any) => ({ ...prev, ...data.settings }));
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchPrograms();
      fetchCamps();
      fetchPaymentSettings();
      if (isOwner) fetchAdminUsers();

      // Real-time automatic background synchronization every 10 seconds
      const pollInterval = setInterval(() => {
        fetchData();
      }, 10000);

      // Instant refresh when user returns to the tab or browser window
      const handleWindowFocus = () => {
        if (document.visibilityState === 'visible') {
          fetchData();
        }
      };

      window.addEventListener('focus', handleWindowFocus);
      document.addEventListener('visibilitychange', handleWindowFocus);

      return () => {
        clearInterval(pollInterval);
        window.removeEventListener('focus', handleWindowFocus);
        document.removeEventListener('visibilitychange', handleWindowFocus);
      };
    }
  }, [isAuthenticated, isOwner]);

  const handleOpenAddCamp = () => {
    setEditingCampId(null);
    setCampForm({
      name: '',
      duration: '7 Days',
      months: 'June & July 2026',
      bestFor: 'Technique Refinement',
      price: 350,
      schedule: 'Mon - Fri (9:00 AM - 1:00 PM)',
      location: 'Fremont Arena',
      capacity: 25,
      filled: 0,
      coach: 'Head Coach Wilson Mathew & Staff',
      description: '',
      isActive: true,
    });
    setIsEditingCamp(true);
  };

  const handleOpenEditCamp = (camp: any) => {
    setEditingCampId(camp.id);
    setCampForm({
      name: camp.name || '',
      duration: camp.duration || '7 Days',
      months: camp.months || 'June & July 2026',
      bestFor: camp.bestFor || 'Technique Refinement',
      price: camp.price || 350,
      schedule: camp.schedule || 'Mon - Fri (9:00 AM - 1:00 PM)',
      location: camp.location || 'Fremont Arena',
      capacity: camp.capacity || 25,
      filled: camp.filled || 0,
      coach: camp.coach || 'Head Coach Wilson Mathew & Staff',
      description: camp.description || '',
      isActive: camp.isActive !== false,
    });
    setIsEditingCamp(true);
  };

  const handleSaveCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    const payload = {
      ...campForm,
      price: Number(campForm.price),
      capacity: Number(campForm.capacity),
      filled: Number(campForm.filled),
    };

    try {
      if (editingCampId) {
        await fetch(`/api/admin/camps/${editingCampId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/admin/camps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }
      setIsEditingCamp(false);
      setEditingCampId(null);
      fetchCamps();
    } catch (err) {
      console.error('Failed to save camp:', err);
    }
  };

  const handleDeleteCamp = async (id: string) => {
    if (!confirm('Are you sure you want to delete this summer camp?')) return;
    const token = getToken();
    try {
      await fetch(`/api/admin/camps/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCamps();
    } catch {}
  };

  const handleToggleCampActive = async (camp: any) => {
    const token = getToken();
    const newStatus = !(camp.isActive !== false);
    try {
      await fetch(`/api/admin/camps/${camp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: newStatus })
      });
      fetchCamps();
    } catch {}
  };

  const handleOpenAddProgram = () => {
    setEditingProgramId(null);
    setProgramForm({
      title: '',
      phase: `PHASE 0${programs.length + 1}`,
      description: '',
      longDescription: '',
      price: 200,
      ageRange: '5 - 10',
      ageGroups: '5-10',
      features: 'Motor Skills, Fun Drills, Basic Rules, Team Play',
      schedule: 'Saturdays & Sundays (9:00 AM - 10:30 AM)',
      location: 'Fremont Arena',
      capacity: 20,
      filled: 0,
      coach: 'Head Coach Wilson Mathew & Team',
      image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1200&auto=format&fit=crop',
      isActive: true,
    });
    setIsEditingProgram(true);
  };

  const handleOpenEditProgram = (prog: any) => {
    setEditingProgramId(prog.id);
    setProgramForm({
      title: prog.title || '',
      phase: prog.phase || '',
      description: prog.description || '',
      longDescription: prog.longDescription || '',
      price: prog.price || 200,
      ageRange: prog.ageRange || '5 - 10',
      ageGroups: Array.isArray(prog.ageGroups) ? prog.ageGroups.join(',') : (prog.ageGroups || '5-10'),
      features: Array.isArray(prog.features) ? prog.features.join(', ') : (prog.features || ''),
      schedule: prog.schedule || '',
      location: prog.location || 'Fremont Arena',
      capacity: prog.capacity || 20,
      filled: prog.filled || 0,
      coach: prog.coach || 'Head Coach Wilson Mathew & Team',
      image: prog.image || 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1200&auto=format&fit=crop',
      isActive: prog.isActive !== false,
    });
    setIsEditingProgram(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    const ageGroupsArray = programForm.ageGroups.split(',').map(g => g.trim()).filter(Boolean);
    const featuresArray = programForm.features.split(',').map(f => f.trim()).filter(Boolean);

    const payload = {
      ...programForm,
      price: Number(programForm.price),
      capacity: Number(programForm.capacity),
      filled: Number(programForm.filled),
      ageGroups: ageGroupsArray,
      features: featuresArray,
    };

    try {
      if (editingProgramId) {
        await fetch(`/api/admin/programs/${editingProgramId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/admin/programs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }
      setIsEditingProgram(false);
      setEditingProgramId(null);
      fetchPrograms();
    } catch (err) {
      console.error('Failed to save program:', err);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    const token = getToken();
    try {
      await fetch(`/api/admin/programs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPrograms();
    } catch {}
  };

  const handleToggleProgramActive = async (prog: any) => {
    const token = getToken();
    const newStatus = !(prog.isActive !== false);
    try {
      await fetch(`/api/admin/programs/${prog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: newStatus })
      });
      fetchPrograms();
    } catch {}
  };

  const handleMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = mediaFilePreview || newMedia.url;
    if (!finalUrl) {
      alert('Please select an image file from your device or enter a valid photo URL.');
      return;
    }
    if (!newMedia.title.trim()) {
      alert('Please provide a title or athlete name for this photo.');
      return;
    }

    setIsUploadingMedia(true);
    const token = getToken();

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newMedia.title.trim(),
          url: finalUrl,
          type: newMedia.type,
          description: newMedia.description.trim(),
          category: newMedia.category || 'Student Spotlight'
        })
      });

      const data = await res.json();
      if (data.success && data.item) {
        setGalleryItems(prev => [data.item, ...prev.filter(i => i.id !== data.item.id)]);
        setIsAddingMedia(false);
        setNewMedia({ title: '', url: '', type: 'image', description: '', category: 'Student Spotlight' });
        setMediaFilePreview(null);
      } else {
        alert(data.message || 'Failed to upload photo to gallery');
      }
    } catch (err: any) {
      console.error(err);
      alert('Network error uploading media. Please try again.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this photo from the academy gallery?')) return;
    const token = getToken();
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setGalleryItems(prev => prev.filter(i => i.id !== id));
      } else {
        alert(data.message || 'Failed to delete photo');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error deleting photo');
    }
  };

  const handleAddAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ email: newAdminEmail, name: newAdminName, role: newAdminRole })
      });
      const data = await res.json();
      if (data.success) {
        setNewAdminEmail('');
        setNewAdminName('');
        setNewAdminRole('staff');
        setIsAddingAdmin(false);
        fetchAdminUsers();
      }
    } catch { /* ignore */ }
  };

  const handleDeleteAdminUser = async (id: string) => {
    if (!confirm('Remove this admin user?')) return;
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchAdminUsers();
    } catch { /* ignore */ }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to remove this lead?')) return;
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setLeads(leads.filter(l => l.id !== id));
        if (stats) setStats({ ...stats, totalLeads: stats.totalLeads - 1 });
      }
    } catch (err) { console.error(err); }
  };

  const handleOpenEditStudent = (reg: any) => {
    setEditingStudent(reg);
    setStudentEditForm({
      playerName: reg.playerName || '',
      parentName: reg.parentName || '',
      email: reg.email || '',
      phone: reg.phone || '',
      dob: reg.dob || '',
      emergencyContactName: reg.emergencyContactName || '',
      emergencyContactPhone: reg.emergencyContactPhone || '',
      medicalNotes: reg.medicalNotes || '',
      paymentStatus: reg.paymentStatus || 'PAID',
      paymentMethod: reg.paymentMethod || 'Card',
      transactionId: reg.transactionId || '',
      amountPaid: Number(reg.amountPaid) || 0,
      sessionName: reg.sessionName || reg.sessionId || '',
      location: reg.location || '',
      schedule: reg.schedule || '',
    });
    setIsEditingStudent(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setIsSavingStudent(true);
    const token = getToken();
    const targetId = editingStudent.registrationId || editingStudent._id;

    try {
      const response = await fetch(`/api/admin/registrations/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentEditForm)
      });
      const data = await response.json();
      if (data.success) {
        setRegistrationsList(prev => prev.map(item => {
          if ((item.registrationId && item.registrationId === targetId) || (item._id && item._id === targetId)) {
            return { ...item, ...studentEditForm };
          }
          return item;
        }));
        setIsEditingStudent(false);
        setEditingStudent(null);
      } else {
        alert(data.message || 'Failed to update student details');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving student details');
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleDeleteStudent = async (reg: any) => {
    const studentName = reg.playerName || 'this athlete';
    const regId = reg.registrationId || reg._id;
    if (!confirm(`Are you sure you want to PERMANENTLY delete athlete "${studentName}" (${regId})?\n\nThis will remove their enrollment and records completely. This action cannot be undone.`)) {
      return;
    }

    const token = getToken();
    try {
      const response = await fetch(`/api/admin/registrations/${regId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRegistrationsList(prev => prev.filter(item => 
          item.registrationId !== regId && item._id !== regId
        ));
        if (stats) {
          setStats({
            ...stats,
            totalConfirmed: Math.max(0, stats.totalConfirmed - 1),
            totalRevenue: Math.max(0, stats.totalRevenue - (Number(reg.amountPaid) || 0))
          });
        }
      } else {
        alert(data.message || 'Failed to delete student');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting student');
    }
  };

  const handleResendEmail = async (reg: any) => {
    const regId = reg.registrationId || reg._id;
    const studentName = reg.playerName || 'this athlete';
    const recipientEmail = reg.email || 'customer';

    if (!confirm(`Resend enrollment confirmation and admin notification emails for "${studentName}" (${recipientEmail})?`)) {
      return;
    }

    const token = getToken();
    setResendingEmailId(regId);
    try {
      const response = await fetch(`/api/admin/registrations/${regId}/resend-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Email Dispatch Status:\n\n${data.message}\nCustomer: ${data.details?.recipientEmail}\nAdmin: ${data.details?.adminEmail}`);
      } else {
        alert(`❌ Email dispatch failed: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error resending email:', err);
      alert('Network or server error while dispatching email.');
    } finally {
      setResendingEmailId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (authLoading || isLoading) return (
    <div className="min-h-screen bg-sand/30 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return null;

  return (
    <>
    <SessionTimeoutModal onLogout={handleLogout} onExtend={() => {}} />
    <div className="min-h-screen bg-sand/30 font-sans" data-lenis-prevent="true">
      {/* Desktop Admin Sidebar (Unchanged on Desktop screens) */}
      <aside data-lenis-prevent="true" className="hidden md:block fixed left-0 top-0 h-full w-64 md:w-72 bg-espresso text-white z-50 overflow-y-auto shadow-2xl">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange rounded-xl flex items-center justify-center font-black">C</div>
          <span className="font-condensed font-black tracking-tighter text-2xl uppercase">Admin</span>
        </div>

        {/* User info */}
        <div className="px-8 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center text-orange font-black text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-bold truncate">{user?.name || 'Admin'}</div>
              <div className="text-white/30 text-[9px] uppercase font-black tracking-widest">{user?.role}</div>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-4 space-y-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview', show: true },
            { id: 'programs', icon: Layers, label: 'Programs & Sessions', show: true },
            { id: 'camps', icon: Calendar, label: 'Summer Camps', show: true },
            { id: 'leads', icon: Users, label: 'Leads & Enrollees', show: true },
            { id: 'media', icon: ImageIcon, label: 'Media Library', show: true },
            { id: 'analytics', icon: TrendingUp, label: 'Performance', show: true },
            { id: 'users', icon: Shield, label: 'Admin Users', show: isOwner },
            { id: 'settings', icon: Settings, label: 'Settings', show: true },
          ].filter(i => i.show).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                activeTab === item.id ? 'bg-orange text-white shadow-lg shadow-orange/20' : 'text-white/40 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-left">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 pt-6 pb-8 space-y-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-white/40 hover:text-red-400 transition-colors rounded-xl"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
          </button>
          <NavLink to="/" className="flex items-center gap-4 px-4 py-3 text-white/40 hover:text-white transition-colors rounded-xl">
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Site</span>
          </NavLink>
        </div>
      </aside>

      {/* Mobile Top Navbar (Visible only on mobile devices) */}
      <header className="md:hidden sticky top-0 z-40 bg-espresso text-white px-4 py-3 flex items-center justify-between border-b border-white/10 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5 text-orange" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange rounded-lg flex items-center justify-center font-black text-xs text-white">C</div>
            <span className="font-condensed font-black tracking-tight text-lg uppercase text-white">Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-white/10 rounded-full text-orange border border-white/10">
            {activeTab}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Drag & Close, Slide from Left) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            {/* Draggable Drawer Panel */}
            <motion.div
              drag="x"
              dragConstraints={{ left: -320, right: 0 }}
              dragElastic={{ left: 0.05, right: 0 }}
              onDragEnd={(_e, info) => {
                // Dragged left by more than 50px or swiped with speed closes the drawer
                if (info.offset.x < -50 || info.velocity.x < -200) {
                  setIsMobileMenuOpen(false);
                }
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-[84vw] max-w-[320px] bg-espresso text-white shadow-2xl flex flex-col z-10 touch-pan-y"
              data-lenis-prevent="true"
            >
              {/* Drawer Header with Close & Drag Indicator */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange rounded-xl flex items-center justify-center font-black text-white">C</div>
                  <div>
                    <span className="font-condensed font-black tracking-tight text-xl uppercase block leading-tight text-white">Admin Portal</span>
                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">Swipe left to close</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-95 cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User info */}
              <div className="px-5 py-3.5 bg-white/5 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center text-orange font-black text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-bold truncate">{user?.name || 'Admin'}</div>
                  <div className="text-white/40 text-[9px] uppercase font-black tracking-widest">{user?.role}</div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {[
                  { id: 'overview', icon: LayoutDashboard, label: 'Overview', show: true },
                  { id: 'programs', icon: Layers, label: 'Programs & Sessions', show: true },
                  { id: 'camps', icon: Calendar, label: 'Summer Camps', show: true },
                  { id: 'leads', icon: Users, label: 'Leads & Enrollees', show: true },
                  { id: 'media', icon: ImageIcon, label: 'Media Library', show: true },
                  { id: 'analytics', icon: TrendingUp, label: 'Performance', show: true },
                  { id: 'users', icon: Shield, label: 'Admin Users', show: isOwner },
                  { id: 'settings', icon: Settings, label: 'Settings', show: true },
                ].filter(i => i.show).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                      activeTab === item.id 
                        ? 'bg-orange text-white shadow-lg shadow-orange/20 font-black' 
                        : 'text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-left">{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-white/10 space-y-2 bg-espresso">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors rounded-xl font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                </button>
                <NavLink 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-3 text-white/50 hover:text-white transition-colors rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Back to Site</span>
                </NavLink>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area: Responsive full width on mobile (pl-0), exact fixed sidebar width on desktop (md:pl-64 lg:pl-72) */}
      <main className="pl-0 md:pl-64 lg:pl-72 min-h-screen bg-sand/30">
        <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-6 md:py-12 max-w-[1600px] mx-auto space-y-6 md:space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 pb-2">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-condensed font-black text-espresso uppercase tracking-tighter">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'programs' && 'Programs & Sessions'}
                {activeTab === 'camps' && 'Summer Camps & Clinics'}
                {activeTab === 'leads' && 'Athlete Leads & Enrollees'}
                {activeTab === 'media' && 'Media Assets'}
                {activeTab === 'analytics' && 'Training Analytics'}
                {activeTab === 'settings' && 'App Settings'}
                {activeTab === 'users' && 'Admin Users'}
              </h2>
              <p className="text-espresso/40 text-[10px] font-black uppercase tracking-[0.3em] mt-1.5">Academy Management System v1.0.4</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {statementSuccessToast && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs font-black text-emerald-900 bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-300 shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statementSuccessToast}</span>
                </motion.span>
              )}
              {syncSuccessMessage && (
                <motion.span 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-black text-green-700 bg-green-100 px-3 py-1.5 rounded-xl border border-green-200"
                >
                  ✓ {syncSuccessMessage}
                </motion.span>
              )}

              {/* Live Real-Time Sync Indicator */}
              <div className="hidden lg:inline-flex items-center gap-2 px-3.5 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-black uppercase tracking-wider shadow-xs" title="Auto-synchronizing live data every 10 seconds">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Real-Time • {lastSyncedTime}</span>
              </div>

              {/* Statement PDF Export Button */}
              <button
                type="button"
                onClick={() => handleOpenStatementModal('all')}
                className="px-4 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer border border-slate-700"
                title="Download official bank-statement style PDF of payments and leads"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export Statement (PDF)</span>
                <span className="sm:hidden">Statement</span>
              </button>

              <div className="bg-white p-2 rounded-2xl border border-espresso/5 shadow-sm flex gap-2">
                <button 
                  onClick={handleSyncAll} 
                  disabled={isSyncing}
                  className="w-10 h-10 flex items-center justify-center text-espresso/40 hover:text-orange transition-colors disabled:opacity-50"
                  title="Refresh and sync data"
                >
                  <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-orange' : ''}`} />
                </button>
                <div className="w-px h-6 bg-espresso/5 self-center" />
                <button 
                  onClick={handleSyncAll}
                  disabled={isSyncing} 
                  className="px-6 h-10 bg-espresso text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange transition-all shadow-sm flex items-center gap-2 disabled:opacity-75 cursor-pointer"
                >
                  {isSyncing ? 'Syncing...' : 'Sync Data'}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">


            {activeTab === 'leads' && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* ── UNIFIED ATHLETE ROSTER & CHECKOUT LEADS ── */}
                {(() => {
                  const realConfirmedCount = registrationsList.filter(r => onlyRealPayments ? !isMockPayment(r) : true).length;
                  const pendingCount = pendingLeadsList.length;
                  const allAthletesCount = realConfirmedCount + pendingCount;

                  return (
                    <div className="bg-white rounded-[3rem] border border-espresso/5 shadow-xl overflow-hidden">
                      {/* Top Master Header with View Tabs */}
                      <div className="p-8 sm:p-10 border-b border-espresso/5 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-sand/10">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Athlete Roster &amp; Management</span>
                          </div>
                          <h3 className="text-2xl font-condensed font-black uppercase text-espresso">
                            {unifiedStatusFilter === 'confirmed' 
                              ? `Confirmed Registrations (${realConfirmedCount})` 
                              : unifiedStatusFilter === 'pending'
                                ? `Incomplete Checkout Leads (${pendingCount})`
                                : `All Athletes & Leads (${allAthletesCount})`}
                          </h3>
                          <p className="text-espresso/50 text-xs font-medium mt-0.5">
                            {unifiedStatusFilter === 'confirmed'
                              ? 'All genuine Stripe-verified enrollee checkouts (Card, Apple Pay, Google Pay, Link) and confirmed payments.'
                              : unifiedStatusFilter === 'pending'
                                ? 'Prospective athletes who entered their info at checkout but did not complete final payment.'
                                : 'Master unified view containing both paid enrollees and open checkout inquiries.'}
                          </p>
                        </div>

                        {/* Top Action Controls */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Master Status Filter Tabs */}
                          <div className="flex items-center bg-white p-1 rounded-2xl border border-espresso/10 shadow-sm">
                            <button
                              type="button"
                              onClick={() => setUnifiedStatusFilter('confirmed')}
                              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                unifiedStatusFilter === 'confirmed'
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : 'text-espresso/60 hover:text-espresso'
                              }`}
                            >
                              ✓ Confirmed Paid ({realConfirmedCount})
                            </button>
                            <button
                              type="button"
                              onClick={() => setUnifiedStatusFilter('pending')}
                              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                unifiedStatusFilter === 'pending'
                                  ? 'bg-amber-500 text-white shadow-md'
                                  : 'text-espresso/60 hover:text-espresso'
                              }`}
                            >
                              ⏳ Pending Leads ({pendingCount})
                            </button>
                            <button
                              type="button"
                              onClick={() => setUnifiedStatusFilter('all')}
                              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                unifiedStatusFilter === 'all'
                                  ? 'bg-espresso text-white shadow-md'
                                  : 'text-espresso/60 hover:text-espresso'
                              }`}
                            >
                              All ({allAthletesCount})
                            </button>
                          </div>

                          {/* Real vs All Payments Toggle */}
                          <button
                            type="button"
                            onClick={() => setOnlyRealPayments(prev => !prev)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border cursor-pointer ${
                              onlyRealPayments 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                                : 'bg-sand/30 text-espresso/60 border-espresso/10 hover:bg-sand/60'
                            }`}
                            title="Toggle to hide test/mock records and display only genuine paid checkouts"
                          >
                            <span className={`w-2 h-2 rounded-full ${onlyRealPayments ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            <span>{onlyRealPayments ? 'Real Payments Only' : 'Showing All'}</span>
                          </button>

                          {/* Statement Export Button */}
                          <div className="flex items-center gap-1.5 bg-emerald-50/80 p-1 rounded-2xl border border-emerald-200">
                            <button
                              type="button"
                              onClick={() => handleOpenStatementModal(unifiedStatusFilter === 'pending' ? 'leads_only' : 'payments_only')}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                              title="Open statement export modal with custom filters"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{unifiedStatusFilter === 'pending' ? 'Export Leads PDF' : 'Download Statement (PDF)'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickDownloadPdf(unifiedStatusFilter === 'pending' ? 'leads_only' : 'payments_only')}
                              disabled={isQuickDownloadingStatement}
                              className="p-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                              title="Instant 1-Click Quick Download"
                            >
                              {isQuickDownloadingStatement ? (
                                <div className="w-3.5 h-3.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Sync With Stripe */}
                          <button
                            onClick={handleSyncStripe}
                            disabled={isSyncingStripe}
                            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                            title="Directly pull and match all successful transactions from Stripe API"
                          >
                            <RefreshCcw className={`w-3.5 h-3.5 ${isSyncingStripe ? 'animate-spin text-orange' : ''}`} />
                            <span>{isSyncingStripe ? 'Syncing...' : 'Sync Stripe'}</span>
                          </button>

                          {/* Purge Test Records */}
                          <button
                            type="button"
                            onClick={handlePurgeMockRecords}
                            disabled={isPurgingMock}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                            title="Permanently remove mock / test records from database"
                          >
                            <Trash className="w-3.5 h-3.5" />
                            <span>{isPurgingMock ? 'Purging...' : 'Purge Tests'}</span>
                          </button>

                          {/* Retry Email Queue */}
                          <button
                            type="button"
                            onClick={handleProcessEmailQueue}
                            disabled={isProcessingEmails}
                            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                            title="Process and retry all pending or failed email notifications"
                          >
                            <Mail className={`w-3.5 h-3.5 ${isProcessingEmails ? 'animate-bounce text-blue-600' : ''}`} />
                            <span>{isProcessingEmails ? 'Retrying...' : 'Retry Emails'}</span>
                          </button>
                        </div>
                      </div>

                      {/* ── Filter and Search Bar ── */}
                      <div className="px-8 py-4 bg-white border-b border-espresso/5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        {/* Payment Method Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 no-scrollbar text-xs font-bold">
                          {[
                            { id: 'all', label: `All Methods (${registrationsList.filter(r => onlyRealPayments ? !isMockPayment(r) : true).length})` },
                            { id: 'card', label: '💳 Cards' },
                            { id: 'apple_pay', label: ' Apple Pay' },
                            { id: 'google_pay', label: 'GPay' },
                            { id: 'link', label: '🟢 Link' },
                            { id: 'qr', label: '📱 QR Code' },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setPaymentFilter(tab.id as any)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                                paymentFilter === tab.id
                                  ? 'bg-[#D62828] text-white shadow-sm font-black'
                                  : 'bg-sand/30 text-espresso/60 hover:bg-sand/60 hover:text-espresso'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        {/* Location Filter & Search Field */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* Location Dropdown */}
                          <div className="relative">
                            <MapPin className="w-3.5 h-3.5 text-espresso/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                              value={locationFilter}
                              onChange={(e) => setLocationFilter(e.target.value as any)}
                              className={`pl-8 pr-8 py-1.5 text-xs font-bold rounded-xl border outline-none transition-all cursor-pointer appearance-none ${
                                locationFilter !== 'all'
                                  ? 'bg-orange/10 border-orange text-orange font-black shadow-xs'
                                  : 'bg-sand/20 hover:bg-sand/30 border-espresso/10 text-espresso'
                              }`}
                              title="Filter by Academy Location"
                            >
                              <option value="all">📍 All 3 Locations</option>
                              <option value="fremont">Fremont (Kerala House)</option>
                              <option value="mountain_house">Mountain House (Hansen)</option>
                              <option value="san_jose">San Jose</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-espresso/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>

                          {/* Search Field */}
                          <div className="relative min-w-[240px] sm:min-w-[280px]">
                            <Search className="w-3.5 h-3.5 text-espresso/40 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search athlete, location, email, Stripe ID..."
                              value={regSearchQuery}
                              onChange={(e) => setRegSearchQuery(e.target.value)}
                              className="w-full bg-sand/20 border border-espresso/10 rounded-xl pl-9 pr-7 py-1.5 text-xs text-espresso outline-none focus:border-[#D62828] transition-all font-medium"
                            />
                            {regSearchQuery && (
                              <button
                                onClick={() => setRegSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-espresso/40 hover:text-espresso cursor-pointer"
                                title="Clear search"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Active Filter Bar & Quick Location Chips */}
                      <div className="px-8 py-2.5 bg-sand/10 border-b border-espresso/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider text-espresso/50 mr-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-orange" /> Location:
                          </span>
                          {[
                            { label: 'All', query: '', filterId: 'all' },
                            { label: 'Fremont', query: 'Fremont', filterId: 'fremont' },
                            { label: 'Mountain House', query: 'Mountain House', filterId: 'mountain_house' },
                            { label: 'San Jose', query: 'San Jose', filterId: 'san_jose' },
                          ].map((item) => {
                            const isActive = 
                              (item.filterId === 'all' && locationFilter === 'all' && !regSearchQuery) ||
                              (item.filterId !== 'all' && (locationFilter === item.filterId || regSearchQuery.toLowerCase() === item.query.toLowerCase()));
                            return (
                              <button
                                key={item.label}
                                type="button"
                                onClick={() => {
                                  if (item.filterId === 'all') {
                                    setLocationFilter('all');
                                    setRegSearchQuery('');
                                  } else {
                                    if (locationFilter === item.filterId || regSearchQuery.toLowerCase() === item.query.toLowerCase()) {
                                      setLocationFilter('all');
                                      setRegSearchQuery('');
                                    } else {
                                      setLocationFilter('all');
                                      setRegSearchQuery(item.query);
                                    }
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                                  isActive
                                    ? 'bg-orange text-white border-orange shadow-xs font-black'
                                    : 'bg-white hover:bg-sand/30 text-espresso/70 border-espresso/10'
                                }`}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-espresso/60">
                            Showing {unifiedAthletesList.length} {unifiedStatusFilter === 'confirmed' ? 'enrollees' : unifiedStatusFilter === 'pending' ? 'leads' : 'athletes'}
                          </span>
                          {(locationFilter !== 'all' || regSearchQuery || paymentFilter !== 'all') && (
                            <button
                              type="button"
                              onClick={() => {
                                setLocationFilter('all');
                                setRegSearchQuery('');
                                setPaymentFilter('all');
                              }}
                              className="text-[11px] font-bold text-[#D62828] hover:underline cursor-pointer"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Unified Athletes Table */}
                      <div 
                        data-lenis-prevent="true"
                        className="overflow-x-auto overflow-y-auto admin-table-scroll max-h-[620px] border-t border-espresso/5"
                      >
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 z-10 bg-[#FBF9F6] shadow-sm">
                            <tr className="bg-[#FBF9F6] text-[10px] font-black uppercase tracking-widest text-espresso/50 border-b border-espresso/10">
                              <th className="px-8 py-4 bg-[#FBF9F6]">Athlete &amp; Code</th>
                              <th className="px-6 py-4 bg-[#FBF9F6]">Program / Session</th>
                              <th className="px-6 py-4 bg-[#FBF9F6]">Amount</th>
                              <th className="px-6 py-4 bg-[#FBF9F6]">Customer Contact</th>
                              <th className="px-6 py-4 bg-[#FBF9F6]">Status &amp; Method</th>
                              <th className="px-6 py-4 bg-[#FBF9F6]">Stripe / Ref ID</th>
                              <th className="px-6 py-4 bg-[#FBF9F6]">Date</th>
                              <th className="px-8 py-4 bg-[#FBF9F6] text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-espresso/5">
                            {unifiedAthletesList.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="px-8 py-16 text-center text-espresso/40 italic text-xs">
                                  {regSearchQuery || paymentFilter !== 'all' || locationFilter !== 'all'
                                    ? `No ${unifiedStatusFilter} records match your current filter criteria${regSearchQuery ? ` ("${regSearchQuery}")` : ''}${locationFilter !== 'all' ? ` in ${locationFilter.replace('_', ' ')}` : ''}.`
                                    : unifiedStatusFilter === 'confirmed'
                                      ? onlyRealPayments 
                                        ? 'No live payments found. Click "Sync Stripe" above to pull recent transactions.' 
                                        : 'No confirmed registrations found.'
                                      : unifiedStatusFilter === 'pending'
                                        ? 'No pending leads! All inquiries have either completed payment or been resolved.'
                                        : 'No athlete records found.'}
                                </td>
                              </tr>
                            ) : unifiedAthletesList.map((item) => {
                              const stripeTxId = item.stripePaymentIntentId || item.transactionId || '';
                              const isLead = !!item.isLead;

                              return (
                                <tr key={item.registrationId || item.id || item._id} className="hover:bg-sand/5 transition-colors group">
                                  {/* Athlete & Code */}
                                  <td className="px-8 py-5">
                                    <div className="flex items-center gap-3.5">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                        isLead ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'
                                      }`}>
                                        {item.playerName?.charAt(0) || 'A'}
                                      </div>
                                      <div>
                                        <div className="text-sm font-bold text-espresso">
                                          {item.playerName}
                                          {item.hasSibling && (
                                            <span className="ml-1.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                                              + Sibling ({item.siblingName || 'Sibling'})
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                                            isLead ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-espresso/5 text-espresso'
                                          }`}>
                                            {item.registrationId}
                                          </span>
                                          {isLead && (
                                            <span className="text-[8px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                              Lead
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Program / Session */}
                                  <td className="px-6 py-5">
                                    <div className="text-xs font-bold text-espresso">{item.sessionName || item.sessionId}</div>
                                    <div className="text-[10px] text-espresso/50 font-medium">
                                      {item.schedule || 'Flexible'} · {item.location || item.preferredLocation || 'Fremont (Kerala House)'}
                                    </div>
                                  </td>

                                  {/* Amount */}
                                  <td className="px-6 py-5">
                                    {isLead ? (
                                      <span className="text-xs font-bold text-espresso/40">
                                        ${item.amountPaid || '0'}{' '}
                                        <span className="text-[9px] uppercase font-bold text-amber-600">(Unpaid)</span>
                                      </span>
                                    ) : (
                                      <span className="text-sm font-black text-green-600 font-mono">
                                        ${item.amountPaid}
                                      </span>
                                    )}
                                  </td>

                                  {/* Customer Contact */}
                                  <td className="px-6 py-5">
                                    <div className="text-xs font-bold text-espresso">{item.email || 'No email'}</div>
                                    <div className="text-[10px] text-espresso/50 mb-1">{item.phone || 'No phone'}</div>
                                    <div>
                                      {isLead ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                          <span>Checkout Drop-off</span>
                                        </span>
                                      ) : (
                                        renderEmailStatusBadge(item)
                                      )}
                                    </div>
                                  </td>

                                  {/* Status & Method */}
                                  <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1.5">
                                      {isLead ? (
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                                          <Clock className="w-3 h-3" /> PENDING PAYMENT
                                        </span>
                                      ) : (
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                                          <CheckCircle2 className="w-3 h-3" /> {item.paymentStatus || 'PAID'}
                                        </span>
                                      )}
                                      <div>
                                        {isLead ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold text-espresso/50 bg-sand/30">
                                            Checkout Incomplete
                                          </span>
                                        ) : (
                                          renderPaymentMethodBadge(item)
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Stripe / Ref ID */}
                                  <td className="px-6 py-5">
                                    {stripeTxId ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-[11px] text-slate-700 max-w-[140px] truncate" title={stripeTxId}>
                                          {stripeTxId}
                                        </span>
                                        <button
                                          onClick={() => handleCopyStripeId(stripeTxId)}
                                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                          title="Copy ID"
                                        >
                                          {copiedStripeId === stripeTxId ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-espresso/30 text-xs italic">—</span>
                                    )}
                                  </td>

                                  {/* Date */}
                                  <td className="px-6 py-5 text-xs text-espresso/40 font-medium">
                                    {item.registeredAt || item.createdAt 
                                      ? new Date(item.registeredAt || item.createdAt).toLocaleDateString() 
                                      : 'Recent'}
                                  </td>

                                  {/* Actions */}
                                  <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {isLead ? (
                                        <>
                                          {item.email && (
                                            <a
                                              href={`mailto:${item.email}?subject=Challengers%20Volleyball%20Academy%20Enrollment`}
                                              className="p-2 text-espresso/40 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                                              title="Email Lead"
                                            >
                                              <Mail className="w-4 h-4" />
                                            </a>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteLead(item.id)}
                                            className="p-2 text-espresso/40 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                            title="Delete Lead"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleResendEmail(item)}
                                            disabled={resendingEmailId === (item.registrationId || item._id)}
                                            className="p-2 text-espresso/40 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                            title="Resend Confirmation Email"
                                          >
                                            {resendingEmailId === (item.registrationId || item._id) ? (
                                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                              <Mail className="w-4 h-4" />
                                            )}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditStudent(item)}
                                            className="p-2 text-espresso/40 hover:text-espresso hover:bg-espresso/5 rounded-xl transition-all cursor-pointer"
                                            title="Edit Student Details"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteStudent(item)}
                                            className="p-2 text-espresso/40 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                            title="Delete Permanently"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(() => {
                    const realRegs = registrationsList.filter(r => !isMockPayment(r));
                    const activeRegs = onlyRealPayments ? realRegs : registrationsList;
                    const computedRevenue = activeRegs.reduce((acc, r) => acc + (Number(r.amountPaid) || 0), 0);

                    const nowMs = Date.now();
                    const startOfTodayMs = new Date().setHours(0, 0, 0, 0);
                    const todayRegs = activeRegs.filter(r => {
                      const t = getRegTimestamp(r);
                      return t >= startOfTodayMs || (nowMs - t <= 24 * 60 * 60 * 1000);
                    });
                    const todayCount = todayRegs.length > 0 ? todayRegs.length : (stats?.recentGrowth ?? 0);
                    const todayChangeText = todayRegs.length > 0 ? `${todayRegs.length} new today` : 'Last 24h';

                    return [
                      { label: 'Total Inquiries & Leads', value: stats?.totalLeads ?? leads.length, change: `${leads.length} active`, icon: Users, color: 'orange' },
                      { label: 'Confirmed Athletes', value: activeRegs.length, change: `${activeRegs.length} enrollees`, icon: CheckCircle2, color: 'yellow' },
                      { label: 'Live Revenue', value: `$${Math.round(computedRevenue * 100) / 100}`, change: 'Stripe Verified', icon: BarChart3, color: 'espresso' },
                      { label: 'Registrations (Today)', value: todayCount, change: todayChangeText, icon: Clock, color: 'orange' },
                    ];
                  })().map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-espresso/5 shadow-xl shadow-espresso/5">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl bg-${stat.color === 'orange' ? 'orange' : stat.color === 'yellow' ? 'yellow' : 'espresso'} text-white`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">{stat.change}</span>
                      </div>
                      <div className="text-3xl font-condensed font-black text-espresso mb-1">{stat.value}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-espresso/40">{stat.label}</div>
                    </div>
                  ))}
                </div>


                {/* Main Activity Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-6 sm:p-10 rounded-[3rem] border border-espresso/5 shadow-xl flex flex-col justify-between min-w-0 overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-condensed font-black uppercase text-espresso">Registration Trends</h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange/10 text-orange">
                            {trendData.totalCount} Enrolled
                          </span>
                        </div>
                        <p className="text-xs text-espresso/50 font-medium">
                          Daily athlete sign-ups and enrollment velocity across the last {trendRange} days.
                          {trendRange === 30 && (
                            <span className="ml-2 inline-block text-[10px] text-orange font-black">
                              (← Scroll horizontally inside box →)
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Interactive Time Filter */}
                      <div className="flex items-center bg-sand/30 p-1 rounded-2xl border border-espresso/5 shrink-0 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setTrendRange(7)}
                          className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                            trendRange === 7 
                              ? 'bg-espresso text-white shadow-md' 
                              : 'text-espresso/60 hover:text-espresso'
                          }`}
                        >
                          7 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => setTrendRange(30)}
                          className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                            trendRange === 30 
                              ? 'bg-espresso text-white shadow-md' 
                              : 'text-espresso/60 hover:text-espresso'
                          }`}
                        >
                          30 Days
                        </button>
                      </div>
                    </div>

                    {/* Chart Body Container with bounded overflow and inner horizontal scroll */}
                    <div className="relative bg-sand/15 rounded-[2.5rem] p-4 sm:p-7 border border-espresso/5 overflow-hidden">
                      <div
                        ref={trendScrollRef}
                        data-lenis-prevent="true"
                        className="overflow-x-auto admin-table-scroll pb-1"
                      >
                        <div className={`relative ${trendRange === 30 ? 'min-w-[860px] px-2' : 'w-full'}`}>
                          {/* Y-axis guidelines */}
                          <div className="absolute inset-x-2 sm:inset-x-4 top-6 bottom-16 pointer-events-none flex flex-col justify-between opacity-20">
                            <div className="border-b border-dashed border-espresso w-full flex justify-between">
                              <span className="text-[9px] font-bold font-mono -mt-2.5 text-espresso">{trendData.maxCount}</span>
                            </div>
                            <div className="border-b border-dashed border-espresso w-full flex justify-between">
                              <span className="text-[9px] font-bold font-mono -mt-2.5 text-espresso">{Math.round(trendData.maxCount / 2)}</span>
                            </div>
                            <div className="border-b border-espresso w-full flex justify-between">
                              <span className="text-[9px] font-bold font-mono -mt-2.5 text-espresso">0</span>
                            </div>
                          </div>

                          {/* Bars Container */}
                          <div className="h-56 w-full flex items-end justify-between gap-1 sm:gap-2.5 pt-6 pb-2 relative z-10">
                            {trendData.days.map((day, idx) => {
                              const isHovered = hoveredTrendIndex === idx;
                              const heightPct = day.count > 0 
                                ? Math.max(14, Math.round((day.count / trendData.maxCount) * 100))
                                : 6;

                              return (
                                <div
                                  key={idx}
                                  onMouseEnter={() => setHoveredTrendIndex(idx)}
                                  onMouseLeave={() => setHoveredTrendIndex(null)}
                                  className={`flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer ${
                                    trendRange === 30 ? 'min-w-[24px]' : ''
                                  }`}
                                >
                                  {/* Numbers above the bar — ALWAYS PROMINENTLY VISIBLE */}
                                  <div className={`mb-2 text-[10px] sm:text-xs font-black transition-all ${
                                    day.count > 0 
                                      ? (day.isToday ? 'text-[#D62828] scale-110 font-mono font-black' : 'text-espresso font-mono font-black') 
                                      : 'text-espresso/25 font-mono'
                                  }`}>
                                    {day.count}
                                  </div>

                                  {/* Bar Column */}
                                  <div 
                                    className={`w-full ${trendRange === 30 ? 'max-w-[26px] sm:max-w-[32px]' : 'max-w-[42px]'} bg-sand/30 rounded-t-xl overflow-hidden flex flex-col justify-end`} 
                                    style={{ height: '100%' }}
                                  >
                                    <div
                                      className={`w-full rounded-t-xl transition-all duration-300 relative ${
                                        day.count > 0
                                          ? (day.isToday 
                                              ? 'bg-gradient-to-t from-[#D62828] to-[#F3722C] shadow-md shadow-[#D62828]/25 group-hover:brightness-110' 
                                              : 'bg-orange/80 group-hover:bg-orange shadow-sm')
                                          : 'bg-espresso/10 group-hover:bg-espresso/20'
                                      }`}
                                      style={{ height: `${heightPct}%` }}
                                    >
                                      {day.isToday && day.count > 0 && (
                                        <div className="absolute top-1 inset-x-0 h-1 bg-white/40 rounded-full mx-1" />
                                      )}
                                    </div>
                                  </div>

                                  {/* Day & Date Labels Underneath — ALWAYS VISIBLE */}
                                  <div className="mt-3 text-center">
                                    {trendRange === 7 ? (
                                      <>
                                        <div className={`text-[10px] sm:text-[11px] font-black uppercase ${
                                          day.isToday ? 'text-[#D62828]' : 'text-espresso/70'
                                        }`}>
                                          {day.isToday ? 'Today' : day.dayLabel}
                                        </div>
                                        <div className="text-[9px] font-bold text-espresso/40">
                                          {day.dateLabel}
                                        </div>
                                      </>
                                    ) : (
                                      <div className={`text-[9px] font-bold ${
                                        day.isToday ? 'text-[#D62828] font-black' : 'text-espresso/60'
                                      }`}>
                                        {day.isToday ? 'Today' : (day.dateLabel || day.dayLabel)}
                                      </div>
                                    )}
                                  </div>

                                  {/* Tooltip on Hover */}
                                  {isHovered && (
                                    <div className="absolute bottom-full mb-8 z-30 bg-espresso text-white px-3.5 py-2.5 rounded-2xl shadow-2xl text-left pointer-events-none whitespace-nowrap border border-white/10 -translate-x-1/2 left-1/2">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-orange">
                                          {day.fullDate}
                                        </span>
                                        {day.isToday && (
                                          <span className="text-[8px] font-black uppercase px-1.5 py-0.2 bg-[#D62828] text-white rounded-full">
                                            Today
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm font-black text-white">
                                        {day.count} {day.count === 1 ? 'Registration' : 'Registrations'}
                                      </div>
                                      {day.revenue > 0 && (
                                        <div className="text-[10px] font-mono font-bold text-green-400 mt-0.5">
                                          ${day.revenue} revenue
                                        </div>
                                      )}
                                      {day.students.length > 0 && (
                                        <div className="mt-1 text-[9px] text-white/60 truncate max-w-[160px]">
                                          {day.students.slice(0, 2).join(', ')}{day.students.length > 2 ? ` +${day.students.length - 2} more` : ''}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-espresso/5 text-xs">
                      <div className="flex items-center gap-4 text-espresso/60 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#D62828]" /> Today
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-orange/80" /> Prior Days
                        </span>
                      </div>
                      <div className="font-bold text-espresso/80">
                        Total Enrolled: <span className="font-mono text-espresso font-black">{trendData.totalCount}</span>
                        {trendData.totalRevenue > 0 && (
                          <span className="ml-2">| Revenue: <span className="font-mono text-green-600 font-black">${trendData.totalRevenue}</span></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-10 rounded-[3rem] border border-espresso/5 shadow-xl">
                    <h3 className="text-xl font-condensed font-black uppercase text-espresso mb-8">Recent Enrollees</h3>
                    <div className="space-y-5">
                      {registrationsList.length === 0 ? (
                        <p className="text-xs text-espresso/40 italic text-center py-8">No enrollees yet today.</p>
                      ) : registrationsList.slice(0, 5).map((reg, idx) => (
                        <div key={reg.registrationId || idx} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                            {reg.playerName?.charAt(0) || 'A'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-espresso truncate">{reg.playerName}</div>
                            <div className="text-[9px] text-espresso/40 uppercase font-black">{reg.sessionName || reg.sessionId}</div>
                          </div>
                          <span className="text-xs font-black text-green-600 font-mono">${reg.amountPaid}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'media' && (
              <motion.div
                key="media"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-orange/10 text-orange px-2.5 py-0.5 rounded-full">
                        Live Visual Archives
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-espresso/5 text-espresso/60 px-2.5 py-0.5 rounded-full">
                        {galleryItems.length} Photos Online
                      </span>
                    </div>
                    <h3 className="text-2xl font-condensed font-black text-espresso uppercase">
                      Media Library &amp; Student Archives
                    </h3>
                    <p className="text-xs text-espresso/50 mt-0.5">
                      Upload student portraits, team drills, tournament victories, and match photos directly to MongoDB.
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setIsAddingMedia(!isAddingMedia);
                      setMediaFilePreview(null);
                    }}
                    className="bg-orange text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-espresso transition-all shadow-lg shadow-orange/20 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Upload Student Photo
                  </button>
                </div>

                {/* Upload Modal / Form */}
                {isAddingMedia && (
                  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border-2 border-orange/30 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-espresso/10">
                      <div>
                        <h4 className="text-xl font-condensed font-black uppercase text-espresso">
                          Add New Photo to Academy Gallery
                        </h4>
                        <p className="text-xs text-espresso/40 mt-0.5">
                          Upload directly from your smartphone, tablet, or laptop into the public gallery.
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsAddingMedia(false);
                          setMediaFilePreview(null);
                        }} 
                        className="w-8 h-8 rounded-full bg-sand/40 hover:bg-sand flex items-center justify-center text-espresso/60 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleAddMedia} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: File Picker & Live Preview */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/60 block">
                            Photo Source <span className="text-orange">*</span>
                          </label>

                          <div className="border-2 border-dashed border-espresso/15 rounded-3xl p-6 text-center hover:border-orange/60 transition-colors bg-sand/10">
                            {mediaFilePreview ? (
                              <div className="space-y-3">
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 max-h-56 mx-auto border border-espresso/10 shadow-sm">
                                  <img 
                                    src={mediaFilePreview} 
                                    alt="Upload preview" 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setMediaFilePreview(null)}
                                  className="text-[10px] font-black uppercase text-red-600 hover:text-red-800"
                                >
                                  Remove &amp; Choose Different Photo
                                </button>
                              </div>
                            ) : (
                              <div className="py-6 space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-orange/10 text-orange flex items-center justify-center mx-auto">
                                  <Upload className="w-7 h-7" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-espresso">
                                    Click to select student photo from device
                                  </p>
                                  <p className="text-[10px] text-espresso/40 mt-1">
                                    JPG, PNG, WEBP from camera roll or files (up to 50MB)
                                  </p>
                                </div>
                                <label className="inline-flex items-center gap-1.5 bg-espresso text-white hover:bg-orange px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow transition-all">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Choose File</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleMediaFileUpload} 
                                    className="hidden" 
                                  />
                                </label>
                              </div>
                            )}
                          </div>

                          {/* Fallback to Image URL */}
                          {!mediaFilePreview && (
                            <div className="space-y-1 pt-1">
                              <label className="text-[9px] font-black uppercase tracking-wider text-espresso/40">
                                Or enter external image URL
                              </label>
                              <input 
                                value={newMedia.url}
                                onChange={e => setNewMedia({ ...newMedia, url: e.target.value })}
                                className="w-full bg-ivory border-0 rounded-xl px-4 py-2.5 text-xs font-medium text-espresso" 
                                placeholder="https://images.unsplash.com/... or https://..."
                              />
                            </div>
                          )}
                        </div>

                        {/* Right: Metadata & Information */}
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-espresso/60">
                              Photo Title / Athlete Name <span className="text-orange">*</span>
                            </label>
                            <input 
                              required
                              value={newMedia.title}
                              onChange={e => setNewMedia({ ...newMedia, title: e.target.value })}
                              className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-xs font-bold text-espresso" 
                              placeholder="e.g. Maya Lin - Jump Spike Drill"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-espresso/60">
                                Category Tag
                              </label>
                              <select 
                                value={newMedia.category}
                                onChange={e => setNewMedia({ ...newMedia, category: e.target.value })}
                                className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-xs font-bold text-espresso"
                              >
                                <option value="Student Spotlight">Student Spotlight</option>
                                <option value="Tournament & Matches">Tournament &amp; Matches</option>
                                <option value="Training & Drills">Training &amp; Drills</option>
                                <option value="Summer Camp">Summer Camp</option>
                                <option value="Coaching & Technique">Coaching &amp; Technique</option>
                                <option value="Youth Academy">Youth Academy</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-espresso/60">
                                Media Type
                              </label>
                              <select 
                                value={newMedia.type}
                                onChange={e => setNewMedia({ ...newMedia, type: e.target.value as any })}
                                className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-xs font-bold text-espresso"
                              >
                                <option value="image">Photo / Image</option>
                                <option value="video">Video Clip</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-espresso/60">
                              Caption &amp; Description (Optional)
                            </label>
                            <textarea 
                              rows={3}
                              value={newMedia.description}
                              onChange={e => setNewMedia({ ...newMedia, description: e.target.value })}
                              className="w-full bg-ivory border-0 rounded-xl px-4 py-2.5 text-xs font-medium text-espresso"
                              placeholder="Brief backstory or details about the training session or tournament play..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-espresso/10">
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsAddingMedia(false);
                            setMediaFilePreview(null);
                          }} 
                          className="text-[10px] font-black uppercase tracking-wider text-espresso/40 px-5 py-3 hover:text-espresso cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={isUploadingMedia || (!mediaFilePreview && !newMedia.url)}
                          className="bg-orange text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange/20 hover:bg-espresso transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                        >
                          {isUploadingMedia ? (
                            <>
                              <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading to MongoDB...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Publish to Live Gallery</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Photos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {galleryItems.map((item, idx) => (
                    <div 
                      key={item.id || idx} 
                      className="group relative bg-white rounded-3xl overflow-hidden border border-espresso/5 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
                    >
                      <div className="aspect-[4/3] bg-sand relative overflow-hidden">
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-espresso">
                            <ImageIcon className="w-8 h-8 text-white/20" />
                          </div>
                        ) : (
                          <img 
                            src={item.url} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        )}

                        {/* Top tag */}
                        <div className="absolute top-3 left-3 bg-espresso/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                          {item.category || 'Academy'}
                        </div>

                        {/* Delete button */}
                        <button 
                          type="button"
                          onClick={() => handleDeleteMedia(item.id)}
                          className="absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-espresso hover:text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
                          title="Delete Photo Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4 bg-white space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-espresso truncate">{item.title}</h4>
                          <span className="text-[9px] font-mono text-espresso/40 shrink-0">#{String(idx + 1).padStart(2, '0')}</span>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-espresso/60 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PROGRAMS TAB */}
            {activeTab === 'programs' && (
              <motion.div key="programs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                {/* Metrics header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-espresso/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Total Programs</span>
                    <div className="text-3xl font-condensed font-black text-espresso mt-1">{programs.length}</div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-espresso/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Active Programs</span>
                    <div className="text-3xl font-condensed font-black text-green-600 mt-1">{programs.filter(p => p.isActive !== false).length}</div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-espresso/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Average Tuition</span>
                    <div className="text-3xl font-condensed font-black text-orange mt-1">
                      ${programs.length ? Math.round(programs.reduce((acc, p) => acc + (p.price || 0), 0) / programs.length) : 0}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-espresso/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Total Capacity</span>
                    <div className="text-3xl font-condensed font-black text-espresso mt-1">
                      {programs.reduce((acc, p) => acc + (p.capacity || 0), 0)} athletes
                    </div>
                  </div>
                </div>

                {/* Top action bar */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-condensed font-black text-espresso uppercase">Training Programs Catalog</h3>
                    <p className="text-espresso/40 text-xs mt-0.5">Manage live curriculum, prices, schedules, and active batches in MongoDB.</p>
                  </div>
                  <button 
                    onClick={handleOpenAddProgram}
                    className="bg-orange text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-espresso transition-all shadow-lg shadow-orange/20"
                  >
                    <Plus className="w-4 h-4" /> Add Program
                  </button>
                </div>

                {/* Add / Edit Form Modal */}
                {isEditingProgram && (
                  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border-2 border-orange/30 shadow-2xl">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-espresso/5">
                      <h4 className="text-xl font-condensed font-black uppercase text-espresso">
                        {editingProgramId ? 'Edit Program Details' : 'Create New Training Program'}
                      </h4>
                      <button onClick={() => setIsEditingProgram(false)} className="text-espresso/40 hover:text-espresso p-2">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveProgram} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Program Title *</label>
                          <input required value={programForm.title} onChange={e => setProgramForm({ ...programForm, title: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. Little Spikers" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Phase Tag</label>
                          <input value={programForm.phase} onChange={e => setProgramForm({ ...programForm, phase: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. PHASE 01" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Price ($ USD) *</label>
                          <input required type="number" value={programForm.price} onChange={e => setProgramForm({ ...programForm, price: Number(e.target.value) })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="200" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Age Display Range *</label>
                          <input required value={programForm.ageRange} onChange={e => setProgramForm({ ...programForm, ageRange: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. 5 - 10" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Filter Categories (comma separated)</label>
                          <input value={programForm.ageGroups} onChange={e => setProgramForm({ ...programForm, ageGroups: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. 5-10, 11-14" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Location</label>
                          <input value={programForm.location} onChange={e => setProgramForm({ ...programForm, location: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. Fremont Arena" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Schedule & Timings</label>
                          <input value={programForm.schedule} onChange={e => setProgramForm({ ...programForm, schedule: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. Saturdays & Sundays (9:00 AM - 10:30 AM)" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Assigned Coach</label>
                          <input value={programForm.coach} onChange={e => setProgramForm({ ...programForm, coach: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. Head Coach Wilson Mathew & Team" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Capacity / Max Spots</label>
                          <input type="number" value={programForm.capacity} onChange={e => setProgramForm({ ...programForm, capacity: Number(e.target.value) })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="20" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Short Card Description *</label>
                        <input required value={programForm.description} onChange={e => setProgramForm({ ...programForm, description: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="Brief 1-line description for the card..." />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Key Skills Badges (comma separated)</label>
                        <input value={programForm.features} onChange={e => setProgramForm({ ...programForm, features: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. Motor Skills, Fun Drills, Basic Rules, Team Play" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Card Image URL</label>
                        <input value={programForm.image} onChange={e => setProgramForm({ ...programForm, image: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="https://..." />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <input type="checkbox" id="prog-is-active" checked={programForm.isActive} onChange={e => setProgramForm({ ...programForm, isActive: e.target.checked })} className="w-4 h-4 rounded text-orange focus:ring-orange" />
                        <label htmlFor="prog-is-active" className="text-xs font-bold text-espresso cursor-pointer">
                          Active & Visible for Public Registration
                        </label>
                      </div>

                      <div className="flex justify-end gap-4 pt-4 border-t border-espresso/5">
                        <button type="button" onClick={() => setIsEditingProgram(false)} className="text-[10px] font-black uppercase text-espresso/40 px-6 py-3 hover:text-espresso">
                          Cancel
                        </button>
                        <button type="submit" className="bg-orange text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange/20 hover:bg-espresso transition-all">
                          {editingProgramId ? 'Save Changes' : 'Publish Program'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Programs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {programs.map((prog, idx) => (
                    <div key={prog.id || idx} className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col ${prog.isActive !== false ? 'border-espresso/5 shadow-md' : 'border-red-200 bg-red-50/10 opacity-75'}`}>
                      {/* Image header */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-espresso/5">
                        <img src={prog.image} alt={prog.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg shadow text-[9px] font-black uppercase tracking-wider text-espresso">
                          Ages {prog.ageRange}
                        </div>
                        <div className="absolute top-3 right-3 bg-espresso/90 backdrop-blur-md text-white px-3 py-1 rounded-lg shadow text-[10px] font-black">
                          ${prog.price}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-orange">{prog.phase || `PHASE 0${idx + 1}`}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${prog.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {prog.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <h4 className="text-xl font-condensed font-black text-espresso uppercase tracking-tight">{prog.title}</h4>
                          <p className="text-espresso/60 text-xs mt-1.5 line-clamp-2 leading-relaxed">{prog.description}</p>

                          <div className="mt-3 pt-3 border-t border-espresso/5 space-y-1 text-[11px] text-espresso/70 font-medium">
                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-espresso/30" /> {prog.schedule}</div>
                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-espresso/30" /> {prog.location}</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-espresso/5 flex items-center justify-between gap-2">
                          <button 
                            onClick={() => handleToggleProgramActive(prog)}
                            className={`text-[9px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all ${prog.isActive !== false ? 'bg-sand hover:bg-orange/10 text-espresso/70' : 'bg-green-600 text-white'}`}
                          >
                            {prog.isActive !== false ? 'Disable' : 'Enable'}
                          </button>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleOpenEditProgram(prog)}
                              className="bg-espresso text-white p-2.5 rounded-xl hover:bg-orange transition-all shadow"
                              title="Edit Program"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProgram(prog.id)}
                              className="bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                              title="Delete Program"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SUMMER CAMPS TAB */}
            {activeTab === 'camps' && (
              <motion.div key="camps" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                {/* Metrics header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-espresso/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Total Camps</span>
                    <div className="text-3xl font-condensed font-black text-espresso mt-1">{camps.length}</div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-espresso/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Active Summer Camps</span>
                    <div className="text-3xl font-condensed font-black text-green-600 mt-1">{camps.filter(c => c.isActive !== false).length}</div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-espresso/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Average Camp Price</span>
                    <div className="text-3xl font-condensed font-black text-orange mt-1">
                      ${camps.length ? Math.round(camps.reduce((acc, c) => acc + (c.price || 0), 0) / camps.length) : 0}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-espresso/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Total Spots</span>
                    <div className="text-3xl font-condensed font-black text-espresso mt-1">
                      {camps.reduce((acc, c) => acc + (c.capacity || 0), 0)} athletes
                    </div>
                  </div>
                </div>

                {/* Top action bar */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-condensed font-black text-espresso uppercase">Summer Camps &amp; Clinics</h3>
                    <p className="text-espresso/40 text-xs mt-0.5">Manage live summer camp sessions, durations, pricing, and active batches in MongoDB.</p>
                  </div>
                  <button 
                    onClick={handleOpenAddCamp}
                    className="bg-orange text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-espresso transition-all shadow-lg shadow-orange/20"
                  >
                    <Plus className="w-4 h-4" /> Add Summer Camp
                  </button>
                </div>

                {/* Add / Edit Form Modal */}
                {isEditingCamp && (
                  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border-2 border-orange/30 shadow-2xl">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-espresso/5">
                      <h4 className="text-xl font-condensed font-black uppercase text-espresso">
                        {editingCampId ? 'Edit Summer Camp' : 'Create New Summer Camp'}
                      </h4>
                      <button onClick={() => setIsEditingCamp(false)} className="text-espresso/40 hover:text-espresso p-2">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCamp} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Camp Name *</label>
                          <input required value={campForm.name} onChange={e => setCampForm({ ...campForm, name: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. 7-Day Intensive Summer Camp" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Duration Label *</label>
                          <input required value={campForm.duration} onChange={e => setCampForm({ ...campForm, duration: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. 7 Days" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Price ($ USD) *</label>
                          <input required type="number" value={campForm.price} onChange={e => setCampForm({ ...campForm, price: Number(e.target.value) })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="350" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Months / Dates *</label>
                          <input required value={campForm.months} onChange={e => setCampForm({ ...campForm, months: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. June & July 2026" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Best For Focus *</label>
                          <input required value={campForm.bestFor} onChange={e => setCampForm({ ...campForm, bestFor: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. Technique Refinement" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Location</label>
                          <input value={campForm.location} onChange={e => setCampForm({ ...campForm, location: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. Fremont Arena" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Daily Schedule</label>
                          <input value={campForm.schedule} onChange={e => setCampForm({ ...campForm, schedule: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. Mon - Fri (9:00 AM - 1:00 PM)" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Lead Coach</label>
                          <input value={campForm.coach} onChange={e => setCampForm({ ...campForm, coach: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. Head Coach Wilson Mathew & Staff" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Capacity / Max Spots</label>
                          <input type="number" value={campForm.capacity} onChange={e => setCampForm({ ...campForm, capacity: Number(e.target.value) })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="25" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Description</label>
                        <textarea value={campForm.description} onChange={e => setCampForm({ ...campForm, description: e.target.value })} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium h-20" placeholder="Overview of camp training..." />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <input type="checkbox" id="camp-is-active" checked={campForm.isActive} onChange={e => setCampForm({ ...campForm, isActive: e.target.checked })} className="w-4 h-4 rounded text-orange focus:ring-orange" />
                        <label htmlFor="camp-is-active" className="text-xs font-bold text-espresso cursor-pointer">
                          Active &amp; Visible on Summer Camps Page
                        </label>
                      </div>

                      <div className="flex justify-end gap-4 pt-4 border-t border-espresso/5">
                        <button type="button" onClick={() => setIsEditingCamp(false)} className="text-[10px] font-black uppercase text-espresso/40 px-6 py-3 hover:text-espresso">
                          Cancel
                        </button>
                        <button type="submit" className="bg-orange text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange/20 hover:bg-espresso transition-all">
                          {editingCampId ? 'Save Changes' : 'Publish Summer Camp'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Camps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {camps.map((camp, idx) => (
                    <div key={camp.id || idx} className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col p-6 space-y-4 ${camp.isActive !== false ? 'border-espresso/5 shadow-md' : 'border-red-200 bg-red-50/10 opacity-75'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-orange">{camp.duration}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-espresso">${camp.price}</span>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${camp.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {camp.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xl font-condensed font-black text-espresso uppercase tracking-tight">{camp.name}</h4>
                        <p className="text-espresso/60 text-xs mt-1.5 leading-relaxed">{camp.description || camp.bestFor}</p>

                        <div className="mt-4 pt-4 border-t border-espresso/5 space-y-1.5 text-[11px] text-espresso/70 font-medium">
                          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-espresso/30" /> {camp.months}</div>
                          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-espresso/30" /> {camp.schedule}</div>
                          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-espresso/30" /> {camp.location}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-espresso/5 flex items-center justify-between gap-2 mt-auto">
                        <button 
                          onClick={() => handleToggleCampActive(camp)}
                          className={`text-[9px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all ${camp.isActive !== false ? 'bg-sand hover:bg-orange/10 text-espresso/70' : 'bg-green-600 text-white'}`}
                        >
                          {camp.isActive !== false ? 'Disable' : 'Enable'}
                        </button>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenEditCamp(camp)}
                            className="bg-espresso text-white p-2.5 rounded-xl hover:bg-orange transition-all shadow"
                            title="Edit Camp"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCamp(camp.id)}
                            className="bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                            title="Delete Camp"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PERFORMANCE & ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-espresso/5 shadow-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Checkout Conversion</span>
                    <div className="text-4xl font-condensed font-black text-espresso mt-2">
                      {leads.length + registrationsList.length > 0
                        ? `${Math.round((registrationsList.length / (leads.length + registrationsList.length)) * 100)}%`
                        : '100%'}
                    </div>
                    <p className="text-xs text-espresso/60 mt-1">Paid enrollees vs total initiated leads</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-espresso/5 shadow-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Average Order Value</span>
                    <div className="text-4xl font-condensed font-black text-green-600 mt-2">
                      ${registrationsList.length > 0 
                        ? Math.round((registrationsList.reduce((sum, r) => sum + (Number(r.amountPaid) || 0), 0) / registrationsList.length) * 100) / 100 
                        : 0}
                    </div>
                    <p className="text-xs text-espresso/60 mt-1">Average spent per successful registration</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-espresso/5 shadow-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Total Pipeline Athletes</span>
                    <div className="text-4xl font-condensed font-black text-orange mt-2">
                      {leads.length + registrationsList.length}
                    </div>
                    <p className="text-xs text-espresso/60 mt-1">Combined leads &amp; active roster</p>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-espresso/5 shadow-xl">
                  <h3 className="text-xl font-condensed font-black uppercase text-espresso mb-4">Registration Velocity</h3>
                  <p className="text-xs text-espresso/60 mb-8">Daily enrollment breakdown over the last 7 days</p>
                  <div className="h-64 w-full bg-sand/20 rounded-[2rem] flex items-end justify-between p-8 gap-4">
                    {(stats?.trends || Array.from({ length: 7 }).map((_, i) => ({ count: 0 }))).map((t: any, i: number) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-black text-espresso">{t.count}</span>
                        <div 
                          className="w-full bg-orange rounded-t-xl transition-all duration-500 min-h-[8px]"
                          style={{ height: `${Math.min(100, (t.count / Math.max(1, ...(stats?.trends || []).map((x: any) => x.count))) * 160 + 8)}px` }}
                        />
                        <span className="text-[9px] font-bold text-espresso/40 uppercase">{t.date || `Day ${i + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* APP SETTINGS TAB */}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 max-w-5xl">
                
                {/* 1. Editable Academy Information */}
                <form onSubmit={handleSaveSettings} className="bg-white p-10 rounded-[3rem] border border-espresso/5 shadow-xl space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-condensed font-black uppercase text-espresso">Academy Information &amp; Branding</h3>
                      <p className="text-xs text-espresso/40 mt-1">Configure business profile details and customer-facing contact info</p>
                    </div>
                    {settingsSaved && (
                      <span className="text-xs font-black text-green-700 bg-green-100 px-3 py-1.5 rounded-xl border border-green-200">
                        ✓ Changes Saved Successfully!
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-espresso/5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Academy Name</label>
                      <input 
                        value={academySettings.academyName} 
                        onChange={e => setAcademySettings({ ...academySettings, academyName: e.target.value })}
                        className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-bold text-espresso" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Primary Facility / Region</label>
                      <input 
                        value={academySettings.primaryLocation} 
                        onChange={e => setAcademySettings({ ...academySettings, primaryLocation: e.target.value })}
                        className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-bold text-espresso" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Support / Billing Email</label>
                      <input 
                        type="email"
                        value={academySettings.supportEmail} 
                        onChange={e => setAcademySettings({ ...academySettings, supportEmail: e.target.value })}
                        className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-bold text-espresso" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Academy Hotline Phone</label>
                      <input 
                        value={academySettings.contactPhone} 
                        onChange={e => setAcademySettings({ ...academySettings, contactPhone: e.target.value })}
                        className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-bold text-espresso" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-espresso/5">
                    <button type="submit" className="bg-orange text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange/20 hover:bg-espresso transition-all">
                      Save Academy Details
                    </button>
                  </div>
                </form>

                {/* 2. Registration & Automation Preferences */}
                <div className="bg-white p-10 rounded-[3rem] border border-espresso/5 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-xl font-condensed font-black uppercase text-espresso">Registration &amp; Automation Controls</h3>
                    <p className="text-xs text-espresso/40 mt-1">Configure automatic emails and enrollment rules</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-espresso/5">
                    <div className="flex items-center justify-between p-4 bg-sand/30 rounded-2xl">
                      <div>
                        <div className="text-xs font-bold text-espresso">Automatic Confirmation &amp; Receipt Emails</div>
                        <div className="text-[10px] text-espresso/50">Send instant PDF-styled receipt with booking code to parents upon payment</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={academySettings.autoEmailReceipts} 
                        onChange={e => {
                          const updated = { ...academySettings, autoEmailReceipts: e.target.checked };
                          setAcademySettings(updated);
                          localStorage.setItem('challengers_academy_settings', JSON.stringify(updated));
                        }}
                        className="w-5 h-5 rounded text-orange focus:ring-orange cursor-pointer" 
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-sand/30 rounded-2xl">
                      <div>
                        <div className="text-xs font-bold text-espresso">Allow Program Waitlists When Full</div>
                        <div className="text-[10px] text-espresso/50">Capture athlete details even when a batch reaches 100% capacity</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={academySettings.allowWaitlist} 
                        onChange={e => {
                          const updated = { ...academySettings, allowWaitlist: e.target.checked };
                          setAcademySettings(updated);
                          localStorage.setItem('challengers_academy_settings', JSON.stringify(updated));
                        }}
                        className="w-5 h-5 rounded text-orange focus:ring-orange cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Stripe Payment Gateway & Checkout Configuration */}
                <form onSubmit={handleSavePaymentSettings} className="bg-white p-10 rounded-[3rem] border border-espresso/5 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-espresso/40">
                          Payment Gateway
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest bg-orange/10 text-orange px-2.5 py-0.5 rounded-full">
                          Stripe Powered
                        </span>
                      </div>
                      <h3 className="text-xl font-condensed font-black uppercase text-espresso">
                        Stripe Payment Gateway &amp; Checkout Configuration
                      </h3>
                      <p className="text-xs text-espresso/40 mt-0.5">
                        Manage Stripe card payments, mobile wallet checkout (Apple Pay &amp; Google Pay), and real-time confirmation receipts
                      </p>
                    </div>

                    {paymentSettingsSaved && (
                      <span className="text-xs font-black text-green-700 bg-green-100 px-4 py-2 rounded-xl border border-green-200 shrink-0">
                        ✓ Stripe Settings Saved!
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-espresso/5">
                    <div className="bg-sand/15 p-6 rounded-2xl border border-espresso/5 space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-espresso/60 block">
                        Stripe Checkout Options
                      </span>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-espresso/5">
                          <input
                            type="checkbox"
                            id="enable-card-payment"
                            checked={adminPaymentSettings.enableCardPayment !== false}
                            onChange={(e) => setAdminPaymentSettings({ ...adminPaymentSettings, enableCardPayment: e.target.checked })}
                            className="w-4 h-4 rounded text-orange focus:ring-orange cursor-pointer"
                          />
                          <label htmlFor="enable-card-payment" className="text-xs font-bold text-espresso cursor-pointer">
                            Enable Credit / Debit Card Checkout (Stripe Elements)
                          </label>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-espresso/5">
                          <input
                            type="checkbox"
                            id="enable-qr-payment"
                            checked={adminPaymentSettings.enableQrPayment !== false}
                            onChange={(e) => setAdminPaymentSettings({ ...adminPaymentSettings, enableQrPayment: e.target.checked })}
                            className="w-4 h-4 rounded text-orange focus:ring-orange cursor-pointer"
                          />
                          <label htmlFor="enable-qr-payment" className="text-xs font-bold text-espresso cursor-pointer">
                            Enable Instant Mobile QR (Apple Pay, Google Pay &amp; Card)
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-sand/15 p-6 rounded-2xl border border-espresso/5 space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-espresso/60 block">
                        Email &amp; Notification Triggers
                      </span>

                      <div className="p-4 bg-white rounded-xl border border-espresso/5 space-y-2">
                        <div className="text-xs font-bold text-espresso">Automatic Payment Receipts</div>
                        <p className="text-[11px] text-espresso/60">
                          Instantly sends branded registration passes with QR code verification to both parents and admin (<strong>nihalok625@gmail.com</strong>) upon successful payment.
                        </p>
                        <div className="pt-2">
                          <a
                            href="/api/test-email"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-orange hover:underline cursor-pointer"
                          >
                            <span>Test Email Dispatcher (Opens Diagnostics) →</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-espresso/5">
                    <button
                      type="submit"
                      disabled={isSavingPaymentSettings}
                      className="bg-orange hover:bg-espresso text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingPaymentSettings ? (
                        <span>Saving Stripe Settings...</span>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Payment Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* 4. Payment & Database Infrastructure Status */}
                <div className="bg-white p-10 rounded-[3rem] border border-espresso/5 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-xl font-condensed font-black uppercase text-espresso">Live Integrations &amp; Infrastructure</h3>
                    <p className="text-xs text-espresso/40 mt-1">Status of payment processing gateways, email dispatchers, and database clusters</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-espresso/5">
                    <div className="flex items-center justify-between p-5 bg-green-50/80 rounded-2xl border border-green-200">
                      <div className="flex items-center gap-3.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-green-500 animate-pulse" />
                        <div>
                          <div className="text-xs font-bold text-green-950">Stripe Live Gateway</div>
                          <div className="text-[10px] text-green-750 font-medium">Cards · Apple Pay · Google Pay · Cash App</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-green-200 text-green-900 rounded-full">Active</span>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-blue-50/80 rounded-2xl border border-blue-200">
                      <div className="flex items-center gap-3.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500" />
                        <div>
                          <div className="text-xs font-bold text-blue-950">MongoDB Atlas Cluster</div>
                          <div className="text-[10px] text-blue-750 font-medium">Database: challengers_academy</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-blue-200 text-blue-900 rounded-full">Connected</span>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-amber-50/80 rounded-2xl border border-amber-200">
                      <div className="flex items-center gap-3.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                        <div>
                          <div className="text-xs font-bold text-amber-950">Email Dispatcher (SMTP)</div>
                          <div className="text-[10px] text-amber-750 font-medium">Auto Receipt &amp; Admin Alerts</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-amber-200 text-amber-900 rounded-full">Operational</span>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-purple-50/80 rounded-2xl border border-purple-200">
                      <div className="flex items-center gap-3.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-purple-500" />
                        <div>
                          <div className="text-xs font-bold text-purple-950">Google OAuth 2.0</div>
                          <div className="text-[10px] text-purple-750 font-medium">Sign in with Google enabled</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-purple-200 text-purple-900 rounded-full">Configured</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}


            {activeTab === 'users' && isOwner && (


              <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-condensed font-black text-espresso uppercase">Admin Users</h3>
                  <button onClick={() => setIsAddingAdmin(!isAddingAdmin)} className="bg-espresso text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-orange transition-all">
                    <UserPlus className="w-4 h-4" /> Add Admin
                  </button>
                </div>

                {isAddingAdmin && (
                  <div className="bg-white p-8 rounded-[2.5rem] border-2 border-orange/20 shadow-xl">
                    <form onSubmit={handleAddAdminUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Full Name</label>
                        <input required value={newAdminName} onChange={e => setNewAdminName(e.target.value)} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="e.g. Coach Sarah" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Email Address</label>
                        <input required type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium" placeholder="staff@academy.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-espresso/40">Role</label>
                        <select value={newAdminRole} onChange={e => setNewAdminRole(e.target.value)} className="w-full bg-ivory border-0 rounded-xl px-4 py-3 text-sm font-medium">
                          <option value="staff">Staff - Limited access</option>
                          <option value="coach">Coach - View registrations</option>
                          <option value="owner">Owner - Full access</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-4">
                        <button type="button" onClick={() => setIsAddingAdmin(false)} className="text-[10px] font-black uppercase text-espresso/40 px-4 py-3">Cancel</button>
                        <button type="submit" className="flex-1 bg-orange text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Send Invite</button>
                      </div>
                    </form>
                  </div>
                )}

                <div 
                  data-lenis-prevent="true"
                  className="bg-white rounded-[3rem] border border-espresso/5 shadow-xl overflow-hidden overflow-x-auto admin-table-scroll"
                >
                  <table className="w-full">
                    <thead>
                      <tr className="bg-sand/5 text-[10px] font-black uppercase tracking-widest text-espresso/40 border-b border-espresso/5">
                        <th className="px-10 py-6 text-left">Admin</th>
                        <th className="px-6 py-6 text-left">Role</th>
                        <th className="px-6 py-6 text-left">Last Login</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-espresso/5">
                      {adminUsers.length === 0 ? (
                        <tr><td colSpan={4} className="px-10 py-16 text-center text-espresso/40 italic">No admin users found.</td></tr>
                      ) : adminUsers.map(u => (
                        <tr key={u._id || u.id} className="hover:bg-sand/5 transition-colors group">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center text-orange font-bold">{u.name?.charAt(0) || '?'}</div>
                              <div>
                                <div className="text-sm font-bold text-espresso">{u.name}</div>
                                <div className="text-[10px] text-espresso/40 uppercase font-black">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                              u.role === 'owner' ? 'bg-orange/10 text-orange' : u.role === 'coach' ? 'bg-blue-50 text-blue-600' : 'bg-sand text-espresso/60'
                            }`}>{u.role}</span>
                          </td>
                          <td className="px-6 py-6 text-xs text-espresso/40">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</td>
                          <td className="px-10 py-6 text-right">
                            {u.email !== user?.email && (
                              <button onClick={() => handleDeleteAdminUser(u._id || u.id)} className="p-2 text-espresso/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── EDIT STUDENT REGISTRATION MODAL ── */}
      <AnimatePresence>
        {isEditingStudent && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-espresso/10 shadow-2xl space-y-6 my-auto max-h-[92vh] flex flex-col"
            >
              <div className="flex items-start justify-between border-b border-espresso/10 pb-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-espresso/5 text-espresso px-2 py-0.5 rounded font-mono">
                      {editingStudent?.registrationId}
                    </span>
                    <span className="text-[10px] font-bold text-orange uppercase tracking-wider">
                      {studentEditForm.sessionName}
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif font-black text-espresso">
                    Edit Student &amp; Enrollment Details
                  </h3>
                  <p className="text-xs text-espresso/50 font-medium">
                    Modify athlete information, contact details, and payment records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingStudent(false)}
                  className="w-8 h-8 rounded-full bg-espresso/5 hover:bg-espresso/10 flex items-center justify-center text-espresso/60 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form 
                data-lenis-prevent="true"
                onSubmit={handleSaveStudent} 
                className="space-y-4 overflow-y-auto pr-1 flex-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-1">
                      Athlete Full Name
                    </label>
                    <input
                      type="text"
                      value={studentEditForm.playerName}
                      onChange={(e) => setStudentEditForm({ ...studentEditForm, playerName: e.target.value })}
                      required
                      className="w-full bg-sand/10 border border-espresso/10 rounded-xl px-4 py-2.5 text-xs text-espresso font-medium outline-none focus:border-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-1">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      value={studentEditForm.parentName}
                      onChange={(e) => setStudentEditForm({ ...studentEditForm, parentName: e.target.value })}
                      className="w-full bg-sand/10 border border-espresso/10 rounded-xl px-4 py-2.5 text-xs text-espresso font-medium outline-none focus:border-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={studentEditForm.email}
                      onChange={(e) => setStudentEditForm({ ...studentEditForm, email: e.target.value })}
                      required
                      className="w-full bg-sand/10 border border-espresso/10 rounded-xl px-4 py-2.5 text-xs text-espresso font-medium outline-none focus:border-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={studentEditForm.phone}
                      onChange={(e) => setStudentEditForm({ ...studentEditForm, phone: e.target.value })}
                      required
                      className="w-full bg-sand/10 border border-espresso/10 rounded-xl px-4 py-2.5 text-xs text-espresso font-medium outline-none focus:border-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={studentEditForm.dob}
                      onChange={(e) => setStudentEditForm({ ...studentEditForm, dob: e.target.value })}
                      className="w-full bg-sand/10 border border-espresso/10 rounded-xl px-4 py-2.5 text-xs text-espresso font-medium outline-none focus:border-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={studentEditForm.paymentStatus}
                      onChange={(e) => setStudentEditForm({ ...studentEditForm, paymentStatus: e.target.value })}
                      className="w-full bg-sand/10 border border-espresso/10 rounded-xl px-4 py-2.5 text-xs text-espresso font-bold outline-none focus:border-orange cursor-pointer"
                    >
                      <option value="PAID">PAID</option>
                      <option value="PENDING">PENDING</option>
                      <option value="REFUNDED">REFUNDED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={studentEditForm.paymentMethod}
                      onChange={(e) => setStudentEditForm({ ...studentEditForm, paymentMethod: e.target.value })}
                      className="w-full bg-sand/10 border border-espresso/10 rounded-xl px-4 py-2.5 text-xs text-espresso font-bold outline-none focus:border-orange cursor-pointer"
                    >
                      <option value="Card">Stripe Credit / Debit Card</option>
                      <option value="QR Code">Stripe Mobile QR / Apple Pay</option>
                      <option value="Cash">Cash / In-Person</option>
                      <option value="Check / Other">Check / Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-1">
                      Transaction / Stripe ID
                    </label>
                    <input
                      type="text"
                      value={studentEditForm.transactionId}
                      onChange={(e) => setStudentEditForm({ ...studentEditForm, transactionId: e.target.value })}
                      placeholder="e.g. pi_3MtwBwLkdIwHu7ix or Cash"
                      className="w-full bg-sand/10 border border-espresso/10 rounded-xl px-4 py-2.5 text-xs text-espresso font-mono font-medium outline-none focus:border-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-1">
                      Amount Paid ($ USD)
                    </label>
                    <input
                      type="number"
                      value={studentEditForm.amountPaid}
                      onChange={(e) => setStudentEditForm({ ...studentEditForm, amountPaid: Number(e.target.value) })}
                      className="w-full bg-sand/10 border border-espresso/10 rounded-xl px-4 py-2.5 text-xs text-espresso font-bold outline-none focus:border-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-1">
                      Emergency Contact Person
                    </label>
                    <input
                      type="text"
                      value={studentEditForm.emergencyContactName}
                      onChange={(e) => setStudentEditForm({ ...studentEditForm, emergencyContactName: e.target.value })}
                      placeholder="Name & relation"
                      className="w-full bg-sand/10 border border-espresso/10 rounded-xl px-4 py-2.5 text-xs text-espresso font-medium outline-none focus:border-orange"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-1">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={studentEditForm.emergencyContactPhone}
                      onChange={(e) => setStudentEditForm({ ...studentEditForm, emergencyContactPhone: e.target.value })}
                      placeholder="(510) 555-0198"
                      className="w-full bg-sand/10 border border-espresso/10 rounded-xl px-4 py-2.5 text-xs text-espresso font-medium outline-none focus:border-orange"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-espresso/60 mb-1">
                    Medical &amp; Allergy Considerations
                  </label>
                  <textarea
                    rows={2}
                    value={studentEditForm.medicalNotes}
                    onChange={(e) => setStudentEditForm({ ...studentEditForm, medicalNotes: e.target.value })}
                    placeholder="Asthma, allergies, restrictions, notes..."
                    className="w-full bg-sand/10 border border-espresso/10 rounded-xl px-4 py-2 text-xs text-espresso font-medium outline-none focus:border-orange"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-espresso/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditingStudent(false)}
                    className="px-5 py-2.5 rounded-xl border border-espresso/10 text-xs font-bold text-espresso/70 hover:bg-espresso/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingStudent}
                    className="px-6 py-2.5 rounded-xl bg-orange hover:bg-orange/90 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingStudent ? (
                      <span>Saving Changes...</span>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Student Details</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real-time Bank Statement PDF Modal */}
      <DownloadStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        registrations={registrationsList}
        leads={leads}
        isMockPayment={isMockPayment}
        currentUserRole={user?.role || 'Admin'}
        currentUserName={user?.name || 'Administrator'}
        defaultStatementType={initialStatementType}
      />
    </div>
    </>
  );
}
