import React from 'react';
import { Download, TrendingUp, ArrowUpRight, Clock, Filter, Search } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';

export default function PaymentsView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments & Wallets</h1>
          <p className="text-sm text-white/40 mt-1">Monitor all financial transactions, platform fees, and user wallet balances.</p>
        </div>
        <button className="bg-[#FFD700] text-black px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-all">
          <Download size={18} /> Financial Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Platform Revenue" value="$84,290" icon={<TrendingUp size={20} />} trend="+18%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Total Payouts" value="$312,400" icon={<ArrowUpRight size={20} />} trend="+12%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Pending Payouts" value="$12,840" icon={<Clock size={20} />} trend="-5%" isPositive={false} isDarkMode={isDarkMode} />
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Recent Transactions</h3>
          <div className="flex gap-2">
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"><Filter size={16} /></button>
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"><Search size={16} /></button>
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
              {[
                { id: 'TXN-92834', user: 'John Doe', amount: 1250, type: 'Deposit', status: 'Completed' },
                { id: 'TXN-92835', user: 'Jane Smith', amount: -450, type: 'Withdrawal', status: 'Completed' },
                { id: 'TXN-92836', user: 'Mike Johnson', amount: 890, type: 'Payment', status: 'Pending' },
                { id: 'TXN-92837', user: 'Sarah Wilson', amount: 2400, type: 'Escrow Release', status: 'Completed' },
              ].map((txn, i) => (
                <tr key={i} className="hover:bg-white/5 transition-all">
                  <td className="px-8 py-5 font-mono text-xs text-white/40">{txn.id}</td>
                  <td className="px-8 py-5 font-bold">{txn.user}</td>
                  <td className={`px-8 py-5 font-bold ${txn.amount > 0 ? 'text-[#10B981]' : 'text-rose-500'}`}>
                    {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString()} USD
                  </td>
                  <td className="px-8 py-5 text-white/60">{txn.type}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      txn.status === 'Completed' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
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
