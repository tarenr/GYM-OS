import { calculateLevel, calculateWorkoutXp, calculateWorkoutXpBreakdown } from './xpCalculator.js';

const workoutNames = {
  A: 'Peito e triceps',
  B: 'Costas e biceps',
  C: 'Pernas e ombros'
};

const state = {
  workouts: [],
  allWorkouts: [],
  exercises: [],
  templates: [],
  workoutTypes: [],
  dailyMissions: [],
  selectedTemplateExercises: [],
  selectedTemplateMeta: {
    level: '',
    xpReward: 0,
    description: ''
  },
  workoutFormContext: {
    source: 'manual',
    returnTab: '',
    assignment: null
  },
  filter: 'all',
  editingId: null,
  templateEditingId: null,
  workoutTypeEditingId: null,
  templateSearch: '',
  templateTypeFilter: 'all',
  templateMeasurementFilter: 'all',
  templateSort: 'code',
  workoutTypeSearch: '',
  workoutTypeMeasurementFilter: 'all',
  workoutTypeFieldFilter: 'all',
  historyView: 'list',
  historySearch: '',
  historyCodeFilter: 'all',
  historyMuscleFilter: 'all',
  historyPeriodFilter: 'all',
  historyPage: 1,
  historyPageSize: 8,
  selectedProgressExercise: '',
  progressExercisePeriodFilter: 'all',
  achievementCategoryFilter: 'all',
  achievementStatusFilter: 'all',
  selectedMissionDayIndex: new Date().getDay(),
  activeDocumentationDoc: 'app',
  documentationLoaded: {},
  documentationCache: {}
};

const form = document.querySelector('#workout-form');
const dateInput = document.querySelector('#date');
const workoutTemplateInput = document.querySelector('#workout-template');
const durationInput = document.querySelector('#duration');
const targetMusclesInput = document.querySelector('#target-muscles');
const notesInput = document.querySelector('#notes');
const exerciseList = document.querySelector('#exercise-list');
const exerciseTemplate = document.querySelector('#exercise-template');
const addExerciseButton = document.querySelector('#add-exercise');
const workoutExercisePicker = document.querySelector('#workout-exercise-picker');
const workoutExercisePickerMode = document.querySelector('#workout-exercise-picker-mode');
const workoutExerciseCategoryFilter = document.querySelector('#workout-exercise-category-filter');
const workoutExerciseSubcategoryFilter = document.querySelector('#workout-exercise-subcategory-filter');
const workoutExerciseSearch = document.querySelector('#workout-exercise-search');
const workoutExercisePickerList = document.querySelector('#workout-exercise-picker-list');
const historyList = document.querySelector('#history-list');
const statusMessage = document.querySelector('#status-message');
const formTitle = document.querySelector('#form-title');
const workoutOriginPanel = document.querySelector('#workout-origin-panel');
const workoutOriginLabel = document.querySelector('#workout-origin-label');
const workoutOriginDetail = document.querySelector('#workout-origin-detail');
const detailPanel = document.querySelector('#detail-panel');
const detailTitle = document.querySelector('#detail-title');
const detailContent = document.querySelector('#detail-content');
const templateForm = document.querySelector('#template-form');
const templateFormTitle = document.querySelector('#template-form-title');
const templateCodeInput = document.querySelector('#template-code');
const templateNameInput = document.querySelector('#template-name');
const templateWorkoutTypeInput = document.querySelector('#template-workout-type');
const templateStatusMessage = document.querySelector('#template-status-message');
const catalogCategoryFilter = document.querySelector('#catalog-category-filter');
const catalogSubcategoryFilter = document.querySelector('#catalog-subcategory-filter');
const catalogSearch = document.querySelector('#catalog-search');
const catalogList = document.querySelector('#catalog-list');
const selectedTemplateList = document.querySelector('#selected-template-list');
const templateList = document.querySelector('#template-list');
const templateSummaryCards = document.querySelector('#template-summary-cards');
const templateSearch = document.querySelector('#template-search');
const templateTypeFilter = document.querySelector('#template-type-filter');
const templateMeasurementFilter = document.querySelector('#template-measurement-filter');
const templateSort = document.querySelector('#template-sort');
const exercisePageModalityFilter = document.querySelector('#exercise-page-modality-filter');
const exercisePageCategoryFilter = document.querySelector('#exercise-page-category-filter');
const exercisePageSubcategoryFilter = document.querySelector('#exercise-page-subcategory-filter');
const exercisePageMeasurementFilter = document.querySelector('#exercise-page-measurement-filter');
const exercisePageSearch = document.querySelector('#exercise-page-search');
const exercisePageList = document.querySelector('#exercise-page-list');
const exerciseSummaryCards = document.querySelector('#exercise-summary-cards');
const hudStreak = document.querySelector('#hud-streak');
const dashboardJourneyDay = document.querySelector('#dashboard-journey-day');
const dashboardJourneySeason = document.querySelector('#dashboard-journey-season');
const dashboardJourneyText = document.querySelector('#dashboard-journey-text');
const dashboardTotalWorkouts = document.querySelector('#dashboard-total-workouts');
const dashboardVolume = document.querySelector('#dashboard-volume');
const dashboardPrs = document.querySelector('#dashboard-prs');
const dashboardLevel = document.querySelector('#dashboard-level');
const dashboardLevelTrend = document.querySelector('#dashboard-level-trend');
const dashboardRank = document.querySelector('#dashboard-rank');
const dashboardXpFill = document.querySelector('#dashboard-xp-fill');
const dashboardXpText = document.querySelector('#dashboard-xp-text');
const dashboardWorkoutsTrend = document.querySelector('#dashboard-workouts-trend');
const dashboardVolumeTrend = document.querySelector('#dashboard-volume-trend');
const dashboardHistory = document.querySelector('#dashboard-history');
const dashboardWeeklySchedule = document.querySelector('#dashboard-weekly-schedule');
const dashboardPlayerBadge = document.querySelector('#dashboard-player-badge');
const dashboardPlayerLevel = document.querySelector('#dashboard-player-level');
const dashboardPlayerRank = document.querySelector('#dashboard-player-rank');
const dashboardPlayerXpFill = document.querySelector('#dashboard-player-xp-fill');
const dashboardPlayerXpText = document.querySelector('#dashboard-player-xp-text');
const dashboardLevelRing = document.querySelector('#dashboard-level-ring');
const dashboardVolumeChart = document.querySelector('#dashboard-volume-chart');
const dashboardVolumeSummary = document.querySelector('#dashboard-volume-summary');
const dashboardMuscleDistribution = document.querySelector('#dashboard-muscle-distribution');
const dashboardPrList = document.querySelector('#dashboard-pr-list');
const dashboardActivityFeed = document.querySelector('#dashboard-activity-feed');
const missionTitle = document.querySelector('#mission-title');
const missionDescription = document.querySelector('#mission-description');
const missionBadge = document.querySelector('#mission-badge');
const missionReward = document.querySelector('#mission-reward');
const missionStepTemplate = document.querySelector('#mission-step-template');
const missionStepSets = document.querySelector('#mission-step-sets');
const missionStepSave = document.querySelector('#mission-step-save');
const weeklyProgress = document.querySelector('#weekly-progress');
const weeklyMap = document.querySelector('#weekly-map');
const missionActions = document.querySelector('#mission-actions');
const startMissionButton = document.querySelector('#start-mission');
const heatmapGrid = document.querySelector('#heatmap-grid');
const achievementProgress = document.querySelector('#achievement-progress');
const achievementList = document.querySelector('#achievement-list');
const weeklyMissionProgress = document.querySelector('#weekly-mission-progress');
const weeklyMissionList = document.querySelector('#weekly-mission-list');
const historySort = document.querySelector('#history-sort');
const historySubtitle = document.querySelector('#history-subtitle');
const historySummaryCards = document.querySelector('#history-summary-cards');
const historySearch = document.querySelector('#history-search');
const historyCodeFilter = document.querySelector('#history-code-filter');
const historyMuscleFilter = document.querySelector('#history-muscle-filter');
const historyPeriodFilter = document.querySelector('#history-period-filter');
const historyListHeader = document.querySelector('#history-list-header');
const historyPagination = document.querySelector('#history-pagination');
const exportHistoryButton = document.querySelector('#export-history');
const templateSubtitle = document.querySelector('#template-subtitle');
const exerciseSubtitle = document.querySelector('#exercise-subtitle');
const workoutTypeForm = document.querySelector('#workout-type-form');
const workoutTypeFormTitle = document.querySelector('#workout-type-form-title');
const workoutTypeCodeInput = document.querySelector('#workout-type-code');
const workoutTypeNameInput = document.querySelector('#workout-type-name');
const workoutTypeMeasurementInput = document.querySelector('#workout-type-measurement');
const workoutTypeFieldsInput = document.querySelector('#workout-type-fields');
const workoutTypeDescriptionInput = document.querySelector('#workout-type-description');
const workoutTypeStatusMessage = document.querySelector('#workout-type-status-message');
const workoutTypeSubtitle = document.querySelector('#workout-type-subtitle');
const workoutTypeList = document.querySelector('#workout-type-list');
const workoutTypeSummaryCards = document.querySelector('#workout-type-summary-cards');
const workoutTypeSearch = document.querySelector('#workout-type-search');
const workoutTypeMeasurementFilter = document.querySelector('#workout-type-measurement-filter');
const workoutTypeFieldFilter = document.querySelector('#workout-type-field-filter');
const dailyMissionSubtitle = document.querySelector('#daily-mission-subtitle');
const dailyMissionSummaryCards = document.querySelector('#daily-mission-summary-cards');
const dailyMissionToday = document.querySelector('#daily-mission-today');
const dailyMissionTodayBadge = document.querySelector('#daily-mission-today-badge');
const dailyMissionList = document.querySelector('#daily-mission-list');
const progressSubtitle = document.querySelector('#progress-subtitle');
const progressSummaryCards = document.querySelector('#progress-summary-cards');
const seasonProgressBadge = document.querySelector('#season-progress-badge');
const seasonProgressSummaryCards = document.querySelector('#season-progress-summary-cards');
const seasonProgressGrid = document.querySelector('#season-progress-grid');
const progressXpTrend = document.querySelector('#progress-xp-trend');
const progressXpSplit = document.querySelector('#progress-xp-split');
const progressXpLog = document.querySelector('#progress-xp-log');
const progressLogCount = document.querySelector('#progress-log-count');
const progressAchievementCount = document.querySelector('#progress-achievement-count');
const progressAchievementCategoryFilter = document.querySelector('#progress-achievement-category-filter');
const progressAchievementStatusFilter = document.querySelector('#progress-achievement-status-filter');
const progressAchievementSummaryCards = document.querySelector('#progress-achievement-summary-cards');
const progressAchievementCategoryList = document.querySelector('#progress-achievement-category-list');
const progressAchievementList = document.querySelector('#progress-achievement-list');
const progressExerciseSelect = document.querySelector('#progress-exercise-select');
const progressExercisePeriodFilter = document.querySelector('#progress-exercise-period-filter');
const progressExerciseCount = document.querySelector('#progress-exercise-count');
const progressExerciseSummaryCards = document.querySelector('#progress-exercise-summary-cards');
const progressExerciseHistory = document.querySelector('#progress-exercise-history');
const progressCompareCount = document.querySelector('#progress-compare-count');
const progressExerciseCompare = document.querySelector('#progress-exercise-compare');
const progressPrCount = document.querySelector('#progress-pr-count');
const progressPrList = document.querySelector('#progress-pr-list');
const documentationStatus = document.querySelector('#documentation-status');
const documentationIndex = document.querySelector('#documentation-index');
const documentationContent = document.querySelector('#documentation-content');
const documentationFileTitle = document.querySelector('#documentation-file-title');
const documentationDownload = document.querySelector('#documentation-download');
const documentationMenuButtons = document.querySelectorAll('[data-documentation-doc]');

const documentationDocs = {
  app: {
    title: 'DOCUMENTACAO_APP.md',
    downloadUrl: '/DOCUMENTACAO_APP.md',
    downloadLabel: 'Baixar Manual'
  },
  academy: {
    title: 'ROADMAP_ACADEMY.md',
    downloadUrl: '/ROADMAP_ACADEMY.md',
    downloadLabel: 'Baixar Roadmap'
  },
  progressSystem: {
    title: 'ACADEMY_PROGRESS_SYSTEM.md',
    downloadUrl: '/ACADEMY_PROGRESS_SYSTEM.md',
    downloadLabel: 'Baixar Progressao'
  }
};

const weeklySchedule = [
  { day: 1, label: 'SEG', code: 'A' },
  { day: 2, label: 'TER', code: 'B' },
  { day: 3, label: 'QUA', code: 'A' },
  { day: 4, label: 'QUI', code: 'B' },
  { day: 5, label: 'SEX', code: 'C' },
  { day: 6, label: 'SAB', code: 'A' },
  { day: 0, label: 'DOM', code: 'DESC' }
];
const heatmapStartDate = '2026-07-22';
const academyJourneyStartDate = '2026-07-22';
const heatmapWeekCount = 16;
const academyJourneySeasons = [
  { id: 1, name: 'Fundacao', focus: 'Consistencia > intensidade' },
  { id: 2, name: 'Intensificacao', focus: 'Volume + tecnica' },
  { id: 3, name: 'Especializacao', focus: 'Progresso especifico' },
  { id: 4, name: 'Consolidacao', focus: 'Consistencia anual + revisao' }
];
const academySeasonWeeks = 12;
const academyCycleWeeks = 4;
const academyJourneyWeeks = academyJourneySeasons.length * academySeasonWeeks;

const rankTiers = [
  { minLevel: 1, name: 'Noob Protocol', shortName: 'Noob' },
  { minLevel: 4, name: 'Aprendiz de Ferro', shortName: 'Aprendiz' },
  { minLevel: 8, name: 'Maromba Jr', shortName: 'Maromba Jr' },
  { minLevel: 13, name: 'Operador de Supino', shortName: 'Operador' },
  { minLevel: 19, name: 'Cacador de PR', shortName: 'Cacador' },
  { minLevel: 26, name: 'Maquina de Volume', shortName: 'Maquina' },
  { minLevel: 36, name: 'Boss de Academia', shortName: 'Boss' },
  { minLevel: 51, name: 'Lenda do Protocolo', shortName: 'Lenda' }
];

function formatDate(dateValue) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(dateValue));
}

function formatWeekday(dateValue) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'UTC' }).format(new Date(dateValue));
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function getJourneyDay(dateKey = todayInputValue()) {
  const start = new Date(`${academyJourneyStartDate}T00:00:00Z`);
  const current = new Date(`${dateKey}T00:00:00Z`);
  const diff = Math.floor((current - start) / 86400000) + 1;

  return Math.max(1, diff);
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getJourneyPosition(dateKey = todayInputValue()) {
  const day = getJourneyDay(dateKey);
  const week = Math.max(1, Math.ceil(day / 7));
  const cappedWeek = Math.min(academyJourneyWeeks, week);
  const seasonIndex = Math.min(academyJourneySeasons.length - 1, Math.floor((cappedWeek - 1) / academySeasonWeeks));
  const season = academyJourneySeasons[seasonIndex];
  const weekInSeason = ((cappedWeek - 1) % academySeasonWeeks) + 1;
  const cycleInSeason = Math.ceil(weekInSeason / academyCycleWeeks);
  const weekInCycle = ((weekInSeason - 1) % academyCycleWeeks) + 1;
  const dayInSeason = Math.min(academySeasonWeeks * 7, ((weekInSeason - 1) * 7) + (((day - 1) % 7) + 1));
  const dayInCycle = Math.min(academyCycleWeeks * 7, ((weekInCycle - 1) * 7) + (((day - 1) % 7) + 1));
  const annualPercent = clampPercent((Math.min(day, academyJourneyWeeks * 7) / (academyJourneyWeeks * 7)) * 100);
  const seasonPercent = clampPercent((dayInSeason / (academySeasonWeeks * 7)) * 100);
  const cyclePercent = clampPercent((dayInCycle / (academyCycleWeeks * 7)) * 100);

  return {
    day,
    week,
    season,
    seasonNumber: season.id,
    weekInSeason,
    cycleInSeason,
    weekInCycle,
    annualPercent,
    seasonPercent,
    cyclePercent,
    label: `T${season.id} C${cycleInSeason}`
  };
}

function toDateKey(dateValue) {
  return new Date(dateValue).toISOString().slice(0, 10);
}

function getWorkoutForWeekday(day = new Date().getDay()) {
  return weeklySchedule.find((item) => item.day === day) || weeklySchedule[0];
}

function getDayIndexFromDateKey(dateValue) {
  return new Date(`${dateValue}T12:00:00`).getDay();
}

function getWorkoutForDate(dateValue) {
  return getWorkoutForWeekday(getDayIndexFromDateKey(toDateKey(dateValue)));
}

function getTodayDailyMission() {
  const today = new Date().getDay();
  return state.dailyMissions.find((mission) => mission.dayIndex === today);
}

function getDailyMissionByDayIndex(dayIndex) {
  return state.dailyMissions.find((mission) => mission.dayIndex === Number(dayIndex));
}

function getSelectedMissionDayIndex() {
  const today = new Date().getDay();
  const hasSelectedDay = weeklySchedule.some((item) => item.day === Number(state.selectedMissionDayIndex));

  return hasSelectedDay ? Number(state.selectedMissionDayIndex) : today;
}

function getWeekDateKeyForDay(dayIndex, monday = getMonday()) {
  const date = new Date(monday);
  const dayOffset = Number(dayIndex) === 0 ? 6 : Number(dayIndex) - 1;

  date.setDate(monday.getDate() + dayOffset);
  return date.toISOString().slice(0, 10);
}

function getDailyMissionForDate(dateValue) {
  return state.dailyMissions.find((mission) => mission.dayIndex === getDayIndexFromDateKey(toDateKey(dateValue)));
}

function getMissionTotalXp(mission) {
  if (!mission || mission.restDay) {
    return 0;
  }

  return (mission.blocks || []).reduce((total, block) => total + Number(block.xpReward || 0), 0) + Number(mission.bonusXp || 0);
}

function getBlockLabel(block) {
  if (block.type === 'strength') return 'Forca';
  if (block.type === 'combat') return block.modality === 'boxing' ? 'Boxe' : 'Kickboxing';
  return 'Recuperacao';
}

function getTemplateBlockType(template) {
  const workoutTypeCode = template?.workoutTypeCode || '';

  if (workoutTypeCode === 'strength') return 'strength';
  if (workoutTypeCode === 'boxing' || workoutTypeCode === 'kickboxing') return 'combat';

  return '';
}

function getMissionAssignment(mission, block, template, dateValue) {
  const dateKey = toDateKey(dateValue);
  const originalCode = block?.workoutCode || '';
  const workoutCode = template?.code || '';

  return {
    missionDate: dateKey,
    missionBlockType: block?.type || '',
    missionOriginalWorkoutCode: originalCode,
    missionOriginalWorkoutName: block?.workoutName || '',
    missionSubstitution: Boolean(originalCode && workoutCode && originalCode !== workoutCode)
  };
}

function isWorkoutSubstitutionForBlock(workout, block) {
  return Boolean(workout && block?.workoutCode && workout.workoutCode !== block.workoutCode);
}

function formatMissionBlockCompletion(block, workout) {
  if (!workout) {
    return block?.workoutCode || 'DESC';
  }

  return isWorkoutSubstitutionForBlock(workout, block)
    ? `${block.workoutCode} -> ${workout.workoutCode}`
    : block.workoutCode || workout.workoutCode || 'DESC';
}

function getMissionBlockForTemplate(template, dateValue = dateInput.value) {
  if (!template || !dateValue) {
    return null;
  }

  const mission = getDailyMissionForDate(dateValue);
  const block = mission?.blocks?.find((item) => item.workoutCode === template.code);

  return block ? { mission, block } : null;
}

function getReplacementMissionBlockForTemplate(template, dateValue = dateInput.value) {
  if (!template || !dateValue) {
    return null;
  }

  const mission = getDailyMissionForDate(dateValue);
  const templateBlockType = getTemplateBlockType(template);

  if (!mission || mission.restDay || !templateBlockType) {
    return null;
  }

  const dateKey = toDateKey(dateValue);
  const block = (mission.blocks || []).find((item) => (
    item.type === templateBlockType
    && item.templateId
    && item.workoutCode !== template.code
    && !getWorkoutForMissionBlock(dateKey, item)
  ));

  return block ? { mission, block } : null;
}

function getWorkoutFormContext(template, dateValue = dateInput.value) {
  if (state.editingId) {
    return {
      source: 'editing',
      label: 'Editando treino',
      detail: 'Alterando sessao ja registrada',
      assignment: state.workoutFormContext.assignment || null
    };
  }

  if (!template) {
    return {
      source: 'manual',
      label: 'Origem',
      detail: 'Selecione uma ficha',
      assignment: null
    };
  }

  const missionContext = getMissionBlockForTemplate(template, dateValue);

  if (missionContext && !missionContext.mission.restDay) {
    return {
      source: 'mission',
      label: 'Origem: campanha do dia',
      detail: `${getBlockLabel(missionContext.block)} - ${missionContext.block.workoutCode} | ${formatDate(dateValue)}`,
      assignment: getMissionAssignment(missionContext.mission, missionContext.block, template, dateValue)
    };
  }

  const replacementContext = getReplacementMissionBlockForTemplate(template, dateValue);

  if (replacementContext) {
    return {
      source: 'substitution',
      label: 'Origem: substitui bloco da campanha',
      detail: `${replacementContext.block.workoutCode} -> ${template.code} | ${getBlockLabel(replacementContext.block)} | ${formatDate(dateValue)}`,
      assignment: getMissionAssignment(replacementContext.mission, replacementContext.block, template, dateValue)
    };
  }

  return {
    source: 'extra',
    label: 'Origem: treino extra',
    detail: `${template.code} - ${template.name} | nao substitui a campanha do dia`,
    assignment: null
  };
}

function renderWorkoutOrigin() {
  if (!workoutOriginPanel || !workoutOriginLabel || !workoutOriginDetail) {
    return;
  }

  const template = state.templates.find((item) => item._id === workoutTemplateInput.value);
  const context = getWorkoutFormContext(template);

  state.workoutFormContext = {
    ...state.workoutFormContext,
    source: context.source
  };
  workoutOriginPanel.hidden = !template && !state.editingId;
  workoutOriginPanel.classList.toggle('extra', context.source === 'extra');
  workoutOriginPanel.classList.toggle('substitution', context.source === 'substitution');
  workoutOriginPanel.classList.toggle('editing', context.source === 'editing');
  workoutOriginLabel.textContent = context.label;
  workoutOriginDetail.textContent = context.detail;
}

function getNextMissionBlock(mission, dateKey = todayInputValue()) {
  if (!mission || mission.restDay) {
    return null;
  }

  const activeBlocks = (mission.blocks || []).filter((block) => block.type !== 'recovery' && block.templateId);
  const strengthBlock = activeBlocks.find((block) => block.type === 'strength');
  const combatBlock = activeBlocks.find((block) => block.type === 'combat');

  if (strengthBlock && !getWorkoutForMissionBlock(dateKey, strengthBlock)) {
    return strengthBlock;
  }

  if (combatBlock && !getWorkoutForMissionBlock(dateKey, combatBlock)) {
    return combatBlock;
  }

  return activeBlocks.find((block) => !getWorkoutForMissionBlock(dateKey, block)) || null;
}

function getDashboardBlockState(block, dateKey) {
  if (!block || block.type === 'recovery') {
    return {
      status: 'idle',
      workout: null,
      attemptedWorkout: null
    };
  }

  const workout = getWorkoutForMissionBlock(dateKey, block);
  const attemptedWorkout = getWorkoutAttemptForMissionBlock(dateKey, block);

  if (workout) {
    return {
      status: 'done',
      workout,
      attemptedWorkout: workout
    };
  }

  if (attemptedWorkout) {
    return {
      status: 'partial',
      workout: null,
      attemptedWorkout
    };
  }

  return {
    status: 'pending',
    workout: null,
    attemptedWorkout: null
  };
}

function getDashboardBlockAction(block, dateKey) {
  const todayKey = todayInputValue();
  const stateInfo = getDashboardBlockState(block, dateKey);

  if (!block || block.type === 'recovery') {
    return {
      block,
      stateInfo,
      label: 'Descanso',
      meta: 'recuperacao programada',
      disabled: true,
      action: '',
      workoutId: '',
      templateId: ''
    };
  }

  const blockLabel = block.type === 'strength' ? 'Forca' : 'Luta';
  const blockCode = block.workoutCode || '';

  if (stateInfo.status === 'done') {
    return {
      block,
      stateInfo,
      label: `${blockLabel} OK`,
      meta: `${formatMissionBlockCompletion(block, stateInfo.workout)} concluido`,
      disabled: false,
      action: 'details',
      workoutId: stateInfo.workout?._id || '',
      templateId: ''
    };
  }

  if (stateInfo.status === 'partial') {
    return {
      block,
      stateInfo,
      label: `Editar ${blockLabel}`,
      meta: `${formatMissionBlockCompletion(block, stateInfo.attemptedWorkout)} parcial`,
      disabled: false,
      action: 'edit',
      workoutId: stateInfo.attemptedWorkout?._id || '',
      templateId: ''
    };
  }

  if (dateKey === todayKey && block.templateId) {
    return {
      block,
      stateInfo,
      label: `Iniciar ${blockLabel}`,
      meta: `${blockCode} pendente`,
      disabled: false,
      action: 'start',
      workoutId: '',
      templateId: block.templateId
    };
  }

  return {
    block,
    stateInfo,
    label: dateKey > todayKey ? `${blockLabel} planejada` : `${blockLabel} pendente`,
    meta: `${blockCode} ${dateKey > todayKey ? 'futuro' : 'nao iniciado'}`,
    disabled: true,
    action: '',
    workoutId: '',
    templateId: ''
  };
}

function renderMissionActionButtons(mission, dateKey) {
  if (!missionActions) {
    return;
  }

  if (!mission || mission.restDay) {
    missionActions.innerHTML = `
      <button class="mission-action-button rest" type="button" disabled>
        <strong>Dia de descanso</strong>
        <span>recuperacao programada</span>
      </button>
    `;
    return;
  }

  const actions = (mission.blocks || [])
    .filter((block) => block.type !== 'recovery')
    .map((block) => getDashboardBlockAction(block, dateKey));

  if (!actions.length) {
    missionActions.innerHTML = `
      <button class="mission-action-button rest" type="button" disabled>
        <strong>Sem blocos ativos</strong>
        <span>campanha sem treino obrigatorio</span>
      </button>
    `;
    return;
  }

  missionActions.innerHTML = actions.map((item) => `
    <button
      class="mission-action-button ${escapeHtml(item.stateInfo.status)}"
      type="button"
      data-dashboard-mission-action="${escapeHtml(item.action)}"
      data-template-id="${escapeHtml(item.templateId || '')}"
      data-workout-id="${escapeHtml(item.workoutId || '')}"
      ${item.disabled ? 'disabled' : ''}
    >
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.meta)}</span>
    </button>
  `).join('');
}

function getWorkoutOriginInfo(workout) {
  if (workout.missionDate && workout.missionBlockType && workout.missionOriginalWorkoutCode) {
    return {
      label: workout.missionSubstitution ? 'SUBSTITUI' : 'CAMPANHA',
      className: workout.missionSubstitution ? 'substitution' : 'mission',
      originalWorkoutCode: workout.missionOriginalWorkoutCode,
      originalWorkoutName: workout.missionOriginalWorkoutName || ''
    };
  }

  const missionBlockEntry = getMissionBlockEntryForWorkout(workout);

  if (missionBlockEntry) {
    const isSubstitution = missionBlockEntry.block.workoutCode !== workout.workoutCode;

    return {
      label: isSubstitution ? 'SUBSTITUI' : 'CAMPANHA',
      className: isSubstitution ? 'substitution' : 'mission',
      originalWorkoutCode: missionBlockEntry.block.workoutCode,
      originalWorkoutName: missionBlockEntry.block.workoutName || ''
    };
  }

  return { label: 'EXTRA', className: 'extra' };
}

function calculateWorkoutVolume(workout) {
  return workout.exercises.reduce((workoutTotal, exercise) => {
    if (exercise.skipped) {
      return workoutTotal;
    }

    return workoutTotal + (exercise.sets || []).reduce((setTotal, set) => {
      return setTotal + Number(set.weight || 0) * Number(set.reps || 0);
    }, 0);
  }, 0);
}

function calculateExerciseVolume(exercise) {
  if (exercise.skipped) {
    return 0;
  }

  return (exercise.sets || []).reduce((total, set) => total + Number(set.weight || 0) * Number(set.reps || 0), 0);
}

function calculateExerciseMaxWeight(exercise) {
  if (exercise.skipped) {
    return 0;
  }

  return Math.max(0, ...(exercise.sets || []).map((set) => Number(set.weight || 0)));
}

function calculateExerciseMaxReps(exercise) {
  if (exercise.skipped) {
    return 0;
  }

  return Math.max(0, ...(exercise.sets || []).map((set) => Number(set.reps || 0)));
}

function calculateExerciseRoundSeconds(exercise) {
  if (exercise.skipped) {
    return 0;
  }

  return (exercise.rounds || [])
    .filter((round) => round.completed !== false)
    .reduce((total, round) => total + Number(round.durationSeconds || 0), 0);
}

function calculateExerciseRoundReps(exercise) {
  if (exercise.skipped) {
    return 0;
  }

  return (exercise.rounds || [])
    .filter((round) => round.completed !== false)
    .reduce((total, round) => total + Number(round.reps || 0), 0);
}

function getWeekLabel(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
}

function formatCompactNumber(value) {
  if (value >= 1000) {
    return `${formatNumber(value / 1000)}K`;
  }

  return formatNumber(value);
}

function renderSummaryCards(container, cards) {
  if (!container) {
    return;
  }

  container.innerHTML = cards.map((card) => `
    <article class="summary-card ${card.tone || 'green'}">
      <div class="summary-card-top">
        <span class="summary-icon">${escapeHtml(card.icon || '#')}</span>
        <span class="summary-label">${escapeHtml(card.label)}</span>
      </div>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail || '')}</p>
    </article>
  `).join('');
}

function getWorkoutTags(workout) {
  return [...new Set(workout.exercises.map((exercise) => exercise.muscleGroup).filter(Boolean))].slice(0, 4);
}

function getMuscleClass(muscle = '') {
  const normalized = muscle.toLowerCase();

  if (normalized.includes('peito')) return 'chest';
  if (normalized.includes('costa') || normalized.includes('dorsal')) return 'back';
  if (normalized.includes('perna') || normalized.includes('quadr') || normalized.includes('glut') || normalized.includes('panturr')) return 'legs';
  if (normalized.includes('ombro') || normalized.includes('trap')) return 'shoulders';
  if (normalized.includes('triceps') || normalized.includes('biceps') || normalized.includes('bra')) return 'arms';

  return 'core';
}

function countValidSets(workout) {
  return workout.exercises.reduce((total, exercise) => {
    if (exercise.skipped) {
      return total;
    }

    return total + (exercise.sets || []).filter((set) => Number(set.weight) > 0 && Number(set.reps) > 0).length;
  }, 0);
}

function countValidRounds(workout) {
  return workout.exercises.reduce((total, exercise) => {
    if (exercise.skipped) {
      return total;
    }

    return total + (exercise.rounds || []).filter((round) => round.completed !== false && Number(round.durationSeconds || 0) > 0).length;
  }, 0);
}

function countSkippedExercises(workout) {
  return (workout.exercises || []).filter((exercise) => exercise.skipped).length;
}

function hasValidExerciseExecution(exercise) {
  return !exercise.skipped
    && ((exercise.sets || []).some((set) => Number(set.weight) > 0 && Number(set.reps) > 0)
      || (exercise.rounds || []).some((round) => round.completed !== false && Number(round.durationSeconds || 0) > 0));
}

function getWorkoutPlannedExecutionRatio(workout) {
  const plannedExercises = (workout.exercises || []).filter((exercise) => (exercise.source || 'planned') === 'planned');
  const exercises = plannedExercises.length ? plannedExercises : workout.exercises || [];

  if (!exercises.length) {
    return 0;
  }

  return exercises.filter(hasValidExerciseExecution).length / exercises.length;
}

function isMissionEligibleWorkout(workout) {
  return isCompletedWorkout(workout) && getWorkoutPlannedExecutionRatio(workout) >= 0.6;
}

function getWorkoutExecutionQuality(workout) {
  const exercises = workout.exercises || [];
  const plannedExercises = exercises.filter((exercise) => (exercise.source || 'planned') === 'planned');
  const extraExercises = exercises.filter((exercise) => exercise.source === 'extra');
  const baseExercises = plannedExercises.length ? plannedExercises : [];
  const plannedCount = baseExercises.length;
  const executedCount = baseExercises.filter(hasValidExerciseExecution).length;
  const skippedCount = baseExercises.filter((exercise) => exercise.skipped).length;
  const extraCount = extraExercises.length;
  const percent = plannedCount ? Math.round((executedCount / plannedCount) * 100) : 0;

  if (!plannedCount && extraCount > 0) {
    return {
      plannedCount,
      executedCount,
      skippedCount,
      extraCount,
      percent: 0,
      label: 'So extra',
      className: 'extra',
      detail: `${extraCount} exercicios extras`
    };
  }

  if (plannedCount > 0 && executedCount === plannedCount) {
    return {
      plannedCount,
      executedCount,
      skippedCount,
      extraCount,
      percent,
      label: 'Completo',
      className: 'complete',
      detail: `${executedCount}/${plannedCount} exercicios planejados`
    };
  }

  if (plannedCount > 0 && percent >= 60) {
    return {
      plannedCount,
      executedCount,
      skippedCount,
      extraCount,
      percent,
      label: 'OK',
      className: 'ok',
      detail: `${executedCount}/${plannedCount} exercicios planejados`
    };
  }

  return {
    plannedCount,
    executedCount,
    skippedCount,
    extraCount,
    percent,
    label: 'Parcial',
    className: 'partial',
    detail: plannedCount ? `${executedCount}/${plannedCount} exercicios planejados` : 'sem ficha planejada'
  };
}

function renderWorkoutQualityTag(quality) {
  return `<span class="row-tag quality-${quality.className}">${escapeHtml(quality.label)} ${quality.plannedCount ? `${quality.percent}%` : ''}</span>`;
}

function formatWorkoutQualitySummary(quality) {
  const skipped = quality.skippedCount ? ` | ${quality.skippedCount} pulados` : '';
  const extras = quality.extraCount ? ` | ${quality.extraCount} extras` : '';

  if (!quality.plannedCount) {
    return `${quality.label}${extras}`;
  }

  return `${quality.detail} | ${quality.percent}%${skipped}${extras}`;
}

function countCompletedUnits(workout) {
  return countValidSets(workout) + countValidRounds(workout);
}

function isCompletedWorkout(workout) {
  return countCompletedUnits(workout) > 0;
}

function getWorkoutByDateAndCode(dateKey, code) {
  return state.allWorkouts.find((workout) => (
    toDateKey(workout.date) === dateKey && workout.workoutCode === code && isCompletedWorkout(workout)
  ));
}

function getTemplateForWorkout(workout) {
  return state.templates.find((template) => (
    template._id === workout.templateId || template.code === workout.workoutCode
  ));
}

function getWorkoutBlockType(workout) {
  if (workout.missionBlockType) {
    return workout.missionBlockType;
  }

  const templateBlockType = getTemplateBlockType(getTemplateForWorkout(workout));

  if (templateBlockType) {
    return templateBlockType;
  }

  const modalities = new Set((workout.exercises || []).map((exercise) => exercise.modality).filter(Boolean));

  if (modalities.has('strength')) return 'strength';
  if (modalities.has('boxing') || modalities.has('kickboxing')) return 'combat';

  return '';
}

function getWorkoutForMissionBlock(dateKey, block) {
  const completedWorkouts = state.allWorkouts.filter((workout) => (
    toDateKey(workout.date) === dateKey && isMissionEligibleWorkout(workout)
  ));
  const exactWorkout = completedWorkouts.find((workout) => workout.workoutCode === block.workoutCode);

  if (exactWorkout) {
    return exactWorkout;
  }

  const assignedWorkout = completedWorkouts.find((workout) => {
    const workoutDateKey = toDateKey(workout.date);
    const missionDateKey = workout.missionDate ? toDateKey(workout.missionDate) : '';

    return workoutDateKey === dateKey
      && isCompletedWorkout(workout)
      && isMissionEligibleWorkout(workout)
      && missionDateKey === dateKey
      && workout.missionBlockType === block.type
      && workout.missionOriginalWorkoutCode === block.workoutCode;
  });

  if (assignedWorkout) {
    return assignedWorkout;
  }

  return completedWorkouts.find((workout) => (
    workout.workoutCode !== block.workoutCode
    && !workout.missionOriginalWorkoutCode
    && getWorkoutBlockType(workout) === block.type
  ));
}

function getWorkoutAttemptForMissionBlock(dateKey, block) {
  const completedWorkouts = state.allWorkouts.filter((workout) => (
    toDateKey(workout.date) === dateKey && isCompletedWorkout(workout)
  ));
  const exactWorkout = completedWorkouts.find((workout) => workout.workoutCode === block.workoutCode);

  if (exactWorkout) {
    return exactWorkout;
  }

  const assignedWorkout = completedWorkouts.find((workout) => {
    const missionDateKey = workout.missionDate ? toDateKey(workout.missionDate) : '';

    return missionDateKey === dateKey
      && workout.missionBlockType === block.type
      && workout.missionOriginalWorkoutCode === block.workoutCode;
  });

  if (assignedWorkout) {
    return assignedWorkout;
  }

  return completedWorkouts.find((workout) => (
    workout.workoutCode !== block.workoutCode
    && !workout.missionOriginalWorkoutCode
    && getWorkoutBlockType(workout) === block.type
  ));
}

function getMissionBlockEntryForWorkout(workout) {
  const mission = getDailyMissionForDate(workout.date);
  const dateKey = toDateKey(workout.date);

  if (!mission || mission.restDay) {
    return null;
  }

  const block = (mission.blocks || []).find((item) => {
    const missionDateKey = workout.missionDate ? toDateKey(workout.missionDate) : '';

    if (missionDateKey === dateKey
      && workout.missionBlockType === item.type
      && workout.missionOriginalWorkoutCode === item.workoutCode) {
      return true;
    }

    return workout.workoutCode === item.workoutCode
      || getWorkoutForMissionBlock(dateKey, item)?._id === workout._id;
  });

  return block ? { mission, block } : null;
}

function getRankForLevel(level) {
  return [...rankTiers].reverse().find((rank) => level >= rank.minLevel) || rankTiers[0];
}

function getWorkoutXpInfo(workout) {
  if (Number(workout.xp?.total || 0) > 0) {
    return {
      execution: Number(workout.xp.execution || 0),
      campaign: Number(workout.xp.campaign || 0),
      total: Number(workout.xp.total || 0),
      snapshot: true
    };
  }

  const execution = calculateWorkoutXp(workout);
  const campaign = calculateWorkoutCampaignXpBreakdown(workout).total;

  return {
    execution,
    campaign,
    total: execution + campaign,
    snapshot: false
  };
}

function countTotalValidSets(workouts) {
  return workouts.reduce((total, workout) => total + countValidSets(workout), 0);
}

function getWorkoutCodesCompletedThisWeek(monday = getMonday()) {
  return weeklySchedule
    .filter((item) => item.code !== 'DESC')
    .filter((item, index) => {
      const date = new Date(monday);

      date.setDate(monday.getDate() + index);
      return Boolean(getWorkoutByDateAndCode(date.toISOString().slice(0, 10), item.code));
    })
    .map((item) => item.code);
}

function getConsecutiveWorkoutCWeeks() {
  let streak = 0;
  const currentMonday = getMonday();

  for (let weekOffset = 0; weekOffset < 12; weekOffset += 1) {
    const monday = new Date(currentMonday);
    let completedC = false;

    monday.setDate(currentMonday.getDate() - weekOffset * 7);

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const date = new Date(monday);

      date.setDate(monday.getDate() + dayOffset);
      completedC = completedC || Boolean(getWorkoutByDateAndCode(date.toISOString().slice(0, 10), 'C'));
    }

    if (!completedC) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function calculateCampaignXpBreakdown() {
  const entries = [];

  state.dailyMissions.forEach((mission) => {
    if (mission.restDay) {
      return;
    }

    const matchingDates = [...new Set(state.allWorkouts
      .filter((workout) => getDailyMissionForDate(workout.date)?.dayIndex === mission.dayIndex)
      .map((workout) => toDateKey(workout.date)))]
      .sort();

    matchingDates.forEach((dateKey) => {
      const requiredBlocks = (mission.blocks || []).filter((block) => block.type !== 'recovery');
      const completedEntries = requiredBlocks.map((block) => ({
        block,
        workout: getWorkoutForMissionBlock(dateKey, block)
      })).filter((entry) => entry.workout);

      completedEntries.forEach((entry) => {
        entries.push({
          type: 'block',
          dateKey,
          workoutId: entry.workout._id,
          label: `${getBlockLabel(entry.block)} ${formatMissionBlockCompletion(entry.block, entry.workout)}`,
          xp: Number(entry.block.xpReward || 0)
        });
      });

      if (requiredBlocks.length > 0 && completedEntries.length === requiredBlocks.length && Number(mission.bonusXp || 0) > 0) {
        const lastWorkout = [...completedEntries]
          .map((entry) => entry.workout)
          .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];

        entries.push({
          type: 'mission-bonus',
          dateKey,
          workoutId: lastWorkout?._id || '',
          label: `Bonus da campanha - ${mission.missionName}`,
          xp: Number(mission.bonusXp || 0)
        });
      }
    });
  });

  return {
    total: entries.reduce((total, entry) => total + entry.xp, 0),
    entries
  };
}

function calculateWorkoutCampaignXpBreakdown(workout) {
  const entries = calculateCampaignXpBreakdown().entries.filter((entry) => entry.workoutId === workout._id);

  return {
    total: entries.reduce((total, entry) => total + entry.xp, 0),
    entries
  };
}

function isWorkoutInsidePeriod(workout, period) {
  if (period === 'all') {
    return true;
  }

  const workoutDate = new Date(workout.date);
  const now = new Date();
  let startDate = new Date(0);

  if (period === 'week') {
    startDate = getMonday(now);
  }

  if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (period === 'quarter') {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 3);
  }

  if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  startDate.setHours(0, 0, 0, 0);
  return workoutDate >= startDate;
}

