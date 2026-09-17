HY.stars.init('espelho-magico');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;
const CHALLENGE_TYPES = ['mirror-select', 'mirror-select', 'mirror-select', 'color-fill', 'color-fill'];
const SIDES = ['top', 'bottom', 'left', 'right'];

const COLOR_PALETTE = ['#48076a', '#ffa800', '#d046d9', '#01bebc', '#6ce67d', '#ff3041', '#0a40b5'];

// Banco fixo de figuras (poliminos). Cada uma tem no maximo 7 celulas
// (mesmo tamanho da paleta), para que toda celula receba uma cor unica.
// Camada 'facil' = as 7 pecas classicas do Tetris (I, O, T, S, Z, J, L).
const SHAPE_DEFS = [
    // -- facil: tetrominos do Tetris (4 celulas) --
    { tier: 'facil', rows: 1, cols: 4, cells: [[0,0],[0,1],[0,2],[0,3]] },           // I
    { tier: 'facil', rows: 2, cols: 2, cells: [[0,0],[0,1],[1,0],[1,1]] },           // O
    { tier: 'facil', rows: 2, cols: 3, cells: [[0,0],[0,1],[0,2],[1,1]] },           // T
    { tier: 'facil', rows: 2, cols: 3, cells: [[0,1],[0,2],[1,0],[1,1]] },           // S
    { tier: 'facil', rows: 2, cols: 3, cells: [[0,0],[0,1],[1,1],[1,2]] },           // Z
    { tier: 'facil', rows: 2, cols: 3, cells: [[0,0],[1,0],[1,1],[1,2]] },           // J
    { tier: 'facil', rows: 2, cols: 3, cells: [[0,2],[1,0],[1,1],[1,2]] },           // L
    // -- medio: pentominos (5 celulas) --
    { tier: 'medio', rows: 3, cols: 3, cells: [[0,0],[0,1],[1,1],[1,2],[2,2]] },
    { tier: 'medio', rows: 3, cols: 3, cells: [[0,1],[1,0],[1,1],[1,2],[2,1]] },
    { tier: 'medio', rows: 2, cols: 3, cells: [[0,0],[0,1],[0,2],[1,0],[1,2]] },
    { tier: 'medio', rows: 3, cols: 3, cells: [[0,0],[1,0],[1,1],[2,1],[2,2]] },
    { tier: 'medio', rows: 3, cols: 2, cells: [[0,0],[0,1],[1,1],[2,0],[2,1]] },
    { tier: 'medio', rows: 3, cols: 3, cells: [[0,1],[1,1],[2,0],[2,1],[2,2]] },
    { tier: 'medio', rows: 4, cols: 2, cells: [[0,0],[1,0],[2,0],[3,0],[3,1]] },
    { tier: 'medio', rows: 3, cols: 2, cells: [[0,0],[0,1],[1,0],[1,1],[2,0]] },
    { tier: 'medio', rows: 4, cols: 2, cells: [[0,1],[1,0],[1,1],[2,0],[3,0]] },
    { tier: 'medio', rows: 4, cols: 2, cells: [[0,1],[1,0],[1,1],[2,1],[3,1]] },
    // -- dificil: hexominos/heptominos (6-7 celulas) --
    { tier: 'dificil', rows: 3, cols: 4, cells: [[0,0],[0,1],[1,1],[1,2],[2,2],[2,3]] },
    { tier: 'dificil', rows: 3, cols: 3, cells: [[0,0],[0,1],[0,2],[1,0],[2,0],[2,1]] },
    { tier: 'dificil', rows: 4, cols: 3, cells: [[0,1],[0,2],[1,0],[1,1],[2,1],[2,2],[3,2]] },
    { tier: 'dificil', rows: 4, cols: 3, cells: [[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]] },
    { tier: 'dificil', rows: 3, cols: 3, cells: [[0,0],[0,1],[0,2],[1,1],[2,0],[2,1],[2,2]] },
    { tier: 'dificil', rows: 3, cols: 3, cells: [[0,0],[0,1],[1,1],[1,2],[2,0],[2,1],[2,2]] },
    { tier: 'dificil', rows: 2, cols: 4, cells: [[0,0],[0,1],[0,2],[0,3],[1,0],[1,3]] },
    { tier: 'dificil', rows: 3, cols: 3, cells: [[0,0],[0,1],[1,1],[1,2],[2,1],[2,2]] },
    { tier: 'dificil', rows: 4, cols: 3, cells: [[0,0],[1,0],[1,1],[2,1],[3,1],[3,2]] },
    { tier: 'dificil', rows: 3, cols: 3, cells: [[0,1],[1,0],[1,1],[1,2],[2,0],[2,2]] },
];

function tierForTrack(idx) {
    if (idx < 4) return 'facil';
    if (idx < 8) return 'medio';
    return 'dificil';
}

function hintPercentForTrack(idx) {
    if (idx < 4) return 0.6;
    if (idx < 8) return 0.3;
    return 0;
}

