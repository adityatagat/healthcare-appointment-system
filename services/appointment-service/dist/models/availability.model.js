"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const availabilitySchema = new mongoose_1.Schema({
    doctorId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            validator: function (value) {
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
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
// Compound index for doctor's availability
availabilitySchema.index({ doctorId: 1, dayOfWeek: 1, isRecurring: 1 }, { partialFilterExpression: { isRecurring: true } });
// Index for specific date availability
availabilitySchema.index({ doctorId: 1, specificDate: 1 }, { partialFilterExpression: { isRecurring: false } });
const Availability = mongoose_1.default.model('Availability', availabilitySchema);
exports.default = Availability;
