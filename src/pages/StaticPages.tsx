import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Users, Star, TrendingUp, Heart, Calculator, MapPin, Clock, Wrench, Sparkles, BrainCircuit, ChevronRight, Info, ArrowLeft, CheckCircle2, Calendar, User as LucideUser, UserIcon, Tag, Briefcase, ArrowRight, CheckCircle, Mail, Phone, Send, MessageSquare, FileText, Download, Eye, Plus, CreditCard, Search, Wallet, Smartphone, Package, Hammer, LogOut, Bell, Settings, LayoutDashboard, Home } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import { useTranslation } from 'react-i18next';
import { aiService } from '../services/aiService';
import Layout from '../components/layout/Layout';
import BookingModal from '../components/marketplace/BookingModal';
import StoreSection from '../components/store/StoreSection';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { useSettings } from '../context/SettingsContext';

export function About() {
  const { t } = useTranslation();
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text)] uppercase"
          >
            {t('about_title_1')} <span className="text-[var(--accent)]">{t('about_title_2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            {t('about_subtitle')}
          </motion.p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 text-[var(--text)] uppercase">{t('about_mission_1')} <span className="text-[var(--accent)]">{t('about_mission_2')}</span></h2>
            <p className="text-xl text-[var(--text-muted)] leading-relaxed mb-8">
              {t('about_mission_desc_1')}
            </p>
            <p className="text-xl text-[var(--text-muted)] leading-relaxed">
              {t('about_mission_desc_2')}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 bg-[var(--card-bg)] p-4 rounded-[48px] border border-[var(--border)] backdrop-blur-3xl">
              <img 
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800" 
                className="rounded-[40px] shadow-2xl w-full h-[500px] object-cover"
                alt="Artisan at work"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 end-8 rtl:-start-8 z-20 bg-[var(--accent)] p-8 rounded-3xl shadow-2xl text-[var(--accent-foreground)]">
              <div className="text-4xl font-bold mb-1">2,500+</div>
              <div className="text-xs font-bold uppercase tracking-widest">{t('about_stats_verified')}</div>
            </div>
          </motion.div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { title: t('about_values_trust'), desc: t('about_values_trust_desc'), icon: <ShieldCheck /> },
            { title: t('about_values_quality'), desc: t('about_values_quality_desc'), icon: <Star /> },
            { title: t('about_values_innovation'), desc: t('about_values_innovation_desc'), icon: <Zap /> },
            { title: t('about_values_community'), desc: t('about_values_community_desc'), icon: <Users /> },
            { title: t('about_values_transparency'), desc: t('about_values_transparency_desc'), icon: <TrendingUp /> },
            { title: t('about_values_customer'), desc: t('about_values_customer_desc'), icon: <Heart /> }
          ]?.map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] p-10 rounded-[40px] hover:bg-[var(--bg)] transition-all"
            >
              <div className="w-16 h-16 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center mb-8">
                {React.cloneElement(value.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">{value.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {value.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Team Section Placeholder */}
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-[var(--text)] uppercase">{t('about_join_1')} <span className="text-[var(--accent)]">{t('about_join_2')}</span></h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/careers"
              className="bg-[var(--text)] text-[var(--bg)] px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-transform active:scale-95 shadow-2xl"
            >
              {t('about_btn_careers')}
            </Link>
            <Link 
              to="/contact"
              className="bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] px-12 py-5 rounded-2xl font-bold text-xl transition-all active:scale-95 text-[var(--text)]"
            >
              {t('about_btn_contact')}
            </Link>
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Agadir', 'Fes', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan'
];

export function AutoDevis() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    city: 'Casablanca',
    urgency: 'Normal'
  });
  const [estimate, setEstimate] = useState<any>(null);

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceType || !formData.description) return;

    setLoading(true);
    try {
      const result = await aiService.getAutoEstimate(
        formData.serviceType, 
        formData.description, 
        formData.city, 
        formData.urgency
      );
      setEstimate(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-20">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          {/* Intro */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              {t('auto_devis_badge', 'Powered by Gemini AI')}
            </div>
            <h2 className="text-3xl font-bold leading-tight text-[var(--text)]">{t('auto_devis_title', 'Get an instant price estimate for your project.')}</h2>
            <p className="text-[var(--text-muted)] text-sm">{t('auto_devis_desc', 'Our AI analyzes market data across Morocco to give you the most accurate pricing range.')}</p>
          </div>

          <form onSubmit={handleEstimate} className="space-y-6">
            {/* Service Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">{t('auto_devis_lbl_service', 'Service Category')}</label>
              <div className="relative">
                <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/20" size={18} />
                <input 
                  type="text"
                  placeholder="{t('auto_devis_placeholder_service', 'e.g. Plumbing, Electrical, Painting...')}"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                  className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)]"
                  required
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">{t('auto_devis_lbl_city', 'City')}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/20" size={18} />
                <select 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm appearance-none text-[var(--text)]"
                >
                  {MOROCCAN_CITIES?.map(city => (
                    <option key={city} value={city} className="bg-[var(--card-bg)]">{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">{t('auto_devis_lbl_urgency', 'Urgency')}</label>
              <div className="grid grid-cols-3 gap-3">
                {['Normal', 'Urgent', 'Emergency']?.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({...formData, urgency: level})}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.urgency === level 
                      ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' 
                      : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--accent)]/20'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">Problem Description</label>
              <textarea 
                placeholder="Describe what needs to be fixed or built..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm h-32 resize-none text-[var(--text)]"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading || !formData.serviceType || !formData.description}
              className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold text-lg hover:bg-[var(--accent)]/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--accent-foreground)]/30 border-t-[var(--accent-foreground)] rounded-full animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator size={20} />
                  Get Instant Quote
                </>
              )}
            </button>
          </form>

          {/* Results */}
          <AnimatePresence>
            {estimate && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 space-y-6 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BrainCircuit size={120} className="text-[var(--text)]" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.2em]">Estimated Price Range</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-5xl font-bold tracking-tighter text-[var(--text)]">{estimate.min} - {estimate.max}</h3>
                      <span className="text-xl font-bold text-[var(--text-muted)]">{t('currency_mad', 'MAD')}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--accent)]/10 rounded-2xl border border-[var(--accent)]/20 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--accent)] uppercase">Suggested Price</p>
                      <p className="text-2xl font-bold text-[var(--text)]">{estimate.suggested} {t('currency_mad', 'MAD')}</p>
                    </div>
                    <div className="w-12 h-12 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full flex items-center justify-center">
                      <CheckCircle2 size={24} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Key Pricing Factors</p>
                    <div className="space-y-2">
                      {estimate.factors?.map((factor: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                          <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[var(--border)] flex items-start gap-3 text-[var(--text-muted)] text-xs italic">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    This is an AI-generated estimate based on market averages. Final price may vary after artisan inspection.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to={`/search?q=${formData.serviceType}`}
                    className="bg-[var(--card-bg)] border border-[var(--border)] py-4 rounded-2xl font-bold text-center hover:bg-[var(--bg)] transition-all text-[var(--text)]"
                  >
                    Find Artisans
                  </Link>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold text-center hover:bg-[var(--accent)]/90 transition-all"
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}

export function Blog() {
  const { t, i18n } = useTranslation();

  const posts = [
    {
      id: 1,
      title: t('post_1_title'),
      excerpt: t('post_1_excerpt'),
      author: 'Karim Tazi',
      date: 'March 15, 2026',
      readTime: '5 min read',
      category: t('post_1_cat'),
      image: 'https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 2,
      title: t('post_2_title'),
      excerpt: t('post_2_excerpt'),
      author: 'Sarah Mansouri',
      date: 'March 12, 2026',
      readTime: '8 min read',
      category: t('post_2_cat'),
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      title: t('post_3_title'),
      excerpt: t('post_3_excerpt'),
      author: 'Ahmed Sabiri',
      date: 'March 10, 2026',
      readTime: '6 min read',
      category: t('post_3_cat'),
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text)] uppercase"
          >
            {t('blog_title_1')} <span className="text-[var(--accent)]">{t('blog_title_2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            {t('blog_subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {posts?.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] overflow-hidden group hover:border-[var(--accent)]/30 transition-all shadow-xl"
            >
              <div className="h-64 relative overflow-hidden">
                <img 
                  src={post.image} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={post.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold text-[var(--accent)] border border-[var(--border)]">
                  {post.category}
                </div>
              </div>
              <div className="p-10">
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mb-4">
                  <div className="flex items-center gap-1"><Calendar size={14} /> {post.date}</div>
                  <div className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[var(--accent)] transition-colors leading-tight text-[var(--text)]">
                  {post.title}
                </h3>
                <p className="text-[var(--text-muted)] mb-8 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-8 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center">
                      <LucideUser size={16} className="text-[var(--text-muted)]" />
                    </div>
                    <span className="text-sm font-bold text-[var(--text)]">{post.author}</span>
                  </div>
                  <button className={`text-[var(--accent)] font-bold text-sm flex items-center gap-1 hover:underline ${i18n.dir() === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    {t('blog_read_more')} <ChevronRight size={16} className={i18n.dir() === 'rtl' ? 'rotate-180' : ''}/>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="bg-[var(--accent)] rounded-[64px] p-12 md:p-24 text-[var(--accent-foreground)] text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 uppercase">{t('blog_sub_1')} <span className="text-black">{t('blog_sub_2')}</span></h2>
            <p className="text-lg font-medium mb-12 opacity-80">
              {t('blog_sub_desc')}
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder={t('blog_sub_placeholder')}
                className="flex-1 bg-white/20 border border-black/10 rounded-2xl py-5 px-8 focus:outline-none focus:border-black/50 transition-all placeholder:text-black/40 text-lg font-bold"
              />
              <button className="bg-black text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-transform active:scale-95 shadow-2xl">
                {t('blog_sub_btn')}
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}

const jobs = [
  {
    id: 1,
    titleToken: 'careers_job1_title',
    titleDefault: 'Senior Frontend Engineer',
    deptToken: 'careers_dept_engineering',
    deptDefault: 'Engineering',
    locToken: 'careers_loc_casa_remote',
    locDefault: 'Casablanca / Remote',
    typeToken: 'careers_type_fulltime',
    typeDefault: 'Full-time'
  },
  {
    id: 2,
    titleToken: 'careers_job2_title',
    titleDefault: 'Product Designer (UX/UI)',
    deptToken: 'careers_dept_product',
    deptDefault: 'Product',
    locToken: 'careers_loc_casa_remote',
    locDefault: 'Casablanca / Remote',
    typeToken: 'careers_type_fulltime',
    typeDefault: 'Full-time'
  },
  {
    id: 3,
    titleToken: 'careers_job3_title',
    titleDefault: 'Operations Manager',
    deptToken: 'careers_dept_operations',
    deptDefault: 'Operations',
    locToken: 'careers_loc_rabat',
    locDefault: 'Rabat',
    typeToken: 'careers_type_fulltime',
    typeDefault: 'Full-time'
  },
  {
    id: 4,
    titleToken: 'careers_job4_title',
    titleDefault: 'Customer Success Specialist',
    deptToken: 'careers_dept_support',
    deptDefault: 'Support',
    locToken: 'careers_loc_remote',
    locDefault: 'Remote',
    typeToken: 'careers_type_fulltime',
    typeDefault: 'Full-time'
  }
];

export function Careers() {
  const { t, i18n } = useTranslation();
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text)] uppercase"
          >
            {t('careers_title_1')} <span className="text-[var(--accent)]">{t('careers_title_2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            {t('careers_subtitle')}
          </motion.p>
        </div>

        {/* Culture Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { title: t('careers_culture_inn'), desc: t('careers_culture_inn_desc'), icon: <Zap /> },
            { title: t('careers_culture_com'), desc: t('careers_culture_com_desc'), icon: <Users /> },
            { title: t('careers_culture_exc'), desc: t('careers_culture_exc_desc'), icon: <Star /> }
          ]?.map((item, i) => (
            <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] p-10 rounded-[40px] text-center shadow-xl">
              <div className="w-16 h-16 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center mx-auto mb-8">
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">{item.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Open Positions */}
        <div className="mb-32">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-center text-[var(--text)] uppercase">{t('careers_positions_1')} <span className="text-[var(--accent)]">{t('careers_positions_2')}</span></h2>
          <div className="space-y-6">
            {jobs?.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--card-bg)] border border-[var(--border)] p-8 md:p-10 rounded-[40px] flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-[var(--bg)] transition-all group cursor-pointer shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--accent)]/20">
                      {t(job.deptToken, job.deptDefault)}
                    </span>
                    <span className="text-[var(--text-muted)]/40 text-xs font-bold uppercase tracking-widest">{t(job.typeToken, job.typeDefault)}</span>
                  </div>
                  <h3 className="text-3xl font-bold group-hover:text-[var(--accent)] transition-colors text-[var(--text)]">{t(job.titleToken, job.titleDefault)}</h3>
                  <div className="flex items-center gap-4 text-[var(--text-muted)]">
                    <div className="flex items-center gap-1 text-sm"><MapPin size={16} /> {t(job.locToken, job.locDefault)}</div>
                    <div className="flex items-center gap-1 text-sm"><Clock size={16} /> {t('careers_posted_ago')}</div>
                  </div>
                </div>
                <button className={`bg-[var(--bg)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group/btn border border-[var(--border)] text-[var(--text)] flex-row-reverse`}>
                  {t('careers_btn_apply')}
                  <ArrowRight size={20} className={`transform transition-transform ${i18n.dir() === 'rtl' ? 'rotate-180 group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'}`} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[64px] p-12 md:p-24 text-center shadow-2xl">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 text-[var(--text)] uppercase">{t('careers_ben_title_1')} <span className="text-[var(--accent)]">{t('careers_ben_title_2')}</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              t('careers_ben_1'),
              t('careers_ben_2'),
              t('careers_ben_3'),
              t('careers_ben_4'),
              t('careers_ben_5'),
              t('careers_ben_6'),
              t('careers_ben_7'),
              t('careers_ben_8')
            ]?.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 justify-center text-lg font-medium text-[var(--text)]">
                <CheckCircle className="text-[var(--accent)]" size={20} />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}

export function Contact() {
  const { t, i18n } = useTranslation();
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text)] uppercase"
          >
            {t('contact_title_1')} <span className="text-[var(--accent)]">{t('contact_title_2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            {t('contact_subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] p-10 rounded-[40px] space-y-8 shadow-xl">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center shrink-0">
                  <Mail size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1 text-[var(--text)]">{t('contact_email_us')}</h4>
                  <p className="text-[var(--text-muted)]">support@m3allem.ma</p>
                  <p className="text-[var(--text-muted)]">info@m3allem.ma</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center shrink-0">
                  <Phone size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1 text-[var(--text)]">{t('contact_call_us')}</h4>
                  <p className="text-[var(--text-muted)]">+212 522 123 456</p>
                  <p className="text-[var(--text-muted)]">+212 661 987 654</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1 text-[var(--text)]">{t('contact_visit_us')}</h4>
                  <p className="text-[var(--text-muted)]">123 Boulevard d'Anfa</p>
                  <p className="text-[var(--text-muted)]">Casablanca, Morocco</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 p-10 rounded-[40px]">
              <div className="flex items-center gap-4 mb-6">
                <Clock size={24} className="text-[var(--accent)]" />
                <h4 className="text-xl font-bold text-[var(--text)]">{t('contact_business_hours')}</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">{t('contact_mon_fri')}</span>
                  <span className="font-bold text-[var(--text)]">09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">{t('contact_sat')}</span>
                  <span className="font-bold text-[var(--text)]">10:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">{t('contact_sun')}</span>
                  <span className="text-[var(--destructive)] font-bold">{t('contact_closed')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] p-10 md:p-16 rounded-[48px] shadow-2xl">
              <h3 className="text-3xl font-bold mb-8 text-[var(--text)]">{t('contact_send_msg_title')}</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ms-4">{t('contact_lbl_name')}</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ms-4">{t('contact_lbl_email')}</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ms-4">{t('contact_lbl_subject')}</label>
                  <select className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all appearance-none text-[var(--text)]">
                    <option className="bg-[var(--card-bg)]">General Inquiry</option>
                    <option className="bg-[var(--card-bg)]">Support Request</option>
                    <option className="bg-[var(--card-bg)]">Partnership</option>
                    <option className="bg-[var(--card-bg)]">Feedback</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ms-4">{t('contact_lbl_msg')}</label>
                  <textarea 
                    placeholder="..."
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all h-48 resize-none text-[var(--text)]"
                  ></textarea>
                </div>

                <button 
                  type="button"
                  className="bg-[var(--accent)] text-[var(--accent-foreground)] px-12 py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-[var(--accent)]/90 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/20 w-full md:w-auto"
                >
                  {t('contact_btn_send')}
                  <Send size={20} className={i18n.dir() === 'rtl' ? 'rotate-180' : ''} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}

export function Devis() {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-7xl mx-auto bg-[var(--bg)] text-[var(--text)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--text)]">
              {t('devis_title_1', 'Your ')} <span className="text-[var(--accent)]">{t('devis_title_2', 'Estimates.')}</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg">{t('devis_desc', 'Manage and review your project quotes.')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/auto-devis"
              className="bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] px-8 py-4 rounded-full font-bold hover:bg-[var(--bg)] transition-colors flex items-center gap-3"
            >
              <Sparkles size={20} className="text-[var(--accent)]" /> {t('devis_btn_ai', 'AI Automatic Quote')}
            </Link>
            <button className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-full font-bold hover:opacity-90 transition-colors flex items-center gap-3 shadow-xl shadow-[var(--accent)]/20">
              <Plus size={20} /> {t('devis_btn_new', 'Request New Estimate')}
            </button>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase tracking-widest">
                  <th className="p-6 font-bold">{t('devis_tbl_id', 'ID')}</th>
                  <th className="p-6 font-bold">{t('devis_tbl_project', 'Project')}</th>
                  <th className="p-6 font-bold">{t('devis_tbl_artisan', 'Artisan')}</th>
                  <th className="p-6 font-bold">{t('devis_tbl_date', 'Date')}</th>
                  <th className="p-6 font-bold">{t('devis_tbl_amount', 'Amount')}</th>
                  <th className="p-6 font-bold">{t('devis_tbl_status', 'Status')}</th>
                  <th className="p-6 font-bold text-right">{t('devis_tbl_actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {[1, 2, 3, 4]?.map((i) => (
                  <tr key={i} className="hover:bg-[var(--bg)] transition-colors group">
                    <td className="p-6 font-mono text-sm text-[var(--text-muted)]">#EST-{1000 + i}</td>
                    <td className="p-6 font-bold text-[var(--text)]">{t('devis_sample_proj', 'Complete Bathroom Renovation')}</td>
                    <td className="p-6 text-[var(--text)]/80">{t('devis_sample_artisan', 'Master Plumber')}</td>
                    <td className="p-6 text-[var(--text-muted)] text-sm">Oct 24, 2023</td>
                    <td className="p-6 font-bold text-[var(--accent)]">15,000 MAD</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${i === 1 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'}`}>
                        {i === 1 ? t('devis_status_pending', 'Pending') : t('devis_status_accepted', 'Accepted')}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-[var(--bg)] hover:bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-[var(--text)] transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 bg-[var(--bg)] hover:bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-[var(--text)] transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function Facture() {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--text)]">
              {t('facture_title_1', 'Your ')} <span className="text-[var(--accent)]">{t('facture_title_2', 'Invoices.')}</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg">{t('facture_desc', 'View and download your billing history.')}</p>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border)] px-8 py-4 rounded-3xl flex items-center gap-4 shadow-xl">
            <CreditCard size={24} className="text-[var(--accent)]" />
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">{t('facture_total_spent', 'Total Spent')}</p>
              <p className="text-xl font-bold text-[var(--text)]">24,500 MAD</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase tracking-widest">
                  <th className="p-6 font-bold">{t('facture_invoice_num', 'Invoice #')}</th>
                  <th className="p-6 font-bold">{t('facture_service', 'Service')}</th>
                  <th className="p-6 font-bold">{t('facture_date', 'Date')}</th>
                  <th className="p-6 font-bold">{t('facture_amount', 'Amount')}</th>
                  <th className="p-6 font-bold">{t('facture_status', 'Status')}</th>
                  <th className="p-6 font-bold text-right">{t('facture_actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {[1, 2, 3, 4, 5]?.map((i) => (
                  <tr key={i} className="hover:bg-[var(--bg)] transition-colors group">
                    <td className="p-6 font-mono text-sm text-[var(--text-muted)]">INV-2023-{1000 + i}</td>
                    <td className="p-6 font-bold text-[var(--text)]">{t('facture_repair', 'Electrical Repair')}</td>
                    <td className="p-6 text-[var(--text-muted)] text-sm">Oct 24, 2023</td>
                    <td className="p-6 font-bold text-[var(--accent)]">850 MAD</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${i === 1 ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20' : 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'}`}>
                        {t('facture_paid', 'Paid')}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-[var(--bg)] hover:bg-[var(--bg)]/80 rounded-xl text-[var(--text)] transition-colors border border-[var(--border)]">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 bg-[var(--bg)] hover:bg-[var(--bg)]/80 rounded-xl text-[var(--text)] transition-colors border border-[var(--border)]">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function HowItWorks() {
  const { t } = useTranslation();
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text)] uppercase"
          >
            {t('hiw_title_1')} <span className="text-[var(--accent)]">{t('hiw_title_2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            {t('hiw_subtitle')}
          </motion.p>
        </div>

        {/* For Homeowners Section */}
        <div className="mb-40">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-center text-[var(--text)] uppercase">{t('hiw_homeowners_1')} <span className="text-[var(--accent)]">{t('hiw_homeowners_2')}</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-[var(--border)] z-0" />
            
            {[
              { 
                step: '01', 
                title: t('hiw_ho_s1_title'), 
                desc: t('hiw_ho_s1_desc'), 
                icon: <Search /> 
              },
              { 
                step: '02', 
                title: t('hiw_ho_s2_title'), 
                desc: t('hiw_ho_s2_desc'), 
                icon: <Calendar /> 
              },
              { 
                step: '03', 
                title: t('hiw_ho_s3_title'), 
                desc: t('hiw_ho_s3_desc'), 
                icon: <CheckCircle /> 
              },
              { 
                step: '04', 
                title: t('hiw_ho_s4_title'), 
                desc: t('hiw_ho_s4_desc'), 
                icon: <Wallet /> 
              }
            ]?.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 text-center"
              >
                <div className="w-24 h-24 bg-[var(--card-bg)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-bold text-[var(--accent)] group hover:border-[var(--accent)]/50 transition-colors shadow-xl">
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 32 })}
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[var(--text)]">{item.title}</h4>
                <p className="text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* For Artisans Section */}
        <div className="mb-40">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-center text-[var(--text)] uppercase">{t('hiw_artisans_1')} <span className="text-[var(--accent)]">{t('hiw_artisans_2')}</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-[var(--border)] z-0" />
            
            {[
              { 
                step: '01', 
                title: t('hiw_ar_s1_title'), 
                desc: t('hiw_ar_s1_desc'), 
                icon: <Smartphone /> 
              },
              { 
                step: '02', 
                title: t('hiw_ar_s2_title'), 
                desc: t('hiw_ar_s2_desc'), 
                icon: <ShieldCheck /> 
              },
              { 
                step: '03', 
                title: t('hiw_ar_s3_title'), 
                desc: t('hiw_ar_s3_desc'), 
                icon: <MessageSquare /> 
              },
              { 
                step: '04', 
                title: t('hiw_ar_s4_title'), 
                desc: t('hiw_ar_s4_desc'), 
                icon: <Star /> 
              }
            ]?.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 text-center"
              >
                <div className="w-24 h-24 bg-[var(--card-bg)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-bold text-[var(--accent)] group hover:border-[var(--accent)]/50 transition-colors shadow-xl">
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 32 })}
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[var(--text)]">{item.title}</h4>
                <p className="text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust & Safety Section */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[64px] p-12 md:p-24 mb-32 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-tight text-[var(--text)] uppercase">
                {t('hiw_trust_1')} <span className="text-[var(--accent)]">{t('hiw_trust_2')}</span> {t('hiw_trust_3')}
              </h2>
              <p className="text-xl text-[var(--text-muted)] mb-12 leading-relaxed">
                {t('hiw_trust_desc')}
              </p>
              <ul className="space-y-6">
                {[
                  { title: t('hiw_t_id_verif'), desc: t('hiw_t_id_verif_desc') },
                  { title: t('hiw_t_escrow'), desc: t('hiw_t_escrow_desc') },
                  { title: t('hiw_t_reviews'), desc: t('hiw_t_reviews_desc') },
                  { title: t('hiw_t_mediation'), desc: t('hiw_t_mediation_desc') }
                ]?.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle className="text-[var(--accent)] shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="text-xl font-bold mb-1 text-[var(--text)]">{item.title}</h4>
                      <p className="text-[var(--text-muted)] text-sm">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-white/10 to-transparent p-4 rounded-[48px] border border-[var(--border)] backdrop-blur-3xl">
                <img 
                  src="https://images.unsplash.com/photo-1573161158365-597e00b7276d?auto=format&fit=crop&q=80&w=800" 
                  className="rounded-[40px] shadow-2xl"
                  alt="Security and trust"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-[var(--text)] uppercase">{t('hiw_ready_1')} <span className="text-[var(--accent)]">{t('hiw_ready_2')}</span></h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/services"
              className="bg-[var(--accent)] text-[var(--accent-foreground)] px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-transform active:scale-95 shadow-2xl"
            >
              {t('hiw_btn_find')}
            </Link>
            <Link 
              to="/become-artisan"
              className="bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] px-12 py-5 rounded-2xl font-bold text-xl transition-all active:scale-95 text-[var(--text)]"
            >
              {t('hiw_btn_join')}
            </Link>
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}

export function Privacy() {
  const { t } = useTranslation();
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-12 text-[var(--text)] uppercase"
        >
          {t('privacy_title_1')} <span className="text-[var(--accent)]">{t('privacy_title_2')}</span>
        </motion.h1>
        
        <div className="space-y-12 text-[var(--text-muted)] leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">1. Introduction</h2>
            <p>
              Welcome to M3allem En Click. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">2. Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Identity Data: includes first name, last name, username or similar identifier.</li>
              <li>Contact Data: includes email address and telephone numbers.</li>
              <li>Technical Data: includes internet protocol (IP) address, your login data, browser type and version.</li>
              <li>Profile Data: includes your username and password, bookings made by you, your interests, preferences, feedback and survey responses.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">3. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">5. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
            </p>
          </section>
        </div>

        <div className="mt-20 pt-12 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">
          Last updated: March 09, 2026
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}


export function Terms() {
  const { t } = useTranslation();
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-12 text-[var(--text)] uppercase"
        >
          {t('terms_title_1')} <span className="text-[var(--accent)]">{t('terms_title_2')}</span>
        </motion.h1>
        
        <div className="space-y-12 text-[var(--text-muted)] leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('terms_sec1_title', '1. Agreement to Terms')}</h2>
            <p>
              {t('terms_sec1_desc', 'By accessing or using M3allem')} En Click, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('terms_sec2_title', '2. Use of the Platform')}</h2>
            <p>
              {t('terms_sec2_desc', 'M3allem En Click provides a marketplace')} connecting homeowners with professional artisans. We do not provide the services ourselves. We are a platform that facilitates the connection, booking, and payment between the two parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('terms_sec3_title', '3. User Responsibilities')}</h2>
            <p>
              {t('terms_sec3_desc', 'Users are responsible for maintaining')} the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account. You must be at least 18 years old to use this platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('terms_sec4_title', '4. Payments & Commissions')}</h2>
            <p>
              {t('terms_sec4_desc', 'Payments are processed through our secure')} third-party provider. M3allem En Click takes a commission on successful bookings as specified in our pricing page. Artisans agree to receive payments minus the applicable commission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('terms_sec5_title', '5. Limitation of Liability')}</h2>
            <p>
              {t('terms_sec5_desc', 'M3allem En Click shall not be liable')} for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>
        </div>

        <div className="mt-20 pt-12 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">
          Last updated: March 09, 2026
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}


export function Cookies() {
  const { t } = useTranslation();
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-12 text-[var(--text)] uppercase"
        >
          {t('cookies_title_1')} <span className="text-[var(--accent)]">{t('cookies_title_2')}</span>
        </motion.h1>
        
        <div className="space-y-12 text-[var(--text-muted)] leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('cookie_sec1_title', '1. What are Cookies?')}</h2>
            <p>
              {t('cookie_sec1_desc', 'Cookies are small text files')} that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('cookie_sec2_title', '2. How We Use Cookies')}</h2>
            <p>
              {t('cookie_sec2_desc', 'We use cookies for several reasons')}. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('cookie_sec3_title', '3. Types of Cookies We Use')}</h2>
            <ul className="list-disc ml-6 mt-4 space-y-4">
              <li>
                <strong className="text-[var(--text)]">{t('cookie_sec3_type1', 'Essential Cookies:')}</strong> {t('cookie_sec3_desc1', 'These cookies are strictly necessary')} to provide you with services available through our website and to use some of its features, such as access to secure areas.
              </li>
              <li>
                <strong className="text-[var(--text)]">{t('cookie_sec3_type2', 'Performance and Functionality Cookies:')}</strong> {t('cookie_sec3_desc2', 'These cookies are used to enhance the performance')} and functionality of our website but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.
              </li>
              <li>
                <strong className="text-[var(--text)]">{t('cookie_sec3_type3', 'Analytics and Customization Cookies:')}</strong> {t('cookie_sec3_desc3', 'These cookies collect information that is used either')} in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('cookie_sec4_title', '4. Managing Cookies')}</h2>
            <p>
              {t('cookie_sec4_desc', 'You have the right to decide whether to accept or reject cookies.')} You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
            </p>
          </section>
        </div>

        <div className="mt-20 pt-12 border-t border-[var(--border)] text-sm text-[var(--text-muted)]/40">
          Last updated: March 09, 2026
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage: number;
  service_names: string[];
  service_ids: string[];
}

interface GroupRequest {
  id: string;
  title: string;
  description: string;
  creator_name: string;
  service_name: string;
  participant_count: number;
  min_participants: number;
  max_participants: number;
  current_price_per_user: number;
  address: string;
  scheduled_at: string;
}

export function MarketplaceExtras() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [groupRequests, setGroupRequests] = useState<GroupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'packages' | 'groups'>('packages');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, grpRes] = await Promise.all([
          fetch('/api/marketplace-extras/packages'),
          fetch('/api/marketplace-extras/group-requests')
        ]);
        const pkgData = await pkgRes.json();
        const grpData = await grpRes.json();
        setPackages(pkgData);
        setGroupRequests(grpData);
      } catch (error) {
        console.error("Error fetching marketplace extras:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleJoinGroup = async (id: string) => {
    try {
      const res = await fetch(`/api/marketplace-extras/group-requests/${id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}`
        }
      });
      if (res.ok) {
        alert("Successfully joined the group request!");
        // Refresh data
        const grpRes = await fetch('/api/marketplace-extras/group-requests');
        setGroupRequests(await grpRes.json());
      } else {
        const data = await res.json();
        alert(data.error || "Failed to join group");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12 bg-[var(--bg)] text-[var(--text)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-[var(--text)]">{t('extras_title', 'Marketplace Extras')}</h1>
            <p className="text-[var(--text-muted)] max-w-2xl">
              Discover multi-service bundles and join group requests to save money and get more done.
            </p>
          </div>
          
          <div className="flex bg-[var(--card-bg)] p-1 rounded-2xl border border-[var(--border)] shadow-lg">
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'packages' ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            >
              Bundles
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'groups' ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            >
              Group Requests
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
          </div>
        ) : activeTab === 'packages' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages?.map((pkg) => (
              <div key={pkg.id} className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:border-[var(--accent)]/50 transition-all shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)]">
                    <Package size={24} />
                  </div>
                  <div className="bg-[var(--success)]/10 text-[var(--success)] px-4 py-1 rounded-full text-xs font-bold border border-[var(--success)]/20">
                    Save {pkg.discount_percentage}%
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-[var(--text)]">{pkg.name}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-6 line-clamp-2">{pkg.description}</p>
                
                <div className="space-y-3 mb-8">
                  {pkg?.service_names?.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-[var(--text)]/80">
                      <CheckCircle2 size={16} className="text-[var(--success)]" />
                      {s}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">Bundle Price</p>
                    <p className="text-2xl font-bold text-[var(--accent)]">{pkg.price} MAD</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setShowBookingModal(true);
                    }}
                    className="w-12 h-12 bg-[var(--bg)] border border-[var(--border)] rounded-2xl flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all text-[var(--text)]"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Custom Bundle CTA */}
            <div className="bg-gradient-to-br from-[var(--accent)]/20 to-transparent border border-[var(--accent)]/20 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center shadow-2xl">
              <div className="w-16 h-16 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-3xl flex items-center justify-center mb-6">
                <Plus size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--text)]">Custom Bundle</h3>
              <p className="text-[var(--text-muted)] text-sm mb-8">Need something specific? Create your own multi-service request and get a custom quote.</p>
              <button className="px-8 py-3 bg-[var(--text)] text-[var(--bg)] rounded-2xl font-bold hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-all">
                Request Custom
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {groupRequests?.map((req) => (
              <div key={req.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:border-[var(--accent)]/50 transition-all shadow-xl">
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[var(--bg)] text-[var(--text-muted)] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[var(--border)]">
                        {req.service_name}
                      </span>
                      <span className="text-[var(--text-muted)]/20">•</span>
                      <span className="text-[var(--text-muted)] text-xs flex items-center gap-1">
                        <Users size={12} />
                        {req.participant_count}/{req.max_participants || '∞'} joined
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-[var(--text)]">{req.title}</h3>
                    <p className="text-[var(--text-muted)] text-sm line-clamp-2">{req.description}</p>
                  </div>
                  
                  <div className="bg-[var(--bg)] rounded-3xl p-6 flex flex-col items-center justify-center min-w-[140px] border border-[var(--border)]">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold mb-1">Price per user</p>
                    <p className="text-2xl font-bold text-[var(--accent)]">{req.current_price_per_user} MAD</p>
                    <p className="text-[10px] text-[var(--success)] font-bold mt-1 flex items-center gap-1">
                      <Info size={10} />
                      Group Discount
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <div className="w-8 h-8 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center justify-center">
                      <MapPin size={14} />
                    </div>
                    <span className="truncate">{req.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <div className="w-8 h-8 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center justify-center">
                      <Calendar size={14} />
                    </div>
                    <span>{new Date(req.scheduled_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full flex items-center justify-center font-bold text-sm">
                      {req.creator_name[0]}
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Organized by</p>
                      <p className="text-sm font-bold text-[var(--text)]">{req.creator_name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleJoinGroup(req.id)}
                    className="px-8 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[var(--accent)]/20"
                  >
                    Join Group
                  </button>
                </div>
              </div>
            ))}
            
            {/* Create Group CTA */}
            <div className="bg-[var(--card-bg)] border border-dashed border-[var(--border)] rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center shadow-xl">
              <div className="w-16 h-16 bg-[var(--bg)] text-[var(--text-muted)]/40 rounded-3xl flex items-center justify-center mb-6 border border-[var(--border)]">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--text)]">Start a Group Request</h3>
              <p className="text-[var(--text-muted)] text-sm mb-8">Organize a collective service for your building or neighborhood and unlock lower prices for everyone.</p>
              <button className="px-8 py-3 border border-[var(--border)] text-[var(--text)] rounded-2xl font-bold hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all">
                Create Group
              </button>
            </div>
          </div>
        )}
      </div>

      {showBookingModal && selectedPackage && (
        <BookingModal 
          artisan={{
            id: 'package-artisan',
            user_id: 'package-user',
            name: 'Package Specialist',
            avatar_url: 'https://picsum.photos/seed/specialist/100/100',
            category_id: 'package-cat',
            category_name: 'Multi-Service',
            bio: 'Expert in bundled services',
            expertise: 'Bundled Services',
            years_experience: 10,
            rating: 4.9,
            review_count: 120,
            is_verified: true,
            is_online: true,
            city: 'Casablanca'
          }}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            alert("Package request submitted successfully!");
          }}
        />
      )}
    </Layout>
  );
}

export function MaterialsMarketplacePage() {
  const { t } = useTranslation();
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (msg: string) => {
    showToast(msg);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[#FFD700] selection:text-black relative transition-colors duration-300">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 start-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[var(--card-bg)] border border-[var(--border)] px-6 py-4 rounded-2xl shadow-2xl"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="text-emerald-400" size={24} />
            ) : (
              <div className="w-2 h-2 rounded-full bg-blue-400" />
            )}
            <span className="font-medium text-[var(--text)]">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Hammer size={20} />
            </div>
            <span className="text-xl font-bold tracking-tighter">M3allem <span className="text-[var(--accent)]">En Click</span></span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-muted)]">
            <Link to="/#features" className="hover:text-[var(--text)] transition-colors">{t('nav_features')}</Link>
            <Link to="/#categories" className="hover:text-[var(--text)] transition-colors">{t('nav_categories')}</Link>
            <Link to="/store" className="text-[var(--accent)] transition-colors">{t('nav_store_materials')}</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/"
              className="bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              {t('nav_back_home', 'Back to Home')}
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-20 max-w-7xl mx-auto">
        <StoreSection onAction={handleAction} />
      </div>

      {/* Footer */}
      <footer className="py-20 border-t border-[var(--border)] mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-lg flex items-center justify-center rotate-12">
                  <Hammer size={16} />
                </div>
                <span className="text-lg font-bold tracking-tighter">M3allem <span className="text-[var(--accent)]">En Click</span></span>
              </div>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                {t('footer_desc')}
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-40 text-[var(--text)]">{t('footer_platform')}</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/services" className="hover:text-[var(--accent)] transition-colors">{t('footer_find_pro')}</Link></li>
                <li><Link to="/become-artisan" className="hover:text-[var(--accent)] transition-colors">{t('nav_become_artisan')}</Link></li>
                <li><Link to="/how-it-works" className="hover:text-[var(--accent)] transition-colors">{t('footer_how_it_works')}</Link></li>
                <li><Link to="/pricing" className="hover:text-[var(--accent)] transition-colors">{t('nav_pricing')}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-40 text-[var(--text)]">{t('footer_company')}</h5>
              <ul className="space-y-4 text-sm text-[var(--text-muted)]">
                <li><Link to="/about" className="hover:text-[var(--accent)] transition-colors">{t('footer_about')}</Link></li>
                <li><Link to="/careers" className="hover:text-[var(--accent)] transition-colors">{t('footer_careers')}</Link></li>
                <li><Link to="/contact" className="hover:text-[var(--accent)] transition-colors">{t('footer_contact')}</Link></li>
                <li><Link to="/blog" className="hover:text-[var(--accent)] transition-colors">{t('footer_blog')}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-40 text-[var(--text)]">{t('footer_legal')}</h5>
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

export function PhoneDashboard() {
  const { t } = useTranslation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/phone-auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/phone-auth');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <div className="fixed left-0 top-0 h-full w-20 bg-[var(--sidebar-bg)] border-r border-[var(--border)] hidden md:flex flex-col items-center py-8 gap-8 z-50">
        <div className="w-12 h-12 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
          <ShieldCheck size={24} />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--text)]/5 transition-colors"
            title="Back to Home"
          >
            <Home size={20} />
          </button>
          <button className="p-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]"><LayoutDashboard size={20} /></button>
          <button className="p-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--text)]/5 transition-colors"><Bell size={20} /></button>
          <button className="p-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--text)]/5 transition-colors"><Settings size={20} /></button>
        </div>
        <button 
          onClick={handleLogout}
          className="p-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="md:ml-20 p-6 md:p-12 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center justify-between md:block">
            <div>
              <p className="micro-label mb-2">{t('dashboard_welcome', 'Welcome Back')}</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t('dashboard_user_title', 'User ')} <span className="text-[var(--accent)]">{t('dashboard_title_2', 'Dashboard')}</span></h1>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="md:hidden p-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--accent)] shadow-lg active:scale-95 transition-all"
              title="Back to Home"
            >
              <Home size={24} />
            </button>
          </div>
          <div className="flex items-center gap-4 bg-[var(--card-bg)] p-2 rounded-full border border-[var(--border)] pr-6">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <UserIcon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{t('dashboard_auth_as', 'Authenticated as')}</p>
              <p className="font-bold">{user?.email || user?.phoneNumber}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-luxury p-8 space-y-8"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] p-1 mb-6">
                  <div className="w-full h-full rounded-full bg-[var(--card-bg)] flex items-center justify-center">
                    <UserIcon size={40} className="text-[var(--accent)]" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{user?.displayName || user?.email || user?.phoneNumber}</h3>
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  Verified Account
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">UID</span>
                  <span className="text-xs font-mono bg-[var(--text)]/5 px-2 py-1 rounded">{user?.uid.substring(0, 12)}...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Provider</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                    {user?.providerData[0]?.providerId === 'password' ? 'Email/Password' : 'Phone OTP'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Last Login</span>
                  <span className="text-xs font-bold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full py-4 rounded-2xl border border-rose-500/20 text-rose-500 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </motion.div>
          </div>

          {/* Stats & Activity */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-luxury p-6 flex items-center gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Calendar size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('dashboard_lbl_active', 'Active Bookings')}</p>
                  <h4 className="text-3xl font-bold">12</h4>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-luxury p-6 flex items-center gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Star size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Avg. Rating</p>
                  <h4 className="text-3xl font-bold">4.9</h4>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-luxury p-8"
            >
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Phone size={20} className="text-[var(--accent)]" />
                Security Logs
              </h3>
              <div className="space-y-6">
                {[
                  { event: 'OTP Verification Success', time: 'Just now', status: 'success' },
                  { event: 'New Login Session', time: '2 minutes ago', status: 'info' },
                  { event: 'Phone Number Linked', time: '5 minutes ago', status: 'success' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      <div>
                        <p className="font-bold text-sm">{log.event}</p>
                        <p className="text-xs text-[var(--text-muted)]">{log.time}</p>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      Verified
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Pricing() {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const commissionPercent = (parseFloat(settings.commission_standard) * 100).toFixed(0);

  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text)] uppercase"
          >
            {t('pricing_title_part1')} <span className="text-[var(--accent)]">{t('pricing_title_part2')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            {t('pricing_desc')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
          {/* For Homeowners */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--card-bg)] border border-[var(--border)] p-12 rounded-[48px] relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 end-0 w-32 h-32 bg-[var(--accent)]/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 rtl:-translate-x-1/2" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl flex items-center justify-center mb-8">
                <Users size={32} />
              </div>
              <h3 className="text-4xl font-bold mb-4 text-[var(--text)]">{t('pricing_homeowners_title')}</h3>
              <p className="text-[var(--text-muted)] mb-8 text-lg">{t('pricing_homeowners_desc')}</p>
              
              <div className="text-5xl font-bold mb-12 text-[var(--text)]">
                {t('pricing_free')} <span className="text-lg font-normal text-[var(--text-muted)]">/ {t('pricing_per_booking')}</span>
              </div>

              <ul className="space-y-6 mb-12">
                {[
                  t('pricing_ho_feature_1'),
                  t('pricing_ho_feature_2'),
                  t('pricing_ho_feature_3'),
                  t('pricing_ho_feature_4'),
                  t('pricing_ho_feature_5'),
                  t('pricing_ho_feature_6')
                ]?.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg text-[var(--text)]">
                    <CheckCircle className="text-[var(--accent)] shrink-0" size={24} />
                    {item}
                  </li>
                ))}
              </ul>

              <button className="w-full bg-[var(--text)] text-[var(--bg)] py-5 rounded-2xl font-bold text-xl hover:opacity-90 transition-all active:scale-95">
                {t('pricing_ho_btn')}
              </button>
            </div>
          </motion.div>

          {/* For Artisans */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--accent)] p-12 rounded-[48px] relative overflow-hidden group text-[var(--accent-foreground)] shadow-2xl"
          >
            <div className="absolute top-0 end-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 rtl:-translate-x-1/2" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-black/10 text-black rounded-2xl flex items-center justify-center mb-8">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-4xl font-bold mb-4">{t('pricing_artisans_title')}</h3>
              <p className="text-black/60 mb-8 text-lg">{t('pricing_artisans_desc')}</p>
              
              <div className="text-5xl font-bold mb-12">
                {commissionPercent}% <span className="text-lg font-normal text-black/40">/ {t('pricing_commission')}</span>
              </div>

              <ul className="space-y-6 mb-12">
                {[
                  t('pricing_ar_feature_1'),
                  t('pricing_ar_feature_2'),
                  t('pricing_ar_feature_3'),
                  t('pricing_ar_feature_4'),
                  t('pricing_ar_feature_5'),
                  t('pricing_ar_feature_6')
                ]?.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg">
                    <CheckCircle className="text-black shrink-0" size={24} />
                    {item}
                  </li>
                ))}
              </ul>

              <button className="w-full bg-black text-white py-5 rounded-2xl font-bold text-xl hover:bg-black/90 transition-all active:scale-95">
                {t('pricing_ar_btn')}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Trust Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: t('pricing_trust_1_title'), desc: t('pricing_trust_1_desc'), icon: <Zap /> },
            { title: t('pricing_trust_2_title'), desc: t('pricing_trust_2_desc'), icon: <ShieldCheck /> },
            { title: t('pricing_trust_3_title'), desc: t('pricing_trust_3_desc'), icon: <CheckCircle /> }
          ]?.map((item, i) => (
            <div key={i} className="text-center space-y-6">
              <div className="w-16 h-16 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl flex items-center justify-center mx-auto text-[var(--accent)] shadow-xl">
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              <h4 className="text-2xl font-bold text-[var(--text)]">{item.title}</h4>
              <p className="text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}