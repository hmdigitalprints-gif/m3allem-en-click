import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Artisan, Category } from '../../services/marketplaceService';
import HomeSection from '../marketplace/HomeSection';
import FindSection from '../marketplace/FindSection';
import StoreSection from '../store/StoreSection';
import BookingsSection from '../marketplace/BookingsSection';
import AccountSection from '../profile/AccountSection';
import MessagesSection from '../marketplace/MessagesSection';
import FactureDevisManager from '../documents/FactureDevisManager';
import ProfileCompletionBanner from '../profile/ProfileCompletionBanner';

import CustomerDashboard from '../dashboard/CustomerDashboard';

interface CustomerViewProps {
  activeTab: 'dashboard' | 'home' | 'find' | 'store' | 'bookings' | 'account' | 'documents' | 'messages';
  onAction: (msg: string) => void;
  onSelectArtisan: (id: string) => void;
  onBookArtisan: (artisan: any, isQuick?: boolean) => void;
  categories: Category[];
  featuredArtisans: Artisan[];
  recommendedArtisans: Artisan[];
  onNavigate: (tab: 'dashboard' | 'home' | 'find' | 'store' | 'bookings' | 'account' | 'documents' | 'messages') => void;
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
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <CustomerDashboard onNavigate={onNavigate} onAction={onAction} />
          </motion.div>
        )}
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
        {activeTab === 'documents' && (
          <motion.div
            key="documents"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <FactureDevisManager onAction={onAction} />
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
        {activeTab === 'messages' && (
          <motion.div
            key="messages"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <MessagesSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
