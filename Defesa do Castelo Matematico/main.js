HY.stars.init('defesa-castelo');

const LEVELS = [
            // Trilha 1
            [2,'+',1], [1,'+',2], [3,'+',1], [2,'+',2], [1,'+',3],
            // Trilha 2
            [3,'+',2], [4,'+',3], [5,'+',2], [4,'+',4], [3,'+',5],
            // Trilha 3
            [5,'+',1], [6,'+',2], [4,'+',5], [3,'+',4], [7,'+',1],
            // Trilha 4
            [6,'+',2], [7,'+',3], [8,'+',4], [5,'+',6], [9,'+',3],
            // Trilha 5
            [7,'-',2], [8,'-',3], [9,'-',4], [6,'-',3], [10,'-',4],
            // Trilha 6
            [8,'-',3], [10,'-',5], [9,'-',3], [7,'-',4], [11,'-',6],
            // Trilha 7
            [9,'-',4], [12,'-',5], [11,'-',4], [10,'-',6], [13,'-',7],
            // Trilha 8
            [10,'-',5], [15,'-',8], [12,'-',7], [14,'-',6], [13,'-',5],
            // Trilha 9
            [8,'+',5], [9,'+',6], [11,'+',7], [12,'+',5], [10,'+',8],
            // Trilha 10
            [14,'-',6], [16,'-',9], [15,'-',7], [18,'-',8], [17,'-',9],
            // Trilha 11
            [9,'+',7], [11,'+',8], [13,'+',6], [14,'+',7], [12,'+',9],
            // Trilha 12
            [16,'-',7], [18,'-',9], [15,'+',8], [20,'-',11], [17,'+',9]
        ];

        const SKEY = 'math_castle_cannon_v3';
        let userData = loadData();
        let currentLevel = 0;
        let currentTrack = 0;
        let challengeInTrack = 0;
        let timeLeft = 100;
        let timerInterval = null;
        let isLocked = false;
        let tries = 0;
        let wolfScale = 1;
        let lastResultSuccess = false;

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playTone(freq, type, duration) {
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + duration);
            } catch(e) {}
        }

        const SFX = {
            correct: () => { playTone(600, 'sine', 0.2); setTimeout(() => playTone(800, 'sine', 0.3), 100); },
            wrong: () => { playTone(150, 'sawtooth', 0.4); },
            shot: () => { playTone(100, 'sine', 0.5); }
        };

        function init() {
            createScenery();
            renderLevelGrid();
            updateGlobalStats();
        }

        function createScenery() {
            const container = document.getElementById('scenery');
            for(let i=0; i<5; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud';
                const size = 50 + Math.random() * 50;
                cloud.style.width = size + 'px';
                cloud.style.height = (size * 0.6) + 'px';
                cloud.style.top = (Math.random() * 30) + '%';
                cloud.style.animationDuration = (20 + Math.random() * 20) + 's';
                cloud.style.animationDelay = (Math.random() * 10) + 's';
                container.appendChild(cloud);
            }
        }

        function loadData() {
            const d = localStorage.getItem(SKEY);
            return d ? JSON.parse(d) : { unlocked: 1, stars: Array(12).fill(0) };
        }

        function saveGame() {
            localStorage.setItem(SKEY, JSON.stringify(userData));
        }

        function updateGlobalStats() {
            const total = userData.stars.reduce((a, b) => a + b, 0);
            document.getElementById('total-stars').textContent = `⭐ ${total}/${12 * 3}`;
            document.getElementById('lvl-star-count').textContent = `⭐ ${total}`;
        }

        function renderLevelGrid() {
            HY.stars.renderGrid('level-grid', {
                onPlay: startLevel,
                emoji: () => '🏰',
                label: (i) => `Torre ${i + 1}`,
                accentColor: '#f59e0b'
            });
        }

        function changeScreen(id) {
            clearInterval(timerInterval);
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-' + id).classList.add('active');

            // Atualiza os cards com desbloqueio e estrelas ao abrir a tela de niveis.
            if (id === 'levels') {
                renderLevelGrid();
                updateGlobalStats();
            }
        }

        function startLevel(trackIdx) {
            currentTrack = trackIdx;
            challengeInTrack = 0;
            currentLevel = trackIdx * 5;
            tries = 0;
            isLocked = false;
            timeLeft = 100;
            HY.score.reset();
            wolfScale = 1;

            const wolves = document.getElementById('wolf-pack');
            wolves.classList.remove('defeated');
            wolves.style.transform = 'scale(1)';
            wolves.style.right = '0%';

            const castle = document.getElementById('castle-container');
            castle.classList.remove('destroyed');

            const cannon = document.getElementById('cannon');
            cannon.style.transform = 'rotate(0deg)'; // Reset rotacao

            changeScreen('game');
            loadQuestion();
            startTimer();
        }

        function startTimer() {
            if(timerInterval) clearInterval(timerInterval);
            const bar = document.getElementById('timer-bar');
            const wolves = document.getElementById('wolf-pack');

            timerInterval = setInterval(() => {
                if(isLocked) return;
                timeLeft -= 0.5;
                bar.style.width = timeLeft + '%';

                const advance = (100 - timeLeft) * 0.7;
                wolves.style.right = advance + '%';

                if(timeLeft <= 0) {
                    clearInterval(timerInterval);
                    destroyCastle();
                }
            }, 150);
        }

        function destroyCastle() {
            isLocked = true;
            document.getElementById('castle-container').classList.add('destroyed');
            setTimeout(() => endLevel(false, "O castelo desmoronou!"), 1200);
        }

        function loadQuestion() {
            const [a, op, b] = LEVELS[currentLevel];
            const wall = document.getElementById('active-wall');
            wall.innerHTML = `
                <div class="stone">${a}</div>
                <div class="stone op">${op}</div>
                <div class="stone">${b}</div>
                <div class="stone op">=</div>
                <div class="stone target" id="target-stone">?</div>
            `;

            const ans = op === '+' ? a + b : a - b;
            const options = new Set([ans]);
            while(options.size < 3) {
                const fake = Math.max(0, ans + (Math.floor(Math.random() * 7) - 3));
                options.add(fake);
            }

            const btnContainer = document.getElementById('options');
            btnContainer.innerHTML = '';
            [...options].sort(() => Math.random() - 0.5).forEach(val => {
                const btn = document.createElement('button');
                btn.className = 'shield-btn';
                btn.textContent = val;
                btn.onclick = () => checkAnswer(val, ans, btn);
                btnContainer.appendChild(btn);
            });
            HY.score.startChallenge();
        }

        function checkAnswer(selected, correct, btn) {
            if(isLocked) return;

            if(selected === correct) {
                isLocked = true;
                clearInterval(timerInterval);
                SFX.correct();
                HY.playWin();
                HY.score.correct();

                const target = document.getElementById('target-stone');
                target.textContent = selected;
                target.classList.add('filled');

                animateCannonShot();

            } else {
                tries++;
                SFX.wrong();
                HY.playLose();
                HY.score.wrong();

                wolfScale += 0.4;
                const wolves = document.getElementById('wolf-pack');
                wolves.style.transform = `scale(${wolfScale})`;

                btn.style.opacity = '0.3';
                btn.disabled = true;
                timeLeft = Math.max(0, timeLeft - 20);
            }
        }

        function animateCannonShot() {
            const cannon = document.getElementById('cannon');
            const flash = document.getElementById('flash');
            const ball = document.getElementById('cannon-ball');
            const wolves = document.getElementById('wolf-pack');

            // Posicao inicial (boca do canhao)
            const cannonRect = cannon.getBoundingClientRect();
            const startX = cannonRect.right - 20;
            const startY = cannonRect.top + 5;

            // Posicao final (alvo lobos)
            const wolfRect = wolves.getBoundingClientRect();
            const endX = wolfRect.left + (wolfRect.width / 2);
            const endY = wolfRect.top + (wolfRect.height / 2);

            // Girar o canhao para cima antes do tiro (-35 graus para mirar o arco)
            cannon.style.transform = 'rotate(-35deg)';

            setTimeout(() => {
                // Preparar bala
                ball.style.display = 'block';
                ball.style.left = startX + 'px';
                ball.style.top = startY + 'px';

                // Coice do canhao (agora usando margin para nao resetar transform) e flash
                cannon.classList.add('firing-recoil');
                flash.style.opacity = '1';
                SFX.shot();

                // Animacao Parabolica via JS
                const duration = 800;
                const startTimestamp = performance.now();
                const height = 180; // Altura do arco

                function step(timestamp) {
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

                    const currentX = startX + (endX - startX) * progress;
                    const currentY = startY + (endY - startY) * progress - (Math.sin(progress * Math.PI) * height);

                    ball.style.left = currentX + 'px';
                    ball.style.top = currentY + 'px';

                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        // Impacto!
                        ball.style.display = 'none';
                        flash.style.opacity = '0';
                        cannon.classList.remove('firing-recoil');
                        wolves.classList.add('defeated');
                        setTimeout(() => endLevel(true), 1500);
                    }
                }

                requestAnimationFrame(step);
            }, 300); // Pequeno atraso para a animacao de mira
        }

        function endLevel(success, message) {
            clearInterval(timerInterval);
            lastResultSuccess = success;
            const modal = document.getElementById('result-modal');
            const starDiv = document.getElementById('result-stars');
            const btn = document.getElementById('modal-next-btn');

            if(success) {
                let earned = tries === 0 ? 3 : tries === 1 ? 2 : 1;

                if(challengeInTrack === 4) {
                    // Ultimo desafio da trilha: salvar estrelas, desbloquear proxima trilha
                    HY.stars.trackComplete(currentTrack);
                    userData.stars[currentTrack] = Math.max(userData.stars[currentTrack], earned);
                    userData.unlocked = Math.min(12, Math.max(userData.unlocked, currentTrack + 2));
                    saveGame();

                    starDiv.textContent = "⭐".repeat(earned) + "☆".repeat(3-earned);
                    document.getElementById('result-title').textContent = "Trilha Completa!";
                    document.getElementById('result-msg').textContent = "Todos os desafios vencidos! Os lobos fugiram!";
                    btn.textContent = (currentTrack < 11) ? "PROXIMA TRILHA" : "MENU";
                } else {
                    // Desafio intermediario: nao salvar estrelas ainda
                    starDiv.textContent = "⭐".repeat(earned) + "☆".repeat(3-earned);
                    document.getElementById('result-title').textContent = "Vitoria!";
                    document.getElementById('result-msg').textContent = `Desafio ${challengeInTrack + 1}/5 vencido! Continue!`;
                    btn.textContent = "PROXIMO DESAFIO";
                }
            } else {
                document.getElementById('result-title').textContent = "Derrota!";
                starDiv.textContent = "☆☆☆";
                document.getElementById('result-msg').textContent = message || "Os lobos invadiram!";
                btn.textContent = "RECONSTRUIR";
            }

            HY.elapsed.stopTrail(); modal.style.display = 'flex';
            updateGlobalStats();
        }

        function handleModalAction() {
            document.getElementById('result-modal').style.display = 'none';
            if (!lastResultSuccess) {
                startLevel(currentTrack);
            } else if (lastResultSuccess && challengeInTrack < 4) {
                challengeInTrack++;
                currentLevel = currentTrack * 5 + challengeInTrack;
                startNextChallenge();
            } else {
                changeScreen('levels');
            }
        }

        function startNextChallenge() {
            tries = 0;
            isLocked = false;
            timeLeft = 100;
            wolfScale = 1;

            const wolves = document.getElementById('wolf-pack');
            wolves.classList.remove('defeated');
            wolves.style.transform = 'scale(1)';
            wolves.style.right = '0%';

            const castle = document.getElementById('castle-container');
            castle.classList.remove('destroyed');

            const cannon = document.getElementById('cannon');
            cannon.style.transform = 'rotate(0deg)';

            changeScreen('game');
            loadQuestion();
            startTimer();
        }

        window.onload = init;