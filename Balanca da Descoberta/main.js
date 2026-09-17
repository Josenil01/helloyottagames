HY.stars.init('balanca-descoberta');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;

const OBJECT_POOL = [
    '🍎', '🍌', '🍉', '🎈', '⚽', '📚', '🧸', '🎁',
    '🍕', '🍩', '🚗', '🐶', '🐱', '🍇', '🥕', '🧦'
];

// 5 objetos fixos usados nos desafios 1-3 do jogo inteiro (nunca mudam) — so
// o peso de cada um eh sorteado de novo a cada desafio.
const FIXED_OBJECTS = ['🍎', '🍌', '🎈', '⚽', '📚'];
const MAX_OBJECT_WEIGHT = 20;

const WEIGHT_RANGE_BY_BLOCK = [
    { min: 1, max: 10 },
    { min: 1, max: 20 },
    { min: 1, max: 30 },
    { min: 1, max: 40 }
];
const TRAY_SIZE_BY_BLOCK = [2, 3, 4, 5];

const MAX_TILT_ANGLE = 15;
const TILT_SENSITIVITY = 2.5;

let currentTrack = 0;
let challengeIdx = 0;

// ---- Estado do desafio "Descubra o Peso" ----
let currentWeights = [];
let currentBlankIdx = 0;
let currentPairIndices = [];

// ---- Estado do desafio "Equilibre a Balança" ----
let targetObjectWeight = 0;
let targetObjectEmoji = '';
let trayItems = [];
let selectedTrayItemId = null;

