import * as settingService from '../services/settingService.js';
import { successResponse } from '../utils/apiResponse.js';

export const ALLOWED_SETTING_FIELDS = [
  'brandName',
  'tagline',
  'email',
  'phone',
  'whatsapp',
  'whatsappNumberClean',
  'address',
  'city',
  'country',
  'businessHours',
  'catalogueUrl',
  'socialLinks',
  'defaultSeo',
  'coordinates',
  'logo',
  'logoPublicId',
  'locations',
];

export const getSettings = async (req, res, next) => {
  try {
    // Prevent browser and proxy caching for dynamic site settings
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const settings = await settingService.getSiteSettings();
    return successResponse(res, 'Site settings retrieved.', { settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};

    const updateData = {};
    for (const field of ALLOWED_SETTING_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field) && body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const settings = await settingService.updateSiteSettings(updateData);
    return successResponse(res, 'Site settings updated successfully.', { settings });
  } catch (error) {
    next(error);
  }
};
