import Review from '../models/Review.js';
import { deleteCloudinaryAsset } from '../middleware/uploadMiddleware.js';

/**
 * Public: Create a new customer review in Pending status
 */
export const createReview = async (reviewData, uploadedFiles = [], clientMeta = {}) => {
  const images = (uploadedFiles || []).map((file) => ({
    url: file.url,
    publicId: file.publicId || '',
    filename: file.filename || '',
    mimeType: file.mimeType || '',
  }));

  const review = await Review.create({
    name: reviewData.name?.trim(),
    email: reviewData.email?.trim().toLowerCase(),
    phone: reviewData.phone?.trim(),
    rating: Number(reviewData.rating) || 5,
    title: reviewData.title ? reviewData.title.trim() : '',
    content: reviewData.content?.trim(),
    projectLocation: reviewData.projectLocation ? reviewData.projectLocation.trim() : '',
    images,
    status: 'Pending',
    ipAddress: clientMeta.ip || '',
  });

  return review;
};

/**
 * Public: Get verified approved reviews with PII strictly excluded
 */
export const getPublicReviews = async (queryParams = {}) => {
  const filter = { status: 'Approved' };

  if (queryParams.rating) {
    const ratingNum = Number(queryParams.rating);
    if (ratingNum >= 1 && ratingNum <= 5) {
      filter.rating = ratingNum;
    }
  }

  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [total, reviews] = await Promise.all([
    Review.countDocuments(filter),
    Review.find(filter)
      .select('name rating title content projectLocation images createdAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
    },
  };
};

/**
 * Admin: Retrieve all reviews across statuses with search, filters, and full PII
 */
export const getAllReviews = async (queryParams = {}) => {
  const { status, search, rating } = queryParams;
  const filter = {};

  const VALID_STATUSES = ['Pending', 'Approved', 'Rejected'];

  if (status !== undefined && status !== null && status !== '' && status !== 'ALL') {
    if (typeof status === 'string' && VALID_STATUSES.includes(status)) {
      filter.status = status;
    } else {
      const error = new Error(
        `Invalid status filter: ${typeof status === 'string' ? status : 'malformed parameter'}. Allowed values: ${VALID_STATUSES.join(', ')} or ALL`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (rating) {
    const ratingNum = Number(rating);
    if (ratingNum >= 1 && ratingNum <= 5) {
      filter.rating = ratingNum;
    }
  }

  if (search && search.trim()) {
    const term = search.trim();
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { name: regex },
      { email: regex },
      { content: regex },
      { title: regex },
      { projectLocation: regex },
    ];
  }

  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [total, reviews] = await Promise.all([
    Review.countDocuments(filter),
    Review.find(filter)
      .select('+email +phone +adminNotes +ipAddress')
      .populate('moderatedBy', 'username email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
    },
  };
};

/**
 * Admin: Retrieve single review by ID with complete private data
 */
export const getReviewById = async (id) => {
  const review = await Review.findById(id)
    .select('+email +phone +adminNotes +ipAddress')
    .populate('moderatedBy', 'username email');

  if (!review) {
    const error = new Error(`Customer review not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  return review;
};

/**
 * Admin: Transition review moderation status (Approved, Rejected, Pending)
 */
export const updateReviewStatus = async (id, status, adminId = null) => {
  const review = await Review.findById(id).select('+email +phone +adminNotes');

  if (!review) {
    const error = new Error(`Customer review not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  review.status = status;
  review.moderatedAt = new Date();
  if (adminId) {
    review.moderatedBy = adminId;
  }

  await review.save();
  return review;
};

/**
 * Admin: Update internal moderation notes
 */
export const updateReviewNotes = async (id, adminNotes) => {
  const review = await Review.findByIdAndUpdate(
    id,
    { adminNotes: (adminNotes || '').trim() },
    { new: true, runValidators: true }
  ).select('+email +phone +adminNotes');

  if (!review) {
    const error = new Error(`Customer review not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  return review;
};

/**
 * Admin: Permanently delete review and destroy associated Cloudinary assets
 */
export const deleteReview = async (id) => {
  const review = await Review.findById(id);

  if (!review) {
    const error = new Error(`Customer review not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  // Safely clean up any Cloudinary-stored assets associated with this review
  if (Array.isArray(review.images) && review.images.length > 0) {
    for (const image of review.images) {
      if (image && typeof image.publicId === 'string' && image.publicId.trim()) {
        try {
          await deleteCloudinaryAsset(image.publicId.trim());
        } catch (cleanupErr) {
          console.error(
            `[Review Media Cleanup Error] Failed to destroy asset ${image.publicId}:`,
            cleanupErr.message
          );
        }
      }
    }
  }

  await Review.findByIdAndDelete(id);
  return review;
};
