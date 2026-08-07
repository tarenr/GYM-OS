import { useEffect, useMemo, useState } from 'react';
import { Bar } from '../../../src/components/charts/bar';
import { BarChart } from '../../../src/components/charts/bar-chart';
import { Grid } from '../../../src/components/charts/grid';
import { Line, LineChart } from '../../../src/components/charts/line-chart';
import { ChartTooltip } from '../../../src/components/charts/tooltip';
import { BarXAxis } from '../../../src/components/charts/bar-x-axis';
import { XAxis } from '../../../src/components/charts/x-axis';

type SetEntry = {
  weight?: number;
  reps?: number;
};

type ExerciseEntry = {
  name: string;
  muscleGroup?: string;
  category?: string;
  source?: string;
  skipped?: boolean;
  plannedSets?: number;
  completedSets?: number;
  sets?: SetEntry[];
};

type Workout = {
  _id: string;
  date: string;
  workoutCode?: string;
  workoutName?: string;
  missionOriginalWorkoutCode?: string;
  missionSubstitution?: boolean;
  durationMinutes?: number;
  exercises?: ExerciseEntry[];
  xp?: {
    execution?: number;
    campaign?: number;
    total?: number;
  };
  totalVolume?: number;
};

type Template = {
  _id: string;
  code: string;
  name: string;
  exercises?: ExerciseEntry[];
};

type DailyMission = {
  _id: string;
  dayIndex: number;
  dayOfWeek: string;
  missionName: string;
  restDay: boolean;
  intensity?: string;
  bonusXp?: number;
  blocks?: Array<{
    type: string;
    workoutCode: string;
    workoutName: string;
    xpReward?: number;
  }>;
};

type BodyMeasurement = {
  _id: string;
  measuredAt: string;
  weightKg?: number;
  measurementsCm?: Record<string, number>;
};

type LabData = {
  workouts: Workout[];
  templates: Template[];
  missions: DailyMission[];
  bodyMeasurements: BodyMeasurement[];
};

const fallbackData: LabData = {
  workouts: [],
  templates: [],
  missions: [],
  bodyMeasurements: []
};

const weekOrder = [1, 2, 3, 4, 5, 6, 0];
const journeyStart = new Date('2026-08-01T00:00:00');
const annualDays = 365;
const levelRanks = [
  { min: 1, name: 'Noob Protocol', short: 'NOOB' },
  { min: 5, name: 'Apprentice Operator', short: 'APP' },
  { min: 10, name: 'Iron Initiate', short: 'IRON' },
  { min: 20, name: 'Academy Slayer', short: 'SLAYER' }
];

function toDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit'
  }).format(value instanceof Date ? value : new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value || 0));
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(Math.round(value || 0));
}

