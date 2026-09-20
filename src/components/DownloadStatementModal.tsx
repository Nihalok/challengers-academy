import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Download,
  X,
  CreditCard,
  Users,
  CheckCircle2,
  Calendar,
  Filter,
  ShieldCheck,
  Building2,
  Loader2,
  Receipt,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  generateBankStatementPdf,
  StatementRegistration,
  StatementLead,
} from '../utils/statementPdfGenerator';

interface DownloadStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: StatementRegistration[];
  leads: StatementLead[];
  isMockPayment: (reg: any) => boolean;
  currentUserRole?: string;
  currentUserName?: string;
  defaultStatementType?: 'all' | 'payments_only' | 'leads_only';
}

export default function DownloadStatementModal({
  isOpen,
  onClose,
  registrations,
  leads,
  isMockPayment,
  currentUserRole = 'Admin',
  currentUserName = 'Administrator',
  defaultStatementType = 'all',
}: DownloadStatementModalProps) {
  const [statementType, setStatementType] = useState<'all' | 'payments_only' | 'leads_only'>(defaultStatementType);

  // Sync default type whenever opened
  React.useEffect(() => {
    if (isOpen) {
      setStatementType(defaultStatementType);
    }
  }, [isOpen, defaultStatementType]);
  const [dateRange, setDateRange] = useState<'all' | 'month' | '30days' | '90days'>('all');
  const [onlyRealPayments, setOnlyRealPayments] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute cutoff timestamp for date filtering
  const now = Date.now();
  const cutoffTime = useMemo(() => {
    if (dateRange === 'month') {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    }
    if (dateRange === '30days') {
      return now - 30 * 24 * 60 * 60 * 1000;
    }
    if (dateRange === '90days') {
      return now - 90 * 24 * 60 * 60 * 1000;
    }
    return 0;
  }, [dateRange, now]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (onlyRealPayments && isMockPayment(reg)) return false;
      if (cutoffTime > 0) {
        const regTime = Number(reg.registeredAt || reg.createdAt) || 0;
        if (regTime > 0 && regTime < cutoffTime) return false;
      }
      return true;
    });
  }, [registrations, onlyRealPayments, isMockPayment, cutoffTime]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (cutoffTime > 0) {
        const leadTime = Number(lead.createdAt) || 0;
        if (leadTime > 0 && leadTime < cutoffTime) return false;
      }
      return true;
    });
  }, [leads, cutoffTime]);

  // Computed summary for preview
  const totalRevenue = useMemo(() => {
    return filteredRegistrations.reduce(
      (sum, r) => sum + (Number(r.amountPaid ?? r.amount) || 0),
      0
    );
  }, [filteredRegistrations]);

  const periodLabel = useMemo(() => {
    if (dateRange === 'month') return 'Current Month to Date';
    if (dateRange === '30days') return 'Last 30 Days';
    if (dateRange === '90days') return 'Last 90 Days';
    return 'All-Time Historical Records';
  }, [dateRange]);

  const handleDownload = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setDownloadSuccess(false);

    try {
      const result = await generateBankStatementPdf(
        filteredRegistrations,
        filteredLeads,
        {
          statementType,
          periodLabel,
          generatedBy: `${currentUserName} (${currentUserRole})`,
        }
      );

      if (result.success) {
        setDownloadSuccess(true);
        setTimeout(() => {
          setDownloadSuccess(false);
          onClose();
        }, 1800);
      } else {
        setErrorMessage(result.error || 'Failed to generate PDF');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected PDF generation error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden z-10 my-8"
        >
          {/* Header Banner */}
          <div className="bg-[#0F172A] text-white p-6 sm:p-7 relative overflow-hidden">
            {/* Background Accent glow */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#D62828]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 text-[#D62828] shadow-inner">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#D62828] text-white">
                      Official Export
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Bank Statement Format
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-condensed font-black uppercase text-white mt-1">
                    Download Statement (PDF)
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Real-time official financial &amp; enrollment record with itemized ledger and verification seal.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {/* 1. Statement Type Selection */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D62828]" />
                Select Statement Scope
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'all',
                    title: 'Full Combined',
                    sub: 'Payments Ledger + Leads CRM',
                    icon: Building2,
                    badge: `${filteredRegistrations.length + filteredLeads.length} Items`,
                  },
                  {
                    id: 'payments_only',
                    title: 'Payments Only',
                    sub: 'Bank-style financial ledger',
                    icon: CreditCard,
                    badge: `${filteredRegistrations.length} Txns`,
                  },
                  {
                    id: 'leads_only',
                    title: 'Leads Only',
                    sub: 'Prospect pipeline report',
                    icon: Users,
                    badge: `${filteredLeads.length} Leads`,
                  },
                ].map((item) => {
                  const isSelected = statementType === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStatementType(item.id as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#D62828] bg-red-50/60 shadow-sm ring-2 ring-[#D62828]/20'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D62828]' : 'text-slate-500'}`} />
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-[#D62828] text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isSelected ? 'text-slate-950' : 'text-slate-800'}`}>
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{item.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Date Range Filters */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-2.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D62828]" />
                Reporting Period
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'all', label: 'All-Time' },
                  { id: 'month', label: 'This Month' },
                  { id: '30days', label: 'Last 30 Days' },
                  { id: '90days', label: 'Last 90 Days' },
                ].map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => setDateRange(range.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${
                      dateRange === range.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Real Payments Only Toggle */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Only Genuine Paid Checkouts</div>
                  <div className="text-[11px] text-slate-500">
                    Exclude test / mock sandbox records from revenue totals
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOnlyRealPayments(!onlyRealPayments)}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  onlyRealPayments ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Real-time Summary Box Before Export */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-700">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D62828]" />
                  Statement Preview Summary
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60">
                  Live Sync Ready
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Revenue</div>
                  <div className="text-lg font-black font-mono text-emerald-400 mt-0.5">
                    ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Confirmed Enrollees</div>
                  <div className="text-lg font-black text-white mt-0.5">
                    {filteredRegistrations.length}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Pipeline Leads</div>
                  <div className="text-lg font-black text-amber-400 mt-0.5">
                    {filteredLeads.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isGenerating}
                className="px-6 py-3 bg-[#D62828] hover:bg-[#b02222] active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compiling PDF Statement...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Statement Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Bank Statement (PDF)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
