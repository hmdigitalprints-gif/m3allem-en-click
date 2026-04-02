import React from 'react';
import { Plus, Building2, ShieldCheck, Clock } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';

export default function CompaniesView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">Companies Management</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">Manage corporate accounts, verify business documents, and track company performance.</p>
        </div>
        <button 
          onClick={() => onAction?.('Add Company functionality coming soon!')}
          className="bg-[#FFD400] text-black px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#FFD400]/90 transition-all active:scale-95 shadow-xl shadow-[#FFD400]/10"
        >
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KpiCard title="Total Companies" value="1,284" icon={<Building2 size={20} />} trend="+12%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Verified Businesses" value="942" icon={<ShieldCheck size={20} />} trend="+5%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Pending Verification" value="42" icon={<Clock size={20} />} trend="-8%" isPositive={false} isDarkMode={isDarkMode} />
      </div>

      <div className="hynex-card p-20 text-center">
        <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center mx-auto mb-10 border border-white/5 group hover:border-[#FFD400]/30 transition-all">
          <Building2 size={48} className="text-[#FFD400]" />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Companies Directory</h3>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest max-w-md mx-auto mb-10 leading-relaxed">The company management interface is currently being updated to the Hynex design system.</p>
        <button className="px-10 py-4 rounded-[20px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest">
          View Legacy Directory
        </button>
      </div>
    </div>
  );
}
