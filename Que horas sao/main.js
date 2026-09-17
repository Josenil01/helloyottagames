HY.stars.init('que-horas-sao');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;
const CHALLENGE_TYPES = ['drag', 'drag', 'drag', 'type', 'type'];

const CX = 100, CY = 100;
const R_TICK_OUT = 88;
const R_TICK_SHORT_IN = 82;
const R_TICK_LONG_IN = 76;
const R_NUM = 66;
const R_HOUR_HAND = 48;
const R_MIN_HAND = 76;

function tierForTrack(idx) {
    if (idx < 4) return 'facil';
    if (idx < 8) return 'medio';
    return 'dificil';
}

function minuteOptionsForTier(tier) {
    if (tier === 'facil') return [0, 30];
    if (tier === 'medio') return [0, 15, 30, 45];
    return null; // dificil: qualquer minuto 0-59
}

let currentTrack = 0;
let challengeIdx = 0;
let currentChallenge = null; // { type, hour, minute }
let clockState = { hourAngle: null, minuteAngle: null, hourPlaced: false, minutePlaced: false, hourState: 'neutral', minuteState: 'neutral' };
let activeDrag = null; // { hand }
let challengeLocked = false;

function init() {
    HY.stars.init('que-horas-sao');
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
        emoji: () => '🕐',
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
   Geracao do horario alvo
--------------------------------------------------------- */
function generateTime() {
    const tier = tierForTrack(currentTrack);
    const hour = 1 + Math.floor(Math.random() * 12);
    const opts = minuteOptionsForTier(tier);
    const minute = opts ? opts[Math.floor(Math.random() * opts.length)] : Math.floor(Math.random() * 60);
    return { hour, minute };
}

/* ---------------------------------------------------------
   Construcao do mostrador (marcacoes + numeros) — desenhado
   uma vez por desafio, os ponteiros sao atualizados a parte.
--------------------------------------------------------- */
function buildClockFace() {
    const ticksG = document.getElementById('clock-ticks');
    const numsG = document.getElementById('clock-numbers');
    let ticksHtml = '';
    let numsHtml = '';

    for (let m = 0; m < 60; m++) {
        const angle = m * 6;
        const isLong = m % 5 === 0;
        const rIn = isLong ? R_TICK_LONG_IN : R_TICK_SHORT_IN;
        const p1 = pointOnCircle(angle, R_TICK_OUT);
        const p2 = pointOnCircle(angle, rIn);
        ticksHtml += `<line class="clock-tick${isLong ? ' long' : ''}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke-width="${isLong ? 2.5 : 1}"></line>`;
    }
    ticksG.innerHTML = ticksHtml;

    for (let h = 1; h <= 12; h++) {
        const angle = h * 30;
        const p = pointOnCircle(angle, R_NUM);
        numsHtml += `<text class="clock-number" x="${p.x}" y="${p.y}">${h}</text>`;
    }
    numsG.innerHTML = numsHtml;
}

function pointOnCircle(angleDeg, radius) {
    const rad = (angleDeg - 90) * Math.PI / 180; // -90 para 0 grau apontar pra cima (12h)
    return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

/* ---------------------------------------------------------
   Ponteiros
--------------------------------------------------------- */
function setHandVisual(hand, angleDeg, state) {
    const line = document.getElementById(hand + '-hand');
    const hit = document.getElementById(hand + '-hand-hit');
    const radius = hand === 'hour' ? R_HOUR_HAND : R_MIN_HAND;
    const p = pointOnCircle(angleDeg, radius);
    line.setAttribute('x2', p.x);
    line.setAttribute('y2', p.y);
    hit.setAttribute('x2', p.x);
    hit.setAttribute('y2', p.y);
    line.style.display = 'block';
    line.className.baseVal = `clock-hand state-${state}`;
}

function resetClockVisual() {
    ['hour', 'minute'].forEach(hand => {
        const line = document.getElementById(hand + '-hand');
        line.style.display = 'none';
        line.className.baseVal = 'clock-hand state-neutral';
    });
}

/* ---------------------------------------------------------
   Interacao de arrastar (Pointer Events)
--------------------------------------------------------- */
function angleFromPointer(clientX, clientY) {
    const svg = document.getElementById('clock-svg');
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const localX = (clientX - rect.left) / rect.width * vb.width + vb.x;
    const localY = (clientY - rect.top) / rect.height * vb.height + vb.y;
    const dx = localX - CX, dy = localY - CY;
    let angle = Math.atan2(dx, -dy) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
}

function snapAngle(angle, steps) {
    const unit = 360 / steps;
    return (Math.round(angle / unit) % steps) * unit;
}

function startHandDrag(e, hand) {
    if (challengeLocked) return;
    e.preventDefault();
    const svg = document.getElementById('clock-svg');
    try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignora */ }

    activeDrag = { hand, pointerId: e.pointerId };
    svg.addEventListener('pointermove', onHandDragMove);
    svg.addEventListener('pointerup', onHandDragEnd);
    svg.addEventListener('pointercancel', onHandDragCancel);
    updateHandFromPointer(e.clientX, e.clientY);
}

function onHandDragMove(e) {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;
    updateHandFromPointer(e.clientX, e.clientY);
}

function updateHandFromPointer(clientX, clientY) {
    const raw = angleFromPointer(clientX, clientY);
    const steps = activeDrag.hand === 'hour' ? 12 : 60;
    const snapped = snapAngle(raw, steps);
    if (activeDrag.hand === 'hour') clockState.hourAngle = snapped;
    else clockState.minuteAngle = snapped;
    setHandVisual(activeDrag.hand, snapped, 'neutral');
}

function onHandDragEnd(e) {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;
    finishHandDrag();
}

function onHandDragCancel() {
    finishHandDrag();
}

function finishHandDrag() {
    const svg = document.getElementById('clock-svg');
    svg.removeEventListener('pointermove', onHandDragMove);
    svg.removeEventListener('pointerup', onHandDragEnd);
    svg.removeEventListener('pointercancel', onHandDragCancel);

    const hand = activeDrag.hand;
    activeDrag = null;
    if (hand === 'hour') clockState.hourPlaced = true;
    else clockState.minutePlaced = true;

    updateVerifyButtonVisibility();
}

function updateVerifyButtonVisibility() {
    const btn = document.getElementById('verify-btn');
    if (clockState.hourPlaced && clockState.minutePlaced) {
        btn.classList.remove('hidden');
        btn.disabled = false;
    }
}

/* ---------------------------------------------------------
   Carregamento de desafio
--------------------------------------------------------- */
function loadChallenge() {
    const tier = tierForTrack(currentTrack);
    currentChallenge = { type: CHALLENGE_TYPES[challengeIdx], ...generateTime() };
    challengeLocked = false;
    clockState = { hourAngle: null, minuteAngle: null, hourPlaced: false, minutePlaced: false, hourState: 'neutral', minuteState: 'neutral' };

    buildClockFace();
    resetClockVisual();

    const verifyBtn = document.getElementById('verify-btn');
    const timeInputs = document.getElementById('time-inputs');
    const centerDot = document.getElementById('center-dot');
    const hourHit = document.getElementById('hour-hand-hit');
    const minuteHit = document.getElementById('minute-hand-hit');

    if (currentChallenge.type === 'drag') {
        document.getElementById('instruction').textContent = `Agora são ${currentChallenge.hour}:${String(currentChallenge.minute).padStart(2, '0')}`;
        timeInputs.style.display = 'none';
        verifyBtn.classList.add('hidden');
        verifyBtn.disabled = true;

        centerDot.style.display = 'block';
        centerDot.onpointerdown = (e) => {
            if (!clockState.hourPlaced) startHandDrag(e, 'hour');
            else if (!clockState.minutePlaced) startHandDrag(e, 'minute');
        };
        hourHit.onpointerdown = (e) => { if (clockState.hourPlaced) startHandDrag(e, 'hour'); };
        minuteHit.onpointerdown = (e) => { if (clockState.minutePlaced) startHandDrag(e, 'minute'); };
    } else {
        document.getElementById('instruction').textContent = 'Que horas o relógio está marcando?';
        timeInputs.style.display = 'flex';
        document.getElementById('input-hour').value = '';
        document.getElementById('input-minute').value = '';
        document.getElementById('input-hour').classList.remove('state-correct', 'state-wrong');
        document.getElementById('input-minute').classList.remove('state-correct', 'state-wrong');
        verifyBtn.classList.remove('hidden');
        verifyBtn.disabled = false;

        centerDot.style.display = 'none';
        centerDot.onpointerdown = null;
        hourHit.onpointerdown = null;
        minuteHit.onpointerdown = null;

        // desenha o relogio ja pronto, so pra leitura
        clockState.hourAngle = (currentChallenge.hour % 12) * 30;
        clockState.minuteAngle = currentChallenge.minute * 6;
        setHandVisual('hour', clockState.hourAngle, 'neutral');
        setHandVisual('minute', clockState.minuteAngle, 'neutral');
    }

    HY.score.startChallenge();
}

/* ---------------------------------------------------------
   Verificacao
--------------------------------------------------------- */
function handleVerify() {
    if (challengeLocked) return;

    if (currentChallenge.type === 'drag') {
        const targetHourAngle = (currentChallenge.hour % 12) * 30;
        const targetMinuteAngle = currentChallenge.minute * 6;
        const hourOk = clockState.hourAngle === targetHourAngle;
        const minuteOk = clockState.minuteAngle === targetMinuteAngle;

        clockState.hourState = hourOk ? 'correct' : 'wrong';
        clockState.minuteState = minuteOk ? 'correct' : 'wrong';
        setHandVisual('hour', clockState.hourAngle, clockState.hourState);
        setHandVisual('minute', clockState.minuteAngle, clockState.minuteState);

        finishVerify(hourOk && minuteOk);
    } else {
        const hourVal = parseInt(document.getElementById('input-hour').value, 10);
        const minuteVal = parseInt(document.getElementById('input-minute').value, 10);
        const hourOk = hourVal === currentChallenge.hour;
        const minuteOk = minuteVal === currentChallenge.minute;

        const hourInput = document.getElementById('input-hour');
        const minuteInput = document.getElementById('input-minute');
        hourInput.classList.toggle('state-correct', hourOk);
        hourInput.classList.toggle('state-wrong', !hourOk);
        minuteInput.classList.toggle('state-correct', minuteOk);
        minuteInput.classList.toggle('state-wrong', !minuteOk);
        if (!hourOk) { hourInput.classList.add('shake-anim'); setTimeout(() => hourInput.classList.remove('shake-anim'), 400); }
        if (!minuteOk) { minuteInput.classList.add('shake-anim'); setTimeout(() => minuteInput.classList.remove('shake-anim'), 400); }

        finishVerify(hourOk && minuteOk);
    }
}

function finishVerify(allCorrect) {
    if (allCorrect) {
        challengeLocked = true;
        HY.playWin();
        HY.score.correct();
        setTimeout(advanceChallenge, 1000);
    } else {
        HY.playLose();
        HY.score.wrong();
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
