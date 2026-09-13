import express from 'express';
import * as transformationController from '../controllers/transformationController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createTransformationValidator,
  updateTransformationValidator,
} from '../validators/transformationValidator.js';

const router = express.Router();

// Public / Semi-Public: active transformations (or all if adminView=true + valid token)
router.get('/', optionalAuth, transformationController.getTransformations);

// Admin Protected
router.get('/:id', protect, authorize('admin'), transformationController.getTransformationById);

router.post(
  '/',
  protect,
  authorize('admin'),
  createTransformationValidator,
  validate,
  transformationController.createTransformation
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateTransformationValidator,
  validate,
  transformationController.updateTransformation
);

router.delete('/:id', protect, authorize('admin'), transformationController.deleteTransformation);

export default router;
