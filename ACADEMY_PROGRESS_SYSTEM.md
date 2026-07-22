# Sistema De Progressao Anual Da Academy

Ultima atualizacao: 2026-07-22

Este documento define o planejamento de longo prazo para XP, niveis, ranks, temporadas, ciclos e conquistas do produto **GYM-OS** dentro da **Estrategia Nerd Academy**.

O objetivo e sustentar aproximadamente **1 ano de treino** sem esgotar recompensas cedo demais.

## Principio Central

O app nao deve premiar apenas registro. Ele deve premiar uma jornada consistente.

```text
Treino registra execucao.
Missao organiza rotina.
XP mede participacao.
PR mede progresso.
Conquista marca viradas importantes.
Temporada da contexto de longo prazo.
```

## Estrutura Da Jornada

Modelo recomendado:

```text
Jornada anual
  4 temporadas de 12 semanas
    3 ciclos de 4 semanas por temporada
      4 campanhas semanais por ciclo
        missoes diarias
          blocos de forca, combate e recuperacao
```

Escala:

```text
1 ano        = 48 semanas uteis + margem
1 temporada  = 12 semanas
1 ciclo      = 4 semanas
1 campanha   = 1 semana
1 missao     = 1 dia
```

As 4 semanas restantes do ano podem ser usadas como margem para descanso, viagens, deload, manutencao ou semanas especiais.

## Temporadas

### Temporada 1 - Fundacao

Objetivo:

- consolidar habito;
- aprender fluxo do app;
- registrar treinos com consistencia;
- criar primeira base de PRs.

Foco:

```text
Consistencia > intensidade
```

### Temporada 2 - Intensificacao

Objetivo:

- aumentar volume;
- melhorar tecnica;
- manter campanha semanal mais estavel;
- comparar evolucao com a Temporada 1.

Foco:

```text
Volume + tecnica
```

### Temporada 3 - Especializacao

Objetivo:

- identificar pontos fortes;
- trabalhar pontos fracos;
- criar metas por exercicio ou modalidade;
- fortalecer força e luta como trilhas separadas.

Foco:

```text
Progresso especifico
```

### Temporada 4 - Consolidacao

Objetivo:

- fechar a jornada anual;
- medir evolucao real;
- consolidar ranks altos;
- preparar nova jornada anual.

Foco:

```text
Consistencia anual + revisao
```

## Ritmo De Treino Esperado

Rotina planejada atual:

```text
6 dias ativos por semana
3 blocos de forca principais por semana
3 blocos de combate por semana
1 dia de recuperacao programada
```

Para planejamento anual, considerar faixas:

```text
Baixa aderencia:       2 a 3 treinos/semana
Boa aderencia:         4 a 5 treinos/semana
Alta aderencia:        6 treinos/semana
Jornada sustentavel:   180 a 240 treinos/ano
```

As conquistas devem contemplar todas as faixas, mas os ranks finais devem exigir alta consistencia.

## Calibragem Anual De XP

O XP atual tem duas fontes:

```text
XP de execucao
XP de campanha
```

Estimativa por semana completa:

```text
Execucao de treinos:  1.800 a 2.800 XP
Campanha semanal:       600 a 900 XP
Total semanal bom:    2.400 a 3.700 XP
```

Estimativa anual:

```text
Baixa aderencia:      45.000 a 80.000 XP
Boa aderencia:        90.000 a 140.000 XP
Alta aderencia:      140.000 a 190.000 XP
```

Meta de design:

```text
Ano consistente deve terminar por volta do LV 45 a LV 60.
Ano excelente pode chegar perto do LV 70.
LV 100 deve ficar reservado para jornadas futuras ou usuario excepcional.
```

## Curva De Nivel

Regra atual no codigo:

```text
XP para proximo nivel = 100 + nivel * 50
```

Essa curva e boa para comeco rapido, mas pode acelerar demais em um projeto anual se o XP semanal crescer.

Recomendacao para versao anual:

