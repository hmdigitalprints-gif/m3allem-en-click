import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, MessageSquare } from 'lucide-react';
import { socket } from '../../services/socket';

interface Notification {
  id: string;
  type: 'push' | 'email' | 'reminder';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell({ userId, token, onNotification }: { userId: string, token: string | null, onNotification?: (notification: Notification) => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId || !token) return;

    // Fetch initial notifications
    fetch(`/api/notifications/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
          setUnreadCount(data.filter((n: any) => !n.is_read).length);
        } else {
          console.error("Notifications data is not an array:", data);
          setNotifications([]);
          setUnreadCount(0);
        }
      })
      .catch(err => console.error("Failed to load notifications", err));

    // Listen for real-time notifications on the shared socket
    socket.on('new_notification', (notification: Notification) => {
      if (!notification) return;
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Call the callback if provided
      onNotification?.(notification);

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, { body: notification.message });
      }
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socket.off('new_notification');
    };
  }, [userId, token]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}/read`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(prev => prev?.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'push': return <Info size={16} className="text-blue-500" />;
      case 'reminder': return <Clock size={16} className="text-yellow-500" />;
      case 'email': return <MessageSquare size={16} className="text-[var(--accent)]" />;
      default: return <Bell size={16} className="text-[var(--text-muted)]" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 glass rounded-full hover:scale-110 transition-all active:scale-95 shadow-lg flex items-center justify-center"
      >
        <Bell size={20} className="text-[var(--text)]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-[var(--destructive)] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[var(--bg)] shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--text)]/5">
                <h3 className="font-bold text-[var(--text)]">Notifications</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  {unreadCount} New
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications?.length === 0 ? (
                  <div className="p-12 text-center">
                    <Bell size={32} className="text-[var(--text-muted)]/20 mx-auto mb-4" />
                    <p className="text-sm text-[var(--text-muted)]">No notifications yet</p>
                  </div>
                ) : (
                  notifications?.map(notification => (
                    <div 
                      key={notification.id}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                      className={`p-4 border-b border-[var(--border)] hover:bg-[var(--text)]/5 transition-colors cursor-pointer relative ${!notification.is_read ? 'bg-[var(--accent)]/5' : ''}`}
                    >
                      {!notification.is_read && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-[var(--accent)] rounded-full" />
                      )}
                      <div className="flex gap-3">
                        <div className="mt-1">{getIcon(notification.type)}</div>
                        <div>
                          <h4 className={`text-sm font-bold mb-1 ${!notification.is_read ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-2">
                            {notification.message}
                          </p>
                          <span className="text-[10px] text-[var(--text-muted)]/60 font-medium">
                            {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <button className="w-full p-4 text-xs font-bold text-[var(--accent)] hover:bg-[var(--text)]/5 transition-colors border-t border-[var(--border)]">
                  View All Notifications
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
