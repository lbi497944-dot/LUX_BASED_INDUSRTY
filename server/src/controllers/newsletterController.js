import * as newsletterService from '../services/newsletterService.js';
import { successResponse } from '../utils/apiResponse.js';

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
