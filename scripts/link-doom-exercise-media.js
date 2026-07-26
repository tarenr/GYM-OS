import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Exercise } from '../src/models/Exercise.js';
import { applyExerciseMedia } from '../src/services/exerciseMediaSyncService.js';

const shouldWrite = process.argv.includes('--write');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const mediaRoot = path.join(projectRoot, 'public', 'assets', 'doom-exercises');
const publicMediaRoot = '/assets/doom-exercises';

const aliasByName = new Map([
  ['dumbbell or short-bar curl', { category: 'Biceps', slug: 'dumbbell-or-short-bar-curl' }],
  ['dumbbell or short-bar skull crusher', { category: 'Triceps', slug: 'dumbbell-skull-crusher' }],
  ['goblet squat with kettlebell or dumbbell', { category: 'Legs', slug: 'goblet-squat' }],
  ['dumbbell pullover on bench', { category: 'Back', slug: 'dumbbell-pullover' }],
  ['reverse-grip dumbbell bench press', { category: 'Chest', slug: 'reverse-grip-dumbbell-bench-press' }],
  ['close-grip dumbbell bench press', { category: 'Chest', slug: 'close-grip-dumbbell-bench-press' }]
]);

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function slugify(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toPublicPath(filePath) {
  return filePath
    .replace(path.join(projectRoot, 'public'), '')
    .replaceAll(path.sep, '/');
}

function getMediaFiles() {
  if (!fs.existsSync(mediaRoot)) {
    throw new Error(`Doom exercise media folder not found: ${mediaRoot}`);
  }

  return fs.readdirSync(mediaRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((categoryEntry) => {
      const category = categoryEntry.name;
      const categoryDir = path.join(mediaRoot, category);

      return fs.readdirSync(categoryDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.jpg'))
        .map((entry) => {
          const slug = path.basename(entry.name, path.extname(entry.name));
          const filePath = path.join(categoryDir, entry.name);

          return {
            category,
            categoryKey: normalize(category),
            slug,
            key: `${normalize(category)}|${slug}`,
            filePath,
            imageUrl: toPublicPath(filePath)
          };
        });
    });
}

function buildMediaIndex(files) {
  return new Map(files.map((file) => [file.key, file]));
}

function findMediaForExercise(exercise, mediaIndex) {
  const categoryKey = normalize(exercise.category);
  const exerciseSlug = slugify(exercise.name);
  const exact = mediaIndex.get(`${categoryKey}|${exerciseSlug}`);

  if (exact) {
    return exact;
  }

  const alias = aliasByName.get(normalize(exercise.name));

  if (alias) {
    return mediaIndex.get(`${normalize(alias.category)}|${alias.slug}`) || null;
  }

  return null;
}

function makeMediaPayload(exercise, media) {
  return {
    mediaProvider: 'doom-exercise-pack',
    externalExerciseId: '',
    imageUrl: media.imageUrl,
    imageAlt: `Start and end movement of ${exercise.name}`,
    imageLicense: 'AI generated for local GYM-OS project use',
    imageLicenseUrl: '',
    imageAuthor: 'GYM-OS / Codex image generation',
    imageAuthorUrl: '',
    imageSourceUrl: publicMediaRoot,
    tips: []
  };
}

function getStatus(exercise, media) {
  if (!media) {
    return 'no-doom-asset';
  }

  return exercise.imageUrl === media.imageUrl ? 'already-linked' : shouldWrite ? 'linked' : 'preview';
}

function printSummary({ files, rows, unmatchedAssets }) {
  const counts = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  console.log(`Mode: ${shouldWrite ? 'write' : 'preview'}`);
  console.log(`Doom media files: ${files.length}`);
  console.log(`Strength exercises checked: ${rows.length}`);
  console.table(rows.map((row) => ({
    category: row.category,
    exercise: row.exercise,
    status: row.status,
    image: row.image
  })));
  console.table(Object.entries(counts).map(([status, count]) => ({ status, count })));

  if (unmatchedAssets.length) {
    console.log('Assets without matching active strength exercise:');
    console.table(unmatchedAssets.map((asset) => ({
      category: asset.category,
      file: path.basename(asset.filePath),
      image: asset.imageUrl
    })));
  }

  if (!shouldWrite) {
    console.log('No changes saved. Run npm run media:doom:sync to apply.');
  }
}

async function main() {
  const files = getMediaFiles();
  const mediaIndex = buildMediaIndex(files);

  await connectDatabase();

  const exercises = await Exercise.find({ active: true, modality: 'strength' })
    .sort({ category: 1, name: 1 });
  const matchedAssetKeys = new Set();
  const rows = [];

  for (const exercise of exercises) {
    const media = findMediaForExercise(exercise, mediaIndex);
    const status = getStatus(exercise, media);

    if (media) {
      matchedAssetKeys.add(media.key);
    }

    if (shouldWrite && media) {
      await applyExerciseMedia(exercise, makeMediaPayload(exercise, media));
    }

    rows.push({
      category: exercise.category,
      exercise: exercise.name,
      status,
      image: media?.imageUrl || ''
    });
  }

  const unmatchedAssets = files.filter((file) => !matchedAssetKeys.has(file.key));

  printSummary({ files, rows, unmatchedAssets });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
