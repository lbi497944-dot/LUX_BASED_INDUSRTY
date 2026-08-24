import express from 'express';
import * as statsController from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, statsController.getStats);

export default router;
