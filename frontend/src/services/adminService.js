import api from './api';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async getUserDetails(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async createUser(data) {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  async getStores(params = {}) {
    const response = await api.get('/admin/stores', { params });
    return response.data;
  },

  async createStore(data) {
    const response = await api.post('/admin/stores', data);
    return response.data;
  },

  async getStoreOwners() {
    const response = await api.get('/admin/owners');
    return response.data;
  }
};
