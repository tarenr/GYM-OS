import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Exercise } from '../src/models/Exercise.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';
import { applyExerciseMedia } from '../src/services/exerciseMediaSyncService.js';

const shouldWrite = process.argv.includes('--write');

const mediaByExerciseName = new Map([
  [
    'goblet squat',
    {
      imageUrl: '/assets/exercises/template-c/agachamento-goblet-com-kettlebell-ou-halter.png',
      imageAlt: 'Start and end movement of goblet squat'
    }
  ],
  [
    'dumbbell lunge',
    {
      imageUrl: '/assets/exercises/template-c/afundo-com-halteres.png',
      imageAlt: 'Start and end movement of dumbbell lunge'
    }
  ],
  [
    'dumbbell romanian deadlift',
    {
      imageUrl: '/assets/exercises/template-c/stiff-com-halteres.png',
      imageAlt: 'Start and end movement of dumbbell romanian deadlift'
    }
  ],
  [
    'dumbbell hip thrust',
    {
      imageUrl: '/assets/exercises/template-c/elevacao-pelvica-com-halter.png',
      imageAlt: 'Start and end movement of dumbbell hip thrust'
    }
  ],
  [
    'standing dumbbell calf raise',
    {
      imageUrl: '/assets/exercises/template-c/panturrilha-em-pe-com-halteres.png',
      imageAlt: 'Start and end movement of standing dumbbell calf raise'
    }
  ],
  [
    'dumbbell shoulder press',
    {
      imageUrl: '/assets/exercises/template-c/desenvolvimento-com-halteres.png',
      imageAlt: 'Start and end movement of dumbbell shoulder press'
    }
  ],
  [
    'dumbbell lateral raise',
    {
      imageUrl: '/assets/exercises/template-c/elevacao-lateral-com-halteres.png',
      imageAlt: 'Start and end movement of dumbbell lateral raise'
    }
  ],
  [
    'dumbbell shrug',
    {
      imageUrl: '/assets/exercises/template-c/encolhimento-com-halteres.png',
      imageAlt: 'Start and end movement of dumbbell shrug'
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

  const template = await WorkoutTemplate.findOne({ code: 'C', active: true });

  if (!template) {
    throw new Error('Template C not found.');
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
