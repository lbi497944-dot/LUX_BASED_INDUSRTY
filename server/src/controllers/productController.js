import * as productService from '../services/productService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProducts(req.query);
    return successResponse(res, 'Products retrieved successfully.', result.products, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    return successResponse(res, 'Product details retrieved.', { product });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return successResponse(res, 'Product details retrieved.', { product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return successResponse(res, 'Product created successfully.', { product }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return successResponse(res, 'Product updated successfully.', { product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    return successResponse(res, 'Product removed successfully.');
  } catch (error) {
    next(error);
  }
};
