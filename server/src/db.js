const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD
});

pool.on('connect', () => {
  console.log('[db] PostgreSQL pool connected');
});

pool.on('error', (error) => {
  console.error('[db] Unexpected PostgreSQL pool error:', error);
});

async function query(text, params = []) {
  console.log('[db] Executing query', {
    text: text.replace(/\s+/g, ' ').trim(),
    params
  });

  return pool.query(text, params);
}

module.exports = {
  pool,
  query
};
