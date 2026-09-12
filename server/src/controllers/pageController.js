import * as pageService from '../services/pageService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const ALLOWED_PAGE_FIELDS = [
  'name',
  'slug',
  'status',
  'seo',
  'draftSections',
  'publishedSections',
];

export const ALLOWED_SEO_FIELDS = [
  'title',
  'description',
  'ogImage',
  'ogImagePublicId',
  'canonical',
];

export const ALLOWED_SECTION_FIELDS = [
  'sectionId',
  'type',
  'enabled',
  'order',
  'content',
  'media',
];

export const ALLOWED_CONTENT_FIELDS = [
  'eyebrow',
  'heading',
  'italicHeading',
  'subheading',
  'body',
  'primaryBtnText',
  'primaryBtnUrl',
  'secondaryBtnText',
  'secondaryBtnUrl',
  'alignment',
  'customItems',
];

export const ALLOWED_MEDIA_FIELDS = [
  'mediaType',
  'url',
  'publicId',
  'videoUrl',
  'videoPublicId',
  'overlay',
  'overlayOpacity',
  'slides',
];

export const ALLOWED_SLIDE_FIELDS = [
  'url',
  'publicId',
  'title',
  'caption',
  'order',
];

export const ALLOWED_CUSTOM_ITEM_FIELDS = [
  'title',
  'subtitle',
  'text',
  'iconName',
  'order',
];

/**
 * Validates that a user-configurable URL does not contain dangerous protocols
 */
export const isSafeUrl = (url) => {
  if (url === undefined || url === null) return true;
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '') return true;

  // Strip ASCII control characters and invisible whitespace
  const sanitized = trimmed.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();

  // Reject active execution and data protocols
  if (
    sanitized.startsWith('javascript:') ||
    sanitized.startsWith('data:') ||
    sanitized.startsWith('vbscript:') ||
    sanitized.startsWith('file:')
  ) {
    return false;
  }

  // Allowed: relative routes (/ or # or ?), http(s), mailto, tel
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('?') ||
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    /^tel:/i.test(trimmed)
  );
};

export const filterSlideFields = (slide) => {
  const source = slide && typeof slide === 'object' ? slide : {};
  const filtered = {};
  for (const field of ALLOWED_SLIDE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) {
      filtered[field] = source[field];
    }
  }
  return filtered;
};

export const filterCustomItemFields = (item) => {
  const source = item && typeof item === 'object' ? item : {};
  const filtered = {};
  for (const field of ALLOWED_CUSTOM_ITEM_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) {
      filtered[field] = source[field];
    }
  }
  return filtered;
};

export const filterMediaFields = (media) => {
  const source = media && typeof media === 'object' ? media : {};
  const filtered = {};
  for (const field of ALLOWED_MEDIA_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) {
      if (field === 'slides' && Array.isArray(source.slides)) {
        filtered.slides = source.slides.map(filterSlideFields);
      } else {
        filtered[field] = source[field];
      }
    }
  }
  return filtered;
};

export const filterContentFields = (content) => {
  const source = content && typeof content === 'object' ? content : {};
  const filtered = {};
  for (const field of ALLOWED_CONTENT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) {
      if (field === 'primaryBtnUrl' || field === 'secondaryBtnUrl') {
        const val = source[field];
        if (!isSafeUrl(val)) {
          const err = new Error(`Dangerous or unsupported URL protocol in ${field}: '${val}'`);
          err.statusCode = 400;
          throw err;
        }
        filtered[field] = val;
      } else if (field === 'customItems' && Array.isArray(source.customItems)) {
        filtered.customItems = source.customItems.map(filterCustomItemFields);
      } else {
        filtered[field] = source[field];
      }
    }
  }
  return filtered;
};

export const filterSectionFields = (section) => {
  const source = section && typeof section === 'object' ? section : {};
  const filtered = {};
  for (const field of ALLOWED_SECTION_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) {
      if (field === 'content') {
        filtered.content = filterContentFields(source.content);
      } else if (field === 'media') {
        filtered.media = filterMediaFields(source.media);
      } else {
        filtered[field] = source[field];
      }
    }
  }
  return filtered;
};

export const filterSeoFields = (seo) => {
  const source = seo && typeof seo === 'object' ? seo : {};
  const filtered = {};
  for (const field of ALLOWED_SEO_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) {
      filtered[field] = source[field];
    }
  }
  return filtered;
};

export const filterPageFields = (body) => {
  const source = body && typeof body === 'object' ? body : {};
  const filtered = {};
  for (const field of ALLOWED_PAGE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) {
      if (field === 'seo') {
        filtered.seo = filterSeoFields(source.seo);
      } else if (field === 'draftSections' && Array.isArray(source.draftSections)) {
        filtered.draftSections = source.draftSections.map(filterSectionFields);
      } else if (field === 'publishedSections' && Array.isArray(source.publishedSections)) {
        filtered.publishedSections = source.publishedSections.map(filterSectionFields);
      } else {
        filtered[field] = source[field];
      }
    }
  }
  return filtered;
};

/**
 * GET /api/pages
 * Admin-only: list all pages
 */
export const getPages = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.admin && req.admin.role === 'admin');
    const queryParams = {
      ...req.query,
      adminView: isAdmin && (req.query.adminView === 'true' || req.query.adminView === true || req.admin !== undefined),
    };
    const pages = await pageService.getPages(queryParams);
    return successResponse(res, 'Pages retrieved successfully.', pages);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/pages/:slug
 * Public or Admin view depending on authentication
 */
export const getPageBySlug = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.admin && req.admin.role === 'admin');
    const queryParams = {
      ...req.query,
      adminView: isAdmin && (req.query.adminView === 'true' || req.query.adminView === true),
    };
    const page = await pageService.getPageBySlug(req.params.slug, queryParams);
    return successResponse(res, 'Page retrieved successfully.', page);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/pages
 * Admin-only: create new page
 */
export const createPage = async (req, res, next) => {
  try {
    const data = filterPageFields(req.body);
    if (!data.name || !data.slug) {
      return errorResponse(res, 'Both page name and slug are required.', 400);
    }
    const page = await pageService.createPage(data);
    return successResponse(res, 'Page created successfully.', page, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/pages/:slug/draft
 * Admin-only: update draft sections and SEO without altering published site
 */
export const updateDraft = async (req, res, next) => {
  try {
    const data = filterPageFields(req.body);
    const page = await pageService.updateDraft(req.params.slug, data);
    return successResponse(res, 'Page draft updated successfully.', page);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/pages/:slug/publish
 * Admin-only: publish draftSections -> publishedSections
 */
export const publishPage = async (req, res, next) => {
  try {
    const page = await pageService.publishPage(req.params.slug);
    return successResponse(res, 'Page published successfully.', page);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/pages/:slug/discard-draft
 * Admin-only: reset draftSections to publishedSections
 */
export const discardDraft = async (req, res, next) => {
  try {
    const page = await pageService.discardDraft(req.params.slug);
    return successResponse(res, 'Page draft discarded successfully.', page);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/pages/:slug
 * Admin-only: delete page and clean up Cloudinary assets
 */
export const deletePage = async (req, res, next) => {
  try {
    const result = await pageService.deletePage(req.params.slug);
    return successResponse(res, result.message);
  } catch (error) {
    next(error);
  }
};
