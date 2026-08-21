import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationsApi } from '../../api/notifications.api';
import type { Notification, NotificationType } from '../../types/notification';
import { Skeleton } from '../ui/Skeleton';
import {
  Bell,
  CheckCheck,
  LifeBuoy,
  FileText,
  Briefcase,
  Layers,
  Inbox,
  Shield,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface NotificationBellProps {
  role: 'admin' | 'employee' | 'client';
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ role }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch Unread Count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      if (res?.data && typeof res.data.unreadCount === 'number') {
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // Silently handle polling failure
    }
  }, []);

  // Fetch Notifications List
  const fetchNotificationsList = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const res = await notificationsApi.getNotifications({ limit: 20 });
      if (res?.data?.items) {
        setNotifications(res.data.items);
      }
    } catch {
      setError('Failed to load notifications.');
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  // Initial load & Polling Interval (every 30 seconds)
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch list whenever popover is opened
  useEffect(() => {
    if (isOpen) {
      fetchNotificationsList();
    }
  }, [isOpen, fetchNotificationsList]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark Single Notification as Read
  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await notificationsApi.markAsRead(notification.id);
      } catch {
        // Revert on failure
        fetchNotificationsList();
        fetchUnreadCount();
      }
    }

    // Entity Navigation Logic by Role
    if (notification.type === 'TICKET') {
      if (role === 'client') navigate('/portal/support');
      else navigate('/admin/tickets');
    } else if (notification.type === 'LEAD' && role === 'admin') {
      navigate('/admin/leads');
    } else if (notification.type === 'INVOICE') {
      if (role === 'client') navigate('/portal/invoices');
      else navigate('/admin/settings');
    } else if (notification.type === 'PROJECT' || notification.type === 'MILESTONE') {
      if (role === 'client') navigate('/portal/projects');
      else if (role === 'employee') navigate('/employee/projects');
      else navigate('/admin');
    } else if (notification.type === 'DOCUMENT') {
      if (role === 'employee') navigate('/employee/documents');
      else if (role === 'client') navigate('/portal');
    }

    setIsOpen(false);
  };

  // Mark All Notifications as Read
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setIsMarkingAll(true);
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Handle error
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Render Type Icon
  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case 'TICKET':
        return <LifeBuoy className="h-4 w-4 text-blue-500" />;
      case 'INVOICE':
        return <FileText className="h-4 w-4 text-emerald-500" />;
      case 'LEAD':
        return <Inbox className="h-4 w-4 text-amber-500" />;
      case 'PROJECT':
      case 'MILESTONE':
        return <Briefcase className="h-4 w-4 text-indigo-500" />;
      case 'DOCUMENT':
        return <Layers className="h-4 w-4 text-purple-500" />;
      case 'SYSTEM':
      default:
        return <Shield className="h-4 w-4 text-secondary" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
        aria-label="Toggle Notification Panel"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 px-1 min-w-[1.125rem] h-4 bg-danger text-white text-[9.5px] font-mono font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-dark-card shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 text-left space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-900 dark:text-white">
                  Notifications Hub
                </h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                    {unreadCount} Unread
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                  className="flex items-center gap-1 text-[11px] font-semibold text-secondary hover:text-secondary-dark cursor-pointer transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>{isMarkingAll ? 'Marking...' : 'Mark all read'}</span>
                </button>
              )}
            </div>

            {/* Content List Body */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {isLoadingList ? (
                <div className="space-y-3 py-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-4 text-center space-y-2 bg-red-50/50 dark:bg-red-950/20 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-danger mx-auto" />
                  <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
                  <button
                    onClick={fetchNotificationsList}
                    className="text-xs font-bold text-secondary hover:underline cursor-pointer"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Bell className="h-7 w-7 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No notifications yet
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    You're all caught up! Real-time telemetry alerts and system updates will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMarkAsRead(item)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-start group ${
                      !item.isRead
                        ? 'bg-slate-50 dark:bg-dark/80 border-slate-200 dark:border-slate-800'
                        : 'bg-white dark:bg-dark-card border-transparent opacity-75 hover:opacity-100 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="p-2 bg-white dark:bg-dark border border-slate-100 dark:border-slate-800 rounded-lg flex-shrink-0 mt-0.5 shadow-2xs">
                      {renderIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h5
                          className={`text-xs font-bold truncate ${
                            !item.isRead
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.title}
                        </h5>
                        {!item.isRead && (
                          <span className="h-2 w-2 bg-secondary rounded-full flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono pt-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Real-Time User Telemetry</span>
              <button
                onClick={() => setIsOpen(false)}
                className="font-sans font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
