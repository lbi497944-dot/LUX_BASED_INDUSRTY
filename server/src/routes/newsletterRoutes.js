import express from 'express';
import { body } from 'express-validator';
import * as newsletterController from '../controllers/newsletterController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { formLimiter } from '../middleware/rateLimitMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  createNewsletterValidator,
  updateNewsletterValidator,
  shareWhatsAppValidator,
} from '../validators/newsletterValidator.js';

const router = express.Router();

// Public Subscription
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

// Admin Subscribers Management
router.get('/', protect, authorize('admin'), newsletterController.getSubscribers);
router.delete('/:id', protect, authorize('admin'), newsletterController.deleteSubscriber);

// Admin Campaign Management
router.get('/campaigns', protect, authorize('admin'), newsletterController.getAllNewsletters);
router.get('/campaigns/:id', protect, authorize('admin'), newsletterController.getNewsletterById);
router.post('/campaigns', protect, authorize('admin'), createNewsletterValidator, validate, newsletterController.createNewsletter);
router.patch('/campaigns/:id', protect, authorize('admin'), updateNewsletterValidator, validate, newsletterController.updateNewsletter);
router.delete('/campaigns/:id', protect, authorize('admin'), newsletterController.deleteNewsletter);
router.post('/campaigns/:id/duplicate', protect, authorize('admin'), newsletterController.duplicateNewsletter);
router.get('/campaigns/:id/preview', protect, authorize('admin'), newsletterController.previewNewsletter);
router.post('/campaigns/:id/send', protect, authorize('admin'), newsletterController.sendNewsletter);
router.post('/campaigns/:id/whatsapp', protect, authorize('admin'), shareWhatsAppValidator, validate, newsletterController.shareWhatsApp);
router.post('/campaigns/upload-attachment', protect, authorize('admin'), upload.single('attachment'), newsletterController.uploadAttachment);

export default router;
