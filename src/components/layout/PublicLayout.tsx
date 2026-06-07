import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../context/SettingsContext';
import premiumLogo from '../../assets/images/logo.png';

export default function PublicLayout({ children, onGetStarted }: { children: React.ReactNode, onGetStarted?: () => void }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();

  const logoUrl = isDarkMode ? (settings?.branding_logo_dark || settings?.branding_logo_light || premiumLogo) : (settings?.branding_logo_light || premiumLogo);
  const symbolUrl = isDarkMode ? (settings?.branding_symbol_dark || settings?.branding_symbol_light || premiumLogo) : (settings?.branding_symbol_light || premiumLogo);

  const hoverAnimClass = settings?.branding_navbar_animation === '1' ? 'transition-transform duration-500 hover:scale-105' : '';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-[var(--accent-foreground)] flex flex-col transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/80 backdrop-blur-2xl border-b border-[var(--border)] shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-transparent ${hoverAnimClass}`}>
                <img src={symbolUrl} alt="M3allem Symbol" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-[var(--text)] text-balance hidden sm:block">
                {settings?.platform_name ? settings.platform_name : <>M3allem <span className="text-[var(--accent)]">{t('nav_brand_accent')}</span></>}
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-wide text-[var(--text-muted)] uppercase">
            <Link to="/services" className="hover:text-[var(--text)] transition-colors">{t('nav_services')}</Link>
            <Link to="/become-artisan" className="hover:text-[var(--text)] transition-colors">{t('nav_become_artisan')}</Link>
            <Link to="/store" className="hover:text-[var(--text)] transition-colors">{t('nav_store')}</Link>
            <Link to="/pricing" className="hover:text-[var(--text)] transition-colors">{t('nav_pricing')}</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <button 
              onClick={onGetStarted || (() => window.location.href = '/?login=true')}
              className="bg-[var(--accent)] text-black hover:bg-[var(--accent-muted)] border border-transparent px-5 sm:px-7 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-[var(--accent)]/20 text-nowrap hidden sm:block"
            >
              {t('nav_sign_in')}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-[var(--border)] mt-auto bg-[var(--bg)] text-[var(--text)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-6 group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden ring-1 ring-white/10 dark:ring-white/5 bg-[var(--accent)] text-[var(--accent-foreground)] ${hoverAnimClass}`}>
                  <img src={symbolUrl} alt="M3allem Symbol" className="w-full h-full object-contain" />
                </div>
                <span className="text-lg font-bold tracking-tighter text-[var(--text)]">
                  {settings?.platform_name ? settings.platform_name : <>M3allem <span className="text-[var(--accent)]">{t('nav_brand_accent')}</span></>}
                </span>
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
