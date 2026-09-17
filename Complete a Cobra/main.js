HY.stars.init('complete-a-cobra');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;

const COLOR_PALETTE = ['#48076a', '#ffa800', '#d046d9', '#01bebc', '#6ce67d', '#ff3041', '#0a40b5'];

// Progressao em blocos de 3 trilhas: comeca com padrao de 3 cores e sobe
// ate 6 (trilhas 1-3 = 3 cores, 4-6 = 4 cores, 7-9 = 5 cores, 10-12 = 6).
const PATTERN_LEN_BY_BLOCK = [3, 4, 5, 6];
const SNAKE_LEN_BY_BLOCK = [12, 16, 20, 24];
const GRID_BY_BLOCK = [
    { cols: 8, rows: 7 },
    { cols: 9, rows: 8 },
    { cols: 10, rows: 9 },
    { cols: 11, rows: 10 },
];

function blockForTrack(idx) {
    return Math.min(PATTERN_LEN_BY_BLOCK.length - 1, Math.floor(idx / 3));
}

function patternLenForTrack(idx) {
    return PATTERN_LEN_BY_BLOCK[blockForTrack(idx)];
}

function snakeLenForTrack(idx) {
    return SNAKE_LEN_BY_BLOCK[blockForTrack(idx)];
}

// dimensoes de grid generosas (bem maiores que o comprimento da cobra)
// pra o caminho aleatorio encontrar uma rota sem se cruzar rapido.
function gridSizeForTrack(idx, isPortrait) {
    const base = GRID_BY_BLOCK[blockForTrack(idx)];
    return isPortrait ? { rows: base.cols, cols: base.rows } : { rows: base.rows, cols: base.cols };
}

let currentTrack = 0;
let challengeIdx = 0;
let currentChallenge = null; // { patternColors }
let cellsState = []; // [{r,c,color,filled}]
let activeIndex = 0;
let challengeComplete = false;
let gridRows = 0, gridCols = 0;

function init() {
    HY.stars.init('complete-a-cobra');
    updateGlobalStats();
}

function updateGlobalStats() {
    let total = 0;
    for (let i = 0; i < TRACK_COUNT; i++) total += HY.stars.getStars(i);
    document.getElementById('total-stars').textContent = `⭐ ${total}/${TRACK_COUNT * 3}`;
    const tracksBadge = document.getElementById('tracks-star-count');
    if (tracksBadge) tracksBadge.textContent = `⭐ ${total}`;
}

function changeScreen(id) {
    const hud = document.getElementById('hy-hud');
    if (hud) hud.style.display = id === 'game' ? 'flex' : 'none';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    updateGlobalStats();
    if (id === 'tracks') renderTracksGrid();
}

function renderTracksGrid() {
    HY.stars.renderGrid('track-grid', {
        onPlay: startTrack,
        emoji: () => '🐍',
        accentColor: '#01bebc'
    });
}

function startTrack(idx) {
    currentTrack = idx;
    challengeIdx = 0;
    HY.score.reset();
    changeScreen('game');
    loadChallenge();
}

