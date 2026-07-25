export const combatWorkoutTemplates = [
  {
    code: 'BOXE_01',
    name: 'Boxing 01 - Fundamentals',
    workoutTypeCode: 'boxing',
    level: 'Beginner',
    xpReward: 120,
    description: 'Basic workout for stance, guard, movement and simple strikes.',
    exercises: [
      { name: 'Stance and guard', rounds: 2, durationSeconds: 120, restSeconds: 30 },
      { name: 'Forward and backward footwork', rounds: 3, durationSeconds: 120, restSeconds: 30 },
      { name: 'Lateral footwork', rounds: 3, durationSeconds: 120, restSeconds: 30 },
      { name: 'Jab', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Cross', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Free shadowboxing', rounds: 2, durationSeconds: 180, restSeconds: 60 }
    ]
  },
  {
    code: 'BOXE_02',
    name: 'Boxing 02 - Combinations',
    workoutTypeCode: 'boxing',
    level: 'Intermediate',
    xpReward: 150,
    description: 'Workout focused on simple strike combinations and rhythm.',
    exercises: [
      { name: 'Shadowboxing with movement', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + cross', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + cross + hook', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + cross + uppercut', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Shadowboxing with defense', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'High-intensity shadowboxing', rounds: 2, durationSeconds: 180, restSeconds: 60 }
    ]
  },
  {
    code: 'BOXE_03',
    name: 'Boxing 03 - Defense and Conditioning',
    workoutTypeCode: 'boxing',
    level: 'Intermediate',
    xpReward: 170,
    description: 'Workout for slips, defense, endurance and fight rhythm.',
    exercises: [
      { name: 'Jump rope', rounds: 3, durationSeconds: 120, restSeconds: 30 },
      { name: 'Lateral slip', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Bob and weave', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + cross + slip', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'High block', rounds: 2, durationSeconds: 120, restSeconds: 30 },
      { name: 'High-intensity shadowboxing', rounds: 3, durationSeconds: 180, restSeconds: 60 }
    ]
  },
  {
    code: 'KICK_01',
    name: 'Kickboxing 01 - Stance and Kicks',
    workoutTypeCode: 'kickboxing',
    level: 'Beginner',
    xpReward: 140,
    description: 'Basic workout for guard, stance, movement and main kicks.',
    exercises: [
      { name: 'Kickboxing stance and guard', rounds: 2, durationSeconds: 120, restSeconds: 30 },
      { name: 'Kickboxing shadowboxing', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Front kick', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Alternating low kick', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Alternating knee strike', rounds: 3, durationSeconds: 60, restSeconds: 30 },
      { name: 'Shadowboxing with kicks', rounds: 2, durationSeconds: 180, restSeconds: 60 }
    ]
  },
  {
    code: 'KICK_02',
    name: 'Kickboxing 02 - Combinations',
    workoutTypeCode: 'kickboxing',
    level: 'Intermediate',
    xpReward: 170,
    description: 'Workout to connect punches, kicks and movement.',
    exercises: [
      { name: 'Kickboxing shadowboxing', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + cross + front kick', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + cross + low kick', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + cross + hook + low kick', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Cross + hook + middle kick', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Free kickboxing shadowboxing', rounds: 2, durationSeconds: 180, restSeconds: 60 }
    ]
  },
  {
    code: 'KICK_03',
    name: 'Kickboxing 03 - Defense and Conditioning',
    workoutTypeCode: 'kickboxing',
    level: 'Intermediate',
    xpReward: 190,
    description: 'More intense workout with defense, counterattack and conditioning.',
    exercises: [
      { name: 'Jumping jack with guard', rounds: 3, durationSeconds: 60, restSeconds: 30 },
      { name: 'Low-kick block', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Slip + counterattack', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Front kick + cross', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Alternating middle kick', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Burpee with guard', sets: 3, reps: '8-12' },
      { name: 'Free kickboxing shadowboxing', rounds: 3, durationSeconds: 180, restSeconds: 60 }
    ]
  }
];
