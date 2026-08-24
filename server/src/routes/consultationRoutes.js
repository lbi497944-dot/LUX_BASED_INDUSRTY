import express from 'express';
import * as consultationController from '../controllers/consultationController.js';
import { createConsultationValidator } from '../validators/consultationValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
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
router.get('/', protect, consultationController.getConsultations);
router.get('/:id', protect, consultationController.getConsultationById);
router.patch('/:id/status', protect, consultationController.updateStatus);
router.patch('/:id/notes', protect, consultationController.updateNotes);
router.delete('/:id', protect, consultationController.deleteConsultation);

export default router;
