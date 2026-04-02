import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

export const LoginScreen = ({ onLogin, onNavigateToRegister, showToast }: { 
  onLogin: (data: any) => void; 
  onNavigateToRegister: () => void;
  showToast?: (msg: string, type?: 'success' | 'info') => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin({ email, password });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 font-sans selection:bg-[#FFD700] selection:text-black">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFD700]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFD700]/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo / Branding */}
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-[#FFD700] rounded-[22px] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,215,0,0.2)]"
          >
            <ShieldCheck size={32} className="text-black" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">M3ALLEM <span className="text-[#FFD700]">EN CLICK</span></h1>
          <p className="text-white/40 text-sm font-medium tracking-wide uppercase">Premium Home Services</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-10 backdrop-blur-xl shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Welcome Back</h2>
            <p className="text-white/40 text-sm">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FFD700] transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-[#FFD700]/50 focus:bg-white/[0.08] transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Password</label>
                <button type="button" onClick={() => showToast ? showToast('Password reset functionality coming soon!', 'info') : alert('Password reset functionality coming soon!')} className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#FFD700] hover:opacity-80 transition-opacity">Forgot Password?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FFD700] transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-[#FFD700]/50 focus:bg-white/[0.08] transition-all placeholder:text-white/10"
                />
              </div>
              <PasswordStrengthIndicator password={password} />
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FFD700] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#E6C200] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold">
              <span className="bg-[#0c0c0c] px-4 text-white/20">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => showToast ? showToast('Google login coming soon!', 'info') : alert('Google login coming soon!')} className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-xs font-bold">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale opacity-50" alt="Google" />
              Google
            </button>
            <button onClick={() => showToast ? showToast('GitHub login coming soon!', 'info') : alert('GitHub login coming soon!')} className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-xs font-bold">
              <img src="https://github.com/favicon.ico" className="w-4 h-4 invert opacity-50" alt="GitHub" />
              GitHub
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center mt-8 text-white/40 text-sm">
          Don't have an account?{' '}
          <button 
            onClick={onNavigateToRegister}
            className="text-[#FFD700] font-bold hover:underline underline-offset-4 decoration-2"
          >
            Create an account
          </button>
        </p>

        {/* Trust Badge */}
        <div className="mt-12 flex items-center justify-center gap-2 text-white/20">
          <Sparkles size={14} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secured by M3allem En Click Cloud</span>
        </div>
      </motion.div>
    </div>
  );
};
