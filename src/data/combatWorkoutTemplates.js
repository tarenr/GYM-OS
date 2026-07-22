export const combatWorkoutTemplates = [
  {
    code: 'BOXE_01',
    name: 'Boxe 01 - Fundamentos',
    workoutTypeCode: 'boxing',
    level: 'Iniciante',
    xpReward: 120,
    description: 'Treino basico para base, guarda, movimentacao e golpes simples.',
    exercises: [
      { name: 'Base e guarda', rounds: 2, durationSeconds: 120, restSeconds: 30 },
      { name: 'Deslocamento para frente e para tras', rounds: 3, durationSeconds: 120, restSeconds: 30 },
      { name: 'Deslocamento lateral', rounds: 3, durationSeconds: 120, restSeconds: 30 },
      { name: 'Jab', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Direto', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Sombra livre', rounds: 2, durationSeconds: 180, restSeconds: 60 }
    ]
  },
  {
    code: 'BOXE_02',
    name: 'Boxe 02 - Combinacoes',
    workoutTypeCode: 'boxing',
    level: 'Intermediario',
    xpReward: 150,
    description: 'Treino focado em combinacoes simples de golpes e ritmo.',
    exercises: [
      { name: 'Sombra com movimentacao', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + direto', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + direto + cruzado', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + direto + uppercut', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Sombra com defesa', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Sombra em alta intensidade', rounds: 2, durationSeconds: 180, restSeconds: 60 }
    ]
  },
  {
    code: 'BOXE_03',
    name: 'Boxe 03 - Defesa e Condicionamento',
    workoutTypeCode: 'boxing',
    level: 'Intermediario',
    xpReward: 170,
    description: 'Treino para esquivas, defesa, resistencia e ritmo de luta.',
    exercises: [
      { name: 'Corda', rounds: 3, durationSeconds: 120, restSeconds: 30 },
      { name: 'Esquiva lateral', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Pendulo', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + direto + esquiva', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Bloqueio alto', rounds: 2, durationSeconds: 120, restSeconds: 30 },
      { name: 'Sombra em alta intensidade', rounds: 3, durationSeconds: 180, restSeconds: 60 }
    ]
  },
  {
    code: 'KICK_01',
    name: 'Kickboxing 01 - Base e Chutes',
    workoutTypeCode: 'kickboxing',
    level: 'Iniciante',
    xpReward: 140,
    description: 'Treino basico para guarda, base, movimentacao e chutes principais.',
    exercises: [
      { name: 'Base e guarda de kickboxing', rounds: 2, durationSeconds: 120, restSeconds: 30 },
      { name: 'Sombra de kickboxing', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Chute frontal', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Chute baixo alternado', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Joelhada alternada', rounds: 3, durationSeconds: 60, restSeconds: 30 },
      { name: 'Sombra com chutes', rounds: 2, durationSeconds: 180, restSeconds: 60 }
    ]
  },
  {
    code: 'KICK_02',
    name: 'Kickboxing 02 - Combinacoes',
    workoutTypeCode: 'kickboxing',
    level: 'Intermediario',
    xpReward: 170,
    description: 'Treino para unir socos, chutes e movimentacao.',
    exercises: [
      { name: 'Sombra de kickboxing', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + direto + chute frontal', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + direto + chute baixo', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Jab + direto + cruzado + chute baixo', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Direto + cruzado + chute medio', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Sombra livre de kickboxing', rounds: 2, durationSeconds: 180, restSeconds: 60 }
    ]
  },
  {
    code: 'KICK_03',
    name: 'Kickboxing 03 - Defesa e Condicionamento',
    workoutTypeCode: 'kickboxing',
    level: 'Intermediario',
    xpReward: 190,
    description: 'Treino mais intenso, com defesa, contra-ataque e condicionamento.',
    exercises: [
      { name: 'Polichinelo com guarda', rounds: 3, durationSeconds: 60, restSeconds: 30 },
      { name: 'Bloqueio de chute baixo', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Esquiva + contra-ataque', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Chute frontal + direto', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Chute medio alternado', rounds: 3, durationSeconds: 120, restSeconds: 45 },
      { name: 'Burpee com guarda', sets: 3, reps: '8-12' },
      { name: 'Sombra livre de kickboxing', rounds: 3, durationSeconds: 180, restSeconds: 60 }
    ]
  }
];
