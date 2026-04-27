import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle, 
  ShoppingCart, 
  CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { walletService } from '../../services/marketplaceService';

export default function WalletSection({ onAction }: { onAction: (msg: string) => void }) {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const data = await walletService.getWallet();
        setWalletData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const handleTopup = async () => {
    if (!amount) return;
    try {
      await walletService.topup(parseFloat(amount), method);
      const data = await walletService.getWallet();
      setWalletData(data);
      setShowTopup(false);
      setAmount('');
      onAction(`Successfully topped up ${amount} MAD`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdraw = async () => {
    if (!amount) return;
    try {
      await walletService.withdraw(parseFloat(amount), method);
      const data = await walletService.getWallet();
      setWalletData(data);
      setShowWithdraw(false);
      setAmount('');
      onAction(`Withdrawal request for ${amount} MAD submitted`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 animate-pulse space-y-8"><div className="h-48 bg-[var(--card-bg)] rounded-[40px]" /><div className="h-96 bg-[var(--card-bg)] rounded-[40px]" /></div>;

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">M3allem En Click <span className="text-[var(--accent)]">Wallet</span></h2>
        <p className="text-[var(--text-muted)] text-base md:text-xl">Manage your funds, top-up, and withdraw earnings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-[var(--accent)]/10" />
          <div className="relative z-10">
            <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs mb-4">Current Balance</p>
            <h3 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8">{walletData?.balance.toLocaleString()} <span className="text-2xl md:text-4xl text-[var(--accent)]">MAD</span></h3>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => {
                  onAction('Opening Top-up modal...');
                  setShowTopup(true);
                }}
                className="flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95"
              >
                <Plus size={20} />
                Top-up
              </button>
              <button 
                onClick={() => {
                  onAction('Opening Withdrawal modal...');
                  setShowWithdraw(true);
                }}
                className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] px-8 py-4 rounded-2xl font-bold hover:bg-[var(--card-bg)] transition-all active:scale-95"
              >
                <ArrowRight size={20} className="rotate-[-45deg]" />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-[48px] p-10 flex flex-col justify-center text-center">
          <ShieldCheck size={48} className="mx-auto mb-6 text-[var(--accent)]" />
          <h4 className="text-xl font-bold mb-2">Secure Escrow</h4>
          <p className="text-sm text-[var(--text-muted)]">Your payments are held securely until the service is completed and verified.</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-10">
        <h4 className="text-2xl font-bold mb-8">Transaction History</h4>
        <div className="space-y-6">
          {walletData?.transactions?.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">No transactions yet.</div>
          ) : (
            walletData?.transactions?.map((tx: any) => (
              <div 
                key={tx.id} 
                onClick={() => onAction(`Viewing transaction details: ${tx.description}`)}
                className="flex items-center justify-between p-4 hover:bg-[var(--bg)] rounded-3xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.type === 'topup' && <Plus size={20} />}
                    {tx.type === 'payment' && <ShoppingCart size={20} />}
                    {tx.type === 'release' && <TrendingUp size={20} />}
                    {tx.type === 'withdrawal' && <ArrowRight size={20} className="rotate-[-45deg]" />}
                    {tx.type === 'commission' && <AlertCircle size={20} />}
                  </div>
                  <div>
                    <p className="font-bold">{tx.description}</p>
                    <p className="text-xs text-[var(--text-muted)]">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} MAD
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{tx.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top-up Modal */}
      <AnimatePresence>
        {showTopup && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTopup(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-8">Top-up Wallet</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Amount (MAD)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 text-2xl font-bold focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['card', 'paypal', 'stripe', 'cmi']?.map(m => (
                      <button 
                        key={m}
                        onClick={() => setMethod(m)}
                        className={`p-4 rounded-2xl border font-bold uppercase text-xs tracking-widest transition-all ${method === m ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    onAction(`Confirming top-up of ${amount} MAD via ${method}`);
                    handleTopup();
                  }}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Confirm Top-up
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowWithdraw(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-8">Withdraw Earnings</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Amount (MAD)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 text-2xl font-bold focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-2">Available: {walletData?.balance} MAD</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Withdrawal Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['bank_transfer', 'paypal']?.map(m => (
                      <button 
                        key={m}
                        onClick={() => setMethod(m)}
                        className={`p-4 rounded-2xl border font-bold uppercase text-xs tracking-widest transition-all ${method === m ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50'}`}
                      >
                        {m.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    onAction(`Requesting withdrawal of ${amount} MAD via ${method}`);
                    handleWithdraw();
                  }}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowRight size={20} className="rotate-[-45deg]" />
                  Request Withdrawal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
