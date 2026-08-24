import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    return await api.get('/products', { params });
  },

  getProductBySlug: async (slug) => {
    return await api.get(`/products/${slug}`);
  },

  getProductById: async (id) => {
    return await api.get(`/products/id/${id}`);
  },

  createProduct: async (data) => {
    return await api.post('/products', data);
  },

  updateProduct: async (id, data) => {
    return await api.put(`/products/${id}`, data);
  },

  deleteProduct: async (id) => {
    return await api.delete(`/products/${id}`);
  },
};
