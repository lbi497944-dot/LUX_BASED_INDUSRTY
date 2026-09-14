import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { statsService } from '../services/statsService';

const NotificationContext = createContext({
  notifications: {
    consultations: 0,
    enquiries: 0,
    subscriptions: 0,
    reviews: 0,
    total: 0,
  },
  tasks: [],
  loading: true,
  refreshNotifications: async () => {},
});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState({
    consultations: 0,
    enquiries: 0,
    subscriptions: 0,
    reviews: 0,
    total: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const refreshNotifications = useCallback(async () => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return;
    }
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      const res = await statsService.getNotificationSummary();
      const data = res?.data || res;
      if (data?.counts) {
        setNotifications(data.counts);
      }
      if (Array.isArray(data?.tasks)) {
        setTasks(data.tasks);
      }
    } catch {
      // Retain previous state on network/background failure
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();

    // 30s background polling
    const interval = setInterval(refreshNotifications, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshNotifications();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Dynamic sync listeners across CMS interactions
    const handleSync = () => {
      refreshNotifications();
    };

    window.addEventListener('notifications_updated', handleSync);
    window.addEventListener('reviews_updated', handleSync);
    window.addEventListener('consultations_updated', handleSync);
    window.addEventListener('contact_updated', handleSync);
    window.addEventListener('subscribers_updated', handleSync);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('notifications_updated', handleSync);
      window.removeEventListener('reviews_updated', handleSync);
      window.removeEventListener('consultations_updated', handleSync);
      window.removeEventListener('contact_updated', handleSync);
      window.removeEventListener('subscribers_updated', handleSync);
    };
  }, [refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        tasks,
        loading,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useAdminNotifications = () => useContext(NotificationContext);
