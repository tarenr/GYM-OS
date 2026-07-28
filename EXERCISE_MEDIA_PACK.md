# Exercise Media Pack Doom

Ultima atualizacao: 2026-07-27

## Objetivo

O **Exercise Media Pack Doom** e a biblioteca oficial de imagens padronizadas dos exercicios de forca do GYM-OS.

As imagens ficam em:

```text
public/assets/doom-exercises/
```

O sistema deve priorizar essas imagens locais antes de usar imagem externa ou placeholder.

## Padrao Visual

- Estetica sci-fi / Doom-like original;
- Dois momentos do movimento na mesma imagem;
- Ilustracao em paisagem;
- Sem texto, marca, logo ou watermark;
- Tamanho padrao: `1376x768`;
- Formato padrao: `.jpg`;
- Arquivo nomeado com slug em ingles.

## Regra Do Banco

Todo exercicio feito no banco deve usar **banco reto/simples**.

Nao usar:

```text
banco inclinado
banco declinado
maquina especifica
```

Essa regra vale para supinos, skull crusher, concentration curl, hip thrust e qualquer outro exercicio que use apoio.

## Estrutura

```text
public/assets/doom-exercises/
|-- Back/
|-- Biceps/
|-- Chest/
|-- Core/
|-- Legs/
|-- Shoulders/
`-- Triceps/
```

## Inventario Atual

```text
Back: 5
Biceps: 5
Chest: 4
Core: 6
Legs: 6
Shoulders: 5
Triceps: 3
Total: 34
```

Observacao: os arquivos podem cobrir mais de um exercicio ativo de forca quando movimentos compartilham imagem aprovada, como variacoes de reverse fly.

## Integracao Com O Banco

Preview:

```bash
npm run media:doom:preview
```

Aplicar no banco:

```bash
npm run media:doom:sync
```

Sincronizar midia do catalogo com fichas/templates ativos:

```bash
npm run media:templates:preview
npm run media:templates:sync
```

O script usado e:

```text
scripts/link-doom-exercise-media.js
```

Ele faz:

- escaneia `public/assets/doom-exercises`;
- cruza `category + exercise slug`;
- cobre aliases conhecidos;
- atualiza `Exercise`;
- propaga para `WorkoutTemplate`;
- propaga para `Workout`;
- usa provider `doom-exercise-pack`.

## Fallback

Se um exercicio nao tiver imagem Doom:

1. manter imagem externa existente, se houver;
2. manter placeholder visual do sistema;
3. adicionar no backlog do pack.
