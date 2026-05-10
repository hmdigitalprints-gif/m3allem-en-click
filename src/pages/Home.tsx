import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Star, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t, i18n } = useTranslation();

  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-7xl mx-auto bg-[var(--bg)] text-[var(--text)]">
        <div className="mb-12 md:mb-20">
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-6 text-[var(--text)]">
            {t('home_new_title_1')} <br />
            <span className="text-[var(--accent)]">{t('home_new_title_2')}</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg md:text-2xl max-w-2xl font-light">
            {t('home_new_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-3xl p-8 hover:bg-[var(--card-bg)] transition-colors shadow-xl">
            <ShieldCheck size={32} className="text-[var(--accent)] mb-6" />
            <h3 className="text-xl font-bold mb-2 text-[var(--text)]">{t('home_new_feat1_title')}</h3>
            <p className="text-[var(--text-muted)] text-sm">{t('home_new_feat1_desc')}</p>
          </div>
          <div className="bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-3xl p-8 hover:bg-[var(--card-bg)] transition-colors shadow-xl">
            <Zap size={32} className="text-[var(--accent)] mb-6" />
            <h3 className="text-xl font-bold mb-2 text-[var(--text)]">{t('home_new_feat2_title')}</h3>
            <p className="text-[var(--text-muted)] text-sm">{t('home_new_feat2_desc')}</p>
          </div>
          <div className="bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-3xl p-8 hover:bg-[var(--card-bg)] transition-colors shadow-xl">
            <Star size={32} className="text-[var(--accent)] mb-6" />
            <h3 className="text-xl font-bold mb-2 text-[var(--text)]">{t('home_new_feat3_title')}</h3>
            <p className="text-[var(--text-muted)] text-sm">{t('home_new_feat3_desc')}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/find-pro" className="bg-[var(--accent)] text-[var(--accent-foreground)] px-10 py-5 rounded-full font-bold text-lg hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-3 shadow-2xl shadow-[var(--accent)]/20">
            {t('home_new_btn_find')} {i18n.dir() === 'rtl' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
          </Link>
          <Link to="/auto-devis" className="bg-[var(--card-bg)]/50 border border-[var(--border)] text-[var(--text)] px-10 py-5 rounded-full font-bold text-lg hover:bg-[var(--card-bg)] transition-colors flex items-center justify-center gap-3">
            <Sparkles size={20} className="text-[var(--accent)]" /> {t('home_new_btn_quote')}
          </Link>
        </div>
      </div>
    </Layout>
  );
}
