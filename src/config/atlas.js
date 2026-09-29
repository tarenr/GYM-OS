import mongoose from 'mongoose';
import dns from 'node:dns';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frozenMarkerPath = path.join(__dirname, '.atlas-frozen');

// Conexao isolada com o MongoDB Atlas. Ate a Fase 2 - Etapa C (corte real),
// e usada tanto pelo app (via database.js) quanto pelos scripts de
// migracao/manutencao. Depois do corte, database.js passa a abrir o
// SQLite e esta funcao so continua existindo pros scripts legados em
// scripts/ e scripts/maintenance/, que ainda leem/escrevem no Atlas.
//
// Trava preparada (ainda INATIVA nesta etapa — nenhum arquivo
// .atlas-frozen existe ainda): depois do corte real, um arquivo
// marcador src/config/.atlas-frozen sera criado. Quando ele existir,
// esta funcao passa a exigir a variavel de ambiente
// ALLOW_FROZEN_ATLAS=1 antes de conectar, pra impedir que um script
// antigo rode por engano contra uma copia do Atlas que nao e mais a
// fonte real dos dados. Ver docs/plano-migracao-sqlite-fase1.md.
export async function connectAtlas() {
  if (existsSync(frozenMarkerPath) && process.env.ALLOW_FROZEN_ATLAS !== '1') {
    throw new Error(
      'O MongoDB Atlas deste projeto esta congelado (ver docs/plano-migracao-sqlite-fase1.md) — ' +
        'os dados reais agora vivem no SQLite. Se voce sabe o que esta fazendo e precisa acessar essa ' +
        'copia congelada mesmo assim, rode de novo com ALLOW_FROZEN_ATLAS=1.'
    );
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI was not defined in the .env file.');
  }

  if (
    uri.includes('usuario:senha') ||
    uri.includes('sua_string') ||
    uri.includes('cluster.mongodb.net')
  ) {
    throw new Error(
      'MONGODB_URI is still using the example value. Add the real MongoDB Atlas string to the .env file.'
    );
  }

  dns.setServers(['1.1.1.1', '8.8.8.8']);
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    family: 4
  });

  console.log('MongoDB connected.');
}
