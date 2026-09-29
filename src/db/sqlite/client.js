import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, 'schema.sql');

let db = null;
let dbPath = null;

export function openDatabase(filePath) {
  if (db && dbPath === filePath) {
    return db;
  }

  if (db) {
    db.close();
  }

  db = new DatabaseSync(filePath);
  dbPath = filePath;
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(readFileSync(schemaPath, 'utf8'));

  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('SQLite database was not opened yet. Call openDatabase(filePath) first.');
  }

  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    dbPath = null;
  }
}

export function withTransaction(fn) {
  const database = getDatabase();

  database.exec('BEGIN IMMEDIATE');

  try {
    const result = fn(database);

    database.exec('COMMIT');

    return result;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}
