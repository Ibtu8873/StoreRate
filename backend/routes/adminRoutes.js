const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateUser } = require('../validators/userValidator');
const { validateCreateStore } = require('../validators/storeValidator');

// Protect all /api/admin routes for 'admin' role only
router.use(authenticate, authorize('admin'));

router.get('/dashboard', AdminController.getDashboardStats);
router.post('/users', validateCreateUser, AdminController.createUser);
router.post('/stores', validateCreateStore, AdminController.createStore);
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserDetails);
router.get('/stores', AdminController.getStores);
router.get('/owners', AdminController.getStoreOwners);

module.exports = router;
