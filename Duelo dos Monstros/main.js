HY.stars.init('duelo-monstros');

const MONSTERS = [
            (color) => `<svg class="monster-svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${color}"/><circle cx="35" cy="40" r="8" fill="white"/><circle cx="65" cy="40" r="8" fill="white"/><circle cx="35" cy="42" r="3" fill="black"/><circle cx="65" cy="42" r="3" fill="black"/><path d="M30 70 Q50 85 70 70" fill="none" stroke="black" stroke-width="3" stroke-linecap="round"/></svg>`,
            (color) => `<svg class="monster-svg" viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" rx="10" fill="${color}"/><circle cx="50" cy="40" r="12" fill="white"/><circle cx="50" cy="40" r="5" fill="black"/><path d="M40 70 L60 70" stroke="black" stroke-width="4" stroke-linecap="round"/></svg>`,
            (color) => `<svg class="monster-svg" viewBox="0 0 100 100"><path d="M50 10 L90 90 L10 90 Z" fill="${color}"/><circle cx="40" cy="60" r="6" fill="white"/><circle cx="60" cy="60" r="6" fill="white"/><circle cx="40" cy="60" r="2" fill="black"/><circle cx="60" cy="60" r="2" fill="black"/><rect x="45" y="75" width="10" height="5" fill="black"/></svg>`
        ];

        const LEVELS = [
            // Trilha 1
            {n1:5,n2:3,ans:'>'}, {n1:2,n2:8,ans:'<'}, {n1:4,n2:4,ans:'='}, {n1:7,n2:1,ans:'>'}, {n1:3,n2:6,ans:'<'},
            // Trilha 2
            {n1:6,n2:6,ans:'='}, {n1:10,n2:4,ans:'>'}, {n1:2,n2:9,ans:'<'}, {n1:8,n2:5,ans:'>'}, {n1:5,n2:5,ans:'='},
            // Trilha 3
            {n1:1,n2:9,ans:'<'}, {n1:7,n2:7,ans:'='}, {n1:12,n2:6,ans:'>'}, {n1:4,n2:11,ans:'<'}, {n1:9,n2:9,ans:'='},
            // Trilha 4
            {n1:15,n2:12,ans:'>'}, {n1:8,n2:14,ans:'<'}, {n1:11,n2:11,ans:'='}, {n1:16,n2:9,ans:'>'}, {n1:7,n2:13,ans:'<'},
            // Trilha 5
            {n1:11,n2:18,ans:'<'}, {n1:20,n2:10,ans:'>'}, {n1:14,n2:14,ans:'='}, {n1:17,n2:8,ans:'>'}, {n1:9,n2:19,ans:'<'},
            // Trilha 6
            {n1:20,n2:20,ans:'='}, {n1:13,n2:9,ans:'>'}, {n1:16,n2:21,ans:'<'}, {n1:18,n2:18,ans:'='}, {n1:22,n2:11,ans:'>'},
            // Trilha 7
            {n1:25,n2:30,ans:'<'}, {n1:28,n2:15,ans:'>'}, {n1:22,n2:22,ans:'='}, {n1:19,n2:27,ans:'<'}, {n1:30,n2:18,ans:'>'},
            // Trilha 8
            {n1:50,n2:50,ans:'='}, {n1:35,n2:48,ans:'<'}, {n1:42,n2:37,ans:'>'}, {n1:29,n2:29,ans:'='}, {n1:44,n2:31,ans:'>'},
            // Trilha 9
            {n1:13,n2:9,ans:'>'}, {n1:17,n2:25,ans:'<'}, {n1:40,n2:40,ans:'='}, {n1:33,n2:21,ans:'>'}, {n1:15,n2:38,ans:'<'},
            // Trilha 10
            {n1:25,n2:30,ans:'<'}, {n1:45,n2:32,ans:'>'}, {n1:60,n2:60,ans:'='}, {n1:38,n2:52,ans:'<'}, {n1:55,n2:43,ans:'>'},
            // Trilha 11
            {n1:70,n2:55,ans:'>'}, {n1:48,n2:78,ans:'<'}, {n1:65,n2:65,ans:'='}, {n1:82,n2:63,ans:'>'}, {n1:51,n2:88,ans:'<'},
            // Trilha 12
            {n1:50,n2:50,ans:'='}, {n1:99,n2:88,ans:'>'}, {n1:75,n2:100,ans:'<'}, {n1:95,n2:95,ans:'='}, {n1:80,n2:67,ans:'>'}
        ];

        let unlocked = 1;
        let stars = Array(12).fill(0);
        let currentLevelIdx = 0;
        let isLocked = false;
        let currentTrack = 0;
        let challengeInTrack = 0;

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playSfx(freq, type = 'sine', duration = 0.1) {
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

        function init() {
            createScenery();
            loadProgress();
            renderLevelGrid();
            updateStats();
        }

        function createScenery() {
            const container = document.getElementById('scenery');
            for(let i=0; i<15; i++) {
                const s = document.createElement('div');
                s.className = 'stalactite';
                s.style.left = Math.random() * 100 + '%';
                s.style.height = (20 + Math.random() * 60) + 'px';
                container.appendChild(s);
            }
        }

        function loadProgress() {
            const saved = localStorage.getItem('monstros_comparacao_v1');
            if(saved) {
                const data = JSON.parse(saved);
                unlocked = data.unlocked || 1;
                stars = data.stars || Array(12).fill(0);
            }
        }

        function saveProgress() {
            localStorage.setItem('monstros_comparacao_v1', JSON.stringify({ unlocked, stars }));
        }

        function changeScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-' + id).classList.add('active');
            if(id === 'levels') renderLevelGrid();
        }

        function renderLevelGrid() {
            HY.stars.renderGrid('level-grid', {
                onPlay: startLevel,
                emoji: () => '👾',
                label: (i) => `Duelo ${i + 1}`,
                accentColor: '#a855f7'
            });
        }

        function updateStats() {
            const total = stars.reduce((a,b) => a + (b ? 1 : 0), 0);
            document.getElementById('total-stars').textContent = `⭐ ${total}/12`;
            document.getElementById('lvl-star-count').textContent = `⭐ ${total}`;
        }

        function startLevel(idx) {
            currentTrack = idx;
            challengeInTrack = 0;
            currentLevelIdx = idx * 5;
            isLocked = false;
            HY.score.reset();
            HY.score.startChallenge();
            const lvl = LEVELS[currentLevelIdx];

            document.getElementById('slot').textContent = '?';
            document.getElementById('slot').classList.remove('filled');
            
            const colors = ['#a855f7', '#f97316', '#22c55e', '#db2777', '#3b82f6'];
            const m1 = MONSTERS[Math.floor(Math.random()*3)](colors[Math.floor(Math.random()*5)]);
            const m2 = MONSTERS[Math.floor(Math.random()*3)](colors[Math.floor(Math.random()*5)]);

            document.getElementById('monster-left').innerHTML = `${m1}<div class="monster-number">${lvl.n1}</div>`;
            document.getElementById('monster-right').innerHTML = `${m2}<div class="monster-number">${lvl.n2}</div>`;

            changeScreen('game');
        }

        function checkChoice(symbol) {
            if(isLocked) return;
            const correct = LEVELS[currentLevelIdx].ans;
            
            if(symbol === correct) {
                isLocked = true;
                playSfx(880, 'sine', 0.3);
                HY.playWin();
                HY.score.correct();
                
                const slot = document.getElementById('slot');
                slot.textContent = symbol;
                slot.classList.add('filled');
                
                if(challengeInTrack === 4) {
                    HY.stars.trackComplete(currentTrack);
                    stars[currentTrack] = 1;
                    unlocked = Math.max(unlocked, currentTrack + 2);
                    saveProgress();
                    updateStats();
                    setTimeout(() => {
                        HY.elapsed.stopTrail();
                        document.getElementById('result-modal').style.display = 'flex';
                    }, 800);
                } else {
                    setTimeout(() => {
                        nextChallenge();
                    }, 800);
                }
            } else {
                playSfx(150, 'sawtooth', 0.2);
                HY.playLose();
                HY.score.wrong();
                const slot = document.getElementById('slot');
                slot.style.borderColor = 'var(--danger)';
                setTimeout(() => slot.style.borderColor = '', 400);
            }
        }

        function nextChallenge() {
            challengeInTrack++;
            currentLevelIdx = currentTrack * 5 + challengeInTrack;
            isLocked = false;
            HY.score.startChallenge();
            const lvl = LEVELS[currentLevelIdx];
            document.getElementById('slot').textContent = '?';
            document.getElementById('slot').classList.remove('filled');
            const colors = ['#a855f7', '#f97316', '#22c55e', '#db2777', '#3b82f6'];
            const m1 = MONSTERS[Math.floor(Math.random()*3)](colors[Math.floor(Math.random()*5)]);
            const m2 = MONSTERS[Math.floor(Math.random()*3)](colors[Math.floor(Math.random()*5)]);
            document.getElementById('monster-left').innerHTML = `${m1}<div class="monster-number">${lvl.n1}</div>`;
            document.getElementById('monster-right').innerHTML = `${m2}<div class="monster-number">${lvl.n2}</div>`;
        }

        function handleModalAction() {
            document.getElementById('result-modal').style.display = 'none';
            changeScreen('levels');
        }

        window.onload = init;