/* ---------------------------------------------------------
   Geracao do caminho da cobra: passeio aleatorio sem se
   cruzar (backtracking), dentro de um grid generoso.

   Alem de nunca revisitar uma celula, cada novo passo tambem
   precisa ter "folga": nenhum vizinho ortogonal dele pode ja
   fazer parte do caminho, exceto a propria celula de onde
   viemos. Isso evita que o desenho passe raspando perto de si
   mesmo (o que confundia visualmente qual era o proximo passo).
--------------------------------------------------------- */
function generateSnakePath(rows, cols, length) {
    const ORTHO = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (let attempt = 0; attempt < 400; attempt++) {
        const visited = new Set();
        const path = [];
        const key = (r, c) => r + '_' + c;

        function hasClearance(nr, nc, cr, cc) {
            for (const [dr, dc] of ORTHO) {
                const ar = nr + dr, ac = nc + dc;
                if (ar === cr && ac === cc) continue; // a celula de onde viemos sempre e vizinha valida
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

        const startR = Math.floor(Math.random() * rows);
        const startC = Math.floor(Math.random() * cols);
        if (walk(startR, startC)) return path;
    }
    return null;
}

/* ---------------------------------------------------------
   Geracao do desafio
--------------------------------------------------------- */
function loadChallenge() {
    const patternLen = patternLenForTrack(currentTrack);
    const snakeLen = snakeLenForTrack(currentTrack);
    const isPortrait = window.innerWidth < 700;
    const grid = gridSizeForTrack(currentTrack, isPortrait);
    gridRows = grid.rows;
    gridCols = grid.cols;

    const path = generateSnakePath(gridRows, gridCols, snakeLen);
    const patternColors = HY.shuffle(COLOR_PALETTE).slice(0, patternLen);
    const precoloredCount = Math.min(snakeLen, patternLen * 2);

    cellsState = path.map(([r, c], i) => ({
        r, c,
        color: patternColors[i % patternLen],
        filled: i < precoloredCount
    }));
    activeIndex = precoloredCount;
    challengeComplete = false;

    currentChallenge = { patternColors };

    renderSnake();
    renderTray();
    HY.score.startChallenge();
}

/* ---------------------------------------------------------
   Renderizacao
--------------------------------------------------------- */
function renderSnake() {
    const area = document.getElementById('snake-area');
    area.style.gridTemplateColumns = `repeat(${gridCols}, var(--cell-size))`;
    area.style.gridTemplateRows = `repeat(${gridRows}, var(--cell-size))`;
    area.innerHTML = '';

    cellsState.forEach((cell, i) => {
        const div = document.createElement('div');
        div.style.gridRow = (cell.r + 1);
        div.style.gridColumn = (cell.c + 1);
        div.dataset.idx = i;

        let cls = 'snake-cell';
        if (i === 0) cls += ' head';
        if (cell.filled) {
            cls += ' filled';
            div.style.background = cell.color;
        } else if (i === activeIndex) {
            cls += ' active';
        } else {
            cls += ' pending';
        }
        div.className = cls;
        area.appendChild(div);
    });
}

function renderTray() {
    const tray = document.getElementById('color-tray');
    tray.innerHTML = '';
    HY.shuffle(currentChallenge.patternColors.slice()).forEach(color => {
        const el = document.createElement('div');
        el.className = 'color-swatch';
        el.style.background = color;
        el.addEventListener('pointerdown', (e) => startSwatchDrag(e, el, color));
        tray.appendChild(el);
    });
}

/* ---------------------------------------------------------
   Arrastar via Pointer Events (mesmo padrao da Fabrica das
   Formas — clique sem mover = usa direto; mover = arrasta e
   solta em cima da celula ativa).
--------------------------------------------------------- */
const DRAG_MOVE_THRESHOLD = 6;
let swatchDrag = null;

function startSwatchDrag(e, sourceEl, color) {
    if (e.button !== undefined && e.button !== 0) return;
    if (challengeComplete) return;
    e.preventDefault();
    try { sourceEl.setPointerCapture(e.pointerId); } catch (err) { /* ignora */ }

    swatchDrag = { pointerId: e.pointerId, color, sourceEl, ghostEl: null, startX: e.clientX, startY: e.clientY, moved: false };
    sourceEl.addEventListener('pointermove', onSwatchMove);
    sourceEl.addEventListener('pointerup', onSwatchEnd);
    sourceEl.addEventListener('pointercancel', onSwatchCancel);
}

function onSwatchMove(e) {
    if (!swatchDrag || e.pointerId !== swatchDrag.pointerId) return;
    const dx = e.clientX - swatchDrag.startX, dy = e.clientY - swatchDrag.startY;
    if (!swatchDrag.moved && Math.hypot(dx, dy) > DRAG_MOVE_THRESHOLD) {
        swatchDrag.moved = true;
        swatchDrag.sourceEl.classList.add('dragging');
        createSwatchGhost(swatchDrag);
    }
    if (swatchDrag.moved) moveSwatchGhost(e.clientX, e.clientY);
}

function onSwatchEnd(e) {
    if (!swatchDrag || e.pointerId !== swatchDrag.pointerId) return;
    const drag = swatchDrag;
    cleanupSwatchDrag();

    if (drag.moved) {
        const cell = findActiveCellAtPoint(e.clientX, e.clientY);
        if (cell) tryFillActive(drag.color);
    } else {
        tryFillActive(drag.color);
    }
}

function onSwatchCancel() {
    cleanupSwatchDrag();
}

function cleanupSwatchDrag() {
    if (!swatchDrag) return;
    swatchDrag.sourceEl.classList.remove('dragging');
    swatchDrag.sourceEl.removeEventListener('pointermove', onSwatchMove);
    swatchDrag.sourceEl.removeEventListener('pointerup', onSwatchEnd);
    swatchDrag.sourceEl.removeEventListener('pointercancel', onSwatchCancel);
    if (swatchDrag.ghostEl) swatchDrag.ghostEl.remove();
    swatchDrag = null;
}

function createSwatchGhost(drag) {
    const ghost = document.createElement('div');
    ghost.className = 'color-swatch drag-ghost';
    ghost.style.background = drag.color;
    document.body.appendChild(ghost);
    drag.ghostEl = ghost;
    moveSwatchGhost(drag.startX, drag.startY);
}

function moveSwatchGhost(x, y) {
    if (!swatchDrag || !swatchDrag.ghostEl) return;
    swatchDrag.ghostEl.style.left = x + 'px';
    swatchDrag.ghostEl.style.top = y + 'px';
}

function findActiveCellAtPoint(x, y) {
    if (swatchDrag && swatchDrag.ghostEl) swatchDrag.ghostEl.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (swatchDrag && swatchDrag.ghostEl) swatchDrag.ghostEl.style.display = '';
    return el ? el.closest('.snake-cell.active') : null;
}

/* ---------------------------------------------------------
   Verificacao (por celula, na ordem)
--------------------------------------------------------- */
function tryFillActive(color) {
    if (challengeComplete) return;
    const cell = cellsState[activeIndex];

    if (color === cell.color) {
        cell.filled = true;
        activeIndex++;
        renderSnake();

        if (activeIndex >= cellsState.length) {
            challengeComplete = true;
            HY.playWin();
            HY.score.correct();
            setTimeout(advanceChallenge, 900);
        }
    } else {
        HY.playLose();
        HY.score.wrong();
        shakeActiveCell();
    }
}

function shakeActiveCell() {
    const el = document.querySelector('.snake-cell.active');
    if (!el) return;
    el.classList.remove('shake-anim');
    void el.offsetWidth;
    el.classList.add('shake-anim');
    setTimeout(() => el.classList.remove('shake-anim'), 400);
}

function advanceChallenge() {
    if (challengeIdx >= CHALLENGES_PER_TRACK - 1) {
        finishTrack();
    } else {
        challengeIdx++;
        loadChallenge();
    }
}

function finishTrack() {
    const earned = HY.stars.trackComplete(currentTrack);
    HY.elapsed.stopTrail();
    document.getElementById('result-stars').textContent = '⭐'.repeat(earned) + '☆'.repeat(3 - earned);
    document.getElementById('result-modal').style.display = 'flex';
    updateGlobalStats();
}

function handleModalContinue() {
    document.getElementById('result-modal').style.display = 'none';
    changeScreen('tracks');
}

window.onload = init;
