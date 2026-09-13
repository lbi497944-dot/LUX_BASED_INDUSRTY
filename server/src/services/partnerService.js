import Partner from '../models/Partner.js';
import { deleteCloudinaryAsset } from '../middleware/uploadMiddleware.js';

// Dependency injection container for testable Cloudinary rollback and lifecycle verification
export const _deps = {
  Partner,
  deleteCloudinaryAsset,
};

/**
 * Public: Get active client partners sorted by order ascending and createdAt secondary
 */
export const getPublicPartners = async () => {
  const partners = await _deps.Partner.find({ isActive: true })
    .select('name logo website order')
    .sort({ order: 1, createdAt: 1 })
    .lean();
  return partners;
};

/**
 * Admin: Get all partners with optional filtering
 */
export const getAllPartners = async (queryParams = {}) => {
  const filter = {};
  if (queryParams.activeOnly === 'true' || queryParams.activeOnly === true) {
    filter.isActive = true;
  }
  const partners = await _deps.Partner.find(filter)
    .sort({ order: 1, createdAt: 1 })
    .lean();
  return partners;
};

/**
 * Admin: Retrieve single partner by ID
 */
export const getPartnerById = async (id) => {
  const partner = await _deps.Partner.findById(id);
  if (!partner) {
    const error = new Error(`Partner not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return partner;
};

/**
 * Admin: Create partner with transactional Cloudinary rollback on DB failure
 */
export const createPartner = async (partnerData) => {
  try {
    const partner = await _deps.Partner.create({
      name: partnerData.name?.trim(),
      logo: partnerData.logo?.trim(),
      logoPublicId: partnerData.logoPublicId ? partnerData.logoPublicId.trim() : '',
      website: partnerData.website ? partnerData.website.trim() : '',
      order: typeof partnerData.order === 'number' ? partnerData.order : 0,
      isActive: partnerData.isActive !== undefined ? Boolean(partnerData.isActive) : true,
    });
    return partner;
  } catch (createErr) {
    // Transactional rollback: Clean up newly uploaded Cloudinary asset if DB write fails
    if (partnerData.logoPublicId && typeof partnerData.logoPublicId === 'string' && partnerData.logoPublicId.trim()) {
      try {
        await _deps.deleteCloudinaryAsset(partnerData.logoPublicId.trim());
      } catch (cleanupErr) {
        console.error('[Partner Creation Cleanup Error] Failed to delete orphaned asset:', cleanupErr.message);
      }
    }
    throw createErr;
  }
};

/**
 * Admin: Update partner with Cloudinary replacement lifecycle management
 */
export const updatePartner = async (id, updateData) => {
  const existingPartner = await _deps.Partner.findById(id);
  if (!existingPartner) {
    const error = new Error(`Partner not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  // Identify if logo is being replaced with a new Cloudinary asset
  let oldLogoPublicIdToDelete = null;
  const isLogoPublicIdChanging =
    updateData.logoPublicId !== undefined &&
    updateData.logoPublicId !== existingPartner.logoPublicId;

  if (
    isLogoPublicIdChanging &&
    existingPartner.logoPublicId &&
    existingPartner.logoPublicId.trim() &&
    updateData.logoPublicId !== existingPartner.logoPublicId
  ) {
    oldLogoPublicIdToDelete = existingPartner.logoPublicId.trim();
  }

  try {
    const updated = await _deps.Partner.findByIdAndUpdate(
      id,
      {
        ...(updateData.name !== undefined && { name: updateData.name.trim() }),
        ...(updateData.logo !== undefined && { logo: updateData.logo.trim() }),
        ...(updateData.logoPublicId !== undefined && { logoPublicId: updateData.logoPublicId.trim() }),
        ...(updateData.website !== undefined && { website: updateData.website ? updateData.website.trim() : '' }),
        ...(updateData.order !== undefined && { order: Number(updateData.order) }),
        ...(updateData.isActive !== undefined && { isActive: Boolean(updateData.isActive) }),
      },
      { new: true, runValidators: true }
    );

    // ONLY AFTER successful DB update, clean up old Cloudinary logo asset
    if (oldLogoPublicIdToDelete) {
      try {
        await _deps.deleteCloudinaryAsset(oldLogoPublicIdToDelete);
      } catch (cleanupErr) {
        console.error('[Partner Update Cleanup Error] Failed to delete replaced asset:', cleanupErr.message);
      }
    }

    return updated;
  } catch (updateErr) {
    // If update failed and a NEW asset was uploaded, rollback the new asset
    if (isLogoPublicIdChanging && updateData.logoPublicId && updateData.logoPublicId.trim()) {
      try {
        await _deps.deleteCloudinaryAsset(updateData.logoPublicId.trim());
      } catch (cleanupErr) {
        console.error('[Partner Update Rollback Error] Failed to delete new asset:', cleanupErr.message);
      }
    }
    throw updateErr;
  }
};

/**
 * Admin: Delete partner and clean attached Cloudinary asset
 */
export const deletePartner = async (id) => {
  const partner = await _deps.Partner.findById(id);
  if (!partner) {
    const error = new Error(`Partner not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  const assetToDelete = partner.logoPublicId && partner.logoPublicId.trim() ? partner.logoPublicId.trim() : null;

  await _deps.Partner.findByIdAndDelete(id);

  if (assetToDelete) {
    try {
      await _deps.deleteCloudinaryAsset(assetToDelete);
    } catch (cleanupErr) {
      console.error(`[Partner Deletion Cleanup Error] Failed to destroy ${assetToDelete}:`, cleanupErr.message);
    }
  }

  return true;
};
