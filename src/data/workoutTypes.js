export const defaultWorkoutTypes = [
  {
    code: 'strength',
    name: 'Musculacao',
    description: 'Treinos com series, carga e repeticoes.',
    measurementType: 'sets_reps_weight',
    fields: ['sets', 'weight', 'reps']
  },
  {
    code: 'boxing',
    name: 'Boxe',
    description: 'Treinos com rounds, tempo, descanso e intensidade.',
    measurementType: 'rounds_time',
    fields: ['rounds', 'durationSeconds', 'restSeconds', 'intensity', 'completed']
  },
  {
    code: 'kickboxing',
    name: 'Kickboxing',
    description: 'Treinos com rounds, tempo, golpes, descanso e intensidade.',
    measurementType: 'rounds_time_reps',
    fields: ['rounds', 'durationSeconds', 'restSeconds', 'reps', 'intensity', 'completed']
  },
  {
    code: 'cardio',
    name: 'Cardio',
    description: 'Treinos por duracao, distancia e intensidade.',
    measurementType: 'duration',
    fields: ['durationMinutes', 'distance', 'intensity']
  },
  {
    code: 'mobility',
    name: 'Mobilidade',
    description: 'Mobilidade, alongamento e recuperacao.',
    measurementType: 'duration',
    fields: ['durationMinutes', 'notes']
  }
];
