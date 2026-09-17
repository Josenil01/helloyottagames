HY.stars.init('grafico-em-acao');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;
const MAX_VALUE = 8;

const THEMES = [
    { name: 'roupas', types: [
        { icon: '🧢', label: 'Gorros' }, { icon: '👕', label: 'Camisetas' },
        { icon: '👖', label: 'Calças' }, { icon: '🧣', label: 'Cachecóis' }
    ]},
    { name: 'frutas', types: [
        { icon: '🍎', label: 'Maçãs' }, { icon: '🍌', label: 'Bananas' },
        { icon: '🍇', label: 'Uvas' }, { icon: '🍓', label: 'Morangos' }
    ]},
    { name: 'formas', types: [
        { icon: '●', label: 'Círculos' }, { icon: '■', label: 'Quadrados' },
        { icon: '▲', label: 'Triângulos' }, { icon: '★', label: 'Estrelas' }
    ]},
    { name: 'animais', types: [
        { icon: '🐶', label: 'Cachorros' }, { icon: '🐱', label: 'Gatos' },
        { icon: '🐰', label: 'Coelhos' }, { icon: '🐦', label: 'Passarinhos' }
    ]},
];

const COLORS = [
    { name: 'Verde', hex: '#6ce67d' },
    { name: 'Azul-claro', hex: '#01bebc' },
    { name: 'Laranja', hex: '#ffa800' },
    { name: 'Azul', hex: '#0a40b5' },
];

function chartTypeForTrack(idx) {
    if (idx < 3) return 'vbar';
    if (idx < 6) return 'hbar';
    if (idx < 9) return 'pie';
    return 'line';
}

function totalItemsRangeForTrack(idx) {
    const posInBlock = idx % 3;
    if (posInBlock === 0) return [6, 8];
    if (posInBlock === 1) return [8, 11];
    return [10, 14];
}

let currentTrack = 0;
let challengeIdx = 0;
let chartType = 'vbar';
let scene = null;
let panels = null; // { type: [{icon,label,color,correct}], color: [...] }
let values = { type: [0, 0, 0, 0], color: [0, 0, 0, 0] };
let pieAssign = { type: [], color: [] };
let selectedWedge = { type: null, color: null };
let currentChallengeState = { type: ['', '', '', ''], color: ['', '', '', ''] };

function init() {
    HY.stars.init('grafico-em-acao');
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
        emoji: (i) => ({ vbar: '📊', hbar: '📈', pie: '🥧', line: '📉' }[chartTypeForTrack(i)]),
        accentColor: '#ffa800'
    });
}

function startTrack(idx) {
    currentTrack = idx;
    challengeIdx = 0;
    chartType = chartTypeForTrack(idx);
    HY.score.reset();
    changeScreen('game');
    loadChallenge();
}

/* ---------------------------------------------------------
   Geracao de dados: particao aleatoria + tabela de contingencia
   garantindo que a soma por tipo e por cor batam com o mesmo
   conjunto de itens.
--------------------------------------------------------- */
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

function generateScene() {
    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const [minT, maxT] = totalItemsRangeForTrack(currentTrack);
    const totalItems = minT + Math.floor(Math.random() * (maxT - minT + 1));

    const typeCounts = randomPartition(totalItems, 4, 1, MAX_VALUE);
    const colorCounts = randomPartition(totalItems, 4, 1, MAX_VALUE);
    const table = buildContingencyTable(typeCounts, colorCounts);

    const items = [];
    for (let t = 0; t < 4; t++) {
        for (let c = 0; c < 4; c++) {
            for (let k = 0; k < table[t][c]; k++) items.push({ type: t, color: c });
        }
    }
    return { theme, items, typeCounts, colorCounts, totalItems };
}

function buildPanels(sceneData) {
    const typeCats = sceneData.theme.types.map((t, i) => ({
        icon: t.icon, label: t.label, color: COLORS[i].hex, correct: sceneData.typeCounts[i]
    }));
    const colorCats = COLORS.map((c, i) => ({
        icon: '🖌️', label: c.name, color: c.hex, correct: sceneData.colorCounts[i]
    }));
    return { type: typeCats, color: colorCats };
}

/* ---------------------------------------------------------
   Renderizacao da cena (nuvem de itens espalhados)
--------------------------------------------------------- */
function layoutPositions(n) {
    const cols = Math.max(1, Math.ceil(Math.sqrt(n * 1.4)));
    const rows = Math.ceil(n / cols);
    const cellW = 100 / cols, cellH = 100 / rows;
    const cells = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ r, c });
    return HY.shuffle(cells).slice(0, n).map(cell => ({
        leftPct: cell.c * cellW + cellW * 0.15 + Math.random() * cellW * 0.5,
        topPct: cell.r * cellH + cellH * 0.15 + Math.random() * cellH * 0.5,
        rot: Math.random() * 30 - 15
    }));
}

