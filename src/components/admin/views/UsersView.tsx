import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, UserCog, AlertTriangle } from 'lucide-react';
import { ViewProps } from '../types';

export default function UsersView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('m3allem_token');
        const res = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.map((u: any) => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email || u.phone || 'No contact',
            role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
            balance: 0, // Balance would need another join or separate fetch
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
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Users Management</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage all platform users, verify identities, and monitor activity.</p>
        </div>
        <button 
          onClick={() => onAction?.('Add User functionality coming soon!')}
          className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="hynex-card p-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <div className="flex items-center px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex-1 focus-within:border-[var(--accent)]/50 transition-all">
            <Search size={18} className="text-[var(--text-muted)]" />
            <input type="text" placeholder="Search by name, email, or ID..." className="bg-transparent border-none outline-none w-full ml-3 text-sm text-[var(--text)]" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onAction?.('Filtering users...')}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--card-bg)] transition-all text-[var(--text)]"
          >
            <Filter size={18} /> Filter
          </button>
          <select className="text-sm rounded-2xl px-4 py-3 bg-[var(--bg)] border border-[var(--border)] outline-none focus:border-[var(--accent)]/50 transition-all appearance-none pr-10 relative text-[var(--text)]">
            <option>All Roles</option>
            <option>Customers</option>
            <option>Artisans</option>
            <option>Sellers</option>
          </select>
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)]">
              <tr>
                <th className="px-8 py-6 font-medium">User Info</th>
                <th className="px-8 py-6 font-medium">Role</th>
                <th className="px-8 py-6 font-medium">Wallet Balance</th>
                <th className="px-8 py-6 font-medium">Status</th>
                <th className="px-8 py-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                      <p className="text-[var(--text-muted)]">Loading users data...</p>
                    </div>
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="group hover:bg-[var(--card-bg)]/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[var(--border)]">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-base text-[var(--text)]">{user.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full bg-[var(--card-bg)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-mono font-bold text-[var(--accent)]">${user.balance.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--card-bg)] ${
                      user.status === 'Active' || user.status === 'Verified' ? 'text-[var(--success)]' : 
                      user.status === 'Pending' ? 'text-[var(--warning)]' : 'text-[var(--destructive)]'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-all">
                        <UserCog size={18} />
                      </button>
                      <button className="p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--destructive)] hover:text-white transition-all">
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
    </div>
  );
}
