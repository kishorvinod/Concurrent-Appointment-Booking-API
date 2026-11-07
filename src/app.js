const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const appointments = require('./routes/appointments');
const { createSwaggerDocument } = require('./swagger');
const { requiredEnvironment } = require('./config/database');
const { requestLogger } = require('./middleware/request-logger');
const { createRateLimiter } = require('./middleware/rate-limit');

const app = express();
app.disable('x-powered-by');
app.use(requestLogger);
app.use(cors({ origin: requiredEnvironment('CORS_ORIGIN') }));
app.use(createRateLimiter());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(createSwaggerDocument()));
app.use('/api/appointments', appointments);
/** Maps known business failures and unexpected errors to safe HTTP responses. */
app.use((error, _req, res, _next) => {
  if (error.status) return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  console.error('Unhandled error:', error);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
});

module.exports = app;
