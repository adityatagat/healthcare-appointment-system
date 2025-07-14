"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const appointment_model_1 = __importDefault(require("../models/appointment.model"));
const availability_model_1 = __importDefault(require("../models/availability.model"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
class AppointmentService {
    /**
     * Create a new appointment
     */
    async createAppointment(data) {
        const { patientId, doctorId, appointmentDate, startTime, endTime, reason, notes, isFollowUp = false, previousAppointmentId, } = data;
        // Check if the time slot is available
        const availability = await this.checkAvailability(doctorId, appointmentDate, startTime, endTime);
        if (!availability.available) {
            throw new errors_1.BadRequestError(availability.message || 'Time slot is not available');
        }
        // Check if the patient already has an appointment at this time
        const existingAppointment = await appointment_model_1.default.findOne({
            patientId,
            appointmentDate,
            status: 'scheduled',
            $or: [
                {
                    $and: [
                        { startTime: { $lte: startTime } },
                        { endTime: { $gt: startTime } },
                    ],
                },
                {
                    $and: [
                        { startTime: { $lt: endTime } },
                        { endTime: { $gte: endTime } },
                    ],
                },
                {
                    $and: [
                        { startTime: { $gte: startTime } },
                        { endTime: { $lte: endTime } },
                    ],
                },
            ],
        });
        if (existingAppointment) {
            throw new errors_1.ConflictError('Patient already has an appointment at this time');
        }
        // Create the appointment
        const appointment = await appointment_model_1.default.create({
            patientId: new mongoose_1.Types.ObjectId(patientId),
            doctorId: new mongoose_1.Types.ObjectId(doctorId),
            appointmentDate,
            startTime,
            endTime,
            reason,
            notes,
            isFollowUp,
            previousAppointmentId: previousAppointmentId
                ? new mongoose_1.Types.ObjectId(previousAppointmentId)
                : undefined,
        });
        logger_1.default.info(`Appointment created: ${appointment.id}`);
        return appointment;
    }
    /**
     * Get appointment by ID
     */
    async getAppointmentById(appointmentId) {
        const appointment = await appointment_model_1.default.findById(appointmentId)
            .populate('patientId', 'name email')
            .populate('doctorId', 'name specialization');
        if (!appointment) {
            throw new errors_1.NotFoundError('Appointment not found');
        }
        return appointment;
    }
    /**
     * Update appointment
     */
    async updateAppointment(appointmentId, data) {
        const appointment = await appointment_model_1.default.findByIdAndUpdate(appointmentId, { $set: data }, { new: true, runValidators: true });
        if (!appointment) {
            throw new errors_1.NotFoundError('Appointment not found');
        }
        logger_1.default.info(`Appointment ${appointmentId} updated`);
        return appointment;
    }
    /**
     * Cancel an appointment
     */
    async cancelAppointment(appointmentId) {
        const appointment = await appointment_model_1.default.findById(appointmentId);
        if (!appointment) {
            throw new errors_1.NotFoundError('Appointment not found');
        }
        if (appointment.status === 'cancelled') {
            throw new errors_1.BadRequestError('Appointment is already cancelled');
        }
        appointment.status = 'cancelled';
        await appointment.save();
        logger_1.default.info(`Appointment ${appointmentId} cancelled`);
        return appointment;
    }
    /**
     * Get appointments by patient ID
     */
    async getPatientAppointments(patientId, status, startDate, endDate) {
        const query = { patientId: new mongoose_1.Types.ObjectId(patientId) };
        if (status) {
            query.status = status;
        }
        if (startDate && endDate) {
            query.appointmentDate = { $gte: startDate, $lte: endDate };
        }
        else if (startDate) {
            query.appointmentDate = { $gte: startDate };
        }
        else if (endDate) {
            query.appointmentDate = { $lte: endDate };
        }
        return appointment_model_1.default.find(query)
            .populate('doctorId', 'name specialization')
            .sort({ appointmentDate: 1, startTime: 1 });
    }
    /**
     * Get appointments by doctor ID
     */
    async getDoctorAppointments(doctorId, status, date) {
        const query = { doctorId: new mongoose_1.Types.ObjectId(doctorId) };
        if (status) {
            query.status = status;
        }
        if (date) {
            query.appointmentDate = date;
        }
        return appointment_model_1.default.find(query)
            .populate('patientId', 'name dateOfBirth')
            .sort({ appointmentDate: 1, startTime: 1 });
    }
    /**
     * Check doctor's availability
     */
    async checkAvailability(doctorId, date, startTime, endTime) {
        const dayOfWeek = date.getDay();
        const startDateTime = new Date(`${date.toISOString().split('T')[0]}T${startTime}`);
        const endDateTime = new Date(`${date.toISOString().split('T')[0]}T${endTime}`);
        // Check if the time slot is within working hours
        const availability = await availability_model_1.default.findOne({
            doctorId,
            $or: [
                { isRecurring: true, dayOfWeek },
                { isRecurring: false, specificDate: date },
            ],
            startTime: { $lte: startTime },
            endTime: { $gte: endTime },
            isAvailable: true,
        });
        if (!availability) {
            return { available: false, message: 'Doctor is not available at the requested time' };
        }
        // Check for overlapping appointments
        const overlappingAppointments = await appointment_model_1.default.countDocuments({
            doctorId,
            appointmentDate: date,
            status: { $ne: 'cancelled' },
            $or: [
                {
                    $and: [
                        { startTime: { $lt: endTime } },
                        { endTime: { $gt: startTime } },
                    ],
                },
            ],
        });
        if (overlappingAppointments >= (availability.maxAppointments || 1)) {
            return { available: false, message: 'Time slot is already booked' };
        }
        return { available: true };
    }
}
exports.default = new AppointmentService();
