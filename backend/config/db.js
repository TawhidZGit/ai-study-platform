const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Better connection handling
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    return;
  }
  console.log('✅ Database connected successfully');
  release();
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message);
  // Don't exit, just log it
});

module.exports = pool;