function renderScene() {
    const area = document.getElementById('scene-area');
    const positions = layoutPositions(scene.items.length);
    let html = '';
    scene.items.forEach((item, i) => {
        const pos = positions[i];
        const icon = scene.theme.types[item.type].icon;
        const color = COLORS[item.color].hex;
        html += `<div class="scene-item" style="left:${pos.leftPct}%;top:${pos.topPct}%;background:${color};transform:translate(-50%,-50%) rotate(${pos.rot}deg);">${icon}</div>`;
    });
    area.innerHTML = html;
}

/* ---------------------------------------------------------
   Carregamento de desafio
--------------------------------------------------------- */
function loadChallenge() {
    scene = generateScene();
    panels = buildPanels(scene);
    values = { type: [0, 0, 0, 0], color: [0, 0, 0, 0] };
    pieAssign = { type: new Array(scene.totalItems).fill(null), color: new Array(scene.totalItems).fill(null) };
    selectedWedge = { type: null, color: null };

    const labels = {
        vbar: 'Clique nas colunas para montar a barra certa!',
        hbar: 'Clique para preencher a barra até o número certo!',
        pie: 'Clique numa fatia e depois na cor certa!',
        line: 'Clique na altura certa para marcar cada ponto!'
    };
    document.getElementById('instruction').textContent = labels[chartType];
    document.getElementById('verify-btn').disabled = false;

    renderScene();
    renderPanels();
    HY.score.startChallenge();
}

/* ---------------------------------------------------------
   Renderizacao dos paineis (dispatch por tipo de grafico)
--------------------------------------------------------- */
function renderPanels() {
    ['type', 'color'].forEach(key => {
        const container = document.getElementById('panel-' + key);
        if (chartType === 'vbar') renderTrackVertical(container, key, false);
        else if (chartType === 'line') renderTrackVertical(container, key, true);
        else if (chartType === 'hbar') renderTrackHorizontal(container, key);
        else if (chartType === 'pie') renderPie(container, key);
    });
}

function cellsMarkup(key, catIdx, value, isLine, horizontal) {
    let html = '';
    for (let i = 0; i < MAX_VALUE; i++) {
        const filled = i < value;
        let style = '';
        let cls = 'cell';
        if (isLine) {
            cls += ' tick';
            if (i === value - 1) { cls += ' dot-active'; style = `--dot-bg:${panels[key][catIdx].color}`; }
        } else if (filled) {
            style = `background:${panels[key][catIdx].color};`;
        }
        html += `<div class="${cls}" style="${style}" data-key="${key}" data-cat="${catIdx}" data-cell="${i}" onclick="handleCellClick('${key}',${catIdx},${i})"></div>`;
    }
    return html;
}

function renderTrackVertical(container, key, isLine) {
    let html = `<div class="track-row" id="track-row-${key}">`;
    panels[key].forEach((cat, i) => {
        const state = currentChallengeState[key] ? currentChallengeState[key][i] : '';
        html += `<div class="track-col ${state}" id="track-col-${key}-${i}">`;
        html += `<div class="cells-vertical">${cellsMarkup(key, i, values[key][i], isLine, false)}</div>`;
        html += `<div class="track-icon">${cat.icon}</div>`;
        html += `</div>`;
    });
    html += `</div>`;
    container.innerHTML = html;

    if (isLine) drawLineOverlay(container, key);
}

function drawLineOverlay(container, key) {
    const row = container.querySelector('.track-row');
    const cols = [...row.querySelectorAll('.track-col')];
    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('class', 'line-svg');
    row.style.position = 'relative';
    row.appendChild(svg);

    const points = [];
    cols.forEach((col, i) => {
        const val = values[key][i];
        if (val <= 0) return;
        const dot = col.querySelector('.cell.dot-active');
        if (!dot) return;
        const dotRect = dot.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        const cx = dotRect.left - rowRect.left + dotRect.width / 2;
        const cy = dotRect.top - rowRect.top + dotRect.height / 2;
        points.push({ x: cx, y: cy, color: panels[key][i].color });
    });

    if (points.length >= 2) {
        for (let i = 0; i < points.length - 1; i++) {
            const line = document.createElementNS(svgNs, 'line');
            line.setAttribute('x1', points[i].x);
            line.setAttribute('y1', points[i].y);
            line.setAttribute('x2', points[i + 1].x);
            line.setAttribute('y2', points[i + 1].y);
            line.setAttribute('stroke', '#fff');
            line.setAttribute('stroke-width', '3');
            svg.appendChild(line);
        }
    }
    points.forEach(p => {
        const circle = document.createElementNS(svgNs, 'circle');
        circle.setAttribute('cx', p.x);
        circle.setAttribute('cy', p.y);
        circle.setAttribute('r', 6);
        circle.setAttribute('fill', p.color);
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);
    });
}

