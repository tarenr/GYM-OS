// Fase 1 da migração SQLite — valida a copia gerada por migrate-atlas-to-sqlite.js
// contra o Atlas: contagem por colecao, conteudo completo por id, e vinculos
// (templateId/exerciseId/workoutTypeId). So leitura nos dois lados.
//
// Nota aceita nesta fase: como o Atlas continua recebendo escritas normais do
// app enquanto este script roda, uma pequena divergencia entre o dump e esta
// validacao e esperada e aceitavel — esta copia ainda nao e autoritativa.
//
// Uso: node scripts/validate-sqlite-migration.js

import 'dotenv/config';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectAtlas } from '../src/config/atlas.js';
import { openDatabase, getDatabase, closeDatabase } from '../src/db/sqlite/client.js';
import { WorkoutType } from '../src/models/WorkoutType.js';
import { Exercise } from '../src/models/Exercise.js';
import { BodyMeasurement } from '../src/models/BodyMeasurement.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';
import { DailyMission } from '../src/models/DailyMission.js';
import { Workout } from '../src/models/Workout.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqliteFilePath = path.join(__dirname, '..', 'data', 'gym-os.sqlite');

const issues = [];

function checkEqual(label, expected, actual) {
  if (expected !== actual) {
    issues.push(`${label}: esperado ${JSON.stringify(expected)}, encontrado ${JSON.stringify(actual)}`);
  }
}

function normalizeJson(value) {
  return JSON.stringify(value ?? null);
}

async function validateCollection(db, { name, table, model, mapRow }) {
  const atlasDocs = await model.find({}).lean();
  const sqliteRows = db.prepare(`SELECT * FROM ${table}`).all();

  checkEqual(`${name}: contagem`, atlasDocs.length, sqliteRows.length);

  const sqliteById = new Map(sqliteRows.map((row) => [row.id, row]));
  let comparedContent = 0;

  for (const doc of atlasDocs) {
    const id = String(doc._id);
    const sqliteRow = sqliteById.get(id);

    if (!sqliteRow) {
      issues.push(`${name} ${id}: presente no Atlas, ausente no SQLite.`);
      continue;
    }

    const expectedRow = mapRow(doc);

    for (const [column, expectedValue] of Object.entries(expectedRow)) {
      if (column === 'id' || column === 'created_at' || column === 'updated_at') continue;

      const actualValue = sqliteRow[column];
      const isJsonColumn = typeof expectedValue === 'string' && (expectedValue.startsWith('[') || expectedValue.startsWith('{'));

      if (isJsonColumn) {
        if (normalizeJson(JSON.parse(expectedValue)) !== normalizeJson(JSON.parse(actualValue ?? 'null'))) {
          issues.push(`${name} ${id}: coluna "${column}" diverge (JSON).`);
        }
      } else if (expectedValue !== actualValue) {
        issues.push(`${name} ${id}: coluna "${column}" diverge (${JSON.stringify(expectedValue)} vs ${JSON.stringify(actualValue)}).`);
      }
    }

    comparedContent += 1;
  }

  return { colecao: name, atlas: atlasDocs.length, sqlite: sqliteRows.length, comparados: comparedContent };
}

async function validateLinks(db) {
  const templates = db.prepare('SELECT id, workout_type_id FROM workout_templates WHERE workout_type_id IS NOT NULL').all();
  const workoutTypeIds = new Set(db.prepare('SELECT id FROM workout_types').all().map((r) => r.id));

  for (const template of templates) {
    if (!workoutTypeIds.has(template.workout_type_id)) {
      issues.push(`WorkoutTemplate ${template.id}: workout_type_id "${template.workout_type_id}" nao existe em workout_types.`);
    }
  }

  const workouts = db.prepare('SELECT id, template_id FROM workouts WHERE template_id IS NOT NULL').all();
  const templateIds = new Set(db.prepare('SELECT id FROM workout_templates').all().map((r) => r.id));

  for (const workout of workouts) {
    if (!templateIds.has(workout.template_id)) {
      issues.push(`Workout ${workout.id}: template_id "${workout.template_id}" nao existe em workout_templates.`);
    }
  }

  const exerciseIds = new Set(db.prepare('SELECT id FROM exercises').all().map((r) => r.id));

  for (const template of db.prepare('SELECT id, exercises FROM workout_templates').all()) {
    const exercises = JSON.parse(template.exercises || '[]');

    for (const exercise of exercises) {
      if (exercise.exerciseId && !exerciseIds.has(exercise.exerciseId)) {
        issues.push(`WorkoutTemplate ${template.id}: exerciseId "${exercise.exerciseId}" nao existe em exercises.`);
      }
    }
  }

  return {
    templates_com_workout_type: templates.length,
    workouts_com_template: workouts.length
  };
}

