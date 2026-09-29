# Migração MongoDB Atlas → SQLite — Fase 1 (construir e validar em paralelo)

Continuação de `docs/avaliacao-migracao-sqlite.md` (tarefa #165 do Forge, já
concluída). Esta fase constrói e valida uma camada de acesso a dados em
SQLite (`node:sqlite`) equivalente aos 6 models Mongoose, populada com uma
cópia real dos dados do Atlas — **sem alterar nenhum código ativo**. Ao final
desta fase, o Atlas continua sendo a única fonte usada pelo app em produção.

Revisado com o Codex CLI (leitura, `--sandbox read-only`) em duas rodadas:
arquitetura (adaptador limitado ao uso real vs. shim genérico; `json_each`/
`json_extract` do SQLite) e depois o próprio plano de execução (inventário
como etapa explícita, validação além de contagem, riscos de concorrência
Atlas/SQLite, blindagem dos scripts).

## 1. Inventário do contrato Mongoose

Levantado lendo `src/models/*.js`, `src/controllers/*.js`,
`src/services/*.js` e os ~20 scripts em `scripts/`/`scripts/maintenance/`.
37 arquivos importam os 6 models diretamente.

### 1.1 Modelos e schemas

| Model | Campos obrigatórios | Enums | Índices | Timestamps |
|---|---|---|---|---|
| `WorkoutType` | `code`, `name`, `measurementType` | `measurementType` (7 valores) | único (`code`) | sim |
| `Exercise` | `name`, `category` | `loadMode` (6 valores) | único (`category`+`name`); 2 compostos não-únicos | sim |
| `BodyMeasurement` | `measuredAt` (default `Date.now`) | — | (`measuredAt` desc) | sim |
| `WorkoutTemplate` | `code`, `name`, `exercises` (≥1, validator custom) | `loadMode` no subdocumento | único (`code`) | sim |
| `DailyMission` | `dayIndex`, `dayOfWeek`, `missionName` | `blocks[].type` (3 valores) | único (`dayIndex`) | sim |
| `Workout` | `date`, `workoutCode`, `workoutName`, `exercises` (≥1, validator custom) | `exercises[].loadMode`, `exercises[].source` | 4 compostos | sim |

### 1.2 Comportamentos do Mongoose além das queries

- **`.save()`**: usado em `xpCalculator.js` e em 3 scripts de manutenção
  (`add-core-template-exercises.js`, `translate-db-to-english.js`,
  `maintenance/add-front-raise-to-template-c.js`,
  `maintenance/reclassify-workout-exercise-source.js`).
- **Virtual**: só 1 em todo o projeto — `Workout.totalVolume` (puro JS sobre
  `exercises[].sets[]`, não persistido).
- **Hooks/métodos customizados**: nenhum (`0` ocorrências de `.pre(`, `.post(`,
  `.methods.`, `.statics.`).
- **`.lean()`**: usado nos scripts de manutenção (leitura rápida, sem os
  métodos de instância) — nunca no caminho da API (controllers).
- **Defaults/validações**: a maioria dos campos tem `default` e `trim`;
  poucos têm `required`/`enum`/`min`/`max`. `trim`/`uppercase`/`lowercase`
  do Mongoose (transformação automática de string) **não é replicada** no
  adaptador desta fase — ver limitações (seção 3).

### 1.3 Operadores de consulta realmente usados

Levantado em todo `src/` e `scripts/`: `$gte`, `$lt`, `$gt`, `$lte` (range de
data), `$in` (com valores simples e com `RegExp` para match exato
case-insensitive, sempre no formato `new RegExp('^literal$', 'i')`), `$or`,
`$exists`, `$set` (em `updateMany`), `.sort()`, `.limit()`, `.lean()`,
`.select()` (string tipo `'campo1 campo2'`), `.distinct()`, projeção com
dot-path e operador posicional (`'exercises.name'` no filtro +
`'exercises.$': 1` na projeção — usado em `remove-exercise-everywhere.js` e
`fix-single-dumbbell-load-modes.js` pra consultar/isolar 1 subdocumento
dentro do array `exercises[]`).

**Nenhum uso de** `aggregate()`, `populate()`, `$lookup`, `$group`,
`$match`, `$ne`, `$and`, transações multi-documento.

## 2. Arquitetura construída

