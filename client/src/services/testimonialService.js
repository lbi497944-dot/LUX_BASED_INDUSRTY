import api from './api';

export const testimonialService = {
  getTestimonials: async (params = {}) => {
    return await api.get('/testimonials', { params });
  },

  createTestimonial: async (data) => {
    return await api.post('/testimonials', data);
  },

  updateTestimonial: async (id, data) => {
    return await api.put(`/testimonials/${id}`, data);
  },

  deleteTestimonial: async (id) => {
    return await api.delete(`/testimonials/${id}`);
  },
};
