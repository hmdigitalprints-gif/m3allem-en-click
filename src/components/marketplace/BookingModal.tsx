import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, CreditCard, CheckCircle2, AlertCircle, Wallet, ShieldCheck, Banknote, ShoppingCart, Plus, MessageSquare, Navigation, Sparkles, BrainCircuit, Video, ChevronRight } from 'lucide-react';
import { AddressInput } from '../ui/AddressInput';
import { bookingService, Artisan } from '../../services/marketplaceService';
import { aiService } from '../../services/aiService';
import LiveDiagnostic from './LiveDiagnostic';

interface BookingModalProps {
  artisan: Artisan;
  isQuickBook?: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onAction?: (msg: string) => void;
}

const RECOMMENDED_MATERIALS: Record<string, any[]> = {
  'Plumbing': [
    { id: 'm1', name: 'PVC Pipes Set', price: 150, image: 'https://picsum.photos/seed/pipes/100/100' },
    { id: 'm2', name: 'Sealant Tape', price: 25, image: 'https://picsum.photos/seed/tape/100/100' },
    { id: 'm3', name: 'Bathroom Faucet', price: 450, image: 'https://picsum.photos/seed/faucet/100/100' }
  ],
  'Electrical': [
    { id: 'm4', name: 'Copper Wire 50m', price: 300, image: 'https://picsum.photos/seed/wire/100/100' },
    { id: 'm5', name: 'Circuit Breaker', price: 120, image: 'https://picsum.photos/seed/breaker/100/100' },
    { id: 'm6', name: 'LED Bulbs Pack', price: 80, image: 'https://picsum.photos/seed/led/100/100' }
  ],
  'Painting': [
    { id: 'm7', name: 'White Paint 20L', price: 400, image: 'https://picsum.photos/seed/paint/100/100' },
    { id: 'm8', name: 'Roller Set', price: 60, image: 'https://picsum.photos/seed/roller/100/100' },
    { id: 'm9', name: 'Masking Tape', price: 15, image: 'https://picsum.photos/seed/masking/100/100' }
  ]
};

