import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { partnerService } from '../../services/partnerService';
import {
  Plus,
  Edit2,
  Trash2,
  Handshake,
  Loader2,
  X,
  ExternalLink,
  Search,
  RotateCw,
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';
import AdminImageUpload from '../../components/ui/AdminImageUpload';

export default function PartnersManager() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Modal states for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    logoPublicId: '',
    website: '',
    order: 0,
    isActive: true,
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const initialFormStateRef = useRef(null);

  // Modal state for Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Inline toggle loading tracking
  const [togglingId, setTogglingId] = useState(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getPartners({ adminView: true });
      setPartners(res.data || []);
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Fetch Error',
        message: err?.message || 'Failed to load client partners.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filteredPartners = partners.filter((p) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const website = (p.website || '').toLowerCase();
    return name.includes(query) || website.includes(query);
  });

  const isFormDirty = () => {
    if (!initialFormStateRef.current) return false;
    return JSON.stringify(formData) !== initialFormStateRef.current;
  };

  const handleAttemptCloseModal = () => {
    if (isFormDirty() && !modalLoading) {
      setDiscardConfirmOpen(true);
    } else {
      setIsModalOpen(false);
    }
  };

  const handleConfirmDiscard = () => {
    setDiscardConfirmOpen(false);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const isAnyModalOpen = isModalOpen || discardConfirmOpen || Boolean(deleteTarget);
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isModalOpen, discardConfirmOpen, deleteTarget]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !modalLoading) {
        if (discardConfirmOpen) {
          setDiscardConfirmOpen(false);
        } else {
          handleAttemptCloseModal();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, modalLoading, discardConfirmOpen, formData]);

  const handleOpenCreate = () => {
    const initialData = {
      name: '',
      logo: '',
      logoPublicId: '',
      website: '',
      order: partners.length > 0 ? Math.max(...partners.map((p) => p.order || 0)) + 1 : 1,
      isActive: true,
    };
    setEditingPartner(null);
    setFormData(initialData);
    initialFormStateRef.current = JSON.stringify(initialData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (partner) => {
    const initialData = {
      name: partner.name || '',
      logo: partner.logo || '',
      logoPublicId: partner.logoPublicId || '',
      website: partner.website || '',
      order: partner.order !== undefined ? partner.order : 0,
      isActive: partner.isActive !== false,
    };
    setEditingPartner(partner);
    setFormData(initialData);
    initialFormStateRef.current = JSON.stringify(initialData);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (partner) => {
    const newStatus = !partner.isActive;
    setTogglingId(partner._id);

    // Optimistic UI update
    setPartners((prev) =>
      prev.map((p) => (p._id === partner._id ? { ...p, isActive: newStatus } : p))
    );

    try {
      await partnerService.updatePartner(partner._id, { isActive: newStatus });
      setToast({
        type: 'success',
        title: 'Status Updated',
        message: `"${partner.name}" is now ${newStatus ? 'active' : 'hidden'}.`,
      });
    } catch (err) {
      // Revert optimistic update on failure
      setPartners((prev) =>
        prev.map((p) => (p._id === partner._id ? { ...p, isActive: partner.isActive } : p))
      );
      setToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Unable to toggle partner status.',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setToast({ type: 'error', title: 'Validation Error', message: 'Company name is required.' });
      return;
    }

    if (!formData.logo.trim()) {
      setToast({ type: 'error', title: 'Validation Error', message: 'Partner logo image is required.' });
      return;
    }

    if (formData.website && formData.website.trim()) {
      const trimmedUrl = formData.website.trim();
      try {
        const parsed = new URL(trimmedUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          setToast({ type: 'error', title: 'Validation Error', message: 'Website must start with http:// or https://' });
          return;
        }
      } catch {
        setToast({ type: 'error', title: 'Validation Error', message: 'Please provide a valid website URL.' });
        return;
      }
    }

    setModalLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        logo: formData.logo.trim(),
        logoPublicId: formData.logoPublicId ? formData.logoPublicId.trim() : '',
        website: formData.website ? formData.website.trim() : '',
        order: Number(formData.order) || 0,
        isActive: Boolean(formData.isActive),
      };

      if (editingPartner) {
        await partnerService.updatePartner(editingPartner._id, payload);
        setToast({
          type: 'success',
          title: 'Partner Updated',
          message: `Updated "${payload.name}" successfully.`,
        });
      } else {
        await partnerService.createPartner(payload);
        setToast({
          type: 'success',
          title: 'Partner Created',
          message: `Added "${payload.name}" to client partners.`,
        });
      }

      setIsModalOpen(false);
      fetchPartners();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Unable to save partner.',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await partnerService.deletePartner(deleteTarget._id);
      setToast({
        type: 'success',
        title: 'Partner Deleted',
        message: `"${deleteTarget.name}" removed successfully.`,
      });
      setDeleteTarget(null);
      fetchPartners();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Delete Failed',
        message: err?.message || 'Failed to delete partner.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <SEO title="Client Partners CMS | LUX BASED INDUSTRY" robots="noindex, nofollow" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ModalConfirm
        isOpen={Boolean(deleteTarget)}
        title="Delete Client Partner"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? Its associated logo on Cloudinary will also be destroyed.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Unsaved Changes Confirmation Modal */}
      <ModalConfirm
        isOpen={discardConfirmOpen}
        title="Discard Unsaved Changes?"
        message="You have unsaved changes in this partner form. Are you sure you want to discard them and close the dialog?"
        confirmLabel="Discard & Exit"
        cancelLabel="Continue Editing"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardConfirmOpen(false)}
      />

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">CLIENT RECOGNITION</span>
          <h1>Brand Partners & Corporate Clients</h1>
        </div>
        <div className="admin-header-actions">
          <button onClick={handleOpenCreate} className="btn btn-gold btn-sm">
            <Plus size={16} /> ADD PARTNER
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <div className="admin-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search partners by company name or website..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', color: 'rgba(243,243,235,0.5)', cursor: 'pointer' }}
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="admin-toolbar-right">
          <button
            type="button"
            className="admin-refresh-btn"
            onClick={fetchPartners}
            disabled={loading}
            title="Refresh partners"
          >
            <RotateCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Partners List Table */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-table-loading">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading partners...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="admin-empty-state">
            <Handshake size={48} className="empty-icon" />
            <h3>No Client Partners Found</h3>
            <p>Try adjusting your search filter or click below to add a new partner.</p>
            <button onClick={handleOpenCreate} className="btn btn-gold btn-sm mt-4">
              <Plus size={16} /> ADD PARTNER
            </button>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Logo</th>
                  <th>Company Name</th>
                  <th>Website URL</th>
                  <th style={{ width: '90px' }}>Order</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPartners.map((partner) => (
                  <tr key={partner._id}>
                    <td>
                      <div className="partner-table-logo-cell">
                        <img
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          className="partner-table-img"
                        />
                      </div>
                    </td>
                    <td>
                      <strong className="partner-name-text">{partner.name}</strong>
                    </td>
                    <td>
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="partner-table-link"
                        >
                          <span>{partner.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className="partner-order-badge">#{partner.order || 0}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(partner)}
                        disabled={togglingId === partner._id}
                        className="btn-status-toggle"
                        title="Click to toggle visibility"
                      >
                        <StatusBadge status={partner.isActive ? 'approved' : 'rejected'}>
                          {partner.isActive ? 'Active' : 'Hidden'}
                        </StatusBadge>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(partner)}
                          className="admin-action-btn"
                          title="Edit Partner"
                          aria-label={`Edit ${partner.name}`}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(partner)}
                          className="admin-action-btn danger"
                          title="Delete Partner"
                          aria-label={`Delete ${partner.name}`}
                        >
                          <Trash2 size={15} />
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="admin-modal-backdrop" onClick={() => !modalLoading && handleAttemptCloseModal()}>
          <div
            className="admin-modal admin-modal-dark modal-container admin-partner-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-modal-title"
          >
            <div className="admin-modal-header modal-header">
              <h3 id="partner-modal-title">{editingPartner ? 'Edit Client Partner' : 'Add Client Partner'}</h3>
              <button
                className="admin-modal-close-btn modal-close"
                onClick={handleAttemptCloseModal}
                disabled={modalLoading}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body admin-modal-body">
                {/* 1. COMPANY NAME */}
                <div className="form-group">
                  <label htmlFor="partner-name">
                    Company / Partner Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="partner-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Nakheel Developments"
                    required
                    maxLength={100}
                    disabled={modalLoading}
                  />
                </div>

                {/* 2. PARTNER LOGO (AdminImageUpload) */}
                <div className="form-group">
                  <AdminImageUpload
                    label="COMPANY LOGO"
                    value={formData.logo}
                    publicId={formData.logoPublicId}
                    onChange={({ url, publicId }) =>
                      setFormData((prev) => ({ ...prev, logo: url, logoPublicId: publicId }))
                    }
                    onClear={() =>
                      setFormData((prev) => ({ ...prev, logo: '', logoPublicId: '' }))
                    }
                    disabled={modalLoading}
                    folder="partners"
                    required={true}
                    aspectRatioHelp="Recommended: PNG / SVG with transparent background"
                  />
                </div>

                {/* 3. WEBSITE URL */}
                <div className="form-group">
                  <label htmlFor="partner-website">Website URL (Optional)</label>
                  <input
                    id="partner-website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                    maxLength={500}
                    disabled={modalLoading}
                  />
                </div>

                {/* 4. TIER / CATEGORY */}
                <div className="form-group">
                  <label htmlFor="partner-tier">Partner Tier / Category</label>
                  <select
                    id="partner-tier"
                    value={formData.tier}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tier: e.target.value }))}
                    disabled={modalLoading}
                  >
                    <option value="featured">Featured (Top Priority)</option>
                    <option value="standard">Standard Partner</option>
                    <option value="collaborator">Design Collaborator</option>
                    <option value="hospitality">Hospitality Client</option>
                    <option value="developer">Property Developer</option>
                    <option value="architect">Architectural Studio</option>
                  </select>
                </div>

                {/* 5. DISPLAY ORDER */}
                <div className="form-group">
                  <label htmlFor="partner-order">Display Order (Lower numbers appear first)</label>
                  <input
                    id="partner-order"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 0 }))}
                    disabled={modalLoading}
                  />
                </div>

                {/* 6. STATUS */}
                <div className="form-group">
                  <div className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                      />
                      <span>Active on public website</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleAttemptCloseModal}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold btn-sm"
                  disabled={modalLoading || !formData.logo}
                >
                  {modalLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : editingPartner ? (
                    'Update Partner'
                  ) : (
                    'Add Partner'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
