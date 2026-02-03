import api from './api.js';

export const authService = {
  // Register new user (admin only)
  register: async (email, password, name, roles = ['client']) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
      roles: Array.isArray(roles) ? roles : [roles],
    });
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user from API
  getMe: async () => {
    const response = await api.get('/auth/me');
    // Update localStorage with latest user data
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async (password) => {
    try {
      const response = await api.post('/auth/account/delete', { password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
