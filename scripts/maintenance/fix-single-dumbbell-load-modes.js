import 'dotenv/config';
import { Exercise } from '../../src/models/Exercise.js';
import { Workout } from '../../src/models/Workout.js';
import { WorkoutTemplate } from '../../src/models/WorkoutTemplate.js';
import { printJson, withDatabase } from './_helpers.js';

const CONFIG = {
  dryRun: false,
  loadMode: 'single_dumbbell',
  exerciseNames: [
    'Supported single-arm dumbbell row',
    'Concentration curl',
    'Dumbbell Russian twist',
    'Dumbbell hip thrust',
    'Dumbbell sumo squat',
    'Goblet squat',
    'Dumbbell triceps kickback',
    'Overhead dumbbell triceps extension'
  ]
};

function nameFilter() {
  return { $in: CONFIG.exerciseNames.map((name) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')) };
}

function patchExercises(exercises = []) {
  let changed = 0;

  const nextExercises = exercises.map((exercise) => {
    if (!CONFIG.exerciseNames.some((name) => name.toLowerCase() === String(exercise.name || '').toLowerCase())) {
      return exercise;
    }

    if (exercise.loadMode === CONFIG.loadMode) {
      return exercise;
    }

    changed += 1;
    return {
      ...exercise,
      loadMode: CONFIG.loadMode
    };
  });

  return { changed, exercises: nextExercises };
}

await withDatabase(async () => {
  const filter = nameFilter();
  const catalogMatches = await Exercise.find({ name: filter }).sort({ category: 1, name: 1 }).lean();
  const templateMatches = await WorkoutTemplate.find({ 'exercises.name': filter }).sort({ code: 1 }).lean();
  const workoutMatches = await Workout.find({ 'exercises.name': filter }).sort({ date: -1, workoutCode: 1 }).lean();
  const templateUpdates = [];
  const workoutUpdates = [];

  for (const template of templateMatches) {
    const patched = patchExercises(template.exercises || []);

    if (patched.changed) {
      templateUpdates.push({
        id: template._id,
        code: template.code,
        changed: patched.changed,
        exercises: patched.exercises
      });
    }
  }

  for (const workout of workoutMatches) {
    const patched = patchExercises(workout.exercises || []);

    if (patched.changed) {
      workoutUpdates.push({
        id: workout._id,
        date: workout.date,
        code: workout.workoutCode,
        changed: patched.changed,
        exercises: patched.exercises
      });
    }
  }

  if (!CONFIG.dryRun) {
    await Exercise.updateMany({ name: filter }, { $set: { loadMode: CONFIG.loadMode } });

    for (const update of templateUpdates) {
      await WorkoutTemplate.updateOne({ _id: update.id }, { $set: { exercises: update.exercises } });
    }

    for (const update of workoutUpdates) {
      await Workout.updateOne({ _id: update.id }, { $set: { exercises: update.exercises } });
    }
  }

  printJson('Single dumbbell loadMode fix', {
    config: CONFIG,
    dryRun: CONFIG.dryRun,
    catalogMatched: catalogMatches.length,
    templatesMatched: templateMatches.length,
    templatesChanged: templateUpdates.length,
    workoutDocumentsMatched: workoutMatches.length,
    workoutDocumentsChanged: workoutUpdates.length,
    catalog: catalogMatches.map((exercise) => ({
      name: exercise.name,
      category: exercise.category,
      before: exercise.loadMode,
      after: CONFIG.loadMode
    })),
    templates: templateUpdates.map((template) => ({
      code: template.code,
      changed: template.changed
    })),
    workouts: workoutUpdates.map((workout) => ({
      date: workout.date,
      code: workout.code,
      changed: workout.changed
    }))
  });
});
