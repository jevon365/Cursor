import api from './api.js';

export const workspaceService = {
  // Get all workspaces
  getAll: async () => {
    const response = await api.get('/workspaces');
    return response.data;
  },

  // Get single workspace
  getById: async (id) => {
    const response = await api.get(`/workspaces/${id}`);
    return response.data;
  },

  // Create workspace (admin only)
  create: async (workspaceData) => {
    const response = await api.post('/workspaces', workspaceData);
    return response.data;
  },

  // Update workspace (admin only)
  update: async (id, updates) => {
    const response = await api.put(`/workspaces/${id}`, updates);
    return response.data;
  },

  // Delete workspace (admin only)
  delete: async (id) => {
    const response = await api.delete(`/workspaces/${id}`);
    return response.data;
  },

  // Get projects in workspace
  getProjects: async (id) => {
    const response = await api.get(`/workspaces/${id}/projects`);
    return response.data;
  },
};
