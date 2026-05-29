import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  Zap, 
  Paintbrush, 
  Sparkles, 
  Wind, 
  HardHat, 
  Hammer,
  ArrowRight,
  ShieldCheck,
  Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../components/layout/PublicLayout';
import { SymmetricalIcon } from '../components/common/SymmetricalIcon';

const categories = [
  { 
    id: 'cat_plumbing', 
    name: 'Plumbing', 
    icon: <Droplets />, 
    color: 'bg-blue-500/10 text-blue-400'
  },
  { 
    id: 'cat_electricity', 
    name: 'Electricity', 
    icon: <Zap />, 
    color: 'bg-yellow-500/10 text-yellow-400'
  },
  { 
    id: 'cat_painting', 
    name: 'Painting', 
    icon: <Paintbrush />, 
    color: 'bg-purple-500/10 text-purple-400'
  },
  { 
    id: 'cat_cleaning', 
    name: 'Cleaning', 
    icon: <Sparkles />, 
    color: 'bg-emerald-500/10 text-emerald-400'
  },
  { 
    id: 'cat_hvac', 
    name: 'AC Repair', 
    icon: <Wind />, 
    color: 'bg-amber-500/10 text-amber-400'
  }
];

export default function Services() {
  const { t } = useTranslation();
  
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-full text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-8"
          >
            <ShieldCheck size={14} />
            {t('services_verified_pros')}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-display font-black tracking-tighter mb-8 text-[var(--text)] uppercase"
          >
            {t('services_title')} <span className="text-[var(--accent)]">{t('services_title_accent')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            {t('services_desc')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories?.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -10 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] p-10 rounded-[48px] hover:bg-[var(--bg)] transition-all group shadow-xl"
            >
              <div className={`w-20 h-20 bg-[var(--accent)]/10 text-[var(--accent)] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 40 })}
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <h3 className="text-3xl font-bold text-[var(--text)]">{cat.name}</h3>
                <span className="text-[var(--accent)] text-xs font-bold bg-[var(--accent)]/10 px-3 py-1 rounded-full w-fit">
                  {t('services_pros_available_count', { count: 300 + (i * 50) })}
                </span>
              </div>
              <p className="text-[var(--text-muted)] mt-4 mb-8 leading-relaxed">
                {t(`${cat.id}_desc`)}
              </p>
              <Link 
                to={`/find-pro?category=${cat.name}`}
                className="flex items-center justify-between w-full bg-[var(--bg)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] p-6 rounded-2xl font-bold transition-all group/btn border border-[var(--border)]"
              >
                <span>{t('services_explore')}</span>
                <SymmetricalIcon icon={ArrowRight} size={20} className="group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 rounded-[64px] p-12 md:p-24 text-[var(--accent-foreground)] text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 end-0 w-64 h-64 bg-white/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 rtl:-translate-x-1/2" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">{t('services_cta_title')}</h2>
            <p className="text-xl font-medium mb-12 opacity-80">
              {t('services_cta_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/find-pro"
                className="bg-[var(--bg)] text-[var(--text)] px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-transform active:scale-95 shadow-2xl border border-[var(--border)]"
              >
                {t('services_cta_btn')}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </PublicLayout>
  );
}
