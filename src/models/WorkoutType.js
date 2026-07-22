import mongoose from 'mongoose';

const workoutTypeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    measurementType: {
      type: String,
      required: true,
      enum: ['sets_reps_weight', 'sets_reps', 'rounds_time', 'rounds_time_reps', 'duration', 'distance', 'free']
    },
    fields: {
      type: [String],
      default: []
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

workoutTypeSchema.index({ code: 1 }, { unique: true });

export const WorkoutType = mongoose.model('WorkoutType', workoutTypeSchema);
