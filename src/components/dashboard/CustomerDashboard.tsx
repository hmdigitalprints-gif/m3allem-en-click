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
  LayoutDashboard,
  Sparkles,
  Loader2,
  User,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface CustomerDashboardProps {
  onNavigate: (tab: any) => void;
  onAction: (msg: string) => void;
}

export default function CustomerDashboard({ onNavigate, onAction }: CustomerDashboardProps) {
  const { user } = useAuth();
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
      try {
        const res = await fetch('/api/bookings', { 
          credentials: 'include'
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
          setRecentBookings(data.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch client stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* 1. Wallet & Top Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] rounded-3xl p-8 relative overflow-hidden group shadow-xl shadow-[var(--accent)]/20">
          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-black/60 text-xs font-black uppercase tracking-widest mb-1">{t('wallet_balance')}</p>
                <h2 className="text-4xl md:text-5xl font-black text-black">{(user?.wallet_balance || 0).toFixed(2)} <span className="text-2xl opacity-70">MAD</span></h2>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <CreditCard size={24} className="text-black" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onNavigate('account')}
                className="bg-black text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus size={16} />
                {t('top_up_wallet', 'Top Up Wallet')}
              </button>
              <button 
                onClick={() => onNavigate('find')}
                className="bg-white/20 backdrop-blur-md text-black border border-black/10 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <Search size={16} />
                {t('find_pro', 'Find Pro')}
              </button>
            </div>
          </div>
          <CreditCard className="absolute -right-12 -bottom-12 w-64 h-64 text-black opacity-5 rotate-12 group-hover:rotate-6 transition-transform duration-700" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <StatCardSmall 
            label={t('active_jobs')} 
            value={stats.activeBookings} 
            icon={<Clock className="text-blue-500" />} 
          />
          <StatCardSmall 
            label={t('completed_jobs', 'Completed Jobs')} 
            value={stats.completedBookings} 
            icon={<CheckCircle2 className="text-emerald-500" />} 
          />
        </div>
      </div>

      {/* 2. Active Orders Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold uppercase italic tracking-tighter flex items-center gap-2">
            <Clock size={20} className="text-[var(--accent)]" />
            {t('active_orders', 'Ongoing Services')}
          </h3>
          {stats.activeBookings > 0 && (
            <button onClick={() => onNavigate('bookings')} className="text-xs font-black text-[var(--accent)] hover:underline uppercase tracking-widest">{t('view_all')}</button>
          )}
        </div>

        {recentBookings.filter(b => !['completed', 'cancelled', 'rejected'].includes(b.status)).length === 0 ? (
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-12 text-center flex flex-col items-center gap-4 opacity-70">
            <Calendar size={48} className="text-[var(--text-muted)]" />
            <p className="font-bold text-[var(--text-muted)]">{t('no_active_orders', 'No active orders at the moment')}</p>
            <button onClick={() => onNavigate('find')} className="text-[var(--accent)] font-black text-xs uppercase tracking-widest">{t('start_browsing', 'Start Browsing Services')}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentBookings.filter(b => !['completed', 'cancelled', 'rejected'].includes(b.status)).map(booking => (
              <BookingCard key={booking.id} booking={booking} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Completed & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold uppercase italic tracking-tighter flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-500" />
              {t('order_history', 'Order History')}
            </h3>
            <button onClick={() => onNavigate('bookings')} className="text-xs font-black text-[var(--accent)] hover:underline uppercase tracking-widest">{t('view_all')}</button>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] overflow-hidden">
            {recentBookings.filter(b => ['completed'].includes(b.status)).length === 0 ? (
              <div className="p-12 text-center opacity-40">
                <FileText size={48} className="mx-auto mb-4" />
                <p className="font-bold">{t('no_history', 'No completed orders yet')}</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {recentBookings.filter(b => ['completed'].includes(b.status)).map(booking => (
                  <div key={booking.id} className="p-4 hover:bg-[var(--glass-bg)] transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--text)]/5 flex items-center justify-center font-bold overflow-hidden border border-[var(--border)]">
                        <img src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}`} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{booking.service_name}</h4>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">{booking.other_party_name} • {new Date(booking.scheduled_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm">{Number(booking.price || 0).toFixed(2)} MAD</p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase">{t('status_completed')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold uppercase italic tracking-tighter flex items-center gap-2">
            <Sparkles size={20} className="text-amber-500" />
            {t('quick_actions', 'Shortcuts')}
          </h3>
          <div className="grid grid-cols-1 gap-3">
             <ShortcutButton 
                onClick={() => onNavigate('find')}
                icon={<Search size={20} />}
                label={t('request_new_service', 'Request Service')}
                color="blue"
             />
             <ShortcutButton 
                onClick={() => onNavigate('store')}
                icon={<ShoppingBag size={20} />}
                label={t('browse_store', 'Browse Store')}
                color="emerald"
             />
             <ShortcutButton 
                onClick={() => onNavigate('messages')}
                icon={<MessageSquare size={20} />}
                label={t('open_messages', 'My Messages')}
                color="amber"
             />
             <ShortcutButton 
                onClick={() => onNavigate('account')}
                icon={<User size={20} />}
                label={t('profile_settings', 'Account Settings')}
                color="purple"
             />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCardSmall({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 flex flex-col justify-between group hover:border-[var(--accent)] transition-all">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">{label}</p>
        <div className="p-2 bg-[var(--text)]/5 rounded-xl transition-transform group-hover:scale-110">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}

function BookingCard({ booking, onNavigate }: { booking: any, onNavigate: (tab: any) => void }) {
  const { t } = useTranslation();
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-5 hover:border-[var(--accent)] transition-all group relative overflow-hidden">
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-[var(--text)]/5 flex items-center justify-center overflow-hidden border border-[var(--border)]">
          <img src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}`} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-black text-sm tracking-tight">{booking.service_name}</h4>
            <span className="text-[10px] font-black text-blue-500 uppercase bg-blue-500/10 px-2 py-0.5 rounded-full">
              {t(`status_${booking.status}`, booking.status) as string}
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider mt-1">
            {booking.other_party_name} • {new Date(booking.scheduled_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4 relative z-10">
        <button 
          onClick={() => onNavigate('bookings')}
          className="text-xs font-black text-[var(--accent)] hover:scale-105 transition-all flex items-center gap-2"
        >
          {t('track_status', 'Track Order')}
          <ArrowRight size={14} />
        </button>
        <div className="text-right">
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase">{t('estimated_price', 'Est. Price')}</p>
          <p className="font-black text-sm">{(booking.price || 0).toFixed(2)} MAD</p>
        </div>
      </div>
      
      <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-[var(--accent)] opacity-5 rotate-12" />
    </div>
  );
}

function ShortcutButton({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/5 hover:bg-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/5 hover:bg-amber-500/10',
    purple: 'text-purple-500 bg-purple-500/5 hover:bg-purple-500/10',
  };
  
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] transition-all hover:border-[var(--accent)] group ${colors[color]}`}
    >
      <div className="flex items-center gap-4">
        <div className="transition-transform group-hover:scale-110">
          {icon}
        </div>
        <span className="font-black text-xs uppercase tracking-widest text-[var(--text)]">{label}</span>
      </div>
      <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-all transform group-hover:translate-x-1" />
    </button>
  );
}
