#!/usr/bin/env node
/**
 * GYM-OS validation script.
 *
 * Checks:
 * 1. JavaScript syntax in public/assets/app.js
 * 2. Duplicate HTML ids in public/index.html
 * 3. Static id references used by app.js
 * 4. Critical function definitions
 * 5. Dashboard evolution subtab isolation from the main Progress view
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname);
const APP_JS = path.join(ROOT, 'public', 'assets', 'app.js');
const INDEX_HTML = path.join(ROOT, 'public', 'index.html');

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

let hasError = false;
let hasWarn = false;

function pass(message) {
  console.log(`  ${GREEN}OK${RESET}  ${message}`);
}

function fail(message) {
  console.log(`  ${RED}FAIL${RESET}  ${message}`);
  hasError = true;
}

function warn(message) {
  console.log(`  ${YELLOW}WARN${RESET}  ${message}`);
  hasWarn = true;
}

function section(message) {
  console.log(`\n${BOLD}${CYAN}> ${message}${RESET}`);
}

section('CHECK 1 - JavaScript syntax');

try {
  const scriptWithoutImports = fs.readFileSync(APP_JS, 'utf8').replace(/^\s*import\s+[^;]+;\s*/, '');
  new Function(scriptWithoutImports);
  pass('app.js has no syntax errors');
} catch (error) {
  fail(`app.js has syntax errors:\n${String(error?.message || error).trim()}`);
}

section('CHECK 2 - Duplicate HTML ids');

const html = fs.readFileSync(INDEX_HTML, 'utf8');
const appJs = fs.readFileSync(APP_JS, 'utf8');
const idMatches = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const seenIds = new Set();
const duplicateIds = [];

for (const id of idMatches) {
  if (seenIds.has(id) && !duplicateIds.includes(id)) {
    duplicateIds.push(id);
  }

  seenIds.add(id);
}

if (duplicateIds.length) {
  fail(`Found ${duplicateIds.length} duplicate id(s): ${duplicateIds.join(', ')}`);
} else {
  pass(`No duplicate ids found (${idMatches.length} total ids)`);
}

section('CHECK 3 - Static id references');

const htmlIds = new Set(idMatches);
const getByIdCalls = [...appJs.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map((match) => match[1]);
const querySelectorCalls = [...appJs.matchAll(/querySelector\(['"]#([a-zA-Z0-9_-]+)['"]\)/g)].map((match) => match[1]);
const referencedIds = [...new Set([...getByIdCalls, ...querySelectorCalls])];
const knownOptionalIds = new Set([
  'metric-workouts',
  'metric-templates'
]);
const missingIds = referencedIds.filter((id) => !htmlIds.has(id) && !knownOptionalIds.has(id));

if (missingIds.length) {
  warn(`${missingIds.length} id reference(s) were not found statically in index.html`);
  missingIds.slice(0, 20).forEach((id) => console.log(`     #${id}`));
  if (missingIds.length > 20) {
    console.log(`     ... and ${missingIds.length - 20} more`);
  }
} else {
  pass(`All ${referencedIds.length} referenced ids exist in index.html`);
}

section('CHECK 4 - Critical function definitions');

const definedFunctions = new Set(
  [...appJs.matchAll(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g)].map((match) => match[1])
);
const requiredFunctions = [
  'renderDashboard',
  'renderProgress',
  'renderBodyProgress',
  'renderSeasonProgress',
  'renderProgressSummary',
  'renderProgressExercise',
  'renderProgressLog',
  'renderAnnualAchievements',
  'renderProgressTrend',
  'renderDashboardEvolutionSubtab',
  'getXpWorkouts',
  'getSortedBodyMeasurements',
  'getJourneyPosition',
  'getBodyInsight',
  'getBodyCycleSummary',
  'renderSummaryCards',
  'formatBodyDelta',
  'formatMeasurementValue',
  'escapeHtml',
  'formatDate'
];
const missingFunctions = requiredFunctions.filter((name) => !definedFunctions.has(name));

if (missingFunctions.length) {
  missingFunctions.forEach((name) => fail(`Missing function: ${name}()`));
} else {
  pass(`All ${requiredFunctions.length} critical functions are defined`);
}

section('CHECK 5 - Progress view regression guard');

const criticalProgressSelectors = [
  'progress-achievement-list',
  'progress-achievement-count',
  'season-progress-grid',
  'progress-exercise-summary-cards',
  'progress-exercise-history',
  'progress-log-count'
];

for (const selector of criticalProgressSelectors) {
  if (html.includes(`id="${selector}"`)) {
    pass(`HTML element #${selector} exists`);
  } else {
    fail(`HTML element #${selector} is missing`);
  }
}

const evolutionFunction = appJs.match(/function renderDashboardEvolutionSubtab\(\)[^]*?(?=\nfunction )/);

if (evolutionFunction) {
  const forbiddenSelectors = criticalProgressSelectors.filter((selector) => evolutionFunction[0].includes(selector));

  if (forbiddenSelectors.length) {
    fail(`renderDashboardEvolutionSubtab() references Progress view selectors: ${forbiddenSelectors.join(', ')}`);
  } else {
    pass('renderDashboardEvolutionSubtab() is isolated from the Progress view selectors');
  }
} else {
  warn('Could not extract renderDashboardEvolutionSubtab() for isolation check');
}

console.log('\n' + '-'.repeat(60));

if (hasError) {
  console.log(`${BOLD}${RED}VALIDATION FAILED${RESET}`);
  process.exit(1);
}

if (hasWarn) {
  console.log(`${BOLD}${YELLOW}VALIDATION PASSED WITH WARNINGS${RESET}`);
  process.exit(0);
}

console.log(`${BOLD}${GREEN}ALL CHECKS PASSED${RESET}`);
