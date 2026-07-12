import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, AlertTriangle, TrendingUp, Info } from 'lucide-react';

export type AIInsightType = 'info' | 'warning' | 'success' | 'alert';

interface AIInsightCardProps {
  title: string;
  description: string;
  type?: AIInsightType;
  actionText?: string;
  onAction?: () => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ 
  title, 
  description, 
  type = 'info', 
  actionText, 
  onAction 
}) => {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          text: 'text-amber-700 dark:text-amber-300'
        };
      case 'alert':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          text: 'text-red-700 dark:text-red-300'
        };
      case 'success':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
          text: 'text-emerald-700 dark:text-emerald-300'
        };
      default:
        return {
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/30',
          icon: <Info className="w-5 h-5 text-indigo-500" />,
          text: 'text-indigo-700 dark:text-indigo-300'
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border ${styles.border} ${styles.bg} p-4 backdrop-blur-sm shadow-sm`}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="relative">
            {styles.icon}
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-purple-500 animate-pulse" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-semibold ${styles.text} flex items-center`}>
            {title}
            <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-300">
              AI Insight
            </span>
          </h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {description}
          </p>
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors flex items-center group"
            >
              {actionText}
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
