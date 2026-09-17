HY.stars.init('qual-e-o-proximo');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;

const COLOR_PALETTE = ['#48076a', '#ffa800', '#d046d9', '#01bebc', '#6ce67d', '#ff3041', '#0a40b5'];

// Banco de formas (poliminos). A rotacao agora e geometrica de verdade —
// a forma inteira gira, as cores vao coladas nela (nao ha celulas "fixas"
// nem troca de cor entre casas: e a mesma pecinha rigida virando no espaco).
const SHAPE_DEFS = [
    { tier: 'facil', rows: 1, cols: 4, cells: [[0,0],[0,1],[0,2],[0,3]] },           // I
    { tier: 'facil', rows: 2, cols: 2, cells: [[0,0],[0,1],[1,0],[1,1]] },           // O
    { tier: 'facil', rows: 2, cols: 3, cells: [[0,0],[0,1],[0,2],[1,1]] },           // T
    { tier: 'facil', rows: 2, cols: 3, cells: [[0,1],[0,2],[1,0],[1,1]] },           // S
    { tier: 'facil', rows: 2, cols: 3, cells: [[0,0],[0,1],[1,1],[1,2]] },           // Z
    { tier: 'facil', rows: 2, cols: 3, cells: [[0,0],[1,0],[1,1],[1,2]] },           // J
    { tier: 'facil', rows: 2, cols: 3, cells: [[0,2],[1,0],[1,1],[1,2]] },           // L
    { tier: 'medio', rows: 3, cols: 3, cells: [[0,0],[0,1],[1,1],[1,2],[2,2]] },
    { tier: 'medio', rows: 3, cols: 3, cells: [[0,1],[1,0],[1,1],[1,2],[2,1]] },
    { tier: 'medio', rows: 2, cols: 3, cells: [[0,0],[0,1],[0,2],[1,0],[1,2]] },
    { tier: 'medio', rows: 3, cols: 3, cells: [[0,0],[1,0],[1,1],[2,1],[2,2]] },
    { tier: 'medio', rows: 3, cols: 2, cells: [[0,0],[0,1],[1,1],[2,0],[2,1]] },
    { tier: 'medio', rows: 3, cols: 3, cells: [[0,1],[1,1],[2,0],[2,1],[2,2]] },
    { tier: 'medio', rows: 4, cols: 2, cells: [[0,0],[1,0],[2,0],[3,0],[3,1]] },
    { tier: 'medio', rows: 3, cols: 2, cells: [[0,0],[0,1],[1,0],[1,1],[2,0]] },
    { tier: 'dificil', rows: 3, cols: 4, cells: [[0,0],[0,1],[1,1],[1,2],[2,2],[2,3]] },
    { tier: 'dificil', rows: 3, cols: 3, cells: [[0,0],[0,1],[0,2],[1,0],[2,0],[2,1]] },
    { tier: 'dificil', rows: 4, cols: 3, cells: [[0,1],[0,2],[1,0],[1,1],[2,1],[2,2],[3,2]] },
    { tier: 'dificil', rows: 4, cols: 3, cells: [[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]] },
    { tier: 'dificil', rows: 3, cols: 3, cells: [[0,0],[0,1],[0,2],[1,1],[2,0],[2,1],[2,2]] },
];

function tierForTrack(idx) {
    if (idx < 4) return 'facil';
    if (idx < 8) return 'medio';
    return 'dificil';
}

let currentTrack = 0;
let challengeIdx = 0;
let currentChallenge = null;
let trackIncrements = []; // garante mistura de 90/180 nos 5 desafios da trilha

function init() {
    HY.stars.init('qual-e-o-proximo');
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
        emoji: () => '🔮',
        accentColor: '#01bebc'
    });
}

function startTrack(idx) {
    currentTrack = idx;
    challengeIdx = 0;
    // sorteia 2 ou 3 desafios de 90 (o resto 180) e embaralha a ordem, pra
    // nunca sair uma trilha inteira so com um dos dois tipos de giro.
    const ninetyCount = 2 + Math.floor(Math.random() * 2); // 2 ou 3
    trackIncrements = HY.shuffle(
        Array(CHALLENGES_PER_TRACK).fill(0).map((_, i) => i < ninetyCount ? rotate90 : rotate180)
    );
    HY.score.reset();
    changeScreen('game');
    loadChallenge();
}

