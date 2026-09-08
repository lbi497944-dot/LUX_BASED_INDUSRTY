import * as collectionService from '../services/collectionService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getCollections = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.admin && req.admin.role === 'admin');
    const queryParams = {
      ...req.query,
      adminView: isAdmin && (req.query.adminView === 'true' || req.query.adminView === true),
    };
    const collections = await collectionService.getAllCollections(queryParams);
    return successResponse(res, 'Collections retrieved successfully.', collections);
  } catch (error) {
    next(error);
  }
};

export const getCollectionBySlug = async (req, res, next) => {
  try {
    const collection = await collectionService.getCollectionBySlug(req.params.slug);
    return successResponse(res, 'Collection details retrieved.', { collection });
  } catch (error) {
    next(error);
  }
};

export const getCollectionById = async (req, res, next) => {
  try {
    const collection = await collectionService.getCollectionById(req.params.id);
    return successResponse(res, 'Collection details retrieved.', { collection });
  } catch (error) {
    next(error);
  }
};

export const createCollection = async (req, res, next) => {
  try {
    const collection = await collectionService.createCollection(req.body);
    return successResponse(res, 'Collection created successfully.', { collection }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCollection = async (req, res, next) => {
  try {
    const collection = await collectionService.updateCollection(req.params.id, req.body);
    return successResponse(res, 'Collection updated successfully.', { collection });
  } catch (error) {
    next(error);
  }
};

export const deleteCollection = async (req, res, next) => {
  try {
    await collectionService.deleteCollection(req.params.id);
    return successResponse(res, 'Collection deleted successfully.');
  } catch (error) {
    next(error);
  }
};
