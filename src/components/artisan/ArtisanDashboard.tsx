import React, { useState, useEffect } from 'react';
import { formatDuration } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  Wallet, 
  MessageSquare,
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
  Trash2,
  Loader2,
  Image,
  BrainCircuit,
  Sparkles,
  Sun,
  Moon,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../services/marketplaceService';
import { aiService } from '../../services/aiService';
import NotificationBell from '../layout/NotificationBell';
import { socket, connectSocket } from '../../services/socket';

export default function ArtisanDashboard({ onLogout, onAction, isDarkMode, toggleTheme }: { 
  onLogout: () => void, 
  onAction: (msg: string) => void,
  isDarkMode: boolean,
  toggleTheme: () => void
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeJobs: 0,
    completedJobs: 0,
    earnings: 0,
    rating: 0
  });

  const [nearbyJobs, setNearbyJobs] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
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
    }
  });

  const fetchNearbyJobs = async () => {
    try {
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch('/api/bookings/nearby', {
        headers: { 'Authorization': `Bearer ${token}` }
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
    const token = localStorage.getItem('m3allem_token');
    if (token) {
      connectSocket(token);
      
      // Listen for new job availability
      socket.on('new_job_available', (data: any) => {
        const urgentTag = data.isUrgent ? ' [URGENT]' : '';
        const details = `${data.serviceTitle} for ${data.clientName}${data.city ? ` in ${data.city}` : ''}`;
        onAction(`New job request available${urgentTag}: ${details}`);
        // Refresh nearby jobs if we are on the nearby tab or dashboard
        if (activeTab === 'nearby' || activeTab === 'dashboard') {
          fetchNearbyJobs();
        }
      });

      // Fetch artisan ID and settings
      fetch('/api/artisans/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setArtisanId(data.id);
        setArtisanSettings(prev => ({
          ...prev,
          isOnline: data.is_online === 1,
          serviceRadius: data.service_radius || 10,
          preferredCities: data.preferred_cities ? JSON.parse(data.preferred_cities) : [],
          workingHours: data.working_hours ? JSON.parse(data.working_hours) : prev.workingHours
        }));
      })
      .catch(err => console.error("Error fetching artisan profile:", err));
    }
    return () => {
      socket.off('new_job_available');
      socket.disconnect();
    };
  }, [activeTab]);

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
        setServicesLoading(true);
        try {
          const token = localStorage.getItem('m3allem_token');
          // Get artisan ID first
          const artisanRes = await fetch('/api/artisans/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (artisanRes.ok) {
            const artisanData = await artisanRes.json();
            const res = await fetch(`/api/services?artisanId=${artisanData.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
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
      try {
        const token = localStorage.getItem('m3allem_token');
        const res = await fetch('/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
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
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        // Refresh bookings
        setBookings(prev => prev?.map(b => {
          if (b.id === bookingId) {
            const updated: Booking = { ...b, status: newStatus };
            if (newStatus === 'ongoing' || newStatus === 'in_progress') updated.started_at = new Date().toISOString();
            if (newStatus === 'completed') updated.finished_at = new Date().toISOString();
            return updated;
          }
          return b;
        }));
      }
    } catch (err) {
      console.error("Failed to update booking status", err);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'requests', label: 'Requests', icon: <Calendar size={18} /> },
    { id: 'nearby', label: 'Nearby Jobs', icon: <MapPin size={18} /> },
    { id: 'services', label: 'My Services', icon: <Briefcase size={18} /> },
    { id: 'portfolio', label: 'Portfolio', icon: <Image size={18} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAddPortfolioModal, setShowAddPortfolioModal] = useState(false);
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    imageUrl: '',
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
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch(`/api/bookings/${selectedJob.id}/propose`, {
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
        const res = await fetch('/api/admin/categories');
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
          const token = localStorage.getItem('m3allem_token');
          const res = await fetch('/api/artisans/me/portfolio', {
            headers: { 'Authorization': `Bearer ${token}` }
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
    if (!newPortfolioItem.title || (!newPortfolioItem.imageUrl && !newPortfolioItem.videoUrl)) {
      onAction('Please provide a title and at least an image or video.');
      return;
    }

    try {
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch('/api/artisans/me/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPortfolioItem)
      });

      if (res.ok) {
        const newItem = await res.json();
        setPortfolio(prev => [newItem, ...prev]);
        setShowAddPortfolioModal(false);
        setNewPortfolioItem({ title: '', description: '', imageUrl: '', videoUrl: '' });
        onAction('Portfolio item added successfully!');
      }
    } catch (err) {
      console.error(err);
      onAction('Failed to add portfolio item.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // In a real app, we would upload to S3 or similar.
      // For this demo, we'll use a FileReader to get a base64 string
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'image') {
          setNewPortfolioItem(prev => ({ ...prev, imageUrl: base64String }));
        } else {
          setNewPortfolioItem(prev => ({ ...prev, videoUrl: base64String }));
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
      onAction('Failed to process file.');
    }
  };

  const handleDeletePortfolioItem = async (id: string) => {
    try {
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch(`/api/artisans/me/portfolio/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setPortfolio(prev => prev.filter(item => item.id !== id));
        onAction('Portfolio item deleted.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddService = async () => {
    if (!newService.title || !newService.price || !newService.categoryId) {
      onAction('Please fill in all required fields.');
      return;
    }

    try {
      const token = localStorage.getItem('m3allem_token');
      const selectedCat = categories.find(c => c.id === newService.categoryId);
      
      const res = await fetch('/api/services', {
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
        onAction('Service added successfully!');
        setShowAddServiceModal(false);
        setNewService({
          title: '',
          description: '',
          price: '',
          categoryId: '',
          categoryName: '',
          imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800'
        });
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
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount) })
      });

      if (res.ok) {
        onAction('Withdrawal request submitted successfully!');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        // Refresh stats
        setStats(prev => ({ ...prev, earnings: prev.earnings - parseFloat(withdrawAmount) }));
      }
    } catch (err) {
      console.error(err);
      onAction('Failed to submit withdrawal request.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('m3allem_token');
      const res = await fetch('/api/artisans/settings', {
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
          <div className="space-y-8 pb-20">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />
              <div className="flex items-center justify-between p-6 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-3xl mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${artisanSettings.isOnline ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--text-muted)]'}`} />
                  <div>
                    <h4 className="font-bold text-[var(--text)]">Availability Status</h4>
                    <p className="text-sm text-[var(--text-muted)]">
                      {artisanSettings.isOnline ? 'You are currently visible to clients' : 'You are currently hidden from search results'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    const newStatus = !artisanSettings.isOnline;
                    try {
                      const token = localStorage.getItem('m3allem_token');
                      const res = await fetch('/api/artisans/settings', {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ isOnline: newStatus ? 1 : 0 })
                      });
                      if (res.ok) {
                        setArtisanSettings(prev => ({ ...prev, isOnline: newStatus }));
                        onAction(`You are now ${newStatus ? 'online' : 'offline'}`);
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className={`px-6 py-2 rounded-xl font-bold transition-all active:scale-95 ${
                    artisanSettings.isOnline 
                      ? 'bg-[var(--success)] text-white' 
                      : 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]'
                  }`}
                >
                  {artisanSettings.isOnline ? 'Go Offline' : 'Go Online'}
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <Settings size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--text)]">Service Settings</h3>
                  <p className="text-[var(--text-muted)]">Configure your availability and service area.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4 mb-2 block">Service Radius (km)</label>
                    <div className="flex items-center gap-4 bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-4">
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={artisanSettings.serviceRadius}
                        onChange={(e) => setArtisanSettings({...artisanSettings, serviceRadius: parseInt(e.target.value)})}
                        className="flex-1 accent-[var(--accent)]"
                      />
                      <span className="font-bold text-xl min-w-[3rem] text-center">{artisanSettings.serviceRadius}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4 mb-2 block">Preferred Cities</label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Add a city (e.g. Casablanca)"
                          className="flex-1 bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text)]"
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
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {artisanSettings.preferredCities.map(city => (
                          <span key={city} className="bg-[var(--accent)]/10 text-[var(--accent)] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                            {city}
                            <button 
                              onClick={() => setArtisanSettings({
                                ...artisanSettings,
                                preferredCities: artisanSettings.preferredCities.filter(c => c !== city)
                              })}
                              className="hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4 mb-2 block">Working Hours</label>
                  <div className="bg-[var(--text)]/5 border border-[var(--border)] rounded-3xl p-6 space-y-4">
                    {Object.entries(artisanSettings.workingHours).map(([day, hours]: [string, any]) => (
                      <div key={day} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-[6rem]">
                          <input 
                            type="checkbox"
                            checked={hours.active}
                            onChange={(e) => setArtisanSettings({
                              ...artisanSettings,
                              workingHours: {
                                ...artisanSettings.workingHours,
                                [day]: { ...hours, active: e.target.checked }
                              }
                            })}
                            className="w-5 h-5 rounded-lg accent-[var(--accent)]"
                          />
                          <span className="capitalize font-bold text-sm">{day}</span>
                        </div>
                        
              <div className={`flex items-center gap-2 transition-opacity ${hours.active ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                          <input 
                            type="time"
                            value={hours.start}
                            onChange={(e) => setArtisanSettings({
                              ...artisanSettings,
                              workingHours: {
                                ...artisanSettings.workingHours,
                                [day]: { ...hours, start: e.target.value }
                              }
                            })}
                            className="bg-transparent border-b border-[var(--border)] text-sm font-mono focus:border-[var(--accent)] outline-none text-[var(--text)]"
                          />
                          <span className="text-[var(--text-muted)]">-</span>
                          <input 
                            type="time"
                            value={hours.end}
                            onChange={(e) => setArtisanSettings({
                              ...artisanSettings,
                              workingHours: {
                                ...artisanSettings.workingHours,
                                [day]: { ...hours, end: e.target.value }
                              }
                            })}
                            className="bg-transparent border-b border-[var(--border)] text-sm font-mono focus:border-[var(--accent)] outline-none text-[var(--text)]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-end">
                <button 
                  onClick={handleSaveSettings}
                  className="px-12 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20 flex items-center gap-3"
                >
                  <CheckCircle size={20} />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Pending Requests" value={stats.pendingRequests} icon={<Clock className="text-[var(--accent)]" />} />
              <StatCard title="Active Jobs" value={stats.activeJobs} icon={<Briefcase className="text-[var(--accent)]" />} />
              <StatCard title="Completed" value={stats.completedJobs} icon={<CheckCircle className="text-[var(--success)]" />} />
              <StatCard title="Earnings" value={`${stats.earnings} MAD`} icon={<Wallet className="text-[var(--accent)]" />} />
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-6 text-[var(--text)]">Recent Requests</h3>
              <div className="space-y-4">
                {bookings.filter(b => b.status === 'pending').length === 0 ? (
                  <p className="text-[var(--text-muted)] text-center py-8">No pending requests.</p>
                ) : (
                  bookings?.filter(b => b.status === 'pending')?.map(booking => (
                    <div key={booking.id} className="bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}&background=random`} alt={booking.other_party_name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-[var(--text)]">{booking.other_party_name}</h4>
                          <p className="text-sm text-[var(--text-muted)]">{booking.service_name}</p>
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                            <Calendar size={12} /> {new Date(booking.scheduled_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[var(--accent)]">{booking.price} MAD</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              handleStatusUpdate(booking.id, 'accepted');
                              onAction?.(`Accepting job ${booking.id}...`);
                            }} 
                            className="px-4 py-2 bg-[var(--success)]/20 text-[var(--success)] hover:bg-[var(--success)]/30 rounded-xl text-sm font-bold transition-all active:scale-95"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => {
                              handleStatusUpdate(booking.id, 'cancelled');
                              onAction?.(`Declining job ${booking.id}...`);
                            }} 
                            className="px-4 py-2 bg-[var(--destructive)]/20 text-[var(--destructive)] hover:bg-[var(--destructive)]/30 rounded-xl text-sm font-bold transition-all active:scale-95"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-6 text-[var(--text)]">Active Jobs</h3>
              <div className="space-y-4">
                {bookings.filter(b => b.status === 'accepted' || b.status === 'ongoing').length === 0 ? (
                  <p className="text-[var(--text-muted)] text-center py-8">No active jobs.</p>
                ) : (
                  bookings?.filter(b => b.status === 'accepted' || b.status === 'ongoing')?.map(booking => (
                    <div key={booking.id} className={`bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 ${booking.status === 'ongoing' ? 'border-l-[var(--success)]' : 'border-l-[var(--accent)]'}`}>
                      <div className="flex items-center gap-4">
                        <img src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}&background=random`} alt={booking.other_party_name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[var(--text)]">{booking.other_party_name}</h4>
                            {booking.status === 'ongoing' && (
                              <span className="flex h-2 w-2 rounded-full bg-[var(--success)] animate-pulse"></span>
                            )}
                          </div>
                          <p className="text-sm text-[var(--text-muted)]">{booking.service_name}</p>
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                            <Calendar size={12} /> {new Date(booking.scheduled_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                          <span className="font-bold text-[var(--accent)] block">{booking.price} MAD</span>
                          {booking.status === 'ongoing' && booking.started_at && (
                            <div className="flex items-center gap-1 text-[var(--success)] font-mono text-sm">
                              <Clock size={14} />
                              {formatDuration(booking.started_at, currentTime)}
                            </div>
                          )}
                        </div>
                        
                        {booking.status === 'proposal_approved' || booking.status === 'accepted' ? (
                          <button 
                            onClick={() => {
                              handleStatusUpdate(booking.id, 'en_route');
                              onAction?.('Journey started!');
                            }} 
                            className="px-6 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2 active:scale-95"
                          >
                            <MapPin size={16} />
                            Start Journey
                          </button>
                        ) : booking.status === 'en_route' ? (
                          <button 
                            onClick={() => {
                              handleStatusUpdate(booking.id, 'in_progress');
                              onAction?.('Arrived at location!');
                            }} 
                            className="px-6 py-2 bg-[var(--success)] text-white hover:opacity-90 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[var(--success)]/20 flex items-center gap-2 active:scale-95"
                          >
                            <MapPin size={16} />
                            I've Arrived
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              handleStatusUpdate(booking.id, 'completed');
                              onAction?.('Job completed successfully!');
                            }} 
                            className="px-6 py-2 bg-[var(--accent)] text-white hover:opacity-90 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2 active:scale-95"
                          >
                            <CheckCircle size={16} />
                            Finish Job
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      case 'requests':
        return (
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-6 text-[var(--text)]">All Requests</h3>
            <div className="space-y-4">
              {bookings?.map(booking => (
                <div key={booking.id} className="bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={booking.other_party_avatar || `https://ui-avatars.com/api/?name=${booking.other_party_name}&background=random`} alt={booking.other_party_name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-[var(--text)]">{booking.other_party_name}</h4>
                      <p className="text-sm text-[var(--text-muted)]">{booking.service_name}</p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                        <Calendar size={12} /> {new Date(booking.scheduled_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
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
                      className="p-2 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-full transition-colors"
                      title="Call Client"
                    >
                      <Video size={18} />
                    </button>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold mb-1 ${
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        booking.status === 'proposal_submitted' ? 'bg-orange-500/20 text-orange-500' :
                        booking.status === 'proposal_approved' ? 'bg-blue-500/20 text-blue-500' :
                        booking.status === 'en_route' ? 'bg-purple-500/20 text-purple-500' :
                        booking.status === 'ongoing' || booking.status === 'in_progress' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                        booking.status === 'completed' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                        'bg-[var(--destructive)]/20 text-[var(--destructive)]'
                      }`}>
                        {booking.status.toUpperCase()}
                      </div>
                      {booking.started_at && (
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">
                          {formatDuration(booking.started_at, booking.finished_at || currentTime)}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-[var(--accent)]">{booking.price} MAD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'nearby':
        return (
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-6 text-[var(--text)]">Nearby Jobs (5km Radius)</h3>
            <div className="space-y-4">
              {nearbyJobs.length === 0 ? (
                <p className="text-[var(--text-muted)] text-center py-8">No nearby jobs found at the moment. Stay online to receive alerts!</p>
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
                        <div className="flex items-center gap-2 text-xs text-[var(--success)] mt-1 font-bold">
                          <Zap size={12} /> {job.distance.toFixed(1)} km away
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold text-[var(--accent)] block">{job.price} MAD</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{new Date(job.created_at).toLocaleTimeString()}</span>
                      </div>
                      <button 
                        onClick={() => handleProposeClick(job)}
                        className="px-6 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                      >
                        Propose Price
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
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[var(--text)]">My Services</h3>
              <button 
                onClick={() => setShowAddServiceModal(true)}
                className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
              >
                <Plus size={18} />
                Add Service
              </button>
            </div>
            
            {servicesLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {artisanServices.length === 0 ? (
                  <p className="text-[var(--text-muted)] col-span-full text-center py-12">
                    You haven't listed any services yet. Click "Add Service" to get started!
                  </p>
                ) : (
                  artisanServices.map(service => (
                    <div key={service.id} className="bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl overflow-hidden group">
                      <div className="h-32 relative">
                        <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white">
                          {service.category_name}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-[var(--text)] mb-1">{service.title}</h4>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">{service.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[var(--accent)]">{service.price} MAD</span>
                          <button 
                            onClick={() => onAction?.(`Editing service ${service.title}...`)}
                            className="p-2 hover:bg-[var(--text)]/10 rounded-lg transition-colors"
                          >
                            <Settings size={14} className="text-[var(--text-muted)]" />
                          </button>
                        </div>
                      </div>
                    </div>
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
                  <div className="col-span-full text-center py-20 bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl">
                    <div className="w-16 h-16 bg-[var(--text)]/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Image className="text-[var(--text-muted)]" size={32} />
                    </div>
                    <p className="text-[var(--text-muted)]">No portfolio items yet. Show off your best work!</p>
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
          <div className="space-y-6">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full flex items-center justify-center mb-4">
                <Wallet size={32} />
              </div>
              <h3 className="text-[var(--text-muted)] mb-2">Available Balance</h3>
              <div className="text-5xl font-bold text-[var(--accent)] mb-6">{stats.earnings} <span className="text-2xl text-[var(--text-muted)]">MAD</span></div>
              <button 
                onClick={() => setShowWithdrawModal(true)}
                className="px-8 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
              >
                Withdraw Funds
              </button>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-[var(--text)]">Profile Settings</h3>
                  <p className="text-[var(--text-muted)]">Update your professional information.</p>
                </div>
                <div className="flex items-center gap-3 bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-4 py-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Status</span>
                    <span className={`text-xs font-bold ${artisanSettings.isOnline ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                      {artisanSettings.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <button 
                    onClick={async () => {
                      const newStatus = !artisanSettings.isOnline;
                      try {
                        const token = localStorage.getItem('m3allem_token');
                        const res = await fetch('/api/artisans/settings', {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ isOnline: newStatus ? 1 : 0 })
                        });
                        if (res.ok) {
                          setArtisanSettings(prev => ({ ...prev, isOnline: newStatus }));
                          onAction(`You are now ${newStatus ? 'online' : 'offline'}`);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className={`w-12 h-6 rounded-full relative transition-colors ${artisanSettings.isOnline ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`}
                  >
                    <motion.div 
                      animate={{ x: artisanSettings.isOnline ? 24 : 4 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="micro-label mb-2 block">Professional Bio</label>
                  <textarea 
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-4 focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text)] h-32"
                    placeholder="Tell clients about your experience and skills..."
                  />
                </div>
                <button 
                  onClick={() => onAction?.('Profile settings updated!')}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Coming soon</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card-bg)] border-r border-[var(--border)] transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
              <span className="text-[var(--accent-foreground)] font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--text)]">Artisan<span className="text-[var(--accent)]">Pro</span></span>
          </div>
          <button className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text)]" onClick={() => setIsMobileMenuOpen(false)}>
            <Menu size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems?.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg shadow-[var(--accent)]/20' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--text)]/5 hover:text-[var(--text)]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--border)]">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {activeTab !== 'dashboard' && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-lg flex items-center justify-center"
                title="Back to Dashboard"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <button className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text)]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold capitalize text-[var(--text)]">{activeTab.replace('-', ' ')}</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl px-3 py-1.5 md:px-4 md:py-2">
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Status</span>
                <span className={`text-[10px] md:text-xs font-bold ${artisanSettings.isOnline ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                  {artisanSettings.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <button 
                onClick={async () => {
                  const newStatus = !artisanSettings.isOnline;
                  try {
                    const token = localStorage.getItem('m3allem_token');
                    const res = await fetch('/api/artisans/settings', {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ isOnline: newStatus ? 1 : 0 })
                    });
                    if (res.ok) {
                      setArtisanSettings(prev => ({ ...prev, isOnline: newStatus }));
                      onAction(`You are now ${newStatus ? 'online' : 'offline'}`);
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className={`w-10 h-5 md:w-12 md:h-6 rounded-full relative transition-colors ${artisanSettings.isOnline ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`}
              >
                <motion.div 
                  animate={{ x: artisanSettings.isOnline ? (window.innerWidth < 768 ? 20 : 24) : 4 }}
                  className="absolute top-0.5 md:top-1 left-0 w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            <button 
              onClick={toggleTheme}
              className="p-3 rounded-full glass hover:scale-110 transition-all active:scale-95 shadow-lg flex items-center justify-center"
            >
              {isDarkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-blue-500" size={20} />}
            </button>
            {user && (
              <NotificationBell 
                userId={user.id} 
                onNotification={(n) => onAction(n.title)} 
              />
            )}
            <div className="w-10 h-10 rounded-full bg-[var(--text)]/10 border border-[var(--border)] overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Artisan'}&background=FFD700&color=000`} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
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
                    onChange={(e) => setNewPortfolioItem({...newPortfolioItem, title: e.target.value})}
                    placeholder="e.g. Modern Bathroom Renovation"
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Description</label>
                  <textarea 
                    value={newPortfolioItem.description}
                    onChange={(e) => setNewPortfolioItem({...newPortfolioItem, description: e.target.value})}
                    placeholder="Describe your work..."
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Image</label>
                    <div className="relative">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'image')}
                        className="hidden"
                        id="portfolio-image"
                      />
                      <label 
                        htmlFor="portfolio-image"
                        className="w-full flex flex-col items-center justify-center gap-2 bg-[var(--text)]/5 border border-dashed border-[var(--border)] rounded-2xl p-4 cursor-pointer hover:bg-[var(--text)]/10 transition-all"
                      >
                        {newPortfolioItem.imageUrl ? (
                          <img src={newPortfolioItem.imageUrl} className="w-full h-20 object-cover rounded-lg" />
                        ) : (
                          <>
                            <Image size={24} className="text-[var(--text-muted)]" />
                            <span className="text-[10px] font-bold text-[var(--text-muted)]">Upload Image</span>
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
                    onClick={handleAddPortfolioItem}
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
                        {aiSuggestion.minPrice} - {aiSuggestion.maxPrice} MAD
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
                    onChange={(e) => setNewService({...newService, title: e.target.value})}
                    placeholder="e.g. Professional House Painting"
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Category</label>
                  <select 
                    value={newService.categoryId}
                    onChange={(e) => setNewService({...newService, categoryId: e.target.value})}
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Price (MAD)</label>
                  <input 
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    placeholder="e.g. 150"
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Description</label>
                  <textarea 
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    placeholder="Describe your service in detail..."
                    rows={3}
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAddServiceModal(false)}
                    className="flex-1 px-6 py-4 bg-[var(--text)]/5 text-[var(--text)] rounded-2xl font-bold hover:bg-[var(--text)]/10 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddService}
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
                  <p className="text-2xl font-bold text-[var(--accent)]">{stats.earnings} MAD</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Amount to Withdraw (MAD)</label>
                  <input 
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl px-6 py-4 focus:outline-none focus:border-[var(--accent)] transition-colors text-lg font-bold"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 px-6 py-4 bg-[var(--text)]/5 text-[var(--text)] rounded-2xl font-bold hover:bg-[var(--text)]/10 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > stats.earnings}
                    className="flex-[2] px-6 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-[var(--accent)]/20"
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
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-[var(--text)]/5 rounded-2xl">
          {icon}
        </div>
      </div>
      <h3 className="text-[var(--text-muted)] text-sm font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold text-[var(--text)]">{value}</div>
    </div>
  );
}
