import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, ArrowUpRight, Clock, Filter, Search, MoreVertical, Loader2 } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';
import { useAuth } from '../../../context/AuthContext';

export default function PaymentsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transactions', { credentials: 'include'});
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  const filteredTransactions = transactions.filter(t => 
    t.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = transactions.reduce((acc, t) => acc + (t.fee_amount || 0), 0);
  const totalPayouts = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((acc, t) => acc + (t.amount || 0), 0);
  const pendingPayouts = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments & Wallets</h1>
          <p className="text-sm text-white/40 mt-1">Monitor all financial transactions, platform fees, and user wallet balances.</p>
        </div>
        <button 
          onClick={() => onAction?.('Generating financial report...')}
          className="bg-[#FFD700] text-black px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-all active:scale-95"
        >
          <Download size={18} /> Financial Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Platform Revenue" value={`MAD ${totalRevenue.toLocaleString()}`} icon={<TrendingUp size={20} />} trend="0%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Total Payouts" value={`MAD ${totalPayouts.toLocaleString()}`} icon={<ArrowUpRight size={20} />} trend="0%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Pending Payouts" value={`MAD ${pendingPayouts.toLocaleString()}`} icon={<Clock size={20} />} trend="0%" isPositive={false} isDarkMode={isDarkMode} />
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Recent Transactions</h3>
          <div className="flex items-center gap-4">
            <div className={`flex items-center px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} max-w-xs`}>
              <Search size={16} className="text-white/40" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full ml-3 text-xs text-[var(--text)]" 
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-white/20 border-b border-white/5">
              <tr>
                <th className="px-8 py-4 font-medium">Transaction ID</th>
                <th className="px-8 py-4 font-medium">User</th>
                <th className="px-8 py-4 font-medium">Amount</th>
                <th className="px-8 py-4 font-medium">Type</th>
                <th className="px-8 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">Loading transactions...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-white/40">No transactions found.</td></tr>
              ) : filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-5 font-mono text-xs text-white/40">#{txn.id.substring(0, 8)}</td>
                  <td className="px-8 py-5 font-bold">{txn.user_name}</td>
                  <td className={`px-8 py-5 font-bold ${['topup', 'release'].includes(txn.type) ? 'text-[#10B981]' : 'text-rose-500'}`}>
                    {['topup', 'release'].includes(txn.type) ? '+' : '-'} MAD {txn.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-white/60 uppercase text-[10px] font-bold tracking-widest">{txn.type}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      txn.status === 'completed' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                    }`}>
                      {txn.status}
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
