# Próximos Passos — Refatoração de Dados e Componentes

## Contexto

Este repositório é uma plataforma de jogos educacionais browser-based (sem build step, sem npm, sem bundler). Os jogos React+Babel são frágeis — leia o CLAUDE.md antes de tocar em qualquer arquivo.

A refatoração tem como objetivo centralizar dados e mecânicas de jogo em arquivos compartilhados (`utils/`), eliminando duplicação entre os jogos.

---

## Arquitetura alvo

```
utils/
  words.js          ← fonte de verdade sobre palavras (já existe, precisa de novos campos)
  letters.js        ← fonte de verdade sobre letras (já existe)
  ortografia.js     ← desafios de ortografia — manter como está
  gramatica.js      ← desafios gramaticais — manter por ora, será parcialmente substituído
  acentos.js        ← dados de acentos — será eliminado após migração para words.js
  challenges/
    ChallengeMatch.js      ← componente React reutilizável (type="text/babel")
    ChallengeConnect.js    ← componente React reutilizável (type="text/babel")
    ChallengeIntruder.js   ← componente React reutilizável (type="text/babel")
    ChallengeSentence.js   ← componente React reutilizável (type="text/babel")
```

---

## Fase 1 — Popular `words.js` com novos campos

Cada entrada em `words.js` já tem estrutura para receber:
- `classe` — ex: `'NOME (SUBSTANTIVO)'`, `'AÇÃO (VERBO)'`, `'QUALIDADE (ADJETIVO)'`, `null`
- `acento` — símbolo do acento presente na palavra: `'´'`, `'^'`, `'~'`, `null`
- `posicaoAcento` — índice (0-based) do caractere acentuado na palavra, ex: `0`, `null`

### 1a. Adicionar `classe` nas palavras de `words.js`
- Mapear as palavras que aparecem em `gramatica.js` para sua classe gramatical
- Exemplos: PULAR → `'AÇÃO (VERBO)'`, CACHORRO → `'NOME (SUBSTANTIVO)'`, FELIZ → `'QUALIDADE (ADJETIVO)'`
- Palavras sem classificação ficam com `classe: null`

### 1b. Adicionar `acento` e `posicaoAcento` nas palavras de `words.js`
- Mapear as palavras que aparecem em `acentos.js` (ÁGUA, CAFÉ, LÁPIS, etc.)
- Para cada palavra, identificar o caractere acentuado e sua posição
- Exemplos:
  - ÁGUA → `acento: '´'`, `posicaoAcento: 1` (Á está na posição 1 de AGUA→ÁGUA)
  - CAFÉ → `acento: '´'`, `posicaoAcento: 2`
  - ÔNIBUS → `acento: '^'`, `posicaoAcento: 0`
- Palavras de `acentos.js` que não existirem em `words.js` devem ser adicionadas como novas entradas

### 1c. Após popular `words.js`:
- `Fabrica de Acentos/main.js`: substituir `PHASES` hardcoded por IIFE que filtra `window.HYWords` onde `acento !== null`, agrupado por fase (pode usar campo `faseAcento: 1..12` em cada entrada, ou derivar das fases originais)
- `acentos.js` pode ser simplificado para manter apenas `accentMap` e `accentOptions` (as lookup tables que não são dados de palavras)

---

## Fase 2 — Criar componentes React reutilizáveis (`utils/challenges/`)

### Como funciona o carregamento (importante)
O Babel standalone processa **todos** os `<script type="text/babel">` em ordem. Os componentes de desafio devem ser carregados **antes** do `main.js` do jogo:

```html
<script src="../vendor/babel@7.26.10.min.js"></script>
<script type="text/babel" src="../utils/challenges/ChallengeMatch.js"></script>
<script type="text/babel" src="../utils/challenges/ChallengeConnect.js"></script>
<script type="text/babel" src="../utils/challenges/ChallengeIntruder.js"></script>
<script type="text/babel" src="../utils/challenges/ChallengeSentence.js"></script>
<script type="text/babel" src="main.js"></script>
```

### Interface de cada componente

Cada componente expõe via `window.HYChallenges.NomeDoDesafio` uma função React:

```js
// ChallengeMatch.js
window.HYChallenges = window.HYChallenges || {};
window.HYChallenges.Match = function({ level, isSuccess, shakeWrong, wrongAnswers, onAnswer, onDragStart, onDragOver, onDrop }) {
  return ( /* JSX do desafio match */ );
};
```

Props esperadas (uniformes para todos os componentes):
- `level` — objeto do desafio atual
- `isSuccess` — boolean
- `shakeWrong` — string ou null
- `wrongAnswers` — array
- `onAnswer(value)` — callback ao responder
- `onDragStart`, `onDragOver`, `onDrop` — handlers de drag (Match e Sentence usam)
- `solvedPairs`, `selectedLeft`, `onSelectLeft`, `onConnectRight` — exclusivos do Connect

### 2a. Extrair `ChallengeMatch.js`
- Fonte: `Detetives da Ortografia/main.js` — bloco `{level.type === 'match' && (...)}`
- Também aparece em `Escola de Magia VSA/main.js` com visual idêntico

### 2b. Extrair `ChallengeConnect.js`
- Fonte: `Detetives da Ortografia/main.js` — bloco `{level.type === 'connect' && (...)}`
- Inclui o SVG de linhas

### 2c. Extrair `ChallengeIntruder.js`
- Fonte: `Detetives da Ortografia/main.js` — bloco `{level.type === 'intruder' && (...)}`

### 2d. Extrair `ChallengeSentence.js`
- Fonte: `Detetives da Ortografia/main.js` — bloco `{level.type === 'sentence' && (...)}`

### 2e. Prova de conceito — migrar `Detetives da Ortografia`
- Adicionar os 4 `<script type="text/babel" src="../utils/challenges/...">` no `index.html`
- Substituir os 4 blocos `{level.type === '...' && (...)}` no `main.js` pelos componentes:
  ```jsx
  {level.type === 'match'   && <HYChallenges.Match   level={level} ... />}
  {level.type === 'connect' && <HYChallenges.Connect level={level} ... />}
  ```
- Testar no Live Server antes de expandir para outros jogos

### 2f. Após validar a prova de conceito:
- Migrar `Escola de Magia VSA` da mesma forma
- Avaliar quais outros jogos podem usar as mesmas mecânicas

---

## Fase 3 — (Futuro) Novos domínios

Com a arquitetura pronta, criar `utils/matematica.js` (ou similar) com desafios de matemática que reutilizam os mesmos componentes `ChallengeMatch`, `ChallengeConnect`, etc.

---

## Regras que devem ser seguidas durante toda a refatoração

- **Nunca executar comandos git** — controle de versão é manual pelo usuário
- **Nunca apagar código** sem garantir que o arquivo de origem foi atualizado para referenciar o novo arquivo
- **Jogos React+Babel**: ordem de scripts é rígida; `<script type="text/babel" src="main.js">` nunca deve ser alterado
- **Testar no Live Server** após cada fase — o preview interno do Claude Code não funciona para jogos React+Babel
- **Pedir QA ao usuário** após cada jogo migrado antes de avançar
- **Trabalhar em fases verificáveis** — não migrar todos os jogos de uma vez
