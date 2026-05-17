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
  Navigation
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title={t('pending_requests')} value={stats.pendingRequests} icon={<Clock />} />
        <StatCard title={t('active_jobs')} value={stats.activeJobs} icon={<Briefcase />} />
        <StatCard title={t('completed')} value={stats.completedJobs} icon={<CheckCircle />} />
        <StatCard title={t('earnings')} value={`${Number(stats.earnings).toFixed(2)} MAD`} icon={<Wallet />} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => setActiveTab('requests')}
          className="p-6 rounded-3xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex flex-col items-center gap-3 hover:bg-[var(--accent)] hover:text-white transition-all group"
        >
          <Calendar size={24} className="text-[var(--accent)] group-hover:text-white" />
          <span className="font-bold text-sm">{t('nav_requests')}</span>
        </button>
        <button 
          onClick={() => setShowAddServiceModal(true)}
          className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center gap-3 hover:bg-blue-500 hover:text-white transition-all group"
        >
          <Plus size={24} className="text-blue-500 group-hover:text-white" />
          <span className="font-bold text-sm">{t('nav_my_services')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('wallet')}
          className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center gap-3 hover:bg-emerald-500 hover:text-white transition-all group"
        >
          <Banknote size={24} className="text-emerald-500 group-hover:text-white" />
          <span className="font-bold text-sm">{t('nav_wallet')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center gap-3 hover:bg-purple-500 hover:text-white transition-all group"
        >
          <User size={24} className="text-purple-500 group-hover:text-white" />
          <span className="font-bold text-sm">{t('nav_profile')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 glass relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent)]/50 to-transparent" />
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-[var(--text)] flex items-center gap-3">
              <Zap size={24} className="text-[var(--accent)]" />
              {t('recent_requests')}
            </h3>
            <button className="text-xs font-bold text-[var(--accent)] hover:underline uppercase tracking-widest">{t('view_all')}</button>
          </div>
          <div className="space-y-6">
            {bookings.filter(b => b.status === 'pending').length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-48 h-48 mb-6 relative">
                  <img src="/input_file_1.png" alt={t('no_requests')} className="w-full h-full object-contain opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
                </div>
                <p className="text-[var(--text-muted)] font-bold text-lg tracking-tight uppercase italic opacity-40 italic">{t('waiting_requests', 'Waiting for your first request...')}</p>
              </div>
            ) : (
              bookings?.filter(b => b.status === 'pending')?.map(booking => (
                <motion.div 
                  key={booking.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[var(--text)]/5 border border-[var(--border)] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[var(--text)]/10 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <img src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}&background=random`} alt={booking.other_party_name} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 border-2 border-[var(--card-bg)] rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{booking.other_party_name}</h4>
                      <p className="text-sm text-[var(--text-muted)] font-medium">{booking.service_name}</p>
                      <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] mt-2 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(booking.scheduled_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-2">
                      <span className="text-xl font-black text-[var(--text)]">{Number(booking.price).toFixed(2)}</span>
                      <span className="text-[10px] font-bold text-[var(--text-muted)] ml-1">MAD</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(booking.id, 'accepted')} 
                        className="w-12 h-12 flex items-center justify-center bg-[var(--success)] text-white rounded-2xl hover:scale-110 transition-all active:scale-95 shadow-lg shadow-[var(--success)]/20"
                        title="Accept"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')} 
                        className="w-12 h-12 flex items-center justify-center bg-[var(--destructive)]/10 text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white rounded-2xl transition-all active:scale-95"
                        title="Decline"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 glass relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--success)]/50 to-transparent" />
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-[var(--text)] flex items-center gap-3">
              <Briefcase size={24} className="text-[var(--success)]" />
              {t('active_jobs')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('status_live', 'Live Status')}</span>
            </div>
          </div>
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {bookings.filter(b => b.status === 'accepted' || b.status === 'ongoing' || b.status === 'en_route' || b.status === 'in_progress').length === 0 ? (
                <motion.div 
                  key="no-jobs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-48 h-48 mb-6 relative">
                    <img src="/input_file_2.png" alt={t('no_active_jobs')} className="w-full h-full object-contain opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
                  </div>
                  <p className="text-[var(--text-muted)] font-bold text-lg tracking-tight uppercase italic opacity-40 italic">{t('ready_mission', 'Ready to start your next mission?')}</p>
                </motion.div>
              ) : (
                bookings?.filter(b => b.status === 'accepted' || b.status === 'ongoing' || b.status === 'en_route' || b.status === 'in_progress')?.map(booking => (
                  <motion.div 
                    key={booking.id} 
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.9, 
                      y: -20,
                      filter: 'blur(8px)',
                      transition: { duration: 0.4, ease: "circIn" }
                    }}
                    className={`bg-[var(--text)]/5 border border-[var(--border)] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative group overflow-hidden`}
                  >
                    <AnimatePresence>
                      {completingBookingId === booking.id && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-50 bg-[var(--success)] flex flex-col items-center justify-center text-white"
                        >
                          <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2"
                          >
                            <CheckCircle size={40} className="text-white" />
                          </motion.div>
                          <motion.span 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg font-black uppercase tracking-widest text-white shadow-sm"
                          >
                            {t('completed')}!
                          </motion.span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${booking.status === 'ongoing' || booking.status === 'in_progress' ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'}`} />
                  
                  <div className="flex items-center gap-5">
                    <img src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}&background=random`} alt={booking.other_party_name} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg text-[var(--text)]">{booking.other_party_name}</h4>
                        {(booking.status === 'ongoing' || booking.status === 'in_progress') && (
                          <span className="px-2 py-0.5 bg-[var(--success)]/10 text-[var(--success)] text-[8px] font-black uppercase tracking-widest rounded-full">{t('status_in_progress', 'In Progress')}</span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-muted)] font-medium">{booking.service_name}</p>
                      <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] mt-2 font-bold">
                        <MapPin size={12} className="text-[var(--accent)]" />
                        {t('client_location', 'Client Location')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-xl font-black text-[var(--accent)] block">{Number(booking.price).toFixed(2)} MAD</span>
                      {(booking.status === 'ongoing' || booking.status === 'in_progress') && booking.started_at && (
                        <div className="flex items-center gap-1.5 text-[var(--success)] font-mono text-xs font-bold mt-1">
                          <Clock size={14} />
                          {formatDuration(booking.started_at, currentTime)}
                        </div>
                      )}
                    </div>
                    
                    {booking.status === 'accepted' ? (
                      <button 
                        onClick={() => handleStatusUpdate(booking.id, 'en_route')} 
                        className="px-6 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2 active:scale-95"
                      >
                        <Navigation size={18} />
                        {t('start_job', 'Start')}
                      </button>
                    ) : booking.status === 'en_route' ? (
                      <button 
                        onClick={() => handleStatusUpdate(booking.id, 'in_progress')} 
                        className="px-6 py-3 bg-[var(--success)] text-white hover:opacity-90 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[var(--success)]/20 flex items-center gap-2 active:scale-95"
                      >
                        <MapPin size={18} />
                        {t('status_arrived', 'Arrived')}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusUpdate(booking.id, 'completed')} 
                        className="px-6 py-3 bg-[var(--accent)] text-white hover:opacity-90 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2 active:scale-95"
                      >
                        <CheckCircle size={18} />
                        {t('finish_job', 'Finish')}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
        <div className="bg-gradient-to-br from-[var(--accent)]/10 to-transparent border border-[var(--border)] rounded-[40px] p-10 glass relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4 tracking-tighter">{t('grow_business_title', 'Grow Your Business')}</h3>
            <p className="text-[var(--text-muted)] font-medium mb-8 max-w-sm">{t('grow_business_desc', 'Complete more jobs and maintain a high rating to unlock premium features and higher visibility.')}</p>
            <button className="px-8 py-4 bg-[var(--text)] text-[var(--bg)] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95">{t('learn_more')}</button>
          </div>
          <img src="/input_file_6.png" alt="Grow" className="absolute -right-10 -bottom-10 w-64 h-64 object-contain opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
        </div>

        <div className="bg-gradient-to-br from-[var(--success)]/10 to-transparent border border-[var(--border)] rounded-[40px] p-10 glass relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4 tracking-tighter">{t('stay_connected_title', 'Stay Connected')}</h3>
            <p className="text-[var(--text-muted)] font-medium mb-8 max-w-sm">{t('stay_connected_desc', "Keep your status 'Online' to receive real-time requests from clients in your immediate vicinity.")}</p>
            <button className="px-8 py-4 bg-[var(--text)] text-[var(--bg)] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95">{t('check_status')}</button>
          </div>
          <img src="/input_file_1.png" alt="Connect" className="absolute -right-10 -bottom-10 w-64 h-64 object-contain opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
        </div>
      </div>
    </div>
  );
}
