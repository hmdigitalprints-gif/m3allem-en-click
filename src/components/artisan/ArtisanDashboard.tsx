import React, { useState, useEffect } from 'react';
import premiumLogo from '../../assets/images/logo.webp';
import { formatDuration } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  Wallet, 
  MessageSquare,
  MessageCircle,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  Briefcase,
  Video,
  Zap,
  Plus,
  Image,
  Trash2,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Navigation,
  Phone,
  CheckCircle2,
  AlertCircle,
  User,
  BrainCircuit,
  Sparkles,
  Banknote,
  CreditCard,
  Wrench,
  Camera,
  ArrowRight,
  ShieldCheck,
  Headset,
  Home as HomeIcon,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Booking } from '../../services/marketplaceService';
import { aiService } from '../../services/aiService';
import { socket, connectSocket } from '../../services/socket';
import MessagesSection from '../marketplace/MessagesSection';
import NavButton from '../common/NavButton';
import MobileNav from '../common/MobileNav';
import { StatCard } from './shared/StatCard';
import { DashboardTab } from './tabs/DashboardTab';
import { RequestsTab } from './tabs/RequestsTab';
import { NearbyTab } from './tabs/NearbyTab';
import { ServicesTab } from './tabs/ServicesTab';
import { PortfolioTab } from './tabs/PortfolioTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { WalletTab } from './tabs/WalletTab';
import { SupportTab } from './tabs/SupportTab';
import { ProfileTab } from './tabs/ProfileTab';
import { SettingsTab } from './tabs/SettingsTab';
import { AddPortfolioModal } from './modals/AddPortfolioModal';
import { ProposeModal } from './modals/ProposeModal';
import { AddServiceModal } from './modals/AddServiceModal';
import { WithdrawModal } from './modals/WithdrawModal';

import { useArtisanDashboard, useArtisanModals } from './hooks/useArtisanDashboard';
import { DashboardSidebar } from './layout/DashboardSidebar';
import { DashboardHeader } from './layout/DashboardHeader';

