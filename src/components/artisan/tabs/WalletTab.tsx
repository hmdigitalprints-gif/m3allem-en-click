import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Wallet, 
  Banknote, 
  ArrowUpRight, 
  ArrowDownLeft 
} from 'lucide-react';

interface WalletTabProps {
  stats: any;
  transactions: any[];
  setShowWithdrawModal: (show: boolean) => void;
}

export function WalletTab({
  stats,
  transactions,
  setShowWithdrawModal
}: WalletTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-10">
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-12 flex flex-col items-center justify-center text-center glass relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[var(--accent)]/5 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl" />
        
        <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] text-white rounded-[24px] flex items-center justify-center mb-6 shadow-2xl shadow-[var(--accent)]/30 transform -rotate-6">
          <Wallet size={40} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2 opacity-60">{t('total_available_balance', 'Total Available Balance')}</p>
        <div className="text-7xl font-black text-[var(--text)] mb-8 tracking-tighter flex items-baseline gap-3">
          {Number(stats.earnings).toFixed(2)} 
          <span className="text-2xl font-bold text-[var(--accent)] uppercase tracking-widest">MAD</span>
        </div>
        
        {stats.earnings < 50 ? (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 max-w-md">
             <p className="text-orange-500 font-bold text-sm">
               {t('min_withdrawal_desc', 'You need a minimum balance of 50.00 MAD to withdraw funds. Complete more jobs to reach the withdrawal threshold.')}
             </p>
          </div>
        ) : (
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="px-10 py-5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30 flex items-center gap-3"
          >
            <Banknote size={20} />
            {t('withdraw_funds', 'Withdraw Funds')}
          </button>
        )}
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-10 glass text-left">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('transaction_history')}</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[var(--text)]/5 rounded-xl text-xs font-bold hover:bg-[var(--text)]/10 transition-colors">{t('income')}</button>
            <button className="px-4 py-2 bg-[var(--text)]/5 rounded-xl text-xs font-bold hover:bg-[var(--text)]/10 transition-colors">{t('withdrawals')}</button>
          </div>
        </div>
        <div className="space-y-6">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center opacity-60 mx-auto">
              <div className="w-64 h-64 mb-8 relative mx-auto">
                <img src="/input_file_6.png" alt={t('no_transactions')} className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
              </div>
              <h4 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4">{t('no_transactions')}</h4>
              <p className="text-[var(--text-muted)] font-medium max-w-md text-center mx-auto">{t('no_transactions_desc', 'Your earnings and withdrawals will appear here once you start completing jobs.')}</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <motion.div 
                key={tx.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-6 bg-[var(--text)]/5 rounded-3xl border border-[var(--border)] hover:bg-[var(--text)]/10 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-500 shadow-red-500/10' : 'bg-[var(--success)]/10 text-[var(--success)] shadow-[var(--success)]/10'}`}>
                    {tx.type === 'withdrawal' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                  </div>
                  <div>
                    <p className="font-black text-lg text-[var(--text)] tracking-tight">{tx.description}</p>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black tracking-tight ${tx.type === 'withdrawal' ? 'text-red-500' : 'text-[var(--success)]'}`}>
                    {tx.type === 'withdrawal' ? '-' : '+'}{Number(tx.amount).toFixed(2)} <span className="text-xs font-bold ml-1">MAD</span>
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mt-2 ${tx.status === 'completed' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    {tx.status}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
