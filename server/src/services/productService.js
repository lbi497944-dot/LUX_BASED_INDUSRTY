import Product from '../models/Product.js';
import { slugify } from '../utils/slugify.js';
import { deleteCloudinaryAsset } from '../middleware/uploadMiddleware.js';

export const getAllProducts = async (queryParams) => {
  const { search, category, collection, featured, page = 1, limit = 50, sort = '-createdAt', adminView = false } = queryParams;

  const filter = {};
  if (!adminView) {
    filter.isActive = true;
  }

  if (category && category !== 'ALL') {
    filter.category = new RegExp(`^${category}$`, 'i');
  }

  if (collection) {
    filter.collectionSlug = collection;
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true' || featured === true;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { specifications: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .populate('collectionId', 'name slug');

  return {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug }).populate('collectionId');
  if (!product) {
    const error = new Error(`Product not found with slug: ${slug}`);
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    const error = new Error(`Product not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const createProduct = async (productData) => {
  if (!productData.slug && productData.name) {
    productData.slug = slugify(productData.name);
  }

  // Ensure unique slug
  let slug = productData.slug;
  let count = 1;
  while (await Product.findOne({ slug })) {
    slug = `${productData.slug}-${count}`;
    count++;
  }
  productData.slug = slug;

  try {
    const product = await Product.create(productData);
    return product;
  } catch (createErr) {
    // Rollback newly uploaded Cloudinary cover asset if creation failed
    if (productData.imagePublicId && typeof productData.imagePublicId === 'string' && productData.imagePublicId.trim()) {
      try {
        await deleteCloudinaryAsset(productData.imagePublicId.trim());
      } catch (cleanupErr) {
        console.error(`[Product Creation Cleanup Error] Failed to rollback ${productData.imagePublicId}:`, cleanupErr.message);
      }
    }

    // Rollback newly uploaded Cloudinary gallery assets if creation failed
    if (Array.isArray(productData.galleryPublicIds) && productData.galleryPublicIds.length > 0) {
      for (const gid of productData.galleryPublicIds) {
        if (gid && typeof gid === 'string' && gid.trim()) {
          try {
            await deleteCloudinaryAsset(gid.trim());
          } catch (cleanupErr) {
            console.error(`[Product Creation Cleanup Error] Failed to rollback gallery asset ${gid}:`, cleanupErr.message);
          }
        }
      }
    }

    throw createErr;
  }
};

export const updateProduct = async (id, updateData) => {
  if (updateData.name && !updateData.slug) {
    updateData.slug = slugify(updateData.name);
  }

  const existingProduct = await Product.findById(id);
  if (!existingProduct) {
    const error = new Error(`Product not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  // Determine if image is being replaced or removed, and identify old Cloudinary asset to clean up
  let oldImagePublicIdToDelete = null;
  const isImageChanging = updateData.image !== undefined && updateData.image !== existingProduct.image;
  const isPublicIdChanging = updateData.imagePublicId !== undefined && updateData.imagePublicId !== existingProduct.imagePublicId;

  if ((isImageChanging || isPublicIdChanging) && existingProduct.imagePublicId && existingProduct.imagePublicId.trim()) {
    // Only mark for deletion if the new publicId differs from the old one
    if (updateData.imagePublicId !== existingProduct.imagePublicId) {
      oldImagePublicIdToDelete = existingProduct.imagePublicId.trim();
    }
  }

  // Determine if any gallery assets are being removed
  const galleryAssetsToDelete = [];
  if (Array.isArray(updateData.galleryPublicIds) && Array.isArray(existingProduct.galleryPublicIds)) {
    const newGallerySet = new Set(updateData.galleryPublicIds.map((g) => (typeof g === 'string' ? g.trim() : g)));
    for (const gid of existingProduct.galleryPublicIds) {
      if (gid && typeof gid === 'string' && gid.trim() && !newGallerySet.has(gid.trim())) {
        galleryAssetsToDelete.push(gid.trim());
      }
    }
  }

  // Perform database update
  let product;
  try {
    product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (updateErr) {
    // Rollback new asset if update failed
    if (isPublicIdChanging && updateData.imagePublicId && typeof updateData.imagePublicId === 'string' && updateData.imagePublicId.trim()) {
      try {
        await deleteCloudinaryAsset(updateData.imagePublicId.trim());
      } catch (rollbackErr) {
        console.error(`[Product Update Cleanup Error] Failed to rollback new asset:`, rollbackErr.message);
      }
    }
    throw updateErr;
  }

  // After successful update, clean up old assets
  if (oldImagePublicIdToDelete) {
    try {
      await deleteCloudinaryAsset(oldImagePublicIdToDelete);
    } catch (cleanupErr) {
      console.error(`[Product Media Cleanup Error] Failed to delete old asset ${oldImagePublicIdToDelete}:`, cleanupErr.message);
    }
  }

  for (const gid of galleryAssetsToDelete) {
    try {
      await deleteCloudinaryAsset(gid);
    } catch (cleanupErr) {
      console.error(`[Product Gallery Cleanup Error] Failed to delete old gallery asset ${gid}:`, cleanupErr.message);
    }
  }

  return product;
};

export const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    const error = new Error(`Product not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  // Clean up primary image if stored in Cloudinary
  if (product.imagePublicId && typeof product.imagePublicId === 'string' && product.imagePublicId.trim()) {
    try {
      await deleteCloudinaryAsset(product.imagePublicId.trim());
    } catch (cleanupErr) {
      console.error(`[Product Media Cleanup Error] Failed to delete primary asset ${product.imagePublicId}:`, cleanupErr.message);
    }
  }

  // Clean up any gallery images if stored in Cloudinary
  if (Array.isArray(product.galleryPublicIds) && product.galleryPublicIds.length > 0) {
    for (const gid of product.galleryPublicIds) {
      if (gid && typeof gid === 'string' && gid.trim()) {
        try {
          await deleteCloudinaryAsset(gid.trim());
        } catch (cleanupErr) {
          console.error(`[Product Gallery Cleanup Error] Failed to delete gallery asset ${gid}:`, cleanupErr.message);
        }
      }
    }
  }

  await Product.findByIdAndDelete(id);
  return product;
};
