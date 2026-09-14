import express from 'express';
import * as settingController from '../controllers/settingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadCataloguePdfMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', settingController.getSettings);
router.put('/', protect, authorize('admin'), settingController.updateSettings);

// Public catalogue availability route
router.get('/catalogue', settingController.getCatalogue);

// Protected Admin Catalogue PDF management
router.post(
  '/catalogue',
  protect,
  authorize('admin'),
  uploadCataloguePdfMiddleware.single('file'),
  settingController.uploadCatalogue
);

router.delete(
  '/catalogue',
  protect,
  authorize('admin'),
  settingController.deleteCatalogue
);

export default router;
