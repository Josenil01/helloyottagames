HY.stars.init('monster-typer-1');

const TRACKS = [
  // Trilha 1 — Letra A
  { name: 'Trilha 1', letter: 'A', phases: [
    { word: 'ABELHA', emoji: '🐝' }, { word: 'ANEL', emoji: '💍' }, { word: 'AVIÃO', emoji: '✈️' }, { word: 'ABACAXI', emoji: '🍍' }, { word: 'ARANHA', emoji: '🕷️' }
  ]},
  // Trilha 2 — Letra B
  { name: 'Trilha 2', letter: 'B', phases: [
    { word: 'BOLA', emoji: '⚽' }, { word: 'BALA', emoji: '🍬' }, { word: 'BONECA', emoji: '🪆' }, { word: 'BALEIA', emoji: '🐋' }, { word: 'BOTA', emoji: '👢' }
  ]},
  // Trilha 3 — Letra C
  { name: 'Trilha 3', letter: 'C', phases: [
    { word: 'CASA', emoji: '🏠' }, { word: 'CARRO', emoji: '🚗' }, { word: 'COELHO', emoji: '🐰' }, { word: 'COBRA', emoji: '🐍' }, { word: 'CAMA', emoji: '🛏️' }
  ]},
  // Trilha 4 — Letra D
  { name: 'Trilha 4', letter: 'D', phases: [
    { word: 'DADO', emoji: '🎲' }, { word: 'DENTE', emoji: '🦷' }, { word: 'DOCE', emoji: '🍰' }, { word: 'DINOSSAURO', emoji: '🦕' }, { word: 'DEDO', emoji: '🤚' }
  ]},
  // Trilha 5 — Letra E
  { name: 'Trilha 5', letter: 'E', phases: [
    { word: 'ELEFANTE', emoji: '🐘' }, { word: 'ESTRELA', emoji: '⭐' }, { word: 'ESCOVA', emoji: '🪥' }, { word: 'ESPELHO', emoji: '🪞' }, { word: 'ESQUILO', emoji: '🐿️' }
  ]},
  // Trilha 6 — Letra F
  { name: 'Trilha 6', letter: 'F', phases: [
    { word: 'FOCA', emoji: '🦭' }, { word: 'FOGO', emoji: '🔥' }, { word: 'FACA', emoji: '🔪' }, { word: 'FLOR', emoji: '🌸' }, { word: 'FORMIGA', emoji: '🐜' }
  ]},
  // Trilha 7 — Letra G
  { name: 'Trilha 7', letter: 'G', phases: [
    { word: 'GATO', emoji: '🐱' }, { word: 'GALINHA', emoji: '🐔' }, { word: 'GELO', emoji: '🧊' }, { word: 'GIRAFA', emoji: '🦒' }, { word: 'GAIOLA', emoji: '🐦' }
  ]},
  // Trilha 8 — Letra H
  { name: 'Trilha 8', letter: 'H', phases: [
    { word: 'HIPOPÓTAMO', emoji: '🦛' }, { word: 'HARPA', emoji: '🎵' }, { word: 'HÉLICE', emoji: '🌀' }, { word: 'HELICÓPTERO', emoji: '🚁' }, { word: 'HOMEM', emoji: '👨' }
  ]},
  // Trilha 9 — Letra I
  { name: 'Trilha 9', letter: 'I', phases: [
    { word: 'IGREJA', emoji: '⛪' }, { word: 'ILHA', emoji: '🏝️' }, { word: 'IOIÔ', emoji: '🪀' }, { word: 'ÍMÃ', emoji: '🧲' }, { word: 'INVERNO', emoji: '❄️' }
  ]},
  // Trilha 10 — Letra J
  { name: 'Trilha 10', letter: 'J', phases: [
    { word: 'JACARÉ', emoji: '🐊' }, { word: 'JANELA', emoji: '🪟' }, { word: 'JOGO', emoji: '🎮' }, { word: 'JARRO', emoji: '🏺' }, { word: 'JACA', emoji: '🍈' }
  ]},
  // Trilha 11 — Letra L
  { name: 'Trilha 11', letter: 'L', phases: [
    { word: 'LEÃO', emoji: '🦁' }, { word: 'LIVRO', emoji: '📚' }, { word: 'LUA', emoji: '🌙' }, { word: 'LÁPIS', emoji: '✏️' }, { word: 'LARANJA', emoji: '🍊' }
  ]},
  // Trilha 12 — Letra M
  { name: 'Trilha 12', letter: 'M', phases: [
    { word: 'MACACO', emoji: '🐒' }, { word: 'MALA', emoji: '💼' }, { word: 'MÃO', emoji: '🤚' }, { word: 'MILHO', emoji: '🌽' }, { word: 'MORANGO', emoji: '🍓' }
  ]},
];

let unlockedTracks = parseInt(localStorage.getItem('mt1_unlockedTracks') || '1');
let activeTrackIdx = 0;
let activePhaseIdx = 0;
let canType = false;
let gameMode = 'infantil';
let currentPhases = [];

