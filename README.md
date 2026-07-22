# Estrategia Nerd Academy - Gym OS

Modulo de treino da Estrategia Nerd Academy para registrar treinos, fichas,
missoes diarias, XP, heatmap e imagens de exercicios.

Produto atual:

```text
Treino Estrategia Nerd
```

## Documentacao completa

O estado completo do app, decisoes do projeto, modelos, rotas, telas, regras de XP,
missoes e proximas fases esta em:

```text
DOCUMENTACAO_APP.md
```

A evolucao de marca e produto para **Estrategia Nerd Academy** esta em:

```text
ROADMAP_ACADEMY.md
```

Com o servidor rodando, abra dentro do proprio sistema:

```text
http://localhost:3000/documentacao
```

## Stack

- Node.js
- Express
- Mongoose
- MongoDB Atlas
- HTML, CSS e JavaScript

## Como rodar

### Jeito mais simples

Na raiz do projeto, execute com dois cliques:

```text
iniciar-treino.bat
```

O app abre em:

```text
http://localhost:3000
```

### Manual

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` baseado em `env.example`:

```env
PORT=3000
MONGODB_URI=sua_string_do_mongodb_atlas
```

3. Inicie o servidor:

```bash
npm run dev
```

4. Acesse:

```text
http://localhost:3000
```

## Rotas da API

```text
GET    /api/workouts
GET    /api/workouts/:id
POST   /api/workouts
PUT    /api/workouts/:id
DELETE /api/workouts/:id
```