let currentTrack = 0;
let challengeIdx = 0;
let challengeShapeDefs = [];
let currentChallenge = null;

function init() {
    HY.stars.init('espelho-magico');
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
        emoji: () => '🪞',
        accentColor: '#d046d9'
    });
}

function startTrack(idx) {
    currentTrack = idx;
    challengeIdx = 0;
    const tier = tierForTrack(idx);
    const fullPool = SHAPE_DEFS.filter(s => s.tier === tier);

    // Tipo 1 precisa de 3 opcoes distintas (eixo correto + 2 eixos errados).
    // Figuras com 1 linha/coluna (ex: peca I do Tetris) tem um eixo "de
    // mentira" onde refletir nao muda nada, o que colidiria duas opcoes.
    // Elas continuam disponiveis no Tipo 2, que so precisa de 1 resposta certa.
    const type1Pool = fullPool.filter(s => s.rows > 1 && s.cols > 1);
    const type1Shapes = HY.rand.pick(type1Pool.length ? type1Pool : fullPool, 3);
    const type2Shapes = HY.rand.pick(fullPool, 2);
    challengeShapeDefs = type1Shapes.concat(type2Shapes);

    HY.score.reset();
    changeScreen('game');
    loadChallenge();
}

/* ---------------------------------------------------------
   Geometria: instancia uma figura com cores unicas por celula
   e produz reflexos horizontais/verticais/duplos.
--------------------------------------------------------- */
// Evita eixos "de mentira": se a figura tem so 1 linha/coluna, refletir
// naquele eixo nao muda nada (viraria uma copia identica ao original).
function validSidesFor(def) {
    let sides = SIDES;
    if (def.rows === 1) sides = sides.filter(s => s !== 'top' && s !== 'bottom');
    if (def.cols === 1) sides = sides.filter(s => s !== 'left' && s !== 'right');
    return sides;
}

function pickSide(def) {
    const sides = validSidesFor(def);
    return sides[Math.floor(Math.random() * sides.length)];
}

function instantiateShape(def) {
    const palette = HY.shuffle(COLOR_PALETTE).slice(0, def.cells.length);
    const cells = def.cells.map(([r, c], i) => ({ r, c, color: palette[i] }));
    return { rows: def.rows, cols: def.cols, cells };
}

function reflectInstance(instance, axis) {
    const cells = instance.cells.map(cell => {
        let nr = cell.r, nc = cell.c;
        if (axis === 'v' || axis === 'hv') nr = instance.rows - 1 - cell.r;
        if (axis === 'h' || axis === 'hv') nc = instance.cols - 1 - cell.c;
        return { r: nr, c: nc, color: cell.color };
    });
    return { rows: instance.rows, cols: instance.cols, cells };
}

function cloneInstance(instance) {
    return { rows: instance.rows, cols: instance.cols, cells: instance.cells.map(c => ({ ...c })) };
}

/* ---------------------------------------------------------
   Renderizacao de uma figura numa grid CSS.
--------------------------------------------------------- */
function renderShapeGrid(container, instance, opts) {
    opts = opts || {};
    container.style.gridTemplateColumns = `repeat(${instance.cols}, var(--cell-size))`;
    container.style.gridTemplateRows = `repeat(${instance.rows}, var(--cell-size))`;

    const map = {};
    instance.cells.forEach(cell => { map[cell.r + '_' + cell.c] = cell; });

    let html = '';
    for (let r = 0; r < instance.rows; r++) {
        for (let c = 0; c < instance.cols; c++) {
            const cell = map[r + '_' + c];
            if (!cell) { html += '<div class="shape-cell empty"></div>'; continue; }
            if (cell.color) {
                html += `<div class="shape-cell filled" style="background:${cell.color};" data-r="${r}" data-c="${c}"></div>`;
            } else {
                html += `<div class="shape-cell blank" data-r="${r}" data-c="${c}"></div>`;
            }
        }
    }
    container.innerHTML = html;

    if (opts.onCellClick) {
        container.querySelectorAll('.shape-cell.blank').forEach(el => {
            el.onclick = () => opts.onCellClick(+el.dataset.r, +el.dataset.c, el);
        });
    }
}

/* ---------------------------------------------------------
   Carregamento de desafio
--------------------------------------------------------- */
function loadChallenge() {
    const type = CHALLENGE_TYPES[challengeIdx];
    const def = challengeShapeDefs[challengeIdx];
    document.getElementById('type1-area').style.display = 'none';
    document.getElementById('type2-area').style.display = 'none';

    if (type === 'mirror-select') {
        setupType1(def);
    } else {
        setupType2(def);
    }
    HY.score.startChallenge();
}

