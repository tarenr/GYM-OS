# Roadmap Estrategia Nerd Academy

Ultima atualizacao: 2026-07-18

Este documento define a evolucao do projeto de um app local de treino para um modulo dentro da marca guarda-chuva **Estrategia Nerd Academy**.

O planejamento de XP, ranks, temporadas, ciclos e conquistas para aproximadamente 1 ano de treino fica em:

```text
ACADEMY_PROGRESS_SYSTEM.md
```

## Decisao de Marca

Nome principal:

```text
Estrategia Nerd Academy
```

Modulo atual:

```text
Gym OS - Treino
```

Nome do produto dentro da Academy:

```text
Treino Estrategia Nerd
```

O nome **Nerdcademy** fica reservado como apelido, campanha, laboratorio ou evento especial. Ele nao deve substituir a marca principal porque e menos claro, mais dificil de escrever e passa uma impressao mais informal.

## Arquitetura de Produto

```text
Estrategia Nerd Academy
  Gym OS - Treino
    Dashboard
    Missoes
    Treinos
    Fichas
    Tipos de treino
    Exercicios
    XP
    Heatmap
```

No futuro, a Academy pode receber novos modulos:

```text
Estrategia Nerd Academy
  Gym OS - Treino
  Study OS - Estudos
  Habit OS - Habitos
  Nutrition OS - Nutricao
  Quest OS - Desafios
```

## Objetivo Da Atualizacao

Reposicionar o app como uma plataforma de jornada e evolucao pessoal gamificada, sem perder o foco atual em treino.

Antes:

```text
Um app para registrar treinos.
```

Depois:

```text
Um sistema de progresso dentro da Estrategia Nerd Academy, onde treinos viram missoes, progresso vira XP e rotina vira campanha semanal.
```

## Principios De Projeto

1. O treino continua sendo o centro da experiencia atual.
2. A Academy vira a marca guarda-chuva.
3. Gym OS vira o nome operacional do modulo de treino.
4. Missoes, XP, ranks e heatmap devem parecer partes do mesmo sistema.
5. As mudancas de marca nao devem quebrar dados existentes.
6. O projeto deve evoluir por fases pequenas e validaveis.

## Etapas De Implementacao

### Fase 1 - Identidade Base

Status: concluida.

Objetivo:

- aplicar "Estrategia Nerd Academy" nos pontos principais de interface e documentacao;
- manter "Gym OS" como identidade visual do modulo;
- preservar "Treino Estrategia Nerd" como nome do produto atual.

Tarefas:

- atualizar titulo do navegador;
- atualizar marca lateral;
- atualizar cabecalho do app;
- atualizar README;
- registrar esta decisao no `DOCUMENTACAO_APP.md`.

### Fase 2 - Narrativa De Jornada

Status: em andamento.

Objetivo:

- transformar a leitura das missoes semanais em jornada/campanha;
- renomear textos soltos de "rotina" para "campanha semanal" onde fizer sentido;
- deixar claro que musculacao e luta sao blocos de uma missao diaria.

Tarefas:

- revisar textos da tela Dashboard;
- revisar textos da tela Missoes;
- criar labels consistentes para bloco pendente, concluido, extra e descanso;
- avaliar nomes melhores para missoes da semana.
- permitir substituicao de bloco por outro treino do mesmo tipo.

Decisao inicial:

```text
Segunda: Protocolo de Entrada
Terca: Base de Combate
Quarta: Nucleo de Forca
Quinta: Combo Tecnico
Sexta: Teste de Resistencia
Sabado: Boss Semanal
Domingo: Recuperacao Programada
```

Regra de substituicao:

```text
Se o bloco de forca previsto era C, mas o usuario fez B no lugar,
o historico salva B e a campanha exibe C -> B como bloco concluido.
```

Regra de exercicios extras no treino:

