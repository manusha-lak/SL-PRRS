const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SL-PRRS Auth Service API',
      version: '1.0.0',
      description:
        'Authentication microservice for the Sri Lanka Police Rapid Report System (SL-PRRS). Handles user registration, login, JWT issuance, and token verification.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Direct service access',
      },
      {
        url: 'http://localhost:3000',
        description: 'Via API Gateway',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name:     { type: 'string', example: 'Kamal Perera' },
            email:    { type: 'string', format: 'email', example: 'kamal@example.lk' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
            role:     { type: 'string', enum: ['citizen', 'officer'], example: 'citizen' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'citizen@slprs.lk' },
            password: { type: 'string', example: 'Demo@1234' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid' },
            name:       { type: 'string' },
            email:      { type: 'string' },
            role:       { type: 'string', enum: ['citizen', 'officer'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data:    { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors:  { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