function getFilteredHistoryWorkouts() {
  const search = state.historySearch.trim().toLowerCase();

  return state.allWorkouts
    .filter((workout) => state.historyCodeFilter === 'all' || workout.workoutCode === state.historyCodeFilter)
    .filter((workout) => {
      if (state.historyMuscleFilter === 'all') {
        return true;
      }

      return workout.exercises.some((exercise) => exercise.muscleGroup === state.historyMuscleFilter);
    })
    .filter((workout) => isWorkoutInsidePeriod(workout, state.historyPeriodFilter))
    .filter((workout) => {
      if (!search) {
        return true;
      }

      const haystack = [
        workout.workoutCode,
        workout.workoutName,
        workout.notes,
        ...workout.exercises.flatMap((exercise) => [exercise.name, exercise.muscleGroup, exercise.subcategory, exercise.notes])
      ].join(' ').toLowerCase();

      return haystack.includes(search);
    })
    .sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date);
      return historySort.value === 'asc' ? diff : -diff;
    });
}

function renderHistoryMuscleOptions() {
  const currentValue = historyMuscleFilter.value || 'all';
  const muscles = [...new Set(state.allWorkouts.flatMap((workout) => (
    workout.exercises.map((exercise) => exercise.muscleGroup).filter(Boolean)
  )))].sort();

  historyMuscleFilter.innerHTML = [
    '<option value="all">Todos</option>',
    ...muscles.map((muscle) => `<option value="${escapeHtml(muscle)}">${escapeHtml(muscle)}</option>`)
  ].join('');
  historyMuscleFilter.value = muscles.includes(currentValue) ? currentValue : 'all';
  state.historyMuscleFilter = historyMuscleFilter.value;
}

function renderHistoryCodeOptions() {
  const currentValue = historyCodeFilter.value || 'all';
  const codes = [...new Set(state.allWorkouts.map((workout) => workout.workoutCode).filter(Boolean))].sort();

  historyCodeFilter.innerHTML = [
    '<option value="all">Todas</option>',
    ...codes.map((code) => `<option value="${escapeHtml(code)}">Treino ${escapeHtml(code)}</option>`)
  ].join('');
  historyCodeFilter.value = codes.includes(currentValue) ? currentValue : 'all';
  state.historyCodeFilter = historyCodeFilter.value;
}

function countMonthlyPrs(workouts) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousBest = new Map();
  let prs = 0;

  [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((workout) => {
    const workoutDate = new Date(workout.date);

    workout.exercises.forEach((exercise) => {
      const key = exercise.name.toLowerCase();
      const maxWeight = Math.max(0, ...(exercise.sets || []).map((set) => Number(set.weight || 0)));
      const maxReps = Math.max(0, ...(exercise.sets || []).map((set) => Number(set.reps || 0)));
      const previous = previousBest.get(key) || { weight: 0, reps: 0 };

      if (workoutDate >= monthStart && (maxWeight > previous.weight || maxReps > previous.reps)) {
        prs += 1;
      }

      previousBest.set(key, {
        weight: Math.max(previous.weight, maxWeight),
        reps: Math.max(previous.reps, maxReps)
      });
    });
  });

  return prs;
}

function getWeeklyMissions(stats) {
  const completedCodes = new Set(getWorkoutCodesCompletedThisWeek(stats.monday));

  return [
    {
      title: 'Completar Treino A',
      description: 'Peito e triceps com pelo menos 1 serie valida',
      reward: 40,
      done: completedCodes.has('A')
    },
    {
      title: 'Completar Treino B',
      description: 'Costas e biceps com pelo menos 1 serie valida',
      reward: 40,
      done: completedCodes.has('B')
    },
    {
      title: 'Completar Treino C',
      description: 'Pernas e ombros com pelo menos 1 serie valida',
      reward: 40,
      done: completedCodes.has('C')
    },
    {
      title: '3 Treinos na Semana',
      description: 'Concluir qualquer 3 treinos validos',
      reward: 60,
      done: stats.completedTrainingDays >= 3,
      progress: Math.min(stats.completedTrainingDays, 3),
      target: 3
    },
    {
      title: 'Semana Full Protocol',
      description: 'Concluir os 6 treinos da rotina semanal',
      reward: 150,
      done: stats.completedTrainingDays >= 6,
      progress: Math.min(stats.completedTrainingDays, 6),
      target: 6
    }
  ];
}

function getMonday(date = new Date()) {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  return monday;
}

function renderDashboardWeeklySchedule(monday) {
  if (!dashboardWeeklySchedule) {
    return;
  }

  const order = [1, 2, 3, 4, 5, 6, 0];
  const sortedMissions = [...state.dailyMissions].sort((a, b) => order.indexOf(a.dayIndex) - order.indexOf(b.dayIndex));
  const source = sortedMissions.length
    ? sortedMissions
    : weeklySchedule.map((item) => ({
        dayIndex: item.day,
        dayOfWeek: item.label,
        restDay: item.code === 'DESC',
        blocks: item.code === 'DESC' ? [{ workoutCode: 'DESC', workoutName: 'Recuperacao' }] : [{ type: 'strength', workoutCode: item.code, workoutName: workoutNames[item.code] }]
      }));

  dashboardWeeklySchedule.innerHTML = source.map((mission, index) => {
    const date = new Date(monday);
    const dayOffset = mission.dayIndex === 0 ? 6 : mission.dayIndex - 1;

    date.setDate(monday.getDate() + dayOffset);

    const dateKey = date.toISOString().slice(0, 10);
    const status = getMissionCompletionForDate(mission, dateKey);
    const isToday = dateKey === todayInputValue();
    const stateClass = mission.restDay ? 'rest' : status.complete ? 'done' : status.completed > 0 || status.attempted > 0 ? 'partial' : isToday ? 'today' : 'pending';
    const codes = (mission.blocks || []).map((block) => {
      const completedWorkout = getWorkoutForMissionBlock(dateKey, block);

      return formatMissionBlockCompletion(block, completedWorkout);
    }).join(' + ');
    const dayLabel = mission.dayOfWeek || weeklySchedule[index]?.label || '';

    return `
      <article class="schedule-day ${stateClass}">
        <span class="schedule-day-name">${escapeHtml(dayLabel.slice(0, 3))}</span>
        <strong>${date.getDate()}</strong>
        <div class="schedule-code">${escapeHtml(codes)}</div>
        <small>${mission.restDay ? 'Descanso' : `${status.completed} de ${status.required} blocos`}</small>
      </article>
    `;
  }).join('');
}

function getWeeklyVolumeTrend(workouts, weekCount = 12) {
  const currentMonday = getMonday();

  return Array.from({ length: weekCount }, (_, index) => {
    const weekStart = new Date(currentMonday);
    const weekEnd = new Date(currentMonday);

    weekStart.setDate(currentMonday.getDate() - (weekCount - 1 - index) * 7);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weekWorkouts = workouts.filter((workout) => {
      const workoutDate = new Date(workout.date);

      return workoutDate >= weekStart && workoutDate < weekEnd && isCompletedWorkout(workout);
    });

    return {
      label: getWeekLabel(weekStart),
      volume: weekWorkouts.reduce((total, workout) => total + calculateWorkoutVolume(workout), 0),
      workouts: weekWorkouts.length
    };
  });
}

