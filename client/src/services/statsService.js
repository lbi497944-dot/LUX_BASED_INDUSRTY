import api from './api';

export const statsService = {
  getDashboardStats: async () => {
    return await api.get('/stats/dashboard');
  },

  getNotificationSummary: async () => {
    return await api.get('/stats/notifications');
  },
};
