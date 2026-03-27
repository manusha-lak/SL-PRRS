// api-gateway/index.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(morgan('dev')); // Logs HTTP requests 

// Proxy Routes
// Route traffic intended for Auth Service to Port 3001 
app.use('/api/auth', createProxyMiddleware({ 
    target: 'http://localhost:3001', 
    changeOrigin: true 
}));

// (You will add the other 5 routes here later as your team builds them)

app.get('/', (req, res) => {
    res.send('SL-PRRS API Gateway is running on Port 3000');
});

app.listen(PORT, () => {
    console.log(`[Gateway] API Gateway listening at http://localhost:${PORT}`);
});