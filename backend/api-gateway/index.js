// api-gateway/index.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');

const createServiceProxy = (servicePrefix, target) =>
    createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: (path) => `${servicePrefix}${path === '/' ? '' : path}`
    });

const createApp = () => {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(morgan('dev'));

    // Proxy Routes
    app.use('/api/auth', createServiceProxy('/api/auth', 'http://localhost:3001'));

    app.use('/api/stations', createServiceProxy('/api/stations', 'http://localhost:3004'));

    // (You will add the other 4 routes here later as your team builds them)

    app.get('/', (req, res) => {
        res.send('SL-PRRS API Gateway is running on Port 3000');
    });

    return app;
};

if (require.main === module) {
    const PORT = Number(process.env.PORT) || 3000;
    const app = createApp();

    app.listen(PORT, () => {
        console.log(`[Gateway] API Gateway listening at http://localhost:${PORT}`);
    });
}

module.exports = createApp;
