import mongoose from 'mongoose';
import { connectDatabase } from '../../src/config/database.js';

export function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildNameFilter(exerciseName, { exact = true } = {}) {
  const name = String(exerciseName || '').trim();

  if (!name) {
    throw new Error('CONFIG.exerciseName is required.');
  }

  return exact ? name : new RegExp(escapeRegExp(name), 'i');
}

export function toDateKey(dateValue) {
  return new Date(dateValue).toISOString().slice(0, 10);
}

export function uniqueDateKeys(dates) {
  return [...new Set((dates || []).map(toDateKey))].sort();
}

export function compactExercise(exercise = {}) {
  return {
    name: exercise.name,
    category: exercise.category || exercise.muscleGroup || '',
    modality: exercise.modality || '',
    measurementType: exercise.measurementType || '',
    loadMode: exercise.loadMode || '',
    defaultReps: exercise.defaultReps,
    plannedReps: exercise.plannedReps,
    active: exercise.active
  };
}

export function buildSet(prefix, fields = {}) {
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [`${prefix}${key}`, value])
  );
}

export function printJson(label, value) {
  console.log(label);
  console.log(JSON.stringify(value, null, 2));
}

export async function withDatabase(task) {
  await connectDatabase();

  try {
    return await task();
  } finally {
    await mongoose.disconnect();
  }
}
