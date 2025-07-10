require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3002;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Appointment Service is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`[${new Date().toISOString()}] ${err.stack}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Appointment Service running on port ${PORT}`);
  console.log(`Appointment Service running on http://localhost:${PORT}`);
});