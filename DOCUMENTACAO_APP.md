# Documentacao do App GYM-OS

Ultima atualizacao: 2026-07-22

## Identidade Do Produto

Marca guarda-chuva:

```text
Estrategia Nerd Academy
```

Modulo atual:

```text
GYM-OS
```

Produto atual:

```text
GYM-OS
```

Metodologia/ecossistema:

```text
Estrategia Nerd Academy
```

Jornada atual:

```text
Projeto Anual 2026
```

A decisao de marca foi documentada em:

```text
ROADMAP_ACADEMY.md
```

Sistema anual de progressao:

```text
ACADEMY_PROGRESS_SYSTEM.md
```

Resumo da decisao:

- **GYM-OS** e o nome oficial do produto/app;
- **Estrategia Nerd Academy** e a metodologia/ecossistema por tras da jornada;
- **Projeto Anual 2026** e a jornada ativa de treino;
- **Nerdcademy** fica reservado para apelidos, campanhas, eventos ou laboratorios, nao como marca principal.

Este documento resume o estado atual do app para permitir continuar o projeto em outro chat sem depender do historico completo da conversa.

## Visao Geral

O **GYM-OS** e um app local para acompanhar treinos de musculacao, boxe e kickboxing com uma camada de gamificacao dentro da Estrategia Nerd Academy.

O sistema registra:

- data do treino;
- ficha usada;
- tipo de treino;
- exercicios realizados;
- series, cargas e repeticoes;
- rounds, tempo, descanso, golpes e intensidade para lutas;
- historico por data;
- missoes diarias;
- heatmap de atividade;
- XP, niveis, ranks e insignias planejadas;
- imagens dos exercicios.

O projeto roda localmente em:

```text
http://localhost:3000
```

## Stack

Frontend:

```text
HTML + CSS + JavaScript puro
```

Backend:

```text
Node.js + Express
```

Banco:

```text
MongoDB Atlas
```

ODM:

```text
Mongoose
```

## Estrutura Principal

```text
GYM-OS/
  src/
    config/
      database.js
    controllers/
      dailyMissionController.js
      exerciseController.js
      exerciseMediaController.js
      templateController.js
      workoutController.js
      workoutTypeController.js
    data/
      combatExerciseCatalog.js
      combatWorkoutTemplates.js
      exerciseCatalog.js
      weeklyDailyMissions.js
      workoutTypes.js
    models/
      DailyMission.js
      Exercise.js
      Workout.js
      WorkoutTemplate.js
      WorkoutType.js
    routes/
      dailyMissionRoutes.js
      exerciseMediaRoutes.js
      exerciseRoutes.js
      templateRoutes.js
      workoutRoutes.js
      workoutTypeRoutes.js
    services/
      seedCombatWorkoutTemplates.js
      seedDailyMissions.js
      seedExerciseCatalog.js
      seedWorkoutTypes.js
      syncTemplateExerciseSubcategories.js
      wgerMediaService.js
    server.js

  public/
    favicon.svg
    index.html
    assets/
      app.js
      gym-os.css
      style.css
      exercises/
        ficha-a/
        ficha-b/
        ficha-c/

  scripts/
    clear-demo-workouts.js
    clear-exercise-media.js
    clear-prejourney-workouts.js
    link-ficha-a-ai-media.js
    link-ficha-b-ai-media.js
    link-ficha-c-ai-media.js
    seed-demo-workouts.js
    sync-wger-media.js

  package.json
  env.example
  README.md
```

## Como Rodar

Instalar dependencias:

```bash
npm install
```

Criar `.env` baseado em `env.example`:

```env
PORT=3000
MONGODB_URI=sua_string_do_mongodb_atlas
```

Importante: a string real do MongoDB Atlas fica somente no `.env`. Nao colocar senha na documentacao.

Iniciar:

```bash
npm run dev
```

Ou:

```bash
npm start
```

Validar:

```text
http://localhost:3000/health
```

Resposta esperada:

```json
{ "status": "ok" }
```

## Observacao Sobre MongoDB Atlas

A conexao com o Atlas precisou usar IPv4 forcado.

Arquivo:

```text
src/config/database.js
```

Configuracao importante:

```js
await mongoose.connect(uri, {
  serverSelectionTimeoutMS: 8000,
  family: 4
});
```

Sem `family: 4`, o servidor pode falhar com erro de conexao/allowlist mesmo quando o IP parece correto no Atlas.

Tambem foi configurado DNS:

```js
dns.setServers(['1.1.1.1', '8.8.8.8']);
```

## Scripts Disponiveis

