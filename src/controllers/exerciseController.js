import { Exercise } from '../models/Exercise.js';
import { syncMissingExerciseImages } from '../services/exerciseMediaSyncService.js';

export async function listExercises(request, response, next) {
  try {
    const filter = { active: true };

    if (request.query.category && request.query.category !== 'all') {
      filter.category = request.query.category;
    }

    if (request.query.subcategory && request.query.subcategory !== 'all') {
      filter.subcategory = request.query.subcategory;
    }

    if (request.query.modality && request.query.modality !== 'all') {
      filter.modality = request.query.modality;
    }

    if (request.query.measurementType && request.query.measurementType !== 'all') {
      filter.measurementType = request.query.measurementType;
    }

    if (request.query.syncMedia === '1' || request.query.syncMedia === 'true') {
      try {
        await syncMissingExerciseImages({
          filter,
          limit: Number(process.env.WGER_AUTO_SYNC_LIMIT || 100)
        });
      } catch (error) {
        console.warn(`Nao foi possivel sincronizar imagens automaticamente: ${error.message}`);
      }
    }

    const exercises = await Exercise.find(filter).sort({ modality: 1, category: 1, subcategory: 1, name: 1 });

    response.json(exercises);
  } catch (error) {
    next(error);
  }
}
