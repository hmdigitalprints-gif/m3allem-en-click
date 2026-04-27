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
    <div className="hynex-card p-6 flex flex-col justify-between group">
      <div className="flex items-start justify-between mb-4">
        <h3 className="tech-label opacity-70">{title}</h3>
        {icon && <div className="text-[var(--accent)] group-hover:scale-110 transition-transform">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl tech-header text-[var(--text)] not-italic">{value}</p>
        <div className={`flex items-center gap-1 tech-value text-xs ${isPositive ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
    </div>
  );
}
