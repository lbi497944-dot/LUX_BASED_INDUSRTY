import Page from '../models/Page.js';
import { deleteCloudinaryAsset } from '../middleware/uploadMiddleware.js';

/**
 * Collect all Cloudinary public IDs and their resource types from an array of sections
 * Returns array of objects: [{ publicId, resourceType }]
 */
export const collectSectionPublicIds = (sections = []) => {
  const assets = [];
  if (!Array.isArray(sections)) return assets;

  for (const sec of sections) {
    if (sec?.media) {
      if (sec.media.publicId && typeof sec.media.publicId === 'string' && sec.media.publicId.trim()) {
        assets.push({
          publicId: sec.media.publicId.trim(),
          resourceType: 'image',
        });
      }
      if (sec.media.videoPublicId && typeof sec.media.videoPublicId === 'string' && sec.media.videoPublicId.trim()) {
        assets.push({
          publicId: sec.media.videoPublicId.trim(),
          resourceType: 'video',
        });
      }
      if (Array.isArray(sec.media.slides)) {
        for (const slide of sec.media.slides) {
          if (slide?.publicId && typeof slide.publicId === 'string' && slide.publicId.trim()) {
            assets.push({
              publicId: slide.publicId.trim(),
              resourceType: 'image',
            });
          }
        }
      }
    }
  }
  return assets;
};

/**
 * Collect all Cloudinary public IDs from an entire page document
 */
export const collectPagePublicIds = (page) => {
  const assets = [];
  if (!page) return assets;

  if (Array.isArray(page.publishedSections)) {
    assets.push(...collectSectionPublicIds(page.publishedSections));
  }
  if (Array.isArray(page.draftSections)) {
    assets.push(...collectSectionPublicIds(page.draftSections));
  }
  if (page.seo?.ogImagePublicId && typeof page.seo.ogImagePublicId === 'string' && page.seo.ogImagePublicId.trim()) {
    assets.push({
      publicId: page.seo.ogImagePublicId.trim(),
      resourceType: 'image',
    });
  }

  // Deduplicate by publicId
  const seen = new Set();
  return assets.filter((item) => {
    if (seen.has(item.publicId)) return false;
    seen.add(item.publicId);
    return true;
  });
};

/**
 * Get all pages
 */
export const getPages = async (queryParams = {}) => {
  const { adminView = false } = queryParams;

  const filter = {};
  if (!adminView) {
    filter.status = 'published';
  }

  let query = Page.find(filter).sort('name');

  if (!adminView) {
    // Public consumers must never receive draft data
    query = query.select('name slug status seo publishedSections publishedAt updatedAt');
  }

  const pages = await query.exec();
  return pages;
};

/**
 * Get a single page by slug
 */
export const getPageBySlug = async (slug, queryParams = {}) => {
  const { adminView = false } = queryParams;

  const page = await Page.findOne({ slug: slug.toLowerCase() });
  if (!page) {
    const error = new Error(`Page not found with slug: ${slug}`);
    error.statusCode = 404;
    throw error;
  }

  if (!adminView) {
    if (page.status !== 'published' && (!page.publishedSections || page.publishedSections.length === 0)) {
      const error = new Error(`Page not found with slug: ${slug}`);
      error.statusCode = 404;
      throw error;
    }

    // Public consumers receive published data only
    return {
      _id: page._id,
      name: page.name,
      slug: page.slug,
      status: page.status,
      seo: page.seo,
      publishedSections: page.publishedSections,
      publishedAt: page.publishedAt,
      updatedAt: page.updatedAt,
    };
  }

  return page;
};

/**
 * Create a new page
 */
export const createPage = async (pageData) => {
  const existing = await Page.findOne({ slug: pageData.slug });
  if (existing) {
    const error = new Error(`Page with slug '${pageData.slug}' already exists.`);
    error.statusCode = 400;
    throw error;
  }

  // Ensure both draft and published sets are initialized
  if (!pageData.publishedSections && pageData.draftSections) {
    pageData.publishedSections = JSON.parse(JSON.stringify(pageData.draftSections));
  } else if (!pageData.draftSections && pageData.publishedSections) {
    pageData.draftSections = JSON.parse(JSON.stringify(pageData.publishedSections));
  }

  try {
    const page = await Page.create(pageData);
    return page;
  } catch (createErr) {
    // Rollback any newly uploaded Cloudinary assets if page creation failed
    const assetsToRollback = collectPagePublicIds(pageData);
    for (const asset of assetsToRollback) {
      try {
        await deleteCloudinaryAsset(asset.publicId, { resource_type: asset.resourceType });
      } catch (cleanupErr) {
        console.error(`[Page Creation Cleanup Error] Failed to rollback ${asset.publicId}:`, cleanupErr.message);
      }
    }
    throw createErr;
  }
};

