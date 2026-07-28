# Documentacao do Processo Codex

Este documento registra as regras de trabalho combinadas para manutencao do GYM-OS. Ele deve ser seguido em todas as proximas alteracoes neste repositorio.

## Fluxo obrigatorio

Toda demanda deve seguir este fluxo:

1. Ideia
2. Planejamento
3. Aprovacao
4. Realizacao
5. Validacao
6. Resumo final

Se a tarefa for simples, o planejamento pode ser curto, mas ainda deve existir. A realizacao so comeca depois de aprovacao explicita do usuario.

## Quando nao executar

Nao alterar arquivos, banco de dados, scripts, dependencias ou servidor enquanto a conversa estiver em fase de ideia ou planejamento.

Nao assumir que "estamos planejando" significa permissao para implementar.

So pular etapas quando o usuario disser claramente que pode pular alguma delas.

## Scripts antes de improviso

Antes de executar qualquer acao repetivel, avaliar se vale criar ou reaproveitar um script.

Criar script quando:

- a acao envolve MongoDB;
- a acao pode se repetir no futuro;
- ha risco de erro com PowerShell, aspas ou operadores como `$set`, `$pull`, `$or`;
- precisamos de `before`, `matched`, `modified`, `after`;
- a acao altera dados de treino, catalogo, templates, XP ou midia.

Evitar `node -e` no PowerShell para comandos MongoDB com operadores `$`. Preferir scripts em `scripts/maintenance/` com `CONFIG` no topo.

Scripts de manutencao existentes:

- `npm run maint:inspect`
- `npm run maint:update-exercise`
- `npm run maint:remove-exercise`
- `npm run maint:recalculate-xp`
- `npm run maint:verify-server`

## Alteracoes no banco

Sempre que possivel, rodar primeiro em modo preview ou `dryRun`.

Ao alterar dados, mostrar resultados objetivos:

- antes;
- encontrados;
- modificados;
- removidos;
- depois.

Se a alteracao afetar treinos, exercicios realizados, comparativos ou regras de execucao, recalcular XP quando fizer sentido.

## Servidor

Apos toda alteracao, reiniciar o servidor e testar se esta online.

Fluxo esperado:

1. parar processo atual da porta `3000`;
2. iniciar `node src/server.js`;
3. confirmar conexao com MongoDB;
4. testar `http://localhost:3000`;
5. rodar `npm run maint:verify-server` quando fizer sentido.

## Validacao

Para arquivos JavaScript alterados, rodar `node --check`.

Para alteracoes de dados ou regras de dominio, fazer checagem direcionada por API, banco ou script.

Na resposta final, informar:

- o que foi alterado;
- quais arquivos ou dados foram afetados;
- quais validacoes passaram;
- se algo nao foi possivel testar.

## Regras atuais do dominio

Exercicios de peso corporal contam como realizados mesmo com peso `0`, desde que tenham valor positivo de reps ou tempo.

Regras especificas:

- `Plank` e tempo em segundos.
- `Crunch` e repeticao.
- `Mountain climber` e repeticao.
- `Bicycle crunch` e repeticao.
- `Leg raise` e repeticao.
- `Burpee with guard` e repeticao.

O valor tecnico pode continuar salvo no campo `reps`, mas a interface deve mostrar `tempo` para exercicios temporizados.

## Exercicios removidos

Pullover foi removido do sistema e nao deve voltar automaticamente.

Nao recriar estes exercicios em catalogo, templates, midia, traducoes ou treinos:

- `Dumbbell pullover`
- `Dumbbell pullover on bench`
- `Dumbbell pullover on flat bench`

## Resposta final

A resposta final deve ser curta e objetiva, contendo:

- resumo da implementacao;
- validacoes feitas;
- status do servidor;
- observacoes importantes.

Nao encerrar uma tarefa de alteracao sem validar e informar o resultado.
