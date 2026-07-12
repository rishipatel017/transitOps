import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, Toast, ToastType } from '../../context/ToastContext';

// ─── Config per type ─────────────────────────────────────────────────────────
const TOAST_CONFIG: Record<ToastType, {
  icon: React.FC<{ className?: string }>;
  borderColor: string;
  iconColor: string;
  titleColor: string;
  bgAccent: string;
  barColor: string;
}> = {
  success: {
    icon: CheckCircle2,
    borderColor: 'border-emerald-500/40',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-300',
    bgAccent: 'bg-emerald-500/5',
    barColor: 'bg-emerald-400',
  },
  error: {
    icon: XCircle,
    borderColor: 'border-rose-500/40',
    iconColor: 'text-rose-400',
    titleColor: 'text-rose-300',
    bgAccent: 'bg-rose-500/5',
    barColor: 'bg-rose-400',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-amber-500/40',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300',
    bgAccent: 'bg-amber-500/5',
    barColor: 'bg-amber-400',
  },
  info: {
    icon: Info,
    borderColor: 'border-sky-500/40',
    iconColor: 'text-sky-400',
    titleColor: 'text-sky-300',
    bgAccent: 'bg-sky-500/5',
    barColor: 'bg-sky-400',
  },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────
const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [toast.duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className={`relative w-80 overflow-hidden rounded-xl border ${config.borderColor} ${config.bgAccent} backdrop-blur-md shadow-2xl`}
      style={{ background: 'rgba(18, 18, 30, 0.92)' }}
      id={`toast-${toast.id}`}
    >
      {/* Content */}
      <div className="flex items-start gap-3 p-4 pr-10">
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold font-mono uppercase tracking-wide ${config.titleColor}`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-[11px] text-gray-400 font-sans mt-1 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors p-0.5 rounded"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-white/5">
        <motion.div
          className={`h-full ${config.barColor} origin-left`}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.03, ease: 'linear' }}
          style={{ transformOrigin: 'left' }}
        />
      </div>
    </motion.div>
  );
};

// ─── Toast Container ──────────────────────────────────────────────────────────
export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      id="toast-container"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="sync">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
