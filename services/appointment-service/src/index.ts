// Import module aliases
import 'module-alias/register';
import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';

// Import routes
import appointmentRoutes from './routes/appointment.routes';

// Import middleware
import errorHandler from './middleware/errorHandler';
import { requestLogger } from './middleware/auth';

// Import config
import connectDB from './config/database';
import logger from './utils/logger';

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 1) GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Development logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Compress all routes
app.use(compression());

// Enable CORS
app.use(cors());
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Request logging
app.use(requestLogger);

// API Documentation
const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Healthcare Appointment Service API',
  customfavIcon: 'https://your-logo-url/favicon.ico',
};

// Serve Swagger UI
app.use('/api-docs', 
  swaggerUi.serve,
  swaggerUi.setup(specs, swaggerOptions)
);

// Add a route to serve the raw JSON spec
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// 3) ROUTES
app.use('/api/v1/appointments', appointmentRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Appointment Service is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// Handle 404 - Not Found
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error(`Unhandled Rejection: ${err.name} - ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error(`Error starting server: ${error}`);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.name} - ${err.message}`);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully');
  process.exit(0);
});

export default app;
