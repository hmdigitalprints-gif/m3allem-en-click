import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Hammer, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ChevronLeft,
  Camera,
  Upload
} from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

// --- Shared Components ---

const InputField = ({ label, icon: Icon, type = "text", value, onChange, placeholder, error, disabled }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">{label}</label>
    <div className={`relative group ${error ? 'border-red-500/50' : 'border-[var(--border)]'} ${disabled ? 'opacity-50' : ''}`}>
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors">
        <Icon size={20} />
      </div>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-3xl py-5 pl-16 pr-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-lg text-[var(--text)] disabled:cursor-not-allowed"
      />
    </div>
    {type === 'password' && <div className="px-4"><PasswordStrengthIndicator password={value} /></div>}
    {error && <p className="text-red-500 text-xs ml-4">{error}</p>}
  </div>
);

const PrimaryButton = ({ label, onClick, loading, disabled, icon: Icon = ArrowRight }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled || loading}
    className={`w-full py-6 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl ${
      disabled || loading 
        ? 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed' 
        : 'bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90'
    }`}
  >
    {loading ? <Loader2 className="animate-spin" /> : (
      <>
        {label}
        <Icon size={20} />
      </>
    )}
  </button>
);

// --- Screens ---

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-[var(--bg)] p-12 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="w-32 h-32 bg-[var(--accent)] rounded-[40px] flex items-center justify-center shadow-[0_0_50px_rgba(var(--accent-rgb),0.3)]">
          <span className="text-6xl font-bold italic text-[var(--accent-foreground)]">M</span>
        </div>
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-bold tracking-tighter mb-2 text-[var(--text)]"
      >
        M3allem En Click
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[var(--text-muted)] tracking-widest uppercase text-xs font-bold"
      >
        Premium Home Services
      </motion.p>
      
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ delay: 0.8, duration: 1.5 }}
        className="h-1 bg-[var(--accent)]/20 rounded-full mt-12 overflow-hidden"
      >
        <motion.div 
          initial={{ x: -200 }}
          animate={{ x: 200 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-full h-full bg-[var(--accent)]"
        />
      </motion.div>
    </div>
  );
};

