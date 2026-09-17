HY.stars.init('sudoku-magico');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;
const CATEGORY_ORDER = ['cores', 'formas', 'emoji', 'numeros', 'letras'];

const COLOR_PALETTE = ['#48076a', '#ffa800', '#d046d9', '#01bebc', '#6ce67d', '#ff3041', '#0a40b5'];
const SHAPE_GLYPHS = ['●', '■', '▲', '★', '◆', '⬢'];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const EMOJI_CATEGORIES = [
    { name: 'animais', emojis: ['🐶', '🐱', '🐰', '🐻', '🦁', '🐸', '🐷', '🐵'] },
    { name: 'frutas', emojis: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍍', '🥝'] },
    { name: 'roupas', emojis: ['👕', '👖', '🧦', '🧤', '🧣', '👗', '👟', '🎩'] },
    { name: 'veiculos', emojis: ['🚗', '🚕', '🚙', '🚌', '🚓', '🚑', '🚒', '🚀'] },
];

const INSTRUCTION_BY_CATEGORY = {
    cores: 'Complete o Sudoku com as cores certas!',
    formas: 'Complete o Sudoku com as formas certas!',
    emoji: 'Complete o Sudoku com os emojis certos!',
    numeros: 'Complete o Sudoku com os números certos!',
    letras: 'Complete o Sudoku com as letras certas!'
};

function gridSizeForTrack(idx) {
    if (idx < 3) return 3;
    if (idx < 6) return 4;
    return 6;
}

function boxDimsForSize(n) {
    if (n === 4) return { boxRows: 2, boxCols: 2 };
    if (n === 6) return { boxRows: 2, boxCols: 3 };
    return null; // 3x3 nao tem quadrante, so linha/coluna
}

function emojiCategoryForTrack(idx) {
    return EMOJI_CATEGORIES[idx % EMOJI_CATEGORIES.length];
}

let currentTrack = 0;
let challengeIdx = 0;
let gridN = 0;
let boxDims = null;
let cellsState = []; // [{r,c,solutionIdx,given,filled}]
let symbols = []; // [{kind:'color'|'text', value}]
let challengeComplete = false;
let selectedCellIdx = null;
let selectedSymbolIdx = null;

function init() {
    HY.stars.init('sudoku-magico');
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
        emoji: () => '🧩',
        accentColor: '#d046d9'
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
   Geracao da solucao valida (backtracking respeitando linha,
   coluna e quadrante quando existir).
--------------------------------------------------------- */
function generateSolution(n, box) {
    const grid = Array.from({ length: n }, () => Array(n).fill(null));

    function valid(r, c, v) {
        for (let i = 0; i < n; i++) {
            if (grid[r][i] === v) return false;
            if (grid[i][c] === v) return false;
        }
        if (box) {
            const br = Math.floor(r / box.boxRows) * box.boxRows;
            const bc = Math.floor(c / box.boxCols) * box.boxCols;
            for (let rr = br; rr < br + box.boxRows; rr++) {
                for (let cc = bc; cc < bc + box.boxCols; cc++) {
                    if (grid[rr][cc] === v) return false;
                }
            }
        }
        return true;
    }

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

    fill(0);
    return grid;
}

/* ---------------------------------------------------------
   Remocao segura de casas.

   Uma checagem "so essa casa isolada" nao basta: remover uma
   casa B depois pode invalidar a unicidade de uma casa A ja
   removida antes (A so tinha 1 candidato por causa de uma pista
   que virou B). Por isso, a cada casa candidata a ficar em
   branco, resolvemos o quebra-cabeca INTEIRO (todas as brancas
   ate agora + a nova) por eliminacao simples repetida; so
   confirmamos a remocao se essa eliminacao sozinha resolve tudo.
--------------------------------------------------------- */
function candidatesFor(grid, n, box, r, c) {
    const used = new Set();
    for (let i = 0; i < n; i++) {
        if (i !== c && grid[r][i] !== null) used.add(grid[r][i]);
        if (i !== r && grid[i][c] !== null) used.add(grid[i][c]);
    }
    if (box) {
        const br = Math.floor(r / box.boxRows) * box.boxRows;
        const bc = Math.floor(c / box.boxCols) * box.boxCols;
        for (let rr = br; rr < br + box.boxRows; rr++) {
            for (let cc = bc; cc < bc + box.boxCols; cc++) {
                if (!(rr === r && cc === c) && grid[rr][cc] !== null) used.add(grid[rr][cc]);
            }
        }
    }
    const all = Array.from({ length: n }, (_, i) => i);
    return all.filter(v => !used.has(v));
}

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
                return false; // nunca deveria acontecer com uma solucao valida
            }
        }
    }
    return remaining.size === 0;
}

