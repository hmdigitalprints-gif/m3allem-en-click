import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { DemoModal } from '../components/marketplace/Modals';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  ShieldCheck, 
  Zap, 
  Hammer,
  Droplets,
  Paintbrush,
  Sparkles,
  Wind,
  HardHat,
  ChevronRight,
  Play,
  Search,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface LandingPageProps {
  onGetStarted: () => void;
  onAction?: (msg: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  user: any;
}

const categories = [
  { id: 'cat_1', name: 'Plumbing', icon: <Droplets />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: 'Expert leak repairs and pipe installations.' },
  { id: 'cat_2', name: 'Electricity', icon: <Zap />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: 'Safe electrical wiring and fixture repairs.' },
  { id: 'cat_3', name: 'Painting', icon: <Paintbrush />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: 'Professional interior and exterior painting.' },
  { id: 'cat_4', name: 'Cleaning', icon: <Sparkles />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: 'Deep cleaning for homes and offices.' },
  { id: 'cat_5', name: 'AC Repair', icon: <Wind />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: 'Cooling system maintenance and repair.' },
  { id: 'cat_6', name: 'Construction', icon: <HardHat />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: 'Quality building and renovation work.' },
];

const stats = [
  { label: 'Active Artisans', value: '2,500+' },
  { label: 'Services Completed', value: '45k+' },
  { label: 'Customer Rating', value: '4.9/5' },
  { label: 'Cities Covered', value: '12' },
];

export default function LandingPage({ onGetStarted, onAction, isDarkMode, toggleTheme, user }: LandingPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-[var(--accent-foreground)] transition-colors duration-300">
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-lg shadow-[var(--accent)]/20">
                <Hammer size={20} />
              </div>
              <span className="text-2xl font-bold tracking-tighter">M3allem <span className="text-[var(--accent)]">En Click</span></span>
            </Link>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-[var(--text-muted)]">
            <a href="#features" className="hover:text-[var(--text)] transition-colors">{t('nav_features', 'Features')}</a>
            <a href="#categories" className="hover:text-[var(--text)] transition-colors">{t('nav_categories', 'Categories')}</a>
            <Link to="/store" className="hover:text-[var(--text)] transition-colors">{t('nav_store_materials', 'Materials Store')}</Link>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                onAction?.('Opening Sign In...');
                onGetStarted();
              }}
              className="hidden sm:flex bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 shadow-sm items-center gap-2"
            >
              <Users size={16} />
              {t('auth_sign_in', 'Sign In')}
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[var(--text)] hover:bg-[var(--accent)]/10 rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[var(--bg)] border-b border-[var(--border)] overflow-hidden"
            >
              <div className="px-4 py-8 flex flex-col gap-6">
                <a 
                  href="#features" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-bold tracking-tight hover:text-[var(--accent)] transition-colors"
                >
                  {t('nav_features')}
                </a>
                <a 
                  href="#categories" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-bold tracking-tight hover:text-[var(--accent)] transition-colors"
                >
                  {t('nav_categories')}
                </a>
                <Link 
                  to="/store" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-bold tracking-tight hover:text-[var(--accent)] transition-colors"
                >
                  {t('nav_store_materials')}
                </Link>
                <div className="pt-6 border-t border-[var(--border)]">
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onGetStarted();
                    }}
                    className="w-full bg-[var(--accent)] text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3"
                  >
                    <Users size={18} />
                    {t('auth_sign_in_account')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-[var(--accent)]/5 blur-[120px] rounded-[100%] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-full text-xs font-semibold tracking-wide text-[var(--text-muted)] mb-10 shadow-sm">
              <Sparkles size={14} className="text-[var(--accent)]" />
              {t('hero_badge')}
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-[80px] lg:text-[100px] font-sans font-bold tracking-tighter leading-[0.9] mb-8">
              {t('hero_title_1')}<br />
              <span className="text-[var(--text)] opacity-90">{t('hero_title_2')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mb-12 leading-relaxed">
              {t('hero_desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={() => {
                  onAction?.('Redirecting to registration...');
                  onGetStarted();
                }}
                className="bg-[var(--accent)] text-white hover:bg-[var(--accent-muted)] px-8 py-4 rounded-full font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {t('hero_btn_book')} <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => {
                  onAction?.('Opening Demo Modal...');
                  setIsDemoOpen(true);
                }}
                className="bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-8 py-4 rounded-full font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {t('hero_btn_demo')}
              </button>
            </div>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.3 }}
             className="mt-20 w-full max-w-5xl relative"
          >
            <div className="rounded-[32px] md:rounded-[40px] border border-[var(--border)] bg-[var(--card-bg)] p-2 shadow-2xl overflow-hidden shadow-[var(--accent)]/5">
              <img 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80" 
                alt="Dashboard visual" 
                className="w-full rounded-[24px] md:rounded-[32px] object-cover h-[300px] md:h-[500px]"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-[var(--border)] bg-[var(--card-bg)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats?.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-[var(--text-muted)] font-medium uppercase tracking-widest">{t(stat.label.toLowerCase().replace(' ', '_'), stat.label)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-8">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4">{t('cat_title')} <span className="text-[var(--accent)]">{t('cat_title_accent')}</span></h2>
              <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-md">{t('cat_desc')}</p>
            </div>
            <Link 
              to="/services"
              onClick={() => onAction?.('Loading all categories...')}
              className="group flex items-center gap-2 text-[var(--accent)] font-bold text-lg"
            >
              {t('cat_view_all')}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                onClick={() => {
                  onAction?.(`Searching for ${cat.name} services...`);
                  navigate(`/find-pro?category=${encodeURIComponent(cat.name)}`);
                }}
                className="relative bg-[var(--card-bg)] border border-[var(--border)] p-8 rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-[var(--bg)] text-[var(--text)] rounded-full flex items-center justify-center mb-6 border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-colors shadow-sm">
                  {React.cloneElement(cat.icon as React.ReactElement<any>, { className: "w-5 h-5", strokeWidth: 1.5 })}
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2 tracking-tight">{t(cat.id, cat.name)}</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">{t(`${cat.id}_desc`, cat.desc)}</p>
                  
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
                    {t('cat_explore')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { key: 'feat_verified', title: 'Verified Pros', desc: 'Every artisan undergoes a strict background check.', icon: <ShieldCheck /> },
                  { key: 'feat_secure', title: 'Secure Payments', desc: 'Your money is safe with our escrow payment system.', icon: <Zap /> },
                  { key: 'feat_instant', title: 'Instant Booking', desc: 'Book a service in seconds, not hours.', icon: <ArrowRight /> },
                  { key: 'feat_support', title: 'Support 24/7', desc: 'Our team is here to help you anytime.', icon: <Users /> },
                ]?.map((feature, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.02 }}
                  className="p-6 sm:p-8 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[var(--border)] transition-all"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[var(--bg)] text-[var(--accent)] rounded-full flex items-center justify-center mb-4 border border-[var(--border)] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                    {React.cloneElement(feature.icon as React.ReactElement<any>, { className: "w-5 h-5", strokeWidth: 1.5 })}
                  </div>
                  <h4 className="text-lg font-bold mb-2 tracking-tight text-[var(--text)]">{t(`${feature.key}_title`, feature.title)}</h4>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed">{t(`${feature.key}_desc`, feature.desc)}</p>
                </motion.div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-8 bg-[var(--card-bg)]">
                <Sparkles size={14} className="text-[var(--accent)]" />
                {t('feat_why_title')}
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-8 leading-[1.05]">
                {t('feat_main_title_part1', 'The')} <span className="text-[var(--accent)] opacity-90">{t('feat_main_title_accent', 'Standard')}</span> {t('feat_main_title_part2', 'for Home Services.')}
              </h2>
              <p className="text-lg md:text-xl text-[var(--text-muted)] mb-12 leading-relaxed">
                {t('feat_main_desc')}
              </p>
              <div className="space-y-6">
                {[
                  { key: 'feat_list_pricing', label: 'Transparent Pricing' },
                  { key: 'feat_list_quality', label: 'Quality Guarantee' },
                  { key: 'feat_list_comm', label: 'Easy Communication' }
                ]?.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-base font-semibold text-[var(--text)]">
                    <div className="w-6 h-6 bg-[var(--text)] text-[var(--card-bg)] rounded-full flex items-center justify-center">
                      <CheckCircle size={14} />
                    </div>
                    {t(item.key, item.label)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-[var(--card-bg)] border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="border border-[var(--border)] rounded-[40px] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden bg-[var(--bg)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-6">{t('cta_title')}</h2>
              <p className="text-base sm:text-lg text-[var(--text-muted)] font-medium mb-12">
                {t('cta_desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/services"
                  onClick={() => onAction?.('Finding a Pro...')}
                  className="bg-[var(--accent)] text-white px-8 py-4 rounded-full font-semibold text-sm transition-transform active:scale-95 flex items-center justify-center gap-2 hover:bg-[var(--accent-muted)] shadow-sm"
                >
                  {t('cta_btn_find_pro')} <ArrowRight size={16} />
                </Link>
                <Link 
                  to="/become-artisan"
                  onClick={() => onAction?.('Redirecting to Artisan registration...')}
                  className="bg-[var(--card-bg)] border border-[var(--border)] px-8 py-4 rounded-full font-semibold text-sm hover:bg-[var(--bg)] transition-all active:scale-95 flex items-center justify-center text-[var(--text)]"
                >
                  {t('cta_btn_become_artisan')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-12 md:py-20 border-t border-[var(--border)] bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[var(--text)] text-[var(--bg)] rounded-lg flex items-center justify-center">
                  <Hammer size={16} />
                </div>
                <span className="text-xl font-bold tracking-tight">M3allem</span>
              </div>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs">
                {t('footer_desc')}
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-6 text-sm text-[var(--text)]">{t('footer_platform', 'Platform')}</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/services" className="hover:text-[var(--accent)] transition-colors">{t('nav_find_pro', 'Find a Pro')}</Link></li>
                <li><Link to="/become-artisan" className="hover:text-[var(--accent)] transition-colors">{t('nav_become_artisan', 'Become an Artisan')}</Link></li>
                <li><Link to="/store" className="hover:text-[var(--accent)] transition-colors">{t('nav_store', 'Materials Store')}</Link></li>
                <li><Link to="/pricing" className="hover:text-[var(--accent)] transition-colors">{t('nav_pricing', 'Pricing')}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-6 text-sm text-[var(--text)]">{t('footer_company', 'Company')}</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/about" className="hover:text-[var(--accent)] transition-colors">{t('footer_about', 'About Us')}</Link></li>
                <li><Link to="/careers" className="hover:text-[var(--accent)] transition-colors">{t('footer_careers', 'Careers')}</Link></li>
                <li><Link to="/contact" className="hover:text-[var(--accent)] transition-colors">{t('footer_contact', 'Contact')}</Link></li>
                <li><Link to="/blog" className="hover:text-[var(--accent)] transition-colors">{t('footer_blog', 'Blog')}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-6 text-sm text-[var(--text)]">{t('footer_legal', 'Legal')}</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/privacy" className="hover:text-[var(--accent)] transition-colors">{t('footer_privacy', 'Privacy Policy')}</Link></li>
                <li><Link to="/terms" className="hover:text-[var(--accent)] transition-colors">{t('footer_terms', 'Terms of Service')}</Link></li>
                <li><Link to="/cookies" className="hover:text-[var(--accent)] transition-colors">{t('footer_cookies', 'Cookie Policy')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-[var(--border)] text-[var(--text-muted)] text-xs font-semibold">
            <p>{t('footer_copyright')}</p>
            <div className="flex gap-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