export const LoginScreen = ({ onLogin, onRegister }: any) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) return setError('Please fill all fields');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.userId, phone);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-12 bg-[var(--bg)]">
      <div className="mt-12 mb-12">
        <h2 className="text-5xl font-bold tracking-tighter mb-4 text-[var(--text)]">Welcome <br /><span className="text-[var(--accent)]">Back.</span></h2>
        <p className="text-[var(--text-muted)] text-lg">Sign in to continue to your premium services.</p>
      </div>

      <div className="space-y-6">
        <InputField 
          label="Phone Number" 
          icon={Phone} 
          placeholder="+212 600 000 000" 
          value={phone} 
          onChange={setPhone} 
          disabled={loading}
        />
        <InputField 
          label="Password" 
          icon={ShieldCheck} 
          type="password" 
          placeholder="••••••••" 
          value={password} 
          onChange={setPassword} 
          disabled={loading}
        />
        
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-2xl">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}

        <div className="pt-4">
          <PrimaryButton label="Sign In" onClick={handleLogin} loading={loading} />
        </div>

        <div className="text-center pt-8">
          <p className="text-[var(--text-muted)] text-sm mb-4">Don't have an account?</p>
          <div className="flex gap-4">
            <button 
              onClick={() => onRegister('client')}
              className="flex-1 py-4 border border-[var(--border)] rounded-2xl text-sm font-bold text-[var(--text)] hover:bg-[var(--card-bg)] transition-colors"
            >
              Join as Client
            </button>
            <button 
              onClick={() => onRegister('artisan')}
              className="flex-1 py-4 border border-[var(--accent)]/20 rounded-2xl text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors"
            >
              Join as Artisan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OTPScreen = ({ userId, phone, onVerify, onBack }: any) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        setTimer(300);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return setError('Please enter 6-digit code');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      });
      const data = await res.json();
      if (res.ok) {
        onVerify(data.token, data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-12 bg-[var(--bg)]">
      <button onClick={onBack} className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center mb-12 hover:bg-[var(--card-bg)] transition-colors text-[var(--text)]">
        <ChevronLeft size={24} />
      </button>

      <div className="mb-12">
        <h2 className="text-5xl font-bold tracking-tighter mb-4 text-[var(--text)]">Verify <br /><span className="text-[var(--accent)]">Phone.</span></h2>
        <p className="text-[var(--text-muted)] text-lg">We've sent a 6-digit code to <span className="text-[var(--text)]">{phone}</span></p>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between gap-2">
          {[0, 1, 2, 3, 4, 5]?.map((i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={code[i] || ''}
              disabled={loading}
              onChange={(e) => {
                const val = e.target.value;
                if (val && code.length < 6) setCode(code + val);
                if (!val) setCode(code.slice(0, -1));
              }}
              className="w-12 h-16 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-center text-2xl font-bold text-[var(--text)] focus:border-[var(--accent)] focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-[var(--text-muted)] text-sm">
            Code expires in <span className="text-[var(--accent)] font-mono">{formatTime(timer)}</span>
          </p>
          {timer === 0 && (
            <button 
              onClick={handleResend}
              disabled={resending}
              className={`text-[var(--accent)] text-sm font-bold mt-2 hover:underline flex items-center justify-center gap-2 mx-auto ${resending ? 'opacity-50' : ''}`}
            >
              {resending ? <Loader2 size={14} className="animate-spin" /> : null}
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-2xl">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <PrimaryButton label="Verify & Continue" onClick={handleVerify} loading={loading} />
      </div>
    </div>
  );
};

export const RegisterScreen = ({ role, onRegisterSuccess, onBack }: any) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [bio, setBio] = useState('');
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [idDocumentUploading, setIdDocumentUploading] = useState(false);
  const [professionalLicense, setProfessionalLicense] = useState<string | null>(null);
  const [professionalLicenseUploading, setProfessionalLicenseUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catsLoading, setCatsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (role === 'artisan') {
      setCatsLoading(true);
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .finally(() => setCatsLoading(false));
    }
  }, [role]);

  const handleIdDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocumentUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image }),
          });
          const data = await res.json();
          if (res.ok) {
            setIdDocument(data.url);
            setError('');
          } else {
            setError(data.error || 'Failed to upload ID document');
          }
        } catch (err) {
          setError('Connection error during upload');
        } finally {
          setIdDocumentUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfessionalLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfessionalLicenseUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image }),
          });
          const data = await res.json();
          if (res.ok) {
            setProfessionalLicense(data.url);
          } else {
            setError(data.error || 'Failed to upload professional license');
          }
        } catch (err) {
          setError('Connection error during upload');
        } finally {
          setProfessionalLicenseUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async () => {
    if (!name || !phone || !password) return setError('Please fill all fields');
    if (role === 'artisan' && !categoryId) return setError('Please select a category');
    if (role === 'artisan' && !idDocument) return setError('Please upload an ID document');

    setLoading(true);
    setError('');
    const endpoint = role === 'client' ? '/api/auth/register/client' : '/api/auth/register/artisan';
    const body = role === 'client' 
      ? { name, phone, password } 
      : { name, phone, password, categoryId, bio, idDocument, professionalLicense };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        onRegisterSuccess(data.userId, phone);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-12 bg-[var(--bg)] overflow-y-auto">
      <button onClick={onBack} className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center mb-12 hover:bg-[var(--card-bg)] transition-colors text-[var(--text)]">
        <ChevronLeft size={24} />
      </button>

      <div className="mb-12">
        <h2 className="text-5xl font-bold tracking-tighter mb-4 text-[var(--text)]">Create <br /><span className="text-[var(--accent)]">Account.</span></h2>
        <p className="text-[var(--text-muted)] text-lg">Join the M3allem En Click community as a <span className="text-[var(--text)] capitalize">{role}</span>.</p>
      </div>

      <div className="space-y-6 pb-12">
        <InputField label="Full Name" icon={User} placeholder="John Doe" value={name} onChange={setName} disabled={loading} />
        <InputField label="Phone Number" icon={Phone} placeholder="+212 600 000 000" value={phone} onChange={setPhone} disabled={loading} />
        <InputField label="Password" icon={ShieldCheck} type="password" placeholder="••••••••" value={password} onChange={setPassword} disabled={loading} />
        
        {role === 'artisan' && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Specialization</label>
              <div className="relative">
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loading || catsLoading}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-3xl py-5 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-lg text-[var(--text)] appearance-none disabled:opacity-50"
                >
                  <option value="" disabled className="bg-[var(--card-bg)]">
                    {catsLoading ? 'Loading Categories...' : 'Select Category'}
                  </option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id} className="bg-[var(--card-bg)]">{cat.name}</option>
                  ))}
                </select>
                {catsLoading && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Bio / Experience</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                placeholder="Tell us about your skills..."
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-3xl py-5 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-lg text-[var(--text)] h-32 resize-none disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">ID Document (National ID or Passport)</label>
              <div className={`relative w-full h-40 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden bg-[var(--bg)] group transition-colors ${error.includes('ID document') ? 'border-red-500' : 'border-[var(--border)] hover:border-[var(--accent)]/50'}`}>
                {idDocumentUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-[var(--accent)] mb-2" size={32} />
                    <span className="text-sm text-[var(--text-muted)]">Uploading...</span>
                  </div>
                ) : idDocument ? (
                  <>
                    <img src={idDocument} alt="ID Document Preview" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                      <CheckCircle size={40} className="text-[var(--accent)] mb-2" />
                      <span className="text-xs text-white/80 px-4 text-center truncate w-full">{idDocument}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera size={32} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors mb-3" />
                    <span className="text-sm text-[var(--text-muted)]">Tap to take photo or upload</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleIdDocumentUpload}
                  disabled={idDocumentUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Professional License (Optional)</label>
              <div className={`relative w-full h-40 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden bg-[var(--bg)] group transition-colors border-[var(--border)] hover:border-[var(--accent)]/50`}>
                {professionalLicenseUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-[var(--accent)] mb-2" size={32} />
                    <span className="text-sm text-[var(--text-muted)]">Uploading...</span>
                  </div>
                ) : professionalLicense ? (
                  <>
                    <img src={professionalLicense} alt="Professional License Preview" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                      <CheckCircle size={40} className="text-[var(--accent)] mb-2" />
                      <span className="text-xs text-white/80 px-4 text-center truncate w-full">{professionalLicense}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera size={32} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors mb-3" />
                    <span className="text-sm text-[var(--text-muted)]">Tap to take photo or upload</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleProfessionalLicenseUpload}
                  disabled={professionalLicenseUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-2xl">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <PrimaryButton label="Create Account" onClick={handleRegister} loading={loading} />
      </div>
    </div>
  );
};

export const VerificationUploadScreen = ({ onComplete, onSkip }: any) => {
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    setLoading(true);
    // Simulate upload
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(onComplete, 2000);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col p-12 bg-[var(--bg)]">
      <div className="mt-12 mb-12">
        <h2 className="text-5xl font-bold tracking-tighter mb-4 text-[var(--text)]">Identity <br /><span className="text-[var(--accent)]">Verification.</span></h2>
        <p className="text-[var(--text-muted)] text-lg">To ensure safety, artisans must verify their identity with a valid ID document.</p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {!success ? (
          <div 
            onClick={() => setFile({ name: 'id_document.jpg' })}
            className={`w-full aspect-square rounded-[48px] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
              file ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] hover:border-[var(--accent)]/20'
            }`}
          >
            {file ? (
              <>
                <CheckCircle size={64} className="text-[var(--accent)]" />
                <p className="font-bold text-[var(--text)]">{file.name}</p>
                <p className="text-[var(--text-muted)] text-sm">Tap to change</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-[var(--card-bg)] rounded-full flex items-center justify-center">
                  <Camera size={32} className="text-[var(--text-muted)]" />
                </div>
                <p className="font-bold text-lg text-[var(--text)]">Upload ID Document</p>
                <p className="text-[var(--text-muted)] text-sm text-center px-8">Take a clear photo of your National ID or Passport</p>
              </>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              <CheckCircle size={64} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text)]">Upload Successful</h3>
            <p className="text-[var(--text-muted)] text-center">Our team will review your document within 24 hours.</p>
          </motion.div>
        )}
      </div>

      <div className="space-y-4 pt-12">
        {!success && (
          <>
            <PrimaryButton 
              label="Submit for Review" 
              onClick={handleUpload} 
              loading={loading} 
              disabled={!file || loading} 
              icon={Upload}
            />
            <button 
              onClick={onSkip} 
              disabled={loading}
              className="w-full py-4 text-[var(--text-muted)] font-bold hover:text-[var(--text)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
};
