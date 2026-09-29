import { createModel } from '../queryEngine.js';

export const WorkoutTypeSqlite = createModel({
  table: 'workout_types',
  timestamps: true,
  columns: {
    code: { column: 'code', type: 'text', required: true },
    name: { column: 'name', type: 'text', required: true },
    description: { column: 'description', type: 'text', default: '' },
    measurementType: {
      column: 'measurement_type',
      type: 'text',
      required: true,
      enum: ['sets_reps_weight', 'sets_reps', 'rounds_time', 'rounds_time_reps', 'duration', 'distance', 'free']
    },
    fields: { column: 'fields', type: 'json', default: () => [] },
    active: { column: 'active', type: 'boolean', default: true }
  }
});
