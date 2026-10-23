import { createContext, useCallback, useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

export const ToastContext = createContext(null);

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    border: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-600',
    border: 'border-red-200 bg-red-50 text-red-900',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    border: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  info: {
    icon: Info,
    iconColor: 'text-brand-600',
    border: 'border-brand-200 bg-brand-50 text-brand-900',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback((message, variant = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((current) => [...current, { id, message, variant, title }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);

    return id;
  }, [removeToast]);

  const toastMethods = useMemo(
    () => ({
      show: (message, variant = 'info') => addToast(message, variant),
      success: (message, title) => addToast(message, 'success', title),
      error: (message, title) => addToast(message, 'error', title),
      warning: (message, title) => addToast(message, 'warning', title),
      info: (message, title) => addToast(message, 'info', title),
      dismiss: removeToast,
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
      >
        {toasts.map(({ id, message, variant, title }) => {
          const config = VARIANTS[variant] || VARIANTS.info;
          const Icon = config.icon;

          return (
            <div
              key={id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2',
                config.border
              )}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconColor)} aria-hidden="true" />
              <div className="flex-1 min-w-0">
                {title && <p className="text-sm font-semibold">{title}</p>}
                <p className="text-sm">{message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(id)}
                className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
