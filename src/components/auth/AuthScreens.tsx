import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, User, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader2, Sparkles, MessageSquare, Mail, ChevronDown } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SymmetricalIcon } from '../common/SymmetricalIcon';

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
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'artisan' | 'seller' | 'company'>('client');
  const [userId, setUserId] = useState<string | null>(null);
  const [otpChannel, setOtpChannel] = useState<'sms' | 'email'>('sms');
  const [pendingAction, setPendingAction] = useState<'login' | 'register' | null>(null);
  const [simulationOtp, setSimulationOtp] = useState<string | null>(null);
  
  // Role-specific fields
  const [storeName, setStoreName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const { login, verifyOtp, register } = useAuth();

  React.useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { marketplaceService } = await import('../../services/marketplaceService');
        const data = await marketplaceService.getCategories();
        if (data && Array.isArray(data)) {
           setCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'name':
        if (value.trim().length < 3) error = t('auth_err_name', 'Name must be at least 3 characters');
        break;
      case 'identifier':
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isPhone = /^0[567]\d{8}$/.test(value) || /^\+212[567]\d{8}$/.test(value);
        if (!isEmail && !isPhone) error = t('auth_err_invalid_format', 'Invalid phone format or email address');
        break;
      case 'password':
        if (value.length < 6) error = t('auth_err_password_short', 'Password must be at least 6 characters');
        break;
      case 'storeName':
        if (role === 'seller' && value.trim().length < 2) error = t('auth_err_store_required', 'Store name is required');
        break;
      case 'companyName':
        if (role === 'company' && value.trim().length < 2) error = t('auth_err_company_required', 'Company name is required');
        break;
      case 'categoryId':
        if (role === 'artisan' && !value) error = t('auth_err_category_required', 'Category is required');
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
      setError(t('auth_err_identifier_required', 'Phone or email is required'));
      setIsLoading(false);
      return;
    }
    if (!password) {
      setError(t('auth_err_password_required', 'Password is required'));
      setIsLoading(false);
      return;
    }

    try {
      const res: any = await login(identifier, password);
      if (res.requiresOtp || res.requiresVerification) {
        setUserId(res.userId);
        setSimulationOtp(res.isSimulation ? res.otp : null);
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
    setIsResending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-otp', { credentials: 'include', 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, channel })});
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t('auth_err_otp_failed', 'Failed to send OTP'));
      }
      const data = await res.json();
      setSimulationOtp(data.isSimulation ? data.otp : null);
      setOtpChannel(channel);
      setResendTimer(60); // Start 60s cooldown
      setStep('otp');
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError(t('auth_err_connection', 'Unable to connect to the server. Please check your internet connection.'));
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
      setIsResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !otp.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log(`[AuthScreens] Attempting to verify OTP for user ${userId}`);
      await verifyOtp(userId, otp.trim());
      console.log(`[AuthScreens] OTP verified successfully`);
      onSuccess();
    } catch (err: any) {
      console.error(`[AuthScreens] OTP verification error:`, err);
      setError(err.message || t('auth_err_verify_failed', 'Verification failed. Please check the code and try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const validateRegister = () => {
    const errors: Record<string, string> = {};
    if (['client', 'artisan'].includes(role) && name.trim().length < 3) errors.name = t('auth_err_name_short', 'Name must be at least 3 characters');
    
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^0[567]\d{8}$/.test(identifier) || /^\+212[567]\d{8}$/.test(identifier);
    if (!isEmail && !isPhone) errors.identifier = t('auth_err_invalid_format', 'Invalid phone format or email address');
    
    if (password.length < 6) errors.password = t('auth_err_password_short', 'Password must be at least 6 characters');
    
    if (role === 'seller' && !storeName.trim()) errors.storeName = t('auth_err_store_required', 'Store name is required');
    if (role === 'company' && !companyName.trim()) errors.companyName = t('auth_err_company_required', 'Company name is required');
    if (role === 'artisan' && !categoryId) errors.categoryId = t('auth_err_category_required', 'Category is required');

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const prepareRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateRegister()) return;
    setPendingAction('register');
    
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const channel = isEmail ? 'email' : 'sms';
    
    executeRegister(channel);
  };

  const executeRegister = async (channel: 'sms' | 'email') => {
    setIsLoading(true);
    setError(null);
    try {
      const res: any = await register({ 
        name, 
        identifier, 
        password, 
        role,
        storeName,
        companyName,
        categoryId,
        otpChannel: channel
      });
      setUserId(res.userId);
      setSimulationOtp(res.isSimulation ? res.otp : null);
      setOtpChannel(channel);
      setResendTimer(60);
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
          className="absolute top-6 start-6 z-50 py-3 px-6 rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-black transition-all shadow-xl flex items-center gap-3 active:scale-95 hover:scale-105"
          title={t('back_to_home')}
        >
          <SymmetricalIcon icon={ArrowLeft} size={20} />
          <span className="font-bold text-sm">{t('back_to_home')}</span>
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
                  <div className="flex items-center gap-3 text-rose-500 bg-rose-500/10 p-5 rounded-[24px] border border-rose-500/20 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-rose-500/20 rounded-xl">
                      <AlertCircle size={20} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-70 leading-none mb-1">{t('error', 'Error')}</span>
                      <p className="font-bold text-sm leading-tight">{error}</p>
                    </div>
                  </div>
                )}

                  <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-6 rounded-3xl font-bold text-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>{t('auth_btn_login')} <SymmetricalIcon icon={ArrowRight} size={20} /></>}
                </button>

                <button 
                  type="button"
                  onClick={() => setStep('role')}
                  className="w-full text-[var(--accent)] font-bold py-2"
                >
                  {t('auth_no_account')} {t('auth_btn_create')}
                </button>
              </form>

              {/* DEMO QUICK LOGIN */}
              <div className="mt-8 border-t border-[var(--border)] pt-8">
                <div className="flex items-center justify-center gap-2 mb-6 text-[var(--text-muted)]">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Demo Quick Roles</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button onClick={(e) => { e.preventDefault(); setIdentifier('admin@test.com'); setPassword('password123'); }} className="p-3 text-xs md:text-sm font-bold bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white rounded-xl transition-all">
                    Admin
                  </button>
                  <button onClick={(e) => { e.preventDefault(); setIdentifier('client0@test.com'); setPassword('password123'); }} className="p-3 text-xs md:text-sm font-bold bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white rounded-xl transition-all">
                    Client
                  </button>
                  <button onClick={(e) => { e.preventDefault(); setIdentifier('artisan0@test.com'); setPassword('password123'); }} className="p-3 text-xs md:text-sm font-bold bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white rounded-xl transition-all">
                    Artisan
                  </button>
                  <button onClick={(e) => { e.preventDefault(); setIdentifier('seller0@test.com'); setPassword('password123'); }} className="p-3 text-xs md:text-sm font-bold bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white rounded-xl transition-all">
                    Seller / Vendeur
                  </button>
                  <button onClick={(e) => { e.preventDefault(); setIdentifier('company0@test.com'); setPassword('password123'); }} className="p-3 text-xs md:text-sm font-bold bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white rounded-xl transition-all col-span-2 md:col-span-1">
                    Company 
                  </button>
                </div>
              </div>
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
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">{t('auth_verify')} <span className="text-[var(--accent)]">{t('auth_otp_short')}</span></h1>
                <p className="text-[var(--text-muted)]">{t('auth_enter_code')} {otpChannel.toUpperCase()}.</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="relative group">
                  <ShieldCheck className="absolute start-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder={t('auth_otp_placeholder')}
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl py-6 ps-16 pe-8 text-xl tracking-[1em] text-center focus:outline-none focus:border-[var(--accent)]/50 transition-all font-mono"
                    required
                    dir="ltr"
                  />
                </div>

                {simulationOtp && (
                  <div className="flex flex-col gap-3 p-6 bg-amber-500/10 rounded-[28px] border-2 border-amber-500/30 backdrop-blur-xl animate-pulse ring-4 ring-amber-500/10">
                    <div className="flex items-center gap-3 text-amber-500">
                      <div className="p-2 bg-amber-500/20 rounded-xl">
                        <Sparkles size={20} className="animate-spin-slow" />
                      </div>
                      <h4 className="font-black uppercase tracking-tighter text-sm">{t('auth_simulation_active', 'Development Mode active')}</h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-widest">{t('auth_simulation_otp_is', 'Your test verification code is:')}</p>
                      <div className="flex items-center gap-4">
                        <code className="text-4xl font-black tracking-[0.2em] text-amber-500 font-mono">{simulationOtp}</code>
                        <div className="px-3 py-1 bg-amber-500 text-black text-[10px] font-black uppercase rounded-full tracking-widest">
                          {t('auth_test_code', 'Test Code')}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-amber-500/60 font-bold uppercase tracking-tight">{t('auth_simulation_note', 'Real SMS/Email will not be sent in this environment.')}</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 text-rose-500 bg-rose-500/10 p-5 rounded-[24px] border border-rose-500/20 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-rose-500/20 rounded-xl">
                      <AlertCircle size={20} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-70 leading-none mb-1">{t('error', 'Error')}</span>
                      <p className="font-bold text-sm leading-tight">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-6 rounded-3xl font-bold text-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>{t('auth_btn_verify_login')} <CheckCircle size={20} /></>}
                </button>
                
                <div className="flex flex-col gap-2">
                  <button 
                    type="button"
                    onClick={() => handleSendOtp(otpChannel)}
                    disabled={isLoading || resendTimer > 0}
                    className="w-full text-[var(--accent)] font-bold py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isResending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        {t('auth_otp_resend', 'Resend Code')}
                        {resendTimer > 0 && <span>({resendTimer}s)</span>}
                      </>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep('channel')}
                    disabled={isLoading}
                    className="w-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2"
                  >
                    {t('auth_change_channel', 'Change Channel')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep('login')}
                    disabled={isLoading}
                    className="w-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2"
                  >
                    {t('auth_btn_back_login', 'Back to Login')}
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
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">{t('auth_choose')} <span className="text-[var(--accent)]">{t('auth_channel_short')}</span></h1>
                <p className="text-[var(--text-muted)]">{t('auth_choose_desc')}</p>
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
                  <div className={i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}>
                    <h3 className="text-xl font-bold">SMS</h3>
                    <p className="text-[var(--text-muted)] text-xs">{t('auth_channel_sms_desc')}</p>
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
                  <div className={i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}>
                    <h3 className="text-xl font-bold">Email</h3>
                    <p className="text-[var(--text-muted)] text-xs">{t('auth_channel_email_desc')}</p>
                  </div>
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-3 text-rose-500 bg-rose-500/10 p-5 rounded-[24px] border border-rose-500/20 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 bg-rose-500/20 rounded-xl">
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-70 leading-none mb-1">{t('error', 'Error')}</span>
                    <p className="font-bold text-sm leading-tight">{error}</p>
                  </div>
                </div>
              )}

              <button 
                type="button"
                onClick={() => setStep('login')}
                className="w-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2 text-center"
              >
                {t('auth_btn_cancel')}
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
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">{t('auth_join')} <span className="text-[var(--accent)]">{t('auth_us')}</span></h1>
                <p className="text-[var(--text-muted)]">{t('auth_join_desc', 'Choose how you want to use M3allem En Click.')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => { setRole('client'); setStep('register'); }}
                  className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[30px] text-left hover:border-[var(--accent)]/50 transition-all group active:scale-95"
                >
                  <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl w-fit mb-4 group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all">
                    <User size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{t('role_client', 'Client')}</h3>
                  <p className="text-[var(--text-muted)] text-xs">{t('client_desc', 'Find and book skilled craftsmen.')}</p>
                </button>

                <button
                  onClick={() => { setRole('artisan'); setStep('register'); }}
                  className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[30px] text-left hover:border-[var(--accent)]/50 transition-all group active:scale-95"
                >
                  <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl w-fit mb-4 group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{t('role_artisan', 'Artisan')}</h3>
                  <p className="text-[var(--text-muted)] text-xs">{t('artisan_desc', 'Offer your services.')}</p>
                </button>

                <button
                  onClick={() => { setRole('seller'); setStep('register'); }}
                  className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[30px] text-left hover:border-[var(--accent)]/50 transition-all group active:scale-95"
                >
                  <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl w-fit mb-4 group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{t('role_seller', 'Seller')}</h3>
                  <p className="text-[var(--text-muted)] text-xs">{t('seller_desc', 'Sell tools and materials.')}</p>
                </button>

                <button
                  onClick={() => { setRole('company'); setStep('register'); }}
                  className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[30px] text-left hover:border-[var(--accent)]/50 transition-all group active:scale-95"
                >
                  <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl w-fit mb-4 group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all">
                    <ArrowRight size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{t('role_company', 'Company')}</h3>
                  <p className="text-[var(--text-muted)] text-xs">{t('company_desc', 'Manage your service team.')}</p>
                </button>
              </div>

              <button 
                type="button"
                onClick={() => setStep('login')}
                className="w-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2 text-center"
              >
                {t('auth_already_have_account', 'Already have an account? Login')}
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
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">{t('auth_create')} <span className="text-[var(--accent)]">{t('auth_account_short')}</span></h1>
                <p className="text-[var(--text-muted)]">{t('auth_register_as')} {t(`role_${role}`)}.</p>
              </div>

              <form onSubmit={prepareRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pe-2 custom-scrollbar">
                {['client', 'artisan'].includes(role) && (
                  <div className="relative group">
                    <User className={`absolute start-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.name ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                    <input
                      type="text"
                      placeholder={t('auth_full_name')}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldErrors.name) validateField('name', e.target.value);
                      }}
                      onBlur={(e) => validateField('name', e.target.value)}
                      className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 ps-16 pe-8 text-xl focus:outline-none transition-all ${fieldErrors.name ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                      required
                    />
                    {fieldErrors.name && <p className="text-rose-500 text-xs mt-2 ms-6 font-bold">{fieldErrors.name}</p>}
                  </div>
                )}

                <div className="relative group">
                  <Phone className={`absolute start-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.identifier ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                  <input
                    type="text"
                    placeholder={t('auth_email_or_phone')}
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (fieldErrors.identifier) validateField('identifier', e.target.value);
                    }}
                    onBlur={(e) => validateField('identifier', e.target.value)}
                    className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 ps-16 pe-8 text-xl focus:outline-none transition-all ${fieldErrors.identifier ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                    required
                    dir="ltr"
                  />
                  {fieldErrors.identifier && <p className="text-rose-500 text-xs mt-2 ms-6 font-bold">{fieldErrors.identifier}</p>}
                </div>

                {role === 'seller' && (
                  <>
                    <div className="relative group">
                      <Sparkles className={`absolute start-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.storeName ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                      <input
                        type="text"
                        placeholder={t('auth_store_name')}
                        value={storeName}
                        onChange={(e) => {
                          setStoreName(e.target.value);
                          if (fieldErrors.storeName) validateField('storeName', e.target.value);
                        }}
                        onBlur={(e) => validateField('storeName', e.target.value)}
                        className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 ps-16 pe-8 text-xl focus:outline-none transition-all ${fieldErrors.storeName ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                        required
                      />
                      {fieldErrors.storeName && <p className="text-rose-500 text-xs mt-2 ms-6 font-bold">{fieldErrors.storeName}</p>}
                    </div>
                  </>
                )}

                {role === 'company' && (
                  <>
                    <div className="relative group">
                      <SymmetricalIcon icon={ArrowRight} className={`absolute start-6 top-1/2 -translate-y-1/2 transition-colors border-none p-0 ${fieldErrors.companyName ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                      <input
                        type="text"
                        placeholder={t('auth_company_name')}
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          if (fieldErrors.companyName) validateField('companyName', e.target.value);
                        }}
                        onBlur={(e) => validateField('companyName', e.target.value)}
                        className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 ps-16 pe-8 text-xl focus:outline-none transition-all ${fieldErrors.companyName ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                        required
                      />
                      {fieldErrors.companyName && <p className="text-rose-500 text-xs mt-2 ms-6 font-bold">{fieldErrors.companyName}</p>}
                    </div>
                  </>
                )}

                {role === 'artisan' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">{t('auth_select_category', 'Professional Category')}</label>
                       {fieldErrors.categoryId && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">{t('required', 'Required')}</span>}
                    </div>
                    <div className="relative group">
                      <ShieldCheck className={`absolute start-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.categoryId ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                      <select
                        id="artisan-category-select"
                        value={categoryId}
                        onChange={(e) => {
                          setCategoryId(e.target.value);
                          if (fieldErrors.categoryId) {
                            const newErrors = { ...fieldErrors };
                            delete newErrors.categoryId;
                            setFieldErrors(newErrors);
                          }
                        }}
                        className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 ps-16 pe-12 text-xl focus:outline-none transition-all appearance-none cursor-pointer text-[var(--text)] font-bold ${fieldErrors.categoryId ? 'border-rose-500/50 focus:border-rose-500 ring-4 ring-rose-500/10' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/10'}`}
                        required
                      >
                        <option value="" disabled className="bg-[var(--bg)]">{t('auth_select_category_placeholder', 'Choose your craft...')}</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-[var(--bg)] text-[var(--text)]">
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute end-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none group-focus-within:text-[var(--accent)] transition-colors" size={20} />
                    </div>
                    {fieldErrors.categoryId && (
                      <p className="text-rose-500 text-xs mt-1 ms-6 font-bold flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                        <AlertCircle size={12} />
                        {fieldErrors.categoryId}
                      </p>
                    )}
                  </div>
                )}

                <div className="relative group">
                  <Lock className={`absolute start-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.password ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={20} />
                  <input
                    type="password"
                    placeholder={t('auth_password')}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) validateField('password', e.target.value);
                    }}
                    onBlur={(e) => validateField('password', e.target.value)}
                    className={`w-full bg-[var(--glass-bg)] border rounded-3xl py-6 ps-16 pe-8 text-xl focus:outline-none transition-all ${fieldErrors.password ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--glass-border)] focus:border-[var(--accent)]/50'}`}
                    required
                  />
                  {fieldErrors.password && <p className="text-rose-500 text-xs mt-2 ms-6 font-bold">{fieldErrors.password}</p>}
                  <div className="px-4">
                    <PasswordStrengthIndicator password={password} />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 text-rose-500 bg-rose-500/10 p-5 rounded-[24px] border border-rose-500/20 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-rose-500/20 rounded-xl">
                      <AlertCircle size={20} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-70 leading-none mb-1">{t('error', 'Error')}</span>
                      <p className="font-bold text-sm leading-tight">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-6 rounded-3xl font-bold text-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>{t('auth_register_btn')} <SymmetricalIcon icon={ArrowRight} size={20} /></>}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setStep('role')}
                  className="w-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2"
                >
                  {t('auth_back_select_role')}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
