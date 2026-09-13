import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/ui/AdminSidebar';
import AdminHeader from '../components/ui/AdminHeader';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isPageEditor = location.pathname.startsWith('/admin/pages/') && location.pathname !== '/admin/pages';

  return (
    <div className="admin-app-wrapper">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main-container">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`admin-page-content ${isPageEditor ? 'admin-page-content-flush' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
