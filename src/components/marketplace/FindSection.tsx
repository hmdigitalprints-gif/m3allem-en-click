import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search as SearchIcon, 
  ShieldCheck, 
  MapPin,
  Star
} from 'lucide-react';
import { marketplaceService, Artisan, Category } from '../../services/marketplaceService';
import ArtisanCard from '../common/ArtisanCard';

import { useTranslation } from 'react-i18next';

interface FindSectionProps {
  onAction: (msg: string) => void;
  onSelectArtisan: (id: string) => void;
  onBookArtisan: (artisan: any, isQuick?: boolean) => void;
  categories: Category[];
}

export default function FindSection({ onAction, onSelectArtisan, onBookArtisan, categories }: FindSectionProps) {
  const { t } = useTranslation();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minRating: 0,
    minPrice: '',
    maxPrice: '',
    isOnline: false,
    availability: '',
    city: '',
    distance: 50,
    experience: 0,
    verified: false,
    sortBy: 'popularity'
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Fes'];

  useEffect(() => {
    setLoading(true);
    marketplaceService.getArtisans(filters).then(data => {
      setArtisans(data);
      setLoading(false);
    });
  }, [filters]);

  const handleFilterChange = (key: string, val: any) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="p-6 md:p-12">
      <div className="mb-8 md:mb-12">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-4">{t('discovery_label')}</p>
        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-[var(--text)]">{t('find_pro_title')} <span className="text-[var(--accent)] italic">{t('find_pro_accent')}</span></h2>
        <p className="text-[var(--text-muted)] text-sm md:text-base">{t('find_pro_desc')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="lg:hidden flex items-center justify-center gap-2 w-full py-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl font-bold text-[var(--text)] active:scale-[0.98] transition-all"
        >
          <Filter size={20} className="text-[var(--accent)]" />
          {isFiltersOpen ? t('hide_filters') : t('show_filters')}
        </button>

        {/* Filters Sidebar */}
        <div className={`w-full lg:w-80 shrink-0 space-y-6 md:space-y-8 ${isFiltersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="hynex-card p-6 md:p-8">
            <h3 className="font-black mb-6 md:mb-8 flex items-center gap-3 text-[var(--text)] text-lg tracking-tight">
              <Filter size={20} className="text-[var(--accent)]" />
              {t('filters_title')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 md:gap-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 block">{t('nav_categories', 'Category')}</label>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                    onAction('Filtering by all services');
                    handleFilterChange('category', '');
                  }}>
                    <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${filters.category === '' ? 'bg-[var(--accent)] border-[var(--accent)] scale-110 shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                    <span className={`text-sm transition-colors ${filters.category === '' ? 'text-[var(--text)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>{t('filter_all_services')}</span>
                  </label>
                  {categories?.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                      onAction(`Filtering by ${cat.name}`);
                      handleFilterChange('category', cat.id);
                    }}>
                      <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${filters.category === cat.id ? 'bg-[var(--accent)] border-[var(--accent)] scale-110 shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                      <span className={`text-sm transition-colors ${filters.category === cat.id ? 'text-[var(--text)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>{t(cat.id || cat.name, cat.name)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 block">{t('filter_city', 'City')}</label>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                    onAction('Filtering by all cities');
                    handleFilterChange('city', '');
                  }}>
                    <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${filters.city === '' ? 'bg-[var(--accent)] border-[var(--accent)] scale-110 shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                    <span className={`text-sm transition-colors ${filters.city === '' ? 'text-[var(--text)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>{t('filter_all_cities')}</span>
                  </label>
                  {cities?.map(city => (
                    <label key={city} className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                      onAction(`Filtering by ${city}`);
                      handleFilterChange('city', city);
                    }}>
                      <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${filters.city === city ? 'bg-[var(--accent)] border-[var(--accent)] scale-110 shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                      <span className={`text-sm transition-colors ${filters.city === city ? 'text-[var(--text)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>{t(city, city)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 block flex justify-between">
                  <span>{t('filter_distance')}</span>
                  <span className="text-[var(--accent)] font-bold">{filters.distance} km</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={filters.distance}
                  onChange={(e) => handleFilterChange('distance', Number(e.target.value))}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 block">{t('filter_min_rating')}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5]?.map(star => (
                    <button 
                      key={star}
                      onClick={() => {
                        onAction(`Filtering by minimum ${star} stars`);
                        handleFilterChange('minRating', star);
                      }}
                      className={`flex-1 py-2 rounded-xl border transition-all ${filters.minRating === star ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50'}`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">{t('filter_starting_price', 'Starting Price')} (MAD)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder={t('filter_min')} 
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3.5 px-3 text-sm focus:outline-none focus:border-[var(--accent)]/50 text-[var(--text)]"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder={t('filter_max')} 
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3.5 px-3 text-sm focus:outline-none focus:border-[var(--accent)]/50 text-[var(--text)]"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">{t('filter_experience')}</label>
                <div className="space-y-2">
                  {[1, 3, 5, 10]?.map(years => (
                    <label key={years} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('experience', years)}>
                      <div className={`w-5 h-5 rounded border transition-colors ${filters.experience === years ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                      <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{years}+ {t('years', 'Years')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">{t('filter_availability_trust')}</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('availability', filters.availability === 'today' ? '' : 'today')}>
                    <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${filters.availability === 'today' ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`}>
                      {filters.availability === 'today' && <div className="w-2 h-2 bg-[var(--accent-foreground)] rounded-full" />}
                    </div>
                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{t('available_today')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('availability', filters.availability === 'week' ? '' : 'week')}>
                    <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${filters.availability === 'week' ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`}>
                      {filters.availability === 'week' && <div className="w-2 h-2 bg-[var(--accent-foreground)] rounded-full" />}
                    </div>
                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{t('available_week')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('isOnline', !filters.isOnline)}>
                    <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${filters.isOnline ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`}>
                      {filters.isOnline && <div className="w-2 h-2 bg-[var(--accent-foreground)] rounded-full" />}
                    </div>
                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{t('online_now')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('verified', !filters.verified)}>
                    <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${filters.verified ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border(--accent)/50'}`}>
                      {filters.verified && <div className="w-2 h-2 bg-[var(--accent-foreground)] rounded-full" />}
                    </div>
                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors flex items-center gap-1">
                      {t('verified_artisan')} <ShieldCheck size={14} className="text-[var(--accent)]" />
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 space-y-6 md:space-y-8">
          <div className="relative">
            <SearchIcon className="absolute start-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
            <input 
              type="text" 
              placeholder={t('search_placeholder_artisans')} 
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl py-4 md:py-5 ps-14 md:ps-16 pe-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 opacity-50">
              {[1, 2, 3, 4]?.map(i => <div key={i} className="h-48 bg-[var(--card-bg)] rounded-3xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {artisans?.map(artisan => (
                <ArtisanCard 
                  key={artisan.id}
                  name={artisan.name} 
                  category={t(artisan.category_name, artisan.category_name)} 
                  rating={artisan.rating} 
                  reviews={artisan.review_count} 
                  price={`${t('starting_from')} ${artisan.starting_price || 150} MAD`}
                  image={artisan.avatar_url}
                  isOnline={!!artisan.is_online}
                  onAction={(type: string) => type === 'view' ? onSelectArtisan(artisan.id) : onBookArtisan(artisan, type === 'quick-book')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
