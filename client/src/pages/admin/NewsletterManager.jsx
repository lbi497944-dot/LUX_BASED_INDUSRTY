import { useState, useEffect } from 'react';
import { newsletterService } from '../../services/newsletterService';
import { Send, Trash2, Copy, Check, Loader2 } from 'lucide-react';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await newsletterService.getSubscribers();
      setSubscribers(res.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleCopyAllEmails = () => {
    const emails = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopied(true);
    setToast({ type: 'success', title: 'Copied', message: `${subscribers.length} email addresses copied to clipboard.` });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await newsletterService.deleteSubscriber(deleteTarget._id);
      setToast({ type: 'success', title: 'Subscriber Removed', message: 'Email address deleted.' });
      setDeleteTarget(null);
      fetchSubscribers();
    } catch (err) {
      setToast({ type: 'error', title: 'Delete Failed', message: err?.message || 'Error removing subscriber.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Newsletter Readership | LUX CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ModalConfirm
        isOpen={Boolean(deleteTarget)}
        title="Remove Subscriber"
        message={`Are you sure you want to delete ${deleteTarget?.email}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">AUDIENCE & INSIGHTS</span>
          <h1>Newsletter Subscribers</h1>
        </div>
        <div className="admin-header-actions">
          {subscribers.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handleCopyAllEmails}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'COPIED TO CLIPBOARD' : 'COPY ALL EMAILS'}
            </button>
          )}
        </div>
      </div>

      <div className="admin-card-panel">
        {loading ? (
          <div className="admin-loading-container">
            <Loader2 className="spin-icon" size={32} />
            <p>Loading Subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="admin-empty-state">
            <Send size={36} />
            <h3>No subscribers recorded yet</h3>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email Address</th>
                  <th>Source</th>
                  <th>Subscribed Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.email}</strong>
                    </td>
                    <td><code>{item.source || 'footer'}</code></td>
                    <td>{new Date(item.createdAt || item.subscribedAt).toLocaleDateString()}</td>
                    <td>
                      <span className="status-badge badge-success">{item.status || 'Subscribed'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="admin-action-btn danger"
                        onClick={() => setDeleteTarget(item)}
                        title="Delete subscriber"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
