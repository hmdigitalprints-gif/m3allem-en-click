import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function ProfileCompletionBanner({ onComplete }: { onComplete?: () => void }) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [completion, setCompletion] = useState(100);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    let totalFields = 0;
    let filledFields = 0;

    const checkField = (val: any) => {
      totalFields++;
      if (val !== null && val !== undefined && val !== '') {
        filledFields++;
      }
    };

    if (user.role === 'client') {
      checkField(user.name);
      checkField(user.phone || user.email);
      checkField(user.city);
      checkField(user.address);
      checkField(user.avatar_url);
    } else if (user.role === 'artisan') {
      checkField(user.name);
      checkField(user.phone || user.email);
      checkField(user.city);
      checkField(user.address);
      checkField(user.avatar_url);
    } else if (user.role === 'seller' || user.role === 'company') {
      checkField(user.name);
      checkField(user.phone || user.email);
      checkField(user.city);
      checkField(user.address);
      checkField(user.avatar_url);
    }

    if (totalFields > 0) {
      setCompletion(Math.floor((filledFields / totalFields) * 100));
    }
  }, [user]);

  if (!user || completion >= 100 || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="mx-3 md:mx-6 mt-4 mb-2 bg-[var(--card-bg)] border-2 border-[var(--warning)] rounded-2xl p-4 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 h-1 bg-[var(--warning)]/20 w-full">
          <motion.div 
            className="h-full bg-[var(--warning)]" 
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-2 hover:bg-[var(--bg)] rounded-full text-[var(--text-muted)] transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--warning)]/10 text-[var(--warning)] rounded-xl mt-1 sm:mt-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--text)]">{t('profile_incomplete', 'Your profile is incomplete')}</h3>
              <p className="text-[var(--text-muted)] text-sm max-w-md">
                {t('profile_incomplete_desc', 'Complete your profile to unlock all features, build trust, and get the most out of your account.')}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-[var(--warning)]">{completion}% {t('completed', 'Completed')}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onComplete}
            className="bg-[var(--warning)] text-yellow-900 px-6 py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all whitespace-nowrap flex items-center gap-2 w-full sm:w-auto justify-center shadow-md shadow-[var(--warning)]/20 text-sm"
          >
            {t('complete_now', 'Complete Now')}
            <ArrowRight size={16} className={i18n.dir() === 'rtl' ? 'rotate-180' : ''} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
