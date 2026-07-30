import 'dotenv/config';
import { Workout } from '../../src/models/Workout.js';
import { printJson, toDateKey, withDatabase } from './_helpers.js';

const CONFIG = {
  dryRun: false,
  dateKey: '2026-07-30',
  workoutCode: 'C',
  exerciseName: 'Dumbbell front raise',
  fromSource: 'extra',
  toSource: 'planned'
};

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

await withDatabase(async () => {
  const workout = await Workout.findOne({
    workoutCode: CONFIG.workoutCode,
    date: {
      $gte: new Date(`${CONFIG.dateKey}T00:00:00.000Z`),
      $lte: new Date(`${CONFIG.dateKey}T23:59:59.999Z`)
    }
  });

  if (!workout) {
    throw new Error(`Workout ${CONFIG.workoutCode} on ${CONFIG.dateKey} not found.`);
  }

  const exercise = (workout.exercises || []).find((item) => (
    normalizeName(item.name) === normalizeName(CONFIG.exerciseName)
  ));

  if (!exercise) {
    throw new Error(`Exercise ${CONFIG.exerciseName} not found in workout ${workout._id}.`);
  }

  const before = {
    source: exercise.source,
    sets: (exercise.sets || []).map((set) => ({
      setNumber: set.setNumber,
      weight: set.weight,
      reps: set.reps
    }))
  };
  const shouldChange = exercise.source === CONFIG.fromSource;

  if (shouldChange && !CONFIG.dryRun) {
    exercise.source = CONFIG.toSource;
    await workout.save();
  }

  printJson('Workout exercise source reclassify', {
    config: CONFIG,
    changed: shouldChange && !CONFIG.dryRun,
    workout: {
      id: String(workout._id),
      date: toDateKey(workout.date),
      code: workout.workoutCode,
      name: workout.workoutName
    },
    exercise: {
      name: exercise.name,
      before,
      after: {
        source: shouldChange ? CONFIG.toSource : exercise.source,
        sets: before.sets
      }
    }
  });
});
