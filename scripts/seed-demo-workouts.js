import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Workout } from '../src/models/Workout.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';

const demoBatch = 'demo-july-2026';
const shouldWrite = process.argv.includes('--write');
const demoFilter = {
  $or: [
    { isDemo: true, demoBatch },
    { notes: /^\[DEMO\]/ }
  ]
};

const demoPlan = [
  { date: '2026-07-01', codes: ['C', 'BOXE_02', 'KICK_01'], note: 'Missao completa com perna pesada e kick extra tecnico.' },
  { date: '2026-07-02', codes: ['A', 'BOXE_01'], note: 'Missao parcial: musculacao feita e boxe extra tecnico.' },
  { date: '2026-07-03', codes: ['B', 'BOXE_03', 'A'], note: 'Missao completa e treino extra leve de peito.' },
  { date: '2026-07-04', codes: ['C', 'KICK_03', 'BOXE_02'], note: 'Dia intenso com foco em condicionamento e boxe extra.' },
  { date: '2026-07-06', codes: ['A', 'BOXE_01'], note: 'Semana aberta com missao completa.' },
  { date: '2026-07-07', codes: ['B', 'KICK_01', 'BOXE_01'], note: 'Missao completa e bloco extra tecnico.' },
  { date: '2026-07-08', codes: ['C', 'KICK_03'], note: 'Missao parcial: pernas feitas e kick extra.' },
  { date: '2026-07-09', codes: ['A', 'KICK_02'], note: 'Missao do dia completa para testar dashboard.' }
];

const strengthBaseWeights = {
  Peito: 18,
  Costas: 20,
  Pernas: 26,
  Ombros: 12,
  Triceps: 10,
  Biceps: 11,
  Panturrilhas: 18,
  Gluteos: 24,
  Trapezio: 20,
  Outros: 14
};

function toWorkoutDate(dateKey) {
  return new Date(`${dateKey}T12:00:00.000Z`);
}

function getNumbersFromText(value) {
  return String(value || '')
    .match(/\d+/g)
    ?.map((item) => Number(item)) || [];
}

function getRepTarget(plannedReps, exerciseIndex, planIndex) {
  const numbers = getNumbersFromText(plannedReps);

  if (!numbers.length) {
    return 10 + ((exerciseIndex + planIndex) % 3);
  }

  const min = numbers[0];
  const max = numbers.at(-1);

  return Math.min(max, min + ((exerciseIndex + planIndex) % Math.max(1, max - min + 1)));
}

function getBaseWeight(exercise) {
  const group = exercise.category || exercise.muscleGroup || 'Outros';
  const matchedKey = Object.keys(strengthBaseWeights).find((key) => group.toLowerCase().includes(key.toLowerCase()));

  return strengthBaseWeights[matchedKey || 'Outros'];
}

function buildStrengthSets(exercise, exerciseIndex, planIndex) {
  const plannedSets = Number(exercise.plannedSets || 3);
  const baseWeight = getBaseWeight(exercise) + planIndex + Math.floor(exerciseIndex / 2);
  const repTarget = getRepTarget(exercise.plannedReps, exerciseIndex, planIndex);

  return Array.from({ length: plannedSets }, (_, setIndex) => {
    const fatigue = setIndex >= plannedSets - 1 ? 1 : 0;
    const prBoost = planIndex >= 6 && exerciseIndex <= 1 && setIndex === 0 ? 2 : 0;

    return {
      setNumber: setIndex + 1,
      weight: Math.max(4, baseWeight + prBoost - fatigue),
      reps: Math.max(6, repTarget - fatigue)
    };
  });
}

function buildCombatRounds(exercise, exerciseIndex, planIndex) {
  const plannedRounds = Number(exercise.plannedRounds || exercise.plannedSets || 4);
  const durationSeconds = Number(exercise.plannedDurationSeconds || 120);
  const restSeconds = Number(exercise.plannedRestSeconds || 45);

  return Array.from({ length: plannedRounds }, (_, roundIndex) => ({
    roundNumber: roundIndex + 1,
    durationSeconds,
    restSeconds,
    reps: 20 + exerciseIndex * 2 + roundIndex,
    intensity: Math.min(10, 6 + ((planIndex + roundIndex) % 4)),
    completed: true
  }));
}

function buildWorkoutFromTemplate(template, plan, planIndex, codeIndex) {
  const isCombat = template.workoutTypeCode && template.workoutTypeCode !== 'strength';
  const exercises = template.exercises.map((exercise, exerciseIndex) => {
    const sets = isCombat ? [] : buildStrengthSets(exercise, exerciseIndex, planIndex);
    const rounds = isCombat ? buildCombatRounds(exercise, exerciseIndex, planIndex) : [];

    return {
      name: exercise.name,
      muscleGroup: exercise.category,
      subcategory: exercise.subcategory || '',
      modality: exercise.modality || template.workoutTypeCode || 'strength',
      measurementType: exercise.measurementType || template.measurementType || 'sets_reps_weight',
      loadMode: exercise.loadMode || (isCombat ? 'non_weight' : 'dumbbell_each'),
      plannedSets: exercise.plannedSets || 0,
      plannedReps: exercise.plannedReps || '',
      plannedRounds: exercise.plannedRounds || 0,
      plannedDurationSeconds: exercise.plannedDurationSeconds || 0,
      plannedRestSeconds: exercise.plannedRestSeconds || 0,
      completedSets: sets.length,
      completedRounds: rounds.length,
      sets,
      rounds,
      notes: '[DEMO] Exercicio ficticio para validar estatisticas.'
    };
  });

  return {
    date: toWorkoutDate(plan.date),
    templateId: template._id,
    workoutCode: template.code,
    workoutName: template.name,
    durationMinutes: isCombat ? 32 + codeIndex * 4 : 58 + codeIndex * 7,
    exercises,
    notes: `[DEMO] ${plan.note}`,
    isDemo: true,
    demoBatch
  };
}

async function main() {
  await connectDatabase();

  const codes = [...new Set(demoPlan.flatMap((plan) => plan.codes))];
  const templates = await WorkoutTemplate.find({ code: { $in: codes }, active: true });
  const templatesByCode = new Map(templates.map((template) => [template.code, template]));
  const workouts = demoPlan.flatMap((plan, planIndex) => {
    return plan.codes.flatMap((code, codeIndex) => {
      const template = templatesByCode.get(code);

      if (!template) {
        console.warn(`Ficha ${code} nao encontrada. Ignorando este item demo.`);
        return [];
      }

      return [buildWorkoutFromTemplate(template, plan, planIndex, codeIndex)];
    });
  });

  console.log(`Lote demo: ${demoBatch}`);
  console.log(`Treinos preparados: ${workouts.length}`);
  console.table(workouts.map((workout) => ({
    data: workout.date.toISOString().slice(0, 10),
    ficha: workout.workoutCode,
    nome: workout.workoutName,
    exercicios: workout.exercises.length,
    origem: workout.workoutCode.length > 1 ? 'luta' : 'musculacao'
  })));

  if (!shouldWrite) {
    console.log('Modo previa: nenhum treino foi cadastrado. Rode npm run demo:seed para gravar.');
    return;
  }

  const deleted = await Workout.deleteMany(demoFilter);
  await Workout.insertMany(workouts);
  console.log(`Treinos demo antigos removidos: ${deleted.deletedCount}`);
  console.log(`Treinos demo cadastrados: ${workouts.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
