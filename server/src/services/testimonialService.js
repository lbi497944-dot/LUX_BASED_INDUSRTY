import Testimonial from '../models/Testimonial.js';

export const getAllTestimonials = async (queryParams) => {
  const { adminView = false, featured, sort = 'order' } = queryParams;

  const filter = {};
  if (!adminView) {
    filter.isActive = true;
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true' || featured === true;
  }

  const testimonials = await Testimonial.find(filter).sort(sort);
  return testimonials;
};

export const createTestimonial = async (data) => {
  const testimonial = await Testimonial.create(data);
  return testimonial;
};

export const updateTestimonial = async (id, data) => {
  const testimonial = await Testimonial.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!testimonial) {
    const error = new Error(`Testimonial not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return testimonial;
};

export const deleteTestimonial = async (id) => {
  const testimonial = await Testimonial.findByIdAndDelete(id);
  if (!testimonial) {
    const error = new Error(`Testimonial not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return testimonial;
};
