import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';
import { ViewProps } from '../types';

function StatCard({ title, value, color, icon: Icon, trend, isPositive, subtitle }: any) {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 flex flex-col justify-between overflow-hidden relative border border-[var(--border)] hover:border-[var(--border)] transition-colors h-[160px] shadow-sm group">
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }} />
      <div className="flex justify-between items-start z-10 relative mb-2">
        <div className="text-[var(--text-muted)] text-[10px] sm:text-xs font-bold tracking-wider uppercase max-w-[70%] leading-tight">
          {title}
        </div>
        <div className="w-10 h-10 rounded-lg flex flex-shrink-0 items-center justify-center border border-[var(--border)] shadow-inner group-hover:scale-105 transition-transform" style={{ backgroundColor: color + '15', color: color }}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      <div className="z-10 relative flex items-end justify-between">
        <div>
          <div className="text-3xl font-black text-[var(--text)] tracking-tight truncate">{value}</div>
          {subtitle && <div className="text-[10px] font-bold text-[var(--text-muted)] mt-1 tracking-wider uppercase">{subtitle}</div>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border shadow-sm ${isPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
            {isPositive ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingUp size={14} strokeWidth={3} className="rotate-180" />} 
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentsView({ onAction }: ViewProps) {
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/transactions', { 
        credentials: 'include'
      });
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalRevenue = transactions.reduce((acc, t) => acc + (t.fee_amount || 0), 0);
  const totalPayouts = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((acc, t) => acc + (t.amount || 0), 0);
  const pendingPayouts = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <div className="flex flex-col gap-6 pt-4 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text)] tracking-tight">Payments & Wallets</h1>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-2 uppercase tracking-wider">Monitor transactions, platform fees, and user balances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Platform Revenue" value={`MAD ${(Number(totalRevenue) || 0).toFixed(0)}`} color="#FFD700" icon={TrendingUp} />
        <StatCard title="Total Payouts" value={`MAD ${(Number(totalPayouts) || 0).toFixed(0)}`} color="#10B981" icon={ArrowUpRight} />
        <StatCard title="Pending Payouts" value={`MAD ${(Number(pendingPayouts) || 0).toFixed(0)}`} color="#F59E0B" icon={Clock} />
      </div>
    </div>
  );
}
