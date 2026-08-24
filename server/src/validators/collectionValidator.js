import { body } from 'express-validator';

export const createCollectionValidator = [
  body('name').trim().notEmpty().withMessage('Collection name is required'),
  body('tagline').trim().notEmpty().withMessage('Tagline is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('heroImage').trim().notEmpty().withMessage('Hero image URL is required'),
];

export const updateCollectionValidator = [
  body('name').optional().trim().notEmpty().withMessage('Collection name cannot be empty'),
  body('tagline').optional().trim().notEmpty().withMessage('Tagline cannot be empty'),
];
