import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_CONFIG = {
  danger: {
    confirmClass: 'bg-rose-500 hover:bg-rose-400 text-white',
    iconColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    accentBg: 'bg-rose-500/10',
  },
  warning: {
    confirmClass: 'bg-amber-500 hover:bg-amber-400 text-black',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    accentBg: 'bg-amber-500/10',
  },
  default: {
    confirmClass: 'bg-brand-primary hover:bg-white text-black',
    iconColor: 'text-brand-primary',
    borderColor: 'border-brand-primary/30',
    accentBg: 'bg-brand-primary/10',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  const config = VARIANT_CONFIG[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-brand-background/80 backdrop-blur-md flex items-center justify-center z-[9998] p-4"
          onClick={onCancel}
          id="confirm-dialog-overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className={`w-full max-w-sm rounded-2xl border ${config.borderColor} shadow-2xl overflow-hidden`}
            style={{ background: 'rgba(18, 18, 30, 0.97)' }}
            onClick={e => e.stopPropagation()}
            id="confirm-dialog-panel"
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-5 border-b border-brand-outline ${config.accentBg}`}>
              <div className="flex items-center gap-2.5">
                <AlertTriangle className={`h-5 w-5 shrink-0 ${config.iconColor}`} />
                <h3 className="text-sm font-display font-bold text-white tracking-tight">{title}</h3>
              </div>
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <p className="text-xs text-gray-300 font-sans leading-relaxed">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 px-5 pb-5">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-xs font-mono font-semibold text-brand-secondary bg-brand-surface-high hover:text-white rounded-lg border border-brand-outline hover:border-brand-outline-accent transition-all"
                id="confirm-dialog-cancel"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => { onConfirm(); }}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all ${config.confirmClass}`}
                id="confirm-dialog-confirm"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
