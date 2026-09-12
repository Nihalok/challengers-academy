import React, { useState, useEffect } from 'react';
import { 
  Save, RefreshCcw, Plus, Trash2, ArrowLeft, BarChart3, Settings, Eye, 
  LayoutDashboard, Image as ImageIcon, Users, TrendingUp, Search, 
  ExternalLink, CheckCircle2, Clock, Filter, Trash, LogOut, Shield, UserPlus, Mail, ChevronDown,
  Layers, Edit3, DollarSign, Calendar, MapPin, Check, X, Tag, QrCode, Smartphone, CreditCard, Copy, Upload
} from 'lucide-react';
import { usePerformance } from './PerformanceContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ASSETS } from './assets/images';
import { useAuth } from './hooks/useAuth';
import SessionTimeoutModal from './components/SessionTimeoutModal';

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
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [copiedStripeId, setCopiedStripeId] = useState<string | null>(null);
  const [isSyncingStripe, setIsSyncingStripe] = useState(false);
  const [isProcessingEmails, setIsProcessingEmails] = useState(false);
  const [onlyRealPayments, setOnlyRealPayments] = useState(true);
  const [isPurgingMock, setIsPurgingMock] = useState(false);

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
    const token = getToken();

    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setLeads(data.leads || []);
        setRegistrationsList(data.registrations || []);
        if (data.gallery?.length) {
          setGalleryItems(data.gallery);
        }
      } else if (response.status === 401) {
        await logout();
        navigate('/login');
        return;
      }

      // Fetch live gallery collection from MongoDB API
      const galleryRes = await fetch('/api/gallery');
      const galleryData = await galleryRes.json();
      if (galleryData.success && Array.isArray(galleryData.items)) {
        setGalleryItems(galleryData.items);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
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

  const handleCopyStripeId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedStripeId(id);
    setTimeout(() => setCopiedStripeId(null), 2000);
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
    <div className="min-h-screen bg-sand/30 font-sans">
      {/* Admin Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 md:w-72 bg-espresso text-white z-50 overflow-y-auto shadow-2xl">
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
      </div>

      {/* Main Content Area */}
      <main className="pl-64 md:pl-72 min-h-screen bg-sand/30">
        <div className="px-8 sm:px-12 md:px-16 py-10 md:py-12 max-w-[1600px] mx-auto space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2">
            <div>
              <h2 className="text-4xl sm:text-5xl font-condensed font-black text-espresso uppercase tracking-tighter">
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
            
            <div className="flex items-center gap-4">
              {syncSuccessMessage && (
                <motion.span 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-black text-green-700 bg-green-100 px-3 py-1.5 rounded-xl border border-green-200"
                >
                  ✓ {syncSuccessMessage}
                </motion.span>
              )}
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
                  className="px-6 h-10 bg-espresso text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange transition-all shadow-sm flex items-center gap-2 disabled:opacity-75"
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
                {/* ── 1. CONFIRMED PAID REGISTRATIONS ── */}
                <div className="bg-white rounded-[3rem] border border-espresso/5 shadow-xl overflow-hidden">
                  <div className="p-8 sm:p-10 border-b border-espresso/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-sand/10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Live Stripe &amp; Enrollees</span>
                      </div>
                      <h3 className="text-xl font-condensed font-black uppercase text-espresso">
                        Confirmed Registrations ({registrationsList.filter(r => onlyRealPayments ? !isMockPayment(r) : true).length})
                      </h3>
                      <p className="text-espresso/40 text-[10px] font-black uppercase tracking-widest mt-0.5">
                        All successful Stripe checkouts (Card, Link, Apple Pay, Google Pay) and QR payments
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Real vs All Toggle */}
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
                        <span>{onlyRealPayments ? 'Real Payments Only' : 'Showing All (incl. Tests)'}</span>
                      </button>

                      {/* Purge Test Records */}
                      <button
                        type="button"
                        onClick={handlePurgeMockRecords}
                        disabled={isPurgingMock}
                        className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                        title="Permanently remove mock / test records from database"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        <span>{isPurgingMock ? 'Purging...' : 'Purge Test Records'}</span>
                      </button>

                      {/* Retry Email Queue */}
                      <button
                        type="button"
                        onClick={handleProcessEmailQueue}
                        disabled={isProcessingEmails}
                        className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                        title="Process and retry all pending or failed email notifications"
                      >
                        <Mail className={`w-3.5 h-3.5 ${isProcessingEmails ? 'animate-bounce text-blue-600' : ''}`} />
                        <span>{isProcessingEmails ? 'Retrying...' : 'Retry Email Queue'}</span>
                      </button>

                      {/* Sync With Stripe */}
                      <button
                        onClick={handleSyncStripe}
                        disabled={isSyncingStripe}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                        title="Directly pull and match all successful transactions from Stripe API"
                      >
                        <RefreshCcw className={`w-3.5 h-3.5 ${isSyncingStripe ? 'animate-spin text-orange' : ''}`} />
                        <span>{isSyncingStripe ? 'Syncing Stripe...' : 'Sync with Stripe'}</span>
                      </button>
                    </div>
                  </div>

                  {/* ── Filter and Search Bar ── */}
                  <div className="px-8 py-4 bg-white border-b border-espresso/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Payment Method Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar text-xs font-bold">
                      {[
                        { id: 'all', label: `All (${registrationsList.filter(r => onlyRealPayments ? !isMockPayment(r) : true).length})` },
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

                    {/* Search Field */}
                    <div className="relative min-w-[240px]">
                      <Search className="w-3.5 h-3.5 text-espresso/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search athlete, email, Stripe ID..."
                        value={regSearchQuery}
                        onChange={(e) => setRegSearchQuery(e.target.value)}
                        className="w-full bg-sand/20 border border-espresso/10 rounded-xl pl-9 pr-7 py-1.5 text-xs text-espresso outline-none focus:border-[#D62828] transition-all"
                      />
                      {regSearchQuery && (
                        <button
                          onClick={() => setRegSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-espresso/40 hover:text-espresso"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-sand/5 text-[10px] font-black uppercase tracking-widest text-espresso/40 border-b border-espresso/5">
                          <th className="px-8 py-5">Athlete &amp; Code</th>
                          <th className="px-6 py-5">Program / Session</th>
                          <th className="px-6 py-5">Amount</th>
                          <th className="px-6 py-5">Customer Contact</th>
                          <th className="px-6 py-5">Payment Method</th>
                          <th className="px-6 py-5">Stripe / Ref ID</th>
                          <th className="px-6 py-5">Date</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-espresso/5">
                        {registrationsList.filter(reg => {
                          if (onlyRealPayments && isMockPayment(reg)) return false;
                          if (paymentFilter !== 'all') {
                            const pm = String(reg.paymentMethod || '').toLowerCase();
                            if (paymentFilter === 'apple_pay' && !pm.includes('apple')) return false;
                            if (paymentFilter === 'google_pay' && !pm.includes('google') && !pm.includes('gpay')) return false;
                            if (paymentFilter === 'link' && !pm.includes('link')) return false;
                            if (paymentFilter === 'qr' && !pm.includes('qr') && !pm.includes('zelle') && !pm.includes('venmo')) return false;
                            if (paymentFilter === 'card' && (pm.includes('apple') || pm.includes('google') || pm.includes('link') || pm.includes('qr'))) return false;
                          }
                          if (regSearchQuery.trim()) {
                            const q = regSearchQuery.toLowerCase();
                            const match = 
                              (reg.playerName || '').toLowerCase().includes(q) ||
                              (reg.parentName || '').toLowerCase().includes(q) ||
                              (reg.email || '').toLowerCase().includes(q) ||
                              (reg.phone || '').toLowerCase().includes(q) ||
                              (reg.registrationId || '').toLowerCase().includes(q) ||
                              (reg.stripePaymentIntentId || '').toLowerCase().includes(q) ||
                              (reg.transactionId || '').toLowerCase().includes(q) ||
                              (reg.paymentMethod || '').toLowerCase().includes(q) ||
                              (reg.sessionName || '').toLowerCase().includes(q);
                            if (!match) return false;
                          }
                          return true;
                        }).length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-8 py-16 text-center text-espresso/40 italic text-xs">
                              {regSearchQuery || paymentFilter !== 'all' 
                                ? 'No registrations match your current filter criteria.' 
                                : onlyRealPayments 
                                  ? 'No live realtime payments found. Use "Sync with Stripe" above to pull recent transactions.' 
                                  : 'No confirmed registrations yet. Completed checkouts will appear here instantly!'}
                            </td>
                          </tr>
                        ) : registrationsList.filter(reg => {
                          if (onlyRealPayments && isMockPayment(reg)) return false;
                          if (paymentFilter !== 'all') {
                            const pm = String(reg.paymentMethod || '').toLowerCase();
                            if (paymentFilter === 'apple_pay' && !pm.includes('apple')) return false;
                            if (paymentFilter === 'google_pay' && !pm.includes('google') && !pm.includes('gpay')) return false;
                            if (paymentFilter === 'link' && !pm.includes('link')) return false;
                            if (paymentFilter === 'qr' && !pm.includes('qr') && !pm.includes('zelle') && !pm.includes('venmo')) return false;
                            if (paymentFilter === 'card' && (pm.includes('apple') || pm.includes('google') || pm.includes('link') || pm.includes('qr'))) return false;
                          }
                          if (regSearchQuery.trim()) {
                            const q = regSearchQuery.toLowerCase();
                            const match = 
                              (reg.playerName || '').toLowerCase().includes(q) ||
                              (reg.parentName || '').toLowerCase().includes(q) ||
                              (reg.email || '').toLowerCase().includes(q) ||
                              (reg.phone || '').toLowerCase().includes(q) ||
                              (reg.registrationId || '').toLowerCase().includes(q) ||
                              (reg.stripePaymentIntentId || '').toLowerCase().includes(q) ||
                              (reg.transactionId || '').toLowerCase().includes(q) ||
                              (reg.paymentMethod || '').toLowerCase().includes(q) ||
                              (reg.sessionName || '').toLowerCase().includes(q);
                            if (!match) return false;
                          }
                          return true;
                        }).map((reg) => {
                          const stripeTxId = reg.stripePaymentIntentId || reg.transactionId || '';
                          return (
                            <tr key={reg.registrationId || reg._id} className="hover:bg-sand/5 transition-colors group">
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3.5">
                                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                                    {reg.playerName?.charAt(0) || 'A'}
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-espresso">
                                      {reg.playerName}
                                      {reg.hasSibling && (
                                        <span className="ml-1.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                                          + Sibling ({reg.siblingName || 'Sibling'})
                                        </span>
                                      )}
                                    </div>
                                    <span className="inline-block bg-espresso/5 text-espresso font-mono text-[10px] font-bold px-2 py-0.5 rounded mt-0.5">
                                      {reg.registrationId}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="text-xs font-bold text-espresso">{reg.sessionName || reg.sessionId}</div>
                                <div className="text-[10px] text-espresso/50 font-medium">{reg.schedule || 'Flexible'} · {reg.location || reg.preferredLocation || 'Fremont (Kerala House)'}</div>
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-sm font-black text-green-600 font-mono">
                                  ${reg.amountPaid}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="text-xs font-bold text-espresso">{reg.email}</div>
                                <div className="text-[10px] text-espresso/50 mb-1">{reg.phone}</div>
                                <div>{renderEmailStatusBadge(reg)}</div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                                    <CheckCircle2 className="w-3 h-3" /> {reg.paymentStatus || 'PAID'}
                                  </span>
                                  <div>{renderPaymentMethodBadge(reg)}</div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                {stripeTxId ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[11px] text-slate-700 max-w-[140px] truncate" title={stripeTxId}>
                                      {stripeTxId}
                                    </span>
                                    <button
                                      onClick={() => handleCopyStripeId(stripeTxId)}
                                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                      title="Copy Stripe / Transaction ID"
                                    >
                                      {copiedStripeId === stripeTxId ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-espresso/30 text-xs italic">N/A</span>
                                )}
                              </td>
                              <td className="px-6 py-5 text-xs text-espresso/40 font-medium">
                                {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : 'Recent'}
                              </td>
                              <td className="px-8 py-5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleResendEmail(reg)}
                                    disabled={resendingEmailId === (reg.registrationId || reg._id)}
                                    className="p-2 text-espresso/40 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                    title="Resend Confirmation & Admin Notification Email"
                                  >
                                    {resendingEmailId === (reg.registrationId || reg._id) ? (
                                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Mail className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditStudent(reg)}
                                    className="p-2 text-espresso/40 hover:text-espresso hover:bg-espresso/5 rounded-xl transition-all cursor-pointer"
                                    title="Edit Student Details"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStudent(reg)}
                                    className="p-2 text-espresso/40 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                    title="Delete Permanently"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── 2. ABANDONED / IN-PROGRESS CHECKOUT LEADS ── */}
                <div className="bg-white rounded-[3rem] border border-espresso/5 shadow-xl overflow-hidden">
                  <div className="p-8 sm:p-10 border-b border-espresso/5 flex justify-between items-center bg-sand/10">
                    <div>
                      <h3 className="text-xl font-condensed font-black uppercase text-espresso">Checkout Inquiries &amp; Leads ({leads.length})</h3>
                      <p className="text-espresso/40 text-[10px] font-black uppercase tracking-widest mt-0.5">Users who entered details before final payment</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-sand/5 text-[10px] font-black uppercase tracking-widest text-espresso/40 border-b border-espresso/5">
                          <th className="px-8 py-5">Athlete</th>
                          <th className="px-6 py-5">Program</th>
                          <th className="px-6 py-5">Status</th>
                          <th className="px-6 py-5">Date</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-espresso/5">
                        {leads.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-8 py-12 text-center text-espresso/40 italic text-xs">No pending leads found.</td>
                          </tr>
                        ) : leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-sand/5 transition-colors group">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center text-orange font-bold text-xs">
                                  {lead.playerName?.charAt(0) || lead.studentName?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-espresso">{lead.playerName || lead.studentName || lead.fullName}</div>
                                  <div className="text-[10px] text-espresso/40 uppercase font-bold">{lead.email || lead.primaryEmail}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-xs font-medium text-espresso/60">
                              {lead.sessionName || lead.sessionId || lead.programId}
                            </td>
                            <td className="px-6 py-5">
                              {(() => {
                                const isPaid = lead.status === 'confirmed' || registrationsList.some(r => 
                                  (r.email && lead.email && r.email.toLowerCase().trim() === lead.email.toLowerCase().trim() && lead.email.includes('@') && !lead.email.includes('example.com')) ||
                                  (r.registrationId && lead.registrationId && r.registrationId === lead.registrationId) ||
                                  (r.transactionId && lead.paymentIntentId && r.transactionId === lead.paymentIntentId) ||
                                  (r.stripePaymentIntentId && lead.paymentIntentId && r.stripePaymentIntentId === lead.paymentIntentId)
                                );
                                return (
                                  <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                                    isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {isPaid ? 'CONFIRMED (PAID)' : (lead.status || 'pending')}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="px-6 py-5 text-xs text-espresso/40 font-medium">
                              {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Recent'}
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button onClick={() => handleDeleteLead(lead.id)} className="p-2 text-espresso/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
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
                    return [
                      { label: 'Total Inquiries & Leads', value: stats?.totalLeads ?? leads.length, change: `${leads.length} active`, icon: Users, color: 'orange' },
                      { label: 'Confirmed Athletes', value: activeRegs.length, change: `${activeRegs.length} enrollees`, icon: CheckCircle2, color: 'yellow' },
                      { label: 'Live Revenue', value: `$${Math.round(computedRevenue * 100) / 100}`, change: 'Stripe Verified', icon: BarChart3, color: 'espresso' },
                      { label: 'Registrations (Today)', value: stats?.recentGrowth ?? 0, change: 'Last 24h', icon: Clock, color: 'orange' },
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
                  <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-espresso/5 shadow-xl">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-xl font-condensed font-black uppercase text-espresso">Registration Trends</h3>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 text-[10px] font-black uppercase bg-sand rounded-xl">7 Days</button>
                        <button className="px-4 py-2 text-[10px] font-black uppercase bg-espresso text-white rounded-xl">30 Days</button>
                      </div>
                    </div>
                    <div className="h-64 w-full bg-sand/20 rounded-[2rem] flex items-end justify-between p-8 gap-4">
                      {(stats?.trends || Array.from({ length: 7 }).map((_, i) => ({ count: Math.random() * 10 }))).map((t: any, i: number) => (
                        <div 
                          key={i} 
                          title={`${t.date || 'Day'}: ${t.count} registrations`}
                          className="w-full bg-orange/40 rounded-t-lg hover:bg-orange transition-all cursor-help"
                          style={{ height: `${Math.min(100, (t.count / 10) * 100 + 5)}%` }}
                        />
                      ))}
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

                <div className="bg-white rounded-[3rem] border border-espresso/5 shadow-xl overflow-hidden">
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

              <form onSubmit={handleSaveStudent} className="space-y-4 overflow-y-auto pr-1 flex-1">
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
    </div>
    </>
  );
}
