import React, { useState, useEffect } from 'react';
import { Plus, UserCog, X, Save, Loader2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { ViewProps } from '../types';

export default function AdminManagementView({ onAction }: ViewProps) {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: 'password123' });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users?role=admin', { 
        credentials: 'include'
      });
      const data = await res.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', { 
        credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, role: 'admin' })
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', password: 'password123' });
        fetchAdmins();
        onAction?.('Admin user added successfully');
      } else {
        const data = await res.json();
        onAction?.(data.error || 'Failed to add admin');
      }
    } catch (error) {
      onAction?.('Error adding admin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Admin Management</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Manage administrative users and their permission levels.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#FFD700] text-black px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#E6C200] transition-colors active:scale-95 shadow-lg shadow-[#FFD700]/10"
        >
          <Plus size={18} strokeWidth={3} /> Add Admin
        </button>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/[0.01]">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Admin User</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Role</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Last Login</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
                      <p className="text-sm font-bold text-[var(--text-muted)] tracking-wider uppercase">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No admins found.
                  </td>
                </tr>
              ) : admins.map((admin) => (
                <tr key={admin.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {admin.avatar_url ? (
                        <img src={admin.avatar_url} alt={admin.name} className="w-10 h-10 rounded-xl object-cover border border-[var(--border)]" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#FFD700] flex items-center justify-center font-black text-lg shrink-0 group-hover:border-[#FFD700]/30 transition-colors">
                          {admin.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-[var(--text)] tracking-tight">{admin.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--text-muted)] bg-[var(--border)] border border-[var(--border)]">
                      {admin.id === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--text-muted)]">N/A</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
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
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">Add New Admin</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--border)] rounded-xl transition-colors">
                  <X size={20} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors" />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="Admin Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="+212 6..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text-muted)] font-black uppercase tracking-wider hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-lg bg-[#FFD700] text-black font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#FFD700]/10 text-sm"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
                    {submitting ? 'Adding...' : 'Add Admin'}
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
