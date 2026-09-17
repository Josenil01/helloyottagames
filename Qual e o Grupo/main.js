HY.stars.init('qual-e-o-grupo');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;

// Vermelho, amarelo, azul — misturam pra laranja/verde/roxo nas intersecoes
// via mix-blend-mode:multiply (mistura optica real, nao aproximada).
const CIRCLE_COLORS = ['#e63946', '#ffd60a', '#3a86ff'];

const THEMES = [
    {
        labels: ['Voa', 'Tem 4 patas', 'Vive na água'],
        items: [
            { icon: '🦆', tags: [true, false, true] },
            { icon: '🐧', tags: [false, false, true] },
            { icon: '🐟', tags: [false, false, true] },
            { icon: '🦈', tags: [false, false, true] },
            { icon: '🦅', tags: [true, false, false] },
            { icon: '🐝', tags: [true, false, false] },
            { icon: '🦋', tags: [true, false, false] },
            { icon: '🐶', tags: [false, true, false] },
            { icon: '🐱', tags: [false, true, false] },
            { icon: '🐴', tags: [false, true, false] },
            { icon: '🐭', tags: [false, true, false] },
            { icon: '🐊', tags: [false, true, true] },
            { icon: '🐢', tags: [false, true, true] },
            { icon: '🐜', tags: [false, false, false] },
            { icon: '🕷️', tags: [false, false, false] },
            { icon: '🐌', tags: [false, false, false] }
        ]
    },
    {
        labels: ['Doce', 'Vermelho', 'Redondo'],
        items: [
            { icon: '🍎', tags: [true, true, true] },
            { icon: '🍒', tags: [true, true, true] },
            { icon: '🍓', tags: [true, true, false] },
            { icon: '🍅', tags: [false, true, true] },
            { icon: '🌶️', tags: [false, true, false] },
            { icon: '🍊', tags: [true, false, true] },
            { icon: '🍇', tags: [true, false, true] },
            { icon: '🍋', tags: [false, false, true] },
            { icon: '🍌', tags: [true, false, false] },
            { icon: '⚽', tags: [false, false, true] },
            { icon: '🥑', tags: [false, false, false] },
            { icon: '🥦', tags: [false, false, false] },
            { icon: '🍆', tags: [false, false, false] },
            { icon: '🥕', tags: [false, false, false] }
        ]
    },
    {
        labels: ['Anda na água', 'Tem asas', 'Tem rodas'],
        items: [
            { icon: '🚗', tags: [false, false, true] },
            { icon: '🚲', tags: [false, false, true] },
            { icon: '🛵', tags: [false, false, true] },
            { icon: '🚂', tags: [false, false, true] },
            { icon: '🛹', tags: [false, false, true] },
            { icon: '✈️', tags: [false, true, true] },
            { icon: '🚁', tags: [false, true, false] },
            { icon: '⛵', tags: [true, false, false] },
            { icon: '🚤', tags: [true, false, false] },
            { icon: '🛥️', tags: [true, false, false] },
            { icon: '🎈', tags: [false, false, false] },
            { icon: '🚀', tags: [false, false, false] }
        ]
    },
    {
        labels: ['Usa bola', 'Jogado em equipe', 'Praticado na água'],
        items: [
            { icon: '⚽', tags: [true, true, false] },
            { icon: '🏀', tags: [true, true, false] },
            { icon: '🏐', tags: [true, true, false] },
            { icon: '🏈', tags: [true, true, false] },
            { icon: '🎾', tags: [true, false, false] },
            { icon: '🏓', tags: [true, false, false] },
            { icon: '🏊', tags: [false, false, true] },
            { icon: '🤽', tags: [true, true, true] },
            { icon: '🏄', tags: [false, false, true] },
            { icon: '🚣', tags: [false, true, true] },
            { icon: '🥊', tags: [false, false, false] },
            { icon: '🏃', tags: [false, false, false] },
            { icon: '🧗', tags: [false, false, false] },
            { icon: '🤸', tags: [false, false, false] }
        ]
    },
    {
        labels: ['Frio', 'Molhado', 'Vem do céu'],
        items: [
            { icon: '❄️', tags: [true, true, true] },
            { icon: '☃️', tags: [true, false, false] },
            { icon: '🌧️', tags: [false, true, true] },
            { icon: '⛈️', tags: [false, true, true] },
            { icon: '☀️', tags: [false, false, true] },
            { icon: '🌈', tags: [false, false, true] },
            { icon: '🧊', tags: [true, true, false] },
            { icon: '🥶', tags: [true, false, false] },
            { icon: '💧', tags: [false, true, false] },
            { icon: '🌊', tags: [false, true, false] },
            { icon: '🔥', tags: [false, false, false] },
            { icon: '🌵', tags: [false, false, false] },
            { icon: '🏜️', tags: [false, false, false] }
        ]
    },
    {
        labels: ['Usa pra escrever', 'Cabe na mochila', 'É elétrico'],
        items: [
            { icon: '✏️', tags: [true, true, false] },
            { icon: '🖊️', tags: [true, true, false] },
            { icon: '🖍️', tags: [true, true, false] },
            { icon: '📏', tags: [false, true, false] },
            { icon: '✂️', tags: [false, true, false] },
            { icon: '📓', tags: [false, true, false] },
            { icon: '📚', tags: [false, true, false] },
            { icon: '💻', tags: [true, true, true] },
            { icon: '📱', tags: [true, true, true] },
            { icon: '🖥️', tags: [true, false, true] },
            { icon: '🔌', tags: [false, false, true] },
            { icon: '💡', tags: [false, false, true] },
            { icon: '🎒', tags: [false, false, false] },
            { icon: '🧸', tags: [false, false, false] }
        ]
    },
    {
        labels: ['Brilha', 'É redondo', 'Fica longe da Terra'],
        items: [
            { icon: '⭐', tags: [true, false, true] },
            { icon: '🌟', tags: [true, false, true] },
            { icon: '🌙', tags: [true, true, true] },
            { icon: '🪐', tags: [false, true, true] },
            { icon: '🌍', tags: [false, true, false] },
            { icon: '👽', tags: [false, false, true] },
            { icon: '🛸', tags: [false, false, true] },
            { icon: '💫', tags: [true, false, true] },
            { icon: '🔦', tags: [true, false, false] },
            { icon: '💡', tags: [true, false, false] },
            { icon: '🪨', tags: [false, false, false] },
            { icon: '🚀', tags: [false, false, false] }
        ]
    }
];

