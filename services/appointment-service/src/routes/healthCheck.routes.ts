import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { healthCheck } from '../controllers/healthCheck.controller';

const router = Router();

// Health check endpoint
router.get('/', healthCheck);

export default router;
