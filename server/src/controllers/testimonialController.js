import * as testimonialService from '../services/testimonialService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getTestimonials = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.admin && req.admin.role === 'admin');
    const queryParams = {
      ...req.query,
      adminView: isAdmin && (req.query.adminView === 'true' || req.query.adminView === true),
    };
    const testimonials = await testimonialService.getAllTestimonials(queryParams);
    return successResponse(res, 'Testimonials retrieved.', testimonials);
  } catch (error) {
    next(error);
  }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.createTestimonial(req.body);
    return successResponse(res, 'Testimonial created.', { testimonial }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.updateTestimonial(req.params.id, req.body);
    return successResponse(res, 'Testimonial updated.', { testimonial });
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    await testimonialService.deleteTestimonial(req.params.id);
    return successResponse(res, 'Testimonial deleted.');
  } catch (error) {
    next(error);
  }
};
