import express from 'express';
import { body } from 'express-validator';
import * as faqController from '../controllers/faqController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', faqController.getFaqs);
router.post(
  '/',
  protect,
  [
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('answer').trim().notEmpty().withMessage('Answer is required'),
  ],
  validate,
  faqController.createFaq
);
router.put('/:id', protect, faqController.updateFaq);
router.delete('/:id', protect, faqController.deleteFaq);

export default router;
