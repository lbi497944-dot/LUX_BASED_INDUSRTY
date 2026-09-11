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
  Settings,
  KeyRound,
  X,
} from 'lucide-react';

const links = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', path: '/admin/products', icon: Sparkles },
  { label: 'Collections', path: '/admin/collections', icon: Layers },
  { label: 'Portfolio', path: '/admin/projects', icon: Building2 },
  { label: 'Consultations', path: '/admin/consultations', icon: CalendarCheck2 },
  { label: 'Contact Enquiries', path: '/admin/contact', icon: Mail },
  { label: 'Newsletter', path: '/admin/newsletter', icon: Send },
  { label: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
  { label: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
  { label: 'Account Security', path: '/admin/account', icon: KeyRound },
  { label: 'Site Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ isOpen, onClose }) {
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
  return (
    <>
      {isOpen && <div className="admin-sidebar-backdrop" onClick={onClose} />}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <NavLink to="/" className="admin-brand-link">
            <span className="logo-main">VELOURA</span>
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
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
