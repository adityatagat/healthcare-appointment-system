"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const errorHandler = (err, req, res, next) => {
    // Log the error
    logger_1.default.error(`${err.name}: ${err.message}`);
    logger_1.default.error(`Stack: ${err.stack}`);
    logger_1.default.error(`Request: ${req.method} ${req.originalUrl}`);
    logger_1.default.error(`Body: ${JSON.stringify(req.body)}`);
    logger_1.default.error(`Params: ${JSON.stringify(req.params)}`);
    logger_1.default.error(`Query: ${JSON.stringify(req.query)}`);
    // Handle specific error types
    if (err instanceof errors_1.ValidationError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.errors,
            },
        });
    }
    if (err instanceof errors_1.BadRequestError ||
        err instanceof errors_1.UnauthorizedError ||
        err instanceof errors_1.ForbiddenError ||
        err instanceof errors_1.NotFoundError ||
        err instanceof errors_1.ConflictError ||
        err instanceof errors_1.RateLimitError) {
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
        const messages = Object.values(err.errors).map((val) => val.message);
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
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
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
    const error = new errors_1.InternalServerError('Something went wrong');
    // In development, include the error stack
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse = {
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
exports.default = errorHandler;
