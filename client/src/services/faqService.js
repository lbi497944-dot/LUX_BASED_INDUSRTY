import api from './api';

export const faqService = {
  getFaqs: async (params = {}) => {
    return await api.get('/faqs', { params });
  },

  createFaq: async (data) => {
    return await api.post('/faqs', data);
  },

  updateFaq: async (id, data) => {
    return await api.put(`/faqs/${id}`, data);
  },

  deleteFaq: async (id) => {
    return await api.delete(`/faqs/${id}`);
  },
};
