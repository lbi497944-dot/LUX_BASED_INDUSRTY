import { useState, useEffect } from 'react';
import { uploadService } from '../../../services/uploadService';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Link as LinkIcon,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  Film,
  Plus,
  AlertCircle,
  CheckCircle2,
  Sliders,
  ChevronUp,
  ChevronDown,
  Globe,
  FileText,
  X,
} from 'lucide-react';

/**
 * Validates URLs on the client side according to Stage 1 safety rules.
 * Strictly blocks active execution protocols while permitting safe web and internal paths.
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return { isValid: true };
  const trimmed = url.trim();
  const sanitized = trimmed.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();

  if (
    sanitized.startsWith('javascript:') ||
    sanitized.startsWith('data:') ||
    sanitized.startsWith('vbscript:') ||
    sanitized.startsWith('file:')
  ) {
    return {
      isValid: false,
      error: 'Dangerous protocol detected (javascript:, data:, vbscript:, file: are blocked).',
    };
  }

  const isAllowed =
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('?') ||
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    /^tel:/i.test(trimmed);

  if (!isAllowed) {
    return {
      isValid: false,
      error: 'URL must begin with "/", "#", "https://", "http://", "mailto:", or "tel:".',
    };
  }

  return { isValid: true };
};

export default function InspectorPanel({
  selectedElement,
  selectedSection,
  sections = [],
  seo = {},
  isSeoOpen = false,
  onCloseSeo = () => {},
  onUpdateDraftSection = () => {},
  onUpdateSeo = () => {},
  onClearSelection = () => {},
}) {
  // Find current active section
  const activeSection = sections.find((s) => s.sectionId === (selectedElement?.sectionId || selectedSection));

  // Local states for upload & errors
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [urlErrors, setUrlErrors] = useState({});

  // Reset errors on selection change
  useEffect(() => {
    setUploadError(null);
    setUrlErrors({});
  }, [selectedElement, selectedSection, isSeoOpen]);

  // Handle content updates
  const handleContentChange = (field, value) => {
    if (!activeSection) return;
    const updatedContent = { ...(activeSection.content || {}), [field]: value };
    onUpdateDraftSection(activeSection.sectionId, { content: updatedContent });
  };

  // Handle URL change with client-side validation
  const handleUrlChange = (field, value) => {
    const result = validateUrl(value);
    setUrlErrors((prev) => ({ ...prev, [field]: result.isValid ? null : result.error }));
    handleContentChange(field, value);
  };

  // Handle media updates
  const handleMediaChange = (field, value) => {
    if (!activeSection) return;
    const updatedMedia = { ...(activeSection.media || {}), [field]: value };
    onUpdateDraftSection(activeSection.sectionId, { media: updatedMedia });
  };

  // Handle media upload
  const handleFileUpload = async (e, type = 'image', targetField = 'url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validation
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (type === 'image') {
      const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
      if (!allowed.includes(ext)) {
        setUploadError('Unsupported image format. Allowed: JPG, JPEG, PNG, WEBP.');
        e.target.value = '';
        return;
      }
    } else if (type === 'video') {
      const allowed = ['.mp4', '.webm'];
      if (!allowed.includes(ext)) {
        setUploadError('Unsupported video format. Allowed: MP4, WEBP.');
        e.target.value = '';
        return;
      }
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit.');
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      const res = await uploadService.uploadFile(file);
      if (res?.data?.url) {
        if (type === 'video') {
          handleMediaChange('videoUrl', res.data.url);
          handleMediaChange('videoPublicId', res.data.publicId || '');
        } else if (targetField === 'ogImage') {
          onUpdateSeo({ ogImage: res.data.url, ogImagePublicId: res.data.publicId || '' });
        } else {
          handleMediaChange('url', res.data.url);
          handleMediaChange('publicId', res.data.publicId || '');
        }
      }
    } catch (err) {
      setUploadError(err?.message || 'Media upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Slideshow helpers
  const handleAddSlide = () => {
    if (!activeSection) return;
    const currentSlides = activeSection.media?.slides || [];
    const newSlide = {
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      publicId: '',
      title: 'New Slide',
      caption: '',
      order: currentSlides.length + 1,
    };
    handleMediaChange('slides', [...currentSlides, newSlide]);
  };

  const handleUpdateSlide = (index, field, value) => {
    if (!activeSection) return;
    const currentSlides = [...(activeSection.media?.slides || [])];
    if (currentSlides[index]) {
      currentSlides[index] = { ...currentSlides[index], [field]: value };
      handleMediaChange('slides', currentSlides);
    }
  };

  const handleDeleteSlide = (index) => {
    if (!activeSection) return;
    const currentSlides = (activeSection.media?.slides || []).filter((_, i) => i !== index);
    handleMediaChange('slides', currentSlides);
  };

  const handleMoveSlide = (index, direction) => {
    if (!activeSection) return;
    const currentSlides = [...(activeSection.media?.slides || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentSlides.length) return;
    const temp = currentSlides[index];
    currentSlides[index] = currentSlides[targetIndex];
    currentSlides[targetIndex] = temp;
    // re-index order
    currentSlides.forEach((s, idx) => (s.order = idx + 1));
    handleMediaChange('slides', currentSlides);
  };

  // Custom Items helpers
  const handleUpdateCustomItem = (index, field, value) => {
    if (!activeSection) return;
    const items = [...(activeSection.content?.customItems || [])];
    if (items[index]) {
      items[index] = { ...items[index], [field]: value };
      onUpdateDraftSection(activeSection.sectionId, {
        content: { ...(activeSection.content || {}), customItems: items },
      });
    }
  };

  // =========================================================================
  // VIEW 1: PAGE-LEVEL SEO INSPECTOR
  // =========================================================================
  if (isSeoOpen) {
    return (
      <aside className="pb-inspector-panel" aria-label="Page SEO Inspector">
        <div className="pb-inspector-header">
          <div className="pb-inspector-title">
            <Globe size={16} className="pb-inspector-icon" />
            <span>PAGE SEO SETTINGS</span>
          </div>
          <button
            type="button"
            className="pb-inspector-close-btn"
            onClick={onCloseSeo}
            aria-label="Close SEO Inspector"
          >
            <X size={16} />
          </button>
        </div>

        <div className="pb-inspector-body">
          <p className="pb-inspector-help-text">
            Configure page metadata and OpenGraph social preview tags. Changes are preserved in the draft until saved.
          </p>

          <div className="pb-field-group">
            <label htmlFor="seo-title">Meta Title</label>
            <input
              id="seo-title"
              type="text"
              value={seo.title || ''}
              onChange={(e) => onUpdateSeo({ title: e.target.value })}
              placeholder="e.g. LUX BASED INDUSTRY | Architectural Lighting"
            />
          </div>

          <div className="pb-field-group">
            <label htmlFor="seo-desc">Meta Description</label>
            <textarea
              id="seo-desc"
              rows="3"
              value={seo.description || ''}
              onChange={(e) => onUpdateSeo({ description: e.target.value })}
              placeholder="Enter comprehensive page meta description..."
            />
          </div>

          <div className="pb-field-group">
            <label htmlFor="seo-canonical">Canonical URL</label>
            <input
              id="seo-canonical"
              type="text"
              value={seo.canonical || ''}
              onChange={(e) => onUpdateSeo({ canonical: e.target.value })}
              placeholder="e.g. /collections"
            />
          </div>

          <div className="pb-field-group">
            <label>OG Social Image</label>
            {seo.ogImage && (
              <div className="pb-media-preview-box">
                <img src={seo.ogImage} alt="OG Preview" />
              </div>
            )}
            <div className="pb-url-input-row">
              <input
                type="text"
                value={seo.ogImage || ''}
                onChange={(e) => onUpdateSeo({ ogImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                aria-label="OG Image URL"
              />
            </div>
            <label className="pb-upload-btn">
              <Upload size={14} />
              <span>{uploading ? 'Uploading...' : 'Upload Social Image'}</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => handleFileUpload(e, 'image', 'ogImage')}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            {uploadError && <span className="pb-error-text">{uploadError}</span>}
          </div>
        </div>
      </aside>
    );
  }

  // =========================================================================
  // VIEW 2: EMPTY SELECTION STATE
  // =========================================================================
  if (!activeSection) {
    return (
      <aside className="pb-inspector-panel" aria-label="Element Inspector">
        <div className="pb-inspector-header">
          <div className="pb-inspector-title">
            <Sliders size={16} className="pb-inspector-icon" />
            <span>INSPECTOR</span>
          </div>
        </div>
        <div className="pb-inspector-empty-state">
          <Sliders size={32} className="pb-empty-icon" />
          <h4>Select an Element</h4>
          <p>
            Click any highlighted element in the visual canvas or select a section from the section list to edit its properties.
          </p>
        </div>
      </aside>
    );
  }

  const content = activeSection.content || {};
  const media = activeSection.media || {};

  // =========================================================================
  // VIEW 3: ACTIVE ELEMENT / SECTION INSPECTOR
  // =========================================================================
  return (
    <aside className="pb-inspector-panel" aria-label="Element Inspector">
      <div className="pb-inspector-header">
        <div className="pb-inspector-title">
          <FileText size={16} className="pb-inspector-icon" />
          <span>{selectedElement?.label || `SECTION: ${activeSection.type.toUpperCase()}`}</span>
        </div>
        {selectedElement && (
          <button
            type="button"
            className="pb-inspector-close-btn"
            onClick={onClearSelection}
            title="Clear Element Selection"
            aria-label="Clear Element Selection"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="pb-inspector-body">
        {/* Section General Metadata Banner */}
        <div className="pb-section-meta-card">
          <div className="pb-meta-row">
            <span className="pb-meta-label">Section:</span>
            <span className="pb-meta-value">{activeSection.sectionId}</span>
          </div>
          <div className="pb-meta-row">
            <span className="pb-meta-label">Type:</span>
            <span className="pb-meta-badge">{activeSection.type}</span>
          </div>
          <div className="pb-meta-row">
            <span className="pb-meta-label">Visibility:</span>
            <span className={`pb-status-pill ${activeSection.enabled !== false ? 'active' : 'hidden'}`}>
              {activeSection.enabled !== false ? 'Visible' : 'Hidden'}
            </span>
          </div>
        </div>

        {/* 1. TEXT EDITING FIELDS */}
        {(selectedElement?.field === 'eyebrow' || !selectedElement || selectedElement.type === 'section') &&
          content.eyebrow !== undefined && (
            <div className="pb-field-group">
              <label htmlFor="input-eyebrow">Eyebrow Text</label>
              <input
                id="input-eyebrow"
                type="text"
                value={content.eyebrow || ''}
                onChange={(e) => handleContentChange('eyebrow', e.target.value)}
                placeholder="e.g. LUX LIGHTING"
              />
            </div>
          )}

        {(selectedElement?.field === 'heading' || !selectedElement || selectedElement.type === 'section') &&
          content.heading !== undefined && (
            <div className="pb-field-group">
              <label htmlFor="input-heading">Main Heading</label>
              <input
                id="input-heading"
                type="text"
                value={content.heading || ''}
                onChange={(e) => handleContentChange('heading', e.target.value)}
                placeholder="Enter section heading..."
              />
            </div>
          )}

        {(selectedElement?.field === 'italicHeading' || !selectedElement || selectedElement.type === 'section') &&
          content.italicHeading !== undefined && (
            <div className="pb-field-group">
              <label htmlFor="input-italic-heading">Italic Accent Heading</label>
              <input
                id="input-italic-heading"
                type="text"
                value={content.italicHeading || ''}
                onChange={(e) => handleContentChange('italicHeading', e.target.value)}
                placeholder="e.g. Luxury Spaces"
              />
            </div>
          )}

        {(selectedElement?.field === 'subheading' || !selectedElement || selectedElement.type === 'section') &&
          content.subheading !== undefined && (
            <div className="pb-field-group">
              <label htmlFor="input-subheading">Subheading</label>
              <input
                id="input-subheading"
                type="text"
                value={content.subheading || ''}
                onChange={(e) => handleContentChange('subheading', e.target.value)}
                placeholder="Enter subheading..."
              />
            </div>
          )}

        {(selectedElement?.field === 'body' || !selectedElement || selectedElement.type === 'section') &&
          content.body !== undefined && (
            <div className="pb-field-group">
              <label htmlFor="input-body">Body Text</label>
              <textarea
                id="input-body"
                rows="4"
                value={content.body || ''}
                onChange={(e) => handleContentChange('body', e.target.value)}
                placeholder="Enter descriptive copy..."
              />
            </div>
          )}

        {/* ALIGNMENT */}
        {(content.heading !== undefined || content.body !== undefined) && (
          <div className="pb-field-group">
            <label>Text Alignment</label>
            <div className="pb-alignment-controls">
              <button
                type="button"
                className={`pb-align-btn ${content.alignment === 'left' || !content.alignment ? 'active' : ''}`}
                onClick={() => handleContentChange('alignment', 'left')}
                title="Align Left"
                aria-label="Align Left"
              >
                <AlignLeft size={16} />
              </button>
              <button
                type="button"
                className={`pb-align-btn ${content.alignment === 'center' ? 'active' : ''}`}
                onClick={() => handleContentChange('alignment', 'center')}
                title="Align Center"
                aria-label="Align Center"
              >
                <AlignCenter size={16} />
              </button>
              <button
                type="button"
                className={`pb-align-btn ${content.alignment === 'right' ? 'active' : ''}`}
                onClick={() => handleContentChange('alignment', 'right')}
                title="Align Right"
                aria-label="Align Right"
              >
                <AlignRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* 2. CALL-TO-ACTION (CTA) CONTROLS */}
        {(content.primaryBtnText !== undefined || content.secondaryBtnText !== undefined) && (
          <div className="pb-inspector-divider">
            <h4>CALL TO ACTION (CTA)</h4>

            {content.primaryBtnText !== undefined && (
              <>
                <div className="pb-field-group">
                  <label htmlFor="input-pri-btn">Primary Button Label</label>
                  <input
                    id="input-pri-btn"
                    type="text"
                    value={content.primaryBtnText || ''}
                    onChange={(e) => handleContentChange('primaryBtnText', e.target.value)}
                  />
                </div>
                <div className="pb-field-group">
                  <label htmlFor="input-pri-url">Primary Destination URL</label>
                  <input
                    id="input-pri-url"
                    type="text"
                    value={content.primaryBtnUrl || ''}
                    onChange={(e) => handleUrlChange('primaryBtnUrl', e.target.value)}
                    placeholder="e.g. /collections or https://..."
                  />
                  {urlErrors.primaryBtnUrl && (
                    <span className="pb-error-text">
                      <AlertCircle size={12} /> {urlErrors.primaryBtnUrl}
                    </span>
                  )}
                </div>
              </>
            )}

            {content.secondaryBtnText !== undefined && (
              <>
                <div className="pb-field-group">
                  <label htmlFor="input-sec-btn">Secondary Button Label</label>
                  <input
                    id="input-sec-btn"
                    type="text"
                    value={content.secondaryBtnText || ''}
                    onChange={(e) => handleContentChange('secondaryBtnText', e.target.value)}
                  />
                </div>
                <div className="pb-field-group">
                  <label htmlFor="input-sec-url">Secondary Destination URL</label>
                  <input
                    id="input-sec-url"
                    type="text"
                    value={content.secondaryBtnUrl || ''}
                    onChange={(e) => handleUrlChange('secondaryBtnUrl', e.target.value)}
                    placeholder="e.g. /consultation or https://..."
                  />
                  {urlErrors.secondaryBtnUrl && (
                    <span className="pb-error-text">
                      <AlertCircle size={12} /> {urlErrors.secondaryBtnUrl}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. MEDIA INSPECTOR */}
        {activeSection.media !== undefined && (
          <div className="pb-inspector-divider">
            <h4>MEDIA CONFIGURATION</h4>

            <div className="pb-field-group">
              <label>Media Type</label>
              <div className="pb-media-type-selector">
                {['image', 'video', 'slideshow', 'none'].map((mType) => (
                  <button
                    key={mType}
                    type="button"
                    className={`pb-media-type-btn ${(media.mediaType || 'image') === mType ? 'active' : ''}`}
                    onClick={() => handleMediaChange('mediaType', mType)}
                  >
                    {mType === 'image' && <ImageIcon size={14} />}
                    {mType === 'video' && <VideoIcon size={14} />}
                    {mType === 'slideshow' && <Film size={14} />}
                    <span>{mType.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* IMAGE MODE */}
            {(media.mediaType === 'image' || !media.mediaType) && (
              <div className="pb-media-editor-subpanel">
                <label>Current Image</label>
                {media.url && (
                  <div className="pb-media-preview-box">
                    <img src={media.url} alt="Current" />
                    <button
                      type="button"
                      className="pb-remove-media-btn"
                      onClick={() => {
                        handleMediaChange('url', '');
                        handleMediaChange('publicId', '');
                      }}
                      title="Remove Image"
                      aria-label="Remove Image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                <div className="pb-field-group">
                  <label htmlFor="image-url-input">Image URL</label>
                  <input
                    id="image-url-input"
                    type="text"
                    value={media.url || ''}
                    onChange={(e) => handleMediaChange('url', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <label className="pb-upload-btn">
                  <Upload size={14} />
                  <span>{uploading ? 'Uploading to Cloudinary...' : 'Upload Replacement'}</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => handleFileUpload(e, 'image', 'url')}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>

                {uploadError && <span className="pb-error-text">{uploadError}</span>}

                {/* Overlay Settings */}
                <div className="pb-field-group" style={{ marginTop: '16px' }}>
                  <label className="pb-checkbox-label">
                    <input
                      type="checkbox"
                      checked={media.overlay !== false}
                      onChange={(e) => handleMediaChange('overlay', e.target.checked)}
                    />
                    <span>Dark Brand Overlay</span>
                  </label>
                </div>

                {media.overlay !== false && (
                  <div className="pb-field-group">
                    <label>
                      Overlay Opacity ({Math.round((media.overlayOpacity ?? 0.85) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={media.overlayOpacity ?? 0.85}
                      onChange={(e) => handleMediaChange('overlayOpacity', parseFloat(e.target.value))}
                      aria-label="Overlay Opacity"
                    />
                  </div>
                )}
              </div>
            )}

            {/* VIDEO MODE */}
            {media.mediaType === 'video' && (
              <div className="pb-media-editor-subpanel">
                <label>Current Video</label>
                {media.videoUrl && (
                  <div className="pb-media-preview-box">
                    <video src={media.videoUrl} controls style={{ width: '100%', maxHeight: '180px' }} />
                    <button
                      type="button"
                      className="pb-remove-media-btn"
                      onClick={() => {
                        handleMediaChange('videoUrl', '');
                        handleMediaChange('videoPublicId', '');
                      }}
                      title="Remove Video"
                      aria-label="Remove Video"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                <div className="pb-field-group">
                  <label htmlFor="video-url-input">Video URL (.mp4 / .webm)</label>
                  <input
                    id="video-url-input"
                    type="text"
                    value={media.videoUrl || ''}
                    onChange={(e) => handleMediaChange('videoUrl', e.target.value)}
                    placeholder="https://.../video.mp4"
                  />
                </div>

                <label className="pb-upload-btn">
                  <Upload size={14} />
                  <span>{uploading ? 'Uploading Video...' : 'Upload Video File'}</span>
                  <input
                    type="file"
                    accept=".mp4,.webm"
                    onChange={(e) => handleFileUpload(e, 'video', 'videoUrl')}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>

                {uploadError && <span className="pb-error-text">{uploadError}</span>}
              </div>
            )}

            {/* SLIDESHOW MODE */}
            {media.mediaType === 'slideshow' && (
              <div className="pb-media-editor-subpanel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Slides ({(media.slides || []).length})</label>
                  <button type="button" className="pb-add-item-btn" onClick={handleAddSlide}>
                    <Plus size={12} /> Add Slide
                  </button>
                </div>

                <div className="pb-slide-list">
                  {(media.slides || []).map((slide, idx) => (
                    <div key={idx} className="pb-slide-item">
                      <div className="pb-slide-header">
                        <span className="pb-slide-num">#{idx + 1}</span>
                        <input
                          type="text"
                          value={slide.title || ''}
                          onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)}
                          placeholder="Slide Title"
                          className="pb-slide-title-input"
                        />
                        <div className="pb-slide-actions">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSlide(idx, -1)}
                            title="Move Up"
                            aria-label={`Move slide ${idx + 1} up`}
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (media.slides || []).length - 1}
                            onClick={() => handleMoveSlide(idx, 1)}
                            title="Move Down"
                            aria-label={`Move slide ${idx + 1} down`}
                          >
                            <ChevronDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlide(idx)}
                            className="danger"
                            title="Delete Slide"
                            aria-label={`Delete slide ${idx + 1}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={slide.url || ''}
                        onChange={(e) => handleUpdateSlide(idx, 'url', e.target.value)}
                        placeholder="Image URL"
                        style={{ fontSize: '11px', marginTop: '6px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. CUSTOM ITEMS (Value Cards & Process Timeline) */}
        {Array.isArray(content.customItems) && (
          <div className="pb-inspector-divider">
            <h4>CUSTOM ITEMS ({content.customItems.length})</h4>
            <div className="pb-custom-items-list">
              {content.customItems.map((item, idx) => (
                <div key={idx} className="pb-custom-item-card">
                  <div className="pb-item-header">
                    <span className="pb-item-num">Item #{idx + 1}</span>
                    {item.subtitle && <span className="pb-item-subtitle">{item.subtitle}</span>}
                  </div>
                  <div className="pb-field-group">
                    <label htmlFor={`custom-item-title-${idx}`}>Title</label>
                    <input
                      id={`custom-item-title-${idx}`}
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => handleUpdateCustomItem(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="pb-field-group">
                    <label htmlFor={`custom-item-text-${idx}`}>Description Text</label>
                    <textarea
                      id={`custom-item-text-${idx}`}
                      rows="2"
                      value={item.text || ''}
                      onChange={(e) => handleUpdateCustomItem(idx, 'text', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
