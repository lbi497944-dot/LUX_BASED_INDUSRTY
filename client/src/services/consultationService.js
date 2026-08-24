import api from './api';

export const consultationService = {
  submitConsultation: async (formData) => {
    // If formData is an instance of FormData, use multipart/form-data
    const isFormData = formData instanceof FormData;
    return await api.post('/consultations', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  getConsultations: async (params = {}) => {
    return await api.get('/consultations', { params });
  },

  getConsultationById: async (id) => {
    return await api.get(`/consultations/${id}`);
  },

  updateStatus: async (id, status) => {
    return await api.patch(`/consultations/${id}/status`, { status });
  },

  updateNotes: async (id, adminNotes) => {
    return await api.patch(`/consultations/${id}/notes`, { adminNotes });
  },

  deleteConsultation: async (id) => {
    return await api.delete(`/consultations/${id}`);
  },
};
