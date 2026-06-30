HY.stars.init('galaxia-matematica');

const gameLevels = [
            { name: "Setor 1", count: 5, maxVal: 5, ops: ['+'], time: 15000 },
            { name: "Setor 2", count: 5, maxVal: 10, ops: ['+'], time: 15000 },
            { name: "Setor 3", count: 5, maxVal: 8, ops: ['-'], time: 15000 },
            { name: "Setor 4", count: 5, maxVal: 15, ops: ['+'], time: 14000 },
            { name: "Setor 5", count: 5, maxVal: 12, ops: ['-'], time: 13000 },
            { name: "Setor 6", count: 5, maxVal: 20, ops: ['+'], time: 12000 },
            { name: "Setor 7", count: 5, maxVal: 18, ops: ['-'], time: 11000 },
            { name: "Setor 8", count: 5, maxVal: 20, ops: ['+', '-'], time: 10000 },
            { name: "Setor 9", count: 5, maxVal: 40, ops: ['+', '-'], time: 10000 },
            { name: "Setor 10", count: 5, maxVal: 60, ops: ['+', '-'], time: 9000 },
            { name: "Setor 11", count: 5, maxVal: 80, ops: ['+', '-'], time: 8000 },
            { name: "Setor 12", count: 5, maxVal: 100, ops: ['+', '-'], time: 7000 }
        ];

        let unlockedLevels = 1;
        let activeLevelIdx = 0;
        let activePhaseIdx = 0;
        let canType = false;
        let gameMode = 'infantil';
        let currentOperation = null;
        let typedInput = "";
        let currentIcon = '🚀';

        let timeLeft = 100;
        let timerInterval = null;

        const spacePlanets = ['🪐', '🌍', '🌕', '☀️', '🌑', '☄️', '🌌', '🌟', '🌑', '🔵', '🔴', '🟣'];

        function showScreen(screenId) {
            stopTimer();
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
            document.getElementById('screen-transition').classList.add('hidden');
            
            const target = document.getElementById(screenId);
            if(target) target.classList.add('active-screen');
            
            document.getElementById('win-modal').classList.add('hidden');
            if (screenId === 'screen-levels') renderLevelsGrid();
        }

        function setMode(mode) {
            gameMode = mode;
            showScreen('screen-levels');
        }

        function renderLevelsGrid() {
            HY.stars.renderGrid('levels-grid', {
                onPlay: startLevel,
                emoji: () => '☄️',
                accentColor: '#6366f1'
            });
        }

        function startLevel(index) {
            activeLevelIdx = index;
            activePhaseIdx = 0;
            HY.score.reset();
            showScreen('screen-game');
            generateNewOperation();
        }

        function generateNewOperation() {
            const config = gameLevels[activeLevelIdx];
            const op = config.ops[Math.floor(Math.random() * config.ops.length)];
            let n1, n2, result;

            if (op === '+') {
                n1 = Math.floor(Math.random() * (config.maxVal - 1)) + 1;
                n2 = Math.floor(Math.random() * (config.maxVal - n1)) + 1;
                result = n1 + n2;
            } else {
                n1 = Math.floor(Math.random() * (config.maxVal - 1)) + 2;
                n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
                result = n1 - n2;
            }

            currentOperation = { n1, n2, op, result };
            typedInput = "";
            
            const spaceIcons = ['🚀', '🪐', '🛸', '🛰️', '☄️', '🌟', '👨‍🚀', '🌌', '🌍', '👾'];
            currentIcon = spaceIcons[Math.floor(Math.random() * spaceIcons.length)];
            
            renderPhase();
        }

        function createIconGroup(num, colorClass) {
            const group = document.createElement('div');
            group.className = `flex flex-wrap gap-1 border-2 border-dashed ${colorClass} p-2 rounded-2xl min-w-[50px] justify-center transition-all duration-500`;
            for(let i=0; i<num; i++) {
                const span = document.createElement('span');
                span.className = "counter-icon";
                span.innerText = currentIcon;
                group.appendChild(span);
            }
            return group;
        }

        function renderPhase() {
            canType = true;
            const opDisplay = document.getElementById('math-op-display');
            const aid = document.getElementById('visual-aid');
            const slot = document.getElementById('answer-slot');
            
            opDisplay.children[0].innerText = currentOperation.n1;
            opDisplay.children[1].innerText = currentOperation.op;
            opDisplay.children[2].innerText = currentOperation.n2;
            slot.innerText = "?";
            slot.className = "text-slate-700";
            opDisplay.className = "math-display font-game text-white drop-shadow-lg flex items-center gap-6";

            aid.innerHTML = '';
            if (gameMode === 'infantil' && currentOperation.n1 + currentOperation.n2 <= 20) {
                aid.appendChild(createIconGroup(currentOperation.n1, 'border-indigo-500/30 bg-indigo-500/5'));
                const sign = document.createElement('span');
                sign.className = "text-4xl font-game text-indigo-400 mx-3 self-center";
                sign.innerText = currentOperation.op;
                aid.appendChild(sign);
                aid.appendChild(createIconGroup(currentOperation.n2, 'border-purple-500/30 bg-purple-500/5'));
            }

            resetTimer();
            HY.score.startChallenge();
        }

        function resetTimer() {
            stopTimer();
            timeLeft = 100;
            updateTimerUI();
            const step = 100;
            const config = gameLevels[activeLevelIdx];
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
            if (timeLeft > 50) bar.style.background = 'linear-gradient(90deg, #6366f1, #a855f7)';
            else if (timeLeft > 20) bar.style.background = 'linear-gradient(90deg, #facc15, #fbbf24)';
            else bar.style.background = 'linear-gradient(90deg, #f43f5e, #e11d48)';
        }

        function handleTimeOut() {
            stopTimer();
            const display = document.getElementById('math-op-display');
            display.classList.add('shake-anim');
            setTimeout(() => {
                display.classList.remove('shake-anim');
                resetTimer();
            }, 500);
        }

        function quitGame() {
            stopTimer();
            showScreen('screen-levels');
        }

        window.addEventListener('keydown', (e) => {
            if (!document.getElementById('screen-game').classList.contains('active-screen') || !canType) return;

            if (e.key >= '0' && e.key <= '9') {
                typedInput += e.key;
                const slot = document.getElementById('answer-slot');
                slot.innerText = typedInput;
                slot.className = "text-indigo-400";

                const targetStr = currentOperation.result.toString();
                
                if (typedInput === targetStr) {
                    canType = false;
                    stopTimer();
                    
                    const display = document.getElementById('math-op-display');
                    display.classList.add('correct-anim');
                    slot.className = "text-green-400";
                    HY.playWin();
                    HY.score.correct();

                    if (gameMode === 'infantil' && currentOperation.n1 + currentOperation.n2 <= 20) {
                        const aid = document.getElementById('visual-aid');
                        aid.innerHTML = '';
                        const resultContainer = document.createElement('div');
                        resultContainer.className = "flex flex-col items-center gap-3 result-icons-anim";
                        const label = document.createElement('span');
                        label.className = "text-2xl font-game text-green-400 uppercase tracking-widest";
                        label.innerText = "SISTEMA CARREGADO!";
                        const iconsGroup = createIconGroup(currentOperation.result, 'border-green-500/40 bg-green-500/10');
                        resultContainer.appendChild(label);
                        resultContainer.appendChild(iconsGroup);
                        aid.appendChild(resultContainer);
                    }

                    // Passa para a próxima fase diretamente sem animação de foguete
                    setTimeout(nextPhase, 1500);
                } else if (typedInput.length >= targetStr.length) {
                    HY.playLose();
                    HY.score.wrong();
                    const display = document.getElementById('math-op-display');
                    display.classList.add('shake-anim');
                    setTimeout(() => {
                        display.classList.remove('shake-anim');
                        typedInput = "";
                        slot.innerText = "?";
                        slot.className = "text-slate-700";
                    }, 500);
                }
            } else if (e.key === "Backspace") {
                typedInput = "";
                document.getElementById('answer-slot').innerText = "?";
                document.getElementById('answer-slot').className = "text-slate-700";
            }
        });

        // Função chamada ao clicar no botão "Próximo Setor" do modal
        function handleNextLevelClick() {
            if (activeLevelIdx + 1 < gameLevels.length) {
                activeLevelIdx++;
                activePhaseIdx = 0;
                startTransition(); // Só aqui a animação do foguete acontece
            } else {
                showScreen('screen-levels');
            }
        }

        function startTransition() {
            const transitionScreen = document.getElementById('screen-transition');
            const rocket = document.getElementById('transition-rocket');
            const planet = document.getElementById('target-planet');
            
            planet.innerText = spacePlanets[Math.floor(Math.random() * spacePlanets.length)];
            
            transitionScreen.classList.remove('hidden');
            rocket.classList.remove('rocket-flying');
            void rocket.offsetWidth; 
            rocket.classList.add('rocket-flying');

            setTimeout(() => {
                transitionScreen.classList.add('hidden');
                showScreen('screen-game');
                generateNewOperation();
            }, 2000);
        }

        function nextPhase() {
            activePhaseIdx++;
            const level = gameLevels[activeLevelIdx];
            if (activePhaseIdx < level.count) {
                generateNewOperation();
            } else {
                // Fim do nível: Desbloqueia próximo e mostra modal
                HY.stars.trackComplete(activeLevelIdx);
                unlockedLevels = HY.stars.getUnlocked();
                if (activeLevelIdx + 1 === unlockedLevels && unlockedLevels < gameLevels.length) {
                    unlockedLevels++;
                }
                const isFinal = activeLevelIdx + 1 === gameLevels.length;
                document.getElementById('modal-title').innerText = isFinal ? "LENDÁRIO!" : "SETOR LIMPO!";
                
                // Muda o texto do botão se for o último nível
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
        }