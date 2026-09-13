import api from './api';

export const transformationService = {
  // Public: Fetch active transformations (or admin view if adminView: true)
  getTransformations: async (params = {}) => {
    return await api.get('/transformations', { params });
  },

  // Admin: Fetch all transformations (including inactive)
  getAllTransformations: async (params = {}) => {
    return await api.get('/transformations', { params: { adminView: true, ...params } });
  },

  // Admin: Retrieve single transformation details
  getTransformation: async (id) => {
    return await api.get(`/transformations/${id}`);
  },

  getTransformationById: async (id) => {
    return await api.get(`/transformations/${id}`);
  },

  // Admin: Create transformation
  createTransformation: async (data) => {
    return await api.post('/transformations', data);
  },

  // Admin: Update transformation
  updateTransformation: async (id, data) => {
    return await api.put(`/transformations/${id}`, data);
  },

  // Admin: Delete transformation
  deleteTransformation: async (id) => {
    return await api.delete(`/transformations/${id}`);
  },
};
