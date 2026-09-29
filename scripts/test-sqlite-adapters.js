// Testes de contrato dos adaptadores SQLite (Fase 1 da migração) contra um
// banco DESCARTÁVEL, criado e apagado neste mesmo processo — nunca toca no
// .sqlite real gerado por migrate-atlas-to-sqlite.js nem no MongoDB Atlas.
//
// Uso: node scripts/test-sqlite-adapters.js

import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openDatabase, closeDatabase } from '../src/db/sqlite/client.js';
import {
  WorkoutTypeSqlite,
  ExerciseSqlite,
  BodyMeasurementSqlite,
  WorkoutTemplateSqlite,
  DailyMissionSqlite,
  WorkoutSqlite
} from '../src/db/sqlite/adapters/index.js';
import { ValidationError, UnsupportedQueryError } from '../src/db/sqlite/queryEngine.js';
import { applyExerciseMedia } from '../src/services/exerciseMediaSyncService.js';

const results = [];

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, error });
  }
}

async function main() {
  const tmpDir = mkdtempSync(path.join(tmpdir(), 'gym-os-sqlite-test-'));
  const dbPath = path.join(tmpDir, 'disposable.sqlite');

  openDatabase(dbPath);

  await test('Exercise.create aplica defaults', async () => {
    const exercise = await ExerciseSqlite.create({ name: 'Supino reto', category: 'Peito' });

    assert.equal(exercise.modality, 'strength');
    assert.equal(exercise.loadMode, 'dumbbell_each');
    assert.deepEqual(exercise.instructions, []);
    assert.ok(exercise._id);
    assert.ok(exercise.createdAt instanceof Date);
  });

  await test('Exercise.create falha sem campo obrigatorio', async () => {
    await assert.rejects(
      () => ExerciseSqlite.create({ category: 'Peito' }),
      ValidationError
    );
  });

  await test('Exercise.create falha com enum invalido', async () => {
    await assert.rejects(
      () => ExerciseSqlite.create({ name: 'X', category: 'Y', loadMode: 'invalido' }),
      ValidationError
    );
  });

  await test('Exercise unique index rejeita duplicata (category+name)', async () => {
    await ExerciseSqlite.create({ name: 'Agachamento', category: 'Pernas' });
    await assert.rejects(() => ExerciseSqlite.create({ name: 'Agachamento', category: 'Pernas' }));
  });

  await test('find + sort + limit + lean', async () => {
    await ExerciseSqlite.create({ name: 'Remada', category: 'Costas' });
    await ExerciseSqlite.create({ name: 'Puxada', category: 'Costas' });

    const rows = await ExerciseSqlite.find({ category: 'Costas' }).sort({ name: 1 }).limit(1).lean();

    assert.equal(rows.length, 1);
    assert.equal(rows[0].name, 'Puxada');
    assert.equal(typeof rows[0].save, 'undefined');
  });

  await test('findOne + instancia com .save()', async () => {
    const created = await ExerciseSqlite.create({ name: 'Leg press', category: 'Pernas 2' });
    const found = await ExerciseSqlite.findById(created._id);

    found.notes = undefined;
    found.defaultSets = 5;
    await found.save();

    const reloaded = await ExerciseSqlite.findById(created._id).lean();

    assert.equal(reloaded.defaultSets, 5);
  });

  await test('$in com valores simples', async () => {
    const rows = await ExerciseSqlite.find({ category: { $in: ['Pernas', 'Pernas 2'] } }).lean();

    assert.ok(rows.length >= 2);
  });

  await test('$in com RegExp exata case-insensitive (padrao real do fix-single-dumbbell-load-modes.js)', async () => {
    await ExerciseSqlite.create({ name: 'Rosca Direta', category: 'Braço' });

    const filter = { $in: [new RegExp('^rosca direta$', 'i')] };
    const rows = await ExerciseSqlite.find({ name: filter }).lean();

    assert.equal(rows.length, 1);
    assert.equal(rows[0].name, 'Rosca Direta');
  });

  await test('regex fora do padrao suportado lança UnsupportedQueryError', async () => {
    await assert.rejects(async () => {
      await ExerciseSqlite.find({ name: /rosca.*/ }).lean();
    }, UnsupportedQueryError);
  });

  await test('$gte/$lt em coluna date (padrao real do xpCalculator.js)', async () => {
    const dateKey = '2026-01-15';
    const start = new Date(`${dateKey}T00:00:00.000Z`);
    const end = new Date(`${dateKey}T00:00:00.000Z`);

    end.setUTCDate(end.getUTCDate() + 1);

    const workout = await WorkoutSqlite.create({
      date: new Date(`${dateKey}T10:00:00.000Z`),
      workoutCode: 'A',
      workoutName: 'Teste',
      exercises: [
        {
          name: 'Supino',
          muscleGroup: 'Peito',
          loadMode: 'dumbbell_each',
          sets: [{ setNumber: 1, weight: 20, reps: 10 }]
        }
      ]
    });

    const rows = await WorkoutSqlite.find({ date: { $gte: start, $lt: end } }).sort({ createdAt: 1 });

    assert.equal(rows.length, 1);
    assert.equal(String(rows[0]._id), String(workout._id));
    assert.equal(rows[0].totalVolume, 20 * 2 * 10);
  });

  await test('dot-path dentro de JSON array (exercises.name) com json_each/json_extract', async () => {
    await WorkoutTemplateSqlite.create({
      code: 'B',
      name: 'Template B',
      exercises: [
        { exerciseId: 'abc123', name: 'Supino Inclinado', category: 'Peito', order: 1 },
        { exerciseId: 'def456', name: 'Crucifixo', category: 'Peito', order: 2 }
      ]
    });

    const rows = await WorkoutTemplateSqlite.find({ 'exercises.name': 'Crucifixo' }).lean();

    assert.equal(rows.length, 1);
    assert.equal(rows[0].code, 'B');
  });

  await test('projecao posicional exercises.$ (padrao de remove-exercise-everywhere.js)', async () => {
    const rows = await WorkoutTemplateSqlite.find(
      { 'exercises.name': 'Crucifixo' },
      { code: 1, name: 1, 'exercises.$': 1 }
    ).lean();

    assert.equal(rows.length, 1);
    assert.equal(rows[0].exercises.length, 1);
    assert.equal(rows[0].exercises[0].name, 'Crucifixo');
    assert.equal(rows[0].name, 'Template B');
  });

  await test('findByIdAndUpdate com new:true retorna documento atualizado', async () => {
    const created = await WorkoutTypeSqlite.create({
      code: 'strength-test',
      name: 'Strength Test',
      measurementType: 'sets_reps_weight'
    });

    const updated = await WorkoutTypeSqlite.findByIdAndUpdate(
      created._id,
      { name: 'Strength Test 2' },
      { new: true, runValidators: true }
    );

    assert.equal(updated.name, 'Strength Test 2');
  });

  await test('findByIdAndUpdate com new:false (default) retorna documento anterior', async () => {
    const created = await WorkoutTypeSqlite.create({
      code: 'old-new-test',
      name: 'Before',
      measurementType: 'sets_reps_weight'
    });

    const result = await WorkoutTypeSqlite.findByIdAndUpdate(created._id, { name: 'After' });

    assert.equal(result.name, 'Before');

    const reloaded = await WorkoutTypeSqlite.findById(created._id).lean();

    assert.equal(reloaded.name, 'After');
  });

  await test('findByIdAndDelete remove e retorna o documento removido', async () => {
    const created = await DailyMissionSqlite.create({
      dayIndex: 1,
      dayOfWeek: 'Monday',
      missionName: 'Teste'
    });

    const deleted = await DailyMissionSqlite.findByIdAndDelete(created._id);

    assert.equal(deleted.missionName, 'Teste');

    const reloaded = await DailyMissionSqlite.findById(created._id).lean();

    assert.equal(reloaded, null);
  });

  await test('deleteMany retorna deletedCount correto', async () => {
    await BodyMeasurementSqlite.create({ measuredAt: new Date('2026-01-01T00:00:00.000Z'), weightKg: 80 });
    await BodyMeasurementSqlite.create({ measuredAt: new Date('2026-01-02T00:00:00.000Z'), weightKg: 81 });

    const result = await BodyMeasurementSqlite.deleteMany({ weightKg: { $gte: 80 } });

    assert.equal(result.deletedCount, 2);
  });

  await test('updateMany com $set (padrao de clear-exercise-media.js)', async () => {
    await ExerciseSqlite.create({ name: 'Media Test 1', category: 'Cat Media', imageUrl: 'https://x' });
    await ExerciseSqlite.create({ name: 'Media Test 2', category: 'Cat Media', imageUrl: 'https://y' });

    const result = await ExerciseSqlite.updateMany({ category: 'Cat Media' }, { $set: { imageUrl: '' } });

    assert.equal(result.matchedCount, 2);

    const rows = await ExerciseSqlite.find({ category: 'Cat Media' }).lean();

    assert.ok(rows.every((row) => row.imageUrl === ''));
  });

  await test('updateMany $set fora do conjunto suportado lança erro explicito', async () => {
    await assert.rejects(
      () => ExerciseSqlite.updateMany({}, { notASet: true }),
      UnsupportedQueryError
    );
  });

  await test('updateMany com arrayFilters atualiza elemento especifico e preserva outros elementos e linhas', async () => {
    const t1 = await WorkoutTemplateSqlite.create({
      code: 'AF1',
      name: 'Template AF 1',
      exercises: [
        { exerciseId: 'ex_af_1', name: 'Supino AF', imageUrl: '' },
        { exerciseId: 'ex_af_2', name: 'Crucifixo AF', imageUrl: 'https://crucifixo.png' }
      ]
    });

    const t2 = await WorkoutTemplateSqlite.create({
      code: 'AF2',
      name: 'Template AF 2',
      exercises: [
        { exerciseId: 'ex_af_1', name: 'Supino AF', imageUrl: '' }
      ]
    });

    const t3 = await WorkoutTemplateSqlite.create({
      code: 'AF3',
      name: 'Template AF 3',
      exercises: [
        { exerciseId: 'ex_af_3', name: 'Agachamento AF', imageUrl: 'https://agacha.png' }
      ]
    });

    const result = await WorkoutTemplateSqlite.updateMany(
      { 'exercises.exerciseId': 'ex_af_1' },
      {
        $set: {
          'exercises.$[item].imageUrl': 'https://supino.png',
          'exercises.$[item].mediaProvider': 'wger'
        }
      },
      { arrayFilters: [{ 'item.exerciseId': 'ex_af_1' }] }
    );

    assert.equal(result.matchedCount, 2);
    assert.equal(result.modifiedCount, 2);

    const reloaded1 = await WorkoutTemplateSqlite.findById(t1._id).lean();
    assert.equal(reloaded1.exercises[0].imageUrl, 'https://supino.png');
    assert.equal(reloaded1.exercises[0].mediaProvider, 'wger');
    assert.equal(reloaded1.exercises[1].imageUrl, 'https://crucifixo.png');
    assert.equal(reloaded1.exercises[1].mediaProvider, undefined);

    const reloaded2 = await WorkoutTemplateSqlite.findById(t2._id).lean();
    assert.equal(reloaded2.exercises[0].imageUrl, 'https://supino.png');
    assert.equal(reloaded2.exercises[0].mediaProvider, 'wger');

    const reloaded3 = await WorkoutTemplateSqlite.findById(t3._id).lean();
    assert.equal(reloaded3.exercises[0].imageUrl, 'https://agacha.png');
    assert.equal(reloaded3.exercises[0].mediaProvider, undefined);
  });

  await test('updateMany com arrayFilters sintaxe invalida lanca UnsupportedQueryError', async () => {
    // Sem options.arrayFilters
    await assert.rejects(
      () => WorkoutTemplateSqlite.updateMany(
        { 'exercises.exerciseId': 'ex1' },
        { $set: { 'exercises.$[item].imageUrl': 'https://x' } }
      ),
      UnsupportedQueryError
    );

    // Identificador divergente no arrayFilters
    await assert.rejects(
      () => WorkoutTemplateSqlite.updateMany(
        { 'exercises.exerciseId': 'ex1' },
        { $set: { 'exercises.$[item].imageUrl': 'https://x' } },
        { arrayFilters: [{ 'other.exerciseId': 'ex1' }] }
      ),
      UnsupportedQueryError
    );
  });

  await test('applyExerciseMedia atualiza Exercise, WorkoutTemplate e Workout de ponta a ponta', async () => {
    const exercise = await ExerciseSqlite.create({
      name: 'Desenvolvimento Militar',
      category: 'Ombros',
      modality: 'strength'
    });

    const template = await WorkoutTemplateSqlite.create({
      code: 'OMBRO1',
      name: 'Treino Ombros',
      exercises: [
        {
          exerciseId: exercise._id,
          name: exercise.name,
          category: exercise.category,
          order: 1
        }
      ]
    });

    const workout = await WorkoutSqlite.create({
      date: new Date('2026-03-01T00:00:00.000Z'),
      workoutCode: 'OMBRO1',
      workoutName: 'Treino Ombros Realizado',
      exercises: [
        {
          name: exercise.name,
          muscleGroup: exercise.category,
          sets: [{ setNumber: 1, weight: 20, reps: 10 }]
        }
      ]
    });

    const mediaPayload = {
      mediaProvider: 'wger',
      externalExerciseId: '12345',
      imageUrl: 'https://images.wger.de/desenvolvimento.png',
      imageAlt: 'Desenvolvimento Militar',
      tips: ['Mantenha o core firme']
    };

    const updated = await applyExerciseMedia(exercise, mediaPayload);

    assert.equal(updated.imageUrl, 'https://images.wger.de/desenvolvimento.png');
    assert.equal(updated.mediaProvider, 'wger');

    const reloadedExercise = await ExerciseSqlite.findById(exercise._id).lean();
    assert.equal(reloadedExercise.imageUrl, 'https://images.wger.de/desenvolvimento.png');

    const reloadedTemplate = await WorkoutTemplateSqlite.findById(template._id).lean();
    assert.equal(reloadedTemplate.exercises[0].imageUrl, 'https://images.wger.de/desenvolvimento.png');
    assert.equal(reloadedTemplate.exercises[0].mediaProvider, 'wger');
    assert.deepEqual(reloadedTemplate.exercises[0].tips, ['Mantenha o core firme']);

    const reloadedWorkout = await WorkoutSqlite.findById(workout._id).lean();
    assert.equal(reloadedWorkout.exercises[0].imageUrl, 'https://images.wger.de/desenvolvimento.png');
    assert.equal(reloadedWorkout.exercises[0].mediaProvider, 'wger');
  });

  await test('distinct retorna valores unicos deserializados (Date para coluna date)', async () => {
    await WorkoutSqlite.create({
      date: new Date('2026-02-01T00:00:00.000Z'),
      workoutCode: 'C',
      workoutName: 'Distinct Test',
      exercises: [{ name: 'X', muscleGroup: 'Y', sets: [{ setNumber: 1, weight: 1, reps: 1 }] }]
    });

    const dates = await WorkoutSqlite.distinct('date');

    assert.ok(dates.every((d) => d instanceof Date));
  });

  await test('$or (padrao real de seedExerciseCatalog.js)', async () => {
    await ExerciseSqlite.create({ name: 'Or Test 1', category: 'Or Cat', modality: 'strength' });

    const rows = await ExerciseSqlite.find({
      $or: [{ modality: 'strength' }, { modality: { $exists: false } }]
    }).lean();

    assert.ok(rows.some((row) => row.name === 'Or Test 1'));
  });

  await test('write nao persiste array parcialmente projetado (regressao de seguranca)', async () => {
    const created = await WorkoutTemplateSqlite.create({
      code: 'GUARD',
      name: 'Guard Test',
      exercises: [
        { exerciseId: '1', name: 'Ex1', category: 'C', order: 1 },
        { exerciseId: '2', name: 'Ex2', category: 'C', order: 2 }
      ]
    });

    const projected = await WorkoutTemplateSqlite.find(
      { 'exercises.name': 'Ex1' },
      { code: 1, 'exercises.$': 1 }
    ).lean();

    assert.equal(projected[0].exercises.length, 1);

    // O objeto projetado é só leitura (lean, sem .save()) — não há como persistir
    // esse array truncado de volta pelo adaptador, o que é a garantia que queremos.
    assert.equal(typeof projected[0].save, 'undefined');

    const reloaded = await WorkoutTemplateSqlite.findById(created._id).lean();

    assert.equal(reloaded.exercises.length, 2);
  });

  await test('findOneAndUpdate com upsert:true cria documento novo semeado do filtro', async () => {
    const created = await WorkoutTypeSqlite.findOneAndUpdate(
      { code: 'upsert-single' },
      { $set: { name: 'Upsert Single', measurementType: 'sets_reps_weight' } },
      { upsert: true, new: true }
    );

    assert.equal(created.code, 'upsert-single');
    assert.equal(created.name, 'Upsert Single');
    assert.ok(created._id);
  });

  await test(
    'bulkWrite (padrao real de seedWorkoutTypes.js/seedDailyMissions.js): upsert cria, roda de novo nao duplica',
    async () => {
      const ops = [
        {
          updateOne: {
            filter: { code: 'bulk-a' },
            update: { $set: { name: 'Bulk A', measurementType: 'sets_reps_weight', active: true } },
            upsert: true
          }
        },
        {
          updateOne: {
            filter: { code: 'bulk-b' },
            update: { $set: { name: 'Bulk B', measurementType: 'duration', active: true } },
            upsert: true
          }
        }
      ];

      const first = await WorkoutTypeSqlite.bulkWrite(ops);

      assert.equal(first.upsertedCount, 2);
      assert.equal(first.matchedCount, 0);

      const second = await WorkoutTypeSqlite.bulkWrite(ops);

      assert.equal(second.upsertedCount, 0);
      assert.equal(second.matchedCount, 2);

      const rows = await WorkoutTypeSqlite.find({ code: { $in: ['bulk-a', 'bulk-b'] } }).lean();

      assert.equal(rows.length, 2);
    }
  );

  await test('bulkWrite com $setOnInsert (padrao real de seedExerciseCatalog.js)', async () => {
    const ops = [
      {
        updateOne: {
          filter: { name: 'Rosca Scott', category: 'Braço 2' },
          update: {
            $set: { name: 'Rosca Scott', category: 'Braço 2', modality: 'strength' },
            $setOnInsert: { mediaProvider: 'seed-inicial', imageUrl: '' }
          },
          upsert: true
        }
      }
    ];

    await ExerciseSqlite.bulkWrite(ops);

    const [created] = await ExerciseSqlite.find({ category: 'Braço 2' }).lean();

    assert.equal(created.mediaProvider, 'seed-inicial');

    // Rodar de novo com um $set diferente NAO deve reaplicar o $setOnInsert
    // (so vale na criacao) — o valor de mediaProvider gravado por fora
    // (ex.: uma sincronizacao de midia) tem que sobreviver a um novo seed.
    await ExerciseSqlite.updateMany({ category: 'Braço 2' }, { $set: { mediaProvider: 'sincronizado-depois' } });

    await ExerciseSqlite.bulkWrite([
      {
        updateOne: {
          filter: { name: 'Rosca Scott', category: 'Braço 2' },
          update: {
            $set: { name: 'Rosca Scott', category: 'Braço 2', modality: 'strength' },
            $setOnInsert: { mediaProvider: 'seed-inicial', imageUrl: '' }
          },
          upsert: true
        }
      }
    ]);

    const [reloaded] = await ExerciseSqlite.find({ category: 'Braço 2' }).lean();

    assert.equal(reloaded.mediaProvider, 'sincronizado-depois');
  });

  await test('bulkWrite com operacao nao suportada lanca erro explicito', async () => {
    await assert.rejects(
      () => WorkoutTypeSqlite.bulkWrite([{ deleteOne: { filter: { code: 'x' } } }]),
      UnsupportedQueryError
    );
  });

  closeDatabase();
  rmSync(tmpDir, { recursive: true, force: true });

  const failed = results.filter((r) => !r.ok);

  console.log(`\n${results.length - failed.length}/${results.length} testes passaram.\n`);

  for (const result of results) {
    console.log(`${result.ok ? 'OK  ' : 'FAIL'} ${result.name}`);

    if (!result.ok) {
      console.error(`     ${result.error.name}: ${result.error.message}`);
    }
  }

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
