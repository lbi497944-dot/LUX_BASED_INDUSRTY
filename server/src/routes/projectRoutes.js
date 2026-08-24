import express from 'express';
import * as projectController from '../controllers/projectController.js';
import { createProjectValidator, updateProjectValidator } from '../validators/projectValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', projectController.getProjects);
router.get('/:slug', projectController.getProjectBySlug);
router.get('/id/:id', projectController.getProjectById);

// Admin protected routes
router.post('/', protect, createProjectValidator, validate, projectController.createProject);
router.put('/:id', protect, updateProjectValidator, validate, projectController.updateProject);
router.delete('/:id', protect, projectController.deleteProject);

export default router;
