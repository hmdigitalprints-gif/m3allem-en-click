import React from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '../components/layout/PublicLayout';
import { useTranslation } from 'react-i18next';

export default function Cookies() {
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
