import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  Calendar, 
  CreditCard, 
  Wallet, 
  Banknote, 
  Sparkles, 
  CheckCircle, 
  MapPin, 
  X, 
  FileText, 
  Star, 
  Info 
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { bookingService, Booking } from '../../services/marketplaceService';
import { formatDuration } from '../../lib/utils';
import { ReviewModal } from './Modals';
import PaymentModal from './PaymentModal';

import { useTranslation } from 'react-i18next';

interface BookingsSectionProps {
  onAction: (msg: string) => void;
  onNavigate: (tab: 'home' | 'find' | 'store' | 'bookings' | 'account') => void;
  onTrackArtisan: (booking: any) => void;
}

export default function BookingsSection({ onAction, onNavigate, onTrackArtisan }: BookingsSectionProps) {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        console.error("Invalid bookings data:", data);
      }
      
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch('/api/bookings/proposals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const propData = await res.json();
        setProposals(propData);
      }
    } catch (err) {
      console.error("Failed to fetch bookings/proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAcceptProposal = async (proposal: any) => {
    try {
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch(`/api/bookings/${proposal.order_id}/accept-proposal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ proposalId: proposal.id })
      });
      if (res.ok) {
        onAction('Proposal accepted! You can now proceed to payment.');
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'proposal_submitted': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'proposal_approved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'en_route': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'ongoing':
      case 'in_progress': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border)]';
    }
  };

  const downloadInvoice = (booking: Booking) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('M3ALLEM INVOICE', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${booking.id}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
    
    // Details
    doc.setFontSize(14);
    doc.text('Service Details', 20, 50);
    doc.setFontSize(10);
    doc.text(`Service: ${booking.service_name}`, 20, 60);
    doc.text(`Artisan: ${booking.other_party_name}`, 20, 65);
    doc.text(`Scheduled At: ${new Date(booking.scheduled_at).toLocaleString()}`, 20, 70);
    
    // Pricing
    doc.setFontSize(14);
    doc.text('Pricing', 20, 85);
    doc.setFontSize(10);
    doc.text(`Base Price: ${booking.price} MAD`, 20, 95);
    doc.text(`Platform Fee: ${Math.round(booking.price * 0.05)} MAD`, 20, 100);
    
    doc.setFontSize(16);
    doc.text(`Total Paid: ${Math.round(booking.price * 1.05)} MAD`, 20, 115);
    
    // Footer
    doc.setFontSize(8);
    doc.text('Thank you for using M3allem En Click - The #1 Artisan Marketplace in Morocco', 20, 280);
    
    doc.save(`invoice-${booking.id}.pdf`);
    onAction('Invoice downloaded successfully');
  };

  return (
    <div className="p-6 md:p-12">
      <div className="mb-12">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">{t('your_bookings_title')} <span className="text-[var(--accent)]">{t('your_bookings_accent')}</span></h2>
        <p className="text-[var(--text-muted)] text-base md:text-xl">{t('your_bookings_desc')}</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3]?.map(i => <div key={i} className="h-32 bg-[var(--card-bg)] rounded-3xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-12 text-center">
          <Clock size={48} className="mx-auto mb-6 text-[var(--text-muted)] opacity-50" />
          <h3 className="text-2xl font-bold mb-2">{t('no_bookings_title')}</h3>
          <p className="text-[var(--text-muted)] mb-8">{t('no_bookings_desc')}</p>
            <button 
              onClick={() => {
                onAction('Finding a Pro...');
                onNavigate('find');
              }}
              className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Search size={18} />
              {t('nav_find_pro', 'Find a Pro')}
            </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings?.map(booking => (
            <div key={booking.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
              <img src={booking.other_party_avatar} className="w-20 h-20 rounded-2xl object-cover" alt="" referrerPolicy="no-referrer" />
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <h4 className="text-xl font-bold">{booking.service_name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                      {booking.status === 'ongoing' || booking.status === 'in_progress' ? t('artisan_at_location') : 
                       booking.status === 'en_route' ? t('artisan_en_route') : 
                       t(`status_${booking.status}`, booking.status.replace('_', ' '))}
                    </span>
                    {booking.status === 'ongoing' && booking.started_at && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {t('service_time')}: {formatDuration(booking.started_at, currentTime)}
                      </div>
                    )}
                    {booking.status === 'completed' && booking.started_at && booking.finished_at && (
                      <div className="px-3 py-1 bg-[var(--card-bg)] text-[var(--text-muted)] rounded-full text-[10px] font-bold border border-[var(--border)]">
                        {t('total_service_time')}: {formatDuration(booking.started_at, booking.finished_at)}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[var(--text-muted)] text-sm mb-1">{t('with_artisan', 'With')} {booking.other_party_name}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-[var(--text-muted)] opacity-70">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(booking.scheduled_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="flex items-center gap-1 capitalize">
                    {booking.payment_method === 'card' ? <CreditCard size={12} /> : 
                     booking.payment_method === 'wallet' ? <Wallet size={12} /> : 
                     <Banknote size={12} />}
                    {booking.payment_method || 'cash'}
                  </span>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-2xl font-bold text-[var(--accent)] mb-4">{booking.price} MAD</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                  {booking.status === 'pending' && proposals.filter(p => p.order_id === booking.id).length > 0 && (
                    <div className="w-full mt-4 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-2xl p-4">
                      <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Sparkles size={14} /> {proposals.filter(p => p.order_id === booking.id).length} {t('proposals_received')}
                      </p>
                      <div className="space-y-3">
                        {proposals?.filter(p => p.order_id === booking.id)?.map(prop => (
                          <div key={prop.id} className="flex items-center justify-between bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border)]">
                            <div className="flex items-center gap-3">
                              <img src={prop.artisan_avatar} className="w-8 h-8 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                              <div>
                                <p className="text-sm font-bold">{prop.artisan_name}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">{prop.price} MAD</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                onAction(`Accepting proposal from ${prop.artisan_name} for ${prop.price} MAD`);
                                handleAcceptProposal(prop);
                              }}
                              className="px-3 py-1 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-lg text-[10px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-1"
                            >
                              <CheckCircle size={10} />
                              {t('accept_bid')}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {booking.status === 'en_route' && (
                    <button 
                      onClick={() => onTrackArtisan(booking)}
                      className="px-4 py-3.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <MapPin size={14} />
                      {t('track_artisan')}
                    </button>
                  )}
                  {booking.status === 'pending' && (!booking.payment_status || booking.payment_status === 'failed') && (
                    <button 
                      onClick={async () => {
                        if (booking.payment_status === 'failed') {
                          onAction(`Retrying payment...`);
                          try {
                            const res = await fetch(`/api/webhooks/retry/${booking.id}`, { method: 'POST' });
                            const data = await res.json();
                            if (data.checkoutUrl) {
                               onAction(`Redirecting to ${data.checkoutUrl}`);
                            } else {
                               onAction(data.error || 'Failed to initialize retry');
                            }
                          } catch (err) {
                            onAction('Network error');
                          }
                        } else {
                          onAction(`Initiating payment for ${booking.service_name}`);
                          setSelectedBookingForPayment(booking);
                        }
                      }}
                      className="px-4 py-3.5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl text-xs font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-1"
                    >
                      <CreditCard size={14} />
                      {booking.payment_status === 'failed' ? 'Retry Payment' : t('pay_now')}
                    </button>
                  )}
                  {booking.status === 'pending' && (
                    <button 
                      onClick={() => onAction(`Cancelling booking ${booking.id}...`)}
                      className="px-4 py-3.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center gap-1"
                    >
                      <X size={14} />
                      {t('cancel')}
                    </button>
                  )}
                  {booking.status === 'completed' && !booking.has_review && (
                    <>
                      <button 
                        onClick={() => {
                          onAction(`Downloading invoice for ${booking.id}`);
                          downloadInvoice(booking);
                        }}
                        className="px-4 py-3.5 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-xl text-xs font-bold hover:bg-[var(--accent)]/20 transition-colors flex items-center gap-1"
                      >
                        <FileText size={14} />
                        {t('invoice_pdf')}
                      </button>
                      <button 
                        onClick={() => {
                          onAction(`Opening review for ${booking.other_party_name}`);
                          setSelectedBookingForReview(booking);
                        }}
                        className="px-4 py-3.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                      >
                        <Star size={14} />
                        {t('rate_review')}
                      </button>
                    </>
                  )}
                  {booking.status === 'completed' && booking.has_review && (
                    <button 
                      onClick={() => {
                        onAction(`Downloading invoice for ${booking.id}`);
                        downloadInvoice(booking);
                      }}
                      className="px-4 py-3.5 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-xl text-xs font-bold hover:bg-[var(--accent)]/20 transition-colors flex items-center gap-1"
                    >
                      <FileText size={14} />
                      {t('invoice_pdf')}
                    </button>
                  )}
                  <button 
                    onClick={() => onAction(`Viewing details for booking ${booking.id}`)}
                    className="px-4 py-3.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-bold hover:bg-[var(--card-bg)] transition-colors flex items-center gap-1"
                  >
                    <Info size={14} />
                    {t('details')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedBookingForReview && (
          <ReviewModal 
            booking={selectedBookingForReview}
            onClose={() => setSelectedBookingForReview(null)}
            onSuccess={() => {
              setSelectedBookingForReview(null);
              onAction('Review submitted successfully');
              fetchBookings();
            }}
          />
        )}
        {selectedBookingForPayment && (
          <PaymentModal 
            booking={selectedBookingForPayment}
            onClose={() => setSelectedBookingForPayment(null)}
            onAction={onAction}
            onSuccess={() => {
              setSelectedBookingForPayment(null);
              fetchBookings();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
