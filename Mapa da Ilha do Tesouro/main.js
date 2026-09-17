HY.stars.init('mapa-ilha-tesouro');

const GRID_SIZE = 6;
const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const ICON_POOL = [
    '💰', '🦜', '⚓', '💎', '🗝️', '🐚', '🌴', '💀', '🍍', '⛵',
    '🥥', '🦀', '🐠', '🏝️', '🧭', '🪙', '🎣', '🦈', '🐡', '👑'
];

// Densidade de ícones decorativos por trilha — quanto mais avançada, mais "ruído" visual no mapa
const DECOY_COUNTS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15];

// ---- Desafio "Rota do Pirata" (penúltimo e último de cada trilha) ----
const ROUTE_GRID_SIZE = 8;
const ROUTE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const PIRATE_EMOJI = '🏴‍☠️';
const ROUTE_DIRS = {
    right: { dr: 0, dc: 1, arrow: '→' },
    left: { dr: 0, dc: -1, arrow: '←' },
    down: { dr: 1, dc: 0, arrow: '↓' },
    up: { dr: -1, dc: 0, arrow: '↑' }
};

let routeData = null;

let currentTrack = 0;
let challengeIdx = 0;
let mapIcons = [];
let targets = [];
let currentTarget = null;
let missingPart = 'letter';
let isMapLocked = false;
let awaitingCoordInput = false;

function init() {
    HY.stars.init('mapa-ilha-tesouro');
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
        emoji: () => '🗺️',
        accentColor: '#ffa800'
    });
}

function startTrack(idx) {
    currentTrack = idx;
    challengeIdx = 0;
    generateMap(idx);
    renderMap();
    HY.score.reset();
    changeScreen('game');
    loadChallenge();
}

function generateMap(idx) {
    const decoyCount = DECOY_COUNTS[idx];
    const totalIcons = CHALLENGES_PER_TRACK + decoyCount;

    const icons = HY.rand.pick(ICON_POOL, totalIcons);

    const allCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) allCells.push({ row: r, col: c });
    }
    const chosenCells = HY.rand.pick(allCells, totalIcons);

    mapIcons = icons.map((icon, i) => ({
        icon: icon,
        row: chosenCells[i].row,
        col: chosenCells[i].col
    }));

    targets = mapIcons.slice(0, CHALLENGES_PER_TRACK);
}

function renderMap() {
    const grid = document.getElementById('map-grid');
    let html = '<div class="map-label"></div>';

    for (let c = 0; c < GRID_SIZE; c++) {
        html += `<div class="map-label">${c + 1}</div>`;
    }

    for (let r = 0; r < GRID_SIZE; r++) {
        html += `<div class="map-label">${LETTERS[r]}</div>`;
        for (let c = 0; c < GRID_SIZE; c++) {
            const iconObj = mapIcons.find(m => m.row === r && m.col === c);
            const iconChar = iconObj ? iconObj.icon : '';
            html += `<div class="map-cell" data-row="${r}" data-col="${c}" onclick="handleCellClick(${r},${c},this)">${iconChar}</div>`;
        }
    }
    grid.innerHTML = html;
}

function isRouteChallenge(idx) {
    return idx >= CHALLENGES_PER_TRACK - 2;
}

function loadChallenge() {
    if (isRouteChallenge(challengeIdx)) {
        loadRouteChallenge();
    } else {
        loadMapChallenge();
    }
    HY.score.startChallenge();
}

function loadMapChallenge() {
    document.getElementById('route-challenge').classList.remove('active');
    document.querySelector('.game-layout').style.display = 'flex';

    currentTarget = targets[challengeIdx];
    missingPart = Math.random() < 0.5 ? 'letter' : 'number';
    isMapLocked = false;
    hideCoordPanel();
    document.getElementById('target-icon').textContent = currentTarget.icon;
}