const CIRCLE_COUNT_BY_BLOCK = [2, 2, 3, 3];
const ITEM_COUNT_BY_BLOCK = [6, 8, 9, 11];

let currentTrack = 0;
let challengeIdx = 0;
let currentCircles = [];
let currentLabels = [];
let items = [];
let selectedItemId = null;

function init() {
    HY.stars.init('qual-e-o-grupo');
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
        emoji: () => '🎯',
        accentColor: '#48076a'
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
   Progressao por bloco de trilhas
--------------------------------------------------------- */
function blockForTrack(idx) {
    return Math.min(3, Math.floor(idx / 3));
}

/* ---------------------------------------------------------
   Geometria do diagrama
--------------------------------------------------------- */
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

function computeUniverseRect(circles, margin) {
    const minX = Math.min(...circles.map(c => c.cx - c.r)) - margin;
    const maxX = Math.max(...circles.map(c => c.cx + c.r)) + margin;
    const minY = Math.min(...circles.map(c => c.cy - c.r)) - margin;
    const maxY = Math.max(...circles.map(c => c.cy + c.r)) + margin;
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function isInsideRect(pt, rect) {
    return pt.x >= rect.x && pt.x <= rect.x + rect.width && pt.y >= rect.y && pt.y <= rect.y + rect.height;
}

function computeRegion(pt, circles) {
    return circles.map(c => Math.hypot(pt.x - c.cx, pt.y - c.cy) <= c.r);
}

function clientToSvgPoint(svg, clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scaleX = vb.width / rect.width;
    const scaleY = vb.height / rect.height;
    return {
        x: vb.x + (clientX - rect.left) * scaleX,
        y: vb.y + (clientY - rect.top) * scaleY
    };
}

/* ---------------------------------------------------------
   Geracao do desafio
--------------------------------------------------------- */
function generateChallenge() {
    const block = blockForTrack(currentTrack);
    const circleCount = CIRCLE_COUNT_BY_BLOCK[block];
    const itemCount = ITEM_COUNT_BY_BLOCK[block];
    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const chosenItems = HY.rand.pick(theme.items, Math.min(itemCount, theme.items.length));

    currentCircles = getCircleLayout(circleCount);
    currentLabels = theme.labels.slice(0, circleCount);
    items = chosenItems.map((it, i) => ({
        id: 'item' + i,
        icon: it.icon,
        tags: it.tags,
        location: 'tray',
        x: null,
        y: null,
        feedback: null
    }));
    selectedItemId = null;
}

function loadChallenge() {
    generateChallenge();
    renderLegend();
    renderVennSvg();
    renderAll();
    HY.score.startChallenge();
}

/* ---------------------------------------------------------
   Renderizacao
--------------------------------------------------------- */
function renderLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = currentLabels.map((label, i) =>
        `<div class="legend-item"><span class="legend-swatch" style="background:${CIRCLE_COLORS[i]}"></span>${label}</div>`
    ).join('');
}

function renderVennSvg() {
    const svg = document.getElementById('venn-svg');
    const rect = computeUniverseRect(currentCircles, 15);

    let html = `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" rx="16" fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.35)" stroke-width="2"></rect>`;

    currentCircles.forEach((c, i) => {
        html += `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${CIRCLE_COLORS[i]}" fill-opacity="0.55" style="mix-blend-mode:multiply"></circle>`;
    });

    if (currentCircles.length === 3) {
        const centerX = (currentCircles[0].cx + currentCircles[1].cx + currentCircles[2].cx) / 3;
        const centerY = (currentCircles[0].cy + currentCircles[1].cy + currentCircles[2].cy) / 3;
        const whiteR = currentCircles[0].r * 0.28;
        html += `<circle cx="${centerX}" cy="${centerY}" r="${whiteR}" fill="#ffffff"></circle>`;
    }

    html += `<g id="placed-items-layer"></g>`;
    svg.innerHTML = html;
    svg.onclick = handleDiagramClick;
}

function renderAll() {
    renderTray();
    renderPlacedItems();
}

function renderTray() {
    const tray = document.getElementById('item-tray');
    tray.innerHTML = '';
    items.filter(i => i.location === 'tray').forEach(item => {
        const el = document.createElement('div');
        el.className = 'tray-item draggable' + (item.id === selectedItemId ? ' selected' : '');
        el.dataset.itemId = item.id;
        el.textContent = item.icon;
        el.addEventListener('pointerdown', (e) => startPointerDrag(e, el, item.id));
        tray.appendChild(el);
    });
}

function renderPlacedItems() {
    const g = document.getElementById('placed-items-layer');
    if (!g) return;
    g.innerHTML = items.filter(i => i.location === 'placed').map(item => {
        const cls = ['venn-item'];
        if (item.id === selectedItemId) cls.push('selected');
        if (item.feedback === 'correct') cls.push('state-correct');
        if (item.feedback === 'wrong') cls.push('state-wrong');
        return `<text x="${item.x}" y="${item.y}" class="${cls.join(' ')}" data-item-id="${item.id}" text-anchor="middle" dominant-baseline="central">${item.icon}</text>`;
    }).join('');
    g.querySelectorAll('.venn-item').forEach(el => {
        const id = el.dataset.itemId;
        el.addEventListener('pointerdown', (e) => startPointerDrag(e, el, id));
    });
}

/* ---------------------------------------------------------
   Interacao: clicar (selecionar + clicar no diagrama) ou arrastar
--------------------------------------------------------- */
function handleDiagramClick(e) {
    if (!selectedItemId) return;
    const svg = document.getElementById('venn-svg');
    const pt = clientToSvgPoint(svg, e.clientX, e.clientY);
    const rect = computeUniverseRect(currentCircles, 15);
    if (!isInsideRect(pt, rect)) return;

    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;
    item.location = 'placed';
    item.x = pt.x;
    item.y = pt.y;
    item.feedback = null;
    selectedItemId = null;
    renderAll();
}

function verifyDiagram() {
    let allCorrect = true;

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
        if (!itemCorrect) allCorrect = false;
    });

    renderAll();

    if (allCorrect) {
        HY.playWin();
        HY.score.correct();
        setTimeout(() => {
            if (challengeIdx >= CHALLENGES_PER_TRACK - 1) finishTrack();
            else nextChallenge();
        }, 900);
    } else {
        HY.playLose();
        HY.score.wrong();
        const wrap = document.getElementById('diagram-wrap');
        wrap.classList.remove('shake-anim');
        void wrap.offsetWidth;
        wrap.classList.add('shake-anim');
        setTimeout(() => wrap.classList.remove('shake-anim'), 400);
    }
}

