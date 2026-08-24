import { body } from 'express-validator';

export const createProjectValidator = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('coverImage').trim().notEmpty().withMessage('Cover image is required'),
];

export const updateProjectValidator = [
  body('title').optional().trim().notEmpty().withMessage('Project title cannot be empty'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
];
