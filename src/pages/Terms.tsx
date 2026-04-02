import React from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '../components/layout/PublicLayout';

export default function Terms() {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-12 text-[var(--text)]"
        >
          TERMS OF <span className="text-[var(--accent)]">SERVICE.</span>
        </motion.h1>
        
        <div className="space-y-12 text-[var(--text-muted)] leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using M3allem En Click, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">2. Use of the Platform</h2>
            <p>
              M3allem En Click provides a marketplace connecting homeowners with professional artisans. We do not provide the services ourselves. We are a platform that facilitates the connection, booking, and payment between the two parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">3. User Responsibilities</h2>
            <p>
              Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account. You must be at least 18 years old to use this platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">4. Payments & Commissions</h2>
            <p>
              Payments are processed through our secure third-party provider. M3allem En Click takes a commission on successful bookings as specified in our pricing page. Artisans agree to receive payments minus the applicable commission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">5. Limitation of Liability</h2>
            <p>
              M3allem En Click shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
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
