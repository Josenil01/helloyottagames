/* Regras e desenhos compartilhados entre reconhecimento e pilotagem. */
((root) => {
    const regular = sides => Array.from({ length: sides }, (_, i) => {
        const angle = -Math.PI / 2 + i * Math.PI * 2 / sides;
        return `${50 + 40 * Math.cos(angle)},${50 + 40 * Math.sin(angle)}`;
    }).join(' ');
    const star = Array.from({ length: 10 }, (_, i) => {
        const angle = -Math.PI / 2 + i * Math.PI / 5, radius = i % 2 ? 18 : 42;
        return `${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`;
    }).join(' ');
    const SHAPES = [
        { id: 'circle', name: 'Círculo', drawing: '<circle cx="50" cy="50" r="39"/>' },
        { id: 'square', name: 'Quadrado', drawing: '<rect x="13" y="13" width="74" height="74"/>' },
        { id: 'triangle', name: 'Triângulo', drawing: '<polygon points="50,10 91,86 9,86"/>' },
        { id: 'rectangle', name: 'Retângulo', drawing: '<rect x="6" y="27" width="88" height="46"/>' },
        { id: 'oval', name: 'Oval', drawing: '<ellipse cx="50" cy="50" rx="44" ry="27"/>' },
        { id: 'diamond', name: 'Losango', drawing: '<polygon points="50,5 79,50 50,95 21,50"/>' },
        { id: 'star', name: 'Estrela', drawing: `<polygon points="${star}"/>` },
        { id: 'trapezoid', name: 'Trapézio', drawing: '<polygon points="28,20 72,20 94,80 6,80"/>' },
        { id: 'pentagon', name: 'Pentágono', drawing: `<polygon points="${regular(5)}"/>` },
        { id: 'hexagon', name: 'Hexágono', drawing: `<polygon points="${regular(6)}"/>` },
        { id: 'octagon', name: 'Octógono', drawing: `<polygon points="${regular(8)}"/>` },
        { id: 'heptagon', name: 'Heptágono', drawing: `<polygon points="${regular(7)}"/>` }
    ];
    const PALETTE = ['#67e8f9', '#f9a8d4', '#fde68a', '#a7f3d0', '#c4b5fd'];
    const LIMITS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 11, 12, 12];
    function shuffle(items, random = Math.random) {
        const result = items.slice();
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    const pool = track => SHAPES.slice(0, LIMITS[track]);
    function questions(track, random = Math.random) {
        const available = pool(track);
        // Inclui a figura mais avançada da trilha e duas figuras distintas para revisão.
        const targets = shuffle([available[available.length - 1], ...shuffle(available.slice(0, -1), random).slice(0, 2)], random);
        return targets.map(target => ({ target, options: shuffle([target, ...shuffle(available.filter(s => s !== target), random).slice(0, 2)], random) }));
    }
    function flightTargets(track, random = Math.random) {
        return shuffle(pool(track), random).slice(0, track >= 5 ? 3 : 1);
    }
    const targetIndex = (track, collected) => track < 5 ? 0 : collected < 3 ? 0 : collected < 6 ? 1 : 2;
    const pointsAfter = (score, correct) => Math.max(0, score + (correct ? 100 : -50));
    function svg(shape, color = PALETTE[0]) {
        return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g fill="${color}" stroke="#fff" stroke-width="2" stroke-linejoin="round">${shape.drawing}</g></svg>`;
    }
    function moveToward(position, target, speed, dt) {
        const dx = target.x - position.x, dy = target.y - position.y, distance = Math.hypot(dx, dy);
        const step = Math.min(distance, speed * dt);
        return distance ? { x: position.x + dx / distance * step, y: position.y + dy / distance * step } : { ...position };
    }
    const api = { SHAPES, PALETTE, pool, shuffle, questions, flightTargets, targetIndex, pointsAfter, svg, moveToward };
    if (typeof module !== 'undefined') module.exports = api;
    else root.Geometry = api;
})(typeof window !== 'undefined' ? window : globalThis);
