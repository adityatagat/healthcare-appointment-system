export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', code?: string) {
    super(message, 400, code || 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code?: string) {
    super(message, 401, code || 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code?: string) {
    super(message, 403, code || 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found', code?: string) {
    super(message, 404, code || 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', code?: string) {
    super(message, 409, code || 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>, message = 'Validation Error') {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too Many Requests', code?: string) {
    super(message, 429, code || 'RATE_LIMIT_EXCEEDED');
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', code?: string) {
    super(message, 500, code || 'INTERNAL_SERVER_ERROR');
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service Unavailable', code?: string) {
    super(message, 503, code || 'SERVICE_UNAVAILABLE');
  }
}
