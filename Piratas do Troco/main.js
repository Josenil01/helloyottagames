HY.stars.init('piratas-troco');

const LEVELS = [
            // Trilha 1
            [2,5],[1,4],[3,6],[2,7],[1,5],
            // Trilha 2
            [3,6],[4,8],[2,9],[5,10],[3,7],
            // Trilha 3
            [4,7],[5,12],[3,10],[6,11],[4,9],
            // Trilha 4
            [5,10],[7,12],[6,13],[4,11],[8,14],
            // Trilha 5
            [7,12],[8,15],[6,14],[9,16],[7,13],
            // Trilha 6
            [8,15],[10,18],[7,16],[9,17],[11,19],
            // Trilha 7
            [10,15],[12,18],[9,17],[11,16],[13,20],
            // Trilha 8
            [12,18],[14,22],[11,19],[13,21],[15,23],
            // Trilha 9
            [15,20],[13,25],[12,22],[14,24],[16,26],
            // Trilha 10
            [10,25],[18,30],[15,28],[12,27],[20,32],
            // Trilha 11
            [18,30],[20,35],[16,32],[22,38],[19,33],
            // Trilha 12
            [20,40],[25,45],[18,38],[22,42],[30,50]
        ];

        let unlocked = 1;
        let currentLevelIdx = 0;
        let currentTrack = 0;
        let challengeInTrack = 0;
        let spentCount = 0;
        let chestCount = 0;
        let isComplete = false;
        let selectedCoin = null;

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playSfx(freq, type = 'sine', vol = 0.05) {
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(vol, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.1);
            } catch(e) {}
        }

        function changeScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-' + id).classList.add('active');
            if(id === 'levels') renderLevels();
        }

        function renderLevels() {
            HY.stars.renderGrid('level-grid', {
                onPlay: startLevel,
                emoji: () => '🏴‍☠️',
                label: (i) => `Ilha ${i + 1}`,
                accentColor: '#f59e0b'
            });
        }

        function startLevel(idx) {
            currentTrack = idx;
            challengeInTrack = 0;
            currentLevelIdx = idx * 5;
            spentCount = 0;
            HY.score.reset();
            HY.score.startChallenge();
            chestCount = 0;
            isComplete = false;
            selectedCoin = null;
            const [cost, total] = LEVELS[currentLevelIdx];

            document.getElementById('game-info').textContent = `Ilha ${currentTrack + 1} — ${challengeInTrack + 1}/5`;
            document.getElementById('instruction-text').textContent = `Tens ${total} moedas. Gasta ${cost} para pagar!`;
            document.getElementById('equation-display').textContent = `${total} - ${cost} = ?`;
            document.getElementById('chest-zone').classList.remove('active');
            updateCounter(cost);

            const area = document.getElementById('coins-area');
            area.innerHTML = '';

            for(let i=0; i<total; i++) {
                const coin = document.createElement('div');
                coin.className = 'coin';
                coin.innerHTML = '$';
                coin.id = 'coin-' + i;
                coin.onclick = () => handleCoinClick(coin, cost);
                
                coin.ondragstart = (e) => {
                    if(!isComplete) return;
                    e.dataTransfer.setData("text", e.target.id);
                    coin.classList.add('selected');
                };
                
                area.appendChild(coin);
            }
            
            changeScreen('game');
        }

        function updateCounter(target) {
            if(!isComplete) {
                document.getElementById('click-counter').textContent = `Tira: ${spentCount} / ${target}`;
            } else {
                const remaining = LEVELS[currentLevelIdx][1] - LEVELS[currentLevelIdx][0];
                document.getElementById('click-counter').textContent = `No BAU: ${chestCount} / ${remaining}`;
            }
        }

        function handleCoinClick(el, target) {
            if(!isComplete) {
                if(el.classList.contains('spent')) return;
                playSfx(800 + Math.random() * 200);
                el.classList.add('spent');
                spentCount++;
                updateCounter(target);

                if(spentCount === target) {
                    isComplete = true;
                    prepareChestPhase();
                }
            } 
            else {
                if(el.classList.contains('spent')) return;
                document.querySelectorAll('.coin').forEach(c => c.classList.remove('selected'));
                selectedCoin = el;
                el.classList.add('selected');
                playSfx(400, 'triangle');
            }
        }

        function prepareChestPhase() {
            const [cost, total] = LEVELS[currentLevelIdx];
            const remaining = total - cost;
            
            document.getElementById('equation-display').textContent = `${total} - ${cost} = ${remaining}`;
            document.getElementById('instruction-text').textContent = `Agora guarda o teu troco de ${remaining} moedas no BAU!`;
            document.getElementById('chest-zone').classList.add('active');
            updateCounter();

            const coins = document.querySelectorAll('.coin:not(.spent)');
            coins.forEach(c => {
                c.classList.add('locked');
                c.setAttribute('draggable', 'true');
            });
        }

        function chestClicked() {
            if(selectedCoin && !selectedCoin.classList.contains('spent')) {
                moveToChest(selectedCoin);
            }
        }

        function allowDrop(e) {
            e.preventDefault();
            document.getElementById('treasure-chest').classList.add('drag-over');
        }

        function dropCoin(e) {
            e.preventDefault();
            document.getElementById('treasure-chest').classList.remove('drag-over');
            const coinId = e.dataTransfer.getData("text");
            const coinEl = document.getElementById(coinId);
            if(coinEl) moveToChest(coinEl);
        }

        function moveToChest(el) {
            playSfx(1200, 'sine', 0.03);
            el.classList.add('spent');
            el.classList.remove('selected');
            chestCount++;
            updateCounter();

            const [cost, total] = LEVELS[currentLevelIdx];
            const remaining = total - cost;

            if(chestCount === remaining) {
                setTimeout(showVictory, 600);
            }
        }

        function showVictory() {
            HY.playWin();
            HY.score.correct();
            const [cost, total] = LEVELS[currentLevelIdx];
            const remaining = total - cost;

            if(challengeInTrack < 4) {
                setTimeout(nextChallenge, 1000);
            } else {
                const modal = document.getElementById('result-modal');
                document.getElementById('result-msg').textContent = `Pagaste o pirata e guardaste as tuas ${remaining} moedas no BAU!`;
                HY.elapsed.stopTrail(); modal.style.display = 'flex';
                HY.stars.trackComplete(currentTrack);
                if(currentLevelIdx + 1 >= unlocked) unlocked = currentTrack + 2;
            }
        }

        function nextChallenge() {
            challengeInTrack++;
            currentLevelIdx = currentTrack * 5 + challengeInTrack;
            spentCount = 0;
            chestCount = 0;
            isComplete = false;
            selectedCoin = null;
            const [cost, total] = LEVELS[currentLevelIdx];
            document.getElementById('game-info').textContent = `Ilha ${currentTrack + 1} — ${challengeInTrack + 1}/5`;
            document.getElementById('instruction-text').textContent = `Tens ${total} moedas. Gasta ${cost} para pagar!`;
            document.getElementById('equation-display').textContent = `${total} - ${cost} = ?`;
            document.getElementById('chest-zone').classList.remove('active');
            updateCounter(cost);
            const area = document.getElementById('coins-area');
            area.innerHTML = '';
            for(let i=0; i<total; i++) {
                const coin = document.createElement('div');
                coin.className = 'coin';
                coin.innerHTML = '$';
                coin.id = 'coin-' + i;
                coin.onclick = () => handleCoinClick(coin, cost);
                coin.ondragstart = (e) => {
                    if(!isComplete) return;
                    e.dataTransfer.setData("text", e.target.id);
                    coin.classList.add('selected');
                };
                area.appendChild(coin);
            }
            HY.score.startChallenge();
        }

        function handleNext() {
            document.getElementById('result-modal').style.display = 'none';
            changeScreen('levels');
        }

        window.onload = () => renderLevels();