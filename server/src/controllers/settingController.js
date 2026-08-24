import * as settingService from '../services/settingService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingService.getSiteSettings();
    return successResponse(res, 'Site settings retrieved.', { settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = await settingService.updateSiteSettings(req.body);
    return successResponse(res, 'Site settings updated successfully.', { settings });
  } catch (error) {
    next(error);
  }
};
