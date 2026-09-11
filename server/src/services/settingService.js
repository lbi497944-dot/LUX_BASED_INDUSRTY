import SiteSetting from '../models/SiteSetting.js';
import { deleteCloudinaryAsset } from '../middleware/uploadMiddleware.js';

export const getSiteSettings = async () => {
  let settings = await SiteSetting.findOne();
  if (!settings) {
    settings = await SiteSetting.create({});
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

  return updatedSettings;
};
