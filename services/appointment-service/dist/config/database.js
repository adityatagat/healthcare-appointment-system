"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const connectDB = async () => {
    try {
        const { MONGODB_HOST, MONGODB_PORT, MONGODB_DATABASE, MONGODB_USER, MONGODB_PASSWORD, MONGODB_AUTH_SOURCE, MONGODB_URI } = process.env;
        if (!MONGODB_URI) {
            throw new Error('MongoDB connection URI is not defined in environment variables');
        }
        const options = {
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
        logger_1.default.info(`Connecting to MongoDB at ${safeMongoUri}...`);
        logger_1.default.debug('MongoDB connection options:', {
            ...options,
            auth: { username: MONGODB_USER ? '****' : undefined, password: '****' },
            authSource: MONGODB_AUTH_SOURCE
        });
        const conn = await mongoose_1.default.connect(MONGODB_URI, options);
        logger_1.default.info(`MongoDB Connected: ${conn.connection.host}`);
        logger_1.default.info(`Database Name: ${conn.connection.name}`);
    }
    catch (error) {
        logger_1.default.error(`Error connecting to MongoDB: ${error.message}`);
        logger_1.default.error('Connection details:', {
            host: process.env.MONGODB_URI?.split('@')[1]?.split('/')[0],
            database: process.env.MONGODB_URI?.split('/').pop()?.split('?')[0],
            authSource: 'admin',
        });
        process.exit(1);
    }
};
// Handle MongoDB connection events
mongoose_1.default.connection.on('error', (err) => {
    logger_1.default.error(`MongoDB connection error: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        logger_1.default.error('Error details:', err);
    }
    process.exit(1);
});
mongoose_1.default.connection.on('disconnected', () => {
    logger_1.default.warn('MongoDB disconnected');
});
// Close the Mongoose connection when the Node process ends
process.on('SIGINT', async () => {
    try {
        await mongoose_1.default.connection.close();
        logger_1.default.info('MongoDB connection closed through app termination');
        process.exit(0);
    }
    catch (err) {
        logger_1.default.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});
exports.default = connectDB;
