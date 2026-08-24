import { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { Plus, Edit2, Trash2, Search, Filter, Loader2, Building2, X } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    category: 'Residential',
    year: '2025',
    description: '',
    scope: '',
    coverImage: '',
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

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      location: 'Dubai, UAE',
      category: 'Residential',
      year: '2025',
      description: '',
      scope: 'Interior Lighting Design, Custom Chandelier Fabrication',
      coverImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85',
      featured: false,
      isActive: true,
    });
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
      featured: proj.featured || false,
      isActive: proj.isActive !== false,
    });
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
      <SEO title="Portfolio Management | Veloura CMS" />
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

              <div className="form-row">
                <label>
                  COVER IMAGE URL *
                  <input
                    type="url"
                    required
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://..."
                  />
                </label>
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
