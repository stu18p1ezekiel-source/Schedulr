import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Calendar, MessageSquare, BookOpen, Bell } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'event' | 'post' | 'homework' | 'success';
  title: string;
  message: string;
  detail?: string;
  duration?: number;
}

interface NotificationToastProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <div 
      id="notification-toast-container" 
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 w-full max-w-lg px-4 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="sync">
        {notifications.map((notification) => (
          <ToastCard 
            key={notification.id} 
            notification={notification} 
            onDismiss={onDismiss} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastCard: React.FC<{
  notification: NotificationItem;
  onDismiss: (id: string) => void;
}> = ({ notification, onDismiss }) => {
  const duration = notification.duration || 5000;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.id, duration, onDismiss]);

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'event':
        return <Calendar className="w-3.5 h-3.5" />;
      case 'post':
        return <MessageSquare className="w-3.5 h-3.5 text-white" />;
      case 'homework':
        return <BookOpen className="w-3.5 h-3.5" />;
      default:
        return <Bell className="w-3.5 h-3.5" />;
    }
  };

  const getBadgeLabel = () => {
    switch (notification.type) {
      case 'event':
        return 'Calendar Update';
      case 'post':
        return 'Faculty Bulletin';
      case 'homework':
        return 'Academic Task';
      default:
        return 'Confirmed';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -25, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      id={`notification-toast-${notification.id}`}
      className="pointer-events-auto w-full bg-[#082142] text-white rounded-2xl shadow-2xl border-2 border-emerald-500/80 overflow-hidden relative backdrop-blur-md"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="p-4 sm:p-5 flex items-start gap-4">
        {/* Animated Green Checkmark Icon Badge */}
        <div className="relative shrink-0 mt-0.5">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.05 }}
            className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-2 border-emerald-300"
          >
            <Check className="w-6 h-6 stroke-[3.5]" />
          </motion.div>
          
          {/* Pulsing halo */}
          <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping pointer-events-none" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {getTypeIcon()}
              {getBadgeLabel()}
            </span>
            <span className="text-xs text-[#b2d9d4] font-medium">Just now</span>
          </div>

          <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight flex items-center gap-2">
            {notification.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#e0f2f1] mt-0.5 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>

          {notification.detail && (
            <p className="text-[11px] text-[#b2d9d4] mt-1 font-mono">
              {notification.detail}
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          id="btn-dismiss-toast"
          onClick={() => onDismiss(notification.id)}
          className="shrink-0 p-1.5 rounded-lg text-[#b2d9d4] hover:text-white hover:bg-white/10 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress countdown bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className="h-1.5 bg-gradient-to-r from-emerald-400 to-[#139a91]"
      />
    </motion.div>
  );
};
