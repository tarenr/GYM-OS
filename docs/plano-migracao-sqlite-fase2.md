# Migração MongoDB Atlas → SQLite — Fase 2, Aprovação 1 (preparar e testar isolado)

Continuação de `docs/plano-migracao-sqlite-fase1.md`. Esta etapa estende o
adaptador SQLite e reescreve os imports do caminho ativo do app (7
controllers + services) para usar a camada SQLite em vez do Mongoose —
**mas o app em produção continua rodando no Mongoose/Atlas o tempo todo**,
já que nada disso foi ligado no serviço real ainda (`npm run dev`/o
serviço Servy). O corte de verdade é a Aprovação 2 (Etapa C/D), ainda não
feita.

Revisado com o Codex CLI antes de começar (leitura, `--sandbox
read-only`), que encontrou 3 bloqueios reais antes da implementação:
o script de migração dependia de `connectDatabase()` (que esta etapa
substitui), `--force` não removia registro apagado no Atlas, e
`syncTemplateExerciseSubcategories.js` chamava `.toObject()` num objeto
que deixaria de ser um subdocumento Mongoose.

## 1. Etapa A — adaptador estendido

- `bulkWrite([{updateOne:{filter, update:{$set,$setOnInsert}, upsert}}])`
  implementado em `queryEngine.js` — atualiza no máximo 1 documento por
  operação; no upsert, semeia o novo documento com as igualdades do
  filtro + `$set` + `$setOnInsert` + defaults. `$setOnInsert` só é
  aplicado na criação, nunca sobrescreve um valor já existente num update
  posterior (testado explicitamente).
- `upsert: true` suportado em `findOneAndUpdate`/`findByIdAndUpdate`
  (mesma lógica interna do `bulkWrite`).
- `isValidId(value)` (`src/db/sqlite/isValidId.js`) substitui
  `mongoose.isValidObjectId` nos 6 controllers que validavam o `:id` da
  rota (14 pontos de uso).
- Conexão com o Atlas isolada em `src/config/atlas.js`
  (`connectAtlas()`) — corrige o bug que o Codex encontrou: os scripts
  `migrate-atlas-to-sqlite.js` e `validate-sqlite-migration.js` agora
  importam `connectAtlas` de lá, independente do que `database.js` virou.
- Trava preparada (**ainda inativa**): `connectAtlas()` já verifica a
  existência de um arquivo marcador `src/config/.atlas-frozen` — se
  existir, exige `ALLOW_FROZEN_ATLAS=1` pra conectar. Como esse arquivo
  ainda não existe, o comportamento hoje é idêntico ao de antes (os
  scripts de migração continuaram rodando normalmente, confirmado
  reexecutando `migrate-atlas-to-sqlite.js` depois da mudança).
- 7 novos testes de contrato cobrindo `bulkWrite`/`upsert`/`$setOnInsert`/`arrayFilters` e `applyExerciseMedia`
  — **28/28 testes passaram** no total (21 da Fase 1 + 7 da Fase 2).

## 2. Etapa B — caminho ativo reescrito

13 arquivos trocaram o import de `../models/*.js` (Mongoose) para
`../db/sqlite/adapters/index.js`:

- `src/config/database.js` — reescrito: `connectDatabase()` agora abre o
  SQLite (`openDatabase()`), mesma assinatura de antes.
- `src/server.js` — log agora diz "Dados no SQLite" (era "Dados no
  MongoDB Atlas") e imprime a versão do Node no boot (`process.version`)
  — vai ajudar a confirmar, no próximo restart real do serviço Servy,
  qual versão de Node ele usa de fato (eu não consegui ler o config do
  Servy diretamente — `ProgramData\Servy` é ilegível pra mim).
- 7 controllers: `bodyMeasurementController.js`, `dailyMissionController.js`,
  `exerciseController.js`, `exerciseMediaController.js`,
  `templateController.js`, `workoutController.js`,
  `workoutTypeController.js`.
- `xpCalculator.js`, `seedWorkoutTypes.js`, `seedExerciseCatalog.js`,
  `seedCombatWorkoutTemplates.js`, `seedDailyMissions.js`,
  `syncTemplateExerciseSubcategories.js` (+ correção do `.toObject()`),
  `exerciseMediaSyncService.js`.

Confirmado por `grep`: **zero arquivos em `src/` ainda importam os
models Mongoose** — só os ~22 scripts de manutenção/seed manual em
`scripts/`/`scripts/maintenance/` continuam (fora de escopo desta fase,
de propósito).

### Teste de boot completo (não só unitário)

`scripts/test-boot-sequence.js` simula a sequência real de `server.js`
(os 5 seeds, na mesma ordem) contra uma cópia SQLite descartável,
**rodada 2 vezes seguidas**:

```
workout_types: 5, exercises: 69, workout_templates: 6, daily_missions: 7
```

Contagens idênticas nas duas rodadas — confirma que o boot funciona e que
rodar os seeds de novo (o que acontece a cada restart do serviço) é
idempotente, não duplica nada.

## 3. Suporte a arrayFilters em updateMany (implementado e validado)

Ao estender o suporte do adaptador para `exerciseMediaSyncService.js`,
implementamos em `src/db/sqlite/queryEngine.js` o suporte a `updateMany` com
`options.arrayFilters` e sintaxe posicional filtrada
(`'exercises.$[item].campo'`):

- Reconhece chaves no formato `'<campo>.$[<identificador>].<subcampo>'` no
  `$set` e valida que há exatamente 1 filtro em `options.arrayFilters`
  referenciando o mesmo identificador (`item.<subcampo>`).
- Executa a atualização linha a linha dentro de uma transação (`withTransaction`):
  faz `JSON.parse` do array correspondente, aplica os subcampos apenas no(s)
  elemento(s) que batem no predicado do `arrayFilter`, preserva todos os outros
  elementos do array intactos e re-serializa.
- Mantém o `$set` tradicional simples (coluna inteira) perfeitamente funcional.
- Qualquer sintaxe fora desse escopo (múltiplos identificadores, campo não JSON)
  continua lançando `UnsupportedQueryError` de forma explícita.
- Validado por novos testes de contrato unitários e por um teste de ponta a
  ponta chamando `applyExerciseMedia()` contra cópias descartáveis de
  `Exercise`, `WorkoutTemplate` e `Workout`, confirmando a propagação correta e
  consistente de mídia entre as coleções (28/28 testes passando).

## 4. O que ainda falta (Aprovação 2 — corte real, plano separado)

- Etapa C: backup real do `data/gym-os.sqlite`, migração final pra
  arquivo novo (corrigindo o `--force` pra remover registro apagado no
  Atlas, como o Codex apontou), você parando/reiniciando o serviço
  Servy, smoke test via curl.
- Etapa D: atualizar `DOCUMENTACAO_APP.md` e o cadastro do projeto no
  Forge (`db_engine`).
