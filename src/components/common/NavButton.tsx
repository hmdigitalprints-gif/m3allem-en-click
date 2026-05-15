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
      className={`relative flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 px-3 py-2 md:px-6 md:py-3 rounded-[20px] md:rounded-full transition-all active:scale-90 group whitespace-nowrap min-w-[64px] md:min-w-0`}
    >
      {active && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] shadow-[0_4px_15px_rgba(var(--accent-rgb,255,215,0),0.4)] rounded-[20px] md:rounded-full"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      
      <div className={`relative z-10 ${active ? 'text-black scale-110' : 'text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:scale-110'} transition-all duration-300 mt-1 md:mt-0`}>
        {icon}
      </div>
      
      <span className={`relative z-10 text-[9px] md:text-sm font-black uppercase tracking-[0.05em] transition-all duration-300 ${
        active ? 'text-black' : 'text-[var(--text-muted)] opacity-70'
      }`}>
        {label}
      </span>

      {/* Floating dot for unselected on mobile */}
      {!active && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity md:hidden" />
      )}
    </button>
  );
}
