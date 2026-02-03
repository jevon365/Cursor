import api from './api.js';

export const userService = {
  // Get all users (admin only)
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Update user roles (admin only)
  updateRoles: async (userId, roles) => {
    const response = await api.put(`/users/${userId}/roles`, { roles });
    return response.data;
  },
};
