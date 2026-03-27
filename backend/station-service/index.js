require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

require('./db/database');

const stationRoutes = require('./routes/stationRoutes');
const createSwaggerSpec = require('./docs/swagger');

const createApp = (port = Number(process.env.PORT) || 3004) => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Station Service is running',
      data: {
        service: 'station-service',
        port,
        docs: `/api/stations/api-docs`,
      },
    });
  });

  app.use(
    '/api/stations/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(createSwaggerSpec(port), {
      explorer: true,
    })
  );

  app.use('/api/stations', stationRoutes);

  app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const errors = Array.isArray(err.details) ? err.details : undefined;

    if (status >= 500) {
      console.error('[Station Service] Unhandled error:', err);
    }

    res.status(status).json({
      success: false,
      message,
      ...(errors ? { errors } : {}),
    });
  });

  return app;
};

if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3004;
  const app = createApp(PORT);

  app.listen(PORT, () => {
    console.log(`[Station Service] running on port ${PORT}`);
    console.log(`[Station Service] Swagger UI available at http://localhost:${PORT}/api/stations/api-docs`);
  });
}

module.exports = createApp;
