import Collection from '../models/Collection.js';
import Product from '../models/Product.js';
import { slugify } from '../utils/slugify.js';
import { deleteCloudinaryAsset } from '../middleware/uploadMiddleware.js';

export const getAllCollections = async (queryParams) => {
  const { adminView = false, featured, sort = 'order' } = queryParams;

  const filter = {};
  if (!adminView) {
    filter.isActive = true;
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true' || featured === true;
  }

  const collections = await Collection.find(filter).sort(sort);
  return collections;
};

export const getCollectionBySlug = async (slug) => {
  const collection = await Collection.findOne({ slug });
  if (!collection) {
    const error = new Error(`Collection not found with slug: ${slug}`);
    error.statusCode = 404;
    throw error;
  }
  return collection;
};

export const getCollectionById = async (id) => {
  const collection = await Collection.findById(id);
  if (!collection) {
    const error = new Error(`Collection not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return collection;
};

export const createCollection = async (collectionData) => {
  if (!collectionData.slug && collectionData.name) {
    collectionData.slug = slugify(collectionData.name);
  }

  let slug = collectionData.slug;
  let count = 1;
  while (await Collection.findOne({ slug })) {
    slug = `${collectionData.slug}-${count}`;
    count++;
  }
  collectionData.slug = slug;

  try {
    const collection = await Collection.create(collectionData);
    return collection;
  } catch (createErr) {
    // Rollback newly uploaded Cloudinary assets if creation failed
    if (collectionData.heroImagePublicId && typeof collectionData.heroImagePublicId === 'string' && collectionData.heroImagePublicId.trim()) {
      try {
        await deleteCloudinaryAsset(collectionData.heroImagePublicId.trim());
      } catch (cleanupErr) {
        console.error(`[Collection Creation Cleanup Error] Failed to rollback hero:`, cleanupErr.message);
      }
    }

    if (Array.isArray(collectionData.galleryPublicIds)) {
      for (const gid of collectionData.galleryPublicIds) {
        if (gid && typeof gid === 'string' && gid.trim()) {
          try {
            await deleteCloudinaryAsset(gid.trim());
          } catch (cleanupErr) {
            console.error(`[Collection Creation Cleanup Error] Failed to rollback gallery asset:`, cleanupErr.message);
          }
        }
      }
    }

    throw createErr;
  }
};

export const updateCollection = async (id, updateData) => {
  if (updateData.name && !updateData.slug) {
    updateData.slug = slugify(updateData.name);
  }

  const existingCollection = await Collection.findById(id);
  if (!existingCollection) {
    const error = new Error(`Collection not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  const isSlugChanging = Boolean(updateData.slug && updateData.slug !== existingCollection.slug);

  // Determine if hero image is being replaced or removed, and identify old Cloudinary asset to clean up
  let oldHeroPublicIdToDelete = null;
  const isHeroChanging = updateData.heroImage !== undefined && updateData.heroImage !== existingCollection.heroImage;
  const isHeroPublicIdChanging = updateData.heroImagePublicId !== undefined && updateData.heroImagePublicId !== existingCollection.heroImagePublicId;

  if ((isHeroChanging || isHeroPublicIdChanging) && existingCollection.heroImagePublicId && existingCollection.heroImagePublicId.trim()) {
    // Only mark for deletion if the new publicId differs from the old one
    if (updateData.heroImagePublicId !== existingCollection.heroImagePublicId) {
      oldHeroPublicIdToDelete = existingCollection.heroImagePublicId.trim();
    }
  }

  // Determine if any gallery assets are being removed or need rollback on failure
  const galleryAssetsToDelete = [];
  const newGalleryPublicIdsToRollback = [];

  if (Array.isArray(updateData.galleryPublicIds)) {
    const existingGalleryIds = Array.isArray(existingCollection.galleryPublicIds) ? existingCollection.galleryPublicIds : [];
    const newGallerySet = new Set(updateData.galleryPublicIds.map((g) => (typeof g === 'string' ? g.trim() : g)));
    const existingGallerySet = new Set(existingGalleryIds.map((g) => (typeof g === 'string' ? g.trim() : g)));

    // Assets to delete on success: old assets not in new set
    for (const gid of existingGalleryIds) {
      if (gid && typeof gid === 'string' && gid.trim() && !newGallerySet.has(gid.trim())) {
        galleryAssetsToDelete.push(gid.trim());
      }
    }

    // Assets to rollback on DB failure: new assets not in old set
    for (const gid of updateData.galleryPublicIds) {
      if (gid && typeof gid === 'string' && gid.trim() && !existingGallerySet.has(gid.trim())) {
        newGalleryPublicIdsToRollback.push(gid.trim());
      }
    }
  }

  // Perform database update
  let collection;
  try {
    collection = await Collection.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (updateErr) {
    // Rollback new hero asset if update failed
    if (isHeroPublicIdChanging && updateData.heroImagePublicId && typeof updateData.heroImagePublicId === 'string' && updateData.heroImagePublicId.trim()) {
      try {
        await deleteCloudinaryAsset(updateData.heroImagePublicId.trim());
      } catch (rollbackErr) {
        console.error(`[Collection Update Cleanup Error] Failed to rollback new hero asset:`, rollbackErr.message);
      }
    }

    // Rollback newly added gallery assets if update failed
    for (const gid of newGalleryPublicIdsToRollback) {
      try {
        await deleteCloudinaryAsset(gid);
      } catch (rollbackErr) {
        console.error(`[Collection Update Cleanup Error] Failed to rollback new gallery asset ${gid}:`, rollbackErr.message);
      }
    }

    throw updateErr;
  }

  // After successful update, clean up old assets
  if (oldHeroPublicIdToDelete) {
    try {
      await deleteCloudinaryAsset(oldHeroPublicIdToDelete);
    } catch (cleanupErr) {
      console.error(`[Collection Media Cleanup Error] Failed to delete old hero asset ${oldHeroPublicIdToDelete}:`, cleanupErr.message);
    }
  }

  for (const gid of galleryAssetsToDelete) {
    try {
      await deleteCloudinaryAsset(gid);
    } catch (cleanupErr) {
      console.error(`[Collection Gallery Cleanup Error] Failed to delete old gallery asset ${gid}:`, cleanupErr.message);
    }
  }

  // Cascade slug update to associated products if collection slug was renamed
  if (isSlugChanging) {
    await Product.updateMany(
      { collectionSlug: existingCollection.slug },
      { $set: { collectionSlug: collection?.slug || updateData.slug } }
    );
  }

  return collection;
};

export const deleteCollection = async (id) => {
  const collection = await Collection.findById(id);
  if (!collection) {
    const error = new Error(`Collection not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  const productCount = await Product.countDocuments({
    collectionSlug: collection.slug,
  });

  if (productCount > 0) {
    const error = new Error('Cannot delete collection with assigned products. Please reassign or delete products first.');
    error.statusCode = 400;
    throw error;
  }

  // Clean up hero image if stored in Cloudinary
  if (collection.heroImagePublicId && typeof collection.heroImagePublicId === 'string' && collection.heroImagePublicId.trim()) {
    try {
      await deleteCloudinaryAsset(collection.heroImagePublicId.trim());
    } catch (cleanupErr) {
      console.error(`[Collection Media Cleanup Error] Failed to delete hero asset ${collection.heroImagePublicId}:`, cleanupErr.message);
    }
  }

  // Clean up any gallery images if stored in Cloudinary
  if (Array.isArray(collection.galleryPublicIds) && collection.galleryPublicIds.length > 0) {
    for (const gid of collection.galleryPublicIds) {
      if (gid && typeof gid === 'string' && gid.trim()) {
        try {
          await deleteCloudinaryAsset(gid.trim());
        } catch (cleanupErr) {
          console.error(`[Collection Gallery Cleanup Error] Failed to delete gallery asset ${gid}:`, cleanupErr.message);
        }
      }
    }
  }

  await Collection.findByIdAndDelete(id);
  return collection;
};
