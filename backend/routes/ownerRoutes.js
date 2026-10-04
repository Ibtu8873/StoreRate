const express = require('express');
const router = express.Router();
const OwnerController = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all /api/owner routes for 'owner' role only
router.use(authenticate, authorize('owner'));

router.get('/store/ratings', OwnerController.getStoreRatings);
router.get('/store/average-rating', OwnerController.getStoreAverageRating);

module.exports = router;
