import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-7xl mx-auto bg-[var(--bg)] text-[var(--text)]">
        <div className="mb-12 md:mb-20">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-[var(--text)]">
            Premium <br />
            <span className="text-[var(--accent)] italic font-serif">Artisans.</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg md:text-2xl max-w-2xl font-light">
            Connect with certified professionals for your home improvement needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-3xl p-8 hover:bg-[var(--card-bg)] transition-colors shadow-xl">
            <ShieldCheck size={32} className="text-[var(--accent)] mb-6" />
            <h3 className="text-xl font-bold mb-2 text-[var(--text)]">Verified Experts</h3>
            <p className="text-[var(--text-muted)] text-sm">Every artisan is thoroughly vetted for quality and reliability.</p>
          </div>
          <div className="bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-3xl p-8 hover:bg-[var(--card-bg)] transition-colors shadow-xl">
            <Zap size={32} className="text-[var(--accent)] mb-6" />
            <h3 className="text-xl font-bold mb-2 text-[var(--text)]">Instant Booking</h3>
            <p className="text-[var(--text-muted)] text-sm">Schedule services immediately with real-time availability.</p>
          </div>
          <div className="bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-3xl p-8 hover:bg-[var(--card-bg)] transition-colors shadow-xl">
            <Star size={32} className="text-[var(--accent)] mb-6" />
            <h3 className="text-xl font-bold mb-2 text-[var(--text)]">Premium Quality</h3>
            <p className="text-[var(--text-muted)] text-sm">Experience top-tier craftsmanship and exceptional service.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/find-pro" className="bg-[var(--accent)] text-[var(--accent-foreground)] px-10 py-5 rounded-full font-bold text-lg hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-3 shadow-2xl shadow-[var(--accent)]/20">
            Find an Artisan <ArrowRight size={20} />
          </Link>
          <Link to="/auto-devis" className="bg-[var(--card-bg)]/50 border border-[var(--border)] text-[var(--text)] px-10 py-5 rounded-full font-bold text-lg hover:bg-[var(--card-bg)] transition-colors flex items-center justify-center gap-3">
            <Sparkles size={20} className="text-[var(--accent)]" /> Get AI Quote
          </Link>
        </div>
      </div>
    </Layout>
  );
}
