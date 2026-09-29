import { createModel } from '../queryEngine.js';

function totalVolume(doc) {
  return (doc.exercises || []).reduce((workoutTotal, exercise) => {
    const multiplier = exercise.loadMode === 'dumbbell_each' ? 2 : 1;
    const exerciseTotal = (exercise.sets || []).reduce((setTotal, set) => {
      return setTotal + set.weight * multiplier * set.reps;
    }, 0);

    return workoutTotal + exerciseTotal;
  }, 0);
}

export const WorkoutSqlite = createModel({
  table: 'workouts',
  timestamps: true,
  jsonArrayFields: ['exercises'],
  virtuals: { totalVolume },
  columns: {
    date: { column: 'date', type: 'date', required: true },
    templateId: { column: 'template_id', type: 'text' },
    workoutCode: { column: 'workout_code', type: 'text', required: true },
    workoutName: { column: 'workout_name', type: 'text', required: true },
    missionDate: { column: 'mission_date', type: 'date' },
    missionBlockType: { column: 'mission_block_type', type: 'text', default: '' },
    missionOriginalWorkoutCode: { column: 'mission_original_workout_code', type: 'text', default: '' },
    missionOriginalWorkoutName: { column: 'mission_original_workout_name', type: 'text', default: '' },
    missionSubstitution: { column: 'mission_substitution', type: 'boolean', default: false },
    durationMinutes: { column: 'duration_minutes', type: 'integer', default: 0 },
    // Mongoose valida "pelo menos 1 exercicio" via validator custom — não replicado
    // neste adaptador genérico; ver docs/plano-migracao-sqlite-fase1.md.
    exercises: { column: 'exercises', type: 'json', required: true },
    notes: { column: 'notes', type: 'text', default: '' },
    xp: { column: 'xp', type: 'json', default: () => ({}) },
    isDemo: { column: 'is_demo', type: 'boolean', default: false },
    demoBatch: { column: 'demo_batch', type: 'text', default: '' }
  }
});
