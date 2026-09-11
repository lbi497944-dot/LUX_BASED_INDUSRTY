import { useState, useEffect } from 'react';
import { contactService } from '../../services/contactService';
import { Mail, Phone, MapPin, Eye, Trash2, Filter, Loader2, X, Clock } from 'lucide-react';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

export default function ContactEnquiriesManager() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await contactService.getContacts({ status: selectedStatus });
      setEnquiries(res.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [selectedStatus]);

  const handleOpenDetail = (item) => {
    setSelectedEnquiry(item);
    setAdminNotes(item.adminNotes || '');
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await contactService.updateStatus(id, newStatus);
      setToast({ type: 'success', title: 'Status Updated', message: `Enquiry status changed to ${newStatus}.` });
      if (selectedEnquiry && selectedEnquiry._id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      }
      fetchEnquiries();
    } catch (err) {
      setToast({ type: 'error', title: 'Update Failed', message: err?.message || 'Error updating status.' });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    setNotesSaving(true);
    try {
      await contactService.updateNotes(selectedEnquiry._id, adminNotes);
      setToast({ type: 'success', title: 'Notes Saved', message: 'Internal admin notes updated.' });
      setSelectedEnquiry({ ...selectedEnquiry, adminNotes });
      fetchEnquiries();
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
      await contactService.deleteContact(deleteTarget._id);
      setToast({ type: 'success', title: 'Enquiry Deleted', message: 'Enquiry removed from database.' });
      setDeleteTarget(null);
      if (selectedEnquiry && selectedEnquiry._id === deleteTarget._id) {
        setSelectedEnquiry(null);
      }
      fetchEnquiries();
    } catch (err) {
      setToast({ type: 'error', title: 'Delete Failed', message: err?.message || 'Error removing enquiry.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Contact Enquiries | LUX CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ModalConfirm
        isOpen={Boolean(deleteTarget)}
        title="Delete Enquiry"
        message={`Are you sure you want to remove the enquiry from ${deleteTarget?.name}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">STUDIO DIRECTORY</span>
          <h1>Contact Messages</h1>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-filter-group">
          <Filter size={16} />
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Resolved">Resolved</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="admin-card-panel">
        {loading ? (
          <div className="admin-loading-container">
            <Loader2 className="spin-icon" size={32} />
            <p>Loading Enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="admin-empty-state">
            <Mail size={36} />
            <h3>No contact messages found</h3>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Phone</th>
                  <th>Project Type</th>
                  <th>Location</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.name}</strong>
                      <br />
                      <small>{item.email}</small>
                    </td>
                    <td>{item.phone || '—'}</td>
                    <td>{item.projectType || 'General'}</td>
                    <td>{item.location || '—'}</td>
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
                        <option value="Resolved">Resolved</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-row-actions">
                        <button
                          className="admin-action-btn"
                          onClick={() => handleOpenDetail(item)}
                          title="View message"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="admin-action-btn danger"
                          onClick={() => setDeleteTarget(item)}
                          title="Delete message"
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

      {/* Detail Modal */}
      {selectedEnquiry && (
        <div className="modal-backdrop" onClick={() => setSelectedEnquiry(null)}>
          <div className="modal-container admin-lead-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-luxury">
              <div>
                <span className="eyebrow gold-label">CONTACT DOSSIER</span>
                <h3>{selectedEnquiry.name}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedEnquiry(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-lead-body">
              <div className="lead-meta-grid">
                <div className="lead-meta-box">
                  <Mail size={16} className="gold-icon" />
                  <div>
                    <small>EMAIL</small>
                    <p><a href={`mailto:${selectedEnquiry.email}`}>{selectedEnquiry.email}</a></p>
                  </div>
                </div>

                <div className="lead-meta-box">
                  <Phone size={16} className="gold-icon" />
                  <div>
                    <small>PHONE</small>
                    <p>{selectedEnquiry.phone ? <a href={`tel:${selectedEnquiry.phone}`}>{selectedEnquiry.phone}</a> : 'Not provided'}</p>
                  </div>
                </div>

                <div className="lead-meta-box">
                  <MapPin size={16} className="gold-icon" />
                  <div>
                    <small>LOCATION</small>
                    <p>{selectedEnquiry.location || 'Not provided'}</p>
                  </div>
                </div>

                <div className="lead-meta-box">
                  <Clock size={16} className="gold-icon" />
                  <div>
                    <small>RECEIVED DATE</small>
                    <p>{new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="lead-section-box">
                <h4>Enquiry Message</h4>
                <div className="lead-message-quote">
                  <p>{selectedEnquiry.message}</p>
                </div>
              </div>

              <div className="lead-section-box">
                <h4>Internal Studio Notes</h4>
                <textarea
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record response timestamp, assigned designer, or follow-up notes..."
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
