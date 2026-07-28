import 'dotenv/config';
import { Exercise } from '../../src/models/Exercise.js';
import { Workout } from '../../src/models/Workout.js';
import { WorkoutTemplate } from '../../src/models/WorkoutTemplate.js';
import { buildNameFilter, compactExercise, printJson, withDatabase } from './_helpers.js';

const CONFIG = {
  exerciseName: 'Plank',
  exact: true,
  includeInactive: true,
  includeSavedWorkouts: true,
  workoutLimit: 20
};

await withDatabase(async () => {
  const nameFilter = buildNameFilter(CONFIG.exerciseName, { exact: CONFIG.exact });
  const exerciseQuery = {
    name: nameFilter,
    ...(CONFIG.includeInactive ? {} : { active: true })
  };

  const catalog = await Exercise.find(exerciseQuery).sort({ category: 1, name: 1 }).lean();
  const templates = await WorkoutTemplate.find({ 'exercises.name': nameFilter })
    .sort({ code: 1 })
    .lean();
  const workouts = CONFIG.includeSavedWorkouts
    ? await Workout.find({ 'exercises.name': nameFilter })
      .sort({ date: -1, createdAt: -1 })
      .limit(CONFIG.workoutLimit)
      .lean()
    : [];

  printJson('Exercise inspection', {
    config: CONFIG,
    counts: {
      catalog: catalog.length,
      templates: templates.length,
      workouts: workouts.length
    },
    catalog: catalog.map(compactExercise),
    templates: templates.map((template) => ({
      code: template.code,
      name: template.name,
      exercises: (template.exercises || [])
        .filter((exercise) => String(exercise.name || '').toLowerCase() === String(CONFIG.exerciseName).toLowerCase())
        .map(compactExercise)
    })),
    workouts: workouts.map((workout) => ({
      id: String(workout._id),
      date: workout.date,
      code: workout.workoutCode,
      name: workout.workoutName,
      exercises: (workout.exercises || [])
        .filter((exercise) => String(exercise.name || '').toLowerCase() === String(CONFIG.exerciseName).toLowerCase())
        .map((exercise) => ({
          ...compactExercise(exercise),
          skipped: exercise.skipped,
          sets: exercise.sets || [],
          rounds: exercise.rounds || []
        }))
    }))
  });
});