function renderDashboardVolumeChart() {
  if (!dashboardVolumeChart || !dashboardVolumeSummary) {
    return;
  }

  const trend = getWeeklyVolumeTrend(state.allWorkouts);
  const maxVolume = Math.max(1, ...trend.map((week) => week.volume));
  const width = 680;
  const height = 260;
  const left = 48;
  const right = 24;
  const top = 34;
  const bottom = 42;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const points = trend.map((week, index) => {
    const x = left + (chartWidth / Math.max(1, trend.length - 1)) * index;
    const y = top + chartHeight - (week.volume / maxVolume) * chartHeight;

    return { ...week, x, y };
  });
  const totalTrendVolume = trend.reduce((total, week) => total + week.volume, 0);
  const bestWeek = trend.reduce((best, week) => (week.volume > best.volume ? week : best), trend[0]);
  const lastWeek = trend.at(-1);

  if (totalTrendVolume <= 0) {
    dashboardVolumeChart.innerHTML = '<p class="empty-state chart-empty">Registre treinos com carga para gerar o grafico de volume.</p>';
    dashboardVolumeSummary.innerHTML = `
      <article>
        <span>Total 12 semanas</span>
        <strong>0 kg</strong>
      </article>
      <article>
        <span>Melhor semana</span>
        <strong>sem dados</strong>
      </article>
      <article>
        <span>Semana atual</span>
        <strong>0 kg</strong>
      </article>
    `;
    return;
  }

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L ${points.at(-1).x.toFixed(2)} ${height - bottom} L ${points[0].x.toFixed(2)} ${height - bottom} Z`;

  dashboardVolumeChart.innerHTML = `
    <svg class="trend-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Volume das ultimas 12 semanas">
      <defs>
        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00ff41" stop-opacity="0.32"></stop>
          <stop offset="100%" stop-color="#00ff41" stop-opacity="0"></stop>
        </linearGradient>
      </defs>
      ${[0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = top + chartHeight * ratio;
        return `<line class="trend-grid-line" x1="${left}" y1="${y}" x2="${width - right}" y2="${y}"></line>`;
      }).join('')}
      <path class="trend-area" d="${areaPath}"></path>
      <path class="trend-line" d="${linePath}"></path>
      ${points.map((point) => `
        <circle class="trend-dot" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="4">
          <title>${point.label}: ${formatNumber(point.volume)} kg | ${point.workouts} treinos</title>
        </circle>
      `).join('')}
      ${points.filter((_, index) => index % 2 === 0 || index === points.length - 1).map((point) => `
        <text class="trend-axis-text" x="${point.x.toFixed(2)}" y="${height - 14}" text-anchor="middle">${escapeHtml(point.label)}</text>
      `).join('')}
      <text class="trend-axis-text" x="${left - 8}" y="${top + 4}" text-anchor="end">${escapeHtml(formatCompactNumber(maxVolume))}</text>
      <text class="trend-axis-text" x="${left - 8}" y="${height - bottom}" text-anchor="end">0</text>
    </svg>
  `;
  dashboardVolumeSummary.innerHTML = `
    <article>
      <span>Total 12 semanas</span>
      <strong>${escapeHtml(formatCompactNumber(totalTrendVolume))} kg</strong>
    </article>
    <article>
      <span>Melhor semana</span>
      <strong>${escapeHtml(bestWeek.label)} | ${escapeHtml(formatCompactNumber(bestWeek.volume))} kg</strong>
    </article>
    <article>
      <span>Semana atual</span>
      <strong>${escapeHtml(formatCompactNumber(lastWeek.volume))} kg</strong>
    </article>
  `;
}

function renderDashboardMuscleDistribution() {
  if (!dashboardMuscleDistribution) {
    return;
  }

  const volumeByMuscle = new Map();

  state.allWorkouts.filter(isCompletedWorkout).forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const muscle = exercise.muscleGroup || 'Outros';
      const volume = calculateExerciseVolume(exercise);

      if (volume > 0) {
        volumeByMuscle.set(muscle, (volumeByMuscle.get(muscle) || 0) + volume);
      }
    });
  });

  const entries = [...volumeByMuscle.entries()]
    .map(([name, volume]) => ({ name, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8);
  const totalVolume = entries.reduce((total, item) => total + item.volume, 0);

  if (!entries.length) {
    dashboardMuscleDistribution.innerHTML = '<p class="empty-state">Registre treinos com carga para gerar distribuicao muscular.</p>';
    return;
  }

  dashboardMuscleDistribution.innerHTML = entries.map((item) => {
    const percent = Math.round((item.volume / Math.max(1, totalVolume)) * 100);

    return `
      <article class="muscle-item">
        <div class="muscle-row-head">
          <span>${escapeHtml(item.name)}</span>
          <strong>${percent}%</strong>
        </div>
        <div class="muscle-bar-bg">
          <span class="muscle-bar-fill ${getMuscleClass(item.name)}" style="width:${percent}%"></span>
        </div>
        <small>${escapeHtml(formatCompactNumber(item.volume))} kg registrados</small>
      </article>
    `;
  }).join('');
}

function getTopPersonalRecords(workouts, limit = 5) {
  const recordsByExercise = new Map();

  workouts.filter(isCompletedWorkout).forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      if (exercise.skipped) {
        return;
      }

      const validSets = (exercise.sets || [])
        .map((set) => ({
          weight: Number(set.weight || 0),
          reps: Number(set.reps || 0),
          volume: Number(set.weight || 0) * Number(set.reps || 0)
        }))
        .filter((set) => set.weight > 0 && set.reps > 0);

      if (!validSets.length) {
        return;
      }

      const bestSet = validSets.reduce((best, set) => {
        if (set.weight > best.weight) return set;
        if (set.weight === best.weight && set.reps > best.reps) return set;
        return best;
      }, validSets[0]);
      const totalVolume = validSets.reduce((total, set) => total + set.volume, 0);
      const current = recordsByExercise.get(exercise.name);
      const candidate = {
        exerciseName: exercise.name,
        workoutCode: workout.workoutCode,
        workoutName: workout.workoutName,
        date: workout.date,
        muscleGroup: exercise.muscleGroup || exercise.category || 'Outros',
        loadMode: getExerciseLoadMode(exercise),
        weight: bestSet.weight,
        reps: bestSet.reps,
        setVolume: bestSet.volume,
        totalVolume
      };

      if (
        !current ||
        candidate.weight > current.weight ||
        (candidate.weight === current.weight && candidate.reps > current.reps) ||
        (candidate.weight === current.weight && candidate.reps === current.reps && candidate.totalVolume > current.totalVolume)
      ) {
        recordsByExercise.set(exercise.name, candidate);
      }
    });
  });

  return [...recordsByExercise.values()]
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      if (b.reps !== a.reps) return b.reps - a.reps;
      return b.totalVolume - a.totalVolume;
    })
    .slice(0, limit);
}

function renderDashboardPrList() {
  if (!dashboardPrList) {
    return;
  }

  const records = getTopPersonalRecords(state.allWorkouts);

  if (!records.length) {
    dashboardPrList.innerHTML = '<p class="empty-state">Registre series com carga para mapear seus PRs.</p>';
    return;
  }

  dashboardPrList.innerHTML = records.map((record, index) => `
    <article class="pr-item">
      <span class="pr-rank">#${index + 1}</span>
      <div class="pr-main">
        <h3>${escapeHtml(record.exerciseName)}</h3>
        <p>${escapeHtml(record.muscleGroup)} | Treino ${escapeHtml(record.workoutCode)} | ${escapeHtml(formatDate(record.date))}</p>
      </div>
      <div class="pr-value">
        <strong>${escapeHtml(formatLoadModeWeight(record.weight, record.loadMode))}</strong>
        <span>${escapeHtml(formatNumber(record.reps))} reps</span>
      </div>
    </article>
  `).join('');
}

function getDashboardActivityEvents(workouts, limit = 8) {
  const events = [];
  const records = getTopPersonalRecords(workouts, 10);
  const recordKeys = new Set(records.map((record) => `${record.exerciseName}-${toDateKey(record.date)}-${record.weight}-${record.reps}`));

  workouts.filter(isCompletedWorkout).forEach((workout) => {
    const origin = getWorkoutOriginInfo(workout);
    const validSets = (workout.exercises || []).reduce((total, exercise) => {
      if (exercise.skipped) {
        return total;
      }

      return total + (exercise.sets || []).filter((set) => Number(set.weight) > 0 && Number(set.reps) > 0).length;
    }, 0);
    const volume = calculateWorkoutVolume(workout);
    const quality = getWorkoutExecutionQuality(workout);
    const dateKey = toDateKey(workout.date);
    const isExtra = origin.className === 'extra';
    const isSubstitution = origin.className === 'substitution';

    events.push({
      type: isExtra ? 'extra' : isSubstitution ? 'substitution' : 'workout',
      date: workout.date,
      title: isExtra
        ? 'Treino extra registrado'
        : isSubstitution
          ? 'Bloco substituido na campanha'
          : 'Bloco da campanha concluido',
      detail: isSubstitution
        ? `${origin.originalWorkoutCode} -> ${workout.workoutCode} | ${workout.workoutName}`
        : `Treino ${workout.workoutCode} - ${workout.workoutName}`,
      meta: `${quality.label} ${quality.plannedCount ? `${quality.percent}%` : ''} | ${validSets} series | ${formatCompactNumber(volume)} kg`
    });

    (workout.exercises || []).forEach((exercise) => {
      if (exercise.skipped) {
        return;
      }

      (exercise.sets || []).forEach((set) => {
        const weight = Number(set.weight || 0);
        const reps = Number(set.reps || 0);

        if (weight <= 0 || reps <= 0) {
          return;
        }

        if (recordKeys.has(`${exercise.name}-${dateKey}-${weight}-${reps}`)) {
          events.push({
            type: 'pr',
            date: workout.date,
            title: 'PR detectado',
            detail: exercise.name,
            meta: `${formatLoadModeWeight(weight, getExerciseLoadMode(exercise))} x ${formatNumber(reps)} reps`
          });
        }
      });
    });
  });

  return events
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

function renderDashboardActivityFeed() {
  if (!dashboardActivityFeed) {
    return;
  }

  const events = getDashboardActivityEvents(state.allWorkouts);

  if (!events.length) {
    dashboardActivityFeed.innerHTML = '<p class="empty-state">Salve um treino para gerar o feed de atividade.</p>';
    return;
  }

  dashboardActivityFeed.innerHTML = events.map((event) => `
    <article class="feed-item ${escapeHtml(event.type)}">
      <span class="feed-dot"></span>
      <div>
        <div class="feed-head">
          <h3>${escapeHtml(event.title)}</h3>
          <time>${escapeHtml(formatDate(event.date))}</time>
        </div>
        <p>${escapeHtml(event.detail)}</p>
        <small>${escapeHtml(event.meta)}</small>
      </div>
    </article>
  `).join('');
}

function calculateCurrentStreak(workouts) {
  const trainedDates = new Set(workouts.filter(isCompletedWorkout).map((workout) => toDateKey(workout.date)));
  let cursor = new Date();
  let streak = 0;

  cursor.setHours(0, 0, 0, 0);

  for (let attempts = 0; attempts < 45; attempts += 1) {
    const day = cursor.getDay();
    const dateKey = cursor.toISOString().slice(0, 10);

    if (day === 0) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (!trainedDates.has(dateKey)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#b91f17' : '#666666';
}

function setTemplateStatus(message, isError = false) {
  templateStatusMessage.textContent = message;
  templateStatusMessage.style.color = isError ? '#b91f17' : '#666666';
}

function setWorkoutTypeStatus(message, isError = false) {
  workoutTypeStatusMessage.textContent = message;
  workoutTypeStatusMessage.style.color = isError ? '#b91f17' : '#666666';
}

function getStrengthWorkoutType() {
  return state.workoutTypes.find((type) => type.code === 'strength') || {
    _id: '',
    code: 'strength',
    name: 'Musculacao',
    measurementType: 'sets_reps_weight'
  };
}

function getSelectedTemplateWorkoutType() {
  return state.workoutTypes.find((type) => type._id === templateWorkoutTypeInput.value) || getStrengthWorkoutType();
}

function getWorkoutTypeName(code) {
  return state.workoutTypes.find((type) => type.code === code)?.name || code || 'Musculacao';
}

function getMeasurementLabel(measurementType) {
  const labels = {
    sets_reps_weight: 'Series + carga + reps',
    sets_reps: 'Series + reps',
    rounds_time: 'Rounds + tempo',
    rounds_time_reps: 'Rounds + golpes',
    duration: 'Duracao'
  };

  return labels[measurementType] || measurementType || 'Series + carga + reps';
}

function inferExerciseLoadMode(exercise = {}) {
  const measurementType = exercise.measurementType || 'sets_reps_weight';
  const name = String(exercise.name || '').toLowerCase();
  const equipment = (exercise.equipment || []).join(' ').toLowerCase();
  const text = `${name} ${equipment}`;

  if (measurementType === 'rounds_time' || measurementType === 'rounds_time_reps' || measurementType === 'sets_reps') {
    return 'non_weight';
  }

  if (text.includes('barra')) return 'bar_total';
  if (text.includes('maquina') || text.includes('polia')) return 'machine_stack';
  if (text.includes('peso corporal') || text.includes('prancha') || text.includes('abdominal') || text.includes('elevacao de pernas')) return 'bodyweight';

  return 'dumbbell_each';
}

function getExerciseLoadMode(exercise = {}) {
  const inferred = inferExerciseLoadMode(exercise);

  if (exercise.loadMode && (exercise.loadMode !== 'dumbbell_each' || inferred === 'dumbbell_each')) {
    return exercise.loadMode;
  }

  return inferred;
}

function getLoadModeMeta(loadMode = 'dumbbell_each') {
  const modes = {
    dumbbell_each: {
      label: 'Halteres',
      fieldLabel: 'Peso por halter',
      unit: 'kg cada',
      hint: 'registre o peso de um halter; o app calcula o volume considerando reps x peso informado.'
    },
    bar_total: {
      label: 'Barra',
      fieldLabel: 'Peso total',
      unit: 'kg total',
      hint: 'registre barra + anilhas como carga total montada.'
    },
    machine_stack: {
      label: 'Maquina',
      fieldLabel: 'Carga da maquina',
      unit: 'kg maquina',
      hint: 'registre o numero exibido no equipamento.'
    },
    bodyweight: {
      label: 'Peso corporal',
      fieldLabel: 'Carga extra',
      unit: 'kg extra',
      hint: 'registre 0 quando for apenas peso corporal; use carga somente se houver peso adicional.'
    },
    non_weight: {
      label: 'Sem carga',
      fieldLabel: 'Carga',
      unit: 'kg',
      hint: 'este exercicio nao usa peso para progresso principal.'
    }
  };

  return modes[loadMode] || modes.dumbbell_each;
}

function formatLoadModeWeight(weight, loadMode) {
  const value = formatCompactNumber(Number(weight || 0));
  const meta = getLoadModeMeta(loadMode);

  return `${value} ${meta.unit}`;
}

function formatSeconds(seconds) {
  const value = Number(seconds || 0);

  if (!value) {
    return '0s';
  }

  if (value < 60) {
    return `${value}s`;
  }

  const minutes = Math.floor(value / 60);
  const remainingSeconds = value % 60;

  return remainingSeconds ? `${minutes}m${String(remainingSeconds).padStart(2, '0')}s` : `${minutes}min`;
}

function formatExerciseGroup(exercise = {}) {
  const category = exercise.category || exercise.muscleGroup || '';
  const subcategory = exercise.subcategory || '';

  if (!subcategory || subcategory === category) {
    return category;
  }

  return `${category} > ${subcategory}`;
}

function formatExercisePrescription(exercise) {
  const measurementType = exercise.measurementType || 'sets_reps_weight';

  if (measurementType === 'rounds_time' || measurementType === 'rounds_time_reps') {
    const rounds = Number(exercise.plannedRounds ?? exercise.defaultRounds ?? 0);
    const duration = Number(exercise.plannedDurationSeconds ?? exercise.defaultDurationSeconds ?? 0);
    const rest = Number(exercise.plannedRestSeconds ?? exercise.defaultRestSeconds ?? 0);
    const suffix = measurementType === 'rounds_time_reps' ? ' + golpes' : '';

    return `${rounds} rounds | ${formatSeconds(duration)} | desc. ${formatSeconds(rest)}${suffix}`;
  }

  return `${Number(exercise.plannedSets ?? exercise.defaultSets ?? 0)}x ${exercise.plannedReps ?? exercise.defaultReps ?? ''}`.trim();
}

function hasExerciseMedia(exercise = {}) {
  return Boolean(exercise.imageUrl);
}

function getExerciseImageMarkup(exercise = {}, size = 'compact') {
  if (!hasExerciseMedia(exercise)) {
    return `
      <div class="exercise-media-frame ${size} empty">
        <span>${escapeHtml((exercise.category || exercise.muscleGroup || 'EX').slice(0, 3).toUpperCase())}</span>
      </div>
    `;
  }

  return `
    <figure
      class="exercise-media-frame ${size} has-preview"
      role="button"
      tabindex="0"
      aria-label="Ampliar imagem de ${escapeHtml(exercise.name || 'exercicio')}"
      data-preview-image="${escapeHtml(exercise.imageUrl)}"
      data-preview-alt="${escapeHtml(exercise.imageAlt || `Execucao de ${exercise.name || 'exercicio'}`)}"
    >
      <img src="${escapeHtml(exercise.imageUrl)}" alt="${escapeHtml(exercise.imageAlt || `Execucao de ${exercise.name || 'exercicio'}`)}" loading="lazy" />
      <figcaption>${escapeHtml(exercise.mediaProvider || 'media')}</figcaption>
    </figure>
  `;
}

function getExerciseInstructionMarkup(exercise = {}) {
  return '';
}

let mediaHoverPreview = null;
let mediaLightbox = null;
let activePreviewTrigger = null;

function ensureMediaHoverPreview() {
  if (mediaHoverPreview) {
    return mediaHoverPreview;
  }

  mediaHoverPreview = document.createElement('div');
  mediaHoverPreview.className = 'exercise-media-hover-preview';
  mediaHoverPreview.hidden = true;
  mediaHoverPreview.innerHTML = '<img alt="" />';
  document.body.append(mediaHoverPreview);

  return mediaHoverPreview;
}

function ensureMediaLightbox() {
  if (mediaLightbox) {
    return mediaLightbox;
  }

  mediaLightbox = document.createElement('div');
  mediaLightbox.className = 'exercise-media-lightbox';
  mediaLightbox.hidden = true;
  mediaLightbox.innerHTML = `
    <div class="exercise-media-lightbox-backdrop" data-close-media-lightbox></div>
    <section class="exercise-media-lightbox-panel" role="dialog" aria-modal="true" aria-label="Imagem ampliada do exercicio">
      <button class="icon-button neutral exercise-media-lightbox-close" type="button" aria-label="Fechar imagem ampliada" data-close-media-lightbox>x</button>
      <img alt="" />
    </section>
  `;
  document.body.append(mediaLightbox);

  return mediaLightbox;
}

function getPreviewTrigger(target) {
  return target.closest?.('.exercise-media-frame.has-preview[data-preview-image]');
}

function positionMediaHoverPreview(event) {
  if (!mediaHoverPreview || mediaHoverPreview.hidden) {
    return;
  }

  const previewRect = mediaHoverPreview.getBoundingClientRect();
  const gap = 18;
  const viewportPadding = 12;
  let left = event.clientX + gap;
  let top = event.clientY + gap;

  if (left + previewRect.width + viewportPadding > window.innerWidth) {
    left = event.clientX - previewRect.width - gap;
  }

  if (top + previewRect.height + viewportPadding > window.innerHeight) {
    top = event.clientY - previewRect.height - gap;
  }

  mediaHoverPreview.style.left = `${Math.max(viewportPadding, left)}px`;
  mediaHoverPreview.style.top = `${Math.max(viewportPadding, top)}px`;
}

function showMediaHoverPreview(trigger, event) {
  if (window.matchMedia('(hover: none)').matches) {
    return;
  }

  const preview = ensureMediaHoverPreview();
  const image = preview.querySelector('img');

  activePreviewTrigger = trigger;
  image.src = trigger.dataset.previewImage;
  image.alt = trigger.dataset.previewAlt || '';
  preview.hidden = false;
  positionMediaHoverPreview(event);
}

function hideMediaHoverPreview() {
  activePreviewTrigger = null;

  if (mediaHoverPreview) {
    mediaHoverPreview.hidden = true;
  }
}

function openMediaLightbox(trigger) {
  const lightbox = ensureMediaLightbox();
  const image = lightbox.querySelector('img');

  hideMediaHoverPreview();
  image.src = trigger.dataset.previewImage;
  image.alt = trigger.dataset.previewAlt || '';
  lightbox.hidden = false;
  document.body.classList.add('media-lightbox-open');
  lightbox.querySelector('.exercise-media-lightbox-close').focus();
}

function closeMediaLightbox() {
  if (!mediaLightbox) {
    return;
  }

  mediaLightbox.hidden = true;
  document.body.classList.remove('media-lightbox-open');
}

function createSetRow(set = {}, loadMode = 'dumbbell_each') {
  const row = document.createElement('div');
  row.className = 'set-row';
  const loadMeta = getLoadModeMeta(loadMode);

  row.innerHTML = `
    <span class="set-number">S</span>
    <div class="set-field">
      <input class="set-weight" type="number" min="0" step="0.5" value="${set.weight ?? ''}" placeholder="${escapeHtml(loadMeta.fieldLabel)}" aria-label="${escapeHtml(loadMeta.fieldLabel)} em kg" required />
      <small>${escapeHtml(loadMeta.unit)}</small>
    </div>
    <div class="set-field">
      <input class="set-reps" type="number" min="0" step="1" value="${set.reps ?? ''}" placeholder="Reps" aria-label="Repeticoes" required />
      <small>reps</small>
    </div>
    <button class="icon-button remove-set" type="button" aria-label="Remover serie">x</button>
  `;

  row.querySelector('.remove-set').addEventListener('click', () => {
    const setsList = row.closest('.sets-list');

    if (setsList.children.length > 1) {
      row.remove();
      refreshSetNumbers(setsList);
    }
  });

  return row;
}

function createRoundRow(round = {}) {
  const row = document.createElement('div');
  row.className = 'set-row round-row';

  row.innerHTML = `
    <span class="set-number">R</span>
    <div class="set-field">
      <input class="round-duration" type="number" min="0" step="1" value="${round.durationSeconds ?? ''}" placeholder="Tempo" aria-label="Duracao do round em segundos" required />
      <small>seg</small>
    </div>
    <div class="set-field">
      <input class="round-rest" type="number" min="0" step="1" value="${round.restSeconds ?? ''}" placeholder="Desc." aria-label="Descanso em segundos" required />
      <small>desc</small>
    </div>
    <div class="set-field">
      <input class="round-reps" type="number" min="0" step="1" value="${round.reps ?? 0}" placeholder="Golpes" aria-label="Golpes ou repeticoes" />
      <small>golpes</small>
    </div>
    <div class="set-field">
      <input class="round-intensity" type="number" min="0" max="10" step="1" value="${round.intensity ?? 7}" placeholder="Int." aria-label="Intensidade de 0 a 10" />
      <small>0-10</small>
    </div>
    <button class="icon-button remove-set" type="button" aria-label="Remover round">x</button>
  `;

  row.querySelector('.remove-set').addEventListener('click', () => {
    const setsList = row.closest('.sets-list');

    if (setsList.children.length > 1) {
      row.remove();
      refreshSetNumbers(setsList);
    }
  });

  return row;
}

function refreshSetNumbers(setsList) {
  [...setsList.children].forEach((row, index) => {
    row.querySelector('.set-number').textContent = `${row.classList.contains('round-row') ? 'R' : 'S'}${index + 1}`;
  });
}

function refreshExerciseNumbers() {
  [...exerciseList.children].forEach((card, index) => {
    card.querySelector('.exercise-index').textContent = `Exercicio ${index + 1}`;
  });
}

function updateExerciseSkippedState(card) {
  const skippedInput = card.querySelector('.exercise-skipped');
  const reasonInput = card.querySelector('.exercise-skip-reason');
  const skipped = Boolean(skippedInput?.checked);

  card.dataset.skipped = skipped ? 'true' : 'false';
  card.classList.toggle('exercise-skipped-card', skipped);

  card.querySelectorAll('.set-row input').forEach((input) => {
    input.disabled = skipped;
    input.required = !skipped && (input.classList.contains('set-weight')
      || input.classList.contains('set-reps')
      || input.classList.contains('round-duration')
      || input.classList.contains('round-rest'));

    if (skipped) {
      input.value = '';
    }
  });

  card.querySelectorAll('.set-row button, .add-set').forEach((button) => {
    button.disabled = skipped;
  });

  if (reasonInput) {
    reasonInput.disabled = !skipped;
    reasonInput.hidden = !skipped;

    if (!skipped) {
      reasonInput.value = '';
    }
  }
}

function addExercise(exercise = {}) {
  const fragment = exerciseTemplate.content.cloneNode(true);
  const card = fragment.querySelector('.exercise-card');
  const setsList = card.querySelector('.sets-list');
  const measurementType = exercise.measurementType || 'sets_reps_weight';
  const isRoundBased = measurementType === 'rounds_time' || measurementType === 'rounds_time_reps';
  const loadMode = getExerciseLoadMode(exercise);
  const loadMeta = getLoadModeMeta(loadMode);

  card.querySelector('.exercise-name').value = exercise.name || '';
  card.querySelector('.exercise-muscle').value = exercise.muscleGroup || exercise.category || '';
  card.querySelector('.exercise-notes').value = exercise.notes || '';
  card.dataset.subcategory = exercise.subcategory || '';
  card.dataset.modality = exercise.modality || 'strength';
  card.dataset.measurementType = measurementType;
  card.dataset.loadMode = loadMode;
  card.dataset.source = exercise.source || 'planned';
  card.dataset.plannedSets = exercise.plannedSets || '';
  card.dataset.plannedReps = exercise.plannedReps || '';
  card.dataset.plannedRounds = exercise.plannedRounds || '';
  card.dataset.plannedDurationSeconds = exercise.plannedDurationSeconds || '';
  card.dataset.plannedRestSeconds = exercise.plannedRestSeconds || '';
  card.dataset.mediaProvider = exercise.mediaProvider || '';
  card.dataset.externalExerciseId = exercise.externalExerciseId || '';
  card.dataset.imageUrl = exercise.imageUrl || '';
  card.dataset.imageAlt = exercise.imageAlt || '';
  card.dataset.imageLicense = exercise.imageLicense || '';
  card.dataset.imageLicenseUrl = exercise.imageLicenseUrl || '';
  card.dataset.imageAuthor = exercise.imageAuthor || '';
  card.dataset.imageAuthorUrl = exercise.imageAuthorUrl || '';
  card.dataset.imageSourceUrl = exercise.imageSourceUrl || '';
  card.dataset.instructions = '[]';
  card.dataset.tips = JSON.stringify(Array.isArray(exercise.tips) ? exercise.tips : []);
  card.dataset.skipped = exercise.skipped ? 'true' : 'false';

  if (exercise.plannedSets || exercise.plannedReps || exercise.plannedRounds) {
    card.classList.add('workout-generated');
    card.classList.toggle('workout-extra-exercise', card.dataset.source === 'extra');
    const title = document.createElement('div');
    title.className = 'generated-exercise-title';
    title.innerHTML = `
      ${getExerciseImageMarkup(exercise, 'workout')}
      <div>
        <h3>${escapeHtml(exercise.name || '')}</h3>
        <p>${escapeHtml(formatExerciseGroup(exercise))}</p>
        ${getExerciseInstructionMarkup(exercise)}
      </div>
    `;
    card.querySelector('.exercise-card-header').after(title);

    const meta = document.createElement('p');
    meta.className = 'planned-meta';
    meta.textContent = `${card.dataset.source === 'extra' ? 'Adicionado no treino' : 'Planejado'}: ${formatExercisePrescription(exercise)}`;
    card.querySelector('.form-grid').after(meta);

    if (!isRoundBased) {
      const loadInfo = document.createElement('p');
      loadInfo.className = 'load-mode-meta';
      loadInfo.innerHTML = `<strong>${escapeHtml(loadMeta.label)}:</strong> ${escapeHtml(loadMeta.hint)}`;
      meta.after(loadInfo);
    }
  }

  if ((card.dataset.source || 'planned') === 'planned') {
    const skipControl = document.createElement('div');
    skipControl.className = 'exercise-skip-control';
    skipControl.innerHTML = `
      <label>
        <input class="exercise-skipped" type="checkbox" ${exercise.skipped ? 'checked' : ''} />
        <span>Nao vou fazer este exercicio hoje</span>
      </label>
      <input class="exercise-skip-reason" type="text" placeholder="Motivo opcional" value="${escapeHtml(exercise.skipReason || '')}" ${exercise.skipped ? '' : 'hidden disabled'} />
    `;
    const anchor = card.querySelector('.planned-meta') || card.querySelector('.form-grid');

    anchor.after(skipControl);
    skipControl.querySelector('.exercise-skipped').addEventListener('change', () => updateExerciseSkippedState(card));
  }

  if (isRoundBased) {
    const rounds = exercise.rounds?.length
      ? exercise.rounds
      : Array.from({ length: Number(exercise.plannedRounds || 1) }, () => ({
          durationSeconds: exercise.plannedDurationSeconds || '',
          restSeconds: exercise.plannedRestSeconds || '',
          reps: '',
          intensity: 7
        }));

    rounds.forEach((round) => setsList.append(createRoundRow(round)));
  } else {
    const sets = exercise.sets?.length ? exercise.sets : [{ weight: '', reps: '' }];
    sets.forEach((set) => setsList.append(createSetRow(set, loadMode)));
  }

  refreshSetNumbers(setsList);

  card.querySelector('.add-set').addEventListener('click', () => {
    setsList.append(isRoundBased ? createRoundRow({
      durationSeconds: exercise.plannedDurationSeconds || '',
      restSeconds: exercise.plannedRestSeconds || '',
      intensity: 7
    }) : createSetRow({}, loadMode));
    refreshSetNumbers(setsList);
  });
  card.querySelector('.add-set').textContent = isRoundBased ? 'Adicionar round' : 'Adicionar serie';
  updateExerciseSkippedState(card);

  card.querySelector('.remove-exercise').addEventListener('click', () => {
    if (exerciseList.children.length > 1) {
      card.remove();
      refreshExerciseNumbers();
    }
  });

  exerciseList.append(card);
  refreshExerciseNumbers();
}

function addExerciseFromTemplate(exercise = {}) {
  const measurementType = exercise.measurementType || 'sets_reps_weight';
  const isRoundBased = measurementType === 'rounds_time' || measurementType === 'rounds_time_reps';

  if (isRoundBased) {
    addExercise({
      name: exercise.name,
      muscleGroup: exercise.category,
      subcategory: exercise.subcategory || '',
      modality: exercise.modality || 'boxing',
      measurementType,
      loadMode: getExerciseLoadMode(exercise),
      source: exercise.source || 'planned',
      plannedRounds: Number(exercise.plannedRounds || exercise.defaultRounds || 1),
      plannedDurationSeconds: Number(exercise.plannedDurationSeconds || exercise.defaultDurationSeconds || 0),
      plannedRestSeconds: Number(exercise.plannedRestSeconds || exercise.defaultRestSeconds || 0),
      mediaProvider: exercise.mediaProvider || '',
      externalExerciseId: exercise.externalExerciseId || '',
      imageUrl: exercise.imageUrl || '',
      imageAlt: exercise.imageAlt || '',
      imageLicense: exercise.imageLicense || '',
      imageLicenseUrl: exercise.imageLicenseUrl || '',
      imageAuthor: exercise.imageAuthor || '',
      imageAuthorUrl: exercise.imageAuthorUrl || '',
      imageSourceUrl: exercise.imageSourceUrl || '',
      instructions: [],
      tips: exercise.tips || []
    });
    return;
  }

  const plannedSets = Number(exercise.plannedSets || exercise.defaultSets || 1);
  const sets = Array.from({ length: plannedSets }, (_, index) => ({
    setNumber: index + 1,
    weight: '',
    reps: ''
  }));

  addExercise({
    name: exercise.name,
    muscleGroup: exercise.category,
    subcategory: exercise.subcategory || '',
    modality: exercise.modality || 'strength',
    measurementType,
    loadMode: getExerciseLoadMode(exercise),
    source: exercise.source || 'planned',
    plannedSets,
    plannedReps: exercise.plannedReps || exercise.defaultReps || '',
    mediaProvider: exercise.mediaProvider || '',
    externalExerciseId: exercise.externalExerciseId || '',
    imageUrl: exercise.imageUrl || '',
    imageAlt: exercise.imageAlt || '',
    imageLicense: exercise.imageLicense || '',
    imageLicenseUrl: exercise.imageLicenseUrl || '',
    imageAuthor: exercise.imageAuthor || '',
    imageAuthorUrl: exercise.imageAuthorUrl || '',
    imageSourceUrl: exercise.imageSourceUrl || '',
    instructions: [],
    tips: exercise.tips || [],
    sets
  });
}

function getSelectedWorkoutTemplate() {
  return state.templates.find((template) => template._id === workoutTemplateInput.value);
}

function getWorkoutPickerModality() {
  return getSelectedWorkoutTemplate()?.workoutTypeCode || '';
}

function getWorkoutPickerExercises() {
  const modality = getWorkoutPickerModality();

  if (!modality) {
    return [];
  }

  return state.exercises.filter((exercise) => (exercise.modality || 'strength') === modality);
}

function getWorkoutPickerSubcategories(category = workoutExerciseCategoryFilter?.value || 'all') {
  return [...new Set(getWorkoutPickerExercises()
    .filter((exercise) => category === 'all' || exercise.category === category)
    .map((exercise) => exercise.subcategory)
    .filter(Boolean))]
    .sort();
}

function refreshWorkoutExercisePickerOptions() {
  if (!workoutExerciseCategoryFilter || !workoutExerciseSubcategoryFilter) {
    return;
  }

  const currentCategory = workoutExerciseCategoryFilter.value;
  const currentSubcategory = workoutExerciseSubcategoryFilter.value;
  const categories = [...new Set(getWorkoutPickerExercises().map((exercise) => exercise.category).filter(Boolean))].sort();

  workoutExerciseCategoryFilter.innerHTML = [
    '<option value="all">Todas</option>',
    ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
  ].join('');
  workoutExerciseCategoryFilter.value = [...workoutExerciseCategoryFilter.options].some((option) => option.value === currentCategory) ? currentCategory : 'all';

  const subcategories = getWorkoutPickerSubcategories(workoutExerciseCategoryFilter.value);
  setSelectOptions(workoutExerciseSubcategoryFilter, subcategories, currentSubcategory);
}

function renderWorkoutExercisePicker() {
  if (!workoutExercisePicker || !workoutExercisePickerList) {
    return;
  }

  const selectedTemplate = getSelectedWorkoutTemplate();
  const modality = getWorkoutPickerModality();

  addExerciseButton.hidden = !selectedTemplate;

  if (!selectedTemplate) {
    workoutExercisePicker.hidden = true;
    return;
  }

  refreshWorkoutExercisePickerOptions();

  if (workoutExercisePickerMode) {
    workoutExercisePickerMode.textContent = getWorkoutTypeName(modality);
  }

  const category = workoutExerciseCategoryFilter.value;
  const subcategory = workoutExerciseSubcategoryFilter.value;
  const search = workoutExerciseSearch.value.trim().toLowerCase();
  const currentExerciseNames = new Set([...exerciseList.querySelectorAll('.exercise-name')]
    .map((input) => input.value.trim().toLowerCase())
    .filter(Boolean));
  const filteredExercises = getWorkoutPickerExercises().filter((exercise) => {
    const matchesCategory = category === 'all' || exercise.category === category;
    const matchesSubcategory = subcategory === 'all' || exercise.subcategory === subcategory;
    const searchableText = [exercise.name, exercise.category, exercise.subcategory].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch = !search || searchableText.includes(search);

    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  if (!filteredExercises.length) {
    workoutExercisePickerList.innerHTML = `<p class="empty-state">Nenhum exercicio de ${escapeHtml(getWorkoutTypeName(modality))} encontrado.</p>`;
    return;
  }

  workoutExercisePickerList.innerHTML = filteredExercises.map((exercise) => {
    const isSelected = currentExerciseNames.has(String(exercise.name || '').toLowerCase());
    const isRoundBased = (exercise.measurementType || 'sets_reps_weight').startsWith('rounds');
    const loadMeta = getLoadModeMeta(getExerciseLoadMode(exercise));

    return `
      <article class="catalog-item">
        ${getExerciseImageMarkup(exercise, 'thumb')}
        <div>
          <p class="catalog-title">${escapeHtml(exercise.name)}</p>
          <div class="history-meta">${escapeHtml(getWorkoutTypeName(exercise.modality || 'strength'))} | ${escapeHtml(formatExerciseGroup(exercise))} | ${escapeHtml(formatExercisePrescription(exercise))}${isRoundBased ? '' : ` | ${escapeHtml(loadMeta.label)}`}</div>
        </div>
        <button class="button ${isSelected ? 'button-ghost' : 'button-secondary'}" type="button" data-workout-exercise-id="${exercise._id}" ${isSelected ? 'disabled' : ''}>
          ${isSelected ? 'No treino' : 'Adicionar'}
        </button>
      </article>
    `;
  }).join('');
}

function resetWorkoutExercisePicker() {
  if (!workoutExercisePicker) {
    return;
  }

  workoutExercisePicker.hidden = true;
  if (workoutExerciseCategoryFilter) workoutExerciseCategoryFilter.value = 'all';
  if (workoutExerciseSubcategoryFilter) workoutExerciseSubcategoryFilter.value = 'all';
  if (workoutExerciseSearch) workoutExerciseSearch.value = '';
}

function populateWorkoutFromTemplate(templateId) {
  const template = state.templates.find((item) => item._id === templateId);
  exerciseList.innerHTML = '';
  targetMusclesInput.value = '';
  resetWorkoutExercisePicker();

  if (!template) {
    exerciseList.innerHTML = '<p class="empty-state">Escolha uma ficha para carregar os exercicios.</p>';
    addExerciseButton.hidden = true;
    renderWorkoutOrigin();
    return;
  }

  targetMusclesInput.value = [...new Set(template.exercises.map((exercise) => exercise.category))].join(', ');
  template.exercises.forEach(addExerciseFromTemplate);
  addExerciseButton.hidden = false;
  renderWorkoutOrigin();
  renderWorkoutExercisePicker();
}

function getFormPayload() {
  const selectedTemplate = state.templates.find((template) => template._id === workoutTemplateInput.value);
  const context = state.editingId
    ? state.workoutFormContext
    : getWorkoutFormContext(selectedTemplate, dateInput.value);
  const assignment = context.assignment || {};
  const exercises = [...exerciseList.children].map((card) => {
    const measurementType = card.dataset.measurementType || 'sets_reps_weight';
    const isRoundBased = measurementType === 'rounds_time' || measurementType === 'rounds_time_reps';
    const skipped = card.dataset.skipped === 'true';
    const sets = skipped || isRoundBased ? [] : [...card.querySelectorAll('.set-row')].map((row, index) => ({
      setNumber: index + 1,
      weight: Number(row.querySelector('.set-weight').value),
      reps: Number(row.querySelector('.set-reps').value)
    }));
    const rounds = !skipped && isRoundBased ? [...card.querySelectorAll('.round-row')].map((row, index) => ({
      roundNumber: index + 1,
      durationSeconds: Number(row.querySelector('.round-duration').value),
      restSeconds: Number(row.querySelector('.round-rest').value),
      reps: Number(row.querySelector('.round-reps').value || 0),
      intensity: Number(row.querySelector('.round-intensity').value || 0),
      completed: true
    })) : [];

    return {
      name: card.querySelector('.exercise-name').value.trim(),
      muscleGroup: card.querySelector('.exercise-muscle').value.trim(),
      subcategory: card.dataset.subcategory || '',
      modality: card.dataset.modality || selectedTemplate?.workoutTypeCode || 'strength',
      measurementType,
      loadMode: card.dataset.loadMode || 'dumbbell_each',
      source: card.dataset.source || 'planned',
      plannedSets: Number(card.dataset.plannedSets || sets.length),
      plannedReps: card.dataset.plannedReps || '',
      plannedRounds: Number(card.dataset.plannedRounds || rounds.length),
      plannedDurationSeconds: Number(card.dataset.plannedDurationSeconds || 0),
      plannedRestSeconds: Number(card.dataset.plannedRestSeconds || 0),
      mediaProvider: card.dataset.mediaProvider || '',
      externalExerciseId: card.dataset.externalExerciseId || '',
      imageUrl: card.dataset.imageUrl || '',
      imageAlt: card.dataset.imageAlt || '',
      imageLicense: card.dataset.imageLicense || '',
      imageLicenseUrl: card.dataset.imageLicenseUrl || '',
      imageAuthor: card.dataset.imageAuthor || '',
      imageAuthorUrl: card.dataset.imageAuthorUrl || '',
      imageSourceUrl: card.dataset.imageSourceUrl || '',
      instructions: [],
      tips: JSON.parse(card.dataset.tips || '[]'),
      completedSets: skipped ? 0 : sets.length,
      completedRounds: skipped ? 0 : rounds.length,
      skipped,
      skipReason: skipped ? card.querySelector('.exercise-skip-reason')?.value.trim() || '' : '',
      sets,
      rounds,
      notes: card.querySelector('.exercise-notes').value.trim()
    };
  });

  return {
    date: dateInput.value,
    templateId: selectedTemplate?._id,
    workoutCode: selectedTemplate?.code || '',
    workoutName: selectedTemplate?.name || '',
    missionDate: assignment.missionDate || null,
    missionBlockType: assignment.missionBlockType || '',
    missionOriginalWorkoutCode: assignment.missionOriginalWorkoutCode || '',
    missionOriginalWorkoutName: assignment.missionOriginalWorkoutName || '',
    missionSubstitution: Boolean(assignment.missionSubstitution),
    durationMinutes: Number(durationInput.value || 0),
    exercises,
    notes: notesInput.value.trim()
  };
}

function resetForm() {
  state.editingId = null;
  state.workoutFormContext = {
    source: 'manual',
    returnTab: '',
    assignment: null
  };
  formTitle.textContent = 'NEW_SESSION.exe';
  form.reset();
  dateInput.value = todayInputValue();
  durationInput.value = '';
  targetMusclesInput.value = '';
  exerciseList.innerHTML = '';
  exerciseList.innerHTML = '<p class="empty-state">Escolha uma ficha para carregar os exercicios.</p>';
  renderWorkoutOrigin();
  setStatus('');
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Nao foi possivel concluir a operacao.');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function loadWorkouts() {
  const query = state.filter === 'all' ? '' : `?workoutCode=${state.filter}`;
  state.allWorkouts = await requestJson('/api/workouts');
  state.workouts = state.filter === 'all' ? state.allWorkouts : await requestJson(`/api/workouts${query}`);
  renderHistoryCodeOptions();
  renderHistoryMuscleOptions();
  renderHistory();
  renderMetrics();
  renderDashboard();
  renderProgress();
}

async function loadWorkoutDetails(workoutId) {
  const workout = await requestJson(`/api/workouts/${workoutId}`);
  const replaceWorkout = (items) => {
    const index = items.findIndex((item) => item._id === workoutId);

    if (index >= 0) {
      items[index] = workout;
    }
  };

  replaceWorkout(state.allWorkouts);
  replaceWorkout(state.workouts);

  return workout;
}

async function loadExercises() {
  state.exercises = await requestJson('/api/exercises?syncMedia=1');
  renderCategoryOptions();
  renderCatalog();
}

async function loadWorkoutTypes() {
  state.workoutTypes = await requestJson('/api/workout-types');
  renderWorkoutTypeOptions();
  renderWorkoutTypes();
  renderCategoryOptions();
  renderExercisePage();
}

async function loadTemplates() {
  state.templates = await requestJson('/api/templates');
  renderWorkoutTemplateOptions();
  renderTemplates();
  renderWorkoutTypes();
  renderMetrics();
  renderDashboard();
  renderProgress();
}

async function loadDailyMissions() {
  state.dailyMissions = await requestJson('/api/daily-missions');
  renderHistory();
  renderDailyMissions();
  renderDashboard();
}

function slugifyDocumentationHeading(value = '') {
  const slug = String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'secao';
}

function buildDocumentationIndex() {
  if (!documentationIndex || !documentationContent) {
    return;
  }

  const headings = [...documentationContent.querySelectorAll('h2, h3')];

  if (!headings.length) {
    documentationIndex.innerHTML = `
      <div class="documentation-index-title">INDEX.sys</div>
      <p class="empty-state">Nenhuma secao encontrada.</p>
    `;
    return;
  }

  const usedSlugs = new Map();
  const links = headings.map((heading) => {
    const baseSlug = slugifyDocumentationHeading(heading.textContent);
    const count = usedSlugs.get(baseSlug) || 0;
    const id = count ? `${baseSlug}-${count + 1}` : baseSlug;

    usedSlugs.set(baseSlug, count + 1);
    heading.id = id;

    return `
      <a class="${heading.tagName === 'H3' ? 'nested' : ''}" href="#${id}">
        ${escapeHtml(heading.textContent)}
      </a>
    `;
  });

  documentationIndex.innerHTML = `
    <div class="documentation-index-title">INDEX.sys</div>
    <div class="documentation-index-links">
      ${links.join('')}
    </div>
  `;
}

async function loadDocumentation(docKey = state.activeDocumentationDoc, force = false) {
  const selectedDoc = documentationDocs[docKey] ? docKey : 'app';
  const docConfig = documentationDocs[selectedDoc];

  state.activeDocumentationDoc = selectedDoc;

  documentationMenuButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.documentationDoc === selectedDoc);
  });

  if (documentationFileTitle) {
    documentationFileTitle.textContent = docConfig.title;
  }

  if (documentationDownload) {
    documentationDownload.href = docConfig.downloadUrl;
    documentationDownload.textContent = docConfig.downloadLabel;
  }

  if (!documentationContent) {
    return;
  }

  if (!force && state.documentationLoaded[selectedDoc] && state.documentationCache[selectedDoc]) {
    documentationContent.innerHTML = state.documentationCache[selectedDoc];
    buildDocumentationIndex();
    documentationStatus.textContent = 'Atualizada';
    return;
  }

  documentationStatus.textContent = 'Carregando...';
  documentationContent.innerHTML = '<p class="empty-state">Carregando documentacao...</p>';
  if (documentationIndex) {
    documentationIndex.innerHTML = `
      <div class="documentation-index-title">INDEX.sys</div>
      <p class="empty-state">Carregando indice...</p>
    `;
  }

  try {
    const payload = await requestJson(`/api/documentation?doc=${selectedDoc}`);

    documentationContent.innerHTML = payload.html;
    state.documentationCache[selectedDoc] = payload.html;
    buildDocumentationIndex();
    documentationStatus.textContent = 'Atualizada';
    state.documentationLoaded[selectedDoc] = true;
  } catch (error) {
    documentationStatus.textContent = 'Erro';
    documentationContent.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  }
}

function renderMetrics() {
  const workoutMetric = document.querySelector('#metric-workouts');
  const templateMetric = document.querySelector('#metric-templates');

  if (workoutMetric) {
    workoutMetric.textContent = state.allWorkouts.length;
  }

  if (templateMetric) {
    templateMetric.textContent = state.templates.length;
  }
}

function setMissionStep(element, text, status) {
  element.textContent = text;
  element.classList.toggle('done', status === 'done');
  element.classList.toggle('pending', status === 'pending');
  element.classList.toggle('idle', status === 'idle');
}

function renderDashboardMissionPanel(mission, dateKey) {
  const todayKey = todayInputValue();
  const isToday = dateKey === todayKey;
  const isPast = dateKey < todayKey;
  const isFuture = dateKey > todayKey;

  if (!mission) {
    missionTitle.textContent = 'Campanha nao configurada';
    missionDescription.textContent = `${formatDate(dateKey)} | nenhum protocolo cadastrado para este dia.`;
    missionBadge.textContent = 'OFFLINE';
    missionReward.textContent = '+0 XP';
    startMissionButton.disabled = true;
    startMissionButton.textContent = 'Sem campanha';
    renderMissionActionButtons(null, dateKey);
    setMissionStep(missionStepTemplate, 'Forca: nao configurado', 'idle');
    setMissionStep(missionStepSets, 'Combate: nao configurado', 'idle');
    setMissionStep(missionStepSave, 'Bonus da campanha: +0 XP', 'idle');
    return;
  }

  const strengthBlock = (mission.blocks || []).find((block) => block.type === 'strength');
  const combatBlock = (mission.blocks || []).find((block) => block.type === 'combat');
  const completedStrengthWorkout = strengthBlock?.workoutCode ? getWorkoutForMissionBlock(dateKey, strengthBlock) : null;
  const completedCombatWorkout = combatBlock?.workoutCode ? getWorkoutForMissionBlock(dateKey, combatBlock) : null;
  const completedStrength = strengthBlock?.workoutCode
    ? Boolean(completedStrengthWorkout)
    : mission.restDay;
  const completedCombat = combatBlock?.workoutCode
    ? Boolean(completedCombatWorkout)
    : mission.restDay;
  const completedMission = mission.restDay || (completedStrength && completedCombat);
  const hasPartialProgress = completedStrength || completedCombat;
  const nextMissionBlock = isToday ? getNextMissionBlock(mission, dateKey) : null;
  const possibleXp = getMissionTotalXp(mission);
  const strengthStatus = completedStrength ? 'OK' : 'pendente';
  const combatStatus = completedCombat ? 'OK' : 'pendente';

  missionTitle.textContent = mission.missionName;
  missionDescription.textContent = mission.restDay
    ? `${formatDate(dateKey)} | Recuperacao programada. A sequencia da Academy continua preservada.`
    : `Forca ${strengthBlock?.workoutCode || '--'} ${strengthStatus} + combate ${combatBlock?.workoutCode || '--'} ${combatStatus} | ${mission.intensity}`;
  missionBadge.textContent = mission.restDay
    ? 'DESCANSO'
    : completedMission
      ? 'CONCLUIDA'
      : hasPartialProgress
        ? 'PARCIAL'
        : isFuture
          ? 'PLANEJADA'
          : isPast
            ? 'PENDENTE'
            : 'CAMPANHA';
  missionReward.textContent = mission.restDay
    ? '+0 XP'
    : completedMission
      ? `+${possibleXp} XP OK`
      : `+${possibleXp} XP`;

  startMissionButton.disabled = mission.restDay || !nextMissionBlock;
  startMissionButton.textContent = mission.restDay
    ? 'Dia de descanso'
    : isFuture
      ? 'Campanha planejada'
      : isPast && !completedMission
        ? 'Dia passado'
        : nextMissionBlock
          ? `Iniciar ${getBlockLabel(nextMissionBlock).toLowerCase()}`
          : 'Campanha concluida';
  renderMissionActionButtons(mission, dateKey);

  setMissionStep(
    missionStepTemplate,
    mission.restDay ? 'Recuperacao programada' : `Forca: ${formatMissionBlockCompletion(strengthBlock, completedStrengthWorkout)}`,
    mission.restDay ? 'idle' : completedStrength ? 'done' : 'pending'
  );
  setMissionStep(
    missionStepSets,
    mission.restDay ? 'Sem bloco obrigatorio' : `Combate: ${formatMissionBlockCompletion(combatBlock, completedCombatWorkout)}`,
    mission.restDay ? 'idle' : completedCombat ? 'done' : 'pending'
  );
  setMissionStep(
    missionStepSave,
    mission.restDay ? 'Sequencia preservada' : `Bonus da campanha: +${mission.bonusXp || 0} XP`,
    mission.restDay ? 'idle' : completedMission ? 'done' : 'pending'
  );
}

function renderDashboard() {
  const completedXpWorkouts = state.allWorkouts.filter(isCompletedWorkout);
  const hasCompleteSnapshotXp = completedXpWorkouts.length > 0
    && completedXpWorkouts.every((workout) => Number(workout.xp?.total || 0) > 0);
  const xpInfos = state.allWorkouts.filter(isCompletedWorkout).map(getWorkoutXpInfo);
  const xpItems = getXpWorkouts();
  const exerciseEntries = getExerciseProgressEntries();
  const snapshotXp = xpInfos.reduce((total, item) => total + item.total, 0);
  const workoutXp = hasCompleteSnapshotXp ? snapshotXp : xpInfos.reduce((total, item) => total + item.execution, 0);
  const campaignXp = calculateCampaignXpBreakdown();
  const totalVolume = state.allWorkouts.reduce((total, workout) => total + calculateWorkoutVolume(workout), 0);
  const completedWorkouts = state.allWorkouts.filter(isCompletedWorkout).length;
  const totalValidSets = countTotalValidSets(state.allWorkouts);
  const currentStreak = calculateCurrentStreak(state.allWorkouts);
  const todayKey = todayInputValue();
  const monday = getMonday();
  const selectedMissionDayIndex = getSelectedMissionDayIndex();
  const selectedMissionDateKey = getWeekDateKeyForDay(selectedMissionDayIndex, monday);
  const selectedMission = getDailyMissionByDayIndex(selectedMissionDayIndex);
  const journeyDay = getJourneyDay(todayKey);
  const journeyPosition = getJourneyPosition(todayKey);
  const completedThisWeek = new Set(
    state.allWorkouts
      .filter((workout) => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= monday && isCompletedWorkout(workout);
      })
      .map((workout) => `${toDateKey(workout.date)}-${workout.workoutCode}`)
  );
  const weeklyWorkouts = state.allWorkouts.filter((workout) => new Date(workout.date) >= monday && isCompletedWorkout(workout));
  const weeklyVolume = weeklyWorkouts.reduce((total, workout) => total + calculateWorkoutVolume(workout), 0);
  const completedTrainingDays = state.dailyMissions.length
    ? state.dailyMissions.filter((mission) => {
        if (mission.restDay) {
          return false;
        }

        const dateKey = getWeekDateKeyForDay(mission.dayIndex, monday);

        return getMissionCompletionForDate(mission, dateKey).complete;
      }).length
    : weeklySchedule.filter((item) => item.code !== 'DESC').filter((item, index) => {
        const date = new Date(monday);

        date.setDate(monday.getDate() + index);
        return completedThisWeek.has(`${date.toISOString().slice(0, 10)}-${item.code}`);
      }).length;
  const totalXp = hasCompleteSnapshotXp ? workoutXp : workoutXp + campaignXp.total;
  const level = calculateLevel(totalXp);
  const rank = getRankForLevel(level.level);
  const xpProgress = Math.min(100, Math.round((level.currentXp / level.nextLevelXp) * 100));

  hudStreak.textContent = `${currentStreak} DAYS`;
  dashboardJourneyDay.textContent = journeyDay;
  dashboardJourneySeason.textContent = journeyPosition.label;
  dashboardJourneyText.textContent = `${journeyPosition.season.name} | semana ${journeyPosition.weekInSeason}/${academySeasonWeeks}`;
  dashboardTotalWorkouts.textContent = state.allWorkouts.length;
  dashboardVolume.textContent = formatCompactNumber(totalVolume);
  dashboardPrs.textContent = countMonthlyPrs(state.allWorkouts);
  dashboardLevel.textContent = `LV. ${level.level}`;
  dashboardLevelTrend.textContent = rank.shortName;
  dashboardRank.textContent = rank.name;
  dashboardXpFill.style.width = `${xpProgress}%`;
  dashboardXpText.textContent = hasCompleteSnapshotXp
    ? `${level.currentXp} / ${level.nextLevelXp} XP | snapshot oficial`
    : `${level.currentXp} / ${level.nextLevelXp} XP | +${campaignXp.total} XP campanha`;
  dashboardWorkoutsTrend.textContent = `+${weeklyWorkouts.length} semana`;
  dashboardVolumeTrend.textContent = `+${formatCompactNumber(weeklyVolume)} kg semana`;
  dashboardPlayerBadge.textContent = `LV. ${level.level}`;
  dashboardPlayerLevel.textContent = level.level;
  dashboardPlayerRank.textContent = rank.name;
  dashboardPlayerXpFill.style.width = `${xpProgress}%`;
  dashboardPlayerXpText.textContent = `${level.currentXp} / ${level.nextLevelXp} XP | ${xpProgress}% ate o proximo nivel`;
  dashboardLevelRing.style.strokeDashoffset = `${245 - (245 * xpProgress) / 100}`;
  weeklyProgress.textContent = `${completedTrainingDays}/6`;

  if (state.dailyMissions.length) {
    renderDashboardMissionPanel(selectedMission, selectedMissionDateKey);
  } else {
    const todayProtocol = getWorkoutForWeekday();
    const todayTemplate = state.templates.find((template) => template.code === todayProtocol.code);
    const completedToday = todayProtocol.code !== 'DESC' && Boolean(getWorkoutByDateAndCode(todayKey, todayProtocol.code));

    if (todayProtocol.code === 'DESC') {
      missionTitle.textContent = 'Recuperacao planejada';
      missionDescription.textContent = 'Domingo preserva a sequencia. Use o dia para recuperar e voltar forte.';
      missionBadge.textContent = 'DESCANSO';
      missionReward.textContent = '+0 XP';
      startMissionButton.disabled = true;
      startMissionButton.textContent = 'Dia de descanso';
      renderMissionActionButtons({ restDay: true, blocks: [] }, todayKey);
      updateMissionSteps({ hasTemplate: true, hasCompletedToday: true, isRest: true });
    } else {
      missionTitle.textContent = `Treino ${todayProtocol.code} - ${workoutNames[todayProtocol.code]}`;
      missionDescription.textContent = completedToday
        ? 'Campanha do dia concluida com series validas. XP contabilizado no protocolo.'
        : todayTemplate
          ? `${todayTemplate.exercises.length} exercicios cadastrados para cumprir o bloco de hoje.`
          : 'Cadastre esta ficha para ativar a campanha do dia.';
      missionBadge.textContent = completedToday ? 'CONCLUIDA' : 'CAMPANHA';
      missionReward.textContent = completedToday ? '+75 XP OK' : '+75 XP';
      startMissionButton.disabled = !todayTemplate || completedToday;
      startMissionButton.textContent = completedToday ? 'Campanha concluida' : 'Iniciar bloco de hoje';
      renderMissionActionButtons({
        restDay: false,
        blocks: [{
          type: 'strength',
          templateId: todayTemplate?._id || '',
          workoutCode: todayProtocol.code,
          workoutName: workoutNames[todayProtocol.code],
          xpReward: 75
        }]
      }, todayKey);
      updateMissionSteps({ hasTemplate: Boolean(todayTemplate), hasCompletedToday: completedToday, isRest: false });
    }
  }

  weeklyMap.innerHTML = weeklySchedule.map((item) => {
    const dateKey = getWeekDateKeyForDay(item.day, monday);
    const mission = getDailyMissionByDayIndex(item.day);
    const isToday = item.day === new Date().getDay();
    const isSelected = item.day === selectedMissionDayIndex;
    const missionStatus = mission ? getMissionCompletionForDate(mission, dateKey) : null;
    const strengthBlock = (mission?.blocks || []).find((block) => block.type === 'strength');
    const displayCode = mission?.restDay ? 'DESC' : strengthBlock?.workoutCode || item.code;
    const status = mission?.restDay || item.code === 'DESC'
      ? 'descanso'
      : missionStatus?.complete
        ? 'feito'
        : missionStatus?.completed > 0 || missionStatus?.attempted > 0
          ? 'parcial'
          : isToday
            ? 'hoje'
            : 'pendente';
    const title = mission
      ? `${mission.missionName} | ${formatDate(dateKey)}`
      : `${item.label} | ${formatDate(dateKey)}`;

    return `
      <button
        class="week-node ${status} ${isSelected ? 'selected' : ''} ${isToday ? 'is-today' : ''}"
        type="button"
        data-mission-day="${item.day}"
        aria-pressed="${isSelected}"
        title="${escapeHtml(title)}"
      >
        <span>${item.label}</span>
        <strong>${escapeHtml(displayCode)}</strong>
      </button>
    `;
  }).join('');

  renderDashboardHistory();
  renderDashboardWeeklySchedule(monday);
  renderDashboardVolumeChart();
  renderDashboardMuscleDistribution();
  renderDashboardPrList();
  renderDashboardActivityFeed();
  renderAchievements(xpItems, exerciseEntries);
  renderWeeklyMissions({
    completedTrainingDays,
    monday
  });
  renderHeatmap();
  renderDailyMissions();
}

function renderDailyMissionBlocks(mission) {
  const todayKey = todayInputValue();

  return (mission.blocks || []).map((block) => {
    const completedWorkout = getWorkoutForMissionBlock(todayKey, block);
    const isRecovery = block.type === 'recovery' || mission.restDay;
    const isCompleted = Boolean(completedWorkout);
    const statusLabel = isRecovery ? 'descanso planejado' : isCompleted ? 'concluido' : 'pendente';
    const blockCodeLabel = formatMissionBlockCompletion(block, completedWorkout);
    const actionMarkup = completedWorkout
      ? `
        <div class="mission-block-actions">
          <button class="button button-secondary" type="button" data-action="details" data-id="${completedWorkout._id}">Ver</button>
          <button class="button button-ghost" type="button" data-action="edit" data-id="${completedWorkout._id}">Editar</button>
        </div>
      `
      : block.templateId
        ? `
          <div class="mission-block-actions">
            <button class="button button-secondary" type="button" data-start-template="${block.templateId}">Iniciar</button>
            <button class="button button-ghost" type="button" data-replace-block="${block.type}">Trocar</button>
          </div>
        `
        : `<strong>${Number(block.xpReward || 0)} XP</strong>`;

    return `
      <article class="mission-block-card ${isRecovery ? 'rest' : isCompleted ? 'done' : 'pending'}">
        <div>
          <p class="catalog-title">${escapeHtml(getBlockLabel(block))} - ${escapeHtml(blockCodeLabel)}</p>
          <div class="history-meta">
            ${escapeHtml(block.workoutName || 'Recuperacao')}
            | ${escapeHtml(block.intensity || mission.intensity || '')}
            | ${statusLabel}
          </div>
        </div>
        ${actionMarkup}
      </article>
    `;
  }).join('');
}

function getMissionCompletionForDate(mission, dateKey) {
  if (!mission) {
    return { required: 0, completed: 0, attempted: 0, pending: 0, complete: false };
  }

  if (mission.restDay) {
    return { required: 0, completed: 0, attempted: 0, pending: 0, complete: true };
  }

  const requiredBlocks = (mission.blocks || []).filter((block) => block.type !== 'recovery');
  const completedBlocks = requiredBlocks.filter((block) => getWorkoutForMissionBlock(dateKey, block));
  const attemptedBlocks = requiredBlocks.filter((block) => getWorkoutAttemptForMissionBlock(dateKey, block));

  return {
    required: requiredBlocks.length,
    completed: completedBlocks.length,
    attempted: attemptedBlocks.length,
    pending: Math.max(0, requiredBlocks.length - completedBlocks.length),
    complete: requiredBlocks.length > 0 && completedBlocks.length === requiredBlocks.length
  };
}

function renderDailyMissionStats(todayMission) {
  const todayKey = todayInputValue();
  const todayXp = getMissionTotalXp(todayMission);
  const todayStatus = getMissionCompletionForDate(todayMission, todayKey);
  const activeMissions = state.dailyMissions.filter((mission) => !mission.restDay);
  const weeklyPossibleXp = activeMissions.reduce((total, mission) => total + getMissionTotalXp(mission), 0);
  const monday = getMonday();
  let completedThisWeek = 0;
  let pendingThisWeek = 0;

  activeMissions.forEach((mission) => {
    const missionDate = new Date(monday);
    const dayOffset = mission.dayIndex === 0 ? 6 : mission.dayIndex - 1;

    missionDate.setDate(monday.getDate() + dayOffset);

    const dateKey = missionDate.toISOString().slice(0, 10);
    const status = getMissionCompletionForDate(mission, dateKey);

    if (dateKey <= todayKey && status.complete) {
      completedThisWeek += 1;
    }

    if (dateKey <= todayKey) {
      pendingThisWeek += status.pending;
    }
  });

  renderSummaryCards(dailyMissionSummaryCards, [
    {
      icon: 'XP',
      label: 'Hoje',
      value: String(todayXp),
      detail: todayMission?.restDay ? 'descanso planejado' : 'xp possivel hoje',
      tone: 'green'
    },
    {
      icon: '2X',
      label: 'Blocos hoje',
      value: String(todayStatus.required),
      detail: `${todayStatus.completed} feitos / ${todayStatus.attempted} tentados / ${todayStatus.pending} pendentes`,
      tone: 'blue'
    },
    {
      icon: 'WK',
      label: 'Campanha',
      value: `${completedThisWeek}/${activeMissions.length}`,
      detail: 'campanhas completas no ciclo',
      tone: 'orange'
    },
    {
      icon: 'OK',
      label: 'XP semana',
      value: String(weeklyPossibleXp),
      detail: 'xp possivel no ciclo completo',
      tone: 'purple'
    },
    {
      icon: '!',
      label: 'Pendencias',
      value: String(pendingThisWeek),
      detail: 'blocos vencidos ou em aberto',
      tone: 'red'
    }
  ]);
}

function getMissionStatusLabel(mission, dateKey) {
  if (mission.restDay) {
    return 'Recuperacao';
  }

  const todayKey = todayInputValue();
  const status = getMissionCompletionForDate(mission, dateKey);

  if (status.complete) return 'Concluida';
  if (status.completed > 0 || status.attempted > 0) return 'Parcial';
  if (dateKey > todayKey) return 'Planejada';
  if (dateKey === todayKey) return 'Hoje';

  return 'Pendente';
}

function renderMissionBlockTags(mission, dateKey) {
  return (mission.blocks || []).map((block) => {
    const completedWorkout = getWorkoutForMissionBlock(dateKey, block);
    const code = formatMissionBlockCompletion(block, completedWorkout);
    const className = block.type === 'combat' ? 'arms' : block.type === 'recovery' ? 'extra' : 'core';

    return `<span class="row-tag ${className}">${escapeHtml(code)}</span>`;
  }).join('');
}

function renderMissionBlockPreview(mission, dateKey) {
  return (mission.blocks || []).map((block) => {
    const completedWorkout = getWorkoutForMissionBlock(dateKey, block);
    const status = block.type === 'recovery'
      ? 'recuperacao'
      : completedWorkout
        ? isWorkoutSubstitutionForBlock(completedWorkout, block)
          ? `substituido por ${completedWorkout.workoutCode}`
          : 'concluido'
        : 'pendente';

    return `<li>${escapeHtml(getBlockLabel(block))}: ${escapeHtml(block.workoutName || 'Recuperacao')} | ${escapeHtml(status)}</li>`;
  }).join('');
}

function renderDailyMissions() {
  if (!dailyMissionList || !dailyMissionToday) {
    return;
  }

  if (!state.dailyMissions.length) {
    dailyMissionSubtitle.textContent = '// nenhuma campanha diaria cadastrada';
    dailyMissionToday.innerHTML = '<p class="empty-state">Campanha diaria ainda nao carregada.</p>';
    dailyMissionList.innerHTML = '<p class="empty-state">Nenhuma campanha semanal cadastrada.</p>';
    renderDailyMissionStats(null);
    return;
  }

  const todayMission = getTodayDailyMission() || state.dailyMissions[0];
  const todayXp = getMissionTotalXp(todayMission);
  const activeDays = state.dailyMissions.filter((mission) => !mission.restDay).length;

  dailyMissionSubtitle.textContent = `// ${activeDays} campanhas de treino + recuperacao programada`;
  dailyMissionTodayBadge.textContent = todayMission.restDay ? 'RECOVERY' : 'HOJE';
  renderDailyMissionStats(todayMission);
  dailyMissionToday.innerHTML = `
    <h3>${escapeHtml(todayMission.missionName)}</h3>
    <p>${escapeHtml(todayMission.intensity || '')}</p>
    <div class="mission-reward">
      <span>CAMPAIGN REWARD</span>
      <strong>+${todayXp} XP</strong>
    </div>
    <div class="selected-template-list">
      ${renderDailyMissionBlocks(todayMission)}
    </div>
  `;

  const order = [1, 2, 3, 4, 5, 6, 0];
  const missions = [...state.dailyMissions].sort((a, b) => order.indexOf(a.dayIndex) - order.indexOf(b.dayIndex));
  const monday = getMonday();

  dailyMissionList.innerHTML = missions.map((mission) => {
    const dateKey = getWeekDateKeyForDay(mission.dayIndex, monday);
    const statusLabel = getMissionStatusLabel(mission, dateKey);

    return `
      <article class="template-card ${mission.dayIndex === new Date().getDay() ? 'current-day' : ''}">
        <header>
          <div>
            <span class="template-code">${escapeHtml(mission.dayOfWeek)} | ${escapeHtml(statusLabel)}</span>
            <h3>${escapeHtml(mission.missionName)}</h3>
          </div>
          <strong>${getMissionTotalXp(mission)}</strong>
        </header>
        <p class="type-line">${escapeHtml(formatDate(dateKey))} | ${escapeHtml(mission.intensity || '')}</p>
        <div class="template-muscles">
          ${renderMissionBlockTags(mission, dateKey)}
        </div>
        <ol class="template-preview">
          ${renderMissionBlockPreview(mission, dateKey)}
        </ol>
      </article>
    `;
  }).join('');
}

