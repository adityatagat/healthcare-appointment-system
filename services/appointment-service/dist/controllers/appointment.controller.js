"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const appointment_service_1 = __importDefault(require("../services/appointment.service"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
class AppointmentController {
    /**
     * Create a new appointment
     */
    async createAppointment(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const errorMessages = {};
                const errorArray = errors.array();
                errorArray.forEach((error) => {
                    const param = error.param || 'unknown';
                    if (!errorMessages[param]) {
                        errorMessages[param] = [];
                    }
                    errorMessages[param].push(error.msg);
                });
                throw new errors_1.ValidationError(errorMessages);
            }
            const appointmentData = {
                patientId: req.body.patientId,
                doctorId: req.body.doctorId,
                appointmentDate: new Date(req.body.appointmentDate),
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                reason: req.body.reason,
                notes: req.body.notes,
                isFollowUp: req.body.isFollowUp || false,
                previousAppointmentId: req.body.previousAppointmentId,
            };
            const appointment = await appointment_service_1.default.createAppointment(appointmentData);
            res.status(201).json({
                success: true,
                data: appointment,
            });
        }
        catch (error) {
            logger_1.default.error(`Create appointment error: ${error}`);
            next(error);
        }
    }
    /**
     * Get appointment by ID
     */
    async getAppointment(req, res, next) {
        try {
            const appointment = await appointment_service_1.default.getAppointmentById(req.params.id);
            res.status(200).json({
                success: true,
                data: appointment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update appointment
     */
    async updateAppointment(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const errorMessages = {};
                const errorArray = errors.array();
                errorArray.forEach((error) => {
                    const param = error.param || 'unknown';
                    if (!errorMessages[param]) {
                        errorMessages[param] = [];
                    }
                    errorMessages[param].push(error.msg);
                });
                throw new errors_1.ValidationError(errorMessages);
            }
            const updateData = {
                status: req.body.status,
                notes: req.body.notes,
                reason: req.body.reason,
            };
            // Remove undefined fields
            Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);
            const appointment = await appointment_service_1.default.updateAppointment(req.params.id, updateData);
            res.status(200).json({
                success: true,
                data: appointment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Cancel appointment
     */
    async cancelAppointment(req, res, next) {
        try {
            const appointment = await appointment_service_1.default.cancelAppointment(req.params.id);
            res.status(200).json({
                success: true,
                data: appointment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get patient's appointments
     */
    async getPatientAppointments(req, res, next) {
        try {
            const { status, startDate, endDate } = req.query;
            let startDateObj;
            let endDateObj;
            if (startDate) {
                startDateObj = new Date(startDate);
                if (isNaN(startDateObj.getTime())) {
                    throw new errors_1.BadRequestError('Invalid start date');
                }
            }
            if (endDate) {
                endDateObj = new Date(endDate);
                if (isNaN(endDateObj.getTime())) {
                    throw new errors_1.BadRequestError('Invalid end date');
                }
            }
            const appointments = await appointment_service_1.default.getPatientAppointments(req.params.patientId, status, startDateObj, endDateObj);
            res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get doctor's appointments
     */
    async getDoctorAppointments(req, res, next) {
        try {
            const { status, date } = req.query;
            let dateObj;
            if (date) {
                dateObj = new Date(date);
                if (isNaN(dateObj.getTime())) {
                    throw new errors_1.BadRequestError('Invalid date');
                }
            }
            const appointments = await appointment_service_1.default.getDoctorAppointments(req.params.doctorId, status, dateObj);
            res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Check doctor's availability
     */
    async checkAvailability(req, res, next) {
        try {
            const { doctorId, date, startTime, endTime } = req.query;
            if (!doctorId || !date || !startTime || !endTime) {
                throw new errors_1.BadRequestError('Missing required parameters');
            }
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                throw new errors_1.BadRequestError('Invalid date');
            }
            await appointment_service_1.default.checkAvailability(doctorId, dateObj, startTime, endTime);
            res.status(200).json({
                success: true,
                available: true,
                message: 'Time slot is available',
            });
        }
        catch (error) {
            if (error instanceof errors_1.BadRequestError || error instanceof errors_1.NotFoundError) {
                return res.status(200).json({
                    success: true,
                    available: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }
}
exports.default = new AppointmentController();
