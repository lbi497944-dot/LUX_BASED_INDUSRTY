import { useState } from 'react';
import { Menu, LogOut, ExternalLink, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import AdminSendReviewModal from '../admin/AdminSendReviewModal';
import Toast from '../common/Toast';

function formatAdminDisplayName(username) {
  if (!username) return 'LBI Admin';
  if (/veloura/i.test(username)) {
    return username.replace(/veloura/gi, 'LBI').trim() || 'LBI Admin';
  }
  return username;
}

export default function AdminHeader({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const displayName = formatAdminDisplayName(user?.username);

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
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
          <button
            type="button"
            className="admin-send-review-btn"
            onClick={() => setReviewModalOpen(true)}
            title="Send public review link via WhatsApp"
            aria-label="Send review link via WhatsApp"
          >
            <MessageCircle size={15} />
            <span>SEND REVIEW LINK</span>
          </button>

          <Link to="/" target="_blank" className="admin-view-site-btn">
            <ExternalLink size={15} /> <span>View Live Site</span>
          </Link>

          <div className="admin-user-pill">
            <User size={16} />
            <span className="admin-user-name">{displayName}</span>
            <span className="admin-role-tag">{user?.role || 'admin'}</span>
          </div>

          <button className="admin-logout-btn" onClick={logout} title="Sign Out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <AdminSendReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onToast={setToast}
      />
    </>
  );
}
