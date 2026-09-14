import * as settingService from '../services/settingService.js';
import { successResponse } from '../utils/apiResponse.js';

export const _deps = {
  settingService,
};

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

export const getCatalogue = async (req, res, next) => {
  try {
    const settings = await _deps.settingService.getSiteSettings();
    const cat = settings.catalogue;
    const available = Boolean(cat?.url && !/veloura/i.test(cat.url));
    return successResponse(res, available ? 'Catalogue metadata retrieved.' : 'No active catalogue available.', {
      available,
      url: available ? cat.url : '',
      filename: available ? (cat.originalFilename || 'LUX_BASED_INDUSTRY_Catalogue_2026.pdf') : '',
      bytes: available ? (cat.bytes || 0) : 0,
      updatedAt: available ? cat.updatedAt : null,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadCatalogue = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file was provided in the upload request.',
        errors: ['No PDF file was provided in the upload request.'],
      });
    }

    const catalogue = await _deps.settingService.uploadCataloguePdf(req.file);
    return successResponse(res, 'Catalogue PDF uploaded successfully.', { catalogue }, 201);
  } catch (error) {
    next(error);
  }
};

export const deleteCatalogue = async (req, res, next) => {
  try {
    const result = await _deps.settingService.deleteCataloguePdf();
    return successResponse(res, result.message, { success: true });
  } catch (error) {
    next(error);
  }
};