function getXpWorkouts() {
  return state.allWorkouts
    .filter(isCompletedWorkout)
    .map((workout) => ({
      workout,
      xp: getWorkoutXpInfo(workout),
      dateKey: toDateKey(workout.date)
    }))
    .sort((a, b) => new Date(b.workout.date) - new Date(a.workout.date));
}

function getExerciseProgressEntries() {
  const entries = state.allWorkouts
    .filter(isCompletedWorkout)
    .flatMap((workout) => (workout.exercises || []).filter((exercise) => !exercise.skipped).map((exercise) => {
      const measurementType = exercise.measurementType || 'sets_reps_weight';
      const validSets = (exercise.sets || []).filter((set) => Number(set.weight) > 0 && Number(set.reps) > 0);
      const validRounds = (exercise.rounds || []).filter((round) => round.completed !== false && Number(round.durationSeconds || 0) > 0);
      const volume = calculateExerciseVolume(exercise);
      const totalRoundSeconds = calculateExerciseRoundSeconds(exercise);
      const roundReps = calculateExerciseRoundReps(exercise);

      return {
        key: (exercise.name || '').trim().toLowerCase(),
        name: exercise.name || 'Exercicio sem nome',
        workout,
        exercise,
        dateKey: toDateKey(workout.date),
        measurementType,
        loadMode: getExerciseLoadMode(exercise),
        muscleGroup: exercise.muscleGroup || exercise.category || '',
        modality: exercise.modality || getTemplateForWorkout(workout)?.workoutTypeCode || 'strength',
        validSets: validSets.length,
        validRounds: validRounds.length,
        maxWeight: calculateExerciseMaxWeight(exercise),
        maxReps: calculateExerciseMaxReps(exercise),
        volume,
        totalRoundSeconds,
        roundReps,
        score: volume || roundReps || totalRoundSeconds || validSets.length || validRounds.length
      };
    }))
    .filter((entry) => entry.key && entry.score > 0)
    .sort((a, b) => new Date(b.workout.date) - new Date(a.workout.date));

  return annotateExerciseProgressPrs(entries);
}

