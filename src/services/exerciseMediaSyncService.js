import { Exercise } from '../models/Exercise.js';
import { Workout } from '../models/Workout.js';
import { WorkoutTemplate } from '../models/WorkoutTemplate.js';
import { searchWgerExerciseImages } from './wgerMediaService.js';

export function normalizeMediaPayload(payload = {}) {
  return {
    mediaProvider: String(payload.mediaProvider || payload.provider || 'wger').trim(),
    externalExerciseId: String(payload.externalExerciseId || '').trim(),
    imageUrl: String(payload.imageUrl || '').trim(),
    imageAlt: String(payload.imageAlt || '').trim(),
    imageLicense: String(payload.imageLicense || '').trim(),
    imageLicenseUrl: String(payload.imageLicenseUrl || '').trim(),
    imageAuthor: String(payload.imageAuthor || '').trim(),
    imageAuthorUrl: String(payload.imageAuthorUrl || '').trim(),
    imageSourceUrl: String(payload.imageSourceUrl || '').trim(),
    instructions: [],
    tips: Array.isArray(payload.tips)
      ? payload.tips.map((item) => String(item).trim()).filter(Boolean)
      : [],
    mediaSyncedAt: new Date()
  };
}

export async function applyExerciseMedia(exercise, mediaPayload) {
  const media = normalizeMediaPayload(mediaPayload);

  if (!media.imageUrl) {
    return null;
  }

  const updatedExercise = await Exercise.findByIdAndUpdate(
    exercise._id,
    { $set: media },
    { new: true, runValidators: true }
  );

  await WorkoutTemplate.updateMany(
    { 'exercises.exerciseId': exercise._id },
    {
      $set: {
        'exercises.$[item].mediaProvider': media.mediaProvider,
        'exercises.$[item].externalExerciseId': media.externalExerciseId,
        'exercises.$[item].imageUrl': media.imageUrl,
        'exercises.$[item].imageAlt': media.imageAlt,
        'exercises.$[item].imageLicense': media.imageLicense,
        'exercises.$[item].imageLicenseUrl': media.imageLicenseUrl,
        'exercises.$[item].imageAuthor': media.imageAuthor,
        'exercises.$[item].imageAuthorUrl': media.imageAuthorUrl,
        'exercises.$[item].imageSourceUrl': media.imageSourceUrl,
        'exercises.$[item].instructions': [],
        'exercises.$[item].tips': media.tips
      }
    },
    { arrayFilters: [{ 'item.exerciseId': exercise._id }] }
  );

  await Workout.updateMany(
    { 'exercises.name': exercise.name },
    {
      $set: {
        'exercises.$[item].mediaProvider': media.mediaProvider,
        'exercises.$[item].externalExerciseId': media.externalExerciseId,
        'exercises.$[item].imageUrl': media.imageUrl,
        'exercises.$[item].imageAlt': media.imageAlt,
        'exercises.$[item].imageLicense': media.imageLicense,
        'exercises.$[item].imageLicenseUrl': media.imageLicenseUrl,
        'exercises.$[item].imageAuthor': media.imageAuthor,
        'exercises.$[item].imageAuthorUrl': media.imageAuthorUrl,
        'exercises.$[item].imageSourceUrl': media.imageSourceUrl,
        'exercises.$[item].instructions': [],
        'exercises.$[item].tips': media.tips
      }
    },
    { arrayFilters: [{ 'item.name': exercise.name }] }
  );

  return updatedExercise;
}

export async function syncExerciseImage(exercise, options = {}) {
  if ((exercise.modality || 'strength') !== 'strength') {
    return {
      exercise,
      status: 'unsupported-modality',
      media: null
    };
  }

  if (!options.force && exercise.imageUrl) {
    return {
      exercise,
      status: 'already-linked',
      media: null
    };
  }

  const results = await searchWgerExerciseImages(exercise.name, options.limit || 5);
  const media = results.find((item) => item.imageUrl);

  if (!media) {
    return {
      exercise,
      status: 'not-found',
      media: null
    };
  }

  const updatedExercise = await applyExerciseMedia(exercise, media);

  return {
    exercise: updatedExercise || exercise,
    status: 'linked',
    media
  };
}

export async function syncMissingExerciseImages(options = {}) {
  const query = options.force
    ? { active: true, ...(options.filter || {}) }
    : {
        active: true,
        ...(options.filter || {}),
        $or: [{ imageUrl: '' }, { imageUrl: { $exists: false } }]
      };
  const limit = Math.max(0, Number(options.limit || 0));
  const cursor = Exercise.find(query).sort({ modality: 1, category: 1, name: 1 });
  const exercises = limit > 0 ? await cursor.limit(limit) : await cursor;
  const summary = [];

  for (const exercise of exercises) {
    try {
      const result = await syncExerciseImage(exercise, { force: options.force });
      summary.push({
        exercise: exercise.name,
        status: result.status,
        imageUrl: result.exercise?.imageUrl || ''
      });
    } catch (error) {
      summary.push({
        exercise: exercise.name,
        status: 'error',
        message: error.message
      });
    }
  }

  return summary;
}
