import { useState, useEffect, useCallback, useRef } from 'react';
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
  FileText,
  Eye,
  AlertCircle,
} from 'lucide-react';

import {
  PLATFORM_CATALOG,
  DEFAULT_BASELINE_PROFILES,
  getPlatformMetadata,
  validateSafeSocialUrl,
} from '../../utils/socialPlatforms';
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

const EMPTY_SOCIAL = {
  platform: 'instagram',
  label: '',
  url: '',
  icon: 'instagram',
  active: true,
  displayOrder: 0,
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
    catalogue: {
      url: '',
      publicId: '',
      resourceType: 'image',
      originalFilename: '',
      bytes: 0,
      mimeType: 'application/pdf',
      updatedAt: null,
    },
    catalogueUrl: '',
    locations: [],
    socialLinks: [],
    defaultSeo: {
      title: '',
      description: '',
      ogImage: '',
    },
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Logo state
  const [logoMode, setLogoMode] = useState('upload');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState(null);

  // Catalogue state
  const catalogueFileInputRef = useRef(null);
  const [catalogueUploading, setCatalogueUploading] = useState(false);
  const [catalogueError, setCatalogueError] = useState(null);
  const [showDeleteCatalogueModal, setShowDeleteCatalogueModal] = useState(false);
  const [showReplaceCatalogueModal, setShowReplaceCatalogueModal] = useState(false);
  const [pendingCatalogueFile, setPendingCatalogueFile] = useState(null);

  // Locations modal & delete state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocationIndex, setEditingLocationIndex] = useState(null);
  const [locationFormData, setLocationFormData] = useState(EMPTY_LOCATION);
  const [locationFormError, setLocationFormError] = useState('');
  const [deleteLocationTarget, setDeleteLocationTarget] = useState(null);

  // Social channels modal & delete state
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [editingSocialIndex, setEditingSocialIndex] = useState(null);
  const [socialFormData, setSocialFormData] = useState(EMPTY_SOCIAL);
  const [socialFormError, setSocialFormError] = useState('');
  const [deleteSocialTarget, setDeleteSocialTarget] = useState(null);

  // Authoritative normalization and application of settings into local form state
  const applySettingsToFormData = useCallback((sourceSettings) => {
    if (!sourceSettings) return;

    let normalizedSocialLinks = [];
    if (Array.isArray(sourceSettings.socialLinks)) {
      // Intentionally empty array [] is preserved as legitimate zero channels
      normalizedSocialLinks = sourceSettings.socialLinks.map((item, idx) => ({
        id: item.id || `soc-${idx}`,
        platform: item.platform || 'custom',
        label: item.label || getPlatformMetadata(item.platform || 'custom').name,
        url: item.url || '',
        icon: item.icon || item.platform || 'custom',
        active: item.active !== undefined ? Boolean(item.active) : true,
        displayOrder: Number.isFinite(item.displayOrder) ? item.displayOrder : idx,
      }));
    } else if (sourceSettings.socialLinks && typeof sourceSettings.socialLinks === 'object') {
      // Backward-compatibility: instagram: settings.socialLinks?.instagram || ''
      const legacyObject = {
        instagram: sourceSettings.socialLinks?.instagram || '',
        linkedin: sourceSettings.socialLinks?.linkedin || '',
        pinterest: sourceSettings.socialLinks?.pinterest || '',
        facebook: sourceSettings.socialLinks?.facebook || '',
      };
      // Only include legacy platforms that have an actual configured URL
      normalizedSocialLinks = DEFAULT_BASELINE_PROFILES
        .map((p, idx) => ({
          id: p.platform,
          platform: p.platform,
          label: p.label,
          url: (legacyObject[p.platform] || '').trim(),
          icon: p.platform,
          active: Boolean(legacyObject[p.platform] && legacyObject[p.platform].trim()),
          displayOrder: idx,
        }))
        .filter((p) => p.url.length > 0);
    } else {
      // When null/undefined, do NOT resurrect default baseline profiles
      normalizedSocialLinks = [];
    }

    setFormData({
      brandName: sourceSettings.brandName || 'LUX BASED INDUSTRY',
      tagline: sourceSettings.tagline || 'Illuminating Luxury Spaces',
      logo: sourceSettings.logo || '',
      logoPublicId: sourceSettings.logoPublicId || '',
      email: sourceSettings.email || 'concierge@luxbasedindustry.com',
      phone: sourceSettings.phone || '+971 4 340 8899',
      whatsapp: sourceSettings.whatsapp || '+971 50 892 4411',
      address: sourceSettings.address || 'Alserkal Avenue, Building 42, Al Quoz 1, Dubai, UAE',
      city: sourceSettings.city || 'Dubai',
      country: sourceSettings.country || 'United Arab Emirates',
      businessHours: sourceSettings.businessHours || 'Monday – Saturday: 09:00 AM – 07:00 PM GST',
      catalogue: sourceSettings.catalogue || {
        url: sourceSettings.catalogueUrl || '',
        publicId: '',
        resourceType: 'image',
        originalFilename: '',
        bytes: 0,
        mimeType: 'application/pdf',
        updatedAt: null,
      },
      catalogueUrl: sourceSettings.catalogue?.url || sourceSettings.catalogueUrl || '',
      locations: Array.isArray(sourceSettings.locations) ? sourceSettings.locations : [],
      socialLinks: normalizedSocialLinks,
      defaultSeo: {
        title: sourceSettings.defaultSeo?.title || 'LUX BASED INDUSTRY | Luxury Architectural Lighting in Dubai',
        description: sourceSettings.defaultSeo?.description || 'LUX BASED INDUSTRY creates bespoke architectural lighting, luxury chandeliers, and premium illumination for luxury villas, destination hotels, restaurants, and commercial spaces in Dubai and the UAE.',
        ogImage: sourceSettings.defaultSeo?.ogImage || '',
      },
    });

    if (sourceSettings.logo && !sourceSettings.logoPublicId) {
      setLogoMode('url');
    }
  }, []);

  // Dedicated mount synchronization: fetch latest authoritative settings on mount
  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Synchronize incoming settings into formData unless the admin has active unsaved edits
  useEffect(() => {
    if (settings && !isDirty) {
      applySettingsToFormData(settings);
    }
  }, [settings, isDirty, applySettingsToFormData]);

  // Helper to update top-level form fields and flag dirty state
  const updateField = (name, value) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Helper to update SEO fields and flag dirty state
  const updateSeoField = (name, value) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      defaultSeo: {
        ...prev.defaultSeo,
        [name]: value,
      },
    }));
  };

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
        setIsDirty(true);
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
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      logo: '',
      logoPublicId: '',
    }));
    setLogoError(null);
  };

  // Catalogue PDF Management Handlers
  const executeCatalogueUpload = async (file) => {
    try {
      setCatalogueUploading(true);
      setCatalogueError(null);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const res = await settingService.uploadCatalogue(uploadFormData);
      if (res?.data?.catalogue) {
        setFormData((prev) => ({
          ...prev,
          catalogue: res.data.catalogue,
          catalogueUrl: res.data.catalogue.url,
        }));
        await refreshSettings();
        setToast({
          type: 'success',
          title: 'Catalogue PDF Uploaded',
          message: `${res.data.catalogue.originalFilename || 'Catalogue'} is now live and downloadable.`,
        });
      }
    } catch (err) {
      const msg = err?.message || 'Failed to upload catalogue PDF.';
      setCatalogueError(msg);
      setToast({
        type: 'error',
        title: 'Upload Failed',
        message: msg,
      });
    } finally {
      setCatalogueUploading(false);
      setPendingCatalogueFile(null);
      setShowReplaceCatalogueModal(false);
      if (catalogueFileInputRef.current) {
        catalogueFileInputRef.current.value = '';
      }
    }
  };

  const handleCatalogueFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCatalogueError(null);

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf') {
      setCatalogueError('Unsupported format. Only official PDF documents (.pdf) are permitted.');
      e.target.value = '';
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setCatalogueError('File size exceeds the 25 MB limit.');
      e.target.value = '';
      return;
    }

    if (formData.catalogue?.url) {
      setPendingCatalogueFile(file);
      setShowReplaceCatalogueModal(true);
    } else {
      executeCatalogueUpload(file);
    }
  };

  const handleDeleteCatalogue = async () => {
    try {
      setCatalogueUploading(true);
      setCatalogueError(null);
      await settingService.deleteCatalogue();
      setFormData((prev) => ({
        ...prev,
        catalogue: {
          url: '',
          publicId: '',
          resourceType: 'image',
          originalFilename: '',
          bytes: 0,
          mimeType: 'application/pdf',
          updatedAt: null,
        },
        catalogueUrl: '',
      }));
      await refreshSettings();
      setToast({
        type: 'success',
        title: 'Catalogue Removed',
        message: 'Active catalogue PDF deleted. Public CTA switched to WhatsApp concierge.',
      });
    } catch (err) {
      const msg = err?.message || 'Failed to delete catalogue.';
      setCatalogueError(msg);
      setToast({
        type: 'error',
        title: 'Delete Failed',
        message: msg,
      });
    } finally {
      setCatalogueUploading(false);
      setShowDeleteCatalogueModal(false);
    }
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

    setIsDirty(true);
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

    setIsDirty(true);
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
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, locations: updated }));
  };

  const handleSetLocationPrimary = (index) => {
    const updated = formData.locations.map((loc, idx) => ({
      ...loc,
      isPrimary: idx === index,
    }));
    setIsDirty(true);
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

    setIsDirty(true);
    setFormData((prev) => ({ ...prev, locations: updated }));
  };

  // Social Channels CRUD operations
  const handleOpenAddSocial = () => {
    setEditingSocialIndex(null);
    const defaultPlatform = 'instagram';
    const meta = getPlatformMetadata(defaultPlatform);
    setSocialFormData({
      ...EMPTY_SOCIAL,
      id: `soc-${Date.now()}`,
      platform: defaultPlatform,
      label: meta.name,
      displayOrder: formData.socialLinks.length,
    });
    setSocialFormError('');
    setIsSocialModalOpen(true);
  };

  const handleOpenEditSocial = (index) => {
    setEditingSocialIndex(index);
    setSocialFormData({ ...formData.socialLinks[index] });
    setSocialFormError('');
    setIsSocialModalOpen(true);
  };

  const handleSocialPlatformChange = (newPlatform) => {
    const meta = getPlatformMetadata(newPlatform);
    setSocialFormData((prev) => {
      const prevMeta = getPlatformMetadata(prev.platform);
      const isCustomized = prev.label && prev.label !== prevMeta.name;
      return {
        ...prev,
        platform: newPlatform,
        label: isCustomized ? prev.label : meta.name,
        icon: newPlatform,
      };
    });
  };

  const handleSaveSocialModal = (e) => {
    e.preventDefault();
    const trimmedUrl = (socialFormData.url || '').trim();
    if (trimmedUrl && !validateSafeSocialUrl(trimmedUrl)) {
      setSocialFormError('Please enter a valid, safe URL starting with https://, http://, or whatsapp://');
      return;
    }

    const updatedSocials = [...formData.socialLinks];
    const meta = getPlatformMetadata(socialFormData.platform, socialFormData.label);
    const itemToSave = {
      ...socialFormData,
      label: (socialFormData.label || '').trim() || meta.name,
      url: trimmedUrl,
      icon: socialFormData.platform,
    };

    if (editingSocialIndex !== null) {
      updatedSocials[editingSocialIndex] = itemToSave;
    } else {
      updatedSocials.push(itemToSave);
    }

    updatedSocials.forEach((item, idx) => {
      item.displayOrder = idx;
    });

    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      socialLinks: updatedSocials,
    }));

    setIsSocialModalOpen(false);
  };

  const handleMoveSocial = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.socialLinks.length) return;

    const updated = [...formData.socialLinks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    updated.forEach((item, idx) => {
      item.displayOrder = idx;
    });

    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      socialLinks: updated,
    }));
  };

  const handleToggleSocialActive = (index) => {
    const updated = [...formData.socialLinks];
    updated[index] = {
      ...updated[index],
      active: !updated[index].active,
    };
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      socialLinks: updated,
    }));
  };

  const handleDeleteSocialConfirm = () => {
    if (deleteSocialTarget === null) return;
    const channelName = formData.socialLinks[deleteSocialTarget]?.label || 'Channel';
    const updated = formData.socialLinks.filter((_, idx) => idx !== deleteSocialTarget);
    updated.forEach((item, idx) => {
      item.displayOrder = idx;
    });
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      socialLinks: updated,
    }));
    setDeleteSocialTarget(null);
    setToast({
      type: 'info',
      title: 'Channel Removed (Unsaved)',
      message: `"${channelName}" removed. Click "Save Global Settings" below to persist changes to the database.`,
    });
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
      const res = await settingService.updateSettings(formData);
      const persistedSettings = res?.data?.settings;
      if (persistedSettings) {
        applySettingsToFormData(persistedSettings);
      }
      await refreshSettings();
      setIsDirty(false);
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

      {/* Delete Social Channel Confirmation Modal */}
      <ModalConfirm
        isOpen={deleteSocialTarget !== null}
        title="Delete Social Channel"
        message={`Are you sure you want to remove "${formData.socialLinks[deleteSocialTarget]?.label || 'this social channel'}"?`}
        onConfirm={handleDeleteSocialConfirm}
        onCancel={() => setDeleteSocialTarget(null)}
      />

      {/* Social Channel Add / Edit Modal */}
      {isSocialModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsSocialModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-container admin-modal-md" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsSocialModalOpen(false)} aria-label="Close modal">
              <X size={18} />
            </button>
            <div className="modal-header">
              <h2>{editingSocialIndex !== null ? 'Edit Social Channel' : 'Add Social Channel'}</h2>
              <p>Configure social platform, display label, and target profile URL.</p>
            </div>

            {socialFormError && (
              <div className="admin-login-alert" style={{ marginBottom: '16px' }}>
                <span>{socialFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSocialModal} className="admin-form-grid">
              <label>
                PLATFORM *
                <select
                  value={socialFormData.platform}
                  onChange={(e) => handleSocialPlatformChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'var(--charcoal-deep)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '14px',
                  }}
                >
                  {PLATFORM_CATALOG.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                DISPLAY LABEL
                <input
                  type="text"
                  placeholder="e.g. Instagram, Official YouTube, Portfolio"
                  value={socialFormData.label}
                  onChange={(e) => setSocialFormData({ ...socialFormData, label: e.target.value })}
                />
              </label>

              <label>
                PROFILE / CHANNEL URL
                <input
                  type="url"
                  placeholder={getPlatformMetadata(socialFormData.platform).placeholder}
                  value={socialFormData.url}
                  onChange={(e) => setSocialFormData({ ...socialFormData, url: e.target.value })}
                />
                <span className="field-hint" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Must start with https://, http://, or whatsapp:// (no dangerous javascript/data links)
                </span>
              </label>

              {/* Live circular preview */}
              <div className="social-preview-circle-wrap">
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Footer Preview:</span>
                <div className={`footer-social-btn ${getPlatformMetadata(socialFormData.platform).className}`}>
                  {getPlatformMetadata(socialFormData.platform).icon}
                </div>
                <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500 }}>
                  {socialFormData.label || getPlatformMetadata(socialFormData.platform).name}
                </span>
              </div>

              <div className="admin-checkbox-row" style={{ marginTop: '8px' }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={socialFormData.active}
                    onChange={(e) => setSocialFormData({ ...socialFormData, active: e.target.checked })}
                  />
                  <span>Active & Visible in Public Footer (only displayed if URL is non-empty)</span>
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsSocialModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold btn-sm">
                  {editingSocialIndex !== null ? 'Update Channel' : 'Add Channel'}
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
                  onChange={(e) => updateField('brandName', e.target.value)}
                  placeholder="LUX BASED INDUSTRY"
                />
              </label>
              <label>
                TAGLINE
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
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
                    onChange={(e) => {
                      setIsDirty(true);
                      setFormData({
                        ...formData,
                        logo: e.target.value,
                        logoPublicId: '', // External URL has no Cloudinary public ID
                      });
                    }}
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
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="concierge@luxbasedindustry.com"
                />
              </label>
              <label>
                TELEPHONE NUMBER
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
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
                  onChange={(e) => updateField('whatsapp', e.target.value)}
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
                  onChange={(e) => updateField('businessHours', e.target.value)}
                  placeholder="Monday – Saturday: 09:00 AM – 07:00 PM GST"
                />
              </label>
            </div>

          </div>
        </div>

        {/* Panel 3: Architectural Specification Catalogue (PDF) */}
        <div className="admin-card-panel">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Architectural Specification Catalogue (PDF)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Manage the official lighting specification catalogue PDF for client download across the website.
              </p>
            </div>
            {formData.catalogue?.url ? (
              <span className="badge badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={12} /> ACTIVE CATALOGUE
              </span>
            ) : (
              <span className="badge badge-inactive" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <XCircle size={12} /> NO CATALOGUE
              </span>
            )}
          </div>

          <div style={{ padding: '20px 24px' }}>
            <input
              type="file"
              ref={catalogueFileInputRef}
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={handleCatalogueFileSelect}
            />

            {catalogueError && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{catalogueError}</span>
              </div>
            )}

            {formData.catalogue?.url ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(230, 199, 122, 0.25)',
                  borderRadius: '6px',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(230, 199, 122, 0.1)',
                      border: '1px solid rgba(230, 199, 122, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold)',
                    }}
                  >
                    <FileText size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--white)' }}>
                      {formData.catalogue.originalFilename || 'LUX_BASED_INDUSTRY_Catalogue_2026.pdf'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formData.catalogue.bytes
                        ? `${(formData.catalogue.bytes / (1024 * 1024)).toFixed(2)} MB`
                        : 'PDF Document'}{' '}
                      • Updated{' '}
                      {formData.catalogue.updatedAt
                        ? new Date(formData.catalogue.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recently'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <a
                    href={formData.catalogue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    title="Open active catalogue in new tab"
                  >
                    <Eye size={14} /> VIEW PDF
                  </a>

                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    onClick={() => catalogueFileInputRef.current?.click()}
                    disabled={catalogueUploading}
                  >
                    {catalogueUploading ? (
                      <>
                        <Loader2 size={14} className="spin-icon" /> UPLOADING...
                      </>
                    ) : (
                      <>
                        <Upload size={14} /> REPLACE PDF
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setShowDeleteCatalogueModal(true)}
                    disabled={catalogueUploading}
                    title="Remove catalogue PDF"
                  >
                    <Trash2 size={14} /> REMOVE
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '24px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(230, 199, 122, 0.25)',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                <FileText size={32} style={{ color: 'var(--gold)', margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: 'var(--white)' }}>
                  No Catalogue Uploaded
                </h4>
                <p style={{ margin: '0 auto 16px', fontSize: '13px', color: 'var(--text-muted)', maxWidth: '540px', lineHeight: 1.5 }}>
                  When no catalogue is uploaded, public website CTAs automatically redirect clients to the studio WhatsApp concierge with a prefilled specification request. Upload an official PDF (up to 25 MB) to enable direct public downloads.
                </p>
                <button
                  type="button"
                  className="btn btn-gold btn-sm"
                  onClick={() => catalogueFileInputRef.current?.click()}
                  disabled={catalogueUploading}
                >
                  {catalogueUploading ? (
                    <>
                      <Loader2 size={14} className="spin-icon" /> UPLOADING PDF...
                    </>
                  ) : (
                    <>
                      <Upload size={14} /> UPLOAD CATALOGUE PDF (MAX 25 MB)
                    </>
                  )}
                </button>
              </div>
            )}
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

        {/* Panel 4: Social Media Channels */}
        <div className="admin-card-panel">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div>
                <h3>Social Media Channels</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Manage brand social profiles, live public display, ordering, and platform links.
                </p>
              </div>
              {isDirty && (
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--gold)',
                    backgroundColor: 'rgba(230, 199, 122, 0.12)',
                    border: '1px solid rgba(230, 199, 122, 0.3)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Unsaved changes staged
                </span>
              )}
            </div>
            <button type="button" className="btn btn-gold btn-sm" onClick={handleOpenAddSocial}>
              <Plus size={14} /> ADD SOCIAL CHANNEL
            </button>
          </div>

          <div className="admin-socials-manager-body">
            {formData.socialLinks.length === 0 ? (
              <div className="admin-empty-state" style={{ padding: '24px' }}>
                <Share2 size={28} style={{ color: 'var(--gold)' }} />
                <p style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>
                  No social media channels configured. Public footer will omit the social links section.
                </p>
              </div>
            ) : (
              <div className="admin-socials-grid">
                {formData.socialLinks.map((social, idx) => {
                  const meta = getPlatformMetadata(social.platform, social.label);
                  return (
                    <div
                      key={social.id || `soc-${idx}`}
                      className={`admin-social-card ${!social.active ? 'is-inactive' : ''}`}
                    >
                      <div className="social-card-top">
                        <div className="social-card-identity">
                          <div className={`footer-social-btn ${meta.className}`}>
                            {meta.icon}
                          </div>
                          <div className="social-card-info">
                            <h4 className="social-card-name">{social.label || meta.name}</h4>
                            <div className="social-card-badges">
                              <span className="badge badge-external">{social.platform}</span>
                              {social.active ? (
                                <span className="badge badge-active"><CheckCircle2 size={11} /> Active</span>
                              ) : (
                                <span className="badge badge-inactive"><XCircle size={11} /> Inactive</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="social-card-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleMoveSocial(idx, -1)}
                            disabled={idx === 0}
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleMoveSocial(idx, 1)}
                            disabled={idx === formData.socialLinks.length - 1}
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleOpenEditSocial(idx)}
                            title="Edit Channel"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-danger"
                            onClick={() => setDeleteSocialTarget(idx)}
                            title="Delete Channel"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="social-card-url">
                        {social.url ? (
                          <a href={social.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={12} /> {social.url}
                          </a>
                        ) : (
                          <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No URL configured (hidden)</span>
                        )}
                      </div>

                      <div className="social-card-footer">
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Order: #{idx + 1}
                        </span>
                        <button
                          type="button"
                          className="btn-text-action"
                          onClick={() => handleToggleSocialActive(idx)}
                        >
                          {social.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                onChange={(e) => updateSeoField('title', e.target.value)}
              />
            </label>

            <label>
              DEFAULT META DESCRIPTION
              <textarea
                rows="3"
                value={formData.defaultSeo.description}
                onChange={(e) => updateSeoField('description', e.target.value)}
              ></textarea>
            </label>

            <label>
              DEFAULT SOCIAL SHARE IMAGE (OG:IMAGE URL)
              <input
                type="url"
                value={formData.defaultSeo.ogImage}
                onChange={(e) => updateSeoField('ogImage', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="admin-form-submit-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
          {isDirty && (
            <span
              style={{
                fontSize: '12px',
                color: 'var(--gold)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(230, 199, 122, 0.1)',
                padding: '6px 14px',
                borderRadius: '4px',
                border: '1px solid rgba(230, 199, 122, 0.25)',
              }}
            >
              Unsaved changes pending save
            </span>
          )}
        </div>
      </form>

      {/* Modal: Delete Catalogue Confirmation */}
      <ModalConfirm
        isOpen={showDeleteCatalogueModal}
        title="Remove Catalogue PDF"
        message="Are you sure you want to remove the active catalogue PDF? All public catalogue CTAs across the website will immediately switch to routing client inquiries to the studio WhatsApp concierge."
        confirmText="Remove PDF"
        onConfirm={handleDeleteCatalogue}
        onCancel={() => setShowDeleteCatalogueModal(false)}
        loading={catalogueUploading}
      />

      {/* Modal: Replace Catalogue Confirmation */}
      <ModalConfirm
        isOpen={showReplaceCatalogueModal}
        title="Replace Active Catalogue PDF"
        message={`This will upload "${pendingCatalogueFile?.name}" and immediately replace the active catalogue PDF on the live website. Continue?`}
        confirmText="Replace Catalogue"
        onConfirm={() => executeCatalogueUpload(pendingCatalogueFile)}
        onCancel={() => {
          setShowReplaceCatalogueModal(false);
          setPendingCatalogueFile(null);
          if (catalogueFileInputRef.current) catalogueFileInputRef.current.value = '';
        }}
        loading={catalogueUploading}
      />
    </div>
  );
}
