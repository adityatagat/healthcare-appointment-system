require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Import security configurations and middleware
const securityConfig = require('./config/security');
const { validateApiKey, requireAdmin } = require('./middleware/auth');
const { rateLimiterMiddleware } = require('./middleware/rateLimit');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;
const isProduction = process.env.NODE_ENV === 'production';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Security middleware
app.use(helmet(securityConfig.securityHeaders));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', securityConfig.apiKeys.headerName],
  credentials: true
}));

// Request logging
app.use(logger.requestLogger);

// Rate limiting
app.use(rateLimiterMiddleware);

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Service routes configuration
const services = {
  // Public routes
  '/public/health': 'http://user-service:3001/health',
  
  // Protected routes (API key required)
  '/api/users': 'http://user-service:3001',
  '/api/appointments': 'http://appointment-service:3002',
  '/api/providers': 'http://provider-service:3003',
  '/api/medical-records': 'http://medical-records-service:3004',
  '/api/notifications': 'http://notification-service:3005',
  '/api/billing': 'http://billing-service:3006',
  
  // Admin routes (admin API key required)
  '/admin/analytics': 'http://analytics-service:3007'
};

// Apply API key validation to protected routes
app.use((req, res, next) => {
  if (req.path.startsWith('/public/') || req.path === '/health') {
    return next();
  }
  if (req.method === 'OPTIONS') {
    return next();
  }
  validateApiKey(req, res, next);
});

// Set up proxy for each service
Object.entries(services).forEach(([route, target]) => {
  const proxyOptions = {
    target,
    changeOrigin: true,
    pathRewrite: { [`^${route}`]: '' },
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader('X-Forwarded-For', req.ip);
      proxyReq.setHeader('X-Real-IP', req.ip);
      
      const apiKey = req.headers[securityConfig.apiKeys.headerName.toLowerCase()];
      if (apiKey) {
        proxyReq.setHeader('X-API-Key', apiKey);
      }
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error: ${err.message}`, {
        path: req.path,
        method: req.method,
        error: err.stack
      });
      
      if (!res.headersSent) {
        res.status(502).json({ 
          error: 'Bad Gateway',
          message: 'Unable to connect to the service',
          ...(!isProduction && { details: err.message })
        });
      }
    }
  };
  
  // Apply admin middleware for admin routes
  if (route.startsWith('/admin/')) {
    app.use(route, requireAdmin, createProxyMiddleware(proxyOptions));
  } else {
    app.use(route, createProxyMiddleware(proxyOptions));
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  const statusCode = err.statusCode || 500;
  const response = {
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  };
  
  if (!isProduction) {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
});

// Start server with HTTPS if configured
const startServer = () => {
  if (securityConfig.https.enabled) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(securityConfig.https.options.key),
        cert: fs.readFileSync(securityConfig.https.options.cert),
        minVersion: securityConfig.https.options.minVersion,
        ciphers: securityConfig.https.options.ciphers,
        honorCipherOrder: securityConfig.https.options.honorCipherOrder
      };
      
      const httpsServer = https.createServer(httpsOptions, app);
      httpsServer.listen(PORT, () => {
        logger.info(`HTTPS Server running on port ${PORT}`);
        console.log(`HTTPS Server running on https://localhost:${PORT}`);
      });
      return httpsServer;
    } catch (error) {
      logger.error('Failed to start HTTPS server', { error: error.message });
      process.exit(1);
    }
  } else {
    const server = app.listen(PORT, () => {
      logger.info(`HTTP Server running on port ${PORT}`);
      console.log(`HTTP Server running on http://localhost:${PORT}`);
    });
    return server;
  }
};

// Start the server
const server = startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server };