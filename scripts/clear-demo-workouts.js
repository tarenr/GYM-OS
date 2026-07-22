import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Workout } from '../src/models/Workout.js';

const demoBatch = 'demo-july-2026';
const shouldDelete = process.argv.includes('--yes');
const demoFilter = {
  $or: [
    { isDemo: true, demoBatch },
    { notes: /^\[DEMO\]/ }
  ]
};

async function main() {
  await connectDatabase();

  const count = await Workout.countDocuments(demoFilter);

  console.log(`Lote demo: ${demoBatch}`);
  console.log(`Treinos demo encontrados: ${count}`);

  if (!shouldDelete) {
    console.log('Modo previa: nenhum treino foi removido. Rode npm run demo:clear para apagar este lote.');
    return;
  }

  const result = await Workout.deleteMany(demoFilter);
  console.log(`Treinos demo removidos: ${result.deletedCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
