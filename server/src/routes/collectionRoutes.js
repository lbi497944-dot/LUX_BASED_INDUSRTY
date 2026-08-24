import express from 'express';
import * as collectionController from '../controllers/collectionController.js';
import { createCollectionValidator, updateCollectionValidator } from '../validators/collectionValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', collectionController.getCollections);
router.get('/:slug', collectionController.getCollectionBySlug);
router.get('/id/:id', collectionController.getCollectionById);

// Admin protected routes
router.post('/', protect, createCollectionValidator, validate, collectionController.createCollection);
router.put('/:id', protect, updateCollectionValidator, validate, collectionController.updateCollection);
router.delete('/:id', protect, collectionController.deleteCollection);

export default router;