```json
{
  "start": "node src/server.js",
  "dev": "node src/server.js",
  "demo:preview": "node scripts/seed-demo-workouts.js",
  "demo:seed": "node scripts/seed-demo-workouts.js --write",
  "demo:clear:preview": "node scripts/clear-demo-workouts.js",
  "demo:clear": "node scripts/clear-demo-workouts.js --yes",
  "journey:clear:preview": "node scripts/clear-prejourney-workouts.js",
  "journey:clear:prestart": "node scripts/clear-prejourney-workouts.js --yes",
  "xp:recalculate:preview": "node scripts/recalculate-xp.js",
  "xp:recalculate": "node scripts/recalculate-xp.js --write",
  "media:preview": "node scripts/sync-wger-media.js",
  "media:sync": "node scripts/sync-wger-media.js --write",
  "media:ficha-a:sync": "node scripts/link-ficha-a-ai-media.js --write",
  "media:ficha-b:sync": "node scripts/link-ficha-b-ai-media.js --write",
  "media:ficha-c:sync": "node scripts/link-ficha-c-ai-media.js --write"
}
```

## Inicializacao do Servidor

Ao iniciar, o servidor:

1. conecta no MongoDB;
2. semeia tipos de treino;
3. semeia catalogo de exercicios;
4. semeia fichas de boxe/kickboxing;
5. sincroniza subcategorias das fichas;
6. semeia missoes diarias;
7. sobe Express em `PORT`, padrao `3000`.

Arquivo:

```text
src/server.js
```

## API

### Health

```text
GET /health
```

### Treinos Realizados

```text
GET    /api/workouts
GET    /api/workouts/:id
POST   /api/workouts
PUT    /api/workouts/:id
DELETE /api/workouts/:id
```

Filtro:

```text
GET /api/workouts?workoutCode=A
```

### Fichas

```text
GET    /api/templates
GET    /api/templates/:id
POST   /api/templates
PUT    /api/templates/:id
DELETE /api/templates/:id
```

Delete de ficha e logico: marca `active: false`.

### Exercicios

```text
GET /api/exercises
```

Tambem pode ser chamado com:

```text
GET /api/exercises?syncMedia=1
```

### Tipos de Treino

```text
GET    /api/workout-types
GET    /api/workout-types/:id
POST   /api/workout-types
PUT    /api/workout-types/:id
DELETE /api/workout-types/:id
```

### Missoes Diarias

```text
GET /api/daily-missions
GET /api/daily-missions/today
```

### Imagens de Exercicios

```text
GET  /api/exercise-media/search
POST /api/exercise-media/link
POST /api/exercise-media/sync
```

## Modelos de Dados

### Workout

Representa um treino realizado.

Campos principais:

```js
{
  date: Date,
  templateId: ObjectId,
  workoutCode: String,
  workoutName: String,
  missionDate: Date,
  missionBlockType: String,
  missionOriginalWorkoutCode: String,
  missionOriginalWorkoutName: String,
  missionSubstitution: Boolean,
  durationMinutes: Number,
  exercises: [],
  notes: String,
  xp: {
    version: String,
    execution: Number,
    campaign: Number,
    total: Number,
    calculatedAt: Date,
    breakdown: []
  },
  isDemo: Boolean,
  demoBatch: String
}
```

Cada exercicio dentro do treino:

```js
{
  name: String,
  muscleGroup: String,
  subcategory: String,
  modality: String,
  measurementType: String,
  source: 'planned' | 'extra',
  plannedSets: Number,
  plannedReps: String,
  plannedRounds: Number,
  plannedDurationSeconds: Number,
  plannedRestSeconds: Number,
  imageUrl: String,
  imageAlt: String,
  completedSets: Number,
  completedRounds: Number,
  skipped: Boolean,
  skipReason: String,
  sets: [],
  rounds: [],
  notes: String
}
```

Series:

```js
{
  setNumber: Number,
  weight: Number,
  reps: Number
}
```

Rounds:

```js
{
  roundNumber: Number,
  durationSeconds: Number,
  restSeconds: Number,
  reps: Number,
  intensity: Number,
  completed: Boolean
}
```

O `Workout` possui virtual `totalVolume`:

```js
totalVolume = soma(weight * reps)
```

Atencao: o volume atual nao multiplica por uma variavel separada de series porque cada serie esta registrada individualmente.

### WorkoutTemplate

Representa uma ficha cadastrada.

Campos principais:

