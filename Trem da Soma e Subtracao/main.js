HY.stars.init('trem-soma');

        // Critérios de filtragem por trilha — ajustar conforme demanda pedagógica
        const CRITERIOS = [
          function(c) { return c.op === '+' && c.valorMax <= 5  && c.unknown === 'answer'; }, // T1  Soma simples
          function(c) { return c.op === '+' && c.valorMax <= 8  && c.unknown === 'answer'; }, // T2  Soma até 8
          function(c) { return c.op === '+' && c.valorMax <= 10 && c.unknown === 'answer'; }, // T3  Soma até 10
          function(c) { return c.op === '+' && c.valorMax <= 15 && c.unknown === 'answer'; }, // T4  Soma maior
          function(c) { return c.op === '-' && c.valorMax <= 10 && c.unknown === 'answer'; }, // T5  Subtração simples
          function(c) { return c.op === '-' && c.valorMax <= 15 && c.unknown === 'answer'; }, // T6  Subtração média
          function(c) { return c.op === '-' && c.valorMax <= 20 && c.unknown === 'answer'; }, // T7  Subtração até 20
          function(c) { return c.op === '+' && c.valorMax <= 21 && c.unknown === 'answer'; }, // T8  Soma mista
          function(c) { return c.op === '+' && c.valorMax <= 25 && c.unknown === 'answer'; }, // T9  Soma maior
          function(c) { return c.op === '-' && c.valorMax <= 28 && c.unknown === 'answer'; }, // T10 Subtração maior
          function(c) { return c.op === '+' && c.valorMax > 20  && c.unknown === 'answer'; }, // T11 Soma avançada
          function(c) { return                 c.valorMax > 30  && c.unknown === 'answer'; }, // T12 Desafio máximo
        ];

        let trackChallenges = [];

        const SKEY = 'math_train_v4';
        let userData = loadData();
        let currentTrack = 0;
        let challengeInTrack = 0;
        let timeLeft = 30;
        let timerInterval = null;
        let isLocked = false;
        let tries = 0;
        let lastResultSuccess = false;

        const SVG_ENGINE = `
            <svg class="svg-icon" viewBox="0 0 100 100">
                <rect x="10" y="40" width="70" height="40" fill="#ef4444" rx="5"/>
                <rect x="50" y="20" width="25" height="30" fill="#ef4444" rx="2"/>
                <rect x="55" y="10" width="10" height="15" fill="#334155" />
                <circle cx="25" cy="85" r="10" fill="#334155" stroke="white" stroke-width="2"/>
                <circle cx="65" cy="85" r="10" fill="#334155" stroke="white" stroke-width="2"/>
                <rect x="15" y="45" width="20" height="20" fill="#93c5fd" rx="2"/>
            </svg>`;

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playTone(freq, type, duration) {
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            } catch(e) {}
        }

        const SFX = {
            correct: () => { playTone(523, 'sine', 0.2); setTimeout(() => playTone(659, 'sine', 0.3), 100); },
            wrong: () => { playTone(220, 'sawtooth', 0.3); },
            click: () => { playTone(440, 'triangle', 0.05); }
        };

        function init() {
            createScenery();
            renderLevelGrid();
            updateGlobalStats();
            document.getElementById('home-train').innerHTML = SVG_ENGINE + `<div class="wagon">1</div><div class="wagon op">+</div><div class="wagon">1</div>`;
        }

        function createScenery() {
            const container = document.getElementById('scenery');
            for(let i=0; i<6; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud';
                const size = 40 + Math.random() * 60;
                cloud.style.width = size + 'px';
                cloud.style.height = (size * 0.6) + 'px';
                cloud.style.top = (Math.random() * 40) + '%';
                cloud.style.animationDuration = (15 + Math.random() * 20) + 's';
                cloud.style.animationDelay = (Math.random() * 10) + 's';
                container.appendChild(cloud);
            }
            const grass = document.createElement('div');
            grass.className = 'grass';
            container.appendChild(grass);
        }

        function loadData() {
            const d = localStorage.getItem(SKEY);
            return d ? JSON.parse(d) : { unlocked: 1, stars: Array(12).fill(0) };
        }

        function saveGame() {
            localStorage.setItem(SKEY, JSON.stringify(userData));
        }

        function renderLevelGrid() {
            HY.stars.renderGrid('level-grid', {
                onPlay: startLevel,
                emoji: () => '🚂',
                accentColor: '#ef4444'
            });
        }

        function updateGlobalStats() {
            const total = userData.stars.reduce((a, b) => a + b, 0);
            document.getElementById('total-stars').textContent = `⭐ ${total}/${12 * 3}`;
            document.getElementById('lvl-star-count').textContent = `⭐ ${total}`;
        }

        function changeScreen(id) {
            SFX.click();
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-' + id).classList.add('active');
            if(id === 'levels') renderLevelGrid();
        }

        function startLevel(idx) {
            currentTrack = idx;
            challengeInTrack = 0;
            trackChallenges = HY.rand.pick(HY.rand.NUMEROS.filter(CRITERIOS[idx]), 5);
            tries = 0;
            isLocked = false;
            timeLeft = 30;
            HY.score.reset();
            changeScreen('game');
            loadQuestion();
            startTimer();
        }

        function startTimer() {
            if(timerInterval) clearInterval(timerInterval);
            const bar = document.getElementById('timer-bar');
            timerInterval = setInterval(() => {
                timeLeft--;
                bar.style.width = (timeLeft / 30 * 100) + '%';
                if(timeLeft <= 0) endLevel(false);
            }, 1000);
        }

        function loadQuestion() {
            const { n1: a, op, n2: b } = trackChallenges[challengeInTrack];
            const train = document.getElementById('active-train');
            
            train.innerHTML = `
                <div class="engine-box">${SVG_ENGINE}</div>
                <div class="wagon">${a}</div>
                <div class="wagon op">${op}</div>
                <div class="wagon">${b}</div>
                <div class="wagon op">=</div>
                <div class="wagon target" id="target-wagon">?</div>
            `;

            const ans = op === '+' ? a + b : a - b;
            const options = new Set([ans]);
            while(options.size < 3) {
                const fake = Math.max(0, ans + (Math.floor(Math.random() * 9) - 4));
                options.add(fake);
            }

            const btnContainer = document.getElementById('options');
            btnContainer.innerHTML = '';
            [...options].sort(() => Math.random() - 0.5).forEach(val => {
                const btn = document.createElement('button');
                btn.className = 'opt-btn';
                btn.textContent = val;
                btn.onclick = (e) => checkAnswer(val, ans, btn, e);
                btnContainer.appendChild(btn);
            });
            HY.score.startChallenge();
        }

        function checkAnswer(selected, correct, btn, event) {
            if(isLocked) return;
            
            const rect = btn.getBoundingClientRect();
            const flying = document.createElement('div');
            flying.className = 'flying-num';
            flying.textContent = selected;
            flying.style.left = rect.left + 'px';
            flying.style.top = rect.top + 'px';
            document.body.appendChild(flying);

            if(selected === correct) {
                isLocked = true;
                tries++;
                clearInterval(timerInterval);
                SFX.correct();
                HY.playWin();
                HY.score.correct();

                const target = document.getElementById('target-wagon');
                const targetRect = target.getBoundingClientRect();
                
                flying.animate([
                    { left: rect.left + 'px', top: rect.top + 'px', transform: 'scale(1)' },
                    { left: targetRect.left + 'px', top: targetRect.top + 'px', transform: 'scale(0.8)' }
                ], { duration: 600, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' })
                .onfinish = () => {
                    target.textContent = selected;
                    target.classList.add('filled');
                    flying.remove();
                    setTimeout(() => endLevel(true), 600);
                };

            } else {
                tries++;
                SFX.wrong();
                HY.playLose();
                HY.score.wrong();

                const randomX = (Math.random() - 0.5) * 1000;
                const randomRot = (Math.random() - 0.5) * 1000;
                
                flying.animate([
                    { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                    { transform: `translate(${randomX}px, 800px) rotate(${randomRot}deg)`, opacity: 0 }
                ], { duration: 1000, easing: 'ease-in' })
                .onfinish = () => flying.remove();

                btn.style.opacity = '0.3';
                btn.disabled = true;
            }
        }

        function endLevel(success) {
            clearInterval(timerInterval);
            lastResultSuccess = success;
            const modal = document.getElementById('result-modal');
            const starDiv = document.getElementById('result-stars');
            const btn = document.getElementById('modal-next-btn');
            const msg = document.getElementById('result-msg');

            if(success) {
                document.getElementById('result-title').textContent = "Na mosca!";
                msg.textContent = "O trem esta pronto para partir!";

                if(challengeInTrack < 4) {
                    starDiv.textContent = "⭐";
                    btn.textContent = "PROXIMO DESAFIO";
                } else {
                    let earned = (tries === 1 && timeLeft > 15) ? 3 : (tries <= 2 && timeLeft > 5) ? 2 : 1;
                    HY.stars.trackComplete(currentTrack);
                    userData.stars[currentTrack] = Math.max(userData.stars[currentTrack] || 0, earned);

                    // Desbloquear proximo nivel
                    userData.unlocked = Math.max(userData.unlocked, currentTrack + 2);
                    saveGame();

                    starDiv.textContent = "⭐".repeat(earned) + "☆".repeat(3-earned);
                    btn.textContent = "PROXIMO";
                }
            } else {
                document.getElementById('result-title').textContent = "Ue, parou?";
                starDiv.textContent = "⏰";
                msg.textContent = "O tempo acabou ou houveram muitos erros.";
                btn.textContent = "TENTAR DENOVO";
            }

            HY.elapsed.stopTrail(); modal.style.display = 'flex';
            updateGlobalStats();
        }

        function handleModalAction() {
            if (lastResultSuccess) {
                if (challengeInTrack < 4) {
                    challengeInTrack++;
                    document.getElementById('result-modal').style.display = 'none';
                    SFX.click();
                    startNextChallenge();
                } else {
                    document.getElementById('result-modal').style.display = 'none';
                    SFX.click();
                    changeScreen('levels');
                }
            } else {
                document.getElementById('result-modal').style.display = 'none';
                SFX.click();
                startLevel(currentTrack);
            }
        }

        function startNextChallenge() {
            tries = 0;
            isLocked = false;
            timeLeft = 30;
            HY.score.startChallenge();
            loadQuestion();
            startTimer();
        }

        function closeModal() {
            // Funcao legada se necessario, mas handleModalAction substitui o clique principal
            document.getElementById('result-modal').style.display = 'none';
            changeScreen('levels');
        }

        window.onload = init;