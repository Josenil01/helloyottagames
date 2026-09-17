HY.stars.init('fabrica-das-formas');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;

const SHAPE_TYPES = ['circle', 'square', 'triangle', 'star', 'diamond'];
const SIZES = [44, 64, 88]; // pequeno, medio, grande (px)
const COLORS = [
    { id: 'cor-azul', name: 'Azul', hex: '#0a40b5' },
    { id: 'cor-vermelha', name: 'Vermelha', hex: '#ff3041' },
    { id: 'cor-amarela', name: 'Amarela', hex: '#ffa800' },
];

const ACTION_CARDS = [
    { id: 'aumentar', icon: '⬆️', label: 'Aumentar' },
    { id: 'diminuir', icon: '⬇️', label: 'Diminuir' },
    { id: 'cor-azul', swatch: '#0a40b5', label: 'Azul' },
    { id: 'cor-vermelha', swatch: '#ff3041', label: 'Vermelha' },
    { id: 'cor-amarela', swatch: '#ffa800', label: 'Amarela' },
];

function tierForTrack(idx) {
    if (idx < 4) return 'facil';
    if (idx < 8) return 'medio';
    return 'dificil';
}

function chainLengthForTier(tier) {
    if (tier === 'facil') return 4;
    if (tier === 'medio') return 5;
    return 6;
}

function twoAttrChanceForTier(tier) {
    if (tier === 'facil') return 0;
    if (tier === 'medio') return 0.4;
    return 0.6;
}

let currentTrack = 0;
let challengeIdx = 0;
let currentChallenge = null;
let slotsState = []; // [{ placed: [cardId,...], locked: bool }]
let selectedCardId = null;

function init() {
    HY.stars.init('fabrica-das-formas');
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
        emoji: () => '🏭',
        accentColor: '#64748b'
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
   Geracao da corrente: N figuras (mesma forma, tamanho/cor
   mudando), com a lista de cards exigidos em cada espaco.
--------------------------------------------------------- */
function generateChain() {
    const tier = tierForTrack(currentTrack);
    const numShapes = chainLengthForTier(tier);
    const twoAttrChance = twoAttrChanceForTier(tier);
    const shapeType = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];

    const states = [{ size: Math.floor(Math.random() * 3), color: Math.floor(Math.random() * 3) }];
    const requiredCardsPerBlank = [];

    for (let i = 1; i < numShapes; i++) {
        const prev = states[states.length - 1];
        const canGrow = prev.size < 2;
        const canShrink = prev.size > 0;
        const twoAttrs = Math.random() < twoAttrChance && (canGrow || canShrink);

        let changeSize = false, changeColor = false;
        if (twoAttrs) {
            changeSize = true;
            changeColor = true;
        } else {
            const options = [];
            if (canGrow || canShrink) options.push('size');
            options.push('color');
            const pick = options[Math.floor(Math.random() * options.length)];
            if (pick === 'size') changeSize = true; else changeColor = true;
        }

        const next = { size: prev.size, color: prev.color };
        const required = [];

        if (changeSize) {
            if (canGrow && canShrink) {
                if (Math.random() < 0.5) { next.size++; required.push('aumentar'); }
                else { next.size--; required.push('diminuir'); }
            } else if (canGrow) { next.size++; required.push('aumentar'); }
            else { next.size--; required.push('diminuir'); }
        }
        if (changeColor) {
            let newColor;
            do { newColor = Math.floor(Math.random() * 3); } while (newColor === prev.color);
            next.color = newColor;
            required.push(COLORS[newColor].id);
        }

        states.push(next);
        requiredCardsPerBlank.push(required);
    }

    return { shapeType, states, requiredCardsPerBlank };
}

/* ---------------------------------------------------------
   Renderizacao
--------------------------------------------------------- */
function renderShape(state, shapeType) {
    const el = document.createElement('div');
    el.className = 'shape-visual ' + shapeType;
    const size = SIZES[state.size];
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.background = COLORS[state.color].hex;
    return el;
}

function renderChain() {
    const row = document.getElementById('chain-row');
    row.innerHTML = '';

    currentChallenge.states.forEach((state, i) => {
        row.appendChild(renderShape(state, currentChallenge.shapeType));

        if (i < currentChallenge.states.length - 1) {
            const slot = document.createElement('div');
            slot.className = 'blank-slot dropzone';
            slot.dataset.blankIdx = i;
            slot.onclick = () => {
                if (selectedCardId) { tryPlaceCard(i, selectedCardId); clearSelection(); }
            };
            row.appendChild(slot);
        }
    });

    renderAllSlots();
}

function renderAllSlots() {
    slotsState.forEach((_, i) => renderSlotChips(i));
}

function renderSlotChips(blankIdx) {
    const slot = document.querySelector(`.blank-slot[data-blank-idx="${blankIdx}"]`);
    if (!slot) return;
    const state = slotsState[blankIdx];
    slot.classList.toggle('correct', state.locked);
    slot.innerHTML = '';
    state.placed.forEach(cardId => {
        const card = ACTION_CARDS.find(c => c.id === cardId);
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.style.background = card.swatch || 'rgba(255,255,255,0.25)';
        chip.textContent = card.icon || '';
        if (!state.locked) chip.onclick = () => removeChip(blankIdx, cardId);
        slot.appendChild(chip);
    });
}

