import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, UserCog, AlertTriangle, X, Check, Shield } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

export default function UsersView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'client', password: 'password123' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include'});
      if (res.ok) {
        const data = await res.json();
        setUsers(data.map((u: any) => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email || u.phone || 'No contact',
          role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
          balance: 0,
          status: u.verified ? 'Verified' : 'Pending',
          avatar: u.avatar_url || `https://ui-avatars.com/api/?name=${u.name || 'U'}&background=random`
        })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', { credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewUser({ name: '', email: '', phone: '', role: 'client', password: 'password123' });
        fetchUsers();
        onAction?.('User added successfully');
      } else {
        const data = await res.json();
        onAction?.(data.error || 'Failed to add user');
      }
    } catch (error) {
      onAction?.('Error adding user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyUser = async (userId: string, currentStatus: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { credentials: 'include', 
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          },
        body: JSON.stringify({ verified: currentStatus !== 'Verified' })
      });
      if (res.ok) {
        fetchUsers();
        onAction?.(`User ${currentStatus === 'Verified' ? 'unverified' : 'verified'} successfully`);
      }
    } catch (error) {
      onAction?.('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || u.role === roleFilter.replace(/s$/, '');
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl tech-header text-[var(--text)]">Users Management</h1>
          <p className="tech-label mt-1 opacity-70">Manage all platform users, verify identities, and monitor activity.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-2xl tech-label hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="hynex-card p-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <div className="flex items-center px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex-1 focus-within:border-[var(--accent)]/50 transition-all">
            <Search size={18} className="text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search by name, email, or ID..." 
              className="bg-transparent border-none outline-none w-full ml-3 tech-label text-[var(--text)] not-italic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl px-4 py-3 bg-[var(--bg)] border border-[var(--border)] outline-none focus:border-[var(--accent)]/50 transition-all appearance-none pr-10 relative text-[var(--text)] tech-label not-italic"
          >
            <option>All Roles</option>
            <option>Clients</option>
            <option>Artisans</option>
            <option>Sellers</option>
            <option>Companies</option>
            <option>Admins</option>
          </select>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="tech-label border-b border-[var(--border)]">
              <tr>
                <th className="px-8 py-6 font-black">User Info</th>
                <th className="px-8 py-6 font-black">Role</th>
                <th className="px-8 py-6 font-black">Wallet Balance</th>
                <th className="px-8 py-6 font-black">Status</th>
                <th className="px-8 py-6 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                      <p className="tech-label">Loading users data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center tech-label opacity-50">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-[var(--accent)]/5 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black italic text-[var(--text)]">{user.name}</p>
                        <p className="text-[10px] tech-value text-[var(--text-muted)] opacity-70">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full bg-[var(--glass-bg)] tech-label border border-[var(--glass-border)]">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="tech-value text-[var(--accent)] text-base">MAD {user.balance.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full tech-label border border-[var(--glass-border)] ${
                      user.status === 'Verified' ? 'text-[var(--success)] bg-[var(--success)]/5' : 
                      user.status === 'Pending' ? 'text-[var(--warning)] bg-[var(--warning)]/5' : 'text-[var(--destructive)] bg-[var(--destructive)]/5'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleVerifyUser(user.id, user.status)}
                        className={`p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] transition-all ${user.status === 'Verified' ? 'text-[var(--warning)] hover:bg-[var(--warning)]/10' : 'text-[var(--success)] hover:bg-[var(--success)]/10'}`}
                        title={user.status === 'Verified' ? 'Unverify User' : 'Verify User'}
                      >
                        {user.status === 'Verified' ? <Shield size={18} /> : <Check size={18} />}
                      </button>
                      <button 
                        onClick={() => onAction?.(`Managing permissions for ${user.name}...`)}
                        className="p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-all"
                        title="Manage Permissions"
                      >
                        <UserCog size={18} />
                      </button>
                      <button 
                        onClick={() => onAction?.(`Sending alert to ${user.name}...`)}
                        className="p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--destructive)] hover:text-white transition-all"
                        title="Send Alert"
                      >
                        <AlertTriangle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl tech-header text-[var(--text)]">Add New User</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all">
                  <X size={20} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-6">
                <div>
                  <label className="block tech-label mb-2 opacity-70">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-value not-italic"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block tech-label mb-2 opacity-70">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-value not-italic"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block tech-label mb-2 opacity-70">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]/50 outline-none transition-all tech-value not-italic"
                    placeholder="+212 6..."
                  />
                </div>
                <div>
                  <label className="block tech-label mb-2 opacity-70">User Role</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all appearance-none tech-label"
                  >
                    <option value="client">Client</option>
                    <option value="artisan">Artisan</option>
                    <option value="seller">Seller</option>
                    <option value="company">Company</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-bold hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    {submitting ? 'Adding...' : 'Add User'}
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
