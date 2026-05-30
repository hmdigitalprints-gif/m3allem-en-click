import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import StoreSection from '../components/store/StoreSection';

export default function Store() {
  const { t } = useTranslation();
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (msg: string) => {
    showToast(msg);
  };

  return (
    <Layout>
      <div className="flex-1 bg-[var(--bg)] min-h-screen relative">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[var(--card-bg)] border border-[var(--border)] px-6 py-4 rounded-2xl shadow-2xl"
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="text-[var(--success)]" size={24} />
              ) : (
                <div className="w-2 h-2 rounded-full bg-blue-400" />
              )}
              <span className="font-medium text-[var(--text)]">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto">
          <StoreSection onAction={handleAction} />
        </div>
      </div>
    </Layout>
  );
}
