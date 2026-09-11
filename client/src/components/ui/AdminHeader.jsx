import { Menu, LogOut, ExternalLink, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminHeader({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          className="admin-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
        >
          <Menu size={22} />
        </button>
        <span className="admin-breadcrumb">LBI CMS</span>
      </div>

      <div className="admin-header-right">
        <Link to="/" target="_blank" className="admin-view-site-btn">
          <ExternalLink size={15} /> <span>View Live Site</span>
        </Link>

        <div className="admin-user-pill">
          <User size={16} />
          <span className="admin-user-name">{user?.username || 'Admin'}</span>
          <span className="admin-role-tag">{user?.role || 'admin'}</span>
        </div>

        <button className="admin-logout-btn" onClick={logout} title="Sign Out">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
