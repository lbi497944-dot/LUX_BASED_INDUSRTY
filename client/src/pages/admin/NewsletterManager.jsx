import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { newsletterService } from '../../services/newsletterService';
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  Edit,
  Eye,
  Share2,
  CopyPlus,
  FileText,
  Paperclip,
  Users,
  Search,
  X,
  ExternalLink,
  RotateCw,
} from 'lucide-react';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';
import AdminImageUpload from '../../components/ui/AdminImageUpload';
import AdminLivePreviewFrame from '../../components/admin/AdminLivePreviewFrame';
import NewsletterLivePreview from '../../components/admin/NewsletterLivePreview';

export default function NewsletterManager() {
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'subscribers'
  const [workspaceTab, setWorkspaceTab] = useState('editor'); // 'editor' | 'preview'
  const [toast, setToast] = useState(null);

  // Campaigns State
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignFilter, setCampaignFilter] = useState('ALL');
  const [campaignSearch, setCampaignSearch] = useState('');

  // Subscribers State
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(true);
  const [subscriberFilter, setSubscriberFilter] = useState('ALL');
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [copied, setCopied] = useState(false);

  // Modals State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const initialFormStateRef = useRef(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const [sendTarget, setSendTarget] = useState(null);
  const [sendingLoading, setSendingLoading] = useState(false);

  const [deleteCampaignTarget, setDeleteCampaignTarget] = useState(null);
  const [deleteCampaignLoading, setDeleteCampaignLoading] = useState(false);

  const [deleteSubscriberTarget, setDeleteSubscriberTarget] = useState(null);
  const [deleteSubscriberLoading, setDeleteSubscriberLoading] = useState(false);

  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [whatsAppCampaign, setWhatsAppCampaign] = useState(null);
  const [whatsAppPhone, setWhatsAppPhone] = useState('');
  const [whatsAppPreview, setWhatsAppPreview] = useState(null);
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);

  // Form State for Campaign Editor
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    previewText: '',
    heading: '',
    content: '',
    imageUrl: '',
    imagePublicId: '',
    ctaText: '',
    ctaUrl: '',
    attachments: [],
    targetAudience: 'all',
    selectedRecipients: [],
  });
  const [formSaving, setFormSaving] = useState(false);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isFormDirty = () => {
    if (!initialFormStateRef.current) return false;
    return JSON.stringify(formData) !== initialFormStateRef.current;
  };

  const handleAttemptCloseEditor = () => {
    if (isFormDirty() && !formSaving) {
      setDiscardConfirmOpen(true);
    } else {
      setEditorOpen(false);
    }
  };

  const handleConfirmDiscard = () => {
    setDiscardConfirmOpen(false);
    setEditorOpen(false);
  };

  useEffect(() => {
    const isAnyModalOpen =
      editorOpen ||
      previewOpen ||
      whatsAppModalOpen ||
      discardConfirmOpen ||
      Boolean(sendTarget) ||
      Boolean(deleteCampaignTarget) ||
      Boolean(deleteSubscriberTarget);

    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [
    editorOpen,
    previewOpen,
    whatsAppModalOpen,
    discardConfirmOpen,
    sendTarget,
    deleteCampaignTarget,
    deleteSubscriberTarget,
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (discardConfirmOpen) {
          setDiscardConfirmOpen(false);
        } else if (previewOpen) {
          setPreviewOpen(false);
        } else if (whatsAppModalOpen) {
          setWhatsAppModalOpen(false);
        } else if (editorOpen && !formSaving) {
          handleAttemptCloseEditor();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorOpen, formSaving, previewOpen, whatsAppModalOpen, discardConfirmOpen, formData]);

  // Fetch Campaigns
  const fetchCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      const params = campaignFilter !== 'ALL' ? { status: campaignFilter } : {};
      const res = await newsletterService.getCampaigns(params);
      setCampaigns(res?.data?.newsletters || res?.newsletters || []);
    } catch {
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  };

  // Fetch Subscribers
  const fetchSubscribers = async () => {
    try {
      setSubscribersLoading(true);
      const params = {};
      if (subscriberFilter !== 'ALL') params.status = subscriberFilter;
      if (subscriberSearch.trim()) params.search = subscriberSearch.trim();
      const res = await newsletterService.getSubscribers(params);
      setSubscribers(res?.data?.subscribers || res?.subscribers || res?.data || []);
    } catch {
      setSubscribers([]);
    } finally {
      setSubscribersLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchSubscribers();
  }, [campaignFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSubscribers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [subscriberFilter, subscriberSearch]);

  // Open Editor for New or Edit
  const handleOpenEditor = (campaign = null) => {
    const initialData = campaign
      ? {
          title: campaign.title || '',
          subject: campaign.subject || '',
          previewText: campaign.previewText || '',
          heading: campaign.heading || '',
          content: campaign.content || '',
          imageUrl: campaign.imageUrl || '',
          imagePublicId: campaign.imagePublicId || '',
          ctaText: campaign.ctaText || '',
          ctaUrl: campaign.ctaUrl || '',
          attachments: campaign.attachments || [],
          targetAudience: campaign.targetAudience || 'all',
          selectedRecipients: campaign.selectedRecipients || [],
        }
      : {
          title: '',
          subject: '',
          previewText: '',
          heading: '',
          content: '',
          imageUrl: '',
          imagePublicId: '',
          ctaText: '',
          ctaUrl: '',
          attachments: [],
          targetAudience: 'all',
          selectedRecipients: [],
        };
    setEditingCampaign(campaign);
    setFormData(initialData);
    initialFormStateRef.current = JSON.stringify(initialData);
    setEditorOpen(true);
  };

  // Save Campaign Draft
  const handleSaveCampaign = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim() || !formData.content.trim()) {
      setToast({ type: 'error', title: 'Validation Error', message: 'Title, Subject, and Content are required.' });
      return;
    }

    try {
      setFormSaving(true);
      if (editingCampaign) {
        await newsletterService.updateCampaign(editingCampaign._id, formData);
        setToast({ type: 'success', title: 'Campaign Updated', message: 'Newsletter draft saved successfully.' });
      } else {
        await newsletterService.createCampaign(formData);
        setToast({ type: 'success', title: 'Campaign Created', message: 'New newsletter draft created.' });
      }
      initialFormStateRef.current = JSON.stringify(formData);
      setEditorOpen(false);
      fetchCampaigns();
    } catch (err) {
      setToast({ type: 'error', title: 'Save Failed', message: err?.message || 'Error saving newsletter draft.' });
    } finally {
      setFormSaving(false);
    }
  };

  // Duplicate Campaign
  const handleDuplicate = async (id) => {
    try {
      await newsletterService.duplicateCampaign(id);
      setToast({ type: 'success', title: 'Duplicated', message: 'Campaign duplicated into new draft.' });
      fetchCampaigns();
    } catch (err) {
      setToast({ type: 'error', title: 'Duplicate Failed', message: err?.message || 'Error duplicating campaign.' });
    }
  };

  // Delete Campaign
  const handleDeleteCampaignConfirm = async () => {
    if (!deleteCampaignTarget) return;
    try {
      setDeleteCampaignLoading(true);
      await newsletterService.deleteCampaign(deleteCampaignTarget._id);
      setToast({ type: 'success', title: 'Deleted', message: 'Newsletter campaign removed.' });
      setDeleteCampaignTarget(null);
      fetchCampaigns();
    } catch (err) {
      setToast({ type: 'error', title: 'Delete Failed', message: err?.message || 'Error deleting newsletter.' });
    } finally {
      setDeleteCampaignLoading(false);
    }
  };

  // Delete Subscriber
  const handleDeleteSubscriberConfirm = async () => {
    if (!deleteSubscriberTarget) return;
    try {
      setDeleteSubscriberLoading(true);
      await newsletterService.deleteSubscriber(deleteSubscriberTarget._id);
      setToast({ type: 'success', title: 'Subscriber Removed', message: 'Email address deleted.' });
      setDeleteSubscriberTarget(null);
      fetchSubscribers();
      window.dispatchEvent(new Event('subscribers_updated'));
    } catch (err) {
      setToast({ type: 'error', title: 'Delete Failed', message: err?.message || 'Error removing subscriber.' });
    } finally {
      setDeleteSubscriberLoading(false);
    }
  };

  // Preview Campaign
  const handlePreview = async (campaign) => {
    try {
      setPreviewLoading(true);
      setPreviewOpen(true);
      const res = await newsletterService.previewCampaign(campaign._id);
      setPreviewHtml(res?.data?.html || res?.html || '');
    } catch (err) {
      setToast({ type: 'error', title: 'Preview Error', message: err?.message || 'Failed to generate email preview.' });
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Send Broadcast
  const handleSendConfirm = async () => {
    if (!sendTarget) return;
    try {
      setSendingLoading(true);
      const res = await newsletterService.sendCampaign(sendTarget._id);
      const summary = res?.data?.summary || res?.summary || {};
      setToast({
        type: 'success',
        title: 'Broadcast Sent',
        message: 'Successfully delivered to active subscribers.',
      });
      setSendTarget(null);
      fetchCampaigns();
      window.dispatchEvent(new Event('subscribers_updated'));
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Broadcast Failed',
        message: err?.message || 'Failed to broadcast newsletter. Check email service configuration.',
      });
    } finally {
      setSendingLoading(false);
    }
  };

  // Upload Attachment
  const handleAttachmentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setToast({ type: 'error', title: 'File Too Large', message: 'Attachments cannot exceed 10 MB.' });
      return;
    }

    try {
      setAttachmentUploading(true);
      const res = await newsletterService.uploadAttachment(file);
      const attachmentData = res?.data || res;
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, attachmentData],
      }));
      setToast({ type: 'success', title: 'Attachment Added', message: file.name + ' uploaded.' });
    } catch (err) {
      setToast({ type: 'error', title: 'Upload Failed', message: err?.message || 'Error uploading attachment.' });
    } finally {
      setAttachmentUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // WhatsApp Share Dialog
  const handleOpenWhatsApp = (campaign) => {
    setWhatsAppCampaign(campaign);
    setWhatsAppPhone('+971500000000');
    setWhatsAppPreview(null);
    setWhatsAppModalOpen(true);
  };

  const handleGenerateWhatsApp = async () => {
    if (!whatsAppCampaign || !whatsAppPhone.trim()) return;
    try {
      setWhatsAppLoading(true);
      const res = await newsletterService.shareWhatsApp(whatsAppCampaign._id, whatsAppPhone);
      setWhatsAppPreview(res?.data || res);
    } catch (err) {
      setToast({ type: 'error', title: 'WhatsApp Error', message: err?.message || 'Invalid phone number format.' });
    } finally {
      setWhatsAppLoading(false);
    }
  };

  const handleCopyAllEmails = () => {
    const emails = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopied(true);
    setToast({ type: 'success', title: 'Copied', message: subscribers.length + ' email addresses copied.' });
    setTimeout(() => setCopied(false), 2500);
  };

  // Recipient selection helpers in Editor
  const activeSubscribers = subscribers.filter((s) => s.status === 'Subscribed');
  const filteredActiveSubscribers = activeSubscribers.filter((s) =>
    s.email.toLowerCase().includes(recipientSearch.toLowerCase().trim())
  );

  const handleToggleRecipient = (email) => {
    const lower = email.toLowerCase().trim();
    setFormData((prev) => {
      const exists = prev.selectedRecipients.includes(lower);
      return {
        ...prev,
        selectedRecipients: exists
          ? prev.selectedRecipients.filter((e) => e !== lower)
          : [...prev.selectedRecipients, lower],
      };
    });
  };

  const handleSelectAllRecipients = () => {
    setFormData((prev) => ({
      ...prev,
      selectedRecipients: activeSubscribers.map((s) => s.email.toLowerCase().trim()),
    }));
  };

  const handleClearAllRecipients = () => {
    setFormData((prev) => ({
      ...prev,
      selectedRecipients: [],
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Sent':
        return <span className="status-badge badge-success">Sent</span>;
      case 'Sending':
        return <span className="status-badge badge-warning">Sending...</span>;
      case 'Send_Failed':
        return <span className="status-badge badge-danger">Send Failed</span>;
      default:
        return <span className="status-badge badge-neutral">Draft</span>;
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (!campaignSearch.trim()) return true;
    const q = campaignSearch.toLowerCase();
    const title = (c.title || '').toLowerCase();
    const subject = (c.subject || '').toLowerCase();
    const heading = (c.heading || '').toLowerCase();
    return title.includes(q) || subject.includes(q) || heading.includes(q);
  });

  return (
    <div className="admin-page">
      <SEO title="Newsletter & Campaigns | LUX CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Delete Campaign Confirmation */}
      <ModalConfirm
        isOpen={Boolean(deleteCampaignTarget)}
        title="Delete Newsletter Campaign"
        message={`Are you sure you want to delete "${deleteCampaignTarget?.title}"? This draft will be permanently removed.`}
        onConfirm={handleDeleteCampaignConfirm}
        onCancel={() => setDeleteCampaignTarget(null)}
        loading={deleteCampaignLoading}
      />

      {/* Delete Subscriber Confirmation */}
      <ModalConfirm
        isOpen={Boolean(deleteSubscriberTarget)}
        title="Remove Subscriber"
        message={`Are you sure you want to remove ${deleteSubscriberTarget?.email} from the readership?`}
        onConfirm={handleDeleteSubscriberConfirm}
        onCancel={() => setDeleteSubscriberTarget(null)}
        loading={deleteSubscriberLoading}
      />

      {/* Send Broadcast Confirmation Modal */}
      <ModalConfirm
        isOpen={Boolean(sendTarget)}
        title="Broadcast Newsletter Campaign"
        message={`Are you sure you want to dispatch "${sendTarget?.title}" to all recipients (${sendTarget?.targetAudience === 'custom' ? sendTarget?.selectedRecipients?.length || 0 : activeSubscribers.length} subscribers)? This action will queue real email delivery.`}
        confirmLabel="Send Broadcast Now"
        cancelLabel="Cancel"
        onConfirm={handleSendConfirm}
        onCancel={() => setSendTarget(null)}
        loading={sendingLoading}
      />

      {/* Discard Unsaved Changes Modal */}
      <ModalConfirm
        isOpen={discardConfirmOpen}
        title="Discard Unsaved Changes?"
        message="You have unsaved changes in this campaign draft. Are you sure you want to discard your edits and close the editor?"
        confirmLabel="Discard & Exit"
        cancelLabel="Continue Editing"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardConfirmOpen(false)}
      />

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">COMMUNICATIONS & EDITORIAL</span>
          <h1>Newsletter & Broadcasts</h1>
        </div>
        <div className="admin-header-actions">
          {activeTab === 'campaigns' ? (
            <button className="btn btn-gold btn-sm" onClick={() => handleOpenEditor()}>
              <Plus size={16} /> CREATE NEWSLETTER
            </button>
          ) : (
            subscribers.length > 0 && (
              <button className="btn btn-outline btn-sm" onClick={handleCopyAllEmails}>
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'COPIED' : 'COPY ALL EMAILS'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(230, 199, 122, 0.15)', paddingBottom: '12px' }}>
        <button
          className={'btn btn-sm ' + (activeTab === 'campaigns' ? 'btn-gold' : 'btn-outline')}
          onClick={() => setActiveTab('campaigns')}
        >
          <Send size={15} /> Campaign Broadcasts ({campaigns.length})
        </button>
        <button
          className={'btn btn-sm ' + (activeTab === 'subscribers' ? 'btn-gold' : 'btn-outline')}
          onClick={() => setActiveTab('subscribers')}
        >
          <Users size={15} /> Subscribers Readership ({subscribers.length})
        </button>
      </div>

      {/* TAB 1: CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="admin-card-panel">
          <div className="panel-head" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <h3>Editorial Campaigns</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'rgba(243, 243, 235, 0.4)' }} />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={campaignSearch}
                  onChange={(e) => setCampaignSearch(e.target.value)}
                  style={{
                    paddingLeft: '32px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(230, 199, 122, 0.2)',
                    background: '#0E1612',
                    color: '#FAF8F1',
                    fontSize: '13px',
                  }}
                />
              </div>

              <select
                className="admin-inline-select"
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Draft">Drafts</option>
                <option value="Sent">Sent</option>
                <option value="Send_Failed">Failed</option>
              </select>

              <button
                type="button"
                className="admin-refresh-btn"
                onClick={fetchCampaigns}
                disabled={campaignsLoading}
                title="Refresh campaigns"
              >
                <RotateCw size={14} className={campaignsLoading ? 'spin-icon' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {campaignsLoading ? (
            <div className="admin-loading-container">
              <Loader2 className="spin-icon" size={32} />
              <p>Loading Campaigns...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="admin-empty-state">
              <Send size={36} />
              <h3>No newsletter campaigns found</h3>
              <p>Create your first architectural lighting announcement or seasonal editorial.</p>
              <button className="btn btn-gold btn-sm" style={{ marginTop: '16px' }} onClick={() => handleOpenEditor()}>
                <Plus size={16} /> CREATE NEWSLETTER
              </button>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Campaign Title</th>
                    <th>Subject Line</th>
                    <th>Status</th>
                    <th>Recipients</th>
                    <th>Last Updated</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <strong>{item.title}</strong>
                        {item.heading && <small style={{ display: 'block', color: 'rgba(243, 243, 235, 0.6)' }}>{item.heading}</small>}
                      </td>
                      <td>{item.subject}</td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td>
                        {item.status === 'Sent' ? (
                          <span>{item.successfulSends || item.recipientCount || 0} sent</span>
                        ) : item.targetAudience === 'custom' && item.selectedRecipients?.length > 0 ? (
                          <span>{item.selectedRecipients.length} selected</span>
                        ) : (
                          <span>All Active ({activeSubscribers.length})</span>
                        )}
                      </td>
                      <td>{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="admin-action-btn"
                            onClick={() => handlePreview(item)}
                            title="Preview Email"
                          >
                            <Eye size={15} />
                          </button>

                          {item.status !== 'Sending' && item.status !== 'Sent' && (
                            <>
                              <button
                                className="admin-action-btn"
                                onClick={() => handleOpenEditor(item)}
                                title="Edit Draft"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                className="admin-action-btn highlight"
                                onClick={() => setSendTarget(item)}
                                title="Broadcast Email"
                              >
                                <Send size={15} />
                              </button>
                            </>
                          )}

                          <button
                            className="admin-action-btn"
                            onClick={() => handleOpenWhatsApp(item)}
                            title="Share via WhatsApp"
                          >
                            <Share2 size={15} />
                          </button>

                          <button
                            className="admin-action-btn"
                            onClick={() => handleDuplicate(item._id)}
                            title="Duplicate Campaign"
                          >
                            <CopyPlus size={15} />
                          </button>

                          {item.status !== 'Sending' && (
                            <button
                              className="admin-action-btn danger"
                              onClick={() => setDeleteCampaignTarget(item)}
                              title="Delete Campaign"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUBSCRIBERS */}
      {activeTab === 'subscribers' && (
        <div className="admin-card-panel">
          <div className="panel-head">
            <h3>Audience Readership</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'rgba(243, 243, 235, 0.4)' }} />
                <input
                  type="text"
                  placeholder="Search subscriber email..."
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                  style={{
                    paddingLeft: '32px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(230, 199, 122, 0.2)',
                    background: '#0E1612',
                    color: '#FAF8F1',
                    fontSize: '13px',
                  }}
                />
              </div>
              <select
                className="admin-inline-select"
                value={subscriberFilter}
                onChange={(e) => setSubscriberFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Subscribed">Subscribed (Active)</option>
                <option value="Unsubscribed">Unsubscribed</option>
              </select>

              <button
                type="button"
                className="admin-refresh-btn"
                onClick={fetchSubscribers}
                disabled={subscribersLoading}
                title="Refresh subscribers list"
              >
                <RotateCw size={14} className={subscribersLoading ? 'spin-icon' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {subscribersLoading ? (
            <div className="admin-loading-container">
              <Loader2 className="spin-icon" size={32} />
              <p>Loading Subscribers...</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="admin-empty-state">
              <Users size={36} />
              <h3>No subscribers found</h3>
              <p>Audience subscribers will appear here when visitors subscribe through the website.</p>
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
                        <span className={'status-badge ' + (item.status === 'Subscribed' ? 'badge-success' : 'badge-neutral')}>
                          {item.status || 'Subscribed'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="admin-action-btn danger"
                          onClick={() => setDeleteSubscriberTarget(item)}
                          title="Delete subscriber"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CAMPAIGN EDITOR MODAL */}
      {editorOpen &&
        createPortal(
          <div
            className="admin-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleAttemptCloseEditor();
            }}
            role="presentation"
          >
            <div
              className="admin-modal admin-modal-dark admin-modal-workspace"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="campaign-editor-title"
            >
              {/* Workspace Header */}
              <div className="admin-workspace-header">
                <div className="admin-workspace-title-wrap">
                  <h2 id="campaign-editor-title">
                    {editingCampaign ? 'Edit Newsletter Campaign' : 'Create Newsletter Campaign'}
                  </h2>
                  {isFormDirty() && <span className="admin-preview-dirty-badge">Unsaved Changes</span>}
                </div>
                <button
                  type="button"
                  className="admin-modal-close-btn"
                  onClick={handleAttemptCloseEditor}
                  aria-label="Close newsletter editor"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Switcher Tabs (<1024px) */}
              <div className="admin-workspace-tabs" role="tablist">
                <button
                  type="button"
                  className={`admin-workspace-tab-btn ${workspaceTab === 'editor' ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab('editor')}
                >
                  <span>✏️ Campaign Editor</span>
                </button>
                <button
                  type="button"
                  className={`admin-workspace-tab-btn ${workspaceTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab('preview')}
                >
                  <span>👁️ Live Email Preview</span>
                </button>
              </div>

              {/* Workspace Body: 2 Columns */}
              <div className="admin-workspace-body">
                <div className="admin-workspace-grid">
                  {/* Left Column: Form Editor */}
                  <form
                    id="newsletter-campaign-form"
                    onSubmit={handleSaveCampaign}
                    className={`admin-workspace-editor admin-form ${workspaceTab === 'editor' ? 'active' : ''}`}
                  >
                    <div className="admin-form-group">
                      <label>Campaign Title (Internal Reference) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Winter Architectural Collections Preview"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="admin-form-group">
                        <label>Email Subject Line *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Exclusive Preview: LUX Bespoke Luminaires"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Preview Text (Inbox Preheader)</label>
                        <input
                          type="text"
                          placeholder="e.g. Architectural luminaires engineered for luxury interiors"
                          value={formData.previewText}
                          onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label>Heading (Inside Email Template)</label>
                      <input
                        type="text"
                        placeholder="e.g. Architectural Illumination · 2026 Collection"
                        value={formData.heading}
                        onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                      />
                    </div>

                    {/* Banner Image Upload */}
                    <div className="admin-form-group">
                      <AdminImageUpload
                        label="CAMPAIGN FEATURED IMAGE"
                        value={formData.imageUrl}
                        publicId={formData.imagePublicId}
                        onChange={({ url, publicId }) => {
                          setFormData((prev) => ({ ...prev, imageUrl: url, imagePublicId: publicId }));
                        }}
                        helpText="Featured banner or editorial photo (JPG, PNG, WEBP · Max 10MB)"
                        disabled={formSaving}
                      />
                    </div>

                    {/* Content Body */}
                    <div className="admin-form-group">
                      <label>Editorial Content (HTML / Formatted Text) *</label>
                      <textarea
                        rows={10}
                        style={{ minHeight: '220px', fontFamily: 'inherit', lineHeight: '1.6' }}
                        required
                        placeholder="Enter newsletter body content. Paragraphs, links, and formatting will be rendered cleanly."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      />
                    </div>

                    {/* CTA Button */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="admin-form-group">
                        <label>CTA Button Label</label>
                        <input
                          type="text"
                          placeholder="e.g. Explore Pendants"
                          value={formData.ctaText}
                          onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>CTA Button URL</label>
                        <input
                          type="text"
                          placeholder="e.g. https://lux-based-indusrty.vercel.app/collections"
                          value={formData.ctaUrl}
                          onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="admin-form-group" style={{ borderTop: '1px solid rgba(230, 199, 122, 0.15)', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Paperclip size={16} /> Attached Documents / Lookbooks ({formData.attachments.length})
                        </label>
                        <label className="btn btn-outline btn-xs" style={{ margin: 0, cursor: 'pointer' }}>
                          {attachmentUploading ? <Loader2 className="spin-icon" size={14} /> : <Plus size={14} />}
                          <span>{attachmentUploading ? 'Uploading...' : 'Add PDF / Document'}</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={handleAttachmentUpload}
                            style={{ display: 'none' }}
                            disabled={attachmentUploading}
                          />
                        </label>
                      </div>

                      {formData.attachments.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                          {formData.attachments.map((att, idx) => (
                            <div
                              key={idx}
                              className="admin-attachment-card"
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 14px',
                                background: 'rgba(21, 57, 29, 0.4)',
                                border: '1px solid rgba(230, 199, 122, 0.2)',
                                borderRadius: '6px',
                                gap: '12px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                <FileText size={18} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                  <p style={{ margin: 0, fontWeight: 500, fontSize: '13px', color: '#FAF8F1', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {att.filename || 'Document'}
                                  </p>
                                  {att.size ? (
                                    <span style={{ fontSize: '11px', color: 'rgba(243, 243, 235, 0.6)' }}>
                                      {formatFileSize(att.size)}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="admin-action-btn danger"
                                onClick={() => handleRemoveAttachment(idx)}
                                title="Remove attachment"
                                aria-label={`Remove ${att.filename || 'attachment'}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Target Audience */}
                    <div className="admin-form-group" style={{ borderTop: '1px solid rgba(230, 199, 122, 0.15)', paddingTop: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={16} /> Target Audience
                      </label>
                      <div style={{ display: 'flex', gap: '20px', margin: '10px 0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                          <input
                            type="radio"
                            name="targetAudience"
                            value="all"
                            checked={formData.targetAudience === 'all'}
                            onChange={() => setFormData({ ...formData, targetAudience: 'all' })}
                          />
                          <span>All Active Subscribers ({activeSubscribers.length})</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                          <input
                            type="radio"
                            name="targetAudience"
                            value="custom"
                            checked={formData.targetAudience === 'custom'}
                            onChange={() => setFormData({ ...formData, targetAudience: 'custom' })}
                          />
                          <span>Select Specific Subscribers ({formData.selectedRecipients.length} chosen)</span>
                        </label>
                      </div>

                      {formData.targetAudience === 'custom' && (
                        <div
                          style={{
                            border: '1px solid rgba(230, 199, 122, 0.15)',
                            borderRadius: '6px',
                            padding: '12px',
                            background: 'rgba(14, 22, 18, 0.8)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <input
                              type="text"
                              placeholder="Search subscribers..."
                              value={recipientSearch}
                              onChange={(e) => setRecipientSearch(e.target.value)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '4px',
                                border: '1px solid rgba(230, 199, 122, 0.2)',
                                background: '#000',
                                color: '#FAF8F1',
                                fontSize: '12px',
                                width: '240px',
                              }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button type="button" className="btn btn-outline btn-xs" onClick={handleSelectAllRecipients}>
                                Select All
                              </button>
                              <button type="button" className="btn btn-outline btn-xs" onClick={handleClearAllRecipients}>
                                Clear
                              </button>
                            </div>
                          </div>

                          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {filteredActiveSubscribers.length === 0 ? (
                              <p style={{ fontSize: '12px', color: 'rgba(243, 243, 235, 0.5)', margin: 0 }}>No active subscribers match search.</p>
                            ) : (
                              filteredActiveSubscribers.map((s) => {
                                const isSelected = formData.selectedRecipients.includes(s.email.toLowerCase().trim());
                                return (
                                  <label
                                    key={s._id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      fontSize: '13px',
                                      cursor: 'pointer',
                                      padding: '4px 6px',
                                      borderRadius: '4px',
                                      background: isSelected ? 'rgba(230, 199, 122, 0.1)' : 'transparent',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleToggleRecipient(s.email)}
                                    />
                                    <span>{s.email}</span>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </form>

                  {/* Right Column: Live Email Preview */}
                  <div className={`admin-workspace-preview-column ${workspaceTab === 'preview' ? 'active' : ''}`}>
                    <AdminLivePreviewFrame title="SUBSCRIBER EMAIL PREVIEW" isDirty={isFormDirty()}>
                      <NewsletterLivePreview formData={formData} />
                    </AdminLivePreviewFrame>
                  </div>
                </div>
              </div>

              {/* Workspace Sticky Footer */}
              <div className="admin-workspace-footer">
                <button type="button" className="btn btn-outline" onClick={handleAttemptCloseEditor}>
                  Cancel
                </button>
                <button
                  type="submit"
                  form="newsletter-campaign-form"
                  className="btn btn-gold"
                  disabled={formSaving}
                >
                  {formSaving ? <Loader2 className="spin-icon" size={16} /> : <FileText size={16} />}
                  <span>{formSaving ? 'Saving Draft...' : 'Save Campaign Draft'}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* PREVIEW MODAL */}
      {previewOpen &&
        createPortal(
          <div
            className="admin-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setPreviewOpen(false);
            }}
            role="presentation"
          >
            <div
              className="admin-modal admin-modal-dark admin-modal-lg"
              style={{ maxWidth: '820px' }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="preview-modal-title"
            >
              <div className="admin-modal-header">
                <h2 id="preview-modal-title">Newsletter Live Preview</h2>
                <button
                  type="button"
                  className="admin-modal-close-btn"
                  onClick={() => setPreviewOpen(false)}
                  aria-label="Close preview"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="admin-modal-body">
                {previewLoading ? (
                  <div className="admin-loading-container" style={{ padding: '60px 0' }}>
                    <Loader2 className="spin-icon" size={32} />
                    <p>Rendering Email Frame...</p>
                  </div>
                ) : (
                  <iframe
                    title="Newsletter Email Preview"
                    srcDoc={previewHtml}
                    style={{
                      width: '100%',
                      height: '520px',
                      border: '1px solid rgba(230, 199, 122, 0.2)',
                      borderRadius: '4px',
                      backgroundColor: '#0E1612',
                    }}
                    sandbox="allow-same-origin"
                  />
                )}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewOpen(false)}>
                  Close Preview
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* WHATSAPP SHARE MODAL */}
      {whatsAppModalOpen &&
        createPortal(
          <div
            className="admin-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setWhatsAppModalOpen(false);
            }}
            role="presentation"
          >
            <div
              className="admin-modal admin-modal-dark admin-modal-md"
              style={{ maxWidth: '580px' }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="whatsapp-modal-title"
            >
              <div className="admin-modal-header">
                <h2 id="whatsapp-modal-title">Share Campaign via WhatsApp</h2>
                <button
                  type="button"
                  className="admin-modal-close-btn"
                  onClick={() => setWhatsAppModalOpen(false)}
                  aria-label="Close WhatsApp dialog"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="admin-modal-body admin-form">
                <div className="admin-form-group">
                  <label>Recipient WhatsApp Number (International Format) *</label>
                  <input
                    type="text"
                    placeholder="+971501234567"
                    value={whatsAppPhone}
                    onChange={(e) => setWhatsAppPhone(e.target.value)}
                  />
                  <small style={{ color: 'rgba(243, 243, 235, 0.6)', marginTop: '4px', display: 'block' }}>
                    Include country code (e.g. +971 for UAE, +44 for UK, +1 for US).
                  </small>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    onClick={handleGenerateWhatsApp}
                    disabled={whatsAppLoading || !whatsAppPhone.trim()}
                  >
                    {whatsAppLoading ? <Loader2 className="spin-icon" size={14} /> : <Share2 size={14} />}
                    <span>Generate WhatsApp Message</span>
                  </button>
                </div>

                {whatsAppPreview && (
                  <div
                    style={{
                      background: '#075E54',
                      color: '#FAF8F1',
                      borderRadius: '8px',
                      padding: '16px',
                      marginTop: '12px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                    }}
                  >
                    {whatsAppPreview.messageText}
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setWhatsAppModalOpen(false)}>
                  Cancel
                </button>
                {whatsAppPreview?.deepLink && (
                  <a
                    href={whatsAppPreview.deepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <ExternalLink size={16} /> Open in WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
