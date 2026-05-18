import React, { useState, useEffect } from 'react';
import { ViewProps } from '../types';
import { X, Save, Loader2, CheckCircle, TrendingDown, Users, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function StatCard({ title, value, color, icon: Icon, trend, isPositive, subtitle }: any) {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 flex flex-col justify-between overflow-hidden relative border border-[var(--border)] hover:border-[var(--border)] transition-colors h-[160px] shadow-sm group">
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }} />
      <div className="flex justify-between items-start z-10 relative mb-2">
        <div className="text-[var(--text-muted)] text-[10px] sm:text-xs font-bold tracking-wider uppercase max-w-[70%] leading-tight">
          {title}
        </div>
        <div className="w-10 h-10 rounded-lg flex flex-shrink-0 items-center justify-center border border-[var(--border)] shadow-inner group-hover:scale-105 transition-transform" style={{ backgroundColor: color + '15', color: color }}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      <div className="z-10 relative flex items-end justify-between">
        <div>
          <div className="text-3xl font-black text-[var(--text)] tracking-tight truncate">{value}</div>
          {subtitle && <div className="text-[10px] font-bold text-[var(--text-muted)] mt-1 tracking-wider uppercase">{subtitle}</div>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border shadow-sm ${isPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
            {isPositive ? <TrendingDown size={14} strokeWidth={3} className="rotate-180" /> : <TrendingDown size={14} strokeWidth={3} />} 
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CashCollectionsView({ isDarkMode, onAction }: ViewProps) {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtisan, setSelectedArtisan] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cash-collections', { 
        credentials: 'include'
      });
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
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArtisan) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/cash-collections/${selectedArtisan.artisan_id}/record-payment`, { 
        credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });
      if (res.ok) {
        setSelectedArtisan(null);
        setAmount('');
        fetchCollections();
        onAction?.(`Payment of MAD ${(Number(amount) || 0).toFixed(2)} recorded for ${selectedArtisan.artisan_name}`);
      }
    } catch (error) {
      onAction?.('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const totalOwed = collections.reduce((acc, c) => acc + c.commission_owed, 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">Cash Collections</h2>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Track commissions owed from cash jobs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Owed" value={`${Number(totalOwed).toFixed(0)} MAD`} color="#EF4444" icon={TrendingDown} />
        <StatCard title="Collected (MTD)" value="0 MAD" color="#22C55E" icon={DollarSign} />
        <StatCard title="Overdue Artisans" value={collections.length.toString()} color="#FFD700" icon={Users} />
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/[0.01]">
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Artisan</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Cash Handled</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Commission Owed</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <Loader2 size={32} className="animate-spin text-[#FFD700] mx-auto mb-4" strokeWidth={2.5} />
                    <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Loading collections...</p>
                  </td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    No cash collections found.
                  </td>
                </tr>
              ) : collections.map((c) => (
                <tr key={c.artisan_id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {c.avatar_url ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)] shrink-0 shadow-sm">
                          <img src={c.avatar_url} alt={c.artisan_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[var(--card-surface)] text-[#FFD700] flex items-center justify-center font-black text-sm border border-[var(--border)] group-hover:border-[#FFD700]/30 transition-colors shrink-0 shadow-sm">
                          {c.artisan_name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-bold text-[var(--text)] group-hover:text-[#FFD700] transition-colors">{c.artisan_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm tracking-wider text-[var(--text-muted)] font-bold">
                    {(Number(c.total_cash_handled) || 0).toFixed(2)} MAD
                  </td>
                  <td className="px-6 py-4 font-mono text-sm tracking-wider text-red-500 font-black">
                    {(Number(c.commission_owed) || 0).toFixed(2)} MAD
                  </td>
                  <td className="px-6 py-4 text-end">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArtisan(c);
                        setAmount(c.commission_owed.toString());
                      }}
                      className="bg-[#FFD700] text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors active:scale-95 shadow-sm"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00]" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FFD700] blur-[100px] opacity-10 pointer-events-none rounded-full" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">Record Payment</h3>
                <button onClick={() => setSelectedArtisan(null)} className="p-2 hover:bg-[var(--border)] rounded-xl transition-colors">
                  <X size={20} className="text-[var(--text-muted)] hover:text-[var(--text)]" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-6 relative z-10">
                <div className="flex items-center gap-4 p-5 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                  <div className="w-12 h-12 rounded-xl bg-[var(--border)] flex items-center justify-center text-[#FFD700] font-black text-sm shadow-sm border border-[var(--border)]">
                    {selectedArtisan.artisan_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text)] mb-0.5 tracking-tight">{selectedArtisan.artisan_name}</p>
                    <p className="text-xs font-black tracking-wider text-red-500 uppercase">Owed: {(Number(selectedArtisan.commission_owed) || 0).toFixed(2)} MAD</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Payment Amount (MAD)</label>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] focus:border-[#FFD700]/50 outline-none transition-colors font-mono tracking-wider shadow-inner text-lg font-bold"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-4 pt-4 mt-8">
                  <button 
                    type="button"
                    onClick={() => setSelectedArtisan(null)}
                    className="flex-1 px-6 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text-muted)] text-xs font-black uppercase tracking-wider hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-lg bg-[#FFD700] text-black text-xs font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#FFD700]/10"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" strokeWidth={2.5} /> : <CheckCircle size={18} strokeWidth={2.5} />}
                    {submitting ? 'Recording...' : 'Save Payment'}
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
