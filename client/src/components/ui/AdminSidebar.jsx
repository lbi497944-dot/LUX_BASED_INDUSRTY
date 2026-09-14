import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  Building2,
  CalendarCheck2,
  Mail,
  Send,
  HelpCircle,
  MessageSquareQuote,
  Star,
  Handshake,
  Sliders,
  Settings,
  KeyRound,
  PanelsTopLeft,
  X,
} from 'lucide-react';
import { useAdminNotifications } from '../../context/NotificationContext';

const links = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Page Builder', path: '/admin/pages', icon: PanelsTopLeft },
  { label: 'Transformations', path: '/admin/transformations', icon: Sliders },
  { label: 'Products', path: '/admin/products', icon: Sparkles },
  { label: 'Collections', path: '/admin/collections', icon: Layers },
  { label: 'Portfolio', path: '/admin/projects', icon: Building2 },
  { label: 'Consultations', path: '/admin/consultations', icon: CalendarCheck2, badgeKey: 'consultations' },
  { label: 'Contact Enquiries', path: '/admin/contact', icon: Mail, badgeKey: 'enquiries' },
  { label: 'Newsletter', path: '/admin/newsletter', icon: Send, badgeKey: 'subscriptions' },
  { label: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
  { label: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
  { label: 'Reviews', path: '/admin/reviews', icon: Star, badgeKey: 'reviews' },
  { label: 'Client Partners', path: '/admin/partners', icon: Handshake },
  { label: 'Account Security', path: '/admin/account', icon: KeyRound },
  { label: 'Site Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const { notifications } = useAdminNotifications();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatBadge = (count) => {
    if (!count || count <= 0) return null;
    if (count > 99) return '99+';
    return count;
  };

  return (
    <>
      {isOpen && <div className="admin-sidebar-backdrop" onClick={onClose} />}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <NavLink to="/" className="admin-brand-link">
            <span className="logo-main">LUX</span>
            <small className="logo-sub">CMS PORTAL</small>
          </NavLink>
          <button className="admin-sidebar-close" onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav-menu">
          <span className="admin-nav-heading">MANAGEMENT</span>
          {links.map((link) => {
            const Icon = link.icon;
            const count = link.badgeKey ? notifications?.[link.badgeKey] || 0 : 0;
            const badgeValue = formatBadge(count);

            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{link.label}</span>
                {badgeValue !== null && (
                  <span
                    className="admin-nav-badge"
                    aria-label={`${link.label}, ${count} items requiring attention`}
                  >
                    {badgeValue}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
