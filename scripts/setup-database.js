require('dotenv').config();
const fs = require('node:fs/promises');
const path = require('node:path');
const sql = require('mssql');
const { config, requiredEnvironment } = require('../src/config/database');

/** Reads and executes a single SQL migration file. */
async function executeFile(pool, filename) {
  const contents = await fs.readFile(path.join(__dirname, '..', 'database', filename), 'utf8');
  await pool.request().batch(contents);
  console.log(`Applied ${filename}`);
}

/** Escapes a configured SQL Server identifier before using it in database-creation SQL. */
function quoteIdentifier(identifier) {
  return `[${identifier.replace(/]/g, ']]')}]`;
}

/** Creates the configured database when needed and applies schema, seed, and procedure scripts. */
async function setup() {
  const databaseName = config.database;
  const adminDatabase = requiredEnvironment('DB_ADMIN_NAME');
  const masterPool = await new sql.ConnectionPool({ ...config, database: adminDatabase }).connect();
  await masterPool.request().query(`IF DB_ID(N'${databaseName.replace(/'/g, "''")}') IS NULL CREATE DATABASE ${quoteIdentifier(databaseName)};`);
  await masterPool.close();

  const databasePool = await new sql.ConnectionPool(config).connect();
  await executeFile(databasePool, 'schema.sql');
  await executeFile(databasePool, 'seed.sql');
  await executeFile(databasePool, 'book-appointment.sql');
  await databasePool.close();
  console.log('Database setup complete.');
}

setup().catch(error => { console.error(error); process.exitCode = 1; });
