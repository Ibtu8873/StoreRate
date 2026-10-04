const db = require('../config/db');

class RatingModel {
  static async upsert({ user_id, store_id, rating }) {
    // Check if rating already exists
    const [existing] = await db.query(
      'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [user_id, store_id]
    );

    if (existing && existing.length > 0) {
      await db.query(
        'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [rating, existing[0].id]
      );
      return { id: existing[0].id, isNew: false, rating };
    } else {
      const [result] = await db.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [user_id, store_id, rating]
      );
      return { id: result.insertId, isNew: true, rating };
    }
  }

  static async findByUserAndStore(user_id, store_id) {
    const [rows] = await db.query(
      'SELECT id, user_id, store_id, rating, created_at, updated_at FROM ratings WHERE user_id = ? AND store_id = ?',
      [user_id, store_id]
    );
    return rows[0] || null;
  }

  static async countAll() {
    const [rows] = await db.query('SELECT COUNT(*) AS total FROM ratings');
    return rows[0].total || rows[0]['COUNT(*)'] || 0;
  }

  /**
   * Get all rating submissions for a store (Store Owner View).
   * Shows user name, user email, rating, and timestamp.
   */
  static async getRatingsForStore(storeId) {
    const [rows] = await db.query(`
      SELECT 
        r.id, 
        r.rating, 
        r.created_at, 
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ?
      ORDER BY r.updated_at DESC
    `, [storeId]);
    return rows;
  }

  /**
   * Get summary rating statistics for a store.
   */
  static async getAverageForStore(storeId) {
    const [summaryRows] = await db.query(`
      SELECT 
        ROUND(AVG(rating), 1) AS average_rating,
        COUNT(id) AS total_ratings
      FROM ratings
      WHERE store_id = ?
    `, [storeId]);

    const [distributionRows] = await db.query(`
      SELECT rating, COUNT(id) AS count
      FROM ratings
      WHERE store_id = ?
      GROUP BY rating
      ORDER BY rating DESC
    `, [storeId]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distributionRows.forEach(row => {
      distribution[row.rating] = row.count;
    });

    return {
      averageRating: summaryRows[0]?.average_rating !== null ? Number(summaryRows[0]?.average_rating) : 0,
      totalRatings: summaryRows[0]?.total_ratings ? Number(summaryRows[0]?.total_ratings) : 0,
      distribution
    };
  }
}

module.exports = RatingModel;
