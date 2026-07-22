import mongoose from 'mongoose';

const missionBlockSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutTemplate',
      default: null
    },
    type: {
      type: String,
      required: true,
      enum: ['strength', 'combat', 'recovery']
    },
    modality: {
      type: String,
      default: '',
      trim: true
    },
    workoutCode: {
      type: String,
      default: '',
      trim: true,
      uppercase: true
    },
    workoutName: {
      type: String,
      default: '',
      trim: true
    },
    intensity: {
      type: String,
      default: '',
      trim: true
    },
    xpReward: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { _id: false }
);

const dailyMissionSchema = new mongoose.Schema(
  {
    dayIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 6
    },
    dayOfWeek: {
      type: String,
      required: true,
      trim: true
    },
    missionName: {
      type: String,
      required: true,
      trim: true
    },
    intensity: {
      type: String,
      default: '',
      trim: true
    },
    blocks: {
      type: [missionBlockSchema],
      default: []
    },
    bonusXp: {
      type: Number,
      default: 0,
      min: 0
    },
    restDay: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

dailyMissionSchema.index({ dayIndex: 1 }, { unique: true });

export const DailyMission = mongoose.model('DailyMission', dailyMissionSchema);
