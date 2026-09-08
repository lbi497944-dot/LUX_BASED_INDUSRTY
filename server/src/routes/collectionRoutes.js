import express from 'express';
import * as collectionController from '../controllers/collectionController.js';
import { createCollectionValidator, updateCollectionValidator } from '../validators/collectionValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (optionalAuth allows verified admins to use adminView)
router.get('/', optionalAuth, collectionController.getCollections);
router.get('/:slug', collectionController.getCollectionBySlug);
router.get('/id/:id', collectionController.getCollectionById);

// Admin protected routes
router.post('/', protect, authorize('admin'), createCollectionValidator, validate, collectionController.createCollection);
router.put('/:id', protect, authorize('admin'), updateCollectionValidator, validate, collectionController.updateCollection);
router.delete('/:id', protect, authorize('admin'), collectionController.deleteCollection);

export default router;
