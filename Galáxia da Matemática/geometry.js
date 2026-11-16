'use strict';
(() => {
    const G = window.Geometry;
    const $ = id => document.getElementById(id);
    const arena = $('geo-arena');
    let track = 0, phase = 0, selected = -1, quiz = [], answered = false, completed = false;
    let flight = null, frameId = 0, lastTime = 0, activePointer = null;
    const keys = new Set();
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    function stopFlight() {
        cancelAnimationFrame(frameId);
        frameId = 0;
        keys.clear();
        activePointer = null;
        if (flight) flight.running = false;
    }
    function showScene(name) {
        stopFlight();
        flight = null;
        ['home', 'levels', 'game'].forEach(scene => $('geo-' + scene).hidden = scene !== name);
        if (name !== 'game') { HY.elapsed.stopTrail(); HY.elapsed.hide(); }
        if (name === 'levels') {
            HY.stars.renderGrid('geo-grid', { onPlay: startTrack, emoji: () => '🚀', accentColor: '#818cf8' });
            // O grid compartilhado usa divs: adiciona suporte ao teclado neste jogo.
            document.querySelectorAll('#geo-grid .hy-track-card').forEach((card, i) => {
                card.setAttribute('role', 'button');
                card.setAttribute('aria-disabled', String(i >= HY.stars.getUnlocked()));
                card.tabIndex = i < HY.stars.getUnlocked() ? 0 : -1;
                card.onkeydown = event => {
                    if (i < HY.stars.getUnlocked() && ['Enter', ' '].includes(event.key)) { event.preventDefault(); startTrack(i); }
                };
            });
            $('geo-stars').textContent = `⭐ ${Array.from({ length: 12 }, (_, i) => HY.stars.getStars(i)).reduce((a, b) => a + b, 0)} / 36`;
        }
    }
    function startTrack(index) {
        if (index < 0 || index >= HY.stars.getUnlocked()) return;
        track = index;
        phase = 0;
        quiz = G.questions(track);
        showScene('game');
        HY.score.reset();
        startChallenge();
    }
    function updateProgress(count) {
        $('geo-progress-fill').style.width = `${count / 5 * 100}%`;
        $('geo-progress-fill').parentElement.setAttribute('aria-valuenow', String(count));
    }
    function startChallenge() {
        stopFlight();
        flight = null;
        completed = false;
        $('geo-result').hidden = true;
        $('geo-recognition').hidden = phase >= 3;
        $('geo-flight').hidden = phase < 3;
        $('geo-phase').textContent = `Trilha ${track + 1} · Desafio ${phase + 1}/5`;
        updateProgress(phase);
        HY.score.startChallenge();
        if (phase < 3) showQuestion();
        else startFlight();
    }
    function showQuestion() {
        selected = -1;
        answered = false;
        const question = quiz[phase];
        $('geo-question').textContent = `Encontre: ${question.target.name}`;
        $('geo-answer-feedback').textContent = '';
        $('geo-confirm').disabled = true;
        $('geo-options').replaceChildren();
        const colors = G.shuffle(G.PALETTE);
        question.options.forEach((shape, index) => {
            const button = document.createElement('button');
            button.className = 'geo-option';
            button.setAttribute('aria-label', `Opção ${index + 1}: ${shape.name}`);
            button.setAttribute('aria-pressed', 'false');
            button.innerHTML = G.svg(shape, colors[index]);
            if (track >= 8) button.firstElementChild.style.transform = `rotate(${[0, 15, -15][index]}deg) scale(.9)`;
            button.onclick = () => {
                if (answered) return;
                selected = index;
                [...$('geo-options').children].forEach((option, i) => option.setAttribute('aria-pressed', String(i === index)));
                $('geo-confirm').disabled = false;
                $('geo-answer-feedback').textContent = 'Figura selecionada. Confirme sua resposta.';
            };
            $('geo-options').appendChild(button);
        });
    }
    function confirmAnswer() {
        if (selected < 0 || answered || completed || phase >= 3) return;
        const question = quiz[phase];
        if (question.options[selected].id === question.target.id) {
            answered = true;
            HY.score.correct();
            HY.playWin();
            finishChallenge();
        } else {
            HY.score.wrong();
            HY.playLose();
            const option = $('geo-options').children[selected];
            option.disabled = true;
            option.classList.add('wrong');
            option.setAttribute('aria-pressed', 'false');
            selected = -1;
            $('geo-confirm').disabled = true;
            $('geo-answer-feedback').textContent = 'Ainda não! −50 pontos. Observe o contorno e escolha outra figura.';
        }
    }
    function finishChallenge() {
        if (completed) return;
        completed = true;
        stopFlight();
        $('geo-recognition').hidden = true;
        $('geo-flight').hidden = true;
        $('geo-result').hidden = false;
        updateProgress(phase + 1);
        const final = phase === 4;
        let stars = 0;
        if (final) { HY.elapsed.stopTrail(); stars = HY.stars.trackComplete(track); }
        $('geo-result-title').textContent = final ? 'Trilha concluída!' : phase < 3 ? 'Figura reconhecida!' : 'Coleta concluída!';
        $('geo-result-text').textContent = phase < 3 ? `${quiz[phase].target.name}: resposta correta! +100 pontos.` : `10 formas corretas coletadas! Pontuação da trilha: ${HY.score.get()}.`;
        $('geo-result-stars').textContent = stars ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : '';
        $('geo-next').textContent = final ? track === 11 ? 'VOLTAR AO MAPA' : 'PRÓXIMA TRILHA →' : phase === 2 ? 'INICIAR PILOTAGEM →' : 'PRÓXIMO DESAFIO →';
        $('geo-next').focus({ preventScroll: true });
    }
    function nextChallenge() {
        if (!completed) return;
        if (phase === 4) { if (track === 11) showScene('levels'); else startTrack(track + 1); }
        else { phase++; startChallenge(); }
    }
    function currentTarget() { return flight.targets[G.targetIndex(track, flight.collected)]; }
    function updateTarget() {
        $('geo-target').innerHTML = G.svg(currentTarget()) + `<span>Colete: ${currentTarget().name}</span>`;
        $('geo-collected').textContent = `${flight.collected} / 10`;
    }
    function overlay(title, text, buttonLabel, autoSeconds = 0) {
        flight.running = false;
        keys.clear();
        activePointer = null;
        flight.switchRemaining = autoSeconds;
        $('geo-overlay-title').textContent = title;
        $('geo-overlay-text').textContent = text;
        $('geo-overlay-shape').innerHTML = G.svg(currentTarget());
        $('geo-resume').textContent = buttonLabel;
        $('geo-resume').hidden = autoSeconds > 0;
        $('geo-flight-overlay').hidden = false;
    }
    function startFlight() {
        $('geo-objects').replaceChildren();
        const w = arena.clientWidth, h = arena.clientHeight;
        flight = {
            targets: G.flightTargets(track), collected: 0, running: false,
            width: w, height: h, ship: { x: w * .2, y: h * .5 }, pointer: { x: w * .2, y: h * .5 },
            objects: [], spawnIn: .25, spawnCount: 0, switchRemaining: 0, hitFor: 0
        };
        $('geo-ship').classList.remove('hit');
        updateTarget();
        drawShip();
        $('geo-flight-feedback').textContent = 'Colete 10 formas corretas. Errar tira pontos, mas mantém suas coletas.';
        overlay('Prepare sua nave!', `Procure ${currentTarget().name}. A nave segue seu mouse ou seu dedo com suavidade.${track >= 5 ? ' O alvo muda após 3 e 6 acertos.' : ''}`, 'COMEÇAR VOO');
        lastTime = 0;
        frameId = requestAnimationFrame(tick);
    }
    function resumeFlight() {
        if (!flight || completed) return;
        flight.running = true;
        flight.switchRemaining = 0;
        flight.pointer = { ...flight.ship };
        $('geo-flight-overlay').hidden = true;
        lastTime = 0;
        arena.focus({ preventScroll: true });
    }
    function pauseFlight() {
        if (!flight || completed) return;
        overlay('Voo pausado', 'Suas coletas e pontos estão mantidos. Continue quando estiver pronto.', 'CONTINUAR VOO');
    }
    function spawnShape() {
        const available = G.pool(track);
        // Uma figura correta a cada três surgimentos, além dos sorteios extras.
        const target = currentTarget();
        const shape = flight.spawnCount++ % 3 === 0 || Math.random() < .25 ? target : available[Math.floor(Math.random() * available.length)];
        const node = document.createElement('div');
        node.className = 'geo-flying-shape';
        node.innerHTML = G.svg(shape, G.PALETTE[Math.floor(Math.random() * G.PALETTE.length)]);
        const item = { shape, node, x: flight.width + 30, y: 34 + Math.random() * (flight.height - 68) };
        node.style.transform = `translate(${item.x - 23}px, ${item.y - 23}px)`;
        $('geo-objects').appendChild(node);
        flight.objects.push(item);
    }
    function collect(item) {
        const correct = item.shape.id === currentTarget().id;
        if (correct) {
            HY.score.correct();
            flight.collected++;
            $('geo-collected').textContent = `${flight.collected} / 10`;
            $('geo-flight-feedback').textContent = `+100 pontos! ${flight.collected} de 10 formas coletadas.`;
            if (flight.collected === 10) { HY.playWin(); finishChallenge(); return; }
            if (track >= 5 && [3, 6].includes(flight.collected)) {
                // Limpa os objetos antigos para não punir o jogador durante a troca.
                flight.objects.forEach(object => object.node.remove());
                flight.objects = [];
                flight.spawnCount = 0;
                flight.spawnIn = .5;
                updateTarget();
                overlay('NOVO ALVO!', `Agora colete: ${currentTarget().name}. Suas ${flight.collected} coletas continuam valendo.`, '', 2.5);
                $('geo-flight-feedback').textContent = `Atenção! Novo alvo: ${currentTarget().name}.`;
            }
        } else {
            HY.score.wrong();
            HY.playLose();
            flight.hitFor = .35;
            $('geo-ship').classList.add('hit');
            $('geo-flight-feedback').textContent = `−50 pontos. Procure ${currentTarget().name}. Coletas mantidas: ${flight.collected}/10.`;
        }
    }
    function drawShip() { $('geo-ship').style.transform = `translate(${flight.ship.x - 28}px, ${flight.ship.y - 21}px)`; }
    function tick(time) {
        if (!flight || completed) return;
        const dt = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0;
        lastTime = time;
        if (flight.switchRemaining > 0 && !document.hidden) {
            flight.switchRemaining -= dt;
            if (flight.switchRemaining <= 0) resumeFlight();
        } else if (flight.running && !document.hidden) {
            const speed = Math.max(135, Math.min(300, flight.width * .48));
            if (keys.size) {
                flight.pointer = {
                    x: clamp(flight.ship.x + ((keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0)) * speed * dt, 28, flight.width - 28),
                    y: clamp(flight.ship.y + ((keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0)) * speed * dt, 24, flight.height - 24)
                };
            }
            flight.ship = G.moveToward(flight.ship, flight.pointer, speed, dt);
            drawShip();
            flight.spawnIn -= dt;
            if (flight.spawnIn <= 0) { spawnShape(); flight.spawnIn = Math.max(.65, 1.15 - track * .035); }
            const objectSpeed = flight.width * (.10 + track * .0035);
            for (const item of [...flight.objects]) {
                item.x -= objectSpeed * dt;
                item.node.style.transform = `translate(${item.x - 23}px, ${item.y - 23}px)`;
                const collides = Math.abs(item.x - flight.ship.x) < 37 && Math.abs(item.y - flight.ship.y) < 31;
                if (collides || item.x < -30) {
                    item.node.remove();
                    flight.objects = flight.objects.filter(object => object !== item);
                    if (collides) { collect(item); if (completed || !flight.running) break; }
                }
            }
            flight.hitFor -= dt;
            if (flight.hitFor <= 0) $('geo-ship').classList.remove('hit');
        }
        if (flight && !completed) frameId = requestAnimationFrame(tick);
    }
    function setPointer(event) {
        if (!flight || !flight.running || (event.pointerType !== 'mouse' && event.pointerId !== activePointer)) return;
        const rect = arena.getBoundingClientRect();
        flight.pointer = {
            x: clamp(event.clientX - rect.left, 28, flight.width - 28),
            y: clamp(event.clientY - rect.top - (event.pointerType === 'mouse' ? 0 : 48), 24, flight.height - 24)
        };
    }
    arena.addEventListener('pointermove', setPointer);
    arena.addEventListener('pointerdown', event => {
        if (!flight || !flight.running || (activePointer !== null && activePointer !== event.pointerId)) return;
        activePointer = event.pointerId;
        if (event.pointerType !== 'mouse') arena.setPointerCapture(event.pointerId);
        setPointer(event);
    });
    function endPointer(event) {
        if (event.pointerId !== activePointer) return;
        activePointer = null;
        if (flight && event.pointerType !== 'mouse') flight.pointer = { ...flight.ship };
    }
    arena.addEventListener('pointerup', endPointer);
    arena.addEventListener('pointercancel', endPointer);
    arena.addEventListener('lostpointercapture', endPointer);
    arena.addEventListener('keydown', event => {
        if (!flight || !flight.running || !event.key.startsWith('Arrow')) return;
        event.preventDefault(); keys.add(event.key);
    });
    window.addEventListener('keyup', event => keys.delete(event.key));
    window.addEventListener('blur', () => { if (flight && (flight.running || flight.switchRemaining > 0)) pauseFlight(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && flight) pauseFlight(); });
    new ResizeObserver(() => {
        if (!flight || arena.clientWidth < 1) return;
        const w = arena.clientWidth, h = arena.clientHeight;
        const sx = w / flight.width, sy = h / flight.height;
        flight.ship.x = clamp(flight.ship.x * sx, 28, w - 28);
        flight.ship.y = clamp(flight.ship.y * sy, 24, h - 24);
        flight.pointer.x = clamp(flight.pointer.x * sx, 28, w - 28);
        flight.pointer.y = clamp(flight.pointer.y * sy, 24, h - 24);
        flight.objects.forEach(item => { item.x *= sx; item.y = clamp(item.y * sy, 28, h - 28); });
        flight.width = w; flight.height = h;
        drawShip();
    }).observe(arena);

    $('geo-launch').onclick = () => showScene('levels');
    $('geo-home-btn').onclick = () => showScene('home');
    $('geo-exit').onclick = () => showScene('levels');
    $('geo-result-map').onclick = () => showScene('levels');
    $('geo-confirm').onclick = confirmAnswer;
    $('geo-next').onclick = nextChallenge;
    $('geo-pause').onclick = pauseFlight;
    $('geo-resume').onclick = resumeFlight;
    HY.stars.init('galaxia-geometrica');
})();
