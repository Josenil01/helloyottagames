HY.stars.init('laboratorio-pocoes');

const LEVELS = [
    // Trilha 1
    [2,1],[1,2],[3,1],[2,2],[1,3],
    // Trilha 2
    [3,1],[4,2],[5,1],[4,3],[3,4],
    // Trilha 3
    [5,2],[6,1],[4,4],[3,5],[7,1],
    // Trilha 4
    [6,2],[7,3],[8,2],[5,5],[9,1],
    // Trilha 5
    [6,3],[7,2],[8,1],[5,4],[6,4],
    // Trilha 6
    [8,3],[10,4],[9,3],[7,5],[11,4],
    // Trilha 7
    [9,4],[12,5],[11,4],[10,6],[8,6],
    // Trilha 8
    [10,5],[15,7],[12,6],[14,5],[13,4],
    // Trilha 9
    [8,5],[9,6],[11,7],[12,5],[10,8],
    // Trilha 10
    [14,6],[16,8],[15,7],[18,7],[17,8],
    // Trilha 11
    [9,7],[11,8],[13,6],[14,7],[12,9],
    // Trilha 12
    [16,7],[18,9],[15,8],[20,11],[17,9]
];
        const SKEY = 'math_alchemy_v1';

        let userData = loadData();
        let currentLevel = 0;
        let currentTrack = 0;
        let challengeInTrack = 0;
        let isLocked = false;
        let tries = 0;
        let lastResultSuccess = false;

        // Sons Sintetizados Magicos
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playMagic(freq, type, duration) {
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
            correct: () => { 
                playMagic(523, 'sine', 0.2); 
                setTimeout(() => playMagic(880, 'sine', 0.4), 100);
            },
            wrong: () => { playMagic(100, 'sawtooth', 0.4); },
            click: () => { playMagic(400, 'triangle', 0.05); }
        };

        function init() {
            createScenery();
            renderLevelGrid();
            updateGlobalStats();
        }

        function createScenery() {
            const container = document.getElementById('scenery');
            for(let i=0; i<40; i++) {
                const s = document.createElement('div');
                s.className = 'sparkle';
                const size = 2 + Math.random() * 4;
                s.style.width = size + 'px';
                s.style.height = size + 'px';
                s.style.top = Math.random() * 100 + '%';
                s.style.left = Math.random() * 100 + '%';
                s.style.animationDelay = Math.random() * 3 + 's';
                container.appendChild(s);
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
                emoji: () => '⚗️',
                label: (i) => `Frasco ${i + 1}`,
                accentColor: '#8b5cf6'
            });
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
            currentLevel = idx * 5;
            tries = 0;
            isLocked = false;
            HY.score.reset();
            changeScreen('game');
            loadQuestion();
        }

        function startNextChallenge() {
            tries = 0;
            isLocked = false;
            HY.score.startChallenge();
            loadQuestion();
        }

        function loadQuestion() {
            const [a, b] = LEVELS[currentLevel];
            const op = Math.floor(currentLevel / 5) < 6 ? '+' : '-';
            const shelf = document.getElementById('active-shelf');
            
            shelf.innerHTML = `
                <div class="flask num-1">${a}</div>
                <div class="flask op">${op}</div>
                <div class="flask num-2">${b}</div>
                <div class="flask op">=</div>
                <div class="flask target" id="target-flask">?</div>
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
                btn.className = 'ingredient-btn';
                btn.textContent = val;
                btn.onclick = () => checkAnswer(val, ans, btn);
                btnContainer.appendChild(btn);
            });
            document.getElementById('game-info').textContent = `Frasco ${currentTrack + 1} — ${challengeInTrack + 1}/5`;
            HY.score.startChallenge();
        }

        function checkAnswer(selected, correct, btn) {
            if(isLocked) return;
            
            const rect = btn.getBoundingClientRect();
            const flying = document.createElement('div');
            flying.className = 'flying-ingredient';
            flying.textContent = selected;
            flying.style.left = rect.left + 'px';
            flying.style.top = rect.top + 'px';
            document.body.appendChild(flying);

            if(selected === correct) {
                isLocked = true;
                tries++;
                SFX.correct();
                HY.playWin();
                HY.score.correct();

                const target = document.getElementById('target-flask');
                const targetRect = target.getBoundingClientRect();
                
                // Animacao Parabolica Magica
                flying.animate([
                    { left: rect.left + 'px', top: rect.top + 'px', transform: 'rotate(0deg) scale(1)' },
                    { left: targetRect.left + 'px', top: targetRect.top + 'px', transform: 'rotate(720deg) scale(0.8)' }
                ], { duration: 700, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' })
                .onfinish = () => {
                    target.textContent = selected;
                    target.classList.add('filled');
                    flying.remove();
                    setTimeout(() => endLevel(true), 800);
                };

            } else {
                tries++;
                SFX.wrong();
                HY.playLose();
                HY.score.wrong();

                // Explode ou foge
                const randomX = (Math.random() - 0.5) * 800;
                flying.animate([
                    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                    { transform: `translate(${randomX}px, -400px) scale(0)`, opacity: 0 }
                ], { duration: 1000, easing: 'ease-in' })
                .onfinish = () => flying.remove();

                btn.style.opacity = '0.3';
                btn.disabled = true;
            }
        }

        function endLevel(success) {
            lastResultSuccess = success;
            const modal = document.getElementById('result-modal');
            const starDiv = document.getElementById('result-stars');
            const btn = document.getElementById('modal-next-btn');

            if(success) {
                let earned = tries === 1 ? 3 : tries === 2 ? 2 : 1;
                if(challengeInTrack === 4) {
                    HY.stars.trackComplete(currentTrack);
                    userData.stars[currentTrack] = Math.max(userData.stars[currentTrack], earned);
                    userData.unlocked = Math.max(userData.unlocked, currentTrack + 2);
                    saveGame();
                }
                starDiv.textContent = "?".repeat(earned) + "?".repeat(3-earned);
                document.getElementById('result-title').textContent = "Pocao Perfeita!";
                if(challengeInTrack < 4) {
                    btn.textContent = "PROXIMO DESAFIO";
                } else {
                    btn.textContent = (currentTrack < 11) ? "TRILHA COMPLETA" : "MENU FINAL";
                }
            }

            HY.elapsed.stopTrail(); modal.style.display = 'flex';
            updateGlobalStats();
        }

        function handleModalAction() {
            SFX.click();
            if(lastResultSuccess && challengeInTrack < 4) {
                challengeInTrack++;
                currentLevel = currentTrack * 5 + challengeInTrack;
                document.getElementById('result-modal').style.display = 'none';
                startNextChallenge();
            } else {
                document.getElementById('result-modal').style.display = 'none';
                if(!lastResultSuccess) {
                    startLevel(currentTrack);
                } else {
                    changeScreen('levels');
                }
            }
        }

        window.onload = init;