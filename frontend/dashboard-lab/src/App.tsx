import { Bar } from '../../../src/components/charts/bar';
import { BarChart } from '../../../src/components/charts/bar-chart';
import { Grid } from '../../../src/components/charts/grid';
import { Line, LineChart } from '../../../src/components/charts/line-chart';
import { ChartTooltip } from '../../../src/components/charts/tooltip';
import { BarXAxis } from '../../../src/components/charts/bar-x-axis';
import { XAxis } from '../../../src/components/charts/x-axis';

const weeklyVolume = [
  { date: new Date('2026-07-06'), volume: 4200, workouts: 4 },
  { date: new Date('2026-07-13'), volume: 5100, workouts: 5 },
  { date: new Date('2026-07-20'), volume: 5750, workouts: 5 },
  { date: new Date('2026-07-27'), volume: 6480, workouts: 6 },
  { date: new Date('2026-08-03'), volume: 6920, workouts: 4 }
];

const muscleSplit = [
  { name: 'Chest', value: 22, sessions: 7 },
  { name: 'Back', value: 24, sessions: 8 },
  { name: 'Legs', value: 18, sessions: 6 },
  { name: 'Shoulders', value: 14, sessions: 5 },
  { name: 'Arms', value: 16, sessions: 6 },
  { name: 'Core', value: 6, sessions: 3 }
];

export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
        <header className="lab-header">
          <div>
            <p className="lab-kicker">GYM-OS // DASHBOARD LAB</p>
            <h1>Analytics Command Center</h1>
            <p className="lab-copy">
              Isolated React/Bklit experiment. The current dashboard remains untouched.
            </p>
          </div>
          <a className="lab-back" href="/">
            Back to GYM-OS
          </a>
        </header>

        <section className="lab-stat-grid">
          <article>
            <span>Weekly Volume</span>
            <strong>6,920 kg</strong>
            <small>+6.8% from last week</small>
          </article>
          <article>
            <span>Workout Streak</span>
            <strong>4 days</strong>
            <small>Current academy cycle</small>
          </article>
          <article>
            <span>Completed Blocks</span>
            <strong>24</strong>
            <small>Strength + combat</small>
          </article>
          <article>
            <span>Focus</span>
            <strong>Back/Biceps</strong>
            <small>Next scheduled protocol</small>
          </article>
        </section>

        <section className="lab-grid">
          <article className="lab-panel lab-panel-large">
            <div className="lab-panel-heading">
              <div>
                <span>Performance</span>
                <h2>Weekly Load Trend</h2>
              </div>
              <strong>Mock data</strong>
            </div>
            <div className="lab-chart-frame">
              <LineChart
                data={weeklyVolume}
                margin={{ top: 26, right: 22, bottom: 42, left: 30 }}
              >
                <Grid horizontal vertical stroke="rgba(99, 255, 154, 0.14)" />
                <Line
                  dataKey="volume"
                  stroke="var(--chart-line-primary)"
                  strokeWidth={3}
                />
                <Line
                  dataKey="workouts"
                  stroke="var(--chart-line-secondary)"
                  strokeWidth={2}
                  yAxisId="sessions"
                />
                <XAxis />
                <ChartTooltip />
              </LineChart>
            </div>
          </article>

          <article className="lab-panel">
            <div className="lab-panel-heading">
              <div>
                <span>Distribution</span>
                <h2>Muscle Split</h2>
              </div>
              <strong>Mock data</strong>
            </div>
            <div className="lab-chart-frame compact">
              <BarChart
                data={muscleSplit}
                xDataKey="name"
                margin={{ top: 26, right: 18, bottom: 42, left: 26 }}
                barGap={0.28}
              >
                <Grid horizontal stroke="rgba(38, 217, 255, 0.13)" />
                <Bar
                  dataKey="value"
                  fill="var(--chart-line-secondary)"
                  lineCap="round"
                />
                <Bar
                  dataKey="sessions"
                  fill="var(--chart-line-primary)"
                  lineCap="round"
                />
                <BarXAxis />
                <ChartTooltip />
              </BarChart>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
