import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAvailability extends Document {
  doctorId: Types.ObjectId;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // Format: 'HH:MM'
  endTime: string;   // Format: 'HH:MM'
  isRecurring: boolean;
  specificDate?: Date; // For non-recurring availability
  isAvailable: boolean;
  reason?: string;    // Reason for unavailability
  maxAppointments: number;
  appointmentDuration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySchema = new Schema<IAvailability>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: function () {
        return !this.specificDate;
      },
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      validate: {
        validator: function (this: IAvailability, value: string) {
          return value > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    isRecurring: {
      type: Boolean,
      default: true,
    },
    specificDate: {
      type: Date,
      required: function () {
        return !this.isRecurring;
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    maxAppointments: {
      type: Number,
      default: 1,
      min: 1,
    },
    appointmentDuration: {
      type: Number,
      default: 30,
      min: 5,
      max: 240, // 4 hours max per appointment
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for doctor's availability
availabilitySchema.index(
  { doctorId: 1, dayOfWeek: 1, isRecurring: 1 },
  { partialFilterExpression: { isRecurring: true } }
);

// Index for specific date availability
availabilitySchema.index(
  { doctorId: 1, specificDate: 1 },
  { partialFilterExpression: { isRecurring: false } }
);

const Availability = mongoose.model<IAvailability>('Availability', availabilitySchema);

export default Availability;