```text
LV 1-10:   progressao rapida
LV 11-30:  progressao moderada
LV 31-60:  progressao longa
LV 61+:    progressao de elite
```

Formula candidata:

```text
XP proximo nivel = 120 + nivel * 60 + floor(nivel ^ 1.35 * 12)
```

Regra de implementacao:

- manter a formula atual ate a decisao de migracao;
- criar simulador antes de trocar a formula;
- se mudar a formula, recalcular apenas exibicao de nivel, nao snapshots de XP.

## Ranks Anuais

Ranks atuais:

```text
LV 1  - Noob Protocol
LV 4  - Aprendiz de Ferro
LV 8  - Maromba Jr
LV 13 - Operador de Supino
LV 19 - Cacador de PR
LV 26 - Maquina de Volume
LV 36 - Boss de Academia
LV 51 - Lenda do Protocolo
```

Ranks recomendados para 1 ano:

```text
LV 1   - Noob Protocol
LV 5   - Aprendiz de Ferro
LV 10  - Maromba Jr
LV 16  - Operador de Supino
LV 24  - Cacador de PR
LV 34  - Maquina de Volume
LV 46  - Boss de Academia
LV 60  - Lenda do Protocolo
LV 75  - Modo Mitico
LV 100 - Academy Legend
```

Os ranks devem ser raros o suficiente para durar o ano inteiro.

## Categorias De Conquistas

### 1. Entrada

Objetivo:

- ativar o usuario nas primeiras semanas.

Exemplos:

```text
Primeiro Treino
Primeira Missao
Primeiro PR
Primeiro Treino de Luta
Primeiro Treino Extra
Primeira Substituicao Inteligente
```

### 2. Consistencia

Objetivo:

- sustentar habito ao longo de meses.

Escala:

```text
1 semana ativa
4 semanas ativas
8 semanas ativas
12 semanas ativas
24 semanas ativas
36 semanas ativas
52 semanas ativas
```

Tambem:

```text
10 treinos
25 treinos
50 treinos
100 treinos
150 treinos
200 treinos
240 treinos
```

### 3. Campanha

Objetivo:

- premiar semanas bem organizadas.

Exemplos:

```text
1 campanha semanal completa
4 campanhas completas
8 campanhas completas
12 campanhas completas
24 campanhas completas
48 campanhas completas
Boss semanal concluido 10 vezes
Recuperacao programada respeitada 10 vezes
```

### 4. Performance

Objetivo:

- premiar progresso real, nao apenas presenca.

Exemplos:

```text
Primeiro PR
5 PRs
10 PRs
25 PRs
50 PRs
100 PRs
PR em 5 exercicios diferentes
PR em 10 exercicios diferentes
4 semanas com melhora de volume
4 semanas com melhora de carga
```

### 5. Modalidade

Objetivo:

- valorizar força, boxe e kickboxing como trilhas.

Exemplos:

```text
25 treinos de forca
50 treinos de forca
100 treinos de forca
25 treinos de luta
50 treinos de luta
100 treinos de luta
25 sessoes de boxe
25 sessoes de kickboxing
```

### 6. Temporada

Objetivo:

- sustentar o arco anual.

Exemplos:

```text
Temporada 1 iniciada
Temporada 1 concluida
Temporada 2 concluida
Temporada 3 concluida
Temporada 4 concluida
Ciclo de 4 semanas concluido
3 ciclos concluidos
Jornada anual concluida
```

## Catalogo Inicial Recomendado

Primeira versao implementavel:

```text
01. Primeiro Treino
02. Primeira Semana Ativa
03. Primeiro PR
04. Primeiro Treino de Forca
05. Primeiro Treino de Luta
06. Treino Extra Registrado
07. Substituicao Inteligente
08. 10 Treinos Realizados
09. 25 Treinos Realizados
10. 50 Treinos Realizados
11. 5 PRs Registrados
12. 10 PRs Registrados
13. Campanha Semanal Completa
14. 4 Semanas Ativas
15. LV 10 Academy
16. LV 25 Academy
```

