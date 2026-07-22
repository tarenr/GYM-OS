import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const storageDir = path.resolve(process.cwd(), 'storage');
const storageFile = path.join(storageDir, 'workouts.json');

async function ensureStorage() {
  await fs.mkdir(storageDir, { recursive: true });

  try {
    await fs.access(storageFile);
  } catch {
    await fs.writeFile(storageFile, '[]', 'utf8');
  }
}

async function readWorkouts() {
  await ensureStorage();

  const content = await fs.readFile(storageFile, 'utf8');
  return JSON.parse(content || '[]');
}

async function writeWorkouts(workouts) {
  await ensureStorage();
  await fs.writeFile(storageFile, JSON.stringify(workouts, null, 2), 'utf8');
}

function calculateTotalVolume(workout) {
  return workout.exercises.reduce((workoutTotal, exercise) => {
    const exerciseTotal = exercise.sets.reduce((setTotal, set) => {
      return setTotal + Number(set.weight || 0) * Number(set.reps || 0);
    }, 0);

    return workoutTotal + exerciseTotal;
  }, 0);
}

function withTotalVolume(workout) {
  return {
    ...workout,
    totalVolume: calculateTotalVolume(workout)
  };
}

function sortByDateDesc(a, b) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export async function listWorkouts(filter = {}) {
  const workouts = await readWorkouts();
  const filtered = filter.workoutCode
    ? workouts.filter((workout) => workout.workoutCode === filter.workoutCode)
    : workouts;

  return filtered.sort(sortByDateDesc).map(withTotalVolume);
}

export async function getWorkoutById(id) {
  const workouts = await readWorkouts();
  const workout = workouts.find((item) => item._id === id);
  return workout ? withTotalVolume(workout) : null;
}

export async function createWorkout(payload) {
  const workouts = await readWorkouts();
  const now = new Date().toISOString();
  const workout = {
    _id: randomUUID(),
    ...payload,
    createdAt: now,
    updatedAt: now
  };

  workouts.push(workout);
  await writeWorkouts(workouts);

  return withTotalVolume(workout);
}

export async function updateWorkout(id, payload) {
  const workouts = await readWorkouts();
  const index = workouts.findIndex((item) => item._id === id);

  if (index === -1) {
    return null;
  }

  const workout = {
    ...workouts[index],
    ...payload,
    _id: id,
    updatedAt: new Date().toISOString()
  };

  workouts[index] = workout;
  await writeWorkouts(workouts);

  return withTotalVolume(workout);
}

export async function deleteWorkout(id) {
  const workouts = await readWorkouts();
  const nextWorkouts = workouts.filter((item) => item._id !== id);

  if (nextWorkouts.length === workouts.length) {
    return false;
  }

  await writeWorkouts(nextWorkouts);
  return true;
}
