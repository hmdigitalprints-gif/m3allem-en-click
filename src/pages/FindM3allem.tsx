import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Filter, ChevronDown, MessageSquare, ShieldCheck, ArrowLeft, Plus, Map as MapIcon, Grid } from 'lucide-react';
import { SymmetricalIcon } from '../components/common/SymmetricalIcon';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ChatModal from '../components/marketplace/ChatModal';
import BookingModal from '../components/marketplace/BookingModal';
import JobRequestModal from '../components/marketplace/JobRequestModal';
import ArtisanProfile from '../components/marketplace/ArtisanProfile';
import { marketplaceService } from '../services/marketplaceService';
import { useFilterStore } from '../store/filterStore';
import { useAuth } from '../context/AuthContext';
import NearbyArtisansMap from '../components/marketplace/NearbyArtisansMap';

import { LanguageSwitcher } from '../components/layout/LanguageSwitcher';

const categories = [
  "All", 
  "Home & Construction", 
  "Repair & Maintenance", 
  "Automotive", 
  "IT & Technology", 
  "Web & Mobile Development", 
  "Design & Creative", 
  "Digital Marketing", 
  "Training & Coaching", 
  "Health & Wellness", 
  "Professional Services", 
  "Transport & Logistics", 
  "Home Services", 
  "Events", 
  "Photography & Video", 
  "Beauty", 
  "Pets", 
  "Crafts", 
  "Finance & Accounting", 
  "Legal", 
  "Translation & Writing"
];
const cities = ["All", "Casablanca", "Rabat", "Marrakech", "Tangier", "Agadir", "Fes", "Meknes", "Oujda", "Tetouan"];

