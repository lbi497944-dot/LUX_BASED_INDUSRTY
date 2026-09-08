import express from 'express';
import * as authController from '../controllers/authController.js';
import { loginValidator, changePasswordValidator } from '../validators/authValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.get('/me', protect, authorize('admin'), authController.getMe);
router.post('/logout', protect, authorize('admin'), authController.logout);
router.put('/password', protect, authorize('admin'), changePasswordValidator, validate, authController.changePassword);

export default router;
