const db = require('../config/db');

class UserModel {
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create({ name, email, password, address, role = 'user' }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), password, address.trim(), role]
    );
    return result.insertId;
  }

  static async updatePassword(id, hashedPassword) {
    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }

  static async countAll() {
    const [rows] = await db.query('SELECT COUNT(*) AS total FROM users');
    return rows[0].total || rows[0]['COUNT(*)'] || 0;
  }

  static async findStoreOwners() {
    const [rows] = await db.query(
      'SELECT id, name, email FROM users WHERE role = "owner" ORDER BY name ASC'
    );
    return rows;
  }

  /**
   * Find users with optional filters and sorting for administrator.
   * If a user is a store owner, calculates the average rating of their store(s).
   */
  static async findAll({ search, name, email, address, role, sortBy = 'created_at', sortOrder = 'DESC' } = {}) {
    let sql = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at, 
        u.updated_at,
        ROUND(AVG(r.rating), 1) AS store_rating,
        COUNT(DISTINCT r.id) AS store_rating_count,
        GROUP_CONCAT(DISTINCT s.name) AS store_names
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== '') {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (name && name.trim() !== '') {
      sql += ' AND u.name LIKE ?';
      params.push(`%${name.trim()}%`);
    }

    if (email && email.trim() !== '') {
      sql += ' AND u.email LIKE ?';
      params.push(`%${email.trim()}%`);
    }

    if (address && address.trim() !== '') {
      sql += ' AND u.address LIKE ?';
      params.push(`%${address.trim()}%`);
    }

    if (role && role.trim() !== '') {
      sql += ' AND u.role = ?';
      params.push(role.trim());
    }

    sql += ' GROUP BY u.id';

    // Safe sorting whitelist
    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      created_at: 'u.created_at',
      rating: 'store_rating'
    };

    const sortColumn = allowedSortFields[sortBy] || 'u.created_at';
    const orderDirection = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${sortColumn} ${orderDirection}, u.id DESC`;

    const [rows] = await db.query(sql, params);
    return rows;
  }

  /**
   * Get comprehensive details for a user (used by Admin View Details)
   */
  static async getDetails(id) {
    const user = await this.findById(id);
    if (!user) return null;

    let extra = {};
    if (user.role === 'owner') {
      const [stores] = await db.query(`
        SELECT 
          s.id, 
          s.name, 
          s.email, 
          s.address, 
          s.created_at,
          ROUND(AVG(r.rating), 1) AS average_rating,
          COUNT(r.id) AS total_ratings
        FROM stores s
        LEFT JOIN ratings r ON r.store_id = s.id
        WHERE s.owner_id = ?
        GROUP BY s.id
      `, [id]);
      extra.stores = stores;
    } else if (user.role === 'user') {
      const [ratings] = await db.query(`
        SELECT 
          r.id, 
          r.rating, 
          r.created_at, 
          r.updated_at,
          s.id AS store_id, 
          s.name AS store_name, 
          s.address AS store_address
        FROM ratings r
        JOIN stores s ON s.id = r.store_id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `, [id]);
      extra.submittedRatings = ratings;
    }

    return { ...user, ...extra };
  }
}

module.exports = UserModel;
