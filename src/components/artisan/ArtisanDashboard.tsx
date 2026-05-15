import React, { useState, useEffect } from 'react';
import premiumLogo from '../../assets/images/m3allem_premium_logo_1778418407151.png';
import { formatDuration } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  Wallet, 
  MessageSquare,
  MessageCircle,
  LogOut,
  Bell,
  Menu,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  Briefcase,
  Video,
  Zap,
  X,
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
  Sun,
  Moon,
  ArrowLeft,
  Home as HomeIcon,
  Banknote,
  CreditCard,
  Wrench,
  Camera,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Booking } from '../../services/marketplaceService';
import { aiService } from '../../services/aiService';
import NotificationBell from '../layout/NotificationBell';
import { socket, connectSocket } from '../../services/socket';
import MessagesSection from '../marketplace/MessagesSection';
import NavButton from '../common/NavButton';
import MobileNav from '../common/MobileNav';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';

export default function ArtisanDashboard({ onLogout, onSwitchView, onAction, isDarkMode, toggleTheme }: { 
  onLogout: () => void, 
  onSwitchView: () => void,
  onAction: (msg: string) => void,
  isDarkMode: boolean,
  toggleTheme: () => void
}) {
  const { t } = useTranslation();
  const { user, token, updateProfile } = useAuth();
  const { settings } = useSettings();
  
  const symbolUrl = isDarkMode ? (settings?.branding_symbol_dark || settings?.branding_symbol_light || premiumLogo) : (settings?.branding_symbol_light || premiumLogo);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [personalInfo, setPersonalInfo] = useState({ name: user?.name || '', phone: user?.phone || '' });

  const validateProfileField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'expertise':
        if (!value.trim()) error = 'Expertise is required';
        break;
      case 'yearsExperience':
        if (isNaN(value) || value < 0) error = 'Invalid years of experience';
        break;
      case 'bio':
        if (value.trim().length < 20) error = 'Bio must be at least 20 characters';
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeJobs: 0,
    completedJobs: 0,
    earnings: 0,
    rating: 0
  });

  const [nearbyJobs, setNearbyJobs] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [completingBookingId, setCompletingBookingId] = useState<string | null>(null);
  const [artisanServices, setArtisanServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [watchId, setWatchId] = useState<number | null>(null);
  const [artisanId, setArtisanId] = useState<string | null>(null);
  const [artisanSettings, setArtisanSettings] = useState({
    isOnline: false,
    serviceRadius: 10,
    preferredCities: [] as string[],
    workingHours: {
      monday: { start: '08:00', end: '18:00', active: true },
      tuesday: { start: '08:00', end: '18:00', active: true },
      wednesday: { start: '08:00', end: '18:00', active: true },
      thursday: { start: '08:00', end: '18:00', active: true },
      friday: { start: '08:00', end: '18:00', active: true },
      saturday: { start: '09:00', end: '14:00', active: true },
      sunday: { start: '09:00', end: '14:00', active: false },
    },
    bio: '',
    expertise: '',
    yearsExperience: 0,
    certifications: ''
  });

  const fetchNearbyJobs = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/bookings/nearby', { 
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setNearbyJobs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      connectSocket(token);
      
      // Listen for new job availability
      socket.on('new_job_available', (data: any) => {
        if (!data) return;
        const urgentTag = data.isUrgent ? ' [URGENT]' : '';
        const details = `${data.serviceTitle} for ${data.clientName}${data.city ? ` in ${data.city}` : ''}`;
        onAction(`New job request available${urgentTag}: ${details}`);
        // Refresh nearby jobs if we are on the nearby tab or dashboard
        if (activeTab === 'nearby' || activeTab === 'dashboard') {
          fetchNearbyJobs();
        }
      });

      fetch('/api/artisans/me', { 
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text().catch(() => 'No error details');
          throw new Error(`Failed to fetch artisan data: ${res.status} ${res.statusText} - ${errorText}`);
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setArtisanId(data.id);
        setArtisanSettings(prev => ({
          ...prev,
          isOnline: data.is_online === 1 || data.isOnline === true || data.is_online === true,
          serviceRadius: data.serviceRadius || data.service_radius || 10,
          preferredCities: data.preferred_cities ? (typeof data.preferred_cities === 'string' ? JSON.parse(data.preferred_cities) : data.preferred_cities) : (data.preferredCities || []),
          workingHours: data.working_hours ? (typeof data.working_hours === 'string' ? JSON.parse(data.working_hours) : data.working_hours) : (data.workingHours || prev.workingHours),
          bio: data.bio || '',
          expertise: data.expertise || '',
          yearsExperience: data.years_experience || data.yearsExperience || 0,
          certifications: data.certifications || ''
        }));
      })
      .catch(err => {
        console.error("Error fetching artisan profile:", err);
        // Optional: onAction(`Failed to load profile: ${err.message}`);
      });
    }
    return () => {
      socket.off('new_job_available');
      socket.disconnect();
    };
  }, [token, activeTab]);

  useEffect(() => {
    // Check if any booking is 'en_route'
    const enRouteBooking = bookings.find(b => b.status === 'en_route');
    
    if (enRouteBooking && !watchId && artisanId) {
      if ("geolocation" in navigator) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('update_location', { artisanId, lat: latitude, lng: longitude });
          },
          (error) => console.error("Geolocation error:", error),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
        setWatchId(id);
      }
    } else if (!enRouteBooking && watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [bookings, watchId, artisanId]);

  useEffect(() => {
    if (activeTab === 'services') {
      const fetchArtisanServices = async () => {
        if (!token) return;
        setServicesLoading(true);
        try {
          // Get artisan ID first
          const artisanRes = await fetch('/api/artisans/me', { 
            credentials: 'include',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (artisanRes.ok) {
            const artisanData = await artisanRes.json();
            const res = await fetch(`/api/services?artisanId=${artisanData.id}`, { 
              credentials: 'include',
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
              const data = await res.json();
              setArtisanServices(data);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setServicesLoading(false);
        }
      };
      fetchArtisanServices();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'nearby') {
      fetchNearbyJobs();
    }
  }, [activeTab]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch artisan stats and bookings
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const fetchOptions = {
          credentials: 'include' as const,
          headers: { 'Authorization': `Bearer ${token}` }
        };
        const [bookingsRes, categoriesRes, portfolioRes, reviewsRes, transactionsRes] = await Promise.all([
          fetch('/api/bookings', fetchOptions),
          fetch('/api/categories', fetchOptions),
          fetch('/api/artisans/me/portfolio', fetchOptions),
          fetch('/api/artisans/me/reviews', fetchOptions),
          fetch('/api/artisans/me/transactions', fetchOptions)
        ]);

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data);
          
          // Calculate stats
          const pending = data.filter((b: any) => b.status === 'pending').length;
          const active = data.filter((b: any) => b.status === 'accepted' || b.status === 'ongoing').length;
          const completed = data.filter((b: any) => b.status === 'completed').length;
          const earnings = data.filter((b: any) => b.status === 'completed').reduce((sum: number, b: any) => sum + b.price, 0);
          
          setStats({
            pendingRequests: pending,
            activeJobs: active,
            completedJobs: completed,
            earnings: earnings,
            rating: 4.8 // Mock rating for now
          });
        }

        if (categoriesRes.ok) setCategories(await categoriesRes.json());
        if (portfolioRes.ok) setPortfolio(await portfolioRes.json());
        if (reviewsRes.ok) setReviews(await reviewsRes.json());
        if (transactionsRes.ok) setTransactions(await transactionsRes.json());

      } catch (err) {
        console.error("Error fetching artisan dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, { 
        credentials: 'include', 
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
          },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        if (newStatus === 'completed') {
          setCompletingBookingId(bookingId);
          // Wait for animation before updating state that filters it out
          setTimeout(() => {
            setBookings(prev => prev?.map(b => {
              if (b.id === bookingId) {
                const updated: Booking = { ...b, status: newStatus };
                if (newStatus === 'completed') updated.finished_at = new Date().toISOString();
                return updated;
              }
              return b;
            }));
            setCompletingBookingId(null);
            onAction?.('Task completed! Great job.');
          }, 1500);
        } else {
          // Refresh bookings
          setBookings(prev => prev?.map(b => {
            if (b.id === bookingId) {
              const updated: Booking = { ...b, status: newStatus };
              if (newStatus === 'ongoing' || newStatus === 'in_progress') updated.started_at = new Date().toISOString();
              return updated;
            }
            return b;
          }));
        }
      }
    } catch (err) {
      console.error("Failed to update booking status", err);
    }
  };

  const validatePortfolioField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'title':
        if (!value.trim()) error = 'Title is required';
        break;
      case 'description':
        if (!value.trim()) error = 'Description is required';
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateServiceField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'title':
        if (!value.trim()) error = 'Service title is required';
        break;
      case 'categoryId':
        if (!value) error = 'Please select a category';
        break;
      case 'price':
        if (isNaN(value) || value <= 0) error = 'Invalid price';
        break;
      case 'description':
        if (value.trim().length < 10) error = 'Description is too short';
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateWithdrawField = (value: any) => {
    let error = '';
    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) error = 'Invalid amount';
    else if (amount > stats.earnings) error = 'Insufficient balance';
    setFieldErrors(prev => ({ ...prev, withdrawAmount: error }));
    return !error;
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
    { id: 'support', label: t('nav_support', 'Support'), icon: <ShieldCheck size={18} /> },
    { id: 'profile', label: t('nav_profile', 'Profile'), icon: <User size={18} /> },
    { id: 'settings', label: t('nav_settings', 'Settings'), icon: <Settings size={18} /> },
  ];

  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAddPortfolioModal, setShowAddPortfolioModal] = useState(false);
  const [newPortfolioItem, setNewPortfolioItem] = useState<{
    title: string;
    description: string;
    imageUrls: string[];
    videoUrl: string;
  }>({
    title: '',
    description: '',
    imageUrls: [],
    videoUrl: ''
  });
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    categoryName: '',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800'
  });
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [proposedPrice, setProposedPrice] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [suggesting, setSuggesting] = useState(false);

  const handleProposeClick = async (job: any) => {
    setSelectedJob(job);
    setShowProposeModal(true);
    setSuggesting(true);
    try {
      const data = await aiService.getSuggestedPrice(
        job.category_name || "General Service",
        job.description,
        job.is_urgent ? true : false,
        job.city || job.address || "Casablanca"
      );
      setAiSuggestion(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  };

  const submitProposal = async () => {
    if (!proposedPrice) return;
    try {
      const res = await fetch(`/api/bookings/${selectedJob.id}/propose`, { 
        credentials: 'include', 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
          },
        body: JSON.stringify({ price: parseFloat(proposedPrice) })
      });
      if (res.ok) {
        onAction('Proposal submitted successfully!');
        setShowProposeModal(false);
        // Refresh nearby jobs
        const resNearby = await fetch('/api/bookings/nearby', { 
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resNearby.ok) {
          const data = await resNearby.json();
          setNearbyJobs(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories', { 
          credentials: 'include',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.ok ? await res.json() : [];
          setCategories(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'portfolio') {
      const fetchPortfolio = async () => {
        setPortfolioLoading(true);
        try {
          const res = await fetch('/api/artisans/me/portfolio', { 
            credentials: 'include',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (res.ok) {
            const data = await res.json();
            setPortfolio(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setPortfolioLoading(false);
        }
      };
      fetchPortfolio();
    }
  }, [activeTab]);

  const handleAddPortfolioItem = async () => {
    if (!newPortfolioItem.title || (newPortfolioItem.imageUrls.length === 0 && !newPortfolioItem.videoUrl)) {
      onAction('Please provide a title and at least an image or video.');
      return;
    }

    try {
      const itemsToCreate = newPortfolioItem.imageUrls.length > 0 
        ? newPortfolioItem.imageUrls.map(url => ({
            title: newPortfolioItem.title,
            description: newPortfolioItem.description,
            imageUrl: url,
            videoUrl: newPortfolioItem.videoUrl
          }))
        : [{
            title: newPortfolioItem.title,
            description: newPortfolioItem.description,
            imageUrl: '',
            videoUrl: newPortfolioItem.videoUrl
          }];

      const newItems = [];
      for (const item of itemsToCreate) {
        const res = await fetch('/api/artisans/me/portfolio', { 
          credentials: 'include', 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
          body: JSON.stringify(item)
        });
        if (res.ok) {
          const addedItem = await res.json();
          newItems.push(addedItem);
        }
      }

      if (newItems.length > 0) {
        setPortfolio(prev => [...newItems, ...prev]);
        setShowAddPortfolioModal(false);
        setNewPortfolioItem({ title: '', description: '', imageUrls: [], videoUrl: '' });
        onAction('Portfolio items added successfully!');
      }
    } catch (err) {
      console.error(err);
      onAction('Failed to add portfolio item.');
    }
  };

  const handleDeletePortfolioItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    try {
      const res = await fetch(`/api/artisans/me/portfolio/${itemId}`, { 
        credentials: 'include', 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPortfolio(prev => prev.filter(item => item.id !== itemId));
        onAction('Portfolio item deleted successfully!');
      }
    } catch (err) {
      console.error(err);
      onAction('Failed to delete portfolio item.');
    }
  };

  const handleAddService = async () => {
    if (!newService.title || !newService.categoryId || !newService.price) {
      onAction('Please fill in all required fields.');
      return;
    }

    try {
      const selectedCat = categories.find(c => c.id === newService.categoryId);
      
      const res = await fetch('/api/artisans/me/services', { 
        credentials: 'include', 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
          },
        body: JSON.stringify({
          ...newService,
          price: parseFloat(newService.price),
          categoryName: selectedCat?.name || ''
        })
      });

      if (res.ok) {
        const newItem = await res.json();
        setArtisanServices(prev => [newItem, ...prev]);
        setShowAddServiceModal(false);
        setNewService({
          title: '',
          description: '',
          price: '',
          categoryId: '',
          categoryName: '',
          imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800'
        });
        onAction('Service added successfully!');
      }
    } catch (err) {
      console.error(err);
      onAction('Failed to add service.');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      onAction('Please enter a valid amount.');
      return;
    }
    if (parseFloat(withdrawAmount) > stats.earnings) {
      onAction('Insufficient balance.');
      return;
    }

    try {
      const res = await fetch('/api/artisans/withdraw', { 
        credentials: 'include', 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
          },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount) })
      });

      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({ ...prev, earnings: prev.earnings - parseFloat(withdrawAmount) }));
        setTransactions(prev => [data.transaction, ...prev]);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        onAction('Withdrawal request submitted successfully!');
      }
    } catch (err) {
      console.error(err);
      onAction('Failed to submit withdrawal request.');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/artisans/me/services/${serviceId}`, { 
        credentials: 'include', 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setArtisanServices(prev => prev.filter(s => s.id !== serviceId));
        onAction('Service deleted successfully!');
      }
    } catch (err) {
      console.error(err);
      onAction('Failed to delete service.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // In a real app, we would upload to S3 or similar.
      // For this demo, we'll use a FileReader to get a base64 string
      const newBase64Images: string[] = [];
      let processed = 0;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === 'image') {
            newBase64Images.push(reader.result as string);
          } else {
            setNewPortfolioItem(prev => ({ ...prev, videoUrl: reader.result as string }));
          }
          processed++;
          if (processed === files.length) {
            if (type === 'image') {
               setNewPortfolioItem(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...newBase64Images] }));
            }
            setUploading(false);
          }
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.error(err);
      setUploading(false);
      onAction('Failed to process file.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/artisans/settings', { 
        credentials: 'include', 
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
          },
        body: JSON.stringify({
          serviceRadius: artisanSettings.serviceRadius,
          preferredCities: artisanSettings.preferredCities,
          workingHours: artisanSettings.workingHours
        })
      });

      if (res.ok) {
        onAction('Settings saved successfully!');
      } else {
        onAction('Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      onAction('Failed to save settings.');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>;
    }

    switch (activeTab) {
      case 'settings':
        return (
          <div className="space-y-6 pb-20 max-w-5xl mx-auto">
            {/* Top Online Status Card */}
            <div className="bg-[#fffdf2] border border-[#ffefb0] rounded-[32px] p-8 shadow-sm flex items-center justify-between">
              <button 
                onClick={async () => {
                  const newStatus = !artisanSettings.isOnline;
                  try {
                    const res = await fetch('/api/artisans/settings', { 
                      credentials: 'include', 
                      method: 'PATCH',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ isOnline: newStatus })
                    });
                    if (res.ok) {
                      setArtisanSettings(prev => ({ ...prev, isOnline: newStatus }));
                      onAction(newStatus ? t('go_online_success', 'You are now online') : t('go_offline_success', 'You are now offline'));
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className={`px-8 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-md ${
                  artisanSettings.isOnline 
                    ? 'bg-[#FFD700] text-black' 
                    : 'bg-[#e0e0e0] text-[#757575]'
                }`}
              >
                {artisanSettings.isOnline ? t('go_offline') : t('go_online')}
              </button>

              <div className="flex items-center gap-4 text-right">
                <div className="flex flex-col items-end">
                  <h4 className="font-black text-lg text-black">Availability Status</h4>
                  <p className="text-xs font-bold text-[#9e9e9e]">
                    {artisanSettings.isOnline ? 'You are currently visible to clients' : 'You are currently hidden from search results'}
                  </p>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full ${artisanSettings.isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[#757575]'}`} />
              </div>
            </div>

            {/* Main Settings Card */}
            <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-2xl relative border border-[#f0f0f0]">
              <div className="flex items-center justify-end gap-5 mb-12">
                <div className="text-right">
                  <h3 className="text-3xl font-black text-black tracking-tight">Service Settings</h3>
                  <p className="text-sm font-bold text-[#9e9e9e]">Configure your availability and service area</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#fff9db] flex items-center justify-center text-[#FFD700]">
                  <Settings size={28} className="animate-[spin_10s_linear_infinite]" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20">
                {/* Working Hours Column */}
                <div className="space-y-6">
                  <div className="flex justify-end pr-8">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bdbdbd]">Working Hours</label>
                  </div>
              <div className="bg-[#f8f9fa] rounded-[32px] p-6 md:p-8 space-y-4">
                {Object.entries(artisanSettings.workingHours).map(([day, hours]: [string, any]) => (
                  <div key={day} className="flex items-center justify-between group">
                    <div className={`flex items-center gap-2 transition-all duration-300 ${hours.active ? 'opacity-100' : 'opacity-10 translate-x-1'}`}>
                      <div className="flex items-center gap-1 bg-white border border-black/5 px-2 py-1.5 rounded-xl shadow-sm">
                        <input 
                          type="time" 
                          value={hours.start}
                          onChange={(e) => setArtisanSettings({
                            ...artisanSettings,
                            workingHours: { ...artisanSettings.workingHours, [day]: { ...hours, start: e.target.value } }
                          })}
                          className="w-[70px] bg-transparent outline-none font-bold text-[10px] text-black focus:text-[#FFD700]"
                        />
                        <Clock size={10} className="text-black/30" />
                      </div>
                      <span className="text-black/10 font-bold">-</span>
                      <div className="flex items-center gap-1 bg-white border border-black/5 px-2 py-1.5 rounded-xl shadow-sm">
                        <input 
                          type="time" 
                          value={hours.end}
                          onChange={(e) => setArtisanSettings({
                            ...artisanSettings,
                            workingHours: { ...artisanSettings.workingHours, [day]: { ...hours, end: e.target.value } }
                          })}
                          className="w-[70px] bg-transparent outline-none font-bold text-[10px] text-black focus:text-[#FFD700]"
                        />
                        <Clock size={10} className="text-black/30" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`capitalize font-bold text-[10px] transition-all tracking-wider ${hours.active ? 'text-black opacity-100' : 'text-black/20 opacity-40 translate-x-2'}`}>{day}</span>
                      <button 
                        onClick={() => setArtisanSettings({
                          ...artisanSettings,
                          workingHours: { ...artisanSettings.workingHours, [day]: { ...hours, active: !hours.active } }
                        })}
                        className={`w-10 h-6 rounded-full relative transition-all duration-500 shadow-sm ${
                          hours.active 
                            ? 'bg-[#FFD700] ring-4 ring-[#FFD700]/10' 
                            : 'bg-black/5'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${hours.active ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
                </div>

                {/* Radius and Cities Column */}
                <div className="space-y-12">
                  {/* Service Radius */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#FFD700] bg-[#fff9db] px-3 py-1 rounded-lg">km {artisanSettings.serviceRadius}</span>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bdbdbd]">Service Radius (km)</label>
                    </div>
                    <div className="relative group bg-[#f2f2f2] rounded-3xl p-6 px-10">
                      <div className="flex items-center gap-6">
                        <span className="text-xs font-black text-black/40 min-w-[20px]">{artisanSettings.serviceRadius}</span>
                        <input 
                          type="range" 
                          min="1" 
                          max="100" 
                          value={artisanSettings.serviceRadius}
                          onChange={(e) => setArtisanSettings({...artisanSettings, serviceRadius: parseInt(e.target.value)})}
                          className="flex-1 accent-[#FFD700] h-1.5 bg-[#e0e0e0] rounded-lg appearance-none cursor-pointer"
                        />
                        <Navigation size={20} className="text-[#FFD700] transform rotate-45 group-hover:scale-125 transition-transform" />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-[#bdbdbd] text-right italic font-serif">Define how far you are willing to travel for jobs</p>
                  </div>

                  {/* Preferred Cities */}
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bdbdbd]">Preferred Cities</label>
                    </div>
                    <div className="bg-[#f2f2f2] rounded-[24px] p-4 flex flex-wrap items-center gap-3">
                      <input 
                        type="text"
                        placeholder="Add a city (e.g. Casablanca)"
                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-black placeholder:text-[#bdbdbd] px-4 py-2 min-w-[200px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val && !artisanSettings.preferredCities.includes(val)) {
                              setArtisanSettings({
                                ...artisanSettings,
                                preferredCities: [...artisanSettings.preferredCities, val]
                              });
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <div className="flex flex-wrap gap-2">
                        {artisanSettings.preferredCities.map(city => (
                          <span key={city} className="bg-white text-black px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm border border-[#e0e0e0] hover:border-[#FFD700] transition-colors group">
                            {city}
                            <button 
                              onClick={() => setArtisanSettings({
                                ...artisanSettings,
                                preferredCities: artisanSettings.preferredCities.filter(c => c !== city)
                              })}
                              className="text-[#9e9e9e] hover:text-rose-500 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-16 flex justify-start">
                <button 
                  onClick={handleSaveSettings}
                  className="px-12 py-4 bg-[#FFD700] text-black rounded-2xl font-black text-sm hover:translate-y-[-4px] hover:shadow-[0_12px_32px_rgba(255,215,0,0.4)] transition-all active:scale-95 flex items-center gap-3"
                >
                  Save Settings
                  <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard title={t('pending_requests')} value={stats.pendingRequests} icon={<Clock />} />
              <StatCard title={t('active_jobs')} value={stats.activeJobs} icon={<Briefcase />} />
              <StatCard title={t('completed')} value={stats.completedJobs} icon={<CheckCircle />} />
              <StatCard title={t('earnings')} value={`${Number(stats.earnings).toFixed(2)} MAD`} icon={<Wallet />} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setActiveTab('requests')}
                className="p-6 rounded-3xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex flex-col items-center gap-3 hover:bg-[var(--accent)] hover:text-white transition-all group"
              >
                <Calendar size={24} className="text-[var(--accent)] group-hover:text-white" />
                <span className="font-bold text-sm">{t('nav_requests')}</span>
              </button>
              <button 
                onClick={() => setShowAddServiceModal(true)}
                className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center gap-3 hover:bg-blue-500 hover:text-white transition-all group"
              >
                <Plus size={24} className="text-blue-500 group-hover:text-white" />
                <span className="font-bold text-sm">{t('nav_my_services')}</span>
              </button>
              <button 
                onClick={() => setActiveTab('wallet')}
                className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center gap-3 hover:bg-emerald-500 hover:text-white transition-all group"
              >
                <Banknote size={24} className="text-emerald-500 group-hover:text-white" />
                <span className="font-bold text-sm">{t('nav_wallet')}</span>
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center gap-3 hover:bg-purple-500 hover:text-white transition-all group"
              >
                <User size={24} className="text-purple-500 group-hover:text-white" />
                <span className="font-bold text-sm">{t('nav_profile')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 glass relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent)]/50 to-transparent" />
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-[var(--text)] flex items-center gap-3">
                    <Zap size={24} className="text-[var(--accent)]" />
                    {t('recent_requests')}
                  </h3>
                  <button className="text-xs font-bold text-[var(--accent)] hover:underline uppercase tracking-widest">{t('view_all')}</button>
                </div>
                <div className="space-y-6">
                  {bookings.filter(b => b.status === 'pending').length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-48 h-48 mb-6 relative">
                        <img src="/input_file_1.png" alt={t('no_requests')} className="w-full h-full object-contain opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
                      </div>
                      <p className="text-[var(--text-muted)] font-bold text-lg tracking-tight uppercase italic opacity-40 italic">{t('waiting_requests', 'Waiting for your first request...')}</p>
                    </div>
                  ) : (
                    bookings?.filter(b => b.status === 'pending')?.map(booking => (
                      <motion.div 
                        key={booking.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[var(--text)]/5 border border-[var(--border)] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[var(--text)]/10 transition-all group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <img src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}&background=random`} alt={booking.other_party_name} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 border-2 border-[var(--card-bg)] rounded-full" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{booking.other_party_name}</h4>
                            <p className="text-sm text-[var(--text-muted)] font-medium">{booking.service_name}</p>
                            <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] mt-2 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(booking.scheduled_at).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right mr-2">
                            <span className="text-xl font-black text-[var(--text)]">{Number(booking.price).toFixed(2)}</span>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] ml-1">MAD</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleStatusUpdate(booking.id, 'accepted')} 
                              className="w-12 h-12 flex items-center justify-center bg-[var(--success)] text-white rounded-2xl hover:scale-110 transition-all active:scale-95 shadow-lg shadow-[var(--success)]/20"
                              title="Accept"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')} 
                              className="w-12 h-12 flex items-center justify-center bg-[var(--destructive)]/10 text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white rounded-2xl transition-all active:scale-95"
                              title="Decline"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 glass relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--success)]/50 to-transparent" />
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-[var(--text)] flex items-center gap-3">
                    <Briefcase size={24} className="text-[var(--success)]" />
                    {t('active_jobs')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('status_live', 'Live Status')}</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {bookings.filter(b => b.status === 'accepted' || b.status === 'ongoing' || b.status === 'en_route' || b.status === 'in_progress').length === 0 ? (
                      <motion.div 
                        key="no-jobs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                      >
                        <div className="w-48 h-48 mb-6 relative">
                          <img src="/input_file_2.png" alt={t('no_active_jobs')} className="w-full h-full object-contain opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
                        </div>
                        <p className="text-[var(--text-muted)] font-bold text-lg tracking-tight uppercase italic opacity-40 italic">{t('ready_mission', 'Ready to start your next mission?')}</p>
                      </motion.div>
                    ) : (
                      bookings?.filter(b => b.status === 'accepted' || b.status === 'ongoing' || b.status === 'en_route' || b.status === 'in_progress')?.map(booking => (
                        <motion.div 
                          key={booking.id} 
                          layout
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ 
                            opacity: 0, 
                            scale: 0.9, 
                            y: -20,
                            filter: 'blur(8px)',
                            transition: { duration: 0.4, ease: "circIn" }
                          }}
                          className={`bg-[var(--text)]/5 border border-[var(--border)] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative group overflow-hidden`}
                        >
                          <AnimatePresence>
                            {completingBookingId === booking.id && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 bg-[var(--success)] flex flex-col items-center justify-center text-white"
                              >
                                <motion.div
                                  initial={{ scale: 0, rotate: -45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2"
                                >
                                  <CheckCircle size={40} className="text-white" />
                                </motion.div>
                                <motion.span 
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                  className="text-lg font-black uppercase tracking-widest text-white shadow-sm"
                                >
                                  {t('completed')}!
                                </motion.span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${booking.status === 'ongoing' || booking.status === 'in_progress' ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'}`} />
                        
                        <div className="flex items-center gap-5">
                          <img src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}&background=random`} alt={booking.other_party_name} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-lg text-[var(--text)]">{booking.other_party_name}</h4>
                              {(booking.status === 'ongoing' || booking.status === 'in_progress') && (
                                <span className="px-2 py-0.5 bg-[var(--success)]/10 text-[var(--success)] text-[8px] font-black uppercase tracking-widest rounded-full">{t('status_in_progress', 'In Progress')}</span>
                              )}
                            </div>
                            <p className="text-sm text-[var(--text-muted)] font-medium">{booking.service_name}</p>
                            <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] mt-2 font-bold">
                              <MapPin size={12} className="text-[var(--accent)]" />
                              {t('client_location', 'Client Location')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="text-xl font-black text-[var(--accent)] block">{Number(booking.price).toFixed(2)} MAD</span>
                            {(booking.status === 'ongoing' || booking.status === 'in_progress') && booking.started_at && (
                              <div className="flex items-center gap-1.5 text-[var(--success)] font-mono text-xs font-bold mt-1">
                                <Clock size={14} />
                                {formatDuration(booking.started_at, currentTime)}
                              </div>
                            )}
                          </div>
                          
                          {booking.status === 'accepted' ? (
                            <button 
                              onClick={() => handleStatusUpdate(booking.id, 'en_route')} 
                              className="px-6 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2 active:scale-95"
                            >
                              <Navigation size={18} />
                              {t('start_job', 'Start')}
                            </button>
                          ) : booking.status === 'en_route' ? (
                            <button 
                              onClick={() => handleStatusUpdate(booking.id, 'in_progress')} 
                              className="px-6 py-3 bg-[var(--success)] text-white hover:opacity-90 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[var(--success)]/20 flex items-center gap-2 active:scale-95"
                            >
                              <MapPin size={18} />
                              {t('status_arrived', 'Arrived')}
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleStatusUpdate(booking.id, 'completed')} 
                              className="px-6 py-3 bg-[var(--accent)] text-white hover:opacity-90 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2 active:scale-95"
                            >
                              <CheckCircle size={18} />
                              {t('finish_job', 'Finish')}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
              <div className="bg-gradient-to-br from-[var(--accent)]/10 to-transparent border border-[var(--border)] rounded-[40px] p-10 glass relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4 tracking-tighter">{t('grow_business_title', 'Grow Your Business')}</h3>
                  <p className="text-[var(--text-muted)] font-medium mb-8 max-w-sm">{t('grow_business_desc', 'Complete more jobs and maintain a high rating to unlock premium features and higher visibility.')}</p>
                  <button className="px-8 py-4 bg-[var(--text)] text-[var(--bg)] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95">{t('learn_more')}</button>
                </div>
                <img src="/input_file_6.png" alt="Grow" className="absolute -right-10 -bottom-10 w-64 h-64 object-contain opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
              </div>

              <div className="bg-gradient-to-br from-[var(--success)]/10 to-transparent border border-[var(--border)] rounded-[40px] p-10 glass relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4 tracking-tighter">{t('stay_connected_title', 'Stay Connected')}</h3>
                  <p className="text-[var(--text-muted)] font-medium mb-8 max-w-sm">{t('stay_connected_desc', "Keep your status 'Online' to receive real-time requests from clients in your immediate vicinity.")}</p>
                  <button className="px-8 py-4 bg-[var(--text)] text-[var(--bg)] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95">{t('check_status')}</button>
                </div>
                <img src="/input_file_1.png" alt="Connect" className="absolute -right-10 -bottom-10 w-64 h-64 object-contain opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
              </div>
            </div>
          </div>
        );
      case 'requests':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('active_requests')}</h3>
              <p className="text-[var(--text-muted)] mt-1 font-medium">{t('active_requests_desc', 'Detailed view of your current and past bookings.')}</p>
            </div>

            <div className="grid gap-6">
              {bookings?.length === 0 ? (
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-20 text-center glass">
                  <div className="w-24 h-24 bg-[var(--text)]/5 rounded-full flex items-center justify-center text-[var(--text-muted)] mx-auto mb-6">
                    <Calendar size={40} />
                  </div>
                  <h4 className="text-xl font-bold text-[var(--text)] mb-2">{t('no_requests_yet')}</h4>
                  <p className="text-[var(--text-muted)]">{t('no_requests_desc', 'When clients book your services, they will appear here.')}</p>
                </div>
              ) : (
                bookings?.map(booking => (
                  <div key={booking.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 glass group hover:shadow-2xl transition-all">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Client Info & Status */}
                      <div className="lg:w-1/4 space-y-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}&background=FFD700&color=000`} 
                            alt={booking.other_party_name} 
                            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-[var(--accent)]/10" 
                          />
                          <div>
                            <h4 className="font-black text-[var(--text)] tracking-tight">{booking.other_party_name}</h4>
                            {booking.status === 'completed' ? (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 10, stiffness: 300 }}
                                className="bg-[var(--success)]/20 text-[var(--success)] px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest mt-1 flex items-center gap-1 w-fit"
                              >
                                <CheckCircle size={8} />
                                {booking.status.replace('_', ' ')}
                              </motion.div>
                            ) : (
                              <div className={`inline-flex px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest mt-1 ${
                                booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                booking.status === 'proposal_submitted' ? 'bg-orange-500/20 text-orange-500' :
                                booking.status === 'proposal_approved' ? 'bg-blue-500/20 text-blue-500' :
                                booking.status === 'en_route' ? 'bg-purple-500/20 text-purple-500' :
                                booking.status === 'ongoing' || booking.status === 'in_progress' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                                'bg-[var(--destructive)]/20 text-[var(--destructive)]'
                              }`}>
                                {booking.status.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                          <div className="flex items-center gap-3 text-xs font-bold text-[var(--text)]">
                            <Clock size={14} className="text-[var(--accent)]" />
                            {new Date(booking.scheduled_at).toLocaleDateString()} at {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-start gap-3 text-xs font-bold text-[var(--text)]">
                            <MapPin size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{booking.address || 'Address not provided'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-bold text-[var(--accent)]">
                            <Banknote size={14} />
                            <span>{Number(booking.price).toFixed(2)} MAD - {booking.payment_method?.toUpperCase() || 'CASH'}</span>
                          </div>
                          {booking.client_phone && (
                            <div className="flex items-center gap-3 pt-2">
                              <button 
                                onClick={() => window.open(`tel:${booking.client_phone}`)}
                                className="flex-1 py-2 bg-[var(--text)]/5 hover:bg-[var(--accent)]/10 text-[var(--text)] rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all border border-[var(--border)]"
                              >
                                <Phone size={12} className="text-[var(--accent)]" />
                                {t('call')}
                              </button>
                              <button 
                                onClick={() => window.open(`https://wa.me/${booking.client_phone.replace(/\D/g, '')}`)}
                                className="flex-1 py-2 bg-[var(--text)]/5 hover:bg-emerald-500/10 text-[var(--text)] rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all border border-[var(--border)]"
                              >
                                <MessageCircle size={12} className="text-emerald-500" />
                                {t('whatsapp')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Problem Description & Media */}
                      <div className="flex-1 space-y-6">
                        <div className="bg-[var(--text)]/5 rounded-3xl p-6">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">{t('problem_description')}</h5>
                          <p className="text-sm font-medium text-[var(--text)] leading-relaxed italic">
                            "{booking.problem_description || t('no_problem_desc', 'No description provided by client.')}"
                          </p>
                        </div>

                        {booking.images && (JSON.parse(typeof booking.images === 'string' ? booking.images : JSON.stringify(booking.images)) || [])?.length > 0 && (
                          <div>
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 pl-2">{t('attached_photos')}</h5>
                            <div className="flex flex-wrap gap-3">
                              {(JSON.parse(typeof booking.images === 'string' ? booking.images : JSON.stringify(booking.images)) || []).map((imgUrl: string, idx: number) => (
                                <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-[var(--border)] group/img relative">
                                  <img src={imgUrl} alt="Problem" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <Plus size={16} className="text-white" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="lg:w-1/4 flex flex-col gap-3 justify-center">
                        <button 
                          onClick={() => {
                            setActiveTab('messages');
                            // Navigate to specific conversation if needed, 
                            // here we assume the iframe will handle route if we pass params
                          }}
                          className="w-full py-4 bg-[var(--text)]/5 hover:bg-[var(--text)]/10 text-[var(--text)] rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all"
                        >
                          <MessageSquare size={16} className="text-[var(--accent)]" />
                          {t('chat_client', 'Chat with Client')}
                        </button>
                        
                        <button 
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('start-live-diagnostic', {
                              detail: {
                                artisanId: user?.id, 
                                artisanName: user?.name,
                                artisanUserId: booking.client_id
                              }
                            }));
                          }}
                          className="w-full py-4 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all"
                        >
                          <Video size={16} />
                          {t('video_diagnostic')}
                        </button>

                        <button 
                          onClick={() => onAction?.(t('managing_booking', { name: booking.other_party_name }))}
                          className="w-full py-4 bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)]/50 text-[var(--text)] rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                        >
                          {t('manage_order', 'Manage Order')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'nearby':
        return (
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-6 text-[var(--text)]">{t('nearby_jobs_radius', 'Nearby Jobs (5km Radius)')}</h3>
            <div className="space-y-4">
              {nearbyJobs.length === 0 ? (
                <p className="text-[var(--text-muted)] text-center py-8">{t('no_nearby_jobs', 'No nearby jobs found at the moment. Stay online to receive alerts!')}</p>
              ) : (
                nearbyJobs?.map(job => (
                  <div key={job.id} className="bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--text)]">{job.service_name}</h4>
                        <p className="text-sm text-[var(--text-muted)]">{job.address}</p>
                        <div className="flex items-center gap-4 text-xs text-[var(--success)] mt-1 font-bold">
                          <div className="flex items-center gap-1">
                            <Zap size={12} /> {job.distance.toFixed(1)} {t('km_away', 'km away')}
                          </div>
                          <span className="flex items-center gap-1 capitalize text-[var(--text-muted)] font-normal">
                            {job.payment_method === 'card' ? <CreditCard size={12} /> : 
                             job.payment_method === 'wallet' ? <Wallet size={12} /> : 
                             <Banknote size={12} />}
                            {t(`payment_${job.payment_method || 'cash'}`)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold text-[var(--accent)] block">{Number(job.price).toFixed(2)} MAD</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{new Date(job.created_at).toLocaleTimeString()}</span>
                      </div>
                      <button 
                        onClick={() => handleProposeClick(job)}
                        className="px-6 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                      >
                        {t('propose_price', 'Propose Price')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'services':
        return (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-3xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('service_catalog', 'Service Catalog')}</h3>
                <p className="text-[var(--text-muted)] mt-1 font-medium">{t('service_catalog_desc', 'Manage the services you offer to clients.')}</p>
              </div>
              <button 
                onClick={() => setShowAddServiceModal(true)}
                className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30"
              >
                <Plus size={20} /> {t('add_new_service', 'Add New Service')}
              </button>
            </div>
            
            {servicesLoading ? (
              <div className="flex justify-center py-24">
                <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {artisanServices.length === 0 ? (
                  <div className="col-span-full text-center py-24 bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] glass">
                    <div className="w-64 h-64 mb-8 relative mx-auto">
                      <img src="/input_file_3.png" alt={t('no_services')} className="w-full h-full object-contain opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
                    </div>
                    <h4 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4">{t('catalog_empty', 'Your Catalog is Empty')}</h4>
                    <p className="text-[var(--text-muted)] font-medium mb-10 max-w-md mx-auto text-center">{t('catalog_empty_desc', 'Add your first service to start receiving requests from clients in your area.')}</p>
                    <button 
                      onClick={() => setShowAddServiceModal(true)}
                      className="mx-auto px-10 py-5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30 flex items-center gap-3"
                    >
                      <Plus size={20} />
                      {t('create_first_service', 'Create First Service')}
                    </button>
                  </div>
                ) : (
                  artisanServices.map(service => (
                    <motion.div 
                      key={service.id} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] overflow-hidden glass group hover:shadow-2xl transition-all"
                    >
                      <div className="h-48 relative overflow-hidden">
                        <img src={service.image_url} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
                          {service.category_name}
                        </div>
                      </div>
                      <div className="p-8">
                        <h4 className="text-xl font-black text-[var(--text)] mb-2 tracking-tight group-hover:text-[var(--accent)] transition-colors">{service.title}</h4>
                        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-6 font-medium leading-relaxed">{service.description}</p>
                        <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{t('starting_price', 'Starting Price')}</span>
                            <span className="text-2xl font-black text-[var(--accent)] tracking-tighter">{Number(service.price).toFixed(2)} <span className="text-xs font-bold">MAD</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onAction?.(`Editing service ${service.title}...`)}
                              className="w-10 h-10 flex items-center justify-center bg-[var(--text)]/5 hover:bg-[var(--accent)] hover:text-white rounded-xl transition-all active:scale-90"
                            >
                              <Settings size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteService(service.id)}
                              className="w-10 h-10 flex items-center justify-center bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl transition-all text-red-500 active:scale-90"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      case 'portfolio':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[var(--text)]">My Portfolio</h3>
              <button 
                onClick={() => setShowAddPortfolioModal(true)}
                className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
              >
                <Plus size={18} /> Add Work
              </button>
            </div>

            {portfolioLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.length === 0 ? (
                  <div className="col-span-full text-center py-24 bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] glass">
                    <div className="w-64 h-64 mb-8 relative mx-auto">
                      <img src="/input_file_4.png" alt="No portfolio" className="w-full h-full object-contain opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
                    </div>
                    <h4 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4">Showcase Your Work</h4>
                    <p className="text-[var(--text-muted)] font-medium mb-10 max-w-md mx-auto text-center">Upload photos of your completed projects to build trust with potential clients.</p>
                    <button 
                      onClick={() => setShowAddPortfolioModal(true)}
                      className="mx-auto px-10 py-5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30 flex items-center gap-3"
                    >
                      <Plus size={20} />
                      Add Project Photo
                    </button>
                  </div>
                ) : (
                  portfolio.map((item) => (
                    <div key={item.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl overflow-hidden group relative">
                      <div className="h-48 overflow-hidden relative">
                        {item.video_url ? (
                          <video src={item.video_url} className="w-full h-full object-cover" controls muted />
                        ) : (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        )}
                        <button 
                          onClick={() => handleDeletePortfolioItem(item.id)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-[var(--text)] mb-1">{item.title}</h4>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      case 'wallet':
        return (
          <div className="space-y-10">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-12 flex flex-col items-center justify-center text-center glass relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[var(--accent)]/5 pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl" />
              
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] text-white rounded-[24px] flex items-center justify-center mb-6 shadow-2xl shadow-[var(--accent)]/30 transform -rotate-6">
                <Wallet size={40} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2 opacity-60">{t('total_available_balance', 'Total Available Balance')}</p>
              <div className="text-7xl font-black text-[var(--text)] mb-8 tracking-tighter flex items-baseline gap-3">
                {Number(stats.earnings).toFixed(2)} 
                <span className="text-2xl font-bold text-[var(--accent)] uppercase tracking-widest">MAD</span>
              </div>
              
              {stats.earnings < 50 ? (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 max-w-md">
                   <p className="text-orange-500 font-bold text-sm">
                     {t('min_withdrawal_desc', 'You need a minimum balance of 50.00 MAD to withdraw funds. Complete more jobs to reach the withdrawal threshold.')}
                   </p>
                </div>
              ) : (
                <button 
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-10 py-5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30 flex items-center gap-3"
                >
                  <Banknote size={20} />
                  {t('withdraw_funds', 'Withdraw Funds')}
                </button>
              )}
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-10 glass">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('transaction_history')}</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[var(--text)]/5 rounded-xl text-xs font-bold hover:bg-[var(--text)]/10 transition-colors">{t('income')}</button>
                  <button className="px-4 py-2 bg-[var(--text)]/5 rounded-xl text-xs font-bold hover:bg-[var(--text)]/10 transition-colors">{t('withdrawals')}</button>
                </div>
              </div>
              <div className="space-y-6">
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center opacity-60">
                    <div className="w-64 h-64 mb-8 relative">
                      <img src="/input_file_6.png" alt={t('no_transactions')} className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
                    </div>
                    <h4 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4">{t('no_transactions')}</h4>
                    <p className="text-[var(--text-muted)] font-medium max-w-md text-center">{t('no_transactions_desc', 'Your earnings and withdrawals will appear here once you start completing jobs.')}</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <motion.div 
                      key={tx.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-6 bg-[var(--text)]/5 rounded-3xl border border-[var(--border)] hover:bg-[var(--text)]/10 transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-500 shadow-red-500/10' : 'bg-[var(--success)]/10 text-[var(--success)] shadow-[var(--success)]/10'}`}>
                          {tx.type === 'withdrawal' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                        </div>
                        <div>
                          <p className="font-black text-lg text-[var(--text)] tracking-tight">{tx.description}</p>
                          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black tracking-tight ${tx.type === 'withdrawal' ? 'text-red-500' : 'text-[var(--success)]'}`}>
                          {tx.type === 'withdrawal' ? '-' : '+'}{Number(tx.amount).toFixed(2)} <span className="text-xs font-bold ml-1">MAD</span>
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mt-2 ${tx.status === 'completed' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-yellow-500/10 text-yellow-600'}`}>
                          {tx.status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-3xl font-black text-[var(--text)] italic uppercase tracking-tight">{t('client_reviews')}</h3>
                <p className="text-[var(--text-muted)] mt-1 font-medium">{t('client_reviews_desc', 'What people say about your professional service.')}</p>
              </div>
              <div className="flex items-center gap-6 bg-[var(--card-bg)] border border-[var(--border)] p-6 rounded-[32px] glass shadow-xl">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-4xl font-black text-[var(--text)] mb-1">
                    <Star size={32} fill="var(--accent)" className="text-[var(--accent)]" />
                    {stats.rating}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{t('average_rating', 'Average Rating')}</p>
                </div>
                <div className="w-px h-12 bg-[var(--border)]" />
                <div className="text-center">
                  <div className="text-4xl font-black text-[var(--text)] mb-1">{reviews.length}</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{t('total_reviews', 'Total Reviews')}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.length === 0 ? (
                <div className="col-span-full text-center py-24 bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] glass">
                  <div className="w-64 h-64 mb-8 relative mx-auto">
                    <img src="/input_file_5.png" alt={t('no_reviews')} className="w-full h-full object-contain opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] to-transparent" />
                  </div>
                  <h4 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tight mb-4">{t('no_reviews_yet')}</h4>
                  <p className="text-[var(--text-muted)] font-medium max-w-md mx-auto text-center">{t('no_reviews_desc_empty', 'Complete jobs to start receiving feedback from your clients.')}</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <motion.div 
                    key={review.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 glass hover:shadow-2xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Star size={80} fill="var(--accent)" className="text-[var(--accent)]" />
                    </div>
                    <div className="flex items-center gap-5 mb-6 relative z-10">
                      <img src={review.client_avatar || `https://ui-avatars.com/api/?name=${review.client_name}&background=random`} alt={review.client_name} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                      <div>
                        <h4 className="font-black text-lg text-[var(--text)] tracking-tight">{review.client_name}</h4>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.stars ? "var(--accent)" : "none"} className={i < review.stars ? "text-[var(--accent)]" : "text-[var(--text-muted)] opacity-30"} />
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="relative z-10">
                      <p className="text-[var(--text)] text-lg italic font-medium leading-relaxed">"{review.review}"</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      case 'messages':
        return <MessagesSection />;
      case 'support':
        return (
          <div className="space-y-10">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-12 glass relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="w-24 h-24 bg-[var(--accent)]/10 rounded-3xl flex items-center justify-center text-[var(--accent)] mx-auto mb-8 shadow-2xl">
                <ShieldCheck size={48} />
              </div>
              <h3 className="text-4xl font-black text-[var(--text)] italic uppercase tracking-tighter mb-4">{t('artisan_support', 'Artisan Support')}</h3>
              <p className="text-[var(--text-muted)] max-w-2xl mx-auto font-medium text-lg">
                {t('artisan_support_desc', "We're here to help you grow your business. If you encounter any issues or have questions about how to use the platform, our dedicated support team is just a call or message away.")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  title: t('direct_assistance', 'Direct Assistance'), 
                  desc: t('direct_assistance_desc', 'Contact our technical support for immediate help with your account.'), 
                  icon: <Phone size={24} />,
                  action: () => window.open('tel:+212000000000'),
                  btn: t('call_now', 'Call Now')
                },
                { 
                  title: t('whatsapp_support', 'WhatsApp Support'), 
                  desc: t('whatsapp_support_desc', 'Chat with us on WhatsApp for quick inquiries and photo/video sharing.'), 
                  icon: <MessageSquare size={24} />,
                  action: () => window.open('https://wa.me/212000000000'),
                  btn: t('chat_on_whatsapp', 'Chat on WhatsApp')
                },
                { 
                  title: t('platform_guide', 'Platform Guide'), 
                  desc: t('platform_guide_desc', 'Learn how to maximize your earnings and attract more clients.'), 
                  icon: <Briefcase size={24} />,
                  action: () => setActiveTab('dashboard'), // Placeholder
                  btn: t('view_guide', 'View Guide')
                }
              ].map((item, i) => (
                <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-10 glass group hover:border-[var(--accent)] transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--text)]/5 flex items-center justify-center text-[var(--accent)] mb-8 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="text-xl font-black text-[var(--text)] mb-2 uppercase italic tracking-tight">{item.title}</h4>
                  <p className="text-sm text-[var(--text-muted)] mb-8 font-medium leading-relaxed">{item.desc}</p>
                  <button 
                    onClick={item.action}
                    className="w-full py-4 bg-[var(--text)]/5 hover:bg-[var(--accent)] text-[var(--text)] hover:text-black rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    {item.btn}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-12 glass">
              <h3 className="text-2xl font-black text-[var(--text)] italic uppercase tracking-tighter mb-8">{t('faq', 'Frequently Asked Questions')}</h3>
              <div className="space-y-6">
                {[
                  { q: t('faq_q1', 'How do I get more jobs?'), a: t('faq_a1', 'Keep your status online, upload high-quality work to your portfolio, and maintain a high rating by completing jobs successfully.') },
                  { q: t('faq_q2', 'How do commissions work?'), a: t('faq_a2', 'The platform is currently free. In the future, a small commission will be automatically deducted from your earnings after job completion.') },
                  { q: t('faq_q3', 'How do I withdraw my earnings?'), a: t('faq_a3', 'Go to the Wallet section. You can withdraw your balance once it exceeds 50.00 MAD.') }
                ].map((faq, i) => (
                  <div key={i} className="border-b border-[var(--border)] pb-6 last:border-0 last:pb-0">
                    <h5 className="font-black text-[var(--text)] mb-2 uppercase italic text-sm">{faq.q}</h5>
                    <p className="text-sm text-[var(--text-muted)] font-medium">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-10">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-12 glass relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-32 -mt-32" />
              
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-[40px] bg-[var(--text)]/10 border-4 border-[var(--border)] overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Artisan'}&background=FFD700&color=000&size=256`} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute -bottom-4 -right-4 p-4 bg-[var(--accent)] text-white rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-95">
                    <Camera size={20} />
                  </button>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-4xl font-black text-[var(--text)] tracking-tighter italic uppercase mb-2">{user?.name || 'Artisan Name'}</h3>
                  <p className="text-[var(--text-muted)] font-medium text-lg mb-6">{user?.phone}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl text-xs font-black uppercase tracking-widest border border-[var(--accent)]/20">{t('verified_pro', 'Verified Pro')}</span>
                    <span className="px-4 py-2 bg-[var(--text)]/5 text-[var(--text-muted)] rounded-xl text-xs font-black uppercase tracking-widest border border-[var(--border)]">{stats.rating} {t('rating', 'Rating')}</span>
                    <span className="px-4 py-2 bg-[var(--text)]/5 text-[var(--text-muted)] rounded-xl text-xs font-black uppercase tracking-widest border border-[var(--border)]">{stats.completedJobs} {t('jobs', 'Jobs')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-10 glass">
                  <h4 className="text-xl font-black text-[var(--text)] italic uppercase tracking-tight mb-8">{t('personal_information')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">{t('full_name')}</label>
                      <input 
                        type="text" 
                        value={personalInfo.name}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                        className="w-full px-6 py-4 bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl text-[var(--text)] font-bold focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">{t('phone_number')}</label>
                      <input 
                        type="text" 
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        className="w-full px-6 py-4 bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl text-[var(--text)] font-bold focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-10 glass">
                  <h4 className="text-xl font-black text-[var(--text)] italic uppercase tracking-tight mb-8">{t('professional_information')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">{t('expertise_skills', 'Expertise / Skills')}</label>
                      <input 
                        type="text" 
                        value={artisanSettings.expertise}
                        onChange={(e) => {
                          setArtisanSettings({...artisanSettings, expertise: e.target.value});
                          if (fieldErrors.expertise) validateProfileField('expertise', e.target.value);
                        }}
                        onBlur={(e) => validateProfileField('expertise', e.target.value)}
                        className={`w-full px-6 py-4 bg-[var(--text)]/5 border rounded-2xl text-[var(--text)] font-bold focus:ring-4 focus:ring-[var(--accent)]/10 transition-all outline-none ${fieldErrors.expertise ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]'}`}
                        placeholder={t('expertise_placeholder', 'e.g. Plumbing, Electrical')}
                      />
                      {fieldErrors.expertise && <p className="text-rose-500 text-[10px] font-bold ml-2">{t(fieldErrors.expertise)}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">{t('years_experience', 'Years of Experience')}</label>
                      <input 
                        type="number" 
                        value={artisanSettings.yearsExperience}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setArtisanSettings({...artisanSettings, yearsExperience: val});
                          if (fieldErrors.yearsExperience) validateProfileField('yearsExperience', val);
                        }}
                        onBlur={(e) => validateProfileField('yearsExperience', parseInt(e.target.value))}
                        className={`w-full px-6 py-4 bg-[var(--text)]/5 border rounded-2xl text-[var(--text)] font-bold focus:ring-4 focus:ring-[var(--accent)]/10 transition-all outline-none ${fieldErrors.yearsExperience ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]'}`}
                      />
                      {fieldErrors.yearsExperience && <p className="text-rose-500 text-[10px] font-bold ml-2">{t(fieldErrors.yearsExperience)}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">{t('certifications')}</label>
                      <input 
                        type="text" 
                        value={artisanSettings.certifications}
                        onChange={(e) => setArtisanSettings({...artisanSettings, certifications: e.target.value})}
                        className="w-full px-6 py-4 bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl text-[var(--text)] font-bold focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all outline-none"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2 pt-6 border-t border-[var(--border)]">
                      <h4 className="text-xl font-bold text-[var(--text)] flex items-center gap-2 mb-4">
                        <ShieldCheck size={20} className="text-[var(--accent)]" /> {t('verification_documents', 'Verification Documents')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">{t('id_document')}</label>
                          <div className="mt-2 border-2 border-dashed border-[var(--border)] rounded-2xl p-6 text-center hover:border-[var(--accent)] transition-colors cursor-pointer group relative">
                            <Plus size={24} className="mx-auto text-[var(--text-muted)] group-hover:text-[var(--accent)] mb-2" />
                            <p className="font-bold text-[var(--text)] text-sm">{t('upload_cin')}</p>
                            <p className="text-xs text-[var(--text-muted)]">{t('upload_formats_desc', 'PDF, JPG, PNG up to 5MB')}</p>
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              accept="image/*,.pdf" 
                              onChange={() => onAction(t('id_uploaded_msg'))}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">{t('professional_license_optional')}</label>
                          <div className="mt-2 border-2 border-dashed border-[var(--border)] rounded-2xl p-6 text-center hover:border-[var(--accent)] transition-colors cursor-pointer group relative">
                            <Plus size={24} className="mx-auto text-[var(--text-muted)] group-hover:text-[var(--accent)] mb-2" />
                            <p className="font-bold text-[var(--text)] text-sm">{t('upload_license')}</p>
                            <p className="text-xs text-[var(--text-muted)]">{t('upload_formats_desc')}</p>
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              accept="image/*,.pdf" 
                              onChange={() => onAction(t('license_uploaded_msg'))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">{t('service_radius')}</label>
                      <div className="flex items-center gap-6 bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-4">
                        <div className="flex-1 flex items-center gap-4">
                          <Navigation size={20} className="text-[var(--accent)]" />
                          <input 
                            type="range" 
                            min="1" 
                            max="100" 
                            value={artisanSettings.serviceRadius}
                            onChange={(e) => setArtisanSettings({...artisanSettings, serviceRadius: parseInt(e.target.value)})}
                            className="flex-1 accent-[var(--accent)] h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            min="1"
                            max="200"
                            value={artisanSettings.serviceRadius}
                            onChange={(e) => setArtisanSettings({...artisanSettings, serviceRadius: parseInt(e.target.value) || 1})}
                            className="w-20 bg-transparent border-b-2 border-[var(--accent)] text-center font-black text-xl focus:border-[var(--accent)] outline-none text-[var(--text)]"
                          />
                          <span className="font-bold text-[var(--text-muted)]">KM</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1 ml-2">{t('service_radius_desc', 'This radius determines which "Nearby Jobs" you\'ll be notified about.')}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">{t('professional_bio')}</label>
                      <textarea 
                        rows={4}
                        value={artisanSettings.bio}
                        onChange={(e) => {
                          setArtisanSettings({...artisanSettings, bio: e.target.value});
                          if (fieldErrors.bio) validateProfileField('bio', e.target.value);
                        }}
                        onBlur={(e) => validateProfileField('bio', e.target.value)}
                        className={`w-full px-6 py-4 bg-[var(--text)]/5 border rounded-2xl text-[var(--text)] font-bold focus:ring-4 focus:ring-[var(--accent)]/10 transition-all outline-none resize-none ${fieldErrors.bio ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]'}`}
                      />
                      {fieldErrors.bio && <p className="text-rose-500 text-[10px] font-bold ml-2">{t(fieldErrors.bio)}</p>}
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      const errors: Record<string, string> = {};
                      if (!artisanSettings.expertise.trim()) errors.expertise = 'Expertise is required';
                      if (isNaN(artisanSettings.yearsExperience) || artisanSettings.yearsExperience < 0) errors.yearsExperience = 'Invalid years of experience';
                      if (artisanSettings.bio.trim().length < 20) errors.bio = 'Bio must be at least 20 characters';

                      setFieldErrors(errors);
                      if (Object.keys(errors).length > 0) return;

                      try {
                        // Update User model (name, phone) via AuthContext for global consistency
                        await updateProfile({
                          name: personalInfo.name,
                          phone: personalInfo.phone
                        });

                        // Update Artisan settings via artisan API
                        const res = await fetch('/api/artisans/me/profile', { 
                          credentials: 'include', 
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                            },
                          body: JSON.stringify({
                            bio: artisanSettings.bio,
                            expertise: artisanSettings.expertise,
                            yearsExperience: artisanSettings.yearsExperience,
                            certifications: artisanSettings.certifications,
                            serviceRadius: artisanSettings.serviceRadius
                          })
                        });
                        
                        if (res.ok) {
                          onAction?.(t('profile_updated_success'));
                        } else {
                          onAction?.(t('profile_updated_failed'));
                        }
                      } catch (err) {
                        console.error(err);
                        onAction?.(t('profile_updated_error'));
                      }
                    }}
                    className="mt-10 px-10 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/30"
                  >
                    {t('save_profile')}
                  </button>
                </div>
              </div>

              <div className="space-y-10">
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-10 glass">
                  <h4 className="text-xl font-black text-[var(--text)] italic uppercase tracking-tight mb-8">{t('account_settings', 'Account Settings')}</h4>
                  <div className="space-y-6">
                    <button 
                      onClick={() => {
                        const newPassword = window.prompt(t('enter_new_password', 'Enter new password:'));
                        if (newPassword && newPassword.length >= 8) {
                          onAction(t('password_change_success', 'Password change request submitted successfully!'));
                        } else if (newPassword) {
                          onAction(t('password_short_error', 'Password must be at least 8 characters.'));
                        }
                      }}
                      className="w-full px-6 py-4 bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl text-[var(--text)] font-bold hover:bg-[var(--text)]/10 transition-all flex items-center justify-between group"
                    >
                      <span>{t('change_password', 'Change Password')}</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => {
                        onAction(t('notification_settings_updated', 'Notification preferences updated!'));
                      }}
                      className="w-full px-6 py-4 bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl text-[var(--text)] font-bold hover:bg-[var(--text)]/10 transition-all flex items-center justify-between group"
                    >
                      <span>{t('notification_settings', 'Notification Settings')}</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 rounded-[40px] p-10 glass">
                  <h4 className="text-xl font-black text-red-500 italic uppercase tracking-tight mb-4">{t('danger_zone', 'Danger Zone')}</h4>
                  <p className="text-xs text-red-500/60 font-medium mb-8">{t('danger_zone_desc', 'Once you delete your account, there is no going back.')}</p>
                  <button 
                    onClick={() => {
                      if(window.confirm(t('confirm_delete_account', 'Are you sure you want to delete your account? This action is permanent.'))) {
                        onAction(t('account_deletion_submitted', 'Account deletion request submitted to support.'));
                      }
                    }}
                    className="w-full px-6 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all active:scale-95 shadow-xl shadow-red-500/20"
                  >
                    {t('deactivate_account', 'Deactivate Account')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Coming soon</div>;
    }
  };

  return (
    <div className="flex h-full bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--card-bg)] border-r border-[var(--border)] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col glass shadow-2xl`}>
            <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-105 shadow-lg shadow-[var(--accent)]/20 ring-1 ring-white/10 dark:ring-white/5">
              <img src={symbolUrl} alt="M3allem Symbol" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-[var(--text)] text-balance">M3allem</span>
          </div>
          <button className="lg:hidden p-2 rounded-xl hover:bg-[var(--text)]/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {navItems?.map(item => (
            <button
              key={item.id}
              onClick={() => { 
                if (item.onClick) {
                  item.onClick();
                } else {
                  setActiveTab(item.id); 
                }
                setIsMobileMenuOpen(false); 
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-xl shadow-[var(--accent)]/30 scale-[1.02]' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--text)]/5 hover:text-[var(--text)] hover:translate-x-1'
              }`}
            >
              <div className={`${activeTab === item.id ? 'text-white' : 'text-[var(--accent)] group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </div>
              {t(`nav_${item.id.replace('-', '_')}`, item.label)}
              {activeTab === item.id && (
                <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-[var(--border)]">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all active:scale-95 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            {t('logout_account', 'Logout Account')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative max-w-[100vw]">
        {/* Header */}
        <header className="h-20 lg:h-24 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-2xl flex items-center justify-between px-4 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-2 lg:gap-6">
            <button className="lg:hidden p-2 rounded-xl hover:bg-[var(--text)]/5 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            {activeTab !== 'dashboard' && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-md lg:shadow-xl flex items-center justify-center group"
                title="Back to Dashboard"
              >
                <ArrowLeft size={20} className="lg:w-[22px] lg:h-[22px] group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            <h1 className="text-xl lg:text-2xl font-black capitalize tracking-tight text-[var(--text)] italic uppercase hidden sm:block">
              {t('nav_' + activeTab.replace('-', '_'), activeTab.replace('-', ' '))}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-6">
            <div className="flex items-center gap-2 lg:gap-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl lg:rounded-3xl px-3 py-1.5 lg:px-6 lg:py-3 glass shadow-sm">
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-60">{t('nav_status', 'Status')}</span>
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${artisanSettings.isOnline ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                  {artisanSettings.isOnline ? t('status_online', 'Online') : t('status_offline', 'Offline')}
                </span>
              </div>
              <button 
                onClick={async () => {
                  const newStatus = !artisanSettings.isOnline;
                  try {
                    const res = await fetch('/api/artisans/settings', { 
                      credentials: 'include', 
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                        },
                      body: JSON.stringify({ isOnline: newStatus })
                    });
                    if (res.ok) {
                      setArtisanSettings(prev => ({ ...prev, isOnline: newStatus }));
                      onAction(t('status_changed_msg', { status: newStatus ? t('status_online') : t('status_offline') }));
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className={`w-12 h-6 md:w-14 md:h-7 rounded-full relative transition-all duration-500 ${artisanSettings.isOnline ? 'bg-[var(--success)] shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[var(--border)]'}`}
              >
                <motion.div 
                  animate={{ x: artisanSettings.isOnline ? (window.innerWidth < 768 ? 24 : 28) : 4 }}
                  className="absolute top-1 left-0 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full shadow-xl"
                />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={onSwitchView}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[var(--text-muted)] hover:bg-[var(--text)]/5 transition-all"
              >
                <HomeIcon size={18} />
                <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:block">{t('nav_home', 'Home')}</span>
              </button>
              <LanguageSwitcher />
              <button 
                onClick={toggleTheme}
                className="p-3.5 rounded-2xl glass hover:scale-110 transition-all active:scale-95 shadow-xl flex items-center justify-center text-[var(--text)]"
              >
                {isDarkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-blue-500" size={20} />}
              </button>
              {user && (
                <NotificationBell 
                  userId={user.id} 
                  token={token}
                  onNotification={(n) => onAction(n.title)} 
                />
              )}
              <div className="w-12 h-12 rounded-2xl bg-[var(--text)]/10 border-2 border-[var(--border)] overflow-hidden shadow-xl hover:scale-105 transition-transform cursor-pointer">
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Artisan'}&background=FFD700&color=000`} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

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

      {/* Add Portfolio Item Modal */}
      <AnimatePresence>
        {showAddPortfolioModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 w-full max-w-lg relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />
              
              <button 
                onClick={() => setShowAddPortfolioModal(false)}
                className="absolute top-6 right-6 p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-6">
                  <Image size={32} />
                </div>
                <h2 className="text-3xl font-bold mb-2">Add Portfolio Item</h2>
                <p className="text-[var(--text-muted)]">Showcase your work with images or videos.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Title</label>
                  <input 
                    type="text"
                    value={newPortfolioItem.title}
                    onChange={(e) => {
                      setNewPortfolioItem({...newPortfolioItem, title: e.target.value});
                      if (fieldErrors.title) validatePortfolioField('title', e.target.value);
                    }}
                    onBlur={(e) => validatePortfolioField('title', e.target.value)}
                    placeholder="e.g. Modern Bathroom Renovation"
                    className={`w-full bg-[var(--text)]/5 border rounded-2xl px-6 py-3 focus:outline-none transition-colors ${fieldErrors.title ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]'}`}
                  />
                  {fieldErrors.title && <p className="text-rose-500 text-[10px] font-bold ml-4">{fieldErrors.title}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Description</label>
                  <textarea 
                    value={newPortfolioItem.description}
                    onChange={(e) => {
                      setNewPortfolioItem({...newPortfolioItem, description: e.target.value});
                      if (fieldErrors.description) validatePortfolioField('description', e.target.value);
                    }}
                    onBlur={(e) => validatePortfolioField('description', e.target.value)}
                    placeholder="Describe your work..."
                    className={`w-full bg-[var(--text)]/5 border rounded-2xl px-6 py-3 focus:outline-none transition-colors h-24 resize-none ${fieldErrors.description ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]'}`}
                  />
                  {fieldErrors.description && <p className="text-rose-500 text-[10px] font-bold ml-4">{fieldErrors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Images</label>
                    <div className="relative">
                      <input 
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileChange(e, 'image')}
                        className="hidden"
                        id="portfolio-image"
                      />
                      <label 
                        htmlFor="portfolio-image"
                        className="w-full flex flex-col items-center justify-center gap-2 bg-[var(--text)]/5 border border-dashed border-[var(--border)] rounded-2xl p-4 cursor-pointer hover:bg-[var(--text)]/10 transition-all"
                      >
                        {newPortfolioItem.imageUrls.length > 0 ? (
                          <div className="flex gap-2 w-full overflow-x-auto no-scrollbar">
                            {newPortfolioItem.imageUrls.map((url, idx) => (
                              <img key={idx} src={url} className="w-20 h-20 flex-shrink-0 object-cover rounded-lg" />
                            ))}
                          </div>
                        ) : (
                          <>
                            <Image size={24} className="text-[var(--text-muted)]" />
                            <span className="text-[10px] font-bold text-[var(--text-muted)] text-center">Upload Images<br/>(Multiple allowed)</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Video</label>
                    <div className="relative">
                      <input 
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange(e, 'video')}
                        className="hidden"
                        id="portfolio-video"
                      />
                      <label 
                        htmlFor="portfolio-video"
                        className="w-full flex flex-col items-center justify-center gap-2 bg-[var(--text)]/5 border border-dashed border-[var(--border)] rounded-2xl p-4 cursor-pointer hover:bg-[var(--text)]/10 transition-all"
                      >
                        {newPortfolioItem.videoUrl ? (
                          <div className="w-full h-20 bg-black rounded-lg flex items-center justify-center">
                            <Video size={20} className="text-white" />
                          </div>
                        ) : (
                          <>
                            <Video size={24} className="text-[var(--text-muted)]" />
                            <span className="text-[10px] font-bold text-[var(--text-muted)]">Upload Video</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {uploading && (
                  <div className="flex items-center justify-center gap-2 text-xs text-[var(--accent)] font-bold">
                    <Loader2 size={14} className="animate-spin" />
                    Processing file...
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAddPortfolioModal(false)}
                    className="flex-1 px-6 py-4 bg-[var(--text)]/5 text-[var(--text)] rounded-2xl font-bold hover:bg-[var(--text)]/10 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      const errors: Record<string, string> = {};
                      if (!newPortfolioItem.title.trim()) errors.title = 'Title is required';
                      if (!newPortfolioItem.description.trim()) errors.description = 'Description is required';
                      setFieldErrors(errors);
                      if (Object.keys(errors).length === 0) handleAddPortfolioItem();
                    }}
                    className="flex-1 px-6 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showProposeModal && selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 w-full max-w-lg relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />
              
              <button 
                onClick={() => setShowProposeModal(false)}
                className="absolute top-6 right-6 p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-6">
                  <Zap size={32} />
                </div>
                <h2 className="text-3xl font-bold mb-2">Propose Price</h2>
                <p className="text-[var(--text-muted)]">Set a competitive price for this {selectedJob.service_name} job.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-sm">
                      <Sparkles size={16} />
                      AI SUGGESTION
                    </div>
                    {suggesting && <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />}
                  </div>
                  
                  {aiSuggestion ? (
                    <div>
                      <div className="text-2xl font-bold text-[var(--text)] mb-2">
                        {aiSuggestion.minPrice?.toFixed(2)} - {aiSuggestion.maxPrice?.toFixed(2)} MAD
                      </div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {aiSuggestion.reasoning}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] italic">
                      {suggesting ? 'Analyzing job details...' : 'Unable to generate suggestion.'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Your Price (MAD)</label>
                  <input 
                    type="number"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-4 focus:outline-none focus:border-[var(--accent)] transition-colors text-lg font-bold"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowProposeModal(false)}
                    className="flex-1 px-6 py-4 bg-[var(--text)]/5 text-[var(--text)] rounded-2xl font-bold hover:bg-[var(--text)]/10 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitProposal}
                    disabled={!proposedPrice}
                    className="flex-[2] px-6 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-[var(--accent)]/20"
                  >
                    Submit Proposal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Service Modal */}
      <AnimatePresence>
        {showAddServiceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 w-full max-w-lg relative overflow-hidden"
            >
              <button 
                onClick={() => setShowAddServiceModal(false)}
                className="absolute top-6 right-6 p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Add New Service</h2>
                <p className="text-[var(--text-muted)]">List a new service to start receiving requests.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Service Title</label>
                  <input 
                    type="text"
                    value={newService.title}
                    onChange={(e) => {
                      setNewService({...newService, title: e.target.value});
                      if (fieldErrors.title) validateServiceField('title', e.target.value);
                    }}
                    onBlur={(e) => validateServiceField('title', e.target.value)}
                    placeholder="e.g. Professional House Painting"
                    className={`w-full bg-[var(--text)]/5 border rounded-2xl px-6 py-3 focus:outline-none transition-colors ${fieldErrors.title ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]'}`}
                  />
                  {fieldErrors.title && <p className="text-rose-500 text-[10px] font-bold ml-4">{fieldErrors.title}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Category</label>
                  <select 
                    value={newService.categoryId}
                    onChange={(e) => {
                      setNewService({...newService, categoryId: e.target.value});
                      validateServiceField('categoryId', e.target.value);
                    }}
                    className={`w-full bg-[var(--text)]/5 border rounded-2xl px-6 py-3 focus:outline-none transition-colors appearance-none ${fieldErrors.categoryId ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]'}`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {fieldErrors.categoryId && <p className="text-rose-500 text-[10px] font-bold ml-4">{fieldErrors.categoryId}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Price (MAD)</label>
                  <input 
                    type="number"
                    value={newService.price}
                    onChange={(e) => {
                      setNewService({...newService, price: e.target.value});
                      if (fieldErrors.price) validateServiceField('price', e.target.value);
                    }}
                    onBlur={(e) => validateServiceField('price', e.target.value)}
                    placeholder="e.g. 150"
                    className={`w-full bg-[var(--text)]/5 border rounded-2xl px-6 py-3 focus:outline-none transition-colors ${fieldErrors.price ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]'}`}
                  />
                  {fieldErrors.price && <p className="text-rose-500 text-[10px] font-bold ml-4">{fieldErrors.price}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Description</label>
                  <textarea 
                    value={newService.description}
                    onChange={(e) => {
                      setNewService({...newService, description: e.target.value});
                      if (fieldErrors.description) validateServiceField('description', e.target.value);
                    }}
                    onBlur={(e) => validateServiceField('description', e.target.value)}
                    placeholder="Describe your service in detail..."
                    rows={3}
                    className={`w-full bg-[var(--text)]/5 border rounded-2xl px-6 py-3 focus:outline-none transition-colors resize-none ${fieldErrors.description ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]'}`}
                  />
                  {fieldErrors.description && <p className="text-rose-500 text-[10px] font-bold ml-4">{fieldErrors.description}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAddServiceModal(false)}
                    className="flex-1 px-6 py-4 bg-[var(--text)]/5 text-[var(--text)] rounded-2xl font-bold hover:bg-[var(--text)]/10 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      const errors: Record<string, string> = {};
                      if (!newService.title.trim()) errors.title = 'Service title is required';
                      if (!newService.categoryId) errors.categoryId = 'Category is required';
                      if (isNaN(parseFloat(newService.price)) || parseFloat(newService.price) <= 0) errors.price = 'Invalid price';
                      if (newService.description.trim().length < 10) errors.description = 'Description is too short';
                      setFieldErrors(errors);
                      if (Object.keys(errors).length === 0) handleAddService();
                    }}
                    className="flex-[2] px-6 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
                  >
                    Create Service
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 w-full max-w-lg relative overflow-hidden"
            >
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="absolute top-6 right-6 p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Withdraw Funds</h2>
                <p className="text-[var(--text-muted)]">Transfer your earnings to your bank account.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-2xl p-4 text-center">
                  <p className="text-xs text-[var(--text-muted)] uppercase font-bold mb-1">Available Balance</p>
                  <p className="text-2xl font-bold text-[var(--accent)]">{Number(stats.earnings).toFixed(2)} MAD</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Amount to Withdraw (MAD)</label>
                  <input 
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value);
                      if (fieldErrors.withdrawAmount) validateWithdrawField(e.target.value);
                    }}
                    onBlur={(e) => validateWithdrawField(e.target.value)}
                    placeholder="e.g. 500"
                    className={`w-full bg-[var(--text)]/5 border rounded-2xl px-6 py-4 focus:outline-none transition-colors text-lg font-bold ${fieldErrors.withdrawAmount ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]'}`}
                  />
                  {fieldErrors.withdrawAmount && <p className="text-rose-500 text-[10px] font-bold ml-4 mt-2">{fieldErrors.withdrawAmount}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 px-6 py-4 bg-[var(--text)]/5 text-[var(--text)] rounded-2xl font-bold hover:bg-[var(--text)]/10 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (validateWithdrawField(withdrawAmount)) {
                        handleWithdraw();
                      }
                    }}
                    className="flex-[2] px-6 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 hover:shadow-2xl transition-all hover:-translate-y-2 group relative overflow-hidden glass">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[var(--accent)]/5 rounded-full blur-2xl group-hover:bg-[var(--accent)]/10 transition-colors" />
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1 opacity-80">{title}</p>
          <p className="text-3xl font-bold text-[var(--text)] tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
