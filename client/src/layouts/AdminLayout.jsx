import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/ui/AdminSidebar';
import AdminHeader from '../components/ui/AdminHeader';
import { NotificationProvider } from '../context/NotificationContext';
import SEO from '../components/common/SEO';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isPageEditor = location.pathname.startsWith('/admin/pages/') && location.pathname !== '/admin/pages';

  return (
    <NotificationProvider>
      <div className="admin-app-wrapper">
        <SEO title="Admin CMS | LUX BASED INDUSTRY" canonical="/admin" robots="noindex, nofollow" />
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="admin-main-container">
          <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className={`admin-page-content ${isPageEditor ? 'admin-page-content-flush' : ''}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
