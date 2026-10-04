import api from './api';

export const ownerService = {
  async getStoreRatings(storeId = null) {
    const params = storeId ? { storeId } : {};
    const response = await api.get('/owner/store/ratings', { params });
    return response.data;
  },

  async getStoreAverageRating(storeId = null) {
    const params = storeId ? { storeId } : {};
    const response = await api.get('/owner/store/average-rating', { params });
    return response.data;
  }
};
