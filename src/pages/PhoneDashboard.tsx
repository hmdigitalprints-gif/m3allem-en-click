import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User as UserIcon, ShieldCheck, Phone, Calendar, MapPin, Star, Bell, Settings, LayoutDashboard, Home } from 'lucide-react';

export default function PhoneDashboard() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/phone-auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/phone-auth');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <div className="fixed left-0 top-0 h-full w-20 bg-[var(--sidebar-bg)] border-r border-[var(--border)] hidden md:flex flex-col items-center py-8 gap-8 z-50">
        <div className="w-12 h-12 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
          <ShieldCheck size={24} />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--text)]/5 transition-colors"
            title="Back to Home"
          >
            <Home size={20} />
          </button>
          <button className="p-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]"><LayoutDashboard size={20} /></button>
          <button className="p-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--text)]/5 transition-colors"><Bell size={20} /></button>
          <button className="p-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--text)]/5 transition-colors"><Settings size={20} /></button>
        </div>
        <button 
          onClick={handleLogout}
          className="p-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>

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
              title="Back to Home"
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
              <p className="font-bold">{user?.email || user?.phoneNumber}</p>
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
                <h3 className="text-2xl font-bold mb-1">{user?.displayName || user?.email || user?.phoneNumber}</h3>
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  Verified Account
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">UID</span>
                  <span className="text-xs font-mono bg-[var(--text)]/5 px-2 py-1 rounded">{user?.uid.substring(0, 12)}...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Provider</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                    {user?.providerData[0]?.providerId === 'password' ? 'Email/Password' : 'Phone OTP'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Last Login</span>
                  <span className="text-xs font-bold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full py-4 rounded-2xl border border-rose-500/20 text-rose-500 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
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
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('dashboard_lbl_active', 'Active Bookings')}</p>
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
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Avg. Rating</p>
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
                Security Logs
              </h3>
              <div className="space-y-6">
                {[
                  { event: 'OTP Verification Success', time: 'Just now', status: 'success' },
                  { event: 'New Login Session', time: '2 minutes ago', status: 'info' },
                  { event: 'Phone Number Linked', time: '5 minutes ago', status: 'success' },
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
                      Verified
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
