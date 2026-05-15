import { StrictMode, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
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
  const interceptedFetch = async function(resource: string | Request, config?: RequestInit) {
    try {
      const isApiRequest = typeof resource === 'string' && resource.startsWith('/api');
      const isRequestObject = resource instanceof Request && resource.url.includes('/api');
      
      if (isApiRequest || isRequestObject) {
        const newConfig = { ...(config || {}) };
        newConfig.credentials = 'include';
        
        // Inject current language header
        const currentLang = localStorage.getItem('m3allem_lang') || localStorage.getItem('i18nextLng') || 'en';
        
        if (isRequestObject) {
          try {
            (resource as Request).headers.set('Accept-Language', currentLang);
          } catch (headerError) {
            // Headers might be immutable if the Request was already used or created from an existing request
            console.warn('Could not set Accept-Language on Request object:', headerError);
          }
        } else {
          // Handle headers
          if (newConfig.headers instanceof Headers) {
            newConfig.headers.set('Accept-Language', currentLang);
          } else {
            newConfig.headers = {
              ...(newConfig.headers || {}),
              'Accept-Language': currentLang,
            };
          }
        }
        
        return originalFetch(resource, newConfig);
      }
      return originalFetch(resource, config);
    } catch (err) {
      console.error('Fetch interceptor error:', err);
      return originalFetch(resource, config);
    }
  };

  try {
    Object.defineProperty(window, 'fetch', {
      value: interceptedFetch,
      configurable: true,
      enumerable: true,
      writable: true
    });
  } catch (e) {
    console.warn('Could not redefine window.fetch via defineProperty, trying direct assignment:', e);
    try {
      (window as any).fetch = interceptedFetch;
    } catch (e2) {
      console.error('Failed to intercept fetch entirely:', e2);
    }
  }
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
    <HelmetProvider>
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
    </HelmetProvider>
  </StrictMode>
);