/* ---------------------------------------------------------
   Arrastar via Pointer Events
--------------------------------------------------------- */
const DRAG_MOVE_THRESHOLD = 6;
let pointerDrag = null;

function startPointerDrag(e, sourceEl, itemId) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    try { sourceEl.setPointerCapture(e.pointerId); } catch (err) { /* ignora se nao suportado */ }

    pointerDrag = {
        pointerId: e.pointerId,
        itemId,
        sourceEl,
        ghostEl: null,
        startX: e.clientX,
        startY: e.clientY,
        moved: false
    };

    sourceEl.addEventListener('pointermove', onPointerDragMove);
    sourceEl.addEventListener('pointerup', onPointerDragEnd);
    sourceEl.addEventListener('pointercancel', onPointerDragCancel);
}

function onPointerDragMove(e) {
    if (!pointerDrag || e.pointerId !== pointerDrag.pointerId) return;
    const dx = e.clientX - pointerDrag.startX;
    const dy = e.clientY - pointerDrag.startY;

    if (!pointerDrag.moved && Math.hypot(dx, dy) > DRAG_MOVE_THRESHOLD) {
        pointerDrag.moved = true;
        pointerDrag.sourceEl.classList.add('dragging');
        createGhost(pointerDrag);
    }
    if (pointerDrag.moved) moveGhost(e.clientX, e.clientY);
}