function handleCellClick(row, col, el) {
    if (isMapLocked) return;

    if (row === currentTarget.row && col === currentTarget.col) {
        isMapLocked = true;
        el.classList.add('found');
        showCoordPanel();
    } else {
        el.classList.remove('shake-anim');
        void el.offsetWidth;
        el.classList.add('shake-anim');
        setTimeout(() => el.classList.remove('shake-anim'), 400);
    }
}

function showCoordPanel() {
    awaitingCoordInput = true;

    const letterBox = document.getElementById('coord-letter-box');
    const numberBox = document.getElementById('coord-number-box');
    letterBox.classList.remove('blank', 'state-correct', 'pop-in', 'shake-anim');
    numberBox.classList.remove('blank', 'state-correct', 'pop-in', 'shake-anim');

    const letterVal = LETTERS[currentTarget.row];
    const numberVal = String(currentTarget.col + 1);

    if (missingPart === 'letter') {
        letterBox.textContent = '?';
        letterBox.classList.add('blank');
        numberBox.textContent = numberVal;
    } else {
        numberBox.textContent = '?';
        numberBox.classList.add('blank');
        letterBox.textContent = letterVal;
    }

    document.getElementById('coord-hint').textContent =
        missingPart === 'letter' ? 'Complete a LETRA da linha' : 'Complete o NÚMERO da coluna';
    document.getElementById('coord-panel').classList.add('visible');
}

function hideCoordPanel() {
    awaitingCoordInput = false;
    document.getElementById('coord-panel').classList.remove('visible');
}