// Tetos de casas reveladas: no total, no maximo 1/3 do grid; e nenhum
// simbolo especifico pode ter mais da metade das suas proprias ocorrencias
// reveladas (cada simbolo aparece exatamente N vezes num sudoku NxN).
function maxTotalGivens(n) {
    return Math.floor((n * n) / 3);
}
function maxGivensPerSymbol(n) {
    return Math.max(1, Math.floor(n / 2));
}

function attemptPuzzle(solution, n, box) {
    const cells = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cells.push([r, c]);

    let blankKeys = [];
    HY.shuffle(cells).forEach(([r, c]) => {
        const candidateKeys = blankKeys.concat([r + '_' + c]);
        if (isSolvableByElimination(candidateKeys, n, box, solution)) {
            blankKeys = candidateKeys;
        }
        // senao, essa casa fica como given (nao entra em blankKeys)
    });

    // Garante pelo menos 1 casa ja revelada por linha e por coluna — devolver
    // uma casa pra "given" so adiciona informacao, entao nunca quebra a
    // resolubilidade por eliminacao ja confirmada acima. Entre as candidatas
    // da linha/coluna descoberta, prioriza devolver a de um simbolo ainda
    // pouco representado nos givens, pra ajudar a respeitar o teto por simbolo.
    const blankSet = new Set(blankKeys);
    function currentGivenSymbolCounts() {
        const counts = new Array(n).fill(0);
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (!blankSet.has(r + '_' + c)) counts[solution[r][c]]++;
            }
        }
        return counts;
    }
    function ensureGivenPerLine(count, isRow) {
        for (let i = 0; i < count; i++) {
            const lineKeys = [...blankSet].filter(key => {
                const [r, c] = key.split('_').map(Number);
                return isRow ? r === i : c === i;
            });
            const allBlank = lineKeys.length === n;
            if (allBlank) {
                const symCounts = currentGivenSymbolCounts();
                lineKeys.sort((a, b) => {
                    const [ar, ac] = a.split('_').map(Number);
                    const [br, bc] = b.split('_').map(Number);
                    return symCounts[solution[ar][ac]] - symCounts[solution[br][bc]];
                });
                blankSet.delete(lineKeys[0]);
            }
        }
    }
    ensureGivenPerLine(n, true);
    ensureGivenPerLine(n, false);
    blankKeys = [...blankSet];

    const givenKeys = cells.map(([r, c]) => r + '_' + c).filter(key => !blankSet.has(key));
    const symCounts = new Array(n).fill(0);
    givenKeys.forEach(key => {
        const [r, c] = key.split('_').map(Number);
        symCounts[solution[r][c]]++;
    });

    const violation = Math.max(0, givenKeys.length - maxTotalGivens(n)) +
        symCounts.reduce((acc, count) => acc + Math.max(0, count - maxGivensPerSymbol(n)), 0);

    const grid = solution.map(row => row.slice());
    blankKeys.forEach(key => {
        const [r, c] = key.split('_').map(Number);
        grid[r][c] = null;
    });
    return { grid, givenCount: givenKeys.length, violation };
}

function makePuzzle(solution, n, box) {
    let best = null;
    for (let attempt = 0; attempt < 40; attempt++) {
        const result = attemptPuzzle(solution, n, box);
        if (result.violation === 0) return result.grid; // satisfaz os dois tetos, aceita na hora
        if (!best || result.violation < best.violation ||
            (result.violation === best.violation && result.givenCount < best.givenCount)) {
            best = result;
        }
    }
    return best.grid; // nenhuma tentativa satisfez os tetos 100%; usa a mais proxima
}

/* ---------------------------------------------------------
   Simbolos por categoria
--------------------------------------------------------- */
function symbolPoolForCategory(category, n) {
    if (category === 'cores') {
        return HY.shuffle(COLOR_PALETTE).slice(0, n).map(v => ({ kind: 'color', value: v }));
    }
    if (category === 'formas') {
        return HY.shuffle(SHAPE_GLYPHS).slice(0, n).map(v => ({ kind: 'text', value: v }));
    }
    if (category === 'numeros') {
        return Array.from({ length: n }, (_, i) => ({ kind: 'text', value: String(i + 1) }));
    }
    if (category === 'letras') {
        return Array.from({ length: n }, (_, i) => ({ kind: 'text', value: LETTERS[i] }));
    }
    // emoji
    const cat = emojiCategoryForTrack(currentTrack);
    return HY.shuffle(cat.emojis).slice(0, n).map(v => ({ kind: 'text', value: v }));
}

