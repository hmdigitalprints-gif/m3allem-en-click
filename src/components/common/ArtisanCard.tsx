import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, ShieldCheck, User, Calendar } from 'lucide-react';

const ArtisanCard = memo(({ name, category, rating, reviews, price, image, onAction, isVerified, isOnline, city = 'Casablanca', jobs = 42 }: any) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="card flex flex-col bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl shadow-sm hover:shadow-xl hover:border-[var(--accent)]/30 transition-all overflow-hidden h-full"
    >
      <div className="flex flex-col p-4 md:p-6 flex-1">
        {/* Top Info Section: Avatar, Name, Category, Rating */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm bg-[var(--card-surface)]">
              <img 
                src={image} 
                className="w-full h-full object-cover" 
                alt={name} 
                referrerPolicy="no-referrer" 
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className={`absolute -top-1.5 -right-1.5 w-4.5 h-4.5 md:w-5 md:h-5 text-[9px] font-black uppercase text-white flex items-center justify-center rounded-full border-[3px] border-[var(--card-bg)] shadow-md ${isOnline ? 'bg-[var(--success)]' : 'bg-gray-400'}`} title={isOnline ? 'Online' : 'Offline'}>
            </div>
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-start pt-1">
            <div className="flex flex-wrap items-start justify-between gap-2 overflow-hidden mb-1">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <h3 className="text-base md:text-lg font-bold text-[var(--text)] truncate" title={name}>{name}</h3>
                {isVerified && <span title="Verified"><ShieldCheck size={16} className="text-[var(--success)] shrink-0" /></span>}
              </div>
              <div className="flex items-center gap-1 bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded-lg text-xs font-bold shrink-0">
                <Star size={12} fill="currentColor" />
                {rating} <span className="text-[var(--text-muted)] font-normal ml-0.5">({reviews})</span>
              </div>
            </div>
            
            <p className="text-[var(--text-muted)] text-xs md:text-sm truncate mb-3">{category}</p>
            
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <div className="flex items-center gap-1 bg-[var(--card-surface)] px-2 py-1 rounded-md border border-[var(--border)] shrink-0">
                <MapPin size={12} className="text-[var(--accent)] shrink-0" />
                <span className="truncate max-w-[100px] sm:max-w-[150px]">{city}</span>
              </div>
              <div className="bg-[var(--card-surface)] px-2 py-1 rounded-md border border-[var(--border)] shrink-0 font-bold whitespace-nowrap">
                {jobs} Jobs
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Bottom Section: Price & Action */}
        <div className="flex flex-col gap-3 mt-2 border-t border-[var(--border)] border-dashed pt-4">
          <div className="flex items-end justify-between">
            <div className="text-[10px] md:text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Starting From</div>
            <div className="text-[var(--accent)] font-black text-lg md:text-xl tracking-tight">{price}</div>
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full mt-2">
            <button 
              onClick={() => onAction?.('view')}
              className="flex-1 min-w-[70px] bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] rounded-xl md:rounded-2xl font-bold text-xs hover:bg-[var(--border)] transition-colors active:scale-95 py-2.5 md:py-3 flex items-center justify-center gap-1.5"
            >
              <User size={14} /> <span className="hidden sm:inline">View</span>
            </button>
            <button 
              onClick={() => onAction?.('quick-book')}
              className="flex-1 min-w-[70px] bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs hover:bg-[var(--warning)]/20 transition-colors active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
              title="Book instantly using default settings (Cash, ASAP)"
            >
              ⚡ <span className="hidden sm:inline">Quick</span>
            </button>
            <button 
              onClick={() => onAction?.('book')}
              className="flex-[2] min-w-[120px] bg-[var(--accent)] text-[var(--accent-foreground)] py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs hover:opacity-90 transition-colors active:scale-95 shadow-lg shadow-[var(--accent)]/20 flex items-center justify-center gap-1.5"
            >
              <Calendar size={14} /> Book
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ArtisanCard;

