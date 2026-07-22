import { DailyMission } from '../models/DailyMission.js';

export async function listDailyMissions(request, response, next) {
  try {
    const missions = await DailyMission.find({ active: true }).sort({ dayIndex: 1 });
    response.json(missions);
  } catch (error) {
    next(error);
  }
}

export async function getTodayMission(request, response, next) {
  try {
    const dayIndex = new Date().getDay();
    const mission = await DailyMission.findOne({ dayIndex, active: true });

    if (!mission) {
      return response.status(404).json({ message: 'Missao diaria nao encontrada.' });
    }

    response.json(mission);
  } catch (error) {
    next(error);
  }
}
