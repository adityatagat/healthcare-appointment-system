# API Gateway

The API Gateway is the secure entry point for all client requests in the Healthcare Appointment System. It provides comprehensive security, routing, and monitoring capabilities.

## Features

- **Secure Request Routing**: Intelligent routing to microservices with API key validation
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **Authentication & Authorization**: JWT-based authentication and role-based access control
- **HTTPS Support**: Secure communication with TLS/SSL encryption
- **Request Validation**: Input sanitization and validation
- **Comprehensive Logging**: Structured logging for all requests and errors
- **Security Headers**: Protection against common web vulnerabilities
- **CORS Management**: Configurable CORS policies
- **Error Handling**: Standardized error responses
- **Health Checks**: System status monitoring

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker & Docker Compose (for containerized development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd api-gateway
   npm install
   ```
3. Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=8000
NODE_ENV=development
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Security
ADMIN_API_KEY=your-secure-admin-key
USER_API_KEY=your-secure-user-key
JWT_SECRET=your-jwt-secret

# Redis (for rate limiting)
REDIS_HOST=redis
REDIS_PORT=6379

# HTTPS Configuration
HTTPS_ENABLED=false
HTTPS_KEY_PATH=./certs/private.key
HTTPS_CERT_PATH=./certs/certificate.crt
```

### Running Locally

```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm start
```

### Running with Docker

```bash
docker-compose up --build
```

The API Gateway will be available at http://localhost:8000

## API Endpoints

### Public Endpoints (No Authentication Required)

| Endpoint              | Method | Description                     |
|-----------------------|--------|---------------------------------|
| `/health`             | GET    | Health check endpoint           |
| `/public/health`      | GET    | Service health status           |

### Protected Endpoints (API Key Required)

| Endpoint                     | Method | Description                     |
|------------------------------|--------|---------------------------------|
| `/api/users/*`              | ALL    | User management and auth        |
| `/api/appointments/*`       | ALL    | Appointment management         |
| `/api/providers/*`          | ALL    | Healthcare provider management  |
| `/api/medical-records/*`    | ALL    | Patient medical records         |
| `/api/billing/*`            | ALL    | Payments and invoicing          |

### Admin Endpoints (Admin API Key Required)

| Endpoint                     | Method | Description                     |
|------------------------------|--------|---------------------------------|
| `/admin/analytics/*`         | ALL    | System analytics and reporting  |
| `/admin/users/*`             | ALL    | Admin user management           |

### Authentication

All protected endpoints require an API key in the request header:
```
X-API-Key: your-api-key
```

- Use `USER_API_KEY` for regular user access
- Use `ADMIN_API_KEY` for administrative access

## Development

### Project Structure

```
api-gateway/
├── src/
│   ├── config/         # Configuration files
│   ├── middleware/     # Custom middleware
│   ├── routes/         # Route definitions
│   ├── utils/          # Utility functions
│   └── index.js        # Application entry point
├── tests/             # Test files
├── .env.example       # Example environment variables
├── package.json
└── README.md
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Rate Limiting

The API Gateway implements rate limiting to protect against abuse and ensure fair usage:

- **Default Rate Limit**: 100 requests per minute per IP address
- **Burst Protection**: Short-term bursts up to 150 requests are allowed
- **Block Duration**: 15 minutes for clients exceeding limits
- **User-based Limits**: Additional limits per authenticated user

### Response Headers
Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 2025-07-10T12:00:00.000Z
Retry-After: 60
```

## Security Best Practices

1. **API Keys**
   - Never commit API keys to version control
   - Rotate keys regularly
   - Use different keys for different environments

2. **HTTPS**
   - Always enable HTTPS in production
   - Use strong cipher suites
   - Implement HSTS (HTTP Strict Transport Security)

3. **Input Validation**
   - All input is validated and sanitized
   - Maximum request size limits are enforced
   - Content-Type headers are strictly enforced

4. **Logging**
   - All requests are logged with timestamps and client information
   - Sensitive information is automatically redacted
   - Logs are stored securely and rotated regularly

## Deployment

The API Gateway is designed to be deployed as a secure, containerized application. It can be deployed to any container orchestration platform like Kubernetes or Docker Swarm.

### Production Checklist

- [ ] Enable HTTPS with valid certificates
- [ ] Set strong, unique API keys
- [ ] Configure appropriate CORS origins
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Set up automated backups
- [ ] Enable rate limiting
- [ ] Configure security headers

### Environment Variables

| Variable    | Default   | Description                          |
|-------------|-----------|--------------------------------------|
| PORT        | 8000      | Port the server listens on           |
| NODE_ENV    | development | Node environment                    |
| LOG_LEVEL   | info      | Logging level (error, warn, info, debug) |

## Monitoring

- Prometheus metrics available at `/metrics`
- Logs are streamed to Loki and can be viewed in Grafana
- Health check endpoint at `/health`

## Contributing

Please read [CONTRIBUTING.md](../../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
