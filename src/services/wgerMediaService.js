const wgerBaseUrl = process.env.WGER_API_URL || 'https://wger.de/api/v2';
const cacheTtlMs = Number(process.env.WGER_CACHE_TTL_MS || 1000 * 60 * 60);

const exerciseSearchAliases = new Map([
  ['supino reto com halteres', 'dumbbell bench press'],
  ['supino reto com pegada supinada', 'reverse grip dumbbell bench press'],
  ['crucifixo reto com halteres', 'dumbbell fly'],
  ['pullover com halter no banco', 'dumbbell pullover'],
  ['pullover com halter no banco reto', 'dumbbell pullover'],
  ['squeeze press com halteres', 'dumbbell squeeze press'],
  ['supino fechado com halteres', 'dumbbell close grip bench press'],
  ['triceps frances com halter', 'dumbbell overhead triceps extension'],
  ['triceps testa com halteres', 'dumbbell lying triceps extension'],
  ['triceps testa com halteres ou barra curta', 'dumbbell lying triceps extension'],
  ['coice de triceps com halter', 'dumbbell triceps kickback'],
  ['remada curvada com halteres', 'dumbbell bent over row'],
  ['remada unilateral apoiado no banco', 'dumbbell one arm row'],
  ['remada aberta com halteres', 'dumbbell rear delt row'],
  ['crucifixo inverso com halteres', 'dumbbell reverse fly'],
  ['rosca direta com halteres', 'dumbbell curl'],
  ['rosca direta com halteres ou barra curta', 'dumbbell curl'],
  ['rosca alternada', 'alternating dumbbell curl'],
  ['rosca martelo com halteres', 'hammer curl'],
  ['rosca concentrada', 'concentration curl'],
  ['abdominal tradicional', 'crunch'],
  ['elevacao de pernas', 'leg raise'],
  ['elevacao frontal com halteres', 'dumbbell front raise'],
  ['agachamento goblet com kettlebell ou halter', 'goblet squat'],
  ['agachamento goblet', 'goblet squat'],
  ['afundo com halteres', 'dumbbell lunge'],
  ['stiff com halteres', 'dumbbell romanian deadlift'],
  ['elevacao pelvica com halter', 'weighted hip thrust'],
  ['panturrilha em pe com halteres', 'dumbbell standing calf raise'],
  ['desenvolvimento com halteres', 'dumbbell shoulder press'],
  ['elevacao lateral com halteres', 'dumbbell lateral raise'],
  ['encolhimento com halteres', 'dumbbell shrug']
]);

const searchStopWords = new Set([
  'com',
  'sem',
  'para',
  'por',
  'cada',
  'lado',
  'alternado',
  'alternada',
  'halter',
  'halteres',
  'barra',
  'curta'
]);

let cachedCatalog = {
  loadedAt: 0,
  items: []
};

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function resolveWgerSearchQuery(query) {
  const rawQuery = String(query || '').trim();

  return exerciseSearchAliases.get(normalizeSearchText(rawQuery)) || rawQuery;
}

function getEnglishName(item) {
  const translations = Array.isArray(item.translations) ? item.translations : [];
  return translations.find((translation) => translation.language === 2)?.name
    || translations.find((translation) => translation.name)?.name
    || `Exercicio ${item.id}`;
}

function getBestImage(item) {
  const images = Array.isArray(item.images) ? item.images.filter((image) => image.image) : [];

  return images.find((image) => image.is_main) || images[0] || null;
}

function normalizeWgerItem(item) {
  const image = getBestImage(item);
  const name = getEnglishName(item);

  return {
    provider: 'wger',
    externalExerciseId: String(item.id || ''),
    name,
    bodyPart: '',
    target: '',
    equipment: '',
    secondaryMuscles: [],
    imageUrl: image?.image || '',
    imageAlt: name ? `Imagem do exercicio ${name}` : 'Imagem do exercicio',
    imageLicense: image?.license_title || '',
    imageLicenseUrl: image?.license_object_url || '',
    imageAuthor: image?.license_author || item.license_author || '',
    imageAuthorUrl: image?.license_author_url || '',
    imageSourceUrl: image?.license_derivative_source_url || '',
    instructions: []
  };
}

async function fetchWgerCatalog() {
  const now = Date.now();

  if (cachedCatalog.items.length && now - cachedCatalog.loadedAt < cacheTtlMs) {
    return cachedCatalog.items;
  }

  const response = await fetch(`${wgerBaseUrl}/exerciseinfo/?limit=1000`);

  if (!response.ok) {
    const error = new Error(`wger respondeu ${response.status}.`);
    error.statusCode = response.status;
    throw error;
  }

  const data = await response.json();
  cachedCatalog = {
    loadedAt: now,
    items: Array.isArray(data.results) ? data.results : []
  };

  return cachedCatalog.items;
}

function scoreCatalogItem(item, normalizedQuery) {
  const names = (Array.isArray(item.translations) ? item.translations : [])
    .map((translation) => normalizeSearchText(translation.name))
    .filter(Boolean);
  const combinedNames = names.join(' ');

  if (!names.length) {
    return 0;
  }

  if (
    normalizedQuery.includes('dumbbell')
    && !combinedNames.includes('dumbbell')
    && !combinedNames.includes('dumbbells')
  ) {
    return 0;
  }

  if (normalizedQuery.includes('standing') && !combinedNames.includes('standing')) {
    return 0;
  }

  if (names.some((name) => name === normalizedQuery)) {
    return 100;
  }

  if (names.some((name) => name.includes(normalizedQuery))) {
    return 80;
  }

  const queryWords = normalizedQuery
    .split(' ')
    .filter((word) => word.length > 2 && !searchStopWords.has(word));
  const bestWordMatches = Math.max(
    0,
    ...names.map((name) => queryWords.filter((word) => name.includes(word)).length)
  );
  const requiredMatches = Math.max(2, Math.ceil(queryWords.length * 0.75));

  if (bestWordMatches < Math.min(requiredMatches, queryWords.length)) {
    return 0;
  }

  return bestWordMatches * 10;
}

export async function searchWgerExerciseImages(query, limit = 8) {
  const resolvedQuery = resolveWgerSearchQuery(query);
  const normalizedQuery = normalizeSearchText(resolvedQuery);

  if (!normalizedQuery) {
    return [];
  }

  const catalog = await fetchWgerCatalog();

  return catalog
    .map((item) => ({
      item,
      score: scoreCatalogItem(item, normalizedQuery)
    }))
    .filter(({ item, score }) => score >= 20 && getBestImage(item))
    .sort((left, right) => right.score - left.score)
    .slice(0, Number(limit || 8))
    .map(({ item }) => normalizeWgerItem(item));
}
