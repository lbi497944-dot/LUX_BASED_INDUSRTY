import { body } from 'express-validator';

export const createNewsletterValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Campaign title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Email subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Newsletter content is required'),
  body('previewText')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Preview text cannot exceed 200 characters'),
  body('heading')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Heading cannot exceed 150 characters'),
  body('ctaText')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('CTA text cannot exceed 60 characters'),
  body('ctaUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      if (!val) return true;
      if (/^(https?:\/\/|\/)/i.test(val)) return true;
      throw new Error('CTA URL must be a valid web URL (https://...) or relative path (/...)');
    }),
  body('targetAudience')
    .optional()
    .isIn(['all', 'custom'])
    .withMessage('Target audience must be either all or custom'),
  body('selectedRecipients')
    .optional()
    .isArray()
    .withMessage('Selected recipients must be an array of email addresses'),
];

export const updateNewsletterValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Campaign title cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),
  body('subject')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email subject cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Newsletter content cannot be empty'),
  body('previewText')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Preview text cannot exceed 200 characters'),
  body('heading')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Heading cannot exceed 150 characters'),
  body('ctaText')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('CTA text cannot exceed 60 characters'),
  body('ctaUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      if (!val) return true;
      if (/^(https?:\/\/|\/)/i.test(val)) return true;
      throw new Error('CTA URL must be a valid web URL (https://...) or relative path (/...)');
    }),
  body('targetAudience')
    .optional()
    .isIn(['all', 'custom'])
    .withMessage('Target audience must be either all or custom'),
  body('selectedRecipients')
    .optional()
    .isArray()
    .withMessage('Selected recipients must be an array of email addresses'),
];

export const shareWhatsAppValidator = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required for WhatsApp sharing')
    .custom((val) => {
      const clean = val.replace(/[\s\-\(\)]/g, '');
      if (/^\+?[1-9]\d{6,14}$/.test(clean)) {
        return true;
      }
      throw new Error('Please enter a valid international phone number with country code (e.g. +971501234567)');
    }),
];
