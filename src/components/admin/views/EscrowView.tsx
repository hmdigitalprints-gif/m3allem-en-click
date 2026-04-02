import React from 'react';
import { ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';

export default function EscrowView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escrow Management</h1>
          <p className="text-sm text-white/40 mt-1">Manage funds held in escrow for active projects and material orders.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#FFD700] text-black px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#E6C200] transition-all">
            <ShieldCheck size={18} /> Escrow Policies
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Funds in Escrow" value="$1,248,900" icon={<ShieldCheck size={20} />} trend="+5%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Active Escrows" value="156" icon={<Clock size={20} />} trend="+12%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Disputed Escrows" value="8" icon={<AlertTriangle size={20} />} trend="-2%" isPositive={false} isDarkMode={isDarkMode} />
      </div>

      <div className="hynex-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold">Active Escrow Transactions</h3>
          <button className="text-xs text-[#FFD700] hover:underline">View All</button>
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
              {[
                { project: 'Villa Construction Phase 1', parties: 'John D. & BuildIt Co.', amount: 45000, date: '2024-05-15', status: 'Locked' },
                { project: 'Custom Kitchen Cabinets', parties: 'Jane S. & WoodMaster', amount: 8200, date: '2024-04-20', status: 'Pending Release' },
                { project: 'Structural Steel Order', parties: 'Global Steel & BuildIt', amount: 125000, date: '2024-06-01', status: 'Locked' },
                { project: 'Interior Design Service', parties: 'Sarah W. & DesignPro', amount: 3500, date: '2024-04-10', status: 'Disputed' },
              ].map((escrow, i) => (
                <tr key={i} className="hover:bg-white/5 transition-all">
                  <td className="px-8 py-5 font-bold">{escrow.project}</td>
                  <td className="px-8 py-5 text-white/60">{escrow.parties}</td>
                  <td className="px-8 py-5 font-bold text-[#FFD700]">${escrow.amount.toLocaleString()}</td>
                  <td className="px-8 py-5 text-white/40">{escrow.date}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      escrow.status === 'Locked' ? 'bg-white/5 text-white/60' : 
                      escrow.status === 'Pending Release' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                      {escrow.status}
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
