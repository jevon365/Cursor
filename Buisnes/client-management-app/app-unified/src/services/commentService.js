import api from './api.js';

export const commentService = {
  getComments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.request_id) params.append('request_id', filters.request_id);
    if (filters.project_id) params.append('project_id', filters.project_id);
    if (filters.task_id) params.append('task_id', filters.task_id);
    const response = await api.get(`/comments?${params.toString()}`);
    return response.data;
  },
  create: async (commentData) => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },
  update: async (id, content) => {
    const response = await api.put(`/comments/${id}`, { content });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
};
