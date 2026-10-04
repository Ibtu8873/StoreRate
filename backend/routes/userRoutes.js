const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validatePasswordUpdate } = require('../validators/authValidator');
const { authenticate } = require('../middleware/auth');

// PUT /api/users/password (authenticated user updates their own password)
router.put('/password', authenticate, validatePasswordUpdate, AuthController.updatePassword);

module.exports = router;
