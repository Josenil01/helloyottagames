HY.stars.init('combinando-sorvete');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;

const FLAVOR_POOL = [
    { id: 'morango', label: 'Morango', hex: '#ff3041' },
    { id: 'chocolate', label: 'Chocolate', hex: '#6b4226' },
    { id: 'baunilha', label: 'Baunilha', hex: '#f0d9a8' },
    { id: 'limao', label: 'Limão', hex: '#ffde59' },
    { id: 'uva', label: 'Uva', hex: '#8e44ad' },
    { id: 'menta', label: 'Menta', hex: '#6ce67d' },
    { id: 'laranja', label: 'Laranja', hex: '#ffa800' },
    { id: 'mirtilo', label: 'Mirtilo', hex: '#4a69bd' },
];

const FLAVOR_COUNT_BY_BLOCK = [2, 3, 4, 5];

function blockForTrack(idx) {
    return Math.min(3, Math.floor(idx / 3));
}

function flavorCountForTrack(idx) {
    return FLAVOR_COUNT_BY_BLOCK[blockForTrack(idx)];
}

function combinationsCount(n) {
    // combinacoes com repeticao (par de sabores, ordem nao importa,
    // incluindo o mesmo sabor duas vezes): n(n+1)/2
    return (n * (n + 1)) / 2;
}

function flavorById(id) {
    return FLAVOR_POOL.find(f => f.id === id);
}

let currentTrack = 0;
let challengeIdx = 0;
let currentFlavors = [];
let cones = []; // [{ scoops: [flavorId,...], locked: bool }]
let selectedFlavorId = null;

