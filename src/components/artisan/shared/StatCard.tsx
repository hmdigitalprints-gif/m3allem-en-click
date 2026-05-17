import React from 'react';

export function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 hover:shadow-2xl transition-all hover:-translate-y-2 group relative overflow-hidden glass text-left">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[var(--accent)]/5 rounded-full blur-2xl group-hover:bg-[var(--accent)]/10 transition-colors" />
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1 opacity-80">{title}</p>
          <p className="text-3xl font-bold text-[var(--text)] tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
