import api from './api';

export const projectService = {
  getProjects: async (params = {}) => {
    return await api.get('/projects', { params });
  },

  getProjectBySlug: async (slug) => {
    return await api.get(`/projects/${slug}`);
  },

  getProjectById: async (id) => {
    return await api.get(`/projects/id/${id}`);
  },

  createProject: async (data) => {
    return await api.post('/projects', data);
  },

  updateProject: async (id, data) => {
    return await api.put(`/projects/${id}`, data);
  },

  deleteProject: async (id) => {
    return await api.delete(`/projects/${id}`);
  },
};
