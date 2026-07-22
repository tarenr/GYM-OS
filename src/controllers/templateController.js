import mongoose from 'mongoose';
import { WorkoutTemplate } from '../models/WorkoutTemplate.js';

function normalizeTemplatePayload(payload) {
  return {
    code: String(payload.code || '').toUpperCase().trim(),
    name: String(payload.name || '').trim(),
    level: String(payload.level || '').trim(),
    xpReward: Number(payload.xpReward || 0),
    description: String(payload.description || '').trim(),
    workoutTypeId: payload.workoutTypeId || null,
    workoutTypeCode: String(payload.workoutTypeCode || 'strength').toLowerCase().trim(),
    workoutTypeName: String(payload.workoutTypeName || 'Musculacao').trim(),
    measurementType: String(payload.measurementType || 'sets_reps_weight').trim(),
    exercises: (payload.exercises || []).map((exercise, index) => ({
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      category: exercise.category,
      subcategory: String(exercise.subcategory || '').trim(),
      modality: String(exercise.modality || payload.workoutTypeCode || 'strength').toLowerCase().trim(),
      measurementType: String(exercise.measurementType || payload.measurementType || 'sets_reps_weight').trim(),
      loadMode: String(exercise.loadMode || 'dumbbell_each').trim(),
      equipment: exercise.equipment || [],
      plannedSets: Number(exercise.plannedSets || 0),
      plannedReps: String(exercise.plannedReps || '').trim(),
      plannedRounds: Number(exercise.plannedRounds || 0),
      plannedDurationSeconds: Number(exercise.plannedDurationSeconds || 0),
      plannedRestSeconds: Number(exercise.plannedRestSeconds || 0),
      mediaProvider: String(exercise.mediaProvider || '').trim(),
      externalExerciseId: String(exercise.externalExerciseId || '').trim(),
      imageUrl: String(exercise.imageUrl || '').trim(),
      imageAlt: String(exercise.imageAlt || '').trim(),
      imageLicense: String(exercise.imageLicense || '').trim(),
      imageLicenseUrl: String(exercise.imageLicenseUrl || '').trim(),
      imageAuthor: String(exercise.imageAuthor || '').trim(),
      imageAuthorUrl: String(exercise.imageAuthorUrl || '').trim(),
      imageSourceUrl: String(exercise.imageSourceUrl || '').trim(),
      instructions: [],
      tips: Array.isArray(exercise.tips) ? exercise.tips : [],
      order: index + 1
    })),
    active: payload.active ?? true
  };
}

function notFoundResponse(response) {
  return response.status(404).json({ message: 'Ficha nao encontrada.' });
}

export async function listTemplates(request, response, next) {
  try {
    const templates = await WorkoutTemplate.find({ active: true }).sort({ code: 1, name: 1 });
    response.json(templates);
  } catch (error) {
    next(error);
  }
}

export async function getTemplate(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return notFoundResponse(response);
    }

    const template = await WorkoutTemplate.findById(request.params.id);

    if (!template) {
      return notFoundResponse(response);
    }

    response.json(template);
  } catch (error) {
    next(error);
  }
}

export async function createTemplate(request, response, next) {
  try {
    const template = await WorkoutTemplate.create(normalizeTemplatePayload(request.body));
    response.status(201).json(template);
  } catch (error) {
    next(error);
  }
}

export async function updateTemplate(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return notFoundResponse(response);
    }

    const template = await WorkoutTemplate.findByIdAndUpdate(
      request.params.id,
      normalizeTemplatePayload(request.body),
      { new: true, runValidators: true }
    );

    if (!template) {
      return notFoundResponse(response);
    }

    response.json(template);
  } catch (error) {
    next(error);
  }
}

export async function deleteTemplate(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return notFoundResponse(response);
    }

    const template = await WorkoutTemplate.findByIdAndUpdate(
      request.params.id,
      { active: false },
      { new: true }
    );

    if (!template) {
      return notFoundResponse(response);
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
}
