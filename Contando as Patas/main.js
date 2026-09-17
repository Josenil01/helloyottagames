HY.stars.init('contando-as-patas');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;

const LEG_ANIMALS = {
    2: ['🐔', '🐧', '🦆', '🦩'],
    4: ['🐶', '🐱', '🐴', '🐄', '🐷', '🦁'],
    6: ['🐜', '🐝', '🐞'],
    8: ['🕷️', '🐙']
};

const LEG_OPTIONS_BY_BLOCK = [
    [2, 4],
    [2, 4, 6],
    [2, 4, 6, 8],
    [2, 4, 6, 8]
];
const GROUP_RANGE_BY_BLOCK = [
    { min: 2, max: 4 },
    { min: 2, max: 6 },
    { min: 2, max: 8 },
    { min: 2, max: 10 }
];
// Do bloco 3 em diante, o animal da pergunta 1 pode ser diferente do animal
// do grupo — antes disso, e sempre o mesmo animal nas duas perguntas.
const SAME_ANIMAL_BY_BLOCK = [true, true, true, false];

let currentTrack = 0;
let challengeIdx = 0;
let currentChallenge = null;

function init() {
    HY.stars.init('contando-as-patas');
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
        emoji: () => '🐾',
        accentColor: '#2e7d32'
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

function pickLegCount(options) {
    return options[Math.floor(Math.random() * options.length)];
}

function pickAnimal(legCount) {
    const pool = LEG_ANIMALS[legCount];
    return pool[Math.floor(Math.random() * pool.length)];
}

/* ---------------------------------------------------------
   Geracao do desafio
--------------------------------------------------------- */
function generateChallenge() {
    const block = blockForTrack(currentTrack);
    const legOptions = LEG_OPTIONS_BY_BLOCK[block];
    const groupRange = GROUP_RANGE_BY_BLOCK[block];
    const sameAnimal = SAME_ANIMAL_BY_BLOCK[block];

    const singleLegCount = pickLegCount(legOptions);
    const singleAnimal = pickAnimal(singleLegCount);

    let groupLegCount, groupAnimal;
    if (sameAnimal) {
        groupLegCount = singleLegCount;
        groupAnimal = singleAnimal;
    } else {
        groupLegCount = pickLegCount(legOptions);
        groupAnimal = pickAnimal(groupLegCount);
    }

    const groupSize = groupRange.min + Math.floor(Math.random() * (groupRange.max - groupRange.min + 1));

    return {
        singleAnimal,
        singleLegCount,
        groupAnimal,
        groupLegCount,
        groupSize,
        groupTotal: groupLegCount * groupSize
    };
}

function loadChallenge() {
    currentChallenge = generateChallenge();

    document.getElementById('single-animal').textContent = currentChallenge.singleAnimal;
    document.getElementById('group-animals').innerHTML =
        Array(currentChallenge.groupSize).fill(`<span>${currentChallenge.groupAnimal}</span>`).join('');

    const singleInput = document.getElementById('single-input');
    const groupInput = document.getElementById('group-input');
    singleInput.value = '';
    groupInput.value = '';
    singleInput.classList.remove('state-correct', 'state-wrong');
    groupInput.classList.remove('state-correct', 'state-wrong');

    HY.score.startChallenge();
}

function verifyChallenge() {
    const singleInput = document.getElementById('single-input');
    const groupInput = document.getElementById('group-input');
    const singleGuess = parseInt(singleInput.value, 10);
    const groupGuess = parseInt(groupInput.value, 10);

    const singleCorrect = !isNaN(singleGuess) && singleGuess === currentChallenge.singleLegCount;
    const groupCorrect = !isNaN(groupGuess) && groupGuess === currentChallenge.groupTotal;

    singleInput.classList.toggle('state-correct', singleCorrect);
    singleInput.classList.toggle('state-wrong', !singleCorrect);
    groupInput.classList.toggle('state-correct', groupCorrect);
    groupInput.classList.toggle('state-wrong', !groupCorrect);

    if (singleCorrect && groupCorrect) {
        HY.playWin();
        HY.score.correct();
        setTimeout(() => {
            if (challengeIdx >= CHALLENGES_PER_TRACK - 1) finishTrack();
            else nextChallenge();
        }, 900);
    } else {
        HY.playLose();
        HY.score.wrong();
        const wrap = document.querySelector('.panels-wrap');
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
