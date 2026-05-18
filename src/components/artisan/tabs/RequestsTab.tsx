import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Banknote, 
  Phone, 
  MessageCircle, 
  MessageSquare, 
  Video, 
  CheckCircle,
  Plus
} from 'lucide-react';

interface RequestsTabProps {
  bookings: any[];
  handleStatusUpdate: (bookingId: string, status: any) => Promise<void>;
  setActiveTab: (tab: string) => void;
  onAction: (msg: string) => void;
  user: any;
}

export function RequestsTab({
  bookings,
  handleStatusUpdate,
  setActiveTab,
  onAction,
  user
}: RequestsTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 text-left">
      <div>
        <h3 className="text-3xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('active_requests')}</h3>
        <p className="text-[var(--text-muted)] mt-1 font-medium">{t('active_requests_desc', 'Detailed view of your current and past bookings.')}</p>
      </div>

      <div className="grid gap-6">
        {bookings?.length === 0 ? (
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-20 text-center glass">
            <div className="w-24 h-24 bg-[var(--text)]/5 rounded-full flex items-center justify-center text-[var(--text-muted)] mx-auto mb-6">
              <Calendar size={40} />
            </div>
            <h4 className="text-xl font-bold text-[var(--text)] mb-2">{t('no_requests_yet')}</h4>
            <p className="text-[var(--text-muted)]">{t('no_requests_desc', 'When clients book your services, they will appear here.')}</p>
          </div>
        ) : (
          bookings?.filter(b => b.status !== 'completed' && b.status !== 'cancelled').map(booking => (
            <div key={booking.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 glass group hover:shadow-2xl transition-all">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Client Info & Status */}
                <div className="lg:w-1/4 space-y-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}&background=FFD700&color=000`} 
                      alt={booking.other_party_name} 
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-[var(--accent)]/10" 
                    />
                    <div>
                      <h4 className="font-black text-[var(--text)] tracking-tight">{booking.other_party_name}</h4>
                      <div className={`inline-flex px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest mt-1 ${
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        booking.status === 'proposal_submitted' ? 'bg-orange-500/20 text-orange-500' :
                        booking.status === 'proposal_approved' ? 'bg-blue-500/20 text-blue-500' :
                        booking.status === 'en_route' ? 'bg-purple-500/20 text-purple-500' :
                        booking.status === 'ongoing' || booking.status === 'in_progress' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                        'bg-[var(--destructive)]/20 text-[var(--destructive)]'
                      }`}>
                        {booking.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center gap-3 text-xs font-bold text-[var(--text)]">
                      <Clock size={14} className="text-[var(--accent)]" />
                      {new Date(booking.scheduled_at).toLocaleDateString()} at {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-start gap-3 text-xs font-bold text-[var(--text)]">
                      <MapPin size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{booking.address || 'Address not provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-[var(--accent)]">
                      <Banknote size={14} />
                      <span>{(Number(booking.price) || 0).toFixed(2)} MAD - {booking.payment_method?.toUpperCase() || 'CASH'}</span>
                    </div>
                    {booking.client_phone && (
                      <div className="flex items-center gap-3 pt-2">
                        <button 
                          onClick={() => window.open(`tel:${booking.client_phone}`)}
                          className="flex-1 py-2 bg-[var(--text)]/5 hover:bg-[var(--accent)]/10 text-[var(--text)] rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all border border-[var(--border)]"
                        >
                          <Phone size={12} className="text-[var(--accent)]" />
                          {t('call')}
                        </button>
                        <button 
                          onClick={() => window.open(`https://wa.me/${booking.client_phone.replace(/\D/g, '')}`)}
                          className="flex-1 py-2 bg-[var(--text)]/5 hover:bg-emerald-500/10 text-[var(--text)] rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all border border-[var(--border)]"
                        >
                          <MessageCircle size={12} className="text-emerald-500" />
                          {t('whatsapp')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Problem Description & Media */}
                <div className="flex-1 space-y-6">
                  <div className="bg-[var(--text)]/5 rounded-3xl p-6">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">{t('problem_description')}</h5>
                    <p className="text-sm font-medium text-[var(--text)] leading-relaxed italic">
                      "{booking.problem_description || t('no_problem_desc', 'No description provided by client.')}"
                    </p>
                  </div>

                  {booking.images && (JSON.parse(typeof booking.images === 'string' ? booking.images : JSON.stringify(booking.images)) || [])?.length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 pl-2">{t('attached_photos')}</h5>
                      <div className="flex flex-wrap gap-3">
                        {(JSON.parse(typeof booking.images === 'string' ? booking.images : JSON.stringify(booking.images)) || []).map((imgUrl: string, idx: number) => (
                          <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-[var(--border)] group/img relative">
                            <img src={imgUrl} alt="Problem" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <Plus size={16} className="text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="lg:w-1/4 flex flex-col gap-3 justify-center">
                  <div className="flex flex-col gap-2">
                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(booking.id, 'accepted')}
                          className="flex-1 py-3 bg-[var(--success)] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:opacity-90"
                        >
                          {t('accept', 'Accept')}
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                          className="flex-1 py-3 bg-rose-500/10 text-rose-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-rose-500/20"
                        >
                          {t('reject', 'Reject')}
                        </button>
                      </div>
                    )}
                    
                    {(booking.status === 'accepted' || booking.status === 'proposal_approved') && (
                      <button 
                        onClick={() => handleStatusUpdate(booking.id, 'en_route')}
                        className="w-full py-4 bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all hover:opacity-90 shadow-lg shadow-purple-500/20"
                      >
                        {t('start_journey', 'En Route')}
                      </button>
                    )}

                    {booking.status === 'en_route' && (
                      <button 
                        onClick={() => handleStatusUpdate(booking.id, 'ongoing')}
                        className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all hover:opacity-90 shadow-lg shadow-blue-500/20"
                      >
                        {t('start_work', 'Start Work')}
                      </button>
                    )}

                    {(booking.status === 'ongoing' || booking.status === 'in_progress') && (
                      <button 
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        className="w-full py-4 bg-[var(--success)] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all hover:opacity-90 shadow-lg shadow-emerald-500/20"
                      >
                        <CheckCircle size={16} />
                        {t('mark_completed', 'Complete Job')}
                      </button>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      setActiveTab('messages');
                    }}
                    className="w-full py-4 bg-[var(--text)]/5 hover:bg-[var(--text)]/10 text-[var(--text)] rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all"
                  >
                    <MessageSquare size={16} className="text-[var(--accent)]" />
                    {t('chat_client', 'Chat with Client')}
                  </button>
                  
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('start-live-diagnostic', {
                        detail: {
                          artisanId: user?.id, 
                          artisanName: user?.name,
                          artisanUserId: booking.client_id
                        }
                      }));
                    }}
                    className="w-full py-4 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all"
                  >
                    <Video size={16} />
                    {t('video_diagnostic')}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
