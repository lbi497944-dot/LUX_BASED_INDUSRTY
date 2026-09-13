import { useState, useEffect, useRef, useCallback } from 'react';
import { reviewService } from '../../services/reviewService';
import { statsService } from '../../services/statsService';
import {
  Star,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Clock,
  Loader2,
  X,
  Image as ImageIcon,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

export default function ReviewsManager() {
  // Reviews data & loading states
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  // Quick Metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Filters & Search
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Selected Review & Modal
  const [selectedReview, setSelectedReview] = useState(null);
  const [localNotes, setLocalNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const isNotesDirtyRef = useRef(false);

  // Lightbox
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  // Delete Target for ModalConfirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Concurrency & Sequence tracking
  const requestSeqRef = useRef(0);
  const isFetchingRef = useRef(false);

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Global Metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const [statsRes, approvedRes, rejectedRes] = await Promise.all([
        statsService.getDashboardStats().catch(() => null),
        reviewService.getReviews({ status: 'Approved', limit: 1 }).catch(() => null),
        reviewService.getReviews({ status: 'Rejected', limit: 1 }).catch(() => null),
      ]);

      const totalReviews = statsRes?.data?.counts?.totalReviews ?? 0;
      const pendingReviews = statsRes?.data?.counts?.pendingReviews ?? 0;
      const approvedReviews = approvedRes?.pagination?.total ?? 0;
      const rejectedReviews = rejectedRes?.pagination?.total ?? 0;

      setMetrics({
        total: totalReviews,
        pending: pendingReviews,
        approved: approvedReviews,
        rejected: rejectedReviews,
      });
    } catch {
      // Retain existing metrics
    }
  }, []);

  // Fetch Reviews
  const fetchReviews = useCallback(
    async (isBackground = false) => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      if (isFetchingRef.current) {
        return;
      }

      const seq = ++requestSeqRef.current;
      isFetchingRef.current = true;

      if (isBackground) {
        setIsSyncing(true);
      } else {
        setLoading(true);
      }

      try {
        const params = {
          page: currentPage,
          limit: pageSize,
        };

        if (selectedStatus !== 'ALL') {
          params.status = selectedStatus;
        }
        if (ratingFilter !== 'ALL') {
          params.rating = ratingFilter;
        }
        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        const res = await reviewService.getReviews(params);

        // Discard stale responses
        if (seq !== requestSeqRef.current) {
          return;
        }

        const items = res?.data || [];
        const pagination = res?.pagination || {};

        setReviews(items);
        setTotalPages(pagination.pages || 1);
        setTotalCount(pagination.total || items.length);

        // Reconcile selectedReview if open
        setSelectedReview((prev) => {
          if (!prev) return null;
          const fresh = items.find((r) => r._id === prev._id);
          if (fresh) {
            if (!isNotesDirtyRef.current) {
              setLocalNotes(fresh.adminNotes || '');
            }
            return {
              ...fresh,
              adminNotes: isNotesDirtyRef.current ? localNotes : fresh.adminNotes,
            };
          }
          return prev;
        });
      } catch (err) {
        if (!isBackground) {
          setToast({
            type: 'error',
            title: 'Failed to load reviews',
            message: err?.message || 'Could not fetch customer reviews.',
          });
        }
      } finally {
        isFetchingRef.current = false;
        if (seq === requestSeqRef.current) {
          setLoading(false);
          setIsSyncing(false);
        }
      }
    },
    [currentPage, selectedStatus, ratingFilter, debouncedSearch, localNotes]
  );

  // Initial fetch and fetch on filter/page changes
  useEffect(() => {
    fetchReviews(false);
  }, [currentPage, selectedStatus, ratingFilter, debouncedSearch]);

  // Initial metrics fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // 30-second background polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReviews(true);
      fetchMetrics();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchReviews(true);
        fetchMetrics();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchReviews, fetchMetrics]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeLightboxImage) {
          setActiveLightboxImage(null);
        } else if (selectedReview) {
          handleCloseDetail();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxImage, selectedReview]);

  // Filter change handlers
  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleRatingFilterChange = (rating) => {
    setRatingFilter(rating);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Open detail modal
  const handleOpenDetail = (review) => {
    setSelectedReview(review);
    setLocalNotes(review.adminNotes || '');
    isNotesDirtyRef.current = false;
  };

  // Close detail modal
  const handleCloseDetail = () => {
    setSelectedReview(null);
    setLocalNotes('');
    isNotesDirtyRef.current = false;
  };

  // Notes textarea change
  const handleNotesChange = (e) => {
    const val = e.target.value;
    if (val.length <= 1000) {
      setLocalNotes(val);
      isNotesDirtyRef.current = true;
    }
  };

  // Save Internal Notes
  const handleSaveNotes = async () => {
    if (!selectedReview || notesSaving) return;
    setNotesSaving(true);
    try {
      await reviewService.updateNotes(selectedReview._id, localNotes);
      isNotesDirtyRef.current = false;
      setSelectedReview((prev) => (prev ? { ...prev, adminNotes: localNotes } : null));
      setReviews((prev) =>
        prev.map((r) => (r._id === selectedReview._id ? { ...r, adminNotes: localNotes } : r))
      );
      setToast({
        type: 'success',
        title: 'Notes Saved',
        message: 'Internal review notes updated successfully.',
      });
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Error updating internal notes.',
      });
    } finally {
      setNotesSaving(false);
    }
  };

  // Update Status
  const handleStatusChange = async (id, newStatus) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await reviewService.updateStatus(id, newStatus);
      const updated = res?.data?.review || res?.review;

      setToast({
        type: 'success',
        title: 'Status Updated',
        message: `Review status transitioned to ${newStatus}.`,
      });

      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: newStatus, ...updated } : r))
      );

      if (selectedReview && selectedReview._id === id) {
        setSelectedReview((prev) => ({
          ...prev,
          status: newStatus,
          moderatedAt: updated?.moderatedAt || new Date().toISOString(),
          moderatedBy: updated?.moderatedBy || prev.moderatedBy,
        }));
      }

      window.dispatchEvent(new CustomEvent('reviews_updated'));
      fetchMetrics();
      fetchReviews(true);
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Could not update review status.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Review
  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deleteLoading) return;
    setDeleteLoading(true);
    try {
      await reviewService.deleteReview(deleteTarget._id);
      setToast({
        type: 'success',
        title: 'Review Deleted',
        message: 'Customer review permanently deleted.',
      });

      if (selectedReview && selectedReview._id === deleteTarget._id) {
        handleCloseDetail();
      }

      setDeleteTarget(null);
      window.dispatchEvent(new CustomEvent('reviews_updated'));
      fetchMetrics();
      fetchReviews(false);
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Delete Failed',
        message: err?.message || 'Could not delete review.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Render Stars
  const renderStars = (rating = 5, size = 14) => {
    return (
      <div className="admin-rating-stars" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= rating ? 'star-filled' : 'star-empty'}
          />
        ))}
      </div>
    );
  };

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="admin-page">
      <SEO title="Customer Reviews | LUX BASED INDUSTRY CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Delete Confirmation Modal */}
      <ModalConfirm
        isOpen={Boolean(deleteTarget)}
        title="Delete Customer Review"
        message={`Are you sure you want to permanently delete the review submitted by "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">CLIENT APPRECIATION</span>
          <h1>Customer Reviews</h1>
        </div>
        <div className="admin-header-actions">
          {isSyncing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--gold)' }}>
              <Loader2 size={14} className="spin-icon" />
              <span>Syncing live...</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">TOTAL REVIEWS</span>
            <div className="stat-icon-wrap">
              <Star size={20} />
            </div>
          </div>
          <div className="stat-number">{metrics.total}</div>
          <small className="stat-meta">All feedback recorded</small>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">PENDING MODERATION</span>
            <div className="stat-icon-wrap highlight">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-number">{metrics.pending}</div>
          <small className="stat-meta">Awaiting editorial review</small>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">APPROVED & LIVE</span>
            <div className="stat-icon-wrap">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-number">{metrics.approved}</div>
          <small className="stat-meta">Publicly verified</small>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <span className="stat-label">REJECTED</span>
            <div className="stat-icon-wrap">
              <XCircle size={20} />
            </div>
          </div>
          <div className="stat-number">{metrics.rejected}</div>
          <small className="stat-meta">Declined submissions</small>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-filter-tabs" role="tablist">
          {[
            { label: 'All Reviews', value: 'ALL' },
            { label: 'Pending Verification', value: 'Pending' },
            { label: 'Approved / Live', value: 'Approved' },
            { label: 'Rejected', value: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selectedStatus === tab.value}
              className={`admin-filter-tab ${selectedStatus === tab.value ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="admin-filter-group">
            <Filter size={16} />
            <select
              aria-label="Filter by rating"
              value={ratingFilter}
              onChange={(e) => handleRatingFilterChange(e.target.value)}
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="admin-search-box">
            <Search size={16} />
            <input
              type="text"
              aria-label="Search reviews"
              placeholder="Search by name, email, headline, content..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', color: 'rgba(243,243,235,0.5)', cursor: 'pointer' }}
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Reviews Panel */}
      <div className="admin-card-panel">
        {loading ? (
          <div className="admin-loading-container">
            <Loader2 className="spin-icon" size={32} />
            <p>Loading Customer Reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="admin-empty-state">
            <Star size={36} />
            <h3>No reviews match your current filters</h3>
            <p style={{ color: 'rgba(243,243,235,0.5)', fontSize: '13px', marginTop: '6px' }}>
              Try adjusting your status or rating filters, or clearing your search term.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="admin-table-wrapper admin-table-desktop-only">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Headline & Feedback</th>
                    <th>Photos</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((item) => {
                    const photosCount = item.images?.length || 0;
                    return (
                      <tr key={item._id}>
                        <td>
                          <strong>{item.name}</strong>
                          <br />
                          {item.email && <small style={{ color: 'rgba(243,243,235,0.6)' }}>{item.email}</small>}
                          {item.phone && (
                            <>
                              <br />
                              <small style={{ color: 'rgba(243,243,235,0.5)' }}>{item.phone}</small>
                            </>
                          )}
                        </td>
                        <td>{renderStars(item.rating, 14)}</td>
                        <td>
                          {item.title && <strong style={{ color: 'var(--gold)' }}>{item.title}</strong>}
                          <div className="table-row-subtext">{item.content}</div>
                          {item.projectLocation && (
                            <small style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'rgba(230,199,122,0.7)', marginTop: '4px' }}>
                              <MapPin size={11} /> {item.projectLocation}
                            </small>
                          )}
                        </td>
                        <td>
                          {photosCount > 0 ? (
                            <div className="review-photos-cell">
                              {item.images.slice(0, 2).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img.url}
                                  alt={`Review photograph submitted by ${item.name}`}
                                  className="review-photo-thumb"
                                  onClick={() => setActiveLightboxImage(img)}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ))}
                              {photosCount > 2 && (
                                <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600 }}>
                                  +{photosCount - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <small style={{ color: 'rgba(243,243,235,0.35)' }}>None</small>
                          )}
                        </td>
                        <td>
                          <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                        </td>
                        <td>
                          <StatusBadge status={item.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-row-actions">
                            <button
                              type="button"
                              className="admin-action-btn"
                              onClick={() => handleOpenDetail(item)}
                              title="View review dossier"
                              aria-label="View review dossier"
                            >
                              <Eye size={16} />
                            </button>

                            {item.status !== 'Approved' && (
                              <button
                                type="button"
                                className="admin-action-btn"
                                onClick={() => handleStatusChange(item._id, 'Approved')}
                                title="Approve review"
                                aria-label="Approve review"
                                disabled={actionLoading}
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}

                            {item.status !== 'Rejected' && (
                              <button
                                type="button"
                                className="admin-action-btn danger"
                                onClick={() => handleStatusChange(item._id, 'Rejected')}
                                title="Reject review"
                                aria-label="Reject review"
                                disabled={actionLoading}
                              >
                                <XCircle size={16} />
                              </button>
                            )}

                            <button
                              type="button"
                              className="admin-action-btn danger"
                              onClick={() => setDeleteTarget(item)}
                              title="Delete review"
                              aria-label="Delete review"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="admin-reviews-mobile-list">
              {reviews.map((item) => (
                <div key={item._id} className="admin-review-mobile-card">
                  <div className="admin-review-mobile-header">
                    <div>
                      <strong>{item.name}</strong>
                      <div style={{ marginTop: '2px' }}>{renderStars(item.rating, 13)}</div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  {item.title && <div style={{ fontWeight: 600, color: 'var(--gold)', fontSize: '13px' }}>{item.title}</div>}
                  <div style={{ fontSize: '13px', color: 'rgba(243,243,235,0.8)', lineHeight: 1.4 }}>{item.content}</div>

                  {item.images?.length > 0 && (
                    <div className="review-photos-cell" style={{ marginTop: '4px' }}>
                      {item.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Review photograph submitted by ${item.name}`}
                          className="review-photo-thumb"
                          onClick={() => setActiveLightboxImage(img)}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="admin-review-mobile-actions">
                    <button
                      type="button"
                      className="admin-action-btn"
                      onClick={() => handleOpenDetail(item)}
                      aria-label="View review details"
                    >
                      <Eye size={16} />
                    </button>

                    {item.status !== 'Approved' && (
                      <button
                        type="button"
                        className="admin-action-btn"
                        onClick={() => handleStatusChange(item._id, 'Approved')}
                        aria-label="Approve review"
                        disabled={actionLoading}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}

                    {item.status !== 'Rejected' && (
                      <button
                        type="button"
                        className="admin-action-btn danger"
                        onClick={() => handleStatusChange(item._id, 'Rejected')}
                        aria-label="Reject review"
                        disabled={actionLoading}
                      >
                        <XCircle size={16} />
                      </button>
                    )}

                    <button
                      type="button"
                      className="admin-action-btn danger"
                      onClick={() => setDeleteTarget(item)}
                      aria-label="Delete review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="admin-pagination">
              <div className="admin-pagination-info">
                Showing {startRecord} to {endRecord} of {totalCount} reviews
              </div>
              <div className="admin-pagination-controls">
                <button
                  type="button"
                  className="admin-pagination-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="admin-page-indicator">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="admin-pagination-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="modal-backdrop" onClick={handleCloseDetail}>
          <div
            className="modal-container admin-lead-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            style={{ width: 'calc(100vw - 24px)', maxHeight: '92vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header-luxury">
              <div>
                <span className="eyebrow gold-label">CLIENT FEEDBACK DOSSIER</span>
                <h3 id="review-modal-title">{selectedReview.name}</h3>
                <div style={{ marginTop: '6px' }}>
                  <StatusBadge status={selectedReview.status} />
                </div>
              </div>
              <button
                type="button"
                className="admin-sidebar-close"
                style={{ display: 'inline-flex' }}
                onClick={handleCloseDetail}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="admin-lead-body">
              {/* Customer Dossier Grid */}
              <div className="lead-meta-grid">
                <div className="lead-meta-box">
                  <Mail size={18} color="var(--gold)" />
                  <div>
                    <small>CLIENT EMAIL</small>
                    <p>
                      {selectedReview.email ? (
                        <a href={`mailto:${selectedReview.email}`} style={{ color: 'var(--gold)', textDecoration: 'underline' }}>
                          {selectedReview.email}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </p>
                  </div>
                </div>

                <div className="lead-meta-box">
                  <Phone size={18} color="var(--gold)" />
                  <div>
                    <small>CONTACT TELEPHONE</small>
                    <p>
                      {selectedReview.phone ? (
                        <a href={`tel:${selectedReview.phone}`} style={{ color: 'var(--bg-cream)' }}>
                          {selectedReview.phone}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </p>
                  </div>
                </div>

                <div className="lead-meta-box">
                  <MapPin size={18} color="var(--gold)" />
                  <div>
                    <small>PROJECT LOCATION</small>
                    <p>{selectedReview.projectLocation || 'Not specified'}</p>
                  </div>
                </div>

                <div className="lead-meta-box">
                  <Star size={18} color="var(--gold)" />
                  <div>
                    <small>CLIENT RATING</small>
                    <div style={{ marginTop: '4px' }}>
                      {renderStars(selectedReview.rating, 16)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Review Content */}
              <div className="lead-section-box">
                <h4>CLIENT TESTIMONY & FEEDBACK</h4>
                {selectedReview.title && (
                  <h5 style={{ color: 'var(--gold)', fontSize: '16px', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                    "{selectedReview.title}"
                  </h5>
                )}
                <div className="lead-message-quote" style={{ whiteSpace: 'pre-line', fontStyle: 'normal' }}>
                  {selectedReview.content}
                </div>
              </div>

              {/* Review Photographs */}
              <div className="lead-section-box">
                <h4>REFERENCE PHOTOGRAPHY</h4>
                {selectedReview.images && selectedReview.images.length > 0 ? (
                  <div className="review-modal-gallery">
                    {selectedReview.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="review-gallery-item"
                        onClick={() => setActiveLightboxImage(img)}
                        title="Click to enlarge"
                      >
                        <img
                          src={img.url}
                          alt={`Review photograph submitted by ${selectedReview.name}`}
                          onError={(e) => {
                            e.target.parentElement.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'rgba(243,243,235,0.45)', fontSize: '13px', margin: '4px 0 0' }}>
                    No reference photographs attached
                  </p>
                )}
              </div>

              {/* Moderation Audit */}
              <div className="lead-meta-grid">
                <div className="lead-meta-box">
                  <Calendar size={18} color="var(--gold)" />
                  <div>
                    <small>SUBMISSION DATE</small>
                    <p>{new Date(selectedReview.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="lead-meta-box">
                  <Clock size={18} color="var(--gold)" />
                  <div>
                    <small>MODERATED DATE</small>
                    <p>
                      {selectedReview.moderatedAt
                        ? new Date(selectedReview.moderatedAt).toLocaleString()
                        : 'Awaiting initial review'}
                    </p>
                  </div>
                </div>

                <div className="lead-meta-box">
                  <User size={18} color="var(--gold)" />
                  <div>
                    <small>MODERATED BY</small>
                    <p>
                      {selectedReview.moderatedBy?.username ||
                        selectedReview.moderatedBy?.email ||
                        '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div className="lead-section-box">
                <div className="admin-notes-header">
                  <h4>INTERNAL ADMIN NOTES</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isNotesDirtyRef.current && (
                      <span className="admin-dirty-indicator">Unsaved changes</span>
                    )}
                    <span className="admin-char-count">{localNotes.length} / 1000</span>
                  </div>
                </div>
                <textarea
                  rows={4}
                  maxLength={1000}
                  placeholder="Private internal notes regarding customer feedback or moderation verification..."
                  value={localNotes}
                  onChange={handleNotesChange}
                  disabled={notesSaving}
                  style={{ width: '100%', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    onClick={handleSaveNotes}
                    disabled={notesSaving}
                  >
                    {notesSaving ? (
                      <>
                        <Loader2 size={14} className="spin-icon" /> Saving Notes...
                      </>
                    ) : (
                      'Save Internal Notes'
                    )}
                  </button>
                </div>
              </div>

              {/* Moderation Actions in Modal */}
              <div className="admin-modal-actions" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeleteTarget(selectedReview)}
                >
                  <Trash2 size={14} /> Delete Review
                </button>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedReview.status !== 'Approved' && (
                    <button
                      type="button"
                      className="btn btn-gold btn-sm"
                      onClick={() => handleStatusChange(selectedReview._id, 'Approved')}
                      disabled={actionLoading}
                    >
                      <CheckCircle2 size={14} /> Approve Review
                    </button>
                  )}

                  {selectedReview.status !== 'Rejected' && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#f87171' }}
                      onClick={() => handleStatusChange(selectedReview._id, 'Rejected')}
                      disabled={actionLoading}
                    >
                      <XCircle size={14} /> Reject Review
                    </button>
                  )}

                  {selectedReview.status !== 'Pending' && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ backgroundColor: 'rgba(234,179,8,0.15)', border: '1px solid #eab308', color: '#facc15' }}
                      onClick={() => handleStatusChange(selectedReview._id, 'Pending')}
                      disabled={actionLoading}
                    >
                      <RotateCcw size={14} /> Re-queue for Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photography Lightbox */}
      {activeLightboxImage && (
        <div className="review-lightbox-backdrop" onClick={() => setActiveLightboxImage(null)}>
          <div className="review-lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="review-lightbox-close"
              onClick={() => setActiveLightboxImage(null)}
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>
            <img
              src={activeLightboxImage.url}
              alt="Enlarged review photograph"
              className="review-lightbox-img"
            />
          </div>
        </div>
      )}
    </div>
  );
}
