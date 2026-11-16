'use strict';

const CAPACITY = 4;
const COLORS = [
    { name: 'rosa', hex: '#f472b6', symbol: '●' },
    { name: 'azul', hex: '#38bdf8', symbol: '◆' },
    { name: 'amarela', hex: '#facc15', symbol: '★' },
    { name: 'verde', hex: '#4ade80', symbol: '▲' },
    { name: 'roxa', hex: '#c084fc', symbol: '♥' },
    { name: 'laranja', hex: '#fb923c', symbol: '✚' }
];
let tubes = [], initialTubes = [], history = [];
let selectedTube = -1, moves = 0, currentTrack = 0, challengeInTrack = 0;
let isLocked = false;
const copyBoard = board => board.map(tube => tube.slice());
const topColor = tube => tube[tube.length - 1];
const isCompleteTube = tube => tube.length === CAPACITY && tube.every(color => color === tube[0]);
const isSolved = board => board.every(tube => !tube.length || isCompleteTube(tube));

// Cada passo de embaralhamento tem uma transferência inversa legal.
// A cor colocada difere do topo de destino, preservando uma camada reversível.
function generatePuzzle(colorCount, steps, random = Math.random) {
    const board = Array.from({ length: colorCount }, (_, color) => Array(CAPACITY).fill(color));
    board.push([], []);
    let previous = null;
    for (let step = 0; step < steps; step++) {
        const choices = [];
        board.forEach((source, from) => {
            if (!source.length || (source.length > 1 && source[source.length - 2] !== topColor(source))) return;
            board.forEach((target, to) => {
                if (from === to || target.length === CAPACITY || topColor(target) === topColor(source)) return;
                if (previous && previous[0] === to && previous[1] === from) return;
                choices.push([from, to]);
            });
        });
        if (!choices.length) break;
        const [from, to] = choices[Math.floor(random() * choices.length)];
        board[to].push(board[from].pop());
        previous = [from, to];
    }
    return board;
}

function pourCount(board, from, to) {
    if (from === to || !board[from].length || board[to].length === CAPACITY) return 0;
    const color = topColor(board[from]);
    if (board[to].length && topColor(board[to]) !== color) return 0;
    let run = 0;
    for (let i = board[from].length - 1; i >= 0 && board[from][i] === color; i--) run++;
    return Math.min(run, CAPACITY - board[to].length);
}

function feedback(message) { document.getElementById('sort-feedback').textContent = message; }

function updateGlobalStats() {
    const total = Array.from({ length: 12 }, (_, i) => HY.stars.getStars(i)).reduce((a, b) => a + b, 0);
    document.getElementById('total-stars').textContent = `⭐ ${total}/36`;
    document.getElementById('lvl-star-count').textContent = `⭐ ${total}`;
}

function changeScreen(id) {
    document.getElementById('result-modal').style.display = 'none';
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    if (id !== 'game') {
        HY.elapsed.stopTrail();
        HY.elapsed.hide();
        HY.score.hide();
        HY.progress.hide();
    }
    if (id === 'levels') HY.stars.renderGrid('level-grid', {
        onPlay: startLevel, emoji: () => '🧪', label: i => `Trilha ${i + 1}`, accentColor: '#8b5cf6'
    });
    updateGlobalStats();
}

function startLevel(index) {
    currentTrack = index;
    challengeInTrack = 0;
    changeScreen('game');
    HY.score.reset();
    loadPuzzle();
}

function loadPuzzle() {
    const colorCount = Math.min(6, 2 + Math.floor(currentTrack / 2));
    tubes = generatePuzzle(colorCount, 12 + currentTrack * 5 + challengeInTrack * 3);
    // Uma configuração resolvida nunca é apresentada como desafio.
    if (isSolved(tubes)) {
        tubes = Array.from({ length: colorCount }, (_, color) => Array(CAPACITY).fill(color));
        [tubes[0][3], tubes[1][3]] = [tubes[1][3], tubes[0][3]];
        tubes.push([], []);
    }
    initialTubes = copyBoard(tubes);
    history = [];
    selectedTube = -1;
    moves = 0;
    isLocked = false;
    document.getElementById('game-info').textContent = `Trilha ${currentTrack + 1} • Poção ${challengeInTrack + 1}/5`;
    feedback('Separe as cores: cada frasco deve ficar vazio ou cheio de uma única cor.');
    renderBoard();
    HY.score.startChallenge();
}

