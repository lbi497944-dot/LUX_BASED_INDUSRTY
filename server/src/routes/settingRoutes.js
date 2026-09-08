import express from 'express';
import * as settingController from '../controllers/settingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', settingController.getSettings);
router.put('/', protect, authorize('admin'), settingController.updateSettings);

export default router;
