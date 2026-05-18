import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, AlertTriangle, Search, Lock, Unlock, Loader2 } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';

export default function EscrowView({ onAction }: ViewProps) {
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEscrows = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/escrows', { 
        credentials: 'include'
      });
      const data = await res.json();
      setEscrows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, []);

  const filteredEscrows = escrows.filter(e => 
    e.project_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.parties.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFunds = escrows.reduce((acc, e) => acc + (e.amount || 0), 0);

  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Escrow Management</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Manage funds held in escrow for active projects and material orders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Funds in Escrow" value={`MAD ${(Number(totalFunds) || 0).toFixed(2)}`} icon={<ShieldCheck size={24} strokeWidth={2.5} />} trend="0%" isPositive={true} isDarkMode={true} />
        <KpiCard title="Active Escrows" value={escrows.filter(e => e.status !== 'released').length.toString()} icon={<Clock size={24} strokeWidth={2.5} />} trend="0%" isPositive={true} isDarkMode={true} />
        <KpiCard title="Disputed Escrows" value={escrows.filter(e => e.status === 'disputed').length.toString()} icon={<AlertTriangle size={24} strokeWidth={2.5} />} trend="0%" isPositive={false} isDarkMode={true} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center px-5 py-3 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] flex-1 w-full max-w-md focus-within:border-[#FFD700]/50 transition-colors shadow-inner">
          <Search size={18} className="text-[var(--text-muted)]" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search projects or parties..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm font-bold text-[var(--text)] placeholder:text-[var(--text-muted)]" 
          />
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">Active Escrow Transactions</h3>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-xs font-black uppercase tracking-wider text-[#FFD700] hover:text-[#E6C200] transition-colors"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-start whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Project / Order</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Parties</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Release Date</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-end">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
                      Loading escrows...
                    </div>
                  </td>
                </tr>
              ) : filteredEscrows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                    No escrows found.
                  </td>
                </tr>
              ) : filteredEscrows.map((escrow) => (
                <tr key={escrow.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[var(--text)] tracking-tight">{escrow.project_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-[var(--text-muted)]">{escrow.parties}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-[#FFD700] tracking-tight">MAD {(Number(escrow.amount) || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--text-muted)]">{new Date(escrow.release_date).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border items-center justify-center gap-1.5 w-fit ml-auto shadow-sm ${
                      escrow.status === 'locked' ? 'bg-[var(--border)] text-[var(--text-muted)] border-[var(--border)]' : 
                      escrow.status === 'pending_release' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {escrow.status === 'locked' ? <Lock size={14} strokeWidth={2.5} /> : <Unlock size={14} strokeWidth={2.5} />}
                      {escrow.status.replace('_', ' ')}
                    </span>
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
