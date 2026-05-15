import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  Plus, 
  Search, 
  Settings, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight,
  MessageSquare,
  FileText,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface CustomerDashboardProps {
  onNavigate: (tab: any) => void;
  onAction: (msg: string) => void;
}

export default function CustomerDashboard({ onNavigate, onAction }: CustomerDashboardProps) {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/bookings', { 
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const active = data.filter((b: any) => !['completed', 'cancelled', 'rejected'].includes(b.status));
          const completed = data.filter((b: any) => b.status === 'completed');
          const spent = completed.reduce((acc: number, b: any) => acc + (b.price || 0), 0);

          setStats({
            totalBookings: data.length,
            activeBookings: active.length,
            completedBookings: completed.length,
            totalSpent: spent
          });
          setRecentBookings(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch client stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token]);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto pb-24">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-[var(--accent)]/20 to-transparent border border-[var(--border)] rounded-[40px] p-8 glass overflow-hidden relative group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
              {t('greeting_salam')}, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-[var(--text-muted)] font-medium max-w-md">
              {t('dashboard_customer_desc')}
            </p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => onNavigate('find')}
                className="bg-[var(--accent)] text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--accent)]/30 flex items-center gap-2"
              >
                <Plus size={18} />
                {t('new_job_request')}
              </button>
          </div>
        </div>
        <LayoutDashboard className="absolute -right-12 -bottom-12 w-64 h-64 opacity-5 rotate-12 group-hover:rotate-6 transition-transform duration-700" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title={t('active_jobs')} value={stats.activeBookings} icon={<Clock size={20} className="text-blue-500" />} />
        <StatCard title={t('completed')} value={stats.completedBookings} icon={<CheckCircle2 size={20} className="text-emerald-500" />} />
        <StatCard title={t('nav_documents')} value={stats.totalBookings} icon={<FileText size={20} className="text-indigo-500" />} />
        <StatCard title={t('total_spent')} value={`${Number(stats.totalSpent).toFixed(2)} MAD`} icon={<CreditCard size={20} className="text-amber-500" />} />
      </div>

      {/* Quick Actions Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="grid grid-cols-2 gap-4">
          <ActionButton 
            onClick={() => onNavigate('find')} 
            icon={<Search className="text-blue-500" />} 
            label={t('find_artisan')} 
            sub={t('store_feat_quality_desc')} 
          />
          <ActionButton 
            onClick={() => onNavigate('store')} 
            icon={<ShoppingBag className="text-emerald-500" />} 
            label={t('home_store')} 
            sub={t('store_hero_desc')} 
          />
          <ActionButton 
            onClick={() => onNavigate('messages')} 
            icon={<MessageSquare className="text-amber-500" />} 
            label={t('nav_messages')} 
            sub={t('chat_anytime')} 
          />
          <ActionButton 
            onClick={() => onNavigate('documents')} 
            icon={<FileText className="text-purple-500" />} 
            label={t('nav_documents')} 
            sub={t('profile_desc_payments')} 
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 glass overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock size={20} className="text-[var(--accent)]" />
              {t('recent_activity')}
            </h3>
            <button onClick={() => onNavigate('bookings')} className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest hover:underline">{t('view_all')}</button>
          </div>
          
          <div className="space-y-4 flex-1">
            {recentBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-40 text-center py-8">
                <LayoutDashboard size={48} className="mb-4" />
                <p className="font-bold">{t('no_recent_activity')}</p>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between group hover:bg-[var(--text)]/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                      <img src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{booking.service_name}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase">{booking.other_party_name} • {new Date(booking.scheduled_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {t(`status_${booking.status}`, booking.status) as string}
                    </span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-5 md:p-6 flex flex-col relative overflow-hidden group">
      <div className="mb-4 p-2 bg-[var(--text)]/5 w-fit rounded-xl transition-transform group-hover:scale-110">
        {icon}
      </div>
      <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
      <div className="text-xl md:text-2xl font-black">{value}</div>
    </div>
  );
}

function ActionButton({ onClick, icon, label, sub }: { onClick: () => void, icon: React.ReactNode, label: string, sub: string }) {
  return (
    <button 
      onClick={onClick}
      className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 flex flex-col items-start gap-4 hover:border-[var(--accent)] transition-all hover:shadow-xl hover:shadow-[var(--accent)]/5 group text-left"
    >
      <div className="w-12 h-12 rounded-2xl bg-[var(--text)]/5 flex items-center justify-center text-xl transition-transform group-hover:scale-110 group-hover:bg-[var(--accent)]/10">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-sm tracking-tight">{label}</h4>
        <p className="text-[10px] text-[var(--text-muted)] font-medium leading-relaxed">{sub}</p>
      </div>
    </button>
  );
}
