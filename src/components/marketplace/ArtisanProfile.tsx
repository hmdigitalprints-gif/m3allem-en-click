import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  X, 
  Briefcase, 
  Award, 
  CheckCircle2,
  MessageSquare,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Video
} from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url?: string;
}

interface ArtisanProfileData {
  id: string;
  name: string;
  avatar_url: string;
  category_name: string;
  bio: string;
  expertise: string;
  years_experience: number;
  certifications?: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_online: number;
  user_id: string;
  working_hours?: string;
  portfolio: PortfolioItem[];
  services?: any[];
  reviews?: any[];
}

interface ArtisanProfileProps {
  artisanId: string;
  onClose: () => void;
  onBook: (artisan: any) => void;
  onChat?: (artisan: any) => void;
}

export default function ArtisanProfile({ artisanId, onClose, onBook, onChat }: ArtisanProfileProps) {
  const [artisan, setArtisan] = useState<ArtisanProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'services' | 'reviews'>('portfolio');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetch(`/api/marketplace/artisans/${artisanId}`)
      .then(res => res.json())
      .then(data => {
        setArtisan(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching artisan profile:", err);
        setLoading(false);
      });
  }, [artisanId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[var(--bg)]/80 backdrop-blur-xl flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!artisan) return null;

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[var(--bg)]/90 backdrop-blur-2xl overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <button 
            onClick={onClose}
            className="p-3 bg-[var(--card-bg)]/5 hover:bg-[var(--card-bg)]/10 rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <X size={24} />
          </button>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('start-live-diagnostic', {
                  detail: {
                    artisanId: artisan.id,
                    artisanName: artisan.name,
                    artisanUserId: artisan.user_id
                  }
                }));
                onClose();
              }}
              className="px-8 py-4 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-2xl font-bold hover:bg-[var(--accent)]/20 transition-colors flex items-center gap-2"
            >
              <Video size={20} />
              Video Call
            </button>
            {onChat && (
              <button 
                onClick={() => onChat(artisan)}
                className="px-8 py-4 bg-[var(--card-bg)]/5 text-[var(--text)] border border-[var(--border)] rounded-2xl font-bold hover:bg-[var(--card-bg)]/10 transition-colors flex items-center gap-2"
              >
                <MessageSquare size={20} />
                Chat
              </button>
            )}
            <button 
              onClick={() => onBook(artisan)}
              className="px-8 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:bg-[var(--accent)]/90 transition-colors shadow-xl shadow-[var(--accent)]/10"
            >
              Book Service
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-[48px] p-8 text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <img 
                  src={artisan.avatar_url} 
                  className="w-full h-full object-cover rounded-[40px]" 
                  alt={artisan.name} 
                />
                {artisan.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-[var(--accent)] text-[var(--accent-foreground)] p-2 rounded-2xl shadow-lg">
                    <ShieldCheck size={20} />
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-[var(--text)]">{artisan.name}</h2>
              <p className="text-[var(--accent)] font-bold mb-6">{artisan.category_name}</p>
              
              <div className="flex items-center justify-center gap-6 py-6 border-y border-[var(--border)]">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-[var(--accent)] font-bold text-xl mb-1">
                    <Star size={18} fill="currentColor" />
                    {artisan.rating}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{artisan.review_count} Reviews</p>
                </div>
                <div className="w-px h-10 bg-[var(--border)]" />
                <div className="text-center">
                  <div className="text-xl font-bold mb-1 text-[var(--text)]">{artisan.years_experience}+</div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Years Exp.</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
                  <MapPin size={18} className="text-[var(--accent)]" />
                  Casablanca, Morocco
                </div>
                <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
                  <Clock size={18} className="text-[var(--accent)]" />
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${!!artisan.is_online ? 'bg-[var(--success)] animate-pulse' : 'bg-gray-500'}`} />
                    {!!artisan.is_online ? 'Online Now' : 'Currently Offline'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-[32px] p-8">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-[var(--destructive)]">
                <Video size={18} />
                Live Diagnostic
              </h3>
              <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed">
                Need an instant assessment? Start a live video call with {artisan.name.split(' ')[0]} to diagnose your issue in real-time.
              </p>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('start-live-diagnostic', {
                    detail: {
                      artisanId: artisan.id,
                      artisanName: artisan.name,
                      artisanUserId: artisan.user_id
                    }
                  }));
                  onClose();
                }}
                className="w-full py-4 bg-[var(--destructive)] text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[var(--destructive)]/20 active:scale-95"
              >
                <Video size={20} />
                Start Call
              </button>
            </div>

            <div className="bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-[32px] p-8">
              <h3 className="font-bold mb-6 flex items-center gap-2 text-[var(--text)]">
                <Award size={18} className="text-[var(--accent)]" />
                Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {artisan?.expertise?.split(',')?.map((skill, i) => (
                  <span 
                    key={i}
                    className="px-4 py-2 bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-muted)]"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {artisan.certifications && (
              <div className="bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-[32px] p-8">
                <h3 className="font-bold mb-6 flex items-center gap-2 text-[var(--text)]">
                  <ShieldCheck size={18} className="text-[var(--accent)]" />
                  Certifications
                </h3>
                <div className="flex flex-col gap-3">
                  {artisan?.certifications?.split(',')?.map((cert, i) => (
                    <div key={i} className="flex items-start gap-3 text-[var(--text-muted)] text-sm">
                      <CheckCircle2 size={16} className="text-[var(--success)] mt-0.5 shrink-0" />
                      <span>{cert.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Calendar */}
            <div className="bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-[32px] p-8">
              <h3 className="font-bold mb-6 flex items-center gap-2 text-[var(--text)]">
                <CalendarIcon size={18} className="text-[var(--accent)]" />
                Availability
              </h3>
              
              <div className="space-y-4">
                {artisan.working_hours ? (
                  (() => {
                    const hours = JSON.parse(artisan.working_hours);
                    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    return days.map(day => {
                      const dayInfo = hours[day];
                      if (!dayInfo) return null;
                      return (
                        <div key={day} className="flex items-center justify-between text-sm">
                          <span className="capitalize font-medium text-[var(--text-muted)]">{day}</span>
                          <div className="flex items-center gap-2">
                            {dayInfo.active ? (
                              <span className="font-bold text-[var(--text)]">{dayInfo.start} - {dayInfo.end}</span>
                            ) : (
                              <span className="text-[var(--destructive)] font-bold text-xs uppercase tracking-widest">Closed</span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <p className="text-sm text-[var(--text-muted)] italic">No working hours set.</p>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} className="p-1 hover:bg-[var(--card-bg)]/10 rounded-lg transition-colors text-[var(--text)]">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-bold text-sm text-[var(--text)]">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={nextMonth} className="p-1 hover:bg-[var(--card-bg)]/10 rounded-lg transition-colors text-[var(--text)]">
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']?.map(day => (
                    <div key={day} className="text-[10px] text-[var(--text-muted)]/30 font-bold">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfMonth })?.map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: daysInMonth })?.map((_, i) => {
                    const day = i + 1;
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const dayName = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
                    
                    let isAvailable = false;
                    if (artisan.working_hours) {
                      const hours = JSON.parse(artisan.working_hours);
                      isAvailable = hours[dayName]?.active;
                    }

                    const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth();
                    
                    return (
                      <div 
                        key={day} 
                        className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer
                          ${isToday ? 'border border-[var(--accent)] text-[var(--accent)]' : ''}
                          ${isAvailable ? 'bg-[var(--success)]/10 text-[var(--success)] hover:bg-[var(--success)]/20' : 'bg-[var(--card-bg)]/5 text-[var(--text-muted)]/20 cursor-not-allowed'}
                        `}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Portfolio */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h3 className="text-2xl font-bold mb-6 text-[var(--text)]">About the Artisan</h3>
              <p className="text-xl text-[var(--text-muted)] leading-relaxed">
                {artisan.bio}
              </p>
            </section>

            <section>
              <div className="flex border-b border-[var(--border)] mb-8">
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className={`px-6 py-4 font-bold text-sm transition-colors relative ${activeTab === 'portfolio' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                >
                  Portfolio
                  {activeTab === 'portfolio' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />}
                </button>
                <button 
                  onClick={() => setActiveTab('services')}
                  className={`px-6 py-4 font-bold text-sm transition-colors relative ${activeTab === 'services' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                >
                  Services & Pricing
                  {activeTab === 'services' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />}
                </button>
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-4 font-bold text-sm transition-colors relative ${activeTab === 'reviews' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                >
                  Reviews ({artisan.review_count})
                  {activeTab === 'reviews' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'portfolio' && (
                  <motion.div 
                    key="portfolio"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    {artisan?.portfolio?.map((item) => (
                      <motion.div 
                        key={item.id}
                        whileHover={{ y: -10 }}
                        className="group bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-[40px] overflow-hidden"
                      >
                        <div className="h-64 overflow-hidden relative">
                          {item.video_url ? (
                            <video 
                              src={item.video_url} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              controls
                              muted
                              loop
                            />
                          ) : (
                            <img 
                              src={item.image_url} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              alt={item.title} 
                            />
                          )}
                        </div>
                        <div className="p-8">
                          <h4 className="text-xl font-bold mb-2 text-[var(--text)]">{item.title}</h4>
                          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'services' && (
                  <motion.div 
                    key="services"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {artisan.services?.map((service) => (
                      <div key={service.id} className="bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-3xl p-6 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg text-[var(--text)]">{service.name}</h4>
                          <p className="text-[var(--text-muted)] text-sm mt-1">{service.description || 'Standard service'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[var(--accent)] font-bold text-xl">{service.base_price} MAD</p>
                          <button 
                            onClick={() => onBook(artisan)}
                            className="mt-2 px-4 py-2 bg-[var(--card-bg)]/10 hover:bg-[var(--card-bg)]/20 rounded-xl text-sm font-bold transition-colors text-[var(--text)]"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!artisan.services || artisan.services.length === 0) && (
                      <div className="text-center py-12 text-[var(--text-muted)]/40">
                        No specific services listed. Contact artisan for custom quotes.
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div 
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {artisan?.reviews && artisan.reviews.length > 0 ? (
                      artisan.reviews?.map((review) => (
                        <div key={review.id} className="bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-3xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[var(--card-bg)]/10 rounded-full flex items-center justify-center font-bold overflow-hidden text-[var(--text)]">
                                {review.client_avatar ? (
                                  <img src={review.client_avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  review.client_name?.charAt(0)
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-[var(--text)]">{review.client_name}</h4>
                                <p className="text-xs text-[var(--text-muted)]/40">{new Date(review.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-[var(--accent)]">
                              <Star size={14} fill="currentColor" />
                              <span className="font-bold text-sm">{review.stars}</span>
                            </div>
                          </div>
                          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                            "{review.review}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-[var(--text-muted)]/40">
                        No reviews yet for this artisan.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-[48px] p-10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">Ready to start your project?</h3>
                  <p className="text-[var(--text-muted)]">
                    Book {artisan.name.split(' ')[0]} today and get a professional service with guaranteed quality.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => onBook(artisan)}
                    className="px-8 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:bg-[var(--accent)]/90 transition-colors"
                  >
                    Book Now
                  </button>
                  <button onClick={() => onChat && onChat(artisan)} className="p-4 bg-[var(--card-bg)]/10 rounded-2xl text-[var(--text)] hover:bg-[var(--card-bg)]/20 transition-colors">
                    <MessageSquare size={24} />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
