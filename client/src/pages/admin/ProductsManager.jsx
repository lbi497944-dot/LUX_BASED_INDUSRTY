import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { collectionService } from '../../services/collectionService';
import { Plus, Edit2, Trash2, Search, Filter, Loader2, Sparkles, X, Check } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grand Chandelier',
    collectionSlug: 'grand-chandeliers',
    image: '',
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

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Grand Chandelier',
      collectionSlug: collections[0]?.slug || 'grand-chandeliers',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1400&q=85',
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
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      category: prod.category || 'Grand Chandelier',
      collectionSlug: prod.collectionSlug || 'grand-chandeliers',
      image: prod.image || '',
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
                <label>
                  IMAGE URL *
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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
