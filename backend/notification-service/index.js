// backend/notification-service/index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const notificationsRouter = require('./routes/notifications');
const swaggerSpec = require('./swagger/swagger');

// Ensure JSON persistence directories exist early (best-effort).
require('./db/database');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Native Swagger URL (assignment requirement).
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notificationsRouter);

app.get('/', (req, res) => {
  res.send('SL-PRRS Notification Service is running');
});

app.listen(PORT, () => {
  console.log(`[Notification Service] running on port ${PORT}`);
});

