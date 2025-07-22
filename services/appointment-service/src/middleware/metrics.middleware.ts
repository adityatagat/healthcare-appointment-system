import { Request, Response, NextFunction } from 'express';
import { getMetrics, metricsContentType } from '../utils/metrics';

export const metricsHandler = async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', metricsContentType);
    const metrics = await getMetrics();
    res.end(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).end('Error generating metrics');
  }
};

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip metrics endpoint from request logging
  if (req.path === '/metrics') {
    return metricsHandler(req, res);
  }
  next();
};

export const metricsRoute = {
  method: 'get',
  path: '/metrics',
  handler: metricsHandler,
};

export default {
  metricsMiddleware,
  metricsRoute,
  metricsHandler,
};
