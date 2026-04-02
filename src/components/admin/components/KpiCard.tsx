import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend: string;
  isPositive: boolean;
  isDarkMode: boolean;
}

export default function KpiCard({ title, value, icon, trend, isPositive, isDarkMode }: KpiCardProps) {
  return (
    <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] bg-[var(--card-bg)] border-[var(--border)]`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]`}>{title}</h3>
        {icon && <div className="text-[var(--accent)]">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold font-mono text-[var(--text)]">{value}</p>
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
    </div>
  );
}
