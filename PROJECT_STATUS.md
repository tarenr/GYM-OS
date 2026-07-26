# Status Unificado Do Projeto GYM-OS

Ultima atualizacao: 2026-07-24

Este documento consolida o que ja foi feito, o que esta parcialmente feito e o que ainda falta fazer no GYM-OS.

Use este arquivo como mapa principal de continuidade. Os documentos especializados continuam existindo para detalhes:

```text
DOCUMENTACAO_APP.md
ROADMAP_ACADEMY.md
ACADEMY_PROGRESS_SYSTEM.md
MISSION_GOAL_SYSTEM.md
BODY_PROGRESS_SYSTEM.md
EXERCISE_MEDIA_PACK.md
```

## Produto

Nome oficial:

```text
GYM-OS
```

Ecossistema:

```text
Estrategia Nerd Academy
```

Jornada ativa:

```text
Projeto Anual 2026
Inicio oficial: 2026-07-22
```

Stack:

```text
Node + Express + Mongoose + MongoDB Atlas
Frontend HTML/CSS/JS puro
```

## Estado Atual Resumido

O app ja permite:

- registrar treinos de musculacao e luta;
- usar fichas A/B/C;
- iniciar treino pela campanha diaria;
- adicionar exercicios extras ao treino;
- marcar exercicios planejados como pulados;
- substituir treino da campanha por outro treino do mesmo tipo;
- calcular XP v2 por execucao e campanha;
- salvar snapshot de XP no backend;
- mostrar dashboard, historico, feed, heatmap e evolucao;
- acompanhar PRs e progresso por exercicio;
- acompanhar conquistas anuais em tempo real;
- registrar evolucao corporal com peso e medidas;
- ver graficos simples de evolucao corporal;
- consultar documentacao dentro do app.

## Implementado

### Base Do App

- Backend Express.
- MongoDB Atlas com Mongoose.
- Frontend HTML/CSS/JS.
- Menu lateral.
- Dashboard.
- Cadastro/listagem de treinos.
- Cadastro/listagem de fichas.
- Cadastro/listagem de tipos de treino.
- Catalogo de exercicios.
- Imagens de exercicios com pacote Doom padronizado.
- Favicon.
- Script `.bat` para iniciar o sistema.
- Projeto movido para pasta propria `C:\xampp\htdocs\GYM-OS`.
- Repositorio GitHub `GYM-OS`.
- Script `npm run media:doom:sync` para vincular o pacote visual oficial aos exercicios de forca.

### Treinos E Fichas

- Fichas oficiais A/B/C.
- Exercicios planejados por ficha.
- Series, cargas e repeticoes.
- Rounds para luta.
- Exercicios extras no final do treino.
- Filtro de exercicios extras por modalidade da ficha.
- Opcao de pular exercicio planejado.
- Historico de treinos.
- Detalhe de treino.
- Exportacao CSV basica do historico.

### Missoes Por Objetivo

Objetivo atual:

```text
Recomposicao corporal
Base de forca
Luta pausada
```

Campanha semanal ativa:

```text
SEG A
TER B
QUA C
QUI A
SEX B
SAB C
DOM DESC
```

Implementado:

- blocos obrigatorios somente de forca;
- domingo como descanso planejado;
- boxe/kickboxing fora da cobranca atual;
- treino de forca substitui outro treino de forca;
- treino extra continua permitido;
- hoje em aberto nao conta como atraso;
- script `npm run missions:sync`.

### Heatmap E Feed

Implementado:

- heatmap a partir de 2026-07-22;
- estados futuro, hoje, perdeu, parcial, ok, descanso e extra;
- descanso planejado nao quebra a sequencia;
- dias futuros nao aparecem como perdidos;
- feed de atividade recente;
- classificacao campanha/substituicao/extra em partes do sistema.

Ainda precisa melhorar a transparencia de substituicao.

### XP v2 E Progressao

Implementado:

- `public/assets/xpCalculator.js`;
- `src/services/xpCalculator.js`;
- XP por treino;
- XP por exercicio valido;
- XP por serie/round valido;
- bonus por reps/golpes;
- bonus de treino completo;
- XP de campanha;
- snapshot `Workout.xp`;
- recalculo ao criar/editar/excluir treino;
- script `npm run xp:recalculate`;
- tela `Evolucao` com XP total, semanal, split execucao/campanha e log.

### Progresso Por Exercicio

Implementado:

- `EXERCISE_PROGRESS.db`;
- seletor de exercicio;
- historico por exercicio;
- resumo de maior carga, volume, reps, tempo ou golpes;
- PR automatico;
- comparativo visual;
- filtro por periodo.

### Conquistas

Implementado:

- `ACHIEVEMENTS.codex` na tela Evolucao;
- `ACHIEVEMENTS.sys` no Dashboard;
- motor frontend de conquistas anuais;
- filtros por categoria e estado;
- categoria `Corporal`;
- conquista `Primeira Medicao`;
- resumo por categoria;
- inicio oficial da jornada em 2026-07-22.

Ainda nao implementado:

- persistencia de conquistas no MongoDB.

### Evolucao Corporal

Implementado:

- model `BodyMeasurement`;
- CRUD `/api/body-measurements`;
- painel `BODY_PROGRESS.sys`;
- formulario de medicao corporal;
- historico com editar/excluir;
- cards de resumo;
- leitura inteligente;
- alerta leve apos 14 dias sem medicao;
- mini graficos de peso, cintura e abdomen;
- resumo por ciclo atual;
- card resumido no dashboard.

Campos atuais:

```text
data
peso
peito
braco direito
braco esquerdo
cintura
abdomen
quadril
coxa direita
coxa esquerda
panturrilha direita
panturrilha esquerda
observacoes
```

