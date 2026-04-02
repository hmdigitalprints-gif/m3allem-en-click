import React from 'react';
import { motion } from 'framer-motion';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

export default function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all active:scale-95 ${
        active 
          ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-lg shadow-[var(--accent)]/20' 
          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent)]/10'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 bg-[var(--accent-foreground)] rounded-full" />}
    </button>
  );
}
