import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Menu, ArrowLeft, Sun, Moon, Home as HomeIcon } from 'lucide-react';
import { LanguageSwitcher } from '../../layout/LanguageSwitcher';
import NotificationBell from '../../layout/NotificationBell';

interface DashboardHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  onSwitchView: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  artisanOnlineStatus: boolean;
  onStatusToggle: () => Promise<void>;
  user: any;
  onAction: (msg: string) => void;
}

export function DashboardHeader({
  activeTab,
  setActiveTab,
  setIsMobileMenuOpen,
  onSwitchView,
  isDarkMode,
  toggleTheme,
  artisanOnlineStatus,
  onStatusToggle,
  user,
  onAction
}: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="h-20 lg:h-24 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-2xl flex items-center justify-between px-4 lg:px-10 sticky top-0 z-30">
      <div className="flex items-center gap-2 lg:gap-6">
        <button className="lg:hidden p-2 rounded-xl hover:bg-[var(--text)]/5 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
        {activeTab !== 'dashboard' && (
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-md lg:shadow-xl flex items-center justify-center group"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} className="lg:w-[22px] lg:h-[22px] group-hover:-translate-x-1 transition-transform" />
          </button>
        )}
        <h1 className="text-xl lg:text-2xl font-black capitalize tracking-tight text-[var(--text)] italic uppercase hidden sm:block">
          {t('nav_' + activeTab.replace('-', '_'), activeTab.replace('-', ' '))}
        </h1>
      </div>
      
      <div className="flex items-center gap-2 lg:gap-6">
        <div className="flex items-center gap-2 lg:gap-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl lg:rounded-3xl px-3 py-1.5 lg:px-6 lg:py-3 glass shadow-sm">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-60">{t('nav_status', 'Status')}</span>
            <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${artisanOnlineStatus ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
              {artisanOnlineStatus ? t('status_online', 'Online') : t('status_offline', 'Offline')}
            </span>
          </div>
          <button 
            onClick={onStatusToggle}
            className={`w-12 h-6 md:w-14 md:h-7 rounded-full relative transition-all duration-500 ${artisanOnlineStatus ? 'bg-[var(--success)] shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[var(--border)]'}`}
          >
            <motion.div 
              animate={{ x: artisanOnlineStatus ? 24 : 4 }}
              className="absolute top-1 left-0 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full shadow-xl"
            />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onSwitchView}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[var(--text-muted)] hover:bg-[var(--text)]/5 transition-all outline-none"
          >
            <HomeIcon size={18} />
            <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:block">{t('nav_home', 'Home')}</span>
          </button>
          <LanguageSwitcher />
          <button 
            onClick={toggleTheme}
            className="p-3.5 rounded-2xl glass hover:scale-110 transition-all active:scale-95 shadow-xl flex items-center justify-center text-[var(--text)] outline-none"
          >
            {isDarkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-blue-500" size={20} />}
          </button>
          {user && (
            <NotificationBell 
              userId={user.id} 
              onNotification={(n) => onAction(n.title)} 
            />
          )}
          <div className="w-12 h-12 rounded-2xl bg-[var(--text)]/10 border-2 border-[var(--border)] overflow-hidden shadow-xl hover:scale-105 transition-transform cursor-pointer">
            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Artisan'}&background=FFD700&color=000`} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
