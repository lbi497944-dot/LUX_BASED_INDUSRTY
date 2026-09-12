import express from 'express';
import * as pageController from '../controllers/pageController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / optionalAuth routes
// Public callers can retrieve published page content.
// Verified admins with ?adminView=true can preview drafts.
router.get('/:slug', optionalAuth, pageController.getPageBySlug);

// Admin-only management routes
router.get('/', protect, authorize('admin'), pageController.getPages);
router.post('/', protect, authorize('admin'), pageController.createPage);
router.put('/:slug/draft', protect, authorize('admin'), pageController.updateDraft);
router.post('/:slug/publish', protect, authorize('admin'), pageController.publishPage);
router.post('/:slug/discard-draft', protect, authorize('admin'), pageController.discardDraft);
router.delete('/:slug', protect, authorize('admin'), pageController.deletePage);

export default router;