function renderTrackHorizontal(container, key) {
    let html = `<div class="track-rows-h">`;
    panels[key].forEach((cat, i) => {
        const state = currentChallengeState[key] ? currentChallengeState[key][i] : '';
        html += `<div class="track-row-h ${state}" id="track-col-${key}-${i}">`;
        html += `<div class="track-icon">${cat.icon}</div>`;
        html += `<div class="cells-horizontal">${cellsMarkup(key, i, values[key][i], false, true)}</div>`;
        html += `</div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

/* ---------------------------------------------------------
   Pizza
--------------------------------------------------------- */
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

function renderPie(container, key) {
    const n = scene.totalItems;
    const cx = 75, cy = 75, r = 70;
    const svgNs = 'http://www.w3.org/2000/svg';
    let svgInner = '';
    for (let i = 0; i < n; i++) {
        const a1 = (360 / n) * i, a2 = (360 / n) * (i + 1);
        const assigned = pieAssign[key][i];
        const fill = assigned !== null ? panels[key][assigned].color : 'rgba(255,255,255,0.2)';
        const sel = selectedWedge[key] === i ? ' selected' : '';
        svgInner += `<path class="pie-wedge${sel}" d="${wedgePath(cx, cy, r, a1, a2)}" fill="${fill}" data-key="${key}" data-wedge="${i}" onclick="handleWedgeClick('${key}',${i})"></path>`;
    }

    let legendHtml = '<div class="pie-legend">';
    panels[key].forEach((cat, i) => {
        const state = currentChallengeState[key] ? currentChallengeState[key][i] : '';
        legendHtml += `<div class="legend-item ${state}" onclick="handleSwatchClick('${key}',${i})">`;
        legendHtml += `<div class="legend-swatch" style="background:${cat.color}">${cat.icon}</div>`;
        legendHtml += `</div>`;
    });
    legendHtml += '</div>';

    container.innerHTML = `<div class="pie-wrap"><svg class="pie-svg" viewBox="0 0 150 150">${svgInner}</svg></div>${legendHtml}`;
}

/* ---------------------------------------------------------
   Interacao
--------------------------------------------------------- */
function clearCatState(key, catIdx) {
    if (currentChallengeState[key]) currentChallengeState[key][catIdx] = '';
}

function handleCellClick(key, catIdx, cellIdx) {
    values[key][catIdx] = cellIdx + 1;
    clearCatState(key, catIdx);
    renderPanels();
}

function handleWedgeClick(key, wedgeIdx) {
    selectedWedge[key] = wedgeIdx;
    renderPanels();
}

function handleSwatchClick(key, catIdx) {
    const wedge = selectedWedge[key];
    if (wedge === null || wedge === undefined) return;
    pieAssign[key][wedge] = catIdx;
    selectedWedge[key] = null;
    recomputeValuesFromPie(key);
    renderPanels();
}

function recomputeValuesFromPie(key) {
    const counts = [0, 0, 0, 0];
    pieAssign[key].forEach(a => { if (a !== null) counts[a]++; });
    values[key] = counts;
}

/* ---------------------------------------------------------
   Verificacao
--------------------------------------------------------- */
function handleVerify() {
    let allCorrect = true;
    ['type', 'color'].forEach(key => {
        panels[key].forEach((cat, i) => {
            const ok = values[key][i] === cat.correct;
            currentChallengeState[key][i] = ok ? 'correct' : 'wrong';
            if (!ok) allCorrect = false;
        });
    });
    renderPanels();

    if (allCorrect) {
        HY.playWin();
        HY.score.correct();
        document.getElementById('verify-btn').disabled = true;
        setTimeout(advanceChallenge, 1100);
    } else {
        HY.playLose();
        HY.score.wrong();
    }
}

function advanceChallenge() {
    currentChallengeState = { type: ['', '', '', ''], color: ['', '', '', ''] };
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
