HY.stars.init('mercado-matematico');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;

const PRODUCT_POOL = [
    '🏀', '📚', '🧸', '🎨', '🚲', '👟', '🎮', '🧦',
    '👕', '🍫', '🧃', '🍎', '🪁', '🎧', '🧢', '⌚'
];

const MARKET_ITEMS_BY_BLOCK = [5, 6, 7, 8];

let currentTrack = 0;
let challengeIdx = 0;

// ---- Estado do desafio "Mercado" ----
let marketItems = [];
let marketInitialBalance = 0;
let marketCurrentBalance = 0;
let marketTargetK = 0;
let marketDecimalMode = false;
let selectedItemId = null;

// ---- Estado do desafio "Tabela de Troco" ----
let trocoData = null;

function init() {
    HY.stars.init('mercado-matematico');
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
        emoji: () => '🛒',
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
   Regras de preco por bloco de trilhas (0-3)
--------------------------------------------------------- */
function blockForTrack(idx) {
    return Math.min(3, Math.floor(idx / 3));
}

function isDecimalTrack(idx) {
    return blockForTrack(idx) >= 2;
}

function priceRangeForTrack(idx) {
    const block = blockForTrack(idx);
    switch (block) {
        case 0: return { minReais: 1, maxReais: 20, centsMode: 'whole' };
        case 1: return { minReais: 10, maxReais: 60, centsMode: 'whole' };
        case 2: return { minReais: 1, maxReais: 20, centsMode: 'mult5' };
        default: return { minReais: 1, maxReais: 30, centsMode: 'free' };
    }
}

function generatePriceCents(range) {
    const reais = range.minReais + Math.floor(Math.random() * (range.maxReais - range.minReais + 1));
    if (range.centsMode === 'whole') return reais * 100;

    let cents;
    if (range.centsMode === 'mult5') {
        const options = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
        cents = options[Math.floor(Math.random() * options.length)];
    } else {
        cents = 1 + Math.floor(Math.random() * 99);
    }
    return reais * 100 + cents;
}

function generateUniquePricesCents(range, n) {
    const set = new Set();
    let guard = 0;
    while (set.size < n && guard < 3000) {
        set.add(generatePriceCents(range));
        guard++;
    }
    return Array.from(set);
}

function formatCents(cents, decimalMode) {
    const negative = cents < 0;
    const abs = Math.abs(cents);
    if (!decimalMode) {
        return `${negative ? '-' : ''}R$ ${Math.round(abs / 100)}`;
    }
    const reais = Math.floor(abs / 100);
    const centsPart = abs % 100;
    return `${negative ? '-' : ''}R$ ${reais},${String(centsPart).padStart(2, '0')}`;
}

function parseMoneyInput(str) {
    if (!str) return null;
    const normalized = String(str).replace(',', '.').trim();
    if (normalized === '') return null;
    const val = parseFloat(normalized);
    if (isNaN(val)) return null;
    return Math.round(val * 100);
}

/* ---------------------------------------------------------
   Dispatcher de desafio
--------------------------------------------------------- */
function isTrocoChallenge(idx) {
    return idx >= CHALLENGES_PER_TRACK - 2;
}

function loadChallenge() {
    if (isTrocoChallenge(challengeIdx)) {
        loadTrocoChallenge();
    } else {
        loadMarketChallenge();
    }
    HY.score.startChallenge();
}

/* ---------------------------------------------------------
   Desafio "Mercado" (comprar / nao comprar)
--------------------------------------------------------- */
function loadMarketChallenge() {
    document.getElementById('troco-challenge').classList.remove('active');
    document.getElementById('market-challenge').classList.add('active');
    document.getElementById('instruction').textContent =
        'Arraste os produtos para "Podemos comprar" sem deixar o saldo negativo!';

    const range = priceRangeForTrack(currentTrack);
    marketDecimalMode = isDecimalTrack(currentTrack);
    const itemCount = MARKET_ITEMS_BY_BLOCK[blockForTrack(currentTrack)];
    const pricesCents = generateUniquePricesCents(range, itemCount);
    const icons = HY.rand.pick(PRODUCT_POOL, itemCount);

    marketItems = icons.map((icon, i) => ({
        id: 'item' + i,
        icon,
        priceCents: pricesCents[i],
        location: 'tray'
    }));

    const sorted = pricesCents.slice().sort((a, b) => a - b);
    const targetK = 2 + Math.floor(Math.random() * (itemCount - 2)); // entre 2 e itemCount-1
    const sumK = sorted.slice(0, targetK).reduce((s, v) => s + v, 0);
    const sumKPlus1 = sorted.slice(0, targetK + 1).reduce((s, v) => s + v, 0);
    const gap = sumKPlus1 - sumK;
    const slackUnit = marketDecimalMode ? 1 : 100;
    const maxSlackSteps = Math.max(0, Math.floor((gap - slackUnit) / slackUnit));
    const slack = maxSlackSteps > 0 ? slackUnit * Math.floor(Math.random() * (maxSlackSteps + 1)) : 0;

    marketTargetK = targetK;
    marketInitialBalance = sumK + slack;
    selectedItemId = null;

    renderMarketItems();
}

function renderMarketItems() {
    const trayEl = document.getElementById('product-tray');
    const comprarEl = document.getElementById('zone-comprar-items');
    const naoEl = document.getElementById('zone-naocomprar-items');
    trayEl.innerHTML = '';
    comprarEl.innerHTML = '';
    naoEl.innerHTML = '';

    marketItems.forEach(item => {
        const el = document.createElement('div');
        el.className = 'product-card draggable' + (item.id === selectedItemId ? ' selected' : '');
        el.dataset.itemId = item.id;
        el.innerHTML = `<div class="product-icon">${item.icon}</div><div class="product-price">${formatCents(item.priceCents, marketDecimalMode)}</div>`;
        el.addEventListener('pointerdown', (e) => startPointerDrag(e, el, item.id));

        if (item.location === 'tray') trayEl.appendChild(el);
        else if (item.location === 'comprar') comprarEl.appendChild(el);
        else naoEl.appendChild(el);
    });

    updateBalanceDisplay();
    updateVerifyButtonState();
}

function updateBalanceDisplay() {
    const spent = marketItems.filter(i => i.location === 'comprar').reduce((s, i) => s + i.priceCents, 0);
    marketCurrentBalance = marketInitialBalance - spent;
    const el = document.getElementById('balance-value');
    el.textContent = formatCents(marketCurrentBalance, marketDecimalMode);
    el.classList.toggle('positive', marketCurrentBalance >= 0);
    el.classList.toggle('negative', marketCurrentBalance < 0);
}

function updateVerifyButtonState() {
    const allPlaced = marketItems.every(i => i.location !== 'tray');
    document.getElementById('verify-market-btn').disabled = !allPlaced;
}

function moveItemTo(itemId, zone) {
    const item = marketItems.find(i => i.id === itemId);
    if (!item) return;
    item.location = zone;
    selectedItemId = null;
    renderMarketItems();
}

function handleZoneClick(zone) {
    if (selectedItemId) moveItemTo(selectedItemId, zone);
}

function verifyMarket() {
    const btn = document.getElementById('verify-market-btn');
    if (btn.disabled) return;

    const comprarCount = marketItems.filter(i => i.location === 'comprar').length;
    const isCorrect = comprarCount === marketTargetK && marketCurrentBalance >= 0;

    if (isCorrect) {
        HY.playWin();
        HY.score.correct();
        btn.disabled = true;
        setTimeout(() => {
            if (challengeIdx >= CHALLENGES_PER_TRACK - 1) finishTrack();
            else nextChallenge();
        }, 900);
    } else {
        HY.playLose();
        HY.score.wrong();
        const panel = document.querySelector('.market-main');
        panel.classList.remove('shake-anim');
        void panel.offsetWidth;
        panel.classList.add('shake-anim');
        setTimeout(() => panel.classList.remove('shake-anim'), 400);
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
        const zone = findZoneAtPoint(e.clientX, e.clientY);
        if (zone) moveItemTo(drag.itemId, zone);
    } else {
        selectedItemId = selectedItemId === drag.itemId ? null : drag.itemId;
        renderMarketItems();
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
    document.querySelectorAll('[data-zone].drag-over').forEach(z => z.classList.remove('drag-over'));
}

function createGhost(drag) {
    const item = marketItems.find(i => i.id === drag.itemId);
    const ghost = document.createElement('div');
    ghost.className = 'product-card drag-ghost';
    ghost.innerHTML = `<div class="product-icon">${item.icon}</div><div class="product-price">${formatCents(item.priceCents, marketDecimalMode)}</div>`;
    document.body.appendChild(ghost);
    drag.ghostEl = ghost;
    moveGhost(drag.startX, drag.startY);
}

function moveGhost(x, y) {
    if (!pointerDrag || !pointerDrag.ghostEl) return;
    pointerDrag.ghostEl.style.left = x + 'px';
    pointerDrag.ghostEl.style.top = y + 'px';

    document.querySelectorAll('[data-zone].drag-over').forEach(z => z.classList.remove('drag-over'));
    const zoneEl = findZoneElAtPoint(x, y);
    if (zoneEl) zoneEl.classList.add('drag-over');
}

function findZoneElAtPoint(x, y) {
    if (pointerDrag && pointerDrag.ghostEl) pointerDrag.ghostEl.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (pointerDrag && pointerDrag.ghostEl) pointerDrag.ghostEl.style.display = '';
    return el ? el.closest('[data-zone]') : null;
}

function findZoneAtPoint(x, y) {
    const zoneEl = findZoneElAtPoint(x, y);
    return zoneEl ? zoneEl.dataset.zone : null;
}

/* ---------------------------------------------------------
   Desafio "Tabela de Troco"
--------------------------------------------------------- */
function loadTrocoChallenge() {
    document.getElementById('market-challenge').classList.remove('active');
    document.getElementById('troco-challenge').classList.add('active');
    document.getElementById('instruction').textContent =
        'Complete a tabela: descubra o valor recebido ou o troco de cada compra!';

    const range = priceRangeForTrack(currentTrack);
    const decimalMode = isDecimalTrack(currentTrack);
    const icons = HY.rand.pick(PRODUCT_POOL, 3);
    const pricesCents = generateUniquePricesCents(range, 3);
    const catalog = icons.map((icon, i) => ({ icon, priceCents: pricesCents[i] }));

    const maxComboSize = blockForTrack(currentTrack) >= 2 ? 3 : 2;
    // troco segue a mesma granularidade dos precos da trilha (reais inteiros,
    // multiplos de 5 centavos, ou centavos livres), pra parecer uma troca real
    const trocoUnit = range.centsMode === 'whole' ? 100 : (range.centsMode === 'mult5' ? 5 : 1);

    const rows = [];
    for (let r = 0; r < 4; r++) {
        const comboSize = 1 + Math.floor(Math.random() * maxComboSize);
        const comboIcons = [];
        let itemsTotal = 0;
        for (let i = 0; i < comboSize; i++) {
            const pick = catalog[Math.floor(Math.random() * catalog.length)];
            comboIcons.push(pick.icon);
            itemsTotal += pick.priceCents;
        }
        // troco proporcional ao total da compra, ate ~60% dele, sempre >= 1 unidade
        const maxSteps = Math.max(1, Math.floor((itemsTotal / trocoUnit) * 0.6));
        const trocoSteps = 1 + Math.floor(Math.random() * maxSteps);
        const trocoCents = trocoSteps * trocoUnit;
        const recebidoCents = itemsTotal + trocoCents;
        const hideField = Math.random() < 0.5 ? 'recebido' : 'troco';

        rows.push({ comboIcons, itemsTotal, recebidoCents, trocoCents, hideField });
    }

    trocoData = { catalog, rows, decimalMode };
    renderTrocoCatalog();
    renderTrocoTable();
}

function renderTrocoCatalog() {
    const el = document.getElementById('troco-catalog');
    el.innerHTML = trocoData.catalog.map(c => `
        <div class="catalog-item">
            <div class="catalog-icon">${c.icon}</div>
            <div class="catalog-price">${formatCents(c.priceCents, trocoData.decimalMode)}</div>
        </div>
    `).join('');
}

function renderTrocoTable() {
    const el = document.getElementById('troco-table');
    let html = `
        <div class="troco-row troco-header">
            <div>Itens</div><div>Valor recebido</div><div>Troco</div>
        </div>
    `;

    trocoData.rows.forEach((row, idx) => {
        const iconsHtml = row.comboIcons.join(' + ');
        const placeholder = trocoData.decimalMode ? '0,00' : '0';

        const recebidoHtml = row.hideField === 'recebido'
            ? `<input type="text" inputmode="decimal" class="troco-input" id="troco-input-${idx}" placeholder="${placeholder}">`
            : `<div class="troco-value">${formatCents(row.recebidoCents, trocoData.decimalMode)}</div>`;

        const trocoHtml = row.hideField === 'troco'
            ? `<input type="text" inputmode="decimal" class="troco-input" id="troco-input-${idx}" placeholder="${placeholder}">`
            : `<div class="troco-value">${formatCents(row.trocoCents, trocoData.decimalMode)}</div>`;

        html += `<div class="troco-row" data-row-idx="${idx}">
            <div class="troco-icons">${iconsHtml}</div>
            <div>${recebidoHtml}</div>
            <div>${trocoHtml}</div>
        </div>`;
    });

    el.innerHTML = html;
}

function verifyTroco() {
    let allCorrect = true;

    trocoData.rows.forEach((row, idx) => {
        const input = document.getElementById('troco-input-' + idx);
        const expected = row.hideField === 'recebido' ? row.recebidoCents : row.trocoCents;
        const typed = parseMoneyInput(input.value);
        const isRowCorrect = typed !== null && typed === expected;
        input.classList.toggle('state-correct', isRowCorrect);
        input.classList.toggle('state-wrong', !isRowCorrect);
        if (!isRowCorrect) allCorrect = false;
    });

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
    }
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
