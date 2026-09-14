import * as newsletterService from '../services/newsletterService.js';
import { successResponse } from '../utils/apiResponse.js';
import { processUploadedFile } from '../middleware/uploadMiddleware.js';

export const subscribe = async (req, res, next) => {
  try {
    const { email, source } = req.body;
    const result = await newsletterService.subscribeNewsletter(email, source);
    return successResponse(res, result.message, { subscriber: result.subscriber }, 200);
  } catch (error) {
    next(error);
  }
};

export const getSubscribers = async (req, res, next) => {
  try {
    const result = await newsletterService.getAllSubscribers(req.query);
    return successResponse(res, 'Subscribers retrieved.', result.subscribers, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const deleteSubscriber = async (req, res, next) => {
  try {
    await newsletterService.deleteSubscriber(req.params.id);
    return successResponse(res, 'Subscriber removed.');
  } catch (error) {
    next(error);
  }
};

export const getAllNewsletters = async (req, res, next) => {
  try {
    const result = await newsletterService.getAllNewsletters(req.query);
    return successResponse(res, 'Newsletters retrieved.', result.newsletters, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getNewsletterById = async (req, res, next) => {
  try {
    const newsletter = await newsletterService.getNewsletterById(req.params.id);
    return successResponse(res, 'Newsletter details retrieved.', newsletter);
  } catch (error) {
    next(error);
  }
};

export const createNewsletter = async (req, res, next) => {
  try {
    const adminId = req.user?._id;
    const newsletter = await newsletterService.createNewsletter(req.body, adminId);
    return successResponse(res, 'Newsletter draft created.', newsletter, 201);
  } catch (error) {
    next(error);
  }
};

export const updateNewsletter = async (req, res, next) => {
  try {
    const newsletter = await newsletterService.updateNewsletter(req.params.id, req.body);
    return successResponse(res, 'Newsletter updated successfully.', newsletter);
  } catch (error) {
    next(error);
  }
};

export const deleteNewsletter = async (req, res, next) => {
  try {
    const result = await newsletterService.deleteNewsletter(req.params.id);
    return successResponse(res, result.message, { id: result.id });
  } catch (error) {
    next(error);
  }
};

export const duplicateNewsletter = async (req, res, next) => {
  try {
    const adminId = req.user?._id;
    const duplicate = await newsletterService.duplicateNewsletter(req.params.id, adminId);
    return successResponse(res, 'Newsletter duplicated.', duplicate, 201);
  } catch (error) {
    next(error);
  }
};

export const previewNewsletter = async (req, res, next) => {
  try {
    const newsletter = await newsletterService.getNewsletterById(req.params.id);
    const html = newsletterService.renderNewsletterHtml(newsletter);
    return successResponse(res, 'Preview generated.', { html, newsletter });
  } catch (error) {
    next(error);
  }
};

export const sendNewsletter = async (req, res, next) => {
  try {
    const result = await newsletterService.sendNewsletterBroadcast(req.params.id);
    return successResponse(res, 'Newsletter broadcast completed.', result);
  } catch (error) {
    next(error);
  }
};

export const shareWhatsApp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await newsletterService.generateWhatsAppShare(req.params.id, phone);
    return successResponse(res, 'WhatsApp share payload generated.', result);
  } catch (error) {
    next(error);
  }
};

export const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No attachment file provided.');
      error.statusCode = 400;
      throw error;
    }

    const processed = await processUploadedFile(req.file);
    return successResponse(res, 'Attachment uploaded successfully.', {
      url: processed.url,
      publicId: processed.publicId,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size || req.file.buffer?.length || 0,
    });
  } catch (error) {
    next(error);
  }
};
