import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDatabase } from './config/database.js';
import { dailyMissionRoutes } from './routes/dailyMissionRoutes.js';
import { exerciseMediaRoutes } from './routes/exerciseMediaRoutes.js';
import { exerciseRoutes } from './routes/exerciseRoutes.js';
import { templateRoutes } from './routes/templateRoutes.js';
import { workoutRoutes } from './routes/workoutRoutes.js';
import { workoutTypeRoutes } from './routes/workoutTypeRoutes.js';
import { seedExerciseCatalog } from './services/seedExerciseCatalog.js';
import { seedCombatWorkoutTemplates } from './services/seedCombatWorkoutTemplates.js';
import { seedDailyMissions } from './services/seedDailyMissions.js';
import { seedWorkoutTypes } from './services/seedWorkoutTypes.js';
import { syncTemplateExerciseSubcategories } from './services/syncTemplateExerciseSubcategories.js';

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.resolve(__dirname, '../public');
const documentationPath = path.resolve(__dirname, '../DOCUMENTACAO_APP.md');
const academyRoadmapPath = path.resolve(__dirname, '../ROADMAP_ACADEMY.md');
const academyProgressSystemPath = path.resolve(__dirname, '../ACADEMY_PROGRESS_SYSTEM.md');
const documentationFiles = {
  app: documentationPath,
  academy: academyRoadmapPath,
  progressSystem: academyProgressSystemPath
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderInlineMarkdown(value = '') {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inCode = false;
  let listType = null;

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        html.push('</code></pre>');
        inCode = false;
      } else {
        closeList();
        inCode = true;
        html.push('<pre><code>');
      }
      continue;
    }

    if (inCode) {
      html.push(escapeHtml(line));
      continue;
    }

    if (!line.trim()) {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);

    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^\s*-\s+(.+)$/);

    if (unordered) {
      if (listType !== 'ul') {
        closeList();
        listType = 'ul';
        html.push('<ul>');
      }
      html.push(`<li>${renderInlineMarkdown(unordered[1])}</li>`);
      continue;
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);

    if (ordered) {
      if (listType !== 'ol') {
        closeList();
        listType = 'ol';
        html.push('<ol>');
      }
      html.push(`<li>${renderInlineMarkdown(ordered[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  }

  closeList();

  if (inCode) {
    html.push('</code></pre>');
  }

  return html.join('\n');
}

function renderDocumentationPage(markdown) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Documentacao | GYM-OS</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/gym-os.css" />
    <style>
      .doc-shell {
        width: min(980px, calc(100% - 32px));
        margin: 0 auto;
        padding: 28px 0 56px;
      }

      .doc-header {
        position: sticky;
        top: 0;
        z-index: 10;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: rgba(13, 17, 23, 0.96);
        padding: 18px 20px;
        backdrop-filter: blur(14px);
      }

      .doc-header h1 {
        margin: 0;
        font-size: clamp(1.3rem, 4vw, 2.2rem);
        line-height: 1.05;
      }

      .doc-header p {
        margin: 6px 0 0;
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      .doc-content {
        margin-top: 18px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: rgba(22, 27, 34, 0.94);
        padding: clamp(18px, 3vw, 34px);
      }

      .doc-content h1,
      .doc-content h2,
      .doc-content h3,
      .doc-content h4 {
        margin: 28px 0 12px;
        line-height: 1.18;
      }

      .doc-content h1:first-child {
        margin-top: 0;
      }

      .doc-content h1 {
        color: var(--green);
        font-size: clamp(1.5rem, 4vw, 2.4rem);
      }

      .doc-content h2 {
        border-top: 1px solid var(--border);
        padding-top: 24px;
        color: var(--text);
      }

      .doc-content h3 {
        color: var(--blue);
      }

      .doc-content p,
      .doc-content li {
        color: var(--muted-strong);
        line-height: 1.72;
      }

      .doc-content ul,
      .doc-content ol {
        display: grid;
        gap: 6px;
        margin: 0 0 18px;
        padding-left: 24px;
      }

      .doc-content code {
        border: 1px solid var(--border);
        border-radius: 4px;
        background: var(--bg);
        color: var(--green);
        padding: 2px 5px;
      }

      .doc-content pre {
        overflow: auto;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--bg);
        padding: 14px;
      }

      .doc-content pre code {
        border: 0;
        background: transparent;
        padding: 0;
        white-space: pre;
      }

      .doc-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
    </style>
  </head>
  <body>
    <div class="scanlines" aria-hidden="true"></div>
    <main class="doc-shell">
      <header class="doc-header">
        <div>
          <h1>DOCUMENTACAO_APP.md</h1>
          <p>GYM-OS | Estrategia Nerd Academy | Manual de continuidade</p>
        </div>
        <div class="doc-actions">
          <a class="button button-ghost" href="/">Voltar ao app</a>
          <a class="button button-secondary" href="/DOCUMENTACAO_APP.md" download>Baixar MD</a>
          <a class="button button-secondary" href="/ROADMAP_ACADEMY.md" download>Baixar Roadmap</a>
        </div>
      </header>
      <article class="doc-content">
        ${renderMarkdown(markdown)}
      </article>
    </main>
  </body>
</html>`;
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicPath));

app.use('/api/exercises', exerciseRoutes);
app.use('/api/exercise-media', exerciseMediaRoutes);
app.use('/api/daily-missions', dailyMissionRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/workout-types', workoutTypeRoutes);
app.use('/api/workouts', workoutRoutes);

app.get('/health', (request, response) => {
  response.json({ status: 'ok' });
});

app.get('/DOCUMENTACAO_APP.md', async (request, response, next) => {
  try {
    response.type('text/markdown; charset=utf-8');
    response.send(await readFile(documentationPath, 'utf8'));
  } catch (error) {
    next(error);
  }
});

app.get('/ROADMAP_ACADEMY.md', async (request, response, next) => {
  try {
    response.type('text/markdown; charset=utf-8');
    response.send(await readFile(academyRoadmapPath, 'utf8'));
  } catch (error) {
    next(error);
  }
});

app.get('/ACADEMY_PROGRESS_SYSTEM.md', async (request, response, next) => {
  try {
    response.type('text/markdown; charset=utf-8');
    response.send(await readFile(academyProgressSystemPath, 'utf8'));
  } catch (error) {
    next(error);
  }
});

app.get('/api/documentation', async (request, response, next) => {
  try {
    const docKey = String(request.query.doc || 'app');
    const filePath = documentationFiles[docKey] || documentationFiles.app;
    const markdown = await readFile(filePath, 'utf8');

    response.json({
      html: renderMarkdown(markdown),
      markdown
    });
  } catch (error) {
    next(error);
  }
});

app.get('/documentacao', async (request, response, next) => {
  response.redirect('/?tab=documentation');
});

app.use((request, response) => {
  response.status(404).json({ message: 'Rota nao encontrada.' });
});

app.use((error, request, response, next) => {
  if (error.name === 'ValidationError') {
    return response.status(422).json({
      message: 'Dados invalidos.',
      errors: Object.values(error.errors).map((item) => item.message)
    });
  }

  console.error(error);

  response.status(500).json({
    message: 'Erro interno no servidor.'
  });
});

try {
  await connectDatabase();
  await seedWorkoutTypes();
  await seedExerciseCatalog();
  await seedCombatWorkoutTemplates();
  await syncTemplateExerciseSubcategories();
  await seedDailyMissions();

  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log('Dados no MongoDB Atlas.');
  });
} catch (error) {
  console.error('Nao foi possivel iniciar o servidor.');
  console.error(error.message);
  process.exit(1);
}
