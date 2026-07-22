import mongoose from 'mongoose';
import { Exercise } from '../models/Exercise.js';
import { applyExerciseMedia, normalizeMediaPayload, syncExerciseImage } from '../services/exerciseMediaSyncService.js';
import { searchWgerExerciseImages } from '../services/wgerMediaService.js';

export async function searchExerciseMedia(request, response, next) {
  try {
    const q = String(request.query.q || '').trim();
    const limit = Math.min(12, Math.max(1, Number(request.query.limit || 8)));

    if (!q) {
      return response.status(400).json({ message: 'Informe um termo de busca.' });
    }

    const results = await searchWgerExerciseImages(q, limit);

    response.json(results);
  } catch (error) {
    if (error.statusCode) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    next(error);
  }
}

export async function linkExerciseMedia(request, response, next) {
  try {
    const { exerciseId } = request.body;

    if (!mongoose.isValidObjectId(exerciseId)) {
      return response.status(400).json({ message: 'Exercicio invalido.' });
    }

    const media = normalizeMediaPayload(request.body);

    if (!media.imageUrl) {
      return response.status(422).json({ message: 'Informe uma imagem para vincular ao exercicio.' });
    }

    const exercise = await Exercise.findById(exerciseId);

    if (!exercise) {
      return response.status(404).json({ message: 'Exercicio nao encontrado.' });
    }

    const updatedExercise = await applyExerciseMedia(exercise, media);

    response.json(updatedExercise);
  } catch (error) {
    next(error);
  }
}

export async function syncExerciseMedia(request, response, next) {
  try {
    const { exerciseId } = request.body;

    if (!mongoose.isValidObjectId(exerciseId)) {
      return response.status(400).json({ message: 'Exercicio invalido.' });
    }

    const exercise = await Exercise.findById(exerciseId);

    if (!exercise) {
      return response.status(404).json({ message: 'Exercicio nao encontrado.' });
    }

    const result = await syncExerciseImage(exercise, { force: true });

    if ((result.status === 'not-found' || result.status === 'unsupported-modality') && !result.exercise.imageUrl) {
      return response.status(404).json({ message: 'Nenhuma imagem confiavel encontrada automaticamente para este exercicio.' });
    }

    response.json({
      status: result.status,
      exercise: result.exercise,
      media: result.media
    });
  } catch (error) {
    next(error);
  }
}
