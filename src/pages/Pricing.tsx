import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Zap, ShieldCheck, Users, TrendingUp } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';

export default function Pricing() {
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
