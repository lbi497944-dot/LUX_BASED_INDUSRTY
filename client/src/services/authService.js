import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('veloura_admin_token', res.data.token);
      localStorage.setItem('veloura_admin_user', JSON.stringify(res.data.admin));
    }
    return res;
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('veloura_admin_token');
      localStorage.removeItem('veloura_admin_user');
    }
  },

  getToken: () => {
    return localStorage.getItem('veloura_admin_token');
  },

  getUser: () => {
    try {
      const user = localStorage.getItem('veloura_admin_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return Boolean(localStorage.getItem('veloura_admin_token'));
  },

  changePassword: async (currentPassword, newPassword) => {
    return await api.put('/auth/password', { currentPassword, newPassword });
  },
};
