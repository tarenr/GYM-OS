import { DailyMission } from '../models/DailyMission.js';
import { Workout } from '../models/Workout.js';
import { WorkoutTemplate } from '../models/WorkoutTemplate.js';

const XP_VERSION = 'xp-v2.1';

function toDateKey(dateValue) {
  return new Date(dateValue).toISOString().slice(0, 10);
}

function getDayIndexFromDateKey(dateKey) {
  return new Date(`${dateKey}T12:00:00`).getDay();
}

function isValidSet(set) {
  return Number(set?.weight || 0) > 0 && Number(set?.reps || 0) > 0;
}

function isValidRound(round) {
  return round?.completed !== false && Number(round?.durationSeconds || 0) > 0;
}

function isCompletedWorkout(workout) {
  return (workout.exercises || []).some((exercise) => (
    (exercise.sets || []).some(isValidSet) || (exercise.rounds || []).some(isValidRound)
  ));
}

function getTemplateBlockType(template) {
  const workoutTypeCode = template?.workoutTypeCode || '';

  if (workoutTypeCode === 'strength') return 'strength';
  if (workoutTypeCode === 'boxing' || workoutTypeCode === 'kickboxing') return 'combat';

  return '';
}

function getWorkoutBlockType(workout, templatesByCode, templatesById) {
  if (workout.missionBlockType) {
    return workout.missionBlockType;
  }

  const template = templatesById.get(String(workout.templateId || '')) || templatesByCode.get(workout.workoutCode);
  const templateBlockType = getTemplateBlockType(template);

  if (templateBlockType) {
    return templateBlockType;
  }

  const modalities = new Set((workout.exercises || []).map((exercise) => exercise.modality).filter(Boolean));

  if (modalities.has('strength')) return 'strength';
  if (modalities.has('boxing') || modalities.has('kickboxing')) return 'combat';

  return '';
}

function getBlockLabel(block) {
  if (block.type === 'strength') return 'Forca';
  if (block.type === 'combat') return block.modality === 'boxing' ? 'Boxe' : 'Kickboxing';

  return 'Recuperacao';
}

function formatMissionBlockCompletion(block, workout) {
  if (!workout) {
    return block?.workoutCode || 'DESC';
  }

  return workout.workoutCode !== block.workoutCode
    ? `${block.workoutCode} -> ${workout.workoutCode}`
    : block.workoutCode || workout.workoutCode || 'DESC';
}

function getWorkoutForMissionBlock(dateKey, block, completedWorkouts, templatesByCode, templatesById) {
  const exactWorkout = completedWorkouts.find((workout) => workout.workoutCode === block.workoutCode);

  if (exactWorkout) {
    return exactWorkout;
  }

  const assignedWorkout = completedWorkouts.find((workout) => {
    const missionDateKey = workout.missionDate ? toDateKey(workout.missionDate) : '';

    return missionDateKey === dateKey
      && workout.missionBlockType === block.type
      && workout.missionOriginalWorkoutCode === block.workoutCode;
  });

  if (assignedWorkout) {
    return assignedWorkout;
  }

  return completedWorkouts.find((workout) => (
    workout.workoutCode !== block.workoutCode
    && !workout.missionOriginalWorkoutCode
    && getWorkoutBlockType(workout, templatesByCode, templatesById) === block.type
  ));
}

export function calculateWorkoutXpBreakdown(workout) {
  const exercises = workout?.exercises || [];
  const exerciseDetails = exercises.map((exercise) => {
    const validSets = (exercise.sets || []).filter(isValidSet);
    const validRounds = (exercise.rounds || []).filter(isValidRound);
    const validReps = validSets.reduce((total, set) => total + Number(set.reps || 0), 0)
      + validRounds.reduce((total, round) => total + Number(round.reps || 0), 0);
    const repsBonus = Math.min(10, Math.floor(validReps / 5));
    const valid = validSets.length > 0 || validRounds.length > 0;
    const xp = valid ? 10 + validSets.length * 5 + validRounds.length * 8 + repsBonus : 0;

    return {
      name: exercise.name || 'Exercicio',
      valid,
      validSets: validSets.length,
      validRounds: validRounds.length,
      validReps,
      repsBonus,
      xp
    };
  });
  const validExercises = exerciseDetails.filter((exercise) => exercise.valid).length;
  const validSets = exerciseDetails.reduce((total, exercise) => total + exercise.validSets, 0);
  const validRounds = exerciseDetails.reduce((total, exercise) => total + exercise.validRounds, 0);
  const repsBonus = exerciseDetails.reduce((total, exercise) => total + exercise.repsBonus, 0);
  const completed = validExercises > 0;
  const allExercisesValid = exercises.length > 0 && validExercises === exercises.length;
  const base = completed ? 30 : 0;
  const exerciseXp = validExercises * 10;
  const setXp = validSets * 5;
  const roundXp = validRounds * 8;
  const completionBonus = allExercisesValid ? 20 : 0;
  const total = base + exerciseXp + setXp + roundXp + repsBonus + completionBonus;

  return {
    total,
    base,
    exerciseXp,
    setXp,
    roundXp,
    repsBonus,
    completionBonus,
    validExercises,
    totalExercises: exercises.length,
    validSets,
    validRounds,
    exerciseDetails
  };
}

