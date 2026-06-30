HY.stars.init('monster-typer-2');

const TRACKS = [
  ['GATO', 'CASA', 'BOLA', 'DADO', 'FOGO'],
  ['LAGO', 'MESA', 'SAPO', 'URSO', 'RATO'],
  ['ZEBRA', 'NAVIO', 'PIANO', 'FRUTA', 'HORTA'],
  ['AMIGO', 'BANCO', 'CARRO', 'DENTE', 'ESCOLA'],
  ['FESTA', 'GELO', 'HARPA', 'ILHA', 'JOGO'],
  ['LIVRO', 'MACA', 'NOITE', 'OURO', 'PORTA'],
  ['QUEIJO', 'ROUPA', 'SAPATO', 'TERRA', 'UVA'],
  ['VENTO', 'XADREZ', 'ARROZ', 'BALAO', 'COPO'],
  ['DOCE', 'ERVA', 'FILHO', 'GOTA', 'HORA'],
  ['IATE', 'JOIA', 'LATA', 'MEIA', 'NUVEM'],
  ['OLHO', 'PEIXE', 'QUADRO', 'RUA', 'SALTO'],
  ['TORRE', 'VALE', 'AGUA', 'BOLSA', 'CAIXA'],
];

let unlockedTracks = parseInt(localStorage.getItem('mt2_unlockedTracks') || '1');
let currentTrack = 0;
let wordInTrack = 0;
let currentWord = '';
let typedIndex = 0;
let timeLeft = 100;
let timerActive = false;
let gameActive = false;
let timerInterval;

const screenStart = document.getElementById('screen-start');
const screenGame = document.getElementById('screen-game');
const wordContainer = document.getElementById('word-container');
const timerFill = document.getElementById('timer-fill');
const uiLevel = document.getElementById('ui-level');
const monsterSvg = document.getElementById('monster-svg');
const modalFeedback = document.getElementById('modal-feedback');

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    screen.classList.add('active-screen');
}

function renderTrackSelect() {
    const grid = document.getElementById('track-grid');
    if (!grid) return;
    HY.stars.renderGrid('track-grid', {
        onPlay: startTrack,
        label: (i) => `Trilha ${i + 1}`,
        accentColor: '#14b8a6'
    });
}

function startGame() {
    startTrack(0);
}

function startTrack(trackIdx) {
    currentTrack = trackIdx;
    wordInTrack = 0;
    typedIndex = 0;
    gameActive = true;
    HY.score.reset();
    showScreen(screenGame);
    nextWord();
}

function nextWord() {
    currentWord = TRACKS[currentTrack][wordInTrack];
    typedIndex = 0;
    renderWord();
    resetTimer();
    monsterSvg.classList.remove('shake-ui');
    HY.score.startChallenge();
}

function renderWord() {
    wordContainer.innerHTML = '';
    for (let i = 0; i < currentWord.length; i++) {
        const span = document.createElement('span');
        span.innerText = currentWord[i];
        span.className = `letter-slot ${i < typedIndex ? 'letter-correct' : 'letter-pending'}`;
        wordContainer.appendChild(span);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 100;
    updateTimerUI();
    timerInterval = setInterval(() => {
        if (!gameActive) return;
        timeLeft -= 0.5;
        updateTimerUI();
        if (timeLeft <= 0) handleTimeOut();
    }, 100);
}

function updateTimerUI() {
    timerFill.style.height = timeLeft + '%';
    timerFill.style.background = timeLeft < 30
        ? 'linear-gradient(to top, #ef4444, #f87171)'
        : 'linear-gradient(to top, #facc15, #fbbf24)';
}

function handleTimeOut() {
    clearInterval(timerInterval);
    monsterSvg.classList.add('shake-ui');
    setTimeout(nextWord, 500);
}

window.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    const key = e.key.toUpperCase();
    if (!/^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÚÜÇ]$/.test(key)) return;
    if (key === currentWord[typedIndex]) {
        typedIndex++;
        renderWord();
        monsterSvg.style.transform = 'scale(1.1)';
        setTimeout(() => monsterSvg.style.transform = 'scale(1)', 100);
        if (typedIndex === currentWord.length) wordComplete();
    } else {
        HY.playLose();
        HY.score.wrong();
        wordContainer.classList.add('shake-ui');
        setTimeout(() => wordContainer.classList.remove('shake-ui'), 300);
        document.getElementById('eye-l').style.fill = '#ef4444';
        document.getElementById('eye-r').style.fill = '#ef4444';
        setTimeout(() => {
            document.getElementById('eye-l').style.fill = '#2563eb';
            document.getElementById('eye-r').style.fill = '#2563eb';
        }, 400);
    }
});

function wordComplete() {
    HY.playWin();
    HY.score.correct();
    clearInterval(timerInterval);
    wordInTrack++;
    if (wordInTrack < 5) {
        setTimeout(nextWord, 300);
    } else {
        showTrackComplete();
    }
}

function showTrackComplete() {
    gameActive = false;
    HY.stars.trackComplete(currentTrack);
    unlockedTracks = HY.stars.getUnlocked();
    if (currentTrack + 1 === unlockedTracks && unlockedTracks < TRACKS.length) {
        unlockedTracks++;
        localStorage.setItem('mt2_unlockedTracks', unlockedTracks);
    }
    HY.elapsed.stopTrail();
    modalFeedback.classList.remove('hidden');
    modalFeedback.classList.add('flex');
    const title = modalFeedback.querySelector('#feedback-title');
    if (title) title.innerText = currentTrack + 1 < TRACKS.length ? 'TRILHA CONCLUÍDA!' : 'JOGO CONCLUÍDO!';
}

function nextLevel() {
    modalFeedback.classList.add('hidden');
    modalFeedback.classList.remove('flex');
    if (currentTrack + 1 < TRACKS.length) {
        startTrack(currentTrack + 1);
    } else {
        showTrackSelectScreen();
    }
}

function showTrackSelectScreen() {
    gameActive = false;
    const trackScreen = document.getElementById('screen-tracks');
    if (trackScreen) {
        renderTrackSelect();
        showScreen(trackScreen);
    } else {
        showScreen(screenStart);
    }
}

function pauseGame() {
    gameActive = !gameActive;
    if (!gameActive) {
        clearInterval(timerInterval);
    } else {
        resetTimer();
    }
}
