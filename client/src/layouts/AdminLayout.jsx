import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/ui/AdminSidebar';
import AdminHeader from '../components/ui/AdminHeader';
import { statsService } from '../services/statsService';
import SEO from '../components/common/SEO';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingReviews, setPendingReviews] = useState(0);
  const isPollingRef = useRef(false);
  const location = useLocation();
  const isPageEditor = location.pathname.startsWith('/admin/pages/') && location.pathname !== '/admin/pages';

  const fetchPendingReviews = useCallback(async () => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return;
    }
    if (isPollingRef.current) {
      return;
    }

    try {
      isPollingRef.current = true;
      const res = await statsService.getDashboardStats();
      const count = res?.data?.counts?.pendingReviews ?? res?.counts?.pendingReviews;
      if (typeof count === 'number') {
        setPendingReviews(count);
      }
    } catch {
      // Retain existing count on background failure without showing disruptive error
    } finally {
      isPollingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPendingReviews();

    // 30s background interval
    const interval = setInterval(fetchPendingReviews, 30000);

    // Visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPendingReviews();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Optional event listener for immediate sync upon review moderation
    const handleSyncEvent = () => {
      fetchPendingReviews();
    };
    window.addEventListener('reviews_updated', handleSyncEvent);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('reviews_updated', handleSyncEvent);
    };
  }, [fetchPendingReviews]);

  return (
    <div className="admin-app-wrapper">
      <SEO title="Admin CMS | LUX BASED INDUSTRY" canonical="/admin" robots="noindex, nofollow" />
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingReviews={pendingReviews}
      />
      <div className="admin-main-container">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`admin-page-content ${isPageEditor ? 'admin-page-content-flush' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
