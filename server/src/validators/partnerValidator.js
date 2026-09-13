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
    throw new Error('Please provide a valid website URL starting with http:// or https://');
  }
};

export const createPartnerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Partner company name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name must be between 1 and 100 characters'),
  body('logo')
    .trim()
    .notEmpty()
    .withMessage('Partner logo is required'),
  body('logoPublicId')
    .optional()
    .trim()
    .isString(),
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Website URL cannot exceed 500 characters')
    .custom(isSafeWebUrl),
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

export const updatePartnerValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Partner company name cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name must be between 1 and 100 characters'),
  body('logo')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Logo URL cannot be empty'),
  body('logoPublicId')
    .optional()
    .trim()
    .isString(),
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Website URL cannot exceed 500 characters')
    .custom(isSafeWebUrl),
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
