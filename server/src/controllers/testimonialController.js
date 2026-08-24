import * as testimonialService from '../services/testimonialService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await testimonialService.getAllTestimonials(req.query);
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
