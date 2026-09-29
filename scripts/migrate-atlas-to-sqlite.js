// Fase 1 da migração SQLite — dump do MongoDB Atlas para o novo arquivo SQLite.
// NÃO toca no Atlas (só leitura) nem em nenhum código ativo do app (server.js,
// controllers, models continuam 100% no Mongoose). O .sqlite gerado aqui ainda
// não é usado pelo app — serve só pra validação da Fase 1.
//
// Uso:
//   node scripts/migrate-atlas-to-sqlite.js               (preview: só relatório)
//   node scripts/migrate-atlas-to-sqlite.js --write        (grava; recusa se o
//                                                            arquivo já tiver
//                                                            dados, a menos que
//                                                            --force seja usado)
//   node scripts/migrate-atlas-to-sqlite.js --write --force

import 'dotenv/config';
import mongoose from 'mongoose';
import { existsSync } from 'node:fs';
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
const shouldWrite = process.argv.includes('--write');
const force = process.argv.includes('--force');

const toIso = (value) => (value ? new Date(value).toISOString() : null);
const toBool = (value) => (value ? 1 : 0);

const collections = [
  {
    name: 'WorkoutType',
    table: 'workout_types',
    model: WorkoutType,
    mapRow: (doc) => ({
      id: String(doc._id),
      code: doc.code,
      name: doc.name,
      description: doc.description || '',
      measurement_type: doc.measurementType,
      fields: JSON.stringify(doc.fields || []),
      active: toBool(doc.active),
      created_at: toIso(doc.createdAt),
      updated_at: toIso(doc.updatedAt)
    })
  },
  {
    name: 'Exercise',
    table: 'exercises',
    model: Exercise,
    mapRow: (doc) => ({
      id: String(doc._id),
      name: doc.name,
      category: doc.category,
      subcategory: doc.subcategory || '',
      modality: doc.modality || 'strength',
      measurement_type: doc.measurementType || 'sets_reps_weight',
      load_mode: doc.loadMode || 'dumbbell_each',
      equipment: JSON.stringify(doc.equipment || []),
      default_sets: doc.defaultSets || 0,
      default_reps: doc.defaultReps || '',
      default_rounds: doc.defaultRounds || 0,
      default_duration_seconds: doc.defaultDurationSeconds || 0,
      default_rest_seconds: doc.defaultRestSeconds || 0,
      media_provider: doc.mediaProvider || '',
      external_exercise_id: doc.externalExerciseId || '',
      image_url: doc.imageUrl || '',
      image_alt: doc.imageAlt || '',
      image_license: doc.imageLicense || '',
      image_license_url: doc.imageLicenseUrl || '',
      image_author: doc.imageAuthor || '',
      image_author_url: doc.imageAuthorUrl || '',
      image_source_url: doc.imageSourceUrl || '',
      instructions: JSON.stringify(doc.instructions || []),
      tips: JSON.stringify(doc.tips || []),
      media_synced_at: toIso(doc.mediaSyncedAt),
      active: toBool(doc.active),
      created_at: toIso(doc.createdAt),
      updated_at: toIso(doc.updatedAt)
    })
  },
  {
    name: 'BodyMeasurement',
    table: 'body_measurements',
    model: BodyMeasurement,
    mapRow: (doc) => ({
      id: String(doc._id),
      measured_at: toIso(doc.measuredAt),
      weight_kg: doc.weightKg || 0,
      measurements_cm: JSON.stringify(doc.measurementsCm || {}),
      notes: doc.notes || '',
      created_at: toIso(doc.createdAt),
      updated_at: toIso(doc.updatedAt)
    })
  },
  {
    name: 'WorkoutTemplate',
    table: 'workout_templates',
    model: WorkoutTemplate,
    mapRow: (doc) => ({
      id: String(doc._id),
      code: doc.code,
      name: doc.name,
      level: doc.level || '',
      xp_reward: doc.xpReward || 0,
      description: doc.description || '',
      workout_type_id: doc.workoutTypeId ? String(doc.workoutTypeId) : null,
      workout_type_code: doc.workoutTypeCode || 'strength',
      workout_type_name: doc.workoutTypeName || 'Strength',
      measurement_type: doc.measurementType || 'sets_reps_weight',
      exercises: JSON.stringify(
        (doc.exercises || []).map((exercise) => ({
          ...exercise.toObject?.() ?? exercise,
          exerciseId: exercise.exerciseId ? String(exercise.exerciseId) : null
        }))
      ),
      active: toBool(doc.active),
      created_at: toIso(doc.createdAt),
      updated_at: toIso(doc.updatedAt)
    })
  },
  {
    name: 'DailyMission',
    table: 'daily_missions',
    model: DailyMission,
    mapRow: (doc) => ({
      id: String(doc._id),
      day_index: doc.dayIndex,
      day_of_week: doc.dayOfWeek,
      mission_name: doc.missionName,
      intensity: doc.intensity || '',
      blocks: JSON.stringify(
        (doc.blocks || []).map((block) => ({
          ...block.toObject?.() ?? block,
          templateId: block.templateId ? String(block.templateId) : null
        }))
      ),
      bonus_xp: doc.bonusXp || 0,
      rest_day: toBool(doc.restDay),
      active: toBool(doc.active),
      created_at: toIso(doc.createdAt),
      updated_at: toIso(doc.updatedAt)
    })
  },
  {
    name: 'Workout',
    table: 'workouts',
    model: Workout,
    mapRow: (doc) => ({
      id: String(doc._id),
      date: toIso(doc.date),
      template_id: doc.templateId ? String(doc.templateId) : null,
      workout_code: doc.workoutCode,
      workout_name: doc.workoutName,
      mission_date: toIso(doc.missionDate),
      mission_block_type: doc.missionBlockType || '',
      mission_original_workout_code: doc.missionOriginalWorkoutCode || '',
      mission_original_workout_name: doc.missionOriginalWorkoutName || '',
      mission_substitution: toBool(doc.missionSubstitution),
      duration_minutes: doc.durationMinutes || 0,
      exercises: JSON.stringify(doc.exercises?.map((e) => e.toObject?.() ?? e) || []),
      notes: doc.notes || '',
      xp: JSON.stringify(doc.xp?.toObject?.() ?? doc.xp ?? {}),
      is_demo: toBool(doc.isDemo),
      demo_batch: doc.demoBatch || '',
      created_at: toIso(doc.createdAt),
      updated_at: toIso(doc.updatedAt)
    })
  }
];

