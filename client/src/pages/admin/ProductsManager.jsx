import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { collectionService } from '../../services/collectionService';
import { uploadService } from '../../services/uploadService';
import { Plus, Edit2, Trash2, Search, Filter, Loader2, Sparkles, X, Check, Upload } from 'lucide-react';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [toast, setToast] = useState(null);

  // Edit/Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'url'
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grand Chandelier',
    collectionSlug: 'grand-chandeliers',
    image: '',
    imagePublicId: '',
    description: '',
    specifications: '',
    materials: '',
    finish: '',
    dimensions: '',
    colorTemperature: '2700K',
    wattage: '',
    ipRating: 'IP20',
    featured: false,
    isActive: true,
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Delete Confirm Modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, colRes] = await Promise.all([
        productService.getProducts({ adminView: true, search, category: selectedCategory }),
        collectionService.getCollections({ adminView: true }),
      ]);
      setProducts(prodRes.data || []);
      setCollections(colRes.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory]);

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
          image: res.data.url,
          imagePublicId: res.data.publicId || '',
        }));
      }
    } catch (err) {
      setUploadError(err?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handleClearImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: '',
      imagePublicId: '',
    }));
    setUploadError(null);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Grand Chandelier',
      collectionSlug: collections[0]?.slug || 'grand-chandeliers',
      image: '',
      imagePublicId: '',
      description: '',
      specifications: '',
      materials: '',
      finish: '',
      dimensions: '',
      colorTemperature: '2700K',
      wattage: '',
      ipRating: 'IP20',
      featured: false,
      isActive: true,
    });
    setImageMode('upload');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      category: prod.category || 'Grand Chandelier',
      collectionSlug: prod.collectionSlug || 'grand-chandeliers',
      image: prod.image || '',
      imagePublicId: prod.imagePublicId || '',
      description: prod.description || '',
      specifications: prod.specifications || '',
      materials: prod.materials || '',
      finish: prod.finish || '',
      dimensions: prod.dimensions || '',
      colorTemperature: prod.colorTemperature || '2700K',
      wattage: prod.wattage || '',
      ipRating: prod.ipRating || 'IP20',
      featured: prod.featured || false,
      isActive: prod.isActive !== false,
    });
    setImageMode(prod.imagePublicId ? 'upload' : 'url');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
        setToast({ type: 'success', title: 'Product Updated', message: `${formData.name} updated successfully.` });
      } else {
        await productService.createProduct(formData);
        setToast({ type: 'success', title: 'Product Created', message: `${formData.name} added to catalogue.` });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setToast({ type: 'error', title: 'Action Failed', message: err?.message || 'Error saving product.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      await productService.deleteProduct(deleteTarget._id);
      setToast({ type: 'success', title: 'Product Deleted', message: 'Product removed from database.' });
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      setToast({ type: 'error', title: 'Delete Failed', message: err?.message || 'Error deleting product.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Products Management | Veloura CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ModalConfirm
        isOpen={Boolean(deleteTarget)}
        title="Delete Product"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">CATALOGUE MANAGEMENT</span>
          <h1>Products & Fixtures</h1>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-gold btn-sm" onClick={handleOpenCreate}>
            <Plus size={16} /> ADD NEW PRODUCT
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products by name, specs or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <Filter size={16} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Grand Chandelier">Grand Chandelier</option>
            <option value="Pendant Light">Pendant Light</option>
            <option value="Wall Light">Wall Light</option>
            <option value="Table Light">Table Light</option>
            <option value="Floor Light">Floor Light</option>
            <option value="Ambient System">Ambient System</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-card-panel">
        {loading ? (
          <div className="admin-loading-container">
            <Loader2 className="spin-icon" size={32} />
            <p>Loading Products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="admin-empty-state">
            <Sparkles size={36} />
            <h3>No products found</h3>
            <p>Try adjusting your search filter or click "Add New Product" to create one.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Collection</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod._id}>
                    <td>
                      <div className="admin-table-product-cell">
                        <img src={prod.image} alt={prod.name} className="product-thumb" />
                        <div>
                          <strong>{prod.name}</strong>
                          <small>{prod.slug}</small>
                        </div>
                      </div>
                    </td>
                    <td>{prod.category}</td>
                    <td><code>{prod.collectionSlug}</code></td>
                    <td>
                      {prod.featured ? (
                        <span className="badge-featured">★ Featured</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${prod.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {prod.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-row-actions">
                        <button
                          className="admin-action-btn"
                          onClick={() => handleOpenEdit(prod)}
                          title="Edit product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="admin-action-btn danger"
                          onClick={() => setDeleteTarget(prod)}
                          title="Delete product"
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

      {/* Create / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container admin-editor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-luxury">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid">
              <div className="form-row">
                <label>
                  PRODUCT NAME *
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. The Aurelia Grand Chandelier"
                  />
                </label>
                <label>
                  CATEGORY *
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Grand Chandelier"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  COLLECTION LINK *
                  <select
                    value={formData.collectionSlug}
                    onChange={(e) => setFormData({ ...formData, collectionSlug: e.target.value })}
                  >
                    {collections.map((col) => (
                      <option key={col.slug} value={col.slug}>
                        {col.name || col.title} ({col.slug})
                      </option>
                    ))}
                    {collections.length === 0 && (
                      <option value="grand-chandeliers">Grand Chandeliers</option>
                    )}
                  </select>
                </label>
              </div>

              {/* Primary Image Upload / URL */}
              <div className="admin-media-upload-section" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(243, 243, 235, 0.55)', textTransform: 'uppercase' }}>
                    PRIMARY FIXTURE IMAGE *
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
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value, imagePublicId: '' })}
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
                {formData.image && (
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
                      src={formData.image}
                      alt="Fixture Preview"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formData.image}
                      </p>
                      <small style={{ fontSize: '10px', color: formData.imagePublicId ? '#4ade80' : 'rgba(243, 243, 235, 0.55)' }}>
                        {formData.imagePublicId ? '✓ Cloudinary Hosted' : 'External Image Link'}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="admin-action-btn danger"
                      onClick={handleClearImage}
                      title="Clear image"
                      style={{ flexShrink: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Hidden input to ensure HTML5 required validation passes only when image is non-empty */}
                <input
                  type="text"
                  required
                  value={formData.image}
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
                  placeholder="Architectural design description and silhouette intent..."
                ></textarea>
              </label>

              <div className="form-row">
                <label>
                  SPECIFICATIONS SUMMARY
                  <input
                    type="text"
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                    placeholder="Diameter: 1400mm | Drop: 2200mm | 120W LED | 2700K"
                  />
                </label>
                <label>
                  MATERIALS & FINISH
                  <input
                    type="text"
                    value={formData.materials}
                    onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                    placeholder="Solid Brushed Brass, Czech Crystal"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  DIMENSIONS
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="Dia: 1400mm x H: 2200mm"
                  />
                </label>
                <label>
                  WATTAGE / LIGHT SOURCE
                  <input
                    type="text"
                    value={formData.wattage}
                    onChange={(e) => setFormData({ ...formData, wattage: e.target.value })}
                    placeholder="120W Integrated High-CRI LED"
                  />
                </label>
              </div>

              <div className="form-checkbox-row">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Feature on Homepage Signature Pieces</span>
                </label>
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active in Public Catalogue</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold btn-sm"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
