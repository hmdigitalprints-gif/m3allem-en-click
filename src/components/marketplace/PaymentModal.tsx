import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  CreditCard, 
  Wallet, 
  Banknote, 
  ShieldCheck, 
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { walletService } from '../../services/marketplaceService';

interface PaymentModalProps {
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
  onAction: (msg: string) => void;
}

export default function PaymentModal({ booking, onClose, onSuccess, onAction }: PaymentModalProps) {
  const [method, setMethod] = useState<'card' | 'wallet' | 'cash'>('card');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');

  const handlePayment = async () => {
    setProcessing(true);
    try {
      if (method === 'wallet') {
        await walletService.payOrder(booking.id, booking.price);
      }
      
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch(`/api/bookings/${booking.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ method })
      });
      
      if (res.ok) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        const err = await res.json();
        onAction('Payment failed: ' + (err.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      onAction('Payment error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
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
        {step !== 'success' && (
          <div className="p-8 md:p-12">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold tracking-tight">Secure <span className="text-[var(--accent)]">Payment</span></h3>
              <button onClick={onClose} className="p-2 hover:bg-[var(--card-bg)]/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-3xl p-6 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[var(--text-muted)] text-sm">Service</span>
                <span className="font-bold text-[var(--text)]">{booking.service_name}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[var(--text-muted)] text-sm">Artisan</span>
                <span className="font-bold text-[var(--text)]">{booking.other_party_name}</span>
              </div>
              <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
                <span className="font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-[var(--accent)]">{booking.price} MAD</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Select Payment Method</label>
              
              <button 
                onClick={() => setMethod('card')}
                className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${method === 'card' ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] hover:border-[var(--accent)]/30'}`}
              >
                <div className={`p-3 rounded-xl ${method === 'card' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card-bg)] text-[var(--text-muted)]'}`}>
                  <CreditCard size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Credit / Debit Card</p>
                  <p className="text-xs text-[var(--text-muted)]">Visa, Mastercard, CMI</p>
                </div>
              </button>

              <button 
                onClick={() => setMethod('wallet')}
                className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${method === 'wallet' ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] hover:border-[var(--accent)]/30'}`}
              >
                <div className={`p-3 rounded-xl ${method === 'wallet' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card-bg)] text-[var(--text-muted)]'}`}>
                  <Wallet size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold">M3allem Wallet</p>
                  <p className="text-xs text-[var(--text-muted)]">Pay with your account balance</p>
                </div>
              </button>

              <button 
                onClick={() => setMethod('cash')}
                className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${method === 'cash' ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] hover:border-[var(--accent)]/30'}`}
              >
                <div className={`p-3 rounded-xl ${method === 'cash' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card-bg)] text-[var(--text-muted)]'}`}>
                  <Banknote size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Cash on Delivery</p>
                  <p className="text-xs text-[var(--text-muted)]">Pay after service completion</p>
                </div>
              </button>
            </div>

            <button 
              onClick={handlePayment}
              disabled={processing}
              className="w-full py-5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold text-lg hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-[var(--accent)]/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {processing ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Confirm Payment
                  <ChevronRight size={20} />
                </>
              )}
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-[var(--text-muted)] text-xs">
              <ShieldCheck size={14} className="text-[var(--success)]" />
              Secured by M3allem Pay™
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-[var(--success)]/10 text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={48} className="animate-bounce" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Payment Successful!</h3>
            <p className="text-[var(--text-muted)] mb-8">Your booking is now confirmed. The artisan has been notified.</p>
            <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
                className="h-full bg-[var(--success)]"
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
