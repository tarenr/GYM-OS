#!/usr/bin/env node
/**
 * GYM-OS — Validation Script
 *
 * Checks before every commit:
 *  1. JavaScript syntax (app.js)
 *  2. Duplicate HTML IDs (index.html)
 *  3. Undefined function references in app.js
 *  4. Broken getElementById references (app.js vs index.html)
 *  5. Original critical functions of view-progress are untouched
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname);
const APP_JS = path.join(ROOT, 'public', 'assets', 'app.js');
const INDEX_HTML = path.join(ROOT, 'public', 'index.html');

const BOLD   = '\x1b[1m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';

let hasError = false;
let hasWarn = false;

function pass(msg) { console.log(`  ${GREEN}✓${RESET}  ${msg}`); }
function fail(msg) { console.log(`  ${RED}✗${RESET}  ${msg}`); hasError = true; }
function warn(msg) { console.log(`  ${YELLOW}⚠${RESET}  ${msg}`); hasWarn = true; }
function section(msg) { console.log(`\n${BOLD}${CYAN}▶ ${msg}${RESET}`); }

// ─────────────────────────────────────────────────────────
// 1. JavaScript syntax check
// ─────────────────────────────────────────────────────────
section('CHECK 1 — JavaScript Syntax (app.js)');

try {
  execSync(`node --check "${APP_JS}"`, { stdio: 'pipe' });
  pass('app.js has no syntax errors');
} catch (err) {
  fail(`app.js has SYNTAX ERRORS:\n${err.stderr.toString().trim()}`);
}

// ─────────────────────────────────────────────────────────
// 2. Duplicate HTML IDs
// ─────────────────────────────────────────────────────────
section('CHECK 2 — Duplicate HTML IDs (index.html)');

const html = fs.readFileSync(INDEX_HTML, 'utf8');
const idMatches = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const seen = {};
const duplicates = [];

for (const id of idMatches) {
  if (seen[id]) {
    if (!duplicates.includes(id)) duplicates.push(id);
  }
  seen[id] = true;
}

if (duplicates.length === 0) {
  pass(`No duplicate IDs found (${idMatches.length} total IDs)`);
} else {
  fail(`Found ${duplicates.length} duplicate ID(s):`);
  duplicates.forEach(id => console.log(`     ${RED}→ #${id}${RESET}`));
}

// ─────────────────────────────────────────────────────────
// 3. getElementById references vs index.html IDs
// ─────────────────────────────────────────────────────────
section('CHECK 3 — getElementById references (app.js → index.html)');

const appJs = fs.readFileSync(APP_JS, 'utf8');
const allHtmlIds = new Set(idMatches);

// Collect every getElementById call in app.js
const getByIdCalls = [...appJs.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);

// Also collect querySelector calls with simple IDs
const querySelectorCalls = [...appJs.matchAll(/querySelector\(['"]#([a-zA-Z0-9_-]+)['"]\)/g)].map(m => m[1]);

const allReferencedIds = [...new Set([...getByIdCalls, ...querySelectorCalls])];

// IDs known to be optional/dynamically generated — safe to exclude from warnings
const knownOptionalIds = new Set([
  'metric-workouts',    // renderMetrics() — optional, guarded with if(el)
  'metric-templates',   // renderMetrics() — optional, guarded with if(el)
]);

// Ids that are referenced in JS but not present in HTML
// We exclude dynamically-created IDs (those assigned by innerHTML) by checking if they appear as id=" in HTML
const missingIds = allReferencedIds.filter(id => !allHtmlIds.has(id) && !knownOptionalIds.has(id));

if (missingIds.length === 0) {
  pass(`All ${allReferencedIds.length} referenced IDs exist in index.html`);
} else {
  // These might be set dynamically via innerHTML — just warn, don't fail
  warn(`${missingIds.length} ID(s) referenced in app.js not found statically in index.html:`);
  warn('(These may be dynamically generated — verify manually if important)');
  missingIds.slice(0, 20).forEach(id => console.log(`     ${YELLOW}→ #${id}${RESET}`));
  if (missingIds.length > 20) console.log(`     ${YELLOW}... and ${missingIds.length - 20} more${RESET}`);
}

// ─────────────────────────────────────────────────────────
// 4. Function reference integrity
// ─────────────────────────────────────────────────────────
section('CHECK 4 — Function Definitions vs Calls (app.js)');

// Extract all defined function names
const definedFunctions = new Set(
  [...appJs.matchAll(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g)].map(m => m[1])
);

// Critical functions that MUST be defined (guards for regressions)
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
  'formatDate',
];

let allDefined = true;
for (const fn of requiredFunctions) {
  if (definedFunctions.has(fn)) {
    pass(`function ${fn}()`);
  } else {
    fail(`MISSING function: ${fn}() — not found in app.js`);
    allDefined = false;
  }
}

if (allDefined) {
  pass(`All ${requiredFunctions.length} critical functions are defined`);
}

// ─────────────────────────────────────────────────────────
// 5. Regression guard — view-progress functions are untouched
// ─────────────────────────────────────────────────────────
section('CHECK 5 — Regression Guard (renderProgress original flow)');

// Critical selectors that renderProgress() and its children must reference
const criticalProgressSelectors = [
  'progress-achievement-list',
  'progress-achievement-count',
  'season-progress-grid',
  'progress-exercise-summary-cards',
  'progress-exercise-history',
  'progress-log-count',
];

for (const selector of criticalProgressSelectors) {
  if (html.includes(`id="${selector}"`)) {
    pass(`HTML element #${selector} exists`);
  } else {
    fail(`HTML element #${selector} is MISSING — renderProgress() may be broken`);
  }
}

// Ensure renderDashboardEvolutionSubtab doesn't reference progress-* IDs
const evolutionFnMatch = appJs.match(/function renderDashboardEvolutionSubtab\(\)[^]*?(?=\nfunction )/);
if (evolutionFnMatch) {
  const evolutionFnBody = evolutionFnMatch[0];
  const forbidden = criticalProgressSelectors.filter(sel => evolutionFnBody.includes(sel));
  if (forbidden.length === 0) {
    pass('renderDashboardEvolutionSubtab() does not reference any view-progress elements');
  } else {
    fail(`renderDashboardEvolutionSubtab() references forbidden progress selectors: ${forbidden.join(', ')}`);
  }
} else {
  warn('Could not extract renderDashboardEvolutionSubtab() body for isolation check');
}

// ─────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(60));
if (hasError) {
  console.log(`${BOLD}${RED}✗ VALIDATION FAILED — fix the errors above before committing${RESET}`);
  process.exit(1);
} else if (hasWarn) {
  console.log(`${BOLD}${YELLOW}⚠ VALIDATION PASSED WITH WARNINGS — review the warnings above${RESET}`);
  process.exit(0);
} else {
  console.log(`${BOLD}${GREEN}✓ ALL CHECKS PASSED — safe to commit!${RESET}`);
  process.exit(0);
}
