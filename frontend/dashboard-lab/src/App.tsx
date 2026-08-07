import { type CSSProperties, useEffect, useMemo, useState } from 'react';
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

export default function App() {
  const { data, loading, error } = useDashboardData();
  const [activeSubtab, setActiveSubtab] = useState<'operations' | 'analytics' | 'evolution' | 'logs'>('operations');
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
  const missionReward = dashboard.todayMission?.restDay
    ? 0
    : (dashboard.todayMission?.blocks || []).reduce(
        (total, block) => total + Number(block.xpReward || 0),
        Number(dashboard.todayMission?.bonusXp || 0)
      );
  const activeAverageVolume = dashboard.trend.filter((week) => week.volume > 0).length
    ? Math.round(totalTrendVolume / dashboard.trend.filter((week) => week.volume > 0).length)
    : 0;
  const recentWorkouts = dashboard.completedWorkouts.slice(0, 4);
  const weeklyQuality = dashboard.weeklyWorkouts.length
    ? Math.round(dashboard.weeklyWorkouts.reduce((total, workout) => total + getQuality(workout), 0) / dashboard.weeklyWorkouts.length)
    : 0;

  return (
    <>
      <div className="scanlines" aria-hidden="true"></div>
      <div className="app-layout dashboard-lab-layout">
        <aside className="side-nav" aria-label="Main menu">
          <div className="side-brand">
            <span>&lt;GO&gt;</span>
            <div>
              <strong>GYM-OS</strong>
              <small>DASHBOARD LAB // BKLIT</small>
            </div>
          </div>

          <nav className="side-menu" id="side-menu">
            <a className="nav-link active" href="/dashboard-lab/">Dashboard Lab</a>
            <a className="nav-link" href="/">Current App</a>
            <div className="nav-group">
              <span>Experiment</span>
              <button className="nav-link nav-subitem" type="button">Same UI</button>
              <button className="nav-link nav-subitem" type="button">Bklit charts</button>
            </div>
          </nav>
        </aside>

        <main className="app-shell">
          <header className="fighter-card">
            <div className="fc-left">
              <div className="fc-mark">&lt;GO&gt;</div>
              <div className="fc-title">
                <h1>GYM<span>-OS</span></h1>
                <p>PLAYER: TAREN &nbsp;/&nbsp; {dashboard.rank.short} | {dashboard.journey.label} &nbsp;/&nbsp; DASHBOARD LAB</p>
              </div>
            </div>
            <div className="fc-right">
              <div className="streak">
                <div className="eyebrow">Streak</div>
                <div className="num"><span>{dashboard.streak}</span><small>DIA</small></div>
              </div>
              <div className="lvl-badge">
                <svg viewBox="0 0 74 74">
                  <circle cx="37" cy="37" r="32" fill="none" stroke="var(--border)" strokeWidth="4" />
                  <circle
                    cx="37"
                    cy="37"
                    r="32"
                    fill="none"
                    stroke="var(--phosphor)"
                    strokeWidth="4"
                    strokeDasharray="201.1"
                    strokeDashoffset={201.1 * (1 - dashboard.level.progress / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <b>{dashboard.level.level}</b><span>LV.</span>
              </div>
            </div>
          </header>

          {error ? <p className="empty-state dashboard-lab-status">{error}</p> : null}
          {loading ? <p className="empty-state dashboard-lab-status">Loading live GYM-OS data...</p> : null}

          <section className="tab-view active" id="view-dashboard">
            <section className="dashboard-grid">
              <article className="stat-card stat-green">
                <div className="stat-top">
                  <span className="stat-icon">DAY</span>
                  <span className="stat-trend trend-up">{dashboard.journey.label}</span>
                </div>
                <span className="stat-label">JOURNEY DAY</span>
                <strong className="stat-value">{dashboard.journey.day}</strong>
                <span className="stat-note">Season 2026 | week {dashboard.journey.week}</span>
              </article>
              <article className="stat-card stat-orange">
                <div className="stat-top">
                  <span className="stat-icon">XP</span>
                  <span className="stat-trend trend-up">{dashboard.rank.short}</span>
                </div>
                <span className="stat-label">XP LEVEL</span>
                <strong className="stat-value">LV. {dashboard.level.level}</strong>
                <span className="rank-name">{dashboard.rank.name}</span>
                <div className="xp-bar" aria-label="XP progress">
                  <span style={{ width: `${dashboard.level.progress}%` }}></span>
                </div>
                <span className="stat-note">{dashboard.level.currentXp} / {dashboard.level.nextLevelXp} XP</span>
              </article>
              <article className="stat-card stat-green">
                <div className="stat-top">
                  <span className="stat-icon">OK</span>
                  <span className="stat-trend trend-up">+{dashboard.weeklyWorkouts.length} week</span>
                </div>
                <span className="stat-label">TOTAL WORKOUTS</span>
                <strong className="stat-value">{dashboard.completedWorkouts.length}</strong>
                <span className="stat-note">protocols completed</span>
              </article>
              <article className="stat-card stat-blue">
                <div className="stat-top">
                  <span className="stat-icon">KG</span>
                  <span className="stat-trend trend-up">+{formatCompact(dashboard.weeklyVolume)} kg week</span>
                </div>
                <span className="stat-label">VOLUME TOTAL</span>
                <strong className="stat-value">{formatCompact(dashboard.totalVolume)}</strong>
                <span className="stat-note">accumulated load</span>
              </article>
              <article className="stat-card stat-red">
                <div className="stat-top">
                  <span className="stat-icon">PR</span>
                  <span className="stat-trend trend-up">current month</span>
                </div>
                <span className="stat-label">PRS NO MES</span>
                <strong className="stat-value">{dashboard.monthlyPrs}</strong>
                <span className="stat-note">novos recordes</span>
              </article>
            </section>

            <nav className="dashboard-subnav" aria-label="Dashboard submenu">
              {[
                ['operations', 'OP', 'Operations & Today'],
                ['analytics', 'AN', 'Performance & Metrics'],
                ['evolution', 'EV', 'Evolution & Progress'],
                ['logs', 'LG', 'Activity Logs & Feed']
              ].map(([key, icon, label]) => (
                <button
                  className={`dash-subnav-btn ${activeSubtab === key ? 'active' : ''}`}
                  type="button"
                  data-dash-tab={key}
                  key={key}
                  onClick={() => setActiveSubtab(key as typeof activeSubtab)}
                >
                  <span className="dash-subnav-icon">{icon}</span> {label}
                </button>
              ))}
            </nav>

            <div className={`dashboard-subtab ${activeSubtab === 'operations' ? 'active' : ''}`} id="dash-subtab-operations">
              <section className="content-grid operations-grid">
                <article className="panel mission-panel hero-mission-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">!</span>
                      <h2>CAMPAIGN_TODAY.exe</h2>
                    </div>
                    <span className="panel-badge">{dashboard.todayWorkout ? 'DONE' : dashboard.todayMission?.restDay ? 'RECOVERY' : 'CAMPAIGN'}</span>
                  </div>

                  <div className="mission-body">
                    <h3>{dashboard.todayMission?.missionName || 'Campaign not configured'}</h3>
                    <p>
                      {dashboard.todayMission?.restDay
                        ? 'Recovery scheduled. The Academy sequence stays preserved.'
                        : dashboard.todayWorkout
                          ? `${dashboard.todayWorkout.workoutCode} completed with ${getValidSets(dashboard.todayWorkout)} valid sets.`
                          : dashboard.todayMission?.intensity || 'Today protocol is waiting for execution.'}
                    </p>
                    <ul className="mission-list">
                      {(dashboard.todayMission?.blocks || []).map((block, index) => (
                        <li className={dashboard.todayWorkout || dashboard.todayMission?.restDay ? 'done' : 'pending'} key={`${block.type}-${index}`}>
                          {block.type === 'recovery' ? 'Recovery scheduled' : `${block.type}: ${block.workoutCode} ${block.workoutName}`}
                        </li>
                      ))}
                    </ul>
                    <div className="mission-reward">
                      <span>REWARD</span>
                      <strong>+{missionReward} XP{dashboard.todayWorkout ? ' OK' : ''}</strong>
                    </div>
                    <div className="weekly-strip-header">
                      <span>WEEK_CAMPAIGN</span>
                      <strong>{dashboard.completedWeekBlocks}/{dashboard.requiredWeekBlocks}</strong>
                    </div>
                    <div className="weekly-map">
                      {dashboard.schedule.map((item) => (
                        <button
                          className={`week-node ${item.state} ${item.dateKey === toDateKey(new Date()) ? 'is-today selected' : ''}`}
                          type="button"
                          key={item.dateKey}
                          title={`${item.mission.missionName} | ${formatDate(item.date)}`}
                        >
                          <span>{item.mission.dayOfWeek.slice(0, 3)}</span>
                          <strong>{item.code}</strong>
                        </button>
                      ))}
                    </div>
                  </div>
                </article>

                <article className="panel schedule-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">#</span>
                      <h2>WEEKLY_SCHEDULE.sys</h2>
                    </div>
                    <span className="panel-badge">CURRENT WEEK</span>
                  </div>
                  <div className="schedule-grid">
                    {dashboard.schedule.map((item) => (
                      <article className={`schedule-day ${item.state}`} key={item.dateKey}>
                        <span className="schedule-day-name">{item.mission.dayOfWeek.slice(0, 3)}</span>
                        <strong>{item.date.getDate()}</strong>
                        <div className="schedule-code">{item.code}</div>
                        <small>{item.mission.restDay ? 'Rest' : item.workout ? '1 of 1 blocks' : '0 of 1 blocks'}</small>
                      </article>
                    ))}
                  </div>
                  <div className="weekly-focus-panel">
                    <div>
                      <span>WEEK_OBJECTIVE</span>
                      <strong>{dashboard.completedWeekBlocks}/{dashboard.requiredWeekBlocks} planned workouts</strong>
                      <p>{weekPercent}% of weekly campaign | next: {dashboard.schedule.find((item) => !item.mission.restDay && !item.workout)?.code || 'no pending blocks'}</p>
                    </div>
                    <div className="weekly-focus-meter" aria-label="Weekly progress">
                      <span style={{ width: `${weekPercent}%` }}></span>
                    </div>
                  </div>
                  <div className="weekly-summary-grid">
                    <article className="weekly-summary-card">
                      <span>SEMANA</span>
                      <strong>{dashboard.completedWeekBlocks}/{dashboard.requiredWeekBlocks}</strong>
                      <p>{weekPercent}% of weekly campaign</p>
                    </article>
                    <article className="weekly-summary-card">
                      <span>PROXIMO</span>
                      <strong>{dashboard.schedule.find((item) => !item.mission.restDay && !item.workout)?.code || 'DESC'}</strong>
                      <p>pending campaign block</p>
                    </article>
                    <article className="weekly-summary-card">
                      <span>STATUS</span>
                      <strong>{dashboard.requiredWeekBlocks - dashboard.completedWeekBlocks} open</strong>
                      <p>Sunday rest</p>
                    </article>
                  </div>
                </article>
              </section>

              <section className="journey-overview-grid">
                <section className="panel journey-command-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">OS</span>
                      <h2>JOURNEY_COMMAND.sys</h2>
                    </div>
                    <span className="panel-badge">{dashboard.journey.label}</span>
                  </div>
                  <div className="journey-command-grid">
                    {[
                      ['YEAR', 'Annual journey', `Dia ${dashboard.journey.day}/${annualDays}`, `Week ${dashboard.journey.week} | ${dashboard.journey.annualPercent}% of year`, 'green'],
                      ['WEEK', 'Week', `${dashboard.completedWeekBlocks}/${dashboard.requiredWeekBlocks}`, `Open blocks: ${dashboard.requiredWeekBlocks - dashboard.completedWeekBlocks}`, 'blue'],
                      ['QUAL', 'Execucao', `${weeklyQuality}%`, `${dashboard.weeklyWorkouts.length} workouts this week`, weeklyQuality >= 80 ? 'green' : 'orange'],
                      ['CYCLE', 'Current cycle', `C${dashboard.journey.cycle}`, `${formatCompact(dashboard.weeklyVolume)} kg week`, 'purple'],
                      ['MODE', 'Journey health', dashboard.completedWeekBlocks ? 'On pace' : 'Open', `XP total ${formatCompact(dashboard.totalXp)}`, 'green'],
                      ['BODY', 'Body evolution', dashboard.latestBody?.weightKg ? `${dashboard.latestBody.weightKg} kg` : '-', dashboard.latestBody ? formatDate(dashboard.latestBody.measuredAt) : 'log first measurement', 'orange']
                    ].map(([code, label, value, detail, tone]) => (
                      <article className={`journey-command-card ${tone}`} key={code}>
                        <span>{code}</span>
                        <div>
                          <small>{label}</small>
                          <strong>{value}</strong>
                          <p>{detail}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel heatmap-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">~</span>
                      <h2>ACTIVITY_HEATMAP.sys</h2>
                    </div>
                    <span className="panel-badge">LAST 28 DAYS</span>
                  </div>
                  <div className="heatmap-scroll">
                    <div className="heatmap-grid dashboard-lab-heatmap">
                      {heatmapDays.map((day) => (
                        <span className={`heat-cell ${day.className}`} key={day.key} title={day.key}>{day.label}</span>
                      ))}
                    </div>
                  </div>
                  <div className="heatmap-legend">
                    <span><i className="heat-future"></i> Future</span>
                    <span><i className="heat-today"></i> Today</span>
                    <span><i className="heat-missed"></i> Missed</span>
                    <span><i className="heat-complete"></i> OK</span>
                  </div>
                </section>
              </section>
            </div>

            <div className={`dashboard-subtab ${activeSubtab === 'analytics' ? 'active' : ''}`} id="dash-subtab-analytics">
              <section className="content-grid dashboard-control-grid analytics-panel-grid">
                <article className="panel player-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">*</span>
                      <h2>PLAYER_STATS.json</h2>
                    </div>
                    <span className="panel-badge">LV. {dashboard.level.level}</span>
                  </div>
                  <div className="player-card">
                    <div className="level-ring" aria-label="XP progress">
                      <svg width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
                        <circle className="level-ring-bg" cx="46" cy="46" r="39"></circle>
                        <circle
                          className="level-ring-progress"
                          cx="46"
                          cy="46"
                          r="39"
                          style={{ strokeDashoffset: `${245 - (245 * dashboard.level.progress) / 100}` }}
                        ></circle>
                      </svg>
                      <strong>{dashboard.level.level}</strong>
                    </div>
                    <div className="player-info">
                      <span>Current Rank</span>
                      <h3>{dashboard.rank.name}</h3>
                      <div className="xp-bar player-xp-bar">
                        <span style={{ width: `${dashboard.level.progress}%` }}></span>
                      </div>
                      <p>{dashboard.level.currentXp} / {dashboard.level.nextLevelXp} XP | {dashboard.level.progress}% until next level</p>
                      <div className="player-stat-grid">
                        {[
                          ['Streak', `${dashboard.streak}d`, 'current streak'],
                          ['Week', `${dashboard.weeklyWorkouts.length}/6`, 'valid workouts'],
                          ['Volume', `${formatCompact(dashboard.weeklyVolume)} kg`, 'weekly load'],
                          ['XP Total', formatCompact(dashboard.totalXp), 'official season']
                        ].map(([label, value, detail]) => (
                          <article className="player-stat-chip" key={label}>
                            <span>{label}</span>
                            <strong>{value}</strong>
                            <p>{detail}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>

                <article className="panel pr-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">^</span>
                      <h2>TOP_PRS.json</h2>
                    </div>
                    <span className="panel-badge">TOP 5</span>
                  </div>
                  <div className="pr-list">
                    {dashboard.topRecords.length ? dashboard.topRecords.map((record, index) => (
                      <article className="pr-item" key={record.name}>
                        <span className="pr-rank">#{index + 1}</span>
                        <div className="pr-main">
                          <h3>{record.name}</h3>
                          <p>{record.muscle} | Workout {record.code} | {formatDate(record.date)}</p>
                        </div>
                        <div className="pr-value">
                          <strong>{record.weight} kg</strong>
                          <span>{formatNumber(record.reps)} reps</span>
                        </div>
                      </article>
                    )) : <p className="empty-state">Log sets with load to map your PRs.</p>}
                  </div>
                </article>
              </section>

              <section className="content-grid analytics-grid analytics-panel-grid">
                <article className="panel volume-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">~</span>
                      <h2>VOLUME_TREND.chart</h2>
                    </div>
                    <span className="panel-badge">12 WEEKS</span>
                  </div>
                  <div className="volume-chart-wrap">
                    <div className="volume-chart dashboard-lab-bklit-chart">
                      <LineChart data={dashboard.trend} margin={{ top: 30, right: 36, bottom: 42, left: 40 }}>
                        <Grid horizontal vertical stroke="rgba(139, 148, 158, 0.16)" />
                        <Line dataKey="volume" stroke="var(--chart-line-primary)" strokeWidth={3} />
                        <XAxis />
                        <ChartTooltip />
                      </LineChart>
                    </div>
                    <div className="chart-summary">
                      <article className="volume-analysis-card">
                        <span>Total 12 weeks</span>
                        <strong>{formatCompact(totalTrendVolume)} kg</strong>
                        <small>{dashboard.trend.filter((week) => week.volume > 0).length} weeks with volume</small>
                      </article>
                      <article className="volume-analysis-card">
                        <span>Active average</span>
                        <strong>{formatCompact(activeAverageVolume)} kg</strong>
                        <small>per trained week</small>
                      </article>
                      <article className="volume-analysis-card">
                        <span>Best week</span>
                        <strong>{bestWeek?.label || '-'} | {formatCompact(bestWeek?.volume || 0)} kg</strong>
                        <small>gold point</small>
                      </article>
                      <article className="volume-analysis-card">
                        <span>Current week</span>
                        <strong>{formatCompact(lastWeek?.volume || 0)} kg</strong>
                        <small>{lastWeek?.workouts || 0} workouts</small>
                      </article>
                      <div className="volume-point-legend" aria-label="Volume chart legend">
                        <span><i className="legend-dot legend-volume"></i> Bklit volume</span>
                        <span><i className="legend-dot legend-current"></i> current</span>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="panel muscle-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">%</span>
                      <h2>MUSCLE_DISTRIBUTION.data</h2>
                    </div>
                    <span className="panel-badge">BY VOLUME</span>
                  </div>
                  <div className="muscle-distribution">
                    <div className="muscle-metric-summary">
                      <span>METRIC</span>
                      <strong>Volume by muscle group</strong>
                      <p>Total analyzed: {formatCompact(muscleTotal)} kg | chart powered by Bklit</p>
                    </div>
                    <div className="muscle-radar-wrap dashboard-lab-bklit-chart">
                      <BarChart data={dashboard.muscleSplit} xDataKey="name" margin={{ top: 24, right: 24, bottom: 42, left: 28 }} barGap={0.25}>
                        <Grid horizontal stroke="rgba(139, 148, 158, 0.16)" />
                        <Bar dataKey="volume" fill="var(--chart-line-secondary)" lineCap="round" />
                        <BarXAxis />
                        <ChartTooltip />
                      </BarChart>
                    </div>
                    <div className="radar-list">
                      {dashboard.muscleSplit.map((item) => {
                        const percent = Math.round((item.volume / Math.max(1, muscleTotal)) * 100);
                        return (
                          <article className="muscle-item" key={item.name}>
                            <div className="muscle-row-head">
                              <span>{item.name}</span>
                              <div><strong>{percent}%</strong></div>
                            </div>
                            <small>{formatCompact(item.volume)} kg of {formatCompact(muscleTotal)} kg</small>
                            <div className="muscle-bar-bg">
                              <span className="muscle-bar-fill" style={{ width: `${percent}%` }}></span>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </article>
              </section>
            </div>

            <div className={`dashboard-subtab ${activeSubtab === 'evolution' ? 'active' : ''}`} id="dash-subtab-evolution">
              <section className="summary-grid page-summary">
                {[
                  ['XP', 'XP Total', String(dashboard.totalXp), `${dashboard.weeklyWorkouts.length} workouts this week`, 'green'],
                  ['WK', 'XP Week', String(dashboard.weeklyWorkouts.reduce((total, workout) => total + getXp(workout), 0)), 'current week', 'blue'],
                  ['AVG', 'Avg per Workout', String(dashboard.completedWorkouts.length ? Math.round(dashboard.totalXp / dashboard.completedWorkouts.length) : 0), 'valid workout average', 'orange'],
                  ['TOP', 'Best Workout', String(Math.max(0, ...dashboard.completedWorkouts.map(getXp))), 'highest XP snapshot', 'purple']
                ].map(([icon, label, value, detail, tone]) => (
                  <article className={`summary-card ${tone}`} key={label}>
                    <span>{icon}</span>
                    <div>
                      <small>{label}</small>
                      <strong>{value}</strong>
                      <p>{detail}</p>
                    </div>
                  </article>
                ))}
              </section>

              <section className="panel season-progress-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <span className="panel-icon">S</span>
                    <h2>SEASON_PROGRESS.sys</h2>
                  </div>
                  <span className="panel-badge">{dashboard.journey.label}</span>
                </div>
                <div className="season-progress-grid">
                  {[
                    ['Annual journey', `${dashboard.journey.annualPercent}%`, dashboard.journey.annualPercent, `Week ${dashboard.journey.week}`],
                    ['Current week', `${weekPercent}%`, weekPercent, `${dashboard.completedWeekBlocks}/${dashboard.requiredWeekBlocks} blocks`],
                    ['XP progress', `${dashboard.level.progress}%`, dashboard.level.progress, `LV. ${dashboard.level.level}`]
                  ].map(([label, value, percent, detail]) => (
                    <article className="season-progress-card" key={String(label)}>
                      <div className="season-progress-card-head">
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                      <div className="season-progress-meter"><span style={{ width: `${percent}%` }}></span></div>
                      <p>{detail}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel body-progress-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <span className="panel-icon">KG</span>
                    <h2>BODY_PROGRESS.sys</h2>
                  </div>
                  <div className="panel-header-actions">
                    <span className="panel-badge">{data.bodyMeasurements.length} REG</span>
                    <a className="page-btn" href="/?tab=progress-body">NEW MEASURE</a>
                  </div>
                </div>
                <section className="summary-grid page-summary compact-summary">
                  <article className="summary-card green">
                    <span>KG</span>
                    <div><small>Current weight</small><strong>{dashboard.latestBody?.weightKg ? `${dashboard.latestBody.weightKg} kg` : '-'}</strong><p>{dashboard.weightDelta.toFixed(1)} kg vs first log</p></div>
                  </article>
                  <article className="summary-card blue">
                    <span>WA</span>
                    <div><small>Waist</small><strong>{dashboard.latestBody?.measurementsCm?.waist ? `${dashboard.latestBody.measurementsCm.waist} cm` : '-'}</strong><p>{dashboard.waistDelta.toFixed(1)} cm vs first log</p></div>
                  </article>
                  <article className="summary-card orange">
                    <span>DT</span>
                    <div><small>Latest measure</small><strong>{dashboard.latestBody ? formatDate(dashboard.latestBody.measuredAt) : '-'}</strong><p>body trend snapshot</p></div>
                  </article>
                </section>
              </section>
            </div>

            <div className={`dashboard-subtab ${activeSubtab === 'logs' ? 'active' : ''}`} id="dash-subtab-logs">
              <section className="content-grid insights-grid activity-log-grid">
                <article className="panel feed-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">&gt;</span>
                      <h2>ACTIVITY_FEED.stream</h2>
                    </div>
                    <span className="panel-badge">RECENT</span>
                  </div>
                  <div className="activity-feed">
                    {dashboard.completedWorkouts.slice(0, 8).map((workout) => (
                      <article className={`feed-item ${workout.missionSubstitution ? 'substitution' : 'workout'}`} key={workout._id}>
                        <span className="feed-dot" aria-hidden="true"></span>
                        <div>
                          <div className="feed-head">
                            <div>
                              <span className="feed-badge">{workout.missionSubstitution ? 'SWAP' : 'MISSION'}</span>
                              <h3>{workout.missionSubstitution ? 'Workout replaced mission' : 'Mission completed'}</h3>
                            </div>
                            <time dateTime={toDateKey(workout.date)}>{formatDate(workout.date)}</time>
                          </div>
                          <p>Workout {workout.workoutCode} - {workout.workoutName}</p>
                          <small>{getQuality(workout)}% quality | {getValidSets(workout)} sets | {formatCompact(getWorkoutVolume(workout))} kg</small>
                        </div>
                      </article>
                    ))}
                  </div>
                </article>

                <article className="panel achievements-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">*</span>
                      <h2>ACHIEVEMENTS.sys</h2>
                    </div>
                    <span className="panel-badge">LAB</span>
                  </div>
                  <div className="achievement-list">
                    {[
                      ['First blood', dashboard.completedWorkouts.length > 0],
                      ['Weekly strike', dashboard.completedWeekBlocks >= 3],
                      ['Volume hunter', dashboard.weeklyVolume > 0]
                    ].map(([label, done]) => (
                      <article className={`achievement-card ${done ? 'done' : ''}`} key={String(label)}>
                        <strong>{label}</strong>
                        <p>{done ? 'Unlocked in live data' : 'Pending'}</p>
                      </article>
                    ))}
                  </div>
                </article>
              </section>

              <section className="content-grid progress-grid">
                <article className="panel log-preview-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">#</span>
                      <h2>LOG_HISTORY.db</h2>
                    </div>
                    <a className="page-btn" href="/?tab=workout-list">OPEN</a>
                  </div>
                  <div className="dashboard-history">
                    {recentWorkouts.length ? recentWorkouts.map((workout) => (
                      <article className="dashboard-log-card" key={workout._id}>
                        <div className="dashboard-log-head">
                          <div>
                            <span className={`feed-badge ${workout.missionSubstitution ? 'substitution' : 'official'}`}>{workout.missionSubstitution ? 'SWAP' : 'MISSION'}</span>
                            <h3>Workout {workout.workoutCode}</h3>
                          </div>
                          <time dateTime={toDateKey(workout.date)}>{formatDate(workout.date)}</time>
                        </div>
                        <p>{workout.workoutName}</p>
                        <div className="dashboard-log-metrics">
                          <span>{getQuality(workout)}% quality</span>
                          <strong>{formatCompact(getWorkoutVolume(workout))} kg</strong>
                          <small>{getValidSets(workout)} sets</small>
                        </div>
                      </article>
                    )) : <p className="empty-state">No workouts logged yet.</p>}
                  </div>
                </article>

                <article className="panel weekly-missions-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <span className="panel-icon">&gt;</span>
                      <h2>WEEKLY_MISSIONS.sys</h2>
                    </div>
                    <span className="panel-badge">{dashboard.completedWeekBlocks}/{dashboard.requiredWeekBlocks}</span>
                  </div>
                  <div className="weekly-mission-list">
                    {dashboard.schedule.filter((item) => !item.mission.restDay).map((item) => (
                      <article className={`weekly-mission ${item.workout ? 'done' : 'pending'}`} key={item.dateKey}>
                        <div>
                          <h3>Complete Workout {item.code}</h3>
                          <p>{item.mission.missionName} | {formatDate(item.date)}</p>
                          <div className="achievement-meter"><span style={{ width: item.workout ? '100%' : '0%' }}></span></div>
                        </div>
                        <strong>{item.workout ? 'OK' : '+180 XP'}</strong>
                      </article>
                    ))}
                  </div>
                </article>
              </section>
            </div>

            <footer className="terminal-footer">
              <p><span>user@gym-os:~$</span> ./commit_gains --force --all</p>
              <p>[OK] Same dashboard UI. Bklit only replaces chart surfaces.</p>
            </footer>
          </section>
        </main>
      </div>
    </>
  );
}
