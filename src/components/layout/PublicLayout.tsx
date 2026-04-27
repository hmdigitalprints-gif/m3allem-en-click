import React from 'react';
import { Link } from 'react-router-dom';
import { Hammer, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export default function PublicLayout({ children, onGetStarted }: { children: React.ReactNode, onGetStarted?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-[var(--accent-foreground)] flex flex-col transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-lg shadow-[var(--accent)]/20">
                <Hammer size={20} />
              </div>
              <span className="text-xl font-display font-black tracking-tighter text-[var(--text)]">M3allem <span className="text-[var(--accent)]">En Click</span></span>
            </Link>
            
            <Link 
              to="/" 
              className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl"
            >
              <Home size={14} className="sm:hidden" />
              <span className="hidden sm:inline">{t('nav_back_home')}</span>
              <span className="sm:hidden">{t('nav_home_short')}</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-muted)]">
            <Link to="/services" className="hover:text-[var(--accent)] transition-colors">{t('nav_services')}</Link>
            <Link to="/become-artisan" className="hover:text-[var(--accent)] transition-colors">{t('nav_become_artisan')}</Link>
            <Link to="/store" className="hover:text-[var(--accent)] transition-colors">{t('nav_store')}</Link>
            <Link to="/pricing" className="hover:text-[var(--accent)] transition-colors">{t('nav_pricing')}</Link>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button 
              onClick={onGetStarted || (() => window.location.href = '/')}
              className="bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 text-[var(--text)]"
            >
              {t('nav_sign_in')}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-[var(--border)] mt-auto bg-[var(--bg)] text-[var(--text)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-lg flex items-center justify-center rotate-12">
                  <Hammer size={16} />
                </div>
                <span className="text-lg font-bold tracking-tighter text-[var(--text)]">M3allem <span className="text-[var(--accent)]">En Click</span></span>
              </Link>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                {t('footer_slogan')}
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-40 text-[var(--text-muted)]">{t('footer_platform')}</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/services" className="hover:text-[var(--accent)] transition-colors">{t('footer_find_pro')}</Link></li>
                <li><Link to="/become-artisan" className="hover:text-[var(--accent)] transition-colors">{t('nav_become_artisan')}</Link></li>
                <li><Link to="/how-it-works" className="hover:text-[var(--accent)] transition-colors">{t('footer_how_it_works')}</Link></li>
                <li><Link to="/pricing" className="hover:text-[var(--accent)] transition-colors">{t('nav_pricing')}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-40 text-[var(--text-muted)]">{t('footer_company')}</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/about" className="hover:text-[var(--accent)] transition-colors">{t('footer_about')}</Link></li>
                <li><Link to="/careers" className="hover:text-[var(--accent)] transition-colors">{t('footer_careers')}</Link></li>
                <li><Link to="/contact" className="hover:text-[var(--accent)] transition-colors">{t('footer_contact')}</Link></li>
                <li><Link to="/blog" className="hover:text-[var(--accent)] transition-colors">{t('footer_blog')}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-40 text-[var(--text-muted)]">{t('footer_legal')}</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/privacy" className="hover:text-[var(--accent)] transition-colors">{t('footer_privacy')}</Link></li>
                <li><Link to="/terms" className="hover:text-[var(--accent)] transition-colors">{t('footer_terms')}</Link></li>
                <li><Link to="/cookies" className="hover:text-[var(--accent)] transition-colors">{t('footer_cookies')}</Link></li>
                <li><Link to="/?login=true" className="hover:text-[var(--accent)] transition-colors">{t('footer_admin')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-[var(--border)] text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">
            <p>{t('footer_rights')}</p>
            <div className="flex gap-8">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors">Twitter</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors">Instagram</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
