import api from './api';

export const statsService = {
  getDashboardStats: async () => {
    return await api.get('/stats/dashboard');
  },
};