/* ---------------------------------------------------------
   Tipo 1 — escolher o reflexo correto entre 3 cards
--------------------------------------------------------- */
function setupType1(def) {
    document.getElementById('instruction').textContent = 'Qual é o reflexo correto?';
    document.getElementById('type1-area').style.display = 'flex';

    const original = instantiateShape(def);
    const side = pickSide(def);
    const axis = (side === 'top' || side === 'bottom') ? 'v' : 'h';
    const otherAxis = axis === 'v' ? 'h' : 'v';

    const correct = reflectInstance(original, axis);
    const wrong1 = reflectInstance(original, otherAxis);
    const wrong2 = reflectInstance(original, 'hv');

    const options = HY.shuffle([
        { instance: correct, isCorrect: true },
        { instance: wrong1, isCorrect: false },
        { instance: wrong2, isCorrect: false }
    ]);

    currentChallenge = { type: 'mirror-select', locked: false };

    const figureArea = document.getElementById('figure-area');
    figureArea.className = 'figure-area side-' + side;
    figureArea.innerHTML = '';

    const shapeEl = document.createElement('div');
    shapeEl.className = 'shape-grid';
    const barEl = document.createElement('div');
    barEl.className = 'mirror-bar';
    barEl.textContent = '🪞';

    if (side === 'left' || side === 'top') {
        figureArea.appendChild(barEl);
        figureArea.appendChild(shapeEl);
    } else {
        figureArea.appendChild(shapeEl);
        figureArea.appendChild(barEl);
    }
    renderShapeGrid(shapeEl, original);

    const optionsRow = document.getElementById('options-row');
    optionsRow.innerHTML = '';
    options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'option-card';
        const grid = document.createElement('div');
        grid.className = 'shape-grid mini';
        card.appendChild(grid);
        card.onclick = () => handleType1Choice(opt.isCorrect, card);
        optionsRow.appendChild(card);
        renderShapeGrid(grid, opt.instance);
    });
}

function handleType1Choice(isCorrect, cardEl) {
    if (currentChallenge.locked) return;

    if (isCorrect) {
        currentChallenge.locked = true;
        HY.playWin();
        HY.score.correct();
        cardEl.classList.add('state-correct', 'pop-in');
        setTimeout(advanceChallenge, 900);
    } else {
        HY.playLose();
        HY.score.wrong();
        cardEl.classList.add('shake-anim');
        setTimeout(() => cardEl.classList.add('wrong-disabled'), 400);
    }
}

/* ---------------------------------------------------------
   Tipo 2 — colorir a figura espelhada
--------------------------------------------------------- */
function setupType2(def) {
    document.getElementById('instruction').textContent = 'Clique num quadrado vazio e depois na cor certa';
    document.getElementById('type2-area').style.display = 'flex';

    const original = instantiateShape(def);
    const side = pickSide(def);
    const axis = (side === 'top' || side === 'bottom') ? 'v' : 'h';
    const mirroredFull = reflectInstance(original, axis);

    const hintPercent = hintPercentForTrack(currentTrack);
    const n = mirroredFull.cells.length;
    const blankCount = Math.max(1, Math.round(n * (1 - hintPercent)));
    const blankIdxs = new Set(HY.shuffle(mirroredFull.cells.map((_, i) => i)).slice(0, blankCount));

    const mirroredDisplay = cloneInstance(mirroredFull);
    mirroredDisplay.cells.forEach((cell, i) => { if (blankIdxs.has(i)) cell.color = null; });

    currentChallenge = {
        type: 'color-fill',
        mirroredFull: mirroredFull,
        remaining: blankCount,
        selected: null
    };

    renderShapeGrid(document.getElementById('original-grid'), original);
    renderShapeGrid(document.getElementById('mirrored-grid'), mirroredDisplay, {
        onCellClick: handleType2CellClick
    });

    const paletteColors = HY.shuffle(original.cells.map(c => c.color));
    const paletteRow = document.getElementById('palette-row');
    paletteRow.innerHTML = '';
    paletteColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'palette-swatch';
        swatch.style.background = color;
        swatch.onclick = () => handlePaletteClick(color, swatch);
        paletteRow.appendChild(swatch);
    });
}

function handleType2CellClick(r, c, el) {
    document.querySelectorAll('#mirrored-grid .shape-cell.selected').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    currentChallenge.selected = { r, c, el };
}

function handlePaletteClick(color, swatchEl) {
    const sel = currentChallenge.selected;
    if (!sel) return;

    const target = currentChallenge.mirroredFull.cells.find(cell => cell.r === sel.r && cell.c === sel.c);

    if (target.color === color) {
        HY.playWin();
        sel.el.classList.remove('blank', 'selected');
        sel.el.classList.add('filled');
        sel.el.style.background = color;
        currentChallenge.selected = null;
        currentChallenge.remaining--;

        if (currentChallenge.remaining <= 0) {
            HY.score.correct();
            setTimeout(advanceChallenge, 900);
        }
    } else {
        HY.playLose();
        HY.score.wrong();
        swatchEl.classList.remove('shake-anim');
        void swatchEl.offsetWidth;
        swatchEl.classList.add('shake-anim');
        setTimeout(() => swatchEl.classList.remove('shake-anim'), 400);
    }
}

/* ---------------------------------------------------------
   Avanco de desafio / trilha
--------------------------------------------------------- */
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
