import mongoose from 'mongoose';
import { Workout } from '../models/Workout.js';
import { recalculateWorkoutDateXpSnapshots } from '../services/xpCalculator.js';

const workoutNames = {
  A: 'Peito e triceps',
  B: 'Costas e biceps',
  C: 'Pernas e ombros'
};

function normalizeWorkoutPayload(payload) {
  const workoutCode = String(payload.workoutCode || '').toUpperCase();

  return {
    date: payload.date,
    templateId: payload.templateId || undefined,
    workoutCode,
    workoutName: payload.workoutName || workoutNames[workoutCode] || '',
    missionDate: payload.missionDate || null,
    missionBlockType: String(payload.missionBlockType || '').trim(),
    missionOriginalWorkoutCode: String(payload.missionOriginalWorkoutCode || '').toUpperCase().trim(),
    missionOriginalWorkoutName: String(payload.missionOriginalWorkoutName || '').trim(),
    missionSubstitution: Boolean(payload.missionSubstitution),
    durationMinutes: Number(payload.durationMinutes || 0),
    exercises: (payload.exercises || []).map((exercise) => ({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup || exercise.category,
      subcategory: String(exercise.subcategory || '').trim(),
      modality: exercise.modality || 'strength',
      measurementType: exercise.measurementType || 'sets_reps_weight',
      source: exercise.source === 'extra' ? 'extra' : 'planned',
      plannedSets: Number(exercise.plannedSets || 0),
      plannedReps: exercise.plannedReps || '',
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
      completedSets: Number(exercise.completedSets || 0),
      completedRounds: Number(exercise.completedRounds || 0),
      sets: exercise.sets || [],
      rounds: exercise.rounds || [],
      notes: exercise.notes || ''
    })),
    notes: payload.notes || ''
  };
}

function validateWorkoutPayload(payload) {
  const errors = [];

  if (!payload.date) {
    errors.push('A data do treino e obrigatoria.');
  }

  if (!payload.workoutCode) {
    errors.push('A ficha do treino e obrigatoria.');
  }

  if (!Array.isArray(payload.exercises) || payload.exercises.length === 0) {
    errors.push('O treino precisa ter pelo menos um exercicio.');
  }

  if (!Number.isFinite(Number(payload.durationMinutes)) || Number(payload.durationMinutes) < 0) {
    errors.push('A duracao do treino precisa ser um numero valido.');
  }

  payload.exercises.forEach((exercise, exerciseIndex) => {
    if (!exercise.name) {
      errors.push(`Exercicio ${exerciseIndex + 1}: informe o nome.`);
    }

    if (!exercise.muscleGroup) {
      errors.push(`Exercicio ${exerciseIndex + 1}: informe o grupo muscular.`);
    }

    const measurementType = exercise.measurementType || 'sets_reps_weight';
    const isRoundBased = measurementType === 'rounds_time' || measurementType === 'rounds_time_reps';

    if (isRoundBased) {
      if (!Array.isArray(exercise.rounds) || exercise.rounds.length === 0) {
        errors.push(`Exercicio ${exerciseIndex + 1}: informe pelo menos um round.`);
      }
    } else if (!Array.isArray(exercise.sets) || exercise.sets.length === 0) {
      errors.push(`Exercicio ${exerciseIndex + 1}: informe pelo menos uma serie.`);
    }

    (exercise.sets || []).forEach((set, setIndex) => {
      if (!Number.isFinite(Number(set.weight)) || Number(set.weight) < 0) {
        errors.push(`Exercicio ${exerciseIndex + 1}, serie ${setIndex + 1}: carga invalida.`);
      }

      if (!Number.isFinite(Number(set.reps)) || Number(set.reps) < 0) {
        errors.push(`Exercicio ${exerciseIndex + 1}, serie ${setIndex + 1}: repeticoes invalidas.`);
      }
    });

    (exercise.rounds || []).forEach((round, roundIndex) => {
      if (!Number.isFinite(Number(round.durationSeconds)) || Number(round.durationSeconds) < 0) {
        errors.push(`Exercicio ${exerciseIndex + 1}, round ${roundIndex + 1}: duracao invalida.`);
      }

      if (!Number.isFinite(Number(round.restSeconds)) || Number(round.restSeconds) < 0) {
        errors.push(`Exercicio ${exerciseIndex + 1}, round ${roundIndex + 1}: descanso invalido.`);
      }

      if (!Number.isFinite(Number(round.reps)) || Number(round.reps) < 0) {
        errors.push(`Exercicio ${exerciseIndex + 1}, round ${roundIndex + 1}: golpes invalidos.`);
      }
    });
  });

  return errors;
}

function notFoundResponse(response) {
  return response.status(404).json({ message: 'Treino nao encontrado.' });
}

export async function listWorkouts(request, response, next) {
  try {
    const filter = {};

    if (request.query.workoutCode && request.query.workoutCode !== 'all') {
      filter.workoutCode = String(request.query.workoutCode).toUpperCase();
    }

    const workouts = await Workout.find(filter).sort({ date: -1, createdAt: -1 });

    response.json(workouts);
  } catch (error) {
    next(error);
  }
}

export async function getWorkout(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return notFoundResponse(response);
    }

    const workout = await Workout.findById(request.params.id);

    if (!workout) {
      return notFoundResponse(response);
    }

    response.json(workout);
  } catch (error) {
    next(error);
  }
}

export async function createWorkout(request, response, next) {
  try {
    const payload = normalizeWorkoutPayload(request.body);
    const errors = validateWorkoutPayload(payload);

    if (errors.length > 0) {
      return response.status(422).json({ message: 'Dados invalidos.', errors });
    }

    const workout = await Workout.create(payload);
    const updatedWorkouts = await recalculateWorkoutDateXpSnapshots(workout.date);
    const updatedWorkout = updatedWorkouts.find((item) => String(item._id) === String(workout._id)) || workout;

    response.status(201).json(updatedWorkout);
  } catch (error) {
    next(error);
  }
}

export async function updateWorkout(request, response, next) {
  try {
    const payload = normalizeWorkoutPayload(request.body);
    const errors = validateWorkoutPayload(payload);

    if (errors.length > 0) {
      return response.status(422).json({ message: 'Dados invalidos.', errors });
    }

    if (!mongoose.isValidObjectId(request.params.id)) {
      return notFoundResponse(response);
    }

    const previousWorkout = await Workout.findById(request.params.id);

    if (!previousWorkout) {
      return notFoundResponse(response);
    }

    const workout = await Workout.findByIdAndUpdate(request.params.id, payload, {
      new: true,
      runValidators: true
    });

    const previousDateKey = previousWorkout.date.toISOString().slice(0, 10);
    const nextDateKey = workout.date.toISOString().slice(0, 10);

    if (previousDateKey !== nextDateKey) {
      await recalculateWorkoutDateXpSnapshots(previousWorkout.date);
    }

    const updatedWorkouts = await recalculateWorkoutDateXpSnapshots(workout.date);
    const updatedWorkout = updatedWorkouts.find((item) => String(item._id) === String(workout._id)) || workout;

    response.json(updatedWorkout);
  } catch (error) {
    next(error);
  }
}

export async function deleteWorkout(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return notFoundResponse(response);
    }

    const workout = await Workout.findByIdAndDelete(request.params.id);

    if (!workout) {
      return notFoundResponse(response);
    }

    await recalculateWorkoutDateXpSnapshots(workout.date);

    response.status(204).send();
  } catch (error) {
    next(error);
  }
}
