import api from './api';

export const collectionService = {
  getCollections: async (params = {}) => {
    return await api.get('/collections', { params });
  },

  getCollectionBySlug: async (slug) => {
    return await api.get(`/collections/${slug}`);
  },

  getCollectionById: async (id) => {
    return await api.get(`/collections/id/${id}`);
  },

  createCollection: async (data) => {
    return await api.post('/collections', data);
  },

  updateCollection: async (id, data) => {
    return await api.put(`/collections/${id}`, data);
  },

  deleteCollection: async (id) => {
    return await api.delete(`/collections/${id}`);
  },
};
