import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
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
    defaultSets: {
      type: Number,
      default: 0,
      min: 0
    },
    defaultReps: {
      type: String,
      default: '',
      trim: true
    },
    defaultRounds: {
      type: Number,
      default: 0,
      min: 0
    },
    defaultDurationSeconds: {
      type: Number,
      default: 0,
      min: 0
    },
    defaultRestSeconds: {
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
    mediaSyncedAt: {
      type: Date,
      default: null
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

exerciseSchema.index({ category: 1, name: 1 }, { unique: true });
exerciseSchema.index({ modality: 1, category: 1, name: 1 });
exerciseSchema.index({ modality: 1, category: 1, subcategory: 1, name: 1 });

export const Exercise = mongoose.model('Exercise', exerciseSchema);