```js
{
  code: String,
  name: String,
  level: String,
  xpReward: Number,
  description: String,
  workoutTypeId: ObjectId,
  workoutTypeCode: String,
  workoutTypeName: String,
  measurementType: String,
  exercises: [],
  active: Boolean
}
```

### Exercise

Representa um exercicio do catalogo.

Campos principais:

```js
{
  name: String,
  category: String,
  subcategory: String,
  modality: String,
  measurementType: String,
  equipment: [String],
  defaultSets: Number,
  defaultReps: String,
  defaultRounds: Number,
  defaultDurationSeconds: Number,
  defaultRestSeconds: Number,
  imageUrl: String,
  imageAlt: String,
  mediaProvider: String,
  active: Boolean
}
```

### WorkoutType

Representa tipos de treino.

Tipos padrao:

```text
strength    - Musculacao
boxing      - Boxe
kickboxing  - Kickboxing
cardio      - Cardio
mobility    - Mobilidade
```

Tipos de medicao aceitos:

```text
sets_reps_weight
sets_reps
rounds_time
rounds_time_reps
duration
distance
free
```

### DailyMission

Representa a missao de cada dia da semana.

Campos:

```js
{
  dayIndex: Number,
  dayOfWeek: String,
  missionName: String,
  intensity: String,
  blocks: [],
  bonusXp: Number,
  restDay: Boolean,
  active: Boolean
}
```

Bloco de missao:

```js
{
  templateId: ObjectId,
  type: 'strength' | 'combat' | 'recovery',
  modality: String,
  workoutCode: String,
  workoutName: String,
  intensity: String,
  xpReward: Number
}
```

## Rotina Semanal Atual

As missoes diarias seguem o arquivo:

```text
src/data/weeklyDailyMissions.js
```

Rotina:

```text
Segunda: Musculacao A + BOXE_01
Terca:   Musculacao B + KICK_01
Quarta:  Musculacao A + BOXE_02
Quinta:  Musculacao B + KICK_02
Sexta:   Musculacao C + BOXE_03
Sabado:  Musculacao A + KICK_03
Domingo: Descanso planejado
```

Detalhes:

```text
Segunda - Protocolo de Entrada
A - Peito e triceps
BOXE_01 - Boxe 01 - Fundamentos
XP: 120 + 80 + 50 bonus

Terca - Base de Combate
B - Costas e biceps
KICK_01 - Kickboxing 01 - Base e Chutes
XP: 120 + 80 + 50 bonus

Quarta - Nucleo de Forca
A - Peito e triceps
BOXE_02 - Boxe 02 - Combinacoes
XP: 120 + 90 + 50 bonus

Quinta - Combo Tecnico
B - Costas e biceps
KICK_02 - Kickboxing 02 - Combinacoes
XP: 120 + 90 + 50 bonus

Sexta - Teste de Resistencia
C - Pernas e ombros
BOXE_03 - Boxe 03 - Defesa e Condicionamento
XP: 120 + 100 + 50 bonus

Sabado - Boss Semanal
A - Peito e triceps
KICK_03 - Kickboxing 03 - Defesa e Condicionamento
XP: 120 + 110 + 50 bonus

Domingo - Recuperacao Programada
XP: 0
```

## Fichas de Musculacao

### Treino A - Peito e Triceps

```text
1. Supino reto com halteres - 4x 8 a 12
2. Supino reto com pegada supinada - 3x 8 a 12
3. Crucifixo reto com halteres - 3x 10 a 15
4. Pullover com halter no banco reto - 3x 10 a 15
5. Squeeze press com halteres - 3x 10 a 15
6. Triceps frances com halter - 3x 10 a 12
7. Triceps testa com halteres ou barra curta - 3x 10 a 12
```

### Treino B - Costas e Biceps

```text
1. Remada curvada com halteres - 4x 8 a 12
2. Remada unilateral apoiado no banco - 3x 10 a 12 cada lado
3. Remada aberta com halteres - 3x 10 a 12
4. Crucifixo inverso com halteres - 3x 12 a 15
5. Rosca direta com halteres ou barra curta - 4x 8 a 12
6. Rosca martelo com halteres - 3x 10 a 12
7. Rosca concentrada - 3x 10 a 12 cada braco
```

### Treino C - Pernas e Ombros

```text
1. Agachamento goblet com kettlebell ou halter - 4x 10 a 15
2. Afundo com halteres - 3x 10 cada perna
3. Stiff com halteres - 4x 10 a 12
4. Elevacao pelvica com halter - 3x 12 a 15
5. Panturrilha em pe com halteres - 4x 15 a 25
6. Desenvolvimento com halteres - 4x 8 a 12
7. Elevacao lateral com halteres - 3x 12 a 15
8. Encolhimento com halteres - 3x 12 a 15
```

