import React, { useState, useEffect } from 'react';
import { Plus, UserCog, X, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

interface AdminManagementViewProps {
  isDarkMode: boolean;
  cardClasses: string;
  textMutedClasses: string;
  hoverClasses: string;
  onAction?: (msg: string) => void;
}

export default function AdminManagementView({ 
  isDarkMode, 
  cardClasses, 
  textMutedClasses, 
  hoverClasses, 
  onAction 
}: AdminManagementViewProps) {
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tech-header text-2xl">Admin Management</h1>
          <p className="tech-label opacity-70 mt-1">Manage administrative users and their permission levels.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-2xl tech-label hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2"
        >
          <Plus size={18} /> Add Admin
        </button>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-6 py-4 tech-label">Admin User</th>
                <th className="px-6 py-4 tech-label">Role</th>
                <th className="px-6 py-4 tech-label">Last Login</th>
                <th className="px-6 py-4 tech-label">Status</th>
                <th className="px-6 py-4 tech-label text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center tech-label opacity-50">Loading...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center tech-label opacity-50">No admins found.</td></tr>
              ) : admins.map((admin) => (
                <tr key={admin.id} className="group hover:bg-[var(--accent)]/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {admin.avatar_url ? (
                        <img src={admin.avatar_url} alt={admin.name} className="w-10 h-10 rounded-2xl object-cover border border-[var(--border)]" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center tech-header text-sm not-italic">
                          {admin.name.charAt(0)}
                        </div>
                      )}
                      <span className="tech-header text-sm not-italic text-[var(--text)]">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)] tech-label text-[var(--text-muted)]">
                      {admin.id === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4 tech-label opacity-50">N/A</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] tech-label">Active</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onAction?.(`Managing permissions for ${admin.name}...`)}
                      className="p-2 rounded-xl hover:bg-[var(--accent)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all active:scale-95"
                    >
                      <UserCog size={18} />
                    </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[var(--text)]">Add New Admin</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="Admin Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all"
                    placeholder="+212 6..."
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
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] tech-label hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
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
