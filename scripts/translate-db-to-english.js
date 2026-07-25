import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { DailyMission } from '../src/models/DailyMission.js';
import { Exercise } from '../src/models/Exercise.js';
import { Workout } from '../src/models/Workout.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';
import { WorkoutType } from '../src/models/WorkoutType.js';

const shouldWrite = process.argv.includes('--write');

const translations = [
  ['Fundacao A Reforco', 'Foundation A Reinforcement'],
  ['Fundacao B Reforco', 'Foundation B Reinforcement'],
  ['Fundacao C Reforco', 'Foundation C Reinforcement'],
  ['Fundacao A', 'Foundation A'],
  ['Fundacao B', 'Foundation B'],
  ['Fundacao C', 'Foundation C'],
  ['Recuperacao Programada', 'Scheduled Recovery'],
  ['Recuperacao', 'Recovery'],
  ['Peito e triceps | recomposicao corporal', 'Chest and triceps | body recomposition'],
  ['Costas e biceps | recomposicao corporal', 'Back and biceps | body recomposition'],
  ['Pernas e ombros | recomposicao corporal', 'Legs and shoulders | body recomposition'],
  ['Peito e triceps | segunda volta da semana', 'Chest and triceps | second weekly pass'],
  ['Costas e biceps | segunda volta da semana', 'Back and biceps | second weekly pass'],
  ['Pernas e ombros | fechamento da semana', 'Legs and shoulders | weekly closure'],
  ['Recuperacao ativa sem quebrar a sequencia', 'Active recovery without breaking the sequence'],
  ['Recovery ativa sem quebrar a sequencia', 'Active recovery without breaking the sequence'],
  ['Segunda', 'Monday'],
  ['Terca', 'Tuesday'],
  ['Quarta', 'Wednesday'],
  ['Quinta', 'Thursday'],
  ['Sexta', 'Friday'],
  ['Sabado', 'Saturday'],
  ['Domingo', 'Sunday'],
  ['Musculacao', 'Strength'],
  ['Boxe', 'Boxing'],
  ['Mobilidade', 'Mobility'],
  ['Treinos com series, carga e repeticoes.', 'Workouts with sets, load and reps.'],
  ['Treinos com rounds, tempo, descanso e intensidade.', 'Workouts with rounds, time, rest and intensity.'],
  ['Treinos com rounds, tempo, golpes, descanso e intensidade.', 'Workouts with rounds, time, strikes, rest and intensity.'],
  ['Treinos por duracao, distancia e intensidade.', 'Workouts by duration, distance and intensity.'],
  ['Mobilidade, alongamento e recuperacao.', 'Mobility, stretching and recovery.'],
  ['Boxe 01 - Fundamentos', 'Boxing 01 - Fundamentals'],
  ['Boxe 02 - Combinacoes', 'Boxing 02 - Combinations'],
  ['Boxe 03 - Defesa e Condicionamento', 'Boxing 03 - Defense and Conditioning'],
  ['Kickboxing 01 - Base e Chutes', 'Kickboxing 01 - Stance and Kicks'],
  ['Kickboxing 02 - Combinacoes', 'Kickboxing 02 - Combinations'],
  ['Kickboxing 03 - Defesa e Condicionamento', 'Kickboxing 03 - Defense and Conditioning'],
  ['Iniciante', 'Beginner'],
  ['Intermediario', 'Intermediate'],
  ['Treino basico para base, guarda, movimentacao e golpes simples.', 'Basic workout for stance, guard, movement and simple strikes.'],
  ['Treino focado em combinacoes simples de golpes e ritmo.', 'Workout focused on simple strike combinations and rhythm.'],
  ['Treino para esquivas, defesa, resistencia e ritmo de luta.', 'Workout for slips, defense, endurance and fight rhythm.'],
  ['Treino basico para guarda, base, movimentacao e chutes principais.', 'Basic workout for guard, stance, movement and main kicks.'],
  ['Treino para unir socos, chutes e movimentacao.', 'Workout to connect punches, kicks and movement.'],
  ['Treino mais intenso, com defesa, contra-ataque e condicionamento.', 'More intense workout with defense, counterattack and conditioning.'],
  ['Sombra livre de kickboxing', 'Free kickboxing shadowboxing'],
  ['Sombra de kickboxing', 'Kickboxing shadowboxing'],
  ['Base e guarda de kickboxing', 'Kickboxing stance and guard'],
  ['Sombra livre', 'Free shadowboxing'],
  ['Sombra com movimentacao', 'Shadowboxing with movement'],
  ['Sombra com defesa', 'Shadowboxing with defense'],
  ['Sombra em alta intensidade', 'High-intensity shadowboxing'],
  ['Sombra com chutes', 'Shadowboxing with kicks'],
  ['Base e guarda', 'Stance and guard'],
  ['Deslocamento para frente e para tras', 'Forward and backward footwork'],
  ['Deslocamento lateral', 'Lateral footwork'],
  ['Direto + cruzado + chute medio', 'Cross + hook + middle kick'],
  ['Jab + direto + chute frontal', 'Jab + cross + front kick'],
  ['Jab + direto + chute baixo', 'Jab + cross + low kick'],
  ['Jab + direto + cruzado + chute baixo', 'Jab + cross + hook + low kick'],
  ['Chute frontal + direto', 'Front kick + cross'],
  ['Jab + direto + esquiva', 'Jab + cross + slip'],
  ['Jab + direto + cruzado', 'Jab + cross + hook'],
  ['Jab + direto + uppercut', 'Jab + cross + uppercut'],
  ['Jab + direto', 'Jab + cross'],
  ['Direto', 'Cross'],
  ['Cruzado', 'Hook'],
  ['Esquiva lateral', 'Lateral slip'],
  ['Pendulo', 'Bob and weave'],
  ['Bloqueio alto', 'High block'],
  ['Chute frontal', 'Front kick'],
  ['Chute baixo alternado', 'Alternating low kick'],
  ['Chute medio alternado', 'Alternating middle kick'],
  ['Chute circular', 'Roundhouse kick'],
  ['Joelhada alternada', 'Alternating knee strike'],
  ['Esquiva + contra-ataque', 'Slip + counterattack'],
  ['Bloqueio de chute baixo', 'Low-kick block'],
  ['Burpee com guarda', 'Burpee with guard'],
  ['Polichinelo com guarda', 'Jumping jack with guard'],
  ['Corda', 'Jump rope'],
  ['Tecnica', 'Technique'],
  ['Movimentacao', 'Movement'],
  ['Fundamento', 'Fundamentals'],
  ['Golpe', 'Strike'],
  ['Combinacao e defesa', 'Combination and defense'],
  ['Combinacao', 'Combination'],
  ['Defesa e contra-ataque', 'Defense and counterattack'],
  ['Defesa', 'Defense'],
  ['Condicionamento', 'Conditioning'],
  ['Aquecimento', 'Warm-up'],
  ['Chute', 'Kick'],
  ['Joelho', 'Knee'],
  ['Peso corporal', 'Bodyweight'],
  ['Supino reto com pegada supinada', 'Reverse-grip dumbbell bench press'],
  ['Supino reto com halteres', 'Flat dumbbell bench press'],
  ['Crucifixo reto com halteres', 'Flat dumbbell fly'],
  ['Pullover com halter no banco reto', 'Dumbbell pullover on flat bench'],
  ['Pullover com halter no banco', 'Dumbbell pullover on bench'],
  ['Pullover com halter', 'Dumbbell pullover'],
  ['Squeeze press com halteres', 'Dumbbell squeeze press'],
  ['Supino fechado com halteres', 'Close-grip dumbbell bench press'],
  ['Remada curvada com halteres', 'Bent-over dumbbell row'],
  ['Remada unilateral apoiado no banco', 'Supported single-arm dumbbell row'],
  ['Remada aberta com halteres', 'Wide dumbbell row'],
  ['Crucifixo inverso com halteres', 'Dumbbell reverse fly'],
  ['Rosca direta com halteres ou barra curta', 'Dumbbell or short-bar curl'],
  ['Rosca direta com halteres', 'Dumbbell curl'],
  ['Rosca martelo com halteres', 'Dumbbell hammer curl'],
  ['Rosca concentrada', 'Concentration curl'],
  ['Rosca alternada', 'Alternating dumbbell curl'],
  ['Triceps frances com halter', 'Overhead dumbbell triceps extension'],
  ['Triceps testa com halteres ou barra curta', 'Dumbbell or short-bar skull crusher'],
  ['Triceps testa com halteres', 'Dumbbell skull crusher'],
  ['Coice de triceps com halter', 'Dumbbell triceps kickback'],
  ['Agachamento goblet com kettlebell ou halter', 'Goblet squat with kettlebell or dumbbell'],
  ['Agachamento goblet', 'Goblet squat'],
  ['Afundo com halteres', 'Dumbbell lunge'],
  ['Stiff com halteres', 'Dumbbell Romanian deadlift'],
  ['Elevacao pelvica com halter', 'Dumbbell hip thrust'],
  ['Agachamento sumo com halter', 'Dumbbell sumo squat'],
  ['Panturrilha em pe com halteres', 'Standing dumbbell calf raise'],
  ['Desenvolvimento com halteres', 'Dumbbell shoulder press'],
  ['Elevacao lateral com halteres', 'Dumbbell lateral raise'],
  ['Elevacao frontal com halteres', 'Dumbbell front raise'],
  ['Encolhimento com halteres', 'Dumbbell shrug'],
  ['Prancha', 'Plank'],
  ['Abdominal tradicional', 'Crunch'],
  ['Elevacao de pernas', 'Leg raise'],
  ['Russian twist com halter', 'Dumbbell Russian twist'],
  ['Peito medio', 'Mid chest'],
  ['Peito superior', 'Upper chest'],
  ['Abertura do peito', 'Chest fly'],
  ['Peitoral e serratil', 'Chest and serratus'],
  ['Peito interno e triceps', 'Inner chest and triceps'],
  ['Peito interno', 'Inner chest'],
  ['Dorsal unilateral', 'Single-arm back'],
  ['Dorsal e serratil', 'Back and serratus'],
  ['Dorsal', 'Back'],
  ['Costas superiores', 'Upper back'],
  ['Posterior de ombro', 'Rear delts'],
  ['Biceps braquial', 'Biceps brachii'],
  ['Braquial e antebraco', 'Brachialis and forearm'],
  ['Biceps isolado', 'Isolated biceps'],
  ['Biceps unilateral', 'Single-arm biceps'],
  ['Cabeca longa', 'Long head'],
  ['Triceps geral', 'General triceps'],
  ['Triceps lateral', 'Lateral triceps'],
  ['Quadriceps e gluteos', 'Quads and glutes'],
  ['Posterior de coxa', 'Hamstrings'],
  ['Gluteos', 'Glutes'],
  ['Adutores e gluteos', 'Adductors and glutes'],
  ['Panturrilhas', 'Calves'],
  ['Ombro anterior', 'Front delts'],
  ['Ombro lateral', 'Side delts'],
  ['Trapezio', 'Traps'],
  ['Core estabilizacao', 'Core stability'],
  ['Abdomen superior', 'Upper abs'],
  ['Abdomen inferior', 'Lower abs'],
  ['Obliquos', 'Obliques'],
  ['Peito e triceps', 'Chest and triceps'],
  ['Costas e biceps', 'Back and biceps'],
  ['Pernas e ombros', 'Legs and shoulders'],
  ['Peito', 'Chest'],
  ['Costas', 'Back'],
  ['Pernas', 'Legs'],
  ['Ombros', 'Shoulders'],
  ['Abdomen', 'Core'],
  ['Banco reto', 'Flat bench'],
  ['Halteres', 'Dumbbells'],
  ['Halter ou Kettlebell', 'Dumbbell or kettlebell'],
  ['Kettlebell ou Halter', 'Kettlebell or dumbbell'],
  ['Halter', 'Dumbbell'],
  ['cada lado', 'each side'],
  ['cada braco', 'each arm'],
  ['cada perna', 'each leg'],
  ['segundos', 'seconds'],
  ['alternado', 'alternating'],
  ['Forca', 'Strength'],
  ['Luta', 'Combat'],
  ['Base do treino', 'Workout base'],
  ['Reps/golpes validos', 'Valid reps/strikes'],
  ['Treino completo', 'Complete workout'],
  ['exercicios validos', 'valid exercises'],
  ['rounds validos', 'valid rounds']
].sort((a, b) => b[0].length - a[0].length);

