import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Send, Loader2 } from 'lucide-react';

interface ProposeModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  proposedPrice: string;
  setProposedPrice: (price: string) => void;
  selectedJob: any;
  submitting: boolean;
  aiSuggestion?: { min: number; max: number; recommended: number; reason: string } | null;
  suggesting?: boolean;
}

export function ProposeModal({
  show,
  onClose,
  onSubmit,
  proposedPrice,
  setProposedPrice,
  selectedJob,
  submitting,
  aiSuggestion,
  suggesting
}: ProposeModalProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl relative z-10 glass">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-xl font-bold italic uppercase tracking-tight">{t('submit_proposal', 'Submit Proposal')}</h3>
              <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={onSubmit} className="p-8 space-y-6">
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-4">{t('job_for', 'Job for:')} <span className="text-[var(--text)] font-bold">{selectedJob?.service_name || selectedJob?.title}</span></p>
                
                {suggesting && (
                  <div className="mb-4 p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-2xl flex items-center gap-3 animate-pulse">
                    <Loader2 className="animate-spin text-[var(--accent)]" size={18} />
                    <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest">{t('ai_analyzing', 'AI Analyzing Market Rates...')}</span>
                  </div>
                )}

                {aiSuggestion && !suggesting && (
                  <div className="mb-4 p-4 bg-[var(--accent)]/[0.03] border border-[var(--accent)]/10 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('ai_recommendation', 'AI Smart Price Recommendation')}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[var(--accent)]">{aiSuggestion.recommended} MAD</span>
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">({aiSuggestion.min} - {aiSuggestion.max} range)</span>
                    </div>
                    <p className="text-[10px] font-medium text-[var(--text-muted)] leading-relaxed italic">{aiSuggestion.reason}</p>
                    <button 
                      type="button" 
                      onClick={() => setProposedPrice(aiSuggestion.recommended.toString())}
                      className="w-full mt-2 py-2 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      {t('apply_ai_price', 'Apply Recommended Price')}
                    </button>
                  </div>
                )}

                <label className="text-xs font-bold text-[var(--text-muted)] mb-2 block uppercase">{t('propose_price_amount', 'Your Price Proposal (MAD)')}</label>
                <div className="relative">
                  <input required value={proposedPrice} onChange={e => setProposedPrice(e.target.value)} type="number" step="0.01" className="w-full bg-[var(--text)]/5 border-2 border-[var(--border)] rounded-2xl p-4 pl-12 text-2xl font-black text-[var(--accent)] focus:border-[var(--accent)] outline-none transition-all" autoFocus />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[var(--text-muted)]">MAD</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={onClose} className="flex-1 py-4 bg-[var(--text)]/5 hover:bg-[var(--text)]/10 text-[var(--text)] rounded-2xl font-bold transition-all">{t('cancel')}</button>
                <button type="submit" disabled={submitting || !proposedPrice} className="flex-1 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {t('send_proposal', 'Send')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
