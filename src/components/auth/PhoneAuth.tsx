import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2, Globe } from 'lucide-react';

type Language = 'fr' | 'ar';

const translations = {
  fr: {
    title: 'M3allem En Click',
    subtitle: 'Authentification',
    enterPhone: 'Entrez votre numéro de téléphone',
    phonePlaceholder: '+212 6XX XX XX XX',
    sendCode: 'Envoyer le code',
    enterOtp: 'Entrez le code de vérification',
    otpSentTo: 'Code envoyé au',
    verify: 'Vérifier',
    resendIn: 'Renvoyer dans',
    resendNow: 'Renvoyer le code',
    fallbackMsg: 'Si le SMS tarde, nous vous enverrons un message WhatsApp.',
    success: 'Vérification réussie !',
    successDesc: 'Votre numéro a été vérifié avec succès.',
    continue: 'Continuer',
    invalidPhone: 'Numéro de téléphone invalide',
    invalidOtp: 'Code invalide',
  },
  ar: {
    title: 'معلم في كليك',
    subtitle: 'تسجيل الدخول',
    enterPhone: 'أدخل رقم هاتفك',
    phonePlaceholder: '+212 6XX XX XX XX',
    sendCode: 'إرسال الرمز',
    enterOtp: 'أدخل رمز التحقق',
    otpSentTo: 'تم إرسال الرمز إلى',
    verify: 'تحقق',
    resendIn: 'إعادة الإرسال بعد',
    resendNow: 'إعادة إرسال الرمز',
    fallbackMsg: 'إذا تأخرت الرسالة القصيرة، سنرسل لك رسالة عبر واتساب.',
    success: 'تم التحقق بنجاح!',
    successDesc: 'تم التحقق من رقمك بنجاح.',
    continue: 'متابعة',
    invalidPhone: 'رقم هاتف غير صالح',
    invalidOtp: 'رمز غير صالح',
  }
};

export default function PhoneAuth() {
  const [lang, setLang] = useState<Language>('fr');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('+212');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [showFallback, setShowFallback] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = translations[lang];
  const isRtl = lang === 'ar';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    if (step === 2 && countdown === 40) { // 20 seconds passed (60 - 40)
      setShowFallback(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phone.match(/^(\+212|0)[567]\d{8}$/)) {
      setError(t.invalidPhone);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setVerificationId(data.verificationId);
      setStep(2);
      setCountdown(60);
      setShowFallback(false);
      
      // Simulate auto-detect OTP after 3 seconds
      setTimeout(() => {
        if (step === 2) {
          // In a real app, this would use the WebOTP API or SMS Retriever API
          console.log("Auto-detecting OTP...");
        }
      }, 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId, code })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setStep(3);
    } catch (err: any) {
      setError(err.message || t.invalidOtp);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/resend-otp-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setVerificationId(data.verificationId);
      setCountdown(60);
      setShowFallback(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    if (newOtp.every(v => v !== '')) {
      // Auto submit when all filled
      setTimeout(() => {
        handleVerifyOtp();
      }, 100);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Globe className="w-5 h-5 text-gray-500" />
        <select 
          value={lang} 
          onChange={(e) => setLang(e.target.value as Language)}
          className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
        >
          <option value="fr">Français</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">{t.title}</h1>
          <p className="text-center text-gray-500 mb-8">{t.subtitle}</p>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.enterPhone}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`block w-full ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all`}
                      placeholder={t.phonePlaceholder}
                      dir="ltr"
                    />
                  </div>
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {t.sendCode}
                      <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">{t.otpSentTo}</p>
                  <p className="font-semibold text-gray-900" dir="ltr">{phone}</p>
                </div>

                <div className="flex justify-center gap-2" dir="ltr">
                  {otp?.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      maxLength={1}
                    />
                  ))}
                </div>

                {error && <p className="text-center text-sm text-red-600">{error}</p>}

                {showFallback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 text-green-800 p-3 rounded-lg text-sm text-center border border-green-100"
                  >
                    {t.fallbackMsg}
                  </motion.div>
                )}

                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || otp.some(v => !v)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : t.verify}
                  </button>

                  <button
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || loading}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
                  >
                    {countdown > 0 ? `${t.resendIn} ${countdown}s` : t.resendNow}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h2>
                  <p className="text-gray-500">{t.successDesc}</p>
                </div>

                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all"
                >
                  {t.continue}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