function getProgressPeriodLabel(period = state.progressExercisePeriodFilter) {
  const labels = {
    all: 'todo o historico',
    week: 'esta semana',
    month: 'este mes',
    quarter: 'ultimos 3 meses',
    year: 'este ano'
  };

  return labels[period] || labels.all;
}

function isProgressEntryInsidePeriod(entry, period = state.progressExercisePeriodFilter) {
  return isWorkoutInsidePeriod(entry.workout, period);
}

function getFilteredProgressExerciseEntries(entries) {
  return entries.filter((entry) => isProgressEntryInsidePeriod(entry));
}

function getExercisePrMetrics(entry) {
  if (entry.validRounds > 0) {
    return [
      {
        type: 'round_time',
        label: 'Tempo',
        value: entry.totalRoundSeconds,
        formatted: formatSeconds(entry.totalRoundSeconds)
      },
      {
        type: 'round_reps',
        label: 'Golpes',
        value: entry.roundReps,
        formatted: `${entry.roundReps} golpes`
      }
    ].filter((metric) => metric.value > 0);
  }

  return [
    {
      type: 'max_weight',
      label: 'Carga',
      value: entry.maxWeight,
      formatted: formatLoadModeWeight(entry.maxWeight, entry.loadMode)
    },
    {
      type: 'max_reps',
      label: 'Reps',
      value: entry.maxReps,
      formatted: `${entry.maxReps} reps`
    },
    {
      type: 'volume',
      label: 'Volume',
      value: entry.volume,
      formatted: `${formatCompactNumber(entry.volume)} kg vol`
    }
  ].filter((metric) => metric.value > 0);
}

function annotateExerciseProgressPrs(entries) {
  const bestByExercise = new Map();
  const ordered = [...entries].sort((a, b) => {
    const dateCompare = a.dateKey.localeCompare(b.dateKey);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return String(a.workout._id || '').localeCompare(String(b.workout._id || ''));
  });

  ordered.forEach((entry) => {
    const previousBest = bestByExercise.get(entry.key) || {};
    const nextBest = { ...previousBest };

    entry.personalRecords = getExercisePrMetrics(entry)
      .filter((metric) => {
        const previousValue = Number(previousBest[metric.type] || 0);
        const isRecord = previousValue > 0 && metric.value > previousValue;

        nextBest[metric.type] = Math.max(previousValue, metric.value);
        return isRecord;
      })
      .map((metric) => ({
        type: metric.type,
        label: metric.label,
        value: metric.value,
        formatted: metric.formatted,
        exerciseName: entry.name,
        dateKey: entry.dateKey,
        workoutCode: entry.workout.workoutCode,
        workoutName: entry.workout.workoutName
      }));

    bestByExercise.set(entry.key, nextBest);
  });

  return entries;
}

function getRecentExercisePrs(entries, limit = 8) {
  return entries
    .flatMap((entry) => (entry.personalRecords || []).map((record) => ({
      ...record,
      entry
    })))
    .sort((a, b) => {
      const dateCompare = new Date(b.entry.workout.date) - new Date(a.entry.workout.date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return b.value - a.value;
    })
    .slice(0, limit);
}

function getProgressExerciseOptions(entries) {
  const byExercise = new Map();

  entries.forEach((entry) => {
    const current = byExercise.get(entry.key) || {
      key: entry.key,
      name: entry.name,
      count: 0,
      lastDate: entry.dateKey,
      modality: entry.modality
    };

    current.count += 1;
    current.lastDate = current.lastDate > entry.dateKey ? current.lastDate : entry.dateKey;
    byExercise.set(entry.key, current);
  });

  return [...byExercise.values()].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.name.localeCompare(b.name);
  });
}

function refreshProgressExerciseOptions(entries) {
  if (!progressExerciseSelect) {
    return [];
  }

  const options = getProgressExerciseOptions(entries);

  if (!options.some((option) => option.key === state.selectedProgressExercise)) {
    state.selectedProgressExercise = options[0]?.key || '';
  }

  progressExerciseSelect.innerHTML = [
    '<option value="">Selecione um exercicio</option>',
    ...options.map((option) => (
      `<option value="${escapeHtml(option.key)}" ${option.key === state.selectedProgressExercise ? 'selected' : ''}>${escapeHtml(option.name)} (${option.count})</option>`
    ))
  ].join('');

  return options;
}

function getExerciseProgressSummary(entries) {
  const sortedByDate = [...entries].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  const first = sortedByDate[0];
  const last = sortedByDate[sortedByDate.length - 1];
  const totalVolume = entries.reduce((total, entry) => total + entry.volume, 0);
  const totalRounds = entries.reduce((total, entry) => total + entry.validRounds, 0);
  const totalRoundSeconds = entries.reduce((total, entry) => total + entry.totalRoundSeconds, 0);
  const bestWeight = [...entries].sort((a, b) => b.maxWeight - a.maxWeight)[0];
  const bestVolume = [...entries].sort((a, b) => b.volume - a.volume)[0];
  const bestRoundReps = [...entries].sort((a, b) => b.roundReps - a.roundReps)[0];
  const bestRoundTime = [...entries].sort((a, b) => b.totalRoundSeconds - a.totalRoundSeconds)[0];

  return {
    first,
    last,
    totalVolume,
    totalRounds,
    totalRoundSeconds,
    bestWeight,
    bestVolume,
    bestRoundReps,
    bestRoundTime
  };
}

function formatExerciseProgressPrimary(entry) {
  if (entry.volume > 0) {
    return `${formatCompactNumber(entry.volume)} kg`;
  }

  if (entry.roundReps > 0) {
    return `${entry.roundReps} golpes`;
  }

  if (entry.totalRoundSeconds > 0) {
    return formatSeconds(entry.totalRoundSeconds);
  }

  return `${entry.validSets + entry.validRounds} unidades`;
}

function getExerciseCompareMetrics(entries) {
  const hasRounds = entries.some((entry) => entry.validRounds > 0);

  if (hasRounds) {
    return [
      {
        label: 'Tempo',
        value: (entry) => entry.totalRoundSeconds,
        format: (value) => formatSeconds(value)
      },
      {
        label: 'Golpes',
        value: (entry) => entry.roundReps,
        format: (value) => `${formatCompactNumber(value)} golpes`
      }
    ];
  }

  return [
    {
      label: 'Carga',
      value: (entry) => entry.maxWeight,
      format: (value, entry) => formatLoadModeWeight(value, entry.loadMode)
    },
    {
      label: 'Reps',
      value: (entry) => entry.maxReps,
      format: (value) => `${formatCompactNumber(value)} reps`
    },
    {
      label: 'Volume',
      value: (entry) => entry.volume,
      format: (value) => `${formatCompactNumber(value)} kg`
    }
  ];
}

function getTrendLabel(firstValue, lastValue) {
  if (lastValue > firstValue) {
    return `+${formatCompactNumber(lastValue - firstValue)}`;
  }

  if (lastValue < firstValue) {
    return `-${formatCompactNumber(firstValue - lastValue)}`;
  }

  return 'estavel';
}

function renderProgressExerciseCompare(entries) {
  if (!progressExerciseCompare || !progressCompareCount) {
    return;
  }

  const ordered = [...entries].sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  progressCompareCount.textContent = `${ordered.length} PTS`;

  if (ordered.length < 2) {
    progressExerciseCompare.innerHTML = '<p class="empty-state">Registre pelo menos duas execucoes validas para comparar a evolucao.</p>';
    return;
  }

  const metrics = getExerciseCompareMetrics(ordered)
    .map((metric) => ({
      ...metric,
      points: ordered.map((entry) => ({
        entry,
        value: Number(metric.value(entry) || 0)
      })).filter((point) => point.value > 0)
    }))
    .filter((metric) => metric.points.length >= 2);

  if (!metrics.length) {
    progressExerciseCompare.innerHTML = '<p class="empty-state">Ainda nao ha dados suficientes para comparar este exercicio.</p>';
    return;
  }

  progressExerciseCompare.innerHTML = metrics.map((metric) => {
    const maxValue = Math.max(1, ...metric.points.map((point) => point.value));
    const firstPoint = metric.points[0];
    const lastPoint = metric.points[metric.points.length - 1];
    const trendClass = lastPoint.value > firstPoint.value ? 'up' : lastPoint.value < firstPoint.value ? 'down' : 'stable';

    return `
      <article class="progress-compare-card ${trendClass}">
        <header>
          <div>
            <span>${escapeHtml(metric.label)}</span>
            <strong>${escapeHtml(metric.format(lastPoint.value, lastPoint.entry))}</strong>
          </div>
          <em>${escapeHtml(getTrendLabel(firstPoint.value, lastPoint.value))}</em>
        </header>
        <div class="progress-compare-bars">
          ${metric.points.map((point) => {
            const height = Math.max(10, Math.round((point.value / maxValue) * 100));

            return `
              <div class="progress-compare-point">
                <span style="height:${height}%"></span>
                <small>${escapeHtml(formatDate(point.entry.dateKey))}</small>
                <strong>${escapeHtml(metric.format(point.value, point.entry))}</strong>
              </div>
            `;
          }).join('')}
        </div>
      </article>
    `;
  }).join('');
}

function renderProgressExerciseSummary(entries) {
  if (!progressExerciseSummaryCards) {
    return;
  }

  if (!entries.length) {
    renderSummaryCards(progressExerciseSummaryCards, [
      { icon: 'HIST', label: 'Historico', value: '0', detail: 'sem execucoes validas', tone: 'green' },
      { icon: 'PR', label: 'Melhor marca', value: '0', detail: 'aguardando dados', tone: 'blue' },
      { icon: 'VOL', label: 'Volume', value: '0', detail: 'sem carga registrada', tone: 'orange' },
      { icon: 'LAST', label: 'Ultima vez', value: '-', detail: getProgressPeriodLabel(), tone: 'purple' }
    ]);
    return;
  }

  const summary = getExerciseProgressSummary(entries);
  const isRoundBased = entries.some((entry) => entry.validRounds > 0);
  const hasRoundReps = isRoundBased && summary.bestRoundReps?.roundReps > 0;
  const bestRoundEntry = hasRoundReps ? summary.bestRoundReps : summary.bestRoundTime;
  const bestPrimary = isRoundBased
    ? formatExerciseProgressPrimary(bestRoundEntry)
    : formatLoadModeWeight(summary.bestWeight?.maxWeight || 0, summary.bestWeight?.loadMode);
  const totalPrimary = isRoundBased
    ? `${summary.totalRounds} rounds | ${formatSeconds(summary.totalRoundSeconds)}`
    : `${formatCompactNumber(summary.totalVolume)} kg`;

  renderSummaryCards(progressExerciseSummaryCards, [
    {
      icon: 'HIST',
      label: 'Historico',
      value: String(entries.length),
      detail: `${formatDate(summary.first.dateKey)} ate ${formatDate(summary.last.dateKey)}`,
      tone: 'green'
    },
    {
      icon: 'PR',
      label: isRoundBased ? (hasRoundReps ? 'Melhor golpes' : 'Maior tempo') : 'Maior carga',
      value: bestPrimary,
      detail: isRoundBased && bestRoundEntry ? formatDate(bestRoundEntry.dateKey) : formatDate(summary.bestWeight.dateKey),
      tone: 'blue'
    },
    {
      icon: isRoundBased ? 'TIME' : 'VOL',
      label: isRoundBased ? 'Tempo total' : 'Volume total',
      value: totalPrimary,
      detail: isRoundBased ? 'rounds concluidos' : 'carga x repeticoes',
      tone: 'orange'
    },
    {
      icon: 'LAST',
      label: 'Ultima vez',
      value: formatExerciseProgressPrimary(summary.last),
      detail: `${summary.last.workout.workoutCode} em ${formatDate(summary.last.dateKey)}`,
      tone: 'purple'
    }
  ]);
}

function renderProgressExerciseHistory(entries) {
  if (!progressExerciseHistory) {
    return;
  }

  if (!entries.length) {
    progressExerciseHistory.innerHTML = `<p class="empty-state">Nenhuma execucao valida para este exercicio em ${escapeHtml(getProgressPeriodLabel())}.</p>`;
    return;
  }

  const ordered = [...entries].sort((a, b) => new Date(b.workout.date) - new Date(a.workout.date));
  const maxScore = Math.max(1, ...ordered.map((entry) => entry.score));

  progressExerciseHistory.innerHTML = ordered.map((entry) => {
    const isRoundBased = entry.validRounds > 0;
    const metricLine = isRoundBased
      ? `${entry.validRounds} rounds | ${formatSeconds(entry.totalRoundSeconds)} | ${entry.roundReps} golpes`
      : `${entry.validSets} series | max ${formatLoadModeWeight(entry.maxWeight, entry.loadMode)} | ${formatCompactNumber(entry.volume)} kg vol`;
    const meterWidth = Math.max(4, Math.round((entry.score / maxScore) * 100));
    const prBadges = (entry.personalRecords || []).length
      ? `<div class="pr-badges">${entry.personalRecords.map((record) => `<span class="pr-badge">PR ${escapeHtml(record.label)}</span>`).join('')}</div>`
      : '';

    return `
      <article class="progress-exercise-row">
        <div>
          <span class="row-tag ${getMuscleClass(entry.muscleGroup)}">${escapeHtml(entry.muscleGroup || getWorkoutTypeName(entry.modality))}</span>
          <h3>${escapeHtml(entry.workout.workoutCode)} - ${escapeHtml(entry.workout.workoutName)}</h3>
          <p>${escapeHtml(formatDate(entry.dateKey))} | ${escapeHtml(getMeasurementLabel(entry.measurementType))}</p>
          ${prBadges}
        </div>
        <div>
          <strong>${escapeHtml(formatExerciseProgressPrimary(entry))}</strong>
          <span>${escapeHtml(metricLine)}</span>
          <div class="xp-trend-meter"><span style="width:${meterWidth}%"></span></div>
        </div>
      </article>
    `;
  }).join('');
}

function renderProgressRecentPrs(entries) {
  if (!progressPrList || !progressPrCount) {
    return;
  }

  const recentPrs = getRecentExercisePrs(entries);

  progressPrCount.textContent = `${recentPrs.length} PR`;

  if (!recentPrs.length) {
    progressPrList.innerHTML = `<p class="empty-state">Nenhum PR em ${escapeHtml(getProgressPeriodLabel())}. Os proximos recordes aparecem aqui quando uma marca anterior for superada.</p>`;
    return;
  }

  progressPrList.innerHTML = recentPrs.map((record) => `
    <article class="progress-pr-row">
      <div>
        <span class="pr-badge">PR ${escapeHtml(record.label)}</span>
        <h3>${escapeHtml(record.exerciseName)}</h3>
        <p>${escapeHtml(record.workoutCode)} - ${escapeHtml(record.workoutName)} | ${escapeHtml(formatDate(record.dateKey))}</p>
      </div>
      <strong>${escapeHtml(record.formatted)}</strong>
    </article>
  `).join('');
}

function renderProgressExercise(entries) {
  refreshProgressExerciseOptions(entries);
  const filteredEntries = getFilteredProgressExerciseEntries(entries);
  const selectedEntries = filteredEntries.filter((entry) => entry.key === state.selectedProgressExercise);

  if (progressExercisePeriodFilter) {
    progressExercisePeriodFilter.value = state.progressExercisePeriodFilter;
  }

  if (progressExerciseCount) {
    progressExerciseCount.textContent = `${filteredEntries.length}/${entries.length} REG`;
  }

  renderProgressExerciseSummary(selectedEntries);
  renderProgressExerciseCompare(selectedEntries);
  renderProgressRecentPrs(filteredEntries);
  renderProgressExerciseHistory(selectedEntries);
}

function isJourneyDate(dateValue) {
  return toDateKey(dateValue) >= academyJourneyStartDate;
}

function getJourneyWorkoutItems(items) {
  return items.filter((item) => isJourneyDate(item.dateKey || item.workout?.date || item.date));
}

function getJourneyExerciseEntries(entries) {
  return entries.filter((entry) => isJourneyDate(entry.dateKey));
}

function getJourneyWeekKey(dateValue) {
  return toDateKey(getMonday(new Date(dateValue)));
}

function getAnnualAchievementStats(items, exerciseEntries) {
  const journeyItems = getJourneyWorkoutItems(items);
  const journeyWorkouts = journeyItems.map((item) => item.workout);
  const journeyExerciseEntries = getJourneyExerciseEntries(exerciseEntries);
  const totalXp = journeyItems.reduce((total, item) => total + item.xp.total, 0);
  const level = calculateLevel(totalXp).level;
  const activeWeekDays = new Map();
  const campaignWeeks = new Map();
  const blockTypes = journeyWorkouts.reduce((map, workout) => {
    const blockType = getWorkoutBlockType(workout);
    const current = map.get(blockType) || 0;

    if (blockType) {
      map.set(blockType, current + 1);
    }

    return map;
  }, new Map());
  const modalities = journeyWorkouts.reduce((map, workout) => {
    (workout.exercises || []).forEach((exercise) => {
      const modality = exercise.modality || getTemplateForWorkout(workout)?.workoutTypeCode || 'strength';

      map.set(modality, (map.get(modality) || 0) + 1);
    });

    return map;
  }, new Map());

  journeyWorkouts.forEach((workout) => {
    const weekKey = getJourneyWeekKey(workout.date);
    const daySet = activeWeekDays.get(weekKey) || new Set();
    const workoutSet = campaignWeeks.get(weekKey) || new Set();

    daySet.add(toDateKey(workout.date));
    workoutSet.add(workout._id);
    activeWeekDays.set(weekKey, daySet);
    campaignWeeks.set(weekKey, workoutSet);
  });

  const bestActiveWeekDays = Math.max(0, ...[...activeWeekDays.values()].map((set) => set.size));
  const completeCampaignWeeks = [...campaignWeeks.values()].filter((set) => set.size >= 6).length;
  const prs = journeyExerciseEntries.flatMap((entry) => entry.personalRecords || []);
  const origins = journeyWorkouts.map(getWorkoutOriginInfo);

  return {
    journeyItems,
    journeyWorkouts,
    journeyExerciseEntries,
    totalXp,
    level,
    completedWorkouts: journeyWorkouts.length,
    strengthWorkouts: blockTypes.get('strength') || 0,
    combatWorkouts: blockTypes.get('combat') || 0,
    boxingSessions: modalities.get('boxing') || 0,
    kickboxingSessions: modalities.get('kickboxing') || 0,
    extraWorkouts: origins.filter((origin) => origin.className === 'extra').length,
    substitutions: origins.filter((origin) => origin.className === 'substitution').length,
    bestActiveWeekDays,
    completeCampaignWeeks,
    totalPrs: prs.length,
    uniquePrExercises: new Set(prs.map((record) => record.exerciseName)).size
  };
}

function makeAnnualAchievement({ id, category, tier = 'bronze', title, description, progress, target }) {
  const safeProgress = Math.max(0, Number(progress || 0));
  const safeTarget = Math.max(1, Number(target || 1));

  return {
    id,
    category,
    tier,
    title,
    description,
    progress: Math.min(safeProgress, safeTarget),
    rawProgress: safeProgress,
    target: safeTarget,
    unlocked: safeProgress >= safeTarget
  };
}

function getAnnualAchievements(stats) {
  return [
    makeAnnualAchievement({
      id: 'first-workout-annual',
      category: 'Entrada',
      title: 'Primeiro Passo',
      description: 'Registrar o primeiro treino da jornada anual.',
      progress: stats.completedWorkouts,
      target: 1
    }),
    makeAnnualAchievement({
      id: 'first-active-week',
      category: 'Consistencia',
      title: 'Primeira Semana Ativa',
      description: 'Ter pelo menos 3 dias ativos em uma semana da jornada.',
      progress: stats.bestActiveWeekDays,
      target: 3
    }),
    makeAnnualAchievement({
      id: 'first-pr-annual',
      category: 'Performance',
      title: 'Primeiro PR',
      description: 'Bater o primeiro recorde pessoal dentro da jornada.',
      progress: stats.totalPrs,
      target: 1
    }),
    makeAnnualAchievement({
      id: 'first-strength',
      category: 'Modalidade',
      title: 'Forca Iniciada',
      description: 'Concluir o primeiro treino de forca da jornada.',
      progress: stats.strengthWorkouts,
      target: 1
    }),
    makeAnnualAchievement({
      id: 'first-combat',
      category: 'Modalidade',
      title: 'Combatente Iniciado',
      description: 'Concluir o primeiro treino de luta da jornada.',
      progress: stats.combatWorkouts,
      target: 1
    }),
    makeAnnualAchievement({
      id: 'first-extra',
      category: 'Entrada',
      title: 'Treino Extra Registrado',
      description: 'Registrar um treino fora da campanha do dia.',
      progress: stats.extraWorkouts,
      target: 1
    }),
    makeAnnualAchievement({
      id: 'smart-substitution',
      category: 'Campanha',
      title: 'Substituicao Inteligente',
      description: 'Substituir corretamente um bloco pendente pelo mesmo tipo de treino.',
      progress: stats.substitutions,
      target: 1
    }),
    makeAnnualAchievement({
      id: 'workouts-10',
      category: 'Consistencia',
      title: '10 Treinos Realizados',
      description: 'Concluir 10 treinos validos na jornada anual.',
      progress: stats.completedWorkouts,
      target: 10
    }),
    makeAnnualAchievement({
      id: 'workouts-25',
      category: 'Consistencia',
      tier: 'silver',
      title: '25 Treinos Realizados',
      description: 'Concluir 25 treinos validos na jornada anual.',
      progress: stats.completedWorkouts,
      target: 25
    }),
    makeAnnualAchievement({
      id: 'workouts-50',
      category: 'Consistencia',
      tier: 'gold',
      title: '50 Treinos Realizados',
      description: 'Concluir 50 treinos validos na jornada anual.',
      progress: stats.completedWorkouts,
      target: 50
    }),
    makeAnnualAchievement({
      id: 'prs-5',
      category: 'Performance',
      tier: 'silver',
      title: '5 PRs Registrados',
      description: 'Bater 5 recordes pessoais depois do inicio da jornada.',
      progress: stats.totalPrs,
      target: 5
    }),
    makeAnnualAchievement({
      id: 'prs-10',
      category: 'Performance',
      tier: 'gold',
      title: '10 PRs Registrados',
      description: 'Bater 10 recordes pessoais depois do inicio da jornada.',
      progress: stats.totalPrs,
      target: 10
    }),
    makeAnnualAchievement({
      id: 'weekly-campaign-complete',
      category: 'Campanha',
      title: 'Campanha Semanal Completa',
      description: 'Concluir 6 treinos validos em uma mesma semana da jornada.',
      progress: stats.completeCampaignWeeks,
      target: 1
    }),
    makeAnnualAchievement({
      id: 'active-weeks-4',
      category: 'Consistencia',
      tier: 'silver',
      title: '4 Semanas Ativas',
      description: 'Completar 4 semanas com pelo menos um treino valido.',
      progress: stats.journeyWorkouts.length ? new Set(stats.journeyWorkouts.map((workout) => getJourneyWeekKey(workout.date))).size : 0,
      target: 4
    }),
    makeAnnualAchievement({
      id: 'level-10',
      category: 'Nivel',
      tier: 'silver',
      title: 'LV 10 Academy',
      description: 'Alcancar o nivel 10 dentro da jornada anual.',
      progress: stats.level,
      target: 10
    }),
    makeAnnualAchievement({
      id: 'level-25',
      category: 'Nivel',
      tier: 'gold',
      title: 'LV 25 Academy',
      description: 'Alcancar o nivel 25 dentro da jornada anual.',
      progress: stats.level,
      target: 25
    })
  ];
}

function getAchievementPercent(achievement) {
  return Math.min(100, Math.round((achievement.rawProgress / achievement.target) * 100));
}

function getFilteredAnnualAchievements(achievements) {
  return achievements
    .filter((achievement) => (
      state.achievementCategoryFilter === 'all' || achievement.category === state.achievementCategoryFilter
    ))
    .filter((achievement) => {
      if (state.achievementStatusFilter === 'unlocked') {
        return achievement.unlocked;
      }

      if (state.achievementStatusFilter === 'locked') {
        return !achievement.unlocked;
      }

      if (state.achievementStatusFilter === 'near') {
        return !achievement.unlocked && getAchievementPercent(achievement) >= 50;
      }

      return true;
    })
    .sort((a, b) => {
      if (a.unlocked !== b.unlocked) {
        return a.unlocked ? -1 : 1;
      }

      return getAchievementPercent(b) - getAchievementPercent(a);
    });
}

function renderAchievementCategorySummary(achievements) {
  if (!progressAchievementCategoryList) {
    return;
  }

  const categories = ['Entrada', 'Consistencia', 'Performance', 'Modalidade', 'Campanha', 'Nivel'];

  progressAchievementCategoryList.innerHTML = categories.map((category) => {
    const categoryAchievements = achievements.filter((achievement) => achievement.category === category);
    const unlocked = categoryAchievements.filter((achievement) => achievement.unlocked).length;
    const total = categoryAchievements.length;
    const percent = total ? Math.round((unlocked / total) * 100) : 0;

    return `
      <article class="progress-achievement-category">
        <div>
          <strong>${escapeHtml(category)}</strong>
          <span>${unlocked}/${total}</span>
        </div>
        <div class="achievement-meter"><span style="width:${percent}%"></span></div>
      </article>
    `;
  }).join('');
}

function renderAnnualAchievements(items, exerciseEntries) {
  if (!progressAchievementList || !progressAchievementCount) {
    return;
  }

  const stats = getAnnualAchievementStats(items, exerciseEntries);
  const achievements = getAnnualAchievements(stats);
  const filteredAchievements = getFilteredAnnualAchievements(achievements);
  const unlocked = achievements.filter((achievement) => achievement.unlocked);
  const percent = achievements.length ? Math.round((unlocked.length / achievements.length) * 100) : 0;

  if (progressAchievementCategoryFilter) {
    progressAchievementCategoryFilter.value = state.achievementCategoryFilter;
  }

  if (progressAchievementStatusFilter) {
    progressAchievementStatusFilter.value = state.achievementStatusFilter;
  }

  progressAchievementCount.textContent = `${filteredAchievements.length}/${achievements.length}`;

  renderSummaryCards(progressAchievementSummaryCards, [
    {
      icon: 'YEAR',
      label: 'Jornada',
      value: `${percent}%`,
      detail: `inicio em ${formatDate(academyJourneyStartDate)}`,
      tone: 'green'
    },
    {
      icon: 'DONE',
      label: 'Desbloqueadas',
      value: `${unlocked.length}/${achievements.length}`,
      detail: 'conquistas anuais iniciais',
      tone: 'blue'
    },
    {
      icon: 'XP',
      label: 'XP Jornada',
      value: String(stats.totalXp),
      detail: `LV ${stats.level} desde o marco zero`,
      tone: 'orange'
    },
    {
      icon: 'PR',
      label: 'PRs Jornada',
      value: String(stats.totalPrs),
      detail: `${stats.uniquePrExercises} exercicios com PR`,
      tone: 'purple'
    }
  ]);

  renderAchievementCategorySummary(achievements);

  if (!filteredAchievements.length) {
    progressAchievementList.innerHTML = '<p class="empty-state">Nenhuma conquista encontrada para os filtros atuais.</p>';
    return;
  }

  progressAchievementList.innerHTML = filteredAchievements.map((achievement) => {
    const achievementPercent = getAchievementPercent(achievement);
    const progressLabel = achievement.rawProgress > achievement.target
      ? `${formatCompactNumber(achievement.rawProgress)}/${formatCompactNumber(achievement.target)}`
      : `${formatCompactNumber(achievement.progress)}/${formatCompactNumber(achievement.target)}`;

    return `
      <article class="progress-achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} ${escapeHtml(achievement.tier)}">
        <header>
          <span>${escapeHtml(achievement.category)}</span>
          <strong>${achievement.unlocked ? 'UNLOCKED' : progressLabel}</strong>
        </header>
        <div class="achievement-tier">${escapeHtml(achievement.tier)}</div>
        <h3>${escapeHtml(achievement.title)}</h3>
        <p>${escapeHtml(achievement.description)}</p>
        <div class="achievement-meter"><span style="width:${achievementPercent}%"></span></div>
        <small>${progressLabel}</small>
      </article>
    `;
  }).join('');
}

