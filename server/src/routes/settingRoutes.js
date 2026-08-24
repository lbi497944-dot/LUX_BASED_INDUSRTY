import express from 'express';
import * as settingController from '../controllers/settingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', settingController.getSettings);
router.put('/', protect, settingController.updateSettings);

export default router;
