import 'dotenv/config';
import { Workout } from '../../src/models/Workout.js';
import { printJson, toDateKey, withDatabase } from './_helpers.js';

const CONFIG = {
  preseasonStartDate: '2026-07-22',
  officialSeasonStartDate: '2026-08-01'
};

function isCompletedWorkout(workout) {
  return (workout.exercises || []).some((exercise) => {
    const hasSets = (exercise.sets || []).some((set) => {
      return set.completed !== false && (Number(set.reps || 0) > 0 || Number(set.weight || 0) > 0);
    });
    const hasRounds = (exercise.rounds || []).some((round) => {
      return round.completed !== false && (Number(round.durationSeconds || 0) > 0 || Number(round.reps || 0) > 0);
    });

    return !exercise.skipped && (hasSets || hasRounds);
  });
}

function classifyWorkout(workout) {
  const dateKey = toDateKey(workout.date);

  if (dateKey < CONFIG.preseasonStartDate) {
    return 'before_preseason';
  }

  if (dateKey < CONFIG.officialSeasonStartDate) {
    return 'preseason';
  }

  return 'official';
}

await withDatabase(async () => {
  const workouts = await Workout.find({}).sort({ date: 1, createdAt: 1 });
  const groups = workouts.reduce((map, workout) => {
    const status = classifyWorkout(workout);
    const current = map[status] || [];

    current.push(workout);
    map[status] = current;

    return map;
  }, {});

  printJson('Season boundary audit', {
    config: CONFIG,
    counts: {
      beforePreseason: groups.before_preseason?.length || 0,
      preseason: groups.preseason?.length || 0,
      official: groups.official?.length || 0,
      completedOfficial: (groups.official || []).filter(isCompletedWorkout).length
    },
    preseasonWorkouts: (groups.preseason || []).map((workout) => ({
      date: toDateKey(workout.date),
      code: workout.workoutCode,
      name: workout.workoutName,
      completed: isCompletedWorkout(workout)
    })),
    officialWorkouts: (groups.official || []).map((workout) => ({
      date: toDateKey(workout.date),
      code: workout.workoutCode,
      name: workout.workoutName,
      completed: isCompletedWorkout(workout)
    }))
  });
});
