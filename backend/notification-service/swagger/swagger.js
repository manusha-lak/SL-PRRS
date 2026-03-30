// backend/notification-service/swagger/swagger.js
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SL-PRRS Notification Service API',
      version: '1.0.0'
    },
    servers: [
      { url: 'http://localhost:3005' }
    ]
  },
  apis: [path.join(__dirname, '../routes/*.js')]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