```
src/db/sqlite/
  schema.sql          DDL — tabelas normalizadas + colunas JSON pros arrays aninhados
  client.js           wrapper sobre node:sqlite DatabaseSync (abre, aplica schema, transação curta)
  queryEngine.js       núcleo compartilhado: tradução de filtro Mongo-like -> SQL,
                       cursor (find/sort/limit/lean/select), create/update/delete,
                       json_each/json_extract pra dot-path dentro de arrays
  adapters/
    WorkoutType.js, Exercise.js, BodyMeasurement.js,
    WorkoutTemplate.js, DailyMission.js, Workout.js
    index.js           barrel export

scripts/
  migrate-atlas-to-sqlite.js     dump Atlas -> SQLite (preview por padrão, --write pra gravar)
  validate-sqlite-migration.js  compara Atlas vs. SQLite (contagem + conteúdo por id + vínculos)
  test-sqlite-adapters.js       21 testes de contrato contra um banco descartável (tmpdir)

data/
  gym-os.sqlite        cópia real gerada pela migração (fora do git — dados pessoais)
```

Nenhum arquivo existente (`server.js`, `database.js`, `models/*.js`,
`controllers/*.js`, os 20 scripts atuais) foi alterado — a camada nova é
100% aditiva e desconectada do caminho ativo do app.

### 2.1 Decisões de esquema

- IDs preservados como `TEXT` (o mesmo ObjectId do Mongo, como string).
- Datas como `TEXT` ISO-8601 UTC — comparação lexicográfica bate com ordem
  cronológica, o que cobre os `$gte`/`$lt` usados em `xpCalculator.js` e nos
  scripts de recálculo de XP.
- Booleanos como `INTEGER` (0/1).
- Tabelas normalizadas para `WorkoutType`, `Exercise`, `BodyMeasurement`
  (schemas achatados). Colunas JSON (`TEXT`) para os arrays profundamente
  aninhados: `WorkoutTemplate.exercises`, `DailyMission.blocks`,
  `Workout.exercises` (com `sets`/`rounds` dentro) e `Workout.xp`
  (com `breakdown` dentro).
- Consulta **dentro** dos arrays JSON usa `json_each`/`json_extract` do
  próprio SQLite (não carrega a linha inteira pra filtrar em JS) — cobre o
  caso real `'exercises.name': filtro` das duas rotinas de manutenção
  citadas acima, incluindo a projeção posicional (`'exercises.$': 1`).

### 2.2 Adaptador — limitado ao uso real, não um shim genérico

Cada adaptador expõe só as operações efetivamente encontradas no código:
`find`/`findOne`/`findById`/`findOneAndUpdate`/`findByIdAndUpdate`/
`findByIdAndDelete`/`deleteMany`/`updateMany` (só com `$set`)/`create`/
`distinct`, encadeáveis com `.sort()`/`.limit()`/`.lean()`/`.select()`.
Operadores suportados: `$gte`/`$gt`/`$lte`/`$lt`/`$in`/`$or`/`$exists`.
**Qualquer operação fora desse conjunto lança `UnsupportedQueryError`** —
nunca falha silenciosamente nem devolve resultado incorreto.

## 3. Limitações conhecidas (documentadas, não escondidas)

- **`trim`/`uppercase`/`lowercase` do Mongoose** (transformação automática
  de string ao salvar) não são replicados — se o Fase 2 depender disso,
  precisa ser adicionado ao `queryEngine.js` ou tratado explicitamente nos
  call sites.
- **Validators customizados** (ex.: "precisa ter pelo menos 1 exercício" em
  `WorkoutTemplate`/`Workout`) não são reimplementados genericamente — só
  `required`/`enum` são suportados pelo config do adaptador.
- **`updateMany` só suporta `$set` em colunas normalizadas** — um `$set`
  que tentasse alterar conteúdo *dentro* de uma coluna JSON (ex.: um campo
  aninhado de `exercises[]`) lança `UnsupportedQueryError`. Isso existe em
  potência (não confirmado no código atual) e precisa ser resolvido caso a
  caso na Fase 2, com leitura-modificação-gravação explícita.
- **`.equals()`, `.id` (getter) e hooks/estáticos do Mongoose**: não
  usados no código atual, então não implementados — se aparecerem na Fase
  2, precisam de suporte novo.