Nao implementar todas as conquistas anuais de uma vez. O app deve ganhar a primeira camada e depois expandir por temporada.

## Persistencia

### Calcular Em Tempo Real

Pode continuar calculado no frontend/backend:

```text
XP total
nivel
rank
PRs derivados do historico
progresso parcial de conquistas
```

### Persistir No Banco Futuramente

Deve ser salvo quando o sistema amadurecer:

```text
achievementId
unlockedAt
seasonId
progressSnapshot
sourceWorkoutId
sourceExerciseName
```

Motivo:

- manter data exata de desbloqueio;
- evitar perder conquista se uma regra mudar;
- permitir feed de atividade historico;
- permitir recompensas de temporada.

Modelo futuro sugerido:

```js
{
  achievementId: String,
  title: String,
  category: String,
  unlockedAt: Date,
  seasonId: String,
  sourceWorkoutId: ObjectId,
  sourceExerciseName: String,
  progressSnapshot: {
    value: Number,
    target: Number
  }
}
```

## Regras De Design

1. Conquista de entrada deve ser rapida.
2. Conquista anual deve ser rara.
3. XP nao deve ser dado diretamente por carga.
4. PR pode influenciar conquista e bonus futuro, mas nao deve distorcer o XP base.
5. Recuperacao programada deve ser parte da campanha, nao falha.
6. Treino extra deve ser positivo, mas nao deve substituir disciplina da campanha.
7. Substituicao correta deve ser premiada como flexibilidade inteligente.
8. A primeira execucao de um exercicio cria linha de base; PR real so vem depois.

## Plano De Implementacao

### Etapa 1 - Motor De Conquistas Anual

Status: primeira versao implementada no frontend.

Criar um catalogo estruturado no frontend:

```text
id
category
tier
title
description
target
progress
unlocked
```

Usar dados existentes:

```text
state.allWorkouts
XP total
nivel
PRs automaticos
campanhas semanais
modalidades
substituicoes
treinos extras
```

Implementado:

```text
ACHIEVEMENTS.codex na tela Evolucao.
ACHIEVEMENTS.sys no Dashboard consumindo o mesmo motor anual.
16 conquistas iniciais calculadas em tempo real.
Inicio da jornada fixado em 2026-07-22.
Treinos anteriores ficam fora da progressao anual.
Filtros por categoria e estado.
Resumo por categoria.
Sem persistencia de desbloqueio ainda.
```

### Etapa 2 - Tela Inicial De Conquistas

Status: primeira versao implementada dentro da tela Evolucao.

Adicionar bloco na tela Evolucao:

```text
ACHIEVEMENTS.codex
```

Com:

```text
total desbloqueado
progresso anual
cards por categoria
barra de progresso
estado locked/unlocked
filtros por categoria
filtros por estado
resumo por categoria
```

### Etapa 3 - Temporadas E Ciclos

Criar definicao de temporada:

```text
seasonId
nome
inicio
fim
ciclos
```

Inicialmente pode ser configurado em JS.

### Etapa 4 - Persistencia

Criar modelo `AchievementUnlock` somente depois que as regras estiverem boas.

### Etapa 5 - XP Anual v3

Simular curva anual antes de alterar `calculateLevel`.

## Decisao De Inicio Da Jornada

A jornada anual da Academy comeca em:

```text
2026-07-22
```

Regra:

```text
O treino de 22/07/2026 e considerado o primeiro passo oficial da jornada anual.
```

Dados anteriores a 22/07/2026 foram removidos do banco em 22/07/2026 para a jornada anual comecar limpa.

Script usado:

```text
npm run journey:clear:prestart
```

Motivo:

- a decisao foi tomada no inicio formal da jornada;
- o treino do dia passa a ser o marco zero operacional;
- evita que conquistas anuais sejam desbloqueadas retroativamente por dados antigos.
- deixa o treino de 22/07/2026 como primeiro marco real da jornada.
