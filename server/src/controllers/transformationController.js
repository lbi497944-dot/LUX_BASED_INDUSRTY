import * as transformationService from '../services/transformationService.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Public/Admin: Get transformations list
 */
export const getTransformations = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.admin && req.admin.role === 'admin');
    const adminView = isAdmin && (req.query.adminView === 'true' || req.query.adminView === true);

    if (adminView) {
      const transformations = await transformationService.getAllTransformations(req.query);
      return successResponse(res, 'Transformations retrieved successfully (Admin view).', transformations);
    }

    const transformations = await transformationService.getPublicTransformations();
    return successResponse(res, 'Transformations retrieved successfully.', transformations);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get transformation by ID
 */
export const getTransformationById = async (req, res, next) => {
  try {
    const transformation = await transformationService.getTransformationById(req.params.id);
    return successResponse(res, 'Transformation details retrieved.', { transformation });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create transformation
 */
export const createTransformation = async (req, res, next) => {
  try {
    const transformation = await transformationService.createTransformation(req.body);
    return successResponse(res, 'Transformation created successfully.', { transformation }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update transformation
 */
export const updateTransformation = async (req, res, next) => {
  try {
    const transformation = await transformationService.updateTransformation(req.params.id, req.body);
    return successResponse(res, 'Transformation updated successfully.', { transformation });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete transformation
 */
export const deleteTransformation = async (req, res, next) => {
  try {
    await transformationService.deleteTransformation(req.params.id);
    return successResponse(res, 'Transformation deleted successfully.');
  } catch (error) {
    next(error);
  }
};
