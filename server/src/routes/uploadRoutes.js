import express from 'express';
import * as uploadController from '../controllers/uploadController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow single and multiple file uploads (protected for admin media upload)
router.post('/', protect, authorize('admin'), upload.array('files', 10), uploadController.uploadMedia);
router.post('/single', protect, authorize('admin'), upload.single('file'), uploadController.uploadMedia);

export default router;
