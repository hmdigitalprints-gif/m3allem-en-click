import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  TrendingUp, 
  Wallet,
  Clock,
  Smartphone,
  Hammer
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

import { useTranslation } from 'react-i18next';

export default function BecomeArtisan() {
  const { t } = useTranslation();
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-full text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-8">
              <TrendingUp size={14} />
              {t('become_ar_badge')}
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-[0.9] mb-8 text-[var(--text)] uppercase">
              {t('become_ar_title_1')} <br />
              <span className="text-[var(--accent)]">{t('become_ar_title_2')}</span>
            </h1>
            <p className="text-xl text-[var(--text-muted)] max-w-lg mb-12 leading-relaxed">
              {t('become_ar_desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="bg-[var(--accent)] text-[var(--accent-foreground)] px-10 py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 hover:bg-[var(--accent)]/90 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/20"
              >
                {t('become_ar_btn_apply')}
                <ArrowRight size={20} className="rtl:rotate-180" />
              </button>
              <Link 
                to="/how-it-works"
                className="bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] px-10 py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-[var(--text)]"
              >
                {t('become_ar_btn_how')}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-gradient-to-br from-white/10 to-transparent p-4 rounded-[48px] border border-[var(--border)] backdrop-blur-3xl">
              <img 
                src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800" 
                className="rounded-[40px] shadow-2xl"
                alt="Professional artisan"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Floating Stats */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -end-8 z-20 bg-[var(--card-bg)] p-6 rounded-3xl shadow-2xl text-[var(--text)] max-w-[200px] border border-[var(--border)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100/10 text-emerald-500 rounded-xl flex items-center justify-center">
                  <Wallet size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">{t('become_ar_stat_earnings_label')}</span>
              </div>
              <p className="text-sm font-bold leading-tight">{t('become_ar_stat_earnings_val')}</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { 
              title: t('become_ar_ben_1_title'), 
              desc: t('become_ar_ben_1_desc'), 
              icon: <Users /> 
            },
            { 
              title: t('become_ar_ben_2_title'), 
              desc: t('become_ar_ben_2_desc'), 
              icon: <Clock /> 
            },
            { 
              title: t('become_ar_ben_3_title'), 
              desc: t('become_ar_ben_3_desc'), 
              icon: <ShieldCheck /> 
            },
            { 
              title: t('become_ar_ben_4_title'), 
              desc: t('become_ar_ben_4_desc'), 
              icon: <Star /> 
            },
            { 
              title: t('become_ar_ben_5_title'), 
              desc: t('become_ar_ben_5_desc'), 
              icon: <Smartphone /> 
            },
            { 
              title: t('become_ar_ben_6_title'), 
              desc: t('become_ar_ben_6_desc'), 
              icon: <TrendingUp /> 
            }
          ]?.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] p-10 rounded-[40px] hover:bg-[var(--bg)] transition-all shadow-xl"
            >
              <div className="w-16 h-16 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center mb-8">
                {React.cloneElement(benefit.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">{benefit.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {benefit.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Steps Section */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[64px] p-12 md:p-24 mb-32 shadow-2xl">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16 text-center text-[var(--text)]">{t('become_ar_join_title')} <span className="text-[var(--accent)]">{t('become_ar_join_accent')}</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-12 inset-x-0 h-px bg-[var(--border)] z-0" />
            
            {[
              { step: '01', title: t('become_ar_step_1_title'), desc: t('become_ar_step_1_desc') },
              { step: '02', title: t('become_ar_step_2_title'), desc: t('become_ar_step_2_desc') },
              { step: '03', title: t('become_ar_step_3_title'), desc: t('become_ar_step_3_desc') }
            ]?.map((item, i) => (
              <div key={i} className="relative z-10 text-center">
                <div className="w-24 h-24 bg-[var(--bg)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-bold text-[var(--accent)] shadow-xl">
                  {item.step}
                </div>
                <h4 className="text-2xl font-bold mb-4 text-[var(--text)]">{item.title}</h4>
                <p className="text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12 text-center text-[var(--text)]">{t('become_ar_faq_title')} <span className="text-[var(--accent)]">{t('become_ar_faq_accent')}</span></h2>
          <div className="space-y-6">
            {[
              { q: t('become_ar_faq_1_q'), a: t('become_ar_faq_1_a') },
              { q: t('become_ar_faq_2_q'), a: t('become_ar_faq_2_a') },
              { q: t('become_ar_faq_3_q'), a: t('become_ar_faq_3_a') },
              { q: t('become_ar_faq_4_q'), a: t('become_ar_faq_4_a') }
            ]?.map((faq, i) => (
              <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] p-8 rounded-3xl shadow-xl">
                <h4 className="text-lg font-bold mb-3 text-[var(--text)]">{faq.q}</h4>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}