function renderTray() {
    const tray = document.getElementById('cards-tray');
    tray.innerHTML = '';
    ACTION_CARDS.forEach(card => {
        const el = document.createElement('div');
        el.className = 'action-card draggable';
        if (card.swatch) {
            el.innerHTML = `<div class="swatch" style="background:${card.swatch}"></div><div class="label">${card.label}</div>`;
        } else {
            el.innerHTML = `<div class="icon">${card.icon}</div><div class="label">${card.label}</div>`;
        }
        el.dataset.cardId = card.id;
        el.addEventListener('pointerdown', (e) => startPointerDrag(e, el, card.id));
        tray.appendChild(el);
    });
}

/* ---------------------------------------------------------
   Arrastar via Pointer Events — mais confiavel entre navegadores
   e entre mouse/touch do que o Drag and Drop nativo do HTML5.
   Um toque/clique sem mover vira selecao (fallback de clique);
   um movimento real cria um "fantasma" que segue o ponteiro e,
   ao soltar, verifica o que esta embaixo dele.
--------------------------------------------------------- */
const DRAG_MOVE_THRESHOLD = 6; // px
let pointerDrag = null; // { pointerId, cardId, sourceEl, ghostEl, startX, startY, moved }

function startPointerDrag(e, sourceEl, cardId) {
    if (e.button !== undefined && e.button !== 0) return; // so botao esquerdo do mouse
    e.preventDefault();
    try { sourceEl.setPointerCapture(e.pointerId); } catch (err) { /* ignora se nao suportado */ }

    pointerDrag = {
        pointerId: e.pointerId,
        cardId,
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
        const dropSlot = findSlotAtPoint(e.clientX, e.clientY);
        if (dropSlot) tryPlaceCard(parseInt(dropSlot.dataset.blankIdx, 10), drag.cardId);
    } else {
        // sem movimento: trata como selecao (clique)
        selectedCardId = selectedCardId === drag.cardId ? null : drag.cardId;
        updateTraySelection();
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
    document.querySelectorAll('.blank-slot.drag-over').forEach(s => s.classList.remove('drag-over'));
}

function createGhost(drag) {
    const card = ACTION_CARDS.find(c => c.id === drag.cardId);
    const ghost = document.createElement('div');
    ghost.className = 'action-card drag-ghost';
    ghost.innerHTML = card.swatch
        ? `<div class="swatch" style="background:${card.swatch}"></div><div class="label">${card.label}</div>`
        : `<div class="icon">${card.icon}</div><div class="label">${card.label}</div>`;
    document.body.appendChild(ghost);
    drag.ghostEl = ghost;
    moveGhost(drag.startX, drag.startY);
}

function moveGhost(x, y) {
    if (!pointerDrag || !pointerDrag.ghostEl) return;
    pointerDrag.ghostEl.style.left = x + 'px';
    pointerDrag.ghostEl.style.top = y + 'px';

    document.querySelectorAll('.blank-slot.drag-over').forEach(s => s.classList.remove('drag-over'));
    const slot = findSlotAtPoint(x, y);
    if (slot) slot.classList.add('drag-over');
}

function findSlotAtPoint(x, y) {
    if (pointerDrag && pointerDrag.ghostEl) pointerDrag.ghostEl.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (pointerDrag && pointerDrag.ghostEl) pointerDrag.ghostEl.style.display = '';
    return el ? el.closest('.blank-slot') : null;
}

function updateTraySelection() {
    document.querySelectorAll('.action-card').forEach(el => {
        el.classList.toggle('selected', el.dataset.cardId === selectedCardId);
    });
}

function clearSelection() {
    selectedCardId = null;
    updateTraySelection();
}

/* ---------------------------------------------------------
   Carregamento de desafio
--------------------------------------------------------- */
function loadChallenge() {
    currentChallenge = generateChain();
    slotsState = currentChallenge.requiredCardsPerBlank.map(() => ({ placed: [], locked: false }));
    selectedCardId = null;

    renderChain();
    renderTray();
    HY.score.startChallenge();
}

/* ---------------------------------------------------------
   Interacao
--------------------------------------------------------- */
function tryPlaceCard(blankIdx, cardId) {
    const slot = slotsState[blankIdx];
    if (slot.locked) return;
    if (slot.placed.includes(cardId)) return;

    const required = currentChallenge.requiredCardsPerBlank[blankIdx];
    if (!required.includes(cardId)) {
        HY.playLose();
        HY.score.wrong();
        shakeSlot(blankIdx);
        return;
    }

    slot.placed.push(cardId);
    if (slot.placed.length === required.length) {
        slot.locked = true;
    }
    renderSlotChips(blankIdx);

    if (slot.locked) checkChainComplete();
}

function removeChip(blankIdx, cardId) {
    const slot = slotsState[blankIdx];
    if (slot.locked) return;
    slot.placed = slot.placed.filter(id => id !== cardId);
    renderSlotChips(blankIdx);
}

function shakeSlot(blankIdx) {
    const slot = document.querySelector(`.blank-slot[data-blank-idx="${blankIdx}"]`);
    if (!slot) return;
    slot.classList.remove('shake-anim');
    void slot.offsetWidth;
    slot.classList.add('shake-anim');
    setTimeout(() => slot.classList.remove('shake-anim'), 400);
}

function checkChainComplete() {
    const allLocked = slotsState.every(s => s.locked);
    if (!allLocked) return;

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
