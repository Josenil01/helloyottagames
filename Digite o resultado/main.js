HY.stars.init('digite-resultado');

const gameLevels = [
            { name: "Nível 1", count: 5, maxVal: 5, ops: ['+'], time: 15000 },
            { name: "Nível 2", count: 5, maxVal: 10, ops: ['+'], time: 15000 },
            { name: "Nível 3", count: 5, maxVal: 10, ops: ['-'], time: 15000 },
            { name: "Nível 4", count: 5, maxVal: 15, ops: ['+'], time: 15000 },
            { name: "Nível 5", count: 5, maxVal: 15, ops: ['-'], time: 12000 },
            { name: "Nível 6", count: 5, maxVal: 20, ops: ['+'], time: 12000 },
            { name: "Nível 7", count: 5, maxVal: 20, ops: ['-'], time: 12000 },
            { name: "Nível 8", count: 5, maxVal: 20, ops: ['+', '-'], time: 10000 },
            { name: "Nível 9", count: 5, maxVal: 30, ops: ['+', '-'], time: 10000 },
            { name: "Nível 10", count: 5, maxVal: 50, ops: ['+', '-'], time: 10000 },
            { name: "Nível 11", count: 5, maxVal: 75, ops: ['+', '-'], time: 8000 },
            { name: "Nível 12", count: 5, maxVal: 100, ops: ['+', '-'], time: 8000 }
        ];

        let unlockedLevels = 1;
        let activeLevelIdx = 0;
        let activePhaseIdx = 0;
        let canType = false;
        let gameMode = 'infantil';
        let currentOperation = null;
        let typedInput = "";
        let currentIcon = '🍎';

        let timeLeft = 100;
        let timerInterval = null;

        function showScreen(screenId) {
            stopTimer();
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
            document.getElementById(screenId).classList.add('active-screen');
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
                accentColor: '#f43f5e'
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
                // n1 entre 1 e maxVal-1
                n1 = Math.floor(Math.random() * (config.maxVal - 1)) + 1;
                // n2 entre 1 e maxVal-n1
                n2 = Math.floor(Math.random() * (config.maxVal - n1)) + 1;
                result = n1 + n2;
            } else {
                // Subtração: n1 entre 2 e maxVal, n2 entre 1 e n1-1 (evita zero e resultado zero)
                n1 = Math.floor(Math.random() * (config.maxVal - 1)) + 2;
                n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
                result = n1 - n2;
            }

            currentOperation = { n1, n2, op, result };
            typedInput = "";
            
            const iconSet = ['🍎', '⭐️', '🐶', '🍕', '⚽️', '🧸', '🍭', '🍓', '🐝', '🍦'];
            currentIcon = iconSet[Math.floor(Math.random() * iconSet.length)];
            
            renderPhase();
        }

        function createIconGroup(num, colorClass) {
            const group = document.createElement('div');
            group.className = `flex flex-wrap gap-1 border-2 border-dashed ${colorClass} p-2 rounded-xl min-w-[40px] justify-center transition-all duration-500`;
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
            slot.className = "text-rose-200";
            opDisplay.className = "math-display font-game text-rose-500 drop-shadow-lg flex items-center gap-4";

            aid.innerHTML = '';
            if (gameMode === 'infantil' && currentOperation.n1 + currentOperation.n2 <= 20) {
                aid.appendChild(createIconGroup(currentOperation.n1, 'border-rose-200'));
                const sign = document.createElement('span');
                sign.className = "text-3xl font-game text-rose-300 mx-2 self-center";
                sign.innerText = currentOperation.op;
                aid.appendChild(sign);
                aid.appendChild(createIconGroup(currentOperation.n2, 'border-orange-200'));
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
            if (timeLeft > 50) bar.style.backgroundColor = '#10b981';
            else if (timeLeft > 20) bar.style.backgroundColor = '#facc15';
            else bar.style.backgroundColor = '#f43f5e';
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
                slot.className = "text-rose-600";

                const targetStr = currentOperation.result.toString();
                
                if (typedInput === targetStr) {
                    canType = false;
                    stopTimer();
                    
                    const display = document.getElementById('math-op-display');
                    display.classList.add('correct-anim');
                    HY.playWin();
                    HY.score.correct();

                    // Animação dos ícones de resultado no modo Infantil
                    if (gameMode === 'infantil' && currentOperation.n1 + currentOperation.n2 <= 20) {
                        const aid = document.getElementById('visual-aid');
                        aid.innerHTML = '';
                        const resultContainer = document.createElement('div');
                        resultContainer.className = "flex flex-col items-center gap-2 result-icons-anim";
                        
                        const label = document.createElement('span');
                        label.className = "text-xl font-game text-green-500 uppercase";
                        label.innerText = "Total!";
                        
                        const iconsGroup = createIconGroup(currentOperation.result, 'border-green-400 bg-green-50');
                        
                        resultContainer.appendChild(label);
                        resultContainer.appendChild(iconsGroup);
                        aid.appendChild(resultContainer);
                    }

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
                        slot.className = "text-rose-200";
                    }, 500);
                }
            } else if (e.key === "Backspace") {
                typedInput = "";
                document.getElementById('answer-slot').innerText = "?";
                document.getElementById('answer-slot').className = "text-rose-200";
            }
        });

        function nextPhase() {
            activePhaseIdx++;
            const level = gameLevels[activeLevelIdx];
            if (activePhaseIdx < level.count) {
                generateNewOperation();
            } else {
                HY.stars.trackComplete(activeLevelIdx);
                unlockedLevels = HY.stars.getUnlocked();
                if (activeLevelIdx + 1 === unlockedLevels && unlockedLevels < gameLevels.length) {
                    unlockedLevels++;
                }
                const isFinal = activeLevelIdx + 1 === gameLevels.length;
                document.getElementById('modal-title').innerText = isFinal ? "MESTRE!" : "NÍVEL CONCLUÍDO!";
                HY.elapsed.stopTrail(); document.getElementById('win-modal').classList.remove('hidden');
            }
        }