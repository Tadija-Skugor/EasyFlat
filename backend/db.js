// db.js
require('dotenv').config();
const { Pool } = require('pg');

// Create a new instance of Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432, // default PostgreSQL port
});

// Test the database connection
pool.connect()
  .then(() => {
    console.log('Connected to the database successfully.');
  })
  .catch((err) => {
    console.error('Database connection error:', err.stack);
  });

// Export the pool
module.exports = pool;
