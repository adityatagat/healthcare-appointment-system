import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import logger from '@/utils/logger';

export const healthCheck = async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    checks: [
      {
        name: 'Database',
        status: mongoose.connection.readyState === 1 ? 'UP' : 'DOWN',
      },
      {
        name: 'Memory Usage',
        status: 'UP',
        data: {
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
        },
      },
    ],
  };

  // Check if all checks are up
  const allChecksUp = healthCheck.checks.every((check) => check.status === 'UP');
  const statusCode = allChecksUp ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;

  if (!allChecksUp) {
    healthCheck.status = 'DOWN';
    logger.warn('Health check failed', { healthCheck });
  }

  return res.status(statusCode).json(healthCheck);
};

export default { healthCheck };
