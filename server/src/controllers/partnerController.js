import * as partnerService from '../services/partnerService.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Public/Admin: Get partners list
 */
export const getPartners = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.admin && req.admin.role === 'admin');
    const adminView = isAdmin && (req.query.adminView === 'true' || req.query.adminView === true);

    if (adminView) {
      const partners = await partnerService.getAllPartners(req.query);
      return successResponse(res, 'Partners retrieved successfully (Admin view).', partners);
    }

    const partners = await partnerService.getPublicPartners();
    return successResponse(res, 'Client partners retrieved successfully.', partners);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get partner by ID
 */
export const getPartnerById = async (req, res, next) => {
  try {
    const partner = await partnerService.getPartnerById(req.params.id);
    return successResponse(res, 'Partner details retrieved.', { partner });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create partner
 */
export const createPartner = async (req, res, next) => {
  try {
    const partner = await partnerService.createPartner(req.body);
    return successResponse(res, 'Partner created successfully.', { partner }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update partner
 */
export const updatePartner = async (req, res, next) => {
  try {
    const partner = await partnerService.updatePartner(req.params.id, req.body);
    return successResponse(res, 'Partner updated successfully.', { partner });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete partner
 */
export const deletePartner = async (req, res, next) => {
  try {
    await partnerService.deletePartner(req.params.id);
    return successResponse(res, 'Partner deleted successfully.');
  } catch (error) {
    next(error);
  }
};
