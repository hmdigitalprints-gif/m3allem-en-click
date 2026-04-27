import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRtl: true },
  { code: 'fr', name: 'French', nativeName: 'Français', isRtl: false },
  { code: 'en', name: 'English', nativeName: 'English', isRtl: false }
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguageCode = i18n.language ? i18n.language.split('-')[0] : 'en';
  const currentLanguage = languages.find(l => l.code === currentLanguageCode) || languages[2];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--accent)]/10 transition-colors text-sm font-medium text-[var(--text)]"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute end-0 mt-2 w-48 bg-[var(--card-bg)] rounded-xl shadow-xl border border-[var(--border)] py-2 z-50"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-start px-4 py-2 text-sm hover:bg-[var(--accent)]/10 transition-colors flex items-center justify-between ${
                  currentLanguageCode === lang.code ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text-muted)]'
                }`}
              >
                <span>{lang.nativeName}</span>
                {currentLanguageCode === lang.code && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
