const { randomUUID } = require('node:crypto');

/** Adds a request ID and logs method, path, response status, and duration after every response. */
function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();
  req.requestId = randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    console.info(JSON.stringify({
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2))
    }));
  });
  next();
}

module.exports = { requestLogger };
