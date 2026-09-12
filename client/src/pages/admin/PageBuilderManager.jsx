import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pageService } from '../../services/pageService';
import SectionListPanel from './page-builder/SectionListPanel';
import VisualEditor from './page-builder/VisualEditor';
import InspectorPanel from './page-builder/InspectorPanel';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Edit3,
  Save,
  RotateCcw,
  Send,
  Globe,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const MANAGED_PAGES = [
  { slug: 'home', name: 'Home Page' },
  { slug: 'collections', name: 'Collections Page' },
  { slug: 'portfolio', name: 'Portfolio Page' },
  { slug: 'about', name: 'About Page' },
  { slug: 'contact', name: 'Contact Page' },
  { slug: 'consultation', name: 'Consultation Page' },
];

export default function PageBuilderManager() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // =========================================================================
  // GLOBAL STATE
  // =========================================================================
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: () => {},
    loading: false,
  });

  // =========================================================================
  // LIST MODE STATE (/admin/pages)
  // =========================================================================
  const [pagesList, setPagesList] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);

  // =========================================================================
  // EDITOR MODE STATE (/admin/pages/:slug)
  // =========================================================================
  const [page, setPage] = useState(null);
  const [draftSections, setDraftSections] = useState([]);
  const [seo, setSeo] = useState({});
  const [loadingPage, setLoadingPage] = useState(false);

  const [viewport, setViewport] = useState('desktop'); // desktop | tablet | mobile
  const [mode, setMode] = useState('editor'); // editor | preview
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isSeoOpen, setIsSeoOpen] = useState(false);

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  // =========================================================================
  // FETCH PAGES LIST
  // =========================================================================
  const fetchPages = useCallback(async () => {
    try {
      setLoadingPages(true);
      const res = await pageService.getPages({ adminView: true });
      if (res?.data) {
        setPagesList(res.data);
      }
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Error Fetching Pages',
        message: err?.message || 'Could not load managed pages from server.',
      });
    } finally {
      setLoadingPages(false);
    }
  }, []);

  // =========================================================================
  // FETCH SINGLE PAGE FOR EDITOR
  // =========================================================================
  const fetchPageBySlug = useCallback(async (pageSlug) => {
    try {
      setLoadingPage(true);
      const res = await pageService.getPageBySlug(pageSlug, true);
      if (res?.data) {
        const pageData = res.data;
        setPage(pageData);
        // Use draftSections if present, fallback to publishedSections
        const workingSections = JSON.parse(
          JSON.stringify(pageData.draftSections || pageData.publishedSections || [])
        );
        setDraftSections(workingSections);
        setSeo(JSON.parse(JSON.stringify(pageData.seo || {})));
        setDirty(false);
        setSelectedElement(null);
        setSelectedSection(workingSections[0]?.sectionId || null);
      }
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Error Loading Page',
        message: err?.message || `Could not load page "${pageSlug}".`,
      });
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => {
    if (slug) {
      fetchPageBySlug(slug);
    } else {
      fetchPages();
    }
  }, [slug, fetchPages, fetchPageBySlug]);

  // Prompt before window reload if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  // =========================================================================
  // DRAFT STATE MUTATIONS
  // =========================================================================
  const handleUpdateDraftSection = (sectionId, updates) => {
    setDraftSections((prev) =>
      prev.map((sec) => (sec.sectionId === sectionId ? { ...sec, ...updates } : sec))
    );
    setDirty(true);
  };

  const handleReorderSections = (newSections) => {
    setDraftSections(newSections);
    setDirty(true);
  };

  const handleToggleVisibility = (sectionId) => {
    setDraftSections((prev) =>
      prev.map((sec) =>
        sec.sectionId === sectionId ? { ...sec, enabled: sec.enabled === false ? true : false } : sec
      )
    );
    setDirty(true);
  };

  const handleUpdateSeo = (updates) => {
    setSeo((prev) => ({ ...prev, ...updates }));
    setDirty(true);
  };

  // =========================================================================
  // PAGE SWITCHING PROTECTION
  // =========================================================================
  const handlePageSwitch = (newSlug) => {
    if (newSlug === slug) return;

    if (dirty) {
      setConfirmModal({
        isOpen: true,
        title: 'Unsaved Changes',
        message: 'You have unsaved changes in this page draft. Switching pages will discard local edits. Continue?',
        confirmText: 'Discard & Switch',
        loading: false,
        onConfirm: () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setDirty(false);
          navigate(`/admin/pages/${newSlug}`);
        },
      });
    } else {
      navigate(`/admin/pages/${newSlug}`);
    }
  };

  const handleBackToList = () => {
    if (dirty) {
      setConfirmModal({
        isOpen: true,
        title: 'Unsaved Changes',
        message: 'You have unsaved draft changes. Leaving the editor now will discard local edits. Continue?',
        confirmText: 'Discard & Leave',
        loading: false,
        onConfirm: () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setDirty(false);
          navigate('/admin/pages');
        },
      });
    } else {
      navigate('/admin/pages');
    }
  };

  // =========================================================================
  // SAVE DRAFT
  // =========================================================================
  const handleSaveDraft = async () => {
    if (saving || publishing) return;
    try {
      setSaving(true);
      const payload = {
        draftSections,
        seo,
      };
      const res = await pageService.updateDraft(slug, payload);
      if (res?.data) {
        setPage(res.data);
      }
      setDirty(false);
      setToast({
        type: 'success',
        title: 'Draft Saved',
        message: `Draft configuration for "${page?.name || slug}" saved successfully.`,
      });
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Failed to save page draft to server.',
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // DISCARD DRAFT
  // =========================================================================
  const handleDiscardClick = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Discard Draft Changes?',
      message:
        'This will reset your draft sections to match the currently published version. Any unpublished edits will be lost. This cannot be undone.',
      confirmText: 'Discard Draft',
      loading: false,
      onConfirm: executeDiscardDraft,
    });
  };

  const executeDiscardDraft = async () => {
    try {
      setDiscarding(true);
      setConfirmModal((prev) => ({ ...prev, loading: true }));
      const res = await pageService.discardDraft(slug);
      if (res?.data) {
        const pageData = res.data;
        setPage(pageData);
        setDraftSections(JSON.parse(JSON.stringify(pageData.draftSections || [])));
        setSeo(JSON.parse(JSON.stringify(pageData.seo || {})));
      }
      setDirty(false);
      setSelectedElement(null);
      setToast({
        type: 'success',
        title: 'Draft Discarded',
        message: 'Draft reset to live published version.',
      });
      setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Discard Failed',
        message: err?.message || 'Failed to discard draft changes.',
      });
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    } finally {
      setDiscarding(false);
    }
  };

  // =========================================================================
  // PUBLISH CHANGES
  // =========================================================================
  const handlePublishClick = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Publish Page Changes?',
      message: `Are you sure you want to publish the draft changes for "${page?.name || slug}"? Once published, these changes will become active on the live website.`,
      confirmText: 'Publish Changes',
      loading: false,
      onConfirm: executePublish,
    });
  };

  const executePublish = async () => {
    try {
      setPublishing(true);
      setConfirmModal((prev) => ({ ...prev, loading: true }));

      // If dirty, save the draft first to ensure latest local changes are committed
      if (dirty) {
        await pageService.updateDraft(slug, { draftSections, seo });
      }

      const res = await pageService.publishPage(slug);
      if (res?.data) {
        setPage(res.data);
        setDraftSections(JSON.parse(JSON.stringify(res.data.publishedSections || [])));
        setSeo(JSON.parse(JSON.stringify(res.data.seo || {})));
      }
      setDirty(false);
      setToast({
        type: 'success',
        title: 'Page Published',
        message: `"${page?.name || slug}" has been published successfully!`,
      });
      setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Publish Failed',
        message: err?.message || 'Failed to publish page changes.',
      });
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    } finally {
      setPublishing(false);
    }
  };

  // =========================================================================
  // RENDER: VIEW 1 — PAGE LIST VIEW (/admin/pages)
  // =========================================================================
  if (!slug) {
    return (
      <div className="admin-page pb-manager-list-view">
        <SEO title="Visual Page Builder | LUX CMS" />
        <Toast toast={toast} onClose={() => setToast(null)} />

        <div className="admin-page-header">
          <div>
            <span className="eyebrow gold-label">VISUAL PAGE BUILDER</span>
            <h1>Managed Website Pages</h1>
          </div>
        </div>

        <div className="admin-card-panel">
          <div className="panel-head">
            <h3>Website Structure & Pages</h3>
            <span className="pb-page-count-badge">
              {pagesList.length || MANAGED_PAGES.length} PAGES REGISTERED
            </span>
          </div>

          {loadingPages ? (
            <div className="admin-loading-container">
              <Loader2 className="spin-icon" size={32} />
              <p>Loading managed pages...</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Page Name</th>
                    <th>Route / Slug</th>
                    <th>Sections</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(pagesList.length > 0
                    ? pagesList
                    : MANAGED_PAGES.map((p) => ({
                        ...p,
                        status: 'published',
                        publishedSections: [],
                        updatedAt: new Date().toISOString(),
                      }))
                  ).map((p) => {
                    const sectionCount =
                      p.draftSections?.length || p.publishedSections?.length || 0;
                    const isDraftDirty =
                      p.draftSections &&
                      JSON.stringify(p.draftSections) !== JSON.stringify(p.publishedSections);

                    return (
                      <tr key={p.slug}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="pb-page-icon-pill">
                              <Layers size={16} />
                            </div>
                            <div>
                              <strong>{p.name || p.slug.toUpperCase()}</strong>
                              <span className="table-row-subtext">
                                {p.seo?.title || 'LUX Architectural Lighting'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code style={{ color: 'var(--gold)', fontSize: '12px' }}>
                            /{p.slug === 'home' ? '' : p.slug}
                          </code>
                        </td>
                        <td>
                          <span className="pb-section-count">
                            {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}
                          </span>
                        </td>
                        <td>
                          {isDraftDirty ? (
                            <span className="status-badge badge-warning">Draft Pending</span>
                          ) : (
                            <span className="status-badge badge-success">Published</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'rgba(243, 243, 235, 0.6)' }}>
                            {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Seeded'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link
                            to={`/admin/pages/${p.slug}`}
                            className="btn btn-gold btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Edit3 size={13} /> Edit Page
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: VIEW 2 — VISUAL EDITOR VIEW (/admin/pages/:slug)
  // =========================================================================
  return (
    <div className="pb-editor-layout">
      <SEO title={`Page Builder — ${page?.name || slug.toUpperCase()} | LUX CMS`} />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ModalConfirm
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        loading={confirmModal.loading}
      />

      {/* TOP EDITOR TOOLBAR */}
      <header className="pb-top-toolbar" aria-label="Page Builder Toolbar">
        <div className="pb-toolbar-left">
          <button
            type="button"
            className="pb-back-btn"
            onClick={handleBackToList}
            title="Back to Pages List"
            aria-label="Back to Pages List"
          >
            <ArrowLeft size={16} />
          </button>

          {/* PAGE SWITCHER */}
          <div className="pb-page-switcher-wrap">
            <span className="pb-toolbar-label">PAGE:</span>
            <select
              className="pb-page-select"
              value={slug}
              onChange={(e) => handlePageSwitch(e.target.value)}
              aria-label="Select Page to Edit"
            >
              {MANAGED_PAGES.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* DIRTY STATUS INDICATOR */}
          <div className="pb-status-indicator">
            {dirty ? (
              <span className="pb-status-pill dirty">
                <span className="pb-status-dot pulse" /> Unsaved changes
              </span>
            ) : (
              <span className="pb-status-pill clean">
                <CheckCircle2 size={13} /> Draft saved
              </span>
            )}
          </div>
        </div>

        {/* VIEWPORT CONTROLS */}
        <div className="pb-toolbar-center">
          <div className="pb-viewport-toggle-group" role="group" aria-label="Viewport Switcher">
            <button
              type="button"
              className={`pb-vp-btn ${viewport === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewport('desktop')}
              title="Desktop View (100%)"
              aria-label="Desktop View (100%)"
            >
              <Monitor size={15} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              className={`pb-vp-btn ${viewport === 'tablet' ? 'active' : ''}`}
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
              aria-label="Tablet View (768px)"
            >
              <Tablet size={15} />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              className={`pb-vp-btn ${viewport === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewport('mobile')}
              title="Mobile View (375px)"
              aria-label="Mobile View (375px)"
            >
              <Smartphone size={15} />
              <span>Mobile</span>
            </button>
          </div>

          {/* EDIT / PREVIEW TOGGLE */}
          <div className="pb-mode-toggle-group" role="group" aria-label="Mode Switcher">
            <button
              type="button"
              className={`pb-mode-btn ${mode === 'editor' ? 'active' : ''}`}
              onClick={() => {
                setMode('editor');
                setIsSeoOpen(false);
              }}
              title="Edit Mode (Element highlights & inspector active)"
              aria-label="Edit Mode"
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className={`pb-mode-btn ${mode === 'preview' ? 'active' : ''}`}
              onClick={() => {
                setMode('preview');
                setSelectedElement(null);
                setIsSeoOpen(false);
              }}
              title="Preview Mode (Realistic viewport presentation)"
              aria-label="Preview Mode"
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* WORKFLOW ACTIONS */}
        <div className="pb-toolbar-right">
          <button
            type="button"
            className={`pb-toolbar-btn ${isSeoOpen ? 'active' : ''}`}
            onClick={() => setIsSeoOpen(!isSeoOpen)}
            title="Page SEO & Social Metadata"
            aria-label="Page SEO & Social Metadata"
          >
            <Globe size={14} />
            <span>SEO</span>
          </button>

          <button
            type="button"
            className="pb-toolbar-btn pb-btn-discard"
            onClick={handleDiscardClick}
            disabled={discarding || saving || publishing}
            title="Reset draft to published version"
            aria-label="Discard Draft Changes"
          >
            <RotateCcw size={14} className={discarding ? 'spin-icon' : ''} />
            <span>Discard</span>
          </button>

          <button
            type="button"
            className="pb-toolbar-btn pb-btn-save"
            onClick={handleSaveDraft}
            disabled={!dirty || saving || publishing}
            title="Save draft without publishing"
            aria-label="Save Draft"
          >
            <Save size={14} className={saving ? 'spin-icon' : ''} />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            className="btn btn-gold btn-sm pb-btn-publish"
            onClick={handlePublishClick}
            disabled={publishing || saving}
            title="Publish draft changes to live website"
            aria-label="Publish Changes Live"
          >
            <Send size={14} className={publishing ? 'spin-icon' : ''} />
            <span>{publishing ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </header>

      {/* THREE-COLUMN BUILDER WORKSPACE */}
      <div className={`pb-workspace-grid ${mode === 'preview' ? 'preview-mode-grid' : ''}`}>
        {/* LEFT COLUMN: SECTION LIST NAVIGATOR */}
        {mode === 'editor' && (
          <SectionListPanel
            sections={draftSections}
            selectedSection={selectedSection}
            onSelectSection={(secId) => {
              setSelectedSection(secId);
              setSelectedElement(null);
            }}
            onReorderSections={handleReorderSections}
            onToggleVisibility={handleToggleVisibility}
          />
        )}

        {/* CENTER COLUMN: VISUAL CANVAS */}
        <main className="pb-canvas-workspace">
          {loadingPage ? (
            <div className="pb-canvas-loading">
              <Loader2 className="spin-icon" size={36} />
              <p>Loading {page?.name || slug} draft...</p>
            </div>
          ) : (
            <VisualEditor
              sections={draftSections}
              mode={mode}
              selectedElement={selectedElement}
              selectedSection={selectedSection}
              onSelect={(element) => {
                setSelectedElement(element);
                setSelectedSection(element.sectionId);
                setIsSeoOpen(false);
              }}
              viewport={viewport}
            />
          )}
        </main>

        {/* RIGHT COLUMN: INSPECTOR PANEL */}
        {mode === 'editor' && (
          <InspectorPanel
            selectedElement={selectedElement}
            selectedSection={selectedSection}
            sections={draftSections}
            seo={seo}
            isSeoOpen={isSeoOpen}
            onCloseSeo={() => setIsSeoOpen(false)}
            onUpdateDraftSection={handleUpdateDraftSection}
            onUpdateSeo={handleUpdateSeo}
            onClearSelection={() => setSelectedElement(null)}
          />
        )}
      </div>
    </div>
  );
}
