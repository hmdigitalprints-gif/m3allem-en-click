import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Home, User, Hammer, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export default function Navbar({ showToast }: { showToast?: (msg: string, type?: 'success' | 'info') => void } = {}) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  
  const navLinks = [
    { name: t('nav_home'), path: '/', icon: <Home size={18} /> },
    { name: t('nav_find'), path: '/find-pro', icon: <Search size={18} /> },
    { name: t('nav_store'), path: '/store', icon: <ShoppingBag size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-lg flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <Hammer size={16} />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-[var(--text)]">M3allem <span className="text-[var(--accent)]">En Click</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {navLinks?.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`relative text-xs font-bold uppercase tracking-widest transition-colors hover:text-[var(--accent)] ${
                location.pathname === link.path ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[var(--accent)]"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          <Link to="/profile" className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
            <User size={20} />
          </Link>
          {user && (
            <button 
              onClick={logout}
              className="p-2 text-red-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
          <Link 
            to="/find-pro" 
            className="hidden md:block bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[var(--accent)]/20"
          >
            {t('btn_book')}
          </Link>
        </div>
      </div>
    </nav>
  );
}
