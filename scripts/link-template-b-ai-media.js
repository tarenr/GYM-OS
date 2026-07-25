import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Exercise } from '../src/models/Exercise.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';
import { applyExerciseMedia } from '../src/services/exerciseMediaSyncService.js';

const shouldWrite = process.argv.includes('--write');

const mediaByExerciseName = new Map([
  [
    'bent-over dumbbell row',
    {
      imageUrl: '/assets/exercises/template-b/remada-curvada-com-halteres.png',
      imageAlt: 'Start and end movement of bent-over dumbbell row'
    }
  ],
  [
    'supported single-arm dumbbell row',
    {
      imageUrl: '/assets/exercises/template-b/remada-unilateral-apoiado-no-banco.png',
      imageAlt: 'Start and end movement of supported single-arm dumbbell row'
    }
  ],
  [
    'wide dumbbell row',
    {
      imageUrl: '/assets/exercises/template-b/remada-aberta-com-halteres.png',
      imageAlt: 'Start and end movement of wide dumbbell row'
    }
  ],
  [
    'dumbbell reverse fly',
    {
      imageUrl: '/assets/exercises/template-b/crucifixo-inverso-com-halteres.png',
      imageAlt: 'Start and end movement of dumbbell reverse fly'
    }
  ],
  [
    'dumbbell curl',
    {
      imageUrl: '/assets/exercises/template-b/rosca-direta-com-halteres-ou-barra-curta.png',
      imageAlt: 'Start and end movement of dumbbell curl'
    }
  ],
  [
    'dumbbell or short-bar curl',
    {
      imageUrl: '/assets/exercises/template-b/rosca-direta-com-halteres-ou-barra-curta.png',
      imageAlt: 'Start and end movement of dumbbell or short-bar curl'
    }
  ],
  [
    'dumbbell hammer curl',
    {
      imageUrl: '/assets/exercises/template-b/rosca-martelo-com-halteres.png',
      imageAlt: 'Start and end movement of dumbbell hammer curl'
    }
  ],
  [
    'concentration curl',
    {
      imageUrl: '/assets/exercises/template-b/rosca-concentrada.png',
      imageAlt: 'Start and end movement of concentration curl'
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

  const template = await WorkoutTemplate.findOne({ code: 'B', active: true });

  if (!template) {
    throw new Error('Template B not found.');
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
