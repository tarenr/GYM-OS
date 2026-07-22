import mongoose from 'mongoose';

const templateExerciseSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    subcategory: {
      type: String,
      default: '',
      trim: true
    },
    modality: {
      type: String,
      default: 'strength',
      trim: true,
      lowercase: true
    },
    measurementType: {
      type: String,
      default: 'sets_reps_weight',
      trim: true
    },
    equipment: {
      type: [String],
      default: []
    },
    plannedSets: {
      type: Number,
      default: 0,
      min: 0
    },
    plannedReps: {
      type: String,
      default: '',
      trim: true
    },
    plannedRounds: {
      type: Number,
      default: 0,
      min: 0
    },
    plannedDurationSeconds: {
      type: Number,
      default: 0,
      min: 0
    },
    plannedRestSeconds: {
      type: Number,
      default: 0,
      min: 0
    },
    mediaProvider: {
      type: String,
      default: '',
      trim: true
    },
    externalExerciseId: {
      type: String,
      default: '',
      trim: true
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true
    },
    imageAlt: {
      type: String,
      default: '',
      trim: true
    },
    imageLicense: {
      type: String,
      default: '',
      trim: true
    },
    imageLicenseUrl: {
      type: String,
      default: '',
      trim: true
    },
    imageAuthor: {
      type: String,
      default: '',
      trim: true
    },
    imageAuthorUrl: {
      type: String,
      default: '',
      trim: true
    },
    imageSourceUrl: {
      type: String,
      default: '',
      trim: true
    },
    instructions: {
      type: [String],
      default: []
    },
    tips: {
      type: [String],
      default: []
    },
    order: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const workoutTemplateSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      default: '',
      trim: true
    },
    xpReward: {
      type: Number,
      default: 0,
      min: 0
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    workoutTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutType',
      default: null
    },
    workoutTypeCode: {
      type: String,
      default: 'strength',
      trim: true,
      lowercase: true
    },
    workoutTypeName: {
      type: String,
      default: 'Musculacao',
      trim: true
    },
    measurementType: {
      type: String,
      default: 'sets_reps_weight',
      trim: true
    },
    exercises: {
      type: [templateExerciseSchema],
      validate: {
        validator: (exercises) => Array.isArray(exercises) && exercises.length > 0,
        message: 'A ficha precisa ter pelo menos um exercicio.'
      }
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

workoutTemplateSchema.index({ code: 1 }, { unique: true });

export const WorkoutTemplate = mongoose.model('WorkoutTemplate', workoutTemplateSchema);
