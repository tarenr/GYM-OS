import 'dotenv/config';
import { Exercise } from '../../src/models/Exercise.js';
import { WorkoutTemplate } from '../../src/models/WorkoutTemplate.js';
import { printJson, withDatabase } from './_helpers.js';

const CONFIG = {
  dryRun: false,
  templateCode: 'C',
  exerciseName: 'Dumbbell front raise',
  insertAfter: 'Dumbbell lateral raise'
};

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

function buildTemplateExercise(exercise, order) {
  return {
    exerciseId: exercise._id,
    name: exercise.name,
    category: exercise.category,
    subcategory: exercise.subcategory || '',
    modality: exercise.modality || 'strength',
    measurementType: exercise.measurementType || 'sets_reps_weight',
    loadMode: exercise.loadMode || 'dumbbell_each',
    equipment: exercise.equipment || [],
    plannedSets: Number(exercise.defaultSets || 0),
    plannedReps: String(exercise.defaultReps || '').trim(),
    plannedRounds: Number(exercise.defaultRounds || 0),
    plannedDurationSeconds: Number(exercise.defaultDurationSeconds || 0),
    plannedRestSeconds: Number(exercise.defaultRestSeconds || 0),
    mediaProvider: exercise.mediaProvider || '',
    externalExerciseId: exercise.externalExerciseId || '',
    imageUrl: exercise.imageUrl || '',
    imageAlt: exercise.imageAlt || '',
    imageLicense: exercise.imageLicense || '',
    imageLicenseUrl: exercise.imageLicenseUrl || '',
    imageAuthor: exercise.imageAuthor || '',
    imageAuthorUrl: exercise.imageAuthorUrl || '',
    imageSourceUrl: exercise.imageSourceUrl || '',
    instructions: Array.isArray(exercise.instructions) ? exercise.instructions : [],
    tips: Array.isArray(exercise.tips) ? exercise.tips : [],
    order
  };
}

await withDatabase(async () => {
  const template = await WorkoutTemplate.findOne({ code: CONFIG.templateCode, active: true });

  if (!template) {
    throw new Error(`Template ${CONFIG.templateCode} not found.`);
  }

  const exercise = await Exercise.findOne({ name: CONFIG.exerciseName, active: true }).lean();

  if (!exercise) {
    throw new Error(`Exercise ${CONFIG.exerciseName} not found.`);
  }

  const exercises = (template.exercises || [])
    .map((item) => item.toObject ? item.toObject() : item)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  const alreadyExists = exercises.some((item) => normalizeName(item.name) === normalizeName(CONFIG.exerciseName));

  if (alreadyExists) {
    printJson('Template C front raise add', {
      config: CONFIG,
      changed: false,
      reason: 'exercise already exists',
      exercises: exercises.map((item) => ({ order: item.order, name: item.name }))
    });
    return;
  }

  const insertIndex = exercises.findIndex((item) => normalizeName(item.name) === normalizeName(CONFIG.insertAfter));
  const nextExercises = [...exercises];
  const targetIndex = insertIndex >= 0 ? insertIndex + 1 : exercises.length;

  nextExercises.splice(targetIndex, 0, buildTemplateExercise(exercise, targetIndex + 1));

  const reordered = nextExercises.map((item, index) => ({
    ...item,
    order: index + 1
  }));

  if (!CONFIG.dryRun) {
    template.exercises = reordered;
    await template.save();
  }

  printJson('Template C front raise add', {
    config: CONFIG,
    changed: true,
    insertedAt: targetIndex + 1,
    exercise: {
      name: exercise.name,
      category: exercise.category,
      loadMode: exercise.loadMode,
      plannedSets: exercise.defaultSets,
      plannedReps: exercise.defaultReps
    },
    exercises: reordered.map((item) => ({ order: item.order, name: item.name }))
  });
});
