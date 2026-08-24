import api from './api';

export const contactService = {
  submitContact: async (data) => {
    return await api.post('/contact', data);
  },

  getContacts: async (params = {}) => {
    return await api.get('/contact', { params });
  },

  getContactById: async (id) => {
    return await api.get(`/contact/${id}`);
  },

  updateStatus: async (id, status) => {
    return await api.patch(`/contact/${id}/status`, { status });
  },

  updateNotes: async (id, adminNotes) => {
    return await api.patch(`/contact/${id}/notes`, { adminNotes });
  },

  deleteContact: async (id) => {
    return await api.delete(`/contact/${id}`);
  },
};