export default function BookingModal({ artisan, isQuickBook, onClose, onSuccess, onAction }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [services, setServices] = useState<any[]>([]);
  
  const validateBookingField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'serviceId':
        if (!value) error = 'Please select a service';
        break;
      case 'date':
        if (!formData.isUrgent && !value) error = 'Please select a date';
        break;
      case 'time':
        if (!formData.isUrgent && !value) error = 'Please select a time';
        break;
      case 'city':
        if (!value) error = 'City is required';
        break;
      case 'address':
        if (!value.trim()) error = 'Address is required';
        else if (value.trim().length < 5) error = 'Address is too short';
        break;
      case 'description':
        if (!value.trim()) error = 'Description is required';
        else if (value.trim().length < 10) error = 'Please provide more details (min 10 chars)';
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
    address: '',
    city: 'Casablanca',
    description: '',
    paymentMethod: 'cash',
    deliveryMethod: 'home_service',
    proofBeforeClient: 'photo',
    isUrgent: false,
    proposedPrice: '',
    attachments: [] as string[],
    location: { lat: 33.5731, lng: -7.5898 }, // Default Casablanca
    usePoints: false
  });

  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    fetch('/api/auth/users/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}`
      }
    })
      .then(res => res.json())
      .then(data => setUserPoints(data.points || 0))
      .catch(err => console.error(err));
  }, []);

  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [aiEstimate, setAiEstimate] = useState<{ 
    minPrice: number, 
    maxPrice: number, 
    suggested: number,
    breakdown: string[],
    marketInsight: string
  } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [suggestingService, setSuggestingService] = useState(false);
  const [showLiveDiagnostic, setShowLiveDiagnostic] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('m3allem_user') || '{}');

  const handleGetAiEstimate = async () => {
    if (!formData.description || !selectedService) return;
    setEstimating(true);
    try {
      const estimate = await aiService.getAutoEstimate(
        selectedService.name, 
        formData.description,
        formData.city || artisan.city || 'Casablanca',
        formData.isUrgent ? 'Urgent' : 'Normal',
        artisan.category_id
      );
      if (estimate) {
        setAiEstimate(estimate);
        setFormData(prev => ({ ...prev, proposedPrice: estimate.suggested.toString() }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEstimating(false);
    }
  };

  const handleSuggestService = async () => {
    if (!formData.description || services.length === 0) return;
    setSuggestingService(true);
    try {
      const serviceId = await aiService.matchServiceFromArtisan(formData.description, services);
      if (serviceId) {
        setFormData(prev => ({ ...prev, serviceId }));
        onAction?.('AI matched the best service for your problem!');
      } else {
        onAction?.('AI could not find a perfect match. Please select manually.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestingService(false);
    }
  };

  useEffect(() => {
    // Fetch services for this artisan's category
    fetch(`/api/marketplace/artisans/${artisan.id}`)
      .then(res => res.json())
      .then(data => {
        const artisanServices = data.services || [];
        setServices(artisanServices);
        
        if (isQuickBook && artisanServices.length > 0) {
          setFormData(prev => ({
            ...prev,
            serviceId: artisanServices[0].id,
            isUrgent: true,
            description: 'Quick Booking - Needs immediate assistance (Auto-generated)',
            paymentMethod: 'cash'
          }));
          setStep(2); // Jump to payment confirm
        }
      });
  }, [artisan.id, isQuickBook]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Mock upload: just add a placeholder URL
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, URL.createObjectURL(files[0])]
      }));
    }
  };

  const handleBooking = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    setError(null);
    try {
      const scheduledAt = formData.isUrgent ? new Date().toISOString() : `${formData.date}T${formData.time}:00`;
      const res = await bookingService.createBooking({
        artisanId: artisan.id,
        serviceId: formData.serviceId,
        scheduledAt,
        address: formData.address,
        city: formData.city,
        description: formData.description,
        isUrgent: formData.isUrgent,
        proposedPrice: formData.proposedPrice ? parseFloat(formData.proposedPrice) : undefined,
        attachments: formData.attachments,
        location: formData.location,
        usePoints: formData.usePoints,
        paymentMethod: formData.paymentMethod,
        deliveryMethod: formData.deliveryMethod,
        proofBeforeClient: formData.proofBeforeClient
      });

      if (res.error) {
        setError(res.error);
      } else {
        setStep(4);
      }
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === formData.serviceId);
  const categoryMaterials = RECOMMENDED_MATERIALS[artisan.category_name] || RECOMMENDED_MATERIALS['Plumbing'];

  const toggleMaterial = (id: string) => {
    setSelectedMaterials(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-[var(--bg)]/80 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-xl bg-[var(--bg)] border border-[var(--border)] rounded-[40px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-[var(--border)] flex justify-between items-center bg-[var(--card-bg)]/5 shrink-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text)]">Book {artisan.name.split(' ')[0]}</h2>
            <p className="text-[var(--text-muted)] text-sm">
              {step === 1 ? 'Select service details' : 
               step === 2 ? 'Confirm pricing & payment' : 
               step === 3 ? 'Recommended materials' : 'Booking confirmed'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--card-bg)]/10 rounded-full transition-colors">
            <X size={24} className="text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-6">
              {/* Live Diagnostic Banner */}
              <button 
                onClick={() => setShowLiveDiagnostic(true)}
                className="w-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-2xl flex items-center justify-between hover:bg-[var(--accent)]/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-[var(--accent)]">Live Diagnostic</h4>
                    <p className="text-xs text-[var(--text-muted)]">Video call for instant assessment</p>
                  </div>
                </div>
                <ChevronRight className="text-[var(--accent)]" size={20} />
              </button>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">Select Service</label>
                <div className="grid grid-cols-1 gap-3">
                  {services?.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => {
                        setFormData({...formData, serviceId: s.id});
                        validateBookingField('serviceId', s.id);
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${formData.serviceId === s.id ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]' : fieldErrors.serviceId ? 'border-rose-500/50 bg-rose-500/5' : 'bg-[var(--card-bg)]/5 border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]/20'}`}
                    >
                      <span className="font-bold">{s.name}</span>
                      <span className="font-bold">{s.base_price} MAD</span>
                    </button>
                  ))}
                </div>
                {fieldErrors.serviceId && <p className="text-rose-500 text-[10px] font-bold ml-4">{fieldErrors.serviceId}</p>}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setFormData({...formData, isUrgent: false});
                    setFieldErrors(prev => ({ ...prev, date: '', time: '' }));
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs border transition-all ${!formData.isUrgent ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)]'}`}
                >
                  Scheduled
                </button>
                <button 
                  onClick={() => {
                    setFormData({...formData, isUrgent: true});
                    setFieldErrors(prev => ({ ...prev, date: '', time: '' }));
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs border transition-all ${formData.isUrgent ? 'bg-[var(--destructive)] text-white border-[var(--destructive)]' : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)]'}`}
                >
                  Urgent (ASAP)
                </button>
              </div>

              {!formData.isUrgent && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Date</label>
                    <div className="relative">
                      <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.date ? 'text-rose-500' : 'text-[var(--text-muted)] opacity-50'}`} size={18} />
                      <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => {
                          setFormData({...formData, date: e.target.value});
                          validateBookingField('date', e.target.value);
                        }}
                        className={`w-full bg-[var(--bg)] border rounded-2xl py-4 pl-12 pr-4 focus:outline-none transition-all text-sm text-[var(--text)] ${fieldErrors.date ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]/50'}`} 
                      />
                    </div>
                    {fieldErrors.date && <p className="text-rose-500 text-[10px] font-bold ml-4">{fieldErrors.date}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Time</label>
                    <div className="relative">
                      <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.time ? 'text-rose-500' : 'text-[var(--text-muted)] opacity-50'}`} size={18} />
                      <input 
                        type="time" 
                        value={formData.time}
                        onChange={(e) => {
                          setFormData({...formData, time: e.target.value});
                          validateBookingField('time', e.target.value);
                        }}
                        className={`w-full bg-[var(--bg)] border rounded-2xl py-4 pl-12 pr-4 focus:outline-none transition-all text-sm text-[var(--text)] ${fieldErrors.time ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]/50'}`} 
                      />
                    </div>
                    {fieldErrors.time && <p className="text-rose-500 text-[10px] font-bold ml-4">{fieldErrors.time}</p>}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-4">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Proposed Price (Optional)</label>
                  {formData.description.length > 10 && selectedService && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleGetAiEstimate}
                      disabled={estimating}
                      className="flex items-center gap-2 text-[var(--accent)] text-[10px] font-bold hover:underline bg-[var(--accent)]/5 px-3 py-1 rounded-full border border-[var(--accent)]/20"
                    >
                      <Sparkles size={12} className={estimating ? "animate-pulse" : ""} />
                      {estimating ? "Estimating..." : "AI Estimate"}
                    </motion.button>
                  )}
                </div>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" size={18} />
                  <input 
                    type="number" 
                    value={formData.proposedPrice}
                    onChange={(e) => setFormData({...formData, proposedPrice: e.target.value})}
                    placeholder="Set your own price or negotiate..."
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)]" 
                  />
                </div>

                {aiEstimate && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-2xl space-y-3 mt-2"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider">
                        <BrainCircuit size={14} />
                        AI Dynamic Pricing
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold mr-2">Suggested:</span>
                        <span className="text-sm font-bold text-[var(--accent)]">{aiEstimate.suggested} MAD</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-[var(--accent)]/10 pb-2">
                      <p className="text-xs font-bold text-[var(--text)]">{aiEstimate.minPrice} - {aiEstimate.maxPrice} MAD</p>
                      <p className="text-[9px] text-[var(--text-muted)] italic">Based on demand & history</p>
                    </div>

                    {aiEstimate.marketInsight && (
                      <p className="text-[10px] text-[var(--accent)] font-medium leading-relaxed">
                        <span className="opacity-70">Insight:</span> {aiEstimate.marketInsight}
                      </p>
                    )}

                    {aiEstimate.breakdown && aiEstimate.breakdown.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Estimate Breakdown:</p>
                        <div className="flex flex-wrap gap-1">
                          {aiEstimate.breakdown.map((item, idx) => (
                            <span key={idx} className="text-[9px] px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              <AddressInput 
                city={formData.city}
                address={formData.address}
                onCityChange={(city) => {
                  setFormData({...formData, city});
                  if (fieldErrors.city) validateBookingField('city', city);
                }}
                onAddressChange={(address) => {
                  setFormData({...formData, address});
                  if (fieldErrors.address) validateBookingField('address', address);
                }}
                error={fieldErrors.address || fieldErrors.city}
              />

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Problem Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({...formData, description: e.target.value});
                    if (fieldErrors.description) validateBookingField('description', e.target.value);
                  }}
                  onBlur={(e) => validateBookingField('description', e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className={`w-full bg-[var(--bg)] border rounded-2xl py-4 px-6 focus:outline-none transition-all text-sm h-32 resize-none text-[var(--text)] ${fieldErrors.description ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border)] focus:border-[var(--accent)]/50'}`}
                />
                {fieldErrors.description && <p className="text-rose-500 text-[10px] font-bold ml-4">{fieldErrors.description}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.description.length > 10 && services.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleSuggestService}
                      disabled={suggestingService}
                      className="flex items-center gap-2 text-[var(--accent)] text-xs font-bold hover:underline bg-[var(--accent)]/5 px-4 py-2 rounded-full border border-[var(--accent)]/20"
                    >
                      <BrainCircuit size={14} className={suggestingService ? "animate-pulse" : ""} />
                      {suggestingService ? "Matching service..." : "AI: Match Service"}
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Photos / Videos (Optional)</label>
                <div className="flex flex-wrap gap-3">
                  {formData?.attachments?.map((url, i) => (
                    <div key={i} className="w-20 h-20 rounded-xl border border-[var(--border)] overflow-hidden relative group">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[var(--accent)]/50 transition-all text-[var(--text-muted)]">
                    <Plus size={20} />
                    <span className="text-[8px] font-bold uppercase">Add</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                  </label>
                </div>
              </div>

              <button 
                onClick={() => {
                  const errors: Record<string, string> = {};
                  if (!formData.serviceId) errors.serviceId = 'Please select a service';
                  if (!formData.isUrgent && !formData.date) errors.date = 'Date is required';
                  if (!formData.isUrgent && !formData.time) errors.time = 'Time is required';
                  if (!formData.city) errors.city = 'City is required';
                  if (!formData.address.trim()) errors.address = 'Address is required';
                  if (!formData.description.trim()) errors.description = 'Description is required';
                  
                  setFieldErrors(errors);
                  if (Object.keys(errors).length === 0) {
                    setStep(2);
                  }
                }}
                className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all active:scale-95"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-lg border-b border-[var(--border)] pb-4 text-[var(--text)]">Order Summary</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)]">Service: {selectedService?.name}</span>
                  <span className="font-bold text-[var(--text)]">{selectedService?.base_price} MAD</span>
                </div>
                
                {userPoints > 0 && (
                  <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles size={18} className="text-[var(--accent)]" />
                      <div>
                        <p className="text-xs font-bold text-[var(--accent)]">Loyalty Points</p>
                        <p className="text-[10px] text-[var(--text-muted)]">You have {userPoints} points</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFormData({...formData, usePoints: !formData.usePoints})}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${formData.usePoints ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card-bg)]/10 text-[var(--text-muted)] border border-[var(--border)]'}`}
                    >
                      {formData.usePoints ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                )}

                {formData.usePoints && (
                  <div className="flex justify-between items-center text-sm text-[var(--success)]">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      Loyalty Discount
                    </span>
                    <span className="font-bold">
                      -{Math.min(userPoints / 10, (selectedService?.base_price || 0) * 0.5)} MAD
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)]">Platform Fee (5%)</span>
                  <span className="font-bold text-[var(--text)]">{selectedService ? Math.round(selectedService.base_price * 0.05) : 0} MAD</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
                  <span className="font-bold text-lg text-[var(--text)]">Total</span>
                  <span className="font-bold text-xl text-[var(--accent)]">
                    {selectedService ? Math.round(
                      (selectedService.base_price - (formData.usePoints ? Math.min(userPoints / 10, selectedService.base_price * 0.5) : 0)) * 1.05
                    ) : 0} MAD
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">Payment Method</label>
                
                <button 
                  onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${formData.paymentMethod === 'card' ? 'bg-[var(--accent)]/10 border-[var(--accent)]' : 'bg-[var(--card-bg)]/5 border-[var(--border)] hover:border-[var(--border)]/20'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.paymentMethod === 'card' ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card-bg)]/10 text-[var(--text)]'}`}>
                    <CreditCard size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-[var(--text)]">Credit / Debit Card</h4>
                    <p className="text-xs text-[var(--text-muted)]">Visa, Mastercard, CMI</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'card' ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
                    {formData.paymentMethod === 'card' && <div className="w-3 h-3 bg-[var(--accent)] rounded-full" />}
                  </div>
                </button>

                <button 
                  onClick={() => setFormData({...formData, paymentMethod: 'wallet'})}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${formData.paymentMethod === 'wallet' ? 'bg-[var(--accent)]/10 border-[var(--accent)]' : 'bg-[var(--card-bg)]/5 border-[var(--border)] hover:border-[var(--border)]/20'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.paymentMethod === 'wallet' ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card-bg)]/10 text-[var(--text)]'}`}>
                    <Wallet size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-[var(--text)]">M3allem Wallet</h4>
                    <p className="text-xs text-[var(--text-muted)]">Pay using your app balance</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'wallet' ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
                    {formData.paymentMethod === 'wallet' && <div className="w-3 h-3 bg-[var(--accent)] rounded-full" />}
                  </div>
                </button>

                <button 
                  onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${formData.paymentMethod === 'cash' ? 'bg-[var(--accent)]/10 border-[var(--accent)]' : 'bg-[var(--card-bg)]/5 border-[var(--border)] hover:border-[var(--border)]/20'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.paymentMethod === 'cash' ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card-bg)]/10 text-[var(--text)]'}`}>
                    <Banknote size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-[var(--text)]">Cash on Delivery</h4>
                    <p className="text-xs text-[var(--text-muted)]">Pay directly to artisan</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'cash' ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
                    {formData.paymentMethod === 'cash' && <div className="w-3 h-3 bg-[var(--accent)] rounded-full" />}
                  </div>
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-[var(--card-bg)]/5 text-[var(--text)] py-4 rounded-2xl font-bold hover:bg-[var(--card-bg)]/10 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="flex-[2] bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold text-lg hover:bg-[var(--accent)]/90 transition-all active:scale-95"
                >
                  Confirm & Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-[var(--text)]">Need Materials?</h3>
                <p className="text-[var(--text-muted)] text-sm">
                  We recommend these materials for your {selectedService?.name}. Order now and have them delivered before the artisan arrives.
                </p>
              </div>

              <div className="space-y-4">
                {categoryMaterials?.map(material => (
                  <div key={material.id} className="flex items-center gap-4 p-4 bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-2xl">
                    <img src={material.image} alt={material.name} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-[var(--text)]">{material.name}</h4>
                      <p className="text-[var(--accent)] font-bold text-sm">{material.price} MAD</p>
                    </div>
                    <button 
                      onClick={() => toggleMaterial(material.id)}
                      className={`p-3 rounded-xl transition-colors ${selectedMaterials.includes(material.id) ? 'bg-[var(--success)] text-white' : 'bg-[var(--card-bg)]/10 text-[var(--text)] hover:bg-[var(--card-bg)]/20'}`}
                    >
                      {selectedMaterials.includes(material.id) ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                    </button>
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-4 bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-2xl text-[var(--destructive)] text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={loading}
                  className="flex-1 bg-[var(--card-bg)]/5 text-[var(--text)] py-4 rounded-2xl font-bold hover:bg-[var(--card-bg)]/10 transition-all text-sm"
                >
                  Skip Materials
                </button>
                <button 
                  disabled={loading}
                  onClick={() => setShowConfirmDialog(true)}
                  className="flex-[2] bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold text-lg hover:bg-[var(--accent)]/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : `Book & Add ${selectedMaterials.length} Items`}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden border border-[var(--border)] mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" 
                  className="w-full h-full object-cover opacity-60" 
                  alt="Map" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] to-transparent" />
                
                {/* User Location Marker */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="w-4 h-4 bg-[var(--accent)] rounded-full shadow-[0_0_15px_rgba(255,215,0,0.5)] border-2 border-[var(--bg)] relative z-10" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--accent)]/20 rounded-full animate-ping" />
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[var(--bg)]/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap text-[var(--text)]">
                    Your Location
                  </div>
                </motion.div>

                {/* Artisan Location Marker */}
                <motion.div 
                  initial={{ opacity: 0, x: -50, y: 50 }}
                  animate={{ opacity: 1, x: -20, y: 20 }}
                  transition={{ delay: 1, duration: 2, ease: "easeOut" }}
                  className="absolute top-1/3 left-1/4"
                >
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-full border-2 border-[var(--accent)] overflow-hidden bg-[var(--bg)] shadow-lg">
                      <img src={artisan.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" alt={artisan.name} referrerPolicy="no-referrer" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-[var(--success)] w-3 h-3 rounded-full border-2 border-[var(--bg)]" />
                  </div>
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[var(--bg)]/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap flex items-center gap-1 text-[var(--text)]">
                    <Navigation size={10} className="text-[var(--accent)]" />
                    On the way
                  </div>
                </motion.div>

                {/* Route Line (Mock) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.5))' }}>
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1, duration: 2, ease: "easeOut" }}
                    d="M 25% 33% Q 45% 60% 70% 50%" 
                    fill="none" 
                    stroke="var(--accent)" 
                    strokeWidth="3" 
                    strokeDasharray="6 6"
                  />
                </svg>
              </div>

              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-16 h-16 bg-[var(--success)]/20 text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-2"
              >
                <CheckCircle2 size={32} />
              </motion.div>
              <h3 className="text-2xl font-bold text-[var(--text)]">Booking Confirmed!</h3>
              <p className="text-[var(--text-muted)] max-w-xs mx-auto text-sm">
                {artisan.name.split(' ')[0]} has been notified and is getting ready.
                {selectedMaterials.length > 0 && " Your materials order has also been placed."}
              </p>
              
              <div className="bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between text-left mt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--border)]">
                    <img src={artisan.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" alt={artisan.name} referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text)]">{artisan.name}</h4>
                    <p className="text-xs text-[var(--success)] font-medium">Estimated arrival: 25 mins</p>
                  </div>
                </div>
                <button className="w-10 h-10 bg-[var(--card-bg)]/10 rounded-full flex items-center justify-center text-[var(--text)] hover:bg-[var(--card-bg)]/20 transition-colors">
                  <MessageSquare size={16} />
                </button>
              </div>

              <div className="bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-2xl p-6 text-left space-y-4">
                <h4 className="font-bold border-b border-[var(--border)] pb-2 text-[var(--text)]">Booking Status</h4>
                <div className="relative pt-4 pb-2">
                  <div className="absolute top-6 left-4 right-4 h-1 bg-[var(--card-bg)]/10 rounded-full" />
                  <div className="absolute top-6 left-4 w-1/3 h-1 bg-[var(--accent)] rounded-full" />
                  
                  <div className="flex justify-between relative z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center">
                        <CheckCircle2 size={14} />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--accent)]">Pending</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center">
                        <div className="w-2 h-2 bg-[var(--accent-foreground)] rounded-full animate-pulse" />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--accent)]">Accepted</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--card-bg)]/10 text-[var(--text-muted)] flex items-center justify-center">
                        <Navigation size={12} />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">On the Way</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--card-bg)]/10 text-[var(--text-muted)] flex items-center justify-center">
                        <CheckCircle2 size={14} />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">Completed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-2xl p-6 text-left space-y-4">
                <h4 className="font-bold border-b border-[var(--border)] pb-2 text-[var(--text)]">Service Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[var(--text-muted)] block text-xs mb-1">Service</span>
                    <span className="font-medium text-[var(--text)]">{selectedService?.name || artisan.category_name}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-xs mb-1">Date & Time</span>
                    <span className="font-medium text-[var(--text)]">{formData.date} at {formData.time}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[var(--text-muted)] block text-xs mb-1">Address</span>
                    <span className="font-medium text-[var(--text)]">{formData.address}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-2xl p-6 text-left space-y-4">
                <h4 className="font-bold border-b border-[var(--border)] pb-2 text-[var(--text)]">Payment Method</h4>
                <p className="text-xs text-[var(--text-muted)]">You can update your preferred payment method before the artisan arrives.</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setFormData({...formData, paymentMethod: 'escrow'})}
                    className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${formData.paymentMethod === 'escrow' ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card-bg)]/10 text-[var(--text)] hover:bg-[var(--card-bg)]/20'}`}
                  >
                    <ShieldCheck size={16} />
                    Escrow
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, paymentMethod: 'wallet'})}
                    className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${formData.paymentMethod === 'wallet' ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card-bg)]/10 text-[var(--text)] hover:bg-[var(--card-bg)]/20'}`}
                  >
                    <Wallet size={16} />
                    Wallet
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                    className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${formData.paymentMethod === 'cash' ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card-bg)]/10 text-[var(--text)] hover:bg-[var(--card-bg)]/20'}`}
                  >
                    <Banknote size={16} />
                    Cash
                  </button>
                </div>
              </div>

              <button 
                onClick={() => {
                  onClose();
                  onSuccess();
                }}
                className="w-full mt-4 py-4 bg-[var(--card-bg)]/10 text-[var(--text)] rounded-2xl font-bold hover:bg-[var(--card-bg)]/20 transition-all text-sm"
              >
                View My Bookings
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-sm:max-w-xs max-w-sm bg-[var(--bg)] border border-[var(--border)] rounded-[32px] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">Confirm Booking</h3>
              <p className="text-[var(--text-muted)] text-sm mb-8 leading-relaxed">
                Are you sure you want to book <span className="text-[var(--text)] font-bold">{artisan.name}</span> for this service? 
                The artisan will be notified immediately.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleBooking}
                  className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95"
                >
                  Yes, Confirm Booking
                </button>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="w-full bg-[var(--card-bg)]/5 text-[var(--text-muted)] py-4 rounded-2xl font-bold hover:bg-[var(--card-bg)]/10 transition-all"
                >
                  No, Go Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLiveDiagnostic && (
          <LiveDiagnostic 
            userId={currentUser.id}
            userName={currentUser.name}
            targetUserId={artisan.user_id}
            targetUserName={artisan.name}
            isArtisan={false}
            onClose={() => setShowLiveDiagnostic(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
