# Guia Visual Do Pack De Exercicios GYM-OS

Ultima atualizacao: 2026-07-26

Este documento define o padrao oficial para gerar, revisar e aprovar imagens dos exercicios do GYM-OS.

O objetivo e evitar que cada grupo muscular tenha um estilo diferente. Todas as imagens devem parecer parte do mesmo pack.

## Referencia Oficial

Imagem principal de personagem:

```text
public/assets/body/gym-os-body-scan-slayer.png
```

Uso da referencia:

- identidade do Doom Guy / Slayer do GYM-OS;
- proporcao do corpo;
- estilo da armadura;
- paleta verde, laranja e vermelho;
- fundo sci-fi escuro;
- contorno forte;
- acabamento cartoon/cel-shaded.

Esta imagem e o `character bible` do pack. As imagens de exercicio podem mudar a pose, mas nao devem mudar a identidade visual do personagem.

## Estilo Obrigatorio

Usar:

```text
cartoon game illustration
cel-shaded
bold black outlines
clean readable silhouette
flat comic shading
simplified armor plates
dark sci-fi gym background
red/orange glow accents
two-panel start/end exercise demonstration
```

Evitar:

```text
photorealism
painterly realism
hyper-detailed armor texture
skin pores
cinematic close-up
different armor design
different helmet design
weapons
logos
text labels
watermarks
cropped limbs
```

## Composicao

Formato:

```text
16:9 landscape
1365x768 ou proporcao equivalente
```

Layout:

```text
painel esquerdo = inicio do movimento
painel direito = fim do movimento
divisor vertical preto no centro
personagem em escala parecida entre os exercicios
corpo inteiro visivel sempre que possivel
pose limpa e legivel em 1 segundo
fundo escuro consistente
```

Regras de enquadramento:

- nao aproximar demais a camera;
- manter espaco suficiente de chao e fundo;
- nao cortar pes, maos, halteres ou articulacoes importantes;
- manter o personagem centralizado em cada painel;
- a pose deve explicar o movimento sem precisar de texto.

## Setas De Movimento

As imagens devem incluir setas quando houver movimento.

Estilo das setas:

```text
HUD sci-fi
verde neon ou ciano
linha fina com brilho leve
ponta de seta clara
sem texto
sem cobrir articulacoes importantes
```

Uso:

- setas indicam a direcao principal do movimento;
- em movimentos alternados, usar setas em ambos os lados ou seta curva;
- em movimentos de rotacao, usar seta curva;
- em movimentos estaticos, usar marcador de estabilidade em vez de seta grande.

Exemplos:

```text
Bicycle crunch: seta curva do cotovelo para o joelho + seta alternando pernas.
Mountain climber: seta do joelho indo em direcao ao peito.
Crunch: seta do tronco subindo.
Leg raise: seta das pernas subindo.
Dumbbell Russian twist: seta curva de rotacao do tronco.
Dumbbell curl: seta do halter subindo.
Lateral raise: setas dos bracos abrindo para os lados.
```

## Prompt Base

Usar este prompt como base para novas geracoes:

```text
Create a GYM-OS exercise demonstration image for [EXERCISE_NAME].

Use the provided GYM-OS Doom Slayer body scan image as the character bible.
Match the same cartoon cel-shaded game asset style: bold black outlines, flat comic shading, simplified green sci-fi armor, orange/red glow accents, dark futuristic gym background, clean readable silhouette.

Composition: 16:9 landscape, two equal panels separated by a vertical black divider. Left panel shows the start position. Right panel shows the end position. Full body visible whenever possible, no cropped limbs, character centered in each panel, enough floor/background visible.

Add subtle sci-fi HUD movement arrows in neon green or cyan to show the direction of motion. Arrows must be thin, clean, and must not cover important joints or equipment.

Avoid photorealism, painterly realism, hyper-detailed armor texture, skin pores, cinematic close-up, different helmet design, weapons, text, labels, watermark, gore.
```

## Checklist De Aprovacao

Antes de salvar no sistema, conferir:

```text
[ ] O personagem parece o mesmo do body scan.
[ ] O estilo e cartoon/cel-shaded, nao realista.
[ ] O contorno e forte e limpo.
[ ] O fundo segue a arena sci-fi escura.
[ ] Ha dois paineis claros: inicio e fim.
[ ] O movimento e entendido em 1 segundo.
[ ] As setas ajudam e nao atrapalham.
[ ] Nao ha texto, label, logo ou watermark.
[ ] Nao ha armas.
[ ] Nao ha membros cortados.
[ ] A imagem combina com as outras do pack.
```

## Processo Recomendado

1. Gerar uma imagem piloto.
2. Comparar com `gym-os-body-scan-slayer.png`.
3. Aprovar estilo antes de salvar.
4. Salvar em:

```text
public/assets/doom-exercises/<MuscleGroup>/<exercise-slug>.jpg
```

5. Vincular no banco com:

```text
mediaProvider: doom-exercise-pack
imageSourceUrl: /assets/doom-exercises
imageLicense: AI generated for local GYM-OS project use
imageAuthor: GYM-OS / Codex image generation
```

## Prioridade De Revisao Do Pack Atual

Ordem recomendada:

```text
1. Core
2. Chest
3. Back
4. Biceps
5. Triceps
6. Legs
7. Shoulders
```

Motivo:

- Core sera alterado agora nas fichas A/B/C;
- depois, os grupos principais devem ser uniformizados para parecerem uma unica biblioteca visual.
