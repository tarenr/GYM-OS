import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Exercise } from '../src/models/Exercise.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';
import { applyExerciseMedia } from '../src/services/exerciseMediaSyncService.js';

const shouldWrite = process.argv.includes('--write');

const mediaByExerciseName = new Map([
  [
    'supino reto com halteres',
    {
      imageUrl: '/assets/exercises/ficha-a/supino-reto-com-halteres.png',
      imageAlt: 'Movimento inicial e final do supino reto com halteres'
    }
  ],
  [
    'supino reto com pegada supinada',
    {
      imageUrl: '/assets/exercises/ficha-a/supino-reto-pegada-supinada.png',
      imageAlt: 'Movimento inicial e final do supino reto com pegada supinada'
    }
  ],
  [
    'crucifixo reto com halteres',
    {
      imageUrl: '/assets/exercises/ficha-a/crucifixo-reto-com-halteres.png',
      imageAlt: 'Movimento inicial e final do crucifixo reto com halteres'
    }
  ],
  [
    'pullover com halter no banco',
    {
      imageUrl: '/assets/exercises/ficha-a/pullover-com-halter-no-banco-reto.png',
      imageAlt: 'Movimento inicial e final do pullover com halter no banco reto'
    }
  ],
  [
    'pullover com halter no banco reto',
    {
      imageUrl: '/assets/exercises/ficha-a/pullover-com-halter-no-banco-reto.png',
      imageAlt: 'Movimento inicial e final do pullover com halter no banco reto'
    }
  ],
  [
    'squeeze press com halteres',
    {
      imageUrl: '/assets/exercises/ficha-a/squeeze-press-com-halteres.png',
      imageAlt: 'Movimento inicial e final do squeeze press com halteres'
    }
  ],
  [
    'triceps frances com halter',
    {
      imageUrl: '/assets/exercises/ficha-a/triceps-frances-com-halter.png',
      imageAlt: 'Movimento inicial e final do triceps frances com halter'
    }
  ],
  [
    'triceps testa com halteres',
    {
      imageUrl: '/assets/exercises/ficha-a/triceps-testa-com-halteres.png',
      imageAlt: 'Movimento inicial e final do triceps testa com halteres'
    }
  ],
  [
    'triceps testa com halteres ou barra curta',
    {
      imageUrl: '/assets/exercises/ficha-a/triceps-testa-com-halteres.png',
      imageAlt: 'Movimento inicial e final do triceps testa com halteres'
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
    throw new Error('Ficha A nao encontrada.');
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
