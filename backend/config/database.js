// backend/config/database.js
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'travel_tourism_db',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// promise wrapper
const promisePool = pool.promise();

// test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err.message || err);
    return;
  }
  console.log('✅ MySQL Database connected successfully');
  connection.release();
});

module.exports = promisePool;
