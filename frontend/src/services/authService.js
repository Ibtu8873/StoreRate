import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async signup(data) {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updatePassword(currentPassword, newPassword) {
    const response = await api.put('/users/password', { currentPassword, newPassword });
    return response.data;
  }
};
