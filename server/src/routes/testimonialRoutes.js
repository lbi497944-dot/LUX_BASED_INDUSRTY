import express from 'express';
import { body } from 'express-validator';
import * as testimonialController from '../controllers/testimonialController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (optionalAuth allows verified admins to use adminView)
router.get('/', optionalAuth, testimonialController.getTestimonials);
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  validate,
  testimonialController.createTestimonial
);
router.put('/:id', protect, authorize('admin'), testimonialController.updateTestimonial);
router.delete('/:id', protect, authorize('admin'), testimonialController.deleteTestimonial);

export default router;
