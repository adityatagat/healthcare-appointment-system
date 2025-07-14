import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    // Attach user to request object
    req.user = decoded.user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Token expired'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Invalid token'));
    }
    next(error);
  }
};

/**
 * Middleware to check user roles
 * @param roles Array of allowed roles
 */
export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if the user is the owner of the resource or has admin role
 * @param resourceOwnerIdPath Path to the resource owner's ID in the request (e.g., 'params.userId')
 */
export const authorizeOwnerOrAdmin = (resourceOwnerIdPath: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // Get the resource owner ID from the specified path
      const pathParts = resourceOwnerIdPath.split('.');
      let resourceOwnerId = req as any;
      
      for (const part of pathParts) {
        resourceOwnerId = resourceOwnerId[part];
        if (resourceOwnerId === undefined) {
          throw new Error(`Invalid path: ${resourceOwnerIdPath}`);
        }
      }

      // Check if the user is the owner of the resource
      if (req.user.id !== resourceOwnerId) {
        throw new ForbiddenError('Not authorized to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to log all requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};
