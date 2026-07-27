# Sistema de Missoes Por Objetivo

Ultima atualizacao: 2026-07-27

## Objetivo

Transformar as missoes do GYM-OS em campanhas alinhadas ao objetivo da pessoa.

Nesta fase o app continua pessoal/local, sem multiusuario. Mesmo assim, a estrutura deve ser pensada para receber `userId` no futuro sem refazer o sistema.

## Objetivo Atual Da Jornada

Perfil ativo:

```text
Objetivo principal: recomposicao corporal
Foco secundario: base de forca + suporte para reducao de peso
Nivel: iniciante
Fase: Fundacao
Modalidade ativa: strength
Modalidades pausadas: boxing, kickboxing
Frequencia: segunda a sabado
Descanso: domingo
Padrao semanal: A B C A B C DESC
Inicio da jornada: 2026-07-22
```

Regra operacional:

```text
Segunda a sabado sempre tem treino de forca.
Domingo e descanso planejado.
Luta nao deve ser cobrada enquanto estiver pausada.
```

## Modelo Conceitual

No futuro, este perfil pode virar um documento no banco.

```js
const goalProfile = {
  primaryGoal: 'body_recomposition',
  secondaryGoals: ['strength_base', 'weight_loss_support'],
  level: 'beginner',
  phase: 'foundation',
  activeModalities: ['strength'],
  pausedModalities: ['boxing', 'kickboxing'],
  weeklyPattern: ['A', 'B', 'C', 'A', 'B', 'C', 'DESC'],
  startDate: '2026-07-22'
};
```

## Tipos De Objetivo Futuros

Objetivos que o motor deve poder suportar depois:

```text
body_recomposition - recomposicao corporal
hypertrophy - hipertrofia
fat_loss - perda de gordura
strength - forca
combat_conditioning - luta/condicionamento
general_health - saude geral
```

Cada objetivo muda:

- frequencia semanal;
- modalidades ativas;
- tipos de missao;
- prioridade de XP;
- conquistas recomendadas;
- indicadores do dashboard.

## Campanha Semanal Atual

Padrao desejado:

```text
SEG: Forca A
TER: Forca B
QUA: Forca C
QUI: Forca A
SEX: Forca B
SAB: Forca C
DOM: Descanso
```

Cada dia ativo tem apenas um bloco obrigatorio:

```js
{
  type: 'strength',
  workoutCode: 'A',
  required: true,
  xpReward: 150
}
```

Domingo:

```js
{
  restDay: true,
  blocks: [
    { type: 'recovery', workoutCode: 'DESC' }
  ]
}
```

## Regras De Conclusao

Para dias ativos:

```text
Completo - 100% dos exercicios planejados executados.
OK       - 60% ou mais dos exercicios planejados executados.
Parcial  - abaixo de 60%, mas com tentativa registrada.
Perdido  - dia passado sem treino/tentativa.
Aberto   - dia atual ainda sem treino.
Futuro   - dia depois de hoje.
```

Regra importante:

```text
Hoje em aberto nao e atraso.
Um bloco so vira atrasado quando a data fica menor que o dia atual.
```

## XP De Campanha

Proposta inicial para o objetivo atual:

```text
Bloco de forca: +150 XP
Bonus diario: +30 XP
Total diario possivel: +180 XP
Total semanal possivel: 1080 XP
```

O XP de execucao continua separado e deve considerar:

- series validas;
- repeticoes validas;
- qualidade da ficha;
- exercicios pulados;
- exercicios extras;
- ficha completa.

## Substituicao

Como o objetivo atual aceita apenas `strength`:

```text
Um treino de forca pode substituir outro bloco de forca.
Luta nao deve substituir forca enquanto estiver pausada.
Treino extra continua permitido, mas nao substitui descanso planejado.
```

Exemplo:

```text
Missao do dia: Forca C
Treino feito: Forca B
Resultado: substituicao de forca, vinculada a missao do dia
```

## Telas Impactadas

Ao implementar o objetivo atual, revisar:

- `CAMPAIGN_TODAY.exe`;
- `JOURNEY_COMMAND.sys`;
- `WEEKLY_SCHEDULE.sys`;
- `WEEKLY_MISSIONS.sys`;
- `ACTIVITY_HEATMAP.sys`;
- `ACTIVITY_FEED.stream`;
- historico de treinos;
- detalhe do treino.

## Dados Globais E Pessoais

Mesmo sem multiusuario agora, separar mentalmente:

Globais:

- catalogo de exercicios;
- fichas A/B/C oficiais;
- tipos de treino;
- regras do objetivo.

Pessoais:

- treinos realizados;
- substituicoes;
- XP;
- conquistas;
- heatmap;
- jornada ativa.

## Fases De Implementacao

### Fase 1 - Documentacao

- Criar este documento.
- Atualizar `DOCUMENTACAO_APP.md`.

### Fase 2 - Campanha A/B/C

- Atualizar `src/data/weeklyDailyMissions.js`.
- Remover blocos de combate da campanha ativa.
- Configurar `A B C A B C DESC`.
- Status: implementado.

### Fase 3 - Dashboard E Heatmap

- Ajustar paineis para 1 bloco de forca por dia.
- Esconder acoes de luta quando luta estiver pausada.
- Manter hoje em aberto separado de atraso.
- Status: implementado parcialmente.
- Pendente: explicar melhor substituicoes, parciais e extras na UI.

### Fase 4 - XP E Conquistas

- Recalibrar XP semanal.
- Criar conquistas para consistencia de forca.
- Evitar cobrancas de luta na fase atual.

### Fase 5 - Motor De Objetivos

- Criar catalogo de objetivos.
- Criar gerador de campanha semanal.
- Preparar para multiusuario no futuro.

## Proxima Implementacao Recomendada

Proxima melhoria recomendada:

```text
Transparencia de substituicao
```

Objetivo:

- deixar claro o bloco planejado e o treino feito;
- diferenciar campanha, substituicao e extra;
- melhorar heatmap, historico, feed e detalhe do treino.
