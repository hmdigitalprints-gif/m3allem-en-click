import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Artisan, Category } from '../../services/marketplaceService';
import HomeSection from '../marketplace/HomeSection';
import FindSection from '../marketplace/FindSection';
import StoreSection from '../store/StoreSection';
import BookingsSection from '../marketplace/BookingsSection';
import AccountSection from '../profile/AccountSection';
import AICreativeStudio from '../ai/AICreativeStudio';

interface CustomerViewProps {
  activeTab: 'home' | 'find' | 'store' | 'bookings' | 'account' | 'creative';
  onAction: (msg: string) => void;
  onSelectArtisan: (id: string) => void;
  onBookArtisan: (artisan: any, isQuick?: boolean) => void;
  categories: Category[];
  featuredArtisans: Artisan[];
  recommendedArtisans: Artisan[];
  onNavigate: (tab: 'home' | 'find' | 'store' | 'bookings' | 'account' | 'creative') => void;
  onTrackArtisan: (booking: any) => void;
}

export default function CustomerView({ 
  activeTab, 
  onAction, 
  onSelectArtisan, 
  onBookArtisan, 
  categories, 
  featuredArtisans, 
  recommendedArtisans, 
  onNavigate, 
  onTrackArtisan 
}: CustomerViewProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg)] pb-24 md:pb-28">
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <HomeSection 
              onAction={onAction} 
              onSelectArtisan={onSelectArtisan} 
              onBookArtisan={onBookArtisan}
              categories={categories}
              featuredArtisans={featuredArtisans}
              recommendedArtisans={recommendedArtisans}
            />
          </motion.div>
        )}
        {activeTab === 'creative' && (
          <motion.div
            key="creative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <AICreativeStudio onAction={onAction} />
          </motion.div>
        )}
        {activeTab === 'find' && (
          <motion.div
            key="find"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <FindSection 
              onAction={onAction} 
              onSelectArtisan={onSelectArtisan} 
              onBookArtisan={onBookArtisan}
              categories={categories}
            />
          </motion.div>
        )}
        {activeTab === 'store' && (
          <motion.div
            key="store"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <StoreSection onAction={onAction} />
          </motion.div>
        )}
        {activeTab === 'bookings' && (
          <motion.div
            key="bookings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <BookingsSection onAction={onAction} onNavigate={onNavigate} onTrackArtisan={onTrackArtisan} />
          </motion.div>
        )}
        {activeTab === 'account' && (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <AccountSection onAction={onAction} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
