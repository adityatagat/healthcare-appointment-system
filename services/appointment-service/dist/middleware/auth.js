"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.authorizeOwnerOrAdmin = exports.authorizeRoles = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Middleware to authenticate JWT token
 */
const authenticateJWT = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new errors_1.UnauthorizedError('No token provided');
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Attach user to request object
        req.user = decoded.user;
        req.token = token;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errors_1.UnauthorizedError('Token expired'));
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new errors_1.UnauthorizedError('Invalid token'));
        }
        next(error);
    }
};
exports.authenticateJWT = authenticateJWT;
/**
 * Middleware to check user roles
 * @param roles Array of allowed roles
 */
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.UnauthorizedError('Authentication required');
            }
            if (!roles.includes(req.user.role)) {
                throw new errors_1.ForbiddenError('Insufficient permissions');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorizeRoles = authorizeRoles;
/**
 * Middleware to check if the user is the owner of the resource or has admin role
 * @param resourceOwnerIdPath Path to the resource owner's ID in the request (e.g., 'params.userId')
 */
const authorizeOwnerOrAdmin = (resourceOwnerIdPath) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.UnauthorizedError('Authentication required');
            }
            // Admin can access any resource
            if (req.user.role === 'admin') {
                return next();
            }
            // Get the resource owner ID from the specified path
            const pathParts = resourceOwnerIdPath.split('.');
            let resourceOwnerId = req;
            for (const part of pathParts) {
                resourceOwnerId = resourceOwnerId[part];
                if (resourceOwnerId === undefined) {
                    throw new Error(`Invalid path: ${resourceOwnerIdPath}`);
                }
            }
            // Check if the user is the owner of the resource
            if (req.user.id !== resourceOwnerId) {
                throw new errors_1.ForbiddenError('Not authorized to access this resource');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorizeOwnerOrAdmin = authorizeOwnerOrAdmin;
/**
 * Middleware to log all requests
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_1.default.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
};
exports.requestLogger = requestLogger;
