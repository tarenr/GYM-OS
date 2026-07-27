import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Exercise } from '../src/models/Exercise.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';
import { syncTemplateExerciseSubcategories } from '../src/services/syncTemplateExerciseSubcategories.js';

const shouldWrite = process.argv.includes('--write');

function buildExerciseKeys(exercise) {
  return [
    `${exercise.modality || 'strength'}|${exercise.category}|${exercise.name}`,
    `${exercise.modality || 'strength'}|${exercise.name}`
  ];
}

async function buildExerciseIndex() {
  const exercises = await Exercise.find({ active: true }).lean();
  const exerciseByKey = new Map();

  exercises.forEach((exercise) => {
    buildExerciseKeys(exercise).forEach((key) => {
      if (!exerciseByKey.has(key)) {
        exerciseByKey.set(key, exercise);
      }
    });
  });

  return exerciseByKey;
}

async function getSummary() {
  const exerciseByKey = await buildExerciseIndex();
  const templates = await WorkoutTemplate.find({ active: true }).sort({ code: 1 }).lean();
  const rows = [];

  for (const template of templates) {
    for (const templateExercise of template.exercises || []) {
      const catalogExercise = buildExerciseKeys(templateExercise)
        .map((key) => exerciseByKey.get(key))
        .find(Boolean);
      const templateImage = String(templateExercise.imageUrl || '').trim();
      const catalogImage = String(catalogExercise?.imageUrl || '').trim();

      rows.push({
        template: template.code,
        exercise: templateExercise.name,
        modality: templateExercise.modality,
        status: !catalogExercise
          ? 'catalog-not-found'
          : !catalogImage
            ? 'catalog-missing-image'
            : templateImage === catalogImage
              ? 'synced'
              : 'needs-sync',
        templateImage,
        catalogImage
      });
    }
  }

  return rows;
}

async function main() {
  await connectDatabase();

  if (shouldWrite) {
    await syncTemplateExerciseSubcategories();
  }

  const rows = await getSummary();
  const counts = rows.reduce((items, row) => {
    items[row.status] = (items[row.status] || 0) + 1;
    return items;
  }, {});

  console.log(`Mode: ${shouldWrite ? 'write' : 'preview'}`);
  console.table(counts);
  console.table(rows.filter((row) => row.status !== 'synced'));

  if (!shouldWrite) {
    console.log('No changes saved. Run with --write to apply.');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
