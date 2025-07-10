require('dotenv').config();

module.exports = {
  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  
  // API Key configuration
  apiKeys: {
    // In production, these should be stored in a secure database
    // This is just for demonstration purposes
    validKeys: new Set([
      process.env.ADMIN_API_KEY || 'admin-key-123',
      process.env.USER_API_KEY || 'user-key-456'
    ]),
    headerName: 'X-API-Key',
    errorMessage: 'Invalid or missing API key'
  },
  
  // JWT Configuration (for future authentication)
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
  },
  
  // HTTPS Configuration
  https: {
    enabled: process.env.HTTPS_ENABLED === 'true' || false,
    options: {
      // These paths should be set in production
      key: process.env.HTTPS_KEY_PATH || './certs/key.pem',
      cert: process.env.HTTPS_CERT_PATH || './certs/cert.pem',
      // Enable only TLS 1.2 and above
      minVersion: 'TLSv1.2',
      // Recommended cipher suites for Node.js
      ciphers: [
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_AES_128_GCM_SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES128-GCM-SHA256'
      ].join(':'),
      honorCipherOrder: true
    }
  },
  
  // Security headers
  securityHeaders: {
    // Enable or disable security headers
    enabled: true,
    // Security headers configuration
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      // HSTS (only enable in production with HTTPS)
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: false
    }
  }
};
