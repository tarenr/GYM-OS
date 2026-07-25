import { weeklyDailyMissions } from '../data/weeklyDailyMissions.js';
import { DailyMission } from '../models/DailyMission.js';
import { WorkoutTemplate } from '../models/WorkoutTemplate.js';

function buildBlock(template, type, xpReward, intensity) {
  return {
    templateId: template?._id || null,
    type,
    modality: template?.workoutTypeCode || '',
    workoutCode: template?.code || '',
    workoutName: template?.name || '',
    intensity,
    xpReward
  };
}

export async function seedDailyMissions() {
  const templateCodes = weeklyDailyMissions.flatMap((mission) => (
    mission.restDay ? [] : [mission.strengthCode, mission.combatCode].filter(Boolean)
  ));
  const templates = await WorkoutTemplate.find({ code: { $in: templateCodes }, active: true });
  const templateByCode = new Map(templates.map((template) => [template.code, template]));

  const operations = weeklyDailyMissions.map((mission) => {
    const activeBlocks = [
      mission.strengthCode
        ? buildBlock(templateByCode.get(mission.strengthCode), 'strength', mission.strengthXp, mission.intensity)
        : null,
      mission.combatCode
        ? buildBlock(templateByCode.get(mission.combatCode), 'combat', mission.combatXp, mission.intensity)
        : null
    ].filter(Boolean);
    const blocks = mission.restDay
      ? [{
          templateId: null,
          type: 'recovery',
          modality: 'recovery',
          workoutCode: 'DESC',
          workoutName: 'Recovery',
          intensity: mission.intensity,
          xpReward: 0
        }]
      : activeBlocks;

    return {
      updateOne: {
        filter: { dayIndex: mission.dayIndex },
        update: {
          $set: {
            dayIndex: mission.dayIndex,
            dayOfWeek: mission.dayOfWeek,
            missionName: mission.missionName,
            intensity: mission.intensity,
            blocks,
            bonusXp: mission.bonusXp,
            restDay: Boolean(mission.restDay),
            active: true
          }
        },
        upsert: true
      }
    };
  });

  if (operations.length > 0) {
    await DailyMission.bulkWrite(operations);
  }
}
