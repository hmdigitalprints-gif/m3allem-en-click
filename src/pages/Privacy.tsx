import React from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '../components/layout/PublicLayout';
import { useTranslation } from 'react-i18next';

export default function Privacy() {
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
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('privacy_sec1_title')}</h2>
            <p>
              {t('privacy_sec1_desc')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('privacy_sec2_title')}</h2>
            <p>
              {t('privacy_sec2_desc')}
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>{t('privacy_sec2_item1')}</li>
              <li>{t('privacy_sec2_item2')}</li>
              <li>{t('privacy_sec2_item3')}</li>
              <li>{t('privacy_sec2_item4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('privacy_sec3_title')}</h2>
            <p>
              {t('privacy_sec3_desc')}
            </p>
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>{t('privacy_sec3_item1')}</li>
              <li>{t('privacy_sec3_item2')}</li>
              <li>{t('privacy_sec3_item3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('privacy_sec4_title')}</h2>
            <p>
              {t('privacy_sec4_desc')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('privacy_sec5_title')}</h2>
            <p>
              {t('privacy_sec5_desc')}
            </p>
          </section>
        </div>

        <div className="mt-20 pt-12 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">
          {t('privacy_last_updated')}
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}
