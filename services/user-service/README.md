# User Service

The User Service handles all user-related functionality including authentication, authorization, and user profile management for the Healthcare Appointment System.

## Features

- User registration and authentication (JWT)
- Role-based access control (Patient, Doctor, Admin)
- Password reset via email
- User profile management
- Email verification
- Session management

## Prerequisites

- Node.js 22+ (LTS)
- MongoDB 6.0+
- npm or yarn
- Docker (optional)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/healthcare-appointment-system.git
cd healthcare-appointment-system/services/user-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

### 4. Start the development server

```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm start
```

The service will be available at `http://localhost:3000`

## API Documentation

API documentation is available at `http://localhost:3000/api-docs` when the service is running in development mode.

## Running with Docker

```bash
# Build the Docker image
docker build -t user-service .

# Run the container
docker run -p 3000:3000 --env-file .env user-service
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `development` |
| `PORT` | Port to run the server on | `3000` |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `30d` |
| `DB_URI` | MongoDB connection string | `mongodb://localhost:27017/user-service` |
| `EMAIL_*` | Email configuration for notifications | - |

## Project Structure

```
user-service/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Route definitions
│   ├── utils/          # Utility functions
│   └── index.js        # Application entry point
├── tests/             # Test files
├── .env.example       # Example environment variables
├── package.json
└── README.md
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
