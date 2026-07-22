import { Router } from 'express';
import { listExercises } from '../controllers/exerciseController.js';

export const exerciseRoutes = Router();

exerciseRoutes.get('/', listExercises);
