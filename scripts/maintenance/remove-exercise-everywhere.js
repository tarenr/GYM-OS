import 'dotenv/config';
import { Exercise } from '../../src/models/Exercise.js';
import { Workout } from '../../src/models/Workout.js';
import { WorkoutTemplate } from '../../src/models/WorkoutTemplate.js';
import { recalculateWorkoutDateXpSnapshots } from '../../src/services/xpCalculator.js';
import { buildNameFilter, printJson, uniqueDateKeys, withDatabase } from './_helpers.js';

const CONFIG = {
  exerciseName: 'Exercise name here',
  exact: false,
  dryRun: true,
  deleteFromCatalog: true,
  removeFromTemplates: true,
  removeFromWorkouts: true,
  recalculateAffectedXp: true
};

await withDatabase(async () => {
  const nameFilter = buildNameFilter(CONFIG.exerciseName, { exact: CONFIG.exact });
  const affectedDates = CONFIG.recalculateAffectedXp
    ? uniqueDateKeys(await Workout.distinct('date', { 'exercises.name': nameFilter }))
    : [];
  const before = {
    catalog: await Exercise.countDocuments({ name: nameFilter }),
    templates: await WorkoutTemplate.countDocuments({ 'exercises.name': nameFilter }),
    workouts: await Workout.countDocuments({ 'exercises.name': nameFilter }),
    affectedDates
  };
  const sample = {
    catalog: await Exercise.find({ name: nameFilter }, { name: 1, category: 1, active: 1 }).limit(10).lean(),
    templates: await WorkoutTemplate.find({ 'exercises.name': nameFilter }, { code: 1, name: 1, 'exercises.$': 1 }).limit(10).lean(),
    workouts: await Workout.find({ 'exercises.name': nameFilter }, { date: 1, workoutCode: 1, workoutName: 1, 'exercises.$': 1 }).limit(10).lean()
  };
  const result = {
    mode: CONFIG.dryRun ? 'dry-run' : 'write',
    config: CONFIG,
    before,
    sampleBefore: sample
  };

  if (!CONFIG.dryRun) {
    result.removed = {};

    if (CONFIG.deleteFromCatalog) {
      const write = await Exercise.deleteMany({ name: nameFilter });
      result.removed.catalog = write.deletedCount;
    }

    if (CONFIG.removeFromTemplates) {
      const write = await WorkoutTemplate.updateMany(
        { 'exercises.name': nameFilter },
        { $pull: { exercises: { name: nameFilter } } }
      );
      result.removed.templates = { matched: write.matchedCount, modified: write.modifiedCount };
    }

    if (CONFIG.removeFromWorkouts) {
      const write = await Workout.updateMany(
        { 'exercises.name': nameFilter },
        { $pull: { exercises: { name: nameFilter } } }
      );
      result.removed.workouts = { matched: write.matchedCount, modified: write.modifiedCount };
    }

    result.recalculated = [];

    if (CONFIG.recalculateAffectedXp) {
      for (const dateKey of affectedDates) {
        const updated = await recalculateWorkoutDateXpSnapshots(dateKey);
        result.recalculated.push({ date: dateKey, workouts: updated.length });
      }
    }

    result.after = {
      catalog: await Exercise.countDocuments({ name: nameFilter }),
      templates: await WorkoutTemplate.countDocuments({ 'exercises.name': nameFilter }),
      workouts: await Workout.countDocuments({ 'exercises.name': nameFilter })
    };
  }

  printJson('Exercise removal', result);
});
