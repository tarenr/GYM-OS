import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { Exercise } from '../src/models/Exercise.js';
import { applyExerciseMedia } from '../src/services/exerciseMediaSyncService.js';

const shouldWrite = process.argv.includes('--write');
const modalityArg = process.argv.find((arg) => arg.startsWith('--modality='));
const modalityFilter = normalize(modalityArg?.split('=')[1] || 'boxing');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const mediaRoot = path.join(projectRoot, 'public', 'assets', 'combat-exercises');
const publicMediaRoot = '/assets/combat-exercises';

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function slugify(value) {
  return normalize(value)
    .replace(/\+/g, ' plus ')
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
    throw new Error(`Combat exercise media folder not found: ${mediaRoot}`);
  }

  return fs.readdirSync(mediaRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((modalityEntry) => {
      const modality = modalityEntry.name;
      const modalityDir = path.join(mediaRoot, modality);

      return fs.readdirSync(modalityDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.jpg'))
        .map((entry) => {
          const slug = path.basename(entry.name, path.extname(entry.name));
          const filePath = path.join(modalityDir, entry.name);

          return {
            modality,
            modalityKey: normalize(modality),
            slug,
            key: `${normalize(modality)}|${slug}`,
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
  return mediaIndex.get(`${normalize(exercise.modality)}|${slugify(exercise.name)}`) || null;
}

function makeMediaPayload(exercise, media) {
  return {
    mediaProvider: 'combat-exercise-pack',
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
    return 'no-combat-asset';
  }

  return exercise.imageUrl === media.imageUrl ? 'already-linked' : shouldWrite ? 'linked' : 'preview';
}

function printSummary({ files, rows, unmatchedAssets }) {
  const counts = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  console.log(`Mode: ${shouldWrite ? 'write' : 'preview'}`);
  console.log(`Modality: ${modalityFilter}`);
  console.log(`Combat media files: ${files.length}`);
  console.log(`Combat exercises checked: ${rows.length}`);
  console.table(rows.map((row) => ({
    modality: row.modality,
    category: row.category,
    exercise: row.exercise,
    status: row.status,
    image: row.image
  })));
  console.table(Object.entries(counts).map(([status, count]) => ({ status, count })));

  if (unmatchedAssets.length) {
    console.log('Assets without matching active combat exercise:');
    console.table(unmatchedAssets.map((asset) => ({
      modality: asset.modality,
      file: path.basename(asset.filePath),
      image: asset.imageUrl
    })));
  }

  if (!shouldWrite) {
    console.log('No changes saved. Run npm run media:boxing:sync to apply.');
  }
}

async function main() {
  const files = getMediaFiles().filter((file) => file.modalityKey === modalityFilter);
  const mediaIndex = buildMediaIndex(files);

  await connectDatabase();

  const exercises = await Exercise.find({
    active: true,
    modality: modalityFilter
  }).sort({ category: 1, name: 1 });
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
      modality: exercise.modality,
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
