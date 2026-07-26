import { exerciseCatalog } from '../data/exerciseCatalog.js';
import { combatExerciseCatalog } from '../data/combatExerciseCatalog.js';
import { Exercise } from '../models/Exercise.js';

const strengthSubcategories = new Map([
  ['Flat dumbbell bench press', 'Mid chest'],
  ['Reverse-grip dumbbell bench press', 'Upper chest'],
  ['Flat dumbbell fly', 'Chest fly'],
  ['Dumbbell pullover on bench', 'Chest and serratus'],
  ['Dumbbell squeeze press', 'Inner chest'],
  ['Close-grip dumbbell bench press', 'Inner chest and triceps'],
  ['Bent-over dumbbell row', 'Back'],
  ['Supported single-arm dumbbell row', 'Single-arm back'],
  ['Wide dumbbell row', 'Upper back'],
  ['Dumbbell reverse fly', 'Rear delts'],
  ['Dumbbell pullover', 'Back and serratus'],
  ['Dumbbell curl', 'Biceps brachii'],
  ['Dumbbell or short-bar curl', 'Biceps brachii'],
  ['Dumbbell hammer curl', 'Brachialis and forearm'],
  ['Concentration curl', 'Isolated biceps'],
  ['Alternating dumbbell curl', 'Single-arm biceps'],
  ['Overhead dumbbell triceps extension', 'Long head'],
  ['Dumbbell skull crusher', 'General triceps'],
  ['Dumbbell or short-bar skull crusher', 'General triceps'],
  ['Dumbbell triceps kickback', 'Lateral triceps'],
  ['Goblet squat with kettlebell or dumbbell', 'Quads and glutes'],
  ['Goblet squat', 'Quads and glutes'],
  ['Dumbbell lunge', 'Quads and glutes'],
  ['Dumbbell Romanian deadlift', 'Hamstrings'],
  ['Dumbbell hip thrust', 'Glutes'],
  ['Dumbbell sumo squat', 'Adductors and glutes'],
  ['Standing dumbbell calf raise', 'Calves'],
  ['Dumbbell shoulder press', 'Front delts'],
  ['Dumbbell lateral raise', 'Side delts'],
  ['Dumbbell front raise', 'Front delts'],
  ['Dumbbell shrug', 'Traps'],
  ['Plank', 'Core stability'],
  ['Crunch', 'Upper abs'],
  ['Leg raise', 'Lower abs'],
  ['Dumbbell Russian twist', 'Obliques'],
  ['Bicycle crunch', 'Obliques'],
  ['Mountain climber', 'Core conditioning']
]);

export function getStrengthSubcategory(exerciseName, category) {
  return strengthSubcategories.get(exerciseName) || category;
}

export function getCombatSubcategory(exercise) {
  return exercise.subcategory || exercise.category;
}

function inferLoadMode(exercise = {}) {
  const name = String(exercise.name || '').toLowerCase();
  const equipment = (exercise.equipment || []).join(' ').toLowerCase();
  const text = `${name} ${equipment}`;

  if ((exercise.measurementType || '').startsWith('rounds')) return 'non_weight';
  if (text.includes('barbell') || text.includes('short-bar')) return 'bar_total';
  if (text.includes('machine') || text.includes('cable')) return 'machine_stack';
  if (
    text.includes('bodyweight')
    || text.includes('plank')
    || text.includes('crunch')
    || text.includes('leg raise')
    || text.includes('mountain climber')
  ) return 'bodyweight';

  return 'dumbbell_each';
}

export async function seedExerciseCatalog() {
  const strengthOperations = exerciseCatalog.flatMap((group) => {
    return group.exercises.map((exercise) => ({
      updateOne: {
        filter: {
          name: exercise.name,
          category: group.category,
          $or: [{ modality: 'strength' }, { modality: { $exists: false } }]
        },
        update: {
          $set: {
            name: exercise.name,
            category: group.category,
            subcategory: getStrengthSubcategory(exercise.name, group.category),
            modality: 'strength',
            measurementType: 'sets_reps_weight',
            loadMode: inferLoadMode(exercise),
            equipment: exercise.equipment,
            defaultSets: exercise.defaultSets,
            defaultReps: exercise.defaultReps,
            defaultRounds: 0,
            defaultDurationSeconds: 0,
            defaultRestSeconds: 0,
            active: true
          },
          $setOnInsert: {
            mediaProvider: '',
            externalExerciseId: '',
            imageUrl: '',
            imageAlt: '',
            imageLicense: '',
            imageLicenseUrl: '',
            imageAuthor: '',
            imageAuthorUrl: '',
            imageSourceUrl: '',
            instructions: [],
            tips: [],
            mediaSyncedAt: null
          }
        },
        upsert: true
      }
    }));
  });

  const combatOperations = combatExerciseCatalog.map((exercise) => ({
    updateOne: {
      filter: { name: exercise.name, category: exercise.category, modality: exercise.modality },
      update: {
        $set: {
          name: exercise.name,
          category: exercise.category,
          subcategory: getCombatSubcategory(exercise),
          modality: exercise.modality,
          measurementType: exercise.measurementType,
          loadMode: inferLoadMode(exercise),
          equipment: exercise.equipment || [],
          defaultSets: exercise.defaultSets || 0,
          defaultReps: exercise.defaultReps || '',
          defaultRounds: exercise.defaultRounds || 0,
          defaultDurationSeconds: exercise.defaultDurationSeconds || 0,
          defaultRestSeconds: exercise.defaultRestSeconds || 0,
          active: true
        },
        $setOnInsert: {
          mediaProvider: '',
          externalExerciseId: '',
          imageUrl: '',
          imageAlt: '',
          imageLicense: '',
          imageLicenseUrl: '',
          imageAuthor: '',
          imageAuthorUrl: '',
          imageSourceUrl: '',
          instructions: [],
          tips: [],
          mediaSyncedAt: null
        }
      },
      upsert: true
    }
  }));

  const operations = [...strengthOperations, ...combatOperations];

  if (operations.length > 0) {
    await Exercise.bulkWrite(operations);
  }

  for (const [name, subcategory] of strengthSubcategories.entries()) {
    await Exercise.updateMany(
      {
        name,
        $or: [{ subcategory: '' }, { subcategory: { $exists: false } }]
      },
      { $set: { subcategory } }
    );
  }
}
