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
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/api/translations/{{lng}}',
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

// Handle RTL/LTR
i18n.on('languageChanged', (lng) => {
  fetch(`/api/languages`)
    .then(res => res.json())
    .then(languages => {
      const lang = languages.find((l: any) => l.code === lng);
      if (lang) {
        document.documentElement.dir = lang.is_rtl ? 'rtl' : 'ltr';
        document.documentElement.lang = lng;
      }
    });
});

export default i18n;
