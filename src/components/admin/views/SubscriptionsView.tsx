import React, { useState, useEffect } from 'react';
import { Plus, Users, X, Save, Loader2, Crown } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubscriptionsView({ onAction }: ViewProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', duration_days: '30', description: '' });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions', { 
        credentials: 'include'
      });
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/subscriptions', { 
        credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
          },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration_days: parseInt(formData.duration_days)
        })
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', price: '', duration_days: '30', description: '' });
        fetchPlans();
        onAction?.('Subscription plan created successfully');
      }
    } catch (error) {
      onAction?.('Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pt-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Subscription Plans</h1>
          <p className={`text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider`}>Manage premium plans for artisans and companies.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#FFD700] text-black px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors active:scale-95 shadow-lg shadow-[#FFD700]/10 flex items-center gap-2"
        >
          <Plus size={18} strokeWidth={3} /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-24 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
            <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-3 text-center py-24 text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">No plans found.</div>
        ) : plans.map((plan, i) => (
          <div key={plan.id} className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] relative overflow-hidden shadow-sm flex flex-col group hover:border-[#FFD700]/30 transition-colors">
            <div className={`absolute top-0 right-0 w-32 h-32 ${i % 3 === 0 ? 'bg-gray-500' : i % 3 === 1 ? 'bg-[#FFD700]' : 'bg-purple-500'}/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none group-hover:opacity-60 transition-opacity`} />
            
            <div className="mb-6 flex items-center justify-between">
              <div className="p-3 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#FFD700] shrink-0 shadow-inner">
                <Crown size={24} strokeWidth={2.5} />
              </div>
              <span className="px-3 py-1 bg-[var(--border)] rounded-lg text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border border-[var(--border)]">
                {plan.duration_days} Days
              </span>
            </div>

            <h3 className="text-2xl font-black text-[var(--text)] tracking-tight mb-2 relative z-10">{plan.name}</h3>
            
            <div className="flex items-end gap-1 mb-6 relative z-10">
              <span className="text-sm font-black text-[#FFD700] pb-1 tracking-wider uppercase">MAD</span>
              <span className="text-4xl font-black text-[var(--text)] tracking-tighter">{(Number(plan.price) || 0).toFixed(0)}</span>
              <span className="text-sm font-bold text-[var(--text-muted)] pb-1">/{plan.duration_days === 30 ? 'mo' : plan.duration_days + 'd'}</span>
            </div>

            <div className="flex items-center gap-3 text-sm font-medium text-[var(--text-muted)] mb-8 bg-[var(--card-surface)] p-4 rounded-lg border border-[var(--border)] shadow-inner">
              <Users size={16} className="text-[#FFD700]" strokeWidth={2.5} />
              <span><strong className="text-[var(--text)]">{Math.floor(Math.random() * 1000)}</strong> Active Users</span>
            </div>

            <div className="mt-auto flex gap-3">
              
              
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      <AnimatePresence>
        {showModal && (
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
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">Create Plan</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--border)] rounded-xl transition-colors">
                  <X size={20} className="text-[var(--text-muted)] hover:text-[var(--text)]" />
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Plan Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="e.g. Premium Artisan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Price (MAD)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                      placeholder="299"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Duration (Days)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                      className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                      placeholder="30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors h-24 resize-none shadow-inner"
                    placeholder="Plan benefits..."
                  />
                </div>

                <div className="flex gap-4 pt-4 mt-8">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text-muted)] text-sm font-black uppercase tracking-wider hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-lg bg-[#FFD700] text-black text-sm font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#FFD700]/10"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
                    {submitting ? 'Creating...' : 'Create Plan'}
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
