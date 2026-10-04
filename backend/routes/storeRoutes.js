const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/storeController');
const { optionalAuth, authenticate, authorize } = require('../middleware/auth');
const { validateRating } = require('../validators/storeValidator');

// GET /api/stores (Search by name and address, optional auth to include current user's rating)
router.get('/', optionalAuth, StoreController.getStores);

// POST /api/stores/:storeId/ratings (Only normal users can submit ratings)
router.post('/:storeId/ratings', authenticate, authorize('user'), validateRating, StoreController.submitRating);

// PUT /api/stores/:storeId/ratings (Only normal users can modify ratings)
router.put('/:storeId/ratings', authenticate, authorize('user'), validateRating, StoreController.modifyRating);

module.exports = router;
