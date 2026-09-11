import { useState, useEffect } from 'react';
import { collectionService } from '../../services/collectionService';
import { uploadService } from '../../services/uploadService';
import { Plus, Edit2, Trash2, Loader2, Layers, X, Upload, Image } from 'lucide-react';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

export default function CollectionsManager() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [imageMode, setImageMode] = useState('upload');
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    eyebrow: '',
    tagline: '',
    description: '',
    heroImage: '',
    heroImagePublicId: '',
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

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setUploadError('Unsupported format. Only JPG, PNG, and WEBP images are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit.');
      e.target.value = '';
      return;
    }

    try {
      setImageUploading(true);
      const res = await uploadService.uploadFile(file);
      if (res?.data?.url) {
        setFormData((prev) => ({
          ...prev,
          heroImage: res.data.url,
          heroImagePublicId: res.data.publicId || '',
        }));
      }
    } catch (err) {
      setUploadError(err?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handleClearHeroImage = () => {
    setFormData((prev) => ({
      ...prev,
      heroImage: '',
      heroImagePublicId: '',
    }));
    setUploadError(null);
  };

  const handleOpenCreate = () => {
    setEditingCollection(null);
    setImageMode('upload');
    setUploadError(null);
    setFormData({
      name: '',
      eyebrow: '01 / STATEMENT ELEGANCE',
      tagline: '',
      description: '',
      heroImage: '',
      heroImagePublicId: '',
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
    setImageMode(col.heroImagePublicId ? 'upload' : 'url');
    setUploadError(null);
    setFormData({
      name: col.name || col.title || '',
      eyebrow: col.eyebrow || '',
      tagline: col.tagline || '',
      description: col.description || '',
      heroImage: col.heroImage || col.image || '',
      heroImagePublicId: col.heroImagePublicId || '',
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
      <SEO title="Collections Management | LUX CMS" />
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

              {/* Hero Image Upload / URL */}
              <div className="admin-media-upload-section" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(243, 243, 235, 0.55)', textTransform: 'uppercase' }}>
                    HERO IMAGE *
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${imageMode === 'upload' ? 'btn-gold' : 'btn-outline'}`}
                      style={{ padding: '2px 10px', fontSize: '11px' }}
                      onClick={() => { setImageMode('upload'); setUploadError(null); }}
                    >
                      <Upload size={12} style={{ marginRight: '4px' }} /> Upload
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${imageMode === 'url' ? 'btn-gold' : 'btn-outline'}`}
                      style={{ padding: '2px 10px', fontSize: '11px' }}
                      onClick={() => { setImageMode('url'); setUploadError(null); }}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  <label
                    className="file-upload-box"
                    style={{
                      display: 'block',
                      padding: '16px',
                      borderRadius: '4px',
                      cursor: imageUploading ? 'wait' : 'pointer',
                      border: '1px dashed rgba(230, 199, 122, 0.3)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleFileSelect}
                      disabled={imageUploading}
                      className="file-input-hidden"
                    />
                    <div className="file-upload-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {imageUploading ? (
                        <>
                          <Loader2 size={16} className="spin-icon" style={{ color: 'var(--gold)' }} />
                          <span style={{ color: 'var(--gold)' }}>Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} style={{ color: 'var(--gold)' }} />
                          <span>Click to upload image (JPG, PNG, WEBP · Max 10MB)</span>
                        </>
                      )}
                    </div>
                  </label>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.heroImage}
                      onChange={(e) => setFormData({ ...formData, heroImage: e.target.value, heroImagePublicId: '' })}
                      placeholder="https://images.unsplash.com/... or external image URL"
                    />
                  </div>
                )}

                {uploadError && (
                  <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px', marginBottom: 0 }}>
                    {uploadError}
                  </p>
                )}

                {/* Thumbnail Preview Card */}
                {formData.heroImage && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '10px',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(230, 199, 122, 0.2)',
                      borderRadius: '4px',
                    }}
                  >
                    <img
                      src={formData.heroImage}
                      alt="Collection Hero Preview"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formData.heroImage}
                      </p>
                      <small style={{ fontSize: '10px', color: formData.heroImagePublicId ? '#4ade80' : 'rgba(243, 243, 235, 0.55)' }}>
                        {formData.heroImagePublicId ? '✓ Cloudinary Hosted' : 'External Image Link'}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="admin-action-btn danger"
                      onClick={handleClearHeroImage}
                      title="Clear image"
                      style={{ flexShrink: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Hidden input to ensure HTML5 required validation passes only when heroImage is non-empty */}
                <input
                  type="text"
                  required
                  value={formData.heroImage}
                  onChange={() => {}}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
                  tabIndex={-1}
                />
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
