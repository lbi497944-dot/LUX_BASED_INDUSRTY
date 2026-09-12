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
  ArrowUpRight,
  Loader2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import SEO from '../../components/common/SEO';

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await statsService.getDashboardStats();
      setStats(res.data);
    } catch {
      // Fallback empty stats
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

      {/* Metrics Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">NEW CONSULTATIONS</span>
            <div className="stat-icon-wrap highlight">
              <CalendarCheck2 size={20} />
            </div>
          </div>
          <div className="stat-number">{counts.newConsultations || 0}</div>
          <small className="stat-meta">{counts.totalConsultations || 0} total leads recorded</small>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">NEW ENQUIRIES</span>
            <div className="stat-icon-wrap">
              <Mail size={20} />
            </div>
          </div>
          <div className="stat-number">{counts.newEnquiries || 0}</div>
          <small className="stat-meta">{counts.totalEnquiries || 0} general messages</small>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">SUBSCRIBERS</span>
            <div className="stat-icon-wrap">
              <Send size={20} />
            </div>
          </div>
          <div className="stat-number">{counts.totalSubscribers || 0}</div>
          <small className="stat-meta">Active newsletter readership</small>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">CATALOGUE PIECES</span>
            <div className="stat-icon-wrap">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="stat-number">{counts.totalProducts || 0}</div>
          <small className="stat-meta">Across {counts.totalCollections || 0} collections</small>
        </div>
      </div>

      {/* Split Section: Recent Consultations & Recent Enquiries */}
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
