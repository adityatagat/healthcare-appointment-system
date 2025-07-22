import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number) => {
  return new AppError(message, statusCode);
};

export const notFoundError = (message = 'Resource not found') => {
  return createError(message, StatusCodes.NOT_FOUND);
};

export const badRequestError = (message = 'Bad request') => {
  return createError(message, StatusCodes.BAD_REQUEST);
};

export const unauthorizedError = (message = 'Not authorized') => {
  return createError(message, StatusCodes.UNAUTHORIZED);
};

export const forbiddenError = (message = 'Forbidden') => {
  return createError(message, StatusCodes.FORBIDDEN);
};

export const conflictError = (message = 'Conflict') => {
  return createError(message, StatusCodes.CONFLICT);
};

export const validationError = (message = 'Validation failed') => {
  return createError(message, StatusCodes.UNPROCESSABLE_ENTITY);
};

export const serverError = (message = 'Internal server error') => {
  return createError(message, StatusCodes.INTERNAL_SERVER_ERROR);
};
