import api from './api';

export const pageService = {
  getPages: async (params = {}) => {
    return await api.get('/pages', {
      params: { adminView: true, ...params },
    });
  },

  getPageBySlug: async (slug, adminView = false) => {
    const config = adminView ? { params: { adminView: true } } : {};
    return await api.get(`/pages/${slug}`, config);
  },

  getPublishedPage: async (slug) => {
    return await api.get(`/pages/${slug}`);
  },

  createPage: async (data) => {
    return await api.post('/pages', data);
  },

  updateDraft: async (slug, data) => {
    return await api.put(`/pages/${slug}/draft`, data);
  },

  publishPage: async (slug) => {
    return await api.post(`/pages/${slug}/publish`);
  },

  discardDraft: async (slug) => {
    return await api.post(`/pages/${slug}/discard-draft`);
  },

  deletePage: async (slug) => {
    return await api.delete(`/pages/${slug}`);
  },
};
