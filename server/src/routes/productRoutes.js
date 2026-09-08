import express from 'express';
import * as productController from '../controllers/productController.js';
import { createProductValidator, updateProductValidator } from '../validators/productValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (optionalAuth allows verified admins to use adminView)
router.get('/', optionalAuth, productController.getProducts);
router.get('/:slug', productController.getProductBySlug);
router.get('/id/:id', productController.getProductById);

// Admin protected routes
router.post('/', protect, authorize('admin'), createProductValidator, validate, productController.createProduct);
router.put('/:id', protect, authorize('admin'), updateProductValidator, validate, productController.updateProduct);
router.delete('/:id', protect, authorize('admin'), productController.deleteProduct);

export default router;
