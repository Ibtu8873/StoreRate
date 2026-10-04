import api from './api';

export const storeService = {
  async getStores(params = {}) {
    const response = await api.get('/stores', { params });
    return response.data;
  },

  async submitRating(storeId, rating) {
    const response = await api.post(`/stores/${storeId}/ratings`, { rating });
    return response.data;
  },

  async modifyRating(storeId, rating) {
    const response = await api.put(`/stores/${storeId}/ratings`, { rating });
    return response.data;
  }
};
