"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import module aliases
require("module-alias/register");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const hpp_1 = __importDefault(require("hpp"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Import routes
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
// Import middleware
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const auth_1 = require("./middleware/auth");
// Import config
const database_1 = __importDefault(require("./config/database"));
const logger_1 = __importDefault(require("./utils/logger"));
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
// Create logs directory if it doesn't exist
const logsDir = path_1.default.join(__dirname, '..', 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use((0, helmet_1.default)());
// Development logging
if (NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Body parser, reading data from body into req.body
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
// Data sanitization against NoSQL query injection
app.use((0, express_mongo_sanitize_1.default)());
// Data sanitization against XSS
app.use((0, xss_clean_1.default)());
// Prevent parameter pollution
app.use((0, hpp_1.default)({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price',
    ],
}));
// Compress all routes
app.use((0, compression_1.default)());
// Enable CORS
app.use((0, cors_1.default)());
app.options('*', (0, cors_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    max: 100, // limit each IP to 100 requests per windowMs
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);
// Request logging
app.use(auth_1.requestLogger);
// 3) ROUTES
app.use('/api/v1/appointments', appointment_routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Appointment Service is running',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
    });
});
// Handle 404 - Not Found
app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: `Can't find ${req.originalUrl} on this server!`,
    });
});
// Error handling middleware
app.use(errorHandler_1.default);
// Connect to database and start server
const startServer = async () => {
    try {
        await (0, database_1.default)();
        // Start HTTP server
        const server = app.listen(PORT, () => {
            logger_1.default.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger_1.default.error(`Unhandled Rejection: ${err.name} - ${err.message}`);
            // Close server & exit process
            server.close(() => process.exit(1));
        });
    }
    catch (error) {
        logger_1.default.error(`Error starting server: ${error}`);
        process.exit(1);
    }
};
// Start the server
startServer();
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.default.error(`Uncaught Exception: ${err.name} - ${err.message}`);
    process.exit(1);
});
// Handle SIGTERM
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM RECEIVED. Shutting down gracefully');
    process.exit(0);
});
exports.default = app;
