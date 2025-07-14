import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import appointmentService, { ICreateAppointment, IUpdateAppointment } from '../services/appointment.service';
import { ValidationError, NotFoundError, BadRequestError } from '../utils/errors';
import logger from '../utils/logger';

class AppointmentController {
  /**
   * Create a new appointment
   */
  async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages: Record<string, string[]> = {};
        const errorArray = errors.array();
        
        errorArray.forEach((error: any) => {
          const param = (error as any).param || 'unknown';
          if (!errorMessages[param]) {
            errorMessages[param] = [];
          }
          errorMessages[param].push((error as any).msg);
        });
        
        throw new ValidationError(errorMessages);
      }

      const appointmentData: ICreateAppointment = {
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

      const appointment = await appointmentService.createAppointment(appointmentData);

      res.status(201).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      logger.error(`Create appointment error: ${error}`);
      next(error);
    }
  }

  /**
   * Get appointment by ID
   */
  async getAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.getAppointmentById(req.params.id);
      
      res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update appointment
   */
  async updateAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages: Record<string, string[]> = {};
        const errorArray = errors.array();
        
        errorArray.forEach((error: any) => {
          const param = (error as any).param || 'unknown';
          if (!errorMessages[param]) {
            errorMessages[param] = [];
          }
          errorMessages[param].push((error as any).msg);
        });
        
        throw new ValidationError(errorMessages);
      }

      const updateData: IUpdateAppointment = {
        status: req.body.status,
        notes: req.body.notes,
        reason: req.body.reason,
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(
        (key) => updateData[key as keyof IUpdateAppointment] === undefined && delete updateData[key as keyof IUpdateAppointment]
      );

      const appointment = await appointmentService.updateAppointment(
        req.params.id,
        updateData
      );

      res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.cancelAppointment(req.params.id);
      
      res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient's appointments
   */
  async getPatientAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, startDate, endDate } = req.query;
      
      let startDateObj: Date | undefined;
      let endDateObj: Date | undefined;

      if (startDate) {
        startDateObj = new Date(startDate as string);
        if (isNaN(startDateObj.getTime())) {
          throw new BadRequestError('Invalid start date');
        }
      }

      if (endDate) {
        endDateObj = new Date(endDate as string);
        if (isNaN(endDateObj.getTime())) {
          throw new BadRequestError('Invalid end date');
        }
      }

      const appointments = await appointmentService.getPatientAppointments(
        req.params.patientId,
        status as string,
        startDateObj,
        endDateObj
      );

      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get doctor's appointments
   */
  async getDoctorAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, date } = req.query;
      
      let dateObj: Date | undefined;
      if (date) {
        dateObj = new Date(date as string);
        if (isNaN(dateObj.getTime())) {
          throw new BadRequestError('Invalid date');
        }
      }

      const appointments = await appointmentService.getDoctorAppointments(
        req.params.doctorId,
        status as string,
        dateObj
      );

      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check doctor's availability
   */
  async checkAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctorId, date, startTime, endTime } = req.query;
      
      if (!doctorId || !date || !startTime || !endTime) {
        throw new BadRequestError('Missing required parameters');
      }

      const dateObj = new Date(date as string);
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestError('Invalid date');
      }

      await appointmentService.checkAvailability(
        doctorId as string,
        dateObj,
        startTime as string,
        endTime as string
      );

      res.status(200).json({
        success: true,
        available: true,
        message: 'Time slot is available',
      });
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
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

export default new AppointmentController();