async function main() {
  await connectAtlas();

  const db = openDatabase(sqliteFilePath);
  const report = [];

  report.push(await validateCollection(db, {
    name: 'WorkoutType',
    table: 'workout_types',
    model: WorkoutType,
    mapRow: (doc) => ({
      code: doc.code,
      name: doc.name,
      description: doc.description || '',
      measurement_type: doc.measurementType,
      fields: JSON.stringify(doc.fields || []),
      active: doc.active ? 1 : 0
    })
  }));

  report.push(await validateCollection(db, {
    name: 'Exercise',
    table: 'exercises',
    model: Exercise,
    mapRow: (doc) => ({
      name: doc.name,
      category: doc.category,
      subcategory: doc.subcategory || '',
      modality: doc.modality || 'strength',
      load_mode: doc.loadMode || 'dumbbell_each',
      equipment: JSON.stringify(doc.equipment || []),
      instructions: JSON.stringify(doc.instructions || []),
      tips: JSON.stringify(doc.tips || []),
      active: doc.active ? 1 : 0
    })
  }));

  report.push(await validateCollection(db, {
    name: 'BodyMeasurement',
    table: 'body_measurements',
    model: BodyMeasurement,
    mapRow: (doc) => ({
      weight_kg: doc.weightKg || 0,
      measurements_cm: JSON.stringify(doc.measurementsCm || {}),
      notes: doc.notes || ''
    })
  }));

  report.push(await validateCollection(db, {
    name: 'WorkoutTemplate',
    table: 'workout_templates',
    model: WorkoutTemplate,
    mapRow: (doc) => ({
      code: doc.code,
      name: doc.name,
      xp_reward: doc.xpReward || 0,
      exercises: JSON.stringify((doc.exercises || []).map((e) => ({ ...e, exerciseId: e.exerciseId ? String(e.exerciseId) : null }))),
      active: doc.active ? 1 : 0
    })
  }));

  report.push(await validateCollection(db, {
    name: 'DailyMission',
    table: 'daily_missions',
    model: DailyMission,
    mapRow: (doc) => ({
      day_index: doc.dayIndex,
      day_of_week: doc.dayOfWeek,
      mission_name: doc.missionName,
      blocks: JSON.stringify((doc.blocks || []).map((b) => ({ ...b, templateId: b.templateId ? String(b.templateId) : null }))),
      bonus_xp: doc.bonusXp || 0,
      rest_day: doc.restDay ? 1 : 0,
      active: doc.active ? 1 : 0
    })
  }));

  report.push(await validateCollection(db, {
    name: 'Workout',
    table: 'workouts',
    model: Workout,
    mapRow: (doc) => ({
      workout_code: doc.workoutCode,
      workout_name: doc.workoutName,
      duration_minutes: doc.durationMinutes || 0,
      exercises: JSON.stringify(doc.exercises || []),
      notes: doc.notes || '',
      xp: JSON.stringify(doc.xp || {}),
      is_demo: doc.isDemo ? 1 : 0,
      demo_batch: doc.demoBatch || ''
    })
  }));

  const linkStats = await validateLinks(db);

  console.log('\nContagem e conteudo por colecao:');
  console.table(report);
  console.log('\nVinculos verificados:', linkStats);

  if (issues.length === 0) {
    console.log('\nNenhuma divergencia encontrada. Atlas e SQLite batem 100% neste snapshot.');
  } else {
    console.log(`\n${issues.length} divergencia(s) encontrada(s):`);

    for (const issue of issues) {
      console.log(` - ${issue}`);
    }

    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    closeDatabase();
    await mongoose.disconnect();
  });
