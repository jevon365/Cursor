import api from './api.js';

export const requestService = {
  // Get all requests
  getAll: async () => {
    const response = await api.get('/requests');
    return response.data;
  },

  // Get single request
  getById: async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  // Create new request
  create: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },

  // Update request (admin only)
  update: async (id, updates) => {
    const response = await api.put(`/requests/${id}`, updates);
    return response.data;
  },

  // Update request status (admin only)
  updateStatus: async (id, status) => {
    const response = await api.put(`/requests/${id}/status`, { status });
    return response.data;
  },
};
