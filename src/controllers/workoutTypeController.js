import mongoose from 'mongoose';
import { WorkoutType } from '../models/WorkoutType.js';

function normalizeWorkoutTypePayload(payload) {
  return {
    code: String(payload.code || '').toLowerCase().trim(),
    name: String(payload.name || '').trim(),
    description: String(payload.description || '').trim(),
    measurementType: String(payload.measurementType || '').trim(),
    fields: Array.isArray(payload.fields)
      ? payload.fields.map((field) => String(field).trim()).filter(Boolean)
      : String(payload.fields || '')
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean),
    active: payload.active ?? true
  };
}

function notFoundResponse(response) {
  return response.status(404).json({ message: 'Tipo de treino nao encontrado.' });
}

export async function listWorkoutTypes(request, response, next) {
  try {
    const types = await WorkoutType.find({ active: true }).sort({ name: 1 });
    response.json(types);
  } catch (error) {
    next(error);
  }
}

export async function getWorkoutType(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return notFoundResponse(response);
    }

    const type = await WorkoutType.findById(request.params.id);

    if (!type) {
      return notFoundResponse(response);
    }

    response.json(type);
  } catch (error) {
    next(error);
  }
}

export async function createWorkoutType(request, response, next) {
  try {
    const type = await WorkoutType.create(normalizeWorkoutTypePayload(request.body));
    response.status(201).json(type);
  } catch (error) {
    next(error);
  }
}

export async function updateWorkoutType(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return notFoundResponse(response);
    }

    const type = await WorkoutType.findByIdAndUpdate(
      request.params.id,
      normalizeWorkoutTypePayload(request.body),
      { new: true, runValidators: true }
    );

    if (!type) {
      return notFoundResponse(response);
    }

    response.json(type);
  } catch (error) {
    next(error);
  }
}

export async function deleteWorkoutType(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return notFoundResponse(response);
    }

    const type = await WorkoutType.findByIdAndUpdate(
      request.params.id,
      { active: false },
      { new: true }
    );

    if (!type) {
      return notFoundResponse(response);
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
}
