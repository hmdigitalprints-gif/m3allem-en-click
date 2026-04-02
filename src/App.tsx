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
import Services from './pages/Services';
import BecomeArtisan from './pages/BecomeArtisan';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import HowItWorks from './pages/HowItWorks';
import MaterialsMarketplacePage from './pages/MaterialsMarketplacePage';
import ArtisanProfileModal from './components/marketplace/ArtisanProfile';
import BookingModal from './components/marketplace/BookingModal';
import ChatModal from './components/marketplace/ChatModal';
import { AuthScreens } from './components/auth/AuthScreens';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
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

// New Pages
import Home from './pages/Home';
import FindArtisan from './pages/FindArtisan';
import ArtisanProfile from './pages/ArtisanProfile';
import Messages from './pages/Messages';
import MarketplaceExtras from './pages/MarketplaceExtras';
import Profile from './pages/Profile';
import BookingPage from './pages/Booking';
import Devis from './pages/Devis';
import AutoDevis from './pages/AutoDevis';
import Facture from './pages/Facture';
import Store from './pages/Store';
import FindM3allem from './pages/FindM3allem';
import AiChatbot from './components/ai/AiChatbot';
import LiveDiagnostic from './components/marketplace/LiveDiagnostic';
import MapTracking from './components/marketplace/MapTracking';
import { socket, connectSocket } from './services/socket';

import NavButton from './components/common/NavButton';
import ArtisanCard from './components/common/ArtisanCard';
import SidebarItem from './components/common/SidebarItem';
import StatCard from './components/common/StatCard';
import ActivityItem from './components/common/ActivityItem';
import OrderRow from './components/common/OrderRow';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';

const data = [
  { name: 'Mon', revenue: 4000, commissions: 400 },
  { name: 'Tue', revenue: 3000, commissions: 300 },
  { name: 'Wed', revenue: 2000, commissions: 200 },
  { name: 'Thu', revenue: 2780, commissions: 278 },
  { name: 'Fri', revenue: 1890, commissions: 189 },
  { name: 'Sat', revenue: 2390, commissions: 239 },
  { name: 'Sun', revenue: 3490, commissions: 349 },
];

const categories = [
  { id: 'cat_1', name: 'Plumbing', icon: <Droplets />, color: 'text-blue-400' },
  { id: 'cat_2', name: 'Electricity', icon: <Zap />, color: 'text-yellow-400' },
  { id: 'cat_3', name: 'Painting', icon: <Paintbrush />, color: 'text-purple-400' },
  { id: 'cat_4', name: 'Cleaning', icon: <Sparkles />, color: 'text-emerald-400' },
  { id: 'cat_5', name: 'AC Repair', icon: <Wind />, color: 'text-amber-400' },
  { id: 'cat_6', name: 'Construction', icon: <HardHat />, color: 'text-orange-400' },
];

const CategoryIcon = ({ name, size = 20 }: { name: string, size?: number }) => {
  const n = name.toLowerCase();
  if (n.includes('plumb')) return <Droplets size={size} />;
  if (n.includes('electr')) return <Zap size={size} />;
  if (n.includes('paint')) return <Paintbrush size={size} />;
  if (n.includes('clean')) return <Sparkles size={size} />;
  if (n.includes('ac') || n.includes('air')) return <Wind size={size} />;
  if (n.includes('construct') || n.includes('carpenter')) return <Hammer size={size} />;
  if (n.includes('garden')) return <Sparkles size={size} />;
  return <Hammer size={size} />;
};

