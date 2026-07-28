const CONFIG = {
  baseUrl: 'http://localhost:3000',
  forbiddenTerms: ['pullover'],
  exerciseNames: ['Plank', 'Mountain climber']
};

async function getJson(path) {
  const response = await fetch(`${CONFIG.baseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`${path} responded ${response.status}.`);
  }

  return response.json();
}

async function getHead(path) {
  const response = await fetch(`${CONFIG.baseUrl}${path}`, { method: 'HEAD' });

  return {
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get('content-type') || ''
  };
}

function hasForbiddenTerm(value) {
  const text = JSON.stringify(value).toLowerCase();

  return CONFIG.forbiddenTerms.filter((term) => text.includes(term.toLowerCase()));
}

const home = await getHead('/');
const [workouts, exercises] = await Promise.all([
  getJson('/api/workouts'),
  getJson('/api/exercises')
]);
const exerciseSummary = CONFIG.exerciseNames.map((name) => {
  const exercise = exercises.find((item) => item.name === name);

  return {
    name,
    found: Boolean(exercise),
    defaultReps: exercise?.defaultReps,
    measurementType: exercise?.measurementType,
    loadMode: exercise?.loadMode
  };
});
const result = {
  baseUrl: CONFIG.baseUrl,
  home,
  counts: {
    workouts: Array.isArray(workouts) ? workouts.length : 0,
    exercises: Array.isArray(exercises) ? exercises.length : 0
  },
  forbiddenTerms: {
    workouts: hasForbiddenTerm(workouts),
    exercises: hasForbiddenTerm(exercises)
  },
  exerciseSummary
};

console.log(JSON.stringify(result, null, 2));

if (!home.ok || result.forbiddenTerms.workouts.length || result.forbiddenTerms.exercises.length) {
  process.exitCode = 1;
}
