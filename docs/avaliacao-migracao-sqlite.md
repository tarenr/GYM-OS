# Avaliação: migração de MongoDB Atlas para SQLite (node:sqlite)

Referente à tarefa #165 do The Forge. **Este documento não decide se a
migração vai acontecer** — só levanta models, consultas e esforço para
embasar essa decisão depois.

Motivo que originou a avaliação: limites do plano gratuito do MongoDB Atlas.

## 1. Inventário dos models

O projeto usa Mongoose com 6 coleções, nenhuma delas usa `aggregate()`,
`$lookup`, `$group`, `$match` ou `.populate()` — todo relacionamento entre
coleções é resolvido manualmente em JS pelos controllers.

| Model | Complexidade | Características |
|---|---|---|
| `WorkoutType` | Baixa | Schema achatado, 1 array de string (`fields`), 1 índice único (`code`). |
| `Exercise` | Baixa–média | Schema achatado, 3 arrays de string (`equipment`, `instructions`, `tips`), 3 índices compostos (2 não-únicos + 1 único). |
| `BodyMeasurement` | Baixa | 1 sub-objeto simples e plano (`measurementsCm`, 14 campos numéricos, sem array), 1 índice. |
| `WorkoutTemplate` | Alta | Array de subdocumentos `templateExerciseSchema` (17 campos cada, incluindo `equipment[]`, `instructions[]`, `tips[]`); refs para `Exercise` e `WorkoutType`; 1 índice único. |
| `DailyMission` | Média | Array de subdocumentos `missionBlockSchema` (ref para `WorkoutTemplate`); 1 índice único (`dayIndex`). |
| `Workout` | Muito alta | 4 níveis de aninhamento: `Workout` → `exercises[]` (23 campos) → `sets[]`/`rounds[]`; mais `xp` (`xpSnapshotSchema` → `breakdown[]`). Ref para `WorkoutTemplate`. 1 virtual (`totalVolume`, calculado em JS, não persistido). 4 índices compostos. |

Nenhum model usa hooks (`pre`/`post`), métodos customizados (`.methods`)
ou estáticos (`.statics`) — só o virtual `totalVolume` do `Workout`, que é
puro JS sobre os dados já carregados e não depende do Mongoose.

## 2. Padrões de consulta atuais

Levantado em `src/controllers/*.js` (24 ocorrências no total):

- `find`, `findOne`, `findById`, `findOneAndUpdate`, `findByIdAndUpdate`,
  `findByIdAndDelete`, `deleteMany`, `sort`, `limit`, `countDocuments`.
- Nenhum `aggregate`, `$lookup`, `distinct` ou pipeline complexo.
- `workoutController.js` é o mais ativo (7 ocorrências), seguido de
  `templateController.js` e `bodyMeasurementController.js` (4 cada).

Isso é favorável para uma migração: os equivalentes em SQL puro (`SELECT`,
`INSERT`, `UPDATE`, `DELETE`, `ORDER BY`, `LIMIT`, `COUNT`) cobrem tudo sem
precisar reconstruir uma camada de agregação.

## 3. Estratégia de esquema equivalente em SQLite

Abordagem sugerida (não implementada): tabelas normalizadas para as
entidades principais e colunas `TEXT` com JSON serializado só para os
subdocumentos muito aninhados que são sempre lidos/gravados como bloco
inteiro (nunca filtrados ou ordenados individualmente):

- `workout_types`, `exercises`, `body_measurements`: tabelas normais,
  1 para 1 com os models — baixa complexidade.
- `workout_templates`: tabela própria + coluna JSON para
  `templateExerciseSchema[]` (array de exercícios do template).
- `daily_missions`: tabela própria + coluna JSON para `blocks[]`.
- `workouts`: tabela própria + coluna JSON para `exercises[]` (que já
  carrega `sets[]`/`rounds[]` aninhados) + coluna JSON para `xp`
  (snapshot + breakdown).

Critério para decidir tabela filha vs. coluna JSON: campos usados em
filtro, ordenação ou junção pedem coluna própria; o resto pode ficar como
JSON. Nenhuma consulta atual filtra dentro de `sets`/`rounds`/`blocks`, o
que sustenta a escolha por JSON nesses casos — mas isso deve ser
reconfirmado se o app crescer nessa direção.

SQLite tem suporte nativo a consulta e validação de JSON
(`json_extract`, `json_valid`, etc.), então isso não fica sem tooling.

## 4. Riscos e pontos de atenção

