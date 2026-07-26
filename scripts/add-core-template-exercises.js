import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Exercise } from '../src/models/Exercise.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';
import { seedExerciseCatalog } from '../src/services/seedExerciseCatalog.js';

const templateCorePlan = new Map([
  ['A', ['Crunch', 'Plank']],
  ['B', ['Leg raise', 'Dumbbell Russian twist']],
  ['C', ['Bicycle crunch', 'Mountain climber']]
]);

function toTemplateExercise(exercise, order) {
  return {
    exerciseId: exercise._id,
    name: exercise.name,
    category: exercise.category,
    subcategory: exercise.subcategory || exercise.category,
    modality: exercise.modality || 'strength',
    measurementType: exercise.measurementType || 'sets_reps_weight',
    loadMode: exercise.loadMode || 'bodyweight',
    equipment: exercise.equipment || [],
    plannedSets: Number(exercise.defaultSets || 0),
    plannedReps: exercise.defaultReps || '',
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
    instructions: exercise.instructions || [],
    tips: exercise.tips || [],
    order
  };
}

async function addCoreExercisesToTemplates() {
  await connectDatabase();
  await seedExerciseCatalog();

  const requiredNames = [...new Set([...templateCorePlan.values()].flat())];
  const exercises = await Exercise.find({
    name: { $in: requiredNames },
    category: 'Core',
    modality: 'strength',
    active: true
  });
  const exercisesByName = new Map(exercises.map((exercise) => [exercise.name, exercise]));
  const missing = requiredNames.filter((name) => !exercisesByName.has(name));

  if (missing.length) {
    throw new Error(`Missing core exercises after seed: ${missing.join(', ')}`);
  }

  for (const [code, exerciseNames] of templateCorePlan.entries()) {
    const template = await WorkoutTemplate.findOne({ code, active: true });

    if (!template) {
      throw new Error(`Template ${code} not found.`);
    }

    const existingNames = new Set(template.exercises.map((exercise) => exercise.name));
    const additions = exerciseNames
      .filter((name) => !existingNames.has(name))
      .map((name, index) => {
        return toTemplateExercise(exercisesByName.get(name), template.exercises.length + index + 1);
      });

    if (!additions.length) {
      console.log(`Template ${code}: core exercises already present.`);
      continue;
    }

    template.exercises.push(...additions);
    template.exercises.forEach((exercise, index) => {
      exercise.order = index + 1;
    });
    await template.save();

    console.log(`Template ${code}: added ${additions.map((exercise) => exercise.name).join(', ')}.`);
  }
}

addCoreExercisesToTemplates()
  .then(() => {
    console.log('Core template exercises synced.');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
