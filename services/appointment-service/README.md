# Appointment Service

This is the Appointment Service for the Healthcare Appointment System, responsible for managing appointments between patients and healthcare providers.

## Features

- Create, read, update, and cancel appointments
- Check doctor availability
- View patient and doctor appointment history
- Secure API endpoints with JWT authentication
- Input validation and error handling
- Logging and monitoring
- Containerized with Docker

## Prerequisites

- Node.js 18.x or higher
- MongoDB 6.0 or higher
- Docker and Docker Compose (for containerized deployment)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/healthcare_appointments

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=30d

# Service URLs
AUTH_SERVICE_URL=http://auth-service:3000/api/v1
PATIENT_SERVICE_URL=http://patient-service:3002/api/v1
DOCTOR_SERVICE_URL=http://doctor-service:3003/api/v1

# Logging
LOG_LEVEL=info
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Running with Docker

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. The service will be available at `http://localhost:3001`

## API Documentation

### Interactive Documentation

Once the service is running, you can access the interactive API documentation at:

```
http://localhost:3001/api-docs
```

The Swagger UI provides:
- Complete API reference
- Request/response schemas
- Ability to try out API endpoints directly from the browser
- Authentication setup instructions

### Detailed Documentation

For detailed API documentation, including request/response examples and error codes, see:

```
docs/API_DOCUMENTATION.md
```

### Postman Collection

A Postman collection is provided for easy API testing:

1. Import the collection from: `docs/postman/Healthcare-Appointment-Service.postman_collection.json`
2. Set up the environment variables in Postman:
   - `base_url`: `http://localhost:3001`
   - `auth_url`: `http://localhost:3000/api/v1/auth` (update if different)
   - `token`: (will be set after login)
   - `appointment_id`: (will be set after creating an appointment)

### Available Endpoints

#### Appointments

- `POST /api/v1/appointments/appointments` - Create a new appointment
- `GET /api/v1/appointments/appointments/:id` - Get appointment by ID
- `PATCH /api/v1/appointments/appointments/:id` - Update an appointment
- `DELETE /api/v1/appointments/appointments/:id` - Cancel an appointment

#### Patients

- `GET /api/v1/appointments/patients/:patientId/appointments` - Get all appointments for a patient

#### Doctors

- `GET /api/v1/appointments/doctors/:doctorId/appointments` - Get all appointments for a doctor
- `GET /api/v1/appointments/doctors/:doctorId/availability` - Check doctor availability

#### Admin

- `GET /api/v1/appointments/admin/appointments` - Get all appointments (admin only)

## Development

### Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build the application
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Testing

Run the test suite:

```bash
npm test
```

## Deployment

### Docker

Build the Docker image:

```bash
docker build -t appointment-service .
```

Run the container:

```bash
docker run -p 3001:3001 --env-file .env appointment-service
```

### Kubernetes

See the main project's `k8s` directory for Kubernetes deployment manifests.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
