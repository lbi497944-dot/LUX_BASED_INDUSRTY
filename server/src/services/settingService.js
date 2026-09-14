import path from 'path';
import SiteSetting from '../models/SiteSetting.js';
import {
  deleteCloudinaryAsset,
  validatePdfBuffer,
  uploadCatalogueStreamToCloudinary,
} from '../middleware/uploadMiddleware.js';

export const _deps = {
  SiteSetting,
  deleteCloudinaryAsset,
  uploadCatalogueStreamToCloudinary,
};

export const validateSafeSocialUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  const sanitized = trimmed.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();

  // Reject dangerous protocols
  if (
    sanitized.startsWith('javascript:') ||
    sanitized.startsWith('data:') ||
    sanitized.startsWith('vbscript:') ||
    sanitized.startsWith('file:')
  ) {
    return false;
  }

  // Accept standard http, https, mailto, tel, or whatsapp schemes
  return (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    /^tel:/i.test(trimmed) ||
    /^whatsapp:\/\//i.test(trimmed)
  );
};

export const normalizeSocialLinks = (socialLinks) => {
  if (!socialLinks) return [];

  // Case 1: Already an array format
  if (Array.isArray(socialLinks)) {
    const normalized = socialLinks
      .filter((item) => item && typeof item === 'object')
      .map((item, idx) => {
        const platform = (item.platform || item.id || 'custom').toLowerCase().trim();
        const label = (item.label || item.name || platform).trim();
        const rawUrl = typeof item.url === 'string' ? item.url.trim() : '';
        const containsVeloura = /veloura/i.test(rawUrl);
        const isSafe = rawUrl.length > 0 && validateSafeSocialUrl(rawUrl);
        const url = containsVeloura ? '' : (isSafe ? rawUrl : '');
        const icon = typeof item.icon === 'string' ? item.icon.trim() : platform;
        const active = isSafe && !containsVeloura ? (item.active !== undefined ? Boolean(item.active) : true) : false;
        const displayOrder = Number.isFinite(Number(item.displayOrder !== undefined ? item.displayOrder : item.order))
          ? Number(item.displayOrder !== undefined ? item.displayOrder : item.order)
          : idx;
        const id = item.id || item._id || `${platform}-${idx}`;

        return {
          id: String(id),
          platform,
          label: label || platform.charAt(0).toUpperCase() + platform.slice(1),
          url,
          icon: icon || platform,
          active,
          displayOrder,
        };
      });

    normalized.sort((a, b) => a.displayOrder - b.displayOrder);
    return normalized;
  }

  // Case 2: Legacy object format { instagram: '...', linkedin: '...', pinterest: '...', facebook: '...' }
  if (typeof socialLinks === 'object') {
    const legacyPlatforms = [
      { platform: 'instagram', label: 'Instagram' },
      { platform: 'linkedin', label: 'LinkedIn' },
      { platform: 'pinterest', label: 'Pinterest' },
      { platform: 'facebook', label: 'Facebook' },
    ];

    const normalized = [];
    let orderIndex = 0;
    legacyPlatforms.forEach((p) => {
      if (p.platform in socialLinks) {
        const rawUrl = typeof socialLinks[p.platform] === 'string' ? socialLinks[p.platform].trim() : '';
        const containsVeloura = /veloura/i.test(rawUrl);
        const isSafe = rawUrl.length > 0 && validateSafeSocialUrl(rawUrl);
        const url = containsVeloura ? '' : (isSafe ? rawUrl : '');
        normalized.push({
          id: p.platform,
          platform: p.platform,
          label: p.label,
          url,
          icon: p.platform,
          active: isSafe && !containsVeloura,
          displayOrder: orderIndex++,
        });
      }
    });

    return normalized;
  }

  return [];
};

