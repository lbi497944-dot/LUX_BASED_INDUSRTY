import api from './api';

export const reviewService = {
  getReviews: async (params = {}) => {
    return await api.get('/reviews', { params });
  },

  getReviewById: async (id) => {
    return await api.get(`/reviews/${id}`);
  },

  updateStatus: async (id, status) => {
    return await api.patch(`/reviews/${id}/status`, { status });
  },

  updateNotes: async (id, adminNotes) => {
    return await api.patch(`/reviews/${id}/notes`, { adminNotes });
  },

  deleteReview: async (id) => {
    return await api.delete(`/reviews/${id}`);
  },
};
