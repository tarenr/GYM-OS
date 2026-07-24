import mongoose from 'mongoose';

const measurementsSchema = new mongoose.Schema(
  {
    waist: { type: Number, default: 0, min: 0, max: 300 },
    abdomen: { type: Number, default: 0, min: 0, max: 300 },
    chest: { type: Number, default: 0, min: 0, max: 300 },
    rightArm: { type: Number, default: 0, min: 0, max: 150 },
    leftArm: { type: Number, default: 0, min: 0, max: 150 },
    rightThigh: { type: Number, default: 0, min: 0, max: 200 },
    leftThigh: { type: Number, default: 0, min: 0, max: 200 }
  },
  { _id: false }
);

const bodyMeasurementSchema = new mongoose.Schema(
  {
    measuredAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    weightKg: {
      type: Number,
      default: 0,
      min: 0,
      max: 500
    },
    measurementsCm: {
      type: measurementsSchema,
      default: () => ({})
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);

bodyMeasurementSchema.index({ measuredAt: -1 });

export const BodyMeasurement = mongoose.model('BodyMeasurement', bodyMeasurementSchema);
