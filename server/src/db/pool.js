const { Pool, types } = require('pg');
const { getConfig } = require('../config');

const POSTGRES_DATE_OID = 1082;

types.setTypeParser(POSTGRES_DATE_OID, (value) => value);

let pool;

function createPool(config = getConfig()) {
  return new Pool({
    connectionString: config.databaseUrl,
    ssl: config.databaseUrl && config.databaseUrl.includes('supabase.com')
      ? { rejectUnauthorized: false }
      : undefined
  });
}

function getPool() {
  if (!pool) {
    pool = createPool();
  }

  return pool;
}

async function query(text, params) {
  return getPool().query(text, params);
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = {
  createPool,
  getPool,
  query,
  closePool
};
