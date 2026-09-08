import express from 'express';
import { body } from 'express-validator';
import * as faqController from '../controllers/faqController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (optionalAuth allows verified admins to use adminView)
router.get('/', optionalAuth, faqController.getFaqs);
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('answer').trim().notEmpty().withMessage('Answer is required'),
  ],
  validate,
  faqController.createFaq
);
router.put('/:id', protect, authorize('admin'), faqController.updateFaq);
router.delete('/:id', protect, authorize('admin'), faqController.deleteFaq);

export default router;
