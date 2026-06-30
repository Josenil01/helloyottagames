HY.stars.init('mercado-alien');

// Configuração dos 12 Níveis (Dificuldade Média e Mais Fases)
        const levels = [
            { name: "Marte", count: 5, range: 10, complex: false, time: 15000 },
            { name: "Vênus", count: 5, range: 15, complex: false, time: 15000 },
            { name: "Júpiter", count: 5, range: 20, complex: false, time: 14000 },
            { name: "Saturno", count: 5, range: 25, complex: false, time: 14000 },
            { name: "Netuno", count: 5, range: 30, complex: false, time: 13000 },
            { name: "Urano", count: 5, range: 35, complex: false, time: 12000 },
            { name: "Plutão", count: 5, range: 40, complex: true, time: 12000 },
            { name: "Nebulosa", count: 5, range: 45, complex: true, time: 11000 },
            { name: "Andrômeda", count: 5, range: 50, complex: true, time: 10000 },
            { name: "Buraco Negro", count: 5, range: 60, complex: true, time: 9000 },
            { name: "Quasar", count: 5, range: 80, complex: true, time: 8000 },
            { name: "Infinito", count: 5, range: 100, complex: true, time: 7000 }
        ];

        let unlockedLevels = 1;
        let activeLevelIdx = 0;
        let activePhaseIdx = 0;
        let canInteract = false;
        let gameMode = 'infantil';
        let currentProblem = null;
        let timerInterval = null;
        let timeLeft = 100;
        let shields = 3;

        const planets = ['🪐', '🌍', '🌑', '☀️', '🌑', '☄️', '🔵', '🔴', '🟣', '🟢'];
        const alienIcons = ['👽', '👾', '🤖', '👻', '🐙'];

        function showScreen(screenId) {
            stopTimer();
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
            document.getElementById('screen-transition').classList.add('hidden');
            const target = document.getElementById(screenId);
            if(target) target.classList.add('active-screen');
            document.getElementById('win-modal').classList.add('hidden');
            document.getElementById('game-over-modal').classList.add('hidden');
            if (screenId === 'screen-levels') renderLevelsGrid();
        }

        function setMode(mode) {
            gameMode = mode;
            showScreen('screen-levels');
        }

        function renderLevelsGrid() {
            HY.stars.renderGrid('levels-grid', {
                onPlay: startLevel,
                emoji: () => '👽',
                accentColor: '#06b6d4'
            });
        }

        function startLevel(idx) {
            activeLevelIdx = idx;
            activePhaseIdx = 0;
            shields = 3;
            HY.score.reset();
            updateShieldsUI();
            showScreen('screen-game');
            generateProblem();
        }

        function retryLevel() {
            document.getElementById('game-over-modal').classList.add('hidden');
            startLevel(activeLevelIdx);
        }

        function updateShieldsUI() {
            const container = document.getElementById('shields-ui');
            container.innerHTML = '';
            for(let i=0; i<3; i++) {
                if(i < shields) {
                    container.innerHTML += '<span>🔋</span>';
                } else {
                    container.innerHTML += '<span class="opacity-30 grayscale filter">🪫</span>';
                }
            }
        }

        function generateProblem() {
            const config = levels[activeLevelIdx];
            let v1, v2, displayV1, displayV2;

            if (config.complex && Math.random() > 0.6) {
                // Desafio de Soma Simples vs Número
                const n1 = Math.floor(Math.random() * (config.range / 2)) + 5;
                const n2 = Math.floor(Math.random() * 10) + 1;
                v1 = n1 + n2;
                displayV1 = `${n1}+${n2}`;
                v2 = Math.floor(Math.random() * config.range) + 10;
                displayV2 = v2;
            } else {
                // Comparação de Números Puros
                v1 = Math.floor(Math.random() * config.range) + 1;
                v2 = Math.floor(Math.random() * config.range) + 1;

                // Evita sempre o mesmo número, mas permite às vezes para o "="
                if(Math.random() < 0.15) v2 = v1;

                displayV1 = v1;
                displayV2 = v2;
            }

            let correct;
            if (v1 < v2) correct = '<';
            else if (v1 === v2) correct = '=';
            else correct = '>';

            currentProblem = { v1, v2, displayV1, displayV2, correct };
            renderPhase();
        }

        function renderPhase() {
            canInteract = true;
            const leftEl = document.getElementById('val-left');
            const rightEl = document.getElementById('val-right');
            const slot = document.getElementById('operator-slot');
            const aid = document.getElementById('visual-aid');

            document.getElementById('level-title').innerText = levels[activeLevelIdx].name.toUpperCase();
            document.getElementById('phase-counter').innerText = `MISSÃO ${activePhaseIdx + 1} / ${levels[activeLevelIdx].count}`;

            leftEl.innerText = currentProblem.displayV1;
            rightEl.innerText = currentProblem.displayV2;
            slot.innerText = "?";
            slot.className = "w-24 h-24 md:w-32 md:h-32 border-4 border-dashed border-cyan-500/50 rounded-3xl flex items-center justify-center text-6xl font-game text-cyan-400 bg-cyan-500/5";

            // Ajuda Visual (Modo Infantil)
            aid.innerHTML = '';
            if (gameMode === 'infantil' && currentProblem.v1 <= 30 && currentProblem.v2 <= 30) {
                const icon = alienIcons[Math.floor(Math.random() * alienIcons.length)];

                const createGroup = (num, color) => {
                    const g = document.createElement('div');
                    g.className = `flex flex-wrap gap-1 justify-center p-4 border-2 border-dashed ${color} rounded-2xl max-w-[200px]`;
                    for(let i=0; i<num; i++) {
                        const s = document.createElement('span');
                        s.className = "text-2xl filter drop-shadow-sm";
                        s.innerText = icon;
                        g.appendChild(s);
                    }
                    return g;
                };

                aid.appendChild(createGroup(currentProblem.v1, 'border-cyan-500/20'));
                const spacer = document.createElement('div');
                spacer.className = "w-20";
                aid.appendChild(spacer);
                aid.appendChild(createGroup(currentProblem.v2, 'border-purple-500/20'));
            }

            resetTimer();
            HY.score.startChallenge();
        }

        function checkAnswer(choice) {
            if (!canInteract) return;
            canInteract = false;
            stopTimer();

            const slot = document.getElementById('operator-slot');
            const panel = slot.parentElement.parentElement;
            slot.innerText = choice;

            if (choice === currentProblem.correct) {
                slot.className = "w-24 h-24 md:w-32 md:h-32 border-4 border-green-500 rounded-3xl flex items-center justify-center text-6xl font-game text-green-400 bg-green-500/10 correct-anim";
                HY.playWin();
                HY.score.correct();
                setTimeout(nextPhase, 1200);
            } else {
                HY.playLose();
                HY.score.wrong();
                panel.classList.add('shake-anim');
                slot.className = "w-24 h-24 md:w-32 md:h-32 border-4 border-red-500 rounded-3xl flex items-center justify-center text-6xl font-game text-red-400 bg-red-500/10";

                shields--;
                updateShieldsUI();

                setTimeout(() => {
                    panel.classList.remove('shake-anim');
                    if (shields <= 0) {
                        document.getElementById('game-over-modal').classList.remove('hidden');
                    } else {
                        slot.innerText = "?";
                        slot.className = "w-24 h-24 md:w-32 md:h-32 border-4 border-dashed border-cyan-500/50 rounded-3xl flex items-center justify-center text-6xl font-game text-cyan-400 bg-cyan-500/5";
                        canInteract = true;
                        resetTimer();
                    }
                }, 800);
            }
        }

        function resetTimer() {
            stopTimer();
            timeLeft = 100;
            updateTimerUI();
            const config = levels[activeLevelIdx];
            const step = 100;
            const decrement = (step / config.time) * 100;

            timerInterval = setInterval(() => {
                timeLeft -= decrement;
                if (timeLeft <= 0) {
                    timeLeft = 0;
                    handleTimeOut();
                }
                updateTimerUI();
            }, step);
        }

        function stopTimer() {
            if (timerInterval) clearInterval(timerInterval);
        }

        function updateTimerUI() {
            const bar = document.getElementById('timer-bar');
            bar.style.width = `${timeLeft}%`;
            if (timeLeft > 50) bar.style.background = 'linear-gradient(90deg, #4ade80, #22c55e)';
            else if (timeLeft > 20) bar.style.background = 'linear-gradient(90deg, #fbbf24, #f59e0b)';
            else bar.style.background = 'linear-gradient(90deg, #f87171, #ef4444)';
        }

        function handleTimeOut() {
            stopTimer();
            canInteract = false;
            const panel = document.getElementById('operator-slot').parentElement.parentElement;
            panel.classList.add('shake-anim');

            shields--;
            updateShieldsUI();

            setTimeout(() => {
                panel.classList.remove('shake-anim');
                if (shields <= 0) {
                    document.getElementById('game-over-modal').classList.remove('hidden');
                } else {
                    resetTimer();
                    canInteract = true;
                }
            }, 600);
        }

        function nextPhase() {
            activePhaseIdx++;
            if (activePhaseIdx < levels[activeLevelIdx].count) {
                generateProblem();
            } else {
                // Inicia a animação de transição imediatamente após completar o nível
                startTransition();
            }
        }

        function startTransition() {
            const screen = document.getElementById('screen-transition');
            const ufo = document.getElementById('trans-ufo');
            const planet = document.getElementById('trans-planet');

            planet.innerText = planets[Math.floor(Math.random() * planets.length)];
            screen.classList.remove('hidden');
            ufo.classList.remove('travel-anim');
            void ufo.offsetWidth;
            ufo.classList.add('travel-anim');

            setTimeout(() => {
                screen.classList.add('hidden');
                // Exibe o modal de vitória somente após a nave terminar de viajar
                showWinModal();
            }, 2000);
        }

        function showWinModal() {
            HY.stars.trackComplete(activeLevelIdx);
            unlockedLevels = HY.stars.getUnlocked();
            if (activeLevelIdx + 1 === unlockedLevels && unlockedLevels < levels.length) {
                unlockedLevels++;
            }
            const isFinal = activeLevelIdx + 1 === levels.length;
            document.getElementById('modal-title').innerText = isFinal ? "GALÁXIA SALVA!" : "SETOR LIMPO!";
            const btn = document.getElementById('next-level-btn');

            if(isFinal) {
                btn.innerText = "MENU PRINCIPAL";
                btn.onclick = () => showScreen('screen-levels');
            } else {
                btn.innerText = "PRÓXIMO SETOR ➔";
                btn.onclick = handleNextLevelClick;
            }

            HY.elapsed.stopTrail(); document.getElementById('win-modal').classList.remove('hidden');
        }

        function handleNextLevelClick() {
            document.getElementById('win-modal').classList.add('hidden');
            activeLevelIdx++;
            startLevel(activeLevelIdx); // startLevel já reinicia a energia e a fase para 0
        }

        function quitGame() {
            stopTimer();
            showScreen('screen-levels');
        }

        // Bloqueia teclas de atalho se necessário (ex: números para resposta)
        window.addEventListener('keydown', (e) => {
            if (!canInteract) return;
            if (e.key === '<' || e.key === ',') checkAnswer('<');
            if (e.key === '=' || e.key === 'Enter') checkAnswer('=');
            if (e.key === '>' || e.key === '.') checkAnswer('>');
        });