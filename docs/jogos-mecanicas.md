# Hello Yotta Games — Documentação Técnica dos Jogos

> Gerado a partir da leitura direta dos arquivos `main.js` de cada jogo.
> Objetivo: servir de referência para desenvolvedores que vão dar manutenção e para o time de produto entender o que foi implementado.


---

## Índice

1. [Caçadores de Coletivos](#1-caçadores-de-coletivos)
2. [Canhões de Ouro](#2-canhões-de-ouro)
3. [Defesa do Castelo Matemático](#3-defesa-do-castelo-matemático)
4. [Detetives da Ortografia](#4-detetives-da-ortografia)
5. [Digitado (ABC Palavras Mágicas)](#5-digitado-abc-palavras-mágicas)
6. [Digite o Resultado](#6-digite-o-resultado)
7. [Duelo dos Monstros](#7-duelo-dos-monstros)
8. [Escola de Magia VSA](#8-escola-de-magia-vsa)
9. [Fábrica de Rimas](#9-fábrica-de-rimas)
10. [Fábrica de Acentos](#10-fábrica-de-acentos)
11. [Galáxia da Matemática](#11-galáxia-da-matemática)
12. [Galáxia dos Opostos](#12-galáxia-dos-opostos)
13. [Laboratório das Poções](#13-laboratório-das-poções)
14. [Maiúsculo vs Minúsculo](#14-maiúsculo-vs-minúsculo)
15. [Matemática Pirata](#15-matemática-pirata)
16. [Mercado Alien](#16-mercado-alien)
17. [Mercado Maior ou Menor](#17-mercado-maior-ou-menor)
18. [Organiza Tudo](#18-organiza-tudo)
19. [Piratas do Troco](#19-piratas-do-troco)
20. [Sinônimos](#20-sinônimos)
21. [Trem da Soma e Subtração](#21-trem-da-soma-e-subtração)
22. [Monster Typer I](#22-monster-typer-i)
23. [Monster Typer II](#23-monster-typer-ii)
24. [Syllables (Sílabas)](#24-syllables-sílabas)
25. [Vowel (Vogais)](#25-vowel-vogais)
26. [Mapa da Ilha do Tesouro](#26-mapa-da-ilha-do-tesouro)
27. [Espelho Mágico](#27-espelho-mágico)
28. [Gráfico em Ação](#28-gráfico-em-ação)
29. [Qual é o próximo](#29-qual-é-o-próximo)
30. [Fábrica das Formas](#30-fábrica-das-formas)
31. [Que horas são](#31-que-horas-são)
32. [Complete a Cobra](#32-complete-a-cobra)
33. [Sudoku Mágico](#33-sudoku-mágico)
34. [Combinando Sorvete](#34-combinando-sorvete)
35. [Mercado Matemágico](#35-mercado-matemágico)
36. [O Caminho Mais Rápido](#36-o-caminho-mais-rápido)
37. [Balança da Descoberta](#37-balança-da-descoberta)
38. [Complete a Sequência](#38-complete-a-sequência)
39. [Contando as Patas](#39-contando-as-patas)
40. [Qual é o Grupo?](#40-qual-é-o-grupo)

---

## Convenções deste documento

- **Stack**: React 18 via CDN (Babel standalone) **ou** Vanilla JS — indicado em cada jogo.
- **Persistência**: `localStorage` em jogos com progresso entre sessões.
- **Áudio**: `Web Audio API` sintetizado (sem arquivos externos).
- **Animações**: classes CSS definidas em `game-viewport.css` (`.shake-anim`, `.pop-anim`, `.line-anim` etc.).
- **Jogos 26–40** (mais recentes): todos Vanilla JS, seguem um esqueleto unificado (`screen-cover` → `screen-tracks` → `screen-game`, 12 trilhas × 5 desafios, `HY.stars.init/renderGrid/trackComplete`, progressão de dificuldade em blocos de 3 trilhas via `blockForTrack(idx) = Math.min(3, Math.floor(idx/3))`). Persistência de estrelas via `sessionStorage` (chave gerenciada por `HY.stars`). Interações de arrastar usam o padrão Pointer Events (`startPointerDrag`/`onPointerDragMove`/`onPointerDragEnd`) em vez do HTML5 Drag and Drop nativo.

---

## 1. Caçadores de Coletivos

**Pasta:** `Caçadores de Coletivos/`
**Stack:** React 18
**Categoria:** Português — Substantivos Coletivos
**Fases:** 12

### Descrição

O jogador aprende substantivos coletivos (alcateia, cardume, enxame…) através de 4 mecânicas distintas aplicadas sequencialmente nas 12 fases.

### Mecânicas

#### Mecânica 1 — Match (Arrastar e Largar)
Fases 1–3. O jogador arrasta o coletivo correto para uma dropzone.

**Dados de configuração:**
```js
{ id: 1, type: 'match', target: 'LOBOS', answer: 'ALCATEIA',
  options: ['ALCATEIA', 'MATILHA', 'REBANHO'], emoji: '🐺',
  instruction: 'Como chamamos um grupo de LOBOS? Arraste a palavra certa!' }
```

**Lógica de validação (checkAnswer):**
```js
const checkAnswer = (value) => {
  if (isSuccess || wrongAnswers.includes(value)) return;
  if (value === level.answer) {
    handleWin();
  } else {
    setWrongAnswers(prev => [...prev, value]);
    setShakeWrong(value);
    setTimeout(() => setShakeWrong(null), 400);
  }
};
```

**Handlers de Drag & Drop:**
```js
const handleDragStart = (e, value) => {
  setDraggedOption(value);
  e.dataTransfer.setData('text/plain', value);
};
const handleDragOver = (e) => e.preventDefault();
const handleDrop = (e) => {
  e.preventDefault();
  const value = e.dataTransfer.getData('text/plain');
  if (value) checkAnswer(value);
};
```

#### Mecânica 2 — Connect (Ligar os Pontos)
Fases 4–6. O jogador clica numa palavra da esquerda e depois no seu par na direita; linhas SVG animadas são desenhadas entre os pares resolvidos.

**Dados de configuração:**
```js
{ id: 4, type: 'connect',
  leftWords: ['ESTRELAS', 'ILHAS', 'PÁSSAROS'],
  rightWords: ['BANDO', 'CONSTELAÇÃO', 'ARQUIPÉLAGO'],
  matches: { 'ESTRELAS': 'CONSTELAÇÃO', 'ILHAS': 'ARQUIPÉLAGO', 'PÁSSAROS': 'BANDO' } }
```

**Lógica de validação (handleConnectRight):**
```js
const handleConnectRight = (rightWord) => {
  if (!selectedLeft) { alert("Caçador, escolha primeiro uma palavra da coluna da esquerda!"); return; }
  if (level.matches[selectedLeft] === rightWord) {
    const newSolved = [...solvedPairs, selectedLeft];
    setSolvedPairs(newSolved);
    setSelectedLeft(null);
    if (newSolved.length === level.leftWords.length) handleWin();
  } else {
    setShakeWrong(rightWord);
    setTimeout(() => setShakeWrong(null), 400);
    setSelectedLeft(null);
  }
};
```

**Renderização das linhas SVG:**
```jsx
<svg className="absolute top-0 bottom-0 left-[35%] w-[30%] h-full pointer-events-none z-0">
  {solvedPairs.map((leftWord) => {
    const rightWord = level.matches[leftWord];
    const leftIndex = level.leftWords.indexOf(leftWord);
    const rightIndex = level.rightWords.indexOf(rightWord);
    const y1 = ['16.66%', '50%', '83.33%'][leftIndex];
    const y2 = ['16.66%', '50%', '83.33%'][rightIndex];
    return (
      <g key={`line-${leftWord}`}>
        <line x1="0%" y1={y1} x2="100%" y2={y2} stroke="#ea580c" strokeWidth="6" strokeLinecap="round" className="line-anim" />
        <circle cx="0%" cy={y1} r="8" fill="#9a3412" className="pop-anim" />
        <circle cx="100%" cy={y2} r="8" fill="#9a3412" className="pop-anim" />
      </g>
    );
  })}
</svg>
```

#### Mecânica 3 — Intruder (O Intruso)
Fases 7–9. O jogador identifica a palavra que **não** é um substantivo coletivo.

**Dados de configuração:**
```js
{ id: 7, type: 'intruder',
  words: ['ALCATEIA', 'CARDUME', 'CACHORRO', 'MANADA'],
  answer: 'CACHORRO', emoji: '🐾',
  instruction: 'Qual dessas palavras NÃO é um coletivo?' }
```

**Renderização dos botões (a mesma `checkAnswer` genérica valida):**
```jsx
{level.words.map((word, i) => {
  const isCorrectAnswer = word === level.answer;
  const isClickedAndNotIntruder = wrongAnswers.includes(word);
  // Botão correto recebe pop-anim ao acertar; errados ficam vermelhos
  return (
    <button key={i} onClick={() => checkAnswer(word)} disabled={isClickedAndNotIntruder || isSuccess}>
      {word}
    </button>
  );
})}
```

#### Mecânica 4 — Sentence (Substituição na Frase)
Fases 10–12. O jogador arrasta o coletivo para substituir uma expressão destacada numa frase.

**Dados de configuração:**
```js
{ id: 10, type: 'sentence',
  preText: 'Vimos um lindo ',
  boldText: 'GRUPO DE PEIXES',
  postText: ' no oceano.',
  answer: 'CARDUME', options: ['CARDUME', 'BANDO', 'REBANHO'] }
```

**Dropzone da frase (aceita drag e click):**
```jsx
<span
  onDragOver={handleDragOver}
  onDrop={handleDrop}
  onClick={() => { if(!isSuccess) alert("Toque ou arraste uma das opções de baixo aqui para dentro!"); }}
>
  {isSuccess
    ? <span>{level.answer}</span>
    : <span className="line-through opacity-60">{level.boldText}</span>}
</span>
```

### Fluxo de telas

`cover` → `playing` (12 fases sequenciais) → `complete`

**Função de vitória (handleWin) compartilhada entre todas as mecânicas:**
```js
const handleWin = () => {
  setIsSuccess(true);
  setStars(prev => prev + 1);
  setTimeout(() => {
    if (currentPhaseIndex + 1 < LEVELS.length) {
      setCurrentPhaseIndex(prev => prev + 1);
      resetTurn();
    } else {
      setGameState('complete');
    }
  }, 2500);
};
```

---

## 2. Canhões de Ouro

**Pasta:** `Canhões de ouro/`
**Stack:** React 18
**Categoria:** Matemática — Adição e Subtração
**Fases:** 10 níveis selecionáveis
**Persistência:** `localStorage` (chave `canhoes_pirata_v1_save`)

### Descrição

Jogo de adição/subtração com estética pirata. O jogador escolhe a resposta correta e um canhão dispara uma bala em trajetória parabólica animada. Inclui sistema de estrelas por nível (1–3) e desbloqueio sequencial.

### Mecânicas

#### Seleção de Resposta + Animação do Canhão

**Dados de configuração (exemplo com parcela oculta):**
```js
{ id: 6, n1: 3, n2: null, op: '+', ans: 8, missing: 'n2',
  options: [4, 5, 6], task: "Quem falta no canhão?" }
```

**Validação da resposta:**
```js
const checkAnswer = (val) => {
  if (firing || hit) return;
  const expected = level.missing
    ? (level.missing === 'n2' ? level.ans - level.n1 : level.ans - level.n2)
    : level.ans;
  if (val === expected) {
    animateShot();
  } else {
    setWrong(prev => [...prev, val]);
    playTone(150, 'sawtooth', 0.3);
  }
};
```

**Animação parabólica da bala (requestAnimationFrame):**
```js
const animateShot = () => {
  setFiring(true);
  const ball = ballRef.current;
  const cannon = cannonRef.current.getBoundingClientRect();
  const target = targetRef.current.getBoundingClientRect();
  const startX = cannon.right - 10;
  const startY = cannon.top + cannon.height / 2;
  const endX = target.left + target.width / 2;
  const endY = target.top + target.height / 2;
  ball.style.display = 'block';
  const startTime = performance.now();
  const duration = 900;
  const peakHeight = 180;

  function update(time) {
    const elapsed = time - startTime;
    const t = Math.min(elapsed / duration, 1);
    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t - Math.sin(t * Math.PI) * peakHeight;
    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;
    if (t < 1) requestAnimationFrame(update);
    else {
      ball.style.display = 'none';
      setHit(true);
      // calcula estrelas e avança nível
    }
  }
  requestAnimationFrame(update);
};
```

#### Sistema de Estrelas por Nível

```js
// 3 estrelas se não errou, 2 se errou 1, 1 se errou mais
const earnedStars = Math.max(1, 3 - wrong.length);
```

#### Persistência de Progresso

```js
// Carregar
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    setUnlockedLevel(data.unlockedLevel || 1);
    setStarsByLevel(data.starsByLevel || Array(LEVELS.length).fill(0));
    setScore(data.score || 0);
  }
}, []);

// Salvar
useEffect(() => {
  if (gameState !== 'cover') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlockedLevel, starsByLevel, score }));
  }
}, [unlockedLevel, starsByLevel, score]);
```

#### Representação Visual de Quantidades

```jsx
const VisualItems = ({ count }) => {
  if (count >= 10) {
    return (
      <div className="flex flex-wrap justify-center gap-1 max-w-[120px]">
        {Array.from({ length: Math.floor(count/10) }).map((_, i) => <span key={`t-${i}`}>🧰</span>)}
        {Array.from({ length: count % 10 }).map((_, i) => <span key={`o-${i}`}>🪙</span>)}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap justify-center gap-1 max-w-[120px]">
      {Array.from({ length: count }).map((_, i) => <span key={i}>💎</span>)}
    </div>
  );
};
```

### Fluxo de telas

`cover` → `selection` (mapa de níveis) → `playing` → `level_complete`

---

## 3. Defesa do Castelo Matemático

**Pasta:** `Defesa do Castelo Matematico/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Adição e Subtração
**Fases:** 12 níveis (torres)
**Persistência:** `localStorage` (chave `math_castle_cannon_v3`)

### Descrição

Jogo de defesa: o jogador resolve equações antes que lobos atravessem o timer e destruam o castelo. O timer é uma barra que esvazia; os lobos avançam proporcionalmente ao tempo restante. Erros aumentam o tamanho visual dos lobos e reduzem o tempo.

### Mecânicas

#### Timer + Avanço dos Lobos

```js
function startTimer() {
  if(timerInterval) clearInterval(timerInterval);
  const bar = document.getElementById('timer-bar');
  const wolves = document.getElementById('wolf-pack');

  timerInterval = setInterval(() => {
    if(isLocked) return;
    timeLeft -= 0.5;
    bar.style.width = timeLeft + '%';

    const advance = (100 - timeLeft) * 0.7;
    wolves.style.right = advance + '%';

    if(timeLeft <= 0) {
      clearInterval(timerInterval);
      destroyCastle();
    }
  }, 150);
}
```

#### Validação com Penalidade de Erro

```js
function checkAnswer(selected, correct, btn) {
  if(isLocked) return;
  if(selected === correct) {
    isLocked = true;
    clearInterval(timerInterval);
    SFX.correct();
    animateCannonShot();
    score += 10 + Math.floor(timeLeft / 10);
  } else {
    tries++;
    SFX.wrong();
    wolfScale += 0.4;
    const wolves = document.getElementById('wolf-pack');
    wolves.style.transform = `scale(${wolfScale})`;
    btn.style.opacity = '0.3';
    btn.disabled = true;
    timeLeft = Math.max(0, timeLeft - 20); // penalidade de tempo
  }
}
```

#### Animação Parabólica do Canhão (Vanilla JS)

```js
function animateCannonShot() {
  const cannon = document.getElementById('cannon');
  const ball = document.getElementById('cannon-ball');
  const wolves = document.getElementById('wolf-pack');
  const cannonRect = cannon.getBoundingClientRect();
  const wolfRect = wolves.getBoundingClientRect();
  const startX = cannonRect.right - 20;
  const startY = cannonRect.top + 5;
  const endX = wolfRect.left + (wolfRect.width / 2);
  const endY = wolfRect.top + (wolfRect.height / 2);

  cannon.style.transform = 'rotate(-35deg)';

  setTimeout(() => {
    ball.style.display = 'block';
    const duration = 800;
    const startTimestamp = performance.now();
    const height = 180;

    function step(timestamp) {
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress - (Math.sin(progress * Math.PI) * height);
      ball.style.left = currentX + 'px';
      ball.style.top = currentY + 'px';
      if (progress < 1) requestAnimationFrame(step);
      else {
        ball.style.display = 'none';
        wolves.classList.add('defeated');
        setTimeout(() => endLevel(true), 1500);
      }
    }
    requestAnimationFrame(step);
  }, 300);
}
```

#### Sistema de Estrelas e Desbloqueio

```js
if(success) {
  let earned = tries === 0 ? 3 : tries === 1 ? 2 : 1;
  userData.stars[currentLevel] = Math.max(userData.stars[currentLevel], earned);
  userData.unlocked = Math.min(LEVELS.length, Math.max(userData.unlocked, currentLevel + 2));
  saveGame();
}
```

#### Geração de Opções com Distratores Aleatórios

```js
const ans = op === '+' ? a + b : a - b;
const options = new Set([ans]);
while(options.size < 3) {
  const fake = Math.max(0, ans + (Math.floor(Math.random() * 7) - 3));
  options.add(fake);
}
```

### Fluxo de telas

`home` → `levels` (grade de torres) → `game` (com modal de resultado overlay)

---

## 4. Detetives da Ortografia

**Pasta:** `Detetives da Ortografia/`
**Stack:** React 18
**Categoria:** Português — Ortografia
**Fases:** 12

### Descrição

Estruturalmente **idêntico** ao jogo Caçadores de Coletivos — mesmas 4 mecânicas (match, connect, intruder, sentence), mesma arquitetura de estados React, mesma lógica de `checkAnswer` e `handleConnectRight`. O que muda são os dados de conteúdo (foco em ortografia: X/CH, S/SS, G/J etc.) e a identidade visual (tema detetive, cores escuras).

### Mecânicas

As mesmas 4 mecânicas descritas em [Caçadores de Coletivos](#1-caçadores-de-coletivos). Apenas o conteúdo dos `LEVELS` difere.

**Exemplo de dado (Mecânica 1 — ortografia):**
```js
{ id: 1, type: 'match', target: 'CAI__A', answer: 'X',
  options: ['X', 'CH', 'SS'], emoji: '📦',
  instruction: 'É com X ou CH? Arraste a letra certa para consertar a palavra!' }
```

**Exemplo de dado (Mecânica 3 — palavra escrita errada):**
```js
{ id: 7, type: 'intruder',
  words: ['XÍCARA', 'ENXADA', 'XUVEIRO', 'CAIXA'],
  answer: 'XUVEIRO', emoji: '🚿',
  instruction: 'Qual dessas palavras está escrita ERRADA (é a intrusa)?' }
```

> **Nota para manutenção:** Este jogo é um fork temático de Caçadores de Coletivos. Qualquer bug corrigido na lógica de um deve ser verificado no outro.

---

## 5. Digitado (ABC Palavras Mágicas)

**Pasta:** `Digitado/`
**Stack:** React 18
**Categoria:** Português — Digitação/Escrita
**Fases:** 30 fases × 2 palavras = 60 palavras

### Descrição

O jogador digita palavras exibidas como emoji em um campo de texto. Dois modos: maiúsculas (Educação Infantil) e minúsculas (Ensino Fundamental). Exibe boletim com tempo por palavra ao fim de cada fase.

### Mecânicas

#### Digitação com Validação em Tempo Real

```js
const handleInputChange = (e) => {
  let text = e.target.value;
  if (level === 'infantil') {
    text = text.toUpperCase();
  } else {
    text = text.toLowerCase();
  }
  setInputValue(text);
  setIsError(false);

  const currentWord = phaseWords[currentWordIndex].word;
  const targetWord = level === 'infantil' ? currentWord.toUpperCase() : currentWord.toLowerCase();

  if (removeAccents(text) === removeAccents(targetWord)) {
    handleCorrectWord(targetWord, phaseWords);
  } else if (text.length >= targetWord.length) {
    setIsError(true);
  }
};
```

**Normalização de acentos (aceita versão sem acento):**
```js
const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};
```

#### Desbloqueio Progressivo de Fases

```js
const handleCorrectWord = (targetWord, phaseWords) => {
  const endTime = Date.now();
  const timeTaken = ((endTime - startTime) / 1000).toFixed(1);
  setMetrics(prev => [...prev, { word: targetWord, time: timeTaken }]);

  if (currentWordIndex + 1 < phaseWords.length) {
    setTimeout(() => {
      setInputValue('');
      setIsError(false);
      setCurrentWordIndex(prev => prev + 1);
    }, 300);
  } else {
    setTimeout(() => {
      if (currentPhase === unlockedPhases[level] && currentPhase < 8) {
        setUnlockedPhases(prev => ({ ...prev, [level]: prev[level] + 1 }));
      }
      setGameState('phaseComplete');
    }, 500);
  }
};
```

#### Barra de Progresso Visual com Traços

```jsx
<div className="flex space-x-2 mb-6">
  {currentItem.word.split('').map((_, i) => (
    <div key={i} className={`h-3 w-8 rounded-full transition-colors ${i < inputValue.length ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
  ))}
</div>
```

#### Foco Automático no Input

```js
useEffect(() => {
  if (gameState === 'playing' && inputRef.current) {
    inputRef.current.focus();
    setStartTime(Date.now());
  }
}, [currentWordIndex, gameState]);
```

### Fluxo de telas

`cover` → `levelSelect` (infantil/fundamental) → `phaseSelect` (mapa) → `playing` → `phaseComplete` (boletim)

---

## 6. Digite o Resultado

**Pasta:** `Digite o resultado/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Adição e Subtração
**Fases:** 12 níveis × N operações

### Descrição

O jogador digita o resultado de equações usando o teclado físico. Timer por questão que reseta a cada resposta. Modo Infantil exibe grupos de ícones visuais para contar. Estruturalmente muito similar à Galáxia da Matemática.

### Mecânicas

#### Captura de Teclado e Validação Progressiva

```js
window.addEventListener('keydown', (e) => {
  if (!document.getElementById('screen-game').classList.contains('active-screen') || !canType) return;

  if (e.key >= '0' && e.key <= '9') {
    typedInput += e.key;
    const slot = document.getElementById('answer-slot');
    slot.innerText = typedInput;

    const targetStr = currentOperation.result.toString();

    if (typedInput === targetStr) {
      canType = false;
      stopTimer();
      const display = document.getElementById('math-op-display');
      display.classList.add('correct-anim');
      setTimeout(nextPhase, 1500);
    } else if (typedInput.length >= targetStr.length) {
      display.classList.add('shake-anim');
      setTimeout(() => {
        display.classList.remove('shake-anim');
        typedInput = "";
        slot.innerText = "?";
      }, 500);
    }
  } else if (e.key === "Backspace") {
    typedInput = "";
    document.getElementById('answer-slot').innerText = "?";
  }
});
```

#### Geração Dinâmica de Operações

```js
function generateNewOperation() {
  const config = gameLevels[activeLevelIdx];
  const op = config.ops[Math.floor(Math.random() * config.ops.length)];
  let n1, n2, result;

  if (op === '+') {
    n1 = Math.floor(Math.random() * (config.maxVal - 1)) + 1;
    n2 = Math.floor(Math.random() * (config.maxVal - n1)) + 1;
    result = n1 + n2;
  } else {
    n1 = Math.floor(Math.random() * (config.maxVal - 1)) + 2;
    n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
    result = n1 - n2;
  }
  currentOperation = { n1, n2, op, result };
  typedInput = "";
  renderPhase();
}
```

#### Timer com Mudança de Cor

```js
function updateTimerUI() {
  const bar = document.getElementById('timer-bar');
  bar.style.width = `${timeLeft}%`;
  if (timeLeft > 50) bar.style.backgroundColor = '#10b981';
  else if (timeLeft > 20) bar.style.backgroundColor = '#facc15';
  else bar.style.backgroundColor = '#f43f5e';
}
```

#### Ajuda Visual (Modo Infantil)

```js
function createIconGroup(num, colorClass) {
  const group = document.createElement('div');
  group.className = `flex flex-wrap gap-1 border-2 border-dashed ${colorClass} p-2 rounded-xl min-w-[40px] justify-center`;
  for(let i=0; i<num; i++) {
    const span = document.createElement('span');
    span.className = "counter-icon";
    span.innerText = currentIcon;
    group.appendChild(span);
  }
  return group;
}
```

---

## 7. Duelo dos Monstros

**Pasta:** `Duelo dos Monstros/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Comparação de Números (>, <, =)
**Fases:** 12
**Persistência:** `localStorage` (chave `monstros_comparacao_v1`)

### Descrição

Dois monstros SVG gerados proceduralmente representam dois números. O jogador escolhe o símbolo correto (>, <, =) entre eles.

### Mecânicas

#### Monstros SVG Gerados Proceduralmente

```js
const MONSTERS = [
  (color) => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${color}"/>...</svg>`,
  (color) => `<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" rx="10" fill="${color}"/>...</svg>`,
  (color) => `<svg viewBox="0 0 100 100"><path d="M50 10 L90 90 L10 90 Z" fill="${color}"/>...</svg>`
];

// Na inicialização do nível:
const colors = ['#a855f7', '#f97316', '#22c55e', '#db2777', '#3b82f6'];
const m1 = MONSTERS[Math.floor(Math.random()*3)](colors[Math.floor(Math.random()*5)]);
const m2 = MONSTERS[Math.floor(Math.random()*3)](colors[Math.floor(Math.random()*5)]);
```

#### Validação da Comparação

```js
function checkChoice(symbol) {
  if(isLocked) return;
  const correct = LEVELS[currentLevelIdx].ans;

  if(symbol === correct) {
    isLocked = true;
    playSfx(880, 'sine', 0.3);
    const slot = document.getElementById('slot');
    slot.textContent = symbol;
    slot.classList.add('filled');
    stars[currentLevelIdx] = 1;
    unlocked = Math.max(unlocked, currentLevelIdx + 2);
    saveProgress();
    setTimeout(() => document.getElementById('result-modal').style.display = 'flex', 800);
  } else {
    playSfx(150, 'sawtooth', 0.2);
    const slot = document.getElementById('slot');
    slot.style.borderColor = 'var(--danger)';
    setTimeout(() => slot.style.borderColor = '', 400);
  }
}
```

#### Cenário com Estalactites Aleatórias

```js
function createScenery() {
  const container = document.getElementById('scenery');
  for(let i=0; i<15; i++) {
    const s = document.createElement('div');
    s.className = 'stalactite';
    s.style.left = Math.random() * 100 + '%';
    s.style.height = (20 + Math.random() * 60) + 'px';
    container.appendChild(s);
  }
}
```

---

## 8. Escola de Magia VSA

**Pasta:** `Escola de Magia VSA/`
**Stack:** React 18
**Categoria:** Português — Classes Gramaticais (Substantivo, Verbo, Adjetivo)
**Fases:** 12

### Descrição

Estruturalmente **idêntico** a Caçadores de Coletivos e Detetives da Ortografia. Mesmas 4 mecânicas, mesmo fluxo de estados React. O conteúdo ensina a distinguir Nomes (Substantivos), Ações (Verbos) e Qualidades (Adjetivos). Identidade visual: tema de escola de magia (roxo/fúcsia).

**Exemplo de dado:**
```js
{ id: 1, type: 'match', target: 'AÇÃO (VERBO)', answer: 'PULAR',
  options: ['PULAR', 'BOLA', 'TRISTE'], emoji: '🏃‍♂️',
  instruction: 'Qual destas palavras indica uma AÇÃO (algo que você faz)?' }
```

> Mesma lógica de `checkAnswer`, `handleConnectRight`, `handleWin`, drag & drop que os outros jogos da família de 4 mecânicas.

---

## 9. Fábrica de Rimas

**Pasta:** `Fábrica de Rimas/`
**Stack:** React 18
**Categoria:** Português — Rimas
**Fases:** 12

### Descrição

Estruturalmente **idêntico** à família de jogos de 4 mecânicas. O conteúdo foca em encontrar palavras que rimam. Identidade visual: tema industrial/fábrica (engrenagens, tons escuros).

**Exemplo de dado (Mecânica 4 — completar verso):**
```js
{ id: 10, type: 'sentence',
  preText: 'Lá na casa da vizinha, tem uma linda ',
  boldText: 'GATA',
  postText: '.',
  answer: 'GALINHA',
  options: ['GALINHA', 'PATA', 'CADELA'],
  instruction: 'Escolha a palavra que RIMA com "vizinha" para completar o poema!' }
```

**Animação de engrenagem no cabeçalho (CSS personalizado):**
```jsx
<span className="gear-anim">⚙️</span>
```

---

## 10. Fábrica de Acentos

**Pasta:** `Fabrica de Acentos/`
**Stack:** React 18
**Categoria:** Português — Acentuação
**Fases:** 7 fases × 5 palavras

### Descrição

O jogador arrasta o acento correto (´ agudo, ^ circunflexo, ~ til) para a letra correta da palavra. Nas fases 6 e 7, todas as letras têm uma dropzone individual — o jogador deve escolher a letra certa **e** o acento certo.

### Mecânicas

#### Mapa de Acentos

```js
const ACCENT_MAP = {
  'Á': { base: 'A', accent: '´' },
  'É': { base: 'E', accent: '´' },
  'Â': { base: 'A', accent: '^' },
  'Ê': { base: 'E', accent: '^' },
  'Ã': { base: 'A', accent: '~' },
  'Õ': { base: 'O', accent: '~' }
  // ...etc
};
```

#### Validação com Dupla Checagem (letra + acento)

```js
const checkAnswer = (accentSymbol, dropIndex) => {
  const wordArray = currentItem.word.split('');
  const targetIndex = wordArray.findIndex(char => ACCENT_MAP[char]);
  const targetChar = wordArray[targetIndex];
  const expectedAccent = ACCENT_MAP[targetChar].accent;

  const finalDropIndex = dropIndex !== undefined ? dropIndex
    : (currentPhase >= 6 ? selectedLetterIndex : targetIndex);

  // 1. Verifica se colocou na letra certa (importante para fases 6 e 7)
  if (finalDropIndex !== targetIndex) {
    setShakeIndex(finalDropIndex);
    setTimeout(() => setShakeIndex(null), 300);
    return;
  }

  // 2. Verifica se escolheu o acento certo
  if (accentSymbol === expectedAccent) {
    setIsSuccess(true);
    // avança palavra...
  } else {
    setWrongAnswers(prev => [...prev, accentSymbol]);
    setShakeIndex(targetIndex);
    setTimeout(() => setShakeIndex(null), 300);
  }
};
```

#### Drag & Drop por Letra Individual (Fases 6 e 7)

```js
const handleDragOverLetter = (e, index) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (dragOverIndex !== index) setDragOverIndex(index);
};

const handleDropLetter = (e, index) => {
  e.preventDefault();
  setDragOverIndex(null);
  const droppedSymbol = e.dataTransfer.getData('text/plain');
  if (droppedSymbol) checkAnswer(droppedSymbol, index);
};

// Click como fallback (toque em tablet)
const handleLetterClick = (index) => {
  if (currentPhase >= 6 && !isSuccess) setSelectedLetterIndex(index);
};
```

#### Renderização da Palavra Letra a Letra

```jsx
{wordArray.map((char, index) => {
  const isTarget = index === targetIndex;
  const showDropzone = currentPhase >= 6 || isTarget;
  if (showDropzone) {
    return (
      <div key={index}
           onDragOver={(e) => handleDragOverLetter(e, index)}
           onDrop={(e) => handleDropLetter(e, index)}
           onClick={() => handleLetterClick(index)}>
        {/* Dropzone acima da letra */}
        <div className="w-12 h-12 border-4 border-dashed rounded-xl">...</div>
        {/* Letra base (sem acento) */}
        <div className="bg-white rounded-xl">{isSuccessThisBox ? char : targetData.base}</div>
      </div>
    );
  }
  // Letras que não precisam de acento: renderiza normalmente
  return <div key={index} className="bg-white rounded-xl">{char}</div>;
})}
```

---

## 11. Galáxia da Matemática

**Pasta:** `Galáxia da Matemática/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Adição e Subtração
**Fases:** 12 setores × N missões

### Descrição

Estruturalmente **idêntico** a "Digite o Resultado" (mesma lógica de digitação por teclado, timer, geração de operações, modo infantil com ícones). A diferença é a identidade visual (tema espacial) e uma **animação de transição entre setores** com foguete voando.

### Mecânicas

As mesmas de [Digite o Resultado](#6-digite-o-resultado). Diferencial exclusivo:

#### Animação de Transição com Foguete

```js
function startTransition() {
  const transitionScreen = document.getElementById('screen-transition');
  const rocket = document.getElementById('transition-rocket');
  const planet = document.getElementById('target-planet');

  planet.innerText = spacePlanets[Math.floor(Math.random() * spacePlanets.length)];
  transitionScreen.classList.remove('hidden');
  rocket.classList.remove('rocket-flying');
  void rocket.offsetWidth; // força reflow para reiniciar animação CSS
  rocket.classList.add('rocket-flying');

  setTimeout(() => {
    transitionScreen.classList.add('hidden');
    showScreen('screen-game');
    generateNewOperation();
  }, 2000);
}
```

**Nota:** A animação do foguete só ocorre ao clicar "Próximo Setor" no modal — não entre missões normais do mesmo setor.

---

## 12. Galáxia dos Opostos

**Pasta:** `Galaxia dos Opostos/`
**Stack:** React 18
**Categoria:** Português — Antônimos
**Fases:** 12

### Descrição

Estruturalmente **idêntico** à família de jogos de 4 mecânicas. O conteúdo foca em antônimos (palavras opostas). Identidade visual: tema espacial (estrelas, galáxia, roxo/rosa).

**Exemplo de dado:**
```js
{ id: 10, type: 'sentence',
  preText: 'O elefante é um animal muito ',
  boldText: 'PEQUENO',
  postText: '.',
  answer: 'GRANDE',
  options: ['GRANDE', 'MINÚSCULO', 'LEVE'],
  instruction: 'Troque a palavra errada pelo seu OPOSTO para a frase fazer sentido!' }
```

---

## 13. Laboratório das Poções

**Pasta:** `Laboratorio das Pocoes/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Adição e Subtração
**Fases:** 12
**Persistência:** `localStorage` (chave `math_alchemy_v1`)

### Descrição

O jogador escolhe o ingrediente (número) correto. Ao acertar, uma animação de ingrediente voando em parábola até o frasco alvo. Ao errar, o ingrediente "foge" em direção aleatória. Sistema de 3 estrelas por tentativas.

### Mecânicas

#### Animação de Ingrediente Voando (Web Animations API)

```js
function checkAnswer(selected, correct, btn) {
  const rect = btn.getBoundingClientRect();
  const flying = document.createElement('div');
  flying.className = 'flying-ingredient';
  flying.textContent = selected;
  flying.style.left = rect.left + 'px';
  flying.style.top = rect.top + 'px';
  document.body.appendChild(flying);

  if(selected === correct) {
    const target = document.getElementById('target-flask');
    const targetRect = target.getBoundingClientRect();

    // Parábola de acerto
    flying.animate([
      { left: rect.left + 'px', top: rect.top + 'px', transform: 'rotate(0deg) scale(1)' },
      { left: targetRect.left + 'px', top: targetRect.top + 'px', transform: 'rotate(720deg) scale(0.8)' }
    ], { duration: 700, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' })
    .onfinish = () => {
      target.textContent = selected;
      target.classList.add('filled');
      flying.remove();
      setTimeout(() => endLevel(true), 800);
    };
  } else {
    // Foge em direção aleatória
    const randomX = (Math.random() - 0.5) * 800;
    flying.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${randomX}px, -400px) scale(0)`, opacity: 0 }
    ], { duration: 1000, easing: 'ease-in' })
    .onfinish = () => flying.remove();

    btn.style.opacity = '0.3';
    btn.disabled = true;
  }
}
```

#### Sistema de Estrelas por Tentativas

```js
if(success) {
  let earned = tries === 1 ? 3 : tries === 2 ? 2 : 1;
  userData.stars[currentLevel] = Math.max(userData.stars[currentLevel], earned);
  userData.unlocked = Math.max(userData.unlocked, currentLevel + 2);
  saveGame();
}
```

#### Cenário com Faíscas Animadas

```js
function createScenery() {
  const container = document.getElementById('scenery');
  for(let i=0; i<40; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    const size = 2 + Math.random() * 4;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.top = Math.random() * 100 + '%';
    s.style.left = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 3 + 's';
    container.appendChild(s);
  }
}
```

---

## 14. Maiúsculo vs Minúsculo

**Pasta:** `Maisculo vs Minusculo/`
**Stack:** React 18
**Categoria:** Português — Letras Maiúsculas e Minúsculas
**Fases:** 5 fases × 5–6 letras

### Descrição

O jogador arrastra (ou clica) a letra correta para uma caixinha. Dois modos: encontrar a minúscula de uma maiúscula, ou vice-versa. As opções incluem distratores cuidadosamente escolhidos (ex: b/d/p/q para a letra B).

### Mecânicas

#### Dicionário com Distratores Pedagógicos

```js
const ALPHABET_DATA = [
  { u: 'A', l: 'a', d_u: ['E', 'O', 'R'], d_l: ['e', 'o', 'c'] },
  { u: 'B', l: 'b', d_u: ['D', 'P', 'R'], d_l: ['d', 'p', 'q'] }, // Clássica confusão b/d/p/q
  { u: 'M', l: 'm', d_u: ['N', 'W', 'H'], d_l: ['n', 'w', 'u'] }, // Confusão m/n/w
  // ...26 letras completas
];
```

#### Geração de Opções Embaralhadas

```js
const generateOptions = (letterData, currentMode) => {
  let correctAns, distractors;
  if (currentMode === 'upperToLower') {
    correctAns = letterData.l;
    distractors = [...letterData.d_l];
  } else {
    correctAns = letterData.u;
    distractors = [...letterData.d_u];
  }
  const selectedDistractors = HY.shuffle(distractors).slice(0, 2);
  const finalOptions = HY.shuffle([correctAns, ...selectedDistractors]);
  setOptions(finalOptions);
  setWrongAnswers([]);
  setIsSuccess(false);
};
```

#### Drag & Drop com Feedback Visual

```js
const handleDrop = (e) => {
  e.preventDefault();
  setIsDragOver(false);
  const droppedOption = e.dataTransfer.getData('text/plain');
  if (droppedOption) checkAnswer(droppedOption);
};
```

**Dropzone com estados visuais:**
```jsx
<div
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  className={`rounded-[2rem] border-8 transition-all ${
    isSuccess ? 'bg-green-400 border-green-500 scale-110'
    : isDragOver ? 'bg-sky-100 border-sky-400 border-dashed scale-105'
    : 'bg-sky-50 border-sky-300 border-dashed'
  }`}
>
  {isSuccess ? (
    <span>{correctMatchDisplay}</span>
  ) : (
    <span className="opacity-50">?</span>
  )}
</div>
```

---

## 15. Matemática Pirata

**Pasta:** `Matematica Pirata/`
**Stack:** React 18
**Categoria:** Matemática — Adição, Subtração e Álgebra Inicial
**Fases:** 15

### Descrição

Jogo de operações matemáticas com representação visual de quantidades. Inclui mecânica de **parcela oculta** (álgebra inicial) e agrupamento em dezenas (Base 10 com baús = 10). O jogador arrasta ou clica no número correto.

### Mecânicas

#### Parcela Oculta (Álgebra Inicial)

```js
// Configuração: 'unknown' indica qual valor está oculto
{ id: 11, n1: 3, n2: 5, op: '+', answer: 8, options: [5, 4, 6], emoji: '🦜', unknown: 'n2' }

// Validação dinâmica baseada no campo oculto
const checkAnswer = (value) => {
  const expectedValue = level[level.unknown || 'answer'];
  if (value === expectedValue) { /* acerto */ }
};
```

#### Representação Visual com Agrupamento em Dezenas

```jsx
const RenderVisualItems = ({ count, emoji }) => {
  if (count >= 10) {
    const tens = Math.floor(count / 10);
    const ones = count % 10;
    return (
      <div>
        <div className="flex gap-1">
          {Array.from({ length: tens }).map((_, i) => (
            <span key={`t-${i}`} title="1 Baú = 10">🧰</span>
          ))}
        </div>
        {ones > 0 && (
          <div>
            {Array.from({ length: ones }).map((_, i) => (
              <span key={`o-${i}`}>{emoji}</span>
            ))}
          </div>
        )}
      </div>
    );
  }
  // Grade normal para < 10: cols dinâmicas
  return (
    <div className={`grid ${count <= 4 ? 'grid-cols-2' : count <= 6 ? 'grid-cols-3' : 'grid-cols-3'}`}>
      {Array.from({ length: count }).map((_, i) => <span key={i}>{emoji}</span>)}
    </div>
  );
};
```

#### Dropzone Dinâmica (mostra a caixa correta para o valor oculto)

```jsx
const Dropzone = () => {
  const expectedValue = level[level.unknown || 'answer'];
  return (
    <div onDragOver={handleDragOver} onDrop={handleDrop}
         className={`rounded-3xl border-4 w-28 h-28 ${isSuccess ? 'bg-green-400' : 'bg-white border-dashed'}`}>
      {isSuccess ? <span>{expectedValue}</span> : <span className="opacity-40">?</span>}
    </div>
  );
};
```

---

## 16. Mercado Alien

**Pasta:** `Mercado Alien/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Comparação de Números (>, <, =)
**Fases:** 12 níveis × 10 problemas

### Descrição

Comparação de números com tema espacial/alien. Diferencial: inclui comparação de **expressões** (ex: `12+3` vs `18`) nos níveis mais difíceis. Sistema de **3 vidas (escudos)** — o jogador pode errar até 3 vezes antes de game over.

### Mecânicas

#### Geração com Expressões (Níveis Complexos)

```js
function generateProblem() {
  const config = levels[activeLevelIdx];
  if (config.complex && Math.random() > 0.6) {
    // Desafio de Soma Simples vs Número
    const n1 = Math.floor(Math.random() * (config.range / 2)) + 5;
    const n2 = Math.floor(Math.random() * 10) + 1;
    v1 = n1 + n2;
    displayV1 = `${n1}+${n2}`; // mostra a expressão
    v2 = Math.floor(Math.random() * config.range) + 10;
    displayV2 = v2;
  } else {
    // Comparação pura
    v1 = Math.floor(Math.random() * config.range) + 1;
    v2 = Math.floor(Math.random() * config.range) + 1;
    if(Math.random() < 0.15) v2 = v1; // permite igualdade
    displayV1 = v1;
    displayV2 = v2;
  }
  // Calcula sinal correto
  if (v1 < v2) correct = '<';
  else if (v1 === v2) correct = '=';
  else correct = '>';
}
```

#### Sistema de Vidas (Escudos)

```js
function checkAnswer(choice) {
  if (!canInteract) return;
  canInteract = false;
  stopTimer();

  if (choice === currentProblem.correct) {
    // acerto...
    setTimeout(nextPhase, 1200);
  } else {
    shields--;
    updateShieldsUI();
    setTimeout(() => {
      if (shields <= 0) {
        document.getElementById('game-over-modal').classList.remove('hidden');
      } else {
        canInteract = true;
        resetTimer();
      }
    }, 800);
  }
}

function updateShieldsUI() {
  const container = document.getElementById('shields-ui');
  container.innerHTML = '';
  for(let i=0; i<3; i++) {
    container.innerHTML += i < shields ? '<span>🔋</span>' : '<span class="opacity-30 grayscale">🪫</span>';
  }
}
```

---

## 17. Mercado Maior ou Menor

**Pasta:** `Mercado Maior ou Menor/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Comparação de Tamanhos
**Fases:** 12
**Persistência:** `localStorage` (chave `mercado_gigantes_v1`)

### Descrição

O jogador escolhe o objeto maior ou menor entre 2–3 opções, cujos tamanhos são representados visualmente por SVGs escalados proporcionalmente ao valor configurado. Conceito: comparação visual antes de números.

### Mecânicas

#### SVGs Escalados pelo Valor

```js
const TYPES = {
  fruit: (size) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
    <circle cx="50" cy="55" r="40" fill="#ef4444"/>...</svg>`,
  bread: (size) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100">...</svg>`,
  // ...
};

// Dados de nível: val = tamanho do SVG em pixels
{ id: 1, type: 'fruit', task: 'maior',
  items: [{val: 40, label: 'Pequena'}, {val: 100, label: 'Grande'}] }
```

#### Determinação da Resposta Correta

```js
function startLevel(idx) {
  const lvl = LEVELS[idx];
  const targetVal = lvl.task === 'maior'
    ? Math.max(...lvl.items.map(i => i.val))
    : Math.min(...lvl.items.map(i => i.val));

  lvl.items.forEach(item => {
    const box = document.createElement('div');
    box.innerHTML = `<div>${TYPES[lvl.type](item.val)}</div>`;
    box.onclick = () => handleChoice(box, item.val === targetVal);
    area.appendChild(box);
  });
}
```

#### Feedback Visual de Acerto

```js
function handleChoice(el, isCorrect) {
  if(isLocked) return;
  if(isCorrect) {
    isLocked = true;
    el.style.transform = 'scale(1.3) translateY(-20px)';
    const visual = el.querySelector('.item-visual');
    visual.style.filter = 'drop-shadow(0 0 20px gold)';
    // salva e avança
  } else {
    el.style.animation = 'shake 0.4s';
    setTimeout(() => el.style.animation = '', 400);
  }
}
```

---

## 18. Organiza Tudo

**Pasta:** `Organiza Tudo/`
**Stack:** React 18
**Categoria:** Lógica — Classificação e Categorização
**Fases:** 6

### Descrição

O jogador arrasta (ou toca) emojis para as caixas corretas por cor, forma, tema, natureza, roupa ou tipo de comida. Todas as 9 peças precisam ser alocadas corretamente para completar a fase.

### Mecânicas

#### Drag & Drop com Fallback de Clique

```js
// Iniciar arrasto
const onDragStart = (e, item) => {
  setDraggedItem(item);
  setSelectedItem(item);
  e.dataTransfer.setData('application/json', JSON.stringify(item));
};

// Soltar na zona
const onDrop = (e, zoneId) => {
  e.preventDefault();
  setDragOverZone(null);
  try {
    const itemData = e.dataTransfer.getData('application/json');
    if (itemData) {
      const item = JSON.parse(itemData);
      handleAttempt(item, zoneId);
    } else if (draggedItem) {
      handleAttempt(draggedItem, zoneId);
    }
  } catch (err) {
    if (draggedItem) handleAttempt(draggedItem, zoneId);
  }
  setDraggedItem(null);
};

// Fallback: clique no item → clique na zona
const handleItemClick = (item) => setSelectedItem(item);
const handleZoneClick = (zoneId) => {
  if (selectedItem) handleAttempt(selectedItem, zoneId);
};
```

#### Validação e Verificação de Conclusão

```js
const handleAttempt = (item, zoneId) => {
  if (!item) return;
  if (item.category === zoneId) {
    setSortedItems(prev => ({ ...prev, [zoneId]: [...prev[zoneId], item] }));
    setPendingItems(prev => {
      const newPending = prev.filter(i => i.id !== item.id);
      if (newPending.length === 0) {
        setTimeout(() => {
          if (currentLevel.id === unlockedLevels && currentLevel.id < LEVELS.length) {
            setUnlockedLevels(prev => prev + 1);
          }
          setGameState('levelComplete');
        }, 800);
      }
      return newPending;
    });
    setSelectedItem(null);
  } else {
    setShakeZone(zoneId);
    setTimeout(() => setShakeZone(null), 400);
    setSelectedItem(null);
  }
};
```

---

## 19. Piratas do Troco

**Pasta:** `Piratas do Troco/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Subtração / Troco
**Fases:** 12

### Descrição

Jogo em duas fases por nível: (1) o jogador clica nas moedas para "gastar" o valor do custo; (2) arrasta ou clica as moedas restantes para o baú como "troco". Ensina subtração de forma concreta e manipulável.

### Mecânicas

#### Fase 1 — Gastar Moedas (Clique)

```js
function handleCoinClick(el, target) {
  if(!isComplete) {
    if(el.classList.contains('spent')) return;
    el.classList.add('spent');
    spentCount++;
    updateCounter(target);
    if(spentCount === target) {
      isComplete = true;
      prepareChestPhase();
    }
  } else {
    // Fase 2: seleciona moeda para o baú
    document.querySelectorAll('.coin').forEach(c => c.classList.remove('selected'));
    selectedCoin = el;
    el.classList.add('selected');
  }
}
```

#### Fase 2 — Guardar Troco no Baú (Drag & Drop + Click)

```js
function prepareChestPhase() {
  const [cost, total] = LEVELS[currentLevelIdx];
  const remaining = total - cost;
  document.getElementById('equation-display').textContent = `${total} - ${cost} = ${remaining}`;
  document.getElementById('chest-zone').classList.add('active');
  // Ativa drag nas moedas não gastas
  const coins = document.querySelectorAll('.coin:not(.spent)');
  coins.forEach(c => {
    c.classList.add('locked');
    c.setAttribute('draggable', 'true');
  });
}

function moveToChest(el) {
  el.classList.add('spent');
  el.classList.remove('selected');
  chestCount++;
  updateCounter();
  const [cost, total] = LEVELS[currentLevelIdx];
  const remaining = total - cost;
  if(chestCount === remaining) setTimeout(showVictory, 600);
}
```

---

## 20. Sinônimos

**Pasta:** `Sinonimos/`
**Stack:** React 18
**Categoria:** Português — Sinônimos
**Fases:** 12

### Descrição

Estruturalmente **idêntico** à família de jogos de 4 mecânicas. Conteúdo: encontrar palavras que significam o mesmo. Identidade visual: tema selva/aventura.

**Exemplo de dado:**
```js
{ id: 7, type: 'intruder',
  words: ['LINDO', 'BONITO', 'BELO', 'FEIO'],
  answer: 'FEIO', emoji: '🕵️‍♂️',
  instruction: 'Atenção! Clique na palavra INTRUSA (a que é diferente das outras)!' }
```

---

## 21. Trem da Soma e Subtração

**Pasta:** `Trem da Soma e Subtracao/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Adição e Subtração
**Fases:** 12
**Persistência:** `localStorage` (chave `math_train_v4`)

### Descrição

O trem exibe a equação em vagões. O jogador clica na resposta correta; o número voa em parábola até o vagão "?". Timer de 30 segundos por questão. Sistema de 3 estrelas baseado em acertos e tempo.

### Mecânicas

#### Número Voando para o Vagão (Web Animations API)

```js
function checkAnswer(selected, correct, btn, event) {
  const rect = btn.getBoundingClientRect();
  const flying = document.createElement('div');
  flying.className = 'flying-num';
  flying.textContent = selected;
  flying.style.left = rect.left + 'px';
  flying.style.top = rect.top + 'px';
  document.body.appendChild(flying);

  if(selected === correct) {
    const target = document.getElementById('target-wagon');
    const targetRect = target.getBoundingClientRect();

    flying.animate([
      { left: rect.left + 'px', top: rect.top + 'px', transform: 'scale(1)' },
      { left: targetRect.left + 'px', top: targetRect.top + 'px', transform: 'scale(0.8)' }
    ], { duration: 600, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' })
    .onfinish = () => {
      target.textContent = selected;
      target.classList.add('filled');
      flying.remove();
      setTimeout(() => endLevel(true), 600);
    };
    score += 10 + Math.floor(timeLeft / 2); // bônus por tempo
  } else {
    // Número cai em direção aleatória
    const randomX = (Math.random() - 0.5) * 1000;
    const randomRot = (Math.random() - 0.5) * 1000;
    flying.animate([
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${randomX}px, 800px) rotate(${randomRot}deg)`, opacity: 0 }
    ], { duration: 1000, easing: 'ease-in' })
    .onfinish = () => flying.remove();
    btn.style.opacity = '0.3';
    btn.disabled = true;
  }
}
```

#### Sistema de Estrelas Composto (Acertos + Tempo)

```js
let earned = (tries === 1 && timeLeft > 15) ? 3
  : (tries <= 2 && timeLeft > 5) ? 2
  : 1;
```

#### SVG do Trem Embutido

```js
const SVG_ENGINE = `
  <svg class="svg-icon" viewBox="0 0 100 100">
    <rect x="10" y="40" width="70" height="40" fill="#ef4444" rx="5"/>
    <rect x="50" y="20" width="25" height="30" fill="#ef4444" rx="2"/>
    <rect x="55" y="10" width="10" height="15" fill="#334155"/>
    <circle cx="25" cy="85" r="10" fill="#334155" stroke="white" stroke-width="2"/>
    <circle cx="65" cy="85" r="10" fill="#334155" stroke="white" stroke-width="2"/>
    <rect x="15" y="45" width="20" height="20" fill="#93c5fd" rx="2"/>
  </svg>`;
```

---

## 22. Monster Typer I

**Pasta:** `monster_typer I/`
**Stack:** Vanilla JS
**Categoria:** Português — Alfabeto e Digitação
**Fases:** 3 níveis × 40 fases cada (embaralhadas)
**Persistência:** `localStorage` (chave `mt1_unlockedLevels`)

### Descrição

O jogador vê um emoji e o nome de um objeto; deve pressionar a tecla correspondente à **letra inicial** da palavra. As fases são embaralhadas a cada início de nível. Timer de 10 segundos por fase.

### Mecânicas

#### Captura de Teclado e Comparação com Letra Inicial

```js
window.addEventListener('keydown', (e) => {
  if (!document.getElementById('screen-game').classList.contains('active-screen') || !canType) return;

  const typedKey = e.key.toUpperCase();
  const targetKey = currentPhases[activePhaseIdx].letter.toUpperCase();
  const bigLetter = document.getElementById('big-letter-display');

  if (typedKey === targetKey) {
    canType = false;
    stopTimer();
    bigLetter.classList.add('correct-anim');
    bigLetter.style.color = '#22c55e';
    setTimeout(nextPhase, 1100);
  } else {
    if (e.key.length === 1 && /[a-zA-Záàâãéèêíïóôõúüç]/.test(e.key)) {
      HY.shake(bigLetter); // utilitário compartilhado
    }
  }
});
```

#### Embaralhamento das Fases por Nível

```js
function startLevel(index) {
  activeLevelIdx = index;
  activePhaseIdx = 0;
  currentPhases = HY.shuffle(gameData[index].phases); // embaralha no início
  showScreen('screen-game');
  initPhase();
}
```

#### Dois Modos de Exibição

```js
if (gameMode === 'infantil') {
  bigLetter.innerText = data.letter.toUpperCase();
  wordName.innerText = data.word.toUpperCase();
} else {
  bigLetter.innerText = data.letter.toUpperCase() + " " + data.letter.toLowerCase();
  const wordLower = data.word.charAt(0).toUpperCase() + data.word.slice(1).toLowerCase();
  wordName.innerText = wordLower;
}
```

---

## 23. Monster Typer II

**Pasta:** `monster_typer II/`
**Stack:** Vanilla JS
**Categoria:** Português — Digitação de Palavras Completas

### Descrição

O jogador digita palavras completas letra por letra. Cada letra correta é destacada; erros piscam os olhos do monstro de vermelho. Timer vertical que esvazia. A cada 50 pontos, avança de nível. Dificuldade aumenta com o nível (timer mais rápido).

### Mecânicas

#### Digitação Letra a Letra com Feedback Visual

```js
window.addEventListener('keydown', (e) => {
  if (!gameActive) return;
  const key = e.key.toUpperCase();
  if (!/^[A-Z]$/.test(key)) return;

  if (key === currentWord[typedIndex]) {
    typedIndex++;
    renderWord();
    monsterSvg.style.transform = "scale(1.1)";
    setTimeout(() => monsterSvg.style.transform = "scale(1)", 100);
    if (typedIndex === currentWord.length) wordComplete();
  } else {
    // Feedback de erro: olhos vermelhos
    wordContainer.classList.add('shake-ui');
    setTimeout(() => wordContainer.classList.remove('shake-ui'), 300);
    document.getElementById('eye-l').style.fill = "#ef4444";
    document.getElementById('eye-r').style.fill = "#ef4444";
    setTimeout(() => {
      document.getElementById('eye-l').style.fill = "#2563eb";
      document.getElementById('eye-r').style.fill = "#2563eb";
    }, 400);
  }
});
```

#### Renderização da Palavra com Classes por Estado

```js
function renderWord() {
  wordContainer.innerHTML = '';
  for (let i = 0; i < currentWord.length; i++) {
    const span = document.createElement('span');
    span.innerText = currentWord[i];
    span.className = `letter-slot ${i < typedIndex ? 'letter-correct' : 'letter-pending'}`;
    wordContainer.appendChild(span);
  }
}
```

#### Dificuldade Progressiva por Nível

```js
function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 100;
  // Velocidade aumenta com o nível
  const speed = 100 + (level * 2);
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    timeLeft -= 0.5;
    updateTimerUI();
    if (timeLeft <= 0) handleTimeOut();
  }, 100);
}
```

---

## 24. Syllables (Sílabas)

**Pasta:** `syllables/`
**Stack:** Vanilla JS
**Categoria:** Português — Divisão Silábica
**Fases:** 36 (12 Fácil, 12 Médio, 12 Difícil)

### Descrição

O jogador arrasta (ou clica) sílabas embaralhadas para os slots corretos, montando a palavra. Barra de progresso global acumulada. Três dificuldades: 2, 3 e 4 sílabas.

### Mecânicas

#### Drag & Drop de Sílabas para Slots

```js
slot.ondrop = (e) => {
  const text = e.dataTransfer.getData('text');
  const id = e.dataTransfer.getData('id');
  handleSyllablePlacement(slot, text, id);
};

function handleSyllablePlacement(slot, text, id) {
  const index = parseInt(slot.dataset.index);
  const target = slot.dataset.target;

  if (text === target) {
    // Acerto: slot vira verde, sílaba some do banco
    slot.innerText = text;
    slot.className = 'slot ... correct shadow-lg';
    const syllableEl = document.getElementById(id);
    if (syllableEl) syllableEl.style.visibility = 'hidden';
    syllableState[index] = text;
    checkWin();
  } else {
    // Erro: slot pisca vermelho e volta ao estado anterior
    slot.innerText = text;
    slot.className = 'slot ... incorrect shadow-lg';
    setTimeout(() => {
      if (!syllableState[index]) {
        slot.innerText = oldText;
        slot.className = oldClass;
      }
    }, 600);
  }
}
```

#### Clique como Fallback (Toque em Mobile)

```js
box.onclick = (e) => {
  e.stopPropagation();
  if (selectedSyllable?.id === id) {
    deselectSyllable();
  } else {
    selectSyllable(box, syl, id);
  }
};

slot.onclick = () => {
  if (selectedSyllable) {
    handleSyllablePlacement(slot, selectedSyllable.text, selectedSyllable.id);
    deselectSyllable();
  }
};
```

#### Barra de Progresso Global Acumulada

```js
function updateProgressBar() {
  const correctInLevel = syllableState.filter(s => s !== null).length;
  const totalInLevel = syllableState.length;
  const baseProgress = (currentLevelIdx / 12) * 100;
  const subProgress = (correctInLevel / totalInLevel) * (100 / 12);
  const totalProgress = baseProgress + subProgress;
  document.getElementById('progress-bar').style.width = `${totalProgress}%`;
}
```

---

## 25. Vowel (Vogais)

**Pasta:** `vowel/`
**Stack:** Vanilla JS
**Categoria:** Português — Vogais
**Fases:** 3 níveis × 20 fases

### Descrição

O jogador identifica a vogal que completa uma palavra (lacuna no meio ou no fim). Botões físicos de A/E/I/O/U na tela. Suporte a teclado físico. Dois modos: infantil (maiúsculas) e fundamental (minúsculas com capitalização correta).

### Mecânicas

#### Validação de Vogal (Botão Virtual + Teclado)

```js
function checkVowel(vowel) {
  if (!canType) return;
  const data = gameData[activeLevelIdx].phases[activePhaseIdx];
  const gapEl = document.getElementById('word-gap');

  if (vowel === data.vowel) {
    canType = false;
    score++;
    // Formatação correta da vogal conforme modo
    let displayVowel = vowel;
    if(gameMode === 'fundamental' && data.prefix.length > 0) {
      displayVowel = vowel.toLowerCase();
    }
    gapEl.innerText = displayVowel;
    gapEl.classList.add('text-green-500', 'correct-anim');
    setTimeout(nextPhase, 1200);
  } else {
    HY.shake(gapEl); // tremida via utilitário compartilhado
  }
}

// Suporte a teclado físico
window.addEventListener('keydown', (e) => {
  const typedKey = e.key.toUpperCase();
  if (['A', 'E', 'I', 'O', 'U'].includes(typedKey)) {
    checkVowel(typedKey);
  }
});
```

#### Estrutura de Dados com Prefixo/Sufixo e Lacuna

```js
// Nível 1: vogal no fim
{ prefix: 'PIAN', vowel: 'O', suffix: '', emoji: '🎹' }

// Nível 2: vogal no meio
{ prefix: 'B', vowel: 'O', suffix: 'LA', emoji: '⚽' }

// Nível 3: lacuna pode ser qualquer posição
{ prefix: 'P', vowel: 'E', suffix: 'IXE', emoji: '🐟' }
```

#### Formatação por Modo

```js
function formatText(text) {
  if (!text) return "";
  if (gameMode === 'infantil') return text.toUpperCase();
  else return text.toLowerCase();
}
```

---

## 26. Mapa da Ilha do Tesouro

**Pasta:** `Mapa da Ilha do Tesouro/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Coordenadas e Orientação Espacial
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `mapa-ilha-tesouro`)

### Descrição

Mapa de tesouro num grid 6x6 com letras (linhas) e números (colunas). Nos desafios 1-3, o jogo mostra o emoji-alvo e o jogador deve clicar na célula certa do mapa e depois completar a coordenada (letra OU número, sorteado qual falta) digitando no teclado. Nos desafios 4-5 ("Rota do Pirata"), muda para um grid 8x8: um pirata aparece em uma célula aleatória, uma rota até um destino é sorteada e descrita como uma sequência de "cards de passo" (quantidade de casas + seta de direção); o jogador escolhe, entre 3 emojis, qual está esperando no destino da rota.

### Mecânicas

#### Geração da Rota como Segmentos Ortogonais Sem Revisitar Células

A rota é construída segmento a segmento: em cada passo sorteia uma direção (nunca igual à anterior, para sempre haver uma curva) e um comprimento de 1 a 3 casas, testando se o trecho fica dentro do grid e não passa por cima de nenhuma célula já usada.

```js
function generateRoutePath(segmentCount) {
    const start = {
        row: Math.floor(Math.random() * ROUTE_GRID_SIZE),
        col: Math.floor(Math.random() * ROUTE_GRID_SIZE)
    };
    const path = [start];
    const segments = [];
    let lastDir = null;

    for (let s = 0; s < segmentCount; s++) {
        const dirNames = HY.shuffle(Object.keys(ROUTE_DIRS).filter(d => d !== lastDir));
        let placed = false;

        for (const dir of dirNames) {
            const lengths = HY.shuffle([1, 2, 3]);
            for (const len of lengths) {
                const cells = [];
                let { row, col } = path[path.length - 1];
                let valid = true;
                for (let step = 0; step < len; step++) {
                    row += ROUTE_DIRS[dir].dr;
                    col += ROUTE_DIRS[dir].dc;
                    const outOfBounds = row < 0 || row >= ROUTE_GRID_SIZE || col < 0 || col >= ROUTE_GRID_SIZE;
                    const revisited = path.some(p => p.row === row && p.col === col) || cells.some(p => p.row === row && p.col === col);
                    if (outOfBounds || revisited) { valid = false; break; }
                    cells.push({ row, col });
                }
                if (valid) {
                    path.push(...cells);
                    segments.push({ dir, length: len });
                    lastDir = dir;
                    placed = true;
                    break;
                }
            }
            if (placed) break;
        }
        if (!placed) return null;
    }
    return { path, segments };
}
```

#### Reaproveitamento dos Ícones do Mapa da Trilha

Em vez de sortear um novo pool de emojis para a rota, o desafio reaproveita os mesmos ícones já usados no mapa 6x6 daquela trilha, mantendo consistência visual entre desafios da mesma sessão.

```js
const iconPool = mapIcons.map(m => m.icon);
const decorativeExtra = 1 + Math.floor(currentTrack / 4);
const chosenIconCount = Math.min(iconPool.length, 3 + decorativeExtra);
const chosenIcons = HY.rand.pick(iconPool, chosenIconCount);
```

#### Coordenada com Parte Sorteada para Ficar em Branco

A cada desafio de mapa, sorteia-se se a lacuna a completar é a letra da linha ou o número da coluna, capturando a tecla digitada diretamente via `keydown`.

```js
function onKeyDown(e) {
    if (!awaitingCoordInput) return;
    let typed, correct;
    if (missingPart === 'letter') {
        if (!/^[a-fA-F]$/.test(e.key)) return;
        typed = e.key.toUpperCase();
        correct = LETTERS[currentTarget.row];
    } else {
        if (!/^[1-6]$/.test(e.key)) return;
        typed = e.key;
        correct = String(currentTarget.col + 1);
    }
    checkCoordAnswer(typed === correct, typed);
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` (grid de 12 trilhas) → `screen-game`, que alterna internamente entre `.game-layout` (mapa 6x6 + coordenada, desafios 1-3) e `#route-challenge` (grid 8x8 + barra de passos + 3 respostas, desafios 4-5) → modal de resultado com estrelas → volta para `screen-tracks`.

---

## 27. Espelho Mágico

**Pasta:** `Espelho Magico/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Simetria e Reflexão Espacial
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `espelho-magico`)

### Descrição

Jogo de reflexão espelhada usando um banco fixo de 27 poliminos (tetrominós, pentominós e hexa/heptominós, coloridos célula a célula). Nos desafios 1-3 ("Tipo 1"), o jogador vê uma figura original ao lado de um espelho e escolhe, entre 3 cards, qual é o reflexo correto. Nos desafios 4-5 ("Tipo 2"), o jogador clica numa célula vazia da figura espelhada e depois na cor certa da paleta, com uma porcentagem de dicas (células já preenchidas) que diminui conforme a trilha avança.

### Mecânicas

#### Reflexão Geométrica Real por Coordenadas

O reflexo é calculado invertendo o índice de linha e/ou coluna de cada célula dentro dos limites da própria figura — não é uma simples troca de cor visual.

```js
function reflectInstance(instance, axis) {
    const cells = instance.cells.map(cell => {
        let nr = cell.r, nc = cell.c;
        if (axis === 'v' || axis === 'hv') nr = instance.rows - 1 - cell.r;
        if (axis === 'h' || axis === 'hv') nc = instance.cols - 1 - cell.c;
        return { r: nr, c: nc, color: cell.color };
    });
    return { rows: instance.rows, cols: instance.cols, cells };
}
```

#### Eixos Inválidos para Figuras de 1 Linha/Coluna

Uma peça com uma única linha ou coluna (como o tetrominó "I") teria um reflexo idêntico ao original em um dos eixos, o que colidiria com outra opção do Tipo 1. Esses eixos são descartados na hora de sortear o lado do espelho.

```js
function validSidesFor(def) {
    let sides = SIDES;
    if (def.rows === 1) sides = sides.filter(s => s !== 'top' && s !== 'bottom');
    if (def.cols === 1) sides = sides.filter(s => s !== 'left' && s !== 'right');
    return sides;
}
```

#### Porcentagem de Dicas Decrescente por Trilha (Tipo 2)

```js
function hintPercentForTrack(idx) {
    if (idx < 4) return 0.6;
    if (idx < 8) return 0.3;
    return 0;
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game`, alternando `#type1-area` (original + espelho + 3 cards de escolha) e `#type2-area` (original + figura espelhada parcialmente em branco + paleta de cores clicável) → modal de resultado → `screen-tracks`.

---

## 28. Gráfico em Ação

**Pasta:** `Grafico em Acao/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Leitura e Construção de Gráficos
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `grafico-em-acao`)

### Descrição

Uma "cena" de itens espalhados (ex: roupas de cores variadas) é exibida, e o jogador deve montar dois gráficos com a contagem correta — um por tipo de item, outro por cor. O tipo de gráfico muda por bloco de trilhas: barra vertical (1-3), barra horizontal (4-6), pizza (7-9) e gráfico de linha (10-12).

### Mecânicas

#### Tabela de Contingência Consistente entre os Dois Gráficos

Os totais "por tipo" e "por cor" precisam ser compatíveis com o mesmo conjunto de itens da cena. Uma partição aleatória gera os totais de cada eixo, e uma tabela de contingência distribui os itens de forma que ambas as somas fechem exatamente.

```js
function randomPartition(total, parts, min, max) {
    const arr = new Array(parts).fill(min);
    let remaining = total - min * parts;
    let guard = 0;
    while (remaining > 0 && guard < 10000) {
        const idx = Math.floor(Math.random() * parts);
        if (arr[idx] < max) { arr[idx]++; remaining--; }
        guard++;
    }
    return arr;
}

function buildContingencyTable(rowSums, colSums) {
    const rows = rowSums.length, cols = colSums.length;
    const table = Array.from({ length: rows }, () => new Array(cols).fill(0));
    const cs = colSums.slice();
    const rowOrder = HY.shuffle(rowSums.map((_, i) => i));
    rowOrder.forEach(r => {
        let remaining = rowSums[r];
        const colOrder = HY.shuffle(cs.map((_, i) => i));
        colOrder.forEach(c => {
            if (remaining <= 0) return;
            const take = Math.min(remaining, cs[c]);
            if (take > 0) { table[r][c] += take; cs[c] -= take; remaining -= take; }
        });
    });
    return table;
}
```

#### Gráfico de Pizza com Matemática Polar

Cada fatia é desenhada como um `path` SVG usando conversão de coordenadas polares para cartesianas.

```js
function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}
```

#### Overlay de Linha Calculado a Partir das Posições Renderizadas

No gráfico de linha, os pontos não são calculados matematicamente — a posição de cada "bolinha" é lida do DOM já renderizado (`getBoundingClientRect`) e usada para desenhar as linhas de conexão num `<svg>` sobreposto.

```js
function drawLineOverlay(container, key) {
    const row = container.querySelector('.track-row');
    const cols = [...row.querySelectorAll('.track-col')];
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    row.appendChild(svg);

    const points = [];
    cols.forEach((col, i) => {
        const val = values[key][i];
        if (val <= 0) return;
        const dot = col.querySelector('.cell.dot-active');
        if (!dot) return;
        const dotRect = dot.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        points.push({ x: dotRect.left - rowRect.left + dotRect.width / 2, y: dotRect.top - rowRect.top + dotRect.height / 2, color: panels[key][i].color });
    });
    // ... desenha <line> entre pontos consecutivos e um <circle> em cada ponto
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (cena de itens + 2 painéis dependentes do `chartType` da trilha) → modal de resultado → `screen-tracks`.

---

## 29. Qual é o próximo

**Pasta:** `Qual e o proximo/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Padrões e Rotação Geométrica
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `qual-e-o-proximo`)

### Descrição

Uma sequência de 4 a 8 cards mostra uma peça (poliminó colorido) girando sempre no mesmo incremento (90° ou 180°) a cada card. O jogador escolhe, entre 3 opções, qual card viria a seguir. Usa rotação geométrica real de coordenadas, não troca de cor entre casas fixas.

### Mecânicas

#### Rotação Real de 90° e 180° por Transformação de Coordenadas

```js
function rotate90(instance) {
    const cells = instance.cells.map(cell => ({
        r: cell.c,
        c: instance.rows - 1 - cell.r,
        color: cell.color
    }));
    return { rows: instance.cols, cols: instance.rows, cells };
}

function rotate180(instance) {
    const cells = instance.cells.map(cell => ({
        r: instance.rows - 1 - cell.r,
        c: instance.cols - 1 - cell.c,
        color: cell.color
    }));
    return { rows: instance.rows, cols: instance.cols, cells };
}
```

#### Mistura Garantida de Incrementos de 90° e 180° por Trilha

Para a trilha nunca sair inteira só com um tipo de giro, sorteia-se de antemão quantos dos 5 desafios usam 90° (2 ou 3) e embaralha a ordem.

```js
const ninetyCount = 2 + Math.floor(Math.random() * 2); // 2 ou 3
trackIncrements = HY.shuffle(
    Array(CHALLENGES_PER_TRACK).fill(0).map((_, i) => i < ninetyCount ? rotate90 : rotate180)
);
```

#### Distratoras sem Colisão Visual para Formas Simétricas

A segunda opção errada é um espelhamento (não uma rotação), mas formas simétricas podem gerar um espelho idêntico a uma opção já usada. Uma lista de candidatos alternativos é testada até achar uma opção genuinamente diferente.

```js
const usedKeys = states.concat([wrong1Instance]).map(instanceKey);
const candidates = [
    mirrorH(correctInstance),
    mirrorH(wrong1Instance),
    mirrorH(states[0]),
    rotateStep(rotateStep(wrong1Instance)),
    { rows: correctInstance.rows, cols: correctInstance.cols, cells: HY.shuffle(correctInstance.cells.map(c => c.color)).map((color, i) => ({ ...correctInstance.cells[i], color })) }
];
let wrong2Instance = candidates.find(cand => !usedKeys.includes(instanceKey(cand)));
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (sequência de cards + placeholder "?" + 3 opções) → modal de resultado → `screen-tracks`.

---

## 30. Fábrica das Formas

**Pasta:** `Fabrica das Formas/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Atributos e Transformações (Tamanho/Cor)
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `fabrica-das-formas`)

### Descrição

Uma "linha de montagem" mostra uma corrente de 4 a 6 figuras da mesma forma, cada uma diferindo da anterior em tamanho e/ou cor. O jogador arrasta cards de ação ("Aumentar", "Diminuir", cores) para os espaços entre as figuras, descrevendo a transformação correta. Esta implementação também serve de referência para o padrão de drag-and-drop via Pointer Events reutilizado em outros jogos da sessão.

### Mecânicas

#### Geração da Corrente com Cards Obrigatórios por Espaço

Cada transição decide se muda tamanho, cor ou ambos (conforme a chance por nível de dificuldade), evitando crescer além do maior tamanho ou encolher abaixo do menor.

```js
function generateChain() {
    const tier = tierForTrack(currentTrack);
    const numShapes = chainLengthForTier(tier);
    const twoAttrChance = twoAttrChanceForTier(tier);
    const shapeType = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];

    const states = [{ size: Math.floor(Math.random() * 3), color: Math.floor(Math.random() * 3) }];
    const requiredCardsPerBlank = [];

    for (let i = 1; i < numShapes; i++) {
        const prev = states[states.length - 1];
        const canGrow = prev.size < 2;
        const canShrink = prev.size > 0;
        const twoAttrs = Math.random() < twoAttrChance && (canGrow || canShrink);
        // ... decide changeSize/changeColor e empurra os ids exigidos em `required`
        states.push(next);
        requiredCardsPerBlank.push(required);
    }
    return { shapeType, states, requiredCardsPerBlank };
}
```

#### Drag and Drop via Pointer Events (padrão de referência)

Clique sem mover vira seleção por clique; um movimento real cria um "fantasma" que segue o ponteiro e, ao soltar, verifica o elemento embaixo dele via `elementFromPoint`.

```js
function startPointerDrag(e, sourceEl, cardId) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    try { sourceEl.setPointerCapture(e.pointerId); } catch (err) { /* ignora se nao suportado */ }
    pointerDrag = { pointerId: e.pointerId, cardId, sourceEl, ghostEl: null, startX: e.clientX, startY: e.clientY, moved: false };
    sourceEl.addEventListener('pointermove', onPointerDragMove);
    sourceEl.addEventListener('pointerup', onPointerDragEnd);
    sourceEl.addEventListener('pointercancel', onPointerDragCancel);
}

function onPointerDragEnd(e) {
    if (!pointerDrag || e.pointerId !== pointerDrag.pointerId) return;
    const drag = pointerDrag;
    cleanupPointerDrag();
    if (drag.moved) {
        const dropSlot = findSlotAtPoint(e.clientX, e.clientY);
        if (dropSlot) tryPlaceCard(parseInt(dropSlot.dataset.blankIdx, 10), drag.cardId);
    } else {
        selectedCardId = selectedCardId === drag.cardId ? null : drag.cardId;
        updateTraySelection();
    }
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (corrente de figuras com espaços + bandeja de cards arrastáveis) → modal de resultado → `screen-tracks`.

---

## 31. Que horas são

**Pasta:** `Que horas sao/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Leitura de Horas
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `que-horas-sao`)

### Descrição

Relógio analógico desenhado em SVG. Nos desafios 1-3 ("drag"), o jogo mostra um horário por extenso e o jogador arrasta os ponteiros de hora e minuto até a posição certa. Nos desafios 4-5 ("type"), o relógio já mostra as horas e o jogador digita o horário em campos numéricos. A granularidade dos minutos aceitos aumenta por trilha (só :00/:30 no fácil, até qualquer minuto no difícil).

### Mecânicas

#### Ângulo do Ponteiro a Partir da Posição do Ponteiro do Mouse/Toque

Converte a posição do clique/toque em coordenadas locais do SVG e calcula o ângulo em relação ao centro do relógio, ajustando para que 0° aponte para cima (12h).

```js
function angleFromPointer(clientX, clientY) {
    const svg = document.getElementById('clock-svg');
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const localX = (clientX - rect.left) / rect.width * vb.width + vb.x;
    const localY = (clientY - rect.top) / rect.height * vb.height + vb.y;
    const dx = localX - CX, dy = localY - CY;
    let angle = Math.atan2(dx, -dy) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
}

function snapAngle(angle, steps) {
    const unit = 360 / steps;
    return (Math.round(angle / unit) % steps) * unit;
}
```

#### Granularidade de Minutos por Dificuldade

```js
function minuteOptionsForTier(tier) {
    if (tier === 'facil') return [0, 30];
    if (tier === 'medio') return [0, 15, 30, 45];
    return null; // dificil: qualquer minuto 0-59
}
```

#### Dois Tipos de Desafio Alternando na Trilha

```js
const CHALLENGE_TYPES = ['drag', 'drag', 'drag', 'type', 'type'];
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (relógio SVG + ponteiro arrastável OU campos de hora/minuto, dependendo do tipo) → modal de resultado → `screen-tracks`.

---

## 32. Complete a Cobra

**Pasta:** `Complete a Cobra/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Padrões Repetitivos (Sequência de Cores)
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `complete-a-cobra`)

### Descrição

Um caminho em forma de cobra é traçado num grid, com um padrão de cores cíclico (3 a 6 cores conforme a trilha) que se repete ao longo das células. Uma parte da cobra já vem pintada; o jogador arrasta cores de uma bandeja para a célula ativa seguinte, na ordem, até completar o padrão.

### Mecânicas

#### Geração do Caminho por Passeio Aleatório com Folga

O caminho da cobra é um passeio aleatório sem se cruzar (backtracking), com uma regra extra de "clearance": nenhuma célula vizinha ortogonal do próximo passo pode já fazer parte do caminho (exceto a célula de onde se veio), evitando que o desenho passe raspando perto de si mesmo.

```js
function hasClearance(nr, nc, cr, cc) {
    for (const [dr, dc] of ORTHO) {
        const ar = nr + dr, ac = nc + dc;
        if (ar === cr && ac === cc) continue;
        if (visited.has(key(ar, ac))) return false;
    }
    return true;
}

function walk(r, c) {
    visited.add(key(r, c));
    path.push([r, c]);
    if (path.length === length) return true;

    const dirs = HY.shuffle(ORTHO.slice());
    for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (visited.has(key(nr, nc))) continue;
        if (!hasClearance(nr, nc, r, c)) continue;
        if (walk(nr, nc)) return true;
    }
    path.pop();
    visited.delete(key(r, c));
    return false;
}
```

#### Progressão de Padrão, Comprimento e Grid por Bloco de Trilhas

```js
const PATTERN_LEN_BY_BLOCK = [3, 4, 5, 6];
const SNAKE_LEN_BY_BLOCK = [12, 16, 20, 24];
const GRID_BY_BLOCK = [
    { cols: 8, rows: 7 },
    { cols: 9, rows: 8 },
    { cols: 10, rows: 9 },
    { cols: 11, rows: 10 },
];
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (grid da cobra + bandeja de cores arrastáveis) → modal de resultado → `screen-tracks`.

---

## 33. Sudoku Mágico

**Pasta:** `Sudoku Magico/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Lógica e Raciocínio (Sudoku)
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `sudoku-magico`)

### Descrição

Sudoku com símbolos visuais em vez de números tradicionais (cores, formas, emojis, números ou letras — um por desafio, na ordem `CATEGORY_ORDER`). O tamanho do grid cresce por bloco de trilhas: 3×3 (sem quadrante), 4×4 (quadrantes 2×2) e 6×6 (quadrantes 2×3). O jogador seleciona ou arrasta símbolos da bandeja para as células em branco.

### Mecânicas

#### Geração de Solução Válida por Backtracking

```js
function fill(pos) {
    if (pos === n * n) return true;
    const r = Math.floor(pos / n), c = pos % n;
    const candidates = HY.shuffle(Array.from({ length: n }, (_, i) => i));
    for (const v of candidates) {
        if (valid(r, c, v)) {
            grid[r][c] = v;
            if (fill(pos + 1)) return true;
            grid[r][c] = null;
        }
    }
    return false;
}
```

#### Remoção Segura de Casas por Eliminação Simples Repetida

Uma casa só é removida (vira lacuna) se o quebra-cabeça inteiro (todas as brancas já confirmadas + a nova candidata) continuar resolúvel por eliminação simples — evita gerar um puzzle com mais de uma solução possível.

```js
function isSolvableByElimination(blankKeys, n, box, solution) {
    const grid = solution.map(row => row.slice());
    blankKeys.forEach(key => {
        const [r, c] = key.split('_').map(Number);
        grid[r][c] = null;
    });

    const remaining = new Set(blankKeys);
    let progress = true;
    while (progress && remaining.size > 0) {
        progress = false;
        for (const key of remaining) {
            const [r, c] = key.split('_').map(Number);
            const cands = candidatesFor(grid, n, box, r, c);
            if (cands.length === 1) {
                grid[r][c] = cands[0];
                remaining.delete(key);
                progress = true;
            } else if (cands.length === 0) {
                return false;
            }
        }
    }
    return remaining.size === 0;
}
```

#### Tetos de Casas Reveladas (Total e por Símbolo)

Para o tabuleiro não ficar nem muito cheio nem viesado para um símbolo específico, no máximo 1/3 das células ficam reveladas no total, e nenhum símbolo pode ter mais da metade das suas próprias ocorrências como given.

```js
function maxTotalGivens(n) {
    return Math.floor((n * n) / 3);
}
function maxGivensPerSymbol(n) {
    return Math.max(1, Math.floor(n / 2));
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (grid do sudoku com setas de "sentido sem repetição" + bandeja de símbolos) → modal de resultado → `screen-tracks`.

---

## 34. Combinando Sorvete

**Pasta:** `Combinando Sorvete/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Combinatória (Combinações com Repetição)
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `combinando-sorvete`)

### Descrição

O jogador monta casquinhas de sorvete com todas as combinações possíveis de 2 bolas a partir de um conjunto de sabores (2 a 5, conforme a trilha), incluindo repetir o mesmo sabor duas vezes na mesma casquinha. O número de casquinhas exibidas é exatamente o total de combinações possíveis — o jogador deve preenchê-las todas sem repetir nenhuma combinação já usada.

### Mecânicas

#### Cálculo de Combinações com Repetição

```js
function combinationsCount(n) {
    // combinacoes com repeticao (par de sabores, ordem nao importa,
    // incluindo o mesmo sabor duas vezes): n(n+1)/2
    return (n * (n + 1)) / 2;
}
```

#### Validação de Par Único (Incluindo Sabor Repetido)

Ao fechar a segunda bola de uma casquinha, a chave do par (sabores ordenados e concatenados) é comparada com todas as casquinhas já travadas, para impedir combinações duplicadas — inclusive quando as duas bolas são do mesmo sabor.

```js
function pairKeyOf(cone) {
    return cone.scoops.slice().sort().join('|');
}

function tryAddScoop(coneIdx, flavorId) {
    const cone = cones[coneIdx];
    if (!cone || cone.locked) return;
    if (cone.scoops.length >= 2) return;

    if (cone.scoops.length === 1) {
        const first = cone.scoops[0];
        const pairKey = [first, flavorId].sort().join('|');
        const duplicate = cones.some((c, i) => i !== coneIdx && c.locked && pairKeyOf(c) === pairKey);
        if (duplicate) {
            HY.playLose();
            HY.score.wrong();
            shakeCone(coneIdx);
            return;
        }
        cone.scoops.push(flavorId);
        cone.locked = true;
        renderCones();
        checkChallengeComplete();
    } else {
        cone.scoops.push(flavorId);
        renderCones();
    }
}
```

#### Progressão do Número de Sabores por Bloco

```js
const FLAVOR_COUNT_BY_BLOCK = [2, 3, 4, 5];
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (fileira de casquinhas + caixa de sabores clicável/arrastável) → modal de resultado → `screen-tracks`.

---

## 35. Mercado Matemágico

**Pasta:** `Mercado Matematico/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Dinheiro, Orçamento e Troco
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `mercado-matematico`)

### Descrição

Nos desafios 1-3 ("Mercado"), o jogador recebe um saldo inicial e arrasta produtos entre "Podemos comprar" e "Não podemos comprar" sem deixar o saldo negativo, acertando exatamente a quantidade-alvo de itens comprados. Nos desafios 4-5 ("Tabela de Troco"), uma tabela mostra combinações de itens com valor recebido ou troco faltando, e o jogador calcula o campo oculto. A granularidade de preço (reais inteiros, múltiplos de 5 centavos, ou centavos livres) aumenta por bloco de trilhas.

### Mecânicas

#### Saldo Inicial Calculado a Partir de uma Meta de K Itens

O saldo inicial é a soma dos K itens mais baratos (mais uma folga aleatória menor que a diferença para o próximo item), garantindo que comprar exatamente K itens seja sempre possível e comprar K+1 sempre estoure o saldo.

```js
const sorted = pricesCents.slice().sort((a, b) => a - b);
const targetK = 2 + Math.floor(Math.random() * (itemCount - 2));
const sumK = sorted.slice(0, targetK).reduce((s, v) => s + v, 0);
const sumKPlus1 = sorted.slice(0, targetK + 1).reduce((s, v) => s + v, 0);
const gap = sumKPlus1 - sumK;
const slackUnit = marketDecimalMode ? 1 : 100;
const maxSlackSteps = Math.max(0, Math.floor((gap - slackUnit) / slackUnit));
const slack = maxSlackSteps > 0 ? slackUnit * Math.floor(Math.random() * (maxSlackSteps + 1)) : 0;

marketInitialBalance = sumK + slack;
```

#### Troco Proporcional ao Total da Compra

O troco de cada linha da tabela é sorteado como uma fração (~até 60%) do total da compra, sempre em passos da mesma unidade monetária da trilha, para nunca gerar trocos maiores que a própria compra nem trocos irreais.

```js
const trocoUnit = range.centsMode === 'whole' ? 100 : (range.centsMode === 'mult5' ? 5 : 1);
const maxSteps = Math.max(1, Math.floor((itemsTotal / trocoUnit) * 0.6));
const trocoSteps = 1 + Math.floor(Math.random() * maxSteps);
const trocoCents = trocoSteps * trocoUnit;
const recebidoCents = itemsTotal + trocoCents;
```

#### Formatação Monetária Consciente de Modo Decimal

```js
function formatCents(cents, decimalMode) {
    const negative = cents < 0;
    const abs = Math.abs(cents);
    if (!decimalMode) {
        return `${negative ? '-' : ''}R$ ${Math.round(abs / 100)}`;
    }
    const reais = Math.floor(abs / 100);
    const centsPart = abs % 100;
    return `${negative ? '-' : ''}R$ ${reais},${String(centsPart).padStart(2, '0')}`;
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game`, alternando `#market-challenge` (produtos arrastáveis + zonas comprar/não comprar + saldo) e `#troco-challenge` (catálogo + tabela com campos de entrada) → modal de resultado → `screen-tracks`.

---

## 36. O Caminho Mais Rápido

**Pasta:** `O Caminho Mais Rapido/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Grafos e Menor Caminho
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `caminho-mais-rapido`)

### Descrição

Um grafo gerado proceduralmente (6 a 12 nós, letras como identificadores) é exibido em SVG. Nos desafios 1-3, o jogador clica em nós vizinhos para traçar o caminho mais curto de uma pessoa até uma casa. Nos desafios 4-5, 2 a 4 personagens (abas coloridas) precisam cada um traçar seu próprio menor caminho, todos passando obrigatoriamente pelo mesmo nó — o jogador então digita a letra desse nó de cruzamento. É o jogo mais complexo geometricamente da sessão: usa geração de layout com distância mínima entre nós, ângulo mínimo entre arestas do mesmo nó e um algoritmo de "hub primeiro" para garantir múltiplos caminhos disjuntos.

### Mecânicas

#### Ângulo Mínimo Entre Arestas do Mesmo Nó

Duas arestas quase paralelas saindo do mesmo nó confundiriam visualmente o jogador sobre para onde uma linha realmente vai. Toda nova aresta é validada contra esse ângulo mínimo antes de ser aceita.

```js
const MIN_EDGE_ANGLE_DEG = 30;

function violatesAngle(nodes, adjacency, nodeIdx, candidateIdx, minAngleDeg) {
    const node = nodes[nodeIdx];
    const candidateAngle = angleDeg(node, nodes[candidateIdx]);
    for (const neighborIdx of adjacency[nodeIdx]) {
        const existingAngle = angleDeg(node, nodes[neighborIdx]);
        let diff = Math.abs(candidateAngle - existingAngle);
        if (diff > 180) diff = 360 - diff;
        if (diff < minAngleDeg) return true;
    }
    return false;
}
```

#### Construção "Hub Primeiro" para Caminhos Disjuntos

Garantir que um nó suporte K caminhos disjuntos que passam por ele (2 arestas por personagem) é fácil quando esse nó ainda não tem nenhuma aresta — mas quase impossível se tentado depois que o grafo já está denso e o espaço angular ao redor do nó já foi ocupado. Por isso as arestas do hub são criadas primeiro, num grafo vazio, e o resto do grafo é construído em volta delas.

```js
function connectHubFirst(nodes, adjacency, hub, minDegree, minAngleDeg) {
    const others = HY.shuffle(Array.from({ length: nodes.length }, (_, i) => i).filter(i => i !== hub));
    for (const candidate of others) {
        if (adjacency[hub].size >= minDegree) break;
        if (edgeIsValid(nodes, adjacency, hub, candidate, minAngleDeg)) {
            adjacency[hub].add(candidate);
            adjacency[candidate].add(hub);
        }
    }
}
```

#### Caminhos Disjuntos e Sem Ambiguidade de Rota

Um caminho mínimo só é aceito para um personagem se for **único** (sem empate que permitiria ao jogador escolher outra rota válida) e se não compartilhar nenhuma aresta com os caminhos já escolhidos para os outros personagens.

```js
function countShortestPathsAndReconstruct(adjacency, start, target) {
    // BFS que conta quantos caminhos minimos distintos existem ate cada no
    // (nao so a distancia) e reconstroi um deles
    ...
}

function pickPairThroughHub(adjacency, n, hub, distFromHub, usedNodes, usedEdges) {
    ...
    for (const house of HY.shuffle(candidateHouses)) {
        const result = countShortestPathsAndReconstruct(adjacency, start, house);
        if (!result || result.pathCount !== 1) continue;
        const edges = pathToEdgeSet(result.path);
        if (sharesAnyEdge(edges, usedEdges)) continue;
        return { start, house, shortest: result.distance, path: result.path, edges };
    }
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game`, alternando `#single-path-challenge` (grafo + 1 pessoa/1 casa) e `#multi-path-challenge` (grafo + abas de personagens + campo de letra de cruzamento) → modal de resultado → `screen-tracks`.

---

## 37. Balança da Descoberta

**Pasta:** `Balanca da Descoberta/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Adição e Comparação de Pesos
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `balanca-descoberta`)

### Descrição

Uma balança de dois pratos é desenhada em SVG e se inclina animadamente conforme os pesos mudam. O jogo inteiro usa 5 objetos fixos (`FIXED_OBJECTS`) reaproveitados em todos os desafios — só o peso sorteado de cada um muda. Uma tabela mostra os 5 objetos com seus pesos, exceto um em branco; o jogador soma dois objetos de referência exibidos na balança e digita o peso que falta.

### Mecânicas

#### Sorteio do Alvo com Par de Referência Somando Exato

Um objeto é escolhido como "alvo" (peso desconhecido); dois outros objetos recebem partes de um mesmo total que soma exatamente o peso do alvo; os dois restantes recebem pesos decorativos (ruído, não usados no cálculo).

```js
function generateFixedObjectWeights() {
    const indices = FIXED_OBJECTS.map((_, i) => i);
    const blankIdx = Math.floor(Math.random() * FIXED_OBJECTS.length);
    const others = indices.filter(i => i !== blankIdx);
    const shuffledOthers = HY.shuffle(others);
    const pairIndices = shuffledOthers.slice(0, 2);
    const decorIndices = shuffledOthers.slice(2);

    const blankWeight = 2 + Math.floor(Math.random() * (MAX_OBJECT_WEIGHT - 1));
    const pairParts = generateSummingParts(blankWeight, 2);

    const weights = new Array(FIXED_OBJECTS.length).fill(0);
    weights[blankIdx] = blankWeight;
    weights[pairIndices[0]] = pairParts[0];
    weights[pairIndices[1]] = pairParts[1];
    decorIndices.forEach(i => { weights[i] = 1 + Math.floor(Math.random() * MAX_OBJECT_WEIGHT); });

    return { weights, blankIdx, pairIndices };
}
```

#### Balança Animada via Rotação CSS em Torno do Pino Central

A viga e os dois pratos são um único grupo SVG que gira ao redor do pino, com a transição CSS suavizando a animação a cada novo palpite digitado.

```js
function computeTiltAngle(leftWeight, rightWeight) {
    const diff = rightWeight - leftWeight;
    return Math.max(-MAX_TILT_ANGLE, Math.min(MAX_TILT_ANGLE, diff * TILT_SENSITIVITY));
}

function setScaleAngle(prefix, angleDeg) {
    const beam = document.getElementById(`${prefix}-beam`);
    if (beam) beam.style.transform = `rotate(${angleDeg}deg)`;
}
```

> Nota de manutenção: os desafios 4-5 usavam originalmente uma mecânica de drag-and-drop separada (`loadBalanceChallenge`, `isSubsetSumUnique`) que foi substituída pela mesma mecânica dos desafios 1-3 a pedido do usuário. Esse código permanece no arquivo, sem uso, por causa da regra do projeto de nunca apagar código existente.

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (balança SVG animada + tabela de 5 objetos + campo de palpite) → modal de resultado → `screen-tracks`.

---

## 38. Complete a Sequência

**Pasta:** `Complete a Sequencia/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Progressão Aritmética
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `complete-a-sequencia`)

### Descrição

Uma sequência de 10 termos é exibida com 2 a 4 lacunas (conforme a trilha) para o jogador preencher. Usa progressão aritmética simples ou com passos em ciclo (alternando entre 2 ou 3 valores de incremento diferentes), podendo ser ascendente ou descendente nas trilhas mais avançadas.

### Mecânicas

#### Geração de Passos em Ciclo

O "passo" da progressão pode ser um único valor fixo (PA simples) ou um ciclo de 2-3 valores que se repete ao longo da sequência, dependendo do bloco de dificuldade.

```js
const STEP_COUNT_BY_BLOCK = [1, 1, 2, 3];

function generateSequence() {
    const block = blockForTrack(currentTrack);
    const maxCycleLen = STEP_COUNT_BY_BLOCK[block];
    const cycleLen = 1 + Math.floor(Math.random() * maxCycleLen);
    const isDescending = canDescend && Math.random() < 0.5;

    const stepMagnitudes = [];
    for (let i = 0; i < cycleLen; i++) {
        stepMagnitudes.push(magRange.min + Math.floor(Math.random() * (magRange.max - magRange.min + 1)));
    }
    const steps = stepMagnitudes.map(m => isDescending ? -m : m);

    const terms = [startValue];
    for (let i = 0; i < SEQUENCE_LENGTH - 1; i++) {
        terms.push(terms[terms.length - 1] + steps[i % cycleLen]);
    }
    return terms;
}
```

#### Valor Inicial Calculado para Nunca Ficar Negativo

Em sequências descendentes, o valor inicial é calculado a partir da maior "queda" acumulada possível ao longo da sequência, garantindo que nenhum termo intermediário fique abaixo de zero.

```js
let cumulative = 0, minCumulative = 0;
for (let i = 0; i < SEQUENCE_LENGTH - 1; i++) {
    cumulative += steps[i % cycleLen];
    if (cumulative < minCumulative) minCumulative = cumulative;
}
startValue = Math.abs(minCumulative) + 1 + Math.floor(Math.random() * 10);
```

#### Lacunas Nunca Adjacentes

Para sempre sobrar um número visível ao lado de qualquer lacuna como ponto de apoio para o cálculo, o sorteio de posições de lacuna é repetido até não haver duas posições vizinhas.

```js
function hasAdjacentPositions(sortedPositions) {
    for (let i = 1; i < sortedPositions.length; i++) {
        if (sortedPositions[i] - sortedPositions[i - 1] === 1) return true;
    }
    return false;
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (linha de 10 células, com `<input>` nas posições de lacuna) → modal de resultado → `screen-tracks`.

---

## 39. Contando as Patas

**Pasta:** `Contando as Patas/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Multiplicação (Contagem de Grupos)
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `contando-as-patas`)

### Descrição

O jogador vê um animal (2, 4, 6 ou 8 patas) e deve dizer quantas patas ele tem; no mesmo desafio, um grupo do mesmo tipo de animal (ou, nas trilhas mais avançadas, de um animal diferente) é exibido, e o jogador calcula o total de patas do grupo. Só conta como acerto quando as duas respostas estão corretas ao mesmo tempo.

### Mecânicas

#### Banco de Animais por Número de Patas

```js
const LEG_ANIMALS = {
    2: ['🐔', '🐧', '🦆', '🦩'],
    4: ['🐶', '🐱', '🐴', '🐄', '🐷', '🦁'],
    6: ['🐜', '🐝', '🐞'],
    8: ['🕷️', '🐙']
};
```

#### Animal do Grupo Podendo Diferir do Animal Individual (Trilhas Avançadas)

Nos 3 primeiros blocos, a mesma espécie é usada nas duas perguntas do desafio. No bloco mais avançado, cada pergunta sorteia sua própria espécie independentemente.

```js
const SAME_ANIMAL_BY_BLOCK = [true, true, true, false];

function generateChallenge() {
    ...
    let groupLegCount, groupAnimal;
    if (sameAnimal) {
        groupLegCount = singleLegCount;
        groupAnimal = singleAnimal;
    } else {
        groupLegCount = pickLegCount(legOptions);
        groupAnimal = pickAnimal(groupLegCount);
    }
    ...
}
```

#### Verificação Dupla Simultânea

```js
function verifyChallenge() {
    const singleCorrect = !isNaN(singleGuess) && singleGuess === currentChallenge.singleLegCount;
    const groupCorrect = !isNaN(groupGuess) && groupGuess === currentChallenge.groupTotal;
    // so avanca se singleCorrect && groupCorrect
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (2 painéis lado a lado: animal individual e grupo, cada um com campo de resposta) → modal de resultado → `screen-tracks`.

---

## 40. Qual é o Grupo?

**Pasta:** `Qual e o Grupo/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Classificação e Diagramas de Venn
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `qual-e-o-grupo`)

### Descrição

Evolução de "Organiza Tudo" para múltiplas características simultâneas: um diagrama de Venn de 2 ou 3 círculos (conforme a trilha) é desenhado com cores primárias que se misturam opticamente nas interseções via `mix-blend-mode:multiply`. O jogador arrasta itens de uma bandeja para a região correta do diagrama, entre 7 temas possíveis (animais, frutas/vegetais, transportes, esportes, clima, material escolar, espaço), cada um com objetos-isca que não pertencem a nenhum círculo.

### Mecânicas

#### Layout Geométrico dos Círculos (2 ou 3)

```js
function getCircleLayout(circleCount) {
    const cx = 210, cy = 190;
    if (circleCount === 2) {
        const r = 125, d = 105;
        return [
            { cx: cx - d / 2, cy: cy, r },
            { cx: cx + d / 2, cy: cy, r }
        ];
    }
    const r = 110, d = 110;
    const h = d * Math.sqrt(3) / 2;
    return [
        { cx: cx - d / 2, cy: cy - h / 3, r },
        { cx: cx + d / 2, cy: cy - h / 3, r },
        { cx: cx, cy: cy + 2 * h / 3, r }
    ];
}
```

#### Determinação de Região por Distância Euclidiana

Cada item carrega um vetor de tags booleanas (pertence/não pertence a cada círculo do tema). A região onde o item foi solto é calculada verificando em quais círculos o ponto cai dentro do raio, e comparada com o vetor esperado.

```js
function computeRegion(pt, circles) {
    return circles.map(c => Math.hypot(pt.x - c.cx, pt.y - c.cy) <= c.r);
}

function verifyDiagram() {
    items.forEach(item => {
        let itemCorrect;
        if (item.location !== 'placed') {
            itemCorrect = false;
        } else {
            const region = computeRegion({ x: item.x, y: item.y }, currentCircles);
            const expected = item.tags.slice(0, currentCircles.length);
            itemCorrect = region.every((v, i) => v === expected[i]);
        }
        item.feedback = itemCorrect ? 'correct' : 'wrong';
    });
}
```

#### 7 Temas com Itens e Isca Pré-Anotados

Cada tema define rótulos por círculo e uma lista de itens com um vetor `tags` de booleanos correspondente; itens com todas as tags `false` funcionam como isca (não pertencem a nenhum grupo).

```js
const THEMES = [
    {
        labels: ['Voa', 'Tem 4 patas', 'Vive na água'],
        items: [
            { icon: '🦆', tags: [true, false, true] },
            { icon: '🐧', tags: [false, false, true] },
            // ...
            { icon: '🐌', tags: [false, false, false] } // isca
        ]
    },
    // + Frutas/Vegetais, Transportes, Esportes, Clima, Material Escolar, Espaço
];

const CIRCLE_COUNT_BY_BLOCK = [2, 2, 3, 3];
const ITEM_COUNT_BY_BLOCK = [6, 8, 9, 11];
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (legenda de cores + diagrama SVG + bandeja de itens arrastáveis) → modal de resultado → `screen-tracks`.

---

## Apêndice — Utilitários Compartilhados

### `utils/shuffle.js`

Exposto como `HY.shuffle(array)`. Usado em Monster Typer I, Maiúsculo vs Minúsculo, Syllables e em todos os 15 jogos das seções 26-40.

### `utils/stars.js`, `utils/progress.js`, `utils/elapsed.js`

Trio usado por todos os jogos das seções 26-40 (padrão de 12 trilhas × 5 desafios): `HY.stars.init/renderGrid/trackComplete` para seleção de trilha e persistência de estrelas em `sessionStorage`; `HY.progress` e `HY.elapsed` envolvem `HY.score` automaticamente, sem código extra por jogo. Ver seção "Utilitários compartilhados (utils/)" do `CLAUDE.md` do projeto para a documentação completa da API.

### `utils/rand.js`

Exposto como `HY.rand.pick(pool, n, filterFn?)` e `HY.rand.pickByTrack(pool, n, criterios, trackIdx)`. Sorteia itens de um pool fixo, com filtro pedagógico opcional por trilha. Usado em Mapa da Ilha do Tesouro, Mercado Matemágico, Balança da Descoberta e Qual é o Grupo?.

### `utils/animations.js`

Exposto como `HY.shake(element)`. Aplica a classe `.shake-anim` e a remove após timeout.

### `utils/screen.js` e `utils/timer.js`

Utilitários de controle de tela e timer compartilhados entre jogos Vanilla JS.

### `styles/game-viewport.css`

CSS global. Define:
- Tokens de cor (`--hy-purple`, `--hy-orange`, `--hy-green`, `--hy-red`, etc.)
- Fontes (Luckiest Guy, Nunito)
- Classes de animação (`.shake-anim`, `.pop-anim`, `.float-anim`, `.line-anim`, `.gear-anim`, `.correct-anim`)
- Classes de estado (`.state-correct`, `.state-wrong`, `.state-neutral`)
- Componentes utilitários (`.btn-back`, `.btn-3d`, `.draggable`, `.dropzone`)

---

## Apêndice — Família de Jogos com 4 Mecânicas

Os seguintes jogos compartilham **exatamente a mesma arquitetura React** (estados, lógica de validação, componentes). Apenas o conteúdo dos `LEVELS` e a identidade visual diferem:

| Jogo | Conteúdo | Tema Visual |
|---|---|---|
| Caçadores de Coletivos | Substantivos Coletivos | Safári/Aventura |
| Detetives da Ortografia | Ortografia (X/CH, S/SS, G/J) | Detetive Noir |
| Escola de Magia VSA | Classes Gramaticais | Escola de Magia |
| Fábrica de Rimas | Rimas | Industrial/Fábrica |
| Galáxia dos Opostos | Antônimos | Espacial |
| Sinônimos | Sinônimos | Selva |

**Arquitetura comum:**
- `useState('cover')` → `useState('playing')` → `useState('complete')`
- `checkAnswer(value)` valida match/intruder/sentence
- `handleConnectRight(rightWord)` valida connect
- `handleWin()` avança fase ou encerra
- `resetTurn()` limpa todos os estados de interação
- Drag & Drop com `handleDragStart`, `handleDragOver`, `handleDrop`
- SVG de linhas animadas no connect com posições em `['16.66%', '50%', '83.33%']`
