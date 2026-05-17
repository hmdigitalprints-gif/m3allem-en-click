import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Clock, 
  Briefcase, 
  CheckCircle, 
  Wallet, 
  Calendar, 
  Plus, 
  Banknote, 
  User, 
  Zap, 
  MapPin, 
  X,
  Navigation,
  ArrowRight,
  Star,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { StatCard } from '../shared/StatCard';
import { formatDuration } from '../../../lib/utils';

interface DashboardTabProps {
  stats: any;
  bookings: any[];
  handleStatusUpdate: (id: string, status: any) => Promise<void>;
  setActiveTab: (tab: string) => void;
  setShowAddServiceModal: (show: boolean) => void;
  completingBookingId: string | null;
  currentTime: Date;
  onAction: (msg: string) => void;
}

export function DashboardTab({
  stats,
  bookings,
  handleStatusUpdate,
  setActiveTab,
  setShowAddServiceModal,
  completingBookingId,
  currentTime,
  onAction
}: DashboardTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-10">
      {/* 1. Earnings & Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl shadow-black/5">
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Wallet size={16} className="text-emerald-500" />
                </div>
                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">{t('total_earnings', 'Total Earnings')}</p>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-[var(--accent)] tracking-tighter italic">
                {Number(stats.earnings || 0).toFixed(2)} <span className="text-xl md:text-2xl text-[var(--text-muted)] opacity-50">MAD</span>
              </h2>
           </div>
           
           <div className="mt-8 flex gap-4 relative z-10">
              <button 
                onClick={() => setActiveTab('wallet')}
                className="bg-[var(--accent)] text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
              >
                {t('manage_wallet', 'Manage Wallet')}
                <ArrowRight size={14} />
              </button>
           </div>
           
           <Wallet className="absolute -right-8 -bottom-8 w-48 h-48 text-[var(--accent)] opacity-5 rotate-12 group-hover:rotate-6 transition-transform duration-700" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 lg:col-span-2">
           <div className="grid grid-cols-2 gap-4">
              <StatCardMini 
                label={t('active_jobs')} 
                value={stats.activeJobs} 
                icon={<Briefcase size={18} className="text-blue-500" />} 
              />
              <StatCardMini 
                label={t('pending')} 
                value={stats.pendingRequests} 
                icon={<Clock size={18} className="text-amber-500" />} 
              />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <StatCardMini 
                label={t('completed')} 
                value={stats.completedJobs} 
                icon={<CheckCircle2 size={18} className="text-emerald-500" />} 
              />
              <StatCardMini 
                label={t('avg_rating', 'Rating')} 
                value={stats.rating || '5.0'} 
                icon={<Star size={18} className="text-yellow-500 fill-yellow-500" />} 
              />
           </div>
        </div>
      </div>

      {/* 2. Active Missions (Ongoing Work) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <Zap size={20} className="text-[var(--accent)]" />
            {t('active_missions', 'Active Missions')}
          </h3>
          <button onClick={() => setActiveTab('requests')} className="text-xs font-black text-[var(--accent)] hover:underline uppercase tracking-widest">{t('view_all')}</button>
        </div>

        <AnimatePresence mode="popLayout">
          {bookings.filter(b => b.status === 'accepted' || b.status === 'ongoing' || b.status === 'en_route' || b.status === 'in_progress').length === 0 ? (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-12 text-center flex flex-col items-center gap-4 opacity-70"
            >
              <Briefcase size={48} className="text-[var(--text-muted)] opacity-30" />
              <p className="font-bold text-[var(--text-muted)]">{t('no_active_missions', 'No active missions. Check nearby jobs!')}</p>
              <button onClick={() => setActiveTab('nearby')} className="text-[var(--accent)] font-black text-xs uppercase tracking-widest">{t('find_work', 'Explore Nearby Jobs')}</button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings?.filter(b => b.status === 'accepted' || b.status === 'ongoing' || b.status === 'en_route' || b.status === 'in_progress')?.map(booking => (
                <MissionCard 
                  key={booking.id} 
                  booking={booking} 
                  handleStatusUpdate={handleStatusUpdate} 
                  completingBookingId={completingBookingId}
                  currentTime={currentTime}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* 3. Urgent Requests & Recent History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Pending Requests */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
              <Clock size={20} className="text-amber-500" />
              {t('new_requests', 'Urgent Requests')}
            </h3>
            <button onClick={() => setActiveTab('requests')} className="text-xs font-black text-[var(--accent)] hover:underline uppercase tracking-widest">{t('view_all')}</button>
          </div>

          <div className="space-y-4">
            {bookings.filter(b => b.status === 'pending').length === 0 ? (
              <div className="p-12 text-center bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] opacity-40 italic font-bold">
                {t('no_new_requests', 'No new booking requests')}
              </div>
            ) : (
              bookings.filter(b => b.status === 'pending').map(booking => (
                <div key={booking.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between group hover:border-[var(--accent)] transition-all">
                  <div className="flex items-center gap-4">
                    <img src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}`} className="w-10 h-10 rounded-xl object-cover" alt="" />
                    <div>
                      <h4 className="font-bold text-sm">{booking.other_party_name}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] font-black uppercase">{booking.service_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleStatusUpdate(booking.id, 'accepted')} className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:scale-110 transition-all"><CheckCircle2 size={16} /></button>
                    <button onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><X size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shortcuts / Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <Plus size={20} className="text-[var(--accent)]" />
            {t('artisan_shortcuts', 'Manage Business')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <ShortcutCard 
              label={t('add_service', 'Add Service')}
              icon={<Briefcase size={24} />}
              onClick={() => setShowAddServiceModal(true)}
              color="blue"
            />
            <ShortcutCard 
              label={t('nearby_jobs', 'Find Work')}
              icon={<MapPin size={24} />}
              onClick={() => setActiveTab('nearby')}
              color="emerald"
            />
            <ShortcutCard 
              label={t('view_reviews', 'Reviews')}
              icon={<Star size={24} />}
              onClick={() => setActiveTab('reviews')}
              color="amber"
            />
            <ShortcutCard 
              label={t('withdraw_funds', 'Withdraw')}
              icon={<Wallet size={24} />}
              onClick={() => setActiveTab('wallet')}
              color="purple"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCardMini({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4 flex flex-col justify-between hover:border-[var(--accent)] transition-all group">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[var(--text-muted)] text-[8px] font-black uppercase tracking-widest">{label}</p>
        <div className="transition-transform group-hover:scale-110">
          {icon}
        </div>
      </div>
      <div className="text-xl font-black italic">{value}</div>
    </div>
  );
}

function MissionCard({ booking, handleStatusUpdate, completingBookingId, currentTime }: { booking: any, handleStatusUpdate: any, completingBookingId: any, currentTime: any }) {
  const { t } = useTranslation();
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-6 hover:border-[var(--accent)] transition-all group relative overflow-hidden shadow-lg shadow-black/5">
      <div className="flex items-center gap-5 mb-6">
        <div className="relative">
          <img src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}`} className="w-16 h-16 rounded-2xl object-cover border-2 border-[var(--border)] group-hover:border-[var(--accent)] transition-all" alt="" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-[var(--card-bg)] rounded-full animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-black text-lg tracking-tighter italic">{booking.other_party_name}</h4>
            <span className="text-[8px] font-black text-blue-500 uppercase bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              {t(`status_${booking.status}`, booking.status) as string}
            </span>
          </div>
          <p className="text-[10px] text-[var(--accent)] font-black uppercase tracking-wider">{booking.service_name}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><MapPin size={12} /> {t('location', 'Location')}</span>
          <span className="text-[var(--text)]">{t('client_waiting', 'Client waiting')}</span>
        </div>
        
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <div>
            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase">{t('payout', 'Payout')}</p>
            <p className="font-black text-xl italic text-[var(--text)]">{(booking.price || 0).toFixed(2)} MAD</p>
          </div>
          
          <div className="flex gap-2">
             {booking.status === 'accepted' ? (
                <button onClick={() => handleStatusUpdate(booking.id, 'en_route')} className="bg-[var(--accent)] text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[var(--accent)]/30">
                  {t('start_job', 'Go Now')}
                </button>
             ) : booking.status === 'en_route' ? (
                <button onClick={() => handleStatusUpdate(booking.id, 'in_progress')} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/30">
                  {t('status_arrived', 'Arrived')}
                </button>
             ) : (
                <button onClick={() => handleStatusUpdate(booking.id, 'completed')} className="bg-black text-[var(--accent)] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all border border-[var(--accent)]/50">
                  {t('finish_job', 'Finish Mission')}
                </button>
             )}
          </div>
        </div>
      </div>
      
      <Briefcase className="absolute -right-8 -bottom-8 w-32 h-32 text-[var(--accent)] opacity-5 rotate-12 transition-transform group-hover:rotate-6" />
    </div>
  );
}

function ShortcutCard({ label, icon, onClick, color }: { label: string, icon: React.ReactNode, onClick: () => void, color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-500 hover:border-blue-500',
    emerald: 'text-emerald-500 hover:border-emerald-500',
    amber: 'text-amber-500 hover:border-amber-500',
    purple: 'text-purple-500 hover:border-purple-500',
  };
  
  return (
    <button 
      onClick={onClick}
      className={`bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex flex-col items-center gap-3 transition-all hover:scale-105 ${colors[color]} group shadow-sm`}
    >
      <div className="transition-transform group-hover:scale-110">
        {icon}
      </div>
      <span className="font-black text-[10px] uppercase tracking-widest text-[var(--text)]">{label}</span>
      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-[var(--text-muted)]" />
    </button>
  );
}
