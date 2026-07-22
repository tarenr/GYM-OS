import { Exercise } from '../models/Exercise.js';
import { WorkoutTemplate } from '../models/WorkoutTemplate.js';
import { getStrengthSubcategory } from './seedExerciseCatalog.js';

function buildExerciseKeys(exercise) {
  return [
    `${exercise.modality || 'strength'}|${exercise.category}|${exercise.name}`,
    `${exercise.modality || 'strength'}|${exercise.name}`
  ];
}

export async function syncTemplateExerciseSubcategories() {
  const exercises = await Exercise.find({ active: true });
  const exerciseByKey = new Map();

  exercises.forEach((exercise) => {
    buildExerciseKeys(exercise).forEach((key) => {
      if (!exerciseByKey.has(key)) {
        exerciseByKey.set(key, exercise);
      }
    });
  });

  const templates = await WorkoutTemplate.find({ active: true });
  const operations = templates.reduce((items, template) => {
    let changed = false;
    const syncedExercises = template.exercises.map((templateExercise) => {
      const keys = buildExerciseKeys(templateExercise);
      const catalogExercise = keys.map((key) => exerciseByKey.get(key)).find(Boolean);
      const fallbackSubcategory = templateExercise.modality === 'strength'
        ? getStrengthSubcategory(templateExercise.name, templateExercise.category)
        : templateExercise.category;
      const subcategory = catalogExercise?.subcategory || templateExercise.subcategory || fallbackSubcategory || '';
      const inferredLoadMode = templateExercise.modality === 'strength' && !(templateExercise.measurementType || '').startsWith('rounds')
        ? 'dumbbell_each'
        : 'non_weight';
      const loadMode = catalogExercise?.loadMode && (catalogExercise.loadMode !== 'dumbbell_each' || inferredLoadMode === 'dumbbell_each')
        ? catalogExercise.loadMode
        : templateExercise.loadMode && (templateExercise.loadMode !== 'dumbbell_each' || inferredLoadMode === 'dumbbell_each')
          ? templateExercise.loadMode
          : inferredLoadMode;

      if ((templateExercise.subcategory || '') !== subcategory || (templateExercise.loadMode || '') !== loadMode) {
        changed = true;
      }

      return {
        ...templateExercise.toObject(),
        subcategory,
        loadMode
      };
    });

    if (!changed) {
      return items;
    }

    items.push({
      updateOne: {
        filter: { _id: template._id },
        update: { $set: { exercises: syncedExercises } }
      }
    });

    return items;
  }, []);

  if (operations.length > 0) {
    await WorkoutTemplate.bulkWrite(operations);
  }
}
