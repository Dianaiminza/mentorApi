const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
        title: 'Mentorship API',
        version: '1.0.0',
        description: 'API for Mentorship Application'
    },
    servers: [
        {
            url: process.env.BASE_URL || 'http://localhost:5000',
        }
    ]
},
apis: ['index.js'] // Path to the API routes
};
const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;