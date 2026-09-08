import express from 'express';
import * as consultationController from '../controllers/consultationController.js';
import { createConsultationValidator } from '../validators/consultationValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { formLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Public submission route (accepts optional floor plan file attachment)
router.post(
  '/',
  formLimiter,
  upload.single('attachment'),
  createConsultationValidator,
  validate,
  consultationController.createConsultation
);

// Admin management routes
router.get('/', protect, authorize('admin'), consultationController.getConsultations);
router.get('/:id', protect, authorize('admin'), consultationController.getConsultationById);
router.patch('/:id/status', protect, authorize('admin'), consultationController.updateStatus);
router.patch('/:id/notes', protect, authorize('admin'), consultationController.updateNotes);
router.delete('/:id', protect, authorize('admin'), consultationController.deleteConsultation);

export default router;
