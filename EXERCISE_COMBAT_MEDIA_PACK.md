# Exercise Combat Media Pack

Ultima atualizacao: 2026-07-27

## Objetivo

O **Exercise Combat Media Pack** e a biblioteca oficial de imagens padronizadas para exercicios de combate do GYM-OS.

As imagens ficam em:

```text
public/assets/combat-exercises/
```

## Padrao Visual

- Estetica sci-fi / Doom-like original;
- Dois momentos do movimento na mesma imagem;
- Ilustracao em paisagem;
- Sem texto, marca, logo ou watermark;
- Tamanho padrao: `1376x768`;
- Formato padrao: `.jpg`;
- Arquivo nomeado com slug em ingles.

## Estrutura

```text
public/assets/combat-exercises/
|-- Boxing/
`-- Kickboxing/
```

## Inventario Atual

```text
Boxing: 19
Kickboxing: 18
Total: 37
```

## Integracao Com O Banco

Boxing preview:

```bash
npm run media:boxing:preview
```

Boxing aplicar no banco:

```bash
npm run media:boxing:sync
```

Kickboxing preview:

```bash
npm run media:kickboxing:preview
```

Kickboxing aplicar no banco:

```bash
npm run media:kickboxing:sync
```

O script usado e:

```text
scripts/link-combat-exercise-media.js
```
