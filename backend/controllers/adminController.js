const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const StoreModel = require('../models/storeModel');
const RatingModel = require('../models/ratingModel');

class AdminController {
  /**
   * GET /api/admin/dashboard
   * Summary metrics: totalUsers, totalStores, totalRatings
   */
  static async getDashboardStats(req, res, next) {
    try {
      const [totalUsers, totalStores, totalRatings] = await Promise.all([
        UserModel.countAll(),
        StoreModel.countAll(),
        RatingModel.countAll()
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalStores,
          totalRatings
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/users
   * Admin can create Admin, Normal User, or Store Owner
   */
  static async createUser(req, res, next) {
    try {
      const { name, email, password, address, role } = req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email address already exists.',
          errors: { email: 'Email address is already in use.' }
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        address,
        role
      });

      const newUser = await UserModel.findById(userId);
      return res.status(201).json({
        success: true,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully.`,
        user: newUser
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/stores
   * Admin can add a new store
   */
  static async createStore(req, res, next) {
    try {
      const { name, email, address, owner_id } = req.body;

      // Verify owner exists and has role 'owner'
      const owner = await UserModel.findById(owner_id);
      if (!owner) {
        return res.status(400).json({
          success: false,
          message: 'Selected store owner does not exist.',
          errors: { owner_id: 'Invalid owner ID.' }
        });
      }

      if (owner.role !== 'owner') {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is not registered as a Store Owner.',
          errors: { owner_id: 'User must have the role "owner".' }
        });
      }

      const storeId = await StoreModel.create({
        name,
        email,
        address,
        owner_id
      });

      const newStore = await StoreModel.findById(storeId);
      return res.status(201).json({
        success: true,
        message: 'Store created successfully.',
        store: newStore
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/users
   * User listing with filtering and sorting
   * Displays Store Owner's store rating if role is 'owner'
   */
  static async getUsers(req, res, next) {
    try {
      const { search, name, email, address, role, sortBy, sortOrder } = req.query;

      const users = await UserModel.findAll({
        search,
        name,
        email,
        address,
        role,
        sortBy,
        sortOrder
      });

      return res.status(200).json({
        success: true,
        count: users.length,
        users
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/users/:id
   * Detailed view of a user
   */
  static async getUserDetails(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserModel.getDetails(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      return res.status(200).json({
        success: true,
        user
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/stores
   * Store listing with filtering and sorting
   */
  static async getStores(req, res, next) {
    try {
      const { search, name, email, address, sortBy, sortOrder } = req.query;

      const stores = await StoreModel.findAll({
        search,
        name,
        email,
        address,
        sortBy,
        sortOrder
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
   * GET /api/admin/owners
   * Retrieve list of store owners for dropdown selection
   */
  static async getStoreOwners(req, res, next) {
    try {
      const owners = await UserModel.findStoreOwners();
      return res.status(200).json({
        success: true,
        owners
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
