import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Exercise } from '../src/models/Exercise.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';
import { syncExerciseImage } from '../src/services/exerciseMediaSyncService.js';
import { resolveWgerSearchQuery } from '../src/services/wgerMediaService.js';

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has('--write');
const force = args.has('--force');
const templateCodeArg = process.argv.find((arg) => arg.startsWith('--template='));
const templateCode = templateCodeArg ? String(templateCodeArg.split('=')[1] || '').toUpperCase() : '';
const delayMs = Number(process.env.WGER_SYNC_DELAY_MS || 500);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  await connectDatabase();

  const template = templateCode ? await WorkoutTemplate.findOne({ code: templateCode, active: true }) : null;

  if (templateCode && !template) {
    throw new Error(`Template ${templateCode} not found.`);
  }

  const exercises = template
    ? await Promise.all(template.exercises.map(async (templateExercise) => {
        const exercise = await Exercise.findById(templateExercise.exerciseId);
        return exercise || { name: templateExercise.name, missing: true };
      }))
    : await Exercise.find({ active: true }).sort({ modality: 1, category: 1, name: 1 });

  const summary = [];

  for (const exercise of exercises) {
    if (exercise.missing) {
      summary.push({
        exercise: exercise.name,
        status: 'not found',
        query: ''
      });
      continue;
    }

    if (!force && exercise.imageUrl) {
      summary.push({
        exercise: exercise.name,
        status: 'already linked',
        query: resolveWgerSearchQuery(exercise.name),
        result: exercise.externalExerciseId || exercise.mediaProvider || 'local'
      });
      continue;
    }

    const query = resolveWgerSearchQuery(exercise.name);
    let results = [];

    try {
      results = shouldWrite
        ? [await syncExerciseImage(exercise, { force })]
        : [];
    } catch (error) {
      summary.push({
        exercise: exercise.name,
        status: 'error',
        query,
        result: error.message
      });
      await sleep(delayMs);
      continue;
    }

    if (!shouldWrite) {
      summary.push({
        exercise: exercise.name,
        status: exercise.imageUrl ? 'already linked' : 'pending',
        query,
        result: exercise.externalExerciseId || ''
      });
      await sleep(delayMs);
      continue;
    }

    const result = results[0];

    if (!result || result.status === 'not-found' || result.status === 'unsupported-modality') {
      summary.push({
        exercise: exercise.name,
        status: result?.status === 'unsupported-modality' ? 'ignored' : 'no image',
        query
      });
      await sleep(delayMs);
      continue;
    }

    summary.push({
      exercise: exercise.name,
      status: result.status === 'already-linked' ? 'already linked' : 'linked',
      query,
      result: result.media ? `${result.media.externalExerciseId} - ${result.media.name}` : exercise.externalExerciseId || '',
      image: result.exercise?.imageUrl ? 'yes' : 'no',
      author: result.media?.imageAuthor || exercise.imageAuthor || ''
    });

    await sleep(delayMs);
  }

  console.log(template ? `Template: ${template.code} - ${template.name}` : 'Full exercise catalog');
  console.log(`Mode: ${shouldWrite ? 'write' : 'preview'}${force ? ' | force' : ''}`);
  console.table(summary);

  if (!shouldWrite) {
    console.log('No changes saved. Run npm run media:sync to link everything.');
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
