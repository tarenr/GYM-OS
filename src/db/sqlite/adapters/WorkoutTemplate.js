import { createModel } from '../queryEngine.js';

export const WorkoutTemplateSqlite = createModel({
  table: 'workout_templates',
  timestamps: true,
  jsonArrayFields: ['exercises'],
  columns: {
    code: { column: 'code', type: 'text', required: true },
    name: { column: 'name', type: 'text', required: true },
    level: { column: 'level', type: 'text', default: '' },
    xpReward: { column: 'xp_reward', type: 'integer', default: 0 },
    description: { column: 'description', type: 'text', default: '' },
    workoutTypeId: { column: 'workout_type_id', type: 'text' },
    workoutTypeCode: { column: 'workout_type_code', type: 'text', default: 'strength' },
    workoutTypeName: { column: 'workout_type_name', type: 'text', default: 'Strength' },
    measurementType: { column: 'measurement_type', type: 'text', default: 'sets_reps_weight' },
    // Mongoose valida "pelo menos 1 exercicio" via validator custom — não replicado
    // neste adaptador genérico; ver docs/plano-migracao-sqlite-fase1.md.
    exercises: { column: 'exercises', type: 'json', required: true },
    active: { column: 'active', type: 'boolean', default: true }
  }
});