export default function App() {
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
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data));

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
      setIncomingCall(data);
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
    showLogin ? <AuthScreens onSuccess={() => setShowLogin(false)} /> : <LandingPage onGetStarted={() => setShowLogin(true)} onAction={(msg) => showToast(msg, 'info')} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
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
          <header className="h-20 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              {customerTab !== 'home' && (
                <button 
                  onClick={() => setCustomerTab('home')}
                  className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-lg flex items-center justify-center"
                  title="Back to Home"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/30 transform hover:rotate-12 transition-transform duration-300">

              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight uppercase italic flex items-center gap-1">
                  M3allem <span className="text-[var(--accent)]">En Click</span>
                </h1>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Crafting Excellence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-3 rounded-full glass hover:scale-110 transition-all active:scale-95 shadow-lg flex items-center justify-center"
              >
                {isDarkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-blue-500" size={20} />}
              </button>
              <NotificationBell userId={user.id} />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--text)]/10 border border-[var(--border)] overflow-hidden">
                  <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=FFD700&color=000`} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={logout}
                  className="p-2.5 rounded-xl bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-all active:scale-95"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          <CustomerView 
            activeTab={customerTab} 
            onAction={showToast} 
            onSelectArtisan={setSelectedArtisanId} 
            categories={realCategories}
            featuredArtisans={featuredArtisans}
            recommendedArtisans={recommendedArtisans}
            onNavigate={setCustomerTab}
            onTrackArtisan={setTrackingBooking}
          />
          
          {/* Customer Bottom Nav */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 bg-[var(--card-bg)]/40 backdrop-blur-2xl border border-[var(--border)] p-1.5 md:p-2 rounded-full flex gap-1 md:gap-2 shadow-2xl max-w-[90vw] overflow-x-auto no-scrollbar">
            <NavButton 
              active={customerTab === 'home'} 
              onClick={() => setCustomerTab('home')}
              icon={<HomeIcon size={18} className="md:w-5 md:h-5" />}
              label="Home"
            />
            <NavButton 
              active={customerTab === 'find'} 
              onClick={() => setCustomerTab('find')}
              icon={<SearchIcon size={18} className="md:w-5 md:h-5" />}
              label="Find"
            />
            <NavButton 
              active={customerTab === 'creative'} 
              onClick={() => setCustomerTab('creative')}
              icon={<Sparkles size={18} className="md:w-5 md:h-5" />}
              label="Creative"
            />
            <NavButton 
              active={customerTab === 'store'} 
              onClick={() => setCustomerTab('store')}
              icon={<ShoppingBag size={18} className="md:w-5 md:h-5" />}
              label="Store"
            />
            <NavButton 
              active={customerTab === 'bookings'} 
              onClick={() => setCustomerTab('bookings')}
              icon={<Clock size={18} className="md:w-5 md:h-5" />}
              label="Bookings"
            />
            <NavButton 
              active={customerTab === 'account'} 
              onClick={() => setCustomerTab('account')}
              icon={<Users size={18} className="md:w-5 md:h-5" />}
              label="Account"
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
              <p className="text-[var(--text-muted)] text-sm">from {incomingCall.fromName}</p>
            </div>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => {
                  setActiveCall({ 
                    artisanId: '', 
                    artisanName: incomingCall.fromName,
                    artisanUserId: incomingCall.from,
                    isArtisan: user.role === 'artisan',
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
            onClose={() => setBookingArtisan(null)}
            onAction={showToast}
            onSuccess={() => {
              setBookingArtisan(null);
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AiChatbot />
    </>
  );
}

function AICreativeStudio({ onAction }: { onAction: (msg: string) => void }) {
  const [activeTool, setActiveTool] = useState<'image' | 'video' | 'edit' | 'animate'>('image');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoOp, setVideoOp] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt && activeTool !== 'animate') return;
    setLoading(true);
    setResult(null);
    setVideoOp(null);
    try {
      if (activeTool === 'image') {
        const url = await aiService.generateImage(prompt, size);
        setResult(url);
      } else if (activeTool === 'edit') {
        if (!image) throw new Error("Please upload an image first");
        const url = await aiService.editImage(prompt, image);
        setResult(url);
      } else if (activeTool === 'video') {
        const op = await aiService.generateVeoVideo(prompt, aspectRatio);
        setVideoOp(op);
      } else if (activeTool === 'animate') {
        if (!image) throw new Error("Please upload an image first");
        const op = await aiService.animateImageToVideo(prompt, image, aspectRatio);
        setVideoOp(op);
      }
    } catch (err: any) {
      onAction("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (videoOp && !videoOp.done) {
      interval = setInterval(async () => {
        try {
          const updated = await aiService.getVideosOperation(videoOp);
          if (updated.done) {
            setVideoOp(updated);
            clearInterval(interval);
          }
        } catch (err) {
          clearInterval(interval);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [videoOp]);

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <div className="mb-12">
        <p className="micro-label mb-4">Creative Studio</p>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--text)]">AI <span className="gold-text italic-serif">Creative</span> Studio</h2>
        <p className="text-[var(--text-muted)] text-base md:text-xl">Visualize your home improvement projects with state-of-the-art AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card-luxury p-6 space-y-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Wand2 size={20} className="text-[var(--accent)]" />
              Select Tool
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setActiveTool('image')} className={`p-3 rounded-xl text-sm font-medium transition-all border ${activeTool === 'image' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--text)]/5'}`}>
                Image Gen
              </button>
              <button onClick={() => setActiveTool('edit')} className={`p-3 rounded-xl text-sm font-medium transition-all border ${activeTool === 'edit' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--text)]/5'}`}>
                Edit Image
              </button>
              <button onClick={() => setActiveTool('video')} className={`p-3 rounded-xl text-sm font-medium transition-all border ${activeTool === 'video' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--text)]/5'}`}>
                Video Gen
              </button>
              <button onClick={() => setActiveTool('animate')} className={`p-3 rounded-xl text-sm font-medium transition-all border ${activeTool === 'animate' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--text)]/5'}`}>
                Animate
              </button>
            </div>
          </div>

          <div className="card-luxury p-6 space-y-4">
            <h3 className="font-bold text-lg mb-4">Configuration</h3>
            
            {(activeTool === 'edit' || activeTool === 'animate') && (
              <div className="space-y-2">
                <label className="micro-label">Upload Reference Image</label>
                <div className="relative group cursor-pointer">
                  <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group-hover:border-[var(--accent)]/50 transition-all">
                    {image ? (
                      <img src={image} className="w-full h-32 object-cover rounded-xl" alt="" />
                    ) : (
                      <>
                        <Upload size={32} className="text-[var(--text-muted)]" />
                        <span className="text-xs text-[var(--text-muted)]">Click or drag to upload</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="micro-label">Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTool === 'image' ? "A modern Moroccan living room with zellige tiles..." : "Add a traditional lantern to the ceiling..."}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent)]/50 min-h-[100px]"
              />
            </div>

            {activeTool === 'image' && (
              <div className="space-y-2">
                <label className="micro-label">Image Size</label>
                <div className="flex gap-2">
                  {(['1K', '2K', '4K'] as const).map(s => (
                    <button key={s} onClick={() => setSize(s)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${size === s ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(activeTool === 'video' || activeTool === 'animate') && (
              <div className="space-y-2">
                <label className="micro-label">Aspect Ratio</label>
                <div className="flex gap-2">
                  {(['16:9', '9:16'] as const).map(r => (
                    <button key={r} onClick={() => setAspectRatio(r)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${aspectRatio === r ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
                      {r === '16:9' ? 'Landscape' : 'Portrait'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={loading || (!prompt && activeTool !== 'animate')}
              className="w-full bg-[var(--accent)] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? 'Processing...' : 'Generate Magic'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card-luxury p-8 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
            {loading ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[var(--text-muted)] animate-pulse">Our AI is crafting your masterpiece...</p>
              </div>
            ) : result ? (
              <div className="w-full h-full flex flex-col gap-4">
                <img src={result} className="w-full h-auto rounded-3xl shadow-2xl" alt="AI Generated" />
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = result;
                    link.download = 'm3allem-ai-creation.png';
                    link.click();
                  }}
                  className="flex items-center gap-2 text-[var(--accent)] font-bold self-end"
                >
                  <Download size={18} /> Download
                </button>
              </div>
            ) : videoOp ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                {!videoOp.done ? (
                  <div className="text-center space-y-4">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-[var(--accent)]/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="font-bold text-xl">Generating Video...</p>
                    <p className="text-[var(--text-muted)] max-w-xs mx-auto">Veo is processing your request. This usually takes 1-2 minutes.</p>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    <video 
                      src={videoOp.response?.generatedVideos?.[0]?.video?.uri + `?x-goog-api-key=${aiService.getApiKey()}`} 
                      controls 
                      className="w-full rounded-3xl shadow-2xl"
                    />
                    <p className="text-sm text-[var(--text-muted)] text-center italic">Video generated successfully with Veo 3.1</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-6 max-w-md">
                <div className="w-24 h-24 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles size={48} className="text-[var(--accent)]" />
                </div>
                <h4 className="text-2xl font-bold">Your creation will appear here</h4>
                <p className="text-[var(--text-muted)]">Use the tools on the left to start visualizing your dream home projects.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerView({ activeTab, onAction, onSelectArtisan, categories, featuredArtisans, recommendedArtisans, onNavigate, onTrackArtisan }: { 
  activeTab: 'home' | 'find' | 'store' | 'bookings' | 'account' | 'creative', 
  onAction: (msg: string) => void, 
  onSelectArtisan: (id: string) => void,
  categories: Category[],
  featuredArtisans: Artisan[],
  recommendedArtisans: Artisan[],
  onNavigate: (tab: 'home' | 'find' | 'store' | 'bookings' | 'account' | 'creative') => void,
  onTrackArtisan: (booking: any) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg)] pb-40">
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

function HomeSection({ onAction, onSelectArtisan, categories, featuredArtisans, recommendedArtisans }: { 
  onAction: (msg: string) => void, 
  onSelectArtisan: (id: string) => void,
  categories: Category[],
  featuredArtisans: Artisan[],
  recommendedArtisans: Artisan[]
}) {
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [matching, setMatching] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<{ categoryId: string, categoryName: string, suggestedServiceName: string } | null>(null);
  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [deepThinkResult, setDeepThinkResult] = useState('');

  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (val.length > 2) {
      const suggestions = await aiService.getSuggestions(val);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSmartMatch = async () => {
    setMatching(true);
    try {
      // Mock location for demo, or use navigator.geolocation
      const lat = 33.5731;
      const lng = -7.5898;
      const bestArtisans = await aiService.getSmartMatch(lat, lng);
      if (bestArtisans.length > 0) {
        onSelectArtisan(bestArtisans[0].id);
        onAction(`Smart Match found: ${bestArtisans[0].name} is the best professional for you!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatching(false);
    }
  };

  const handleSuggestService = async () => {
    if (!problemDescription) return;
    setSuggesting(true);
    setDeepThinkResult('');
    setAiSuggestion(null);
    try {
      if (isDeepThinking) {
        const res = await aiService.deepThink(problemDescription);
        setDeepThinkResult(res);
      } else {
        const res = await aiService.suggestServiceFromProblem(problemDescription);
        setAiSuggestion(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:h-[70vh] flex items-center px-6 md:px-12 overflow-hidden py-20 md:py-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/80 to-transparent z-10" />
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-40"
            poster="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1920"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-carpenter-working-with-a-drill-4667-large.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="relative z-20 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-6"
          >
            <ShieldCheck size={14} />
            Verified Professionals Only
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-[var(--text)] leading-[0.9]"
          >
            THE ART OF <br />
            <span className="text-[var(--accent)]">HOME CARE.</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group max-w-lg"
          >
            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="What do you need help with?" 
              className="w-full bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-3xl py-4 md:py-6 pl-14 md:pl-16 pr-8 text-lg md:text-xl focus:outline-none focus:border-[var(--accent)]/50 transition-all shadow-2xl text-[var(--text)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onAction('Searching for: ' + searchQuery);
                }
              }}
            />
            {searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl z-50">
                {searchSuggestions?.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => { 
                      setSearchQuery(s); 
                      setSearchSuggestions([]); 
                      onAction('Selected suggestion: ' + s); 
                    }}
                    className="w-full text-left px-6 py-3 hover:bg-[var(--accent)]/5 transition-colors text-sm border-b border-[var(--border)] last:border-0 text-[var(--text)] flex items-center gap-2"
                  >
                    <Search size={14} className="text-[var(--accent)]" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <button 
              onClick={handleSmartMatch}
              disabled={matching}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-[var(--accent)]/20 active:scale-95 disabled:opacity-50"
            >
              <Zap size={18} className={matching ? "animate-pulse" : ""} />
              {matching ? "Finding Best Match..." : "Smart Match Nearby"}
            </button>
            <button 
              onClick={() => onAction('Opening AI Problem Solver...')}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--card-bg)] text-[var(--text)] border border-[var(--border)] rounded-full font-bold text-sm hover:bg-[var(--accent)]/5 transition-all active:scale-95"
            >
              <BrainCircuit size={18} />
              AI Problem Solver
            </button>
          </motion.div>
        </div>
      </section>

      {/* AI Problem Solver Modal/Section (Inline for now) */}
      <section className="px-6 md:px-12 py-10 bg-[var(--accent)]/5 border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto bg-[var(--card-bg)] border border-[var(--accent)]/30 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <BrainCircuit size={120} className="text-[var(--accent)]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-[var(--accent)] font-bold text-xs uppercase tracking-widest mb-6">
              <Sparkles size={20} />
              AI POWERED ASSISTANT
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-[var(--text)]">Don't know what you need?</h2>
            <p className="text-[var(--text-muted)] mb-8 max-w-xl text-lg">Describe your problem in plain words, and our AI will find the right expert and estimate the cost for you.</p>
            
            <div className="space-y-4">
              <textarea 
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Example: My kitchen sink is leaking and there's water everywhere..."
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-3xl py-6 px-8 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-lg h-32 resize-none text-[var(--text)]"
              />
              <div className="flex justify-end items-center gap-4">
                <button 
                  onClick={() => setIsDeepThinking(!isDeepThinking)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${isDeepThinking ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg)]/10 text-[var(--text-muted)] hover:bg-[var(--bg)]/20'}`}
                >
                  <BrainCircuit size={14} /> {isDeepThinking ? 'Deep Thinking ON' : 'Deep Thinking OFF'}
                </button>
                <button 
                  onClick={handleSuggestService}
                  disabled={suggesting || !problemDescription}
                  className="px-8 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {suggesting ? (isDeepThinking ? "Deep Reasoning..." : "Analyzing...") : "Analyze Problem"}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {deepThinkResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-8 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-3xl text-left"
              >
                <div className="flex items-center gap-3 mb-4 text-[var(--accent)]">
                  <BrainCircuit size={20} />
                  <span className="font-bold uppercase tracking-widest text-xs">AI Deep Reasoning Analysis</span>
                </div>
                <div className="prose prose-invert max-w-none text-sm leading-relaxed text-[var(--text-muted)]">
                  {deepThinkResult.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              </motion.div>
            )}

            {aiSuggestion && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-8 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-3xl"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest mb-2">AI Recommendation</p>
                    <h3 className="text-2xl font-bold text-[var(--text)]">You need a <span className="text-[var(--accent)]">{aiSuggestion.categoryName}</span></h3>
                    <p className="text-[var(--text-muted)] mt-1">Suggested Service: <span className="font-bold text-[var(--text)]">{aiSuggestion.suggestedServiceName}</span></p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => onAction(`Finding ${aiSuggestion.categoryName} experts...`)}
                      className="px-6 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl font-bold text-sm active:scale-95"
                    >
                      Find Experts
                    </button>
                    <button 
                      onClick={() => setAiSuggestion(null)}
                      className="px-6 py-3 bg-[var(--card-bg)]/50 text-[var(--text)] rounded-xl font-bold text-sm hover:bg-[var(--card-bg)]/80 transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Recommended for You (AI) */}
      {recommendedArtisans.length > 0 && (
        <section className="px-6 md:px-12 py-20 md:py-32 bg-[var(--accent)]/5 border-b border-[var(--accent)]/10">
          <div className="mb-12">
            <p className="micro-label mb-4">Personalized Selection</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-[var(--text)]">Recommended for <span className="gold-text italic-serif">You</span></h2>
            <p className="text-[var(--text-muted)] mt-3 text-base md:text-xl">AI-powered suggestions based on your preferences.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {recommendedArtisans?.map(artisan => (
              <ArtisanCard 
                key={artisan.id}
                name={artisan.name} 
                category={artisan.category_name} 
                rating={artisan.rating} 
                reviews={artisan.review_count} 
                price={`From ${artisan.starting_price || 100} MAD`}
                image={artisan.avatar_url}
                isOnline={!!artisan.is_online}
                onAction={(type: string) => type === 'view' ? onSelectArtisan(artisan.id) : onAction(`${type === 'book' ? 'Booking' : 'Starting chat with'} ${artisan.name}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="px-6 md:px-12 py-20 md:py-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 md:mb-16 gap-6">
          <div>
            <p className="micro-label mb-4">Specialized Expertise</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-[var(--text)]">Expert <span className="gold-text italic-serif">Categories</span></h2>
            <p className="text-[var(--text-muted)] mt-3 text-base md:text-lg">Select a service to see available professionals near you.</p>
          </div>
            <button 
              onClick={() => {
                onAction('Opening filters...');
              }}
              className="w-fit flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors bg-[var(--card-bg)] px-6 py-3 rounded-full border border-[var(--border)] active:scale-95"
            >
              <Filter size={20} />
              <span className="font-bold">Filter All</span>
            </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-8">
          {categories?.map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -10, backgroundColor: 'var(--accent-muted)', borderColor: 'var(--accent)' }}
              onClick={() => onAction('Selected category: ' + cat.name)}
              className="card-luxury p-6 md:p-10 flex flex-col items-center justify-center gap-4 md:gap-6 cursor-pointer transition-all group active:scale-95"
            >
              <div className={`p-4 md:p-6 rounded-[24px] md:rounded-[32px] bg-[var(--bg)] group-hover:bg-[var(--accent)]/10 transition-colors text-[var(--accent)]`}>
                <CategoryIcon name={cat.name} size={32} />
              </div>
              <span className="font-bold text-base md:text-lg tracking-tight text-[var(--text)]">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Artisans */}
      <section className="px-6 md:px-12 py-20 md:py-32 bg-[var(--card-bg)]/50 border-y border-[var(--border)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 md:mb-16 gap-6">
          <div>
            <p className="micro-label mb-4">Elite Professionals</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-[var(--text)]">Top Rated <span className="gold-text italic-serif">Nearby</span></h2>
            <p className="text-[var(--text-muted)] mt-3 text-base md:text-lg">Highly recommended professionals in your area.</p>
          </div>
          <button 
            onClick={() => onAction('Viewing all professionals...')}
            className="text-[var(--accent)] font-bold text-base md:text-lg hover:underline flex items-center gap-2 active:scale-95 w-fit"
          >
            View All <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {featuredArtisans?.map(artisan => (
            <ArtisanCard 
              key={artisan.id}
              name={artisan.name} 
              category={artisan.category_name} 
              rating={artisan.rating} 
              reviews={artisan.review_count} 
              price={`From ${artisan.starting_price || 150} MAD`}
              image={artisan.avatar_url}
              isOnline={!!artisan.is_online}
              onAction={(type: string) => type === 'view' ? onSelectArtisan(artisan.id) : onAction(`${type === 'book' ? 'Booking' : 'Starting chat with'} ${artisan.name}`)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function FindSection({ onAction, onSelectArtisan, categories }: { 
  onAction: (msg: string) => void, 
  onSelectArtisan: (id: string) => void,
  categories: Category[]
}) {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minRating: 0,
    minPrice: '',
    maxPrice: '',
    isOnline: false,
    availability: '',
    city: '',
    distance: 50,
    experience: 0,
    verified: false,
    sortBy: 'popularity'
  });

  const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Fes'];

  useEffect(() => {
    setLoading(true);
    marketplaceService.getArtisans(filters).then(data => {
      setArtisans(data);
      setLoading(false);
    });
  }, [filters]);

  const handleFilterChange = (key: string, val: any) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="p-6 md:p-12">
      <div className="mb-8 md:mb-12">
        <p className="micro-label mb-4">Discovery</p>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--text)]">Find a <span className="gold-text italic-serif">Pro</span></h2>
        <p className="text-[var(--text-muted)] text-base md:text-xl">Browse our network of certified professionals.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6 md:space-y-8">
          <div className="card-luxury p-8">
            <h3 className="font-bold mb-8 flex items-center gap-3 text-[var(--text)] text-lg tracking-tight">
              <Filter size={20} className="text-[var(--accent)]" />
              Filters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
              <div>
                <label className="micro-label mb-4 block">Category</label>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                    onAction('Filtering by all services');
                    handleFilterChange('category', '');
                  }}>
                    <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${filters.category === '' ? 'bg-[var(--accent)] border-[var(--accent)] scale-110 shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                    <span className={`text-sm transition-colors ${filters.category === '' ? 'text-[var(--text)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>All Services</span>
                  </label>
                  {categories?.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                      onAction(`Filtering by ${cat.name}`);
                      handleFilterChange('category', cat.id);
                    }}>
                      <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${filters.category === cat.id ? 'bg-[var(--accent)] border-[var(--accent)] scale-110 shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                      <span className={`text-sm transition-colors ${filters.category === cat.id ? 'text-[var(--text)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="micro-label mb-4 block">City</label>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                    onAction('Filtering by all cities');
                    handleFilterChange('city', '');
                  }}>
                    <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${filters.city === '' ? 'bg-[var(--accent)] border-[var(--accent)] scale-110 shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                    <span className={`text-sm transition-colors ${filters.city === '' ? 'text-[var(--text)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>All Cities</span>
                  </label>
                  {cities?.map(city => (
                    <label key={city} className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                      onAction(`Filtering by ${city}`);
                      handleFilterChange('city', city);
                    }}>
                      <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${filters.city === city ? 'bg-[var(--accent)] border-[var(--accent)] scale-110 shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                      <span className={`text-sm transition-colors ${filters.city === city ? 'text-[var(--text)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>{city}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="micro-label mb-4 block flex justify-between">
                  <span>Distance</span>
                  <span className="text-[var(--accent)] font-bold">{filters.distance} km</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={filters.distance}
                  onChange={(e) => handleFilterChange('distance', Number(e.target.value))}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>

              <div>
                <label className="micro-label mb-4 block">Minimum Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5]?.map(star => (
                    <button 
                      key={star}
                      onClick={() => {
                        onAction(`Filtering by minimum ${star} stars`);
                        handleFilterChange('minRating', star);
                      }}
                      className={`flex-1 py-2 rounded-xl border transition-all ${filters.minRating === star ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50'}`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Starting Price (MAD)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[var(--accent)]/50 text-[var(--text)]"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[var(--accent)]/50 text-[var(--text)]"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Years of Experience</label>
                <div className="space-y-2">
                  {[1, 3, 5, 10]?.map(years => (
                    <label key={years} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('experience', years)}>
                      <div className={`w-5 h-5 rounded border transition-colors ${filters.experience === years ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                      <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{years}+ Years</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Availability & Trust</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('availability', filters.availability === 'today' ? '' : 'today')}>
                    <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${filters.availability === 'today' ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`}>
                      {filters.availability === 'today' && <div className="w-2 h-2 bg-[var(--accent-foreground)] rounded-full" />}
                    </div>
                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">Available Today</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('availability', filters.availability === 'week' ? '' : 'week')}>
                    <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${filters.availability === 'week' ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`}>
                      {filters.availability === 'week' && <div className="w-2 h-2 bg-[var(--accent-foreground)] rounded-full" />}
                    </div>
                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">Available This Week</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('isOnline', !filters.isOnline)}>
                    <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${filters.isOnline ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`}>
                      {filters.isOnline && <div className="w-2 h-2 bg-[var(--accent-foreground)] rounded-full" />}
                    </div>
                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">Online Now</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('verified', !filters.verified)}>
                    <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${filters.verified ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`}>
                      {filters.verified && <div className="w-2 h-2 bg-[var(--accent-foreground)] rounded-full" />}
                    </div>
                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors flex items-center gap-1">
                      Verified Artisan <ShieldCheck size={14} className="text-[var(--accent)]" />
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 space-y-6 md:space-y-8">
          <div className="relative">
            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, skill or location..." 
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl py-4 md:py-5 pl-14 md:pl-16 pr-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 opacity-50">
              {[1, 2, 3, 4]?.map(i => <div key={i} className="h-48 bg-[var(--card-bg)] rounded-3xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {artisans?.map(artisan => (
                <ArtisanCard 
                  key={artisan.id}
                  name={artisan.name} 
                  category={artisan.category_name} 
                  rating={artisan.rating} 
                  reviews={artisan.review_count} 
                  price={`From ${artisan.starting_price || 150} MAD`}
                  image={artisan.avatar_url}
                  isVerified={artisan.is_verified}
                  isOnline={!!artisan.is_online}
                  onAction={(type: string) => type === 'view' ? onSelectArtisan(artisan.id) : onAction(`${type === 'book' ? 'Booking' : 'Starting chat with'} ${artisan.name}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ booking, onClose, onSuccess }: { booking: any, onClose: () => void, onSuccess: () => void }) {
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await bookingService.submitReview(booking.id, stars, review);
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-[var(--bg)]/80 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold tracking-tight">Rate your experience</h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg)] rounded-full transition-colors">
            <X size={24} className="text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="text-center mb-8">
          <img src={booking.other_party_avatar} className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover" alt="" />
          <h4 className="font-bold text-lg">{booking.other_party_name}</h4>
          <p className="text-[var(--text-muted)] text-sm">{booking.service_name}</p>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3, 4, 5]?.map(i => (
            <button 
              key={i} 
              onClick={() => setStars(i)}
              className={`p-2 transition-all hover:scale-125 ${i <= stars ? 'text-yellow-500 scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]' : 'text-[var(--text-muted)] opacity-30'}`}
            >
              <Star size={36} fill={i <= stars ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>

        <textarea 
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write a review... (optional)"
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 h-32 resize-none mb-8 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
        />

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </motion.div>
    </motion.div>
  );
}

function PaymentModal({ booking, onClose, onSuccess, onAction }: { booking: any, onClose: () => void, onSuccess: () => void, onAction: (msg: string) => void }) {
  const [method, setMethod] = useState('wallet');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await walletService.payOrder(booking.id, method);
      if (res.error) {
        onAction(res.error);
      } else {
        onAction(`Payment of ${booking.price} MAD successful (Escrow)`);
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      onAction('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 shadow-2xl"
      >
        <h3 className="text-2xl font-bold mb-2">Secure Payment</h3>
        <p className="text-[var(--text-muted)] text-sm mb-8">Funds will be held in escrow until service completion.</p>
        
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-3xl p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[var(--text-muted)]">Service</span>
            <span className="font-bold">{booking.service_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-muted)]">Amount</span>
            <span className="text-xl font-bold text-[var(--accent)]">{booking.price} MAD</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'wallet', label: 'Wallet', icon: Wallet },
                { id: 'card', label: 'Credit Card', icon: CreditCard },
                { id: 'paypal', label: 'PayPal', icon: Smartphone },
                { id: 'stripe', label: 'Stripe', icon: ShieldCheck },
              ]?.map(m => (
                <button 
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-5 rounded-3xl border flex flex-col items-center gap-3 transition-all transform active:scale-95 ${method === m.id ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)] shadow-lg shadow-[var(--accent)]/30' : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50 hover:bg-[var(--card-bg)]'}`}
                >
                  <m.icon size={24} className={method === m.id ? 'text-[var(--accent-foreground)]' : 'text-[var(--accent)]'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay ${booking.price} MAD`}
          </button>
          
          <p className="text-[10px] text-center text-[var(--text-muted)] uppercase tracking-widest font-bold flex items-center justify-center gap-2">
            <ShieldCheck size={12} />
            Encrypted & Secure Transaction
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function BookingsSection({ onAction, onNavigate, onTrackArtisan }: { 
  onAction: (msg: string) => void, 
  onNavigate: (tab: 'home' | 'find' | 'store' | 'bookings' | 'account') => void,
  onTrackArtisan: (booking: any) => void
}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        console.error("Invalid bookings data:", data);
      }
      
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch('/api/bookings/proposals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const propData = await res.json();
        setProposals(propData);
      }
    } catch (err) {
      console.error("Failed to fetch bookings/proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAcceptProposal = async (proposal: any) => {
    try {
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch(`/api/bookings/${proposal.order_id}/accept-proposal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ proposalId: proposal.id })
      });
      if (res.ok) {
        onAction('Proposal accepted! You can now proceed to payment.');
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'proposal_submitted': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'proposal_approved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'en_route': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'ongoing':
      case 'in_progress': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border)]';
    }
  };

  const downloadInvoice = (booking: Booking) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('M3ALLEM INVOICE', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${booking.id}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
    
    // Details
    doc.setFontSize(14);
    doc.text('Service Details', 20, 50);
    doc.setFontSize(10);
    doc.text(`Service: ${booking.service_name}`, 20, 60);
    doc.text(`Artisan: ${booking.other_party_name}`, 20, 65);
    doc.text(`Scheduled At: ${new Date(booking.scheduled_at).toLocaleString()}`, 20, 70);
    
    // Pricing
    doc.setFontSize(14);
    doc.text('Pricing', 20, 85);
    doc.setFontSize(10);
    doc.text(`Base Price: ${booking.price} MAD`, 20, 95);
    doc.text(`Platform Fee: ${Math.round(booking.price * 0.05)} MAD`, 20, 100);
    
    doc.setFontSize(16);
    doc.text(`Total Paid: ${Math.round(booking.price * 1.05)} MAD`, 20, 115);
    
    // Footer
    doc.setFontSize(8);
    doc.text('Thank you for using M3allem En Click - The #1 Artisan Marketplace in Morocco', 20, 280);
    
    doc.save(`invoice-${booking.id}.pdf`);
    onAction('Invoice downloaded successfully');
  };

  return (
    <div className="p-6 md:p-12">
      <div className="mb-12">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Your <span className="text-[var(--accent)]">Bookings</span></h2>
        <p className="text-[var(--text-muted)] text-base md:text-xl">Track and manage your service requests.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3]?.map(i => <div key={i} className="h-32 bg-[var(--card-bg)] rounded-3xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-12 text-center">
          <Clock size={48} className="mx-auto mb-6 text-[var(--text-muted)] opacity-50" />
          <h3 className="text-2xl font-bold mb-2">No bookings yet</h3>
          <p className="text-[var(--text-muted)] mb-8">You haven't requested any services yet.</p>
            <button 
              onClick={() => {
                onAction('Finding a Pro...');
                onNavigate('find');
              }}
              className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Search size={18} />
              Find a Pro
            </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings?.map(booking => (
            <div key={booking.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
              <img src={booking.other_party_avatar} className="w-20 h-20 rounded-2xl object-cover" alt="" referrerPolicy="no-referrer" />
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <h4 className="text-xl font-bold">{booking.service_name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                      {booking.status === 'ongoing' || booking.status === 'in_progress' ? 'Artisan at Location' : 
                       booking.status === 'en_route' ? 'Artisan En Route' : 
                       booking.status.replace('_', ' ')}
                    </span>
                    {booking.status === 'ongoing' && booking.started_at && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Service Time: {formatDuration(booking.started_at, currentTime)}
                      </div>
                    )}
                    {booking.status === 'completed' && booking.started_at && booking.finished_at && (
                      <div className="px-3 py-1 bg-[var(--card-bg)] text-[var(--text-muted)] rounded-full text-[10px] font-bold border border-[var(--border)]">
                        Total Service Time: {formatDuration(booking.started_at, booking.finished_at)}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[var(--text-muted)] text-sm mb-1">With {booking.other_party_name}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-[var(--text-muted)] opacity-70">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(booking.scheduled_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-2xl font-bold text-[var(--accent)] mb-4">{booking.price} MAD</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                  {booking.status === 'pending' && proposals.filter(p => p.order_id === booking.id).length > 0 && (
                    <div className="w-full mt-4 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-2xl p-4">
                      <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Sparkles size={14} /> {proposals.filter(p => p.order_id === booking.id).length} Proposals Received
                      </p>
                      <div className="space-y-3">
                        {proposals?.filter(p => p.order_id === booking.id)?.map(prop => (
                          <div key={prop.id} className="flex items-center justify-between bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border)]">
                            <div className="flex items-center gap-3">
                              <img src={prop.artisan_avatar} className="w-8 h-8 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                              <div>
                                <p className="text-sm font-bold">{prop.artisan_name}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">{prop.price} MAD</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                onAction(`Accepting proposal from ${prop.artisan_name} for ${prop.price} MAD`);
                                handleAcceptProposal(prop);
                              }}
                              className="px-3 py-1 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-lg text-[10px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-1"
                            >
                              <CheckCircle size={10} />
                              Accept Bid
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {booking.status === 'en_route' && (
                    <button 
                      onClick={() => onTrackArtisan(booking)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <MapPin size={14} />
                      Track Artisan
                    </button>
                  )}
                  {booking.status === 'pending' && !booking.payment_status && (
                    <button 
                      onClick={() => {
                        onAction(`Initiating payment for ${booking.service_name}`);
                        setSelectedBookingForPayment(booking);
                      }}
                      className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl text-xs font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-1"
                    >
                      <CreditCard size={14} />
                      Pay Now
                    </button>
                  )}
                  {booking.status === 'pending' && (
                    <button 
                      onClick={() => onAction(`Cancelling booking ${booking.id}...`)}
                      className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center gap-1"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  )}
                  {booking.status === 'completed' && !booking.has_review && (
                    <>
                      <button 
                        onClick={() => {
                          onAction(`Downloading invoice for ${booking.id}`);
                          downloadInvoice(booking);
                        }}
                        className="px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-xl text-xs font-bold hover:bg-[var(--accent)]/20 transition-colors flex items-center gap-1"
                      >
                        <FileText size={14} />
                        Invoice PDF
                      </button>
                      <button 
                        onClick={() => {
                          onAction(`Opening review for ${booking.other_party_name}`);
                          setSelectedBookingForReview(booking);
                        }}
                        className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                      >
                        <Star size={14} />
                        Rate & Review
                      </button>
                    </>
                  )}
                  {booking.status === 'completed' && booking.has_review && (
                    <button 
                      onClick={() => {
                        onAction(`Downloading invoice for ${booking.id}`);
                        downloadInvoice(booking);
                      }}
                      className="px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-xl text-xs font-bold hover:bg-[var(--accent)]/20 transition-colors flex items-center gap-1"
                    >
                      <FileText size={14} />
                      Invoice PDF
                    </button>
                  )}
                  <button 
                    onClick={() => onAction(`Viewing details for booking ${booking.id}`)}
                    className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-bold hover:bg-[var(--card-bg)] transition-colors flex items-center gap-1"
                  >
                    <Info size={14} />
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedBookingForReview && (
          <ReviewModal 
            booking={selectedBookingForReview}
            onClose={() => setSelectedBookingForReview(null)}
            onSuccess={() => {
              setSelectedBookingForReview(null);
              onAction('Review submitted successfully');
              fetchBookings();
            }}
          />
        )}
        {selectedBookingForPayment && (
          <PaymentModal 
            booking={selectedBookingForPayment}
            onClose={() => setSelectedBookingForPayment(null)}
            onAction={onAction}
            onSuccess={() => {
              setSelectedBookingForPayment(null);
              fetchBookings();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WalletSection({ onAction }: { onAction: (msg: string) => void }) {
  const [walletData, setWalletData] = useState<{ balance: number, transactions: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const data = await walletService.getBalance();
      setWalletData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTopup = async () => {
    if (!amount || isNaN(Number(amount))) return;
    try {
      await walletService.topup(Number(amount), method);
      onAction(`Successfully topped up ${amount} MAD`);
      setShowTopup(false);
      setAmount('');
      fetchWallet();
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount))) return;
    try {
      await walletService.withdraw(Number(amount), method);
      onAction(`Withdrawal request for ${amount} MAD submitted`);
      setShowWithdraw(false);
      setAmount('');
      fetchWallet();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 animate-pulse space-y-8"><div className="h-48 bg-[var(--card-bg)] rounded-[40px]" /><div className="h-96 bg-[var(--card-bg)] rounded-[40px]" /></div>;

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">M3allem En Click <span className="text-[var(--accent)]">Wallet</span></h2>
        <p className="text-[var(--text-muted)] text-base md:text-xl">Manage your funds, top-up, and withdraw earnings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-[var(--accent)]/10" />
          <div className="relative z-10">
            <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs mb-4">Current Balance</p>
            <h3 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8">{walletData?.balance.toLocaleString()} <span className="text-2xl md:text-4xl text-[var(--accent)]">MAD</span></h3>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => {
                  onAction('Opening Top-up modal...');
                  setShowTopup(true);
                }}
                className="flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95"
              >
                <Plus size={20} />
                Top-up
              </button>
              <button 
                onClick={() => {
                  onAction('Opening Withdrawal modal...');
                  setShowWithdraw(true);
                }}
                className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] px-8 py-4 rounded-2xl font-bold hover:bg-[var(--card-bg)] transition-all active:scale-95"
              >
                <ArrowRight size={20} className="rotate-[-45deg]" />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-[48px] p-10 flex flex-col justify-center text-center">
          <ShieldCheck size={48} className="mx-auto mb-6 text-[var(--accent)]" />
          <h4 className="text-xl font-bold mb-2">Secure Escrow</h4>
          <p className="text-sm text-[var(--text-muted)]">Your payments are held securely until the service is completed and verified.</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-10">
        <h4 className="text-2xl font-bold mb-8">Transaction History</h4>
        <div className="space-y-6">
          {walletData?.transactions?.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">No transactions yet.</div>
          ) : (
            walletData?.transactions?.map((tx: any) => (
              <div 
                key={tx.id} 
                onClick={() => onAction(`Viewing transaction details: ${tx.description}`)}
                className="flex items-center justify-between p-4 hover:bg-[var(--bg)] rounded-3xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.type === 'topup' && <Plus size={20} />}
                    {tx.type === 'payment' && <ShoppingCart size={20} />}
                    {tx.type === 'release' && <TrendingUp size={20} />}
                    {tx.type === 'withdrawal' && <ArrowRight size={20} className="rotate-[-45deg]" />}
                    {tx.type === 'commission' && <AlertCircle size={20} />}
                  </div>
                  <div>
                    <p className="font-bold">{tx.description}</p>
                    <p className="text-xs text-[var(--text-muted)]">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} MAD
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{tx.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top-up Modal */}
      <AnimatePresence>
        {showTopup && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTopup(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-8">Top-up Wallet</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Amount (MAD)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 text-2xl font-bold focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['card', 'paypal', 'stripe', 'cmi']?.map(m => (
                      <button 
                        key={m}
                        onClick={() => setMethod(m)}
                        className={`p-4 rounded-2xl border font-bold uppercase text-xs tracking-widest transition-all ${method === m ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    onAction(`Confirming top-up of ${amount} MAD via ${method}`);
                    handleTopup();
                  }}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Confirm Top-up
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowWithdraw(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-8">Withdraw Earnings</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Amount (MAD)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 text-2xl font-bold focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-2">Available: {walletData?.balance} MAD</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Withdrawal Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['bank_transfer', 'paypal']?.map(m => (
                      <button 
                        key={m}
                        onClick={() => setMethod(m)}
                        className={`p-4 rounded-2xl border font-bold uppercase text-xs tracking-widest transition-all ${method === m ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50'}`}
                      >
                        {m.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    onAction(`Requesting withdrawal of ${amount} MAD via ${method}`);
                    handleWithdraw();
                  }}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowRight size={20} className="rotate-[-45deg]" />
                  Request Withdrawal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccountSection({ onAction }: { onAction: (msg: string) => void }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('m3allem_user') || '{}'));
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [showWallet, setShowWallet] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: base64, type: 'image' })
          });
          if (res.ok) {
            const data = await res.json();
            setAvatarUrl(data.url);
          }
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}`
        },
        body: JSON.stringify({ name, avatarUrl })
      });
      if (res.ok) {
        const updatedUser = { ...user, name, phone, address, avatar_url: avatarUrl };
        localStorage.setItem('m3allem_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        onAction('Profile updated successfully');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (showWallet) {
    return (
      <div className="relative">
        <button 
          onClick={() => {
            onAction('Returning to profile...');
            setShowWallet(false);
          }}
          className="absolute top-6 left-6 md:top-12 md:left-12 z-20 flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-bold"
        >
          <ArrowLeft size={20} />
          Back to Profile
        </button>
        <WalletSection onAction={onAction} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12">
      <div className="mb-12">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">My <span className="text-[var(--accent)]">Account</span></h2>
        <p className="text-[var(--text-muted)] text-base md:text-xl">Manage your profile and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 text-center">
            <div className="w-32 h-32 mx-auto mb-6 relative group">
              <img src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} className="w-full h-full rounded-[40px] object-cover border-4 border-[var(--bg)] shadow-xl" alt="" referrerPolicy="no-referrer" />
              <label 
                onClick={() => onAction('Opening camera/file upload...')}
                className="absolute bottom-0 right-0 p-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl shadow-lg hover:scale-110 transition-all active:scale-95 cursor-pointer border-4 border-[var(--bg)]"
              >
                <Camera size={18} />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <h3 className="text-2xl font-bold mb-1">{user.name}</h3>
            <p className="text-[var(--text-muted)] text-sm mb-6">{user.phone}</p>
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-xs font-bold uppercase tracking-widest border border-[var(--accent)]/20">
              <ShieldCheck size={14} />
              Verified {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-6 space-y-2">
            <button onClick={() => {
              onAction('Opening wallet...');
              setShowWallet(true);
            }} className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg)] rounded-2xl transition-colors group">
              <div className="flex items-center gap-3">
                <Wallet size={20} className="text-[var(--accent)]" />
                <span className="font-bold">M3allem En Click Wallet</span>
              </div>
              <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
            </button>
            <button onClick={() => onAction('Favorites feature coming soon')} className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg)] rounded-2xl transition-colors group">
              <div className="flex items-center gap-3">
                <Heart size={20} className="text-[var(--accent)]" />
                <span className="font-bold">My Favorites</span>
              </div>
              <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 md:p-10">
            <h3 className="text-2xl font-bold mb-8">Profile Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Phone Number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Default Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all h-32 resize-none text-[var(--text)]" placeholder="Enter your home address..."></textarea>
              </div>
            </div>
            <button onClick={() => {
              onAction('Saving profile changes...');
              handleSave();
            }} className="mt-8 bg-[var(--accent)] text-[var(--accent-foreground)] px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2">
              <Save size={20} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoreSection({ onAction }: { onAction: (msg: string) => void }) {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    seller: ''
  });

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(filters as any).toString();
        const response = await fetch(`/api/marketplace/products?${queryParams}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const categories = ['Tools', 'Electrical', 'Painting', 'Cleaning', 'Safety', 'Plumbing', 'Wood', 'Cement', 'Tiles'];
  const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Fes'];

  const handleFilterChange = (key: string, val: any) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="p-6 md:p-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">M3allem En Click <span className="text-[var(--accent)]">Store</span></h2>
          <p className="text-[var(--text-muted)] text-base md:text-xl">Premium tools and construction materials.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onAction('Opening shopping bag...')}
            className="p-3 md:p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--text)] transition-colors active:scale-95 relative"
            title="View Shopping Bag"
          >
            <ShoppingBag size={20} className="md:w-6 md:h-6" />
            <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">0</span>
          </button>
          <button 
            onClick={() => onAction('Redirecting to order tracking...')}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 text-sm md:text-base shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2"
          >
            <Truck size={20} />
            Track Order
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6 md:space-y-8">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Filter size={18} className="text-[var(--accent)]" />
              Filters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Category</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('category', '')}>
                    <div className={`w-5 h-5 rounded border transition-colors ${filters.category === '' ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">All Categories</span>
                  </label>
                  {categories?.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('category', cat)}>
                      <div className={`w-5 h-5 rounded border transition-colors ${filters.category === cat ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                      <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">City</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('city', '')}>
                    <div className={`w-5 h-5 rounded border transition-colors ${filters.city === '' ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                    <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">All Cities</span>
                  </label>
                  {cities?.map(city => (
                    <label key={city} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleFilterChange('city', city)}>
                      <div className={`w-5 h-5 rounded border transition-colors ${filters.city === city ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'}`} />
                      <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{city}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Price Range (MAD)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[var(--accent)]/50 text-[var(--text)]"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[var(--accent)]/50 text-[var(--text)]"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Seller</label>
                <input 
                  type="text" 
                  placeholder="Search seller..." 
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[var(--accent)]/50 text-[var(--text)]"
                  value={filters.seller}
                  onChange={(e) => handleFilterChange('seller', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 space-y-6 md:space-y-8">
          <div className="relative">
            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" size={20} />
            <input 
              type="text" 
              placeholder="Search products, materials, tools..." 
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl py-4 md:py-5 pl-14 md:pl-16 pr-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-96 bg-[var(--card-bg)] rounded-[32px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {products?.map((product) => (
                <motion.div 
                  key={product.id}
                  whileHover={{ y: -5 }}
                  className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] overflow-hidden group hover:border-[var(--accent)]/30 transition-all flex flex-col shadow-sm hover:shadow-xl"
                >
                  <div className="h-48 relative overflow-hidden shrink-0">
                    <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} referrerPolicy="no-referrer" />
                    <div className="absolute top-4 left-4 bg-[var(--bg)]/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--text)]">
                      {product.category}
                    </div>
                    <div className="absolute top-4 right-4 bg-[var(--bg)]/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[var(--accent)] text-sm font-bold">
                      <Star size={14} fill="currentColor" />
                      4.5 <span className="text-[var(--text-muted)] text-xs font-normal">(0)</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">{product.seller_name}</span>
                        <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                          <MapPin size={10} /> {product.seller_city}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-[var(--accent)] transition-colors">{product.name}</h4>
                      <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4">{product.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                      <div>
                        <span className="text-2xl font-bold">{product.price}</span>
                        <span className="text-xs text-[var(--accent)] font-bold ml-1">MAD</span>
                      </div>
                      <button 
                        onClick={() => onAction(`Added ${product.name} to cart`)}
                        className="p-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20 flex items-center justify-center"
                        title="Add to Cart"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




