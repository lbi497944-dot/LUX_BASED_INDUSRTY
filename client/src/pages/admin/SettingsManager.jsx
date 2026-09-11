import { useState, useEffect } from 'react';
import { settingService } from '../../services/settingService';
import { uploadService } from '../../services/uploadService';
import { useSettings } from '../../context/SettingsContext';
import {
  Save,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  Upload,
  Image,
  Trash2,
  Plus,
  Edit2,
  Star,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  X,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import ModalConfirm from '../../components/modals/ModalConfirm';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

const EMPTY_LOCATION = {
  name: '',
  address: '',
  city: '',
  country: '',
  phone: '',
  email: '',
  mapUrl: '',
  isPrimary: false,
  isActive: true,
  order: 0,
};

export default function SettingsManager() {
  const { settings, refreshSettings } = useSettings();
  const [formData, setFormData] = useState({
    brandName: '',
    tagline: '',
    logo: '',
    logoPublicId: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    country: '',
    businessHours: '',
    catalogueUrl: '',
    locations: [],
    socialLinks: {
      instagram: '',
      linkedin: '',
      pinterest: '',
      facebook: '',
    },
    defaultSeo: {
      title: '',
      description: '',
      ogImage: '',
    },
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Logo state
  const [logoMode, setLogoMode] = useState('upload');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState(null);

  // Locations modal & delete state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocationIndex, setEditingLocationIndex] = useState(null);
  const [locationFormData, setLocationFormData] = useState(EMPTY_LOCATION);
  const [locationFormError, setLocationFormError] = useState('');
  const [deleteLocationTarget, setDeleteLocationTarget] = useState(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        brandName: settings.brandName || 'LUX BASED INDUSTRY',
        tagline: settings.tagline || 'Illuminating Luxury Spaces',
        logo: settings.logo || '',
        logoPublicId: settings.logoPublicId || '',
        email: settings.email || 'concierge@veloura-lighting.com',
        phone: settings.phone || '+971 4 340 8899',
        whatsapp: settings.whatsapp || '+971 50 892 4411',
        address: settings.address || 'Alserkal Avenue, Building 42, Al Quoz 1, Dubai, UAE',
        city: settings.city || 'Dubai',
        country: settings.country || 'United Arab Emirates',
        businessHours: settings.businessHours || 'Monday – Saturday: 09:00 AM – 07:00 PM GST',
        catalogueUrl: settings.catalogueUrl || '',
        locations: Array.isArray(settings.locations) ? settings.locations : [],
        socialLinks: {
          instagram: settings.socialLinks?.instagram || 'https://instagram.com/veloura.lighting',
          linkedin: settings.socialLinks?.linkedin || 'https://linkedin.com/company/veloura-lighting',
          pinterest: settings.socialLinks?.pinterest || 'https://pinterest.com/velouralighting',
          facebook: settings.socialLinks?.facebook || 'https://facebook.com/velouralighting',
        },
        defaultSeo: {
          title: settings.defaultSeo?.title || 'LUX BASED INDUSTRY | Luxury Architectural Lighting in Dubai',
          description: settings.defaultSeo?.description || 'LUX BASED INDUSTRY creates bespoke architectural lighting, luxury chandeliers, and premium illumination for luxury villas, destination hotels, restaurants, and commercial spaces in Dubai and the UAE.',
          ogImage: settings.defaultSeo?.ogImage || '',
        },
      });

      if (settings.logo && !settings.logoPublicId) {
        setLogoMode('url');
      }
    }
  }, [settings]);

  // Handle Logo Upload via uploadService
  const handleLogoFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError(null);

    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setLogoError('Unsupported format. Only JPG, PNG, and WEBP images are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setLogoError('File size exceeds the 10MB limit.');
      e.target.value = '';
      return;
    }

    try {
      setLogoUploading(true);
      const res = await uploadService.uploadFile(file);
      if (res?.data?.url) {
        setFormData((prev) => ({
          ...prev,
          logo: res.data.url,
          logoPublicId: res.data.publicId || '',
        }));
        setToast({
          type: 'success',
          title: 'Logo Uploaded',
          message: 'Image uploaded to Cloudinary. Click "Save Global Settings" to persist.',
        });
      }
    } catch (err) {
      setLogoError(err?.message || 'Failed to upload logo image.');
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const handleClearLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logo: '',
      logoPublicId: '',
    }));
    setLogoError(null);
  };

  // Location CRUD operations
  const handleOpenAddLocation = () => {
    setEditingLocationIndex(null);
    setLocationFormData({
      ...EMPTY_LOCATION,
      order: formData.locations.length,
      isPrimary: formData.locations.length === 0,
    });
    setLocationFormError('');
    setIsLocationModalOpen(true);
  };

  const handleOpenEditLocation = (index) => {
    setEditingLocationIndex(index);
    setLocationFormData({ ...formData.locations[index] });
    setLocationFormError('');
    setIsLocationModalOpen(true);
  };

  const handleSaveLocationModal = (e) => {
    e.preventDefault();
    if (!locationFormData.name.trim()) {
      setLocationFormError('Location name is required.');
      return;
    }
    if (!locationFormData.address.trim()) {
      setLocationFormError('Physical address is required.');
      return;
    }

    if (locationFormData.mapUrl && !locationFormData.mapUrl.startsWith('http')) {
      setLocationFormError('Map URL must begin with http:// or https://');
      return;
    }

    const updatedLocations = [...formData.locations];

    if (editingLocationIndex !== null) {
      // If marking as primary, reset other locations
      if (locationFormData.isPrimary) {
        updatedLocations.forEach((loc, idx) => {
          if (idx !== editingLocationIndex) loc.isPrimary = false;
        });
      }
      updatedLocations[editingLocationIndex] = { ...locationFormData };
    } else {
      // Adding new location
      if (locationFormData.isPrimary) {
        updatedLocations.forEach((loc) => {
          loc.isPrimary = false;
        });
      }
      updatedLocations.push({ ...locationFormData });
    }

    setFormData((prev) => ({
      ...prev,
      locations: updatedLocations,
    }));

    setIsLocationModalOpen(false);
  };

  const handleDeleteLocationConfirm = () => {
    if (deleteLocationTarget === null) return;
    const updatedLocations = formData.locations.filter((_, idx) => idx !== deleteLocationTarget);

    // If deleted location was primary, promote first remaining location
    if (formData.locations[deleteLocationTarget]?.isPrimary && updatedLocations.length > 0) {
      updatedLocations[0].isPrimary = true;
    }

    setFormData((prev) => ({
      ...prev,
      locations: updatedLocations,
    }));
    setDeleteLocationTarget(null);
    setToast({ type: 'success', title: 'Location Removed', message: 'Showroom location removed from draft.' });
  };

  const handleToggleLocationActive = (index) => {
    const updated = [...formData.locations];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    setFormData((prev) => ({ ...prev, locations: updated }));
  };

  const handleSetLocationPrimary = (index) => {
    const updated = formData.locations.map((loc, idx) => ({
      ...loc,
      isPrimary: idx === index,
    }));
    setFormData((prev) => ({ ...prev, locations: updated }));
  };

  const handleMoveLocation = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.locations.length) return;

    const updated = [...formData.locations];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Normalize order values
    updated.forEach((loc, idx) => {
      loc.order = idx;
    });

    setFormData((prev) => ({ ...prev, locations: updated }));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.brandName.trim()) {
      setToast({ type: 'error', title: 'Validation Error', message: 'Company brand name cannot be empty.' });
      return;
    }

    setSaving(true);
    try {
      await settingService.updateSettings(formData);
      await refreshSettings();
      setToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Studio identity, logo, and global configuration successfully updated.',
      });
    } catch (err) {
      setToast({ type: 'error', title: 'Save Failed', message: err?.message || 'Error updating settings.' });
    } finally {
      setSaving(false);
    }
  };

  const cleanWhatsAppPreview = (formData.whatsapp || '').replace(/[^0-9]/g, '');

  return (
    <div className="admin-page">
      <SEO title="Studio Settings & SEO | LBI CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Delete Location Confirmation Modal */}
      <ModalConfirm
        isOpen={deleteLocationTarget !== null}
        title="Delete Location"
        message={`Are you sure you want to remove "${formData.locations[deleteLocationTarget]?.name || 'this location'}"?`}
        onConfirm={handleDeleteLocationConfirm}
        onCancel={() => setDeleteLocationTarget(null)}
      />

      {/* Location Add / Edit Modal */}
      {isLocationModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsLocationModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-container admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsLocationModalOpen(false)} aria-label="Close modal">
              <X size={18} />
            </button>
            <div className="modal-header">
              <h2>{editingLocationIndex !== null ? 'Edit Showroom Location' : 'Add Showroom Location'}</h2>
              <p>Configure details for this studio, showroom, or regional branch.</p>
            </div>

            {locationFormError && (
              <div className="admin-login-alert" style={{ marginBottom: '16px' }}>
                <span>{locationFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveLocationModal} className="admin-modal-form">
              <div className="form-row">
                <label>
                  LOCATION / SHOWROOM NAME *
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dubai Flagship Showroom"
                    value={locationFormData.name}
                    onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                  />
                </label>
                <label>
                  CITY
                  <input
                    type="text"
                    placeholder="e.g. Dubai"
                    value={locationFormData.city}
                    onChange={(e) => setLocationFormData({ ...locationFormData, city: e.target.value })}
                  />
                </label>
              </div>

              <label>
                PHYSICAL ADDRESS *
                <input
                  type="text"
                  required
                  placeholder="e.g. Alserkal Avenue, Building 42, Al Quoz 1"
                  value={locationFormData.address}
                  onChange={(e) => setLocationFormData({ ...locationFormData, address: e.target.value })}
                />
              </label>

              <div className="form-row">
                <label>
                  COUNTRY
                  <input
                    type="text"
                    placeholder="e.g. United Arab Emirates"
                    value={locationFormData.country}
                    onChange={(e) => setLocationFormData({ ...locationFormData, country: e.target.value })}
                  />
                </label>
                <label>
                  DIRECT TELEPHONE
                  <input
                    type="text"
                    placeholder="e.g. +971 4 340 8899"
                    value={locationFormData.phone}
                    onChange={(e) => setLocationFormData({ ...locationFormData, phone: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  DIRECT EMAIL
                  <input
                    type="email"
                    placeholder="e.g. dubai@luxbasedindustry.com"
                    value={locationFormData.email}
                    onChange={(e) => setLocationFormData({ ...locationFormData, email: e.target.value })}
                  />
                </label>
                <label>
                  GOOGLE MAPS / DIRECTIONS URL
                  <input
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={locationFormData.mapUrl}
                    onChange={(e) => setLocationFormData({ ...locationFormData, mapUrl: e.target.value })}
                  />
                </label>
              </div>

              <div className="admin-checkbox-row" style={{ marginTop: '12px' }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={locationFormData.isPrimary}
                    onChange={(e) => setLocationFormData({ ...locationFormData, isPrimary: e.target.checked })}
                  />
                  <span>Primary Showroom / Main Headquarters</span>
                </label>
                <label className="checkbox-label" style={{ marginLeft: '24px' }}>
                  <input
                    type="checkbox"
                    checked={locationFormData.isActive}
                    onChange={(e) => setLocationFormData({ ...locationFormData, isActive: e.target.checked })}
                  />
                  <span>Active & Visible Publicly</span>
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsLocationModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold btn-sm">
                  {editingLocationIndex !== null ? 'Update Location' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">GLOBAL CONFIGURATION</span>
          <h1>Studio Settings & SEO</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-settings-form">
        {/* Panel 1: Brand & Identity */}
        <div className="admin-card-panel">
          <div className="panel-head">
            <h3>Company Identity & Branding</h3>
          </div>

          <div className="admin-form-grid">
            <div className="form-row">
              <label>
                COMPANY BRAND NAME *
                <input
                  type="text"
                  required
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="LUX BASED INDUSTRY"
                />
              </label>
              <label>
                TAGLINE
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Illuminating Luxury Spaces"
                />
              </label>
            </div>

            {/* Logo Manager */}
            <div className="admin-logo-manager-section">
              <label className="section-sublabel">COMPANY LOGO</label>

              <div className="image-mode-toggle" style={{ marginBottom: '12px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${logoMode === 'upload' ? 'btn-gold' : 'btn-outline'}`}
                  onClick={() => setLogoMode('upload')}
                >
                  <Upload size={14} /> Upload Image
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${logoMode === 'url' ? 'btn-gold' : 'btn-outline'}`}
                  onClick={() => setLogoMode('url')}
                >
                  <Image size={14} /> External URL
                </button>
              </div>

              {logoError && (
                <div className="admin-login-alert" style={{ marginBottom: '12px' }}>
                  <span>{logoError}</span>
                </div>
              )}

              {logoMode === 'upload' ? (
                <div className="logo-upload-dropzone">
                  <input
                    type="file"
                    id="logo-file-input"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleLogoFileSelect}
                    disabled={logoUploading}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="logo-file-input" className={`logo-upload-btn-label ${logoUploading ? 'disabled' : ''}`}>
                    {logoUploading ? (
                      <>
                        <Loader2 size={16} className="spin-icon" /> UPLOADING TO CLOUDINARY...
                      </>
                    ) : (
                      <>
                        <Upload size={16} /> CHOOSE LOGO FILE (JPG, PNG, WEBP — MAX 10MB)
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <div className="logo-url-input-wrap">
                  <input
                    type="url"
                    placeholder="https://your-domain.com/assets/logo.png"
                    value={formData.logo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        logo: e.target.value,
                        logoPublicId: '', // External URL has no Cloudinary public ID
                      })
                    }
                  />
                </div>
              )}

              {/* Logo Preview */}
              {formData.logo && (
                <div className="admin-logo-preview-card">
                  <div className="admin-logo-preview-image-box">
                    <img src={formData.logo} alt="Logo Preview" className="admin-logo-preview-img" />
                  </div>
                  <div className="admin-logo-preview-info">
                    <div className="admin-logo-badges">
                      {formData.logoPublicId ? (
                        <span className="badge badge-cloudinary">Cloudinary Hosted</span>
                      ) : (
                        <span className="badge badge-external">External Hosted</span>
                      )}
                    </div>
                    <span className="admin-logo-url-preview">{formData.logo}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-danger-hover"
                    onClick={handleClearLogo}
                    title="Remove Logo"
                  >
                    <Trash2 size={14} /> REMOVE LOGO
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel 2: Studio Contact & Concierge */}
        <div className="admin-card-panel">
          <div className="panel-head">
            <h3>Studio Contact & Concierge</h3>
          </div>

          <div className="admin-form-grid">
            <div className="form-row">
              <label>
                PUBLIC ENQUIRY EMAIL
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="concierge@veloura-lighting.com"
                />
              </label>
              <label>
                TELEPHONE NUMBER
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+971 4 340 8899"
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                WHATSAPP CONCIERGE NUMBER
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+971 50 892 4411"
                />
                {cleanWhatsAppPreview && (
                  <span className="field-hint" style={{ marginTop: '4px', display: 'block', fontSize: '11px', color: 'var(--gold)' }}>
                    Cleaned link: wa.me/{cleanWhatsAppPreview}
                  </span>
                )}
              </label>
              <label>
                STUDIO OPERATING HOURS
                <input
                  type="text"
                  value={formData.businessHours}
                  onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                  placeholder="Monday – Saturday: 09:00 AM – 07:00 PM GST"
                />
              </label>
            </div>

            <label>
              CATALOGUE DOWNLOAD PATH / URL
              <input
                type="text"
                value={formData.catalogueUrl}
                onChange={(e) => setFormData({ ...formData, catalogueUrl: e.target.value })}
                placeholder="/downloads/LBI_Catalogue_2026.pdf"
              />
            </label>
          </div>
        </div>

        {/* Panel 3: Showrooms & Locations */}
        <div className="admin-card-panel">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Studio Showrooms & Locations</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Manage physical showroom directories, addresses, and navigation links.
              </p>
            </div>
            <button type="button" className="btn btn-gold btn-sm" onClick={handleOpenAddLocation}>
              <Plus size={14} /> ADD LOCATION
            </button>
          </div>

          <div className="admin-locations-manager-body">
            {formData.locations.length === 0 ? (
              <div className="admin-empty-state" style={{ padding: '24px' }}>
                <MapPin size={28} style={{ color: 'var(--gold)' }} />
                <p style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>
                  No individual showroom locations added yet. Public site falls back to legacy studio address.
                </p>
              </div>
            ) : (
              <div className="admin-locations-grid">
                {formData.locations.map((loc, idx) => (
                  <div key={loc._id || `loc-${idx}`} className={`admin-location-card ${loc.isPrimary ? 'primary-card' : ''}`}>
                    <div className="location-card-header">
                      <div className="location-card-title-wrap">
                        <h4>{loc.name || 'Untitled Location'}</h4>
                        <div className="location-card-badges">
                          {loc.isPrimary && <span className="badge badge-primary"><Star size={11} /> Primary</span>}
                          {loc.isActive ? (
                            <span className="badge badge-active"><CheckCircle2 size={11} /> Active</span>
                          ) : (
                            <span className="badge badge-inactive"><XCircle size={11} /> Inactive</span>
                          )}
                        </div>
                      </div>
                      <div className="location-card-actions">
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleMoveLocation(idx, -1)}
                          disabled={idx === 0}
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleMoveLocation(idx, 1)}
                          disabled={idx === formData.locations.length - 1}
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleOpenEditLocation(idx)}
                          title="Edit Location"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-danger"
                          onClick={() => setDeleteLocationTarget(idx)}
                          title="Delete Location"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="location-card-body">
                      <p className="location-address">
                        <MapPin size={14} /> {loc.address}
                        {loc.city && `, ${loc.city}`}
                        {loc.country && `, ${loc.country}`}
                      </p>
                      {loc.phone && (
                        <p className="location-phone">
                          <Phone size={13} /> {loc.phone}
                        </p>
                      )}
                      {loc.email && (
                        <p className="location-email">
                          <Mail size={13} /> {loc.email}
                        </p>
                      )}
                      {loc.mapUrl && (
                        <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" className="location-map-link">
                          <ExternalLink size={12} /> View on Map
                        </a>
                      )}
                    </div>

                    <div className="location-card-footer">
                      {!loc.isPrimary && (
                        <button
                          type="button"
                          className="btn-text-action"
                          onClick={() => handleSetLocationPrimary(idx)}
                        >
                          Set as Primary
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-text-action"
                        onClick={() => handleToggleLocationActive(idx)}
                      >
                        {loc.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel 4: Social Media Links */}
        <div className="admin-card-panel">
          <div className="panel-head">
            <h3>Social Media Channels</h3>
          </div>

          <div className="admin-form-grid">
            <div className="form-row">
              <label>
                INSTAGRAM URL
                <input
                  type="url"
                  value={formData.socialLinks.instagram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/..."
                />
              </label>
              <label>
                LINKEDIN URL
                <input
                  type="url"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/company/..."
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                PINTEREST URL
                <input
                  type="url"
                  value={formData.socialLinks.pinterest}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, pinterest: e.target.value },
                    })
                  }
                  placeholder="https://pinterest.com/..."
                />
              </label>
              <label>
                FACEBOOK URL
                <input
                  type="url"
                  value={formData.socialLinks.facebook}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/..."
                />
              </label>
            </div>
          </div>
        </div>

        {/* Panel 5: Global SEO Defaults */}
        <div className="admin-card-panel">
          <div className="panel-head">
            <h3>Default Search Engine Optimization (SEO)</h3>
          </div>

          <div className="admin-form-grid">
            <label>
              DEFAULT META TITLE
              <input
                type="text"
                value={formData.defaultSeo.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultSeo: { ...formData.defaultSeo, title: e.target.value },
                  })
                }
              />
            </label>

            <label>
              DEFAULT META DESCRIPTION
              <textarea
                rows="3"
                value={formData.defaultSeo.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultSeo: { ...formData.defaultSeo, description: e.target.value },
                  })
                }
              ></textarea>
            </label>

            <label>
              DEFAULT SOCIAL SHARE IMAGE (OG:IMAGE URL)
              <input
                type="url"
                value={formData.defaultSeo.ogImage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultSeo: { ...formData.defaultSeo, ogImage: e.target.value },
                  })
                }
              />
            </label>
          </div>
        </div>

        <div className="admin-form-submit-row">
          <button type="submit" className="btn btn-gold" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="spin-icon" /> SAVING CONFIGURATION...
              </>
            ) : (
              <>
                <Save size={16} /> SAVE GLOBAL SETTINGS
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