function tableHasRows(db, table) {
  const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get();

  return row.n > 0;
}

function insertRows(db, table, rows) {
  if (rows.length === 0) return 0;

  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`);

  db.exec('BEGIN IMMEDIATE');

  try {
    for (const row of rows) {
      stmt.run(...columns.map((column) => row[column]));
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return rows.length;
}

async function main() {
  await connectAtlas();

  console.log(`Arquivo SQLite de destino: ${sqliteFilePath}`);

  const fileExisted = existsSync(sqliteFilePath);
  const db = openDatabase(sqliteFilePath);

  if (shouldWrite && fileExisted) {
    const hasData = collections.some((c) => tableHasRows(db, c.table));

    if (hasData && !force) {
      console.error(
        'O arquivo .sqlite ja existe e tem dados. Rode novamente com --write --force pra sobrescrever ' +
          '(a importacao limpa e sincroniza todas as tabelas em transacao unificada).'
      );
      process.exitCode = 1;
      closeDatabase();
      await mongoose.disconnect();
      return;
    }
  }

  const report = [];
  const dump = [];

  for (const collection of collections) {
    const docs = await collection.model.find({}).lean();
    report.push({ colecao: collection.name, documentos: docs.length });
    const rows = docs.map(collection.mapRow);
    dump.push({ collection, rows });
  }

  if (shouldWrite) {
    db.exec('BEGIN IMMEDIATE');

    try {
      if (force) {
        for (const { collection } of dump) {
          db.exec(`DELETE FROM ${collection.table}`);
        }
      }

      for (let i = 0; i < dump.length; i++) {
        const { collection, rows } = dump[i];

        if (rows.length > 0) {
          const columns = Object.keys(rows[0]);
          const placeholders = columns.map(() => '?').join(', ');
          const stmt = db.prepare(`INSERT OR REPLACE INTO ${collection.table} (${columns.join(', ')}) VALUES (${placeholders})`);

          for (const row of rows) {
            stmt.run(...columns.map((column) => row[column]));
          }
        }

        report[i].gravados = rows.length;
      }

      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }

    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  }

  console.table(report);

  if (!shouldWrite) {
    console.log('Preview mode: nada foi gravado no SQLite. Rode com --write para migrar de verdade.');
  } else {
    console.log('Migracao concluida com sucesso em transacao unificada.');
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
