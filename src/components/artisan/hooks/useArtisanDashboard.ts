import { useState, useEffect, useCallback } from 'react';
import { socket, connectSocket } from '../../../services/socket';
import { Booking } from '../../../services/marketplaceService';
import { aiService } from '../../../services/aiService';
import { useTranslation } from 'react-i18next';

export function useArtisanDashboard(user: any, onAction: (msg: string) => void) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [personalInfo, setPersonalInfo] = useState({ name: user?.name || '', phone: user?.phone || '' });
  
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
  const [categories, setCategories] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  
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

  const fetchNearbyJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings/nearby', { 
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setNearbyJobs(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      connectSocket();
      
      socket.on('new_job_available', (data: any) => {
        if (!data) return;
        const urgentTag = data.isUrgent ? ' [URGENT]' : '';
        const details = `${data.serviceTitle} for ${data.clientName}${data.city ? ` in ${data.city}` : ''}`;
        onAction(`New job request available${urgentTag}: ${details}`);
        fetchNearbyJobs();
      });

      fetch('/api/artisans/me', { 
        credentials: 'include'
      })
      .then(async res => {
        if (!res.ok) throw new Error(`Failed to fetch artisan data: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setArtisanId(data.id);
        setArtisanSettings(prev => ({
          ...prev,
          isOnline: data.is_online || data.isOnline || false,
          serviceRadius: data.serviceRadius || data.service_radius || 10,
          preferredCities: data.preferred_cities ? (typeof data.preferred_cities === 'string' ? JSON.parse(data.preferred_cities) : data.preferred_cities) : (data.preferredCities || []),
          workingHours: data.working_hours ? (typeof data.working_hours === 'string' ? JSON.parse(data.working_hours) : data.working_hours) : (data.workingHours || prev.workingHours),
          bio: data.bio || '',
          expertise: data.expertise || '',
          yearsExperience: data.years_experience || data.yearsExperience || 0,
          certifications: data.certifications || ''
        }));
      })
      .catch(err => console.error("Error fetching artisan profile:", err));
    }
    return () => {
      socket.off('new_job_available');
      socket.disconnect();
    };
  }, [user?.id, onAction, fetchNearbyJobs]);

  useEffect(() => {
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
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [bookings, watchId, artisanId]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const fetchOptions = {
        credentials: 'include' as const
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
        const pending = data.filter((b: any) => b.status === 'pending').length;
        const active = data.filter((b: any) => b.status === 'accepted' || b.status === 'ongoing').length;
        const completed = data.filter((b: any) => b.status === 'completed').length;
        const earnings = data.filter((b: any) => b.status === 'completed').reduce((sum: number, b: any) => sum + (Number(b.price) || 0), 0);
        
        setStats({
          pendingRequests: pending,
          activeJobs: active,
          completedJobs: completed,
          earnings: earnings,
          rating: 4.8
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
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, { 
        credentials: 'include', 
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        if (newStatus === 'completed') {
          setCompletingBookingId(bookingId);
          setTimeout(() => {
            setBookings(prev => prev?.map(b => {
              if (b.id === bookingId) {
                const updated: Booking = { ...b, status: newStatus };
                updated.finished_at = new Date().toISOString();
                return updated;
              }
              return b;
            }));
            setCompletingBookingId(null);
            onAction?.('Task completed! Great job.');
          }, 1500);
        } else {
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

  const handleStatusToggle = async () => {
    const newStatus = !artisanSettings.isOnline;
    try {
      const res = await fetch('/api/artisans/settings', { 
        credentials: 'include', 
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
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
  };

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

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/artisans/settings', { 
        credentials: 'include', 
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
          },
        body: JSON.stringify({
          serviceRadius: artisanSettings.serviceRadius,
          preferredCities: artisanSettings.preferredCities,
          workingHours: artisanSettings.workingHours,
          expertise: artisanSettings.expertise,
          yearsExperience: artisanSettings.yearsExperience,
          certifications: artisanSettings.certifications
        })
      });
      if (res.ok) {
        onAction(t('settings_saved_msg', 'Settings saved successfully!'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    activeTab, setActiveTab,
    isMobileMenuOpen, setIsMobileMenuOpen,
    stats, setStats,
    nearbyJobs, setNearbyJobs,
    bookings, setBookings,
    completingBookingId, setCompletingBookingId,
    artisanServices, setArtisanServices,
    loading, setLoading,
    servicesLoading, setServicesLoading,
    currentTime, setCurrentTime,
    artisanId, setArtisanId,
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
    fetchDashboardData,
    handleStatusToggle,
    validateProfileField,
    validateServiceField,
    validateWithdrawField,
    handleSaveSettings
  };
}

export function useArtisanModals(onAction: (msg: string) => void, fetchNearbyJobs: () => void, setPortfolio: React.Dispatch<React.SetStateAction<any[]>>, setArtisanServices: React.Dispatch<React.SetStateAction<any[]>>, categories: any[], stats: any, setStats: React.Dispatch<React.SetStateAction<any>>, setTransactions: React.Dispatch<React.SetStateAction<any[]>>) {
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddPortfolioModal, setShowAddPortfolioModal] = useState(false);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [proposedPrice, setProposedPrice] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [suggesting, setSuggesting] = useState(false);
  
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

  const handlePropose = async (job: any) => {
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
          'Content-Type': 'application/json'
          },
        body: JSON.stringify({ price: parseFloat(proposedPrice) })
      });
      if (res.ok) {
        onAction('Proposal submitted successfully!');
        setShowProposeModal(false);
        fetchNearbyJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

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
            'Content-Type': 'application/json'
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
        method: 'DELETE'
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
          'Content-Type': 'application/json'
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
    if (parseFloat(withdrawAmount) > (stats.earnings || 0)) {
      onAction('Insufficient balance.');
      return;
    }

    try {
      const res = await fetch('/api/artisans/withdraw', { 
        credentials: 'include', 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount) })
      });

      if (res.ok) {
        const data = await res.json();
        setStats((prev: any) => ({ ...prev, earnings: prev.earnings - parseFloat(withdrawAmount) }));
        setTransactions((prev: any[]) => [data.transaction, ...prev]);
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
        method: 'DELETE'
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

  return {
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
  };
}
