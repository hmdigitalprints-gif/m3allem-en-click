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

  // Intercept fetch to automatically securely handle HTTPOnly Cookies and Accept-Language header
  const originalFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    writable: true,
    value: async function(...args: any[]) {
      let [resource, config] = args;
      if (typeof resource === 'string' && resource.startsWith('/api')) {
        config = config || {};
        config.credentials = 'include';
        
        // Inject current language header
        const currentLang = localStorage.getItem('i18nextLng') || 'en';
        config.headers = {
          ...config.headers,
          'Accept-Language': currentLang,
        };
        
        args[1] = config;
      }
      return originalFetch.apply(this, args);
    }
  });
}

import App from './App.tsx';
import './index.css';
import i18n from './i18n.ts';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Loader2 } from 'lucide-react';

const supportedLngs = ['en', 'fr', 'ar'];



const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-[#0f172a]">
              <Loader2 className="w-12 h-12 text-[#3b82f6] animate-spin" />
            </div>
          }>
            <App />
          </Suspense>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>
);
