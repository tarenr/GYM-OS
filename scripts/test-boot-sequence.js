// Fase 2 (Etapa B) — simula a sequencia real de boot do server.js
// (connectDatabase + os 5 seeds, na mesma ordem) contra uma copia SQLite
// descartavel, RODADA DUAS VEZES seguidas: confirma que o servidor
// conseguiria subir sem erro e que rodar os seeds de novo (como acontece
// a cada restart do servico) e idempotente — nao duplica nem falha.
//
// Uso: node scripts/test-boot-sequence.js

import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openDatabase, getDatabase, closeDatabase } from '../src/db/sqlite/client.js';
import { seedWorkoutTypes } from '../src/services/seedWorkoutTypes.js';
import { seedExerciseCatalog } from '../src/services/seedExerciseCatalog.js';
import { seedCombatWorkoutTemplates } from '../src/services/seedCombatWorkoutTemplates.js';
import { syncTemplateExerciseSubcategories } from '../src/services/syncTemplateExerciseSubcategories.js';
import { seedDailyMissions } from '../src/services/seedDailyMissions.js';

async function runBootSequence() {
  await seedWorkoutTypes();
  await seedExerciseCatalog();
  await seedCombatWorkoutTemplates();
  await syncTemplateExerciseSubcategories();
  await seedDailyMissions();
}

function countRows(table) {
  return getDatabase().prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
}

async function main() {
  const tmpDir = mkdtempSync(path.join(tmpdir(), 'gym-os-boot-test-'));
  const dbPath = path.join(tmpDir, 'boot.sqlite');

  openDatabase(dbPath);

  console.log('1a chamada da sequencia de boot...');
  await runBootSequence();

  const counts1 = {
    workout_types: countRows('workout_types'),
    exercises: countRows('exercises'),
    workout_templates: countRows('workout_templates'),
    daily_missions: countRows('daily_missions')
  };

  assert.ok(counts1.workout_types > 0, 'seedWorkoutTypes nao gravou nada');
  assert.ok(counts1.exercises > 0, 'seedExerciseCatalog nao gravou nada');
  assert.ok(counts1.workout_templates > 0, 'seedCombatWorkoutTemplates nao gravou nada');
  assert.ok(counts1.daily_missions > 0, 'seedDailyMissions nao gravou nada');

  console.log('2a chamada da sequencia de boot (idempotencia)...');
  await runBootSequence();

  const counts2 = {
    workout_types: countRows('workout_types'),
    exercises: countRows('exercises'),
    workout_templates: countRows('workout_templates'),
    daily_missions: countRows('daily_missions')
  };

  assert.deepEqual(counts1, counts2, 'rodar o boot 2x duplicou ou alterou contagens (upsert nao e idempotente)');

  console.log('\nOK - sequencia de boot completa rodou 2x sem erro e sem duplicar dados.');
  console.table(counts2);

  closeDatabase();
  rmSync(tmpDir, { recursive: true, force: true });
}

main().catch((error) => {
  console.error('\nFALHOU:', error);
  process.exitCode = 1;
});
