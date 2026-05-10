import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ReactNode;
}

export default function StatCard({ title, value, trend, icon }: StatCardProps) {
  return (
    <div className="card-luxury p-8 hover:border-[var(--accent)]/30 transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 rounded-2xl bg-[var(--accent)]/5 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all duration-500">
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${trend.startsWith('+') ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20' : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'}`}>
          {trend}
        </span>
      </div>
      <p className="micro-label mb-2">{title}</p>
      <h4 className="text-3xl font-display font-bold tracking-tighter text-[var(--text)]">{value}</h4>
    </div>
  );
}
