import { useState, useEffect } from 'react';
import { testimonialService } from '../../services/testimonialService';
import { Plus, Edit2, Trash2, MessageSquareQuote, Loader2, X, Star, Search, RotateCw } from 'lucide-react';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    content: '',
    rating: 5,
    featured: false,
    isActive: true,
  });
  const [modalLoading, setModalLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await testimonialService.getTestimonials({ adminView: true });
      setTestimonials(res.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const filteredTestimonials = testimonials.filter((item) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const name = (item.name || '').toLowerCase();
    const role = (item.role || '').toLowerCase();
    const company = (item.company || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    return name.includes(query) || role.includes(query) || company.includes(query) || content.includes(query);
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      role: 'Principal Interior Designer',
      company: 'Studio Arc Dubai',
      content: '',
      rating: 5,
      featured: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      role: item.role || '',
      company: item.company || '',
      content: item.content || '',
      rating: item.rating || 5,
      featured: item.featured || false,
      isActive: item.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingItem) {
        await testimonialService.updateTestimonial(editingItem._id, formData);
        setToast({ type: 'success', title: 'Testimonial Updated', message: 'Testimonial updated.' });
      } else {
        await testimonialService.createTestimonial(formData);
        setToast({ type: 'success', title: 'Testimonial Created', message: 'Testimonial added.' });
      }
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      setToast({ type: 'error', title: 'Action Failed', message: err?.message || 'Error saving testimonial.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await testimonialService.deleteTestimonial(deleteTarget._id);
      setToast({ type: 'success', title: 'Testimonial Deleted', message: 'Testimonial removed.' });
      setDeleteTarget(null);
      fetchTestimonials();
    } catch (err) {
      setToast({ type: 'error', title: 'Delete Failed', message: err?.message || 'Error removing testimonial.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Testimonials | LUX CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ModalConfirm
        isOpen={Boolean(deleteTarget)}
        title="Delete Testimonial"
        message={`Are you sure you want to delete the review from ${deleteTarget?.name}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">CLIENT APPRECIATION</span>
          <h1>Reviews & Testimonials</h1>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-gold btn-sm" onClick={handleOpenCreate}>
            <Plus size={16} /> ADD TESTIMONIAL
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
              placeholder="Search testimonials by client, role or studio..."
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
            onClick={fetchTestimonials}
            disabled={loading}
            title="Refresh testimonials"
          >
            <RotateCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="admin-card-panel">
        {loading ? (
          <div className="admin-loading-container">
            <Loader2 className="spin-icon" size={32} />
            <p>Loading Testimonials...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="admin-empty-state">
            <MessageSquareQuote size={36} />
            <h3>No testimonials found</h3>
            <p>Try adjusting your search filter or click below to add a new testimonial.</p>
            <button className="btn btn-gold btn-sm" onClick={handleOpenCreate} style={{ marginTop: '12px' }}>
              <Plus size={16} /> ADD TESTIMONIAL
            </button>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Designation / Studio</th>
                  <th>Rating</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTestimonials.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{item.role} {item.company ? `· ${item.company}` : ''}</td>
                    <td>
                      <span className="star-rating">
                        {'★'.repeat(item.rating || 5)}
                      </span>
                    </td>
                    <td>
                      {item.featured ? <span className="badge-featured">★ Featured</span> : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <span className={`status-badge ${item.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                        {item.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-row-actions">
                        <button className="admin-action-btn" onClick={() => handleOpenEdit(item)} title="Edit testimonial">
                          <Edit2 size={16} />
                        </button>
                        <button className="admin-action-btn danger" onClick={() => setDeleteTarget(item)} title="Delete testimonial">
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
              <h3>{editingItem ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid">
              <div className="form-row">
                <label>
                  CLIENT / DESIGNER NAME *
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tariq Al-Mansoor"
                  />
                </label>
                <label>
                  ROLE / DESIGNATION
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Lead Architect"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  STUDIO / COMPANY
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Mansoor Design Studio"
                  />
                </label>
                <label>
                  RATING (1 - 5)
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value, 10) || 5 })}
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★</option>
                    <option value={3}>3 Stars ★★★</option>
                  </select>
                </label>
              </div>

              <label>
                TESTIMONIAL STATEMENT *
                <textarea
                  rows="4"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Review statement..."
                ></textarea>
              </label>

              <div className="form-checkbox-row">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Feature on Website</span>
                </label>
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold btn-sm" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
