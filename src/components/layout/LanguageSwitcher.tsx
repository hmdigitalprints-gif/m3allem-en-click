import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18nInstance from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRtl: true },
  { code: 'fr', name: 'French', nativeName: 'Français', isRtl: false },
  { code: 'en', name: 'English', nativeName: 'English', isRtl: false }
];

export const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const i18n = i18nInstance;
  const { user, updateLanguage } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguageCode = i18n.language ? i18n.language.split('-')[0] : 'en';
  const currentLanguage = languages.find(l => l.code === currentLanguageCode) || languages[2];

  const handleLanguageChange = async (code: string) => {
    if (code === currentLanguageCode) {
      setIsOpen(false);
      return;
    }

    try {
      // 1. Change i18next language
      await i18n.changeLanguage(code);
      
      // 2. Persist in various places
      localStorage.setItem('m3allem_lang', code);
      localStorage.setItem('i18nextLng', code);
      // Setting cookie specifically for SSR/Full-stack scenarios if needed
      document.cookie = `m3allem_lang=${code}; path=/; max-age=31536000; SameSite=Strict`;
      
      // 3. Update server if authenticated
      if (user) {
        await updateLanguage(code);
      }
      
      // 4. Force a small re-render cycle if needed (though i18n handles it)
      window.dispatchEvent(new Event('resize')); // Trigger some resize observers if they depend on direction
      
    } catch (error) {
      console.error('Failed to update language:', error);
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--card-bg)]/50 border border-[var(--border)] hover:bg-[var(--accent)]/10 transition-all duration-300 text-sm font-bold text-[var(--text)] group"
      >
        <Globe className="w-4 h-4 text-[var(--accent)] group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <span className="sm:hidden uppercase">{currentLanguage.code}</span>
        <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute end-0 mt-3 w-44 bg-[var(--card-bg)] rounded-2xl shadow-2xl border border-[var(--border)] py-2 z-50 overflow-hidden"
            >
              <div className="px-3 py-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  {t('profile_lbl_language', 'Language')}
                </span>
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-4 py-2.5 text-sm transition-all flex items-center justify-between group ${
                    currentLanguageCode === lang.code 
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-bold' 
                      : 'text-[var(--text)] hover:bg-[var(--text)]/5'
                  }`}
                >
                  <div className="flex flex-col items-start translate-x-0 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1">
                    <span className="text-sm">{lang.nativeName}</span>
                    <span className="text-[10px] font-medium opacity-60">{lang.name}</span>
                  </div>
                  {currentLanguageCode === lang.code && (
                    <Check size={14} className="text-[var(--accent)]" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
