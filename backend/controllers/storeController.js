const StoreModel = require('../models/storeModel');
const RatingModel = require('../models/ratingModel');

class StoreController {
  /**
   * GET /api/stores
   * Store listing for Normal Users (and visitors).
   * Supports search by name, search by address, sorting.
   * Attaches user's own submitted rating if authenticated.
   */
  static async getStores(req, res, next) {
    try {
      const { search, name, address, sortBy, sortOrder } = req.query;
      const currentUserId = req.user ? req.user.id : null;

      const stores = await StoreModel.findAll({
        search,
        name,
        address,
        sortBy,
        sortOrder,
        currentUserId
      });

      return res.status(200).json({
        success: true,
        count: stores.length,
        stores
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/stores/:storeId/ratings
   * Submit a rating (1-5) for a store.
   * If user already rated, updates the rating instead of duplicating.
   */
  static async submitRating(req, res, next) {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const { rating } = req.body;
      const userId = req.user.id;

      // Verify store exists
      const store = await StoreModel.findById(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found.'
        });
      }

      const result = await RatingModel.upsert({
        user_id: userId,
        store_id: storeId,
        rating
      });

      // Get updated store overall rating
      const updatedStore = await StoreModel.findById(storeId);

      return res.status(200).json({
        success: true,
        message: result.isNew ? 'Rating submitted successfully.' : 'Rating updated successfully.',
        rating: result.rating,
        isNew: result.isNew,
        overallRating: updatedStore.overall_rating,
        totalRatings: updatedStore.total_ratings
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/stores/:storeId/ratings
   * Modify an existing rating.
   */
  static async modifyRating(req, res, next) {
    return StoreController.submitRating(req, res, next);
  }
}

module.exports = StoreController;