function buildExecutionBreakdown(execution) {
  return [
    { type: 'execution', label: 'Base do treino', xp: execution.base },
    { type: 'execution', label: `${execution.validExercises}/${execution.totalExercises} exercicios validos`, xp: execution.exerciseXp },
    { type: 'execution', label: `${execution.validSets} series validas`, xp: execution.setXp },
    { type: 'execution', label: `${execution.validRounds} rounds validos`, xp: execution.roundXp },
    { type: 'execution', label: 'Reps/golpes validos', xp: execution.repsBonus },
    { type: 'execution', label: 'Treino completo', xp: execution.completionBonus }
  ].filter((item) => item.xp > 0);
}

async function getCampaignEntriesByWorkout(dateKey, workoutsForDate) {
  const mission = await DailyMission.findOne({
    dayIndex: getDayIndexFromDateKey(dateKey),
    active: true
  });

  if (!mission || mission.restDay) {
    return new Map();
  }

  const templates = await WorkoutTemplate.find({
    active: true,
    code: { $in: workoutsForDate.map((workout) => workout.workoutCode) }
  });
  const templatesByCode = new Map(templates.map((template) => [template.code, template]));
  const templatesById = new Map(templates.map((template) => [String(template._id), template]));
  const completedWorkouts = workoutsForDate.filter(isCompletedWorkout);
  const requiredBlocks = (mission.blocks || []).filter((block) => block.type !== 'recovery');
  const entriesByWorkout = new Map();
  const completedEntries = requiredBlocks.map((block) => ({
    block,
    workout: getWorkoutForMissionBlock(dateKey, block, completedWorkouts, templatesByCode, templatesById)
  })).filter((entry) => entry.workout);

  completedEntries.forEach((entry) => {
    const workoutId = String(entry.workout._id);
    const entries = entriesByWorkout.get(workoutId) || [];

    entries.push({
      type: 'block',
      label: `${getBlockLabel(entry.block)} ${formatMissionBlockCompletion(entry.block, entry.workout)}`,
      xp: Number(entry.block.xpReward || 0)
    });
    entriesByWorkout.set(workoutId, entries);
  });

  if (requiredBlocks.length > 0 && completedEntries.length === requiredBlocks.length && Number(mission.bonusXp || 0) > 0) {
    const lastWorkout = [...completedEntries]
      .map((entry) => entry.workout)
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
    const workoutId = String(lastWorkout?._id || '');
    const entries = entriesByWorkout.get(workoutId) || [];

    entries.push({
      type: 'mission-bonus',
      label: `Bonus da campanha - ${mission.missionName}`,
      xp: Number(mission.bonusXp || 0)
    });
    entriesByWorkout.set(workoutId, entries);
  }

  return entriesByWorkout;
}

export async function recalculateWorkoutDateXpSnapshots(dateValue) {
  const dateKey = toDateKey(dateValue);
  const start = new Date(`${dateKey}T00:00:00.000Z`);
  const end = new Date(`${dateKey}T00:00:00.000Z`);

  end.setUTCDate(end.getUTCDate() + 1);

  const workouts = await Workout.find({ date: { $gte: start, $lt: end } }).sort({ createdAt: 1 });
  const campaignEntriesByWorkout = await getCampaignEntriesByWorkout(dateKey, workouts);
  const updated = [];

  for (const workout of workouts) {
    const execution = calculateWorkoutXpBreakdown(workout);
    const campaignEntries = campaignEntriesByWorkout.get(String(workout._id)) || [];
    const campaign = campaignEntries.reduce((total, entry) => total + Number(entry.xp || 0), 0);
    const xp = {
      version: XP_VERSION,
      execution: execution.total,
      campaign,
      total: execution.total + campaign,
      calculatedAt: new Date(),
      breakdown: [
        ...buildExecutionBreakdown(execution),
        ...campaignEntries
      ]
    };

    workout.xp = xp;
    updated.push(await workout.save());
  }

  return updated;
}