export default function FindM3allem() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  const { filters, setFilters } = useFilterStore();
  
  const [chatArtisan, setChatArtisan] = useState<any | null>(null);
  const [bookingArtisan, setBookingArtisan] = useState<any | null>(null);
  const [showJobRequest, setShowJobRequest] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState<any | null>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);

  useEffect(() => {
    marketplaceService.getCategories().then(setAllCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    marketplaceService.getArtisans(filters).then(data => {
      setArtisans(data);
      setLoading(false);
    });
  }, [filters]);

  const handleBookClick = (e: React.MouseEvent, artisan: any) => {
    e.stopPropagation();
    if (!user) {
      navigate('/?login=true');
      return;
    }
    setBookingArtisan(artisan);
  };

  const handleChatClick = (e: React.MouseEvent, artisan: any) => {
    e.stopPropagation();
    if (!user) {
      navigate('/?login=true');
      return;
    }
    setChatArtisan(artisan);
  };

  return (
    <div className="flex-1 bg-[var(--bg)] pt-20 min-h-screen text-start">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <SymmetricalIcon icon={ArrowLeft} size={20} />
            <span>{t('find_ar_back', 'Back')}</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex bg-[var(--card-bg)]/50 border border-[var(--border)] p-1 rounded-2xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                title={t('view_grid')}
              >
                <Grid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'map' ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                title={t('view_map')}
              >
                <MapIcon size={20} />
              </button>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-6xl font-display font-bold tracking-tighter mb-4 text-[var(--text)]">{t('find_ar_title_1')} <span className="text-[var(--accent)]">{t('find_ar_title_2')}</span></h1>
            <p className="text-[var(--text-muted)] text-lg max-w-xl">{t('find_ar_desc')}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowJobRequest(true)}
              className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2"
            >
              <Plus size={20} />
              {t('find_ar_btn_post')}
            </button>
            <div className="bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-2xl px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-[var(--text-muted)]">{t('find_ar_online_count', { count: 1240 })}</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-2 relative">
            <Search className="absolute start-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50" size={24} />
            <input 
              type="text" 
              placeholder={t('find_ar_search')} 
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[32px] py-6 ps-16 pe-8 text-xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all shadow-sm"
            />
          </div>
          
          <div className="relative group">
            <Filter className="absolute start-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50" size={20} />
            <select 
              value={filters.category}
              onChange={(e) => setFilters({ category: e.target.value })}
              className="w-full appearance-none bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[32px] py-6 ps-16 pe-8 text-lg text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-[var(--card-bg)]">{t('find_ar_all')}</option>
              {categories?.filter(c => c !== 'All').map(cat => <option key={cat} value={cat} className="bg-[var(--card-bg)]">{t(`cat_${cat.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`, cat)}</option>)}
            </select>
            <ChevronDown className="absolute end-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50 pointer-events-none" size={20} />
          </div>

          <div className="relative group">
            <MapPin className="absolute start-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50" size={20} />
            <select 
              value={filters.city}
              onChange={(e) => setFilters({ city: e.target.value })}
              className="w-full appearance-none bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[32px] py-6 ps-16 pe-8 text-lg text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-[var(--card-bg)]">{t('find_ar_all')}</option>
              {cities?.filter(c => c !== 'All').map(city => <option key={city} value={city} className="bg-[var(--card-bg)]">{t(`city_${city.toLowerCase()}`, city)}</option>)}
            </select>
            <ChevronDown className="absolute end-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50 pointer-events-none" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="relative group">
            <Star className="absolute start-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50" size={20} />
            <select 
              value={filters.minRating}
              onChange={(e) => setFilters({ minRating: Number(e.target.value) })}
              className="w-full appearance-none bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[32px] py-4 ps-16 pe-8 text-base text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all cursor-pointer"
            >
              <option value={0} className="bg-[var(--card-bg)]">{t('find_ar_rating_any')}</option>
              <option value={3} className="bg-[var(--card-bg)]">{t('find_ar_rating_3')}</option>
              <option value={4} className="bg-[var(--card-bg)]">{t('find_ar_rating_4')}</option>
              <option value={4.5} className="bg-[var(--card-bg)]">{t('find_ar_rating_45')}</option>
            </select>
            <ChevronDown className="absolute end-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50 pointer-events-none" size={20} />
          </div>

          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder={t('find_ar_min_price')} 
              value={filters.minPrice}
              onChange={(e) => setFilters({ minPrice: e.target.value })}
              className="w-full bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[40px] py-4 px-6 text-base text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all"
            />
            <input 
              type="number" 
              placeholder={t('find_ar_max_price')} 
              value={filters.maxPrice}
              onChange={(e) => setFilters({ maxPrice: e.target.value })}
              className="w-full bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[40px] py-4 px-6 text-base text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all"
            />
          </div>

          <div className="flex items-center justify-center bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[40px] py-4 px-6">
            <label className="flex items-center gap-3 cursor-pointer group w-full justify-center" onClick={() => setFilters({ isOnline: !filters.isOnline })}>
              <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${filters.isOnline ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`}>
                {filters.isOnline && <div className="w-2 h-2 bg-[var(--accent-foreground)] rounded-full" />}
              </div>
              <span className="text-base text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{t('find_ar_online_only')}</span>
            </label>
          </div>
        </div>

        {/* Results */}
        {viewMode === 'map' ? (
          <div className="h-[600px] mb-16 relative z-0">
            <NearbyArtisansMap 
              artisans={artisans} 
              center={artisans.length > 0 && artisans[0].latitude ? [Number(artisans[0].latitude), Number(artisans[0].longitude)] : undefined} 
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {artisans?.map((artisan) => (
                  <motion.div 
                    key={artisan.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -10 }}
                    onClick={() => setSelectedArtisan(artisan)}
                    className="bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[40px] overflow-hidden group hover:border-[#FFD700]/30 transition-all cursor-pointer shadow-lg"
                  >
                    <div className="h-64 relative overflow-hidden">
                      <img src={artisan.avatar_url || artisan.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={artisan.name} referrerPolicy="no-referrer" />
                      <div className="absolute top-6 start-6 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[var(--accent)] text-xs font-bold border border-[var(--border)]">
                        <ShieldCheck size={14} />
                        {t('find_ar_verified')}
                      </div>
                      <div className="absolute top-6 end-6 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[var(--accent)] text-sm font-bold border border-[var(--border)]">
                        <Star size={14} fill="currentColor" />
                        {artisan.rating}
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-start">
                          <h3 className="text-2xl font-bold text-[var(--text)]">{artisan.name}</h3>
                          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-medium mt-1">
                            <MapPin size={14} />
                            {t(artisan.city || artisan.location, artisan.city || artisan.location) as string} • {t(artisan.category_name || artisan.category, artisan.category_name || artisan.category) as string}
                          </div>
                        </div>
                        <div className="text-end">
                          <p className="text-[var(--accent)] font-bold text-lg">{Number(artisan.starting_price || artisan.price || 150).toFixed(2)} MAD</p>
                          <p className="text-[10px] text-[var(--text-muted)]/50 uppercase tracking-widest font-bold">{t('find_ar_per_hour')}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-8">
                        <button 
                          onClick={(e) => handleBookClick(e, artisan)} 
                          className="flex-1 bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-colors shadow-lg shadow-[var(--accent)]/20"
                        >
                          {t('find_ar_book_now')}
                        </button>
                        <button 
                          onClick={(e) => handleChatClick(e, artisan)}
                          className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)] transition-all"
                        >
                          <MessageSquare size={24} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {!loading && artisans?.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-flex p-6 rounded-full bg-[var(--card-bg)]/50 mb-6 font-display">
              <Search size={48} className="text-[var(--text-muted)]/20" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-[var(--text)]">{t('find_ar_no_pros')}</h3>
            <p className="text-[var(--text-muted)]">{t('find_ar_no_pros_desc')}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {chatArtisan && (
          <ChatModal
            artisan={{...chatArtisan, user_id: `user_${chatArtisan.id}`}}
            currentUser={user || {id: 'user_client_1', name: 'Guest Client'}}
            onClose={() => setChatArtisan(null)}
          />
        )}
        {bookingArtisan && (
          <BookingModal
            artisan={{...bookingArtisan, user_id: `user_${bookingArtisan.id}`}}
            onClose={() => setBookingArtisan(null)}
            onSuccess={() => setBookingArtisan(null)}
          />
        )}
        {showJobRequest && (
          <JobRequestModal
            initialCategoryId={allCategories.find(c => c.name === filters.category)?.id}
            onClose={() => setShowJobRequest(false)}
            onSuccess={() => {
              setShowJobRequest(false);
              navigate('/bookings');
            }}
          />
        )}
        {selectedArtisan && (
          <ArtisanProfile
            artisanId={selectedArtisan.id}
            onClose={() => setSelectedArtisan(null)}
            onBook={(artisan) => {
              setSelectedArtisan(null);
              if (!user) {
                navigate('/?login=true');
                return;
              }
              setBookingArtisan(artisan);
            }}
            onChat={(artisan) => {
              setSelectedArtisan(null);
              if (!user) {
                navigate('/?login=true');
                return;
              }
              setChatArtisan(artisan);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