Exibicao das medidas salvas:

```text
Peito
Braco direito / braco esquerdo
Cintura
Abdomen
Quadril
Coxa direita / coxa esquerda
Panturrilha direita / panturrilha esquerda
```

### Documentacao

Implementado:

- menu de documentacao dentro do app;
- endpoints para os documentos principais;
- documentos separados por tema;
- este status unificado.

## Parcialmente Implementado

### Campanhas E Jornada Anual

Ja existe:

- inicio da jornada;
- temporadas e ciclos calculados no frontend;
- campanha semanal fixa;
- progresso anual visual.

Falta:

- campanhas mensais;
- ciclos de 4 ou 8 semanas com metas reais;
- fechamento de ciclo;
- revisao de temporada.

### XP Anual

Ja existe:

- XP v2 funcional;
- ranks e niveis;
- snapshot oficial por treino.

Falta:

- simulacao da curva anual;
- calibragem definitiva para 1 ano;
- possivel XP v3;
- revisao dos ranks para durarem a jornada anual inteira.

### Objetivos

Ja existe:

- objetivo atual documentado;
- campanha atual adaptada ao objetivo;
- luta pausada.

Falta:

- motor configuravel de objetivos;
- catalogo de objetivos;
- gerador automatico de campanha;
- preparacao real para multiusuario.

## Pendencias Reais

### P1 - Dashboard Visual Upgrade v1

Origem:

```text
gym-os-melhorias.html
gym-os-dashboard.html
```

Falta implementar:

- tokens de cor semantica;
- aplicar cores por significado;
- melhorar `WEEKLY_SCHEDULE.sys`;
- barra/status visual por dia;
- anel de XP proporcional ao progresso real;
- grid no `VOLUME_TREND.chart`;
- melhorar `ACTIVITY_FEED.stream` no estilo `MISSION_LOG.txt`;
- melhorar contraste dos labels secundarios.

### P1 - Transparencia De Substituicao

Falta implementar:

- tooltip do heatmap com `Missao: C | Feito: A | Parcial 57%`;
- historico com `Substituiu C por A`;
- feed distinguindo campanha, substituicao e extra;
- dashboard semanal explicando parcial por execucao;
- detalhe do treino mais claro para planejado vs feito.

### P1 - Persistencia De Conquistas

Falta implementar model:

```text
AchievementUnlock
```

Campos sugeridos:

```text
achievementId
title
category
unlockedAt
seasonId
sourceWorkoutId
sourceExerciseName
progressSnapshot
```

Objetivo:

- guardar data real de desbloqueio;
- evitar perder conquista se regra mudar;
- alimentar feed historico;
- permitir recompensas por temporada.

### P2 - Balanceamento Anual De XP

Falta:

- simular 1 ano de treino;
- definir XP semanal alvo;
- revisar formula de nivel;
- revisar ranks;
- decidir se snapshots antigos ficam iguais;
- criar plano de migracao visual se a formula mudar.

### P2 - Motor De Objetivos

Falta:

- criar `GoalProfile` ou config equivalente;
- catalogo de objetivos;
- objetivos como recomposicao, hipertrofia, perda de gordura, forca, luta;
- gerador de missao semanal;
- permitir pausar/reativar modalidades;
- preparar `userId` futuro.

### P2 - Campanhas Mensais E Ciclos

Falta:

- definir ciclo de 4 semanas;
- criar metas do ciclo;
- resumo de ciclo;
- recompensa por ciclo;
- revisao de temporada.

### P2 - Metas Por Exercicio

Falta:

- meta de carga;
- meta de reps;
- meta de volume;
- status da meta;
- alerta quando estiver perto;
- integracao com PRs.

### P2 - Evolucao Corporal v2

Falta:

- comparacao por periodo;
- meta corporal;
- percentual de gordura;
- guia visual de pontos de medicao;
- graficos de mais medidas;
- exportacao corporal.

### P3 - Fotos De Progresso

Falta planejar antes de implementar:

- storage;
- limite de tamanho;
- privacidade;
- exclusao definitiva;
- protecao de acesso;
- custo.

Regra:

```text
Fotos nunca devem ser publicas por padrao.
```

### P3 - Luta E Modalidades Pausadas

Falta para futuro:

- melhorar imagens de boxe/kickboxing;
- criar campanha hibrida quando luta voltar;
- criar conquistas de luta pausadas/reativadas;
- ranking por modalidade.

### P3 - Exportacoes E Relatorios

Falta:

- exportar evolucao por exercicio;
- exportar evolucao corporal;
- exportar relatorio de ciclo;
- melhorar CSV atual.

### P3 - Limpeza De Documentacao Antiga

Falta:

- revisar `DOCUMENTACAO_APP.md`;
- marcar trechos antigos como historico;
- remover referencias antigas a forca + combate como campanha atual;
- atualizar `ROADMAP_ACADEMY.md` com status real;
- atualizar `ACADEMY_PROGRESS_SYSTEM.md` para incluir a conquista corporal.

## Ordem Recomendada

1. Dashboard Visual Upgrade v1.
2. Transparencia de substituicao.
3. Persistencia de conquistas.
4. Balanceamento anual de XP.
5. Motor de objetivos.
6. Campanhas mensais/ciclos.
7. Metas por exercicio.
8. Evolucao Corporal v2.
9. Fotos de progresso.
10. Relatorios/exportacoes.

## Proximo Passo Sugerido

Implementar:

```text
Dashboard Visual Upgrade v1
```

Motivo:

- melhora o uso diario;
- nao muda banco;
- nao muda regras sensiveis;
- aproveita os dois HTMLs de referencia;
- prepara a UI para as proximas etapas.
