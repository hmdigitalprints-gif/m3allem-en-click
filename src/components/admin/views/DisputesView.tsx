import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, CheckCircle, ShieldAlert, Loader2, ArrowUpRight } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisputesView({ onAction }: ViewProps) {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/disputes', { 
        credentials: 'include'
      });
      const data = await res.json();
      setDisputes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (id: string, resolution: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/disputes/${id}/resolve`, { 
        credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolution })
      });
      if (res.ok) {
        setSelectedDispute(null);
        fetchDisputes();
        onAction?.(`Dispute resolved with: ${resolution}`);
      }
    } catch (error) {
      onAction?.('Failed to resolve dispute');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pt-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Disputes & Resolutions</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Handle conflicts between customers and artisans</p>
        </div>
        <div className="flex gap-4">
          
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/[0.01]">
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Dispute ID</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Order</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Parties</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Reason</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <Loader2 size={24} className="animate-spin text-[#FFD700] mx-auto mb-3" />
                    Loading disputes...
                  </td>
                </tr>
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No disputes found.
                  </td>
                </tr>
              ) : disputes.map((d) => (
                <tr key={d.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedDispute(d)}>
                  <td className="px-6 py-4 font-mono text-sm font-bold text-[var(--text-muted)]">#{d.id.substring(0, 8)}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-[var(--text-muted)] hover:text-[#FFD700] transition-colors flex items-center gap-1">
                      {d.order_id.substring(0, 8)} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[var(--text)] mb-0.5">{d.client_name || 'Unknown Client'}</span>
                      <span className="text-xs font-medium text-[var(--text-muted)]">vs {d.artisan_name || 'Unknown Artisan'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-[200px] truncate text-sm font-medium text-[var(--text-muted)]">{d.reason || 'No reason provided'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border items-center justify-center w-fit shadow-sm ${
                      d.status === 'open' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      d.status === 'in_review' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {d.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedDispute(d); }}
                      className="text-[#FFD700] text-[11px] font-black hover:text-[#E6C200] transition-colors active:scale-95 uppercase tracking-widest bg-[#FFD700]/10 px-3 py-2 rounded-lg border border-[#FFD700]/20 hover:bg-[#FFD700]/20"
                    >
                      Review Case
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Case Modal */}
      <AnimatePresence>
        {selectedDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">Review Dispute</h3>
                <button onClick={() => setSelectedDispute(null)} className="p-2 hover:bg-[var(--border)] rounded-xl transition-colors">
                  <X size={20} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors" />
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="p-5 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Reason for Dispute</p>
                  <p className="text-sm font-medium text-[var(--text)] leading-relaxed">{selectedDispute.reason || 'No description provided by the user.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Client</p>
                    <p className="text-sm font-bold text-[var(--text)]">{selectedDispute.client_name || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Artisan</p>
                    <p className="text-sm font-bold text-[var(--text)]">{selectedDispute.artisan_name || 'N/A'}</p>
                  </div>
                </div>

                {selectedDispute.status !== 'resolved' && (
                  <div className="space-y-4 pt-6 border-t border-[var(--border)] mt-6">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-center mb-4">Take Action</p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleResolve(selectedDispute.id, 'refund_client')}
                        disabled={submitting}
                        className="w-full py-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-wider text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 group shadow-sm disabled:opacity-50"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />}
                        Refund Client
                      </button>
                      <button 
                        onClick={() => handleResolve(selectedDispute.id, 'pay_artisan')}
                        disabled={submitting}
                        className="w-full py-4 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black uppercase tracking-wider text-sm hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2 group shadow-sm disabled:opacity-50"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />}
                        Pay Artisan
                      </button>
                      <button 
                        onClick={() => handleResolve(selectedDispute.id, 'split_payment')}
                        disabled={submitting}
                        className="w-full py-4 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 font-black uppercase tracking-wider text-sm hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2 group shadow-sm disabled:opacity-50"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <AlertTriangle size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />}
                        Split 50/50
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