/**
 * Update draft sections and/or SEO without touching publishedSections
 */
export const updateDraft = async (slug, updateData) => {
  const page = await Page.findOne({ slug: slug.toLowerCase() });
  if (!page) {
    const error = new Error(`Page not found with slug: ${slug}`);
    error.statusCode = 404;
    throw error;
  }

  if (updateData.draftSections !== undefined) {
    page.draftSections = updateData.draftSections;
  }
  if (updateData.seo !== undefined) {
    page.seo = { ...page.seo.toObject(), ...updateData.seo };
  }
  if (updateData.name !== undefined) {
    page.name = updateData.name;
  }

  // Crucial: publishedSections must remain completely untouched
  await page.save();
  return page;
};

/**
 * Publish draft: draftSections -> publishedSections
 * Atomically updates published sections, status, and publishedAt.
 * Cleans up unreferenced Cloudinary assets.
 */
export const publishPage = async (slug) => {
  const page = await Page.findOne({ slug: slug.toLowerCase() });
  if (!page) {
    const error = new Error(`Page not found with slug: ${slug}`);
    error.statusCode = 404;
    throw error;
  }

  // Collect previous published public IDs to detect replacements
  const oldPublishedAssets = collectSectionPublicIds(page.publishedSections);

  // Copy draft to published
  page.publishedSections = JSON.parse(JSON.stringify(page.draftSections));
  page.status = 'published';
  page.publishedAt = new Date();

  await page.save();

  // Find assets in old published version that are no longer referenced in new published sections
  // and not referenced in draft sections
  const newAssetIds = new Set(collectPagePublicIds(page).map((a) => a.publicId));
  for (const oldAsset of oldPublishedAssets) {
    if (!newAssetIds.has(oldAsset.publicId)) {
      try {
        await deleteCloudinaryAsset(oldAsset.publicId, { resource_type: oldAsset.resourceType });
      } catch (err) {
        console.error(`[Page Publish Cleanup Error] Failed to destroy ${oldAsset.publicId}:`, err.message);
      }
    }
  }

  return page;
};

/**
 * Discard draft: restores draftSections = publishedSections
 * Cleans up unreferenced draft-only Cloudinary assets.
 */
export const discardDraft = async (slug) => {
  const page = await Page.findOne({ slug: slug.toLowerCase() });
  if (!page) {
    const error = new Error(`Page not found with slug: ${slug}`);
    error.statusCode = 404;
    throw error;
  }

  const draftAssets = collectSectionPublicIds(page.draftSections);
  const publishedAssetIds = new Set(collectSectionPublicIds(page.publishedSections).map((a) => a.publicId));

  // Reset draft to published
  page.draftSections = JSON.parse(JSON.stringify(page.publishedSections));
  await page.save();

  // Clean up any uploaded assets in draft that were never published
  for (const asset of draftAssets) {
    if (!publishedAssetIds.has(asset.publicId)) {
      try {
        await deleteCloudinaryAsset(asset.publicId, { resource_type: asset.resourceType });
      } catch (err) {
        console.error(`[Page Discard Cleanup Error] Failed to destroy ${asset.publicId}:`, err.message);
      }
    }
  }

  return page;
};

/**
 * Delete page and remove all associated Cloudinary assets
 */
export const deletePage = async (slug) => {
  const page = await Page.findOne({ slug: slug.toLowerCase() });
  if (!page) {
    const error = new Error(`Page not found with slug: ${slug}`);
    error.statusCode = 404;
    throw error;
  }

  const allAssets = collectPagePublicIds(page);

  await Page.findOneAndDelete({ slug: slug.toLowerCase() });

  // Clean up all Cloudinary assets associated with this page
  for (const asset of allAssets) {
    try {
      await deleteCloudinaryAsset(asset.publicId, { resource_type: asset.resourceType });
    } catch (err) {
      console.error(`[Page Delete Cleanup Error] Failed to destroy ${asset.publicId}:`, err.message);
    }
  }

  return { message: `Page '${slug}' and associated media deleted successfully.` };
};