function init() {
    HY.stars.init('balanca-descoberta');
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
        emoji: () => '⚖️',
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
   Progressao por bloco de trilhas
--------------------------------------------------------- */
function blockForTrack(idx) {
    return Math.min(3, Math.floor(idx / 3));
}

function isBalanceChallenge(idx) {
    return idx >= CHALLENGES_PER_TRACK - 2;
}

function loadChallenge() {
    // Desafios 4-5 agora usam a mesma mecanica de "Descubra o Peso" dos 1-3
    // (o jogador nao gostou do drag-and-drop). loadBalanceChallenge() fica
    // sem uso, mas o codigo continua no arquivo por causa da regra do
    // projeto de nunca apagar codigo existente.
    loadWeightChallenge();
    HY.score.startChallenge();
}

/* ---------------------------------------------------------
   Desenho da balanca (SVG) — viga + pratos giram juntos ao
   redor do pino central, animando via transform + transicao CSS.
--------------------------------------------------------- */
function buildScaleSvg(svg, prefix) {
    svg.innerHTML = `
        <ellipse cx="200" cy="248" rx="75" ry="10" fill="#6b4226"></ellipse>
        <rect x="185" y="175" width="30" height="75" rx="4" fill="#8b5e34"></rect>
        <circle cx="200" cy="172" r="10" fill="#ffd54f" stroke="#8b5e34" stroke-width="2"></circle>
        <g id="${prefix}-beam" style="transform-origin: 200px 172px; transition: transform 0.4s ease;">
            <rect x="55" y="167" width="290" height="10" rx="4" fill="#8b5e34"></rect>
            <line x1="80" y1="172" x2="80" y2="215" stroke="#8b5e34" stroke-width="3"></line>
            <path class="pan-zone" data-zone="pan" onclick="handleZoneClick('pan')" d="M45,215 Q80,250 115,215 Z" fill="#c9924a" stroke="#8b5e34" stroke-width="2"></path>
            <g id="${prefix}-left-content" style="pointer-events:none;"></g>
            <line x1="320" y1="172" x2="320" y2="215" stroke="#8b5e34" stroke-width="3"></line>
            <path d="M285,215 Q320,250 355,215 Z" fill="#c9924a" stroke="#8b5e34" stroke-width="2"></path>
            <g id="${prefix}-right-content" style="pointer-events:none;"></g>
        </g>
    `;
}

function setScaleAngle(prefix, angleDeg) {
    const beam = document.getElementById(`${prefix}-beam`);
    if (beam) beam.style.transform = `rotate(${angleDeg}deg)`;
}

function renderPanItems(prefix, side, items) {
    const g = document.getElementById(`${prefix}-${side}-content`);
    if (!g) return;
    const centerX = side === 'left' ? 80 : 320;
    const spacing = 30;
    const startX = centerX - (items.length - 1) * spacing / 2;
    g.innerHTML = items.map((item, i) => {
        const x = startX + i * spacing;
        const onclickAttr = item.onclick ? `onclick="${item.onclick}" style="pointer-events:auto; cursor:pointer;"` : '';
        return `<text x="${x}" y="195" font-size="${item.fontSize || 22}" text-anchor="middle" ${onclickAttr}>${item.label}</text>`;
    }).join('');
}

// Angulo positivo = lado direito mais pesado (desce). leftWeight/rightWeight
// sao os valores usados so pra ESSA comparacao visual (nem sempre o peso
// fisico real de cada prato — no desafio de digitar, o "peso" da direita eh
// o palpite atual do jogador, nao os blocos de referencia mostrados).
function computeTiltAngle(leftWeight, rightWeight) {
    const diff = rightWeight - leftWeight;
    return Math.max(-MAX_TILT_ANGLE, Math.min(MAX_TILT_ANGLE, diff * TILT_SENSITIVITY));
}

function handleZoneClick(zone) {
    if (selectedTrayItemId) {
        moveTrayItemTo(selectedTrayItemId, zone === 'pan' ? 'pan' : 'tray');
        selectedTrayItemId = null;
    }
}

/* ---------------------------------------------------------
   Desafio "Descubra o Peso" (1-3)
--------------------------------------------------------- */
function generateSummingParts(target, count) {
    if (count === 1) return [target];
    const parts = [];
    let remaining = target;
    for (let i = 0; i < count - 1; i++) {
        const slotsLeft = count - 1 - i;
        const maxPart = remaining - slotsLeft;
        const part = 1 + Math.floor(Math.random() * Math.max(1, maxPart));
        parts.push(part);
        remaining -= part;
    }
    parts.push(remaining);
    return HY.shuffle(parts);
}

// Sorteia o objeto "vazio" (alvo), um par de outros objetos cuja soma bate
// exatamente com o peso dele, e preenche os 2 restantes com pesos decorativos
// (nao usados no calculo, so "ruido" pra tabela nao ficar obviamente reduzida
// a 3 objetos relevantes).
function generateFixedObjectWeights() {
    const indices = FIXED_OBJECTS.map((_, i) => i);
    const blankIdx = Math.floor(Math.random() * FIXED_OBJECTS.length);
    const others = indices.filter(i => i !== blankIdx);
    const shuffledOthers = HY.shuffle(others);
    const pairIndices = shuffledOthers.slice(0, 2);
    const decorIndices = shuffledOthers.slice(2);

    const blankWeight = 2 + Math.floor(Math.random() * (MAX_OBJECT_WEIGHT - 1));
    const pairParts = generateSummingParts(blankWeight, 2);

    const weights = new Array(FIXED_OBJECTS.length).fill(0);
    weights[blankIdx] = blankWeight;
    weights[pairIndices[0]] = pairParts[0];
    weights[pairIndices[1]] = pairParts[1];
    decorIndices.forEach(i => { weights[i] = 1 + Math.floor(Math.random() * MAX_OBJECT_WEIGHT); });

    return { weights, blankIdx, pairIndices };
}

function renderObjectTable() {
    const table = document.getElementById('object-table');
    table.innerHTML = FIXED_OBJECTS.map((icon, i) => {
        const isBlank = i === currentBlankIdx;
        return `<div class="table-cell${isBlank ? ' table-cell-blank' : ''}">
            <div class="table-icon">${icon}</div>
            <div class="table-value">${isBlank ? '?' : currentWeights[i]}</div>
        </div>`;
    }).join('');
}

function loadWeightChallenge() {
    document.getElementById('balance-challenge').classList.remove('active');
    document.getElementById('weight-challenge').classList.add('active');
    document.getElementById('instruction').textContent =
        'Some o peso dos 2 objetos na balança e descubra o peso que falta na tabela!';

    const result = generateFixedObjectWeights();
    currentWeights = result.weights;
    currentBlankIdx = result.blankIdx;
    currentPairIndices = result.pairIndices;

    const input = document.getElementById('weight-guess-input');
    input.value = '';
    input.classList.remove('state-correct', 'state-wrong');

    renderObjectTable();

    const svg = document.getElementById('weight-scale-svg');
    buildScaleSvg(svg, 'wscale');
    renderPanItems('wscale', 'left', [{ label: FIXED_OBJECTS[currentBlankIdx], fontSize: 34 }]);
    renderPanItems('wscale', 'right', currentPairIndices.map(i => ({ label: FIXED_OBJECTS[i], fontSize: 26 })));
    setScaleAngle('wscale', 0);
}

function updateWeightGuess() {
    const input = document.getElementById('weight-guess-input');
    const guess = parseInt(input.value, 10);
    const angle = isNaN(guess) ? 0 : computeTiltAngle(currentWeights[currentBlankIdx], guess);
    setScaleAngle('wscale', angle);
}

function verifyWeightGuess() {
    const input = document.getElementById('weight-guess-input');
    const guess = parseInt(input.value, 10);
    const isCorrect = !isNaN(guess) && guess === currentWeights[currentBlankIdx];

    if (isCorrect) {
        HY.playWin();
        HY.score.correct();
        input.classList.remove('state-wrong');
        input.classList.add('state-correct');
        setScaleAngle('wscale', 0);
        setTimeout(() => {
            if (challengeIdx >= CHALLENGES_PER_TRACK - 1) finishTrack();
            else nextChallenge();
        }, 900);
    } else {
        HY.playLose();
        HY.score.wrong();
        input.classList.remove('state-correct');
        input.classList.add('state-wrong');
        const wrap = document.getElementById('weight-scale-wrap');
        wrap.classList.remove('shake-anim');
        void wrap.offsetWidth;
        wrap.classList.add('shake-anim');
        setTimeout(() => wrap.classList.remove('shake-anim'), 400);
    }
}

/* ---------------------------------------------------------
   Desafio "Equilibre a Balança" (4-5)
--------------------------------------------------------- */
function isSubsetSumUnique(weights, target) {
    const n = weights.length;
    let count = 0;
    for (let mask = 1; mask < (1 << n); mask++) {
        let sum = 0;
        for (let i = 0; i < n; i++) if (mask & (1 << i)) sum += weights[i];
        if (sum === target) count++;
        if (count > 1) return false;
    }
    return count === 1;
}

function loadBalanceChallenge() {
    document.getElementById('weight-challenge').classList.remove('active');
    document.getElementById('balance-challenge').classList.add('active');
    document.getElementById('instruction').textContent =
        'Arraste objetos pro prato vazio até equilibrar com o objeto do outro lado!';

    const block = blockForTrack(currentTrack);
    const range = WEIGHT_RANGE_BY_BLOCK[block];
    const traySize = TRAY_SIZE_BY_BLOCK[block];
    const comboSize = traySize >= 3 && Math.random() < 0.5 ? 2 : 1;

    let comboWeights, decoyWeights, allWeights;
    let guard = 0;
    do {
        guard++;
        targetObjectWeight = Math.max(comboSize, range.min) + Math.floor(Math.random() * (range.max - Math.max(comboSize, range.min) + 1));
        comboWeights = generateSummingParts(targetObjectWeight, comboSize);
        decoyWeights = [];
        for (let i = 0; i < traySize - comboSize; i++) {
            decoyWeights.push(1 + Math.floor(Math.random() * range.max));
        }
        allWeights = [...comboWeights, ...decoyWeights];
    } while (!isSubsetSumUnique(allWeights, targetObjectWeight) && guard < 300);

    const icons = HY.rand.pick(OBJECT_POOL, traySize + 1);
    targetObjectEmoji = icons[0];
    const shuffledWeights = HY.shuffle(allWeights);
    trayItems = shuffledWeights.map((w, i) => ({ id: 'obj' + i, icon: icons[i + 1], weight: w, location: 'tray' }));
    selectedTrayItemId = null;

    const svg = document.getElementById('balance-scale-svg');
    buildScaleSvg(svg, 'bscale');
    renderPanItems('bscale', 'right', [{ label: targetObjectEmoji, fontSize: 34 }]);

    renderTrayItems();
    updateBalancePan();
}

function renderTrayItems() {
    const tray = document.getElementById('balance-tray');
    tray.innerHTML = '';
    trayItems.filter(i => i.location === 'tray').forEach(item => {
        const el = document.createElement('div');
        el.className = 'tray-item draggable' + (item.id === selectedTrayItemId ? ' selected' : '');
        el.dataset.itemId = item.id;
        el.innerHTML = `<div class="tray-icon">${item.icon}</div><div class="tray-weight">${item.weight}</div>`;
        el.addEventListener('pointerdown', (e) => startPointerDrag(e, el, item.id));
        tray.appendChild(el);
    });
}

function updateBalancePan() {
    const inPan = trayItems.filter(i => i.location === 'pan');
    renderPanItems('bscale', 'left', inPan.map(i => ({
        label: i.icon,
        fontSize: 22,
        onclick: `removeFromPan('${i.id}')`
    })));
    const sum = inPan.reduce((s, i) => s + i.weight, 0);
    setScaleAngle('bscale', computeTiltAngle(sum, targetObjectWeight));
    document.getElementById('verify-balance-btn').disabled = inPan.length === 0;
}

function moveTrayItemTo(itemId, location) {
    const item = trayItems.find(i => i.id === itemId);
    if (!item) return;
    item.location = location;
    renderTrayItems();
    updateBalancePan();
}

function removeFromPan(itemId) {
    moveTrayItemTo(itemId, 'tray');
}

function verifyBalance() {
    const inPan = trayItems.filter(i => i.location === 'pan');
    const sum = inPan.reduce((s, i) => s + i.weight, 0);
    const isCorrect = sum === targetObjectWeight;

    if (isCorrect) {
        HY.playWin();
        HY.score.correct();
        document.getElementById('verify-balance-btn').disabled = true;
        setTimeout(() => {
            if (challengeIdx >= CHALLENGES_PER_TRACK - 1) finishTrack();
            else nextChallenge();
        }, 900);
    } else {
        HY.playLose();
        HY.score.wrong();
        const wrap = document.getElementById('balance-scale-wrap');
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

    if (drag.moved) {
        const zoneEl = findZoneElAtPoint(e.clientX, e.clientY);
        const zone = zoneEl ? zoneEl.dataset.zone : null;
        if (zone) moveTrayItemTo(drag.itemId, zone);
    } else {
        selectedTrayItemId = selectedTrayItemId === drag.itemId ? null : drag.itemId;
        renderTrayItems();
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
    document.querySelectorAll('.pan-zone.drag-over').forEach(z => z.classList.remove('drag-over'));
}

function createGhost(drag) {
    const item = trayItems.find(i => i.id === drag.itemId);
    const ghost = document.createElement('div');
    ghost.className = 'tray-item drag-ghost';
    ghost.innerHTML = `<div class="tray-icon">${item.icon}</div><div class="tray-weight">${item.weight}</div>`;
    document.body.appendChild(ghost);
    drag.ghostEl = ghost;
    moveGhost(drag.startX, drag.startY);
}

function moveGhost(x, y) {
    if (!pointerDrag || !pointerDrag.ghostEl) return;
    pointerDrag.ghostEl.style.left = x + 'px';
    pointerDrag.ghostEl.style.top = y + 'px';

    document.querySelectorAll('.pan-zone.drag-over').forEach(z => z.classList.remove('drag-over'));
    const zoneEl = findZoneElAtPoint(x, y);
    if (zoneEl) zoneEl.classList.add('drag-over');
}

function findZoneElAtPoint(x, y) {
    if (pointerDrag && pointerDrag.ghostEl) pointerDrag.ghostEl.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (pointerDrag && pointerDrag.ghostEl) pointerDrag.ghostEl.style.display = '';
    return el ? el.closest('[data-zone]') : null;
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
