import api from './api';

export const newsletterService = {
  subscribe: async (email, source = 'footer') => {
    return await api.post('/newsletter/subscribe', { email, source });
  },

  getSubscribers: async (params = {}) => {
    return await api.get('/newsletter', { params });
  },

  deleteSubscriber: async (id) => {
    return await api.delete(`/newsletter/${id}`);
  },
};
