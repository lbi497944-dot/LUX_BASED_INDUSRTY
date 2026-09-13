import * as reviewService from '../services/reviewService.js';
import { processUploadedFile, deleteCloudinaryAsset } from '../middleware/uploadMiddleware.js';
import { successResponse } from '../utils/apiResponse.js';

// Dependency container for testable transactional rollback
export const _deps = {
  processUploadedFile,
  deleteCloudinaryAsset,
  createReview: reviewService.createReview,
};

/**
 * Public: Submit a customer review (held in Pending queue)
 */
export const createReview = async (req, res, next) => {
  const uploadedFiles = [];

  try {
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const processed = await _deps.processUploadedFile(file);
        if (processed) uploadedFiles.push(processed);
      }
    } else if (req.file) {
      const processed = await _deps.processUploadedFile(req.file);
      if (processed) uploadedFiles.push(processed);
    }

    const clientMeta = {
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
    };

    const review = await _deps.createReview(req.body, uploadedFiles, clientMeta);

    return successResponse(
      res,
      'Thank you for sharing your experience. Your review has been received and will appear on our website once verified by our concierge.',
      { reviewId: review._id },
      201
    );
  } catch (error) {
    // Transactional rollback: Clean up any Cloudinary assets uploaded before failure occurred
    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        if (file && typeof file.publicId === 'string' && file.publicId.trim()) {
          try {
            await _deps.deleteCloudinaryAsset(file.publicId.trim());
          } catch (cleanupErr) {
            console.error(
              `[Review Upload Rollback Error] Failed to delete orphaned asset ${file.publicId}:`,
              cleanupErr.message
            );
          }
        }
      }
    }

    next(error);
  }
};

/**
 * Public: Retrieve verified approved reviews
 */
export const getPublicReviews = async (req, res, next) => {
  try {
    // Avoid caching for newly approved content
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');

    const result = await reviewService.getPublicReviews(req.query);
    return successResponse(
      res,
      'Public reviews retrieved.',
      result.reviews,
      200,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Retrieve all reviews with filtering and pagination
 */
export const getAllReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getAllReviews(req.query);
    return successResponse(
      res,
      'Customer reviews retrieved.',
      result.reviews,
      200,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Retrieve single review details
 */
export const getReviewById = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    return successResponse(res, 'Review detail retrieved.', { review });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update moderation status (Approved, Rejected, Pending)
 */
export const updateReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const adminId = req.admin?._id;
    const review = await reviewService.updateReviewStatus(req.params.id, status, adminId);
    return successResponse(res, `Review status updated to ${status}.`, { review });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update internal notes
 */
export const updateReviewNotes = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const review = await reviewService.updateReviewNotes(req.params.id, adminNotes);
    return successResponse(res, 'Internal notes updated.', { review });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Permanently delete review
 */
export const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id);
    return successResponse(res, 'Customer review deleted successfully.');
  } catch (error) {
    next(error);
  }
};