function renderProgressSummary(items) {
  const totalXp = items.reduce((total, item) => total + item.xp.total, 0);
  const weeklyItems = items.filter((item) => new Date(item.workout.date) >= getMonday());
  const weeklyXp = weeklyItems.reduce((total, item) => total + item.xp.total, 0);
  const averageXp = items.length ? Math.round(totalXp / items.length) : 0;
  const best = [...items].sort((a, b) => b.xp.total - a.xp.total)[0];
  const executionXp = items.reduce((total, item) => total + item.xp.execution, 0);
  const campaignXp = items.reduce((total, item) => total + item.xp.campaign, 0);

  renderSummaryCards(progressSummaryCards, [
    {
      icon: 'XP',
      label: 'Total',
      value: String(totalXp),
      detail: `${executionXp} execucao + ${campaignXp} campanha`,
      tone: 'green'
    },
    {
      icon: 'WK',
      label: 'Semana',
      value: String(weeklyXp),
      detail: `${weeklyItems.length} treinos nesta semana`,
      tone: 'blue'
    },
    {
      icon: 'AVG',
      label: 'Media',
      value: String(averageXp),
      detail: 'xp medio por treino valido',
      tone: 'orange'
    },
    {
      icon: 'TOP',
      label: 'Melhor treino',
      value: best ? String(best.xp.total) : '0',
      detail: best ? `${best.workout.workoutCode} em ${formatDate(best.workout.date)}` : 'sem treinos ainda',
      tone: 'purple'
    },
    {
      icon: 'SNAP',
      label: 'Snapshot',
      value: `${items.filter((item) => item.xp.snapshot).length}/${items.length}`,
      detail: 'treinos com XP oficial salvo',
      tone: 'red'
    }
  ]);
}

function renderSeasonProgress() {
  if (!seasonProgressSummaryCards || !seasonProgressGrid) {
    return;
  }

  const position = getJourneyPosition();

  if (seasonProgressBadge) {
    seasonProgressBadge.textContent = position.label;
  }

  renderSummaryCards(seasonProgressSummaryCards, [
    {
      icon: 'DAY',
      label: 'Dia',
      value: String(position.day),
      detail: `semana ${position.week} da jornada anual`,
      tone: 'green'
    },
    {
      icon: `T${position.seasonNumber}`,
      label: 'Temporada',
      value: position.season.name,
      detail: `semana ${position.weekInSeason}/${academySeasonWeeks}`,
      tone: 'blue'
    },
    {
      icon: `C${position.cycleInSeason}`,
      label: 'Ciclo',
      value: `${position.cycleInSeason}/3`,
      detail: `semana ${position.weekInCycle}/${academyCycleWeeks}`,
      tone: 'orange'
    },
    {
      icon: 'YR',
      label: 'Ano',
      value: `${position.annualPercent}%`,
      detail: `${academyJourneyWeeks} semanas planejadas`,
      tone: 'purple'
    }
  ]);

  const progressItems = [
    {
      label: 'Jornada anual',
      value: `${position.annualPercent}%`,
      detail: `Semana ${position.week}/${academyJourneyWeeks}`,
      percent: position.annualPercent,
      className: 'annual'
    },
    {
      label: `Temporada ${position.seasonNumber} - ${position.season.name}`,
      value: `${position.seasonPercent}%`,
      detail: position.season.focus,
      percent: position.seasonPercent,
      className: 'season'
    },
    {
      label: `Ciclo ${position.cycleInSeason}`,
      value: `${position.cyclePercent}%`,
      detail: `Semana ${position.weekInCycle}/${academyCycleWeeks} do ciclo atual`,
      percent: position.cyclePercent,
      className: 'cycle'
    }
  ];

  seasonProgressGrid.innerHTML = progressItems.map((item) => `
    <article class="season-progress-card ${escapeHtml(item.className)}">
      <div>
        <span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.value)}</strong>
      </div>
      <p>${escapeHtml(item.detail)}</p>
      <div class="achievement-meter"><span style="width:${item.percent}%"></span></div>
    </article>
  `).join('');
}

function renderProgressTrend(items) {
  if (!progressXpTrend) {
    return;
  }

  if (!items.length) {
    progressXpTrend.innerHTML = '<p class="empty-state">Sem XP registrado ainda.</p>';
    return;
  }

  const byDate = new Map();

  items.forEach((item) => {
    const current = byDate.get(item.dateKey) || { total: 0, execution: 0, campaign: 0, workouts: 0 };

    current.total += item.xp.total;
    current.execution += item.xp.execution;
    current.campaign += item.xp.campaign;
    current.workouts += 1;
    byDate.set(item.dateKey, current);
  });

  const rows = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const maxXp = Math.max(1, ...rows.map(([, row]) => row.total));

  progressXpTrend.innerHTML = rows.map(([dateKey, row]) => `
    <article class="xp-trend-row">
      <div>
        <strong>${escapeHtml(formatDate(dateKey))}</strong>
        <span>${row.workouts} treino${row.workouts === 1 ? '' : 's'} | ${row.execution} exec + ${row.campaign} camp</span>
      </div>
      <div class="xp-trend-meter" aria-label="XP em ${escapeHtml(formatDate(dateKey))}">
        <span style="width:${Math.max(4, Math.round((row.total / maxXp) * 100))}%"></span>
      </div>
      <strong>${row.total} XP</strong>
    </article>
  `).join('');
}

function renderProgressSplit(items) {
  if (!progressXpSplit) {
    return;
  }

  const executionXp = items.reduce((total, item) => total + item.xp.execution, 0);
  const campaignXp = items.reduce((total, item) => total + item.xp.campaign, 0);
  const totalXp = Math.max(1, executionXp + campaignXp);
  const executionPercent = Math.round((executionXp / totalXp) * 100);
  const campaignPercent = Math.round((campaignXp / totalXp) * 100);

  progressXpSplit.innerHTML = `
    <article class="xp-split-card">
      <span>Execucao</span>
      <strong>${executionXp} XP</strong>
      <div class="xp-trend-meter"><span style="width:${executionPercent}%"></span></div>
      <p>${executionPercent}% do total</p>
    </article>
    <article class="xp-split-card campaign">
      <span>Campanha</span>
      <strong>${campaignXp} XP</strong>
      <div class="xp-trend-meter"><span style="width:${campaignPercent}%"></span></div>
      <p>${campaignPercent}% do total</p>
    </article>
  `;
}

function renderProgressLog(items) {
  if (!progressXpLog || !progressLogCount) {
    return;
  }

  progressLogCount.textContent = `${items.length} REG`;

  if (!items.length) {
    progressXpLog.innerHTML = '<p class="empty-state">Salve um treino para iniciar sua evolucao de XP.</p>';
    return;
  }

  progressXpLog.innerHTML = items.map(({ workout, xp }) => {
    const origin = getWorkoutOriginInfo(workout);

    return `
      <article class="progress-xp-row">
        <div>
          <span class="row-tag ${origin.className}">${escapeHtml(origin.label)}</span>
          <h3>Treino ${escapeHtml(workout.workoutCode)} - ${escapeHtml(workout.workoutName)}</h3>
          <p>${escapeHtml(formatDate(workout.date))} | ${workout.exercises.length} exercicios | ${xp.snapshot ? 'snapshot oficial' : 'fallback v2'}</p>
        </div>
        <div class="progress-xp-values">
          <strong>${xp.total} XP</strong>
          <span>${xp.execution} exec + ${xp.campaign} camp</span>
        </div>
      </article>
    `;
  }).join('');
}

function renderProgress() {
  const items = getXpWorkouts();
  const exerciseEntries = getExerciseProgressEntries();

  if (progressSubtitle) {
    progressSubtitle.textContent = items.length
      ? `// ${items.length} treinos com XP | ${items.filter((item) => item.xp.snapshot).length} snapshots oficiais`
      : '// nenhum treino com XP registrado';
  }

  renderProgressSummary(items);
  renderSeasonProgress();
  renderProgressTrend(items);
  renderProgressSplit(items);
  renderAnnualAchievements(items, exerciseEntries);
  renderProgressExercise(exerciseEntries);
  renderProgressLog(items);
}

function updateMissionSteps({ hasTemplate, hasCompletedToday, isRest }) {
  const steps = [
    { element: missionStepTemplate, done: hasTemplate, idle: isRest },
    { element: missionStepSets, done: hasCompletedToday, idle: isRest },
    { element: missionStepSave, done: hasCompletedToday, idle: isRest }
  ];

  steps.forEach((step) => {
    step.element.classList.toggle('done', step.done);
    step.element.classList.toggle('pending', !step.done && !step.idle);
    step.element.classList.toggle('idle', step.idle);
  });
}

function renderAchievements(items, exerciseEntries) {
  if (!achievementProgress || !achievementList) {
    return;
  }

  const stats = getAnnualAchievementStats(items, exerciseEntries);
  const achievements = getAnnualAchievements(stats);
  const unlocked = achievements.filter((achievement) => achievement.unlocked);
  const locked = achievements
    .filter((achievement) => !achievement.unlocked)
    .sort((a, b) => getAchievementPercent(b) - getAchievementPercent(a));
  const visibleAchievements = [...unlocked.slice(-4), ...locked.slice(0, 4)];

  achievementProgress.textContent = `${unlocked.length}/${achievements.length}`;

  if (!visibleAchievements.length) {
    achievementList.innerHTML = '<p class="empty-state">A jornada anual comeca no primeiro treino valido de hoje.</p>';
    return;
  }

  achievementList.innerHTML = visibleAchievements.map((achievement) => {
    const percent = getAchievementPercent(achievement);
    const progressLabel = achievement.rawProgress > achievement.target
      ? `${formatCompactNumber(achievement.rawProgress)}/${formatCompactNumber(achievement.target)}`
      : `${formatCompactNumber(achievement.progress)}/${formatCompactNumber(achievement.target)}`;

    return `
      <article class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${achievement.unlocked ? 'OK' : achievement.tier.toUpperCase()}</div>
        <div class="achievement-body">
          <div class="achievement-title-row">
            <h3>${escapeHtml(achievement.title)}</h3>
            <span>${achievement.unlocked ? 'UNLOCKED' : progressLabel}</span>
          </div>
          <p>${escapeHtml(achievement.category)} | ${escapeHtml(achievement.description)}</p>
          <div class="achievement-meter"><span style="width:${percent}%"></span></div>
        </div>
      </article>
    `;
  }).join('');
}

function renderWeeklyMissions(stats) {
  const missions = getWeeklyMissions(stats);
  const completed = missions.filter((mission) => mission.done).length;

  weeklyMissionProgress.textContent = `${completed}/${missions.length}`;
  weeklyMissionList.innerHTML = missions.map((mission) => {
    const progress = mission.progress ?? (mission.done ? 1 : 0);
    const target = mission.target ?? 1;
    const percent = mission.done ? 100 : Math.min(100, Math.round((progress / target) * 100));

    return `
      <article class="weekly-mission ${mission.done ? 'done' : 'pending'}">
        <div>
          <h3>${escapeHtml(mission.title)}</h3>
          <p>${escapeHtml(mission.description)}</p>
          <div class="achievement-meter"><span style="width:${percent}%"></span></div>
        </div>
        <strong>${mission.done ? 'OK' : `+${mission.reward} XP`}</strong>
      </article>
    `;
  }).join('');
}

function renderDashboardHistory() {
  const recentWorkouts = state.allWorkouts.slice(0, 3);

  if (!recentWorkouts.length) {
    dashboardHistory.innerHTML = '<p class="empty-state">Nenhuma sessao registrada ainda.</p>';
    return;
  }

  dashboardHistory.innerHTML = recentWorkouts.map(renderWorkoutCard).join('');
}

function renderWorkoutCard(workout) {
  const tags = getWorkoutTags(workout);
  const origin = getWorkoutOriginInfo(workout);
  const volume = calculateWorkoutVolume(workout);
  const validSets = countValidSets(workout);
  const validRounds = countValidRounds(workout);
  const skippedCount = countSkippedExercises(workout);
  const completedUnits = countCompletedUnits(workout);
  const quality = getWorkoutExecutionQuality(workout);
  const duration = Number(workout.durationMinutes || 0);
  const note = workout.notes ? `// ${escapeHtml(workout.notes)}` : '// Sessao registrada no protocolo.';

  return `
    <article class="workout-card">
      <div class="workout-card-header">
        <div>
          <h4>Treino ${escapeHtml(workout.workoutCode)} - ${escapeHtml(workout.workoutName)}</h4>
          <div class="workout-tags">
            <span class="row-tag ${origin.className}">${origin.label}</span>
            ${renderWorkoutQualityTag(quality)}
            ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
        <div class="workout-meta">
          <span>${toDateKey(workout.date)}</span>
          <strong>${duration ? `${duration} min` : `${completedUnits} logs`}</strong>
        </div>
      </div>
      <div class="workout-stats-row">
        <span>${formatWorkoutQualitySummary(quality)}${skippedCount && !quality.skippedCount ? ` | ${skippedCount} pulados` : ''}</span>
        <strong>${volume ? `${formatCompactNumber(volume)} kg` : `${validRounds} rounds`}</strong>
      </div>
      <div class="workout-bar">
        <span style="flex:${Math.max(1, tags.length || 1)}"></span>
        <span style="flex:${Math.max(1, completedUnits || 1)}"></span>
        <span style="flex:${Math.max(1, Math.round(volume / 100) || 1)}"></span>
      </div>
      <p class="workout-note">${note}</p>
      <div class="history-actions">
        <button class="button button-secondary" type="button" data-action="details" data-id="${workout._id}">Detalhes</button>
        <button class="button button-ghost" type="button" data-action="edit" data-id="${workout._id}">Editar</button>
        <button class="button button-ghost" type="button" data-action="delete" data-id="${workout._id}">Excluir</button>
      </div>
    </article>
  `;
}

