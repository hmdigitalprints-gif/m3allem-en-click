import React, { useState, useEffect } from 'react';
import {
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Filter,
  Search,
  Loader2,
  MoreVertical,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface WithdrawalsViewProps {
  onAction?: (msg: string) => void;
}

interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  method: string;
  accountDetails: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export default function WithdrawalsView({ onAction }: WithdrawalsViewProps) {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('m3allem_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/admin/withdrawals', { credentials: 'include', headers });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error('Failed to load withdrawals', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        onAction?.(`Request ${status} successfully`);
        await fetchWithdrawals();
      } else {
        const data = await res.json();
        onAction?.('Error: ' + (data.error || 'Action failed'));
      }
    } catch {
      onAction?.('Network error processing request');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch =
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 pb-20 pt-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
        <p className="text-sm font-bold text-[var(--text-muted)] tracking-wider uppercase">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">Withdrawal Requests</h2>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Review and process payouts</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] flex-1 w-full max-w-md focus-within:border-[#FFD700]/50 transition-colors shadow-inner">
          <Search size={18} className="text-[var(--text-muted)]" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none ml-3 text-sm font-bold text-[var(--text)] placeholder:text-[var(--text-muted)]"
          />
        </div>
        <div className="flex bg-[var(--card-surface)] border border-[var(--border)] rounded-lg p-1.5 shadow-inner">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filter === f ? 'bg-[#FFD700] text-black shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/[0.01]">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">User</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Method</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Date</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#FFD700] flex items-center justify-center font-black text-sm shrink-0 group-hover:border-[#FFD700]/30 transition-colors shadow-sm">
                          {req.user?.name?.charAt(0) || <User size={18} strokeWidth={2.5} />}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-[var(--text)] tracking-tight leading-tight group-hover:text-[#FFD700] transition-colors mb-0.5">{req.user?.name || 'Unknown User'}</p>
                          <p className="text-xs font-bold text-[var(--text-muted)] capitalize">{req.user?.role || 'User'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-[#FFD700] tracking-tight">{(Number(req.amount) || 0).toFixed(2)} <span className="text-xs text-[#FFD700]/70">MAD</span></p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <p className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] rounded-lg bg-[var(--card-surface)] border border-[var(--border)] px-2.5 py-1.5 flex items-center gap-1.5 w-fit shadow-sm">
                          <ArrowDownRight size={14} className="text-[#FFD700]" strokeWidth={2.5} /> {req.method.replace('_', ' ')}
                        </p>
                        {req.accountDetails && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onAction?.(`Account Details: ${req.accountDetails?.includes('{') ? JSON.parse(req.accountDetails).details : req.accountDetails}`); }}
                            className="text-[10px] font-bold text-[#FFD700] hover:text-[#E6C200] transition-colors flex items-center gap-1 ml-1"
                          >
                            <ExternalLink size={10} strokeWidth={2.5} /> View details
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border shadow-sm ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : req.status === 'rejected'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                        }`}
                      >
                        {req.status === 'pending' && <Clock size={14} strokeWidth={2.5} />}
                        {req.status === 'approved' && <CheckCircle size={14} strokeWidth={2.5} />}
                        {req.status === 'rejected' && <XCircle size={14} strokeWidth={2.5} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold text-[var(--text-muted)]">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                          {new Date(req.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-end">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'approved'); }}
                            className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-sm flex items-center gap-2 group/btn"
                            title="Approve & Payout"
                          >
                            <CheckCircle size={18} className="group-hover/btn:scale-110 transition-transform" strokeWidth={2.5} />
                            <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Approve</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'rejected'); }}
                            className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/30 hover:bg-red-500/20 transition-all shadow-sm flex items-center gap-2 group/btn"
                            title="Reject & Refund"
                          >
                            <XCircle size={18} className="group-hover/btn:scale-110 transition-transform" strokeWidth={2.5} />
                            <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Reject</span>
                          </button>
                        </div>
                      ) : (
                        <button className="p-2.5 rounded-xl text-[var(--text-muted)] hover:text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors border border-transparent">
                          <ChevronRight size={18} strokeWidth={2.5} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No withdrawal requests found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