/* ---------------------------------------------------------
   Carregamento de desafio
--------------------------------------------------------- */
function loadChallenge() {
    gridN = gridSizeForTrack(currentTrack);
    boxDims = boxDimsForSize(gridN);
    const category = CATEGORY_ORDER[challengeIdx];

    const solution = generateSolution(gridN, boxDims);
    const puzzle = makePuzzle(solution, gridN, boxDims);
    symbols = symbolPoolForCategory(category, gridN);

    cellsState = [];
    for (let r = 0; r < gridN; r++) {
        for (let c = 0; c < gridN; c++) {
            const given = puzzle[r][c] !== null;
            cellsState.push({ r, c, solutionIdx: solution[r][c], given, filled: given });
        }
    }

    challengeComplete = false;
    selectedCellIdx = null;
    selectedSymbolIdx = null;

    document.getElementById('instruction').textContent = INSTRUCTION_BY_CATEGORY[category];
    renderGrid();
    renderTray();
    HY.score.startChallenge();
}

/* ---------------------------------------------------------
   Renderizacao
--------------------------------------------------------- */
function renderSymbolContent(el, symbol) {
    if (symbol.kind === 'color') {
        el.style.background = symbol.value;
        el.textContent = '';
    } else {
        el.textContent = symbol.value;
    }
}

function renderGrid() {
    const gridEl = document.getElementById('sudoku-grid');
    // 1 faixa extra na ponta de cada eixo pras setas de "sentido sem repeticao"
    gridEl.style.gridTemplateColumns = `repeat(${gridN}, var(--cell-size)) calc(var(--cell-size) * 0.55)`;
    gridEl.style.gridTemplateRows = `repeat(${gridN}, var(--cell-size)) calc(var(--cell-size) * 0.55)`;
    gridEl.innerHTML = '';

    cellsState.forEach((cell, idx) => {
        const el = document.createElement('div');
        let cls = 'sudoku-cell';
        if (cell.given) cls += ' given';
        else if (cell.filled) cls += ' filled';
        else {
            cls += ' blank';
            if (idx === selectedCellIdx) cls += ' selected';
        }
        if (boxDims) {
            if ((cell.c + 1) % boxDims.boxCols === 0 && cell.c !== gridN - 1) cls += ' box-right';
            if ((cell.r + 1) % boxDims.boxRows === 0 && cell.r !== gridN - 1) cls += ' box-bottom';
        }
        el.className = cls;
        el.dataset.idx = idx;
        el.style.gridRow = cell.r + 1;
        el.style.gridColumn = cell.c + 1;

        if (cell.given || cell.filled) {
            renderSymbolContent(el, symbols[cell.solutionIdx]);
        } else {
            el.onclick = () => onCellClick(idx);
        }
        gridEl.appendChild(el);
    });

    for (let r = 0; r < gridN; r++) {
        const arrow = document.createElement('div');
        arrow.className = 'line-arrow row-arrow';
        arrow.textContent = '→';
        arrow.style.gridRow = r + 1;
        arrow.style.gridColumn = gridN + 1;
        gridEl.appendChild(arrow);
    }
    for (let c = 0; c < gridN; c++) {
        const arrow = document.createElement('div');
        arrow.className = 'line-arrow col-arrow';
        arrow.textContent = '→';
        arrow.style.gridRow = gridN + 1;
        arrow.style.gridColumn = c + 1;
        gridEl.appendChild(arrow);
    }
}

function renderTray() {
    const tray = document.getElementById('symbol-tray');
    tray.innerHTML = '';
    symbols.forEach((symbol, idx) => {
        const el = document.createElement('div');
        el.className = 'symbol-swatch';
        renderSymbolContent(el, symbol);
        el.dataset.symbolIdx = idx;
        el.addEventListener('pointerdown', (e) => startSymbolDrag(e, el, idx));
        tray.appendChild(el);
    });
}

function updateSelectionHighlight() {
    document.querySelectorAll('.sudoku-cell.blank').forEach(el => {
        el.classList.toggle('selected', +el.dataset.idx === selectedCellIdx);
    });
    document.querySelectorAll('.symbol-swatch').forEach(el => {
        el.classList.toggle('selected', +el.dataset.symbolIdx === selectedSymbolIdx);
    });
}

/* ---------------------------------------------------------
   Selecao por clique (celula e simbolo podem ser clicados em
   qualquer ordem; quando os dois estao selecionados, tenta
   preencher).
--------------------------------------------------------- */
function onCellClick(idx) {
    if (challengeComplete) return;
    const cell = cellsState[idx];
    if (cell.filled) return;
    selectedCellIdx = (selectedCellIdx === idx) ? null : idx;
    updateSelectionHighlight();
    attemptFillFromSelection();
}

function onSymbolClick(symIdx) {
    if (challengeComplete) return;
    selectedSymbolIdx = (selectedSymbolIdx === symIdx) ? null : symIdx;
    updateSelectionHighlight();
    attemptFillFromSelection();
}

function attemptFillFromSelection() {
    if (selectedCellIdx !== null && selectedSymbolIdx !== null) {
        const cellIdx = selectedCellIdx, symIdx = selectedSymbolIdx;
        selectedCellIdx = null;
        selectedSymbolIdx = null;
        tryFillCell(cellIdx, symIdx);
    }
}

