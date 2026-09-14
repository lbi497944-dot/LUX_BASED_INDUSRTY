import * as statsService from '../services/statsService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await statsService.getDashboardStats();
    return successResponse(res, 'Dashboard metrics retrieved.', stats);
  } catch (error) {
    next(error);
  }
};

export const getNotificationsSummary = async (req, res, next) => {
  try {
    const summary = await statsService.getNotificationSummary();
    return successResponse(res, 'Notification summary retrieved.', summary);
  } catch (error) {
    next(error);
  }
};
