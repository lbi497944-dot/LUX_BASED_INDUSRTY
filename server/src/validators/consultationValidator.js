import { body } from 'express-validator';

export const createConsultationValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address format').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('projectLocation').trim().notEmpty().withMessage('Project location is required'),
  body('projectType').trim().notEmpty().withMessage('Project type is required'),
];
