const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const G = require('./geometry-core.js');

for (let track = 0; track < 12; track++) {
    for (let sample = 0; sample < 30; sample++) {
        const questions = G.questions(track);
        assert.equal(questions.length, 3);
        assert.equal(new Set(questions.map(q => q.target.id)).size, 3);
        for (const q of questions) {
            assert.equal(q.options.length, 3);
            assert.equal(new Set(q.options.map(s => s.id)).size, 3);
            assert.equal(q.options.filter(s => s.id === q.target.id).length, 1);
        }
        const targets = G.flightTargets(track);
        assert.equal(targets.length, track >= 5 ? 3 : 1);
        assert.equal(new Set(targets.map(t => t.id)).size, targets.length);
    }
}
assert.equal(G.targetIndex(4, 6), 0);
assert.deepEqual([0, 2, 3, 5, 6, 9].map(n => G.targetIndex(5, n)), [0, 0, 1, 1, 2, 2]);
assert.equal(G.pointsAfter(0, false), 0);
assert.equal(G.pointsAfter(100, false), 50);
assert.equal(G.pointsAfter(0, true), 100);
assert.deepEqual(G.moveToward({ x: 0, y: 0 }, { x: 100, y: 0 }, 50, 1), { x: 50, y: 0 });
assert.deepEqual(G.moveToward({ x: 0, y: 0 }, { x: 10, y: 0 }, 50, 1), { x: 10, y: 0 });

// Teste de integração sem navegador: usa os handlers reais e um DOM mínimo.
class Element {
    constructor() {
        this.children = []; this.style = {}; this.attrs = {}; this.listeners = {};
        this.classList = { add() {}, remove() {} };
        this.clientWidth = 800; this.clientHeight = 450;
        this.firstElementChild = { style: {} }; this.parentElement = { setAttribute() {} };
    }
    setAttribute(key, value) { this.attrs[key] = value; }
    appendChild(child) { this.children.push(child); }
    replaceChildren() { this.children = []; }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    focus() {} remove() {} setPointerCapture() {}
    getBoundingClientRect() { return { left: 0, top: 0 }; }
}
const nodes = new Map(), frames = new Map(), finished = [];
const get = id => { if (!nodes.has(id)) nodes.set(id, new Element()); return nodes.get(id); };
let nextFrame = 0;
const context = vm.createContext({
    Geometry: G, document: { getElementById: get, createElement: () => new Element(), querySelectorAll: () => [], addEventListener() {}, hidden: false },
    requestAnimationFrame(fn) { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
    ResizeObserver: class { observe() {} }, addEventListener() {},
    HY: { stars: { init() {}, getUnlocked: () => 12, renderGrid() {}, getStars: () => 0, trackComplete(n) { finished.push(n); return 3; } }, elapsed: { stopTrail() {}, hide() {} }, playWin() {}, playLose() {} }
});
context.window = context;
vm.runInContext(fs.readFileSync(__dirname + '/geometry-score.js', 'utf8'), context);
const code = fs.readFileSync(__dirname + '/geometry.js', 'utf8');
vm.runInContext(code.replace("    HY.stars.init('galaxia-geometrica');", `
    window.testGame = { startTrack, confirmAnswer, nextChallenge, collect, resumeFlight, pauseFlight, showScene,
        getState: () => ({ track, phase, quiz, flight, completed }), currentTarget };
    HY.stars.init('galaxia-geometrica');`), context);
const T = context.testGame;
function answerCorrectly() {
    const state = T.getState(), q = state.quiz[state.phase];
    get('geo-options').children[q.options.findIndex(o => o.id === q.target.id)].onclick();
    T.confirmAnswer();
}
for (const track of [0, 5, 11]) {
    T.startTrack(track);
    for (let phase = 0; phase < 3; phase++) {
        answerCorrectly();
        assert.equal(T.getState().completed, true);
        assert.equal(context.HY.score.get(), (phase + 1) * 100);
        T.confirmAnswer(); // clique duplicado não soma pontos
        assert.equal(context.HY.score.get(), (phase + 1) * 100);
        T.nextChallenge();
    }
    for (let phase = 3; phase < 5; phase++) {
        assert.equal(T.getState().phase, phase);
        T.resumeFlight();
        const startPoints = context.HY.score.get();
        const badShape = G.pool(track).find(s => s.id !== T.currentTarget().id);
        T.collect({ shape: badShape });
        assert.equal(T.getState().flight.collected, 0);
        assert.equal(context.HY.score.get(), startPoints - 50);
        for (let count = 1; count <= 10; count++) {
            T.collect({ shape: T.currentTarget() });
            assert.equal(T.getState().flight.collected, count);
            if (track >= 5 && [3, 6].includes(count)) {
                assert.equal(T.getState().flight.running, false);
                assert.equal(T.getState().flight.switchRemaining, 2.5);
                T.resumeFlight();
            }
        }
        assert.equal(context.HY.score.get(), startPoints + 950);
        assert.equal(T.getState().completed, true);
        assert.equal(frames.size, 0);
        if (phase === 3) T.nextChallenge();
    }
    assert.equal(context.HY.score.get(), 2200);
}
assert.deepEqual(finished, [0, 5, 11]);
T.startTrack(0);
const q = T.getState().quiz[0];
get('geo-options').children[q.options.findIndex(o => o.id !== q.target.id)].onclick();
T.confirmAnswer();
assert.equal(context.HY.score.get(), 0);
assert.equal(T.getState().completed, false);
for (let i = 0; i < 3; i++) { answerCorrectly(); T.nextChallenge(); }
T.resumeFlight();
const arena = get('geo-arena');
arena.listeners.pointermove({ pointerType: 'mouse', clientX: 600, clientY: 200 });
assert.equal(T.getState().flight.pointer.x, 600); // sem clique
arena.listeners.pointerdown({ pointerType: 'touch', pointerId: 1, clientX: 300, clientY: 250 });
assert.equal(T.getState().flight.pointer.y, 202); // nave visível acima do dedo
arena.listeners.pointermove({ pointerType: 'touch', pointerId: 1, clientX: 400, clientY: 280 });
assert.equal(T.getState().flight.pointer.x, 400);
arena.listeners.pointerup({ pointerType: 'touch', pointerId: 1 });
assert.equal(T.getState().flight.pointer.x, T.getState().flight.ship.x);
T.pauseFlight();
assert.equal(T.getState().flight.running, false);
T.showScene('levels');
assert.equal(T.getState().flight, null);
assert.equal(frames.size, 0);
console.log('OK: 360 conjuntos de perguntas, dificuldade, pontuação exata, 3 trilhas completas, troca de alvo, mouse, toque, pausa e cancelamento do voo.');