## Paginas e Menus

Menu lateral atual:

```text
Dashboard
Missoes
Evolucao
Treinos
  - Cadastro
  - Realizados
Fichas
  - Cadastro
  - Listar
Tipos de Treino
  - Cadastro
  - Listar
Exercicios
Documentacao
  - Manual
  - Roadmap
  - Progressao
```

### Dashboard

Mostra:

- total de treinos;
- volume;
- PRs do mes;
- nivel e rank;
- calendario semanal clicavel;
- missao selecionada;
- player stats;
- grafico de volume;
- distribuicao muscular;
- feed de atividade;
- conquistas anuais da jornada Academy;
- heatmap.

Na parte da missao, os botoes `SEG`, `TER`, `QUA`, `QUI`, `SEX`, `SAB`, `DOM` sao clicaveis.

Comportamento:

- ao abrir, seleciona o dia atual;
- ao clicar em outro dia, mostra a missao daquele dia;
- dia atual continua marcado;
- dia selecionado fica destacado;
- dias passados mostram status, mas nao iniciam treino automaticamente;
- dias futuros mostram missao planejada;
- domingo mostra descanso;
- botao verde so inicia treino quando o dia selecionado e hoje e existe bloco pendente.

### Missoes

Mostra a campanha semanal completa e a campanha do dia.

Linguagem atual:

- cada dia ativo e uma campanha diaria;
- cada campanha diaria tem blocos;
- musculacao e o bloco de forca;
- boxe/kickboxing e o bloco de combate;
- domingo e recuperacao programada.
- um bloco pode ser substituido por outro treino do mesmo tipo quando necessario.

Depois da correcao, quando um bloco ja foi concluido:

- mostra botao `Ver`;
- mostra botao `Editar`;
- ambos carregam o treino real salvo, usando `GET /api/workouts/:id`.

Isso evita abrir uma ficha nova quando o usuario queria editar o registro existente.

### Evolucao

Mostra a evolucao de XP usando `Workout.xp` quando existe snapshot oficial.

Mostra:

- XP total;
- XP da semana;
- media por treino;
- melhor treino;
- quantidade de snapshots oficiais;
- conquistas anuais da jornada iniciada em 22/07/2026;
- tendencia de XP por data;
- divisao entre XP de execucao e XP de campanha;
- historico por exercicio;
- filtro de periodo para evolucao por exercicio;
- resumo do exercicio selecionado com maior carga, volume ou rounds;
- comparativo visual por exercicio;
- PRs automaticos por carga, repeticoes, volume, tempo ou golpes;
- log de PRs recentes;
- lista cronologica das execucoes do exercicio;
- log de treinos com XP total, execucao e campanha.

Quando algum treino ainda nao tem snapshot oficial, a tela usa fallback v2 em tempo real para aquele treino.

O historico por exercicio e calculado no frontend usando `state.allWorkouts`.
Ele agrupa exercicios pelo nome e considera apenas execucoes validas:

```text
Forca: series com carga e repeticoes.
Luta: rounds concluidos com tempo registrado.
```

PR automatico:

```text
A primeira execucao valida de um exercicio vira linha de base.
Depois disso, o app marca PR quando uma nova execucao supera a melhor marca anterior.
Forca: maior carga, maior numero de repeticoes e maior volume.
Luta: maior tempo concluido e maior quantidade de golpes.
```

Comparativo visual:

```text
Forca: carga, repeticoes e volume ao longo das execucoes.
Luta: tempo e golpes ao longo das execucoes.
O comparativo aparece quando existem pelo menos duas execucoes validas do exercicio selecionado.
```

Filtro de periodo da evolucao por exercicio:

```text
Tudo
Esta semana
Este mes
Ultimos 3 meses
Este ano
```

O filtro afeta resumo, comparativo, PRs recentes e historico do exercicio.

### Temporadas e Ciclos da Jornada Anual

A jornada anual ativa comeca em:

```text
2026-07-22
```

Ela foi organizada para aproximadamente um ano de treino:

```text
48 semanas planejadas
4 temporadas
12 semanas por temporada
3 ciclos por temporada
4 semanas por ciclo
```

Temporadas:

```text
T1 - Fundacao: consistencia > intensidade
T2 - Intensificacao: volume + tecnica
T3 - Especializacao: progresso especifico
T4 - Consolidacao: consistencia anual + revisao
```

O app calcula automaticamente:

- dia da jornada;
- semana da jornada anual;
- temporada atual;
- ciclo atual;
- semana dentro da temporada;
- semana dentro do ciclo;
- percentual do ano, da temporada e do ciclo.

Blocos visuais:

```text
Dashboard: JOURNEY DAY
Evolucao: SEASON_PROGRESS.sys
```

O Dashboard mostra o selo `Tn Cn` e a semana da temporada atual.
A Evolucao mostra cards de dia, temporada, ciclo e ano, alem de barras de progresso para jornada anual, temporada e ciclo.

### Conquistas Anuais

A primeira versao do motor anual de conquistas roda no frontend e considera somente treinos a partir de:

```text
2026-07-22
```

Bloco visual:

```text
Dashboard: ACHIEVEMENTS.sys
Evolucao: ACHIEVEMENTS.codex
```

Regra:

```text
Dashboard e Evolucao usam o mesmo motor anual de conquistas.
O Dashboard mostra um resumo.
A Evolucao mostra lista completa, filtros e categorias.
```

Bloco completo:

```text
ACHIEVEMENTS.codex
```

Primeira camada:

```text
16 conquistas iniciais
Categorias: Entrada, Consistencia, Performance, Modalidade, Campanha e Nivel
Filtros: categoria, desbloqueadas, bloqueadas e mais proximas
Resumo por categoria
Sem persistencia de unlockedAt ainda
```

Dados anteriores a 22/07/2026 permanecem no historico, mas nao contam para conquistas anuais.

### Treinos - Cadastro

Fluxo:

1. escolher data;
2. escolher ficha;
3. sistema carrega exercicios planejados;
4. opcionalmente adicionar exercicios extras do mesmo tipo da ficha;
5. marcar exercicios planejados como pulados quando nao forem feitos;
6. preencher carga e repeticoes por serie, ou rounds no caso de luta;
7. salvar.

### Modo de Carga dos Exercicios

Exercicios de forca agora carregam um modo de carga (`loadMode`) para deixar claro como preencher o peso.

Modos oficiais:

```text
dumbbell_each - halteres: registrar o peso de um halter
bar_total - barra: registrar barra + anilhas como peso total montado
machine_stack - maquina: registrar a carga exibida no equipamento
bodyweight - peso corporal: registrar 0 quando nao houver carga extra
non_weight - sem carga: usado por luta ou exercicios sem peso como metrica principal
```

Regra pratica:

- halteres: o campo mostra `kg cada`;
- barra: o campo mostra `kg total`;
- maquina: o campo mostra `kg maquina`;
- peso corporal: o campo mostra `kg extra`;
- luta/rounds: nao usa carga como metrica principal.

O app usa esse modo para:

- orientar o campo de carga no treino;
- salvar o contexto junto com o exercicio realizado;
- mostrar carga com contexto no detalhe do treino;
- melhorar leitura de PRs e evolucao por exercicio.

Configuracao manual:

```text
Editor de ficha: cada exercicio de forca possui um seletor de modo de carga.
Treino em andamento: cada exercicio de forca tambem permite alterar o modo apenas para aquela sessao.
```

Isso resolve exercicios hibridos, por exemplo:

```text
Rosca direta com halteres ou barra curta
```

Nesses casos, a ficha pode ter um padrao, mas o treino do dia pode registrar uma variacao sem alterar a ficha original.

Importante:

```text
O volume atual continua sendo calculado como carga informada x repeticoes.
O modo de carga melhora a interpretacao do registro, mas nao converte automaticamente halteres para carga total bilateral nesta etapa.
```

Exercicios pulados:

```text
Cada exercicio planejado da ficha possui a opcao "Nao vou fazer este exercicio hoje".
Quando marcada, a execucao daquele exercicio e desabilitada e o app permite registrar um motivo opcional.
O exercicio continua salvo no treino como parte da ficha original, mas aparece no detalhe como Pulado.
```

Regra:

```text
Exercicio pulado nao gera XP de execucao, nao conta como serie/round valido e impede o bonus de treino completo.
```

Regra de conclusao do bloco da campanha:

```text
O bloco conta como concluido quando pelo menos 60% dos exercicios planejados da ficha possuem execucao valida.
Se a execucao ficar abaixo disso, o treino ainda fica salvo no historico, mas a campanha tende a aparecer como parcial/pendente.
```

Qualidade de execucao da ficha:

```text
Completo - 100% dos exercicios planejados executados.
OK       - 60% ou mais dos exercicios planejados executados.
Parcial  - abaixo de 60% dos exercicios planejados executados.
So extra - treino sem exercicios planejados, apenas exercicios adicionados.
```

