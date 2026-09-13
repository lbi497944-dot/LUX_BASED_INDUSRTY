import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { uploadReviewImages } from '../middleware/uploadMiddleware.js';
import { formLimiter } from '../middleware/rateLimitMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createReviewValidator,
  updateReviewStatusValidator,
  updateReviewNotesValidator,
} from '../validators/reviewValidator.js';

const router = express.Router();

// ============================================================================
// Public Routes
// ============================================================================

// Submit customer review (accepts up to 3 project photos)
router.post(
  '/',
  formLimiter,
  uploadReviewImages.array('images', 3),
  createReviewValidator,
  validate,
  reviewController.createReview
);

// Get verified, approved reviews for public website display
router.get('/public', reviewController.getPublicReviews);

// ============================================================================
// Admin Routes (Protected)
// ============================================================================

// List all reviews with filters, search, and pagination
router.get('/', protect, authorize('admin'), reviewController.getAllReviews);

// Retrieve single review details with full PII
router.get('/:id', protect, authorize('admin'), reviewController.getReviewById);

// Update review moderation status (Approved, Rejected, Pending)
router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  updateReviewStatusValidator,
  validate,
  reviewController.updateReviewStatus
);

// Update internal admin moderation notes
router.patch(
  '/:id/notes',
  protect,
  authorize('admin'),
  updateReviewNotesValidator,
  validate,
  reviewController.updateReviewNotes
);

// Permanently delete a review and its Cloudinary media
router.delete('/:id', protect, authorize('admin'), reviewController.deleteReview);

export default router;
