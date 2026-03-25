const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

const databaseConfig = databaseUrl
  ? {
      source: 'DATABASE_URL',
      connectionString: databaseUrl,
      host: 'db',
      port: '5432',
      database: 'goaline',
      user: 'postgres',
    }
  : {
      source: 'local',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '5432',
      database: process.env.DB_NAME || 'GoalLine',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123457698Hh#',
    };

const pool = databaseConfig.connectionString
  ? new Pool({
      connectionString: databaseConfig.connectionString,
    })
  : new Pool({
      host: databaseConfig.host,
      port: Number(databaseConfig.port),
      database: databaseConfig.database,
      user: databaseConfig.user,
      password: databaseConfig.password,
    });

async function query(text, params = []) {
  console.log('[db] Executing query', { text, params });
  return pool.query(text, params);
}

module.exports = {
  databaseConfig,
  pool,
  query,
};

