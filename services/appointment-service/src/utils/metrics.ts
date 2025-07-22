import { collectDefaultMetrics, Gauge, Histogram, Counter, Registry } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Create a registry to hold all metrics
const register = new Registry();

// Enable collection of default Node.js metrics
collectDefaultMetrics({
  register,
  prefix: 'node_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Application specific metrics
const httpRequestDurationMicroseconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['type'],
});

const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'collection'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
});

const errorCounter = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'endpoint', 'status_code'],
});

// Register all metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseQueryDuration);
register.registerMetric(errorCounter);

// Export the register object
export { register };

// Track request duration
const responseTimeInMs = (start: [number, number]): number => {
  const diff = process.hrtime(start);
  return (diff[0] * 1e9 + diff[1]) / 1e6;
};

// Middleware to track request metrics
export const requestMetricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = process.hrtime();
  
  // Get the route path or use the request path as fallback
  const routePath = (req.route?.path || req.path || req.originalUrl?.split('?')[0] || '/').toString();
  const method = (req.method || 'GET').toString();
  
  // Response finish handler
  res.on('finish', () => {
    const statusCode = res.statusCode || 200;
    const responseTime = responseTimeInMs(start);

    // Record metrics
    httpRequestDurationMicroseconds
      .labels(method, routePath, statusCode.toString())
      .observe(responseTime / 1000); // Convert to seconds

    httpRequestsTotal.labels(method, routePath, statusCode.toString()).inc();
  });

  next();
};

// Track database query duration
export const trackDbQuery = async <T>(
  operation: string,
  collection: string,
  query: () => Promise<T>
): Promise<T> => {
  const end = databaseQueryDuration.startTimer({ operation, collection });
  try {
    const result = await query();
    end();
    return result;
  } catch (error) {
    end();
    throw error;
  }
};

// Track errors
export const trackError = (type: string, endpoint: string, statusCode: number) => {
  errorCounter.labels(type, endpoint, statusCode.toString()).inc();
};

// Get metrics in Prometheus format
export const getMetrics = async (): Promise<string> => {
  return register.metrics();
};

// Get metrics content type
export const metricsContentType = register.contentType;

export default {
  register,
  httpRequestDurationMicroseconds,
  httpRequestsTotal,
  activeConnections,
  databaseQueryDuration,
  errorCounter,
  requestMetricsMiddleware,
  trackDbQuery,
  trackError,
  getMetrics,
  metricsContentType,
};
