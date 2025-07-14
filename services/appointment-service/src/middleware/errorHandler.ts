import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import {
  ValidationError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
} from '../utils/errors';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`);
  logger.error(`Stack: ${err.stack}`);
  logger.error(`Request: ${req.method} ${req.originalUrl}`);
  logger.error(`Body: ${JSON.stringify(req.body)}`);
  logger.error(`Params: ${JSON.stringify(req.params)}`);
  logger.error(`Query: ${JSON.stringify(req.query)}`);

  // Handle specific error types
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.errors,
      },
    });
  }

  if (
    err instanceof BadRequestError ||
    err instanceof UnauthorizedError ||
    err instanceof ForbiddenError ||
    err instanceof NotFoundError ||
    err instanceof ConflictError ||
    err instanceof RateLimitError
  ) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors).map((val: any) => val.message);
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation Error',
        details: messages,
      },
    });
  }

  // Handle mongoose duplicate key errors
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY',
        message: `Duplicate field value: ${field}`,
      },
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expired',
      },
    });
  }

  // Handle other unexpected errors
  const error = new InternalServerError('Something went wrong');
  
  // In development, include the error stack
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse: any = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
    },
  };

  if (isDevelopment) {
    errorResponse.error.stack = err.stack;
  }

  res.status(error.statusCode).json(errorResponse);
};

export default errorHandler;
