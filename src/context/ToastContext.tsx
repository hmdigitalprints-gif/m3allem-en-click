import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // in ms
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
      
      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback((title: string, message?: string, duration?: number) => {
    toast('success', title, message, duration);
  }, [toast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    toast('error', title, message, duration);
  }, [toast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    toast('info', title, message, duration);
  }, [toast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    toast('warning', title, message, duration);
  }, [toast]);

  // Color config for various toast levels
  const typeStyles: Record<ToastType, { icon: any; borderClass: string; iconClass: string; bgClass: string; progressClass: string }> = {
    success: {
      icon: CheckCircle2,
      borderClass: 'border-emerald-500/25 dark:border-emerald-400/20',
      iconClass: 'text-emerald-500 dark:text-emerald-400',
      bgClass: 'bg-emerald-500/5 backdrop-blur-md',
      progressClass: 'bg-emerald-500 dark:bg-emerald-400',
    },
    error: {
      icon: AlertCircle,
      borderClass: 'border-rose-500/25 dark:border-rose-400/20',
      iconClass: 'text-rose-500 dark:text-rose-400',
      bgClass: 'bg-rose-500/5 backdrop-blur-md',
      progressClass: 'bg-rose-500 dark:bg-rose-400',
    },
    info: {
      icon: Info,
      borderClass: 'border-sky-500/25 dark:border-sky-400/20',
      iconClass: 'text-sky-500 dark:text-sky-400',
      bgClass: 'bg-sky-500/5 backdrop-blur-md',
      progressClass: 'bg-sky-500 dark:bg-sky-400',
    },
    warning: {
      icon: AlertTriangle,
      borderClass: 'border-amber-500/25 dark:border-amber-400/20',
      iconClass: 'text-amber-500 dark:text-amber-400',
      bgClass: 'bg-amber-500/5 backdrop-blur-md',
      progressClass: 'bg-amber-500 dark:bg-amber-400',
    },
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss }}>
      {children}
      
      {/* Global Toast Portal/Container */}
      <div id="toast-container" className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const styles = typeStyles[t.type];
            const IconComponent = styles.icon;
            
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`pointer-events-auto relative overflow-hidden w-full flex items-start gap-4 p-4 rounded-3xl bg-[var(--card-bg)] border ${styles.borderClass} ${styles.bgClass} shadow-xl max-w-md`}
              >
                {/* Icon wrapper */}
                <div className={`p-1.5 rounded-xl bg-[var(--card-bg)] shadow-inner border border-white/5 ${styles.iconClass} shrink-0`}>
                  <IconComponent size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <h4 className="text-sm font-bold text-[var(--text)] tracking-tight leading-snug">
                    {t.title}
                  </h4>
                  {t.message && (
                    <p className="text-xs text-[var(--text-muted)] mt-1 font-medium leading-relaxed">
                      {t.message}
                    </p>
                  )}
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => dismiss(t.id)}
                  className="p-1.5 rounded-full hover:bg-[var(--card-bg)]/40 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shrink-0"
                >
                  <X size={14} />
                </button>

                {/* Self-depleting active progress bar */}
                {t.duration && t.duration > 0 && (
                  <motion.div
                    className={`absolute bottom-0 left-0 h-0.5 ${styles.progressClass} opacity-80`}
                    initial={{ width: '100%' }}
                    animate={{ width: 0 }}
                    transition={{ duration: t.duration / 1000, ease: 'linear' }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
