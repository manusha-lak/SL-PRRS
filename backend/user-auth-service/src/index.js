require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const swaggerUi = require('swagger-ui-express');

const { initDb }      = require('./db/supabase');
const authRoutes      = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const swaggerSpec     = require('./docs/swagger');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── Swagger UI ──────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// ── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────────────────────
async function start() {
  await initDb(); // verify Supabase connection before accepting traffic

  app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║       SL-PRRS  Auth Service              ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Running on  : http://localhost:${PORT}      ║`);
    console.log(`║  Swagger UI  : http://localhost:${PORT}/api-docs ║`);
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
  });
}

start();
