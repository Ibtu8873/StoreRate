const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

class AuthController {
  /**
   * POST /api/auth/signup
   * Normal user self-registration
   */
  static async signup(req, res, next) {
    try {
      const { name, email, password, address } = req.body;

      // Check if email already registered
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
          errors: { email: 'Email address is already in use.' }
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with default role 'user'
      const userId = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        address,
        role: 'user'
      });

      const user = await UserModel.findById(userId);
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/login
   * Common login for all roles (admin, user, owner)
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const token = generateToken(user);

      // Return sanitized user object
      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: safeUser
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/me
   */
  static async getMe(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/users/password
   * Common password update for authenticated user
   */
  static async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get user with password
      const user = await UserModel.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.'
        });
      }

      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match.',
          errors: { currentPassword: 'The current password provided is incorrect.' }
        });
      }

      // Hash and update new password
      const hashedNew = await bcrypt.hash(newPassword, 10);
      await UserModel.updatePassword(userId, hashedNew);

      return res.status(200).json({
        success: true,
        message: 'Password has been updated successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
