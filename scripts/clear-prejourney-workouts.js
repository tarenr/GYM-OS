import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Workout } from '../src/models/Workout.js';

const journeyStartDate = '2026-07-22';
const shouldDelete = process.argv.includes('--yes');
const start = new Date(`${journeyStartDate}T00:00:00.000Z`);
const preJourneyFilter = {
  date: { $lt: start }
};

function toDateKey(dateValue) {
  return new Date(dateValue).toISOString().slice(0, 10);
}

async function main() {
  await connectDatabase();

  const workouts = await Workout.find(preJourneyFilter)
    .select('date workoutCode workoutName isDemo demoBatch')
    .sort({ date: 1, createdAt: 1 });

  console.log(`Inicio da jornada: ${journeyStartDate}`);
  console.log(`Treinos pre-jornada encontrados: ${workouts.length}`);

  if (workouts.length) {
    console.table(workouts.map((workout) => ({
      data: toDateKey(workout.date),
      ficha: workout.workoutCode,
      nome: workout.workoutName,
      demo: workout.isDemo ? 'sim' : 'nao',
      lote: workout.demoBatch || ''
    })));
  }

  if (!shouldDelete) {
    console.log('Modo previa: nenhum treino foi removido. Rode npm run journey:clear:prestart para apagar os treinos pre-jornada.');
    return;
  }

  const result = await Workout.deleteMany(preJourneyFilter);
  console.log(`Treinos pre-jornada removidos: ${result.deletedCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
