import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Exercise } from '../src/models/Exercise.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';
import { applyExerciseMedia } from '../src/services/exerciseMediaSyncService.js';

const shouldWrite = process.argv.includes('--write');

const mediaByExerciseName = new Map([
  [
    'remada curvada com halteres',
    {
      imageUrl: '/assets/exercises/ficha-b/remada-curvada-com-halteres.png',
      imageAlt: 'Movimento inicial e final da remada curvada com halteres'
    }
  ],
  [
    'remada unilateral apoiado no banco',
    {
      imageUrl: '/assets/exercises/ficha-b/remada-unilateral-apoiado-no-banco.png',
      imageAlt: 'Movimento inicial e final da remada unilateral apoiado no banco'
    }
  ],
  [
    'remada aberta com halteres',
    {
      imageUrl: '/assets/exercises/ficha-b/remada-aberta-com-halteres.png',
      imageAlt: 'Movimento inicial e final da remada aberta com halteres'
    }
  ],
  [
    'crucifixo inverso com halteres',
    {
      imageUrl: '/assets/exercises/ficha-b/crucifixo-inverso-com-halteres.png',
      imageAlt: 'Movimento inicial e final do crucifixo inverso com halteres'
    }
  ],
  [
    'rosca direta com halteres',
    {
      imageUrl: '/assets/exercises/ficha-b/rosca-direta-com-halteres-ou-barra-curta.png',
      imageAlt: 'Movimento inicial e final da rosca direta com halteres'
    }
  ],
  [
    'rosca direta com halteres ou barra curta',
    {
      imageUrl: '/assets/exercises/ficha-b/rosca-direta-com-halteres-ou-barra-curta.png',
      imageAlt: 'Movimento inicial e final da rosca direta com halteres ou barra curta'
    }
  ],
  [
    'rosca martelo com halteres',
    {
      imageUrl: '/assets/exercises/ficha-b/rosca-martelo-com-halteres.png',
      imageAlt: 'Movimento inicial e final da rosca martelo com halteres'
    }
  ],
  [
    'rosca concentrada',
    {
      imageUrl: '/assets/exercises/ficha-b/rosca-concentrada.png',
      imageAlt: 'Movimento inicial e final da rosca concentrada'
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
    throw new Error('Ficha B nao encontrada.');
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
