import express from 'express';
import { body } from 'express-validator';
import * as testimonialController from '../controllers/testimonialController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', testimonialController.getTestimonials);
router.post(
  '/',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  validate,
  testimonialController.createTestimonial
);
router.put('/:id', protect, testimonialController.updateTestimonial);
router.delete('/:id', protect, testimonialController.deleteTestimonial);

export default router;
