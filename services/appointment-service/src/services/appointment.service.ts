import { Types } from 'mongoose';
import Appointment, { IAppointment } from '../models/appointment.model';
import Availability from '../models/availability.model';
import logger from '../utils/logger';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';

export interface ICreateAppointment {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  reason: string;
  notes?: string;
  isFollowUp?: boolean;
  previousAppointmentId?: string;
}

export interface IUpdateAppointment {
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  reason?: string;
}

class AppointmentService {
  /**
   * Create a new appointment
   */
  async createAppointment(data: ICreateAppointment): Promise<IAppointment> {
    const {
      patientId,
      doctorId,
      appointmentDate,
      startTime,
      endTime,
      reason,
      notes,
      isFollowUp = false,
      previousAppointmentId,
    } = data;

    // Check if the time slot is available
    const availability = await this.checkAvailability(doctorId, appointmentDate, startTime, endTime);
    if (!availability.available) {
      throw new BadRequestError(availability.message || 'Time slot is not available');
    }

    // Check if the patient already has an appointment at this time
    const existingAppointment = await Appointment.findOne({
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
      throw new ConflictError('Patient already has an appointment at this time');
    }

    // Create the appointment
    const appointment = await Appointment.create({
      patientId: new Types.ObjectId(patientId),
      doctorId: new Types.ObjectId(doctorId),
      appointmentDate,
      startTime,
      endTime,
      reason,
      notes,
      isFollowUp,
      previousAppointmentId: previousAppointmentId
        ? new Types.ObjectId(previousAppointmentId)
        : undefined,
    });

    logger.info(`Appointment created: ${appointment.id}`);
    return appointment;
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(appointmentId: string): Promise<IAppointment> {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization');

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    return appointment;
  }

  /**
   * Update appointment
   */
  async updateAppointment(
    appointmentId: string,
    data: IUpdateAppointment
  ): Promise<IAppointment> {
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    logger.info(`Appointment ${appointmentId} updated`);
    return appointment;
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId: string): Promise<IAppointment> {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    if (appointment.status === 'cancelled') {
      throw new BadRequestError('Appointment is already cancelled');
    }

    appointment.status = 'cancelled';
    await appointment.save();

    logger.info(`Appointment ${appointmentId} cancelled`);
    return appointment;
  }

  /**
   * Get appointments by patient ID
   */
  async getPatientAppointments(
    patientId: string,
    status?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<IAppointment[]> {
    const query: any = { patientId: new Types.ObjectId(patientId) };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.appointmentDate = { $gte: startDate };
    } else if (endDate) {
      query.appointmentDate = { $lte: endDate };
    }

    return Appointment.find(query)
      .populate('doctorId', 'name specialization')
      .sort({ appointmentDate: 1, startTime: 1 });
  }

  /**
   * Get appointments by doctor ID
   */
  async getDoctorAppointments(
    doctorId: string,
    status?: string,
    date?: Date
  ): Promise<IAppointment[]> {
    const query: any = { doctorId: new Types.ObjectId(doctorId) };

    if (status) {
      query.status = status;
    }

    if (date) {
      query.appointmentDate = date;
    }

    return Appointment.find(query)
      .populate('patientId', 'name dateOfBirth')
      .sort({ appointmentDate: 1, startTime: 1 });
  }

  /**
   * Check doctor's availability
   */
  public async checkAvailability(
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<{ available: boolean; message?: string }> {
    const dayOfWeek = date.getDay();
    const startDateTime = new Date(`${date.toISOString().split('T')[0]}T${startTime}`);
    const endDateTime = new Date(`${date.toISOString().split('T')[0]}T${endTime}`);

    // Check if the time slot is within working hours
    const availability = await Availability.findOne({
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
    const overlappingAppointments = await Appointment.countDocuments({
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

export default new AppointmentService();