Exibicao:

```text
Detalhe do treino: mostra EXECUCAO_DA_FICHA com percentual.
Historico: cards e linhas mostram tag de qualidade e resumo 6/7, 86%, pulados e extras.
ACTIVITY_FEED.stream: mostra a qualidade no metadado do evento.
ACTIVITY_HEATMAP.sys: tooltip inclui a qualidade do bloco feito ou tentado.
```

Ao adicionar exercicio durante o treino, o catalogo respeita a modalidade da ficha:

```text
Treino de forca: mostra somente exercicios strength.
Treino de boxe: mostra somente exercicios boxing.
Treino de kickboxing: mostra somente exercicios kickboxing.
```

Isso permite adaptar o treino real sem misturar modalidades erradas.

No detalhe do treino salvo, os exercicios aparecem separados por origem:

```text
Planejado  - veio da ficha selecionada
Adicionado - foi acrescentado durante o treino
```

Treinos antigos sem `source` sao inferidos comparando o nome do exercicio com a ficha usada.

Quando a ficha corresponde a campanha do dia, o app classifica como bloco da campanha.

Quando a ficha nao corresponde, aparece como treino extra.

Regra de substituicao:

- se a campanha do dia tem um bloco pendente;
- e o usuario escolhe uma ficha do mesmo tipo do bloco;
- o treino pode substituir o bloco planejado.

Exemplo:

```text
Campanha de hoje previa treino C no bloco de forca.
Usuario faltou ontem, escolhe treino B hoje.
O historico salva treino B.
A campanha de hoje considera o bloco de forca concluido como C -> B.
```

Essa regra usa campos opcionais no `Workout`:

```text
missionDate
missionBlockType
missionOriginalWorkoutCode
missionOriginalWorkoutName
missionSubstitution
```

Assim o app nao finge que o treino B era C; ele registra B como treino real e marca que B substituiu C dentro da campanha.

Na tela de campanha do dia, blocos pendentes mostram:

- `Iniciar`: abre a ficha planejada;
- `Trocar`: abre o cadastro para escolher outro treino do mesmo tipo e substituir o bloco.

### Treinos - Realizados

Lista treinos pela data do treino.

Tem:

- filtros;
- alternancia lista/cards;
- resumo por cards;
- exportacao CSV;
- botoes Ver, Editar e Excluir.

Correcao importante ja feita:

Ao clicar em `Ver` ou `Editar`, o frontend busca o treino completo:

```text
GET /api/workouts/:id
```

Isso garante que cargas e repeticoes aparecam corretamente no formulario.

### Fichas - Cadastro

Permite montar ficha escolhendo exercicios do catalogo.

Filtros:

- categoria;
- subcategoria;
- busca.

Subcategoria e dependente da categoria selecionada.

### Fichas - Listar

Lista fichas cadastradas.

Permite:

- visualizar;
- editar;
- excluir logicamente.

### Tipos de Treino

Permite cadastrar e listar tipos como musculacao, boxe, kickboxing, cardio e mobilidade.

Isso foi criado para acrescentar modalidades sem quebrar o modelo antigo.

### Exercicios

Lista catalogo de exercicios.

Tem filtros por:

- modalidade;
- categoria;
- subcategoria;
- tipo de medicao;
- busca textual.

### Documentacao

A documentacao completa abre dentro do proprio sistema pela aba `Documentacao`.

Tambem existe uma entrada amigavel:

```text
GET /documentacao
```

Ela redireciona para:

```text
/?tab=documentation
```

A aba consome:

```text
GET /api/documentation
```

O indice da documentacao e gerado automaticamente no frontend a partir dos titulos `h2` e `h3`.

A central de documentacao agora separa:

```text
Manual - DOCUMENTACAO_APP.md
Roadmap - ROADMAP_ACADEMY.md
Progressao - ACADEMY_PROGRESS_SYSTEM.md
```

O menu lateral possui um grupo `Documentacao` com atalhos para `Manual`, `Roadmap` e `Progressao`.

## Imagens dos Exercicios

As imagens de exercicios foram tratadas assim:

- imagens locais geradas por IA para fichas A, B e C;
- algumas imagens podem vir do wger;
- ExerciseDB foi removido como fonte de instrucoes porque o conteudo vinha em ingles;
- o objetivo atual e usar imagem apenas como apoio visual, nao instrucoes em ingles.

Pastas:

```text
public/assets/exercises/ficha-a/
public/assets/exercises/ficha-b/
public/assets/exercises/ficha-c/
```

Scripts de vinculo:

