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
  // Note: Some environments protect window.fetch, so we use a safe approach
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
        
        return originalFetch.call(window, resource, newConfig);
      }
      return originalFetch.call(window, resource, config);
    } catch (err) {
      console.error('Fetch interceptor error:', err);
      return originalFetch.call(window, resource, config);
    }
  };

  // Only attempt to override if possible
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (!descriptor || descriptor.configurable || descriptor.writable) {
      Object.defineProperty(window, 'fetch', {
        value: interceptedFetch,
        configurable: true,
        enumerable: true,
        writable: true
      });
    } else {
      console.warn('window.fetch is not configurable or writable. Global interception disabled.');
    }
  } catch (e) {
    console.warn('Could not intercept window.fetch:', e);
  }
}

import App from './App.tsx';
import './index.css';
import i18n from './i18n.ts';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
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
          <ToastProvider>
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
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);
