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
    <div className={`${hiddenClassName} fixed bottom-0 left-0 w-full z-[60] bg-[var(--card-bg)]/90 backdrop-blur-3xl border-t border-[var(--border)] pt-2 pb-safe px-2 sm:px-4 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`}>
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
