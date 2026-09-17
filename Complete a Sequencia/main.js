HY.stars.init('complete-a-sequencia');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;
const SEQUENCE_LENGTH = 10;

// Quantos passos DISTINTOS podem se repetir em ciclo ao longo da sequencia
// (1 = PA simples de passo constante; 2 ou 3 = alterna entre esses valores,
// ex: ciclo de 2 -> +3,+1,+3,+1... | ciclo de 3 -> +2,+1,+3,+2,+1,+3...).
const STEP_COUNT_BY_BLOCK = [1, 1, 2, 3];
const STEP_MAGNITUDE_RANGE_BY_BLOCK = [
    { min: 1, max: 2 },
    { min: 1, max: 5 },
    { min: 1, max: 6 },
    { min: 1, max: 9 }
];
const ALLOW_DESCENDING_BY_BLOCK = [false, false, true, true];
const BLANK_COUNT_BY_BLOCK = [2, 3, 3, 4];

let currentTrack = 0;
let challengeIdx = 0;
let sequenceTerms = [];
let blankPositions = [];

function init() {
    HY.stars.init('complete-a-sequencia');
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
        emoji: () => '🔢',
        accentColor: '#0a40b5'
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
   Geracao da sequencia (PA simples ou com passos em ciclo)
--------------------------------------------------------- */
function generateSequence() {
    const block = blockForTrack(currentTrack);
    const maxCycleLen = STEP_COUNT_BY_BLOCK[block];
    const magRange = STEP_MAGNITUDE_RANGE_BY_BLOCK[block];
    const canDescend = ALLOW_DESCENDING_BY_BLOCK[block];

    const cycleLen = 1 + Math.floor(Math.random() * maxCycleLen);
    const isDescending = canDescend && Math.random() < 0.5;

    const stepMagnitudes = [];
    for (let i = 0; i < cycleLen; i++) {
        stepMagnitudes.push(magRange.min + Math.floor(Math.random() * (magRange.max - magRange.min + 1)));
    }
    const steps = stepMagnitudes.map(m => isDescending ? -m : m);

    let startValue;
    if (isDescending) {
        // garante que nenhum termo fique negativo: acha a maior "queda"
        // acumulada e comeca alto o suficiente pra nunca passar de zero.
        let cumulative = 0, minCumulative = 0;
        for (let i = 0; i < SEQUENCE_LENGTH - 1; i++) {
            cumulative += steps[i % cycleLen];
            if (cumulative < minCumulative) minCumulative = cumulative;
        }
        startValue = Math.abs(minCumulative) + 1 + Math.floor(Math.random() * 10);
    } else {
        startValue = 1 + Math.floor(Math.random() * 15);
    }

    const terms = [startValue];
    for (let i = 0; i < SEQUENCE_LENGTH - 1; i++) {
        terms.push(terms[terms.length - 1] + steps[i % cycleLen]);
    }
    return terms;
}

function hasAdjacentPositions(sortedPositions) {
    for (let i = 1; i < sortedPositions.length; i++) {
        if (sortedPositions[i] - sortedPositions[i - 1] === 1) return true;
    }
    return false;
}

// Nunca deixa duas lacunas vizinhas, pra sempre sobrar um numero visivel do
// lado de qualquer lacuna como ponto de apoio pro calculo.
function pickBlankPositions(count) {
    let positions;
    let guard = 0;
    do {
        guard++;
        positions = HY.shuffle(Array.from({ length: SEQUENCE_LENGTH }, (_, i) => i))
            .slice(0, count)
            .sort((a, b) => a - b);
    } while (hasAdjacentPositions(positions) && guard < 300);
    return positions;
}

/* ---------------------------------------------------------
   Desafio
--------------------------------------------------------- */
function loadChallenge() {
    const block = blockForTrack(currentTrack);
    sequenceTerms = generateSequence();
    blankPositions = pickBlankPositions(BLANK_COUNT_BY_BLOCK[block]);

    renderSequence();
    HY.score.startChallenge();
}

function renderSequence() {
    const row = document.getElementById('sequence-row');
    row.innerHTML = sequenceTerms.map((term, i) => {
        if (blankPositions.includes(i)) {
            return `<input type="text" inputmode="numeric" class="seq-input" data-index="${i}" placeholder="?">`;
        }
        return `<div class="seq-cell">${term}</div>`;
    }).join('');
}

function verifySequence() {
    let allCorrect = true;

    blankPositions.forEach(pos => {
        const input = document.querySelector(`.seq-input[data-index="${pos}"]`);
        const guess = parseInt(input.value, 10);
        const isCorrect = !isNaN(guess) && guess === sequenceTerms[pos];
        input.classList.toggle('state-correct', isCorrect);
        input.classList.toggle('state-wrong', !isCorrect);
        if (!isCorrect) allCorrect = false;
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
        const wrap = document.querySelector('.sequence-wrap');
        wrap.classList.remove('shake-anim');
        void wrap.offsetWidth;
        wrap.classList.add('shake-anim');
        setTimeout(() => wrap.classList.remove('shake-anim'), 400);
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