export default function ArtisanDashboard({ onLogout, onSwitchView, onAction, isDarkMode, toggleTheme }: { 
  onLogout: () => void, 
  onSwitchView: () => void,
  onAction: (msg: string) => void,
  isDarkMode: boolean,
  toggleTheme: () => void
}) {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const { settings } = useSettings();
  
  const {
    activeTab, setActiveTab,
    isMobileMenuOpen, setIsMobileMenuOpen,
    stats, setStats,
    nearbyJobs, setNearbyJobs,
    bookings, setBookings,
    completingBookingId,
    artisanServices, setArtisanServices,
    loading,
    servicesLoading, setServicesLoading,
    currentTime,
    categories, setCategories,
    portfolio, setPortfolio,
    reviews, setReviews,
    transactions, setTransactions,
    portfolioLoading, setPortfolioLoading,
    artisanSettings, setArtisanSettings,
    personalInfo, setPersonalInfo,
    fieldErrors, setFieldErrors,
    handleStatusUpdate,
    fetchNearbyJobs,
    handleStatusToggle,
    validateProfileField,
    validateServiceField,
    validateWithdrawField,
    handleSaveSettings,
    fetchDashboardData
  } = useArtisanDashboard(user, onAction);

  const {
    showProposeModal, setShowProposeModal,
    showAddServiceModal, setShowAddServiceModal,
    showWithdrawModal, setShowWithdrawModal,
    showAddPortfolioModal, setShowAddPortfolioModal,
    withdrawAmount, setWithdrawAmount,
    uploading, setUploading,
    selectedJob, setSelectedJob,
    proposedPrice, setProposedPrice,
    aiSuggestion, setAiSuggestion,
    suggesting, setSuggesting,
    newPortfolioItem, setNewPortfolioItem,
    newService, setNewService,
    handlePropose,
    submitProposal,
    handleAddPortfolioItem,
    handleDeletePortfolioItem,
    handleAddService,
    handleWithdraw,
    handleDeleteService,
    handleFileChange
  } = useArtisanModals(onAction, fetchNearbyJobs, setPortfolio, setArtisanServices, categories, stats, setStats, setTransactions);
  
  const symbolUrl = isDarkMode ? (settings?.branding_symbol_dark || settings?.branding_symbol_light || premiumLogo) : (settings?.branding_symbol_light || premiumLogo);

  const handleUpdateProfile = async (data: any) => {
    try {
      await updateProfile(data);
      // Secondary update for artisan-specific settings if needed
      if (data.expertise || data.bio || data.years_experience || data.certifications) {
        await fetch('/api/artisans/settings', {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            expertise: data.expertise,
            bio: data.bio,
            yearsExperience: data.years_experience,
            certifications: data.certifications
          })
        });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const navItems = [
    { id: 'home-redirect', label: t('nav_home', 'Home'), icon: <HomeIcon size={18} />, onClick: onSwitchView },
    { id: 'dashboard', label: t('nav_dashboard', 'Dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'requests', label: t('nav_requests', 'Requests'), icon: <Calendar size={18} /> },
    { id: 'nearby', label: t('nav_nearby_jobs', 'Nearby Jobs'), icon: <MapPin size={18} /> },
    { id: 'services', label: t('nav_my_services', 'My Services'), icon: <Briefcase size={18} /> },
    { id: 'portfolio', label: t('nav_portfolio', 'Portfolio'), icon: <Image size={18} /> },
    { id: 'reviews', label: t('nav_reviews', 'Reviews'), icon: <Star size={18} /> },
    { id: 'messages', label: t('nav_messages', 'Messages'), icon: <MessageSquare size={18} /> },
    { id: 'wallet', label: t('nav_wallet', 'Wallet'), icon: <Wallet size={18} /> },
    { id: 'support', label: t('nav_support', 'Support'), icon: <Headset size={18} /> },
    { id: 'profile', label: t('nav_profile', 'Profile'), icon: <User size={18} /> },
    { id: 'settings', label: t('nav_settings', 'Settings'), icon: <Settings size={18} /> }
  ];

  const renderContent = () => {
    if (loading) {
      return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab 
            stats={stats}
            bookings={bookings}
            handleStatusUpdate={handleStatusUpdate}
            setActiveTab={setActiveTab}
            setShowAddServiceModal={setShowAddServiceModal}
            completingBookingId={completingBookingId}
            currentTime={currentTime}
            onAction={onAction}
          />
        );
      case 'requests':
        return (
          <RequestsTab 
            bookings={bookings}
            handleStatusUpdate={handleStatusUpdate}
            onAction={onAction}
            user={user}
            setActiveTab={setActiveTab}
          />
        );
      case 'nearby':
        return (
          <NearbyTab 
            nearbyBookings={nearbyJobs}
            handlePropose={handlePropose}
            t={t}
          />
        );
      case 'services':
        return (
          <ServicesTab 
            artisanServices={artisanServices}
            servicesLoading={servicesLoading}
            setShowAddService={setShowAddServiceModal}
            onAction={onAction}
            handleDeleteService={handleDeleteService}
          />
        );
      case 'portfolio':
        return (
          <PortfolioTab 
            portfolio={portfolio}
            portfolioLoading={portfolioLoading}
            setShowAddPortfolio={setShowAddPortfolioModal}
            handleDeletePortfolio={handleDeletePortfolioItem}
          />
        );
      case 'wallet':
        return (
          <WalletTab 
            stats={stats}
            transactions={transactions}
            setShowWithdrawModal={setShowWithdrawModal}
          />
        );
      case 'reviews':
        return (
          <ReviewsTab 
            stats={stats}
            reviews={reviews}
          />
        );
      case 'messages':
        return <MessagesSection />;
      case 'support':
        return (
          <SupportTab 
            onAction={onAction}
          />
        );
      case 'profile':
        return (
          <ProfileTab 
            user={user}
            stats={stats}
            personalInfo={personalInfo}
            setPersonalInfo={setPersonalInfo}
            artisanSettings={artisanSettings}
            setArtisanSettings={setArtisanSettings}
            fieldErrors={fieldErrors}
            validateProfileField={validateProfileField}
            updateProfile={handleUpdateProfile}
            onAction={onAction}
          />
        );
      case 'settings':
        return (
          <SettingsTab 
            artisanSettings={artisanSettings}
            setArtisanSettings={setArtisanSettings}
            onAction={onAction}
            handleStatusToggle={handleStatusToggle}
            toggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
            handleSaveSettings={handleSaveSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden">
      <DashboardSidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        symbolUrl={symbolUrl}
        navItems={navItems}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative max-w-[100vw]">
        <DashboardHeader 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onSwitchView={onSwitchView}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          artisanOnlineStatus={artisanSettings.isOnline}
          onStatusToggle={handleStatusToggle}
          user={user}
          onAction={onAction}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-gradient-to-br from-transparent via-[var(--accent)]/[0.02] to-transparent">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav 
        activeTab={activeTab}
        onTabChange={(id) => {
          if (id === 'home-redirect') {
            onSwitchView();
          } else {
            setActiveTab(id);
          }
        }}
        navItems={[
          { id: 'home-redirect', label: t('nav_home', 'Home'), icon: <HomeIcon size={18} /> },
          { id: 'dashboard', label: t('nav_dashboard', 'Dash'), icon: <LayoutDashboard size={18} /> },
          { id: 'requests', label: t('nav_requests', 'Jobs'), icon: <Calendar size={18} /> },
          { id: 'messages', label: t('nav_messages', 'Inbox'), icon: <MessageSquare size={18} /> },
          { id: 'wallet', label: t('nav_wallet', 'Wallet'), icon: <Wallet size={18} /> },
          { id: 'profile', label: t('nav_profile', 'Me'), icon: <User size={18} /> }
        ]}
      />

      <AddPortfolioModal 
        show={showAddPortfolioModal}
        onClose={() => setShowAddPortfolioModal(false)}
        onSubmit={async (e) => {
          e.preventDefault();
          await handleAddPortfolioItem();
        }}
        newPortfolio={newPortfolioItem}
        setNewPortfolio={setNewPortfolioItem}
        submitting={uploading}
      />
      <ProposeModal 
        show={showProposeModal}
        onClose={() => setShowProposeModal(false)}
        selectedJob={selectedJob}
        proposedPrice={proposedPrice}
        setProposedPrice={setProposedPrice}
        onSubmit={submitProposal}
        aiSuggestion={aiSuggestion}
        suggesting={suggesting}
        submitting={suggesting}
      />

      <AddServiceModal 
        show={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        onSubmit={async (e) => {
          e.preventDefault();
          await handleAddService();
        }}
        newService={newService}
        setNewService={setNewService}
        categories={categories}
        submitting={servicesLoading}
      />

      <WithdrawModal 
        show={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSubmit={async (e) => {
          e.preventDefault();
          await handleWithdraw();
        }}
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        earnings={stats.earnings}
        submitting={loading}
      />
    </div>
  );
}

