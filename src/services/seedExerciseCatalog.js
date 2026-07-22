import { exerciseCatalog } from '../data/exerciseCatalog.js';
import { combatExerciseCatalog } from '../data/combatExerciseCatalog.js';
import { Exercise } from '../models/Exercise.js';

const strengthSubcategories = new Map([
  ['Supino reto com halteres', 'Peito medio'],
  ['Supino reto com pegada supinada', 'Peito superior'],
  ['Crucifixo reto com halteres', 'Abertura do peito'],
  ['Pullover com halter no banco', 'Peitoral e serratil'],
  ['Pullover com halter no banco reto', 'Peitoral e serratil'],
  ['Squeeze press com halteres', 'Peito interno'],
  ['Supino fechado com halteres', 'Peito interno e triceps'],
  ['Remada curvada com halteres', 'Dorsal'],
  ['Remada unilateral apoiado no banco', 'Dorsal unilateral'],
  ['Remada aberta com halteres', 'Costas superiores'],
  ['Crucifixo inverso com halteres', 'Posterior de ombro'],
  ['Pullover com halter', 'Dorsal e serratil'],
  ['Rosca direta com halteres', 'Biceps braquial'],
  ['Rosca direta com halteres ou barra curta', 'Biceps braquial'],
  ['Rosca martelo com halteres', 'Braquial e antebraco'],
  ['Rosca concentrada', 'Biceps isolado'],
  ['Rosca alternada', 'Biceps unilateral'],
  ['Triceps frances com halter', 'Cabeca longa'],
  ['Triceps testa com halteres', 'Triceps geral'],
  ['Triceps testa com halteres ou barra curta', 'Triceps geral'],
  ['Coice de triceps com halter', 'Triceps lateral'],
  ['Agachamento goblet com kettlebell ou halter', 'Quadriceps e gluteos'],
  ['Agachamento goblet', 'Quadriceps e gluteos'],
  ['Afundo com halteres', 'Quadriceps e gluteos'],
  ['Stiff com halteres', 'Posterior de coxa'],
  ['Elevacao pelvica com halter', 'Gluteos'],
  ['Agachamento sumo com halter', 'Adutores e gluteos'],
  ['Panturrilha em pe com halteres', 'Panturrilhas'],
  ['Desenvolvimento com halteres', 'Ombro anterior'],
  ['Elevacao lateral com halteres', 'Ombro lateral'],
  ['Elevacao frontal com halteres', 'Ombro anterior'],
  ['Encolhimento com halteres', 'Trapezio'],
  ['Prancha', 'Core estabilizacao'],
  ['Abdominal tradicional', 'Abdomen superior'],
  ['Elevacao de pernas', 'Abdomen inferior'],
  ['Russian twist com halter', 'Obliquos']
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
  if (text.includes('barra')) return 'bar_total';
  if (text.includes('maquina') || text.includes('polia')) return 'machine_stack';
  if (text.includes('peso corporal') || text.includes('prancha') || text.includes('abdominal') || text.includes('elevacao de pernas')) return 'bodyweight';

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
