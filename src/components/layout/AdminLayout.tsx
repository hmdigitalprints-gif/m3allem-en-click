import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Hammer, ShoppingCart, 
  CreditCard, ArrowDownRight, Settings, 
  Menu, X, LogOut, Sparkles, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSwitchView: () => void;
  onLogout: () => void;
}

export default function AdminLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  onSwitchView, 
  onLogout 
}: AdminLayoutProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarItems = [
    { id: 'overview', label: t('nav_overview'), icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: t('nav_users'), icon: <Users size={20} /> },
    { id: 'artisans', label: t('nav_artisans'), icon: <Hammer size={20} /> },
    { id: 'orders', label: t('nav_orders'), icon: <ShoppingCart size={20} /> },
    { id: 'payments', label: t('nav_payments'), icon: <CreditCard size={20} /> },
    { id: 'withdrawals', label: t('nav_withdrawals'), icon: <ArrowDownRight size={20} /> },
    { id: 'settings', label: t('nav_settings'), icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card-bg)] border-r border-[var(--border)]
        transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <button 
              onClick={onSwitchView}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-[var(--accent)] text-black rounded-lg flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
                <Sparkles size={18} />
              </div>
              <span className="font-black text-lg tracking-tighter italic uppercase">Admin</span>
            </button>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                  ${activeTab === item.id 
                    ? 'bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--glass-bg)]'}
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto border-t border-[var(--border)]">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              {t('profile_btn_logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 md:h-20 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-between px-4 md:px-8 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 rounded-xl border border-[var(--border)]"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-black tracking-tight capitalize">
              {sidebarItems.find(i => i.id === activeTab)?.label || activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--glass-bg)] transition-all hidden sm:flex"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 border border-[var(--border)] overflow-hidden">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=FFD700&color=000`} 
                alt="Admin" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </header>

        {/* Scrollable View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-[var(--bg)]">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