function translateText(value) {
  if (typeof value !== 'string' || !value) {
    return value;
  }

  return translations.reduce((text, [from, to]) => text.split(from).join(to), value);
}

function translateArray(values) {
  return Array.isArray(values) ? values.map((value) => translateText(value)) : values;
}

function setTranslated(doc, field) {
  if (doc[field] === undefined) {
    return false;
  }

  const next = translateText(doc[field]);

  if (next !== doc[field]) {
    doc[field] = next;
    return true;
  }

  return false;
}

function translateFields(doc, fields) {
  return fields.reduce((changed, field) => setTranslated(doc, field) || changed, false);
}

function translateExerciseShape(exercise) {
  let changed = false;
  ['name', 'category', 'muscleGroup', 'subcategory', 'defaultReps', 'plannedReps', 'imageAlt'].forEach((field) => {
    changed = setTranslated(exercise, field) || changed;
  });

  const nextEquipment = translateArray(exercise.equipment);

  if (JSON.stringify(nextEquipment) !== JSON.stringify(exercise.equipment)) {
    exercise.equipment = nextEquipment;
    changed = true;
  }

  return changed;
}

async function saveIfChanged(doc, changed, collectionName, stats) {
  if (!changed) {
    return;
  }

  stats[collectionName] += 1;

  if (!shouldWrite) {
    return;
  }

  await doc.save();
}

