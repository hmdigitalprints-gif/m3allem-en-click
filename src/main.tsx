import { StrictMode, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { Buffer } from 'buffer';

// Polyfills for simple-peer
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  window.global = window.global || window;
  if (!window.process) {
    (window as any).process = { env: {} };
  }
  if (!window.process.nextTick) {
    window.process.nextTick = (cb: Function) => setTimeout(cb, 0);
  }
}

import App from './App.tsx';
import './index.css';
import i18n from './i18n.ts';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Loader2 } from 'lucide-react';

const supportedLngs = ['en', 'fr', 'ar'];

const RouteHreflangSync = () => {
  const location = useLocation();

  useEffect(() => {
    try {
      const origin = window.location.origin;
      let path = location.pathname;

      supportedLngs.forEach((suppLng) => {
        let link = document.querySelector(`link[hreflang="${suppLng}"]`);
        if (!link) {
          link = document.createElement('link');
          link.setAttribute('rel', 'alternate');
          link.setAttribute('hreflang', suppLng);
          document.head.appendChild(link);
        }
        const newPath = path === '/' ? `/${suppLng}` : `/${suppLng}${path}`;
        link.setAttribute('href', `${origin}${newPath}${location.search}`);
      });

      let defaultLink = document.querySelector(`link[hreflang="x-default"]`);
      if (!defaultLink) {
        defaultLink = document.createElement('link');
        defaultLink.setAttribute('rel', 'alternate');
        defaultLink.setAttribute('hreflang', 'x-default');
        document.head.appendChild(defaultLink);
      }
      const enPath = path === '/' ? `/en` : `/en${path}`;
      defaultLink.setAttribute('href', `${origin}${enPath}${location.search}`);
    } catch(e) {}
  }, [location.pathname, location.search]);

  return null;
};

const LanguageRouter = ({ children }: { children: React.ReactNode }) => {
  const [basename, setBasename] = useState<string>('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleUrlLang = () => {
      const pathname = window.location.pathname;
      const pathParts = pathname.split('/');
      const urlLang = pathParts[1];
      
      let currentLang = localStorage.getItem('i18nextLng') || i18n.language || 'en';
      currentLang = currentLang.split('-')[0];
      if (!supportedLngs.includes(currentLang)) currentLang = 'en';

      if (supportedLngs.includes(urlLang)) {
        currentLang = urlLang;
      } else {
        // Redirect to add language code if missing
        const newPath = `/${currentLang}${pathname === '/' ? '' : pathname}${window.location.search}`;
        window.history.replaceState(null, '', newPath);
      }

      if (i18n.language !== currentLang) {
        i18n.changeLanguage(currentLang);
        localStorage.setItem('i18nextLng', currentLang);
      }
      
      setBasename(`/${currentLang}`);
      setReady(true);
    };

    handleUrlLang();

    const handleLangChange = (lng: string) => {
      const shortLng = lng.split('-')[0];
      const oldPath = window.location.pathname;
      const parts = oldPath.split('/');
      if (supportedLngs.includes(parts[1]) && parts[1] !== shortLng) {
        parts[1] = shortLng;
        const newPath = parts.join('/') + window.location.search;
        window.location.href = newPath;
      }
    };

    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);

  if (!ready) return null;

  return (
    <BrowserRouter basename={basename}>
      <RouteHreflangSync />
      {children}
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <LanguageRouter>
          <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-[#0f172a]">
              <Loader2 className="w-12 h-12 text-[#3b82f6] animate-spin" />
            </div>
          }>
            <App />
          </Suspense>
        </LanguageRouter>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>
);
