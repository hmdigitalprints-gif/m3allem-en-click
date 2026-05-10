import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User as UserIcon, ShieldCheck, Phone, Calendar, Star, LayoutDashboard, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function PhoneDashboard() {
  const { t } = useTranslation();
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/phone-auth');
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/phone-auth');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
      <div className="md:ml-20 p-6 md:p-12 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center justify-between md:block">
            <div>
              <p className="micro-label mb-2">{t('dashboard_welcome', 'Welcome Back')}</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t('dashboard_user_title', 'User ')} <span className="text-[var(--accent)]">{t('dashboard_title_2', 'Dashboard')}</span></h1>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="md:hidden p-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--accent)] shadow-lg active:scale-95 transition-all"
            >
              <Home size={24} />
            </button>
          </div>
          <div className="flex items-center gap-4 bg-[var(--card-bg)] p-2 rounded-full border border-[var(--border)] pr-6">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <UserIcon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{t('dashboard_auth_as', 'Authenticated as')}</p>
              <p className="font-bold">{user?.email || user?.phone || user?.name}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-luxury p-8 space-y-8"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] p-1 mb-6">
                  <div className="w-full h-full rounded-full bg-[var(--card-bg)] flex items-center justify-center">
                    <UserIcon size={40} className="text-[var(--accent)]" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{user?.name}</h3>
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  {user.verified ? t('dashboard_verified', 'Verified Account') : t('dashboard_unverified', 'Unverified Account')}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">ID</span>
                  <span className="text-xs font-mono bg-[var(--text)]/5 px-2 py-1 rounded">{user?.id.substring(0, 12)}...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">{t('dashboard_provider', 'Provider')}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                    {t('dashboard_local_auth', 'Local Custom Auth')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">{t('dashboard_role', 'Role')}</span>
                  <span className="text-xs font-bold capitalize">{t(`role_${user?.role}`, user?.role)}</span>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full py-4 rounded-2xl border border-rose-500/20 text-rose-500 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                {t('profile_btn_logout', 'Sign Out')}
              </button>
            </motion.div>
          </div>

          {/* Stats & Activity */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-luxury p-6 flex items-center gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Calendar size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('dashboard_lbl_active', 'Active Records')}</p>
                  <h4 className="text-3xl font-bold">12</h4>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-luxury p-6 flex items-center gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Star size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('dashboard_avg_rating', 'Avg. Rating')}</p>
                  <h4 className="text-3xl font-bold">4.9</h4>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-luxury p-8"
            >
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Phone size={20} className="text-[var(--accent)]" />
                {t('dashboard_security_log', 'Security Logs')}
              </h3>
              <div className="space-y-6">
                {[
                  { event: t('dashboard_log_success', 'OTP/Password Verification Success'), time: t('dashboard_just_now', 'Just now'), status: 'success' },
                  { event: t('dashboard_log_session', 'New Login Session'), time: t('dashboard_mins_ago', '2 minutes ago'), status: 'info' }
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      <div>
                        <p className="font-bold text-sm">{log.event}</p>
                        <p className="text-xs text-[var(--text-muted)]">{log.time}</p>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      {t('dashboard_authorized', 'Verified')}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

