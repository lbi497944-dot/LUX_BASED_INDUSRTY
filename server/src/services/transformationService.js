import Transformation from '../models/Transformation.js';
import { deleteCloudinaryAsset } from '../middleware/uploadMiddleware.js';

// Dependency injection container for testable Cloudinary rollback and lifecycle verification
export const _deps = {
  Transformation,
  deleteCloudinaryAsset,
};

/**
 * Public: Get active transformations sorted by order ascending and createdAt secondary
 */
export const getPublicTransformations = async () => {
  const transformations = await _deps.Transformation.find({ isActive: true })
    .select('title shortDescription detailedDescription beforeImage afterImage order')
    .sort({ order: 1, createdAt: 1 })
    .lean();
  return transformations;
};

/**
 * Admin: Get all transformations with optional active-only filtering
 */
export const getAllTransformations = async (queryParams = {}) => {
  const filter = {};
  if (queryParams.activeOnly === 'true' || queryParams.activeOnly === true) {
    filter.isActive = true;
  }
  const transformations = await _deps.Transformation.find(filter)
    .sort({ order: 1, createdAt: 1 })
    .lean();
  return transformations;
};

/**
 * Admin: Retrieve single transformation by ID
 */
export const getTransformationById = async (id) => {
  const transformation = await _deps.Transformation.findById(id);
  if (!transformation) {
    const error = new Error(`Transformation not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return transformation;
};

/**
 * Admin: Create transformation with transactional Cloudinary rollback on DB failure
 */
export const createTransformation = async (data) => {
  try {
    const transformation = await _deps.Transformation.create({
      title: data.title?.trim(),
      shortDescription: data.shortDescription ? data.shortDescription.trim() : '',
      detailedDescription: data.detailedDescription ? data.detailedDescription.trim() : '',
      beforeImage: data.beforeImage?.trim(),
      beforePublicId: data.beforePublicId ? data.beforePublicId.trim() : '',
      afterImage: data.afterImage?.trim(),
      afterPublicId: data.afterPublicId ? data.afterPublicId.trim() : '',
      order: typeof data.order === 'number' ? data.order : 0,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    });
    return transformation;
  } catch (createErr) {
    // Transactional rollback: Clean up newly uploaded Cloudinary assets if DB write fails
    if (data.beforePublicId && typeof data.beforePublicId === 'string' && data.beforePublicId.trim()) {
      try {
        await _deps.deleteCloudinaryAsset(data.beforePublicId.trim());
      } catch (cleanupErr) {
        console.error('[Transformation Creation Cleanup Error] Failed to delete orphaned before asset:', cleanupErr.message);
      }
    }
    if (data.afterPublicId && typeof data.afterPublicId === 'string' && data.afterPublicId.trim()) {
      try {
        await _deps.deleteCloudinaryAsset(data.afterPublicId.trim());
      } catch (cleanupErr) {
        console.error('[Transformation Creation Cleanup Error] Failed to delete orphaned after asset:', cleanupErr.message);
      }
    }
    throw createErr;
  }
};

/**
 * Admin: Update transformation with Cloudinary replacement lifecycle management
 */
export const updateTransformation = async (id, updateData) => {
  const existing = await _deps.Transformation.findById(id);
  if (!existing) {
    const error = new Error(`Transformation not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  // Identify if before or after image is being replaced
  let oldBeforePublicIdToDelete = null;
  const isBeforeChanging =
    updateData.beforePublicId !== undefined &&
    updateData.beforePublicId !== existing.beforePublicId;
  if (isBeforeChanging && existing.beforePublicId && existing.beforePublicId.trim()) {
    oldBeforePublicIdToDelete = existing.beforePublicId.trim();
  }

  let oldAfterPublicIdToDelete = null;
  const isAfterChanging =
    updateData.afterPublicId !== undefined &&
    updateData.afterPublicId !== existing.afterPublicId;
  if (isAfterChanging && existing.afterPublicId && existing.afterPublicId.trim()) {
    oldAfterPublicIdToDelete = existing.afterPublicId.trim();
  }

  try {
    const updated = await _deps.Transformation.findByIdAndUpdate(
      id,
      {
        ...(updateData.title !== undefined && { title: updateData.title.trim() }),
        ...(updateData.shortDescription !== undefined && { shortDescription: updateData.shortDescription.trim() }),
        ...(updateData.detailedDescription !== undefined && { detailedDescription: updateData.detailedDescription.trim() }),
        ...(updateData.beforeImage !== undefined && { beforeImage: updateData.beforeImage.trim() }),
        ...(updateData.beforePublicId !== undefined && { beforePublicId: updateData.beforePublicId.trim() }),
        ...(updateData.afterImage !== undefined && { afterImage: updateData.afterImage.trim() }),
        ...(updateData.afterPublicId !== undefined && { afterPublicId: updateData.afterPublicId.trim() }),
        ...(updateData.order !== undefined && { order: Number(updateData.order) }),
        ...(updateData.isActive !== undefined && { isActive: Boolean(updateData.isActive) }),
      },
      { new: true, runValidators: true }
    );

    // ONLY AFTER successful DB update, clean up old Cloudinary assets
    if (oldBeforePublicIdToDelete) {
      try {
        await _deps.deleteCloudinaryAsset(oldBeforePublicIdToDelete);
      } catch (cleanupErr) {
        console.error('[Transformation Update Cleanup Error] Failed to delete replaced before asset:', cleanupErr.message);
      }
    }
    if (oldAfterPublicIdToDelete) {
      try {
        await _deps.deleteCloudinaryAsset(oldAfterPublicIdToDelete);
      } catch (cleanupErr) {
        console.error('[Transformation Update Cleanup Error] Failed to delete replaced after asset:', cleanupErr.message);
      }
    }

    return updated;
  } catch (updateErr) {
    // If update failed and NEW assets were uploaded, rollback the new assets
    if (isBeforeChanging && updateData.beforePublicId && updateData.beforePublicId.trim()) {
      try {
        await _deps.deleteCloudinaryAsset(updateData.beforePublicId.trim());
      } catch (cleanupErr) {
        console.error('[Transformation Update Rollback Error] Failed to delete new before asset:', cleanupErr.message);
      }
    }
    if (isAfterChanging && updateData.afterPublicId && updateData.afterPublicId.trim()) {
      try {
        await _deps.deleteCloudinaryAsset(updateData.afterPublicId.trim());
      } catch (cleanupErr) {
        console.error('[Transformation Update Rollback Error] Failed to delete new after asset:', cleanupErr.message);
      }
    }
    throw updateErr;
  }
};

/**
 * Admin: Delete transformation and clean attached Cloudinary assets
 */
export const deleteTransformation = async (id) => {
  const transformation = await _deps.Transformation.findById(id);
  if (!transformation) {
    const error = new Error(`Transformation not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  const beforeToDelete = transformation.beforePublicId && transformation.beforePublicId.trim() ? transformation.beforePublicId.trim() : null;
  const afterToDelete = transformation.afterPublicId && transformation.afterPublicId.trim() ? transformation.afterPublicId.trim() : null;

  await _deps.Transformation.findByIdAndDelete(id);

  if (beforeToDelete) {
    try {
      await _deps.deleteCloudinaryAsset(beforeToDelete);
    } catch (cleanupErr) {
      console.error(`[Transformation Deletion Cleanup Error] Failed to destroy before asset ${beforeToDelete}:`, cleanupErr.message);
    }
  }
  if (afterToDelete) {
    try {
      await _deps.deleteCloudinaryAsset(afterToDelete);
    } catch (cleanupErr) {
      console.error(`[Transformation Deletion Cleanup Error] Failed to destroy after asset ${afterToDelete}:`, cleanupErr.message);
    }
  }

  return true;
};
