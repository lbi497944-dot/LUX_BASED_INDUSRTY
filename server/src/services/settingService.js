import SiteSetting from '../models/SiteSetting.js';
import { deleteCloudinaryAsset } from '../middleware/uploadMiddleware.js';

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
        const isSafe = rawUrl.length > 0 && validateSafeSocialUrl(rawUrl);
        const url = isSafe ? rawUrl : '';
        const icon = typeof item.icon === 'string' ? item.icon.trim() : platform;
        const active = isSafe ? (item.active !== undefined ? Boolean(item.active) : true) : false;
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
        const isSafe = rawUrl.length > 0 && validateSafeSocialUrl(rawUrl);
        const url = isSafe ? rawUrl : '';
        normalized.push({
          id: p.platform,
          platform: p.platform,
          label: p.label,
          url,
          icon: p.platform,
          active: isSafe,
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
  if (settings && settings.socialLinks !== undefined) {
    settings.socialLinks = normalizeSocialLinks(settings.socialLinks);
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
