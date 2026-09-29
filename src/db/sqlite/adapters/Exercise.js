import { createModel } from '../queryEngine.js';

export const ExerciseSqlite = createModel({
  table: 'exercises',
  timestamps: true,
  columns: {
    name: { column: 'name', type: 'text', required: true },
    category: { column: 'category', type: 'text', required: true },
    subcategory: { column: 'subcategory', type: 'text', default: '' },
    modality: { column: 'modality', type: 'text', default: 'strength' },
    measurementType: { column: 'measurement_type', type: 'text', default: 'sets_reps_weight' },
    loadMode: {
      column: 'load_mode',
      type: 'text',
      default: 'dumbbell_each',
      enum: ['dumbbell_each', 'single_dumbbell', 'bar_total', 'machine_stack', 'bodyweight', 'non_weight']
    },
    equipment: { column: 'equipment', type: 'json', default: () => [] },
    defaultSets: { column: 'default_sets', type: 'integer', default: 0 },
    defaultReps: { column: 'default_reps', type: 'text', default: '' },
    defaultRounds: { column: 'default_rounds', type: 'integer', default: 0 },
    defaultDurationSeconds: { column: 'default_duration_seconds', type: 'integer', default: 0 },
    defaultRestSeconds: { column: 'default_rest_seconds', type: 'integer', default: 0 },
    mediaProvider: { column: 'media_provider', type: 'text', default: '' },
    externalExerciseId: { column: 'external_exercise_id', type: 'text', default: '' },
    imageUrl: { column: 'image_url', type: 'text', default: '' },
    imageAlt: { column: 'image_alt', type: 'text', default: '' },
    imageLicense: { column: 'image_license', type: 'text', default: '' },
    imageLicenseUrl: { column: 'image_license_url', type: 'text', default: '' },
    imageAuthor: { column: 'image_author', type: 'text', default: '' },
    imageAuthorUrl: { column: 'image_author_url', type: 'text', default: '' },
    imageSourceUrl: { column: 'image_source_url', type: 'text', default: '' },
    instructions: { column: 'instructions', type: 'json', default: () => [] },
    tips: { column: 'tips', type: 'json', default: () => [] },
    mediaSyncedAt: { column: 'media_synced_at', type: 'date' },
    active: { column: 'active', type: 'boolean', default: true }
  }
});
