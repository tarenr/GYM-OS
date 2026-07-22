import { combatWorkoutTemplates } from '../data/combatWorkoutTemplates.js';
import { Exercise } from '../models/Exercise.js';
import { WorkoutTemplate } from '../models/WorkoutTemplate.js';
import { WorkoutType } from '../models/WorkoutType.js';

function buildTemplateExercise(exercise, plannedExercise, index) {
  return {
    exerciseId: exercise._id,
    name: exercise.name,
    category: exercise.category,
    subcategory: exercise.subcategory || '',
    modality: exercise.modality,
    measurementType: exercise.measurementType,
    loadMode: exercise.loadMode || 'non_weight',
    equipment: exercise.equipment || [],
    plannedSets: plannedExercise.sets || exercise.defaultSets || 0,
    plannedReps: plannedExercise.reps || exercise.defaultReps || '',
    plannedRounds: plannedExercise.rounds || exercise.defaultRounds || 0,
    plannedDurationSeconds: plannedExercise.durationSeconds || exercise.defaultDurationSeconds || 0,
    plannedRestSeconds: plannedExercise.restSeconds || exercise.defaultRestSeconds || 0,
    order: index + 1
  };
}

export async function seedCombatWorkoutTemplates() {
  const workoutTypes = await WorkoutType.find({
    code: { $in: ['boxing', 'kickboxing'] },
    active: true
  });

  const typeByCode = new Map(workoutTypes.map((type) => [type.code, type]));
  const operations = [];

  for (const template of combatWorkoutTemplates) {
    const workoutType = typeByCode.get(template.workoutTypeCode);

    if (!workoutType) {
      continue;
    }

    const exerciseNames = template.exercises.map((exercise) => exercise.name);
    const exercises = await Exercise.find({
      name: { $in: exerciseNames },
      modality: template.workoutTypeCode,
      active: true
    });
    const exerciseByName = new Map(exercises.map((exercise) => [exercise.name, exercise]));

    const templateExercises = template.exercises.map((plannedExercise, index) => {
      const exercise = exerciseByName.get(plannedExercise.name);

      if (!exercise) {
        throw new Error(`Exercicio nao encontrado para ficha ${template.code}: ${plannedExercise.name}`);
      }

      return buildTemplateExercise(exercise, plannedExercise, index);
    });

    operations.push({
      updateOne: {
        filter: { code: template.code },
        update: {
          $set: {
            code: template.code,
            name: template.name,
            level: template.level,
            xpReward: template.xpReward,
            description: template.description,
            workoutTypeId: workoutType._id,
            workoutTypeCode: workoutType.code,
            workoutTypeName: workoutType.name,
            measurementType: workoutType.measurementType,
            exercises: templateExercises,
            active: true
          }
        },
        upsert: true
      }
    });
  }

  if (operations.length > 0) {
    await WorkoutTemplate.bulkWrite(operations);
  }
}
