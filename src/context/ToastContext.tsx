import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number; // ms
}

interface ToastContextValue {
  toasts: Toast[];
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toast: Toast = { id, type, title, message, duration };

    setToasts(prev => {
      // Keep max 5 toasts stacked
      const trimmed = prev.length >= 5 ? prev.slice(1) : prev;
      return [...trimmed, toast];
    });

    // Auto-dismiss
    timers.current[id] = setTimeout(() => dismiss(id), duration);

    return id;
  }, [dismiss]);

  const success = useCallback((title: string, message?: string, duration?: number) =>
    addToast('success', title, message, duration), [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) =>
    addToast('error', title, message, duration ?? 6000), [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) =>
    addToast('warning', title, message, duration ?? 5000), [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) =>
    addToast('info', title, message, duration), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, success, error, warning, info, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
