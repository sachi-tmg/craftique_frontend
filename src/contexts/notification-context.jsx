// src/contexts/notification-context.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
    countNotifications,
    getNotifications,
    getNotificationsAvailability,
    markAllNotificationsAsRead
} from '../api/api';
import { useAuth } from './auth-context';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { userAuth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNew, setHasNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotificationAvailability = async () => {
    if (!userAuth?.token) return;
    
    try {
      const response = await getNotificationsAvailability(userAuth.token);
      setHasNew(response.data.new_notification_available);
    } catch (error) {
      console.error("Error checking notification availability:", error);
    }
  };

  const fetchNotifications = async (page = 1, filter = 'all') => {
    if (!userAuth?.token) return;
    setLoading(true);
    
    try {
      const response = await getNotifications(
        { page, filter, deletedDocCount: 0 },
        userAuth.token
      );
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async (filter = 'all') => {
    if (!userAuth?.token) return;
    
    try {
      const response = await countNotifications(
        { filter }, 
        userAuth.token
      );
      setUnreadCount(response.data.totalDocs);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!userAuth?.token) return;
    
    try {
      await markAllNotificationsAsRead(userAuth.token);
      setHasNew(false);
      setUnreadCount(0);
      // Update local notifications to mark as read
      setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Poll for new notifications periodically
  useEffect(() => {
    if (!userAuth?.token) return;

    fetchNotificationAvailability();
    fetchNotificationCount();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotificationAvailability();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [userAuth?.token]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      hasNew,
      loading,
      fetchNotifications,
      fetchNotificationCount,
      markAllAsRead,
      fetchNotificationAvailability
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);