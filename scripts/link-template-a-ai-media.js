import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Exercise } from '../src/models/Exercise.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';
import { applyExerciseMedia } from '../src/services/exerciseMediaSyncService.js';

const shouldWrite = process.argv.includes('--write');

const mediaByExerciseName = new Map([
  [
    'flat dumbbell bench press',
    {
      imageUrl: '/assets/exercises/template-a/supino-reto-com-halteres.png',
      imageAlt: 'Start and end movement of flat dumbbell bench press'
    }
  ],
  [
    'reverse-grip dumbbell bench press',
    {
      imageUrl: '/assets/exercises/template-a/supino-reto-pegada-supinada.png',
      imageAlt: 'Start and end movement of reverse-grip dumbbell bench press'
    }
  ],
  [
    'flat dumbbell fly',
    {
      imageUrl: '/assets/exercises/template-a/crucifixo-reto-com-halteres.png',
      imageAlt: 'Start and end movement of flat dumbbell fly'
    }
  ],
  [
    'dumbbell pullover on bench',
    {
      imageUrl: '/assets/exercises/template-a/pullover-com-halter-no-banco-reto.png',
      imageAlt: 'Start and end movement of dumbbell pullover on bench'
    }
  ],
  [
    'dumbbell squeeze press',
    {
      imageUrl: '/assets/exercises/template-a/squeeze-press-com-halteres.png',
      imageAlt: 'Start and end movement of dumbbell squeeze press'
    }
  ],
  [
    'overhead dumbbell triceps extension',
    {
      imageUrl: '/assets/exercises/template-a/triceps-frances-com-halter.png',
      imageAlt: 'Start and end movement of overhead dumbbell triceps extension'
    }
  ],
  [
    'dumbbell skull crusher',
    {
      imageUrl: '/assets/exercises/template-a/triceps-testa-com-halteres.png',
      imageAlt: 'Start and end movement of dumbbell skull crusher'
    }
  ]
]);

function normalizeName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getMediaPayload(exerciseName) {
  const localMedia = mediaByExerciseName.get(normalizeName(exerciseName));

  if (!localMedia) {
    return null;
  }

  return {
    mediaProvider: 'ai-generated-local',
    externalExerciseId: '',
    imageUrl: localMedia.imageUrl,
    imageAlt: localMedia.imageAlt,
    imageLicense: 'AI generated for local project use',
    imageLicenseUrl: '',
    imageAuthor: 'Codex image generation',
    imageAuthorUrl: '',
    imageSourceUrl: '',
    tips: []
  };
}

async function findExercise(templateExercise) {
  if (templateExercise.exerciseId) {
    const exercise = await Exercise.findById(templateExercise.exerciseId);

    if (exercise) {
      return exercise;
    }
  }

  return Exercise.findOne({
    name: templateExercise.name,
    category: templateExercise.category,
    modality: templateExercise.modality || 'strength'
  });
}

async function main() {
  await connectDatabase();

  const template = await WorkoutTemplate.findOne({ code: 'A', active: true });

  if (!template) {
    throw new Error('Template A not found.');
  }

  const summary = [];

  for (const templateExercise of template.exercises) {
    const mediaPayload = getMediaPayload(templateExercise.name);
    const exercise = await findExercise(templateExercise);

    if (!mediaPayload) {
      summary.push({
        exercise: templateExercise.name,
        status: 'no image map',
        image: ''
      });
      continue;
    }

    if (!exercise) {
      summary.push({
        exercise: templateExercise.name,
        status: 'exercise not found',
        image: mediaPayload.imageUrl
      });
      continue;
    }

    if (shouldWrite) {
      await applyExerciseMedia(exercise, mediaPayload);
    }

    summary.push({
      exercise: templateExercise.name,
      status: shouldWrite ? 'linked' : 'preview',
      image: mediaPayload.imageUrl
    });
  }

  console.log(`Template: ${template.code} - ${template.name}`);
  console.log(`Mode: ${shouldWrite ? 'write' : 'preview'}`);
  console.table(summary);

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
