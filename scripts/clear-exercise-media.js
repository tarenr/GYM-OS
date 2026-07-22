import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Exercise } from '../src/models/Exercise.js';
import { Workout } from '../src/models/Workout.js';
import { WorkoutTemplate } from '../src/models/WorkoutTemplate.js';

const clearExerciseMedia = {
  mediaProvider: '',
  externalExerciseId: '',
  imageUrl: '',
  imageAlt: '',
  imageLicense: '',
  imageLicenseUrl: '',
  imageAuthor: '',
  imageAuthorUrl: '',
  imageSourceUrl: '',
  instructions: [],
  mediaSyncedAt: null
};

const clearEmbeddedMedia = Object.fromEntries(
  Object.entries({
    mediaProvider: '',
    externalExerciseId: '',
    imageUrl: '',
    imageAlt: '',
    imageLicense: '',
    imageLicenseUrl: '',
    imageAuthor: '',
    imageAuthorUrl: '',
    imageSourceUrl: '',
    instructions: []
  }).map(([key, value]) => [`exercises.$[].${key}`, value])
);

async function main() {
  await connectDatabase();

  const exercises = await Exercise.updateMany({}, { $set: clearExerciseMedia });
  const templates = await WorkoutTemplate.updateMany({}, { $set: clearEmbeddedMedia });
  const workouts = await Workout.updateMany({}, { $set: clearEmbeddedMedia });

  console.log(JSON.stringify({
    exercises: exercises.modifiedCount,
    templates: templates.modifiedCount,
    workouts: workouts.modifiedCount
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
