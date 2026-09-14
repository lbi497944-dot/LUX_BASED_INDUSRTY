import { useState, useEffect } from 'react';
import { faqService } from '../../services/faqService';
import { Plus, Edit2, Trash2, HelpCircle, Loader2, X, Search, Filter, RotateCw } from 'lucide-react';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

export default function FaqsManager() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [toast, setToast] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
    isActive: true,
  });
  const [modalLoading, setModalLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await faqService.getFaqs({ adminView: true });
      setFaqs(res.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const allCategories = Array.from(new Set(['General', ...faqs.map((f) => f.category).filter(Boolean)]));

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = selectedCategory === 'ALL' || faq.category === selectedCategory;
    if (!matchesCat) return false;
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const q = (faq.question || '').toLowerCase();
    const a = (faq.answer || '').toLowerCase();
    const c = (faq.category || '').toLowerCase();
    return q.includes(query) || a.includes(query) || c.includes(query);
  });

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      order: faqs.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'General',
      order: faq.order || 0,
      isActive: faq.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (editingFaq) {
        await faqService.updateFaq(editingFaq._id, formData);
        setToast({ type: 'success', title: 'FAQ Updated', message: 'FAQ question updated.' });
      } else {
        await faqService.createFaq(formData);
        setToast({ type: 'success', title: 'FAQ Created', message: 'New FAQ added.' });
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err) {
      setToast({ type: 'error', title: 'Action Failed', message: err?.message || 'Error saving FAQ.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await faqService.deleteFaq(deleteTarget._id);
      setToast({ type: 'success', title: 'FAQ Deleted', message: 'FAQ removed from database.' });
      setDeleteTarget(null);
      fetchFaqs();
    } catch (err) {
      setToast({ type: 'error', title: 'Delete Failed', message: err?.message || 'Error removing FAQ.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="FAQ Management | LUX CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ModalConfirm
        isOpen={Boolean(deleteTarget)}
        title="Delete FAQ"
        message={`Are you sure you want to delete the FAQ "${deleteTarget?.question}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">SEO INSIGHTS</span>
          <h1>Frequently Asked Questions</h1>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-gold btn-sm" onClick={handleOpenCreate}>
            <Plus size={16} /> ADD FAQ
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
              placeholder="Search FAQs by question, answer or category..."
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

          <div className="admin-filter-group">
            <Filter size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter FAQs by category"
            >
              <option value="ALL">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-toolbar-right">
          <button
            type="button"
            className="admin-refresh-btn"
            onClick={fetchFaqs}
            disabled={loading}
            title="Refresh FAQs"
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
            <p>Loading FAQs...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="admin-empty-state">
            <HelpCircle size={36} />
            <h3>No FAQs found</h3>
            <p>Try adjusting your search filter or click below to add a new FAQ.</p>
            <button className="btn btn-gold btn-sm" onClick={handleOpenCreate} style={{ marginTop: '12px' }}>
              <Plus size={16} /> ADD FAQ
            </button>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Question</th>
                  <th>Category</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaqs.map((faq) => (
                  <tr key={faq._id}>
                    <td>
                      <strong>{faq.question}</strong>
                      <p className="table-row-subtext">{faq.answer}</p>
                    </td>
                    <td>{faq.category || 'General'}</td>
                    <td>{faq.order || 0}</td>
                    <td>
                      <span className={`status-badge ${faq.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                        {faq.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-row-actions">
                        <button className="admin-action-btn" onClick={() => handleOpenEdit(faq)} title="Edit FAQ">
                          <Edit2 size={16} />
                        </button>
                        <button className="admin-action-btn danger" onClick={() => setDeleteTarget(faq)} title="Delete FAQ">
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
              <h3>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid">
              <label>
                QUESTION *
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. What types of architectural lighting does LUX BASED INDUSTRY offer?"
                />
              </label>

              <label>
                ANSWER *
                <textarea
                  rows="4"
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Detailed architectural answer..."
                ></textarea>
              </label>

              <div className="form-row">
                <label>
                  CATEGORY
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="General / Bespoke Design / Smart Systems"
                  />
                </label>
                <label>
                  DISPLAY ORDER
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                  />
                </label>
              </div>

              <div className="form-checkbox-row">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active on Homepage FAQ Accordion</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold btn-sm" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : editingFaq ? 'Save Changes' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