function renderHistoryStats(filteredWorkouts) {
  const totalVolume = filteredWorkouts.reduce((total, workout) => total + calculateWorkoutVolume(workout), 0);
  const durationWorkouts = filteredWorkouts.filter((workout) => Number(workout.durationMinutes || 0) > 0);
  const averageDuration = durationWorkouts.length
    ? Math.round(durationWorkouts.reduce((total, workout) => total + Number(workout.durationMinutes || 0), 0) / durationWorkouts.length)
    : 0;
  const now = new Date();
  const workoutsThisMonth = filteredWorkouts.filter((workout) => {
    const date = new Date(workout.date);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;
  const extraWorkouts = filteredWorkouts.filter((workout) => getWorkoutOriginInfo(workout).className === 'extra').length;
  const lastWorkout = filteredWorkouts[0];

  renderSummaryCards(historySummaryCards, [
    {
      icon: '#',
      label: 'Total',
      value: String(filteredWorkouts.length),
      detail: 'sessoes no filtro atual',
      tone: 'green'
    },
    {
      icon: 'MO',
      label: 'Este mes',
      value: String(workoutsThisMonth),
      detail: 'registros no mes atual',
      tone: 'purple'
    },
    {
      icon: 'KG',
      label: 'Volume',
      value: `${formatCompactNumber(totalVolume)} kg`,
      detail: 'carga total filtrada',
      tone: 'blue'
    },
    {
      icon: 'TM',
      label: 'Duracao media',
      value: `${averageDuration} min`,
      detail: durationWorkouts.length ? 'media dos treinos com tempo' : 'sem tempo registrado',
      tone: 'orange'
    },
    {
      icon: '+',
      label: 'Extras',
      value: String(extraWorkouts),
      detail: lastWorkout ? `ultimo: ${lastWorkout.workoutCode} em ${formatDate(lastWorkout.date)}` : 'nenhum treino ainda',
      tone: 'red'
    }
  ]);
  historySubtitle.textContent = `// ${filteredWorkouts.length} sessoes encontradas | volume filtrado: ${formatCompactNumber(totalVolume)} kg`;
}

function renderWorkoutTags(tags) {
  return tags.map((tag) => (
    `<span class="row-tag ${getMuscleClass(tag)}">${escapeHtml(tag)}</span>`
  )).join('');
}

function renderHistoryListRow(workout, index) {
  const tags = getWorkoutTags(workout);
  const origin = getWorkoutOriginInfo(workout);
  const volume = calculateWorkoutVolume(workout);
  const duration = Number(workout.durationMinutes || 0);
  const validSets = countValidSets(workout);
  const validRounds = countValidRounds(workout);
  const skippedCount = countSkippedExercises(workout);
  const completedUnits = countCompletedUnits(workout);
  const quality = getWorkoutExecutionQuality(workout);
  const rowNumber = String(index + 1).padStart(3, '0');

  return `
    <article class="workout-row">
      <div class="row-id">#${rowNumber}</div>
      <div class="row-name">
        Treino ${escapeHtml(workout.workoutCode)} - ${escapeHtml(workout.workoutName)}
        <span class="sub">${formatWorkoutQualitySummary(quality)} | ${validSets} series | ${validRounds} rounds${skippedCount && !quality.skippedCount ? ` | ${skippedCount} pulados` : ''}</span>
      </div>
      <div class="row-tags"><span class="row-tag ${origin.className}">${origin.label}</span>${renderWorkoutQualityTag(quality)}${renderWorkoutTags(tags)}</div>
      <div class="row-date">
        ${toDateKey(workout.date)}
        <span>${formatWeekday(workout.date)}</span>
      </div>
      <div class="row-volume">${volume ? `${formatCompactNumber(volume)} kg` : `${validRounds} rounds`}</div>
      <div class="row-duration">${duration ? `${duration} min` : '-'}</div>
      <div class="row-sets">${completedUnits}</div>
      <div class="row-actions">
        <button class="button button-secondary compact-action" type="button" data-action="details" data-id="${workout._id}">Ver</button>
        <button class="button button-ghost compact-action" type="button" data-action="edit" data-id="${workout._id}">Editar</button>
        <button class="button button-ghost compact-action danger-action" type="button" data-action="delete" data-id="${workout._id}">Excluir</button>
      </div>
    </article>
  `;
}

function renderHistoryCard(workout) {
  const tags = getWorkoutTags(workout);
  const origin = getWorkoutOriginInfo(workout);
  const volume = calculateWorkoutVolume(workout);
  const duration = Number(workout.durationMinutes || 0);
  const validSets = countValidSets(workout);
  const validRounds = countValidRounds(workout);
  const skippedCount = countSkippedExercises(workout);
  const quality = getWorkoutExecutionQuality(workout);
  const note = workout.notes ? `// ${escapeHtml(workout.notes)}` : '// Sem observacoes registradas.';

  return `
    <article class="archive-card">
      <header>
        <div>
          <h3>Treino ${escapeHtml(workout.workoutCode)} - ${escapeHtml(workout.workoutName)}</h3>
          <div class="card-tags"><span class="row-tag ${origin.className}">${origin.label}</span>${renderWorkoutQualityTag(quality)}${renderWorkoutTags(tags)}</div>
        </div>
      </header>
      <div class="card-stats-grid">
        <div class="card-stat">
          <span>Execucao</span>
          <strong>${quality.plannedCount ? `${quality.executedCount}/${quality.plannedCount}` : `${workout.exercises.length}${skippedCount ? `/${skippedCount}p` : ''}`}</strong>
        </div>
        <div class="card-stat">
          <span>Volume</span>
          <strong class="blue">${volume ? formatCompactNumber(volume) : `${validRounds}r`}</strong>
        </div>
        <div class="card-stat">
          <span>Duracao</span>
          <strong class="orange">${duration ? `${duration}m` : '-'}</strong>
        </div>
      </div>
      <div class="workout-bar">
        <span style="flex:${Math.max(1, tags.length)}"></span>
        <span style="flex:${Math.max(1, validSets + validRounds)}"></span>
        <span style="flex:${Math.max(1, Math.round(volume / 100) || 1)}"></span>
      </div>
      <p class="workout-note">${note}</p>
      <footer>
        <span>${toDateKey(workout.date)}</span>
        <div class="history-actions">
          <button class="button button-secondary" type="button" data-action="details" data-id="${workout._id}">Ver</button>
          <button class="button button-ghost" type="button" data-action="edit" data-id="${workout._id}">Editar</button>
          <button class="button button-ghost" type="button" data-action="delete" data-id="${workout._id}">Excluir</button>
        </div>
      </footer>
    </article>
  `;
}

function renderHistoryPagination(totalItems) {
  const pageCount = Math.max(1, Math.ceil(totalItems / state.historyPageSize));

  if (state.historyPage > pageCount) {
    state.historyPage = pageCount;
  }

  const start = totalItems ? (state.historyPage - 1) * state.historyPageSize + 1 : 0;
  const end = Math.min(totalItems, state.historyPage * state.historyPageSize);
  const pageButtons = Array.from({ length: pageCount }, (_, index) => index + 1)
    .slice(0, 6)
    .map((page) => `<button class="page-btn ${page === state.historyPage ? 'active' : ''}" type="button" data-history-page="${page}">${page}</button>`)
    .join('');

  historyPagination.innerHTML = `
    <div class="pagination-info">Mostrando <span>${start}-${end}</span> de <span>${totalItems}</span> sessoes</div>
    <div class="pagination-controls">
      <button class="page-btn" type="button" data-history-page="${state.historyPage - 1}" ${state.historyPage === 1 ? 'disabled' : ''}>Anterior</button>
      ${pageButtons}
      <button class="page-btn" type="button" data-history-page="${state.historyPage + 1}" ${state.historyPage === pageCount ? 'disabled' : ''}>Proxima</button>
    </div>
  `;
}

function resetHistoryPageAndRender() {
  state.historyPage = 1;
  renderHistory();
}

function exportHistoryCsv() {
  const workouts = getFilteredHistoryWorkouts();
  const rows = [
    ['data', 'ficha', 'nome', 'exercicios', 'pulados', 'series_validas', 'volume_kg', 'duracao_min', 'observacoes'],
    ...workouts.map((workout) => [
      toDateKey(workout.date),
      workout.workoutCode,
      workout.workoutName,
      workout.exercises.length,
      countSkippedExercises(workout),
      countValidSets(workout),
      calculateWorkoutVolume(workout),
      workout.durationMinutes || 0,
      workout.notes || ''
    ])
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `treinos-realizados-${todayInputValue()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function renderHeatmap() {
  const completedWorkoutsByDate = state.allWorkouts.reduce((map, workout) => {
    if (!isCompletedWorkout(workout)) {
      return map;
    }

    const dateKey = toDateKey(workout.date);
    const workouts = map.get(dateKey) || [];

    workouts.push(workout);
    map.set(dateKey, workouts);
    return map;
  }, new Map());
  const todayKey = todayInputValue();
  const start = new Date(`${heatmapStartDate}T00:00:00`);

  function getMissionHeatStatus(date) {
    const dateKey = date.toISOString().slice(0, 10);
    const mission = getDailyMissionForDate(date);
    const completedWorkouts = completedWorkoutsByDate.get(dateKey) || [];
    const missionCodes = mission?.restDay
      ? 'descanso planejado'
      : (mission?.blocks || [])
          .filter((block) => block.type !== 'recovery')
          .map((block) => block.workoutCode)
          .join(' + ');
    const withExtra = (status, extraLabels) => ({
      ...status,
      className: extraLabels ? `${status.className} heat-extra` : status.className,
      title: extraLabels ? `${status.title}
Extra: ${extraLabels}` : status.title
    });

    if (dateKey > todayKey) {
      return {
        className: 'heat-future',
        title: formatDate(dateKey)
      };
    }

    if (!mission) {
      const extraLabels = completedWorkouts.map((workout) => workout.workoutCode).sort().join(', ');

      return withExtra({
        className: 'heat-future',
        title: `${formatDate(dateKey)}
Status: Sem missao configurada`
      }, extraLabels);
    }

    if (mission.restDay) {
      const extraLabels = completedWorkouts.map((workout) => workout.workoutCode).sort().join(', ');

      return withExtra({
        className: 'heat-rest',
        title: `${formatDate(dateKey)}
Status: Descanso planejado`
      }, extraLabels);
    }

    const requiredBlocks = (mission.blocks || []).filter((block) => block.type !== 'recovery');
    const completedBlockEntries = requiredBlocks
      .map((block) => ({ block, workout: getWorkoutForMissionBlock(dateKey, block) }))
      .filter((entry) => entry.workout);
    const attemptedBlockEntries = requiredBlocks
      .map((block) => ({ block, workout: getWorkoutAttemptForMissionBlock(dateKey, block) }))
      .filter((entry) => entry.workout);
    const completedWorkoutIds = new Set(completedBlockEntries.map((entry) => entry.workout._id));
    const attemptedWorkoutIds = new Set(attemptedBlockEntries.map((entry) => entry.workout._id));
    const completedBlocks = completedBlockEntries.map((entry) => entry.block);
    const missingBlocks = requiredBlocks.filter((block) => !getWorkoutForMissionBlock(dateKey, block));
    const completedLabels = completedBlockEntries
      .map((entry) => {
        const quality = getWorkoutExecutionQuality(entry.workout);

        return `${formatMissionBlockCompletion(entry.block, entry.workout)} ${quality.label} ${quality.plannedCount ? `${quality.percent}%` : ''}`.trim();
      })
      .join(', ') || 'nenhum';
    const attemptedLabels = attemptedBlockEntries
      .map((entry) => {
        const quality = getWorkoutExecutionQuality(entry.workout);

        return `${formatMissionBlockCompletion(entry.block, entry.workout)} ${quality.label} ${quality.plannedCount ? `${quality.percent}%` : ''}`.trim();
      })
      .join(', ') || 'nenhum';
    const missingLabels = missingBlocks.map((block) => block.workoutCode).join(', ') || 'nenhum';
    const extraLabels = completedWorkouts
      .filter((workout) => !completedWorkoutIds.has(workout._id) && !attemptedWorkoutIds.has(workout._id))
      .map((workout) => workout.workoutCode)
      .sort()
      .join(', ');

    if (completedBlocks.length === 0 && attemptedBlockEntries.length === 0) {
      return withExtra({
        className: 'heat-missed',
        title: `${formatDate(dateKey)}
Status: Perdida
Missao: ${missionCodes}
Feito: nenhum
Faltou: ${missingLabels}`
      }, extraLabels);
    }

    if (completedBlocks.length === 0 && attemptedBlockEntries.length > 0) {
      return withExtra({
        className: 'heat-partial',
        title: `${formatDate(dateKey)}
Status: Parcial
Missao: ${missionCodes}
Feito: ${attemptedLabels}
Faltou: ${missingLabels}`
      }, extraLabels);
    }

    if (completedBlocks.length < requiredBlocks.length) {
      return withExtra({
        className: 'heat-partial',
        title: `${formatDate(dateKey)}
Status: Parcial
Missao: ${missionCodes}
Feito: ${completedLabels}
Faltou: ${missingLabels}`
      }, extraLabels);
    }

    return withExtra({
      className: 'heat-complete',
      title: `${formatDate(dateKey)}
Status: Completa
Missao: ${missionCodes}
Feito: ${completedLabels}`
    }, extraLabels);
  }

  const weeks = Array.from({ length: heatmapWeekCount }, (_, weekIndex) => {
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(start);

      date.setDate(start.getDate() + weekIndex * 7 + dayIndex);

      const status = getMissionHeatStatus(date);

      return `<span class="heat-cell ${status.className}" title="${escapeHtml(status.title)}"></span>`;
    }).join('');
  });

  heatmapGrid.innerHTML = weeks.map((week) => `<div class="heat-week">${week}</div>`).join('');
}

function renderHistory() {
  const filteredWorkouts = getFilteredHistoryWorkouts();
  const start = (state.historyPage - 1) * state.historyPageSize;
  const pageWorkouts = filteredWorkouts.slice(start, start + state.historyPageSize);

  renderHistoryStats(filteredWorkouts);
  renderHistoryPagination(filteredWorkouts.length);
  historyList.className = state.historyView === 'cards' ? 'history-list card-grid' : 'history-list workout-list';
  historyListHeader.hidden = state.historyView === 'cards';

  if (!filteredWorkouts.length) {
    historyList.innerHTML = '<p class="empty-state">Nenhum treino encontrado para estes filtros.</p>';
    return;
  }

  historyList.innerHTML = pageWorkouts
    .map((workout, index) => (
      state.historyView === 'cards'
        ? renderHistoryCard(workout)
        : renderHistoryListRow(workout, start + index)
    ))
    .join('');
}

function setSelectOptions(select, values, currentValue, allLabel = 'Todas') {
  const options = [
    `<option value="all">${escapeHtml(allLabel)}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
  ].join('');

  select.innerHTML = options;
  select.value = [...select.options].some((option) => option.value === currentValue) ? currentValue : 'all';
}

function getContextSubcategories({ category = 'all', modality = 'all' } = {}) {
  return [...new Set(state.exercises
    .filter((exercise) => {
      const matchesCategory = category === 'all' || exercise.category === category;
      const matchesModality = modality === 'all' || (exercise.modality || 'strength') === modality;

      return matchesCategory && matchesModality;
    })
    .map((exercise) => exercise.subcategory)
    .filter(Boolean))]
    .sort();
}

function refreshCatalogSubcategoryOptions(currentValue = catalogSubcategoryFilter.value) {
  const selectedWorkoutType = getSelectedTemplateWorkoutType();
  const subcategories = getContextSubcategories({
    category: catalogCategoryFilter.value,
    modality: selectedWorkoutType.code
  });

  setSelectOptions(catalogSubcategoryFilter, subcategories, currentValue);
}

function refreshExercisePageSubcategoryOptions(currentValue = exercisePageSubcategoryFilter.value) {
  const subcategories = getContextSubcategories({
    category: exercisePageCategoryFilter.value,
    modality: exercisePageModalityFilter.value
  });

  setSelectOptions(exercisePageSubcategoryFilter, subcategories, currentValue);
}

function renderCategoryOptions() {
  const currentCatalogCategory = catalogCategoryFilter.value;
  const currentCatalogSubcategory = catalogSubcategoryFilter.value;
  const currentExerciseCategory = exercisePageCategoryFilter.value;
  const currentExerciseSubcategory = exercisePageSubcategoryFilter.value;
  const currentExerciseModality = exercisePageModalityFilter.value;
  const currentExerciseMeasurement = exercisePageMeasurementFilter.value;
  const categories = [...new Set(state.exercises.map((exercise) => exercise.category))].sort();
  const modalities = [...new Set(state.exercises.map((exercise) => exercise.modality || 'strength'))].sort();
  const measurementTypes = [...new Set(state.exercises.map((exercise) => exercise.measurementType || 'sets_reps_weight'))].sort();
  const options = [
    '<option value="all">Todas</option>',
    ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
  ].join('');
  const modalityOptions = [
    '<option value="all">Todas</option>',
    ...modalities.map((modality) => `<option value="${escapeHtml(modality)}">${escapeHtml(getWorkoutTypeName(modality))}</option>`)
  ].join('');
  const measurementOptions = [
    '<option value="all">Todas</option>',
    ...measurementTypes.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(getMeasurementLabel(type))}</option>`)
  ].join('');

  catalogCategoryFilter.innerHTML = options;
  exercisePageCategoryFilter.innerHTML = options;
  exercisePageModalityFilter.innerHTML = modalityOptions;
  exercisePageMeasurementFilter.innerHTML = measurementOptions;

  catalogCategoryFilter.value = [...catalogCategoryFilter.options].some((option) => option.value === currentCatalogCategory) ? currentCatalogCategory : 'all';
  exercisePageCategoryFilter.value = [...exercisePageCategoryFilter.options].some((option) => option.value === currentExerciseCategory) ? currentExerciseCategory : 'all';
  exercisePageModalityFilter.value = [...exercisePageModalityFilter.options].some((option) => option.value === currentExerciseModality) ? currentExerciseModality : 'all';
  exercisePageMeasurementFilter.value = [...exercisePageMeasurementFilter.options].some((option) => option.value === currentExerciseMeasurement) ? currentExerciseMeasurement : 'all';
  refreshCatalogSubcategoryOptions(currentCatalogSubcategory);
  refreshExercisePageSubcategoryOptions(currentExerciseSubcategory);
}

function renderCatalog() {
  refreshCatalogSubcategoryOptions();
  const category = catalogCategoryFilter.value;
  const subcategory = catalogSubcategoryFilter.value;
  const search = catalogSearch.value.trim().toLowerCase();
  const selectedWorkoutType = getSelectedTemplateWorkoutType();
  const selectedIds = new Set(state.selectedTemplateExercises.map((exercise) => exercise.exerciseId));
  const filteredExercises = state.exercises.filter((exercise) => {
    const matchesCategory = category === 'all' || exercise.category === category;
    const matchesSubcategory = subcategory === 'all' || exercise.subcategory === subcategory;
    const matchesModality = (exercise.modality || 'strength') === selectedWorkoutType.code;
    const searchableText = [exercise.name, exercise.category, exercise.subcategory].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch = !search || searchableText.includes(search);
    return matchesCategory && matchesSubcategory && matchesModality && matchesSearch;
  });

  if (!filteredExercises.length) {
    catalogList.innerHTML = `<p class="empty-state">Nenhum exercicio encontrado para ${escapeHtml(selectedWorkoutType.name)}.</p>`;
    return;
  }

  catalogList.innerHTML = filteredExercises.map((exercise) => {
    const isSelected = selectedIds.has(exercise._id);
    const loadMeta = getLoadModeMeta(getExerciseLoadMode(exercise));
    const loadLabel = (exercise.measurementType || 'sets_reps_weight').startsWith('rounds') ? '' : ` | ${loadMeta.label}`;
    return `
      <article class="catalog-item">
        ${getExerciseImageMarkup(exercise, 'thumb')}
        <div>
          <p class="catalog-title">${escapeHtml(exercise.name)}</p>
          <div class="history-meta">${escapeHtml(getWorkoutTypeName(exercise.modality || 'strength'))} | ${escapeHtml(formatExerciseGroup(exercise))} | ${escapeHtml(formatExercisePrescription(exercise))}${escapeHtml(loadLabel)} | ${escapeHtml(exercise.equipment.join(', '))}</div>
        </div>
        <button class="button ${isSelected ? 'button-ghost' : 'button-secondary'}" type="button" data-catalog-id="${exercise._id}" ${isSelected ? 'disabled' : ''}>
          ${isSelected ? 'Adicionado' : 'Adicionar'}
        </button>
      </article>
    `;
  }).join('');
}

function renderExerciseStats(exercises = state.exercises) {
  const strengthExercises = exercises.filter((exercise) => (exercise.modality || 'strength') === 'strength').length;
  const combatExercises = exercises.filter((exercise) => ['boxing', 'kickboxing'].includes(exercise.modality)).length;
  const categories = new Set(exercises.map((exercise) => exercise.category).filter(Boolean)).size;
  const subcategories = new Set(exercises.map((exercise) => exercise.subcategory).filter(Boolean)).size;

  renderSummaryCards(exerciseSummaryCards, [
    {
      icon: '#',
      label: 'Total',
      value: String(exercises.length),
      detail: 'exercicios no filtro atual',
      tone: 'green'
    },
    {
      icon: 'STR',
      label: 'Musculacao',
      value: String(strengthExercises),
      detail: 'exercicios de carga',
      tone: 'blue'
    },
    {
      icon: 'LUT',
      label: 'Luta',
      value: String(combatExercises),
      detail: 'boxe e kickboxing',
      tone: 'red'
    },
    {
      icon: 'CAT',
      label: 'Categorias',
      value: String(categories),
      detail: 'grupos diferentes',
      tone: 'orange'
    },
    {
      icon: 'SUB',
      label: 'Subcategorias',
      value: String(subcategories),
      detail: 'recortes especificos',
      tone: 'purple'
    }
  ]);
}

function getExerciseMediaActionsMarkup(exercise) {
  const canSyncAutomatically = (exercise.modality || 'strength') === 'strength';

  if (hasExerciseMedia(exercise)) {
    return `
      <div class="media-actions">
        <button class="button button-secondary sync-exercise-media" type="button" data-exercise-id="${exercise._id}">
          Atualizar imagem
        </button>
        <span class="media-status">Imagem vinculada: ${escapeHtml(exercise.mediaProvider || 'media')}</span>
      </div>
    `;
  }

  if (!canSyncAutomatically) {
    return `
      <div class="media-actions">
        <span class="media-status muted">Sem imagem automatica confiavel</span>
      </div>
    `;
  }

  return `
    <div class="media-actions">
      <button class="button button-secondary sync-exercise-media" type="button" data-exercise-id="${exercise._id}">
        Sincronizar imagem
      </button>
      <span class="media-status muted">Sem imagem confiavel no wger</span>
    </div>
  `;
}

function renderExercisePage() {
  refreshExercisePageSubcategoryOptions();
  const modality = exercisePageModalityFilter.value;
  const category = exercisePageCategoryFilter.value;
  const subcategory = exercisePageSubcategoryFilter.value;
  const measurementType = exercisePageMeasurementFilter.value;
  const search = exercisePageSearch.value.trim().toLowerCase();
  const filteredExercises = state.exercises.filter((exercise) => {
    const matchesModality = modality === 'all' || (exercise.modality || 'strength') === modality;
    const matchesCategory = category === 'all' || exercise.category === category;
    const matchesSubcategory = subcategory === 'all' || exercise.subcategory === subcategory;
    const matchesMeasurement = measurementType === 'all' || (exercise.measurementType || 'sets_reps_weight') === measurementType;
    const searchableText = [exercise.name, exercise.category, exercise.subcategory].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch = !search || searchableText.includes(search);
    return matchesModality && matchesCategory && matchesSubcategory && matchesMeasurement && matchesSearch;
  });

  renderExerciseStats(filteredExercises);

  if (!filteredExercises.length) {
    exercisePageList.innerHTML = '<p class="empty-state">Nenhum exercicio encontrado.</p>';
    exerciseSubtitle.textContent = '// nenhum item encontrado para o filtro atual';
    return;
  }

  exerciseSubtitle.textContent = `// ${filteredExercises.length} exercicios no catalogo | filtros ativos aplicados em tempo real`;
  exercisePageList.innerHTML = filteredExercises.map((exercise) => {
    const isRoundBased = (exercise.measurementType || 'sets_reps_weight').startsWith('rounds');
    const loadMeta = getLoadModeMeta(getExerciseLoadMode(exercise));

    return `
      <article class="exercise-library-card" data-exercise-id="${exercise._id}">
        <header>
          <span class="row-tag ${getMuscleClass(exercise.category)}">${escapeHtml(exercise.category)}</span>
          <strong>${escapeHtml(formatExercisePrescription(exercise))}</strong>
        </header>
        ${getExerciseImageMarkup(exercise, 'library')}
        <h3>${escapeHtml(exercise.name)}</h3>
        <div class="history-meta">${escapeHtml(getWorkoutTypeName(exercise.modality || 'strength'))} | ${escapeHtml(formatExerciseGroup(exercise))} | ${escapeHtml(getMeasurementLabel(exercise.measurementType || 'sets_reps_weight'))}${isRoundBased ? '' : ` | ${escapeHtml(loadMeta.label)}`}</div>
        <div class="equipment-line">${escapeHtml(exercise.equipment.join(', '))}</div>
        ${isRoundBased ? '' : `<p class="load-mode-meta compact"><strong>${escapeHtml(loadMeta.fieldLabel)}:</strong> ${escapeHtml(loadMeta.hint)}</p>`}
        ${getExerciseInstructionMarkup(exercise)}
        ${getExerciseMediaActionsMarkup(exercise)}
        <div class="exercise-media-results" data-results-for="${exercise._id}"></div>
        <div class="mini-meter">
          <span></span><span></span><span></span>
        </div>
      </article>
    `;
  }).join('');
}

async function syncExerciseMedia(exerciseId) {
  const exercise = state.exercises.find((item) => item._id === exerciseId);
  const resultsContainer = exercisePageList.querySelector(`[data-results-for="${exerciseId}"]`);

  if (!exercise || !resultsContainer) {
    return;
  }

  resultsContainer.innerHTML = '<p class="empty-state media-loading">Sincronizando imagem automaticamente...</p>';

  try {
    const result = await requestJson('/api/exercise-media/sync', {
      method: 'POST',
      body: JSON.stringify({ exerciseId })
    });

    const media = result.media || result.exercise || {};
    resultsContainer.innerHTML = `
      <article class="media-result">
        ${getExerciseImageMarkup({
          imageUrl: result.exercise?.imageUrl,
          imageAlt: result.exercise?.imageAlt,
          mediaProvider: result.exercise?.mediaProvider,
          category: result.exercise?.category
        }, 'result')}
        <div>
          <h4>Imagem vinculada automaticamente</h4>
          <p>${escapeHtml(media.name || result.exercise?.name || exercise.name)}</p>
          ${result.exercise?.imageAuthor ? `<p>Autor: ${escapeHtml(result.exercise.imageAuthor)}</p>` : ''}
        </div>
      </article>
    `;

    await loadExercises();
    await loadTemplates();
    renderExercisePage();
    renderCatalog();
    renderSelectedTemplateExercises();
  } catch (error) {
    resultsContainer.innerHTML = `<p class="empty-state media-loading">${escapeHtml(error.message)}</p>`;
  }
}

async function linkExerciseMedia(exerciseId, media) {
  if (!media) {
    return;
  }

  await requestJson('/api/exercise-media/link', {
    method: 'POST',
    body: JSON.stringify({
      exerciseId,
      mediaProvider: media.provider,
      externalExerciseId: media.externalExerciseId,
      imageUrl: media.imageUrl,
      imageAlt: media.imageAlt,
      imageLicense: media.imageLicense,
      imageLicenseUrl: media.imageLicenseUrl,
      imageAuthor: media.imageAuthor,
      imageAuthorUrl: media.imageAuthorUrl,
      imageSourceUrl: media.imageSourceUrl,
      instructions: [],
      tips: []
    })
  });

  await loadExercises();
  await loadTemplates();
  renderCategoryOptions();
  renderExercisePage();
  renderCatalog();
  renderSelectedTemplateExercises();
}

function renderSelectedTemplateExercises() {
  if (!state.selectedTemplateExercises.length) {
    selectedTemplateList.innerHTML = '<p class="empty-state">Escolha exercicios no catalogo para montar a ficha.</p>';
    return;
  }

  selectedTemplateList.innerHTML = state.selectedTemplateExercises.map((exercise, index) => {
    const measurementType = exercise.measurementType || 'sets_reps_weight';
    const isRoundBased = measurementType === 'rounds_time' || measurementType === 'rounds_time_reps';
    const loadMeta = getLoadModeMeta(getExerciseLoadMode(exercise));
    const fields = isRoundBased ? `
      <label>
        Rounds
        <input class="template-planned-rounds" type="number" min="1" step="1" value="${exercise.plannedRounds || 1}" required />
      </label>
      <label>
        Tempo/s
        <input class="template-planned-duration" type="number" min="1" step="1" value="${exercise.plannedDurationSeconds || 60}" required />
      </label>
      <label>
        Desc./s
        <input class="template-planned-rest" type="number" min="0" step="1" value="${exercise.plannedRestSeconds || 0}" required />
      </label>
    ` : `
      <label>
        Series
        <input class="template-planned-sets" type="number" min="1" step="1" value="${exercise.plannedSets || 1}" required />
      </label>
      <label>
        Repeticoes
        <input class="template-planned-reps" type="text" value="${escapeHtml(exercise.plannedReps || '')}" required />
      </label>
    `;

    return `
      <article class="template-exercise-row" data-index="${index}">
        <strong class="exercise-index">${index + 1}</strong>
        ${getExerciseImageMarkup(exercise, 'thumb')}
        <div>
          <p class="catalog-title">${escapeHtml(exercise.name)}</p>
          <div class="history-meta">${escapeHtml(getWorkoutTypeName(exercise.modality || 'strength'))} | ${escapeHtml(formatExerciseGroup(exercise))} | ${escapeHtml(getMeasurementLabel(measurementType))}${isRoundBased ? '' : ` | ${escapeHtml(loadMeta.label)}`}</div>
        </div>
        ${fields}
        <button class="icon-button remove-template-exercise" type="button" aria-label="Remover exercicio">x</button>
      </article>
    `;
  }).join('');
}

function getFilteredTemplates() {
  const search = state.templateSearch.trim().toLowerCase();
  const filtered = state.templates.filter((template) => {
    const searchableText = [
      template.code,
      template.name,
      template.description,
      template.workoutTypeName,
      template.measurementType,
      ...(template.exercises || []).flatMap((exercise) => [exercise.name, exercise.category, exercise.subcategory])
    ].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch = !search || searchableText.includes(search);
    const matchesType = state.templateTypeFilter === 'all' || (template.workoutTypeCode || 'strength') === state.templateTypeFilter;
    const matchesMeasurement = state.templateMeasurementFilter === 'all' || (template.measurementType || 'sets_reps_weight') === state.templateMeasurementFilter;

    return matchesSearch && matchesType && matchesMeasurement;
  });

  return [...filtered].sort((a, b) => {
    if (state.templateSort === 'name') {
      return a.name.localeCompare(b.name);
    }

    if (state.templateSort === 'exercises') {
      return (b.exercises || []).length - (a.exercises || []).length;
    }

    if (state.templateSort === 'xp') {
      return Number(b.xpReward || 0) - Number(a.xpReward || 0);
    }

    return a.code.localeCompare(b.code);
  });
}

function renderTemplateFilterOptions() {
  const typeOptions = [...new Map(state.templates.map((template) => [
    template.workoutTypeCode || 'strength',
    template.workoutTypeName || getWorkoutTypeName(template.workoutTypeCode || 'strength')
  ])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const measurementOptions = [...new Set(state.templates.map((template) => template.measurementType || 'sets_reps_weight'))].sort();

  templateTypeFilter.innerHTML = [
    '<option value="all">Todos</option>',
    ...typeOptions.map(([code, name]) => `<option value="${escapeHtml(code)}">${escapeHtml(name)}</option>`)
  ].join('');
  templateMeasurementFilter.innerHTML = [
    '<option value="all">Todas</option>',
    ...measurementOptions.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(getMeasurementLabel(type))}</option>`)
  ].join('');

  templateTypeFilter.value = typeOptions.some(([code]) => code === state.templateTypeFilter) ? state.templateTypeFilter : 'all';
  templateMeasurementFilter.value = measurementOptions.includes(state.templateMeasurementFilter) ? state.templateMeasurementFilter : 'all';
  state.templateTypeFilter = templateTypeFilter.value;
  state.templateMeasurementFilter = templateMeasurementFilter.value;
}

function renderTemplateStats(templates = state.templates) {
  const totalTemplates = templates.length;
  const strengthTemplates = templates.filter((template) => (template.workoutTypeCode || 'strength') === 'strength').length;
  const combatTemplates = templates.filter((template) => ['boxing', 'kickboxing'].includes(template.workoutTypeCode)).length;
  const linkedExercises = templates.reduce((total, template) => total + (template.exercises || []).length, 0);
  const totalXp = templates.reduce((total, template) => total + Number(template.xpReward || 0), 0);

  renderSummaryCards(templateSummaryCards, [
    {
      icon: '#',
      label: 'Total',
      value: String(totalTemplates),
      detail: 'fichas cadastradas',
      tone: 'green'
    },
    {
      icon: 'STR',
      label: 'Musculacao',
      value: String(strengthTemplates),
      detail: 'protocolos de carga',
      tone: 'blue'
    },
    {
      icon: 'LUT',
      label: 'Luta',
      value: String(combatTemplates),
      detail: 'boxe e kickboxing',
      tone: 'red'
    },
    {
      icon: 'EX',
      label: 'Exercicios',
      value: String(linkedExercises),
      detail: 'itens vinculados nas fichas',
      tone: 'orange'
    },
    {
      icon: 'XP',
      label: 'XP possivel',
      value: String(totalXp),
      detail: 'recompensa somada das fichas',
      tone: 'purple'
    }
  ]);
}

function renderTemplates() {
  renderTemplateFilterOptions();
  const filteredTemplates = getFilteredTemplates();

  renderTemplateStats(filteredTemplates);

  if (!state.templates.length) {
    templateList.innerHTML = '<p class="empty-state">Nenhuma ficha cadastrada ainda.</p>';
    templateSubtitle.textContent = '// nenhuma ficha cadastrada ainda';
    return;
  }

  if (!filteredTemplates.length) {
    templateList.innerHTML = '<p class="empty-state">Nenhuma ficha encontrada para estes filtros.</p>';
    templateSubtitle.textContent = '// nenhum protocolo encontrado para o filtro atual';
    return;
  }

  templateSubtitle.textContent = `// ${filteredTemplates.length} de ${state.templates.length} protocolos | filtros ativos aplicados em tempo real`;
  templateList.innerHTML = filteredTemplates.map((template) => `
    <article class="template-card">
      <header>
        <div>
          <span class="template-code">Treino ${escapeHtml(template.code)}</span>
          <h3>${escapeHtml(template.name)}</h3>
        </div>
        <strong>${template.exercises.length}</strong>
      </header>
      <p class="type-line">${escapeHtml(template.workoutTypeName || 'Musculacao')} | ${escapeHtml(template.measurementType || 'sets_reps_weight')}</p>
      ${template.level || template.xpReward ? `<p class="type-line">${escapeHtml(template.level || 'Livre')} | ${Number(template.xpReward || 0)} XP</p>` : ''}
      ${template.description ? `<p>${escapeHtml(template.description)}</p>` : ''}
      <div class="template-muscles">
        ${[...new Set(template.exercises.map((exercise) => exercise.category))].slice(0, 5).map((tag) => (
          `<span class="row-tag ${getMuscleClass(tag)}">${escapeHtml(tag)}</span>`
        )).join('')}
      </div>
      <ol class="template-preview">
        ${template.exercises.slice(0, 4).map((exercise) => `<li>${escapeHtml(exercise.name)}</li>`).join('')}
      </ol>
      <div class="history-actions">
        <button class="button button-secondary" type="button" data-template-action="view" data-id="${template._id}">Ver</button>
        <button class="button button-ghost" type="button" data-template-action="edit" data-id="${template._id}">Editar</button>
        <button class="button button-ghost" type="button" data-template-action="delete" data-id="${template._id}">Excluir</button>
      </div>
    </article>
  `).join('');
}

function renderWorkoutTypeOptions() {
  const currentValue = templateWorkoutTypeInput.value;
  const strengthType = getStrengthWorkoutType();

  templateWorkoutTypeInput.innerHTML = [
    '<option value="">Selecione um tipo</option>',
    ...state.workoutTypes.map((type) => (
      `<option value="${type._id}">${escapeHtml(type.name)} | ${escapeHtml(type.measurementType)}</option>`
    ))
  ].join('');

  templateWorkoutTypeInput.value = currentValue || strengthType._id || '';
}

function getFilteredWorkoutTypes() {
  const search = state.workoutTypeSearch.trim().toLowerCase();

  return state.workoutTypes.filter((type) => {
    const searchableText = [
      type.code,
      type.name,
      type.description,
      type.measurementType,
      ...(type.fields || [])
    ].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch = !search || searchableText.includes(search);
    const matchesMeasurement = state.workoutTypeMeasurementFilter === 'all' || type.measurementType === state.workoutTypeMeasurementFilter;
    const matchesField = state.workoutTypeFieldFilter === 'all' || (type.fields || []).includes(state.workoutTypeFieldFilter);

    return matchesSearch && matchesMeasurement && matchesField;
  });
}

function renderWorkoutTypeFilterOptions() {
  const measurementOptions = [...new Set(state.workoutTypes.map((type) => type.measurementType).filter(Boolean))].sort();
  const fieldOptions = [...new Set(state.workoutTypes.flatMap((type) => type.fields || []))].sort();

  workoutTypeMeasurementFilter.innerHTML = [
    '<option value="all">Todas</option>',
    ...measurementOptions.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(getMeasurementLabel(type))}</option>`)
  ].join('');
  workoutTypeFieldFilter.innerHTML = [
    '<option value="all">Todos</option>',
    ...fieldOptions.map((field) => `<option value="${escapeHtml(field)}">${escapeHtml(field)}</option>`)
  ].join('');

  workoutTypeMeasurementFilter.value = measurementOptions.includes(state.workoutTypeMeasurementFilter) ? state.workoutTypeMeasurementFilter : 'all';
  workoutTypeFieldFilter.value = fieldOptions.includes(state.workoutTypeFieldFilter) ? state.workoutTypeFieldFilter : 'all';
  state.workoutTypeMeasurementFilter = workoutTypeMeasurementFilter.value;
  state.workoutTypeFieldFilter = workoutTypeFieldFilter.value;
}

function renderWorkoutTypeStats(types = state.workoutTypes) {
  const usedTypeCodes = new Set(state.templates.map((template) => template.workoutTypeCode || 'strength'));
  const usedTypes = types.filter((type) => usedTypeCodes.has(type.code)).length;
  const setsTypes = types.filter((type) => (type.measurementType || '').startsWith('sets')).length;
  const roundsTypes = types.filter((type) => (type.measurementType || '').startsWith('rounds')).length;
  const fieldsCount = new Set(types.flatMap((type) => type.fields || [])).size;

  renderSummaryCards(workoutTypeSummaryCards, [
    {
      icon: '#',
      label: 'Total',
      value: String(types.length),
      detail: 'tipos no filtro atual',
      tone: 'green'
    },
    {
      icon: 'USE',
      label: 'Em fichas',
      value: String(usedTypes),
      detail: 'tipos usados por protocolos',
      tone: 'blue'
    },
    {
      icon: 'SET',
      label: 'Series',
      value: String(setsTypes),
      detail: 'medicao por series/reps',
      tone: 'orange'
    },
    {
      icon: 'RND',
      label: 'Rounds',
      value: String(roundsTypes),
      detail: 'medicao por tempo/rounds',
      tone: 'red'
    },
    {
      icon: 'FLD',
      label: 'Campos',
      value: String(fieldsCount),
      detail: 'campos diferentes',
      tone: 'purple'
    }
  ]);
}

function renderWorkoutTypes() {
  renderWorkoutTypeFilterOptions();
  const filteredTypes = getFilteredWorkoutTypes();

  renderWorkoutTypeStats(filteredTypes);

  if (!state.workoutTypes.length) {
    workoutTypeList.innerHTML = '<p class="empty-state">Nenhum tipo de treino cadastrado.</p>';
    workoutTypeSubtitle.textContent = '// nenhum tipo cadastrado ainda';
    return;
  }

  if (!filteredTypes.length) {
    workoutTypeList.innerHTML = '<p class="empty-state">Nenhum tipo encontrado para estes filtros.</p>';
    workoutTypeSubtitle.textContent = '// nenhum tipo encontrado para o filtro atual';
    return;
  }

  workoutTypeSubtitle.textContent = `// ${filteredTypes.length} de ${state.workoutTypes.length} tipos disponiveis para fichas e treinos`;
  workoutTypeList.innerHTML = filteredTypes.map((type) => `
    <article class="type-card">
      <header>
        <div>
          <span class="template-code">${escapeHtml(type.code)}</span>
          <h3>${escapeHtml(type.name)}</h3>
        </div>
        <strong>${escapeHtml(type.measurementType)}</strong>
      </header>
      <p>${escapeHtml(type.description || 'Tipo de treino personalizado.')}</p>
      <div class="template-muscles">
        ${(type.fields || []).map((field) => `<span class="row-tag core">${escapeHtml(field)}</span>`).join('')}
      </div>
      <div class="history-actions">
        <button class="button button-ghost" type="button" data-type-action="edit" data-id="${type._id}">Editar</button>
        <button class="button button-ghost" type="button" data-type-action="delete" data-id="${type._id}">Excluir</button>
      </div>
    </article>
  `).join('');
}

function resetWorkoutTypeForm() {
  state.workoutTypeEditingId = null;
  workoutTypeFormTitle.textContent = 'Novo tipo';
  workoutTypeForm.reset();
  workoutTypeMeasurementInput.value = 'sets_reps_weight';
  setWorkoutTypeStatus('');
}

function getWorkoutTypePayload() {
  return {
    code: workoutTypeCodeInput.value.trim(),
    name: workoutTypeNameInput.value.trim(),
    description: workoutTypeDescriptionInput.value.trim(),
    measurementType: workoutTypeMeasurementInput.value,
    fields: workoutTypeFieldsInput.value.split(',').map((field) => field.trim()).filter(Boolean)
  };
}

function fillWorkoutTypeForm(type) {
  state.workoutTypeEditingId = type._id;
  workoutTypeFormTitle.textContent = 'Editar tipo';
  workoutTypeCodeInput.value = type.code;
  workoutTypeNameInput.value = type.name;
  workoutTypeMeasurementInput.value = type.measurementType;
  workoutTypeFieldsInput.value = (type.fields || []).join(', ');
  workoutTypeDescriptionInput.value = type.description || '';
  document.querySelector('[data-tab="type-create"]').click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderWorkoutTemplateOptions() {
  const currentValue = workoutTemplateInput.value;
  workoutTemplateInput.innerHTML = [
    '<option value="">Selecione uma ficha</option>',
    ...state.templates.map((template) => (
      `<option value="${template._id}">${escapeHtml(template.code)} - ${escapeHtml(template.name)}</option>`
    ))
  ].join('');

  if (currentValue) {
    workoutTemplateInput.value = currentValue;
  }
}

function syncSelectedTemplateInputs() {
  [...selectedTemplateList.querySelectorAll('.template-exercise-row')].forEach((row) => {
    const index = Number(row.dataset.index);
    const exercise = state.selectedTemplateExercises[index];
    const setsInput = row.querySelector('.template-planned-sets');
    const repsInput = row.querySelector('.template-planned-reps');
    const roundsInput = row.querySelector('.template-planned-rounds');
    const durationInput = row.querySelector('.template-planned-duration');
    const restInput = row.querySelector('.template-planned-rest');

    if (setsInput) {
      exercise.plannedSets = Number(setsInput.value);
    }

    if (repsInput) {
      exercise.plannedReps = repsInput.value.trim();
    }

    if (roundsInput) {
      exercise.plannedRounds = Number(roundsInput.value);
    }

    if (durationInput) {
      exercise.plannedDurationSeconds = Number(durationInput.value);
    }

    if (restInput) {
      exercise.plannedRestSeconds = Number(restInput.value);
    }
  });
}

function addTemplateExercise(exercise) {
  const alreadySelected = state.selectedTemplateExercises.some((item) => item.exerciseId === exercise._id);

  if (alreadySelected) {
    return;
  }

  state.selectedTemplateExercises.push({
    exerciseId: exercise._id,
    name: exercise.name,
    category: exercise.category,
    subcategory: exercise.subcategory || '',
    modality: exercise.modality || 'strength',
    measurementType: exercise.measurementType || 'sets_reps_weight',
    loadMode: getExerciseLoadMode(exercise),
    equipment: exercise.equipment || [],
    plannedSets: exercise.defaultSets || 0,
    plannedReps: exercise.defaultReps || '',
    plannedRounds: exercise.defaultRounds || 0,
    plannedDurationSeconds: exercise.defaultDurationSeconds || 0,
    plannedRestSeconds: exercise.defaultRestSeconds || 0,
    mediaProvider: exercise.mediaProvider || '',
    externalExerciseId: exercise.externalExerciseId || '',
    imageUrl: exercise.imageUrl || '',
    imageAlt: exercise.imageAlt || '',
    imageLicense: exercise.imageLicense || '',
    imageLicenseUrl: exercise.imageLicenseUrl || '',
    imageAuthor: exercise.imageAuthor || '',
    imageAuthorUrl: exercise.imageAuthorUrl || '',
    imageSourceUrl: exercise.imageSourceUrl || '',
    instructions: [],
    tips: exercise.tips || []
  });

  renderSelectedTemplateExercises();
  renderCatalog();
}

function resetTemplateForm() {
  state.templateEditingId = null;
  state.selectedTemplateExercises = [];
  state.selectedTemplateMeta = {
    level: '',
    xpReward: 0,
    description: ''
  };
  templateFormTitle.textContent = 'Nova ficha';
  templateForm.reset();
  templateWorkoutTypeInput.value = getStrengthWorkoutType()._id || '';
  renderSelectedTemplateExercises();
  renderCatalog();
  setTemplateStatus('');
}

function getTemplatePayload() {
  syncSelectedTemplateInputs();
  const workoutType = getSelectedTemplateWorkoutType();

  return {
    code: templateCodeInput.value.trim(),
    name: templateNameInput.value.trim(),
    workoutTypeId: workoutType._id || null,
    workoutTypeCode: workoutType.code,
    workoutTypeName: workoutType.name,
    measurementType: workoutType.measurementType,
    level: state.selectedTemplateMeta.level,
    xpReward: state.selectedTemplateMeta.xpReward,
    description: state.selectedTemplateMeta.description,
    exercises: state.selectedTemplateExercises
  };
}

function fillTemplateForm(template) {
  state.templateEditingId = template._id;
  templateFormTitle.textContent = 'Editar ficha';
  templateCodeInput.value = template.code;
  templateNameInput.value = template.name;
  templateWorkoutTypeInput.value = template.workoutTypeId || getStrengthWorkoutType()._id || '';
  state.selectedTemplateMeta = {
    level: template.level || '',
    xpReward: Number(template.xpReward || 0),
    description: template.description || ''
  };
  state.selectedTemplateExercises = template.exercises.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    category: exercise.category,
    subcategory: exercise.subcategory || '',
    modality: exercise.modality || template.workoutTypeCode || 'strength',
    measurementType: exercise.measurementType || template.measurementType || 'sets_reps_weight',
    loadMode: getExerciseLoadMode(exercise),
    equipment: exercise.equipment || [],
    plannedSets: exercise.plannedSets || 0,
    plannedReps: exercise.plannedReps || '',
    plannedRounds: exercise.plannedRounds || 0,
    plannedDurationSeconds: exercise.plannedDurationSeconds || 0,
    plannedRestSeconds: exercise.plannedRestSeconds || 0,
    mediaProvider: exercise.mediaProvider || '',
    externalExerciseId: exercise.externalExerciseId || '',
    imageUrl: exercise.imageUrl || '',
    imageAlt: exercise.imageAlt || '',
    imageLicense: exercise.imageLicense || '',
    imageLicenseUrl: exercise.imageLicenseUrl || '',
    imageAuthor: exercise.imageAuthor || '',
    imageAuthorUrl: exercise.imageAuthorUrl || '',
    imageSourceUrl: exercise.imageSourceUrl || '',
    instructions: [],
    tips: exercise.tips || []
  }));
  renderSelectedTemplateExercises();
  renderCatalog();
  document.querySelector('[data-tab="template-create"]').click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTemplate(template) {
  detailTitle.textContent = `${template.code} - ${template.name}`;
  detailContent.innerHTML = `
    <p class="detail-meta">${template.exercises.length} exercicios cadastrados na ficha.${template.level ? ` | ${escapeHtml(template.level)}` : ''}${template.xpReward ? ` | ${Number(template.xpReward)} XP` : ''}</p>
    ${template.description ? `<p>${escapeHtml(template.description)}</p>` : ''}
    <div class="detail-grid">
      ${template.exercises.map((exercise) => `
        <article class="detail-exercise">
          ${getExerciseImageMarkup(exercise, 'thumb')}
          <h3>${exercise.order}. ${escapeHtml(exercise.name)}</h3>
          <p class="detail-meta">${escapeHtml(formatExerciseGroup(exercise))} | ${escapeHtml(formatExercisePrescription(exercise))}${(exercise.measurementType || 'sets_reps_weight').startsWith('rounds') ? '' : ` | ${escapeHtml(getLoadModeMeta(getExerciseLoadMode(exercise)).label)}`}</p>
          ${getExerciseInstructionMarkup(exercise)}
        </article>
      `).join('')}
    </div>
  `;
  detailPanel.hidden = false;
  document.querySelector('[data-tab="template-list"]').click();
  detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderExerciseLogTable(exercise) {
  const isRoundBased = exercise.measurementType === 'rounds_time' || exercise.measurementType === 'rounds_time_reps';

  if (exercise.skipped) {
    return `<p class="empty-state compact">Exercicio pulado${exercise.skipReason ? `: ${escapeHtml(exercise.skipReason)}` : '.'}</p>`;
  }

  if (isRoundBased) {
    const rounds = exercise.rounds || [];

    if (rounds.length === 0) {
      return '<p class="empty-state compact">Nenhum round registrado neste exercicio.</p>';
    }

    return `
      <table class="set-table">
        <thead>
          <tr>
            <th>Round</th>
            <th>Tempo</th>
            <th>Descanso</th>
            <th>Golpes</th>
            <th>Int.</th>
          </tr>
        </thead>
        <tbody>
          ${rounds.map((round) => `
            <tr>
              <td>${round.roundNumber}</td>
              <td>${formatSeconds(round.durationSeconds)}</td>
              <td>${formatSeconds(round.restSeconds)}</td>
              <td>${round.reps || 0}</td>
              <td>${round.intensity || 0}/10</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  const sets = exercise.sets || [];

  if (sets.length === 0) {
    return '<p class="empty-state compact">Nenhuma serie registrada neste exercicio.</p>';
  }

  return `
    <table class="set-table">
      <thead>
        <tr>
          <th>Serie</th>
          <th>Carga</th>
          <th>Reps</th>
        </tr>
      </thead>
      <tbody>
        ${sets.map((set) => `
          <tr>
            <td>${set.setNumber}</td>
              <td>${escapeHtml(formatLoadModeWeight(set.weight, getExerciseLoadMode(exercise)))}</td>
            <td>${set.reps}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function normalizeExerciseName(value = '') {
  return String(value).trim().toLowerCase();
}

function getWorkoutTemplateExerciseNames(workout) {
  const template = state.templates.find((item) => item._id === workout.templateId || item.code === workout.workoutCode);

  return new Set((template?.exercises || []).map((exercise) => normalizeExerciseName(exercise.name)));
}

function getExerciseSource(exercise, plannedExerciseNames) {
  if (exercise.source === 'extra') {
    return 'extra';
  }

  if (exercise.source === 'planned') {
    return 'planned';
  }

  return plannedExerciseNames.has(normalizeExerciseName(exercise.name)) ? 'planned' : 'extra';
}

function getExerciseSourceLabel(source) {
  return source === 'extra' ? 'Adicionado' : 'Planejado';
}

function renderWorkoutXpBreakdown(workout) {
  const execution = calculateWorkoutXpBreakdown(workout);
  const campaign = calculateWorkoutCampaignXpBreakdown(workout);
  const hasSnapshot = workout.xp && Number(workout.xp.total || 0) > 0;
  const executionTotal = hasSnapshot ? Number(workout.xp.execution || 0) : execution.total;
  const campaignTotal = hasSnapshot ? Number(workout.xp.campaign || 0) : campaign.total;
  const total = hasSnapshot ? Number(workout.xp.total || 0) : execution.total + campaign.total;
  const rows = hasSnapshot
    ? (workout.xp.breakdown || []).map((entry) => ({ label: entry.label, value: entry.xp }))
    : [
        { label: 'Base do treino', value: execution.base },
        { label: `${execution.validExercises}/${execution.totalExercises} exercicios validos`, value: execution.exerciseXp },
        { label: `${execution.skippedExercises || 0} exercicios pulados`, value: 0, show: Boolean(execution.skippedExercises) },
        { label: `${execution.validSets} series validas`, value: execution.setXp },
        { label: `${execution.validRounds} rounds validos`, value: execution.roundXp },
        { label: 'Reps/golpes validos', value: execution.repsBonus },
        { label: 'Treino completo', value: execution.completionBonus },
        ...campaign.entries.map((entry) => ({ label: entry.label, value: entry.xp }))
      ].filter((row) => Number(row.value || 0) > 0 || row.show);

  return `
    <section class="xp-breakdown">
      <div class="xp-breakdown-header">
        <span>XP_V2.breakdown</span>
        <strong>${total} XP</strong>
      </div>
      <div class="xp-breakdown-grid">
        <article>
          <span>Execucao</span>
          <strong>${executionTotal} XP</strong>
        </article>
        <article>
          <span>Campanha</span>
          <strong>${campaignTotal} XP</strong>
        </article>
      </div>
      <ul>
        ${rows.map((row) => `<li><span>${escapeHtml(row.label)}</span><strong>+${Number(row.value || 0)} XP</strong></li>`).join('')}
      </ul>
    </section>
  `;
}

function renderDetails(workout) {
  const plannedExerciseNames = getWorkoutTemplateExerciseNames(workout);
  const exercisesWithSource = workout.exercises.map((exercise) => ({
    exercise,
    source: getExerciseSource(exercise, plannedExerciseNames)
  }));
  const plannedCount = exercisesWithSource.filter((item) => item.source === 'planned').length;
  const extraCount = exercisesWithSource.filter((item) => item.source === 'extra').length;
  const skippedCount = countSkippedExercises(workout);
  const quality = getWorkoutExecutionQuality(workout);

  detailTitle.textContent = `${workout.workoutCode} - ${workout.workoutName}`;
  detailContent.innerHTML = `
    <p class="detail-meta">${formatDate(workout.date)} | ${plannedCount} planejados | ${extraCount} adicionados | ${skippedCount} pulados | ${workout.exercises.length} exercicios</p>
    <section class="execution-quality-card ${quality.className}">
      <div>
        <span>EXECUCAO_DA_FICHA</span>
        <strong>${escapeHtml(quality.label)}</strong>
      </div>
      <p>${escapeHtml(formatWorkoutQualitySummary(quality))}</p>
      <div class="achievement-meter"><span style="width:${quality.plannedCount ? quality.percent : 100}%"></span></div>
    </section>
    ${workout.notes ? `<p>${escapeHtml(workout.notes)}</p>` : ''}
    ${renderWorkoutXpBreakdown(workout)}
    <div class="detail-grid">
      ${exercisesWithSource.map(({ exercise, source }) => `
        <article class="detail-exercise ${source === 'extra' ? 'extra-exercise' : ''} ${exercise.skipped ? 'skipped-exercise' : ''}">
          ${getExerciseImageMarkup(exercise, 'thumb')}
          <div class="detail-exercise-head">
            <h3>${escapeHtml(exercise.name)}</h3>
            <span class="row-tag ${exercise.skipped ? 'skipped' : source === 'extra' ? 'extra' : 'mission'}">${exercise.skipped ? 'Pulado' : escapeHtml(getExerciseSourceLabel(source))}</span>
          </div>
          <p class="detail-meta">
            ${escapeHtml(formatExerciseGroup(exercise))}
            | planejado: ${escapeHtml(formatExercisePrescription(exercise))}
            | feito: ${exercise.skipped ? 'pulado' : exercise.measurementType === 'rounds_time' || exercise.measurementType === 'rounds_time_reps' ? `${exercise.completedRounds || (exercise.rounds || []).length} rounds` : `${exercise.completedSets || (exercise.sets || []).length} series`}
            ${exercise.skipReason ? ` | motivo: ${escapeHtml(exercise.skipReason)}` : ''}
            ${exercise.notes ? ` | ${escapeHtml(exercise.notes)}` : ''}
          </p>
          ${getExerciseInstructionMarkup(exercise)}
          ${renderExerciseLogTable(exercise)}
        </article>
      `).join('')}
    </div>
  `;
  detailPanel.hidden = false;
  detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function startTemplateWorkout(templateId, options = {}) {
  const template = state.templates.find((item) => item._id === templateId);

  if (!template) {
    return;
  }

  state.editingId = null;
  state.workoutFormContext = {
    source: options.source || 'manual',
    returnTab: options.returnTab || '',
    assignment: null
  };
  formTitle.textContent = 'NEW_SESSION.exe';
  dateInput.value = todayInputValue();
  workoutTemplateInput.value = template._id;
  populateWorkoutFromTemplate(template._id);
  document.querySelector('[data-tab="workout-create"]').click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fillForm(workout) {
  state.editingId = workout._id;
  state.workoutFormContext = {
    source: 'editing',
    returnTab: '',
    assignment: workout.missionDate ? {
      missionDate: toDateKey(workout.missionDate),
      missionBlockType: workout.missionBlockType || '',
      missionOriginalWorkoutCode: workout.missionOriginalWorkoutCode || '',
      missionOriginalWorkoutName: workout.missionOriginalWorkoutName || '',
      missionSubstitution: Boolean(workout.missionSubstitution)
    } : null
  };
  formTitle.textContent = 'EDIT_SESSION.exe';
  dateInput.value = new Date(workout.date).toISOString().slice(0, 10);
  workoutTemplateInput.value = workout.templateId || '';
  durationInput.value = workout.durationMinutes || '';
  targetMusclesInput.value = getWorkoutTags(workout).join(', ');
  notesInput.value = workout.notes || '';
    exerciseList.innerHTML = '';
    workout.exercises.forEach(addExercise);
    addExerciseButton.hidden = !workoutTemplateInput.value;
    renderWorkoutExercisePicker();
  renderWorkoutOrigin();
  document.querySelector('[data-tab="workout-create"]').click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('.commit-button');

  setStatus('Salvando...');
  submitButton.textContent = 'COMMITTING...';

  try {
    const payload = getFormPayload();
    const selectedTemplate = state.templates.find((template) => template._id === workoutTemplateInput.value);
    const formContext = getWorkoutFormContext(selectedTemplate, dateInput.value);
    const returnTab = state.workoutFormContext.returnTab || 'daily-missions';
    const shouldReturnToMissions = !state.editingId && (formContext.source === 'mission' || formContext.source === 'substitution');
    const url = state.editingId ? `/api/workouts/${state.editingId}` : '/api/workouts';
    const method = state.editingId ? 'PUT' : 'POST';

    await requestJson(url, {
      method,
      body: JSON.stringify(payload)
    });

    resetForm();
    await loadWorkouts();
    renderDailyMissions();
    if (shouldReturnToMissions) {
      document.querySelector(`[data-tab="${returnTab}"]`)?.click();
    }
    setStatus('Treino salvo com sucesso.');
    submitButton.textContent = 'COMMITTED';
    setTimeout(() => {
      submitButton.textContent = 'COMMIT_SESSION';
    }, 1400);
  } catch (error) {
    setStatus(error.message, true);
    submitButton.textContent = 'COMMIT_SESSION';
  }
});

addExerciseButton.addEventListener('click', () => {
  workoutExercisePicker.hidden = !workoutExercisePicker.hidden;
  renderWorkoutExercisePicker();
});
document.querySelector('#reset-form').addEventListener('click', resetForm);
workoutTemplateInput.addEventListener('change', () => {
  populateWorkoutFromTemplate(workoutTemplateInput.value);
});
dateInput.addEventListener('change', renderWorkoutOrigin);
document.querySelector('#close-detail').addEventListener('click', () => {
  detailPanel.hidden = true;
});

startMissionButton.addEventListener('click', () => {
  const selectedDayIndex = getSelectedMissionDayIndex();
  const selectedDateKey = getWeekDateKeyForDay(selectedDayIndex);
  const isToday = selectedDateKey === todayInputValue();
  const selectedMission = getDailyMissionByDayIndex(selectedDayIndex);
  const nextMissionBlock = isToday ? getNextMissionBlock(selectedMission, selectedDateKey) : null;
  const todayProtocol = getWorkoutForWeekday();
  const templateId = nextMissionBlock?.templateId || (!selectedMission && state.templates.find((template) => template.code === todayProtocol.code)?._id);
  const todayTemplate = state.templates.find((template) => template._id === templateId);

  if (!isToday || !todayTemplate) {
    return;
  }

  startTemplateWorkout(todayTemplate._id, { source: 'mission', returnTab: 'daily-missions' });
});

function prepareReplacementWorkout(blockType) {
  resetForm();
  dateInput.value = todayInputValue();
  setStatus(`Escolha uma ficha de ${blockType === 'combat' ? 'combate' : 'forca'} para substituir o bloco da campanha.`);
  document.querySelector('[data-tab="workout-create"]').click();
  workoutTemplateInput.focus();
}

weeklyMap.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-mission-day]');

  if (!button) {
    return;
  }

  state.selectedMissionDayIndex = Number(button.dataset.missionDay);
  renderDashboard();
});

[dailyMissionToday, dailyMissionList].forEach((container) => {
  container?.addEventListener('click', async (event) => {
    const replaceButton = event.target.closest('button[data-replace-block]');

    if (replaceButton) {
      prepareReplacementWorkout(replaceButton.dataset.replaceBlock);
      return;
    }

    const button = event.target.closest('button[data-start-template]');

    if (button) {
      startTemplateWorkout(button.dataset.startTemplate, { source: 'mission', returnTab: 'daily-missions' });
      return;
    }

    await handleWorkoutAction(event);
  });
});

function getInitialTabFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const queryTab = params.get('tab');

  if (queryTab && document.querySelector(`#view-${queryTab}`)) {
    return queryTab;
  }

  const hashTab = window.location.hash.replace('#', '');

  if (hashTab && document.querySelector(`#view-${hashTab}`)) {
    return hashTab;
  }

  return '';
}

function updateTabUrl(tabName) {
  const url = new URL(window.location.href);
  url.hash = '';

  if (tabName && tabName !== 'dashboard') {
    url.searchParams.set('tab', tabName);
  } else {
    url.searchParams.delete('tab');
  }

  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

async function activateTab(tabName, options = {}) {
  const { updateUrl = true, scroll = true } = options;
  const targetView = document.querySelector(`#view-${tabName}`);

  if (!targetView) {
    return false;
  }

  document.querySelectorAll('.nav-link[data-tab]').forEach((item) => {
    const isDocumentationShortcut = tabName === 'documentation' && item.dataset.documentationShortcut;
    const isActiveDocumentationShortcut = isDocumentationShortcut
      && item.dataset.documentationShortcut === (options.documentationDoc || state.activeDocumentationDoc);

    item.classList.toggle('active', isDocumentationShortcut ? isActiveDocumentationShortcut : item.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-view').forEach((item) => item.classList.remove('active'));
  targetView.classList.add('active');

  if (tabName === 'documentation') {
    await loadDocumentation(options.documentationDoc || state.activeDocumentationDoc);
  }

  if (tabName === 'progress') {
    renderProgress();
  }

  if (updateUrl) {
    updateTabUrl(tabName);
  }

  if (scroll) {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  return true;
}

document.querySelectorAll('.nav-link[data-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    activateTab(button.dataset.tab, {
      documentationDoc: button.dataset.documentationShortcut || state.activeDocumentationDoc
    }).catch((error) => setStatus(error.message, true));
  });
});

documentationMenuButtons.forEach((button) => {
  button.addEventListener('click', () => {
    loadDocumentation(button.dataset.documentationDoc, true).catch((error) => setStatus(error.message, true));
  });
});

document.querySelectorAll('[data-tab-shortcut]').forEach((button) => {
  button.addEventListener('click', () => {
    activateTab(button.dataset.tabShortcut).catch((error) => setStatus(error.message, true));
  });
});

document.querySelectorAll('.filter-button').forEach((button) => {
  button.addEventListener('click', async () => {
    document.querySelectorAll('.filter-button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    state.filter = button.dataset.filter;
    await loadWorkouts();
  });
});

historySearch.addEventListener('input', () => {
  state.historySearch = historySearch.value;
  resetHistoryPageAndRender();
});

historyCodeFilter.addEventListener('change', () => {
  state.historyCodeFilter = historyCodeFilter.value;
  resetHistoryPageAndRender();
});

historyMuscleFilter.addEventListener('change', () => {
  state.historyMuscleFilter = historyMuscleFilter.value;
  resetHistoryPageAndRender();
});

historyPeriodFilter.addEventListener('change', () => {
  state.historyPeriodFilter = historyPeriodFilter.value;
  resetHistoryPageAndRender();
});

historySort.addEventListener('change', resetHistoryPageAndRender);

progressExerciseSelect?.addEventListener('change', () => {
  state.selectedProgressExercise = progressExerciseSelect.value;
  renderProgress();
});

progressExercisePeriodFilter?.addEventListener('change', () => {
  state.progressExercisePeriodFilter = progressExercisePeriodFilter.value;
  renderProgress();
});

progressAchievementCategoryFilter?.addEventListener('change', () => {
  state.achievementCategoryFilter = progressAchievementCategoryFilter.value;
  renderProgress();
});

progressAchievementStatusFilter?.addEventListener('change', () => {
  state.achievementStatusFilter = progressAchievementStatusFilter.value;
  renderProgress();
});

document.querySelectorAll('[data-history-view]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-history-view]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    state.historyView = button.dataset.historyView;
    renderHistory();
  });
});

historyPagination.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-history-page]');

  if (!button || button.disabled) {
    return;
  }

  state.historyPage = Number(button.dataset.historyPage);
  renderHistory();
});