function getMonday(date = new Date()) {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getSetVolume(set: SetEntry) {
  return Number(set.weight || 0) * Number(set.reps || 0);
}

function getExerciseVolume(exercise: ExerciseEntry) {
  return (exercise.sets || []).reduce((total, set) => total + getSetVolume(set), 0);
}

function getWorkoutVolume(workout: Workout) {
  if (Number(workout.totalVolume || 0) > 0) {
    return Number(workout.totalVolume);
  }

  return (workout.exercises || []).reduce((total, exercise) => total + getExerciseVolume(exercise), 0);
}

function getValidSets(workout: Workout) {
  return (workout.exercises || []).reduce((total, exercise) => {
    if (exercise.skipped) return total;
    return total + (exercise.sets || []).filter((set) => Number(set.reps || 0) > 0).length;
  }, 0);
}

function isCompletedWorkout(workout: Workout) {
  return getValidSets(workout) > 0 || Number(workout.xp?.total || 0) > 0;
}

function getXp(workout: Workout) {
  return Number(workout.xp?.total || workout.xp?.execution || 0);
}

function calculateLevel(totalXp: number) {
  let level = 1;
  let remaining = totalXp;
  let nextLevelXp = 100 + level * 50;

  while (remaining >= nextLevelXp) {
    remaining -= nextLevelXp;
    level += 1;
    nextLevelXp = 100 + level * 50;
  }

  return {
    level,
    currentXp: remaining,
    nextLevelXp,
    progress: Math.min(100, Math.round((remaining / nextLevelXp) * 100))
  };
}

function getRank(level: number) {
  return [...levelRanks].reverse().find((rank) => level >= rank.min) || levelRanks[0];
}

function getJourneyPosition(today = new Date()) {
  const current = new Date(today);
  current.setHours(0, 0, 0, 0);
  const days = Math.floor((current.getTime() - journeyStart.getTime()) / 86400000) + 1;
  const safeDay = Math.max(1, days);
  const week = Math.max(1, Math.ceil(safeDay / 7));
  const cycle = Math.max(1, Math.ceil(week / 4));

  return {
    day: safeDay,
    week,
    cycle,
    label: `T1 C${cycle}`,
    annualPercent: Math.min(100, Math.round((safeDay / annualDays) * 100))
  };
}

function getCurrentStreak(workouts: Workout[]) {
  const trainedDates = new Set(workouts.filter(isCompletedWorkout).map((workout) => toDateKey(workout.date)));
  let cursor = new Date();
  let streak = 0;
  cursor.setHours(0, 0, 0, 0);

  for (let attempts = 0; attempts < 45; attempts += 1) {
    if (cursor.getDay() === 0) {
      cursor = addDays(cursor, -1);
      continue;
    }

    if (!trainedDates.has(toDateKey(cursor))) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function getWeekDateForMission(dayIndex: number, monday = getMonday()) {
  const offset = dayIndex === 0 ? 6 : dayIndex - 1;
  return addDays(monday, offset);
}

function getWorkoutForMission(workouts: Workout[], mission: DailyMission, dateKey: string) {
  const requiredCodes = new Set((mission.blocks || []).filter((block) => block.type !== 'recovery').map((block) => block.workoutCode));
  return workouts.find((workout) => {
    const workoutKey = toDateKey(workout.missionDate || workout.date);
    return workoutKey === dateKey && requiredCodes.has(String(workout.missionOriginalWorkoutCode || workout.workoutCode));
  });
}

function getWeeklyTrend(workouts: Workout[], count = 12) {
  const monday = getMonday();

  return Array.from({ length: count }, (_, index) => {
    const start = addDays(monday, -(count - 1 - index) * 7);
    const end = addDays(start, 7);
    const weekWorkouts = workouts.filter((workout) => {
      const date = new Date(workout.date);
      return date >= start && date < end && isCompletedWorkout(workout);
    });

    return {
      date: start,
      label: formatDate(start),
      volume: weekWorkouts.reduce((total, workout) => total + getWorkoutVolume(workout), 0),
      workouts: weekWorkouts.length,
      xp: weekWorkouts.reduce((total, workout) => total + getXp(workout), 0)
    };
  });
}

function getMuscleSplit(workouts: Workout[]) {
  const volumes = new Map<string, number>();

  workouts.filter(isCompletedWorkout).forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      const volume = getExerciseVolume(exercise);
      const muscle = exercise.muscleGroup || exercise.category || 'Other';
      if (volume > 0) {
        volumes.set(muscle, (volumes.get(muscle) || 0) + volume);
      }
    });
  });

  return [...volumes.entries()]
    .map(([name, volume]) => ({ name, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8);
}

function getTopRecords(workouts: Workout[]) {
  const records = new Map<string, { name: string; muscle: string; weight: number; reps: number; date: string; code: string; volume: number }>();

  workouts.filter(isCompletedWorkout).forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      if (exercise.skipped) return;
      (exercise.sets || []).forEach((set) => {
        const weight = Number(set.weight || 0);
        const reps = Number(set.reps || 0);
        if (weight <= 0 || reps <= 0) return;

        const current = records.get(exercise.name);
        const volume = weight * reps;
        if (!current || weight > current.weight || (weight === current.weight && reps > current.reps)) {
          records.set(exercise.name, {
            name: exercise.name,
            muscle: exercise.muscleGroup || exercise.category || 'Other',
            weight,
            reps,
            date: workout.date,
            code: workout.workoutCode || '-',
            volume
          });
        }
      });
    });
  });

  return [...records.values()]
    .sort((a, b) => b.weight - a.weight || b.reps - a.reps || b.volume - a.volume)
    .slice(0, 5);
}

