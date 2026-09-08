import express from 'express';
import * as contactController from '../controllers/contactController.js';
import { createContactValidator } from '../validators/contactValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { formLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Public submission route
router.post('/', formLimiter, createContactValidator, validate, contactController.createContact);

// Admin management routes
router.get('/', protect, authorize('admin'), contactController.getContacts);
router.get('/:id', protect, authorize('admin'), contactController.getContactById);
router.patch('/:id/status', protect, authorize('admin'), contactController.updateStatus);
router.patch('/:id/notes', protect, authorize('admin'), contactController.updateNotes);
router.delete('/:id', protect, authorize('admin'), contactController.deleteContact);

export default router;