/* ---------------------------------------------------------
   Arrastar via Pointer Events (mesmo padrao dos outros jogos).
   Clique sem mover = selecao (acima); mover = arrasta e solta
   em cima de uma casa em branco qualquer.
--------------------------------------------------------- */
const DRAG_MOVE_THRESHOLD = 6;
let symbolDrag = null;

function startSymbolDrag(e, sourceEl, symIdx) {
    if (e.button !== undefined && e.button !== 0) return;
    if (challengeComplete) return;
    e.preventDefault();
    try { sourceEl.setPointerCapture(e.pointerId); } catch (err) { /* ignora */ }

    symbolDrag = { pointerId: e.pointerId, symIdx, sourceEl, ghostEl: null, startX: e.clientX, startY: e.clientY, moved: false };
    sourceEl.addEventListener('pointermove', onSymbolDragMove);
    sourceEl.addEventListener('pointerup', onSymbolDragEnd);
    sourceEl.addEventListener('pointercancel', onSymbolDragCancel);
}

function onSymbolDragMove(e) {
    if (!symbolDrag || e.pointerId !== symbolDrag.pointerId) return;
    const dx = e.clientX - symbolDrag.startX, dy = e.clientY - symbolDrag.startY;
    if (!symbolDrag.moved && Math.hypot(dx, dy) > DRAG_MOVE_THRESHOLD) {
        symbolDrag.moved = true;
        symbolDrag.sourceEl.classList.add('dragging');
        createSymbolGhost(symbolDrag);
    }
    if (symbolDrag.moved) moveSymbolGhost(e.clientX, e.clientY);
}

function onSymbolDragEnd(e) {
    if (!symbolDrag || e.pointerId !== symbolDrag.pointerId) return;
    const drag = symbolDrag;
    cleanupSymbolDrag();

    if (drag.moved) {
        const cell = findBlankCellAtPoint(e.clientX, e.clientY);
        if (cell) tryFillCell(+cell.dataset.idx, drag.symIdx);
    } else {
        onSymbolClick(drag.symIdx);
    }
}

function onSymbolDragCancel() {
    cleanupSymbolDrag();
}

function cleanupSymbolDrag() {
    if (!symbolDrag) return;
    symbolDrag.sourceEl.classList.remove('dragging');
    symbolDrag.sourceEl.removeEventListener('pointermove', onSymbolDragMove);
    symbolDrag.sourceEl.removeEventListener('pointerup', onSymbolDragEnd);
    symbolDrag.sourceEl.removeEventListener('pointercancel', onSymbolDragCancel);
    if (symbolDrag.ghostEl) symbolDrag.ghostEl.remove();
    symbolDrag = null;
}

function createSymbolGhost(drag) {
    const symbol = symbols[drag.symIdx];
    const ghost = document.createElement('div');
    ghost.className = 'symbol-swatch drag-ghost';
    renderSymbolContent(ghost, symbol);
    document.body.appendChild(ghost);
    drag.ghostEl = ghost;
    moveSymbolGhost(drag.startX, drag.startY);
}

function moveSymbolGhost(x, y) {
    if (!symbolDrag || !symbolDrag.ghostEl) return;
    symbolDrag.ghostEl.style.left = x + 'px';
    symbolDrag.ghostEl.style.top = y + 'px';
}

function findBlankCellAtPoint(x, y) {
    if (symbolDrag && symbolDrag.ghostEl) symbolDrag.ghostEl.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (symbolDrag && symbolDrag.ghostEl) symbolDrag.ghostEl.style.display = '';
    return el ? el.closest('.sudoku-cell.blank') : null;
}

/* ---------------------------------------------------------
   Verificacao
--------------------------------------------------------- */
function tryFillCell(cellIdx, symIdx) {
    if (challengeComplete) return;
    const cell = cellsState[cellIdx];
    if (cell.filled) return;

    if (symIdx === cell.solutionIdx) {
        cell.filled = true;
        renderGrid();
        checkComplete();
    } else {
        HY.playLose();
        HY.score.wrong();
        shakeCell(cellIdx);
        updateSelectionHighlight();
    }
}

function shakeCell(cellIdx) {
    const el = document.querySelector(`.sudoku-cell[data-idx="${cellIdx}"]`);
    if (!el) return;
    el.classList.remove('shake-anim');
    void el.offsetWidth;
    el.classList.add('shake-anim');
    setTimeout(() => el.classList.remove('shake-anim'), 400);
}

function checkComplete() {
    const allFilled = cellsState.every(c => c.filled);
    if (!allFilled) return;

    challengeComplete = true;
    HY.playWin();
    HY.score.correct();
    setTimeout(advanceChallenge, 900);
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
