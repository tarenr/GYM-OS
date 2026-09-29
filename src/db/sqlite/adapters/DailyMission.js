import { createModel } from '../queryEngine.js';

export const DailyMissionSqlite = createModel({
  table: 'daily_missions',
  timestamps: true,
  columns: {
    dayIndex: { column: 'day_index', type: 'integer', required: true },
    dayOfWeek: { column: 'day_of_week', type: 'text', required: true },
    missionName: { column: 'mission_name', type: 'text', required: true },
    intensity: { column: 'intensity', type: 'text', default: '' },
    blocks: { column: 'blocks', type: 'json', default: () => [] },
    bonusXp: { column: 'bonus_xp', type: 'integer', default: 0 },
    restDay: { column: 'rest_day', type: 'boolean', default: false },
    active: { column: 'active', type: 'boolean', default: true }
  }
});
