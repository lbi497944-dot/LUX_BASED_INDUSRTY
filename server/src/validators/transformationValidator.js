import { body } from 'express-validator';

/**
 * Safe URL validator: strictly allows only http: and https: protocols
 * Explicitly rejects javascript:, data:, vbscript:, file:, etc.
 */
const isSafeWebUrl = (value) => {
  if (!value || typeof value !== 'string') return true;
  const trimmed = value.trim();
  if (!trimmed) return true;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Only HTTP and HTTPS URLs are permitted');
    }
    return true;
  } catch (err) {
    throw new Error('Please provide a valid image URL starting with http:// or https://');
  }
};

export const createTransformationValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Transformation title is required')
    .isLength({ min: 1, max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short description cannot exceed 300 characters'),
  body('detailedDescription')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Detailed description cannot exceed 2000 characters'),
  body('beforeImage')
    .trim()
    .notEmpty()
    .withMessage('Before image URL is required')
    .custom(isSafeWebUrl),
  body('beforePublicId')
    .optional()
    .trim()
    .isString(),
  body('afterImage')
    .trim()
    .notEmpty()
    .withMessage('After image URL is required')
    .custom(isSafeWebUrl),
  body('afterPublicId')
    .optional()
    .trim()
    .isString(),
  body('order')
    .optional()
    .isInt()
    .withMessage('Order must be an integer')
    .toInt(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
];

export const updateTransformationValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short description cannot exceed 300 characters'),
  body('detailedDescription')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Detailed description cannot exceed 2000 characters'),
  body('beforeImage')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Before image URL cannot be empty')
    .custom(isSafeWebUrl),
  body('beforePublicId')
    .optional()
    .trim()
    .isString(),
  body('afterImage')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('After image URL cannot be empty')
    .custom(isSafeWebUrl),
  body('afterPublicId')
    .optional()
    .trim()
    .isString(),
  body('order')
    .optional()
    .isInt()
    .withMessage('Order must be an integer')
    .toInt(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
];
