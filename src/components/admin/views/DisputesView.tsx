import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

export default function DisputesView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Disputes & Resolutions</h1>
          <p className={`text-sm ${textMutedClasses} mt-1`}>Handle conflicts between customers and service providers.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onAction?.('Reviewing high priority disputes...')}
            className="bg-[var(--destructive)] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--destructive)]/20"
          >
            <AlertTriangle size={16} /> High Priority ({disputes.filter(d => d.status === 'open').length})
          </button>
        </div>
      </div>

      <div className={`rounded-2xl overflow-hidden ${cardClasses}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs uppercase tracking-wider bg-[var(--glass-bg)] text-[var(--text-muted)]`}>
              <tr>
                <th className="px-6 py-4 font-medium">Dispute ID</th>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Parties</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-[var(--border)]`}>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-[var(--text-muted)]">Loading...</td></tr>
              ) : disputes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-[var(--text-muted)]">No disputes found.</td></tr>
              ) : disputes.map((d) => (
                <tr key={d.id} className={`transition-colors ${hoverClasses}`}>
                  <td className="px-6 py-4 font-mono text-xs text-[var(--text)]">{d.id.substring(0, 8)}</td>
                  <td className="px-6 py-4 font-mono text-xs text-[var(--text)]">{d.order_id.substring(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <p className="font-bold text-[var(--text)]">{d.client_name}</p>
                      <p className={textMutedClasses}>vs {d.artisan_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-xs truncate text-[var(--text)]">{d.reason}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      d.status === 'open' ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]' : 
                      d.status === 'in_review' ? 'bg-[var(--warning)]/10 text-[var(--warning)]' : 
                      'bg-[var(--success)]/10 text-[var(--success)]'
                    }`}>
                      {d.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedDispute(d)}
                      className="text-[var(--accent)] text-xs font-bold hover:underline transition-all active:scale-95"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[var(--text)]">Review Dispute</h3>
                <button onClick={() => setSelectedDispute(null)} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Reason for Dispute</p>
                  <p className="text-sm text-[var(--text)]">{selectedDispute.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Client</p>
                    <p className="text-sm font-bold text-[var(--text)]">{selectedDispute.client_name}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Artisan</p>
                    <p className="text-sm font-bold text-[var(--text)]">{selectedDispute.artisan_name}</p>
                  </div>
                </div>

                {selectedDispute.status !== 'resolved' && (
                  <div className="space-y-4 pt-4">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest text-center">Take Action</p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleResolve(selectedDispute.id, 'refund_client')}
                        disabled={submitting}
                        className="w-full py-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
                        Refund Client
                      </button>
                      <button 
                        onClick={() => handleResolve(selectedDispute.id, 'pay_artisan')}
                        disabled={submitting}
                        className="w-full py-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                        Pay Artisan
                      </button>
                      <button 
                        onClick={() => handleResolve(selectedDispute.id, 'split_payment')}
                        disabled={submitting}
                        className="w-full py-4 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <AlertTriangle size={18} />}
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