```bash
npm run media:ficha-a:sync
npm run media:ficha-b:sync
npm run media:ficha-c:sync
```

Funcionalidades visuais:

- miniatura no cadastro/listagem;
- hover preview;
- clique/touch abre modal ampliado;
- `Esc` fecha modal.

## Heatmap

O heatmap chama:

```text
ACTIVITY_HEATMAP.sys
```

Configuracao atual:

```js
const heatmapStartDate = '2026-07-22';
const heatmapWeekCount = 16;
```

Estados:

```text
Futuro
Perdeu
Parcial
OK
Descanso
Extra
```

Regras:

- dias futuros aparecem no grid;
- tooltip de dia futuro mostra somente a data;
- dias passados mostram data, status, missao, feito e faltou;
- descanso planejado nao quebra sequencia;
- treino extra pode aparecer como informacao adicional.

## Gamificacao Atual

### Nivel e ranks

O planejamento anual detalhado esta em:

```text
ACADEMY_PROGRESS_SYSTEM.md
```

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

### XP atual no codigo

O calculo oficial do dashboard foi migrado para XP v2:

```text
XP total = XP de execucao + XP de campanha
```

A regra antiga ABC (`+75`, `+40 por A/B/C`, `+60`, `+150`) foi removida do calculo do dashboard.

A UI das campanhas usa XP por bloco:

```text
Musculacao: 120 XP
Luta: 80/90/100/110 XP
Bonus da campanha: 50 XP
```

## XP v2

Foi implementada a primeira versao do XP v2 para premiar execucao e campanha, nao peso bruto.

Arquivo principal:

```text
public/assets/xpCalculator.js
```

Formula atual do treino:

```text
XP do treino =
30 XP base
+10 XP por exercicio valido
+5 XP por serie valida
+8 XP por round valido
+1 XP a cada 5 repeticoes/golpes validos, limite de 10 XP por exercicio
+20 XP se todos os exercicios do treino tiverem execucao valida
```

Exercicios marcados como pulados:

```text
Nao recebem XP.
Nao contam como exercicio valido.
Nao contam como serie ou round valido.
Impedem o bonus de treino completo.
Continuam registrados no historico para mostrar o que foi planejado e nao executado.
```

Missao diaria:

```text
Musculacao concluida: +120 XP
Luta concluida: +80/+90/+100/+110 XP
Todos os blocos concluidos: +50 XP
```

Nao dar XP diretamente por quilo levantado.

O detalhe do treino mostra `XP_V2.breakdown` com:

- XP de execucao;
- XP de campanha;
- base;
- exercicios validos;
- series/rounds;
- reps/golpes;
- bonus de treino completo;
- bloco da campanha e bonus da campanha, quando aplicavel.

Snapshot oficial:

- ao criar, editar ou excluir um treino, o backend recalcula o XP dos treinos da mesma data;
- o snapshot fica salvo em `Workout.xp`;
- o frontend usa o snapshot quando todos os treinos concluidos ja possuem XP salvo;
- enquanto houver treino antigo sem snapshot, o dashboard usa fallback em tempo real para nao perder historico.

Para migrar treinos antigos:

```bash
npm run xp:recalculate:preview
npm run xp:recalculate
```

Usar carga apenas para progressao:

```text
+10 XP ao superar carga anterior
+15 XP ao bater PR
+10 XP ao superar volume anterior
+15 XP se aumento de volume passar de 10%
```

Implementacao restante recomendada:

1. implementar progressao/PR comparando historico;
2. criar endpoint de recalculo de XP, caso seja util fazer a migracao pela UI;
3. criar filtros/analytics de XP por semana e por campanha.

## Bugs Corrigidos Recentemente

### Editar/Ver nao carregava cargas e repeticoes

Problema:

- botoes de `Ver` e `Editar` usavam objeto da listagem em memoria;
- em alguns casos o treino nao vinha completo ou estava desatualizado.

Solucao:

- criada rotina `loadWorkoutDetails(workoutId)`;
- `Ver` e `Editar` agora buscam:

```text
GET /api/workouts/:id
```

### Pagina Missoes abria ficha nova em vez de treino salvo

Problema:

- bloco concluido mostrava `Ver/Editar`, mas usava `data-start-template`;
- isso criava fluxo de novo treino.

Solucao:

- blocos concluidos agora mostram botoes `Ver` e `Editar`;
- ambos usam o treino salvo pelo ID.

### MongoDB Atlas falhava mesmo com app aberto

Problema:

- app carregava HTML, mas API dava `500`;
- MongoDB recusava conexao.

