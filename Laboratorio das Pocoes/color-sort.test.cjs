const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(__dirname + '/color-sort.js', 'utf8');
const context = vm.createContext({
    HY: { stars: { init() {}, getStars() { return 0; } } },
    document: { getElementById() { return {}; } }
});
vm.runInContext(source, context);
const { generatePuzzle, pourCount, isSolved } = vm.runInContext('({ generatePuzzle, pourCount, isSolved })', context);
function solve(board) {
    const visited = new Set();
    function search(state) {
        if (isSolved(state)) return true;
        const key = state.map(t => t.join(',')).sort().join('|');
        if (visited.has(key)) return false;
        visited.add(key);
        for (let from = 0; from < state.length; from++) {
            if (!state[from].length || (state[from].length === 4 && state[from].every(c => c === state[from][0]))) continue;
            let emptyUsed = false;
            for (let to = 0; to < state.length; to++) {
                const count = pourCount(state, from, to);
                if (!count) continue;
                if (!state[to].length) {
                    if (emptyUsed || state[from].every(c => c === state[from][0])) continue;
                    emptyUsed = true;
                }
                const next = state.map(t => [...t]);
                next[to].push(...next[from].splice(-count));
                if (search(next)) return true;
            }
        }
        return false;
    }
    return search(board);
}
assert.equal(pourCount([[0, 1, 1], []], 0, 1), 2);
assert.equal(pourCount([[0, 1, 1], [1, 1, 1]], 0, 1), 1);
assert.equal(pourCount([[0], [1]], 0, 1), 0);
assert.equal(pourCount([[], [1]], 0, 1), 0);
assert.equal(pourCount([[0], [0, 0, 0, 0]], 0, 1), 0);
assert.equal(pourCount([[0]], 0, 0), 0);
assert.equal(isSolved([[0, 0], [0, 0], []]), false);
assert.equal(isSolved([[0, 0, 0, 0], []]), true);
let seed = 20260925;
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
for (let track = 0; track < 12; track++) {
    const colors = Math.min(6, 2 + Math.floor(track / 2));
    for (let challenge = 0; challenge < 5; challenge++) {
        for (let sample = 0; sample < 5; sample++) {
            const board = generatePuzzle(colors, 12 + track * 5 + challenge * 3, random);
            assert.equal(board.length, colors + 2);
            assert.ok(board.every(t => t.length <= 4));
            for (let color = 0; color < colors; color++) assert.equal(board.flat().filter(c => c === color).length, 4);
            assert.ok(solve(board), `Unsolvable track ${track}, challenge ${challenge}`);
        }
    }
}
console.log('OK: regras de transferência, vitória e 300 tabuleiros solucionáveis nas 12 trilhas.');
