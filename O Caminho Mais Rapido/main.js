HY.stars.init('caminho-mais-rapido');

const TRACK_COUNT = 12;
const CHALLENGES_PER_TRACK = 5;
const MIN_NODES = 6;
const MAX_NODES = 12;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const SVG_WIDTH = 640;
const SVG_HEIGHT = 420;

// Mede o container real e usa essas dimensoes como espaco de coordenadas do
// grafo, pra ele preencher a maior parte da tela em qualquer proporcao
// (retrato no celular, paisagem no desktop) em vez de ficar com tarjas pretas
// por causa de um viewBox fixo desproporcional.
function measureGraphContainer(wrapId) {
    const el = document.getElementById(wrapId);
    const rect = el.getBoundingClientRect();
    return {
        width: Math.round(Math.max(280, rect.width || SVG_WIDTH)),
        height: Math.round(Math.max(280, rect.height || SVG_HEIGHT))
    };
}

const CHARACTER_COUNT_BY_BLOCK = [2, 2, 3, 4];
// Emoji de pessoa/casa nao tem "camiseta" recolorivel via CSS, entao cada
// personagem eh desenhado como um icone simples (SVG) — mesma silhueta pra
// todos, diferenciados so pela cor da camiseta/telhado.
const CHARACTERS_META = [
    { color: '#ff3041' },
    { color: '#0a40b5' },
    { color: '#ffa800' },
    { color: '#6ce67d' }
];

const SINGLE_CHALLENGE_COLOR = '#ffa800';

function personIconSvg(x, y, shirtColor, scale) {
    scale = scale || 1.35;
    return `<g class="marker-icon" transform="translate(${x},${y}) scale(${scale})">
        <circle cx="0" cy="-16" r="7" fill="#f4c9a0"></circle>
        <path d="M -9 12 L -9 -5 Q -9 -11 0 -11 Q 9 -11 9 -5 L 9 12 Z" fill="${shirtColor}" stroke="rgba(0,0,0,0.15)" stroke-width="1"></path>
        <rect x="-6" y="10" width="5" height="12" rx="2" fill="#3a3a3a"></rect>
        <rect x="1" y="10" width="5" height="12" rx="2" fill="#3a3a3a"></rect>
    </g>`;
}

function houseIconSvg(x, y, roofColor, scale) {
    scale = scale || 1.65;
    return `<g class="marker-icon" transform="translate(${x},${y}) scale(${scale})">
        <rect x="-14" y="-2" width="28" height="18" fill="#f3dcae" stroke="rgba(0,0,0,0.15)"></rect>
        <polygon points="-17,-2 0,-19 17,-2" fill="${roofColor}" stroke="rgba(0,0,0,0.15)"></polygon>
        <rect x="-4" y="5" width="8" height="11" fill="#6b4226"></rect>
    </g>`;
}

// Extensao (ja escalada) de cada icone a partir do seu ponto de ancoragem —
// usado pra garantir que o icone nunca ultrapasse a borda do grafo.
const PERSON_MARKER = { halfW: 9 * 1.35, topH: 23 * 1.35, botH: 22 * 1.35 };
const HOUSE_MARKER = { halfW: 17 * 1.65, topH: 19 * 1.65, botH: 16 * 1.65 };
// Precisa ser maior que o alcance do icone (~31) + raio do no (15) + folga,
// senao a ponta do icone (cabeca/telhado) fica dentro do circulo do no.
const MARKER_GAP = 54;

// Tenta ancorar o icone acima do no; se nao couber no topo do grafo, tenta
// embaixo; em ultimo caso, clampa dentro da area visivel.
function clampMarkerAnchor(node, dims, width, height) {
    let y;
    if (node.y + MARKER_GAP + dims.botH <= height) {
        y = node.y + MARKER_GAP; // padrao: sempre embaixo do no
    } else if (node.y - MARKER_GAP - dims.topH >= 0) {
        y = node.y - MARKER_GAP; // nao coube embaixo, tenta em cima
    } else {
        y = Math.max(dims.topH, Math.min(height - dims.botH, node.y + MARKER_GAP));
    }
    const x = Math.max(dims.halfW, Math.min(width - dims.halfW, node.x));
    return { x, y };
}

