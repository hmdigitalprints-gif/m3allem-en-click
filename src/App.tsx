import { jsPDF } from 'jspdf';
import React, { useState, useEffect } from 'react';
import { formatDuration } from './lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Hammer, 
  Settings, 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Search,
  Menu,
  Bell,
  ChevronRight,
  MapPin,
  Star,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Zap,
  Droplets,
  Paintbrush,
  Sparkles,
  Wind,
  HardHat,
  Smartphone,
  Smartphone as SmartHomeIcon,
  Filter,
  Home as HomeIcon,
  ShoppingBag,
  Search as SearchIcon,
  CreditCard,
  Banknote,
  Package,
  ArrowRight,
  Info,
  UserCog,
  Camera,
  Loader2,
  ShoppingCart,
  Plus,
  ArrowLeft,
  X,
  BrainCircuit,
  Video,
  LogOut,
  FileText,
  Heart,
  Save,
  Truck,
  User,
  Sun,
  Moon,
  Upload,
  Download,
  Wand2,
  Image as ImageIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { lazy } from 'react';

// Lazy-loaded Pages
const Services = lazy(() => import('./pages/Services'));
const BecomeArtisan = lazy(() => import('./pages/BecomeArtisan'));
const Contact = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.Contact })));
const Pricing = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.Pricing })));
const About = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.About })));
const Careers = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.Careers })));
const Blog = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.Blog })));
const Privacy = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.Terms })));
const Cookies = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.Cookies })));
const HowItWorks = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.HowItWorks })));
const MaterialsMarketplacePage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.MaterialsMarketplacePage })));
const LandingPage = lazy(() => import('./pages/LandingPage'));

const Home = lazy(() => import('./pages/Home'));
const ArtisanProfile = lazy(() => import('./pages/ArtisanProfile'));
const Messages = lazy(() => import('./pages/Messages'));
const MarketplaceExtras = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.MarketplaceExtras })));
const Profile = lazy(() => import('./pages/Profile'));
const BookingPage = lazy(() => import('./pages/Booking'));
const Devis = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.Devis })));
const AutoDevis = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.AutoDevis })));
const Facture = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.Facture })));
const Store = lazy(() => import('./pages/Store'));
const FindM3allem = lazy(() => import('./pages/FindM3allem'));
const Auth = lazy(() => import('./pages/Auth'));
const PhoneDashboard = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.PhoneDashboard })));

