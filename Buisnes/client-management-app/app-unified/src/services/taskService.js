import api from './api.js';

export const taskService = {
  // Get all tasks
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.project_id) params.append('project_id', filters.project_id);
    if (filters.request_id) params.append('request_id', filters.request_id);
    if (filters.assignee_id) params.append('assignee_id', filters.assignee_id);
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  // Get single task
  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create task (admin only)
  create: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task (admin only)
  update: async (id, updates) => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },

  // Delete task (admin only)
  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Update task status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Assign task to user
  assign: async (id, assignee_id) => {
    const response = await api.patch(`/tasks/${id}/assignee`, { assignee_id });
    return response.data;
  },
};
