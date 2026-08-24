import api from './api';

export const settingService = {
  getSettings: async () => {
    return await api.get('/settings');
  },

  updateSettings: async (data) => {
    return await api.put('/settings', data);
  },
};
