import * as faqService from '../services/faqService.js';
import { successResponse } from '../utils/apiResponse.js';

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
    const faq = await faqService.createFaq(req.body);
    return successResponse(res, 'FAQ created.', { faq }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (req, res, next) => {
  try {
    const faq = await faqService.updateFaq(req.params.id, req.body);
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
