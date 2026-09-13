import api from './api';

export const partnerService = {
  // Fetch partners (public active list, or admin view if adminView: true)
  getPartners: async (params = {}) => {
    return await api.get('/partners', { params });
  },

  // Admin: Retrieve single partner details
  getPartnerById: async (id) => {
    return await api.get(`/partners/${id}`);
  },

  // Admin: Create partner
  createPartner: async (data) => {
    return await api.post('/partners', data);
  },

  // Admin: Update partner
  updatePartner: async (id, data) => {
    return await api.put(`/partners/${id}`, data);
  },

  // Admin: Delete partner
  deletePartner: async (id) => {
    return await api.delete(`/partners/${id}`);
  },
};
