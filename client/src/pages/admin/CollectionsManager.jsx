import { useState, useEffect } from 'react';
import { collectionService } from '../../services/collectionService';
import { Plus, Edit2, Trash2, Loader2, Layers, X } from 'lucide-react';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

export default function CollectionsManager() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    eyebrow: '',
    tagline: '',
    description: '',
    heroImage: '',
    materials: '',
    applications: '',
    featuresText: '',
    featured: false,
    isActive: true,
  });
  const [modalLoading, setModalLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await collectionService.getCollections({ adminView: true });
      setCollections(res.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleOpenCreate = () => {
    setEditingCollection(null);
    setFormData({
      name: '',
      eyebrow: '01 / STATEMENT ELEGANCE',
      tagline: '',
      description: '',
      heroImage: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1400&q=85',
      materials: '',
      applications: '',
      featuresText: 'Hand-blown Czech crystal elements\nCustom drop lengths available\nPrecision 2700K warm LED illumination',
      featured: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col) => {
    setEditingCollection(col);
    setFormData({
      name: col.name || col.title || '',
      eyebrow: col.eyebrow || '',
      tagline: col.tagline || '',
      description: col.description || '',
      heroImage: col.heroImage || col.image || '',
      materials: col.materials || '',
      applications: col.applications || '',
      featuresText: Array.isArray(col.features) ? col.features.join('\n') : '',
      featured: col.featured || false,
      isActive: col.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    const payload = {
      ...formData,
      features: formData.featuresText.split('\n').map((f) => f.trim()).filter(Boolean),
    };

    try {
      if (editingCollection) {
        await collectionService.updateCollection(editingCollection._id, payload);
        setToast({ type: 'success', title: 'Collection Updated', message: `${formData.name} updated successfully.` });
      } else {
        await collectionService.createCollection(payload);
        setToast({ type: 'success', title: 'Collection Created', message: `${formData.name} added to collections.` });
      }
      setIsModalOpen(false);
      fetchCollections();
    } catch (err) {
      setToast({ type: 'error', title: 'Action Failed', message: err?.message || 'Error saving collection.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      await collectionService.deleteCollection(deleteTarget._id);
      setToast({ type: 'success', title: 'Collection Deleted', message: 'Collection removed from database.' });
      setDeleteTarget(null);
      fetchCollections();
    } catch (err) {
      setToast({ type: 'error', title: 'Delete Failed', message: err?.message || 'Error deleting collection.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Collections Management | Veloura CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ModalConfirm
        isOpen={Boolean(deleteTarget)}
        title="Delete Collection"
        message={`Are you sure you want to delete "${deleteTarget?.name || deleteTarget?.title}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">CURATED CATEGORIES</span>
          <h1>Lighting Collections</h1>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-gold btn-sm" onClick={handleOpenCreate}>
            <Plus size={16} /> ADD NEW COLLECTION
          </button>
        </div>
      </div>

      <div className="admin-card-panel">
        {loading ? (
          <div className="admin-loading-container">
            <Loader2 className="spin-icon" size={32} />
            <p>Loading Collections...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="admin-empty-state">
            <Layers size={36} />
            <h3>No collections found</h3>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>Tagline</th>
                  <th>Features</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((col) => (
                  <tr key={col._id || col.slug}>
                    <td>
                      <div className="admin-table-product-cell">
                        <img src={col.heroImage || col.image} alt={col.name || col.title} className="product-thumb" />
                        <div>
                          <strong>{col.name || col.title}</strong>
                          <small>/{col.slug}</small>
                        </div>
                      </div>
                    </td>
                    <td>{col.tagline}</td>
                    <td>{col.features?.length || 0} specs</td>
                    <td>
                      {col.featured ? <span className="badge-featured">★ Featured</span> : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <span className={`status-badge ${col.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                        {col.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-row-actions">
                        <button className="admin-action-btn" onClick={() => handleOpenEdit(col)} title="Edit collection">
                          <Edit2 size={16} />
                        </button>
                        <button className="admin-action-btn danger" onClick={() => setDeleteTarget(col)} title="Delete collection">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container admin-editor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-luxury">
              <h3>{editingCollection ? 'Edit Collection' : 'Add New Collection'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid">
              <div className="form-row">
                <label>
                  COLLECTION TITLE *
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Grand Chandeliers"
                  />
                </label>
                <label>
                  EYEBROW LABEL
                  <input
                    type="text"
                    value={formData.eyebrow}
                    onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                    placeholder="e.g. 01 / STATEMENT ELEGANCE"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  TAGLINE *
                  <input
                    type="text"
                    required
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Timeless elegance in every crystal."
                  />
                </label>
                <label>
                  HERO IMAGE URL *
                  <input
                    type="url"
                    required
                    value={formData.heroImage}
                    onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                    placeholder="https://..."
                  />
                </label>
              </div>

              <label>
                DESCRIPTION *
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Architectural overview of this collection..."
                ></textarea>
              </label>

              <div className="form-row">
                <label>
                  MATERIALS & FINISHES
                  <input
                    type="text"
                    value={formData.materials}
                    onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                    placeholder="Solid Brushed Brass, Hand-Cut Lead-Free Crystal"
                  />
                </label>
                <label>
                  RECOMMENDED APPLICATIONS
                  <input
                    type="text"
                    value={formData.applications}
                    onChange={(e) => setFormData({ ...formData, applications: e.target.value })}
                    placeholder="Grand foyers, double-height living rooms"
                  />
                </label>
              </div>

              <label>
                KEY FEATURES & TECHNICAL CHARACTERISTICS (One per line)
                <textarea
                  rows="3"
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="Hand-blown Czech crystal elements&#10;Custom drop lengths available&#10;DALI / 0-10V dimming"
                ></textarea>
              </label>

              <div className="form-checkbox-row">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Feature on Homepage</span>
                </label>
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active in Public Navigation</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold btn-sm" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : editingCollection ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
