import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, LogOut } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface DashboardSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  symbolUrl: string;
  navItems: SidebarItem[];
  onLogout: () => void;
}

export function DashboardSidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activeTab,
  setActiveTab,
  symbolUrl,
  navItems,
  onLogout
}: DashboardSidebarProps) {
  const { t } = useTranslation();

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--card-bg)] border-r border-[var(--border)] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col glass shadow-2xl`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-105 shadow-lg shadow-[var(--accent)]/20 ring-1 ring-white/10 dark:ring-white/5">
              <img src={symbolUrl} alt="M3allem Symbol" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-[var(--text)] text-balance">M3allem</span>
          </div>
          <button className="lg:hidden p-2 rounded-xl hover:bg-[var(--text)]/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { 
                if (item.onClick) {
                  item.onClick();
                } else {
                  setActiveTab(item.id); 
                }
                setIsMobileMenuOpen(false); 
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-xl shadow-[var(--accent)]/30 scale-[1.02]' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--text)]/5 hover:text-[var(--text)] hover:translate-x-1'
              }`}
            >
              <div className={`${activeTab === item.id ? 'text-white' : 'text-[var(--accent)] group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </div>
              {t(`nav_${item.id.replace('-', '_')}`, item.label)}
              {activeTab === item.id && (
                <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-[var(--border)]">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all active:scale-95 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            {t('logout_account', 'Logout Account')}
          </button>
        </div>
      </div>
    </>
  );
}
