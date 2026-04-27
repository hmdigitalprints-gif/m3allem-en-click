import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Calendar, MapPin, Clock, ShieldCheck, Star, Zap, Upload, MessageSquare, Send, Bell, Video, Loader2, AlertCircle, ExternalLink, Play, Filter, CheckCircle2, Sparkles } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { Category, marketplaceService, bookingService, Booking } from '../../services/marketplaceService';


interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    if (isOpen) checkKey();
  }, [isOpen]);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const generateDemo = async () => {
    if (!hasApiKey) {
      handleOpenKeySelector();
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatus(t('demo_init'));

    try {
      const prompt = "A cinematic high-quality video showing a professional Moroccan artisan (M3allem) using a mobile app to find home service jobs. The artisan is smiling, wearing a professional uniform, and carrying a toolbox. The background shows a modern Moroccan home. High detail, vibrant colors, 4k.";
      
      let operation = await aiService.generateDemoVideo(prompt, '16:9');
      setStatus(t('demo_gen_wait'));

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await aiService.getVideosOperation(operation);
        
        // Update status based on progress if available
        if (operation.metadata?.progress) {
          setStatus(`${t('demo_gen_prog')}${Math.round(operation.metadata.progress)}%`);
        }
      }

      if (operation.error) {
        if (operation.error.message?.includes('Requested entity was not found')) {
          setHasApiKey(false);
          throw new Error(t('demo_err_invalid'));
        }
        throw new Error(operation.error.message || t('demo_err_failed'));
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const key = aiService.getApiKey();
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': key,
          },
        });
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      } else {
        throw new Error(t('demo_err_nourl'));
      }
    } catch (err: any) {
      console.error("Demo Generation Error:", err);
      setError(err.message || t('demo_err_unexp'));
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[var(--bg)]/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] overflow-hidden shadow-2xl"
            dir={i18n.dir()}
          >
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl flex items-center justify-center">
                <Video size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text)]">{t('demo_title')}</h3>
                <p className="text-sm text-[var(--text-muted)]">{t('demo_subtitle')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--bg)] rounded-full transition-colors text-[var(--text)]"
            >
              <X size={24} />
            </button>
          </div>

          <div className="aspect-video bg-black relative flex items-center justify-center">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            ) : loading ? (
              <div className="text-center p-8">
                <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mx-auto mb-4" />
                <p className="text-white font-medium text-lg mb-2">{status}</p>
                <p className="text-white/60 text-sm">{t('demo_ui_crafting')}</p>
              </div>
            ) : error ? (
              <div className="text-center p-8 max-w-md">
                <AlertCircle className="w-12 h-12 text-[var(--destructive)] mx-auto mb-4" />
                <p className="text-white font-medium text-lg mb-2">{t('demo_ui_fail')}</p>
                <p className="text-white/60 text-sm mb-6">{error}</p>
                <button
                  onClick={generateDemo}
                  className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-2 rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  {t('demo_btn_try')}
                </button>
              </div>
            ) : !hasApiKey ? (
              <div className="text-center p-8 max-w-md">
                <Video className="w-12 h-12 text-[var(--accent)] mx-auto mb-4 opacity-50" />
                <p className="text-white font-medium text-lg mb-2">{t('demo_ui_keyreq')}</p>
                <p className="text-white/60 text-sm mb-6">
                  {t('demo_ui_keydesc')}
                  <br />
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    {t('demo_ui_billing')} <ExternalLink size={12} className={i18n.dir() === 'rtl' ? 'mr-1' : 'ml-1'}/>
                  </a>
                </p>
                <button
                  onClick={handleOpenKeySelector}
                  className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[var(--accent)]/20"
                >
                  {t('demo_btn_selkey')}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={generateDemo}
                  className="group relative flex items-center justify-center mx-auto"
                >
                  <div className="absolute inset-0 bg-[var(--accent)] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative w-20 h-20 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play size={32} className={`fill-current ${i18n.dir() === 'rtl' ? 'mr-1' : 'ml-1'}`} />
                  </div>
                </button>
                <p className="text-white font-medium mt-6">{t('demo_ui_clickgen')}</p>
                <p className="text-white/60 text-sm mt-2">{t('demo_ui_powered')}</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-[var(--card-bg)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex ${i18n.dir() === 'rtl' ? 'space-x-2' : '-space-x-2'}`}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--card-bg)] bg-[var(--bg)] overflow-hidden">
                    <img src={`https://picsum.photos/seed/demo${i}/50/50`} alt="" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                {t('demo_ui_join')} <span className="text-[var(--text)]">12,000+</span> {t('demo_ui_viewers')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
              <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
              {t('demo_ui_live')}
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}


interface JobRequestModalProps {
  initialCategoryId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function JobRequestModal({ initialCategoryId, onClose, onSuccess }: JobRequestModalProps) {
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


interface ReviewModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ booking, onClose, onSuccess }: ReviewModalProps) {
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
          <img src={booking.other_party_avatar} className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover" alt="" referrerPolicy="no-referrer" />
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