function onKeyDown(e) {
    if (!awaitingCoordInput) return;
    if (!document.getElementById('screen-game').classList.contains('active')) return;

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

function checkCoordAnswer(isCorrect, typedVal) {
    const blankBox = missingPart === 'letter'
        ? document.getElementById('coord-letter-box')
        : document.getElementById('coord-number-box');

    if (isCorrect) {
        awaitingCoordInput = false;
        HY.playWin();
        HY.score.correct();
        blankBox.textContent = typedVal;
        blankBox.classList.remove('blank');
        blankBox.classList.add('state-correct', 'pop-in');

        setTimeout(() => {
            if (challengeIdx >= CHALLENGES_PER_TRACK - 1) {
                finishTrack();
            } else {
                nextChallenge();
            }
        }, 900);
    } else {
        HY.playLose();
        HY.score.wrong();
        blankBox.classList.remove('pop-in', 'shake-anim');
        void blankBox.offsetWidth;
        blankBox.classList.add('shake-anim');
        setTimeout(() => blankBox.classList.remove('shake-anim'), 400);
    }
}

/* ---------------------------------------------------------
   Desafio "Rota do Pirata"
--------------------------------------------------------- */
function segmentsForRouteTrack(idx) {
    const block = Math.min(3, Math.floor(idx / 3));
    return 2 + block; // 2,3,4,5 curvas
}

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

function generateRouteChallenge() {
    const segmentCount = segmentsForRouteTrack(currentTrack);
    let result = null;
    for (let attempt = 0; attempt < 300 && !result; attempt++) {
        result = generateRoutePath(segmentCount);
    }
    if (!result) result = generateRoutePath(1);

    const { path, segments } = result;
    const destCell = path[path.length - 1];

    // Reaproveita os icones ja sorteados pro mapa 6x6 dessa trilha
    const iconPool = mapIcons.map(m => m.icon);
    const decorativeExtra = 1 + Math.floor(currentTrack / 4);
    const chosenIconCount = Math.min(iconPool.length, 3 + decorativeExtra);
    const chosenIcons = HY.rand.pick(iconPool, chosenIconCount);

    const correctIcon = chosenIcons[0];
    const decoyIcons = chosenIcons.slice(1);

    const pathExceptDest = path.slice(0, -1);
    const freeCells = [];
    for (let r = 0; r < ROUTE_GRID_SIZE; r++) {
        for (let c = 0; c < ROUTE_GRID_SIZE; c++) {
            const onPath = pathExceptDest.some(p => p.row === r && p.col === c) || (r === destCell.row && c === destCell.col);
            if (!onPath) freeCells.push({ row: r, col: c });
        }
    }
    const decorCells = HY.rand.pick(freeCells, decoyIcons.length);

    const iconCells = [{ row: destCell.row, col: destCell.col, icon: correctIcon }];
    decoyIcons.forEach((icon, i) => {
        if (decorCells[i]) iconCells.push({ row: decorCells[i].row, col: decorCells[i].col, icon });
    });

    const answerIcons = HY.shuffle([correctIcon, ...decoyIcons.slice(0, 2)]);

    routeData = {
        start: path[0],
        segments,
        iconCells,
        correctIcon,
        answerIcons
    };
}

function renderRouteGrid() {
    const grid = document.getElementById('route-grid');
    let html = '<div class="route-label"></div>';
    for (let c = 0; c < ROUTE_GRID_SIZE; c++) html += `<div class="route-label">${c + 1}</div>`;

    for (let r = 0; r < ROUTE_GRID_SIZE; r++) {
        html += `<div class="route-label">${ROUTE_LETTERS[r]}</div>`;
        for (let c = 0; c < ROUTE_GRID_SIZE; c++) {
            const isPirate = routeData.start.row === r && routeData.start.col === c;
            const iconCell = routeData.iconCells.find(ic => ic.row === r && ic.col === c);
            const content = isPirate ? PIRATE_EMOJI : (iconCell ? iconCell.icon : '');
            html += `<div class="route-cell${isPirate ? ' pirate-cell' : ''}">${content}</div>`;
        }
    }
    grid.innerHTML = html;
}

function renderRouteSteps() {
    const bar = document.getElementById('route-steps');
    bar.innerHTML = routeData.segments.map(seg =>
        `<div class="step-card"><div class="step-count">${seg.length}</div><div class="step-arrow">${ROUTE_DIRS[seg.dir].arrow}</div></div>`
    ).join('');
}

function renderRouteAnswers() {
    const box = document.getElementById('route-answers');
    box.innerHTML = '';
    routeData.answerIcons.forEach(icon => {
        const btn = document.createElement('button');
        btn.className = 'route-answer-btn';
        btn.textContent = icon;
        btn.onclick = () => checkRouteAnswer(icon, btn);
        box.appendChild(btn);
    });
}

function checkRouteAnswer(icon, btnEl) {
    if (icon === routeData.correctIcon) {
        HY.playWin();
        HY.score.correct();
        btnEl.classList.add('state-correct');
        document.querySelectorAll('.route-answer-btn').forEach(b => b.disabled = true);
        setTimeout(() => {
            if (challengeIdx >= CHALLENGES_PER_TRACK - 1) {
                finishTrack();
            } else {
                nextChallenge();
            }
        }, 900);
    } else {
        HY.playLose();
        HY.score.wrong();
        btnEl.classList.remove('shake-anim');
        void btnEl.offsetWidth;
        btnEl.classList.add('shake-anim');
        setTimeout(() => btnEl.classList.remove('shake-anim'), 400);
    }
}

function loadRouteChallenge() {
    document.querySelector('.game-layout').style.display = 'none';
    hideCoordPanel();
    generateRouteChallenge();
    renderRouteGrid();
    renderRouteSteps();
    renderRouteAnswers();
    document.getElementById('route-challenge').classList.add('active');
}

function nextChallenge() {
    const foundEl = document.querySelector('#map-grid .map-cell.found');
    if (foundEl) foundEl.classList.remove('found');
    challengeIdx++;
    loadChallenge();
}

function finishTrack() {
    const foundEl = document.querySelector('#map-grid .map-cell.found');
    if (foundEl) foundEl.classList.remove('found');

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

window.addEventListener('keydown', onKeyDown);
window.onload = init;
