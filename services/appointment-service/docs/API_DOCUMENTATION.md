# Healthcare Appointment Service API Documentation

## Table of Contents
- [API Documentation](#api-documentation)
  - [Base URL](#base-url)
  - [Authentication](#authentication)
  - [Rate Limiting](#rate-limiting)
- [Available Endpoints](#available-endpoints)
  - [Appointments](#appointments)
  - [Doctor Availability](#doctor-availability)
  - [Admin Endpoints](#admin-endpoints)
- [Postman Collection](#postman-collection)
- [Error Handling](#error-handling)
- [Examples](#examples)

## API Documentation

### Base URL
```
http://localhost:3001/api/v1/appointments
```

### Authentication
All endpoints (except health check) require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### Rate Limiting
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Available Endpoints

### Appointments

#### Create a new appointment
```
POST /appointments
```

**Request Body:**
```json
{
  "patientId": "64d5f7b3e8b9f6b5e8f7c6d5",
  "doctorId": "64d5f7b3e8b9f6b5e8f7c6d6",
  "appointmentDate": "2025-08-15",
  "startTime": "10:00",
  "endTime": "10:30",
  "reason": "Routine checkup",
  "notes": "Annual physical examination"
}
```

#### Get appointment by ID
```
GET /appointments/:id
```

#### Update appointment
```
PATCH /appointments/:id
```

**Request Body: (example)**
```json
{
  "status": "completed",
  "notes": "Patient received treatment and medication"
}
```

#### Get appointments by patient
```
GET /patients/:patientId/appointments?status=scheduled&startDate=2025-01-01&endDate=2025-12-31
```

#### Get appointments by doctor
```
GET /doctors/:doctorId/appointments?date=2025-08-15&status=scheduled
```

#### Cancel appointment
```
DELETE /appointments/:id
```

### Doctor Availability

#### Check doctor availability
```
GET /doctors/:doctorId/availability?date=2025-08-15&startTime=10:00&endTime=11:00
```

### Admin Endpoints

#### Get all appointments (Admin only)
```
GET /admin/appointments?page=1&limit=10&status=scheduled
```

## Postman Collection

A Postman collection is provided to help you test the API:

1. Import the collection from: `docs/postman/Healthcare-Appointment-Service.postman_collection.json`
2. Set up the following environment variables in Postman:
   - `base_url`: `http://localhost:3001`
   - `auth_url`: `http://localhost:3000/api/v1/auth` (update if different)
   - `token`: (will be set after login)
   - `appointment_id`: (will be set after creating an appointment)

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field1": ["Error message 1", "Error message 2"],
      "field2": ["Another error message"]
    }
  }
}
```

### Common Error Codes
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource conflict (e.g., time slot already booked)
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Something went wrong on our end

## Examples

### Create an Appointment
```bash
curl -X POST http://localhost:3001/api/v1/appointments/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "patientId": "64d5f7b3e8b9f6b5e8f7c6d5",
    "doctorId": "64d5f7b3e8b9f6b5e8f7c6d6",
    "appointmentDate": "2025-08-15",
    "startTime": "10:00",
    "endTime": "10:30",
    "reason": "Routine checkup"
  }'
```

### Check Doctor Availability
```bash
curl -X GET "http://localhost:3001/api/v1/appointments/doctors/64d5f7b3e8b9f6b5e8f7c6d6/availability?date=2025-08-15&startTime=10:00&endTime=11:00" \
  -H "Authorization: Bearer your_jwt_token"
```

### Get Appointments for a Patient
```bash
curl -X GET "http://localhost:3001/api/v1/appointments/patients/64d5f7b3e8b9f6b5e8f7c6d5/appointments?status=scheduled&startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer your_jwt_token"
```
