import express from 'express';
import * as statsController from '../controllers/statsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), statsController.getStats);
router.get('/notifications', protect, authorize('admin'), statsController.getNotificationsSummary);

export default router;
