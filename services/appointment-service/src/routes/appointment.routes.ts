import { Router } from 'express';
import appointmentController from '../controllers/appointment.controller';
import {
  createAppointmentValidation,
  updateAppointmentValidation,
  appointmentIdValidation,
  patientIdValidation,
  doctorIdValidation,
  checkAvailabilityValidation,
} from '../middleware/validation';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management endpoints
 */

const router = Router();

// Public routes
router.get(
  '/doctors/:doctorId/availability',
  checkAvailabilityValidation,
  appointmentController.checkAvailability
);

// Protected routes (require authentication)
router.use(authenticateJWT);

// Patient routes
router.get(
  '/patients/:patientId/appointments',
  patientIdValidation,
  authorizeRoles(['patient', 'admin']),
  appointmentController.getPatientAppointments
);

// Doctor routes
router.get(
  '/doctors/:doctorId/appointments',
  doctorIdValidation,
  authorizeRoles(['doctor', 'admin']),
  appointmentController.getDoctorAppointments
);

// Appointment routes
/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentCreate'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/appointments',
  createAppointmentValidation,
  authorizeRoles(['patient', 'admin']),
  appointmentController.createAppointment
);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get an appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/appointments/:id',
  appointmentIdValidation,
  appointmentController.getAppointment
);

/**
 * @swagger
 * /appointments/{id}:
 *   patch:
 *     summary: Update an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentUpdate'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/appointments/:id',
  updateAppointmentValidation,
  appointmentController.updateAppointment
);

router.patch(
  '/appointments/:id/cancel',
  appointmentIdValidation,
  appointmentController.cancelAppointment
);

// Admin-only routes
router.use(authorizeRoles(['admin']));

// Additional admin endpoints can be added here

export default router;
