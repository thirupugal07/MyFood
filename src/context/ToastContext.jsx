import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { uid } from '../lib/id';
import Toaster from '../components/ui/Toaster';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, options = {}) => {
      const { type = 'info', title = '', duration = 3600 } = options;
      const id = uid('toast');
      setToasts((current) => [...current.slice(-3), { id, message, type, title }]);
      if (duration > 0) {
        timers.current.set(id, setTimeout(() => dismiss(id), duration));
      }
      return id;
    },
    [dismiss],
  );

  const toast = useMemo(
    () => ({
      info: (message, options) => push(message, { ...options, type: 'info' }),
      success: (message, options) => push(message, { ...options, type: 'success' }),
      error: (message, options) => push(message, { ...options, type: 'error' }),
      warning: (message, options) => push(message, { ...options, type: 'warning' }),
      dismiss,
    }),
    [push, dismiss],
  );

  const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context.toast;
};

export const useToastState = () => useContext(ToastContext);
