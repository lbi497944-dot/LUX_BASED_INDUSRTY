import express from 'express';
import * as productController from '../controllers/productController.js';
import { createProductValidator, updateProductValidator } from '../validators/productValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);
router.get('/id/:id', productController.getProductById);

// Admin protected routes
router.post('/', protect, createProductValidator, validate, productController.createProduct);
router.put('/:id', protect, updateProductValidator, validate, productController.updateProduct);
router.delete('/:id', protect, productController.deleteProduct);

export default router;
