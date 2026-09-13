import { body } from 'express-validator';

export const createReviewValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 7, max: 25 })
    .withMessage('Phone number must be between 7 and 25 characters'),
  body('rating')
    .notEmpty()
    .withMessage('Star rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5')
    .toInt(),
  body('title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage('Review title cannot exceed 120 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Review text is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Review text must be between 10 and 2000 characters'),
  body('projectLocation')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Project location cannot exceed 100 characters'),
];

export const updateReviewStatusValidator = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'Approved', 'Rejected'])
    .withMessage("Status must be one of: 'Pending', 'Approved', 'Rejected'"),
];

export const updateReviewNotesValidator = [
  body('adminNotes')
    .optional()
    .isString()
    .withMessage('Admin notes must be a string')
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters'),
];
