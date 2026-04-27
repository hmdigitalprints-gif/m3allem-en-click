import React from 'react';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../components/layout/PublicLayout';
import { motion } from 'framer-motion';


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
