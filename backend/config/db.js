const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'ratehub_db';

let dbClient = null;
let dbType = 'mysql'; // 'mysql' | 'sqlite'

async function initDatabase() {
  try {
    // 1. Try MySQL connection first
    console.log(`[Database] Attempting connection to MySQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);
    
    // Attempt connection without database first to ensure database exists
    const rootConnection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      connectTimeout: 3000
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await rootConnection.end();

    const pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test query
    const [rows] = await pool.query('SELECT 1 + 1 AS test');
    console.log(`[Database] Successfully connected to MySQL database "${DB_NAME}".`);
    
    dbType = 'mysql';
    dbClient = {
      type: 'mysql',
      query: async (sql, params = []) => {
        return pool.query(sql, params);
      },
      execute: async (sql, params = []) => {
        return pool.execute(sql, params);
      },
      rawPool: pool
    };

    return dbClient;
  } catch (err) {
    console.warn(`[Database Warning] MySQL connection failed (${err.code || err.message}).`);
    console.log(`[Database] Activating integrated SQLite storage mode for zero-configuration local execution...`);
    
    // SQLite Fallback
    const dbDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbFilePath = path.join(dbDir, 'ratehub.sqlite');
    const sqliteDb = new sqlite3.Database(dbFilePath);

    dbType = 'sqlite';
    dbClient = {
      type: 'sqlite',
      query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
          const trimmedSql = sql.trim();
          const isSelect = /^SELECT/i.test(trimmedSql) || /^PRAGMA/i.test(trimmedSql);

          if (isSelect) {
            sqliteDb.all(sql, params, (err, rows) => {
              if (err) return reject(err);
              resolve([rows || [], null]);
            });
          } else {
            sqliteDb.run(sql, params, function (err) {
              if (err) return reject(err);
              resolve([{ insertId: this.lastID, affectedRows: this.changes }, null]);
            });
          }
        });
      },
      execute: (sql, params = []) => {
        return dbClient.query(sql, params);
      },
      rawDb: sqliteDb
    };

    console.log(`[Database] SQLite database active at: ${dbFilePath}`);
    return dbClient;
  }
}

// Wrapper query function
async function query(sql, params = []) {
  if (!dbClient) {
    await initDatabase();
  }
  return dbClient.query(sql, params);
}

function getDbType() {
  return dbType;
}

module.exports = {
  initDatabase,
  query,
  getDbType,
  get client() {
    return dbClient;
  }
};