function onPointerDragEnd(e) {
    if (!pointerDrag || e.pointerId !== pointerDrag.pointerId) return;
    const drag = pointerDrag;
    cleanupPointerDrag();

    const item = items.find(i => i.id === drag.itemId);
    if (!item) return;

    if (drag.moved) {
        const svg = document.getElementById('venn-svg');
        const pt = clientToSvgPoint(svg, e.clientX, e.clientY);
        const rect = computeUniverseRect(currentCircles, 15);
        if (isInsideRect(pt, rect)) {
            item.location = 'placed';
            item.x = pt.x;
            item.y = pt.y;
        } else {
            item.location = 'tray';
            item.x = null;
            item.y = null;
        }
        item.feedback = null;
        selectedItemId = null;
        renderAll();
    } else if (item.location === 'placed') {
        item.location = 'tray';
        item.x = null;
        item.y = null;
        item.feedback = null;
        selectedItemId = null;
        renderAll();
    } else {
        selectedItemId = selectedItemId === drag.itemId ? null : drag.itemId;
        renderAll();
    }
}

function onPointerDragCancel() {
    cleanupPointerDrag();
}

function cleanupPointerDrag() {
    if (!pointerDrag) return;
    pointerDrag.sourceEl.classList.remove('dragging');
    pointerDrag.sourceEl.removeEventListener('pointermove', onPointerDragMove);
    pointerDrag.sourceEl.removeEventListener('pointerup', onPointerDragEnd);
    pointerDrag.sourceEl.removeEventListener('pointercancel', onPointerDragCancel);
    if (pointerDrag.ghostEl) pointerDrag.ghostEl.remove();
    pointerDrag = null;
}

function createGhost(drag) {
    const item = items.find(i => i.id === drag.itemId);
    const ghost = document.createElement('div');
    ghost.className = 'tray-item drag-ghost';
    ghost.textContent = item.icon;
    document.body.appendChild(ghost);
    drag.ghostEl = ghost;
    moveGhost(drag.startX, drag.startY);
}

function moveGhost(x, y) {
    if (!pointerDrag || !pointerDrag.ghostEl) return;
    pointerDrag.ghostEl.style.left = x + 'px';
    pointerDrag.ghostEl.style.top = y + 'px';
}

/* ---------------------------------------------------------
   Fluxo geral
--------------------------------------------------------- */
function nextChallenge() {
    challengeIdx++;
    loadChallenge();
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
