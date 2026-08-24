import express from 'express';
import * as contactController from '../controllers/contactController.js';
import { createContactValidator } from '../validators/contactValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { formLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Public submission route
router.post('/', formLimiter, createContactValidator, validate, contactController.createContact);

// Admin management routes
router.get('/', protect, contactController.getContacts);
router.get('/:id', protect, contactController.getContactById);
router.patch('/:id/status', protect, contactController.updateStatus);
router.patch('/:id/notes', protect, contactController.updateNotes);
router.delete('/:id', protect, contactController.deleteContact);

export default router;
