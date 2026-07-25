export const defaultWorkoutTypes = [
  {
    code: 'strength',
    name: 'Strength',
    description: 'Workouts with sets, load and reps.',
    measurementType: 'sets_reps_weight',
    fields: ['sets', 'weight', 'reps']
  },
  {
    code: 'boxing',
    name: 'Boxing',
    description: 'Workouts with rounds, time, rest and intensity.',
    measurementType: 'rounds_time',
    fields: ['rounds', 'durationSeconds', 'restSeconds', 'intensity', 'completed']
  },
  {
    code: 'kickboxing',
    name: 'Kickboxing',
    description: 'Workouts with rounds, time, strikes, rest and intensity.',
    measurementType: 'rounds_time_reps',
    fields: ['rounds', 'durationSeconds', 'restSeconds', 'reps', 'intensity', 'completed']
  },
  {
    code: 'cardio',
    name: 'Cardio',
    description: 'Workouts by duration, distance and intensity.',
    measurementType: 'duration',
    fields: ['durationMinutes', 'distance', 'intensity']
  },
  {
    code: 'mobility',
    name: 'Mobility',
    description: 'Mobility, stretching and recovery.',
    measurementType: 'duration',
    fields: ['durationMinutes', 'notes']
  }
];
