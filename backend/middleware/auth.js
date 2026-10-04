const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'ratehub_jwt_super_secret_key_default';

/**
 * Middleware to authenticate JWT token.
 * Populates req.user.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired or is invalid. Please log in again.'
      });
    }

    // Verify user exists in database
    const [rows] = await db.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
}

/**
 * Optional authentication:
 * Decodes user if token provided, but doesn't block if missing.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [rows] = await db.query(
          'SELECT id, name, email, address, role FROM users WHERE id = ?',
          [decoded.id]
        );
        if (rows && rows.length > 0) {
          req.user = rows[0];
        }
      } catch (e) {
        // Ignore invalid token in optional auth
      }
    }
    next();
  } catch (err) {
    next();
  }
}

/**
 * Middleware to restrict access based on roles.
 * @param  {...string} roles Allowed roles ('admin', 'user', 'owner')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  JWT_SECRET
};
