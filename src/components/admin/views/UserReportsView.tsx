import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, Loader2, CheckCircle2, AlertTriangle, Eye, RefreshCw, XCircle, Trash2, Ban } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserReportsView({ onAction }: ViewProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  // Resolution Modal
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionDetails, setResolutionDetails] = useState('');
  
  // Suspension Modal
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDuration, setSuspendDuration] = useState('7'); // days, or permanent

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports', { credentials: 'include' });
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, status: string, details?: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, resolutionDetails: details }),
        credentials: 'include'
      });
      if (res.ok) {
        onAction?.(`Report updated to ${status}`);
        setSelectedReport(null);
        setShowResolveModal(false);
        setResolutionDetails('');
        fetchReports();
      } else {
        onAction?.('Failed to update report');
      }
    } catch (error) {
      console.error(error);
      onAction?.('Error updating report');
    }
  };

  const handleSuspendAccount = async () => {
    if (!selectedReport?.reportedId) return;
    try {
      const untilDate = suspendDuration === 'permanent' 
        ? null 
        : new Date(Date.now() + parseInt(suspendDuration) * 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch(`/api/admin/users/${selectedReport.reportedId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: suspendReason, until: untilDate }),
        credentials: 'include'
      });
      
      if (res.ok) {
        onAction?.(`Account of ${selectedReport.reported?.name || 'user'} suspended successfully`);
        // Resolve the report automatically
        await handleUpdateStatus(selectedReport.id, 'resolved', `Account suspended: ${suspendReason}`);
        setShowSuspendModal(false);
        setSuspendReason('');
      } else {
        onAction?.('Failed to suspend account');
      }
    } catch (error) {
      console.error(error);
      onAction?.('Error suspending account');
    }
  };

  const filteredReports = reports.filter(r => {
    const reporterName = r.reporter?.name || '';
    const reportedName = r.reported?.name || '';
    const reasonText = r.reason || '';
    const detailsText = r.details || '';
    const contentText = r.contentType || '';

    const matchesSearch = 
      reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reportedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reasonText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detailsText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contentText.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Enterprise User Reports</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
            Review user-submitted complaints and violations of platform terms.
          </p>
        </div>
        <button 
          onClick={fetchReports} 
          className="flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-bold uppercase tracking-wider text-[var(--text)] rounded-xl transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Queue
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border-l-4 border-l-red-500 border-t border-r border-b border-[var(--border)]">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Unresolved Reports</p>
          <p className="text-4xl font-black text-red-500 tracking-tight">{reports.filter(r => r.status === 'pending' || r.status === 'investigating').length}</p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border-l-4 border-l-orange-500 border-t border-r border-b border-[var(--border)]">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Under Investigation</p>
          <p className="text-4xl font-black text-orange-500 tracking-tight">{reports.filter(r => r.status === 'investigating').length}</p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border-l-4 border-l-emerald-500 border-t border-r border-b border-[var(--border)]">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Resolved/Dismissed</p>
          <p className="text-4xl font-black text-emerald-500 tracking-tight">{reports.filter(r => r.status === 'resolved' || r.status === 'dismissed').length}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] flex-1 w-full md:max-w-md focus-within:border-[#FFD700]/50 transition-colors shadow-inner">
          <Search size={18} className="text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search reports..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm font-bold text-[var(--text)] placeholder:text-[var(--text-muted)]" 
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-sm font-bold text-[var(--text)] outline-none focus:border-[#FFD700]/50 transition-colors shadow-inner cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {/* List / Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/[0.01]">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Reporter</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Subject Account</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Report Reason</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Type</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
                      Loading reports...
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No reports match current filters.
                  </td>
                </tr>
              ) : filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-[var(--text)]">
                    {report.reporter?.name || 'System Auto'}
                    <span className="block text-xs font-medium text-[var(--text-muted)]">{report.reporter?.role || 'Unknown'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-red-400">
                    {report.reported?.name || 'Content item'}
                    <span className="block text-xs font-medium text-[var(--text-muted)]">{report.reported?.role || report.contentType}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[var(--text-muted)] max-w-xs block truncate">
                    {report.reason}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-mono font-bold uppercase bg-black/40 text-[var(--text-muted)] border border-[var(--border)] rounded">
                      {report.contentType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border items-center gap-1.5 ${
                      report.status === 'pending' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      report.status === 'investigating' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <button 
                      onClick={() => setSelectedReport(report)}
                      className="px-3 py-1.5 bg-[#FFD700] hover:bg-[#E6C200] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-1.5 shadow-md shadow-[#FFD700]/10"
                    >
                      <Eye size={12} strokeWidth={3} />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Report Drawer / Detail Card */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg h-full bg-[var(--card-bg)] border-l border-[var(--border)] shadow-2xl p-8 overflow-y-auto relative flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="text-red-500" size={24} />
                    <h2 className="text-xl font-black text-[var(--text)] tracking-tight">Report Investigation</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-[var(--border)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-black/40 rounded-xl border border-[var(--border)] space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Report ID</p>
                    <p className="font-mono text-xs text-[var(--text)]">{selectedReport.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Filed By</p>
                      <p className="text-sm font-bold text-[var(--text)]">{selectedReport.reporter?.name || 'System automated'}</p>
                      <p className="text-xs text-[var(--text-muted)]">{selectedReport.reporter?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Reported Party</p>
                      <p className="text-sm font-bold text-red-400">{selectedReport.reported?.name || 'Content item'}</p>
                      <p className="text-xs text-[var(--text-muted)]">{selectedReport.reported?.email || 'N/A'}</p>
                    </div>
                  </div>

                  <hr className="border-[var(--border)]" />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Reason for Complaint</p>
                    <p className="text-sm font-black text-[var(--text)]">{selectedReport.reason}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Complaint Details</p>
                    <p className="text-sm font-medium text-[var(--text-muted)] bg-black/20 p-4 rounded-xl border border-[var(--border)] max-h-40 overflow-y-auto">
                      {selectedReport.details || 'No additional details provided.'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Subject Metadata</p>
                    <p className="text-xs font-mono text-[var(--text-muted)]">Content Type: {selectedReport.contentType}</p>
                    {selectedReport.contentId && (
                      <p className="text-xs font-mono text-[var(--text-muted)]">Content ID: {selectedReport.contentId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons inside inspect panel */}
              <div className="border-t border-[var(--border)] pt-6 mt-8 space-y-4">
                {selectedReport.status === 'pending' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedReport.id, 'investigating')}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Mark under investigation
                  </button>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowResolveModal(true)}
                    className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    Resolve Report
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed', 'Dismissed as non-violation')}
                    className="py-3 bg-gray-600 hover:bg-gray-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    Dismiss Report
                  </button>
                </div>

                {selectedReport.reportedId && (
                  <button 
                    onClick={() => setShowSuspendModal(true)}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Ban size={14} />
                    Suspend Subject User
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resolve Report Input Modal */}
      <AnimatePresence>
        {showResolveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative"
            >
              <h3 className="text-lg font-black text-[var(--text)] mb-4">Resolve Report Details</h3>
              <textarea 
                rows={4}
                required
                placeholder="Describe resolution taken (e.g. Content censored, user warned, account suspended, etc.)"
                value={resolutionDetails}
                onChange={(e) => setResolutionDetails(e.target.value)}
                className="w-full p-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-sm font-semibold text-[var(--text)] focus:border-[#FFD700] outline-none mb-6"
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase text-[var(--text-muted)] hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedReport.id, 'resolved', resolutionDetails)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Confirm Resolution
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Suspend Account Modal */}
      <AnimatePresence>
        {showSuspendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative"
            >
              <h3 className="text-xl font-black text-red-500 mb-2">Suspend User Account</h3>
              <p className="text-xs text-[var(--text-muted)] mb-6 uppercase tracking-wider font-semibold">
                You are suspending {selectedReport?.reported?.name}. This will prevent them from accessing any platform operations.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Suspension Duration</label>
                  <select 
                    value={suspendDuration}
                    onChange={(e) => setSuspendDuration(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-sm font-bold text-[var(--text)] focus:border-[#FFD700] outline-none cursor-pointer"
                  >
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="permanent">Permanent Suspension</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Reason for Suspension</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Enter violation specifics e.g., abusive behavior, fraud warning..."
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-sm font-semibold text-[var(--text)] focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowSuspendModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase text-[var(--text-muted)] hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSuspendAccount}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Apply Suspension & Resolve Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
