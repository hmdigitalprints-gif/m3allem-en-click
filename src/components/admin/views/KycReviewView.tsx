import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  Check, 
  X, 
  Loader2, 
  ShieldCheck, 
  FileText, 
  Download, 
  ExternalLink,
  MessageSquare,
  Calendar,
  AlertCircle,
  Building,
  User
} from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const parseKycNotesAndOcr = (notes: string | undefined | null) => {
  if (!notes) return { userNote: '', ocr: null };
  const trimmed = notes.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        userNote: parsed.userNote || '',
        ocr: parsed.ocr || null
      };
    } catch (e) {
      return { userNote: notes, ocr: null };
    }
  }
  return { userNote: notes, ocr: null };
};

interface KycRecord {
  id: string;
  userId: string;
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  idDocumentUrl?: string;
  companyRegistration?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
    role: string;
    verified: boolean;
  };
}

export default function KycReviewView({ onAction }: ViewProps) {
  const [submissions, setSubmissions] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Review/Action states
  const [selectedKyc, setSelectedKyc] = useState<KycRecord | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/kyc', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(Array.isArray(data) ? data : []);
      } else {
        onAction?.('Failed to fetch KYC submissions');
      }
    } catch (err) {
      console.error('KYC loading failed:', err);
      onAction?.('Error connecting to KYC service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to verify the identity documents for ${name}?`)) {
      setSubmittingAction(true);
      try {
        const res = await fetch(`/api/admin/kyc/${id}/approve`, {
          method: 'POST',
          credentials: 'include'
        });
        if (res.ok) {
          onAction?.(`KYC Approved: ${name} is now verified`);
          setSelectedKyc(null);
          fetchSubmissions();
        } else {
          const err = await res.json();
          onAction?.(err.error || 'Failed to approve KYC');
        }
      } catch (err) {
        console.error(err);
        onAction?.('Network error during approval');
      } finally {
        setSubmittingAction(false);
      }
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectionReason.trim()) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/kyc/${rejectId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
        credentials: 'include'
      });
      if (res.ok) {
        onAction?.('KYC rejected and feedback notice sent');
        setRejectId(null);
        setSelectedKyc(null);
        setRejectionReason('');
        fetchSubmissions();
      } else {
        const err = await res.json();
        onAction?.(err.error || 'Failed to reject KYC');
      }
    } catch (err) {
      console.error(err);
      onAction?.('Network error during rejection');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filter listings
  const filteredSubmissions = submissions.filter(sub => {
    const name = sub.user?.name || '';
    const email = sub.user?.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sub.documentNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' ? true : sub.status === statusFilter;
    const matchesRole = roleFilter === 'all' ? true : sub.user?.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Extract pure file extension and filename
  const getCleanFilename = (url: string) => {
    try {
      if (!url) return '';
      const parts = url.split('/');
      return parts[parts.length - 1];
    } catch {
      return 'document';
    }
  };

  const isImageFile = (url: string) => {
    const ext = getCleanFilename(url).split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '');
  };

  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">KYC Identity Audit</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
            Review identity papers, passports, and commercial registers to verify users securely.
          </p>
        </div>
        
        {/* Fetch Refresh */}
        <button 
          onClick={fetchSubmissions}
          className="px-5 py-3 rounded-xl border border-[var(--border)] text-sm font-bold text-[var(--text)] hover:bg-[var(--glass-bg)] transition-colors active:scale-95 inline-flex items-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          Refresh Queue
        </button>
      </div>

      {/* Query Bar */}
      <div className="flex flex-col xl:flex-row items-center gap-4 bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-xl">
        <div className="w-full xl:flex-1 flex items-center px-4 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] focus-within:border-[#FFD700]/50 transition-colors shadow-inner">
          <Search size={18} className="text-[var(--text-muted)]" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search by full name, email or ID numbers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none ml-3 text-sm font-bold text-[var(--text)] w-full placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full xl:w-auto">
          {/* Status Filter */}
          <div className="w-full md:w-auto relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-sm font-bold text-[var(--text)] outline-none focus:border-[#FFD700]/50 transition-colors cursor-pointer appearance-none pr-10"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
            >
              <option value="all">Status: All Reviews</option>
              <option value="pending">Review Pending</option>
              <option value="approved">Approved & Verified</option>
              <option value="rejected">Rejected / Needs Action</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-auto relative">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-48 px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-sm font-bold text-[var(--text)] outline-none focus:border-[#FFD700]/50 transition-colors cursor-pointer appearance-none pr-10"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
            >
              <option value="all">Role: All Accounts</option>
              <option value="artisan">Artisan Accounts</option>
              <option value="seller">Material Sellers</option>
              <option value="company">Corporate Entities</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl">
          <Loader2 size={40} className="animate-spin text-[#FFD700] mb-4" />
          <p className="text-sm font-black text-[var(--text-muted)] uppercase tracking-wider">Syncing secure documents queue...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-center px-4">
          <div className="p-4 rounded-full bg-[var(--border)] text-[var(--text-muted)] mb-4">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-lg font-black text-[var(--text)] tracking-tight">Clear Queue</h3>
          <p className="text-sm font-semibold text-[var(--text-muted)] max-w-sm mt-1">
            No KYC submissions match your queries or filters. Check back later for newly uploaded papers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubmissions.map((sub) => (
            <div 
              key={sub.id} 
              className={`bg-[var(--card-bg)] border rounded-xl overflow-hidden shadow-sm transition-all relative flex flex-col ${
                sub.status === 'pending' ? 'border-[#FFD700]/30 hover:border-[#FFD700]/60' :
                sub.status === 'approved' ? 'border-emerald-500/20 opacity-90' :
                'border-red-500/25 opacity-90'
              }`}
            >
              {/* Colored Ribbon */}
              <div className={`h-1.5 w-full ${
                sub.status === 'pending' ? 'bg-[#FFD700]' :
                sub.status === 'approved' ? 'bg-emerald-500' :
                'bg-red-500'
              }`} />

              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                {/* User Section */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--border)] rounded-xl flex items-center justify-center text-[var(--text)] font-black uppercase text-lg shadow-sm border border-[var(--border)]">
                      {sub.user?.name ? sub.user.name[0] : <User />}
                    </div>
                    <div>
                      <h3 className="font-black text-[var(--text)] text-base leading-tight">{sub.user?.name || 'Anonymous User'}</h3>
                      <div className="text-xs font-bold text-[var(--text-muted)] mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="uppercase text-[#FFD700] tracking-wider font-extrabold">{sub.user?.role}</span>
                        <span>•</span>
                        <span>{sub.user?.email}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-md text-xxs font-black uppercase tracking-wider border select-none ${
                    sub.status === 'pending' ? 'text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/20' :
                    sub.status === 'approved' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25' :
                    'text-red-500 bg-red-500/10 border-red-500/25'
                  }`}>
                    {sub.status}
                  </span>
                </div>

                {/* Submission Content */}
                {(() => {
                  const { userNote, ocr } = parseKycNotesAndOcr(sub.notes);
                  return (
                    <div className="space-y-4 bg-[var(--card-surface)] border border-[var(--border)] rounded-xl p-5 mb-6 text-start">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xxs font-black text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Paper Type</label>
                          <span className="text-xs font-black text-[var(--text)]">{sub.documentType}</span>
                        </div>
                        <div>
                          <label className="block text-xxs font-black text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Government ID NO.</label>
                          <span className="text-xs font-bold text-[var(--text)] font-mono">{sub.documentNumber}</span>
                        </div>
                      </div>

                      {userNote && (
                        <div>
                          <label className="block text-xxs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1">User Comments/Notes</label>
                          <p className="text-xs text-[var(--text)] font-medium italic bg-[var(--border)]/30 rounded p-2.5 border border-[var(--border)] font-semibold">
                            "{userNote}"
                          </p>
                        </div>
                      )}

                      {ocr && (
                        <div className="p-4 rounded-xl bg-slate-900 border border-[var(--border)] text-start space-y-3">
                          <div className="flex items-center gap-1.5 text-[#FFD700] text-xxs font-black uppercase tracking-wider">
                            <ShieldCheck size={14} className="text-[#FFD700]" />
                            Gemini AI Intelligent Auditor Check
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-semibold">
                            <div>
                              <span className="block text-[var(--text-muted)]">User Profile Name:</span>
                              <span className="text-xs font-black text-[var(--text)]">{sub.user?.name || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="block text-[var(--text-muted)]">OCR Extracted Name:</span>
                              <span className="text-xs font-black text-[var(--text)]">{ocr.fullName || 'Not scanned'}</span>
                            </div>
                            <div>
                              <span className="block text-[var(--text-muted)]">User Input ID No:</span>
                              <span className="text-xs font-bold font-mono text-[var(--text)]">{sub.documentNumber}</span>
                            </div>
                            <div>
                              <span className="block text-[var(--text-muted)]">OCR Document ID No:</span>
                              <span className="text-xs font-bold font-mono text-[var(--text)]">{ocr.documentNumber}</span>
                            </div>
                          </div>

                          {/* Warnings / Verification Checks */}
                          <div className="pt-2 border-t border-[var(--border)] space-y-1">
                            {sub.user?.name && ocr.fullName && sub.user.name.toLowerCase().trim() !== ocr.fullName.toLowerCase().trim() ? (
                              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-500 font-extrabold animate-pulse">
                                <AlertCircle size={12} />
                                Name Discrepancy: Profile & document differ
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-500 font-extrabold">
                                <Check size={12} strokeWidth={3} />
                                Name Match: Verified successfully
                              </div>
                            )}

                            {sub.documentNumber.toLowerCase().replace(/\s/g, '') !== ocr.documentNumber.toLowerCase().replace(/\s/g, '') ? (
                              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-500 font-extrabold animate-pulse">
                                <AlertCircle size={12} />
                                ID Discrepancy: Record values mismatch
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-500 font-extrabold">
                                <Check size={12} strokeWidth={3} />
                                ID Match: Code reference matches exactly
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-bold pt-1">
                              <span>Scanning Match Trust Ratio</span>
                              <span className="font-extrabold text-[#FFD700]">{Math.round((ocr.confidence || 0.95) * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {sub.rejectionReason && (
                        <div className="bg-red-500/5 border border-red-500/15 p-3 rounded-lg">
                          <label className="block text-xxs font-black text-red-500 uppercase tracking-wider mb-1">Previous Rejection Reason</label>
                          <p className="text-xs text-[var(--text)] font-semibold leading-relaxed">
                            {sub.rejectionReason}
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[var(--border)]">
                        <label className="block text-xxs font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">Secure Upload Files</label>
                        
                        <div className="space-y-2">
                          {/* Document File UrL */}
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--glass-bg)] transition-colors">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-[#FFD700]" />
                              <span className="text-xs font-bold text-[var(--text)] truncate max-w-[150px] md:max-w-[180px]">
                                {getCleanFilename(sub.documentUrl)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <a 
                                href={sub.documentUrl} 
                                target="_blank" 
                                rel="referrer noopener"
                                className="p-1.5 rounded-md hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                                title="Open Document File"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </div>

                          {/* Holding Document Side URL */}
                          {sub.idDocumentUrl && (
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--glass-bg)] transition-colors">
                              <div className="flex items-center gap-2">
                                <FileText size={16} className="text-[#FFD700]" />
                                <span className="text-xs font-bold text-[var(--text)] truncate max-w-[150px] md:max-w-[180px]">
                                  Face Photo with ID
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <a 
                                  href={sub.idDocumentUrl} 
                                  target="_blank" 
                                  rel="referrer noopener"
                                  className="p-1.5 rounded-md hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                                  title="Open Verification Photo"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Corporate Registration Certificate */}
                          {sub.companyRegistration && (
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/20 hover:bg-[var(--glass-bg)] transition-colors">
                              <div className="flex items-center gap-2">
                                <Building size={16} className="text-indigo-400" />
                                <span className="text-xs font-black text-indigo-400">
                                  Corporate Register Certification
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <a 
                                  href={sub.companyRegistration} 
                                  target="_blank" 
                                  rel="referrer noopener"
                                  className="p-1.5 rounded-md hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 transition-colors"
                                  title="Open Trade Registry Certificate"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Audit Controls / Actions */}
                <div className="flex items-center justify-between gap-4 mt-auto">
                  <span className="text-xxs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                    <Calendar size={12} />
                    Submitted: {new Date(sub.createdAt).toLocaleDateString()}
                  </span>
                  
                  {sub.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setRejectId(sub.id);
                          setRejectionReason('The uploaded government identity documents are blurry or incomplete. Please ensure a clear, full-page photo.');
                        }}
                        disabled={submittingAction}
                        className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-red-500/15 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-95 disabled:pointer-events-none"
                      >
                        Reject Files
                      </button>
                      <button
                        onClick={() => handleApprove(sub.id, sub.user?.name)}
                        disabled={submittingAction}
                        className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md transition-all duration-200 active:scale-95 flex items-center gap-1.5 disabled:pointer-events-none"
                      >
                        <Check size={14} strokeWidth={3} />
                        Verify Account
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xxs font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                      {sub.status === 'approved' ? (
                        <span className="text-emerald-500 flex items-center gap-1">
                          <Check size={12} strokeWidth={3} /> Approved & Active
                        </span>
                      ) : (
                        <span className="text-red-500">Rejected & Logged</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-xl" />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle size={20} />
                  <h3 className="text-lg font-black uppercase tracking-tight">Reject ID Documents</h3>
                </div>
                <button 
                  onClick={() => setRejectId(null)}
                  className="p-1 rounded bg-[var(--border)]/30 hover:bg-[var(--border)] text-[var(--text-muted)]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-start">
                <p className="text-xs text-[var(--text-muted)] font-semibold leading-relaxed">
                  Provide a detailed explanation for document rejection. The user will receive an automated notification so they can correct the files immediately.
                </p>

                <div>
                  <label className="block text-xxs font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">
                    Action Explanation Reason
                  </label>
                  <textarea 
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-sm font-semibold text-[var(--text)] outline-none focus:border-red-500/50 transition-colors resize-none"
                    placeholder="E.g., Blasé blurred details, name mismatch with registration, non-certified ID copy..."
                    required
                  />
                </div>

                <div className="flex gap-3 mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectId(null)}
                    className="flex-1 px-4 py-3 rounded-lg bg-[var(--border)] hover:bg-[var(--border)]/80 text-xs font-black uppercase tracking-wider text-[var(--text)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={submittingAction || !rejectionReason.trim()}
                    className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    Send Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
