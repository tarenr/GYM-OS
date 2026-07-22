import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Exercise } from '../src/models/Exercise.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';
import { applyExerciseMedia } from '../src/services/exerciseMediaSyncService.js';

const shouldWrite = process.argv.includes('--write');

const mediaByExerciseName = new Map([
  [
    'agachamento goblet',
    {
      imageUrl: '/assets/exercises/ficha-c/agachamento-goblet-com-kettlebell-ou-halter.png',
      imageAlt: 'Movimento inicial e final do agachamento goblet'
    }
  ],
  [
    'agachamento goblet com kettlebell ou halter',
    {
      imageUrl: '/assets/exercises/ficha-c/agachamento-goblet-com-kettlebell-ou-halter.png',
      imageAlt: 'Movimento inicial e final do agachamento goblet com kettlebell ou halter'
    }
  ],
  [
    'afundo com halteres',
    {
      imageUrl: '/assets/exercises/ficha-c/afundo-com-halteres.png',
      imageAlt: 'Movimento inicial e final do afundo com halteres'
    }
  ],
  [
    'stiff com halteres',
    {
      imageUrl: '/assets/exercises/ficha-c/stiff-com-halteres.png',
      imageAlt: 'Movimento inicial e final do stiff com halteres'
    }
  ],
  [
    'elevacao pelvica com halter',
    {
      imageUrl: '/assets/exercises/ficha-c/elevacao-pelvica-com-halter.png',
      imageAlt: 'Movimento inicial e final da elevacao pelvica com halter'
    }
  ],
  [
    'panturrilha em pe com halteres',
    {
      imageUrl: '/assets/exercises/ficha-c/panturrilha-em-pe-com-halteres.png',
      imageAlt: 'Movimento inicial e final da panturrilha em pe com halteres'
    }
  ],
  [
    'desenvolvimento com halteres',
    {
      imageUrl: '/assets/exercises/ficha-c/desenvolvimento-com-halteres.png',
      imageAlt: 'Movimento inicial e final do desenvolvimento com halteres'
    }
  ],
  [
    'elevacao lateral com halteres',
    {
      imageUrl: '/assets/exercises/ficha-c/elevacao-lateral-com-halteres.png',
      imageAlt: 'Movimento inicial e final da elevacao lateral com halteres'
    }
  ],
  [
    'encolhimento com halteres',
    {
      imageUrl: '/assets/exercises/ficha-c/encolhimento-com-halteres.png',
      imageAlt: 'Movimento inicial e final do encolhimento com halteres'
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
    throw new Error('Ficha C nao encontrada.');
  }

  const summary = [];

  for (const templateExercise of template.exercises) {
    const mediaPayload = getMediaPayload(templateExercise.name);
    const exercise = await findExercise(templateExercise);

    if (!mediaPayload) {
      summary.push({
        exercicio: templateExercise.name,
        status: 'sem mapa de imagem',
        imagem: ''
      });
      continue;
    }

    if (!exercise) {
      summary.push({
        exercicio: templateExercise.name,
        status: 'exercicio nao encontrado',
        imagem: mediaPayload.imageUrl
      });
      continue;
    }

    if (shouldWrite) {
      await applyExerciseMedia(exercise, mediaPayload);
    }

    summary.push({
      exercicio: templateExercise.name,
      status: shouldWrite ? 'vinculado' : 'previa',
      imagem: mediaPayload.imageUrl
    });
  }

  console.log(`Ficha: ${template.code} - ${template.name}`);
  console.log(`Modo: ${shouldWrite ? 'gravacao' : 'previa'}`);
  console.table(summary);

  if (!shouldWrite) {
    console.log('Nenhuma alteracao gravada. Rode com --write para aplicar.');
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
