import api from './api';

export const settingService = {
  getSettings: async () => {
    return await api.get('/settings');
  },

  updateSettings: async (data) => {
    return await api.put('/settings', data);
  },

  getCatalogue: async () => {
    return await api.get('/catalogue');
  },

  uploadCatalogue: async (formData) => {
    return await api.post('/settings/catalogue', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteCatalogue: async () => {
    return await api.delete('/settings/catalogue');
  },
};
