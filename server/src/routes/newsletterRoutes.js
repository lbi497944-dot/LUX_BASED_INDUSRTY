import express from 'express';
import { body } from 'express-validator';
import * as newsletterController from '../controllers/newsletterController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { formLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post(
  '/subscribe',
  formLimiter,
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
  ],
  validate,
  newsletterController.subscribe
);

router.get('/', protect, authorize('admin'), newsletterController.getSubscribers);
router.delete('/:id', protect, authorize('admin'), newsletterController.deleteSubscriber);

export default router;
