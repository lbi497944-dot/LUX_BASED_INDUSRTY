import express from 'express';
import * as projectController from '../controllers/projectController.js';
import { createProjectValidator, updateProjectValidator } from '../validators/projectValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (optionalAuth allows verified admins to use adminView)
router.get('/', optionalAuth, projectController.getProjects);
router.get('/:slug', projectController.getProjectBySlug);
router.get('/id/:id', projectController.getProjectById);

// Admin protected routes
router.post('/', protect, authorize('admin'), createProjectValidator, validate, projectController.createProject);
router.put('/:id', protect, authorize('admin'), updateProjectValidator, validate, projectController.updateProject);
router.delete('/:id', protect, authorize('admin'), projectController.deleteProject);

export default router;
