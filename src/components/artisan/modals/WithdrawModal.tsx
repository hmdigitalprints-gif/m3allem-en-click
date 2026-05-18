import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Banknote, Loader2 } from 'lucide-react';

interface WithdrawModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  withdrawAmount: string;
  setWithdrawAmount: (amount: string) => void;
  earnings: number;
  submitting: boolean;
}

export function WithdrawModal({
  show,
  onClose,
  onSubmit,
  withdrawAmount,
  setWithdrawAmount,
  earnings,
  submitting
}: WithdrawModalProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl relative z-10 glass">
            <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--text)]/5">
              <h3 className="text-xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('fund_withdrawal', 'Fund Withdrawal')}</h3>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-[var(--text)]/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={onSubmit} className="p-10 space-y-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{t('withdrawal_amount', 'Amount to Withdraw')}</label>
                  <span className="text-[10px] font-bold text-[var(--accent)]">{t('max_withdrawal', 'Max: ')} {(Number(earnings) || 0).toFixed(2)} MAD</span>
                </div>
                <div className="relative">
                  <input required value={withdrawAmount} onChange={e => {
                    const val = e.target.value;
                    if (Number(val) <= earnings) setWithdrawAmount(val);
                  }} type="number" step="0.01" max={earnings} className="w-full bg-[var(--text)]/5 border-2 border-[var(--border)] rounded-2xl p-6 pl-12 text-3xl font-black text-[var(--text)] focus:border-[var(--accent)] outline-none transition-all" autoFocus />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-[var(--text-muted)] text-xl">MAD</span>
                </div>
              </div>

              <div className="bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl p-6">
                <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">{t('withdrawal_warning', 'Funds will be transferred to your linked bank account or preferred payment method. Processing typically takes 1-3 business days.')}</p>
              </div>
              
              <div className="flex gap-4">
                <button type="button" onClick={onClose} className="flex-1 py-5 bg-[var(--text)]/5 hover:bg-[var(--text)]/10 text-[var(--text)] rounded-3xl font-black uppercase tracking-widest text-xs transition-all">{t('cancel')}</button>
                <button type="submit" disabled={submitting || !withdrawAmount || Number(withdrawAmount) < 50} className="flex-1 py-5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100">
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Banknote size={18} />}
                  {t('confirm_withdrawal', 'Confirm')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
