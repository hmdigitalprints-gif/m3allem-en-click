import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  MapPin, 
  Clock, 
  Wrench, 
  Sparkles, 
  BrainCircuit, 
  ChevronRight, 
  Info,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Agadir', 'Fes', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan'
];

export default function AutoDevis() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    city: 'Casablanca',
    urgency: 'Normal'
  });
  const [estimate, setEstimate] = useState<any>(null);

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceType || !formData.description) return;

    setLoading(true);
    try {
      const result = await aiService.getAutoEstimate(
        formData.serviceType, 
        formData.description, 
        formData.city, 
        formData.urgency
      );
      setEstimate(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-20">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          {/* Intro */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              {t('auto_devis_badge', 'Powered by Gemini AI')}
            </div>
            <h2 className="text-3xl font-bold leading-tight text-[var(--text)]">{t('auto_devis_title', 'Get an instant price estimate for your project.')}</h2>
            <p className="text-[var(--text-muted)] text-sm">{t('auto_devis_desc', 'Our AI analyzes market data across Morocco to give you the most accurate pricing range.')}</p>
          </div>

          <form onSubmit={handleEstimate} className="space-y-6">
            {/* Service Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">{t('auto_devis_lbl_service', 'Service Category')}</label>
              <div className="relative">
                <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/20" size={18} />
                <input 
                  type="text"
                  placeholder="{t('auto_devis_placeholder_service', 'e.g. Plumbing, Electrical, Painting...')}"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                  className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)]"
                  required
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">{t('auto_devis_lbl_city', 'City')}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/20" size={18} />
                <select 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm appearance-none text-[var(--text)]"
                >
                  {MOROCCAN_CITIES?.map(city => (
                    <option key={city} value={city} className="bg-[var(--card-bg)]">{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">{t('auto_devis_lbl_urgency', 'Urgency')}</label>
              <div className="grid grid-cols-3 gap-3">
                {['Normal', 'Urgent', 'Emergency']?.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({...formData, urgency: level})}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.urgency === level 
                      ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' 
                      : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--accent)]/20'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">Problem Description</label>
              <textarea 
                placeholder="Describe what needs to be fixed or built..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm h-32 resize-none text-[var(--text)]"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading || !formData.serviceType || !formData.description}
              className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold text-lg hover:bg-[var(--accent)]/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--accent-foreground)]/30 border-t-[var(--accent-foreground)] rounded-full animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator size={20} />
                  Get Instant Quote
                </>
              )}
            </button>
          </form>

          {/* Results */}
          <AnimatePresence>
            {estimate && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 space-y-6 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BrainCircuit size={120} className="text-[var(--text)]" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.2em]">Estimated Price Range</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-5xl font-bold tracking-tighter text-[var(--text)]">{estimate.min} - {estimate.max}</h3>
                      <span className="text-xl font-bold text-[var(--text-muted)]">{t('currency_mad', 'MAD')}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--accent)]/10 rounded-2xl border border-[var(--accent)]/20 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--accent)] uppercase">Suggested Price</p>
                      <p className="text-2xl font-bold text-[var(--text)]">{estimate.suggested} {t('currency_mad', 'MAD')}</p>
                    </div>
                    <div className="w-12 h-12 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full flex items-center justify-center">
                      <CheckCircle2 size={24} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Key Pricing Factors</p>
                    <div className="space-y-2">
                      {estimate.factors?.map((factor: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                          <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[var(--border)] flex items-start gap-3 text-[var(--text-muted)] text-xs italic">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    This is an AI-generated estimate based on market averages. Final price may vary after artisan inspection.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to={`/search?q=${formData.serviceType}`}
                    className="bg-[var(--card-bg)] border border-[var(--border)] py-4 rounded-2xl font-bold text-center hover:bg-[var(--bg)] transition-all text-[var(--text)]"
                  >
                    Find Artisans
                  </Link>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold text-center hover:bg-[var(--accent)]/90 transition-all"
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
