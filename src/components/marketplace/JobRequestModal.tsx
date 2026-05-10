import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Navigation, Sparkles, BrainCircuit, Plus, Filter } from 'lucide-react';
import { bookingService, marketplaceService, Category } from '../../services/marketplaceService';
import { aiService } from '../../services/aiService';

interface JobRequestModalProps {
  initialCategoryId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JobRequestModal({ initialCategoryId, onClose, onSuccess }: JobRequestModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    categoryId: initialCategoryId || '',
    serviceId: '',
    date: '',
    time: '',
    address: '',
    city: 'Casablanca',
    description: '',
    isUrgent: false,
    proposedPrice: '',
    attachments: [] as string[],
    location: { lat: 33.5731, lng: -7.5898 }
  });

  const [aiEstimate, setAiEstimate] = useState<{ min: number, max: number, suggested: number } | null>(null);
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    marketplaceService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      marketplaceService.getServicesByCategory(formData.categoryId).then(setServices);
    } else {
      setServices([]);
    }
  }, [formData.categoryId]);

  const handleGetAiEstimate = async () => {
    if (!formData.description || !formData.serviceId) return;
    const selectedService = services.find(s => s.id === formData.serviceId);
    if (!selectedService) return;

    setEstimating(true);
    try {
      const estimate = await aiService.getAutoEstimate(
        selectedService.title, 
        formData.description,
        formData.city,
        formData.isUrgent ? 'Urgent' : 'Normal'
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, URL.createObjectURL(files[0])]
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const scheduledAt = formData.isUrgent ? new Date().toISOString() : `${formData.date}T${formData.time}:00`;
      const res = await bookingService.createBooking({
        serviceId: formData.serviceId,
        scheduledAt,
        address: formData.address,
        city: formData.city,
        description: formData.description,
        isUrgent: formData.isUrgent,
        proposedPrice: formData.proposedPrice ? parseFloat(formData.proposedPrice) : undefined,
        attachments: formData.attachments,
        location: formData.location,
        deliveryMethod: 'home_service', // Default for open requests
        proofBeforeClient: 'photo' // Default
      });

      if (res.error) {
        setError(res.error);
      } else {
        setStep(2);
      }
    } catch (err) {
      setError('Failed to post job request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const selectedService = services.find(s => s.id === formData.serviceId);

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
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text)]">Post a Job Request</h2>
            <p className="text-[var(--text-muted)] text-sm">
              {step === 1 ? 'Describe what you need' : 'Request posted!'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--card-bg)]/10 rounded-full transition-colors">
            <X size={24} className="text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">Category</label>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" size={18} />
                  <select 
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value, serviceId: ''})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)] appearance-none"
                  >
                    <option value="">Select a category</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Service Selection */}
              {formData.categoryId && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">Service</label>
                  <div className="grid grid-cols-1 gap-3">
                    {services?.map(s => (
                      <button 
                        key={s.id}
                        onClick={() => setFormData({...formData, serviceId: s.id})}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${formData.serviceId === s.id ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]' : 'bg-[var(--card-bg)]/5 border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]/20'}`}
                      >
                        <span className="font-bold">{s.title}</span>
                        <span className="font-bold">{s.price} MAD</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => setFormData({...formData, isUrgent: false})}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs border transition-all ${!formData.isUrgent ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]' : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)]'}`}
                >
                  Scheduled
                </button>
                <button 
                  onClick={() => setFormData({...formData, isUrgent: true})}
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
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" size={18} />
                      <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)]" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" size={18} />
                      <input 
                        type="time" 
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)]" 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-4">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Proposed Price (Optional)</label>
                  {formData.description.length > 10 && formData.serviceId && (
                    <button
                      onClick={handleGetAiEstimate}
                      disabled={estimating}
                      className="flex items-center gap-2 text-[var(--accent)] text-[10px] font-bold hover:underline bg-[var(--accent)]/5 px-3 py-1 rounded-full border border-[var(--accent)]/20"
                    >
                      <Sparkles size={12} className={estimating ? "animate-pulse" : ""} />
                      {estimating ? "Estimating..." : "AI Estimate"}
                    </button>
                  )}
                </div>
                <input 
                  type="number" 
                  value={formData.proposedPrice}
                  onChange={(e) => setFormData({...formData, proposedPrice: e.target.value})}
                  placeholder="Set your own price..."
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)]" 
                />
                {aiEstimate && (
                  <div className="p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-2xl space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[var(--accent)] uppercase">AI Suggested</span>
                      <span className="text-sm font-bold text-[var(--accent)]">{aiEstimate.suggested} MAD</span>
                    </div>
                    <p className="text-[9px] text-[var(--text-muted)] italic">Range: {aiEstimate.min} - {aiEstimate.max} MAD</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">City</label>
                  <select 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)] appearance-none"
                  >
                    {['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Fes', 'Agadir']?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Address</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Street, Building..."
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)]" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your problem..."
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm h-32 resize-none text-[var(--text)]"
                />
              </div>

              {error && (
                <div className="p-4 bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-2xl text-[var(--destructive)] text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button 
                disabled={loading || !formData.serviceId || (!formData.isUrgent && (!formData.date || !formData.time)) || !formData.address}
                onClick={handleSubmit}
                className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post Job Request'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 bg-[var(--success)]/20 text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-3xl font-bold text-[var(--text)]">Request Posted!</h3>
              <p className="text-[var(--text-muted)] max-w-xs mx-auto">
                Artisans in your area have been notified. You'll receive notifications as soon as they submit proposals.
              </p>
              
              <div className="bg-[var(--card-bg)]/5 border border-[var(--border)] rounded-2xl p-6 text-left space-y-4">
                <h4 className="font-bold border-b border-[var(--border)] pb-2 text-[var(--text)]">What's Next?</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                    <p className="text-sm text-[var(--text-muted)]">Artisans review your request and location.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                    <p className="text-sm text-[var(--text-muted)]">They submit price proposals and comments.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                    <p className="text-sm text-[var(--text-muted)]">You choose the best proposal and confirm.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  onClose();
                  onSuccess();
                }}
                className="w-full py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all"
              >
                View My Requests
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