- **`node:sqlite` ainda é experimental** nesta versão do Node (emite
  `ExperimentalWarning` ao ser importado) — confirmado nesta máquina
  (Node v24.14.1). `DatabaseSync` é síncrono e bloqueia o event loop; não
  medido sob carga real nesta fase.
- **Concorrência**: o adaptador usa transação curta (`BEGIN
  IMMEDIATE`/`COMMIT`) só na importação em massa; leitura-modificação-
  gravação de uma coluna JSON individual (ex.: `.save()` numa instância)
  não está protegida contra corrida entre requisições simultâneas — a
  aplicar na Fase 2 se o padrão de uso justificar.

## 4. Resultado da migração e validação real (2026-09-28)

`node scripts/migrate-atlas-to-sqlite.js --write` seguido de
`node scripts/validate-sqlite-migration.js`, contra o Atlas real:

| Coleção | Atlas | SQLite | Conteúdo comparado por id |
|---|---|---|---|
| WorkoutType | 5 | 5 | 5/5 sem divergência |
| Exercise | 70 | 70 | 70/70 sem divergência |
| BodyMeasurement | 3 | 3 | 3/3 sem divergência |
| WorkoutTemplate | 10 | 10 | 10/10 sem divergência |
| DailyMission | 7 | 7 | 7/7 sem divergência |
| Workout | 8 | 8 | 8/8 sem divergência |

Vínculos verificados: 6 `WorkoutTemplate.workoutTypeId` → `WorkoutType`, 8
`Workout.templateId` → `WorkoutTemplate`, e todos os `exerciseId` dentro de
`WorkoutTemplate.exercises[]` → `Exercise` — **nenhuma referência quebrada**.

`node scripts/test-sqlite-adapters.js`: **21/21 testes de contrato
passaram** contra um banco descartável (criado em `tmpdir()` e apagado ao
final), cobrindo defaults, validação obrigatória, enum, índice único,
`$gte`/`$lt`, `$in` com `RegExp` exata, `$or`, `$exists`, dot-path +
projeção posicional, `findByIdAndUpdate` com `new:true`/`false`,
`findByIdAndDelete`, `deleteMany`, `updateMany` com `$set`, `distinct`, e
uma regressão de segurança específica (um documento lido com projeção
posicional truncada não tem `.save()` — não há como persistir de volta um
array parcialmente projetado por engano).

Como o Atlas continua recebendo escritas normais do app entre o dump e a
validação, uma pequena divergência seria esperada e aceitável nesta fase
(a cópia ainda não é autoritativa) — neste snapshot específico não houve
nenhuma.

## 5. Roteiro das próximas fases (cada uma com aprovação própria)

### Fase 2 — corte real (planejar depois, não aprovado ainda)

- Trocar `src/config/database.js`/`src/server.js` para inicializar a
  camada SQLite em vez do Mongoose/Atlas.
- Reescrever os 7 controllers e os services (`xpCalculator.js`, seeds) para
  importar de `src/db/sqlite/adapters/` em vez de `src/models/`.
- Resolver caso a caso os ~20 scripts de manutenção — os que só usam o
  conjunto já suportado (find/sort/limit/lean/select, os operadores
  listados) trocam de import direto; os poucos com `updateMany` dentro de
  JSON ou padrões ainda não cobertos precisam de ajuste específico.
- Definir janela de corte: pausar escritas (ex.: parar o serviço Servy
  brevemente), rodar a migração uma última vez de forma consistente, então
  trocar. **Importante (risco já levantado pelo Codex)**: depois da
  primeira escrita no SQLite pós-corte, o Atlas vira uma foto congelada —
  não um rollback vivo. Reverter exige reconciliar manualmente qualquer
  dado gravado nesse meio-tempo, ou aceitar perdê-lo.
- Atualizar `DOCUMENTACAO_APP.md` e o cadastro do projeto no Forge
  (`db_engine`: de "MongoDB Atlas" para "SQLite").

### Fase 3 — limpeza

- Remover a dependência `mongoose` do `package.json` e o código morto do
  Atlas.
- Consolidar backup/restauração do arquivo `data/gym-os.sqlite` (a rotina
  de backup restic+rclone já cobre a pasta de projetos — confirmar que o
  novo arquivo está incluído).
- Revisar se `node:sqlite` saiu do estágio experimental nas versões mais
  recentes do Node antes de considerar a migração definitivamente estável.
