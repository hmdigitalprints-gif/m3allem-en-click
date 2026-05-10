import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, ShieldCheck, User, Calendar } from 'lucide-react';

export default function ArtisanCard({ name, category, rating, reviews, price, image, onAction, isVerified, isOnline, city = 'Casablanca', jobs = 42 }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="card overflow-hidden group hover:border-[var(--accent)]/30 transition-all flex flex-col bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl shadow-sm hover:shadow-xl"
    >
      <div className="h-48 md:h-64 relative overflow-hidden shrink-0">
        <img 
          src={image} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          alt={name} 
          referrerPolicy="no-referrer" 
          loading="lazy"
          decoding="async"
        />
        
        {/* Status Indicator */}
        <div className="absolute top-4 start-4 flex items-center gap-2">
          {isVerified && (
            <div className="bg-[var(--success)] text-white p-1.5 rounded-full shadow-lg">
              <ShieldCheck size={16} />
            </div>
          )}
          <div className={`px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg ${isOnline ? 'bg-[var(--success)]/80 text-white' : 'bg-[var(--text-muted)]/80 text-white'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        <div className="absolute top-4 end-4 bg-[var(--bg)]/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[var(--accent)] text-sm font-bold shadow-sm">
          <Star size={14} fill="currentColor" />
          {rating} <span className="text-[var(--text-muted)] text-xs font-normal">({reviews})</span>
        </div>
        <div className="absolute bottom-4 start-4 bg-[var(--bg)]/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[var(--text)] text-xs font-bold shadow-sm">
          <MapPin size={12} className="text-[var(--accent)]" />
          {city}
        </div>
        {isVerified && (
          <div className="absolute top-4 start-4 bg-[var(--success)] text-white p-1.5 rounded-full shadow-lg">
            <ShieldCheck size={16} />
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg md:text-xl font-bold text-[var(--text)]">{name}</h3>
              {isVerified && <ShieldCheck size={16} className="text-[var(--success)]" />}
            </div>
            <p className="text-[var(--text-muted)] text-xs md:text-sm">{category}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[var(--accent)] font-bold text-base md:text-lg">{price}</p>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{jobs} Jobs</p>
          </div>
        </div>
        <div className="flex gap-2 mt-auto">
          <button 
            onClick={() => {
              onAction?.('view');
            }}
            className="flex-1 bg-[var(--text)]/5 border border-[var(--border)] text-[var(--text)] rounded-xl md:rounded-2xl font-bold text-xs md:text-xs hover:bg-[var(--text)]/10 transition-colors active:scale-95 py-2.5 md:py-3 flex items-center justify-center gap-1.5"
          >
            <User size={14} />
            View
          </button>
          <button 
            onClick={() => {
              onAction?.('quick-book');
            }}
            className="flex-1 bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-xs hover:bg-[var(--warning)]/20 transition-colors active:scale-95 flex items-center justify-center gap-1.5"
            title="Book instantly using default settings (Cash, ASAP)"
          >
            ⚡ Quick
          </button>
          <button 
            onClick={() => {
              onAction?.('book');
            }}
            className="flex-1 bg-[var(--accent)] text-[var(--accent-foreground)] py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-xs hover:opacity-90 transition-colors active:scale-95 shadow-lg shadow-[var(--accent)]/20 flex items-center justify-center gap-1.5"
          >
            <Calendar size={14} />
            Book
          </button>
        </div>
      </div>
    </motion.div>
  );
}
