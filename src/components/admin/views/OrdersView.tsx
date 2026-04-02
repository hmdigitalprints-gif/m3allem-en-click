import React from 'react';
import { ShoppingBag, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { ViewProps } from '../types';

export default function OrdersView({ isDarkMode, cardClasses, textMutedClasses, hoverClasses, onAction }: ViewProps) {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">Orders & Projects</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">Track active service orders, material purchases, and project milestones.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <KpiCard title="Active Orders" value="342" icon={<ShoppingBag size={20} />} trend="+8%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Completed" value="1,892" icon={<CheckCircle size={20} />} trend="+15%" isPositive={true} isDarkMode={isDarkMode} />
        <KpiCard title="Disputed" value="14" icon={<AlertTriangle size={20} />} trend="-2%" isPositive={false} isDarkMode={isDarkMode} />
        <KpiCard title="Total Volume" value="$428K" icon={<DollarSign size={20} />} trend="+22%" isPositive={true} isDarkMode={isDarkMode} />
      </div>

      <div className="hynex-card p-20 text-center">
        <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center mx-auto mb-10 border border-white/5 group hover:border-[#FFD400]/30 transition-all">
          <ShoppingBag size={48} className="text-[#FFD400]" />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Order Tracking System</h3>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest max-w-md mx-auto mb-10 leading-relaxed">The order management and project tracking module is currently being migrated to the Hynex interface.</p>
        <div className="flex justify-center gap-6">
          <button className="px-10 py-4 rounded-[20px] bg-[#FFD400] text-black transition-all text-[10px] font-black uppercase tracking-widest hover:bg-[#FFD400]/90 shadow-xl shadow-[#FFD400]/10">
            Go to Orders
          </button>
          <button className="px-10 py-4 rounded-[20px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