function init() {
    HY.stars.init('combinando-sorvete');
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
        emoji: () => '🍦',
        accentColor: '#ff3041'
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
   Carregamento de desafio
--------------------------------------------------------- */
function loadChallenge() {
    const flavorCount = flavorCountForTrack(currentTrack);
    currentFlavors = HY.shuffle(FLAVOR_POOL.slice()).slice(0, flavorCount);
    const coneCount = combinationsCount(flavorCount);
    cones = [];
    for (let i = 0; i < coneCount; i++) cones.push({ scoops: [], locked: false });
    selectedFlavorId = null;

    renderCones();
    renderFlavorBox();
    HY.score.startChallenge();
}

/* ---------------------------------------------------------
   Renderizacao
--------------------------------------------------------- */
function pairKeyOf(cone) {
    return cone.scoops.slice().sort().join('|');
}

function renderCones() {
    const row = document.getElementById('cones-row');
    row.innerHTML = '';

    cones.forEach((cone, idx) => {
        const card = document.createElement('div');
        card.className = 'cone-card dropzone' + (cone.locked ? ' locked' : '');
        card.dataset.coneIdx = idx;

        const stack = document.createElement('div');
        stack.className = 'scoops-stack';

        for (let s = 0; s < 2; s++) {
            const slot = document.createElement('div');
            if (s < cone.scoops.length) {
                const flavor = flavorById(cone.scoops[s]);
                slot.className = 'scoop-slot filled';
                slot.style.background = flavor.hex;
                if (!cone.locked) {
                    slot.onclick = (e) => { e.stopPropagation(); removeScoop(idx, s); };
                }
            } else {
                slot.className = 'scoop-slot empty';
            }
            stack.appendChild(slot);
        }

        const cshape = document.createElement('div');
        cshape.className = 'cone-shape';

        card.appendChild(stack);
        card.appendChild(cshape);
        card.onclick = () => {
            if (selectedFlavorId) { tryAddScoop(idx, selectedFlavorId); }
        };

        row.appendChild(card);
    });
}

function renderFlavorBox() {
    const box = document.getElementById('flavor-box');
    box.innerHTML = '';
    currentFlavors.forEach(flavor => {
        const el = document.createElement('div');
        el.className = 'flavor-card draggable';
        el.dataset.flavorId = flavor.id;
        el.innerHTML = `<div class="flavor-scoop" style="background:${flavor.hex}"></div><div class="flavor-label">${flavor.label}</div>`;
        el.addEventListener('pointerdown', (e) => startPointerDrag(e, el, flavor.id));
        box.appendChild(el);
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
let pointerDrag = null; // { pointerId, flavorId, sourceEl, ghostEl, startX, startY, moved }

function startPointerDrag(e, sourceEl, flavorId) {
    if (e.button !== undefined && e.button !== 0) return; // so botao esquerdo do mouse
    e.preventDefault();
    try { sourceEl.setPointerCapture(e.pointerId); } catch (err) { /* ignora se nao suportado */ }

    pointerDrag = {
        pointerId: e.pointerId,
        flavorId,
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
        const dropCone = findConeAtPoint(e.clientX, e.clientY);
        if (dropCone) tryAddScoop(parseInt(dropCone.dataset.coneIdx, 10), drag.flavorId);
    } else {
        // sem movimento: trata como selecao (clique)
        selectedFlavorId = selectedFlavorId === drag.flavorId ? null : drag.flavorId;
        updateBoxSelection();
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
    document.querySelectorAll('.cone-card.drag-over').forEach(c => c.classList.remove('drag-over'));
}

function createGhost(drag) {
    const flavor = flavorById(drag.flavorId);
    const ghost = document.createElement('div');
    ghost.className = 'flavor-scoop drag-ghost';
    ghost.style.background = flavor.hex;
    document.body.appendChild(ghost);
    drag.ghostEl = ghost;
    moveGhost(drag.startX, drag.startY);
}

function moveGhost(x, y) {
    if (!pointerDrag || !pointerDrag.ghostEl) return;
    pointerDrag.ghostEl.style.left = x + 'px';
    pointerDrag.ghostEl.style.top = y + 'px';

    document.querySelectorAll('.cone-card.drag-over').forEach(c => c.classList.remove('drag-over'));
    const cone = findConeAtPoint(x, y);
    if (cone) cone.classList.add('drag-over');
}

function findConeAtPoint(x, y) {
    if (pointerDrag && pointerDrag.ghostEl) pointerDrag.ghostEl.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (pointerDrag && pointerDrag.ghostEl) pointerDrag.ghostEl.style.display = '';
    return el ? el.closest('.cone-card') : null;
}

function updateBoxSelection() {
    document.querySelectorAll('.flavor-card').forEach(el => {
        el.classList.toggle('selected', el.dataset.flavorId === selectedFlavorId);
    });
}

/* ---------------------------------------------------------
   Interacao
--------------------------------------------------------- */
function tryAddScoop(coneIdx, flavorId) {
    const cone = cones[coneIdx];
    if (!cone || cone.locked) return;
    if (cone.scoops.length >= 2) return;

    if (cone.scoops.length === 1) {
        const first = cone.scoops[0];
        const pairKey = [first, flavorId].sort().join('|');
        const duplicate = cones.some((c, i) => i !== coneIdx && c.locked && pairKeyOf(c) === pairKey);
        if (duplicate) {
            HY.playLose();
            HY.score.wrong();
            shakeCone(coneIdx);
            return;
        }

        cone.scoops.push(flavorId);
        cone.locked = true;
        renderCones();
        checkChallengeComplete();
    } else {
        cone.scoops.push(flavorId);
        renderCones();
    }
}

function removeScoop(coneIdx, scoopIdx) {
    const cone = cones[coneIdx];
    if (!cone || cone.locked) return;
    cone.scoops.splice(scoopIdx, 1);
    renderCones();
}

function shakeCone(coneIdx) {
    const card = document.querySelector(`.cone-card[data-cone-idx="${coneIdx}"]`);
    if (!card) return;
    card.classList.remove('shake-anim');
    void card.offsetWidth;
    card.classList.add('shake-anim');
    setTimeout(() => card.classList.remove('shake-anim'), 400);
}

function checkChallengeComplete() {
    const allLocked = cones.every(c => c.locked);
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
