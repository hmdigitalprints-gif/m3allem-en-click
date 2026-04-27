import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, ShieldCheck } from 'lucide-react';

interface ArtisanCardProps {
  name: string;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  image: string;
  onAction?: (type: 'view' | 'book') => void;
  isVerified?: boolean;
  isOnline?: boolean;
  city?: string;
  jobs?: number;
}

export default function ArtisanCard({ 
  name, 
  category, 
  rating, 
  reviews, 
  price, 
  image, 
  onAction, 
  isVerified, 
  isOnline,
  city = 'Casablanca', 
  jobs = 42 
}: ArtisanCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="card-luxury overflow-hidden group flex flex-col"
    >
      <div className="p-4 md:p-6 flex flex-col flex-1">
        <div className="relative mb-6">
          <div className="aspect-[3/4] overflow-hidden rounded-[24px] md:rounded-[32px] relative group-hover:shadow-2xl transition-all duration-700">
            <img 
              src={image} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              alt={name} 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="absolute top-4 right-4 bg-[var(--bg)]/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[var(--accent)] text-[10px] font-bold shadow-sm">
              <Star size={12} fill="currentColor" />
              {rating}
            </div>
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {isVerified && (
                <div className="bg-[var(--accent)] text-[var(--accent-foreground)] p-1.5 rounded-full shadow-lg">
                  <ShieldCheck size={14} />
                </div>
              )}
              <div className={`px-2 py-0.5 rounded-full backdrop-blur-md text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg ${isOnline ? 'bg-[var(--success)]/80 text-white' : 'bg-[var(--text-muted)]/80 text-white'}`}>
                <div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <div className="bg-[var(--bg)]/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[var(--text)] text-[10px] font-bold shadow-sm">
                <MapPin size={10} className="text-[var(--accent)]" />
                {city}
              </div>
              <div className="bg-[var(--accent)] text-[var(--accent-foreground)] px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
                {price}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="micro-label mb-1">{category}</p>
              <h3 className="text-xl md:text-2xl font-display font-bold text-[var(--text)] tracking-tight group-hover:text-[var(--accent)] transition-colors">{name}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">{jobs} <span className="italic-serif">Jobs</span></p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <Star size={10} fill="var(--accent)" className="text-[var(--accent)]" />
                <span className="text-[10px] font-bold">{rating}</span>
                <span className="text-[10px] text-[var(--text-muted)]">({reviews})</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => onAction?.('view')}
              className="flex-1 bg-transparent border border-[var(--border)] text-[var(--text)] rounded-2xl font-bold text-xs hover:bg-[var(--accent)]/5 transition-all active:scale-95 py-3.5 uppercase tracking-widest"
            >
              Profile
            </button>
            <button 
              onClick={() => onAction?.('book')}
              className="flex-1 bg-[var(--accent)] text-[var(--accent-foreground)] py-3.5 rounded-2xl font-bold text-xs hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20 uppercase tracking-widest"
            >
              Book
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
