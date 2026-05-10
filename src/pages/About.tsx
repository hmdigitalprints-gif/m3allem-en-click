import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Users, Star, TrendingUp, Heart } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import { useTranslation } from 'react-i18next';

export default function About() {
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
