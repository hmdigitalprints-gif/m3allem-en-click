import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Zap, ShieldCheck, Users, TrendingUp } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import { useSettings } from '../context/SettingsContext';

export default function Pricing() {
  const { settings } = useSettings();
  const commissionPercent = (parseFloat(settings.commission_standard) * 100).toFixed(0);

  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text)]"
          >
            SIMPLE <span className="text-[var(--accent)]">PRICING.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            Transparent pricing for both homeowners and artisans. No hidden fees, no surprises.
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl flex items-center justify-center mb-8">
                <Users size={32} />
              </div>
              <h3 className="text-4xl font-bold mb-4 text-[var(--text)]">For Homeowners</h3>
              <p className="text-[var(--text-muted)] mb-8 text-lg">Find and book the best artisans for your home projects.</p>
              
              <div className="text-5xl font-bold mb-12 text-[var(--text)]">
                Free <span className="text-lg font-normal text-[var(--text-muted)]">/ per booking</span>
              </div>

              <ul className="space-y-6 mb-12">
                {[
                  'Access to 2,500+ verified artisans',
                  'Secure escrow payments',
                  '24/7 customer support',
                  'Detailed artisan profiles & reviews',
                  'Instant booking & scheduling',
                  'Materials marketplace access'
                ]?.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg text-[var(--text)]">
                    <CheckCircle className="text-[var(--accent)] shrink-0" size={24} />
                    {item}
                  </li>
                ))}
              </ul>

              <button className="w-full bg-[var(--text)] text-[var(--bg)] py-5 rounded-2xl font-bold text-xl hover:opacity-90 transition-all active:scale-95">
                Start Finding Pros
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-black/10 text-black rounded-2xl flex items-center justify-center mb-8">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-4xl font-bold mb-4">For Artisans</h3>
              <p className="text-black/60 mb-8 text-lg">Grow your business and reach more clients in your city.</p>
              
              <div className="text-5xl font-bold mb-12">
                {commissionPercent}% <span className="text-lg font-normal text-black/40">/ commission per job</span>
              </div>

              <ul className="space-y-6 mb-12">
                {[
                  'Professional business profile',
                  'Unlimited booking requests',
                  'Integrated chat & scheduling',
                  'Verified identity badge',
                  'Automated invoicing & receipts',
                  'Priority support & mediation'
                ]?.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg">
                    <CheckCircle className="text-black shrink-0" size={24} />
                    {item}
                  </li>
                ))}
              </ul>

              <button className="w-full bg-black text-white py-5 rounded-2xl font-bold text-xl hover:bg-black/90 transition-all active:scale-95">
                Join as Artisan
              </button>
            </div>
          </motion.div>
        </div>

        {/* Trust Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: 'No Hidden Fees', desc: 'What you see is what you pay. No subscription fees or surprise charges.', icon: <Zap /> },
            { title: 'Secure Payments', desc: 'We use industry-standard encryption to keep your financial data safe.', icon: <ShieldCheck /> },
            { title: 'Money-Back Guarantee', desc: 'If you\'re not satisfied with the service, we offer mediation and refunds.', icon: <CheckCircle /> }
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