```text
Ao iniciar uma ficha, o usuario pode adicionar exercicios extras.
O catalogo e filtrado pela modalidade da ficha atual.
O detalhe do treino mostra o que era planejado e o que foi adicionado na hora.
```

### Fase 3 - XP v2

Status: em andamento.

Objetivo:

- fazer o XP refletir execucao, missao e progresso;
- exibir breakdown de XP por treino;
- padronizar o dashboard com a nova regra.

Tarefas:

- criar modulo `xpCalculator`;
- calcular XP base por treino;
- calcular XP por exercicio, serie e round validos;
- calcular bonus de missao diaria;
- preparar extensao futura para PR e progressao;
- mostrar breakdown no detalhe do treino.

Implementado nesta fase:

```text
public/assets/xpCalculator.js
Dashboard usa execucao + campanha.
Detalhe do treino mostra XP_V2.breakdown.
Substituicao valida recebe XP do bloco substituido.
Backend salva snapshot em Workout.xp ao criar/editar/excluir treinos.
Script scripts/recalculate-xp.js migra historico antigo.
Tela Evolucao mostra XP total, semanal, tendencia, split execucao/campanha e log.
Tela Evolucao tambem mostra historico por exercicio com resumo de maior carga, volume, rounds e ultimas execucoes.
Tela Evolucao marca PRs automaticos por exercicio e mostra PR_RECENT.log.
Tela Evolucao compara carga, reps, volume, tempo ou golpes por exercicio.
Tela Evolucao filtra evolucao por exercicio por periodo.
Tela Evolucao mostra ACHIEVEMENTS.codex com 16 conquistas anuais iniciais.
Dashboard ACHIEVEMENTS.sys usa o mesmo motor anual de conquistas.
```

### Fase 4 - Progressao Do Atleta

Status: planejada.

Objetivo:

- transformar historico em feedback de evolucao.

Tarefas:

- criar historico por exercicio;
- comparar carga, repeticoes e volume por exercicio;
- destacar PRs;
- criar tela ou secao de evolucao.

Implementado nesta fase:

```text
Secao EXERCISE_PROGRESS.db dentro de Evolucao.
Seletor de exercicio baseado nos treinos realizados.
Resumo do exercicio selecionado.
Historico das execucoes com carga, volume, rounds ou golpes.
PR automatico por carga, repeticoes, volume, tempo e golpes.
Comparativo visual EXERCISE_COMPARE.chart por exercicio selecionado.
Filtro de periodo para resumo, comparativo, PR_RECENT.log e historico do exercicio.
```

### Fase 5 - Conquistas E Campanhas

Status: em andamento.

Objetivo:

- consolidar a sensacao de Academy com ciclos, ranks e conquistas.

Tarefas:

- usar `ACADEMY_PROGRESS_SYSTEM.md` como referencia;
- criar insignias por nivel;
- criar conquistas por consistencia;
- criar conquistas por modalidade;
- avaliar conceito de campanha mensal ou ciclo de 8 semanas.

Implementado nesta fase:

```text
ACHIEVEMENTS.codex dentro de Evolucao.
Motor frontend de conquistas anuais.
16 conquistas iniciais.
Inicio oficial da jornada em 2026-07-22.
Dados pre-jornada fora das conquistas anuais.
Filtros por categoria/estado e resumo por categoria.
Dashboard sincronizado com conquistas anuais.
Treinos anteriores a 2026-07-22 removidos do banco.
```

## Linguagem Recomendada

Usar:

```text
Academy
Modulo
Gym OS
Missao
Bloco
Campanha semanal
Protocolo
XP
Rank
Evolucao
```

Evitar como marca principal:

```text
Nerdcademy
```

Pode usar como conceito secundario:

```text
Nerdcademy Labs
Nerdcademy Challenge
Nerdcademy Season
```

## Proxima Acao Recomendada

Concluir a Fase 1 e, depois, iniciar a Fase 2 revisando os textos do Dashboard e da tela Missoes.
