const db = require('../config/db');

class StoreModel {
  static async create({ name, email, address, owner_id }) {
    const [result] = await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), address.trim(), owner_id]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id, 
        s.created_at, 
        s.updated_at,
        u.name AS owner_name,
        u.email AS owner_email,
        ROUND(AVG(r.rating), 1) AS overall_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      JOIN users u ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.id = ?
      GROUP BY s.id
    `, [id]);
    return rows[0] || null;
  }

  static async findByOwnerId(owner_id) {
    const [rows] = await db.query(`
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.created_at, 
        s.updated_at,
        ROUND(AVG(r.rating), 1) AS overall_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.owner_id = ?
      GROUP BY s.id
      ORDER BY s.id ASC
    `, [owner_id]);
    return rows;
  }

  static async countAll() {
    const [rows] = await db.query('SELECT COUNT(*) AS total FROM stores');
    return rows[0].total || rows[0]['COUNT(*)'] || 0;
  }

  /**
   * Find stores with search/filters and sorting.
   * Also attaches userSubmittedRating if currentUserId is supplied.
   */
  static async findAll({ search, name, address, email, sortBy = 'name', sortOrder = 'ASC', currentUserId = null } = {}) {
    let sql = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id, 
        s.created_at, 
        s.updated_at,
        u.name AS owner_name,
        ROUND(AVG(r.rating), 1) AS overall_rating,
        COUNT(DISTINCT r.id) AS total_ratings
    `;

    const params = [];

    if (currentUserId) {
      sql += `, user_rate.rating AS user_submitted_rating, user_rate.updated_at AS user_rated_at `;
    }

    sql += `
      FROM stores s
      JOIN users u ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
    `;

    if (currentUserId) {
      sql += ` LEFT JOIN ratings user_rate ON user_rate.store_id = s.id AND user_rate.user_id = ? `;
      params.push(currentUserId);
    }

    sql += ' WHERE 1=1 ';

    // General search across name and address
    if (search && search.trim() !== '') {
      sql += ' AND (s.name LIKE ? OR s.address LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    // Specific filter by name
    if (name && name.trim() !== '') {
      sql += ' AND s.name LIKE ?';
      params.push(`%${name.trim()}%`);
    }

    // Specific filter by address
    if (address && address.trim() !== '') {
      sql += ' AND s.address LIKE ?';
      params.push(`%${address.trim()}%`);
    }

    // Specific filter by email
    if (email && email.trim() !== '') {
      sql += ' AND s.email LIKE ?';
      params.push(`%${email.trim()}%`);
    }

    sql += ' GROUP BY s.id';

    // Safe sorting whitelist
    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      created_at: 's.created_at',
      rating: 'overall_rating'
    };

    const sortColumn = allowedSortFields[sortBy] || 's.name';
    const orderDirection = sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${sortColumn} ${orderDirection}, s.id ASC`;

    const [rows] = await db.query(sql, params);
    return rows;
  }
}

module.exports = StoreModel;
