require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const caseRoutes = require('./routes/caseRoutes');
const errorHandler = require('./middleware/errorHandler');
const swaggerSpec = require('./docs/swagger');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Case Service root',
  });
});

app.use('/api/cases', caseRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Case Service] running on port ${PORT}`);
});
