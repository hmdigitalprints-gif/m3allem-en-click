import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Search, Loader2, X } from 'lucide-react';

interface AddressInputProps {
  city: string;
  address: string;
  onCityChange: (city: string) => void;
  onAddressChange: (address: string) => void;
  error?: string;
  placeholder?: string;
}

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Fes', 'Agadir', 'Oujda', 'Kenitra',
  'Tetouan', 'Safi', 'Mohammedia', 'Khouribga', 'El Jadida', 'Beni Mellal', 'Nador',
  'Taza', 'Settat', 'Berrechid', 'Khemisset', 'Guelmim', 'Ksar El Kebir', 'Larache',
  'Khenifra', 'Berkane', 'Taourirt', 'Bouskoura', 'Fquih Ben Salah', 'Dakhla', 'Laayoune'
];

export const AddressInput: React.FC<AddressInputProps> = ({
  city,
  address,
  onCityChange,
  onAddressChange,
  error,
  placeholder = "Street, Building, Apt..."
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Bias search towards Morocco and the selected city
      const searchQuery = `${query}, ${city}, Morocco`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ma&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = (value: string) => {
    onAddressChange(value);
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 500);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    // Extract a cleaner address string
    const displayName = suggestion.display_name;
    // Usually the first few parts are the street/building
    const parts = displayName.split(',');
    const cleanAddress = parts.slice(0, 2).join(',').trim();
    
    onAddressChange(cleanAddress);
    setShowSuggestions(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" ref={containerRef}>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">City</label>
        <div className="relative group">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
          <select 
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-10 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)] appearance-none cursor-pointer"
          >
            {MOROCCAN_CITIES.map(c => (
              <option key={c} value={c} className="bg-[var(--bg)]">{c}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      <div className="md:col-span-2 space-y-2 relative">
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Street Address</label>
        <div className="relative group">
          <Navigation className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-rose-500' : 'text-[var(--text-muted)] group-focus-within:text-[var(--accent)]'}`} size={18} />
          <input 
            type="text" 
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            onFocus={() => address.length >= 3 && setShowSuggestions(true)}
            placeholder={placeholder}
            className={`w-full bg-[var(--bg)] border rounded-2xl py-4 pl-12 pr-12 focus:outline-none transition-all text-sm text-[var(--text)] ${error ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]/50'}`} 
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading ? (
              <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
            ) : address ? (
              <button 
                onClick={() => { onAddressChange(''); setSuggestions([]); }}
                className="p-1 hover:bg-[var(--text)]/5 rounded-full text-[var(--text-muted)] transition-colors"
              >
                <X size={14} />
              </button>
            ) : (
              <Search size={16} className="text-[var(--text-muted)] opacity-30" />
            )}
          </div>
        </div>
        {error && <p className="text-rose-500 text-[10px] font-bold ml-4">{error}</p>}

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-50 left-0 right-0 top-full mt-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden glass"
            >
              <div className="p-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left p-3 hover:bg-[var(--accent)]/10 rounded-xl transition-all group flex items-start gap-3"
                  >
                    <div className="p-2 bg-[var(--accent)]/5 text-[var(--accent)] rounded-lg group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all shrink-0">
                      <MapPin size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--text)] truncate">
                        {suggestion.display_name.split(',')[0]}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">
                        {suggestion.display_name.split(',').slice(1).join(',').trim()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-2 bg-[var(--text)]/5 border-t border-[var(--border)]">
                <p className="text-[9px] text-[var(--text-muted)] text-center italic">
                  Powered by OpenStreetMap
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
