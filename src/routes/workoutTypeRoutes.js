import { Router } from 'express';
import {
  createWorkoutType,
  deleteWorkoutType,
  getWorkoutType,
  listWorkoutTypes,
  updateWorkoutType
} from '../controllers/workoutTypeController.js';

export const workoutTypeRoutes = Router();

workoutTypeRoutes.get('/', listWorkoutTypes);
workoutTypeRoutes.get('/:id', getWorkoutType);
workoutTypeRoutes.post('/', createWorkoutType);
workoutTypeRoutes.put('/:id', updateWorkoutType);
workoutTypeRoutes.delete('/:id', deleteWorkoutType);
