# ========== Development Stage ==========
FROM node:22-alpine AS development

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk --no-cache add curl tini

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Set environment variables for development
ENV NODE_ENV=development
ENV PORT=3001
ENV METRICS_ENABLED=true
ENV METRICS_PATH=/metrics
ENV LOG_LEVEL=debug

# Use tini as the init process for better signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Command to run the application in development with ts-node-dev for hot-reloading
CMD ["npm", "run", "dev"]

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Install curl for health checks and tini for better process handling
RUN apk --no-cache add curl tini

# Copy built application from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env* ./

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && \
    chown -R node:node /app/logs

# Switch to non-root user
USER node

# Expose the port the app runs on
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV METRICS_ENABLED=true
ENV METRICS_PATH=/metrics
ENV LOG_LEVEL=info

# Health check with timeout and retries
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Use tini as the init process for better signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Command to run the application in production
CMD ["node", "dist/index.js"]
