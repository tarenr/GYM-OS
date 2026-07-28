import 'dotenv/config';
import { Exercise } from '../../src/models/Exercise.js';
import { Workout } from '../../src/models/Workout.js';
import { WorkoutTemplate } from '../../src/models/WorkoutTemplate.js';
import { buildNameFilter, buildSet, printJson, withDatabase } from './_helpers.js';

const CONFIG = {
  exerciseName: 'Mountain climber',
  exact: true,
  dryRun: true,
  catalogFields: {
    defaultReps: '30-45'
  },
  templateFields: {
    plannedReps: '30-45'
  },
  workoutFields: {
    plannedReps: '30-45'
  }
};

function hasFields(fields) {
  return Object.values(fields || {}).some((value) => value !== undefined);
}

async function previewCollection(Model, query, projection = null) {
  return Model.find(query, projection).limit(10).lean();
}

await withDatabase(async () => {
  const nameFilter = buildNameFilter(CONFIG.exerciseName, { exact: CONFIG.exact });
  const catalogSet = buildSet('', CONFIG.catalogFields);
  const templateSet = buildSet('exercises.$[exercise].', CONFIG.templateFields);
  const workoutSet = buildSet('exercises.$[exercise].', CONFIG.workoutFields);

  const before = {
    catalog: await Exercise.countDocuments({ name: nameFilter }),
    templates: await WorkoutTemplate.countDocuments({ 'exercises.name': nameFilter }),
    workouts: await Workout.countDocuments({ 'exercises.name': nameFilter })
  };
  const sample = {
    catalog: await previewCollection(Exercise, { name: nameFilter }, { name: 1, category: 1, defaultReps: 1, loadMode: 1 }),
    templates: await previewCollection(WorkoutTemplate, { 'exercises.name': nameFilter }, { code: 1, name: 1, 'exercises.$': 1 }),
    workouts: await previewCollection(Workout, { 'exercises.name': nameFilter }, { date: 1, workoutCode: 1, workoutName: 1, 'exercises.$': 1 })
  };
  const result = {
    mode: CONFIG.dryRun ? 'dry-run' : 'write',
    config: CONFIG,
    before,
    sampleBefore: sample,
    updates: {
      catalog: catalogSet,
      templates: templateSet,
      workouts: workoutSet
    }
  };

  if (!CONFIG.dryRun) {
    result.modified = {};

    if (hasFields(catalogSet)) {
      const write = await Exercise.updateMany({ name: nameFilter }, { $set: catalogSet });
      result.modified.catalog = { matched: write.matchedCount, modified: write.modifiedCount };
    }

    if (hasFields(templateSet)) {
      const write = await WorkoutTemplate.updateMany(
        { 'exercises.name': nameFilter },
        { $set: templateSet },
        { arrayFilters: [{ 'exercise.name': nameFilter }] }
      );
      result.modified.templates = { matched: write.matchedCount, modified: write.modifiedCount };
    }

    if (hasFields(workoutSet)) {
      const write = await Workout.updateMany(
        { 'exercises.name': nameFilter },
        { $set: workoutSet },
        { arrayFilters: [{ 'exercise.name': nameFilter }] }
      );
      result.modified.workouts = { matched: write.matchedCount, modified: write.modifiedCount };
    }

    result.after = {
      catalog: await Exercise.countDocuments({ name: nameFilter }),
      templates: await WorkoutTemplate.countDocuments({ 'exercises.name': nameFilter }),
      workouts: await Workout.countDocuments({ 'exercises.name': nameFilter })
    };
  }

  printJson('Exercise field update', result);
});
