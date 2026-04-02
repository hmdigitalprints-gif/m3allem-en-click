import {StrictMode, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './i18n.ts';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Loader2 } from 'lucide-react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
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
  </StrictMode>,
);