let timeLeft = 100;
let timerInterval = null;
const PHASE_TIME = 10000;

function showScreen(screenId) {
    stopTimer();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    document.getElementById(screenId).classList.add('active-screen');
    document.getElementById('win-modal').classList.add('hidden');
    if (screenId === 'screen-levels') renderTracksGrid();
}

function setMode(mode) {
    gameMode = mode;
    showScreen('screen-levels');
}

function renderTracksGrid() {
    HY.stars.renderGrid('levels-grid', {
        onPlay: startTrack,
        emoji: (i) => TRACKS[i].phases[0].emoji,
        label: (i) => TRACKS[i].name,
        accentColor: '#14b8a6'
    });
}

function startTrack(index) {
    activeTrackIdx = index;
    activePhaseIdx = 0;
    HY.score.reset();
    currentPhases = [...TRACKS[index].phases];
    showScreen('screen-game');
    initPhase();
}

function initPhase() {
    const data = currentPhases[activePhaseIdx];
    const bigLetter = document.getElementById('big-letter-display');
    const wordName = document.getElementById('word-name');

    canType = true;
    document.getElementById('display-emoji').innerText = data.emoji;

    const letter = TRACKS[activeTrackIdx].letter;
    if (gameMode === 'infantil') {
        bigLetter.innerText = letter.toUpperCase();
        bigLetter.classList.add('font-game');
        wordName.innerText = data.word.toUpperCase();
        wordName.classList.remove('tracking-normal');
        wordName.classList.add('tracking-widest');
    } else {
        bigLetter.innerText = letter.toUpperCase() + ' ' + letter.toLowerCase();
        bigLetter.classList.remove('font-game');
        const wordLower = data.word.charAt(0).toUpperCase() + data.word.slice(1).toLowerCase();
        wordName.innerText = wordLower;
        wordName.classList.remove('tracking-widest');
        wordName.classList.add('tracking-normal');
    }

    bigLetter.className = 'letter-big text-teal-500 drop-shadow-lg';
    if (gameMode === 'infantil') bigLetter.classList.add('font-game');
    bigLetter.style.color = '';
    resetTimer();
    HY.score.startChallenge();
}

function resetTimer() {
    stopTimer();
    timeLeft = 100;
    updateTimerUI();

    const step = 100;
    const decrement = (step / PHASE_TIME) * 100;

    timerInterval = setInterval(() => {
        timeLeft -= decrement;
        if (timeLeft <= 0) {
            timeLeft = 0;
            handleTimeOut();
        }
        updateTimerUI();
    }, step);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function updateTimerUI() {
    const bar = document.getElementById('timer-bar');
    bar.style.width = `${timeLeft}%`;

    if (timeLeft > 50) bar.style.backgroundColor = '#14b8a6';
    else if (timeLeft > 20) bar.style.backgroundColor = '#facc15';
    else bar.style.backgroundColor = '#ef4444';
}

function handleTimeOut() {
    stopTimer();
    const bigLetter = document.getElementById('big-letter-display');
    HY.shake(bigLetter);

    setTimeout(() => {
        if (document.getElementById('screen-game').classList.contains('active-screen')) {
            resetTimer();
        }
    }, 500);
}

function quitGame() {
    stopTimer();
    showScreen('screen-levels');
}

window.addEventListener('keydown', (e) => {
    if (!document.getElementById('screen-game').classList.contains('active-screen') || !canType) return;
    const typedKey = e.key.toUpperCase();
    const targetKey = TRACKS[activeTrackIdx].letter.toUpperCase();
    const bigLetter = document.getElementById('big-letter-display');
    if (typedKey === targetKey) {
        canType = false;
        stopTimer();
        HY.playWin();
        HY.score.correct();
        bigLetter.classList.remove('shake-anim');
        bigLetter.classList.add('correct-anim');
        bigLetter.style.color = '#22c55e';
        setTimeout(nextPhase, 1100);
    } else {
        if (e.key.length === 1 && /[a-zA-Záàâãéèêíïóôõúüç]/.test(e.key)) {
            HY.playLose();
            HY.score.wrong();
            HY.shake(bigLetter);
        }
    }
});

function nextPhase() {
    activePhaseIdx++;
    if (activePhaseIdx < 5) {
        initPhase();
    } else {
        stopTimer();
        HY.stars.trackComplete(activeTrackIdx);
        unlockedTracks = HY.stars.getUnlocked();
        if (activeTrackIdx + 1 === unlockedTracks && unlockedTracks < TRACKS.length) {
            unlockedTracks++;
            localStorage.setItem('mt1_unlockedTracks', unlockedTracks);
        }
        const isFinal = activeTrackIdx + 1 === TRACKS.length;
        document.getElementById('modal-title').innerText = isFinal ? 'JOGO CONCLUÍDO!' : 'TRILHA CONCLUÍDA!';
        HY.elapsed.stopTrail();
        document.getElementById('win-modal').classList.remove('hidden');
    }
}
