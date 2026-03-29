// ─────────────────────────────────────────────
//  config/db.js  –  MySQL connection pool
//  Uses the 'mysql2' library + credentials from .env
// ─────────────────────────────────────────────

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool (reuses connections instead of opening a new one each time)
const pool = mysql.createPool({
  host:            process.env.DB_HOST,      // e.g. localhost
  port:            process.env.DB_PORT,      // e.g. 3306
  database:        process.env.DB_NAME,      // your database name in phpMyAdmin
  user:            process.env.DB_USER,      // your phpMyAdmin username
  password:        process.env.DB_PASSWORD,  // your phpMyAdmin password
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