let currentTrack = 0;
let challengeIdx = 0;

// ---- Estado do desafio de caminho unico ----
let graph = null;
let startNode = 0;
let houseNode = 0;
let shortestDistance = 0;
let currentPath = [];
let singleViewSize = { width: SVG_WIDTH, height: SVG_HEIGHT };

// ---- Estado do desafio multi-personagem ----
let multiGraph = null;
let hubNode = 0;
let characters = [];
let characterPaths = [];
let activeCharacterIdx = 0;
let multiViewSize = { width: SVG_WIDTH, height: SVG_HEIGHT };

function init() {
    HY.stars.init('caminho-mais-rapido');
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
        emoji: () => '🗺️',
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
   Progressao de tamanho do grafo e numero de personagens
--------------------------------------------------------- */
function nodeCountForTrack(idx) {
    return Math.round(MIN_NODES + (MAX_NODES - MIN_NODES) * idx / (TRACK_COUNT - 1));
}

function blockForTrack(idx) {
    return Math.min(3, Math.floor(idx / 3));
}

function characterCountForTrack(idx) {
    return CHARACTER_COUNT_BY_BLOCK[blockForTrack(idx)];
}

function isMultiChallenge(idx) {
    return idx >= CHALLENGES_PER_TRACK - 2;
}

/* ---------------------------------------------------------
   Geracao do grafo: posicoes por amostragem com distancia
   minima (evita nos sobrepostos, layout fica irregular/organico)
--------------------------------------------------------- */
function generateNodePositions(n, width, height) {
    const margin = 34;
    const usableW = width - margin * 2;
    const usableH = height - margin * 2;
    let minDist = Math.max(30, Math.sqrt((usableW * usableH) / n) * 0.75);

    const positions = [];
    let guard = 0;
    while (positions.length < n && guard < 20000) {
        guard++;
        const x = margin + Math.random() * usableW;
        const y = margin + Math.random() * usableH;
        if (positions.every(p => Math.hypot(p.x - x, p.y - y) >= minDist)) {
            positions.push({ x, y });
        }
        if (guard % 1500 === 0) minDist *= 0.85;
    }
    while (positions.length < n) {
        positions.push({ x: margin + Math.random() * usableW, y: margin + Math.random() * usableH });
    }
    return positions;
}

// Angulo minimo entre quaisquer duas arestas que saem do mesmo no — evita
// que duas linhas quase paralelas (ex: E->C e E->D) fiquem ambiguas visualmente
// a ponto do jogador achar que da pra "passar reto" de uma pra outra.
const MIN_EDGE_ANGLE_DEG = 30;

function angleDeg(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
}

function violatesAngle(nodes, adjacency, nodeIdx, candidateIdx, minAngleDeg) {
    const node = nodes[nodeIdx];
    const candidateAngle = angleDeg(node, nodes[candidateIdx]);
    for (const neighborIdx of adjacency[nodeIdx]) {
        const existingAngle = angleDeg(node, nodes[neighborIdx]);
        let diff = Math.abs(candidateAngle - existingAngle);
        if (diff > 180) diff = 360 - diff;
        if (diff < minAngleDeg) return true;
    }
    return false;
}

function edgeIsValid(nodes, adjacency, a, b, minAngleDeg) {
    return !violatesAngle(nodes, adjacency, a, b, minAngleDeg) && !violatesAngle(nodes, adjacency, b, a, minAngleDeg);
}

// Menor angulo que a aresta nodeIdx->candidateIdx faria com as arestas ja
// existentes em nodeIdx (Infinity se nodeIdx ainda nao tem vizinhos).
function worstAngleIfAdded(nodes, adjacency, nodeIdx, candidateIdx) {
    const node = nodes[nodeIdx];
    const candidateAngle = angleDeg(node, nodes[candidateIdx]);
    let worst = Infinity;
    adjacency[nodeIdx].forEach(neighborIdx => {
        const existingAngle = angleDeg(node, nodes[neighborIdx]);
        let diff = Math.abs(candidateAngle - existingAngle);
        if (diff > 180) diff = 360 - diff;
        if (diff < worst) worst = diff;
    });
    return worst;
}

// Quando nenhum candidato cumpre o angulo minimo, escolhe o menos ruim
// (maior angulo minimo obtido nas duas pontas) em vez do primeiro da lista.
function bestFallbackCandidate(nodes, adjacency, newNode, candidates) {
    let best = candidates[0], bestScore = -1;
    candidates.forEach(c => {
        const score = Math.min(
            worstAngleIfAdded(nodes, adjacency, newNode, c),
            worstAngleIfAdded(nodes, adjacency, c, newNode)
        );
        if (score > bestScore) { bestScore = score; best = c; }
    });
    return best;
}

// Conecta o hub a `minDegree` outros nos ANTES de qualquer outra aresta
// existir. Isso importa: checar o angulo minimo fica facil quando o hub e os
// candidatos ainda nao tem nenhuma aresta (so precisa espalhar bem as arestas
// do proprio hub) — bem mais viavel do que tentar encaixar mais arestas DEPOIS
// que o grafo inteiro ja esta denso e o "espaco angular" já foi ocupado.
function connectHubFirst(nodes, adjacency, hub, minDegree, minAngleDeg) {
    const others = HY.shuffle(Array.from({ length: nodes.length }, (_, i) => i).filter(i => i !== hub));
    for (const candidate of others) {
        if (adjacency[hub].size >= minDegree) break;
        if (edgeIsValid(nodes, adjacency, hub, candidate, minAngleDeg)) {
            adjacency[hub].add(candidate);
            adjacency[candidate].add(hub);
        }
    }
}

// adjacency (opcional): permite "semear" o grafo com arestas ja definidas
// (ex: as do hub) antes de completar a arvore geradora e as arestas extras.
function generateEdges(nodes, minAngleDeg, adjacency) {
    const n = nodes.length;
    adjacency = adjacency || Array.from({ length: n }, () => new Set());

    const connected = [];
    let remaining = [];
    for (let i = 0; i < n; i++) {
        if (adjacency[i].size > 0) connected.push(i); else remaining.push(i);
    }
    if (connected.length === 0) {
        const order = HY.shuffle(remaining);
        connected.push(order[0]);
        remaining = order.slice(1);
    } else {
        remaining = HY.shuffle(remaining);
    }

    for (const newNode of remaining) {
        const candidates = HY.shuffle(connected.slice());
        let chosen = candidates.find(c => edgeIsValid(nodes, adjacency, newNode, c, minAngleDeg));
        if (chosen === undefined) chosen = bestFallbackCandidate(nodes, adjacency, newNode, candidates);
        adjacency[newNode].add(chosen);
        adjacency[chosen].add(newNode);
        connected.push(newNode);
    }

    const extraCount = Math.round(n * 0.4);
    let added = 0, guard = 0;
    while (added < extraCount && guard < extraCount * 200) {
        guard++;
        const a = Math.floor(Math.random() * n);
        const b = Math.floor(Math.random() * n);
        if (a !== b && !adjacency[a].has(b) && edgeIsValid(nodes, adjacency, a, b, minAngleDeg)) {
            adjacency[a].add(b);
            adjacency[b].add(a);
            added++;
        }
    }
    return adjacency;
}

function minAngularGapForNode(node, neighborNodes) {
    if (neighborNodes.length < 2) return 360;
    const angles = neighborNodes.map(n => angleDeg(node, n)).sort((a, b) => a - b);
    let worst = Infinity;
    for (let i = 0; i < angles.length; i++) {
        const a = angles[i];
        const b = i === angles.length - 1 ? angles[0] + 360 : angles[i + 1];
        const gap = b - a;
        if (gap < worst) worst = gap;
    }
    return worst;
}

function graphMinAngularGap(nodes, adjacency) {
    let worst = Infinity;
    nodes.forEach((node, i) => {
        const neighbors = Array.from(adjacency[i]).map(j => nodes[j]);
        const gap = minAngularGapForNode(node, neighbors);
        if (gap < worst) worst = gap;
    });
    return worst;
}

function generateGraph(n, width, height) {
    const attempts = n <= 14 ? 15 : 8;
    let best = null, bestGap = -1;

    for (let attempt = 0; attempt < attempts; attempt++) {
        const positions = generateNodePositions(n, width, height);
        const nodes = positions.map((pos, i) => ({ id: i, letter: LETTERS[i], x: pos.x, y: pos.y }));
        const adjacency = generateEdges(nodes, MIN_EDGE_ANGLE_DEG);
        const gap = graphMinAngularGap(nodes, adjacency);

        if (gap > bestGap) { bestGap = gap; best = { nodes, adjacency }; }
        if (gap >= MIN_EDGE_ANGLE_DEG) return best;
    }
    return best;
}

// Igual generateGraph, mas garante de saida que `hub` tem grau suficiente pra
// sustentar `characterCount` caminhos disjuntos passando por ele (cada
// personagem gasta 2 arestas distintas no hub: uma de entrada, uma de saida).
function generateGraphWithHub(n, width, height, hub, characterCount) {
    const minHubDegree = Math.min(n - 1, characterCount * 2);
    const attempts = n <= 14 ? 40 : 20;
    let best = null, bestHubDegree = -1, bestGap = -1;

    for (let attempt = 0; attempt < attempts; attempt++) {
        const positions = generateNodePositions(n, width, height);
        const nodes = positions.map((pos, i) => ({ id: i, letter: LETTERS[i], x: pos.x, y: pos.y }));
        const adjacency = Array.from({ length: n }, () => new Set());
        connectHubFirst(nodes, adjacency, hub, minHubDegree, MIN_EDGE_ANGLE_DEG);
        generateEdges(nodes, MIN_EDGE_ANGLE_DEG, adjacency);
        const gap = graphMinAngularGap(nodes, adjacency);
        const hubDegree = adjacency[hub].size;

        // prioriza atingir o grau minimo do hub; entre os que atingem (ou nao),
        // desempata pelo angulo minimo do grafo inteiro
        const better = hubDegree > bestHubDegree || (hubDegree === bestHubDegree && gap > bestGap);
        if (better) { bestHubDegree = hubDegree; bestGap = gap; best = { nodes, adjacency }; }
        if (gap >= MIN_EDGE_ANGLE_DEG && hubDegree >= minHubDegree) return best;
    }
    return best;
}

function bfsDistances(adjacency, start, avoidNode) {
    const n = adjacency.length;
    const dist = new Array(n).fill(-1);
    if (start === avoidNode) return dist;
    dist[start] = 0;
    const queue = [start];
    while (queue.length) {
        const cur = queue.shift();
        adjacency[cur].forEach(next => {
            if (next === avoidNode) return;
            if (dist[next] === -1) {
                dist[next] = dist[cur] + 1;
                queue.push(next);
            }
        });
    }
    return dist;
}

/* ---------------------------------------------------------
   Desafio de caminho unico (1-3)
--------------------------------------------------------- */
function minDistanceForNodeCount(n) {
    if (n <= 8) return 2;
    if (n <= 16) return 3;
    return 4;
}

function pickStartHouse(adjacency, n) {
    const minDist = minDistanceForNodeCount(n);
    for (let attempt = 0; attempt < 200; attempt++) {
        const start = Math.floor(Math.random() * n);
        const dist = bfsDistances(adjacency, start, -1);
        const candidates = [];
        for (let i = 0; i < n; i++) if (dist[i] >= minDist) candidates.push(i);
        if (candidates.length) {
            const house = candidates[Math.floor(Math.random() * candidates.length)];
            return { start, house, shortest: dist[house] };
        }
    }
    const dist = bfsDistances(adjacency, 0, -1);
    let house = 0, best = -1;
    dist.forEach((d, i) => { if (d > best) { best = d; house = i; } });
    return { start: 0, house, shortest: best };
}

function loadSingleChallenge() {
    document.getElementById('multi-path-challenge').classList.remove('active');
    document.getElementById('single-path-challenge').classList.add('active');
    document.getElementById('instruction').textContent =
        'Clique nos nós vizinhos para traçar o caminho mais curto até a casa!';

    const n = nodeCountForTrack(currentTrack);
    const size = measureGraphContainer('single-graph-wrap');
    singleViewSize = size;
    document.getElementById('graph-svg').setAttribute('viewBox', `0 0 ${size.width} ${size.height}`);
    graph = generateGraph(n, size.width, size.height);
    const pick = pickStartHouse(graph.adjacency, n);
    startNode = pick.start;
    houseNode = pick.house;
    shortestDistance = pick.shortest;
    currentPath = [startNode];

    renderSingleGraph();
    updateSingleHud();
}

function handleSingleNodeClick(nodeIdx) {
    const last = currentPath[currentPath.length - 1];
    if (nodeIdx === last && currentPath.length > 1) {
        currentPath.pop();
    } else if (graph.adjacency[last].has(nodeIdx) && !currentPath.includes(nodeIdx)) {
        currentPath.push(nodeIdx);
    }
    renderSingleGraph();
    updateSingleHud();
}

function updateSingleHud() {
    document.getElementById('step-counter').textContent = currentPath.length - 1;
    const last = currentPath[currentPath.length - 1];
    document.getElementById('verify-single-btn').disabled = (last !== houseNode);
}

function restartSinglePath() {
    currentPath = [startNode];
    renderSingleGraph();
    updateSingleHud();
}

function svgEdgesHtml(nodes, adjacency, extraClass) {
    let html = '';
    nodes.forEach((node, i) => {
        adjacency[i].forEach(j => {
            if (j > i) {
                const n2 = nodes[j];
                html += `<line x1="${node.x}" y1="${node.y}" x2="${n2.x}" y2="${n2.y}" class="graph-edge ${extraClass || ''}"/>`;
            }
        });
    });
    return html;
}

function svgPathLineHtml(nodes, path, color) {
    let html = '';
    for (let i = 1; i < path.length; i++) {
        const a = nodes[path[i - 1]], b = nodes[path[i]];
        html += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="graph-path-line" stroke="${color}"/>`;
    }
    return html;
}

function svgNodesHtml(nodes, path, onClickFn) {
    let html = '';
    nodes.forEach((node, i) => {
        const inPath = path.includes(i);
        html += `<g class="graph-node${inPath ? ' in-path' : ''}" onclick="${onClickFn}(${i})">
            <circle cx="${node.x}" cy="${node.y}" r="15"></circle>
            <text x="${node.x}" y="${node.y}">${node.letter}</text>
        </g>`;
    });
    return html;
}

function renderSingleGraph() {
    const svg = document.getElementById('graph-svg');
    let html = svgEdgesHtml(graph.nodes, graph.adjacency);
    html += svgPathLineHtml(graph.nodes, currentPath, 'var(--hy-orange)');
    html += svgNodesHtml(graph.nodes, currentPath, 'handleSingleNodeClick');

    const startPos = graph.nodes[startNode];
    const housePos = graph.nodes[houseNode];
    const personAnchor = clampMarkerAnchor(startPos, PERSON_MARKER, singleViewSize.width, singleViewSize.height);
    const houseAnchor = clampMarkerAnchor(housePos, HOUSE_MARKER, singleViewSize.width, singleViewSize.height);
    html += personIconSvg(personAnchor.x, personAnchor.y, SINGLE_CHALLENGE_COLOR);
    html += houseIconSvg(houseAnchor.x, houseAnchor.y, SINGLE_CHALLENGE_COLOR);

    svg.innerHTML = html;
}

function verifySinglePath() {
    const last = currentPath[currentPath.length - 1];
    if (last !== houseNode) return;

    const steps = currentPath.length - 1;
    const isCorrect = steps === shortestDistance;

    if (isCorrect) {
        HY.playWin();
        HY.score.correct();
        document.getElementById('verify-single-btn').disabled = true;
        setTimeout(() => {
            if (challengeIdx >= CHALLENGES_PER_TRACK - 1) finishTrack();
            else nextChallenge();
        }, 900);
    } else {
        HY.playLose();
        HY.score.wrong();
        const wrap = document.querySelector('#single-path-challenge .graph-wrap');
        wrap.classList.remove('shake-anim');
        void wrap.offsetWidth;
        wrap.classList.add('shake-anim');
        setTimeout(() => wrap.classList.remove('shake-anim'), 400);
    }
}

/* ---------------------------------------------------------
   Desafio multi-personagem (4-5)
--------------------------------------------------------- */
function isHubMandatory(adjacency, n, hub, start, house, shortestDist) {
    if (start === hub || house === hub) return false;
    const dist = bfsDistances(adjacency, start, hub);
    return dist[house] === -1 || dist[house] > shortestDist;
}

// BFS que tambem conta quantos caminhos minimos distintos existem ate cada no
// (nao so a distancia) e reconstroi um deles. Se pathCount > 1, o jogador
// poderia legitimamente tracar uma rota diferente da que a gente escolheu —
// e essa outra rota poderia nao passar pelo hub ou sobrepor outro personagem.
function countShortestPathsAndReconstruct(adjacency, start, target) {
    const n = adjacency.length;
    const dist = new Array(n).fill(-1);
    const count = new Array(n).fill(0);
    const parent = new Array(n).fill(-1);
    dist[start] = 0;
    count[start] = 1;
    const queue = [start];
    while (queue.length) {
        const cur = queue.shift();
        adjacency[cur].forEach(next => {
            if (dist[next] === -1) {
                dist[next] = dist[cur] + 1;
                count[next] = count[cur];
                parent[next] = cur;
                queue.push(next);
            } else if (dist[next] === dist[cur] + 1) {
                count[next] += count[cur];
            }
        });
    }
    if (dist[target] === -1) return null;
    const path = [target];
    let cur = target;
    while (cur !== start) { cur = parent[cur]; path.unshift(cur); }
    return { distance: dist[target], pathCount: count[target], path };
}

function pathToEdgeSet(path) {
    const edges = new Set();
    for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i];
        edges.add(a < b ? `${a}-${b}` : `${b}-${a}`);
    }
    return edges;
}

function sharesAnyEdge(edgesA, edgesB) {
    for (const e of edgesA) if (edgesB.has(e)) return true;
    return false;
}

// Encontra um par inicio/casa cujo caminho minimo (1) passa obrigatoriamente
// pelo hub, (2) eh UNICO — sem empate que deixe o jogador escolher uma rota
// diferente da prevista — e (3) nao compartilha nenhuma aresta com os
// caminhos dos personagens ja escolhidos (so podem se tocar no proprio hub).
function pickPairThroughHub(adjacency, n, hub, distFromHub, usedNodes, usedEdges) {
    const candidateStarts = [];
    for (let i = 0; i < n; i++) if (!usedNodes.has(i) && distFromHub[i] > 0) candidateStarts.push(i);
    const shuffledStarts = HY.shuffle(candidateStarts);

    for (const start of shuffledStarts) {
        const distFromStart = bfsDistances(adjacency, start, -1);
        const candidateHouses = [];
        for (let j = 0; j < n; j++) {
            if (usedNodes.has(j) || j === start || distFromHub[j] === 0) continue;
            const throughHub = distFromStart[hub] + distFromHub[j] === distFromStart[j];
            if (throughHub && isHubMandatory(adjacency, n, hub, start, j, distFromStart[j])) {
                candidateHouses.push(j);
            }
        }

        for (const house of HY.shuffle(candidateHouses)) {
            const result = countShortestPathsAndReconstruct(adjacency, start, house);
            if (!result || result.pathCount !== 1) continue;
            const edges = pathToEdgeSet(result.path);
            if (sharesAnyEdge(edges, usedEdges)) continue;
            return { start, house, shortest: result.distance, path: result.path, edges };
        }
    }
    return null;
}

// Cada personagem cujo caminho so "passa" pelo hub (nao comeca/termina nele)
// gasta 2 arestas distintas nele (uma de entrada, uma de saida); como nenhum
// personagem pode repetir aresta de outro, o hub precisa ter grau alto o
// suficiente pra sustentar todos eles ao mesmo tempo — o que dificilmente
// acontece por acaso num grafo pequeno (grau medio ~2-3). Entao a gente
// garante isso na mao, adicionando arestas extras no hub (respeitando o
// angulo minimo) ate ele ter grau suficiente.
function tryGenerateMultiChallenge(n, characterCount, width, height) {
    for (let hubAttempt = 0; hubAttempt < 15; hubAttempt++) {
        const hub = Math.floor(Math.random() * n);
        const g = generateGraphWithHub(n, width, height, hub, characterCount);
        const distFromHub = bfsDistances(g.adjacency, hub, -1);
        const usedNodes = new Set([hub]);
        const usedEdges = new Set();
        const chars = [];
        let success = true;

        for (let c = 0; c < characterCount; c++) {
            const pair = pickPairThroughHub(g.adjacency, n, hub, distFromHub, usedNodes, usedEdges);
            if (!pair) { success = false; break; }
            chars.push(pair);
            usedNodes.add(pair.start);
            usedNodes.add(pair.house);
            pair.edges.forEach(e => usedEdges.add(e));
        }

        if (success) return { graph: g, hub, chars };
    }
    return null;
}

function generateMultiChallenge(characterCountWanted, width, height) {
    const n = nodeCountForTrack(currentTrack);
    for (let attempt = 0; attempt < 25; attempt++) {
        const result = tryGenerateMultiChallenge(n, characterCountWanted, width, height);
        if (result) return result;
    }
    for (let attempt = 0; attempt < 25; attempt++) {
        const result = tryGenerateMultiChallenge(n, Math.max(2, characterCountWanted - 1), width, height);
        if (result) return result;
    }
    for (let attempt = 0; attempt < 60; attempt++) {
        const result = tryGenerateMultiChallenge(n, 2, width, height);
        if (result) return result;
    }
    throw new Error('Nao foi possivel gerar desafio multi-personagem');
}

function loadMultiChallenge() {
    document.getElementById('single-path-challenge').classList.remove('active');
    document.getElementById('multi-path-challenge').classList.add('active');
    document.getElementById('instruction').textContent =
        'Trace o caminho mais curto de cada personagem e descubra em que letra eles se cruzam!';

    const characterCount = characterCountForTrack(currentTrack);
    // renderiza as abas antes de medir, pra elas ja ocuparem espaco no layout
    // e o grafo nao ser gerado maior do que o espaco que realmente vai sobrar
    renderCharacterTabsPlaceholder(characterCount);
    const size = measureGraphContainer('multi-graph-wrap');
    multiViewSize = size;
    document.getElementById('multi-graph-svg').setAttribute('viewBox', `0 0 ${size.width} ${size.height}`);
    const result = generateMultiChallenge(characterCount, size.width, size.height);

    multiGraph = result.graph;
    hubNode = result.hub;
    characters = result.chars;
    characterPaths = characters.map(ch => [ch.start]);
    activeCharacterIdx = 0;

    document.getElementById('crossing-input').value = '';
    document.getElementById('crossing-input').classList.remove('state-correct', 'state-wrong');

    renderCharacterTabs();
    renderMultiGraph();
    updateMultiHud();
}

function tabIconSvg(color) {
    return `<svg width="28" height="28" viewBox="-16 -20 32 36">
        <circle cx="0" cy="-16" r="7" fill="#f4c9a0"></circle>
        <path d="M -9 12 L -9 -5 Q -9 -11 0 -11 Q 9 -11 9 -5 L 9 12 Z" fill="${color}"></path>
        <rect x="-6" y="10" width="5" height="12" rx="2" fill="#3a3a3a"></rect>
        <rect x="1" y="10" width="5" height="12" rx="2" fill="#3a3a3a"></rect>
    </svg>`;
}

function renderCharacterTabsPlaceholder(count) {
    const box = document.getElementById('character-tabs');
    box.innerHTML = CHARACTERS_META.slice(0, count).map(meta => `<button class="character-tab">${tabIconSvg(meta.color)}</button>`).join('');
}

function renderCharacterTabs() {
    const box = document.getElementById('character-tabs');
    box.innerHTML = characters.map((ch, i) => {
        const meta = CHARACTERS_META[i];
        return `<button class="character-tab${i === activeCharacterIdx ? ' active' : ''}" onclick="selectCharacter(${i})">${tabIconSvg(meta.color)}</button>`;
    }).join('');
}

function selectCharacter(idx) {
    activeCharacterIdx = idx;
    renderCharacterTabs();
    renderMultiGraph();
    updateMultiHud();
}

function handleMultiNodeClick(nodeIdx) {
    const path = characterPaths[activeCharacterIdx];
    const last = path[path.length - 1];
    if (nodeIdx === last && path.length > 1) {
        path.pop();
    } else if (multiGraph.adjacency[last].has(nodeIdx) && !path.includes(nodeIdx)) {
        path.push(nodeIdx);
    }
    renderMultiGraph();
    updateMultiHud();
}

function updateMultiHud() {
    const path = characterPaths[activeCharacterIdx];
    document.getElementById('multi-step-counter').textContent = path.length - 1;
}

function restartMultiPath() {
    characterPaths[activeCharacterIdx] = [characters[activeCharacterIdx].start];
    renderMultiGraph();
    updateMultiHud();
}

function renderMultiGraph() {
    const svg = document.getElementById('multi-graph-svg');
    let html = svgEdgesHtml(multiGraph.nodes, multiGraph.adjacency);

    characters.forEach((ch, i) => {
        html += svgPathLineHtml(multiGraph.nodes, characterPaths[i], CHARACTERS_META[i].color);
    });

    const activePath = characterPaths[activeCharacterIdx];
    html += svgNodesHtml(multiGraph.nodes, activePath, 'handleMultiNodeClick');

    characters.forEach((ch, i) => {
        const meta = CHARACTERS_META[i];
        const startPos = multiGraph.nodes[ch.start];
        const housePos = multiGraph.nodes[ch.house];
        const personAnchor = clampMarkerAnchor(startPos, PERSON_MARKER, multiViewSize.width, multiViewSize.height);
        const houseAnchor = clampMarkerAnchor(housePos, HOUSE_MARKER, multiViewSize.width, multiViewSize.height);
        html += personIconSvg(personAnchor.x, personAnchor.y, meta.color);
        html += houseIconSvg(houseAnchor.x, houseAnchor.y, meta.color);
    });

    svg.innerHTML = html;
}

function verifyMultiPath() {
    const allPathsValid = characters.every((ch, i) => {
        const path = characterPaths[i];
        return path[path.length - 1] === ch.house && (path.length - 1) === ch.shortest;
    });

    const input = document.getElementById('crossing-input');
    const typedLetter = input.value.trim().toUpperCase();
    const hubLetter = multiGraph.nodes[hubNode].letter;
    const letterCorrect = typedLetter === hubLetter;
    const isCorrect = allPathsValid && letterCorrect;

    input.classList.toggle('state-correct', letterCorrect);
    input.classList.toggle('state-wrong', !letterCorrect);

    if (isCorrect) {
        HY.playWin();
        HY.score.correct();
        setTimeout(() => {
            if (challengeIdx >= CHALLENGES_PER_TRACK - 1) finishTrack();
            else nextChallenge();
        }, 900);
    } else {
        HY.playLose();
        HY.score.wrong();
        const wrap = document.querySelector('#multi-path-challenge .graph-wrap');
        wrap.classList.remove('shake-anim');
        void wrap.offsetWidth;
        wrap.classList.add('shake-anim');
        setTimeout(() => wrap.classList.remove('shake-anim'), 400);
    }
}

/* ---------------------------------------------------------
   Fluxo geral
--------------------------------------------------------- */
function loadChallenge() {
    if (isMultiChallenge(challengeIdx)) {
        loadMultiChallenge();
    } else {
        loadSingleChallenge();
    }
    HY.score.startChallenge();
}

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
