const StoreModel = require('../models/storeModel');
const RatingModel = require('../models/ratingModel');

class OwnerController {
  /**
   * Helper to get stores belonging to the logged-in owner
   */
  static async getOwnerStore(ownerId, requestedStoreId = null) {
    const stores = await StoreModel.findByOwnerId(ownerId);
    if (!stores || stores.length === 0) {
      return null;
    }

    if (requestedStoreId) {
      const match = stores.find(s => s.id === parseInt(requestedStoreId, 10));
      return match || null;
    }

    return stores[0]; // Primary store
  }

  /**
   * GET /api/owner/store/ratings
   * View list of users who submitted ratings for the store
   */
  static async getStoreRatings(req, res, next) {
    try {
      const ownerId = req.user.id;
      const { storeId } = req.query;

      const store = await OwnerController.getOwnerStore(ownerId, storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'No store registered under this Store Owner account.'
        });
      }

      const ratings = await RatingModel.getRatingsForStore(store.id);

      return res.status(200).json({
        success: true,
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address
        },
        ratingsCount: ratings.length,
        ratings
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/owner/store/average-rating
   * See average rating and summary statistics of the store
   */
  static async getStoreAverageRating(req, res, next) {
    try {
      const ownerId = req.user.id;
      const { storeId } = req.query;

      const allOwnerStores = await StoreModel.findByOwnerId(ownerId);
      if (!allOwnerStores || allOwnerStores.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No store registered under this Store Owner account.'
        });
      }

      const selectedStore = requestedStore(allOwnerStores, storeId);
      const ratingStats = await RatingModel.getAverageForStore(selectedStore.id);

      return res.status(200).json({
        success: true,
        store: {
          id: selectedStore.id,
          name: selectedStore.name,
          email: selectedStore.email,
          address: selectedStore.address,
          created_at: selectedStore.created_at
        },
        allStores: allOwnerStores.map(s => ({ id: s.id, name: s.name })),
        averageRating: ratingStats.averageRating,
        totalRatings: ratingStats.totalRatings,
        distribution: ratingStats.distribution
      });
    } catch (err) {
      next(err);
    }
  }
}

function requestedStore(stores, storeId) {
  if (storeId) {
    const found = stores.find(s => s.id === parseInt(storeId, 10));
    if (found) return found;
  }
  return stores[0];
}

module.exports = OwnerController;
