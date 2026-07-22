export function isValidSet(set) {
  return Number(set?.weight || 0) > 0 && Number(set?.reps || 0) > 0;
}

export function isValidRound(round) {
  return round?.completed !== false && Number(round?.durationSeconds || 0) > 0;
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
    const xp = valid
      ? 10 + validSets.length * 5 + validRounds.length * 8 + repsBonus
      : 0;

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

export function calculateWorkoutXp(workout) {
  return calculateWorkoutXpBreakdown(workout).total;
}

export function calculateLevel(totalXp) {
  let level = 1;
  let remainingXp = totalXp;
  let nextLevelXp = 100 + level * 50;

  while (remainingXp >= nextLevelXp) {
    remainingXp -= nextLevelXp;
    level += 1;
    nextLevelXp = 100 + level * 50;
  }

  return { level, currentXp: remainingXp, nextLevelXp };
}
