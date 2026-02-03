import api from './api.js';

export const projectService = {
  // Get all projects
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  // Get single project
  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Create project (admin only)
  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update project
  update: async (id, updates) => {
    const response = await api.put(`/projects/${id}`, updates);
    return response.data;
  },

  // Delete project (admin only)
  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};
