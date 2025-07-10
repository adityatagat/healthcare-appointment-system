const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  // Add metadata if present
  const metaString = Object.keys(meta).length > 0 
    ? '\n' + JSON.stringify(meta, null, 2)
    : '';
    
  return log + metaString;
});

// Create logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // Write all logs to `combined.log`
    new transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    )
  }));
}

// Add request logging middleware
logger.requestLogger = (req, res, next) => {
  // Skip health check logs
  if (req.path === '/health') {
    return next();
  }
  
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip, httpVersion } = req;
    const { statusCode } = res;
    const contentLength = res.get('content-length') || 0;
    const userAgent = req.get('user-agent') || '';
    
    logger.info(`${method} ${originalUrl}`, {
      status: statusCode,
      duration: `${duration}ms`,
      ip,
      httpVersion,
      contentLength,
      userAgent,
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};

// Error logging middleware
logger.errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    headers: req.headers
  });
  
  // Don't leak stack traces to the client in production
  const errorResponse = {
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };
  
  res.status(err.status || 500).json(errorResponse);
};

module.exports = logger;
