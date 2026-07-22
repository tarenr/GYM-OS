import { Router } from 'express';
import { linkExerciseMedia, searchExerciseMedia, syncExerciseMedia } from '../controllers/exerciseMediaController.js';

export const exerciseMediaRoutes = Router();

exerciseMediaRoutes.get('/search', searchExerciseMedia);
exerciseMediaRoutes.post('/link', linkExerciseMedia);
exerciseMediaRoutes.post('/sync', syncExerciseMedia);
