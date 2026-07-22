import { Router } from 'express';
import { getTodayMission, listDailyMissions } from '../controllers/dailyMissionController.js';

export const dailyMissionRoutes = Router();

dailyMissionRoutes.get('/', listDailyMissions);
dailyMissionRoutes.get('/today', getTodayMission);
