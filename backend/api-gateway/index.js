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

// Route traffic intended for Notification Service to Port 3005
app.use('/api/notifications', createProxyMiddleware({
    target: 'http://localhost:3005',
    changeOrigin: true,
    // Forward /api/notifications/* as /* to the notification service.
    pathRewrite: function (path) {
        return path.replace(/^\/api\/notifications/, '');
    },
    // Fix redirect mismatch: notification-service redirects /api-docs -> /api-docs/
    // When accessed via gateway, the redirect should stay under /api/notifications.
    on: {
        proxyRes: (proxyRes) => {
            const location = proxyRes.headers.location;
            if (typeof location === 'string' && location.startsWith('/api-docs')) {
                proxyRes.headers.location = `/api/notifications${location}`;
            }
        }
    }
}));

// (Other services can be added here as your team builds them)

app.get('/', (req, res) => {
    res.send('SL-PRRS API Gateway is running on Port 3000');
});

app.listen(PORT, () => {
    console.log(`[Gateway] API Gateway listening at http://localhost:${PORT}`);
});