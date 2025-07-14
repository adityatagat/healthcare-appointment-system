"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = __importDefault(require("../controllers/appointment.controller"));
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/doctors/:doctorId/availability', validation_1.checkAvailabilityValidation, appointment_controller_1.default.checkAvailability);
// Protected routes (require authentication)
router.use(auth_1.authenticateJWT);
// Patient routes
router.get('/patients/:patientId/appointments', validation_1.patientIdValidation, (0, auth_1.authorizeRoles)(['patient', 'admin']), appointment_controller_1.default.getPatientAppointments);
// Doctor routes
router.get('/doctors/:doctorId/appointments', validation_1.doctorIdValidation, (0, auth_1.authorizeRoles)(['doctor', 'admin']), appointment_controller_1.default.getDoctorAppointments);
// Appointment routes
router.post('/appointments', validation_1.createAppointmentValidation, (0, auth_1.authorizeRoles)(['patient', 'admin']), appointment_controller_1.default.createAppointment);
router.get('/appointments/:id', validation_1.appointmentIdValidation, appointment_controller_1.default.getAppointment);
router.patch('/appointments/:id', validation_1.updateAppointmentValidation, appointment_controller_1.default.updateAppointment);
router.patch('/appointments/:id/cancel', validation_1.appointmentIdValidation, appointment_controller_1.default.cancelAppointment);
// Admin-only routes
router.use((0, auth_1.authorizeRoles)(['admin']));
// Additional admin endpoints can be added here
exports.default = router;
