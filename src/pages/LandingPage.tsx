import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import DemoModal from '../components/marketplace/DemoModal';
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
  X,
  ChevronLeft
} from 'lucide-react';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { SymmetricalIcon } from '../components/common/SymmetricalIcon';
import { useTranslation } from 'react-i18next';
import PromoBanner from '../components/common/PromoBanner';
import { useDirection } from '../hooks/useDirection';

interface LandingPageProps {
  onGetStarted: () => void;
  onAction?: (msg: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  user: any;
}

import { useSettings } from '../context/SettingsContext';
import premiumLogo from '../assets/images/logo.webp';

const defaultHeroSlides = [
  {
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80",
  },
  {
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=2000&q=80",
  },
  {
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=80",
  },
  {
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=2000&q=80",
  },
  {
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=2000&q=80",
  }
];

export default function LandingPage({ onGetStarted, onAction, isDarkMode, toggleTheme, user }: LandingPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRtl } = useDirection();
  const { settings } = useSettings();
  
  const symbolUrl = isDarkMode ? (settings?.branding_symbol_dark || settings?.branding_symbol_light || premiumLogo) : (settings?.branding_symbol_light || premiumLogo);

  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeHeroSlides, setActiveHeroSlides] = useState(defaultHeroSlides);

  const categories = [
    { id: 'cat_1', name: t('cat_plumbing'), icon: <Droplets />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: t('cat_plumbing_desc') },
    { id: 'cat_2', name: t('cat_electricity'), icon: <Zap />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: t('cat_electricity_desc') },
    { id: 'cat_3', name: t('cat_carpentry'), icon: <Hammer />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: t('cat_carpentry_desc') },
    { id: 'cat_4', name: t('cat_painting'), icon: <Paintbrush />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: t('cat_painting_desc') },
    { id: 'cat_5', name: t('cat_cleaning'), icon: <Sparkles />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: t('cat_cleaning_desc') },
    { id: 'cat_6', name: t('cat_construction'), icon: <HardHat />, color: 'bg-[var(--accent)]/10 text-[var(--accent)]', desc: t('cat_construction_desc') },
  ];

  const stats = [
    { label: t('stat_active_artisans'), value: '2,500+' },
    { label: t('stat_services_completed'), value: '45k+' },
    { label: t('stat_customer_rating'), value: '4.9/5' },
    { label: t('stat_cities_covered'), value: '12' },
  ];

  useEffect(() => {
    if (settings && settings.hero_slides) {
      try {
        const parsed = JSON.parse(settings.hero_slides);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveHeroSlides(parsed.map((url: string) => ({ image: url })));
        }
      } catch (e) {
        // ignore
      }
    }
  }, [settings]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === activeHeroSlides.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [activeHeroSlides]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-[var(--accent-foreground)] transition-colors duration-300">
      <PromoBanner />
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      {/* Navigation */}
      <nav className="sticky top-0 inset-x-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-[var(--accent)]/20 ring-1 ring-white/10 dark:ring-white/5 bg-[var(--accent)] text-[var(--accent-foreground)] rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <img src={symbolUrl} alt="M3allem Symbol" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tighter">
                {settings?.platform_name ? settings.platform_name : <>M3allem <span className="text-[var(--accent)]">{t('nav_brand_accent')}</span></>}
              </span>
            </Link>
          
            <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-[var(--text-muted)]">
              <a href="#features" className="hover:text-[var(--text)] transition-colors">{t('nav_features')}</a>
              <a href="#categories" className="hover:text-[var(--text)] transition-colors">{t('nav_categories')}</a>
              <Link to="/store" className="hover:text-[var(--text)] transition-colors">{t('nav_store')}</Link>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <ThemeToggle />
              <button 
                onClick={() => {
                  onAction?.(t('ui_opening_signin'));
                  onGetStarted();
                }}
                className="hidden sm:flex bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 shadow-sm items-center gap-2"
              >
                <Users size={16} />
                {t('auth_btn_login')}
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

      {/* Hero Section Slider */}
      <section className="relative h-screen min-h-[600px] w-full flex flex-col items-center justify-center text-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img 
              src={activeHeroSlides[currentSlide]?.image || activeHeroSlides[0].image} 
              alt="Hero background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center mt-20">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] text-white mb-10 shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
            >
              <Sparkles size={14} className="text-[var(--accent)]" />
              <span className="text-white">{t('hero_badge')}</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-[80px] lg:text-[110px] font-sans font-bold tracking-tighter leading-[0.85] mb-8 text-balance text-white drop-shadow-lg">
              {t('hero_title_1')}<br />
              <span className="text-white/90 drop-shadow-md">{t('hero_title_2')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-12 leading-relaxed text-balance font-medium drop-shadow-sm">
              {t('hero_desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={() => {
                  onAction?.(t('ui_redirect_reg'));
                  onGetStarted();
                }}
                className="bg-[var(--accent)] text-black hover:bg-[var(--accent-muted)] hover:scale-105 active:scale-95 px-10 py-5 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-xl shadow-[var(--accent)]/20 flex items-center justify-center gap-3 whitespace-nowrap"
              >
                {t('hero_btn_book')} <SymmetricalIcon icon={ArrowRight} size={18} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center items-center gap-6">
          <div className="flex items-center gap-3">
            {activeHeroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-[var(--accent)] w-12' : 'bg-white/40 hover:bg-white/70 w-4'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {(settings.show_stats_section ?? '1') === '1' && (
      <section className="py-20 md:py-32 border-b border-[var(--border)] bg-[var(--bg)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats?.map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-2">{stat.value}</div>
                <div className="text-xs sm:text-xs text-[var(--accent)] font-bold uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Categories Section */}
      {(settings.show_categories_section ?? '1') === '1' && (
      <section id="categories" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-6">
                {t('cat_title')} <span className="text-[var(--text-muted)] italic">{t('cat_title_accent')}</span>
              </h2>
              <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-xl text-balance leading-relaxed">
                {t('cat_desc')}
              </p>
            </div>
            <Link 
              to="/services"
              onClick={() => onAction?.('Loading all categories...')}
              className="group flex items-center gap-2 text-[var(--text)] hover:text-[var(--accent)] bg-[var(--card-bg)] border border-[var(--border)] px-6 py-3 rounded-full font-bold uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95"
            >
              {t('cat_view_all')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => {
                  onAction?.(`Searching for ${cat.name} services...`);
                  navigate(`/find-pro?category=${encodeURIComponent(cat.name)}`);
                }}
                className="relative bg-[var(--card-bg)] border border-[var(--border)] p-8 md:p-10 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all cursor-pointer group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-[40px] -mr-16 -mt-16 transition-all group-hover:bg-[var(--accent)]/10" />
                
                <div className="w-14 h-14 bg-[var(--bg)] text-[var(--text)] rounded-2xl flex items-center justify-center mb-8 border border-[var(--border)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:rotate-6 transition-all duration-300 shadow-sm relative z-10">
                  {React.cloneElement(cat.icon as React.ReactElement<any>, { className: "w-6 h-6", strokeWidth: 1.5 })}
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">{cat.name}</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-8">{cat.desc}</p>
                  
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] opacity-80 group-hover:opacity-100 transition-opacity">
                    {t('cat_explore')} <SymmetricalIcon icon={ArrowRight} size={14} className="group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Features Section - Bento Grid */}
      {(settings.show_features_section ?? '1') === '1' && (
      <section id="features" className="py-20 md:py-32 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-8 bg-[var(--card-bg)] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <Sparkles size={14} className="text-[var(--accent)]" />
              {t('feat_why_title')}
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-sans font-bold tracking-tighter mb-8 leading-[0.9] text-balance">
              {t('feat_main_title_part1')} <span className="text-[var(--accent)] opacity-90 italic font-serif">{t('feat_main_title_accent')}</span><br />
              {t('feat_main_title_part2')}
            </h2>
            <p className="text-lg md:text-xl text-[var(--text-muted)] leading-relaxed text-balance">
              {t('feat_main_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
            {/* Bento Box 1 - Span 2 Columns */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 row-span-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-[2rem] p-8 md:p-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-[var(--accent)]/10 to-transparent pointer-events-none" />
              <div className="w-12 h-12 bg-[var(--bg)] text-[var(--accent)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--border)] shadow-sm">
                <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h4 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight text-[var(--text)]">{t(`feat_verified_title`)}</h4>
              <p className="text-[var(--text-muted)] text-base leading-relaxed max-w-sm">{t(`feat_verified_desc`)}</p>
            </motion.div>

            {/* Bento Box 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-1 row-span-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-[2rem] p-8 md:p-10 relative overflow-hidden group"
            >
              <div className="w-12 h-12 bg-[var(--bg)] text-[var(--accent)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--border)] shadow-sm">
                <Zap className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h4 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight text-[var(--text)]">{t(`feat_secure_title`)}</h4>
              <p className="text-[var(--text-muted)] text-base leading-relaxed">{t(`feat_secure_desc`)}</p>
            </motion.div>

            {/* Bento Box 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-1 row-span-1 bg-[var(--text)] text-[var(--bg)] border border-[var(--text)] rounded-[2rem] p-8 md:p-10 relative overflow-hidden group hover:scale-[1.02] transition-transform"
            >
              <div className="w-12 h-12 bg-[var(--bg)] text-[var(--text)] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <SymmetricalIcon icon={ArrowRight} className="w-6 h-6 border-none p-0" strokeWidth={2} />
              </div>
              <h4 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">{t(`feat_instant_title`)}</h4>
              <p className="opacity-80 text-base leading-relaxed">{t(`feat_instant_desc`)}</p>
            </motion.div>

            {/* Bento Box 4 - Span 2 Columns */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 row-span-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-[2rem] p-8 md:p-10 relative overflow-hidden group flex flex-col justify-end"
            >
              <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} text-[120px] font-serif italic text-[var(--text)]/5 -mt-10 mr-4 rotate-12 pointer-events-none`}>24/7</div>
              <div className="w-12 h-12 bg-[var(--bg)] text-[var(--accent)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--border)] shadow-sm relative z-10">
                <Users className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h4 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight text-[var(--text)] relative z-10">{t(`feat_support_title`)}</h4>
              <p className="text-[var(--text-muted)] text-base leading-relaxed max-w-sm relative z-10">{t(`feat_support_desc`)}</p>
            </motion.div>
          </div>
        </div>
      </section>
      )}

      {/* FAQ Section */}
      {(settings.show_faq_section ?? '1') === '1' && (
      <section className="py-20 md:py-32 bg-[var(--card-bg)] border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-6">{t('faq_title')}</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: t('faq_q1'), a: t('faq_a1') },
              { q: t('faq_q2'), a: t('faq_a2') },
              { q: t('faq_q3'), a: t('faq_a3') },
              { q: t('faq_q4'), a: t('faq_a4') },
            ]?.map((faq, i) => (
              <div key={i} className="border border-[var(--border)] rounded-[2rem] p-6 md:p-8 hover:border-[var(--accent)] transition-colors">
                <h4 className="text-xl font-bold text-[var(--text)] mb-3">{faq.q}</h4>
                <p className="text-[var(--text-muted)] text-base leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-[var(--bg)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="border border-[var(--border)] rounded-[3rem] p-10 sm:p-16 md:p-24 text-center relative overflow-hidden bg-[var(--card-bg)] shadow-[0_20px_60px_rgba(0,0,0,0.04)]">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 to-[var(--bg)] pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[0.9]">{t('cta_title')}</h2>
              <p className="text-lg sm:text-xl text-[var(--text-muted)] font-medium mb-12 leading-relaxed text-balance">
                {t('cta_desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/services"
                  onClick={() => onAction?.(t('ui_finding_pro'))}
                  className="bg-[var(--text)] text-[var(--bg)] px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                >
                  {t('cta_btn_find_pro')} <SymmetricalIcon icon={ArrowRight} size={18} />
                </Link>
                <Link 
                  to="/become-artisan"
                  onClick={() => onAction?.(t('ui_redirect_artisan'))}
                  className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--border)] px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[var(--bg)] transition-all active:scale-95 flex items-center justify-center text-[var(--text)]"
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
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-[var(--text)] text-[var(--bg)]">
                  <img src={symbolUrl} alt="M3allem Symbol" className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  {settings?.platform_name ? settings.platform_name : 'M3allem'}
                </span>
              </div>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs">
                {t('footer_desc')}
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-6 text-sm text-[var(--text)]">{t('footer_platform')}</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/services" className="hover:text-[var(--accent)] transition-colors">{t('nav_find_pro')}</Link></li>
                <li><Link to="/become-artisan" className="hover:text-[var(--accent)] transition-colors">{t('nav_become_artisan')}</Link></li>
                <li><Link to="/store" className="hover:text-[var(--accent)] transition-colors">{t('nav_store')}</Link></li>
                <li><Link to="/pricing" className="hover:text-[var(--accent)] transition-colors">{t('nav_pricing')}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-6 text-sm text-[var(--text)]">{t('footer_company')}</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/about" className="hover:text-[var(--accent)] transition-colors">{t('footer_about')}</Link></li>
                <li><Link to="/careers" className="hover:text-[var(--accent)] transition-colors">{t('footer_careers')}</Link></li>
                <li><Link to="/contact" className="hover:text-[var(--accent)] transition-colors">{t('footer_contact')}</Link></li>
                <li><Link to="/blog" className="hover:text-[var(--accent)] transition-colors">{t('footer_blog')}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-6 text-sm text-[var(--text)]">{t('footer_legal')}</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/privacy" className="hover:text-[var(--accent)] transition-colors">{t('footer_privacy')}</Link></li>
                <li><Link to="/terms" className="hover:text-[var(--accent)] transition-colors">{t('footer_terms')}</Link></li>
                <li><Link to="/cookies" className="hover:text-[var(--accent)] transition-colors">{t('footer_cookies')}</Link></li>
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
