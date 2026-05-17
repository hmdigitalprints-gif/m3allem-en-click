import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, AlertTriangle, Search, MoreVertical, Loader2, Lock, Unlock } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';
import { useAuth } from '../../../context/AuthContext';

export default function EscrowView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escrow Management</h1>
          <p className="text-sm text-white/40 mt-1">Manage funds held in escrow for active projects and material orders.</p>
        </div>
        <div className="flex gap-3">
          {/* <button 
            onClick={() => onAction?.('Escrow Policies functionality coming soon!')}
            className="bg-[#FFD700] text-black px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-all active:scale-95"
          >
            <ShieldCheck size={18} /> Escrow Policies
          </button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Funds in Escrow" value={`MAD ${Number(totalFunds).toFixed(2)}`} icon={<ShieldCheck size={20} />} trend="0%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Active Escrows" value={escrows.filter(e => e.status !== 'released').length.toString()} icon={<Clock size={20} />} trend="0%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Disputed Escrows" value={escrows.filter(e => e.status === 'disputed').length.toString()} icon={<AlertTriangle size={20} />} trend="0%" isPositive={false} isDarkMode={isDarkMode} />
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex items-center px-4 py-2 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} flex-1 max-w-md`}>
          <Search size={18} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Search projects or parties..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full ml-3 text-sm text-[var(--text)]" 
          />
        </div>
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Active Escrow Transactions</h3>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-xs text-[#FFD700] hover:underline"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-white/20 border-b border-white/5">
              <tr>
                <th className="px-8 py-4 font-medium">Project / Order</th>
                <th className="px-8 py-4 font-medium">Parties</th>
                <th className="px-8 py-4 font-medium">Amount</th>
                <th className="px-8 py-4 font-medium">Release Date</th>
                <th className="px-8 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">Loading escrows...</td></tr>
              ) : filteredEscrows.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">No escrows found.</td></tr>
              ) : filteredEscrows.map((escrow) => (
                <tr key={escrow.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-5 font-bold">{escrow.project_name}</td>
                  <td className="px-8 py-5 text-white/60">{escrow.parties}</td>
                  <td className="px-8 py-5 font-bold text-[#FFD700]">MAD {Number(escrow.amount).toFixed(2)}</td>
                  <td className="px-8 py-5 text-white/40">{new Date(escrow.release_date).toLocaleDateString()}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-2 w-fit ml-auto ${
                      escrow.status === 'locked' ? 'bg-white/5 text-white/60' : 
                      escrow.status === 'pending_release' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                      {escrow.status === 'locked' ? <Lock size={12} /> : <Unlock size={12} />}
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
