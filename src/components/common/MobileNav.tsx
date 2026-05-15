import React from 'react';
import NavButton from './NavButton';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface MobileNavProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  navItems: NavItem[];
  hiddenClassName?: string;
}

export default function MobileNav({ activeTab, onTabChange, navItems, hiddenClassName = "" }: MobileNavProps) {
  return (
    <div className={`${hiddenClassName} fixed bottom-4 left-1/2 -translate-x-1/2 w-[95vw] md:w-auto z-[60] bg-[var(--card-bg)]/80 backdrop-blur-2xl border border-[var(--border)] p-2 rounded-[28px] md:rounded-full flex justify-between md:justify-center gap-1 md:gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.7)] overflow-x-auto no-scrollbar`}>
      {navItems.map((item) => (
        <NavButton 
          key={item.id}
          active={activeTab === item.id}
          onClick={() => onTabChange(item.id)}
          icon={item.icon}
          label={item.label}
        />
      ))}
    </div>
  );
}
