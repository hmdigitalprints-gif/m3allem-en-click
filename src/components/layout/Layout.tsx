import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, User, ShoppingBag, FileText, Calendar, Sparkles, Package, Hammer, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../context/SettingsContext';
import { Sun, Moon } from 'lucide-react';

import premiumLogo from '../../assets/images/m3allem_premium_logo_1778418407151.png';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { settings } = useSettings();

  const logoUrl = isDarkMode ? (settings?.branding_logo_dark || settings?.branding_logo_light || premiumLogo) : (settings?.branding_logo_light || premiumLogo);
  const symbolUrl = isDarkMode ? (settings?.branding_symbol_dark || settings?.branding_symbol_light || premiumLogo) : (settings?.branding_symbol_light || premiumLogo);
  
  const hoverAnimClass = settings?.branding_navbar_animation === '1' ? 'transition-transform duration-500 hover:scale-105' : '';

  const navItems = [
    { icon: <Home size={24} />, label: t('nav_home', 'Home'), path: '/' },
    { icon: <Search size={24} />, label: t('nav_find_pro', 'Find'), path: '/find-pro' },
    { icon: <ShoppingBag size={24} />, label: t('nav_store_short', 'Store'), path: '/store' },
    { icon: <MessageSquare size={24} />, label: t('nav_messages', 'Messages'), path: '/messages' },
    { icon: <User size={24} />, label: t('nav_profile', 'Profile'), path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-[var(--accent-foreground)] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg)]/80 backdrop-blur-2xl border-b border-[var(--border)] px-4 sm:px-6 h-20 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-[var(--accent)]/20 ring-1 ring-white/10 dark:ring-white/5 ${hoverAnimClass}`}>
              <img src={symbolUrl} alt="M3allem Symbol" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-[var(--text)] text-balance hidden sm:block">
              {settings?.platform_name ? settings.platform_name : <>M3allem <span className="text-[var(--accent)]">{t('nav_brand_accent')}</span></>}
            </span>
          </Link>
        </div>
        {user ? (
          <div className="flex items-center gap-4 sm:gap-6">
            <LanguageSwitcher />
            <button 
              onClick={toggleTheme}
              className="p-1.5 md:p-2 rounded-full glass hover:scale-110 transition-all active:scale-95 shadow-md flex items-center justify-center hidden sm:flex"
            >
              {isDarkMode ? <Sun className="text-yellow-400" size={16} /> : <Moon className="text-blue-500" size={16} />}
            </button>
            <Link to="/auto-devis" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors hidden sm:block" title="AI Auto Quote">
              <Sparkles size={20} />
            </Link>
            <Link to="/booking" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
              <Calendar size={20} />
            </Link>
            <Link to="/devis" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
              <FileText size={20} />
            </Link>
            <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold leading-tight">{user.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t(`role_${user.role}`, user.role)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center overflow-hidden shadow-inner">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-[var(--accent)]" />
                )}
              </div>
            </Link>
            <button 
              onClick={logout}
              className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
              title={t('profile_btn_logout', 'Logout')}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link 
              to="/?login=true"
              className="bg-[var(--accent)] hover:bg-[var(--accent-muted)] px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 text-white"
            >
              {t('auth_sign_in', 'Sign In')}
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--card-bg)]/90 backdrop-blur-xl border-t border-[var(--border)] px-6 py-4 z-50">
          <div className="max-w-md mx-auto flex justify-between items-center">
            {navItems?.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[var(--accent)] scale-110' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                >
                  <div className={`${isActive ? 'text-[var(--accent)]' : ''}`}>
                    {item.icon}
                  </div>
                  <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isActive ? 'text-[var(--accent)]' : ''}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