export const getSiteSettings = async () => {
  let settings = await SiteSetting.findOne();
  if (!settings) {
    settings = await SiteSetting.create({});
  }

  let modified = false;

  // 1. Email normalization: authoritative LBI email
  if (!settings.email || /veloura/i.test(settings.email) || settings.email.trim() === 'concierge@luxbasedindustry.com') {
    settings.email = 'luxbasedindustries@gmail.com';
    modified = true;
  }

  // 2. BrandName normalization: authoritative LBI brand name
  if (!settings.brandName || /veloura/i.test(settings.brandName) || settings.brandName.trim() === 'LBI') {
    settings.brandName = 'LUX BASED INDUSTRY';
    modified = true;
  }

  // 3. Catalogue normalization: ensure structured catalogue object & remove broken/legacy Veloura links
  if (!settings.catalogue || typeof settings.catalogue !== 'object') {
    settings.catalogue = {
      url: '',
      publicId: '',
      resourceType: 'image',
      originalFilename: '',
      bytes: 0,
      mimeType: 'application/pdf',
      updatedAt: null,
    };
  }

  if (settings.catalogue?.url && /veloura/i.test(settings.catalogue.url)) {
    settings.catalogue.url = '';
    settings.catalogue.publicId = '';
    settings.catalogue.originalFilename = '';
    settings.catalogue.bytes = 0;
    settings.catalogue.updatedAt = null;
    modified = true;
  }

  if (settings.catalogueUrl && /veloura/i.test(settings.catalogueUrl)) {
    settings.catalogueUrl = '';
    modified = true;
  }

  // Backward compatibility: ensure catalogueUrl matches active catalogue.url
  const activeCatalogueUrl = settings.catalogue?.url || '';
  if (settings.catalogueUrl !== activeCatalogueUrl) {
    settings.catalogueUrl = activeCatalogueUrl;
    modified = true;
  }

  // 4. Default SEO normalization
  if (settings.defaultSeo) {
    if (settings.defaultSeo.description && /veloura/i.test(settings.defaultSeo.description)) {
      settings.defaultSeo.description =
        'LUX BASED INDUSTRY creates bespoke architectural lighting, luxury chandeliers, and premium illumination for luxury villas, destination hotels, restaurants, and commercial spaces in Dubai and the UAE.';
      modified = true;
    }
    if (
      settings.defaultSeo.title &&
      (/veloura/i.test(settings.defaultSeo.title) || settings.defaultSeo.title.startsWith('LBI Lighting'))
    ) {
      settings.defaultSeo.title = 'LUX BASED INDUSTRY | Luxury Architectural Lighting in Dubai';
      modified = true;
    }
    if (
      settings.defaultSeo.ogImage &&
      (/veloura/i.test(settings.defaultSeo.ogImage) || settings.defaultSeo.ogImage.includes('drive.google.com'))
    ) {
      settings.defaultSeo.ogImage =
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&h=630&q=90';
      modified = true;
    }
  }

  // 5. Social links normalization
  if (settings && settings.socialLinks !== undefined) {
    const prevSocialJson = JSON.stringify(settings.socialLinks);
    settings.socialLinks = normalizeSocialLinks(settings.socialLinks);
    if (JSON.stringify(settings.socialLinks) !== prevSocialJson) {
      modified = true;
    }
  }

  // Defensive auto-healing in database if any legacy fields were normalized
  if (modified && settings._id && typeof SiteSetting.updateOne === 'function') {
    try {
      await SiteSetting.updateOne(
        { _id: settings._id },
        {
          $set: {
            email: settings.email,
            brandName: settings.brandName,
            catalogue: settings.catalogue,
            catalogueUrl: settings.catalogueUrl,
            defaultSeo: settings.defaultSeo,
            socialLinks: settings.socialLinks,
          },
        }
      );
    } catch {
      // Non-blocking in-memory fallback
    }
  }

  return settings;
};

const normalizeLocations = (locations) => {
  if (!Array.isArray(locations)) return null;

  // Normalize location objects
  const normalized = locations.map((loc, idx) => ({
    ...(loc._id ? { _id: loc._id } : {}),
    name: (loc.name || '').trim(),
    address: (loc.address || '').trim(),
    city: (loc.city || '').trim(),
    country: (loc.country || '').trim(),
    phone: (loc.phone || '').trim(),
    email: (loc.email || '').trim(),
    mapUrl: (loc.mapUrl || '').trim(),
    isPrimary: Boolean(loc.isPrimary),
    isActive: loc.isActive !== undefined ? Boolean(loc.isActive) : true,
    order: Number.isFinite(Number(loc.order)) ? Number(loc.order) : idx,
  }));

  // Sort by order ascending
  normalized.sort((a, b) => a.order - b.order);

  // Ensure at most ONE isPrimary=true
  if (normalized.length > 0) {
    const primaryIndices = [];
    normalized.forEach((loc, idx) => {
      if (loc.isPrimary) primaryIndices.push(idx);
    });

    if (primaryIndices.length > 1) {
      // Keep only the first one as primary, reset others
      for (let i = 1; i < primaryIndices.length; i++) {
        normalized[primaryIndices[i]].isPrimary = false;
      }
    } else if (primaryIndices.length === 0) {
      // If none marked primary, pick first active, or first location
      const firstActiveIdx = normalized.findIndex((loc) => loc.isActive);
      if (firstActiveIdx !== -1) {
        normalized[firstActiveIdx].isPrimary = true;
      } else {
        normalized[0].isPrimary = true;
      }
    }
  }

  return normalized;
};

