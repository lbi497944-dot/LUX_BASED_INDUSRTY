import express from 'express';
import * as uploadController from '../controllers/uploadController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow single and multiple file uploads (protected for general media upload)
router.post('/', protect, upload.array('files', 10), uploadController.uploadMedia);
router.post('/single', protect, upload.single('file'), uploadController.uploadMedia);

export default router;