function getMonthlyPrs(workouts: Workout[]) {
  const now = new Date();
  return getTopRecords(workouts).filter((record) => {
    const date = new Date(record.date);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;
}

function getQuality(workout: Workout) {
  const planned = (workout.exercises || []).reduce((total, exercise) => total + Number(exercise.plannedSets || 0), 0);
  const completed = (workout.exercises || []).reduce((total, exercise) => total + (exercise.skipped ? 0 : (exercise.sets || []).length), 0);
  return planned ? Math.min(100, Math.round((completed / planned) * 100)) : isCompletedWorkout(workout) ? 100 : 0;
}

function getBodyDelta(measurements: BodyMeasurement[], field: 'weightKg' | 'waist') {
  const sorted = [...measurements].sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime());
  const first = sorted[0];
  const last = sorted.at(-1);
  if (!first || !last) return 0;
  const firstValue = field === 'weightKg' ? Number(first.weightKg || 0) : Number(first.measurementsCm?.waist || 0);
  const lastValue = field === 'weightKg' ? Number(last.weightKg || 0) : Number(last.measurementsCm?.waist || 0);
  return lastValue - firstValue;
}

function useDashboardData() {
  const [data, setData] = useState<LabData>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const [workouts, templates, missions, bodyMeasurements] = await Promise.all([
          fetch('/api/workouts').then((response) => response.json()),
          fetch('/api/templates').then((response) => response.json()),
          fetch('/api/daily-missions').then((response) => response.json()),
          fetch('/api/body-measurements').then((response) => response.json())
        ]);

        if (alive) {
          setData({ workouts, templates, missions, bodyMeasurements });
          setError('');
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Could not load dashboard data.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  return { data, loading, error };
}

function Panel({
  icon,
  title,
  badge,
  children,
  className = ''
}: {
  icon: string;
  title: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`lab-panel ${className}`}>
      <div className="lab-panel-heading">
        <div>
          <span className="panel-icon">{icon}</span>
          <h2>{title}</h2>
        </div>
        {badge ? <strong>{badge}</strong> : null}
      </div>
      {children}
    </article>
  );
}

export default function App() {
  const { data, loading, error } = useDashboardData();
  const dashboard = useMemo(() => {
    const workouts = [...data.workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const completedWorkouts = workouts.filter(isCompletedWorkout);
    const monday = getMonday();
    const weeklyWorkouts = completedWorkouts.filter((workout) => new Date(workout.date) >= monday);
    const totalVolume = completedWorkouts.reduce((total, workout) => total + getWorkoutVolume(workout), 0);
    const weeklyVolume = weeklyWorkouts.reduce((total, workout) => total + getWorkoutVolume(workout), 0);
    const totalXp = completedWorkouts.reduce((total, workout) => total + getXp(workout), 0);
    const level = calculateLevel(totalXp);
    const rank = getRank(level.level);
    const journey = getJourneyPosition();
    const streak = getCurrentStreak(completedWorkouts);
    const trend = getWeeklyTrend(completedWorkouts);
    const muscleSplit = getMuscleSplit(completedWorkouts);
    const topRecords = getTopRecords(completedWorkouts);
    const todayIndex = new Date().getDay();
    const todayMission = data.missions.find((mission) => mission.dayIndex === todayIndex);
    const todayKey = toDateKey(new Date());
    const todayWorkout = todayMission ? getWorkoutForMission(completedWorkouts, todayMission, todayKey) : undefined;
    const schedule = [...data.missions]
      .sort((a, b) => weekOrder.indexOf(a.dayIndex) - weekOrder.indexOf(b.dayIndex))
      .map((mission) => {
        const date = getWeekDateForMission(mission.dayIndex, monday);
        const dateKey = toDateKey(date);
        const workout = getWorkoutForMission(completedWorkouts, mission, dateKey);
        return {
          mission,
          date,
          dateKey,
          workout,
          state: mission.restDay ? 'rest' : workout ? 'done' : dateKey === todayKey ? 'today' : dateKey < todayKey ? 'missed' : 'pending',
          code: mission.restDay ? 'DESC' : mission.blocks?.find((block) => block.type !== 'recovery')?.workoutCode || '-'
        };
      });
    const completedWeekBlocks = schedule.filter((item) => !item.mission.restDay && item.workout).length;
    const requiredWeekBlocks = schedule.filter((item) => !item.mission.restDay).length;
    const latestBody = [...data.bodyMeasurements].sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())[0];
    const templateSummary = data.templates
      .filter((template) => ['A', 'B', 'C'].includes(template.code))
      .map((template) => ({
        code: template.code,
        name: template.name,
        exercises: template.exercises?.length || 0,
        categories: [...new Set((template.exercises || []).map((exercise) => exercise.category || exercise.muscleGroup || 'Other'))].slice(0, 4)
      }));

    return {
      workouts,
      completedWorkouts,
      weeklyWorkouts,
      totalVolume,
      weeklyVolume,
      totalXp,
      level,
      rank,
      journey,
      streak,
      trend,
      muscleSplit,
      topRecords,
      monthlyPrs: getMonthlyPrs(completedWorkouts),
      todayMission,
      todayWorkout,
      schedule,
      completedWeekBlocks,
      requiredWeekBlocks,
      latestBody,
      templateSummary,
      weightDelta: getBodyDelta(data.bodyMeasurements, 'weightKg'),
      waistDelta: getBodyDelta(data.bodyMeasurements, 'waist')
    };
  }, [data]);

  const weekPercent = dashboard.requiredWeekBlocks
    ? Math.round((dashboard.completedWeekBlocks / dashboard.requiredWeekBlocks) * 100)
    : 0;
  const bestWeek = [...dashboard.trend].sort((a, b) => b.volume - a.volume)[0];
  const lastWeek = dashboard.trend.at(-1);
  const totalTrendVolume = dashboard.trend.reduce((total, week) => total + week.volume, 0);
  const muscleTotal = dashboard.muscleSplit.reduce((total, item) => total + item.volume, 0);
  const activeDays = new Set(dashboard.completedWorkouts.map((workout) => toDateKey(workout.date)));
  const heatmapDays = Array.from({ length: 28 }, (_, index) => {
    const date = addDays(new Date(), index - 24);
    const key = toDateKey(date);
    return {
      key,
      label: date.getDate(),
      className: key === toDateKey(new Date()) ? 'today' : activeDays.has(key) ? 'done' : key > toDateKey(new Date()) ? 'future' : 'missed'
    };
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="dashboard-lab-shell">
        <header className="fighter-card-lab">
          <div>
            <span className="brand-mark">&lt;GO&gt;</span>
            <div>
              <h1>GYM<span>-OS</span></h1>
              <p>PLAYER: TAREN / {dashboard.rank.short} | {dashboard.journey.label} / DASHBOARD LAB</p>
            </div>
          </div>
          <aside>
            <div className="streak-box">
              <span>Streak</span>
              <strong>{dashboard.streak}</strong>
              <small>days</small>
            </div>
            <div className="level-box" style={{ '--level-progress': `${dashboard.level.progress}%` } as React.CSSProperties}>
              <strong>{dashboard.level.level}</strong>
              <span>LV.</span>
            </div>
            <a href="/">Back to app</a>
          </aside>
        </header>

        {error ? <p className="status-banner error">{error}</p> : null}
        {loading ? <p className="status-banner">Loading live GYM-OS data...</p> : null}

        <section className="hud-grid">
          {[
            ['DAY', 'JOURNEY DAY', String(dashboard.journey.day), `${dashboard.journey.week} week | ${dashboard.journey.annualPercent}% year`, 'green'],
            ['XP', 'XP LEVEL', `LV. ${dashboard.level.level}`, `${dashboard.level.currentXp} / ${dashboard.level.nextLevelXp} XP`, 'orange'],
            ['OK', 'TOTAL WORKOUTS', String(dashboard.completedWorkouts.length), `${dashboard.weeklyWorkouts.length} this week`, 'green'],
            ['KG', 'VOLUME TOTAL', formatCompact(dashboard.totalVolume), `${formatCompact(dashboard.weeklyVolume)} kg week`, 'blue'],
            ['PR', 'PRS THIS MONTH', String(dashboard.monthlyPrs), 'current month', 'red']
          ].map(([icon, label, value, note, tone]) => (
            <article className={`hud-card ${tone}`} key={label}>
              <div><span>{icon}</span><em>{note}</em></div>
              <small>{label}</small>
              <strong>{value}</strong>
              {label === 'XP LEVEL' ? <i><b style={{ width: `${dashboard.level.progress}%` }} /></i> : null}
            </article>
          ))}
        </section>

        <nav className="lab-subnav" aria-label="Dashboard sections">
          <a href="#operations">OP Operations & Today</a>
          <a href="#analytics">AN Performance & Metrics</a>
          <a href="#evolution">EV Evolution & Progress</a>
          <a href="#logs">LG Activity Logs & Feed</a>
        </nav>

        <section className="dashboard-section" id="operations">
          <Panel icon="!" title="CAMPAIGN_TODAY.exe" badge={dashboard.todayWorkout ? 'DONE' : dashboard.todayMission?.restDay ? 'RECOVERY' : 'CAMPAIGN'} className="mission-panel">
            <div className="mission-command">
              <h3>{dashboard.todayMission?.missionName || 'Campaign not configured'}</h3>
              <p>
                {dashboard.todayMission?.restDay
                  ? 'Recovery scheduled. The Academy sequence stays preserved.'
                  : dashboard.todayWorkout
                    ? `${dashboard.todayWorkout.workoutCode} completed with ${getValidSets(dashboard.todayWorkout)} valid sets.`
                    : `${dashboard.todayMission?.intensity || 'Today protocol is waiting for execution.'}`}
              </p>
              <ul>
                {(dashboard.todayMission?.blocks || []).map((block) => (
                  <li className={dashboard.todayWorkout || dashboard.todayMission?.restDay ? 'done' : 'pending'} key={`${block.type}-${block.workoutCode}`}>
                    {block.type.toUpperCase()}: {block.workoutCode} {block.workoutName}
                  </li>
                ))}
              </ul>
              <div className="reward-box">
                <span>REWARD</span>
                <strong>{dashboard.todayMission?.restDay ? '+0 XP' : `+${(dashboard.todayMission?.blocks || []).reduce((total, block) => total + Number(block.xpReward || 0), Number(dashboard.todayMission?.bonusXp || 0))} XP`}</strong>
              </div>
            </div>
          </Panel>

          <Panel icon="#" title="WEEKLY_SCHEDULE.sys" badge="CURRENT WEEK" className="schedule-panel">
            <div className="schedule-grid">
              {dashboard.schedule.map((item) => (
                <article className={`schedule-day ${item.state}`} key={item.dateKey}>
                  <span>{item.mission.dayOfWeek.slice(0, 3)}</span>
                  <strong>{item.date.getDate()}</strong>
                  <div>{item.code}</div>
                  <small>{item.mission.restDay ? 'Rest' : item.workout ? '1 of 1 blocks' : '0 of 1 blocks'}</small>
                </article>
              ))}
            </div>
            <div className="weekly-focus">
              <div>
                <span>WEEK_OBJECTIVE</span>
                <strong>{dashboard.completedWeekBlocks}/{dashboard.requiredWeekBlocks} planned workouts</strong>
                <p>{weekPercent}% of weekly campaign | {dashboard.requiredWeekBlocks - dashboard.completedWeekBlocks} open blocks</p>
              </div>
              <i><b style={{ width: `${weekPercent}%` }} /></i>
            </div>
          </Panel>

          <Panel icon="OS" title="JOURNEY_COMMAND.sys" badge={dashboard.journey.label} className="journey-panel">
            <div className="journey-grid">
              {[
                ['YEAR', 'Annual journey', `Day ${dashboard.journey.day}/${annualDays}`, `${dashboard.journey.annualPercent}% of year`],
                ['WEEK', 'Week', `${dashboard.completedWeekBlocks}/${dashboard.requiredWeekBlocks}`, `${dashboard.requiredWeekBlocks - dashboard.completedWeekBlocks} open blocks`],
                ['QUAL', 'Execution', `${dashboard.weeklyWorkouts.length ? Math.round(dashboard.weeklyWorkouts.reduce((total, workout) => total + getQuality(workout), 0) / dashboard.weeklyWorkouts.length) : 0}%`, 'weekly average'],
                ['CYCLE', 'Current cycle', `C${dashboard.journey.cycle}`, `${formatCompact(dashboard.weeklyVolume)} kg week`],
                ['MODE', 'Journey health', dashboard.completedWeekBlocks ? 'On pace' : 'Open', `${formatCompact(dashboard.totalXp)} XP total`],
                ['BODY', 'Body evolution', dashboard.latestBody?.weightKg ? `${dashboard.latestBody.weightKg} kg` : '-', dashboard.latestBody ? formatDate(dashboard.latestBody.measuredAt) : 'log first measurement']
              ].map(([code, label, value, detail]) => (
                <article key={code}>
                  <span>{code}</span>
                  <small>{label}</small>
                  <strong>{value}</strong>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </Panel>

          <Panel icon="~" title="ACTIVITY_HEATMAP.sys" badge="LAST 28 DAYS" className="heatmap-panel">
            <div className="heatmap-grid">
              {heatmapDays.map((day) => (
                <span className={day.className} key={day.key} title={day.key}>{day.label}</span>
              ))}
            </div>
            <div className="heatmap-legend">
              <span><i className="done" /> OK</span>
              <span><i className="today" /> Today</span>
              <span><i className="missed" /> Missed</span>
              <span><i className="future" /> Future</span>
            </div>
          </Panel>
        </section>

        <section className="dashboard-section analytics-layout" id="analytics">
          <Panel icon="*" title="PLAYER_STATS.json" badge={`LV. ${dashboard.level.level}`} className="player-panel">
            <div className="player-card-lab">
              <div className="level-disc" style={{ '--level-progress': `${dashboard.level.progress}%` } as React.CSSProperties}>
                <strong>{dashboard.level.level}</strong>
              </div>
              <div>
                <span>Current Rank</span>
                <h3>{dashboard.rank.name}</h3>
                <i><b style={{ width: `${dashboard.level.progress}%` }} /></i>
                <p>{dashboard.level.currentXp} / {dashboard.level.nextLevelXp} XP | {dashboard.level.progress}% until next level</p>
                <div className="player-chip-grid">
                  <article><span>Streak</span><strong>{dashboard.streak}d</strong><p>current streak</p></article>
                  <article><span>Week</span><strong>{dashboard.weeklyWorkouts.length}/6</strong><p>valid workouts</p></article>
                  <article><span>Volume</span><strong>{formatCompact(dashboard.weeklyVolume)} kg</strong><p>weekly load</p></article>
                  <article><span>XP Total</span><strong>{formatCompact(dashboard.totalXp)}</strong><p>official season</p></article>
                </div>
              </div>
            </div>
          </Panel>

          <Panel icon="^" title="TOP_PRS.json" badge="TOP 5" className="pr-panel">
            <div className="pr-list">
              {dashboard.topRecords.length ? dashboard.topRecords.map((record, index) => (
                <article key={record.name}>
                  <span>#{index + 1}</span>
                  <div>
                    <h3>{record.name}</h3>
                    <p>{record.muscle} | Workout {record.code} | {formatDate(record.date)}</p>
                  </div>
                  <strong>{record.weight} kg <small>{record.reps} reps</small></strong>
                </article>
              )) : <p className="empty-state">Log sets with load to map your PRs.</p>}
            </div>
          </Panel>

          <Panel icon="~" title="VOLUME_TREND.chart" badge="12 WEEKS" className="volume-panel">
            <div className="lab-chart-frame tall">
              <LineChart data={dashboard.trend} margin={{ top: 28, right: 24, bottom: 42, left: 36 }}>
                <Grid horizontal vertical stroke="rgba(99, 255, 154, 0.14)" />
                <Line dataKey="volume" stroke="var(--chart-line-primary)" strokeWidth={3} />
                <Line dataKey="xp" stroke="var(--chart-line-secondary)" strokeWidth={2} yAxisId="xp" />
                <XAxis />
                <ChartTooltip />
              </LineChart>
            </div>
            <div className="metric-strip">
              <article><span>Total 12 weeks</span><strong>{formatCompact(totalTrendVolume)} kg</strong><small>{dashboard.trend.filter((week) => week.volume > 0).length} active weeks</small></article>
              <article><span>Best week</span><strong>{bestWeek?.label || '-'}</strong><small>{formatCompact(bestWeek?.volume || 0)} kg</small></article>
              <article><span>Current week</span><strong>{formatCompact(lastWeek?.volume || 0)} kg</strong><small>{lastWeek?.workouts || 0} workouts</small></article>
            </div>
          </Panel>

          <Panel icon="%" title="MUSCLE_DISTRIBUTION.data" badge="BY VOLUME" className="muscle-panel">
            <div className="lab-chart-frame compact">
              <BarChart data={dashboard.muscleSplit} xDataKey="name" margin={{ top: 26, right: 18, bottom: 48, left: 30 }} barGap={0.26}>
                <Grid horizontal stroke="rgba(38, 217, 255, 0.13)" />
                <Bar dataKey="volume" fill="var(--chart-line-secondary)" lineCap="round" />
                <BarXAxis />
                <ChartTooltip />
              </BarChart>
            </div>
            <div className="muscle-list">
              {dashboard.muscleSplit.map((item) => {
                const percent = Math.round((item.volume / Math.max(1, muscleTotal)) * 100);
                return (
                  <article key={item.name}>
                    <div><span>{item.name}</span><strong>{percent}%</strong></div>
                    <small>{formatCompact(item.volume)} kg of {formatCompact(muscleTotal)} kg</small>
                    <i><b style={{ width: `${percent}%` }} /></i>
                  </article>
                );
              })}
            </div>
          </Panel>
        </section>

        <section className="dashboard-section evolution-layout" id="evolution">
          <Panel icon="S" title="SEASON_PROGRESS.sys" badge={dashboard.journey.label}>
            <div className="season-grid">
              {[
                ['Annual journey', `${dashboard.journey.annualPercent}%`, dashboard.journey.annualPercent, `Week ${dashboard.journey.week}`],
                ['Current week', `${weekPercent}%`, weekPercent, `${dashboard.completedWeekBlocks}/${dashboard.requiredWeekBlocks} blocks`],
                ['XP progress', `${dashboard.level.progress}%`, dashboard.level.progress, `LV. ${dashboard.level.level}`],
                ['Body log', `${data.bodyMeasurements.length}`, Math.min(100, data.bodyMeasurements.length * 20), 'measurements']
              ].map(([label, value, percent, detail]) => (
                <article key={String(label)}>
                  <div><span>{label}</span><strong>{value}</strong></div>
                  <i><b style={{ width: `${percent}%` }} /></i>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </Panel>

          <Panel icon="KG" title="BODY_PROGRESS.sys" badge={`${data.bodyMeasurements.length} REG`}>
            <div className="body-grid">
              <article><span>Current weight</span><strong>{dashboard.latestBody?.weightKg ? `${dashboard.latestBody.weightKg} kg` : '-'}</strong><p>{dashboard.weightDelta <= 0 ? '' : '+'}{dashboard.weightDelta.toFixed(1)} kg vs first log</p></article>
              <article><span>Waist</span><strong>{dashboard.latestBody?.measurementsCm?.waist ? `${dashboard.latestBody.measurementsCm.waist} cm` : '-'}</strong><p>{dashboard.waistDelta <= 0 ? '' : '+'}{dashboard.waistDelta.toFixed(1)} cm vs first log</p></article>
              <article><span>Latest measure</span><strong>{dashboard.latestBody ? formatDate(dashboard.latestBody.measuredAt) : '-'}</strong><p>next measurement enables trend comparison</p></article>
            </div>
          </Panel>

          <Panel icon="TPL" title="TEMPLATE_STATUS.sys" badge="A/B/C">
            <div className="template-grid">
              {dashboard.templateSummary.map((template) => (
                <article key={template.code}>
                  <span>Workout {template.code}</span>
                  <strong>{template.name}</strong>
                  <p>{template.exercises} exercises | {template.categories.join(' + ')}</p>
                </article>
              ))}
            </div>
          </Panel>
        </section>

        <section className="dashboard-section logs-layout" id="logs">
          <Panel icon=">" title="ACTIVITY_FEED.stream" badge="RECENT" className="feed-panel">
            <div className="feed-list">
              {dashboard.completedWorkouts.slice(0, 8).map((workout) => (
                <article key={workout._id}>
                  <span>{workout.missionSubstitution ? 'SWAP' : 'MISSION'}</span>
                  <div>
                    <h3>{workout.missionSubstitution ? 'Workout replaced mission' : 'Mission completed'}</h3>
                    <p>Workout {workout.workoutCode} - {workout.workoutName}</p>
                    <small>{getQuality(workout)}% quality | {getValidSets(workout)} sets | {formatCompact(getWorkoutVolume(workout))} kg</small>
                  </div>
                  <time>{formatDate(workout.date)}</time>
                </article>
              ))}
            </div>
          </Panel>

          <Panel icon="#" title="LOG_HISTORY.db" badge="LAST 4" className="history-panel">
            <div className="history-list">
              {dashboard.completedWorkouts.slice(0, 4).map((workout) => (
                <article key={workout._id}>
                  <div><span>{workout.missionSubstitution ? 'SWAP' : 'MISSION'}</span><time>{formatDate(workout.date)}</time></div>
                  <h3>Workout {workout.workoutCode}</h3>
                  <p>{workout.workoutName}</p>
                  <footer><strong>{formatCompact(getWorkoutVolume(workout))} kg</strong><small>{getValidSets(workout)} sets | {Number(workout.durationMinutes || 0) || 'logs'} min</small></footer>
                </article>
              ))}
            </div>
          </Panel>

          <Panel icon="*" title="WEEKLY_MISSIONS.sys" badge={`${dashboard.completedWeekBlocks}/${dashboard.requiredWeekBlocks}`}>
            <div className="weekly-missions">
              {dashboard.schedule.filter((item) => !item.mission.restDay).map((item) => (
                <article className={item.workout ? 'done' : 'pending'} key={item.dateKey}>
                  <div>
                    <h3>Complete Workout {item.code}</h3>
                    <p>{item.mission.missionName} | {formatDate(item.date)}</p>
                    <i><b style={{ width: item.workout ? '100%' : '0%' }} /></i>
                  </div>
                  <strong>{item.workout ? 'OK' : '+180 XP'}</strong>
                </article>
              ))}
            </div>
          </Panel>
        </section>

        <footer className="terminal-footer-lab">
          <p><span>user@gym-os:~$</span> ./commit_gains --force --all</p>
          <p>[OK] Dashboard Lab rendered with Bklit charts. Current dashboard remains untouched.</p>
        </footer>
      </div>
    </main>
  );
}
