# Sistema De Evolucao Corporal

Ultima atualizacao: 2026-07-24

## Objetivo

Criar um modulo opcional de acompanhamento corporal para o GYM-OS.

O modulo deve apoiar a jornada de recomposicao corporal sem transformar peso e medidas em cobranca diaria.

## Principios

```text
Peso nao e o unico indicador.
Medidas corporais ajudam a entender recomposicao.
O acompanhamento deve ser opcional.
Consistencia deve ser mais valorizada que emagrecimento rapido.
Fotos de progresso exigem cuidado de privacidade e ficam para fase futura.
```

## Objetivo Atual Relacionado

Perfil atual:

```text
Objetivo principal: recomposicao corporal
Foco secundario: base de forca + suporte para reducao de peso
Fase: Fundacao
Treino: forca de segunda a sabado
Descanso: domingo
```

Para este objetivo, as metricas mais uteis sao:

- peso;
- cintura;
- abdomen;
- peito;
- bracos;
- coxas;
- observacoes.

## Campos Da Primeira Versao

Primeira entrega recomendada:

```text
data da medicao
peso
cintura
abdomen
peito
braco direito
braco esquerdo
coxa direita
coxa esquerda
observacoes
```

Campos para depois:

```text
quadril
panturrilha direita
panturrilha esquerda
percentual de gordura
fotos de progresso
meta corporal
```

## Modelo Conceitual

Sem multiusuario por enquanto:

```js
const BodyMeasurementSchema = new mongoose.Schema(
  {
    measuredAt: {
      type: Date,
      required: true,
      default: Date.now
    },

    weightKg: {
      type: Number,
      min: 20,
      max: 500
    },

    bodyFatPercentage: {
      type: Number,
      min: 1,
      max: 80
    },

    measurementsCm: {
      waist: Number,
      abdomen: Number,
      chest: Number,
      hips: Number,
      rightArm: Number,
      leftArm: Number,
      rightThigh: Number,
      leftThigh: Number,
      rightCalf: Number,
      leftCalf: Number
    },

    notes: {
      type: String,
      maxlength: 500
    }
  },
  { timestamps: true }
);
```

Preparacao futura para multiusuario:

```js
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  index: true
}
```

## Frequencia Recomendada

```text
Peso: 1 vez por semana
Medidas corporais: a cada 15 ou 30 dias
Fotos: mensal, apenas em fase futura
```

O dashboard deve priorizar:

```text
media semanal de peso
tendencia de cintura
comparacao inicio vs atual
ultima medicao
```

## Tela Proposta

Nome visual:

```text
BODY_PROGRESS.sys
```

Pode entrar na aba `Evolucao` ou virar uma nova aba depois.

Primeira versao deve mostrar:

- peso atual;
- peso inicial;
- diferenca de peso;
- cintura atual;
- cintura inicial;
- diferenca de cintura;
- ultima medicao;
- historico de medicoes.

## Graficos

Primeira versao:

```text
peso ao longo do tempo
cintura ao longo do tempo
abdomen ao longo do tempo
```

Depois:

```text
bracos
coxas
comparativo inicio vs atual
comparar duas datas especificas
```

Periodos uteis:

```text
Inicio da jornada
30 dias
90 dias
6 meses
1 ano
```

## Interpretacao Inteligente

O sistema deve evitar leitura simplista baseada so em peso.

Exemplos de mensagens:

```text
Peso estavel, mas cintura reduziu.
Peso subiu, mas cintura caiu e a frequencia de treino aumentou.
Cintura reduziu desde o inicio da jornada.
Voce manteve o acompanhamento por mais um mes.
```

## Gamificacao

Conquistas recomendadas:

```text
Primeira avaliacao registrada
Tres avaliacoes registradas
30 dias acompanhando evolucao
Atualizacao mensal completa
90 dias de acompanhamento
Meta corporal definida
Meta corporal alcancada
```

Evitar conquistas fixas como:

```text
Perca 5 kg
```

Motivo:

```text
Nem todo objetivo e emagrecimento.
Recomposicao corporal pode melhorar medidas sem grande queda de peso.
```

## Fotos De Progresso

Fase futura.

Antes de implementar fotos, resolver:

- armazenamento;
- limite de tamanho;
- privacidade;
- exclusao definitiva;
- protecao de acesso;
- custo de hospedagem.

Regra:

```text
Fotos nunca devem ser publicas por padrao.
```

## Fases De Implementacao

### Fase 1 - Documentacao

- Criar este documento.
- Atualizar `DOCUMENTACAO_APP.md`.

### Fase 2 - Modelo E API

- Criar `src/models/BodyMeasurement.js`.
- Criar controller.
- Criar rotas.
- Validar campos opcionais.

### Fase 3 - Interface Basica

- Criar formulario de medicao.
- Criar lista de medicoes.
- Mostrar resumo inicial vs atual.

### Fase 4 - Graficos

- Peso.
- Cintura.
- Abdomen.
- Comparacao por periodo.

### Fase 5 - Inteligencia E Conquistas

- Mensagens de tendencia.
- Conquistas por acompanhamento.
- Metas corporais.

### Fase 6 - Fotos

- Planejar storage.
- Proteger acesso.
- Criar exclusao definitiva.

## Proxima Implementacao Recomendada

Depois de ajustar as missoes por objetivo, implementar:

```text
BodyMeasurement model + rotas basicas + formulario simples.
```
