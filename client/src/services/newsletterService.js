import api from './api';

export const newsletterService = {
  // Public
  subscribe: async (email, source = 'footer') => {
    return await api.post('/newsletter/subscribe', { email, source });
  },

  // Subscribers
  getSubscribers: async (params = {}) => {
    return await api.get('/newsletter', { params });
  },

  deleteSubscriber: async (id) => {
    return await api.delete(`/newsletter/${id}`);
  },

  // Campaigns
  getCampaigns: async (params = {}) => {
    return await api.get('/newsletter/campaigns', { params });
  },

  getCampaignById: async (id) => {
    return await api.get(`/newsletter/campaigns/${id}`);
  },

  createCampaign: async (data) => {
    return await api.post('/newsletter/campaigns', data);
  },

  updateCampaign: async (id, data) => {
    return await api.patch(`/newsletter/campaigns/${id}`, data);
  },

  deleteCampaign: async (id) => {
    return await api.delete(`/newsletter/campaigns/${id}`);
  },

  duplicateCampaign: async (id) => {
    return await api.post(`/newsletter/campaigns/${id}/duplicate`);
  },

  previewCampaign: async (id) => {
    return await api.get(`/newsletter/campaigns/${id}/preview`);
  },

  sendCampaign: async (id) => {
    return await api.post(`/newsletter/campaigns/${id}/send`);
  },

  shareWhatsApp: async (id, phone) => {
    return await api.post(`/newsletter/campaigns/${id}/whatsapp`, { phone });
  },

  uploadAttachment: async (file) => {
    const formData = new FormData();
    formData.append('attachment', file);
    return await api.post('/newsletter/campaigns/upload-attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
