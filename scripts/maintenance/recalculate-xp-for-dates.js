import 'dotenv/config';
import { Workout } from '../../src/models/Workout.js';
import { calculateWorkoutXpBreakdown, recalculateWorkoutDateXpSnapshots } from '../../src/services/xpCalculator.js';
import { buildNameFilter, printJson, toDateKey, uniqueDateKeys, withDatabase } from './_helpers.js';

const CONFIG = {
  dryRun: true,
  dates: [],
  exerciseName: '',
  exact: true
};

async function resolveDates() {
  if (CONFIG.dates.length) {
    return uniqueDateKeys(CONFIG.dates);
  }

  if (CONFIG.exerciseName) {
    const nameFilter = buildNameFilter(CONFIG.exerciseName, { exact: CONFIG.exact });
    return uniqueDateKeys(await Workout.distinct('date', { 'exercises.name': nameFilter }));
  }

  return uniqueDateKeys(await Workout.distinct('date'));
}

async function previewDate(dateKey) {
  const start = new Date(`${dateKey}T00:00:00.000Z`);
  const end = new Date(`${dateKey}T00:00:00.000Z`);

  end.setUTCDate(end.getUTCDate() + 1);

  const workouts = await Workout.find({ date: { $gte: start, $lt: end } }).sort({ createdAt: 1 });

  return {
    date: dateKey,
    workouts: workouts.length,
    currentXp: workouts.reduce((total, workout) => total + Number(workout.xp?.total || 0), 0),
    previewExecutionXp: workouts.reduce((total, workout) => total + calculateWorkoutXpBreakdown(workout).total, 0)
  };
}

await withDatabase(async () => {
  const dates = await resolveDates();
  const result = {
    mode: CONFIG.dryRun ? 'dry-run' : 'write',
    config: CONFIG,
    dates
  };

  if (CONFIG.dryRun) {
    result.preview = [];

    for (const dateKey of dates) {
      result.preview.push(await previewDate(dateKey));
    }
  } else {
    result.recalculated = [];

    for (const dateKey of dates) {
      const updated = await recalculateWorkoutDateXpSnapshots(dateKey);
      result.recalculated.push({
        date: dateKey,
        workouts: updated.length,
        xpTotal: updated.reduce((total, workout) => total + Number(workout.xp?.total || 0), 0)
      });
    }
  }

  printJson('XP recalculation', result);
});
