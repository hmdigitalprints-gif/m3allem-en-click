import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// List of RTL languages
export const RTL_LANGUAGES = ['ar'];

export const isRtl = (lng: string) => RTL_LANGUAGES.includes(lng?.split('-')[0]);

// Apply direction to HTML element and preserve consistency
export const applyDirection = (lng: string) => {
  const dir = isRtl(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  
  // Update class on body for CSS logical properties fallback if needed
  document.body.classList.remove('rtl', 'ltr');
  document.body.classList.add(dir);
  
  // Custom event for non-react components to react to direction changes
  window.dispatchEvent(new CustomEvent('directionChanged', { detail: { lng, dir } }));
};

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'ar'],
    load: 'languageOnly',
    debug: false,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}.json?v=1.0.2',
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      lookupCookie: 'm3allem_lang',
      lookupLocalStorage: 'm3allem_lang',
      caches: ['localStorage', 'cookie'],
      cookieOptions: { path: '/', sameSite: 'strict', maxAge: 31536000 }
    }
  });

// Apply direction on change
i18n.on('languageChanged', (lng) => {
  applyDirection(lng);
});

// Initial application once initialized
i18n.on('initialized', (options) => {
  applyDirection(i18n.language);
});

export default i18n;
