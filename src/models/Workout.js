import mongoose from 'mongoose';

const setSchema = new mongoose.Schema(
  {
    setNumber: {
      type: Number,
      required: true,
      min: 1
    },
    weight: {
      type: Number,
      required: true,
      min: 0
    },
    reps: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const roundSchema = new mongoose.Schema(
  {
    roundNumber: {
      type: Number,
      required: true,
      min: 1
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0
    },
    restSeconds: {
      type: Number,
      default: 0,
      min: 0
    },
    reps: {
      type: Number,
      default: 0,
      min: 0
    },
    intensity: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    completed: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    muscleGroup: {
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
      trim: true
    },
    measurementType: {
      type: String,
      default: 'sets_reps_weight',
      trim: true
    },
    source: {
      type: String,
      enum: ['planned', 'extra'],
      default: 'planned'
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
    completedSets: {
      type: Number,
      default: 0,
      min: 0
    },
    completedRounds: {
      type: Number,
      default: 0,
      min: 0
    },
    sets: {
      type: [setSchema],
      default: []
    },
    rounds: {
      type: [roundSchema],
      default: []
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: false }
);

const xpBreakdownSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: '',
      trim: true
    },
    label: {
      type: String,
      default: '',
      trim: true
    },
    xp: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const xpSnapshotSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      default: 'xp-v2.1',
      trim: true
    },
    execution: {
      type: Number,
      default: 0
    },
    campaign: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    calculatedAt: {
      type: Date,
      default: null
    },
    breakdown: {
      type: [xpBreakdownSchema],
      default: []
    }
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutTemplate'
    },
    workoutCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    workoutName: {
      type: String,
      required: true,
      trim: true
    },
    missionDate: {
      type: Date,
      default: null
    },
    missionBlockType: {
      type: String,
      default: '',
      trim: true
    },
    missionOriginalWorkoutCode: {
      type: String,
      default: '',
      trim: true,
      uppercase: true
    },
    missionOriginalWorkoutName: {
      type: String,
      default: '',
      trim: true
    },
    missionSubstitution: {
      type: Boolean,
      default: false
    },
    durationMinutes: {
      type: Number,
      min: 0,
      default: 0
    },
    exercises: {
      type: [exerciseSchema],
      validate: {
        validator: (exercises) => Array.isArray(exercises) && exercises.length > 0,
        message: 'O treino precisa ter pelo menos um exercicio.'
      }
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    xp: {
      type: xpSnapshotSchema,
      default: () => ({})
    },
    isDemo: {
      type: Boolean,
      default: false
    },
    demoBatch: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

workoutSchema.virtual('totalVolume').get(function totalVolume() {
  return this.exercises.reduce((workoutTotal, exercise) => {
    const exerciseTotal = (exercise.sets || []).reduce((setTotal, set) => {
      return setTotal + set.weight * set.reps;
    }, 0);

    return workoutTotal + exerciseTotal;
  }, 0);
});

workoutSchema.index({ date: -1 });
workoutSchema.index({ workoutCode: 1, date: -1 });
workoutSchema.index({ missionDate: 1, missionBlockType: 1, missionOriginalWorkoutCode: 1 });
workoutSchema.index({ isDemo: 1, demoBatch: 1 });

export const Workout = mongoose.model('Workout', workoutSchema);
