import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Wallet,
  Banknote,
  ShieldCheck,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaymentModalProps {
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
  onAction: (msg: string) => void;
}

type PayMethod = 'wallet' | 'cash';

export default function PaymentModal({ booking, onClose, onSuccess, onAction }: PaymentModalProps) {
  const { t } = useTranslation();
  const [method, setMethod] = useState<PayMethod>('wallet');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'success'>('select');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const bookingPrice = Number(booking?.price ?? 0);
  const token = localStorage.getItem('m3allem_token');

  // Load wallet balance so user can see if they have enough
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch('/api/wallet/balance', {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          setWalletBalance(Number(data.balance ?? 0));
        }
      } catch {
        setWalletBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    };
    fetchBalance();
  }, [token]);

  const insufficientBalance = method === 'wallet' && walletBalance !== null && walletBalance < bookingPrice;

  const handlePayment = async () => {
    if (insufficientBalance) {
      setErrorMsg(t('payment.insufficientBalance', 'Insufficient wallet balance'));
      return;
    }

    setProcessing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/wallet/pay-order', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bookingId: booking.id, method }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep('success');
        setTimeout(() => onSuccess(), 2000);
      } else {
        setErrorMsg(data.error || t('payment.failed', 'Payment failed. Please try again.'));
      }
    } catch {
      setErrorMsg(t('payment.networkError', 'Network error. Please try again.'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[var(--bg)]/80 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] shadow-2xl overflow-hidden"
        >
          {step === 'select' && (
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold tracking-tight">
                  {t('payment.title', 'Secure')}{' '}
                  <span className="text-[var(--accent)]">{t('payment.titleAccent', 'Payment')}</span>
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[var(--border)]/20 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Order summary */}
              <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-3xl p-6 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--text-muted)] text-sm">{t('payment.service', 'Service')}</span>
                  <span className="font-bold text-[var(--text)]">{booking.service_name}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[var(--text-muted)] text-sm">{t('payment.artisan', 'Artisan')}</span>
                  <span className="font-bold text-[var(--text)]">{booking.other_party_name}</span>
                </div>
                <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
                  <span className="font-bold">{t('payment.total', 'Total')}</span>
                  <span className="text-2xl font-bold text-[var(--accent)]">
                    {bookingPrice.toFixed(2)} MAD
                  </span>
                </div>
              </div>

              {/* Payment methods — only wallet & cash */}
              <div className="space-y-4 mb-6">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">
                  {t('payment.selectMethod', 'Select Payment Method')}
                </label>

                {/* Wallet */}
                <button
                  onClick={() => setMethod('wallet')}
                  className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    method === 'wallet'
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                      : 'border-[var(--border)] hover:border-[var(--accent)]/30'
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl flex-shrink-0 ${
                      method === 'wallet' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card-bg)] text-[var(--text-muted)]'
                    }`}
                  >
                    <Wallet size={22} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold">{t('payment.walletLabel', 'M3allem Wallet (Solde)')}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {loadingBalance
                        ? t('payment.loadingBalance', 'Loading balance…')
                        : walletBalance !== null
                        ? `${t('payment.available', 'Available')}: ${walletBalance.toFixed(2)} MAD`
                        : t('payment.walletSub', 'Pay instantly from your account balance')}
                    </p>
                  </div>
                  {!loadingBalance && walletBalance !== null && walletBalance < bookingPrice && (
                    <span className="text-xs font-semibold text-red-500 flex-shrink-0">
                      {t('payment.low', 'Low')}
                    </span>
                  )}
                </button>

                {/* Cash */}
                <button
                  onClick={() => setMethod('cash')}
                  className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    method === 'cash'
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                      : 'border-[var(--border)] hover:border-[var(--accent)]/30'
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl flex-shrink-0 ${
                      method === 'cash' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card-bg)] text-[var(--text-muted)]'
                    }`}
                  >
                    <Banknote size={22} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{t('payment.cashLabel', 'Cash on Completion')}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {t('payment.cashSub', 'Pay the artisan directly after service is done')}
                    </p>
                  </div>
                </button>
              </div>

              {/* Cash info banner */}
              {method === 'cash' && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex gap-3 items-start">
                  <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {t(
                      'payment.cashNote',
                      'The artisan will confirm cash receipt after completing the job. The booking will then be marked as paid.'
                    )}
                  </p>
                </div>
              )}

              {/* Error message */}
              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex gap-3 items-start">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
                </div>
              )}

              {/* Confirm button */}
              <button
                onClick={handlePayment}
                disabled={processing || insufficientBalance}
                className="w-full py-5 bg-[var(--accent)] text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-[var(--accent)]/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <>
                    {method === 'cash'
                      ? t('payment.confirmCash', 'Confirm Cash Payment')
                      : t('payment.confirmWallet', 'Pay from Wallet')}
                    <ChevronRight size={20} />
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-[var(--text-muted)] text-xs">
                <ShieldCheck size={14} className="text-green-500" />
                {t('payment.secured', 'Secured by M3allem Pay™')}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-3xl font-bold mb-4">
                {method === 'cash'
                  ? t('payment.cashBooked', 'Booking Confirmed!')
                  : t('payment.successTitle', 'Payment Successful!')}
              </h3>
              <p className="text-[var(--text-muted)] mb-8">
                {method === 'cash'
                  ? t('payment.cashConfirmNote', 'Your booking is confirmed. Pay the artisan cash after the service.')
                  : t('payment.successNote', 'Your booking is confirmed. The artisan has been notified.')}
              </p>
              <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                  className="h-full bg-green-500"
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
