import { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { uploadService } from '../../services/uploadService';
import { Plus, Edit2, Trash2, Search, Filter, Loader2, Building2, X, Upload, Image } from 'lucide-react';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

export default function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'url'
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState(null);
  const [galleryExternalUrl, setGalleryExternalUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    category: 'Residential',
    year: '2025',
    description: '',
    scope: '',
    coverImage: '',
    coverImagePublicId: '',
    gallery: [],
    galleryPublicIds: [],
    featured: false,
    isActive: true,
  });
  const [modalLoading, setModalLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjects({ adminView: true, category: selectedCategory });
      setProjects(res.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory]);

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
          coverImage: res.data.url,
          coverImagePublicId: res.data.publicId || '',
        }));
      }
    } catch (err) {
      setUploadError(err?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handleClearCoverImage = () => {
    setFormData((prev) => ({
      ...prev,
      coverImage: '',
      coverImagePublicId: '',
    }));
    setUploadError(null);
  };

  const handleGalleryFilesSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setGalleryUploadError(null);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    for (const file of files) {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(ext)) {
        setGalleryUploadError(`Unsupported format for "${file.name}". Only JPG, PNG, and WEBP are allowed.`);
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setGalleryUploadError(`File "${file.name}" exceeds the 10MB limit.`);
        e.target.value = '';
        return;
      }
    }

    try {
      setGalleryUploading(true);
      if (files.length === 1) {
        const res = await uploadService.uploadFile(files[0]);
        if (res?.data?.url) {
          setFormData((prev) => ({
            ...prev,
            gallery: [...prev.gallery, res.data.url],
            galleryPublicIds: [...prev.galleryPublicIds, res.data.publicId || ''],
          }));
        }
      } else {
        const res = await uploadService.uploadMultiple(files);
        const uploaded = Array.isArray(res?.data) ? res.data : [];
        const newUrls = uploaded.map((item) => item.url).filter(Boolean);
        const newPublicIds = uploaded.map((item) => item.publicId || '');
        if (newUrls.length > 0) {
          setFormData((prev) => ({
            ...prev,
            gallery: [...prev.gallery, ...newUrls],
            galleryPublicIds: [...prev.galleryPublicIds, ...newPublicIds],
          }));
        }
      }
    } catch (err) {
      setGalleryUploadError(err?.message || 'Failed to upload gallery image(s).');
    } finally {
      setGalleryUploading(false);
      e.target.value = '';
    }
  };

  const handleAddExternalGalleryUrl = (e) => {
    e.preventDefault();
    if (!galleryExternalUrl || !galleryExternalUrl.trim()) return;
    const trimmed = galleryExternalUrl.trim();
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, trimmed],
      galleryPublicIds: [...prev.galleryPublicIds, ''],
    }));
    setGalleryExternalUrl('');
    setGalleryUploadError(null);
  };

  const handleRemoveGalleryItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
      galleryPublicIds: prev.galleryPublicIds.filter((_, i) => i !== index),
    }));
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      location: 'Dubai, UAE',
      category: 'Residential',
      year: '2025',
      description: '',
      scope: 'Interior Lighting Design, Custom Chandelier Fabrication',
      coverImage: '',
      coverImagePublicId: '',
      gallery: [],
      galleryPublicIds: [],
      featured: false,
      isActive: true,
    });
    setImageMode('upload');
    setUploadError(null);
    setGalleryUploadError(null);
    setGalleryExternalUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setFormData({
      title: proj.title || '',
      location: proj.location || '',
      category: proj.category || 'Residential',
      year: proj.year || '2025',
      description: proj.description || '',
      scope: proj.scope || '',
      coverImage: proj.coverImage || proj.image || '',
      coverImagePublicId: proj.coverImagePublicId || '',
      gallery: Array.isArray(proj.gallery) ? [...proj.gallery] : [],
      galleryPublicIds: Array.isArray(proj.galleryPublicIds) ? [...proj.galleryPublicIds] : [],
      featured: proj.featured || false,
      isActive: proj.isActive !== false,
    });
    setImageMode(proj.coverImagePublicId ? 'upload' : 'url');
    setUploadError(null);
    setGalleryUploadError(null);
    setGalleryExternalUrl('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (editingProject) {
        await projectService.updateProject(editingProject._id, formData);
        setToast({ type: 'success', title: 'Project Updated', message: `${formData.title} updated successfully.` });
      } else {
        await projectService.createProject(formData);
        setToast({ type: 'success', title: 'Project Created', message: `${formData.title} added to portfolio.` });
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      setToast({ type: 'error', title: 'Action Failed', message: err?.message || 'Error saving project.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      await projectService.deleteProject(deleteTarget._id);
      setToast({ type: 'success', title: 'Project Deleted', message: 'Project removed from portfolio.' });
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      setToast({ type: 'error', title: 'Delete Failed', message: err?.message || 'Error deleting project.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Portfolio Management | LUX CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ModalConfirm
        isOpen={Boolean(deleteTarget)}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">PORTFOLIO SHOWCASE</span>
          <h1>Architectural Projects</h1>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-gold btn-sm" onClick={handleOpenCreate}>
            <Plus size={16} /> ADD NEW PROJECT
          </button>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-filter-group">
          <Filter size={16} />
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="ALL">All Categories</option>
            <option value="Residential">Residential</option>
            <option value="Hospitality">Hospitality</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
      </div>

      <div className="admin-card-panel">
        {loading ? (
          <div className="admin-loading-container">
            <Loader2 className="spin-icon" size={32} />
            <p>Loading Projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="admin-empty-state">
            <Building2 size={36} />
            <h3>No projects found</h3>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Year</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj._id || proj.id}>
                    <td>
                      <div className="admin-table-product-cell">
                        <img src={proj.coverImage || proj.image} alt={proj.title} className="product-thumb" />
                        <div>
                          <strong>{proj.title}</strong>
                          <small>/{proj.slug || proj.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>{proj.category}</td>
                    <td>{proj.location}</td>
                    <td>{proj.year || '2025'}</td>
                    <td>
                      {proj.featured ? <span className="badge-featured">★ Featured</span> : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <span className={`status-badge ${proj.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                        {proj.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-row-actions">
                        <button className="admin-action-btn" onClick={() => handleOpenEdit(proj)} title="Edit project">
                          <Edit2 size={16} />
                        </button>
                        <button className="admin-action-btn danger" onClick={() => setDeleteTarget(proj)} title="Delete project">
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
              <h3>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid">
              <div className="form-row">
                <label>
                  PROJECT TITLE *
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. PRIVATE RESIDENCE"
                  />
                </label>
                <label>
                  CATEGORY *
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Residential">Residential</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  LOCATION *
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Emirates Hills, Dubai, UAE"
                  />
                </label>
                <label>
                  COMPLETION YEAR
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2025"
                  />
                </label>
              </div>

              {/* Primary Cover Image Upload / URL */}
              <div className="admin-media-upload-section" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(243, 243, 235, 0.55)', textTransform: 'uppercase' }}>
                    PROJECT COVER IMAGE *
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
                          <span>Click to upload cover image (JPG, PNG, WEBP · Max 10MB)</span>
                        </>
                      )}
                    </div>
                  </label>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value, coverImagePublicId: '' })}
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
                {formData.coverImage && (
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
                      src={formData.coverImage}
                      alt="Cover Preview"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formData.coverImage}
                      </p>
                      <small style={{ fontSize: '10px', color: formData.coverImagePublicId ? '#4ade80' : 'rgba(243, 243, 235, 0.55)' }}>
                        {formData.coverImagePublicId ? '✓ Cloudinary Hosted' : 'External Image Link'}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="admin-action-btn danger"
                      onClick={handleClearCoverImage}
                      title="Clear cover image"
                      style={{ flexShrink: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Hidden input to ensure HTML5 required validation passes only when coverImage is non-empty */}
                <input
                  type="text"
                  required
                  value={formData.coverImage}
                  onChange={() => {}}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
                  tabIndex={-1}
                />
              </div>

              {/* Scope & Deliverables */}
              <div className="form-row">
                <label>
                  DELIVERABLES / SCOPE
                  <input
                    type="text"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    placeholder="Interior Lighting Design, Custom Chandelier Fabrication"
                  />
                </label>
              </div>

              {/* Project Gallery Images Section */}
              <div className="admin-media-upload-section" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(243, 243, 235, 0.55)', textTransform: 'uppercase' }}>
                    PROJECT GALLERY IMAGES ({formData.gallery.length})
                  </span>
                </div>

                {/* Upload Gallery Files Box */}
                <label
                  className="file-upload-box"
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '4px',
                    cursor: galleryUploading ? 'wait' : 'pointer',
                    border: '1px dashed rgba(230, 199, 122, 0.25)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    marginBottom: '8px',
                  }}
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    multiple
                    onChange={handleGalleryFilesSelect}
                    disabled={galleryUploading}
                    className="file-input-hidden"
                  />
                  <div className="file-upload-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {galleryUploading ? (
                      <>
                        <Loader2 size={16} className="spin-icon" style={{ color: 'var(--gold)' }} />
                        <span style={{ color: 'var(--gold)' }}>Uploading gallery images to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} style={{ color: 'var(--gold)' }} />
                        <span>Upload Gallery Image(s) (Select multiple · JPG, PNG, WEBP · Max 10MB each)</span>
                      </>
                    )}
                  </div>
                </label>

                {/* Or Add External URL */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="url"
                    value={galleryExternalUrl}
                    onChange={(e) => setGalleryExternalUrl(e.target.value)}
                    placeholder="Or enter external gallery image URL..."
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleAddExternalGalleryUrl}
                    disabled={!galleryExternalUrl.trim()}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Plus size={14} style={{ marginRight: '4px' }} /> Add URL
                  </button>
                </div>

                {galleryUploadError && (
                  <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px', marginBottom: '8px' }}>
                    {galleryUploadError}
                  </p>
                )}

                {/* Gallery Thumbnails List */}
                {formData.gallery.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: '8px',
                      marginTop: '8px',
                    }}
                  >
                    {formData.gallery.map((imgUrl, idx) => (
                      <div
                        key={`proj-gallery-${idx}`}
                        style={{
                          position: 'relative',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          border: '1px solid rgba(230, 199, 122, 0.2)',
                          background: 'rgba(255, 255, 255, 0.03)',
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery ${idx + 1}`}
                          style={{ width: '100%', height: '70px', objectFit: 'cover', display: 'block' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div
                          style={{
                            padding: '2px 4px',
                            fontSize: '9px',
                            textAlign: 'center',
                            background: 'rgba(0, 0, 0, 0.6)',
                            color: formData.galleryPublicIds[idx] ? '#4ade80' : 'rgba(243, 243, 235, 0.55)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {formData.galleryPublicIds[idx] ? '✓ Cloudinary' : 'External'}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryItem(idx)}
                          title="Remove image"
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(0, 0, 0, 0.75)',
                            border: 'none',
                            color: '#f87171',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label>
                PROJECT DESCRIPTION *
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive narrative of the architectural lighting scheme..."
                ></textarea>
              </label>

              <div className="form-checkbox-row">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Feature on Homepage Projects</span>
                </label>
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active in Portfolio</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold btn-sm" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
