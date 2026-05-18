import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, UserCog, AlertTriangle, X, Check, Shield, MoreVertical } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersView({ onAction }: ViewProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'client', password: 'password123' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { 
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.map((u: any) => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email || u.phone || 'No contact',
          role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
          balance: 0,
          status: u.verified ? 'Verified' : 'Pending',
          avatar: u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=random`
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
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', { 
        credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
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
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { 
        credentials: 'include', 
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
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
    <div className="space-y-8 pt-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Users Management</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Manage identities & roles</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#FFD700] text-black px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors active:scale-95 shadow-lg shadow-[#FFD700]/10 flex items-center gap-2"
        >
          <Plus size={18} strokeWidth={3} /> Add User
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] flex-1 w-full max-w-md focus-within:border-[#FFD700]/50 transition-colors shadow-inner">
          <Search size={18} className="text-[var(--text-muted)]" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search by name, email..." 
            className="bg-transparent border-none outline-none w-full ml-3 text-sm font-bold text-[var(--text)] placeholder:text-[var(--text-muted)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" strokeWidth={2.5} />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg pl-11 pr-10 py-3.5 bg-[var(--card-surface)] border border-[var(--border)] outline-none focus:border-[#FFD700]/50 transition-colors appearance-none text-[var(--text)] text-sm font-black uppercase tracking-wider cursor-pointer shadow-inner"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
            >
              <option value="All Roles" className="bg-[var(--card-surface)]">All Roles</option>
              <option value="Clients" className="bg-[var(--card-surface)]">Clients</option>
              <option value="Artisans" className="bg-[var(--card-surface)]">Artisans</option>
              <option value="Admins" className="bg-[var(--card-surface)]">Admins</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/[0.01]">
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">User Info</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Role</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Balance</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-[#FFD700]" />
                      <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)] shrink-0 shadow-sm group-hover:border-[#FFD700]/30 transition-colors">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--text)] tracking-tight leading-tight mb-1 group-hover:text-[#FFD700] transition-colors">{user.name}</span>
                        <span className="text-xs font-bold text-[var(--text-muted)]">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 rounded-lg bg-[var(--card-surface)] text-xs font-black text-[var(--text-muted)] border border-[var(--border)] uppercase tracking-wider shadow-sm">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-[#FFD700] tracking-tight">
                      {(Number(user.balance) || 0).toFixed(2)} <span className="text-xs">MAD</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border items-center justify-center gap-1.5 w-fit shadow-sm ${
                      user.status === 'Verified' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 
                      'text-[var(--text-muted)] bg-[var(--border)] border-[var(--border)]'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleVerifyUser(user.id, user.status)}
                        className={`p-2.5 rounded-xl border transition-colors shadow-sm inline-flex items-center justify-center ${
                          user.status === 'Verified' ? 'text-[var(--text-muted)] hover:bg-[var(--border)] border-[var(--border)] hover:text-[var(--text)]' : 'text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20'
                        }`}
                        title={user.status === 'Verified' ? 'Unverify User' : 'Verify User'}
                      >
                        {user.status === 'Verified' ? <X size={18} strokeWidth={2.5} /> : <Check size={18} strokeWidth={2.5} />}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/10 rounded-full blur-[60px] pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00]" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">Add New User</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-[var(--border)] rounded-xl transition-colors">
                  <X size={20} className="text-[var(--text-muted)] hover:text-[var(--text)]" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-medium focus:border-[#FFD700]/50 outline-none transition-colors shadow-inner"
                    placeholder="+212 6..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">User Role</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-bold focus:border-[#FFD700]/50 outline-none transition-colors appearance-none cursor-pointer shadow-inner pr-10"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center' }}
                  >
                    <option value="client" className="bg-[var(--card-surface)]">Client</option>
                    <option value="artisan" className="bg-[var(--card-surface)]">Artisan</option>
                    <option value="admin" className="bg-[var(--card-surface)]">Admin</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4 mt-8">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text-muted)] font-black uppercase tracking-wider text-sm hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-lg bg-[#FFD700] text-black font-black uppercase tracking-wider text-sm hover:bg-[#E6C200] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#FFD700]/10"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
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
