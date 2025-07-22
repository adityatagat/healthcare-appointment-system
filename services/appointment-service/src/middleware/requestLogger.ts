import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Skip logging for health checks and metrics endpoints
  if (req.path === '/health' || req.path === '/metrics') {
    return next();
  }

  const start = Date.now();
  const { method, originalUrl, ip, body, query, params } = req;

  // Log request details
  logger.info('Request received', {
    method,
    url: originalUrl,
    ip,
    body,
    query,
    params,
  });

  // Log response details when the response is finished
  res.on('finish', () => {
    const { statusCode } = res;
    const responseTime = Date.now() - start;
    const contentLength = res.get('content-length') || 0;

    logger.info('Response sent', {
      method,
      url: originalUrl,
      statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: `${contentLength}b`,
    });
  });

  next();
};

export default requestLogger;
