import { useState, useEffect } from 'react';
import { formatDuration } from './lib/utils';
import { 
  Users, 
  MapPin,
  Calendar,
  MessageSquare,
  Search as SearchIcon,
  Plus,
  LogOut,
  Heart,
  User,
  Image as ImageIcon,
  Loader2,
  Hammer,
  Sun,
  Moon,
  ShieldCheck,
  Home as HomeIcon,
  Sparkles,
  ShoppingBag,
  Clock,
  Video,
  CheckCircle,
  FileText,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { lazy } from 'react';

// Lazy-loaded Pages
const Services = lazy(() => import('./pages/Services'));
const BecomeArtisan = lazy(() => import('./pages/BecomeArtisan'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const Careers = lazy(() => import('./pages/Careers'));
const Blog = lazy(() => import('./pages/Blog'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Cookies = lazy(() => import('./pages/Cookies'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

const ArtisanProfile = lazy(() => import('./pages/ArtisanProfile'));
const Messages = lazy(() => import('./pages/Messages'));
const MarketplaceExtras = lazy(() => import('./pages/MarketplaceExtras'));
const Profile = lazy(() => import('./pages/Profile'));
const BookingPage = lazy(() => import('./pages/Booking'));
const Devis = lazy(() => import('./pages/Devis'));
const AutoDevis = lazy(() => import('./pages/AutoDevis'));
const Facture = lazy(() => import('./pages/Facture'));
const Store = lazy(() => import('./pages/Store'));
const FindM3allem = lazy(() => import('./pages/FindM3allem'));
const Auth = lazy(() => import('./pages/Auth'));
const PhoneDashboard = lazy(() => import('./pages/PhoneDashboard'));
const SimulationDashboard = lazy(() => import('./components/debug/SimulationDashboard'));

import ArtisanProfileModal from './components/marketplace/ArtisanProfile';
import BookingModal from './components/marketplace/BookingModal';
import ChatModal from './components/marketplace/ChatModal';
import { AuthScreens } from './components/auth/AuthScreens';
import { AuthRouteGuard } from './components/auth/AuthRouteGuard';
import { Helmet } from 'react-helmet-async';
import { useDirection } from './hooks/useDirection';
import i18nInstance from './i18n.ts';
import { useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import NotificationBell from './components/layout/NotificationBell';
import { 
  marketplaceService, 
  Artisan, 
  Category
} from './services/marketplaceService';
import { aiService } from './services/aiService';
import LiveDiagnostic from './components/marketplace/LiveDiagnostic';
import MapTracking from './components/marketplace/MapTracking';
import { socket, connectSocket } from './services/socket';

import NavButton from './components/common/NavButton';
import MobileNav from './components/common/MobileNav';
import PromoBanner from './components/common/PromoBanner';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Lazy loaded Dashboards
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const ArtisanDashboard = lazy(() => import('./components/artisan/ArtisanDashboard'));
const SellerDashboard = lazy(() => import('./components/seller/SellerDashboard'));
const CompanyDashboard = lazy(() => import('./components/company/CompanyDashboard'));
const CustomerView = lazy(() => import('./components/layout/CustomerView'));
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import ProfileCompletionBanner from './components/profile/ProfileCompletionBanner';

import { LanguageSwitcher } from './components/layout/LanguageSwitcher';

import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';

export default function App() {
  const { t } = useTranslation();
  const i18n = i18nInstance; // Use global instance
  const { dir, language } = useDirection();

  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { toast, showToast } = useToast();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [view, setView] = useState<'admin' | 'customer' | 'artisan' | 'seller' | 'company'>('customer');
  const [customerTab, setCustomerTab] = useState<'dashboard' | 'home' | 'find' | 'store' | 'bookings' | 'account' | 'documents' | 'messages'>(() => (sessionStorage.getItem('m3allem_customerTab') as any) || 'dashboard');

  useEffect(() => { sessionStorage.setItem('m3allem_customerTab', customerTab); }, [customerTab]);
  
  // Sync language with user preference
  useEffect(() => {
    if (user?.preferred_language && i18n.language !== user.preferred_language) {
      i18n.changeLanguage(user.preferred_language);
      // Persist in custom key for fetch interceptor robustness
      localStorage.setItem('m3allem_lang', user.preferred_language);
    }
  }, [user?.preferred_language, i18n]);

  const [selectedArtisanId, setSelectedArtisanId] = useState<string | null>(null);
  const [bookingArtisan, setBookingArtisan] = useState<any | null>(null);
  const [isQuickBook, setIsQuickBook] = useState(false);
  const [chatArtisan, setChatArtisan] = useState<any | null>(null);
  const [realCategories, setRealCategories] = useState<Category[]>([]);
  const [featuredArtisans, setFeaturedArtisans] = useState<Artisan[]>([]);
  const [recommendedArtisans, setRecommendedArtisans] = useState<Artisan[]>([]);

  const [trackingBooking, setTrackingBooking] = useState<any | null>(null);
  const [activeCall, setActiveCall] = useState<{ artisanId: string, artisanName: string, artisanUserId: string, isArtisan: boolean, signal?: any } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ from: string, fromName: string, type: string, signal: any } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      setShowLogin(true);
      // Remove the query param without reloading
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') setView('admin');
      else if (user.role === 'artisan') setView('artisan');
      else if (user.role === 'seller') setView('seller');
      else if (user.role === 'company') setView('company');
      else setView('customer');
    }
  }, [user]);

  useEffect(() => {
    marketplaceService.getCategories().then(setRealCategories);
    marketplaceService.getArtisans({ sortBy: 'rating' }).then(setFeaturedArtisans);
    
    if (user) {
      aiService.getRecommendations(user.id).then(setRecommendedArtisans);
    }

    const handleStartDiagnostic = (e: any) => {
      setActiveCall({ 
        artisanId: e.detail.artisanId, 
        artisanName: e.detail.artisanName, 
        artisanUserId: e.detail.artisanUserId,
        isArtisan: user?.role === 'artisan'
      });
    };

    window.addEventListener('start-live-diagnostic', handleStartDiagnostic);

    if (user?.id) {
      connectSocket();
      socket.emit('join', user.id);
    }

    socket.on('incoming_call', (data) => {
      if (data) setIncomingCall(data);
    });

    return () => {
      window.removeEventListener('start-live-diagnostic', handleStartDiagnostic);
      socket.off('incoming_call');
    };
  }, [user]);

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  const customerContent = (
    <CustomerView 
      activeTab={customerTab} 
      onAction={showToast} 
      onSelectArtisan={setSelectedArtisanId} 
      onBookArtisan={(artisan, isQuick) => {
        setBookingArtisan(artisan);
        if (isQuick) setIsQuickBook(true);
      }}
      categories={realCategories}
      featuredArtisans={featuredArtisans}
      recommendedArtisans={recommendedArtisans}
      onNavigate={setCustomerTab}
      onTrackArtisan={setTrackingBooking}
    />
  );

  const mainContent = !user ? (
    showLogin ? <AuthScreens onSuccess={() => setShowLogin(false)} onBack={() => setShowLogin(false)} /> : <LandingPage onGetStarted={() => setShowLogin(true)} onAction={(msg) => showToast(msg, 'info')} isDarkMode={isDarkMode} toggleTheme={toggleTheme} user={user} />
  ) : (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
      <PromoBanner />
      
      {view === 'admin' ? (
        <ErrorBoundary>
          <AdminDashboard 
            onSwitchView={() => setView('customer')} 
            onLogout={logout} 
            onAction={showToast}
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
          />
        </ErrorBoundary>
      ) : view === 'artisan' ? (
        <ErrorBoundary><ArtisanDashboard onLogout={logout} onSwitchView={() => setView('customer')} onAction={(msg) => showToast(msg)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} /></ErrorBoundary>
      ) : view === 'seller' ? (
        <ErrorBoundary><SellerDashboard onLogout={logout} onSwitchView={() => setView('customer')} onAction={(msg) => showToast(msg)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} /></ErrorBoundary>
      ) : view === 'company' ? (
        <ErrorBoundary><CompanyDashboard onLogout={logout} onSwitchView={() => setView('customer')} onAction={(msg) => showToast(msg)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} /></ErrorBoundary>
      ) : (
        <AppLayout 
          activeTab={customerTab} 
          onTabChange={(tab: any) => setCustomerTab(tab)}
          onSwitchView={setView}
        >
          {user.role !== 'admin' && <ProfileCompletionBanner onComplete={() => setCustomerTab('account')} />}
          {customerContent}
        </AppLayout>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <html lang={language} dir={dir} />
        <title>{t('meta_title', 'M3allem - Multilingual Home Services')}</title>
        <meta name="description" content={t('meta_description', "Morocco's premier marketplace for verified artisans.")} />
      </Helmet>
      
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={mainContent} />
          <Route path="/store" element={<Store />} />
          <Route path="/profile" element={<AuthRouteGuard><Profile /></AuthRouteGuard>} />
          <Route path="/artisan/:id" element={<ArtisanProfile />} />
          <Route path="/booking" element={<AuthRouteGuard><BookingPage /></AuthRouteGuard>} />
          <Route path="/devis" element={<AuthRouteGuard><Devis /></AuthRouteGuard>} />
          <Route path="/auto-devis" element={<AuthRouteGuard><AutoDevis /></AuthRouteGuard>} />
          <Route path="/facture" element={<AuthRouteGuard><Facture /></AuthRouteGuard>} />
          <Route path="/find-pro" element={<FindM3allem />} />
          <Route path="/messages" element={<AuthRouteGuard><Messages /></AuthRouteGuard>} />
          <Route path="/marketplace-extras" element={<MarketplaceExtras />} />
          <Route path="/services" element={<Services />} />
          <Route path="/become-artisan" element={<BecomeArtisan />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/phone-auth" element={<Auth />} />
          <Route path="/phone-dashboard" element={<AuthRouteGuard><PhoneDashboard /></AuthRouteGuard>} />
          {!import.meta.env.PROD && (
            <Route path="/debug" element={<AuthRouteGuard role="admin"><SimulationDashboard /></AuthRouteGuard>} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Modals & UI */}
        <AnimatePresence>
          {trackingBooking && (
            <MapTracking 
              artisanId={trackingBooking.artisan_id}
              artisanName={trackingBooking.other_party_name}
              clientLocation={[trackingBooking.location_lat || 33.5731, trackingBooking.location_lng || -7.5898]}
              onClose={() => setTrackingBooking(null)}
            />
          )}
          {activeCall && user && (
            <LiveDiagnostic 
              userId={user.id}
              userName={user.name}
              targetUserId={activeCall.artisanUserId}
              targetUserName={activeCall.artisanName}
              isArtisan={activeCall.isArtisan}
              initialSignal={activeCall.signal}
              onClose={() => setActiveCall(null)}
            />
          )}

          {incomingCall && user && (
            <motion.div 
              initial={{ opacity: 0, y: -50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -50, x: '-50%' }}
              className="fixed top-10 left-1/2 z-[300] bg-[var(--card-bg)] border border-[var(--accent)]/20 p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-4 min-w-[300px]"
            >
              <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-full flex items-center justify-center text-[var(--accent)] animate-pulse">
                <Video size={32} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg">{t('incoming_diagnostic', 'Incoming Live Diagnostic')}</h3>
                <p className="text-[var(--text-muted)] text-sm">{t('from', 'from')} {incomingCall?.fromName}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => {
                    if (!incomingCall) return;
                    setActiveCall({ 
                      artisanId: '', 
                      artisanName: incomingCall.fromName,
                      artisanUserId: incomingCall.from,
                      isArtisan: user?.role === 'artisan',
                      signal: incomingCall.signal
                    });
                    setIncomingCall(null);
                  }}
                  className="flex-1 bg-[#FFD700] text-black py-3 rounded-xl font-bold hover:bg-[#E6C200] transition-all"
                >
                  {t('accept', 'Accept')}
                </button>
                <button 
                  onClick={() => setIncomingCall(null)}
                  className="flex-1 bg-rose-500/10 text-rose-500 py-3 rounded-xl font-bold hover:bg-rose-500/20 transition-all"
                >
                  {t('reject', 'Reject')}
                </button>
              </div>
            </motion.div>
          )}

          {selectedArtisanId && (
            <ArtisanProfileModal 
              artisanId={selectedArtisanId} 
              onClose={() => setSelectedArtisanId(null)}
              onBook={(artisan) => {
                setSelectedArtisanId(null);
                setBookingArtisan(artisan);
              }}
              onChat={(artisan) => {
                setSelectedArtisanId(null);
                setChatArtisan(artisan);
              }}
            />
          )}
          {bookingArtisan && (
            <BookingModal 
              artisan={bookingArtisan} 
              isQuickBook={isQuickBook}
              onClose={() => {
                setBookingArtisan(null);
                setIsQuickBook(false);
              }}
              onAction={showToast}
              onSuccess={() => {
                setBookingArtisan(null);
                setIsQuickBook(false);
                setCustomerTab('bookings');
                showToast(t('booking_success_msg', 'Booking requested successfully!'));
              }}
            />
          )}
          {chatArtisan && (
            <ChatModal
              artisan={chatArtisan}
              currentUser={user}
              onClose={() => setChatArtisan(null)}
            />
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className="fixed bottom-32 left-1/2 z-[100] bg-[var(--card-bg)] text-[var(--text)] px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3 border border-[var(--border)]"
            >
              <CheckCircle size={20} className="text-emerald-500" />
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to Home Button */}
        <AnimatePresence>
          {location.pathname !== '/' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => navigate('/')}
              className="fixed bottom-6 start-6 z-[60] py-3 px-6 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] shadow-2xl shadow-[var(--accent)]/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border border-[var(--accent-foreground)]/20"
              title={t('back_to_home')}
              id="back-to-home-btn"
            >
              <HomeIcon size={20} />
              <span className="font-bold text-sm">
                {t('back_to_home', 'Back to Home')}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </ErrorBoundary>
    </>
  );
}


// Extracted components removed


// HomeSection removed


// Extracted components removed


// Extracted components removed


// Extracted components removed




