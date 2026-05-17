import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Loader2, Video, AlertCircle, ExternalLink } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useTranslation } from 'react-i18next';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
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
          }
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
                    <img src={`https://picsum.photos/seed/demo${i}/50/50`} alt="" referrerPolicy="no-referrer" loading="lazy" />
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
