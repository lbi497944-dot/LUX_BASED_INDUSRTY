import express from 'express';
import * as partnerController from '../controllers/partnerController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createPartnerValidator,
  updatePartnerValidator,
} from '../validators/partnerValidator.js';

const router = express.Router();

// ============================================================================
// Public / Semi-Public Routes
// ============================================================================

// GET /api/partners - public active partners, or all if adminView=true with valid admin token
router.get('/', optionalAuth, partnerController.getPartners);

// ============================================================================
// Admin Routes (Protected)
// ============================================================================

// Retrieve single partner
router.get('/:id', protect, authorize('admin'), partnerController.getPartnerById);

// Create new partner
router.post(
  '/',
  protect,
  authorize('admin'),
  createPartnerValidator,
  validate,
  partnerController.createPartner
);

// Update partner
router.put(
  '/:id',
  protect,
  authorize('admin'),
  updatePartnerValidator,
  validate,
  partnerController.updatePartner
);

// Delete partner
router.delete('/:id', protect, authorize('admin'), partnerController.deletePartner);

export default router;