- **`node:sqlite` ainda é experimental.** Confirmado nesta máquina
  (Node v24.14.1): o módulo emite
  `ExperimentalWarning: SQLite is an experimental feature and might change
  at any time` ao ser importado. Não é um driver estável no sentido de
  API congelada — pode mudar em versões futuras do Node.
- **`DatabaseSync` é síncrono.** Toda leitura/escrita bloqueia o event
  loop do Node enquanto executa. Para o volume atual do GYM-OS
  provavelmente é irrelevante, mas precisa ser medido (latência sob
  carga), não assumido.
- **Concorrência**: SQLite permite 1 escritor por vez (mesmo em modo
  WAL, que melhora a concorrência entre leitura e escrita, mas não entre
  escritas simultâneas). MongoDB Atlas não tem essa limitação. Relevante
  se o app rodar com múltiplos processos/instâncias.
- **Hospedagem/operação**: SQLite exige disco persistente local (não é
  um serviço gerenciado como o Atlas) — precisa confirmar onde o arquivo
  `.sqlite` vai morar, estratégia de backup e restauração, e se o
  ambiente atual do GYM-OS já tem isso resolvido (o projeto já roda como
  serviço Windows via Servy).
- **Formato de `_id`**: ObjectId do Mongo precisa virar `TEXT` (mantendo
  o valor original) ou `INTEGER AUTOINCREMENT` (gerando IDs novos — quebra
  qualquer referência externa ou histórico que dependa do ObjectId
  atual). Isso vale também para os `_id` de subdocumentos que a aplicação
  eventualmente use.
- **Datas**: `Date` do Mongoose precisa de convenção explícita em SQLite
  (`TEXT` ISO-8601 ou `INTEGER` epoch) — decisão que afeta todas as
  comparações e ordenações por data (`sort({date: -1})` é usado em
  `Workout`).
- **Integridade referencial dentro de JSON**: refs como
  `templateExerciseSchema.exerciseId → Exercise` e
  `Workout.templateId → WorkoutTemplate` não ganham uma foreign key de
  verdade se ficarem dentro de uma coluna JSON. Precisa decidir onde
  essa validação de vínculo passa a acontecer (aplicação vs. banco).
- **Migração dos dados existentes**: precisa de um script de dump do
  Atlas + conversão para o novo esquema, e uma etapa de validação
  posterior (comparar contagem de documentos por coleção, vínculos entre
  `templateId`/`exerciseId` e uma amostra de resultados de consulta antes
  e depois).
- **Rollback**: como o MongoDB Atlas continua existindo durante a
  transição, o plano de rollback natural é manter o Atlas como fonte
  até a validação passar, e só então decidir o corte definitivo — não
  incluído aqui em detalhe por ser parte do plano de execução, não da
  avaliação.

## 5. Estimativa de esforço por model

| Model | Esforço estimado | Motivo |
|---|---|---|
| `WorkoutType` | Baixo | Schema achatado, 4 query sites. |
| `Exercise` | Baixo | Schema achatado, 3 índices simples de replicar, 1 query site. |
| `BodyMeasurement` | Baixo | Sub-objeto plano, sem array, 4 query sites. |
| `DailyMission` | Médio | 1 array de subdocumentos com ref, 2 query sites. |
| `WorkoutTemplate` | Médio–alto | Array de subdocumentos maior (17 campos) + 2 refs, 4 query sites. |
| `Workout` | Alto | 4 níveis de aninhamento, 1 virtual, 4 índices compostos, 7 query sites (o controller mais ativo do projeto). |

**Esforço total aproximado**: médio-alto para o projeto como um todo — a
maior parte da complexidade está concentrada no model `Workout` (o
coração do domínio) e em decisões de infraestrutura (concorrência,
hospedagem, backup) mais do que na tradução de queries em si, que são
simples em todos os models.

## 6. O que este documento não cobre (fica para depois, se a migração for decidida)

- Script de migração/dump de dados real.
- Medição de performance sob carga real do `DatabaseSync` síncrono.
- Plano de corte (cutover) e rollback detalhado.
- Escolha final entre `node:sqlite` nativo vs. `better-sqlite3` (driver
  externo, API estável, mas dependência nativa adicional) — mencionada
  aqui só como alternativa a considerar caso a instabilidade do
  `node:sqlite` pese contra.

---

*Levantamento feito por leitura de `src/models/*.js`, `src/controllers/*.js`,
`src/config/database.js` e `package.json`, com segunda opinião do Codex CLI
(revisão somente-leitura) sobre riscos de migração Mongoose → SQLite.*
