import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Upload, Plus, Loader2 } from 'lucide-react';

interface AddPortfolioModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  newPortfolio: { title: string; description: string; imageUrls: string[]; videoUrl: string };
  setNewPortfolio: (portfolio: any) => void;
  submitting: boolean;
}

export function AddPortfolioModal({
  show,
  onClose,
  onSubmit,
  newPortfolio,
  setNewPortfolio,
  submitting
}: AddPortfolioModalProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 glass">
            <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--text)]/5">
              <h3 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('portfolio_add_project', 'Showcase New Project')}</h3>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-[var(--text)]/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={onSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 block">{t('portfolio_title', 'Project Title')}</label>
                  <input required value={newPortfolio.title} onChange={e => setNewPortfolio({...newPortfolio, title: e.target.value})} type="text" className="w-full bg-[var(--text)]/5 border-2 border-[var(--border)] rounded-2xl p-4 text-[var(--text)] font-bold focus:border-[var(--accent)] outline-none transition-all" placeholder="e.g. Modern Bathroom Renovation" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 block">{t('portfolio_description', 'Detailed Description')}</label>
                  <textarea required value={newPortfolio.description} onChange={e => setNewPortfolio({...newPortfolio, description: e.target.value})} className="w-full bg-[var(--text)]/5 border-2 border-[var(--border)] rounded-2xl p-4 text-[var(--text)] font-semibold focus:border-[var(--accent)] outline-none transition-all h-32" placeholder="Describe the challenges, materials used, and the final result..." />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 block">{t('portfolio_image', 'Project Visual (URL)')}</label>
                  <div className="relative">
                    <input required value={newPortfolio.imageUrls[0] || ''} onChange={e => setNewPortfolio({...newPortfolio, imageUrls: [e.target.value]})} type="url" className="w-full bg-[var(--text)]/5 border-2 border-[var(--border)] rounded-2xl p-4 pl-12 text-[var(--text)] font-bold focus:border-[var(--accent)] outline-none transition-all" placeholder="https://images.unsplash.com/..." />
                    <Upload size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-5 bg-[var(--text)]/5 hover:bg-[var(--text)]/10 text-[var(--text)] rounded-3xl font-black uppercase tracking-widest text-xs transition-all">{t('cancel')}</button>
                <button type="submit" disabled={submitting} className="flex-[2] py-5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  {t('portfolio_publish', 'Publish Project')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
