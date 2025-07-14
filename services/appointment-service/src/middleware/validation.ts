import { body, param, query } from 'express-validator';
import { Types } from 'mongoose';

export const createAppointmentValidation = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .custom((value) => Types.ObjectId.isValid(value))
    .withMessage('Invalid patient ID format'),
  
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .custom((value) => Types.ObjectId.isValid(value))
    .withMessage('Invalid doctor ID format'),
  
  body('appointmentDate')
    .notEmpty()
    .withMessage('Appointment date is required')
    .isISO8601()
    .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    })
    .withMessage('Appointment date must be today or in the future'),
  
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format. Use HH:MM (24-hour format)'),
  
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format. Use HH:MM (24-hour format)')
    .custom((value, { req }) => {
      if (req.body.startTime && value <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  
  body('reason')
    .notEmpty()
    .withMessage('Reason for appointment is required')
    .isLength({ max: 500 })
    .withMessage('Reason must be less than 500 characters'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  
  body('isFollowUp')
    .optional()
    .isBoolean()
    .withMessage('isFollowUp must be a boolean value'),
  
  body('previousAppointmentId')
    .optional()
    .custom((value) => Types.ObjectId.isValid(value))
    .withMessage('Invalid previous appointment ID format'),
];

export const updateAppointmentValidation = [
  param('id')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .custom((value) => Types.ObjectId.isValid(value))
    .withMessage('Invalid appointment ID format'),
  
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status value'),
  
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason must be less than 500 characters'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
];

export const appointmentIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .custom((value) => Types.ObjectId.isValid(value))
    .withMessage('Invalid appointment ID format'),
];

export const patientIdValidation = [
  param('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .custom((value) => Types.ObjectId.isValid(value))
    .withMessage('Invalid patient ID format'),
  
  query('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status value'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format. Use ISO 8601 format (YYYY-MM-DD)'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format. Use ISO 8601 format (YYYY-MM-DD)'),
];

export const doctorIdValidation = [
  param('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .custom((value) => Types.ObjectId.isValid(value))
    .withMessage('Invalid doctor ID format'),
  
  query('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status value'),
  
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'),
];

export const checkAvailabilityValidation = [
  query('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .custom((value) => Types.ObjectId.isValid(value))
    .withMessage('Invalid doctor ID format'),
  
  query('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'),
  
  query('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format. Use HH:MM (24-hour format)'),
  
  query('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format. Use HH:MM (24-hour format)')
    .custom((value, { req }) => {
      const startTime = req.query?.startTime as string | undefined;
      if (startTime && value <= startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
];
