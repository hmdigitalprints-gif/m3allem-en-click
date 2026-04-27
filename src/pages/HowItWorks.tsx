import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  ShieldCheck, 
  Wallet, 
  Star, 
  ArrowRight, 
  CheckCircle,
  Smartphone,
  MessageSquare,
  Clock
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import { useTranslation } from 'react-i18next';

export default function HowItWorks() {
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
