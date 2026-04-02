import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, User, ShieldCheck, ArrowRight, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { useAuth } from '../../context/AuthContext';

interface AuthScreensProps {
  onSuccess: () => void;
}

export const AuthScreens: React.FC<AuthScreensProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'login' | 'otp' | 'register' | 'role'>('login');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'artisan' | 'seller' | 'company'>('client');
  const [userId, setUserId] = useState<string | null>(null);
  
  // Role-specific fields
  const [storeName, setStoreName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [idDocument, setIdDocument] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, verifyOtp, register } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res: any = await login(identifier, password);
      setUserId(res.userId);
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      await verifyOtp(userId, otp);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res: any = await register({ 
        name, 
        phone, 
        email, 
        password, 
        role,
        storeName,
        companyName,
        categoryId,
        idDocument
      });
      setUserId(res.userId);
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-5xl font-bold tracking-tighter">WELCOME <span className="text-[var(--accent)]">BACK.</span></h1>
                <p className="text-[var(--text-muted)]">Enter your phone number to continue.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative group">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Phone or Email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all"
                    required
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-500/10 p-4 rounded-2xl">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-6 rounded-3xl font-bold text-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={20} /></>}
                </button>

                <button 
                  type="button"
                  onClick={() => setStep('role')}
                  className="w-full text-[var(--accent)] font-bold py-2"
                >
                  Don't have an account? Register
                </button>
              </form>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-5xl font-bold tracking-tighter">VERIFY <span className="text-[var(--accent)]">OTP.</span></h1>
                <p className="text-[var(--text-muted)]">Enter the 6-digit code sent to {phone}.</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="relative group">
                  <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="6-Digit Code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 pl-16 pr-8 text-xl tracking-[1em] text-center focus:outline-none focus:border-[var(--accent)]/50 transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-500/10 p-4 rounded-2xl">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-6 rounded-3xl font-bold text-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>Verify & Login <CheckCircle size={20} /></>}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2"
                >
                  Change Phone Number
                </button>
              </form>
            </motion.div>
          )}

          {step === 'role' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-5xl font-bold tracking-tighter">JOIN <span className="text-[var(--accent)]">US.</span></h1>
                <p className="text-[var(--text-muted)]">Choose how you want to use M3allem En Click.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => { setRole('client'); setStep('register'); }}
                  className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[30px] text-left hover:border-[var(--accent)]/50 transition-all group active:scale-95"
                >
                  <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl w-fit mb-4 group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all">
                    <User size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Client</h3>
                  <p className="text-[var(--text-muted)] text-xs">Find and book skilled craftsmen.</p>
                </button>

                <button
                  onClick={() => { setRole('artisan'); setStep('register'); }}
                  className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[30px] text-left hover:border-[var(--accent)]/50 transition-all group active:scale-95"
                >
                  <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl w-fit mb-4 group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Artisan</h3>
                  <p className="text-[var(--text-muted)] text-xs">Offer your services.</p>
                </button>

                <button
                  onClick={() => { setRole('seller'); setStep('register'); }}
                  className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[30px] text-left hover:border-[var(--accent)]/50 transition-all group active:scale-95"
                >
                  <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl w-fit mb-4 group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Seller</h3>
                  <p className="text-[var(--text-muted)] text-xs">Sell tools and materials.</p>
                </button>

                <button
                  onClick={() => { setRole('company'); setStep('register'); }}
                  className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[30px] text-left hover:border-[var(--accent)]/50 transition-all group active:scale-95"
                >
                  <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl w-fit mb-4 group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all">
                    <ArrowRight size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Company</h3>
                  <p className="text-[var(--text-muted)] text-xs">Manage your service team.</p>
                </button>
              </div>

              <button 
                type="button"
                onClick={() => setStep('login')}
                className="w-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2 text-center"
              >
                Already have an account? Login
              </button>
            </motion.div>
          )}

          {step === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-5xl font-bold tracking-tighter">CREATE <span className="text-[var(--accent)]">ACCOUNT.</span></h1>
                <p className="text-[var(--text-muted)]">Register as a {role}.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all"
                    required
                  />
                </div>

                <div className="relative group">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  <input
                    type="tel"
                    placeholder="Phone Number (e.g. 0612345678)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all"
                    required
                  />
                </div>

                <div className="relative group">
                  <ArrowRight className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all"
                    required
                  />
                </div>

                {role === 'seller' && (
                  <>
                    <div className="relative group">
                      <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                      <input
                        type="text"
                        placeholder="Store Name"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all"
                        required
                      />
                    </div>
                  </>
                )}

                {role === 'company' && (
                  <>
                    <div className="relative group">
                      <ArrowRight className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all"
                        required
                      />
                    </div>
                  </>
                )}

                {role === 'artisan' && (
                  <>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all appearance-none text-[var(--text-muted)]"
                        required
                      >
                        <option value="" disabled className="bg-[var(--bg)]">Select Category</option>
                        <option value="cat_1" className="bg-[var(--bg)]">Plumbing</option>
                        <option value="cat_2" className="bg-[var(--bg)]">Electricity</option>
                        <option value="cat_3" className="bg-[var(--bg)]">Carpentry</option>
                        <option value="cat_4" className="bg-[var(--bg)]">Painting</option>
                        <option value="cat_5" className="bg-[var(--bg)]">Cleaning</option>
                      </select>
                    </div>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                      <input
                        type="text"
                        placeholder="ID Document URL"
                        value={idDocument}
                        onChange={(e) => setIdDocument(e.target.value)}
                        className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all"
                    required
                  />
                  <div className="px-4">
                    <PasswordStrengthIndicator password={password} />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-500/10 p-4 rounded-2xl">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-6 rounded-3xl font-bold text-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>Register <ArrowRight size={20} /></>}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setStep('role')}
                  className="w-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2"
                >
                  Back to Role Selection
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
