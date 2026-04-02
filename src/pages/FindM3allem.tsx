import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Filter, ChevronDown, SlidersHorizontal, MessageSquare, ShieldCheck, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatModal from '../components/marketplace/ChatModal';
import BookingModal from '../components/marketplace/BookingModal';
import JobRequestModal from '../components/marketplace/JobRequestModal';
import ArtisanProfile from '../components/marketplace/ArtisanProfile';
import { marketplaceService } from '../services/marketplaceService';

const artisans = [
  { id: 'art_1', name: "Karim Tazi", category: "Plumbing", rating: 4.9, reviews: 128, price: 150, location: "Casablanca", isOnline: true, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" },
  { id: 'art_2', name: "Yassine Benani", category: "Electricity", rating: 4.8, reviews: 94, price: 200, location: "Rabat", isOnline: false, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" },
  { id: 'art_3', name: "Ahmed Sabiri", category: "Painting", rating: 5.0, reviews: 42, price: 100, location: "Marrakech", isOnline: true, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" },
  { id: 'art_4', name: "Sarah Mansouri", category: "Cleaning", rating: 4.7, reviews: 215, price: 80, location: "Tangier", isOnline: true, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400" },
  { id: 'art_5', name: "Omar Mansouri", category: "AC Repair", rating: 4.6, reviews: 67, price: 250, location: "Casablanca", isOnline: false, image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400" },
  { id: 'art_6', name: "Said El Amrani", category: "Construction", rating: 4.9, reviews: 89, price: 300, location: "Fes", isOnline: true, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400" },
];

const categories = ["All", "Plumbing", "Electricity", "Painting", "Cleaning", "AC Repair", "Construction"];
const cities = ["All", "Casablanca", "Rabat", "Marrakech", "Tangier", "Fes"];

export default function FindM3allem() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [chatArtisan, setChatArtisan] = useState<any | null>(null);
  const [bookingArtisan, setBookingArtisan] = useState<any | null>(null);
  const [showJobRequest, setShowJobRequest] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState<any | null>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);

  useEffect(() => {
    marketplaceService.getCategories().then(setAllCategories);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [location.search]);

  const filteredArtisans = artisans.filter(artisan => {
    const matchesCategory = selectedCategory === "All" || artisan.category === selectedCategory;
    const matchesCity = selectedCity === "All" || artisan.location === selectedCity;
    const matchesSearch = artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          artisan.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = artisan.rating >= minRating;
    const matchesMinPrice = minPrice === "" || artisan.price >= Number(minPrice);
    const matchesMaxPrice = maxPrice === "" || artisan.price <= Number(maxPrice);
    const matchesOnline = !isOnline || artisan.isOnline;
    
    return matchesCategory && matchesCity && matchesSearch && matchesRating && matchesMinPrice && matchesMaxPrice && matchesOnline;
  });

  const handleBookClick = (e: React.MouseEvent, artisan: any) => {
    e.stopPropagation();
    const token = localStorage.getItem('m3allem_token');
    if (!token) {
      navigate('/?login=true');
      return;
    }
    setBookingArtisan(artisan);
  };

  const handleChatClick = (e: React.MouseEvent, artisan: any) => {
    e.stopPropagation();
    const token = localStorage.getItem('m3allem_token');
    if (!token) {
      navigate('/?login=true');
      return;
    }
    setChatArtisan(artisan);
  };

  return (
    <div className="flex-1 bg-[var(--bg)] pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-6xl font-display font-bold tracking-tighter mb-4 text-[var(--text)]">Find your <span className="text-[var(--accent)]">Pro.</span></h1>
            <p className="text-[var(--text-muted)] text-lg max-w-xl">Browse through our network of verified professionals and book the best talent for your home needs.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowJobRequest(true)}
              className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2"
            >
              <Plus size={20} />
              Post a Job Request
            </button>
            <div className="bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-2xl px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-[var(--text-muted)]">1,240 Artisans Online</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50" size={24} />
            <input 
              type="text" 
              placeholder="Search by name or service..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[32px] py-6 pl-16 pr-8 text-xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all"
            />
          </div>
          
          <div className="relative group">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50" size={20} />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[32px] py-6 pl-16 pr-8 text-lg text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all cursor-pointer"
            >
              {categories?.map(cat => <option key={cat} value={cat} className="bg-[var(--card-bg)]">{cat}</option>)}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50 pointer-events-none" size={20} />
          </div>

          <div className="relative group">
            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50" size={20} />
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full appearance-none bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[32px] py-6 pl-16 pr-8 text-lg text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all cursor-pointer"
            >
              {cities?.map(city => <option key={city} value={city} className="bg-[var(--card-bg)]">{city}</option>)}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50 pointer-events-none" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="relative group">
            <Star className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50" size={20} />
            <select 
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full appearance-none bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[32px] py-4 pl-16 pr-8 text-base text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all cursor-pointer"
            >
              <option value={0} className="bg-[var(--card-bg)]">Any Rating</option>
              <option value={3} className="bg-[var(--card-bg)]">3+ Stars</option>
              <option value={4} className="bg-[var(--card-bg)]">4+ Stars</option>
              <option value={4.5} className="bg-[var(--card-bg)]">4.5+ Stars</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/50 pointer-events-none" size={20} />
          </div>

          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Min Price (MAD)" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[32px] py-4 px-6 text-base text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all"
            />
            <input 
              type="number" 
              placeholder="Max Price (MAD)" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[32px] py-4 px-6 text-base text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-all"
            />
          </div>

          <div className="flex items-center justify-center bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[32px] py-4 px-6">
            <label className="flex items-center gap-3 cursor-pointer group w-full justify-center" onClick={() => setIsOnline(!isOnline)}>
              <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${isOnline ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`}>
                {isOnline && <div className="w-2 h-2 bg-[var(--accent-foreground)] rounded-full" />}
              </div>
              <span className="text-base text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">Online Now</span>
            </label>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredArtisans?.map((artisan) => (
              <motion.div 
                key={artisan.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedArtisan(artisan)}
                className="bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-[40px] overflow-hidden group hover:border-[#FFD700]/30 transition-all cursor-pointer"
              >
                <div className="h-64 relative overflow-hidden">
                  <img src={artisan.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={artisan.name} referrerPolicy="no-referrer" />
                  <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[var(--accent)] text-xs font-bold border border-[var(--border)]">
                    <ShieldCheck size={14} />
                    Verified
                  </div>
                  <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[var(--accent)] text-sm font-bold border border-[var(--border)]">
                    <Star size={14} fill="currentColor" />
                    {artisan.rating}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--text)]">{artisan.name}</h3>
                      <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-medium mt-1">
                        <MapPin size={14} />
                        {artisan.location} • {artisan.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[var(--accent)] font-bold text-lg">{artisan.price} MAD</p>
                      <p className="text-[10px] text-[var(--text-muted)]/50 uppercase tracking-widest font-bold">Per Hour</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button 
                      onClick={(e) => handleBookClick(e, artisan)} 
                      className="flex-1 bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-colors shadow-lg shadow-[var(--accent)]/20"
                    >
                      Book Now
                    </button>
                    <button 
                      onClick={(e) => handleChatClick(e, artisan)}
                      className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)] transition-colors"
                    >
                      <MessageSquare size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredArtisans?.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-flex p-6 rounded-full bg-[var(--card-bg)]/50 mb-6">
              <Search size={48} className="text-[var(--text-muted)]/20" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-[var(--text)]">No Pros found</h3>
            <p className="text-[var(--text-muted)]">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {chatArtisan && (
          <ChatModal
            artisan={{...chatArtisan, user_id: `user_${chatArtisan.id}`}}
            currentUser={localStorage.getItem('m3allem_user') ? JSON.parse(localStorage.getItem('m3allem_user') as string) : {id: 'user_client_1', name: 'Guest Client'}}
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
            initialCategoryId={allCategories.find(c => c.name === selectedCategory)?.id}
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
              const token = localStorage.getItem('m3allem_token');
              if (!token) {
                navigate('/?login=true');
                return;
              }
              setBookingArtisan(artisan);
            }}
            onChat={(artisan) => {
              setSelectedArtisan(null);
              const token = localStorage.getItem('m3allem_token');
              if (!token) {
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
