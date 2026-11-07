require('dotenv').config();
const app = require('./app');
const { closePool } = require('./config/database');

const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port.');
const server = app.listen(port, () => console.log(`API listening on port ${port}`));
/** Stops the HTTP server and database pool when the process receives a termination signal. */
async function shutdown() {
  server.close(async () => { await closePool(); process.exit(0); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
