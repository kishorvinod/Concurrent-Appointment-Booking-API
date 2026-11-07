const swaggerJsdoc = require('swagger-jsdoc');

/** Builds the OpenAPI document from annotations maintained beside the route implementation. */
function createSwaggerDocument() {
  return swaggerJsdoc({
    definition: {
      openapi: '3.0.3',
      info: { title: 'Concurrent Appointment Booking API', version: '1.0.0' },
      servers: [{ url: process.env.API_BASE_URL }]
    },
    apis: ['./src/routes/*.js']
  });
}

module.exports = { createSwaggerDocument };
