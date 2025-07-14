"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAvailabilityValidation = exports.doctorIdValidation = exports.patientIdValidation = exports.appointmentIdValidation = exports.updateAppointmentValidation = exports.createAppointmentValidation = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = require("mongoose");
exports.createAppointmentValidation = [
    (0, express_validator_1.body)('patientId')
        .notEmpty()
        .withMessage('Patient ID is required')
        .custom((value) => mongoose_1.Types.ObjectId.isValid(value))
        .withMessage('Invalid patient ID format'),
    (0, express_validator_1.body)('doctorId')
        .notEmpty()
        .withMessage('Doctor ID is required')
        .custom((value) => mongoose_1.Types.ObjectId.isValid(value))
        .withMessage('Invalid doctor ID format'),
    (0, express_validator_1.body)('appointmentDate')
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
    (0, express_validator_1.body)('startTime')
        .notEmpty()
        .withMessage('Start time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid time format. Use HH:MM (24-hour format)'),
    (0, express_validator_1.body)('endTime')
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
    (0, express_validator_1.body)('reason')
        .notEmpty()
        .withMessage('Reason for appointment is required')
        .isLength({ max: 500 })
        .withMessage('Reason must be less than 500 characters'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isString()
        .withMessage('Notes must be a string')
        .isLength({ max: 1000 })
        .withMessage('Notes must be less than 1000 characters'),
    (0, express_validator_1.body)('isFollowUp')
        .optional()
        .isBoolean()
        .withMessage('isFollowUp must be a boolean value'),
    (0, express_validator_1.body)('previousAppointmentId')
        .optional()
        .custom((value) => mongoose_1.Types.ObjectId.isValid(value))
        .withMessage('Invalid previous appointment ID format'),
];
exports.updateAppointmentValidation = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Appointment ID is required')
        .custom((value) => mongoose_1.Types.ObjectId.isValid(value))
        .withMessage('Invalid appointment ID format'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['scheduled', 'completed', 'cancelled', 'no-show'])
        .withMessage('Invalid status value'),
    (0, express_validator_1.body)('reason')
        .optional()
        .isString()
        .withMessage('Reason must be a string')
        .isLength({ max: 500 })
        .withMessage('Reason must be less than 500 characters'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isString()
        .withMessage('Notes must be a string')
        .isLength({ max: 1000 })
        .withMessage('Notes must be less than 1000 characters'),
];
exports.appointmentIdValidation = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Appointment ID is required')
        .custom((value) => mongoose_1.Types.ObjectId.isValid(value))
        .withMessage('Invalid appointment ID format'),
];
exports.patientIdValidation = [
    (0, express_validator_1.param)('patientId')
        .notEmpty()
        .withMessage('Patient ID is required')
        .custom((value) => mongoose_1.Types.ObjectId.isValid(value))
        .withMessage('Invalid patient ID format'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['scheduled', 'completed', 'cancelled', 'no-show'])
        .withMessage('Invalid status value'),
    (0, express_validator_1.query)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date format. Use ISO 8601 format (YYYY-MM-DD)'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date format. Use ISO 8601 format (YYYY-MM-DD)'),
];
exports.doctorIdValidation = [
    (0, express_validator_1.param)('doctorId')
        .notEmpty()
        .withMessage('Doctor ID is required')
        .custom((value) => mongoose_1.Types.ObjectId.isValid(value))
        .withMessage('Invalid doctor ID format'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['scheduled', 'completed', 'cancelled', 'no-show'])
        .withMessage('Invalid status value'),
    (0, express_validator_1.query)('date')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'),
];
exports.checkAvailabilityValidation = [
    (0, express_validator_1.query)('doctorId')
        .notEmpty()
        .withMessage('Doctor ID is required')
        .custom((value) => mongoose_1.Types.ObjectId.isValid(value))
        .withMessage('Invalid doctor ID format'),
    (0, express_validator_1.query)('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601()
        .withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'),
    (0, express_validator_1.query)('startTime')
        .notEmpty()
        .withMessage('Start time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid time format. Use HH:MM (24-hour format)'),
    (0, express_validator_1.query)('endTime')
        .notEmpty()
        .withMessage('End time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid time format. Use HH:MM (24-hour format)')
        .custom((value, { req }) => {
        const startTime = req.query?.startTime;
        if (startTime && value <= startTime) {
            throw new Error('End time must be after start time');
        }
        return true;
    }),
];
