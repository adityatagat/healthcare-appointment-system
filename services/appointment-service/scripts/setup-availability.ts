import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { IAvailability } from '../src/models/availability.model';
import Availability from '../src/models/availability.model';

dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Set up doctor's availability
async function setupAvailability() {
  try {
    const doctorId = '64d5f7b3e8b9f6b5e8f7c6d6'; // Same as in test-appointment.json
    
    // Clear existing availability for this doctor
    await Availability.deleteMany({ doctorId });
    
    // Set up availability for Monday to Friday (1-5), 9 AM to 5 PM
    for (let day = 1; day <= 5; day++) {
      await Availability.create({
        doctorId,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: true,
        isAvailable: true,
        maxAppointments: 16, // 8 hours * 2 slots per hour (30 min each)
        appointmentDuration: 30
      });
      console.log(`Set up availability for day ${day}`);
    }
    
    console.log('Availability setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up availability:', error);
    process.exit(1);
  }
};

// Run the setup
connectDB().then(() => {
  setupAvailability();
});
