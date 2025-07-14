import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Healthcare Appointment Service API',
      version,
      description: 'API documentation for the Healthcare Appointment Service',
      contact: {
        name: 'API Support',
        email: 'support@healthcareapp.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.healthcareapp.com/appointments',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // Base Appointment Schema
        Appointment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'objectId',
              example: '64d5f7b3e8b9f6b5e8f7c6d5',
            },
            patientId: {
              type: 'string',
              format: 'objectId',
              example: '64d5f7b3e8b9f6b5e8f7c6d5',
            },
            doctorId: {
              type: 'string',
              format: 'objectId',
              example: '64d5f7b3e8b9f6b5e8f7c6d6',
            },
            appointmentDate: {
              type: 'string',
              format: 'date',
              example: '2025-08-15',
            },
            startTime: {
              type: 'string',
              format: 'time',
              example: '10:00',
            },
            endTime: {
              type: 'string',
              format: 'time',
              example: '10:30',
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled'],
              example: 'scheduled',
            },
            reason: {
              type: 'string',
              example: 'Routine checkup',
            },
            notes: {
              type: 'string',
              example: 'Annual physical examination',
            },
            isFollowUp: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-01T00:00:00.000Z',
            },
          },
        },
        // For creating a new appointment
        AppointmentCreate: {
          type: 'object',
          required: ['patientId', 'doctorId', 'appointmentDate', 'startTime', 'endTime'],
          properties: {
            patientId: {
              type: 'string',
              format: 'objectId',
              example: '64d5f7b3e8b9f6b5e8f7c6d5',
            },
            doctorId: {
              type: 'string',
              format: 'objectId',
              example: '64d5f7b3e8b9f6b5e8f7c6d6',
            },
            appointmentDate: {
              type: 'string',
              format: 'date',
              example: '2025-08-15',
            },
            startTime: {
              type: 'string',
              format: 'time',
              example: '10:00',
            },
            endTime: {
              type: 'string',
              format: 'time',
              example: '10:30',
            },
            reason: {
              type: 'string',
              example: 'Routine checkup',
            },
            notes: {
              type: 'string',
              example: 'Annual physical examination',
            },
          },
        },
        // For updating an appointment
        AppointmentUpdate: {
          type: 'object',
          properties: {
            appointmentDate: {
              type: 'string',
              format: 'date',
              example: '2025-08-15',
            },
            startTime: {
              type: 'string',
              format: 'time',
              example: '10:00',
            },
            endTime: {
              type: 'string',
              format: 'time',
              example: '10:30',
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled'],
              example: 'completed',
            },
            reason: {
              type: 'string',
              example: 'Follow-up visit',
            },
            notes: {
              type: 'string',
              example: 'Patient needs further tests',
            },
          },
        },
        // For checking doctor availability
        AvailabilityCheck: {
          type: 'object',
          required: ['date', 'startTime', 'endTime'],
          properties: {
            date: {
              type: 'string',
              format: 'date',
              example: '2025-08-15',
            },
            startTime: {
              type: 'string',
              format: 'time',
              example: '10:00',
            },
            endTime: {
              type: 'string',
              format: 'time',
              example: '10:30',
            },
          },
        },
        // Standard error response
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  example: 'Validation failed',
                },
                details: {
                  type: 'object',
                  additionalProperties: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  example: {
                    fieldName: ['Error message'],
                  },
                },
              },
            },
          },
        },
      },
      // Reusable response schemas
      responses: {
        UnauthorizedError: {
          description: 'Unauthorized - Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'UNAUTHORIZED',
                  message: 'Authentication required',
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Forbidden - User does not have permission to access this resource',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'FORBIDDEN',
                  message: 'Insufficient permissions',
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: 'Appointment not found',
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'VALIDATION_ERROR',
                  message: 'Validation failed',
                  details: {
                    patientId: ['Valid patient ID is required'],
                    startTime: ['Valid start time is required (HH:MM)'],
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

export const specs = swaggerJsdoc(options);
