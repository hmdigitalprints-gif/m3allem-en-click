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
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Withdrawal Requests</h2>
          <p className="text-sm text-[var(--text-muted)]">Review and process artisan and user payouts</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-1">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filter === f ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Method</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[var(--bg)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold">
                          {req.user?.name?.charAt(0) || <User size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{req.user?.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{req.user?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[var(--text)]">{Number(req.amount).toFixed(2)} MAD</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold capitalize flex items-center gap-1.5">
                          {req.method.replace('_', ' ')}
                        </p>
                        {req.accountDetails && (
                          <button
                            onClick={() => alert(`Account Details:\n${JSON.parse(req.accountDetails!).details || req.accountDetails}`)}
                            className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={10} /> View details
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          req.status === 'approved'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : req.status === 'rejected'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {req.status === 'pending' && <Clock size={10} />}
                        {req.status === 'approved' && <CheckCircle size={10} />}
                        {req.status === 'rejected' && <XCircle size={10} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] opacity-60">
                        {new Date(req.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(req.id, 'approved')}
                            className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                            title="Approve & Payout"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'rejected')}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Reject & Refund"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <button className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border)]/20 transition-all">
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]">
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
