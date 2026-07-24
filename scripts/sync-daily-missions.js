import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { weeklyDailyMissions } from '../src/data/weeklyDailyMissions.js';
import { seedDailyMissions } from '../src/services/seedDailyMissions.js';
import { DailyMission } from '../src/models/DailyMission.js';

async function main() {
  await connectDatabase();
  await seedDailyMissions();

  const missions = await DailyMission.find({ active: true }).sort({ dayIndex: 1 });

  console.table(missions.map((mission) => ({
    dia: mission.dayOfWeek,
    nome: mission.missionName,
    blocos: mission.blocks.map((block) => block.workoutCode).join(' + '),
    xp: mission.blocks.reduce((total, block) => total + Number(block.xpReward || 0), 0) + Number(mission.bonusXp || 0)
  })));
  console.log(`Campanha diaria sincronizada: ${missions.length}/${weeklyDailyMissions.length} dias.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
