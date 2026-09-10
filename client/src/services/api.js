import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request Interceptor: Attach JWT Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('veloura_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth expiration or errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If 401 Unauthorized occurs on admin route, dispatch logout event
    if (error.response && error.response.status === 401) {
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('veloura_admin_token');
        localStorage.removeItem('veloura_admin_user');
        window.dispatchEvent(new Event('veloura_auth_expired'));
      }
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export default api;
