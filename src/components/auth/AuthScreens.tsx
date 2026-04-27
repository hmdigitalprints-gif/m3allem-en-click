import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, User, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader2, Sparkles, MessageSquare, Mail } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface AuthScreensProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export const AuthScreens: React.FC<AuthScreensProps> = ({ onSuccess, onBack }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<'login' | 'otp' | 'register' | 'role' | 'channel'>('login');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'artisan' | 'seller' | 'company'>('client');
  const [userId, setUserId] = useState<string | null>(null);
  const [otpChannel, setOtpChannel] = useState<'sms' | 'email'>('sms');
  const [pendingAction, setPendingAction] = useState<'login' | 'register' | null>(null);
  
  // Role-specific fields
  const [storeName, setStoreName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [idDocument, setIdDocument] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { login, verifyOtp, register } = useAuth();

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'name':
        if (value.trim().length < 3) error = t('auth_err_name');
        break;
      case 'phone':
        if (!value.match(/^0[567]\d{8}$/)) error = t('auth_err_phone');
        break;
      case 'email':
        if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) error = t('auth_err_email');
        break;
      case 'password':
        if (value.length < 6) error = t('auth_err_missing'); // simplified here
        break;
      case 'storeName':
        if (role === 'seller' && value.trim().length < 2) error = t('auth_err_missing');
        break;
      case 'companyName':
        if (role === 'company' && value.trim().length < 2) error = t('auth_err_missing');
        break;
      case 'categoryId':
        if (role === 'artisan' && !value) error = t('auth_err_missing');
        break;
      case 'idDocument':
        if (role === 'artisan' && !value.trim()) error = t('auth_err_missing');
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!identifier.trim()) {
      setError('Phone or email is required');
      setIsLoading(false);
      return;
    }
    if (!password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      const res: any = await login(identifier, password);
      if (res.requiresOtp || res.requiresVerification) {
        setUserId(res.userId);
        setPendingAction('login');
        setStep('channel');
      } else if (res.token) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (channel: 'sms' | 'email') => {
    if (pendingAction === 'register') {
      await executeRegister(channel);
      return;
    }

    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, channel }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send OTP');
      }
      setOtpChannel(channel);
      setStep('otp');
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(err.message);
      }
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
      await verifyOtp(userId, otp.trim());
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateRegister = () => {
    const errors: Record<string, string> = {};
    if (name.trim().length < 3) errors.name = 'Name must be at least 3 characters';
    if (!phone.match(/^0[567]\d{8}$/)) errors.phone = 'Invalid phone format (e.g., 0612345678)';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Invalid email address';
    if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (role === 'seller' && !storeName.trim()) errors.storeName = 'Store name is required';
    if (role === 'company' && !companyName.trim()) errors.companyName = 'Company name is required';
    if (role === 'artisan' && !categoryId) errors.categoryId = 'Category is required';
    if (role === 'artisan' && !idDocument.trim()) errors.idDocument = 'ID document is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const prepareRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateRegister()) return;
    setPendingAction('register');
    executeRegister(otpChannel);
  };

  const executeRegister = async (channel: 'sms' | 'email') => {
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
        idDocument,
        otpChannel: channel
      });
      setUserId(res.userId);
      setOtpChannel(channel);
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
      setStep('register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-4 md:p-6 transition-colors duration-300 relative">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 z-50 py-3 px-6 rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] text-[var(--accent-foreground)] transition-all shadow-xl flex items-center gap-3 active:scale-95 hover:scale-105"
          title="Back to Home"
        >
          <ArrowLeft size={20} />
          <span className="font-bold text-sm">Back to Home</span>
        </button>
      )}
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
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">{t('auth_welcome_back')}</h1>
                <p className="text-[var(--text-muted)]">{t('auth_login_desc')}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative group">
                  <Phone className="absolute start-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder={t('auth_email_or_phone')}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 ps-16 pe-8 text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all"
                    required
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute start-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder={t('auth_password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 ps-16 pe-8 text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all"
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
                  {isLoading ? <Loader2 className="animate-spin" /> : <>{t('auth_btn_login')} {i18n.dir() === 'rtl' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}</>}
                </button>

                <button 
                  type="button"
                  onClick={() => setStep('role')}
                  className="w-full text-[var(--accent)] font-bold py-2"
                >
                  {t('auth_no_account')} {t('auth_btn_create')}
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
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">VERIFY <span className="text-[var(--accent)]">OTP.</span></h1>
                <p className="text-[var(--text-muted)]">Enter the 6-digit code sent via {otpChannel.toUpperCase()}.</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="relative group">
                  <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="6-Digit Code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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
                
                <div className="flex flex-col gap-2">
                  <button 
                    type="button"
                    onClick={() => setStep('channel')}
                    className="w-full text-[var(--accent)] font-bold py-2"
                  >
                    Resend Code / Change Channel
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep('login')}
                    className="w-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'channel' && (
            <motion.div
              key="channel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">CHOOSE <span className="text-[var(--accent)]">CHANNEL.</span></h1>
                <p className="text-[var(--text-muted)]">Select how you want to receive your verification code.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => handleSendOtp('sms')}
                  disabled={isLoading}
                  className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[30px] text-left hover:border-[var(--accent)]/50 transition-all group active:scale-95 flex items-center gap-4"
                >
                  <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">SMS</h3>
                    <p className="text-[var(--text-muted)] text-xs">Receive code via text message.</p>
                  </div>
                </button>

                <button
                  onClick={() => handleSendOtp('email')}
                  disabled={isLoading}
                  className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[30px] text-left hover:border-[var(--accent)]/50 transition-all group active:scale-95 flex items-center gap-4"
                >
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Email</h3>
                    <p className="text-[var(--text-muted)] text-xs">Receive code via email address.</p>
                  </div>
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-500/10 p-4 rounded-2xl">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button 
                type="button"
                onClick={() => setStep('login')}
                className="w-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2 text-center"
              >
                Cancel
              </button>
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
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">JOIN <span className="text-[var(--accent)]">US.</span></h1>
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
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">CREATE <span className="text-[var(--accent)]">ACCOUNT.</span></h1>
                <p className="text-[var(--text-muted)]">Register as a {role}.</p>
              </div>

              <form onSubmit={prepareRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="relative group">
                  <User className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.name ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) validateField('name', e.target.value);
                    }}
                    onBlur={(e) => validateField('name', e.target.value)}
                    className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none transition-all ${fieldErrors.name ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                    required
                  />
                  {fieldErrors.name && <p className="text-rose-500 text-xs mt-2 ml-6 font-bold">{fieldErrors.name}</p>}
                </div>

                <div className="relative group">
                  <Phone className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.phone ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                  <input
                    type="tel"
                    placeholder="Phone Number (e.g. 0612345678)"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) validateField('phone', e.target.value);
                    }}
                    onBlur={(e) => validateField('phone', e.target.value)}
                    className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none transition-all ${fieldErrors.phone ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                    required
                  />
                  {fieldErrors.phone && <p className="text-rose-500 text-xs mt-2 ml-6 font-bold">{fieldErrors.phone}</p>}
                </div>

                <div className="relative group">
                  <ArrowRight className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.email ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) validateField('email', e.target.value);
                    }}
                    onBlur={(e) => validateField('email', e.target.value)}
                    className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none transition-all ${fieldErrors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                    required
                  />
                  {fieldErrors.email && <p className="text-rose-500 text-xs mt-2 ml-6 font-bold">{fieldErrors.email}</p>}
                </div>

                {role === 'seller' && (
                  <>
                    <div className="relative group">
                      <Sparkles className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.storeName ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                      <input
                        type="text"
                        placeholder="Store Name"
                        value={storeName}
                        onChange={(e) => {
                          setStoreName(e.target.value);
                          if (fieldErrors.storeName) validateField('storeName', e.target.value);
                        }}
                        onBlur={(e) => validateField('storeName', e.target.value)}
                        className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none transition-all ${fieldErrors.storeName ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                        required
                      />
                      {fieldErrors.storeName && <p className="text-rose-500 text-xs mt-2 ml-6 font-bold">{fieldErrors.storeName}</p>}
                    </div>
                  </>
                )}

                {role === 'company' && (
                  <>
                    <div className="relative group">
                      <ArrowRight className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.companyName ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          if (fieldErrors.companyName) validateField('companyName', e.target.value);
                        }}
                        onBlur={(e) => validateField('companyName', e.target.value)}
                        className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none transition-all ${fieldErrors.companyName ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                        required
                      />
                      {fieldErrors.companyName && <p className="text-rose-500 text-xs mt-2 ml-6 font-bold">{fieldErrors.companyName}</p>}
                    </div>
                  </>
                )}

                {role === 'artisan' && (
                  <>
                    <div className="relative group">
                      <ShieldCheck className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.categoryId ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                      <select
                        value={categoryId}
                        onChange={(e) => {
                          setCategoryId(e.target.value);
                          validateField('categoryId', e.target.value);
                        }}
                        className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none transition-all appearance-none text-[var(--text-muted)] ${fieldErrors.categoryId ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                        required
                      >
                        <option value="" disabled className="bg-[var(--bg)]">Select Category</option>
                        <option value="cat_1" className="bg-[var(--bg)]">Plumbing</option>
                        <option value="cat_2" className="bg-[var(--bg)]">Electricity</option>
                        <option value="cat_3" className="bg-[var(--bg)]">Carpentry</option>
                        <option value="cat_4" className="bg-[var(--bg)]">Painting</option>
                        <option value="cat_5" className="bg-[var(--bg)]">Cleaning</option>
                      </select>
                      {fieldErrors.categoryId && <p className="text-rose-500 text-xs mt-2 ml-6 font-bold">{fieldErrors.categoryId}</p>}
                    </div>
                    <div className="relative group">
                      <ShieldCheck className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.idDocument ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                      <input
                        type="text"
                        placeholder="ID Document URL"
                        value={idDocument}
                        onChange={(e) => {
                          setIdDocument(e.target.value);
                          if (fieldErrors.idDocument) validateField('idDocument', e.target.value);
                        }}
                        onBlur={(e) => validateField('idDocument', e.target.value)}
                        className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none transition-all ${fieldErrors.idDocument ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                        required
                      />
                      {fieldErrors.idDocument && <p className="text-rose-500 text-xs mt-2 ml-6 font-bold">{fieldErrors.idDocument}</p>}
                    </div>
                  </>
                )}

                <div className="relative group">
                  <Lock className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.password ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) validateField('password', e.target.value);
                    }}
                    onBlur={(e) => validateField('password', e.target.value)}
                    className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none transition-all ${fieldErrors.password ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                    required
                  />
                  {fieldErrors.password && <p className="text-rose-500 text-xs mt-2 ml-6 font-bold">{fieldErrors.password}</p>}
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

                <div className="space-y-3 px-2">
                  <p className="text-sm font-medium text-[var(--text-muted)] ml-2">Verification Channel</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'sms', icon: Phone, label: 'SMS' },
                      { id: 'email', icon: Mail, label: 'Email' }
                    ].map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setOtpChannel(ch.id as any)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                          otpChannel === ch.id 
                            ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]' 
                            : 'bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-muted)] hover:border-[var(--accent)]/30'
                        }`}
                      >
                        <ch.icon size={20} />
                        <span className="text-xs font-bold">{ch.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

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
