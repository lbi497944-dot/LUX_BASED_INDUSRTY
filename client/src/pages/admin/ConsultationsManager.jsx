import { useState, useEffect } from 'react';
import { consultationService } from '../../services/consultationService';
import { CalendarCheck2, Filter, Trash2, Eye, FileText, Phone, Mail, MapPin, Loader2, X, MessageCircle } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

export default function ConsultationsManager() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedLead, setSelectedLead] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await consultationService.getConsultations({ status: selectedStatus });
      setConsultations(res.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [selectedStatus]);

  const handleOpenDetail = (item) => {
    setSelectedLead(item);
    setAdminNotes(item.adminNotes || '');
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await consultationService.updateStatus(id, newStatus);
      setToast({ type: 'success', title: 'Status Updated', message: `Lead status changed to ${newStatus}.` });
      if (selectedLead && selectedLead._id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
      fetchConsultations();
    } catch (err) {
      setToast({ type: 'error', title: 'Update Failed', message: err?.message || 'Error updating status.' });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setNotesSaving(true);
    try {
      await consultationService.updateNotes(selectedLead._id, adminNotes);
      setToast({ type: 'success', title: 'Notes Saved', message: 'Internal admin notes updated.' });
      setSelectedLead({ ...selectedLead, adminNotes });
      fetchConsultations();
    } catch (err) {
      setToast({ type: 'error', title: 'Save Failed', message: err?.message || 'Error saving notes.' });
    } finally {
      setNotesSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await consultationService.deleteConsultation(deleteTarget._id);
      setToast({ type: 'success', title: 'Lead Removed', message: 'Consultation request deleted.' });
      setDeleteTarget(null);
      if (selectedLead && selectedLead._id === deleteTarget._id) {
        setSelectedLead(null);
      }
      fetchConsultations();
    } catch (err) {
      setToast({ type: 'error', title: 'Delete Failed', message: err?.message || 'Error removing lead.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Consultation Leads | Veloura CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ModalConfirm
        isOpen={Boolean(deleteTarget)}
        title="Delete Consultation Lead"
        message={`Are you sure you want to remove the consultation request for ${deleteTarget?.fullName}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">LEAD MANAGEMENT CRM</span>
          <h1>Private Consultations</h1>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-filter-group">
          <Filter size={16} />
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="In Discussion">In Discussion</option>
            <option value="Quoted">Quoted</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="admin-card-panel">
        {loading ? (
          <div className="admin-loading-container">
            <Loader2 className="spin-icon" size={32} />
            <p>Loading Consultations...</p>
          </div>
        ) : consultations.length === 0 ? (
          <div className="admin-empty-state">
            <CalendarCheck2 size={36} />
            <h3>No consultation requests found</h3>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Project Type</th>
                  <th>Location</th>
                  <th>Budget</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.fullName}</strong>
                      <br />
                      <small>{item.email}</small>
                    </td>
                    <td>{item.projectType}</td>
                    <td>{item.projectLocation}</td>
                    <td>{item.estimatedBudget || 'Not specified'}</td>
                    <td>
                      <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <select
                        className="admin-inline-select"
                        value={item.status}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Discussion">In Discussion</option>
                        <option value="Quoted">Quoted</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-row-actions">
                        <button
                          className="admin-action-btn"
                          onClick={() => handleOpenDetail(item)}
                          title="View lead details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="admin-action-btn danger"
                          onClick={() => setDeleteTarget(item)}
                          title="Delete lead"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="modal-backdrop" onClick={() => setSelectedLead(null)}>
          <div className="modal-container admin-lead-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-luxury">
              <div>
                <span className="eyebrow gold-label">APPOINTMENT DOSSIER</span>
                <h3>{selectedLead.fullName}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedLead(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-lead-body">
              <div className="lead-meta-grid">
                <div className="lead-meta-box">
                  <Mail size={16} className="gold-icon" />
                  <div>
                    <small>EMAIL</small>
                    <p><a href={`mailto:${selectedLead.email}`}>{selectedLead.email}</a></p>
                  </div>
                </div>

                <div className="lead-meta-box">
                  <Phone size={16} className="gold-icon" />
                  <div>
                    <small>PHONE / WHATSAPP</small>
                    <p><a href={`tel:${selectedLead.phone}`}>{selectedLead.phone}</a></p>
                  </div>
                </div>

                <div className="lead-meta-box">
                  <MapPin size={16} className="gold-icon" />
                  <div>
                    <small>LOCATION</small>
                    <p>{selectedLead.projectLocation}</p>
                  </div>
                </div>

                <div className="lead-meta-box">
                  <FileText size={16} className="gold-icon" />
                  <div>
                    <small>PROJECT TYPE & STAGE</small>
                    <p>{selectedLead.projectType} · {selectedLead.projectStage}</p>
                  </div>
                </div>
              </div>

              <div className="lead-section-box">
                <h4>Lighting Brief & Requirements</h4>
                <p><strong>Primary Requirement:</strong> {selectedLead.lightingRequirements}</p>
                <p><strong>Estimated Budget:</strong> {selectedLead.estimatedBudget}</p>
                {selectedLead.message && (
                  <div className="lead-message-quote">
                    <p>{selectedLead.message}</p>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {selectedLead.attachments && selectedLead.attachments.length > 0 && (
                <div className="lead-section-box">
                  <h4>Uploaded Reference Drawings & Blueprints</h4>
                  <div className="lead-attachment-list">
                    {selectedLead.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-link-btn"
                      >
                        <FileText size={16} />
                        <span>{att.filename || 'View Attached Floor Plan / Reference'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Internal Notes */}
              <div className="lead-section-box">
                <h4>Internal Studio Notes</h4>
                <textarea
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record call logs, quote revisions, architect contact info, or next steps..."
                ></textarea>
                <button
                  type="button"
                  className="btn btn-gold btn-sm"
                  onClick={handleSaveNotes}
                  disabled={notesSaving}
                  style={{ marginTop: '8px' }}
                >
                  {notesSaving ? 'Saving Notes...' : 'Save Internal Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