async function translateWorkoutTypes(stats) {
  const docs = await WorkoutType.find({});

  for (const doc of docs) {
    const changed = translateFields(doc, ['name', 'description']);
    await saveIfChanged(doc, changed, 'workoutTypes', stats);
  }
}

async function translateExercises(stats) {
  const docs = await Exercise.find({});

  for (const doc of docs) {
    const changed = translateExerciseShape(doc);
    await saveIfChanged(doc, changed, 'exercises', stats);
  }
}

async function translateTemplates(stats) {
  const docs = await WorkoutTemplate.find({});

  for (const doc of docs) {
    let changed = translateFields(doc, ['name', 'level', 'description', 'workoutTypeName']);

    doc.exercises.forEach((exercise) => {
      changed = translateExerciseShape(exercise) || changed;
    });

    if (changed) {
      doc.markModified('exercises');
    }

    await saveIfChanged(doc, changed, 'templates', stats);
  }
}

async function translateDailyMissions(stats) {
  const docs = await DailyMission.find({});

  for (const doc of docs) {
    let changed = translateFields(doc, ['dayOfWeek', 'missionName', 'intensity']);

    doc.blocks.forEach((block) => {
      ['workoutName', 'intensity'].forEach((field) => {
        changed = setTranslated(block, field) || changed;
      });
    });

    if (changed) {
      doc.markModified('blocks');
    }

    await saveIfChanged(doc, changed, 'dailyMissions', stats);
  }
}

