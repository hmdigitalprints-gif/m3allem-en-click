import React from 'react';
import { motion } from 'framer-motion';

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
      className={`relative flex flex-col items-center justify-center gap-1 md:gap-2 px-1 py-1 sm:px-2 rounded-xl transition-all active:scale-95 flex-1 min-h-[48px]`}
    >
      {active && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent-muted)]/5 rounded-xl border border-[var(--accent)]/20"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      
      <div className={`relative z-10 ${active ? 'text-[var(--accent)] scale-110' : 'text-[var(--text-muted)] scale-100'} transition-transform duration-300 flex items-center justify-center`}>
        {icon}
      </div>
      
      <span className={`relative z-10 text-[10px] sm:text-xs font-semibold tracking-wide transition-all duration-300 ${
        active ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
      }`}>
        {label}
      </span>
    </button>
  );
}
