import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  Filter, 
  Search as SearchIcon, 
  Star, 
  MapPin, 
  Plus 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function StoreSection({ onAction }: { onAction: (msg: string) => void }) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    seller: ''
  });

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
        );
        const queryParams = new URLSearchParams(cleanFilters as any).toString();
        const response = await fetch(`/api/marketplace/products?${queryParams}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const categories = ['Tools', 'Electrical', 'Painting', 'Cleaning', 'Safety', 'Plumbing', 'Wood', 'Cement', 'Tiles'];
  const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Fes'];

  const handleFilterChange = (key: string, val: any) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="p-6 md:p-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">M3allem En Click <span className="text-[var(--accent)]">{t('store', 'Store')}</span></h2>
          <p className="text-[var(--text-muted)] text-base md:text-xl">{t('store_hero_desc', 'Premium tools and construction materials.')}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onAction('Opening shopping bag...')}
            className="p-3 md:p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--text)] transition-colors active:scale-95 relative"
            title="View Shopping Bag"
          >
            <ShoppingBag size={20} className="md:w-6 md:h-6" />
            <span className="absolute -top-2 -end-2 bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">0</span>
          </button>
          <button 
            onClick={() => onAction('Redirecting to order tracking...')}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 text-sm md:text-base shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2"
          >
            <Truck size={20} />
            {t('store_track_order', 'Track Order')}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6 md:space-y-8">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Filter size={18} className="text-[var(--accent)]" />
              {t('filters_title', 'Filters')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">{t('nav_categories', 'Category')}</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pe-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('category', '')}>
                    <div className={`w-5 h-5 rounded border transition-colors ${filters.category === '' ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{t('store_all_categories', 'All Categories')}</span>
                  </label>
                  {categories?.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('category', cat)}>
                      <div className={`w-5 h-5 rounded border transition-colors ${filters.category === cat ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                      <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">{t('filter_city', 'City')}</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pe-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('city', '')}>
                    <div className={`w-5 h-5 rounded border transition-colors ${filters.city === '' ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{t('filter_all_cities', 'All Cities')}</span>
                  </label>
                  {cities?.map(city => (
                    <label key={city} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('city', city)}>
                      <div className={`w-5 h-5 rounded border transition-colors ${filters.city === city ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                      <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{city}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">{t('store_price_range', 'Price Range (MAD)')}</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder={t('filter_min', 'Min')} 
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[var(--accent)]/50 text-[var(--text)]"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder={t('filter_max', 'Max')} 
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[var(--accent)]/50 text-[var(--text)]"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">{t('store_seller', 'Seller')}</label>
                <input 
                  type="text" 
                  placeholder={t('store_search_seller', 'Search seller...')} 
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[var(--accent)]/50 text-[var(--text)]"
                  value={filters.seller}
                  onChange={(e) => handleFilterChange('seller', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 space-y-6 md:space-y-8">
          <div className="relative">
            <SearchIcon className="absolute start-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" size={20} />
            <input 
              type="text" 
              placeholder={t('store_search_products', 'Search products, materials, tools...')} 
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl py-4 md:py-5 ps-14 md:ps-16 pe-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-96 bg-[var(--card-bg)] rounded-[32px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {products?.map((product) => (
                <motion.div 
                  key={product.id}
                  whileHover={{ y: -5 }}
                  className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] overflow-hidden group hover:border-[var(--accent)]/30 transition-all flex flex-col shadow-sm hover:shadow-xl"
                >
                  <div className="h-48 relative overflow-hidden shrink-0">
                    <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} referrerPolicy="no-referrer" />
                    <div className="absolute top-4 start-4 bg-[var(--bg)]/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--text)]">
                      {product.category}
                    </div>
                    <div className="absolute top-4 end-4 bg-[var(--bg)]/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[var(--accent)] text-sm font-bold">
                      <Star size={14} fill="currentColor" />
                      4.5 <span className="text-[var(--text-muted)] text-xs font-normal">(0)</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">{product.seller_name}</span>
                        <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                          <MapPin size={10} /> {product.seller_city}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-[var(--accent)] transition-colors">{product.name}</h4>
                      <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4">{product.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                      <div>
                        <span className="text-2xl font-bold">{product.price}</span>
                        <span className="text-xs text-[var(--accent)] font-bold ml-1">MAD</span>
                      </div>
                      <button 
                        onClick={() => onAction(`Added ${product.name} to cart`)}
                        className="p-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20 flex items-center justify-center"
                        title="Add to Cart"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
