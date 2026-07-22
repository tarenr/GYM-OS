import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Workout } from '../src/models/Workout.js';
import { calculateWorkoutXpBreakdown, recalculateWorkoutDateXpSnapshots } from '../src/services/xpCalculator.js';

const shouldWrite = process.argv.includes('--write');

function toDateKey(dateValue) {
  return new Date(dateValue).toISOString().slice(0, 10);
}

async function getWorkoutDates() {
  const dates = await Workout.distinct('date');

  return [...new Set(dates.map(toDateKey))].sort();
}

async function previewDate(dateKey) {
  const start = new Date(`${dateKey}T00:00:00.000Z`);
  const end = new Date(`${dateKey}T00:00:00.000Z`);

  end.setUTCDate(end.getUTCDate() + 1);

  const workouts = await Workout.find({ date: { $gte: start, $lt: end } }).sort({ createdAt: 1 });
  const currentSnapshot = workouts.reduce((total, workout) => total + Number(workout.xp?.total || 0), 0);
  const executionPreview = workouts.reduce((total, workout) => total + calculateWorkoutXpBreakdown(workout).total, 0);
  const missingSnapshots = workouts.filter((workout) => !Number(workout.xp?.total || 0)).length;

  return {
    dateKey,
    workouts: workouts.length,
    missingSnapshots,
    currentSnapshot,
    executionPreview
  };
}

async function main() {
  await connectDatabase();

  const dates = await getWorkoutDates();

  console.log(`Datas com treinos: ${dates.length}`);

  if (!dates.length) {
    return;
  }

  if (!shouldWrite) {
    const preview = [];

    for (const dateKey of dates) {
      preview.push(await previewDate(dateKey));
    }

    console.table(preview);
    console.log('Modo previa: nenhum XP foi gravado. Rode npm run xp:recalculate para salvar snapshots.');
    return;
  }

  const results = [];

  for (const dateKey of dates) {
    const updated = await recalculateWorkoutDateXpSnapshots(dateKey);

    results.push({
      data: dateKey,
      treinos: updated.length,
      xpTotal: updated.reduce((total, workout) => total + Number(workout.xp?.total || 0), 0)
    });
  }

  console.table(results);
  console.log(`Snapshots recalculados para ${results.reduce((total, item) => total + item.treinos, 0)} treinos.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
