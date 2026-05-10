import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'ar'],
    load: 'languageOnly',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}.json?v=' + new Date().getTime(),
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    }
  });

// Handle RTL/LTR
const applyRtl = (lng: string) => {
  if (!lng) return;
  // Fast path for Arabic to prevent flickering
  if (lng.startsWith('ar')) {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = lng;
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = lng;
  }
};

i18n.on('languageChanged', applyRtl);
i18n.on('initialized', () => applyRtl(i18n.language));

export default i18n;
