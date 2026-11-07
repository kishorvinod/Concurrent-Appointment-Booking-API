const rateLimit = require('express-rate-limit');
const { requiredPositiveInteger } = require('../config/database');

/** Creates the configurable IP-based request limiter used by all API routes. */
function createRateLimiter() {
  return rateLimit({
    windowMs: requiredPositiveInteger('RATE_LIMIT_WINDOW_MS'),
    limit: requiredPositiveInteger('RATE_LIMIT_MAX_REQUESTS'),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } }
  });
}

module.exports = { createRateLimiter };
