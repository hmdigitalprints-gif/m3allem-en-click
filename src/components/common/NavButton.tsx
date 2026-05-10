import React from 'react';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export default function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-full transition-all active:scale-95 group whitespace-nowrap min-w-[60px] md:min-w-0 ${
        active 
          ? 'bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 font-bold' 
          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)]'
      }`}
    >
      <div className={`${active ? 'text-black' : 'text-[var(--text-muted)] group-hover:text-[var(--accent)]'} transition-colors mt-1 md:mt-0`}>
        {icon}
      </div>
      <span className={`text-[10px] md:text-sm md:font-bold md:tracking-[0.05em] transition-all ${active ? 'text-black font-semibold' : ''}`}>{label}</span>
    </button>
  );
}
