import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase } from '../db/sqlite/client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqliteFilePath = path.join(__dirname, '..', '..', 'data', 'gym-os.sqlite');

// Fase 2 (Etapa B): o app passa a abrir o SQLite gerado em
// scripts/migrate-atlas-to-sqlite.js em vez de conectar no MongoDB Atlas.
// A conexao com o Atlas continua existindo em src/config/atlas.js, usada
// pelos scripts de migracao/manutencao legados. Ver
// docs/plano-migracao-sqlite-fase1.md.
export async function connectDatabase() {
  openDatabase(sqliteFilePath);

  console.log('SQLite connected.');
}
