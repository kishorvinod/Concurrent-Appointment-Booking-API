const sql = require('mssql');

/** Returns a required environment setting and fails early with an actionable error. */
function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/** Converts a required environment setting into a valid TCP port number. */
function requiredPort(name) {
  const port = Number(requiredEnvironment(name));
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`${name} must be a valid TCP port.`);
  return port;
}

/** Converts a required environment setting into a valid positive integer. */
function requiredPositiveInteger(name) {
  const value = Number(requiredEnvironment(name));
  if (!Number.isInteger(value) || value < 1) throw new Error(`${name} must be a positive integer.`);
  return value;
}

/** Creates the database configuration exclusively from environment variables. */
const config = {
  server: requiredEnvironment('DB_SERVER'),
  port: requiredPort('DB_PORT'),
  database: requiredEnvironment('DB_NAME'),
  user: requiredEnvironment('DB_USER'),
  password: requiredEnvironment('DB_PASSWORD'),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false'
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

let pool;

/** Opens, or returns, the shared SQL Server connection pool. */
async function getPool() {
  if (!pool) pool = await new sql.ConnectionPool(config).connect();
  return pool;
}

/** Gracefully closes the shared SQL Server connection pool. */
async function closePool() {
  if (pool) await pool.close();
  pool = undefined;
}

module.exports = { sql, getPool, closePool, config, requiredEnvironment, requiredPort, requiredPositiveInteger };