function renderShapeGrid(container, instance) {
    container.style.gridTemplateColumns = `repeat(${instance.cols}, var(--cell-size))`;
    container.style.gridTemplateRows = `repeat(${instance.rows}, var(--cell-size))`;

    const map = {};
    instance.cells.forEach(cell => { map[cell.r + '_' + cell.c] = cell; });

    let html = '';
    for (let r = 0; r < instance.rows; r++) {
        for (let c = 0; c < instance.cols; c++) {
            const cell = map[r + '_' + c];
            if (!cell) { html += '<div class="shape-cell empty"></div>'; continue; }
            html += `<div class="shape-cell filled" style="background:${cell.color};"></div>`;
        }
    }
    container.innerHTML = html;
}

/* ---------------------------------------------------------
   Rotacao geometrica de verdade: a pecinha inteira gira, as
   cores vao coladas em cada quadradinho (nao trocam de lugar
   sozinhas). 90 graus troca linhas por colunas (o contorno pode
   "deitar"); 180 graus mantem o tamanho e vira de ponta-cabeca.
--------------------------------------------------------- */
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

function mirrorH(instance) {
    const cells = instance.cells.map(cell => ({
        r: cell.r,
        c: instance.cols - 1 - cell.c,
        color: cell.color
    }));
    return { rows: instance.rows, cols: instance.cols, cells };
}

function instantiateShape(def) {
    const palette = HY.shuffle(COLOR_PALETTE).slice(0, def.cells.length);
    const cells = def.cells.map(([r, c], i) => ({ r, c, color: palette[i] }));
    return { rows: def.rows, cols: def.cols, cells };
}

function instanceKey(inst) {
    return inst.rows + 'x' + inst.cols + ':' + inst.cells.map(c => c.r + '_' + c.c + '_' + c.color).sort().join(',');
}

function generateChallenge() {
    const tier = tierForTrack(currentTrack);
    const pool = SHAPE_DEFS.filter(s => s.tier === tier);
    const shapeDef = pool[Math.floor(Math.random() * pool.length)];
    const base = instantiateShape(shapeDef);

    const rotateStep = trackIncrements[challengeIdx] || (Math.random() < 0.5 ? rotate90 : rotate180);
    const cardCount = 4 + Math.floor(Math.random() * 5); // varia entre 4 e 8

    const states = [base];
    for (let i = 0; i < cardCount; i++) states.push(rotateStep(states[states.length - 1]));
    const correctInstance = states[cardCount];
    const wrong1Instance = rotateStep(correctInstance); // girou um passo alem do certo

    // distratora 2: espelhada (nao girada). Formas com simetria (quadrado,
    // reta) podem fazer o espelho coincidir com outra opcao ja usada — nesse
    // caso tenta outras variantes ate achar uma genuinamente diferente.
    const usedKeys = states.concat([wrong1Instance]).map(instanceKey);
    const candidates = [
        mirrorH(correctInstance),
        mirrorH(wrong1Instance),
        mirrorH(states[0]),
        rotateStep(rotateStep(wrong1Instance)),
        { rows: correctInstance.rows, cols: correctInstance.cols, cells: HY.shuffle(correctInstance.cells.map(c => c.color)).map((color, i) => ({ ...correctInstance.cells[i], color })) }
    ];
    let wrong2Instance = candidates.find(cand => !usedKeys.includes(instanceKey(cand)));
    if (!wrong2Instance) wrong2Instance = candidates[candidates.length - 1];

    const sequence = states.slice(0, cardCount);
    const options = HY.shuffle([
        { instance: correctInstance, isCorrect: true },
        { instance: wrong1Instance, isCorrect: false },
        { instance: wrong2Instance, isCorrect: false }
    ]);

    return { sequence, options };
}

/* ---------------------------------------------------------
   Carregamento / renderizacao do desafio
--------------------------------------------------------- */
function loadChallenge() {
    currentChallenge = generateChallenge();
    currentChallenge.locked = false;

    const seqRow = document.getElementById('sequence-row');
    seqRow.innerHTML = '';
    currentChallenge.sequence.forEach(inst => {
        const card = document.createElement('div');
        card.className = 'sequence-card';
        const grid = document.createElement('div');
        grid.className = 'shape-grid';
        card.appendChild(grid);
        seqRow.appendChild(card);
        renderShapeGrid(grid, inst);
    });
    const placeholder = document.createElement('div');
    placeholder.className = 'sequence-card placeholder';
    placeholder.textContent = '?';
    seqRow.appendChild(placeholder);

    const optionsRow = document.getElementById('options-row');
    optionsRow.innerHTML = '';
    currentChallenge.options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'option-card';
        const grid = document.createElement('div');
        grid.className = 'shape-grid mini';
        card.appendChild(grid);
        card.onclick = () => handleChoice(opt.isCorrect, card);
        optionsRow.appendChild(card);
        renderShapeGrid(grid, opt.instance);
    });

    HY.score.startChallenge();
}

function handleChoice(isCorrect, cardEl) {
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