function renderBoard(focusIndex) {
    const shelf = document.getElementById('active-shelf');
    shelf.replaceChildren();
    tubes.forEach((tube, index) => {
        const button = document.createElement('button');
        button.className = 'sort-tube' + (selectedTube === index ? ' selected' : '') + (isCompleteTube(tube) ? ' complete' : '');
        button.setAttribute('aria-pressed', String(selectedTube === index));
        button.setAttribute('aria-label', `Frasco ${index + 1}: ${tube.length ? 'do topo para a base, ' + tube.slice().reverse().map(color => COLORS[color].name).join(', ') : 'vazio'}`);
        button.disabled = isLocked;
        const glass = document.createElement('span');
        glass.className = 'tube-glass';
        glass.setAttribute('aria-hidden', 'true');
        tube.forEach(color => {
            const layer = document.createElement('span');
            layer.className = 'potion-layer';
            layer.style.setProperty('--potion', COLORS[color].hex);
            layer.textContent = COLORS[color].symbol;
            glass.appendChild(layer);
        });
        const label = document.createElement('span');
        label.className = 'tube-label';
        label.textContent = `${index + 1}${isCompleteTube(tube) ? ' ✓' : ''}`;
        button.append(glass, label);
        button.onclick = () => selectTube(index);
        shelf.appendChild(button);
    });
    document.getElementById('move-count').textContent = `${moves} movimento${moves === 1 ? '' : 's'}`;
    document.getElementById('undo-btn').disabled = !history.length || isLocked;
    if (focusIndex !== undefined && !isLocked) shelf.children[focusIndex].focus({ preventScroll: true });
}

function selectTube(index) {
    if (isLocked) return;
    if (selectedTube === index) {
        selectedTube = -1;
        feedback('Seleção cancelada. Escolha outro frasco.');
    } else if (selectedTube === -1) {
        if (!tubes[index].length) { feedback('Este frasco está vazio. Escolha um frasco com poção.'); return; }
        selectedTube = index;
        feedback(`Frasco ${index + 1} selecionado. Escolha o destino ou toque nele de novo para cancelar.`);
    } else {
        const count = pourCount(tubes, selectedTube, index);
        if (!count) {
            feedback('Não cabe aqui! Use um frasco vazio ou com a mesma cor no topo e espaço livre.');
            HY.playLose();
            return;
        }
        history.push(copyBoard(tubes));
        tubes[index].push(...tubes[selectedTube].splice(-count));
        selectedTube = -1;
        moves++;
        feedback('Poção transferida! Continue separando as cores.');
        if (isSolved(tubes)) finishPuzzle();
        else if (!tubes.some((_, from) => tubes.some((_, to) => pourCount(tubes, from, to)))) {
            feedback('Sem movimentos disponíveis. Use Desfazer ou Reiniciar para tentar outro caminho.');
        }
    }
    renderBoard(index);
}

function undoMove() {
    if (isLocked || !history.length) return;
    tubes = history.pop();
    moves--;
    selectedTube = -1;
    feedback('Último movimento desfeito. Experimente outro caminho.');
    renderBoard();
}

function restartPuzzle() {
    if (isLocked) return;
    tubes = copyBoard(initialTubes);
    history = [];
    moves = 0;
    selectedTube = -1;
    feedback('Poção reiniciada. Vamos tentar de novo!');
    renderBoard();
}

function finishPuzzle() {
    isLocked = true;
    HY.playWin();
    HY.score.correct();
    if (challengeInTrack === 4) HY.elapsed.stopTrail();
    const earned = challengeInTrack === 4 ? HY.stars.trackComplete(currentTrack) : null;
    document.getElementById('result-title').textContent = 'Poções organizadas!';
    document.getElementById('result-stars').textContent = earned ? '⭐'.repeat(earned) + '☆'.repeat(3 - earned) : '🧪✨';
    document.getElementById('result-msg').textContent = `Todas as cores separadas em ${moves} movimentos!`;
    const next = document.getElementById('modal-next-btn');
    next.textContent = challengeInTrack < 4 ? 'PRÓXIMA POÇÃO' : 'TRILHA COMPLETA';
    document.getElementById('result-modal').style.display = 'flex';
    updateGlobalStats();
    next.focus();
}

function handleModalAction() {
    document.getElementById('result-modal').style.display = 'none';
    if (challengeInTrack < 4) { challengeInTrack++; loadPuzzle(); }
    else changeScreen('levels');
}

HY.stars.init('laboratorio-pocoes-color-sort');
updateGlobalStats();
