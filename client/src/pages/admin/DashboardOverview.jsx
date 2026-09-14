import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsService } from '../../services/statsService';
import { consultationService } from '../../services/consultationService';
import {
  Sparkles,
  Layers,
  Building2,
  CalendarCheck2,
  Mail,
  Send,
  Star,
  ArrowUpRight,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import SEO from '../../components/common/SEO';
import { useAdminNotifications } from '../../context/NotificationContext';

const taskIconMap = {
  CalendarCheck2,
  Mail,
  Send,
  Star,
};

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notifications, tasks, refreshNotifications } = useAdminNotifications();

  const fetchStats = async () => {
    try {
      const res = await statsService.getDashboardStats();
      setStats(res.data);
    } catch {
      setStats({
        counts: {
          totalProducts: 4,
          totalCollections: 6,
          totalProjects: 5,
          totalConsultations: 0,
          newConsultations: 0,
          totalEnquiries: 0,
          newEnquiries: 0,
          totalSubscribers: 0,
        },
        recentConsultations: [],
        recentEnquiries: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickStatus = async (id, newStatus) => {
    try {
      await consultationService.updateStatus(id, newStatus);
      fetchStats();
      refreshNotifications();
      window.dispatchEvent(new Event('consultations_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <Loader2 className="spin-icon" size={32} />
        <p>Loading Dashboard Analytics...</p>
      </div>
    );
  }

  const counts = stats?.counts || {};
  const activeTasks = (tasks || []).filter((t) => t.count > 0);

  return (
    <div className="admin-page">
      <SEO title="Dashboard Overview | LUX BASED INDUSTRY CMS" />

      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">STUDIO OVERVIEW</span>
          <h1>Executive Dashboard</h1>
        </div>
        <div className="admin-header-actions">
          <Link to="/admin/consultations" className="btn btn-gold btn-sm">
            <CalendarCheck2 size={16} /> VIEW ALL LEADS
          </Link>
        </div>
      </div>

      {/* TODAY'S TASKS SECTION */}
      <div className="admin-tasks-section">
        <div className="panel-head" style={{ marginBottom: '14px', borderBottom: 'none', paddingBottom: 0 }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Today&apos;s Actionable Tasks</span>
            {activeTasks.length > 0 && (
              <span className="admin-task-count-pill" style={{ fontSize: '11px', height: '22px', minWidth: '22px' }}>
                {activeTasks.reduce((sum, t) => sum + t.count, 0)}
              </span>
            )}
          </h3>
        </div>

        {activeTasks.length === 0 ? (
          <div className="admin-tasks-empty-card">
            <CheckCircle2 size={24} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#FAF8F1', display: 'block', marginBottom: '2px' }}>You&apos;re all caught up.</strong>
              <small style={{ color: 'rgba(243, 243, 235, 0.65)' }}>No pending enquiries, consultations, or reviews require immediate attention today.</small>
            </div>
          </div>
        ) : (
          <div className="admin-tasks-grid">
            {activeTasks.map((task) => {
              const Icon = taskIconMap[task.icon] || AlertCircle;
              return (
                <Link
                  key={task.id}
                  to={task.path}
                  className="admin-task-card"
                  aria-label={`${task.title}: ${task.count} items requiring attention. Click to navigate.`}
                >
                  <div className="admin-task-card-content">
                    <div className="admin-task-icon-wrap">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="admin-task-title">{task.title}</h4>
                      <p className="admin-task-desc">{task.description}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span className="admin-task-count-pill">{task.count}</span>
                    <ArrowUpRight size={16} style={{ color: 'var(--gold)', opacity: 0.8 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="admin-stats-grid">
        <Link
          to="/admin/consultations"
          className="admin-stat-card admin-stat-card-link"
          aria-label="View New Consultations"
        >
          <div className="stat-card-header">
            <span className="stat-label">NEW CONSULTATIONS</span>
            <div className="stat-icon-wrap highlight">
              <CalendarCheck2 size={20} />
            </div>
          </div>
          <div className="stat-number">{counts.newConsultations ?? notifications.consultations ?? 0}</div>
          <small className="stat-meta">{counts.totalConsultations || 0} total leads recorded</small>
        </Link>

        <Link
          to="/admin/contact"
          className="admin-stat-card admin-stat-card-link"
          aria-label="View New Contact Enquiries"
        >
          <div className="stat-card-header">
            <span className="stat-label">NEW ENQUIRIES</span>
            <div className="stat-icon-wrap">
              <Mail size={20} />
            </div>
          </div>
          <div className="stat-number">{counts.newEnquiries ?? notifications.enquiries ?? 0}</div>
          <small className="stat-meta">{counts.totalEnquiries || 0} general messages</small>
        </Link>

        <Link
          to="/admin/newsletter"
          className="admin-stat-card admin-stat-card-link"
          aria-label="View Newsletter Subscribers"
        >
          <div className="stat-card-header">
            <span className="stat-label">SUBSCRIBERS</span>
            <div className="stat-icon-wrap">
              <Send size={20} />
            </div>
          </div>
          <div className="stat-number">{counts.totalSubscribers || 0}</div>
          <small className="stat-meta">{notifications.subscriptions || 0} new today</small>
        </Link>

        <Link
          to="/admin/products"
          className="admin-stat-card admin-stat-card-link"
          aria-label="View Catalogue Pieces"
        >
          <div className="stat-card-header">
            <span className="stat-label">CATALOGUE PIECES</span>
            <div className="stat-icon-wrap">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="stat-number">{counts.totalProducts || 0}</div>
          <small className="stat-meta">Across {counts.totalCollections || 0} collections</small>
        </Link>
      </div>

      {/* Split Section: Recent Consultations & Quick Shortcuts */}
      <div className="admin-dashboard-split">
        {/* Recent Consultations */}
        <div className="admin-card-panel">
          <div className="panel-head">
            <h3>Recent Private Consultations</h3>
            <Link to="/admin/consultations" className="text-link-gold">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          {(!stats.recentConsultations || stats.recentConsultations.length === 0) ? (
            <div className="admin-empty-state">
              <Clock size={32} />
              <p>No consultation requests submitted yet.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Project Type</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentConsultations.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <strong>{item.fullName}</strong>
                        <br />
                        <small>{item.email}</small>
                      </td>
                      <td>{item.projectType}</td>
                      <td>{item.projectLocation}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        <select
                          className="admin-inline-select"
                          value={item.status}
                          onChange={(e) => handleQuickStatus(item._id, e.target.value)}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="In Discussion">In Discussion</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts */}
        <div className="admin-card-panel">
          <div className="panel-head">
            <h3>CMS Quick Management</h3>
          </div>
          <div className="admin-quick-actions-list">
            <Link to="/admin/products" className="quick-action-row">
              <div className="quick-action-icon">
                <Sparkles size={18} />
              </div>
              <div className="quick-action-text">
                <h4>Manage Products</h4>
                <p>Add or edit luminaires, specs, finishes, and dimensions.</p>
              </div>
              <ArrowUpRight size={16} />
            </Link>

            <Link to="/admin/collections" className="quick-action-row">
              <div className="quick-action-icon">
                <Layers size={18} />
              </div>
              <div className="quick-action-text">
                <h4>Manage Collections</h4>
                <p>Architectural pendants, chandeliers, ambient systems.</p>
              </div>
              <ArrowUpRight size={16} />
            </Link>

            <Link to="/admin/projects" className="quick-action-row">
              <div className="quick-action-icon">
                <Building2 size={18} />
              </div>
              <div className="quick-action-text">
                <h4>Manage Portfolio</h4>
                <p>Showcase completed villas, hotels, and dining spaces.</p>
              </div>
              <ArrowUpRight size={16} />
            </Link>

            <Link to="/admin/settings" className="quick-action-row">
              <div className="quick-action-icon">
                <CheckCircle2 size={18} />
              </div>
              <div className="quick-action-text">
                <h4>Studio Settings & SEO</h4>
                <p>Update phone, WhatsApp concierge, and default meta tags.</p>
              </div>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
