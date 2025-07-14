import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const {
      MONGODB_HOST,
      MONGODB_PORT,
      MONGODB_DATABASE,
      MONGODB_USER,
      MONGODB_PASSWORD,
      MONGODB_AUTH_SOURCE,
      MONGODB_URI
    } = process.env;

    if (!MONGODB_URI) {
      throw new Error('MongoDB connection URI is not defined in environment variables');
    }

    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
      authSource: 'healthcare_appointments',
      authMechanism: 'SCRAM-SHA-256',
      user: MONGODB_USER,
      pass: MONGODB_PASSWORD
    };

    // Log connection attempt (without credentials)
    const safeMongoUri = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
    logger.info(`Connecting to MongoDB at ${safeMongoUri}...`);

    logger.debug('MongoDB connection options:', {
      ...options,
      auth: { username: MONGODB_USER ? '****' : undefined, password: '****' },
      authSource: MONGODB_AUTH_SOURCE
    });

    const conn = await mongoose.connect(MONGODB_URI, options);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    logger.error('Connection details:', {
      host: process.env.MONGODB_URI?.split('@')[1]?.split('/')[0],
      database: process.env.MONGODB_URI?.split('/').pop()?.split('?')[0],
      authSource: 'admin',
    });
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    logger.error('Error details:', err);
  }
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');});

// Close the Mongoose connection when the Node process ends
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    logger.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

export default connectDB;
