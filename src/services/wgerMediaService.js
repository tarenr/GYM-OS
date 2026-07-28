const wgerBaseUrl = process.env.WGER_API_URL || 'https://wger.de/api/v2';
const cacheTtlMs = Number(process.env.WGER_CACHE_TTL_MS || 1000 * 60 * 60);

const exerciseSearchAliases = new Map([
  ['flat dumbbell bench press', 'dumbbell bench press'],
  ['reverse-grip dumbbell bench press', 'reverse grip dumbbell bench press'],
  ['flat dumbbell fly', 'dumbbell fly'],
  ['dumbbell squeeze press', 'dumbbell squeeze press'],
  ['overhead dumbbell triceps extension', 'dumbbell overhead triceps extension'],
  ['dumbbell skull crusher', 'dumbbell lying triceps extension'],
  ['dumbbell triceps kickback', 'dumbbell triceps kickback'],
  ['bent-over dumbbell row', 'dumbbell bent over row'],
  ['supported single-arm dumbbell row', 'dumbbell one arm row'],
  ['wide dumbbell row', 'dumbbell rear delt row'],
  ['dumbbell reverse fly', 'dumbbell reverse fly'],
  ['dumbbell curl', 'dumbbell curl'],
  ['dumbbell or short-bar curl', 'dumbbell curl'],
  ['alternating dumbbell curl', 'alternating dumbbell curl'],
  ['dumbbell hammer curl', 'hammer curl'],
  ['concentration curl', 'concentration curl'],
  ['crunch', 'crunch'],
  ['leg raise', 'leg raise'],
  ['dumbbell front raise', 'dumbbell front raise'],
  ['goblet squat', 'goblet squat'],
  ['dumbbell lunge', 'dumbbell lunge'],
  ['dumbbell romanian deadlift', 'dumbbell romanian deadlift'],
  ['dumbbell hip thrust', 'weighted hip thrust'],
  ['standing dumbbell calf raise', 'dumbbell standing calf raise'],
  ['dumbbell shoulder press', 'dumbbell shoulder press'],
  ['dumbbell lateral raise', 'dumbbell lateral raise'],
  ['dumbbell shrug', 'dumbbell shrug']
]);

const searchStopWords = new Set([
  'with',
  'without',
  'for',
  'by',
  'each',
  'side',
  'alternating',
  'dumbbell',
  'dumbbells',
  'barbell',
  'short'
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
    || `Exercise ${item.id}`;
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
    imageAlt: name ? `Exercise image ${name}` : 'Exercise image',
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
    const error = new Error(`wger responded ${response.status}.`);
    error.statusCode = response.status;
    throw error;
  }

  const date = await response.json();
  cachedCatalog = {
    loadedAt: now,
    items: Array.isArray(date.results) ? date.results : []
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