const syncPrimaryLocationToTopLevel = (updateData, normalizedLocations) => {
  if (normalizedLocations && normalizedLocations.length > 0) {
    const primary =
      normalizedLocations.find((loc) => loc.isPrimary && loc.isActive) ||
      normalizedLocations.find((loc) => loc.isActive) ||
      normalizedLocations[0];

    if (primary) {
      if (primary.address) updateData.address = primary.address;
      if (primary.city) updateData.city = primary.city;
      if (primary.country) updateData.country = primary.country;
    }
  }
};

export const updateSiteSettings = async (updateData) => {
  let existingSettings = await SiteSetting.findOne();

  // WhatsApp number numeric-only normalization
  if (updateData.whatsapp !== undefined) {
    updateData.whatsappNumberClean = updateData.whatsapp
      ? updateData.whatsapp.replace(/[^0-9]/g, '')
      : '';
  }

  // Social links normalization
  if (updateData.socialLinks !== undefined) {
    updateData.socialLinks = normalizeSocialLinks(updateData.socialLinks);
  }

  // Handle locations synchronization if locations array provided
  if (updateData.locations !== undefined) {
    const normalized = normalizeLocations(updateData.locations);
    if (normalized !== null) {
      updateData.locations = normalized;
      syncPrimaryLocationToTopLevel(updateData, normalized);
    }
  }

  // If no document exists in DB, create initial document
  if (!existingSettings) {
    try {
      const settings = await SiteSetting.create(updateData);
      return settings;
    } catch (createErr) {
      // Rollback newly uploaded Cloudinary logo asset if creation failed
      if (
        updateData.logoPublicId &&
        typeof updateData.logoPublicId === 'string' &&
        updateData.logoPublicId.trim()
      ) {
        try {
          await deleteCloudinaryAsset(updateData.logoPublicId.trim());
        } catch (rollbackErr) {
          console.error(
            '[SiteSetting Creation Cleanup Error] Failed to rollback logo:',
            rollbackErr.message
          );
        }
      }
      throw createErr;
    }
  }

  // Determine logo replacement / deletion lifecycle
  let oldLogoPublicIdToDelete = null;
  const isLogoChanging =
    updateData.logo !== undefined && updateData.logo !== existingSettings.logo;
  const isLogoPublicIdChanging =
    updateData.logoPublicId !== undefined &&
    updateData.logoPublicId !== existingSettings.logoPublicId;

  const existingLogoPublicId = existingSettings.logoPublicId
    ? existingSettings.logoPublicId.trim()
    : '';
  const newLogoPublicId = updateData.logoPublicId
    ? updateData.logoPublicId.trim()
    : '';

  if ((isLogoChanging || isLogoPublicIdChanging) && existingLogoPublicId) {
    if (newLogoPublicId !== existingLogoPublicId) {
      oldLogoPublicIdToDelete = existingLogoPublicId;
    }
  }

  let updatedSettings;
  try {
    updatedSettings = await SiteSetting.findByIdAndUpdate(
      existingSettings._id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
  } catch (updateErr) {
    // If DB update failed, rollback new Cloudinary asset if one was uploaded
    if (
      isLogoPublicIdChanging &&
      newLogoPublicId &&
      newLogoPublicId !== existingLogoPublicId
    ) {
      try {
        await deleteCloudinaryAsset(newLogoPublicId);
      } catch (rollbackErr) {
        console.error(
          '[SiteSetting Update Cleanup Error] Failed to rollback new logo asset:',
          rollbackErr.message
        );
      }
    }
    throw updateErr;
  }

  // After successful DB update, clean up old Cloudinary asset if replaced or cleared
  if (oldLogoPublicIdToDelete) {
    try {
      await deleteCloudinaryAsset(oldLogoPublicIdToDelete);
    } catch (cleanupErr) {
      console.warn(
        `[SiteSetting Logo Cleanup Warning] Failed to delete old logo asset ${oldLogoPublicIdToDelete}:`,
        cleanupErr.message
      );
    }
  }

  if (updatedSettings && updatedSettings.socialLinks !== undefined) {
    updatedSettings.socialLinks = normalizeSocialLinks(updatedSettings.socialLinks);
  }

  return updatedSettings;
};

/**
 * Upload or replace official architectural lighting catalogue PDF with transactional lifecycle
 */
export const uploadCataloguePdf = async (file) => {
  if (!file || !file.buffer) {
    const error = new Error('No PDF file was provided in the upload request.');
    error.statusCode = 400;
    throw error;
  }

  // Validate magic bytes (%PDF-) to prevent spoofed/malformed uploads
  validatePdfBuffer(file.buffer);

  // Sanitize filename
  const rawName = file.originalname || 'LUX_BASED_INDUSTRY_Catalogue_2026.pdf';
  const sanitizedFilename = path.basename(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');

  let existingSettings = await _deps.SiteSetting.findOne();
  if (!existingSettings) {
    existingSettings = await _deps.SiteSetting.create({});
  }

  // Identify old asset to delete after DB commit
  const oldAsset = existingSettings.catalogue?.publicId
    ? {
        publicId: existingSettings.catalogue.publicId.trim(),
        resourceType: existingSettings.catalogue.resourceType || 'image',
      }
    : null;

  // Stream upload memory buffer to Cloudinary
  const uploadResult = await _deps.uploadCatalogueStreamToCloudinary(
    file.buffer,
    sanitizedFilename,
    file.mimetype || 'application/pdf'
  );

  const newCatalogue = {
    url: uploadResult.url,
    publicId: uploadResult.publicId,
    resourceType: uploadResult.resourceType || 'image',
    originalFilename: sanitizedFilename,
    bytes: uploadResult.bytes || file.size || (file.buffer ? file.buffer.length : 0),
    mimeType: 'application/pdf',
    updatedAt: new Date(),
  };

  let updatedSettings;
  try {
    updatedSettings = await _deps.SiteSetting.findByIdAndUpdate(
      existingSettings._id,
      {
        $set: {
          catalogue: newCatalogue,
          catalogueUrl: uploadResult.url,
        },
      },
      { new: true, runValidators: true }
    );
  } catch (dbErr) {
    // Rollback: Clean up newly uploaded Cloudinary asset if DB write fails
    if (uploadResult.publicId) {
      try {
        await _deps.deleteCloudinaryAsset(uploadResult.publicId, {
          resource_type: uploadResult.resourceType,
        });
      } catch (rollbackErr) {
        console.error('[Catalogue Upload Rollback Error] Failed to delete orphaned asset:', rollbackErr.message);
      }
    }
    throw dbErr;
  }

  // Only AFTER successful DB update, clean up old Cloudinary asset
  if (oldAsset && oldAsset.publicId && oldAsset.publicId !== uploadResult.publicId) {
    try {
      await _deps.deleteCloudinaryAsset(oldAsset.publicId, {
        resource_type: oldAsset.resourceType,
      });
    } catch (cleanupErr) {
      console.warn(
        `[Catalogue Old Asset Cleanup Warning] Failed to delete replaced asset ${oldAsset.publicId}:`,
        cleanupErr.message
      );
    }
  }

  return updatedSettings.catalogue;
};

/**
 * Remove active catalogue PDF and clean up Cloudinary asset
 */
export const deleteCataloguePdf = async () => {
  let existingSettings = await _deps.SiteSetting.findOne();
  if (!existingSettings) {
    return { success: true, message: 'No active catalogue to delete.' };
  }

  const oldAsset = existingSettings.catalogue?.publicId
    ? {
        publicId: existingSettings.catalogue.publicId.trim(),
        resourceType: existingSettings.catalogue.resourceType || 'image',
      }
    : null;

  await _deps.SiteSetting.findByIdAndUpdate(
    existingSettings._id,
    {
      $set: {
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
      },
    },
    { new: true }
  );

  if (oldAsset && oldAsset.publicId) {
    try {
      await _deps.deleteCloudinaryAsset(oldAsset.publicId, {
        resource_type: oldAsset.resourceType,
      });
    } catch (cleanupErr) {
      console.warn(
        `[Catalogue Delete Cleanup Warning] Failed to delete asset ${oldAsset.publicId}:`,
        cleanupErr.message
      );
    }
  }

  return { success: true, message: 'Catalogue removed successfully.' };
};