Solucao:

- `family: 4` em `mongoose.connect`;
- DNS fixo `1.1.1.1` e `8.8.8.8`.

### Dashboard semanal nao era clicavel

Problema:

- blocos `SEG`, `TER`, `QUA` etc eram apenas visuais.

Solucao:

- `weeklyMap` virou conjunto de botoes;
- estado `selectedMissionDayIndex`;
- clique muda a missao exibida;
- botao principal so inicia treino quando o dia selecionado e hoje.

## Dados de Teste

Foram criados dados ficticios anteriormente, mas depois foram limpos.

Scripts:

```bash
npm run demo:clear:preview
npm run demo:clear
```

Atualmente, nao considerar que existem dados fake ativos.

## Validacoes Uteis

Checar sintaxe do frontend:

```bash
node --check public/assets/app.js
```

Checar servidor:

```bash
curl http://localhost:3000/health
```

Checar treinos:

```bash
curl http://localhost:3000/api/workouts
```

Checar missoes:

```bash
curl http://localhost:3000/api/daily-missions
```

## Estado Atual dos Dados Reais

Em 2026-07-15 foi validado que existia pelo menos um treino real salvo:

```text
Treino B - Costas e biceps
7 exercicios
series com 3 kg x 15 reps
volume total: 1035 kg
```

Nao assumir que esse e o estado permanente do banco; consultar `/api/workouts` para confirmar.

## Design e UI

Tema:

```text
Gym OS / terminal / cyber fitness
```

Principais arquivos:

```text
public/index.html
public/assets/app.js
public/assets/gym-os.css
```

Preferencias de UI ja estabelecidas:

- menu lateral;
- cards de resumo nas paginas de listagem;
- filtros alinhados;
- listagens legiveis;
- evitar pagina unica gigante sem separacao;
- manter visual estilo terminal/gamer;
- imagens pequenas com zoom por hover/click.

## Decisoes Importantes

1. Banco oficial: MongoDB Atlas.
2. Nao usar localStorage para dados principais.
3. XAMPP pode hospedar a pasta/projeto, mas o backend real e Node.
4. Fichas sao selecionadas a partir de exercicios cadastrados.
5. Treino realizado e separado de ficha.
6. Missao diaria e composta por blocos.
7. Musculacao e luta podem existir no mesmo dia.
8. Treino extra deve ser permitido; treino do mesmo tipo pode substituir bloco pendente da campanha.
9. Heatmap deve considerar a jornada anual desde 22/07/2026.
10. XP deve evoluir para modelo v2 por execucao + missao + progresso.
11. Treinos anteriores a 22/07/2026 foram removidos do banco para a jornada anual comecar limpa.

## Limpeza Da Pre-Jornada

Em 22/07/2026 foram removidos os treinos anteriores ao inicio oficial da jornada anual.

Preview executado:

```bash
npm run journey:clear:preview
```

Treinos removidos:

```text
2026-07-14 - B - Costas e biceps
2026-07-16 - A - Peito e triceps
2026-07-18 - B - Costas e biceps
```

Execucao:

```bash
npm run journey:clear:prestart
```

Confirmacao posterior:

```text
Treinos pre-jornada encontrados: 0
```

## Pendencias e Proximas Fases

### Alta prioridade

1. Persistir conquistas desbloqueadas no MongoDB.
2. Criar campanhas mensais ou ciclos de 8 semanas.
3. Permitir configurar metas por exercicio.

### Media prioridade

1. Melhorar tela de detalhes dos treinos realizados.
2. Permitir exportar comparativo de evolucao por exercicio.
3. Criar ranking por modalidade.
4. Melhorar analytics com dados reais.

### Baixa prioridade

1. Migrar CSS para Tailwind, se ainda fizer sentido.
2. Melhorar imagens de boxe/kickboxing.
3. Criar mais templates de treino.
4. Melhorar exportacao CSV.

## Prompt Para Continuar Em Outro Chat

Use este texto em um novo chat:

```text
Estou trabalhando no projeto local:
C:\xampp\htdocs\GYM-OS

Leia primeiro o arquivo DOCUMENTACAO_APP.md.

O app e Node + Express + Mongoose + MongoDB Atlas, frontend HTML/CSS/JS puro.
O objetivo e continuar o app GYM-OS, que registra treinos, fichas,
missoes diarias, XP, heatmap e imagens de exercicios.

Nao saia implementando sem planejar quando eu pedir planejamento.
Quando eu disser "pode fazer", implemente.

Proxima fase provavel: XP v2 com breakdown por treino e missao.
```
