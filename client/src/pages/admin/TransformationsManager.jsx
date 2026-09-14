import { useState, useEffect } from 'react';
import { transformationService } from '../../services/transformationService';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Sliders,
  Sparkles,
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';
import AdminImageUpload from '../../components/ui/AdminImageUpload';

export default function TransformationsManager() {
  const [transformations, setTransformations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal states for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    detailedDescription: '',
    beforeImage: '',
    beforePublicId: '',
    afterImage: '',
    afterPublicId: '',
    order: 0,
    isActive: true,
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Modal state for Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Inline toggle loading tracking
  const [togglingId, setTogglingId] = useState(null);

  const fetchTransformations = async () => {
    try {
      setLoading(true);
      const res = await transformationService.getAllTransformations();
      setTransformations(res.data || []);
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Fetch Error',
        message: err?.message || 'Failed to load transformations.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransformations();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen && !modalLoading) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, modalLoading]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      shortDescription: '',
      detailedDescription: '',
      beforeImage: '',
      beforePublicId: '',
      afterImage: '',
      afterPublicId: '',
      order: transformations.length > 0 ? Math.max(...transformations.map((t) => t.order || 0)) + 1 : 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      shortDescription: item.shortDescription || '',
      detailedDescription: item.detailedDescription || '',
      beforeImage: item.beforeImage || '',
      beforePublicId: item.beforePublicId || '',
      afterImage: item.afterImage || '',
      afterPublicId: item.afterPublicId || '',
      order: item.order !== undefined ? item.order : 0,
      isActive: item.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (item) => {
    const newStatus = !item.isActive;
    setTogglingId(item._id);

    // Optimistic UI update
    setTransformations((prev) =>
      prev.map((t) => (t._id === item._id ? { ...t, isActive: newStatus } : t))
    );

    try {
      await transformationService.updateTransformation(item._id, { isActive: newStatus });
      setToast({
        type: 'success',
        title: 'Status Updated',
        message: `"${item.title}" is now ${newStatus ? 'active' : 'hidden'}.`,
      });
    } catch (err) {
      // Revert optimistic update on failure
      setTransformations((prev) =>
        prev.map((t) => (t._id === item._id ? { ...t, isActive: item.isActive } : t))
      );
      setToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Unable to toggle status.',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setToast({ type: 'error', title: 'Validation Error', message: 'Transformation title is required.' });
      return;
    }

    if (!formData.beforeImage.trim()) {
      setToast({ type: 'error', title: 'Validation Error', message: 'Before photo is required.' });
      return;
    }

    if (!formData.afterImage.trim()) {
      setToast({ type: 'error', title: 'Validation Error', message: 'After photo is required.' });
      return;
    }

    setModalLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim(),
        detailedDescription: formData.detailedDescription.trim(),
        beforeImage: formData.beforeImage.trim(),
        beforePublicId: formData.beforePublicId ? formData.beforePublicId.trim() : '',
        afterImage: formData.afterImage.trim(),
        afterPublicId: formData.afterPublicId ? formData.afterPublicId.trim() : '',
        order: Number(formData.order) || 0,
        isActive: Boolean(formData.isActive),
      };

      if (editingItem) {
        await transformationService.updateTransformation(editingItem._id, payload);
        setToast({
          type: 'success',
          title: 'Transformation Updated',
          message: `Updated "${payload.title}" successfully.`,
        });
      } else {
        await transformationService.createTransformation(payload);
        setToast({
          type: 'success',
          title: 'Transformation Created',
          message: `Created "${payload.title}" successfully.`,
        });
      }

      setIsModalOpen(false);
      fetchTransformations();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Unable to save transformation.',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await transformationService.deleteTransformation(deleteTarget._id);
      setToast({
        type: 'success',
        title: 'Transformation Deleted',
        message: `"${deleteTarget.title}" removed successfully.`,
      });
      setDeleteTarget(null);
      fetchTransformations();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Delete Failed',
        message: err?.message || 'Failed to delete transformation.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <SEO title="Transformations CMS | LUX BASED INDUSTRY" robots="noindex, nofollow" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ModalConfirm
        isOpen={Boolean(deleteTarget)}
        title="Delete Transformation"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? Both associated Before and After photos on Cloudinary will also be destroyed.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2>The Transformation</h2>
          <p>Manage before & after architectural lighting comparisons displayed on the public Home page.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-gold btn-sm">
          <Plus size={16} /> Add Transformation
        </button>
      </div>

      {/* Transformations List Table */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-table-loading">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading transformations...</p>
          </div>
        ) : transformations.length === 0 ? (
          <div className="admin-empty-state">
            <Sliders size={48} className="empty-icon" />
            <h3>No Transformations Configured</h3>
            <p>Add your first architectural lighting case study to empower the interactive before/after slider.</p>
            <button onClick={handleOpenCreate} className="btn btn-gold btn-sm mt-4">
              <Plus size={16} /> Add First Transformation
            </button>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Before / After</th>
                  <th>Title & Description</th>
                  <th style={{ width: '90px' }}>Order</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transformations.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="transformation-table-dual-thumbs">
                        <div className="transformation-thumb-wrap" title="Before: Unlit Space">
                          <img src={item.beforeImage} alt="Before" className="transformation-table-img" />
                          <span className="thumb-tag tag-before">BEFORE</span>
                        </div>
                        <div className="transformation-thumb-wrap" title="After: Illuminated">
                          <img src={item.afterImage} alt="After" className="transformation-table-img" />
                          <span className="thumb-tag tag-after">AFTER</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong className="partner-name-text">{item.title}</strong>
                      {item.shortDescription && (
                        <p className="admin-table-subtext">{item.shortDescription}</p>
                      )}
                    </td>
                    <td>
                      <span className="partner-order-badge">#{item.order || 0}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        disabled={togglingId === item._id}
                        className="btn-status-toggle"
                        title="Click to toggle visibility"
                      >
                        <StatusBadge status={item.isActive ? 'approved' : 'rejected'}>
                          {item.isActive ? 'Active' : 'Hidden'}
                        </StatusBadge>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="btn-icon"
                          title="Edit Transformation"
                          aria-label={`Edit ${item.title}`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="btn-icon text-danger"
                          title="Delete Transformation"
                          aria-label={`Delete ${item.title}`}
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => !modalLoading && setIsModalOpen(false)}>
          <div className="modal-container admin-transformation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Transformation' : 'Add Transformation'}</h3>
              <button
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
                disabled={modalLoading}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {/* 1. TITLE */}
                <div className="form-group">
                  <label className="field-label">
                    CASE STUDY TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    placeholder="e.g. Penthouse Grand Salon & Gallery Illumination"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                {/* 2. DUAL PHOTOS (BEFORE & AFTER) */}
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <AdminImageUpload
                    label="BEFORE PHOTO (UNLIT)"
                    required
                    value={formData.beforeImage}
                    publicId={formData.beforePublicId}
                    onChange={({ url, publicId }) =>
                      setFormData((prev) => ({ ...prev, beforeImage: url, beforePublicId: publicId }))
                    }
                    helpText="Unlit space (JPG, PNG, WEBP · Max 10MB)"
                  />
                  <AdminImageUpload
                    label="AFTER PHOTO (ILLUMINATED)"
                    required
                    value={formData.afterImage}
                    publicId={formData.afterPublicId}
                    onChange={({ url, publicId }) =>
                      setFormData((prev) => ({ ...prev, afterImage: url, afterPublicId: publicId }))
                    }
                    helpText="Illuminated space (JPG, PNG, WEBP · Max 10MB)"
                  />
                </div>

                {/* 3. SHORT DESCRIPTION */}
                <div className="form-group mt-2">
                  <label className="field-label">
                    SHORT SUMMARY (CARD VIEW) <span className="optional-tag">(MAX 300 CHARS)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={300}
                    placeholder="e.g. Masterful cove integration with bespoke low-glare crystal fixtures."
                    value={formData.shortDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                  />
                </div>

                {/* 4. DETAILED DESCRIPTION */}
                <div className="form-group">
                  <label className="field-label">
                    CASE STUDY DETAILS <span className="optional-tag">(MAX 2000 CHARS)</span>
                  </label>
                  <textarea
                    rows={4}
                    maxLength={2000}
                    placeholder="Describe the spatial geometry, ambient layering, lux levels, and architectural fixtures engineered for this space..."
                    value={formData.detailedDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, detailedDescription: e.target.value }))}
                  />
                </div>

                {/* 5. ORDER & ACTIVE TOGGLE */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="field-label">
                      DISPLAY ORDER
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 0 }))}
                    />
                    <small className="field-hint">
                      Ascending sort order in the public slider (1, 2, 3...).
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="field-label">
                      VISIBILITY STATUS
                    </label>
                    <label className="admin-checkbox-label mt-2">
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

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold btn-sm"
                  disabled={modalLoading || !formData.beforeImage || !formData.afterImage}
                >
                  {modalLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : editingItem ? (
                    'Update Transformation'
                  ) : (
                    'Add Transformation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
