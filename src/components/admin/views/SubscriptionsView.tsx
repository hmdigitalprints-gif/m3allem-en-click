import React, { useState, useEffect } from 'react';
import { Plus, Users, X, Save, Loader2 } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

export default function SubscriptionsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
          <p className={`text-sm ${textMutedClasses} mt-1`}>Manage premium plans for artisans and companies.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#FFD700] text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
        >
          <Plus size={16} /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="col-span-3 text-center py-12">No plans found.</div>
        ) : plans.map((plan, i) => (
          <div key={plan.id} className={`p-6 rounded-3xl ${cardClasses} relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${i % 3 === 0 ? 'bg-gray-500' : i % 3 === 1 ? 'bg-[#FFD700]' : 'bg-purple-500'}/10 rounded-bl-full -mr-8 -mt-8`} />
            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
            <p className="text-2xl font-black text-[#FFD700] mb-4">MAD {Number(plan.price).toFixed(2)}/{plan.duration_days === 30 ? 'mo' : plan.duration_days + 'd'}</p>
            <div className="flex items-center gap-2 text-sm opacity-60">
              <Users size={14} />
              <span>{Math.floor(Math.random() * 1000)} Active Users</span>
            </div>
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => onAction?.(`Editing ${plan.name} plan...`)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'} transition-all active:scale-95`}
              >
                Edit Plan
              </button>
              <button 
                onClick={() => onAction?.(`Viewing users for ${plan.name} plan...`)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'} transition-all active:scale-95`}
              >
                View Users
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[var(--text)]">Create Subscription Plan</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Plan Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="e.g. Premium Artisan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Price (MAD)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                      placeholder="299"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Duration (Days)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                      placeholder="30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all h-24 resize-none"
                    placeholder="Plan benefits..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-bold hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[#FFD700] text-black font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
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