import ArtisanProfileModal from './components/marketplace/ArtisanProfile';
import BookingModal from './components/marketplace/BookingModal';
import ChatModal from './components/marketplace/ChatModal';
import { AuthScreens } from './components/auth/AuthScreens';
import { useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import AdminDashboard from './components/admin/AdminDashboard';
import ArtisanDashboard from './components/artisan/ArtisanDashboard';
import SellerDashboard from './components/seller/SellerDashboard';
import CompanyDashboard from './components/company/CompanyDashboard';
import NotificationBell from './components/layout/NotificationBell';
import { 
  marketplaceService, 
  bookingService, 
  walletService,
  Artisan, 
  Category, 
  Booking 
} from './services/marketplaceService';
import { aiService } from './services/aiService';
import AiChatbot from './components/ai/AiChatbot';
import LiveDiagnostic from './components/marketplace/LiveDiagnostic';
import MapTracking from './components/marketplace/MapTracking';
import { socket, connectSocket } from './services/socket';

import WalletSection from './components/profile/WalletSection';
import AccountSection from './components/profile/AccountSection';
import StoreSection from './components/store/StoreSection';

import { NavButton, SidebarItem, StatCard, ActivityItem, OrderRow } from './components/common';
import ArtisanCard from './components/common/ArtisanCard';
import CustomerView from './components/layout/CustomerView';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';

import { LanguageSwitcher } from './components/layout/LanguageSwitcher';

const data = [
  { name: 'Mon', revenue: 4000, commissions: 400 },
  { name: 'Tue', revenue: 3000, commissions: 300 },
  { name: 'Wed', revenue: 2000, commissions: 200 },
  { name: 'Thu', revenue: 2780, commissions: 278 },
  { name: 'Fri', revenue: 1890, commissions: 189 },
  { name: 'Sat', revenue: 2390, commissions: 239 },
  { name: 'Sun', revenue: 3490, commissions: 349 },
];


export default function App() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { toast, showToast } = useToast();
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [view, setView] = useState<'admin' | 'customer' | 'artisan' | 'seller' | 'company'>('customer');
  const [customerTab, setCustomerTab] = useState<'home' | 'find' | 'store' | 'bookings' | 'account' | 'creative'>('home');
  const [artisanTab, setArtisanTab] = useState<'dashboard' | 'requests' | 'services' | 'wallet' | 'profile'>('dashboard');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedArtisanId, setSelectedArtisanId] = useState<string | null>(null);
  const [bookingArtisan, setBookingArtisan] = useState<any | null>(null);
  const [isQuickBook, setIsQuickBook] = useState(false);
  const [chatArtisan, setChatArtisan] = useState<any | null>(null);
  const [realCategories, setRealCategories] = useState<Category[]>([]);
  const [featuredArtisans, setFeaturedArtisans] = useState<Artisan[]>([]);
  const [recommendedArtisans, setRecommendedArtisans] = useState<Artisan[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    activeArtisans: 0
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    if (user && user.role === 'admin' && token) {
      fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch stats'))
        .then(data => setStats(data))
        .catch(err => console.error('Error fetching stats:', err));
    }

    marketplaceService.getCategories().then(setRealCategories);
    marketplaceService.getArtisans({ sortBy: 'rating' }).then(setFeaturedArtisans);
    
    if (user) {
      aiService.getRecommendations(user.id).then(setRecommendedArtisans);
    }

    const handleStartDiagnostic = (e: any) => {
      const currentUser = JSON.parse(localStorage.getItem('m3allem_user') || '{}');
      setActiveCall({ 
        artisanId: e.detail.artisanId, 
        artisanName: e.detail.artisanName, 
        artisanUserId: e.detail.artisanUserId,
        isArtisan: currentUser.role === 'artisan'
      });
    };

    window.addEventListener('start-live-diagnostic', handleStartDiagnostic);

    if (token) {
      connectSocket(token);
      if (user?.id) {
        socket.emit('join', user.id);
      }
    }

    socket.on('incoming_call', (data) => {
      if (data) setIncomingCall(data);
    });

    return () => {
      window.removeEventListener('start-live-diagnostic', handleStartDiagnostic);
      socket.off('incoming_call');
    };
  }, [user, token]);

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  const mainContent = !user ? (
    showLogin ? <AuthScreens onSuccess={() => setShowLogin(false)} onBack={() => setShowLogin(false)} /> : <LandingPage onGetStarted={() => setShowLogin(true)} onAction={(msg) => showToast(msg, 'info')} isDarkMode={isDarkMode} toggleTheme={toggleTheme} user={user} />
  ) : (
    <div className="h-screen bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden flex flex-col">
      {view === 'admin' ? (
        <AdminDashboard 
          onSwitchView={() => setView('customer')} 
          onLogout={logout} 
          onAction={showToast}
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
        />
      ) : view === 'artisan' ? (
        <ArtisanDashboard onLogout={logout} onAction={(msg) => showToast(msg)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      ) : view === 'seller' ? (
        <SellerDashboard onLogout={logout} onAction={(msg) => showToast(msg)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      ) : view === 'company' ? (
        <CompanyDashboard onLogout={logout} onAction={(msg) => showToast(msg)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-16 md:h-20 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl flex items-center justify-between px-3 md:px-6 sticky top-0 z-40 shrink-0">
            <div className="flex items-center gap-2 md:gap-4">
              {customerTab !== 'home' && (
                <button 
                  onClick={() => setCustomerTab('home')}
                  className="p-1.5 md:p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-md md:shadow-lg flex items-center justify-center"
                  title="Back to Home"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/30 transform hover:rotate-12 transition-transform duration-300">
                <Hammer size={16} className="text-black" />
              </div>
              <div>
                <h1 className="text-base md:text-xl font-black tracking-tight uppercase italic flex items-center gap-1">
                  M3allem <span className="text-[var(--accent)] hidden sm:inline">En Click</span>
                </h1>
                <p className="hidden md:block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">{t('crafting_excellence', 'Crafting Excellence')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 md:gap-4">
              <LanguageSwitcher />
              <button 
                onClick={toggleTheme}
                className="p-1.5 md:p-3 rounded-full glass hover:scale-110 transition-all active:scale-95 shadow-md flex items-center justify-center"
              >
                {isDarkMode ? <Sun className="text-yellow-400" size={16} /> : <Moon className="text-blue-500" size={16} />}
              </button>
              <NotificationBell userId={user.id} token={token} />
              {user.role === 'admin' && (
                <button 
                  onClick={() => setView('admin')}
                  className="p-1.5 md:p-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-sm flex items-center gap-2 font-bold"
                >
                  <ShieldCheck size={16} />
                  <span className="hidden lg:inline">{t('admin_panel', 'Admin Panel')}</span>
                </button>
              )}
              <div className="flex items-center gap-1 md:gap-3 ms-1 md:ms-0">
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-[var(--text)]/10 border border-[var(--border)] overflow-hidden">
                  <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '')}&background=FFD700&color=000`} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={logout}
                  className="p-1.5 md:p-2.5 rounded-xl bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-all active:scale-95"
                  title="Logout"
                >
                  <LogOut size={14} className="md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          </header>

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
          
          {/* Customer Bottom Nav */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95vw] md:w-auto z-40 bg-[var(--card-bg)]/80 md:bg-[var(--card-bg)]/40 backdrop-blur-2xl border border-[var(--border)] p-2 md:p-2 rounded-2xl md:rounded-full flex justify-between md:justify-center gap-1 md:gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-x-auto no-scrollbar">
            <NavButton 
              active={customerTab === 'home'} 
              onClick={() => setCustomerTab('home')}
              icon={<HomeIcon size={18} className="md:w-5 md:h-5" />}
              label={t('nav_home')}
            />
            <NavButton 
              active={customerTab === 'find'} 
              onClick={() => setCustomerTab('find')}
              icon={<SearchIcon size={18} className="md:w-5 md:h-5" />}
              label={t('nav_find')}
            />
            <NavButton 
              active={customerTab === 'creative'} 
              onClick={() => setCustomerTab('creative')}
              icon={<Sparkles size={18} className="md:w-5 md:h-5" />}
              label={t('nav_creative')}
            />
            <NavButton 
              active={customerTab === 'store'} 
              onClick={() => setCustomerTab('store')}
              icon={<ShoppingBag size={18} className="md:w-5 md:h-5" />}
              label={t('nav_store')}
            />
            <NavButton 
              active={customerTab === 'bookings'} 
              onClick={() => setCustomerTab('bookings')}
              icon={<Clock size={18} className="md:w-5 md:h-5" />}
              label={t('nav_bookings')}
            />
            <NavButton 
              active={customerTab === 'account'} 
              onClick={() => setCustomerTab('account')}
              icon={<Users size={18} className="md:w-5 md:h-5" />}
              label={t('nav_account')}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {trackingBooking && (
          <MapTracking 
            artisanId={trackingBooking.artisan_id}
            artisanName={trackingBooking.other_party_name}
            clientLocation={[trackingBooking.location_lat || 33.5731, trackingBooking.location_lng || -7.5898]}
            onClose={() => setTrackingBooking(null)}
          />
        )}
        {activeCall && (
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

        {incomingCall && (
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
              <h3 className="font-bold text-lg">Incoming Live Diagnostic</h3>
              <p className="text-[var(--text-muted)] text-sm">from {incomingCall?.fromName}</p>
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
                Accept
              </button>
              <button 
                onClick={() => setIncomingCall(null)}
                className="flex-1 bg-rose-500/10 text-rose-500 py-3 rounded-xl font-bold hover:bg-rose-500/20 transition-all"
              >
                Reject
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
              showToast('Booking requested successfully!');
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
    </div>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={mainContent} />
        <Route path="/store" element={<Store />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/artisan/:id" element={<ArtisanProfile />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/devis" element={<Devis />} />
        <Route path="/auto-devis" element={<AutoDevis />} />
        <Route path="/facture" element={<Facture />} />
        <Route path="/find-pro" element={<FindM3allem />} />
        <Route path="/messages" element={<Messages />} />
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
        <Route path="/phone-dashboard" element={<PhoneDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AiChatbot />
      <AnimatePresence>
        {location.pathname !== '/' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => navigate('/')}
            className="fixed bottom-6 left-6 z-[60] py-3 px-6 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] shadow-2xl shadow-[var(--accent)]/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            title="Back to Home"
            id="back-to-home-btn"
          >
            <HomeIcon size={20} />
            <span className="font-bold text-sm">
              Back to Home
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}


// Extracted components removed


// HomeSection removed


// Extracted components removed


// Extracted components removed


// Extracted components removed




