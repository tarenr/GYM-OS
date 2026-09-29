import { defaultWorkoutTypes } from '../data/workoutTypes.js';
import { WorkoutTypeSqlite as WorkoutType } from '../db/sqlite/adapters/index.js';

export async function seedWorkoutTypes() {
  const operations = defaultWorkoutTypes.map((type) => ({
    updateOne: {
      filter: { code: type.code },
      update: {
        $set: {
          ...type,
          active: true
        }
      },
      upsert: true
    }
  }));

  if (operations.length > 0) {
    await WorkoutType.bulkWrite(operations);
  }
}