async function translateWorkouts(stats) {
  const docs = await Workout.find({});

  for (const doc of docs) {
    let changed = translateFields(doc, ['workoutName', 'missionOriginalWorkoutName']);

    doc.exercises.forEach((exercise) => {
      changed = translateExerciseShape(exercise) || changed;
    });

    if (doc.xp?.breakdown?.length) {
      doc.xp.breakdown.forEach((item) => {
        changed = setTranslated(item, 'label') || changed;
      });
      doc.markModified('xp');
    }

    if (changed) {
      doc.markModified('exercises');
    }

    await saveIfChanged(doc, changed, 'workouts', stats);
  }
}

async function main() {
  const stats = {
    workoutTypes: 0,
    exercises: 0,
    templates: 0,
    dailyMissions: 0,
    workouts: 0
  };

  await connectDatabase();
  await translateWorkoutTypes(stats);
  await translateExercises(stats);
  await translateTemplates(stats);
  await translateDailyMissions(stats);
  await translateWorkouts(stats);
  await mongoose.disconnect();

  console.log(`${shouldWrite ? 'Updated' : 'Preview'} database English migration:`);
  Object.entries(stats).forEach(([key, value]) => console.log(`- ${key}: ${value}`));

  if (!shouldWrite) {
    console.log('Run with --write to apply these changes.');
  }
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
