import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Bell, User, LogOut, Sun, Moon, 
  Home, Search, LayoutDashboard, MessageSquare, 
  ShoppingBag, Clock, Globe, ShieldCheck, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../context/SettingsContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import premiumLogo from '../../assets/images/logo.webp';

interface AppNavbarProps {
  onSwitchView?: (view: 'admin' | 'customer' | 'artisan' | 'seller' | 'company') => void;
  currentView?: string;
  activeTab?: string;
  onTabChange?: (tab: 'dashboard' | 'home' | 'find' | 'store' | 'bookings' | 'account' | 'documents' | 'messages') => void;
}

export default function AppNavbar({ onSwitchView, currentView, activeTab, onTabChange }: AppNavbarProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navLinks = [
    { label: t('nav_overview'), id: 'dashboard', icon: <LayoutDashboard size={18} /> },
    { label: t('nav_home'), id: 'home', icon: <Home size={18} /> },
    { label: t('nav_find'), id: 'find', icon: <Search size={18} /> },
    { label: t('nav_store_short'), id: 'store', icon: <ShoppingBag size={18} /> },
    { label: t('nav_bookings'), id: 'bookings', icon: <Clock size={18} /> },
    { label: t('nav_messages'), id: 'messages', icon: <MessageSquare size={18} /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)] z-[100] flex items-center px-4 md:px-8">
      <div className="w-full flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
        {/* Left: Logo */}
        <button onClick={() => onTabChange?.('dashboard')} className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[var(--accent)] text-black rounded-xl flex items-center justify-center shadow-lg shadow-[var(--accent)]/30 transform hover:-rotate-6 transition-transform">
            <img src={isDarkMode ? premiumLogo : premiumLogo} alt="M3allem Symbol" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-lg md:text-xl tracking-tighter uppercase italic hidden sm:block">
            M3allem <span className="text-[var(--accent)]">Pro</span>
          </span>
        </button>

        {/* Center: Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-[var(--card-bg)]/50 p-1 border border-[var(--border)] rounded-2xl">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onTabChange?.(link.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-[var(--accent)] text-black shadow-md shadow-[var(--accent)]/20' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--glass-bg)]'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <LanguageSwitcher />
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--glass-bg)] transition-all"
            >
              {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-500" />}
            </button>
          </div>
          
          {user ? (
            <>
              <NotificationBell userId={user.id} />
              
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl border border-[var(--border)] hover:bg-[var(--glass-bg)] transition-all"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border)]">
                    <img 
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '')}&background=FFD700&color=000`} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                      >
                        <div className="p-3 border-b border-[var(--border)] mb-2">
                          <p className="font-black text-sm">{user.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{user.role}</p>
                        </div>
                        
                        <div className="space-y-1">
                          {user.role === 'admin' && (
                            <button
                              onClick={() => onSwitchView?.('admin')}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all"
                            >
                              <ShieldCheck size={18} />
                              {t('nav_admin_panel')}
                            </button>
                          )}
                          
                          {(user.role === 'artisan' || user.role === 'seller' || user.role === 'company') && (
                            <button
                              onClick={() => onSwitchView?.(user.role as any)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all"
                            >
                              <LayoutDashboard size={18} />
                              {t('nav_dashboard')}
                            </button>
                          )}

                          <Link
                            to="/profile"
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold hover:bg-[var(--glass-bg)] transition-all"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User size={18} />
                            {t('nav_profile')}
                          </Link>
                          
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all text-start"
                          >
                            <LogOut size={18} />
                            {t('profile_btn_logout')}
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link 
              to="/?login=true"
              className="bg-[var(--accent)] text-black px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-[var(--accent)]/20 hover:scale-105 active:scale-95 transition-all"
            >
              {t('auth_sign_in')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