templateSearch.addEventListener('input', () => {
  state.templateSearch = templateSearch.value;
  renderTemplates();
});

templateTypeFilter.addEventListener('change', () => {
  state.templateTypeFilter = templateTypeFilter.value;
  renderTemplates();
});

templateMeasurementFilter.addEventListener('change', () => {
  state.templateMeasurementFilter = templateMeasurementFilter.value;
  renderTemplates();
});

templateSort.addEventListener('change', () => {
  state.templateSort = templateSort.value;
  renderTemplates();
});

workoutTypeSearch.addEventListener('input', () => {
  state.workoutTypeSearch = workoutTypeSearch.value;
  renderWorkoutTypes();
});

workoutTypeMeasurementFilter.addEventListener('change', () => {
  state.workoutTypeMeasurementFilter = workoutTypeMeasurementFilter.value;
  renderWorkoutTypes();
});

workoutTypeFieldFilter.addEventListener('change', () => {
  state.workoutTypeFieldFilter = workoutTypeFieldFilter.value;
  renderWorkoutTypes();
});

exportHistoryButton.addEventListener('click', exportHistoryCsv);

missionActions?.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-dashboard-mission-action]');

  if (!button || button.disabled) {
    return;
  }

  const action = button.dataset.dashboardMissionAction;

  if (action === 'start' && button.dataset.templateId) {
    startTemplateWorkout(button.dataset.templateId, { source: 'mission', returnTab: 'dashboard' });
    return;
  }

  if ((action === 'details' || action === 'edit') && button.dataset.workoutId) {
    let workout;

    try {
      setStatus('Carregando treino...');
      workout = await loadWorkoutDetails(button.dataset.workoutId);
      setStatus('');
    } catch (error) {
      setStatus(error.message, true);
      return;
    }

    if (action === 'details') {
      renderDetails(workout);
    }

    if (action === 'edit') {
      fillForm(workout);
    }
  }
});

async function handleWorkoutAction(event) {
  const button = event.target.closest('button[data-action]');

  if (!button) {
    return;
  }

  const workoutId = button.dataset.id;
  let workout = state.allWorkouts.find((item) => item._id === workoutId);

  if (button.dataset.action === 'details' || button.dataset.action === 'edit') {
    try {
      setStatus('Carregando treino...');
      workout = await loadWorkoutDetails(workoutId);
      setStatus('');
    } catch (error) {
      setStatus(error.message, true);
      return;
    }
  }

  if (!workout) {
    setStatus('Treino nao encontrado.', true);
    return;
  }

  if (button.dataset.action === 'details') {
    renderDetails(workout);
  }

  if (button.dataset.action === 'edit') {
    fillForm(workout);
  }

  if (button.dataset.action === 'delete') {
    const confirmed = window.confirm('Excluir este treino?');

    if (!confirmed) {
      return;
    }

    await requestJson(`/api/workouts/${workoutId}`, { method: 'DELETE' });
    await loadWorkouts();
  }
}

historyList.addEventListener('click', handleWorkoutAction);
dashboardHistory.addEventListener('click', handleWorkoutAction);

document.addEventListener('mouseover', (event) => {
  const trigger = getPreviewTrigger(event.target);

  if (!trigger || trigger.contains(event.relatedTarget)) {
    return;
  }

  showMediaHoverPreview(trigger, event);
});

document.addEventListener('mousemove', (event) => {
  if (activePreviewTrigger) {
    positionMediaHoverPreview(event);
  }
});

document.addEventListener('mouseout', (event) => {
  const trigger = getPreviewTrigger(event.target);

  if (!trigger || trigger.contains(event.relatedTarget)) {
    return;
  }

  hideMediaHoverPreview();
});

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-close-media-lightbox]')) {
    closeMediaLightbox();
    return;
  }

  const trigger = getPreviewTrigger(event.target);

  if (trigger) {
    openMediaLightbox(trigger);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMediaLightbox();
    return;
  }

  const trigger = getPreviewTrigger(event.target);

  if (!trigger || (event.key !== 'Enter' && event.key !== ' ')) {
    return;
  }

  event.preventDefault();
  openMediaLightbox(trigger);
});

window.addEventListener('scroll', hideMediaHoverPreview, { passive: true });
window.addEventListener('resize', hideMediaHoverPreview);

catalogCategoryFilter.addEventListener('change', renderCatalog);
catalogSubcategoryFilter.addEventListener('change', renderCatalog);
catalogSearch.addEventListener('input', renderCatalog);
templateWorkoutTypeInput.addEventListener('change', renderCatalog);
workoutExerciseCategoryFilter.addEventListener('change', renderWorkoutExercisePicker);
workoutExerciseSubcategoryFilter.addEventListener('change', renderWorkoutExercisePicker);
workoutExerciseSearch.addEventListener('input', renderWorkoutExercisePicker);
workoutExercisePickerList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-workout-exercise-id]');

  if (!button || button.disabled) {
    return;
  }

  const exercise = state.exercises.find((item) => item._id === button.dataset.workoutExerciseId);

  if (!exercise) {
    return;
  }

  addExerciseFromTemplate({
    ...exercise,
    source: 'extra'
  });
  setStatus(`${exercise.name} adicionado ao treino.`);
  renderWorkoutExercisePicker();
});
exercisePageModalityFilter.addEventListener('change', renderExercisePage);
exercisePageCategoryFilter.addEventListener('change', renderExercisePage);
exercisePageSubcategoryFilter.addEventListener('change', renderExercisePage);
exercisePageMeasurementFilter.addEventListener('change', renderExercisePage);
exercisePageSearch.addEventListener('input', renderExercisePage);
exercisePageList.addEventListener('click', (event) => {
  const button = event.target.closest('.sync-exercise-media');

  if (!button) {
    return;
  }

  syncExerciseMedia(button.dataset.exerciseId);
});

catalogList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-catalog-id]');

  if (!button) {
    return;
  }

  const exercise = state.exercises.find((item) => item._id === button.dataset.catalogId);

  if (exercise) {
    addTemplateExercise(exercise);
  }
});

selectedTemplateList.addEventListener('click', (event) => {
  const button = event.target.closest('.remove-template-exercise');

  if (!button) {
    return;
  }

  const row = button.closest('.template-exercise-row');
  state.selectedTemplateExercises.splice(Number(row.dataset.index), 1);
  renderSelectedTemplateExercises();
  renderCatalog();
});

templateForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setTemplateStatus('Salvando...');

  try {
    const payload = getTemplatePayload();

    if (!payload.exercises.length) {
      throw new Error('Escolha pelo menos um exercicio para a ficha.');
    }

    const url = state.templateEditingId ? `/api/templates/${state.templateEditingId}` : '/api/templates';
    const method = state.templateEditingId ? 'PUT' : 'POST';

    await requestJson(url, {
      method,
      body: JSON.stringify(payload)
    });

    resetTemplateForm();
    await loadTemplates();
    setTemplateStatus('Ficha salva com sucesso.');
  } catch (error) {
    setTemplateStatus(error.message, true);
  }
});

document.querySelector('#reset-template-form').addEventListener('click', resetTemplateForm);

workoutTypeForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setWorkoutTypeStatus('Salvando...');

  try {
    const payload = getWorkoutTypePayload();
    const url = state.workoutTypeEditingId ? `/api/workout-types/${state.workoutTypeEditingId}` : '/api/workout-types';
    const method = state.workoutTypeEditingId ? 'PUT' : 'POST';

    await requestJson(url, {
      method,
      body: JSON.stringify(payload)
    });

    resetWorkoutTypeForm();
    await loadWorkoutTypes();
    await loadTemplates();
    setWorkoutTypeStatus('Tipo salvo com sucesso.');
  } catch (error) {
    setWorkoutTypeStatus(error.message, true);
  }
});

document.querySelector('#reset-workout-type-form').addEventListener('click', resetWorkoutTypeForm);

workoutTypeList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-type-action]');

  if (!button) {
    return;
  }

  const type = state.workoutTypes.find((item) => item._id === button.dataset.id);

  if (!type) {
    return;
  }

  if (button.dataset.typeAction === 'edit') {
    fillWorkoutTypeForm(type);
  }

  if (button.dataset.typeAction === 'delete') {
    const confirmed = window.confirm('Excluir este tipo de treino?');

    if (!confirmed) {
      return;
    }

    await requestJson(`/api/workout-types/${type._id}`, { method: 'DELETE' });
    await loadWorkoutTypes();
  }
});

templateList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-template-action]');

  if (!button) {
    return;
  }

  const template = state.templates.find((item) => item._id === button.dataset.id);

  if (!template) {
    return;
  }

  if (button.dataset.templateAction === 'view') {
    showTemplate(template);
  }

  if (button.dataset.templateAction === 'edit') {
    fillTemplateForm(template);
  }

  if (button.dataset.templateAction === 'delete') {
    const confirmed = window.confirm('Excluir esta ficha?');

    if (!confirmed) {
      return;
    }

    await requestJson(`/api/templates/${template._id}`, { method: 'DELETE' });
    await loadTemplates();
  }
});

resetForm();
resetWorkoutTypeForm();
resetTemplateForm();

const initialTab = getInitialTabFromLocation();

if (initialTab) {
  activateTab(initialTab, { updateUrl: false }).catch((error) => setStatus(error.message, true));
}

loadWorkouts().catch((error) => setStatus(error.message, true));
loadExercises()
  .then(renderExercisePage)
  .catch((error) => setTemplateStatus(error.message, true));
loadWorkoutTypes()
  .then(loadTemplates)
  .catch((error) => setWorkoutTypeStatus(error.message, true));
loadDailyMissions().catch((error) => setStatus(error.message, true));
