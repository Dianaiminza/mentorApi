const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mentor API',
      version: '1.0.0',
      description: 'API documentation for Mentor API application',
    },
  },
  apis: ['./index.js'], // Path to the API routes
};
const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;