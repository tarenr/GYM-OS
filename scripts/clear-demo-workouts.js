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

  console.log(`Demo batch: ${demoBatch}`);
  console.log(`Treinos demo encontrados: ${count}`);

  if (!shouldDelete) {
    console.log('Preview mode: no workout was removed. Run npm run demo:clear to delete this batch.');
    return;
  }

  const result = await Workout.deleteMany(demoFilter);
  console.log(`Treinos demo removeds: ${result.deletedCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
