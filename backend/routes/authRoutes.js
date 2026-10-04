const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../validators/authValidator');
const { authenticate } = require('../middleware/auth');

router.post('/signup', validateSignup, AuthController.signup);
router.post('/login', validateLogin, AuthController.login);
router.get('/me', authenticate, AuthController.getMe);

module.exports = router;
