import React, { useState, useEffect } from 'react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';
import { X, Save, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

export default function CashCollectionsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtisan, setSelectedArtisan] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');

  const fetchCollections = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cash-collections', { credentials: 'include'});
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cash collections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [token]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArtisan || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/cash-collections/${selectedArtisan.artisan_id}/record-payment`, { credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });
      if (res.ok) {
        setSelectedArtisan(null);
        setAmount('');
        fetchCollections();
        onAction?.(`Payment of MAD ${amount} recorded for ${selectedArtisan.artisan_name}`);
      }
    } catch (error) {
      onAction?.('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const totalOwed = collections.reduce((acc, c) => acc + c.commission_owed, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tech-header text-2xl">Cash Collections</h1>
          <p className="tech-label opacity-70 mt-1">Track commissions owed by artisans for cash-on-delivery jobs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Owed" value={`MAD ${totalOwed.toLocaleString()}`} trend="+5.2%" isPositive={false} isDarkMode={isDarkMode} />
        <KpiCard title="Collected (MTD)" value="MAD 0" trend="0.0%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Overdue Artisans" value={collections.length.toString()} trend="-2" isPositive={true} isDarkMode={isDarkMode} />
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-6 py-4 tech-label">Artisan</th>
                <th className="px-6 py-4 tech-label">Total Cash Handled</th>
                <th className="px-6 py-4 tech-label">Commission Owed</th>
                <th className="px-6 py-4 tech-label text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center tech-label opacity-50">Loading...</td></tr>
              ) : collections.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center tech-label opacity-50">No cash collections found.</td></tr>
              ) : collections.map((c) => (
                <tr key={c.artisan_id} className="group hover:bg-[var(--accent)]/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt={c.artisan_name} className="w-10 h-10 rounded-2xl object-cover border border-[var(--border)]" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center tech-header text-sm not-italic">
                          {c.artisan_name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="tech-header text-sm not-italic text-[var(--text)]">{c.artisan_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 tech-value text-sm text-[var(--text)] not-italic">MAD {c.total_cash_handled.toLocaleString()}</td>
                  <td className="px-6 py-4 tech-value text-sm text-[var(--destructive)] not-italic font-bold">MAD {c.commission_owed.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedArtisan(c);
                        setAmount(c.commission_owed.toString());
                      }}
                      className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded-xl tech-label hover:opacity-90 transition-all active:scale-95 shadow-sm"
                    >
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {selectedArtisan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[var(--text)]">Record Payment</h3>
                <button onClick={() => setSelectedArtisan(null)} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] tech-header text-sm not-italic">
                    {selectedArtisan.artisan_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="tech-header text-sm not-italic text-[var(--text)]">{selectedArtisan.artisan_name}</p>
                    <p className="tech-label opacity-70">Owed: MAD {selectedArtisan.commission_owed.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Payment Amount (MAD)</label>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedArtisan(null)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-bold hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] tech-label hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {submitting ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
