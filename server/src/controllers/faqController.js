import * as faqService from '../services/faqService.js';
import { successResponse } from '../utils/apiResponse.js';

export const ALLOWED_FAQ_FIELDS = [
  'question',
  'answer',
  'category',
  'order',
  'isActive',
];

export const filterFaqFields = (body) => {
  const source = body && typeof body === 'object' ? body : {};
  const filtered = {};
  for (const field of ALLOWED_FAQ_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) {
      filtered[field] = source[field];
    }
  }
  return filtered;
};

export const getFaqs = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.admin && req.admin.role === 'admin');
    const queryParams = {
      ...req.query,
      adminView: isAdmin && (req.query.adminView === 'true' || req.query.adminView === true),
    };
    const faqs = await faqService.getAllFaqs(queryParams);
    return successResponse(res, 'FAQs retrieved.', faqs);
  } catch (error) {
    next(error);
  }
};

export const createFaq = async (req, res, next) => {
  try {
    const data = filterFaqFields(req.body);
    const faq = await faqService.createFaq(data);
    return successResponse(res, 'FAQ created.', { faq }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (req, res, next) => {
  try {
    const data = filterFaqFields(req.body);
    const faq = await faqService.updateFaq(req.params.id, data);
    return successResponse(res, 'FAQ updated.', { faq });
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (req, res, next) => {
  try {
    await faqService.deleteFaq(req.params.id);
    return successResponse(res, 'FAQ deleted.');
  } catch (error) {
    next(error);
  }
};
