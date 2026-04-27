import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, CheckCircle, Star, MessageSquare } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { ReviewModal } from '../components/marketplace/Modals';
import { Booking as MarketplaceBooking } from '../services/marketplaceService';

interface BookingData {
  id: string;
  artisan_id: string;
  service_id: string;
  status: string;
  service_title: string;
  artisan_name: string;
  artisan_avatar: string;
  scheduled_at: string;
  city: string;
  price: number;
  has_review: boolean;
}

export default function Booking() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState<MarketplaceBooking | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleReviewSubmit = async (stars: number, review: string) => {
    if (!selectedBooking) return;
    
    try {
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch(`/api/bookings/${selectedBooking.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stars, review })
      });

      if (res.ok) {
        fetchBookings();
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      throw error;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'accepted':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'en_route':
        return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'in_progress':
        return 'bg-green-500/10 text-green-500 border border-green-500/20';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'proposal_submitted':
      case 'proposal_approved':
        return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === t('booking_tab_all', 'All')) return true;
    if (activeTab === t('booking_tab_upcoming', 'Upcoming')) return ['pending', 'proposal_submitted', 'proposal_approved', 'en_route', 'in_progress', 'accepted'].includes(b.status);
    if (activeTab === t('booking_tab_completed', 'Completed')) return b.status === 'completed';
    if (activeTab === t('booking_tab_cancelled', 'Cancelled')) return b.status === 'cancelled';
    return true;
  });

  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--text)]">
            {t('booking_title_1', 'Your ')} <span className="text-[var(--accent)]">{t('booking_title_2', 'Bookings.')}</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg">{t('booking_desc', 'Track and manage your service requests.')}</p>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
          {[t('booking_tab_all', 'All'), t('booking_tab_upcoming', 'Upcoming'), t('booking_tab_completed', 'Completed'), t('booking_tab_cancelled', 'Cancelled')]?.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px]">
            <p className="text-[var(--text-muted)] text-lg">{t('booking_empty', 'No bookings found in this category.')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-6 md:p-8 hover:border-[var(--accent)]/20 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--bg)] shrink-0 border border-[var(--border)] overflow-hidden">
                      {booking.artisan_avatar ? (
                        <img src={booking.artisan_avatar} alt={booking.artisan_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                          <CheckCircle size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 text-[var(--text)]">{booking.artisan_name || t('booking_assigned_artisan', 'Assigned Artisan')}</h3>
                      <p className="text-[var(--text-muted)] text-sm">{booking.service_title}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyles(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-[var(--bg)] rounded-2xl p-4 flex items-center gap-3 border border-[var(--border)]">
                    <Calendar size={20} className="text-[var(--accent)]" />
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">{t('booking_date_lbl', 'Date')}</p>
                      <p className="font-medium text-sm text-[var(--text)]">
                        {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-[var(--bg)] rounded-2xl p-4 flex items-center gap-3 border border-[var(--border)]">
                    <Clock size={20} className="text-[var(--accent)]" />
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">{t('booking_time_lbl', 'Time')}</p>
                      <p className="font-medium text-sm text-[var(--text)]">
                        {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-[var(--bg)] rounded-2xl p-4 flex items-center gap-3 border border-[var(--border)]">
                    <MapPin size={20} className="text-[var(--accent)]" />
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">Location</p>
                      <p className="font-medium text-sm truncate text-[var(--text)]">{booking.city || 'Casablanca'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 bg-[var(--card-bg)] hover:bg-[var(--bg)] text-[var(--text)] py-4 rounded-2xl font-bold transition-colors text-sm border border-[var(--border)]">
                    View Details
                  </button>
                  {booking.status === 'completed' && !booking.has_review && (
                    <button 
                      onClick={() => {
                        const marketplaceBooking: MarketplaceBooking = {
                          id: booking.id,
                          client_id: '', // Not needed for review modal
                          artisan_id: booking.artisan_id,
                          service_id: booking.service_id,
                          service_name: booking.service_title,
                          status: booking.status as any,
                          price: booking.price,
                          scheduled_at: booking.scheduled_at,
                          other_party_name: booking.artisan_name,
                          other_party_avatar: booking.artisan_avatar,
                          has_review: booking.has_review
                        };
                        setSelectedBooking(marketplaceBooking);
                        setIsReviewModalOpen(true);
                      }}
                      className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--accent-foreground)] py-4 rounded-2xl font-bold transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Star size={18} className="fill-current" />
                      Leave Review
                    </button>
                  )}
                  {booking.status === 'completed' && booking.has_review && (
                    <div className="flex-1 flex items-center justify-center gap-2 text-[var(--success)] font-bold text-sm">
                      <CheckCircle size={18} />
                      Reviewed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isReviewModalOpen && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedBooking(null);
          }}
          onSuccess={() => {
            setIsReviewModalOpen(false);
            setSelectedBooking(null);
            fetchBookings();
          }}
        />
      )}
    </Layout>
  );
}

