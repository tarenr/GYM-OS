-- GYM-OS — esquema SQLite equivalente aos 6 models Mongoose (Fase 1 da migração).
-- Ver docs/plano-migracao-sqlite-fase1.md para o inventário completo e as decisões
-- por trás de cada escolha (colunas normalizadas vs. JSON, formato de datas/ids).
--
-- Convenções:
--   - id: TEXT (preserva o ObjectId original do Mongo quando migrado do Atlas;
--     um hex de 24 caracteres gerado localmente para linhas novas).
--   - datas: TEXT ISO-8601 UTC (ex.: "2026-09-27T12:00:00.000Z") — comparação
--     lexicográfica de string bate com ordem cronológica.
--   - booleanos: INTEGER (0/1).
--   - arrays e subdocumentos aninhados: TEXT contendo JSON serializado.

CREATE TABLE IF NOT EXISTS workout_types (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  measurement_type TEXT NOT NULL,
  fields TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workout_types_code ON workout_types (code);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL DEFAULT '',
  modality TEXT NOT NULL DEFAULT 'strength',
  measurement_type TEXT NOT NULL DEFAULT 'sets_reps_weight',
  load_mode TEXT NOT NULL DEFAULT 'dumbbell_each',
  equipment TEXT NOT NULL DEFAULT '[]',
  default_sets INTEGER NOT NULL DEFAULT 0,
  default_reps TEXT NOT NULL DEFAULT '',
  default_rounds INTEGER NOT NULL DEFAULT 0,
  default_duration_seconds INTEGER NOT NULL DEFAULT 0,
  default_rest_seconds INTEGER NOT NULL DEFAULT 0,
  media_provider TEXT NOT NULL DEFAULT '',
  external_exercise_id TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  image_alt TEXT NOT NULL DEFAULT '',
  image_license TEXT NOT NULL DEFAULT '',
  image_license_url TEXT NOT NULL DEFAULT '',
  image_author TEXT NOT NULL DEFAULT '',
  image_author_url TEXT NOT NULL DEFAULT '',
  image_source_url TEXT NOT NULL DEFAULT '',
  instructions TEXT NOT NULL DEFAULT '[]',
  tips TEXT NOT NULL DEFAULT '[]',
  media_synced_at TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_category_name ON exercises (category, name);
CREATE INDEX IF NOT EXISTS idx_exercises_modality_category_name ON exercises (modality, category, name);
CREATE INDEX IF NOT EXISTS idx_exercises_modality_category_subcategory_name ON exercises (modality, category, subcategory, name);

CREATE TABLE IF NOT EXISTS body_measurements (
  id TEXT PRIMARY KEY,
  measured_at TEXT NOT NULL,
  weight_kg REAL NOT NULL DEFAULT 0,
  measurements_cm TEXT NOT NULL DEFAULT '{}',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_body_measurements_measured_at ON body_measurements (measured_at DESC);

CREATE TABLE IF NOT EXISTS workout_templates (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT '',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  workout_type_id TEXT,
  workout_type_code TEXT NOT NULL DEFAULT 'strength',
  workout_type_name TEXT NOT NULL DEFAULT 'Strength',
  measurement_type TEXT NOT NULL DEFAULT 'sets_reps_weight',
  exercises TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workout_templates_code ON workout_templates (code);

CREATE TABLE IF NOT EXISTS daily_missions (
  id TEXT PRIMARY KEY,
  day_index INTEGER NOT NULL,
  day_of_week TEXT NOT NULL,
  mission_name TEXT NOT NULL,
  intensity TEXT NOT NULL DEFAULT '',
  blocks TEXT NOT NULL DEFAULT '[]',
  bonus_xp INTEGER NOT NULL DEFAULT 0,
  rest_day INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_missions_day_index ON daily_missions (day_index);

CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  template_id TEXT,
  workout_code TEXT NOT NULL,
  workout_name TEXT NOT NULL,
  mission_date TEXT,
  mission_block_type TEXT NOT NULL DEFAULT '',
  mission_original_workout_code TEXT NOT NULL DEFAULT '',
  mission_original_workout_name TEXT NOT NULL DEFAULT '',
  mission_substitution INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  exercises TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  xp TEXT NOT NULL DEFAULT '{}',
  is_demo INTEGER NOT NULL DEFAULT 0,
  demo_batch TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts (date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_workout_code_date ON workouts (workout_code, date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_mission ON workouts (mission_date, mission_block_type, mission_original_workout_code);
CREATE INDEX IF NOT EXISTS idx_workouts_demo ON workouts (is_demo, demo_batch);
