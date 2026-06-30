HY.stars.init('mercado-maior-menor');

const TYPES = {
            fruit: (size) => `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 100 100"><circle cx="50" cy="55" r="40" fill="#ef4444"/><path d="M50 15 L50 25 M45 15 L55 15" stroke="#78350f" stroke-width="4"/><path d="M52 20 Q65 10 60 25 Z" fill="#22c55e"/></svg>`,
            bread: (size) => `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 100 100"><path d="M10 60 Q50 30 90 60 Q90 80 50 80 Q10 80 10 60" fill="#fcd34d" stroke="#b45309" stroke-width="2"/><path d="M30 55 L40 50 M50 55 L60 50 M70 55 L80 50" stroke="#b45309" stroke-width="2"/></svg>`,
            bottle: (size) => `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 100 100"><rect x="35" y="10" width="30" height="20" rx="2" fill="#94a3b8"/><rect x="25" y="30" width="50" height="60" rx="5" fill="#3b82f6"/><rect x="30" y="45" width="40" height="20" fill="white" opacity="0.3"/></svg>`,
            ladder: (size) => `<svg class="svg-icon" width="${size/2}" height="${size}" viewBox="0 0 50 100"><rect x="10" y="0" width="4" height="100" fill="#78350f"/><rect x="36" y="0" width="4" height="100" fill="#78350f"/><rect x="10" y="20" width="30" height="4" fill="#78350f"/><rect x="10" y="40" width="30" height="4" fill="#78350f"/><rect x="10" y="60" width="30" height="4" fill="#78350f"/><rect x="10" y="80" width="30" height="4" fill="#78350f"/></svg>`
        };

        const LEVELS = [
            // Trilha 1: Frutas (2 itens, maior)
            { id:1, type:'fruit', task:'maior', items:[{val:40,label:'Pequena'},{val:100,label:'Grande'}] },
            { id:2, type:'fruit', task:'menor', items:[{val:40,label:'Pequena'},{val:100,label:'Grande'}] },
            { id:3, type:'bread', task:'maior', items:[{val:50,label:'Pãozinho'},{val:120,label:'Pãozão'}] },
            { id:4, type:'bottle', task:'menor', items:[{val:120,label:'Garrfona'},{val:60,label:'Garrafinha'}] },
            { id:5, type:'ladder', task:'maior', items:[{val:100,label:'Curta'},{val:180,label:'Comprida'}] },
            // Trilha 2
            { id:6, type:'ladder', task:'menor', items:[{val:180,label:'Comprida'},{val:100,label:'Curta'}] },
            { id:7, type:'fruit', task:'maior', items:[{val:40,label:'Pequena'},{val:90,label:'Média'},{val:130,label:'Grande'}] },
            { id:8, type:'bread', task:'menor', items:[{val:140,label:'Enorme'},{val:90,label:'Médio'},{val:50,label:'Pequeno'}] },
            { id:9, type:'bottle', task:'maior', items:[{val:50,label:'Mini'},{val:150,label:'Grande'},{val:100,label:'Média'}] },
            { id:10, type:'ladder', task:'menor', items:[{val:200,label:'Longa'},{val:140,label:'Média'},{val:80,label:'Curta'}] },
            // Trilha 3
            { id:11, type:'fruit', task:'maior', items:[{val:50,label:'Pequena'},{val:180,label:'Grande'},{val:110,label:'Média'}] },
            { id:12, type:'bread', task:'menor', items:[{val:160,label:'Enorme'},{val:30,label:'Mini'},{val:80,label:'Médio'}] },
            { id:13, type:'fruit', task:'maior', items:[{val:60,label:'Pequena'},{val:200,label:'Grande'},{val:120,label:'Média'}] },
            { id:14, type:'bottle', task:'menor', items:[{val:80,label:'Média'},{val:40,label:'Pequena'},{val:160,label:'Grande'}] },
            { id:15, type:'ladder', task:'maior', items:[{val:120,label:'Curta'},{val:60,label:'Mini'},{val:190,label:'Comprida'}] },
            // Trilha 4
            { id:16, type:'fruit', task:'menor', items:[{val:170,label:'Grande'},{val:60,label:'Pequena'},{val:110,label:'Média'}] },
            { id:17, type:'bread', task:'maior', items:[{val:40,label:'Mini'},{val:130,label:'Médio'},{val:190,label:'Enorme'}] },
            { id:18, type:'bottle', task:'maior', items:[{val:70,label:'Pequena'},{val:180,label:'Grande'},{val:120,label:'Média'}] },
            { id:19, type:'ladder', task:'menor', items:[{val:210,label:'Longa'},{val:90,label:'Curta'},{val:150,label:'Média'}] },
            { id:20, type:'fruit', task:'maior', items:[{val:35,label:'Mini'},{val:95,label:'Média'},{val:155,label:'Grande'}] },
            // Trilha 5
            { id:21, type:'bread', task:'menor', items:[{val:175,label:'Enorme'},{val:55,label:'Pequeno'},{val:115,label:'Médio'}] },
            { id:22, type:'bottle', task:'maior', items:[{val:45,label:'Mini'},{val:185,label:'Grande'},{val:115,label:'Média'}] },
            { id:23, type:'ladder', task:'maior', items:[{val:85,label:'Curta'},{val:165,label:'Comprida'},{val:125,label:'Média'}] },
            { id:24, type:'fruit', task:'menor', items:[{val:195,label:'Grande'},{val:75,label:'Pequena'},{val:135,label:'Média'}] },
            { id:25, type:'bread', task:'maior', items:[{val:65,label:'Mini'},{val:145,label:'Médio'},{val:205,label:'Enorme'}] },
            // Trilha 6
            { id:26, type:'bottle', task:'menor', items:[{val:105,label:'Média'},{val:185,label:'Grande'},{val:55,label:'Pequena'}] },
            { id:27, type:'ladder', task:'maior', items:[{val:70,label:'Curta'},{val:130,label:'Média'},{val:200,label:'Comprida'}] },
            { id:28, type:'fruit', task:'maior', items:[{val:45,label:'Mini'},{val:135,label:'Média'},{val:215,label:'Grande'}] },
            { id:29, type:'bread', task:'menor', items:[{val:190,label:'Enorme'},{val:80,label:'Pequeno'},{val:130,label:'Médio'}] },
            { id:30, type:'bottle', task:'maior', items:[{val:60,label:'Mini'},{val:200,label:'Grande'},{val:140,label:'Média'}] },
            // Trilha 7
            { id:31, type:'fruit', task:'menor', items:[{val:180,label:'Grande'},{val:50,label:'Pequena'},{val:110,label:'Média'}] },
            { id:32, type:'ladder', task:'maior', items:[{val:90,label:'Curta'},{val:170,label:'Comprida'},{val:130,label:'Média'}] },
            { id:33, type:'bread', task:'maior', items:[{val:55,label:'Mini'},{val:165,label:'Médio'},{val:215,label:'Enorme'}] },
            { id:34, type:'bottle', task:'menor', items:[{val:195,label:'Grande'},{val:75,label:'Pequena'},{val:135,label:'Média'}] },
            { id:35, type:'fruit', task:'maior', items:[{val:40,label:'Mini'},{val:140,label:'Média'},{val:220,label:'Grande'}] },
            // Trilha 8
            { id:36, type:'bread', task:'menor', items:[{val:200,label:'Enorme'},{val:70,label:'Mini'},{val:130,label:'Médio'}] },
            { id:37, type:'ladder', task:'menor', items:[{val:220,label:'Comprida'},{val:80,label:'Mini'},{val:150,label:'Média'}] },
            { id:38, type:'bottle', task:'maior', items:[{val:55,label:'Mini'},{val:205,label:'Grande'},{val:130,label:'Média'}] },
            { id:39, type:'fruit', task:'menor', items:[{val:175,label:'Grande'},{val:55,label:'Mini'},{val:115,label:'Média'}] },
            { id:40, type:'bread', task:'maior', items:[{val:50,label:'Mini'},{val:160,label:'Médio'},{val:220,label:'Enorme'}] },
            // Trilha 9
            { id:41, type:'bottle', task:'maior', items:[{val:65,label:'Pequena'},{val:215,label:'Grande'},{val:145,label:'Média'}] },
            { id:42, type:'ladder', task:'maior', items:[{val:95,label:'Curta'},{val:175,label:'Comprida'},{val:140,label:'Média'}] },
            { id:43, type:'fruit', task:'menor', items:[{val:190,label:'Grande'},{val:60,label:'Mini'},{val:125,label:'Média'}] },
            { id:44, type:'bread', task:'maior', items:[{val:45,label:'Mini'},{val:155,label:'Médio'},{val:225,label:'Enorme'}] },
            { id:45, type:'bottle', task:'menor', items:[{val:110,label:'Média'},{val:200,label:'Grande'},{val:50,label:'Mini'}] },
            // Trilha 10
            { id:46, type:'ladder', task:'menor', items:[{val:230,label:'Comprida'},{val:85,label:'Curta'},{val:155,label:'Média'}] },
            { id:47, type:'fruit', task:'maior', items:[{val:35,label:'Mini'},{val:145,label:'Média'},{val:230,label:'Grande'}] },
            { id:48, type:'bread', task:'menor', items:[{val:210,label:'Enorme'},{val:65,label:'Mini'},{val:140,label:'Médio'}] },
            { id:49, type:'bottle', task:'maior', items:[{val:70,label:'Pequena'},{val:210,label:'Grande'},{val:150,label:'Média'}] },
            { id:50, type:'ladder', task:'maior', items:[{val:100,label:'Curta'},{val:180,label:'Comprida'},{val:145,label:'Média'}] },
            // Trilha 11
            { id:51, type:'fruit', task:'menor', items:[{val:185,label:'Grande'},{val:55,label:'Mini'},{val:120,label:'Média'}] },
            { id:52, type:'bread', task:'maior', items:[{val:40,label:'Mini'},{val:160,label:'Médio'},{val:230,label:'Enorme'}] },
            { id:53, type:'bottle', task:'menor', items:[{val:115,label:'Média'},{val:210,label:'Grande'},{val:45,label:'Mini'}] },
            { id:54, type:'ladder', task:'maior', items:[{val:105,label:'Curta'},{val:185,label:'Comprida'},{val:145,label:'Média'}] },
            { id:55, type:'fruit', task:'maior', items:[{val:30,label:'Mini'},{val:150,label:'Média'},{val:240,label:'Grande'}] },
            // Trilha 12
            { id:56, type:'bread', task:'menor', items:[{val:220,label:'Enorme'},{val:60,label:'Mini'},{val:140,label:'Médio'}] },
            { id:57, type:'bottle', task:'maior', items:[{val:75,label:'Pequena'},{val:225,label:'Grande'},{val:155,label:'Média'}] },
            { id:58, type:'ladder', task:'menor', items:[{val:235,label:'Comprida'},{val:85,label:'Curta'},{val:160,label:'Média'}] },
            { id:59, type:'fruit', task:'maior', items:[{val:25,label:'Mini'},{val:145,label:'Média'},{val:245,label:'Grande'}] },
            { id:60, type:'bread', task:'maior', items:[{val:35,label:'Mini'},{val:175,label:'Médio'},{val:245,label:'Enorme'}] },
        ];

        let unlocked = 1;
        let stars = Array(12).fill(0);
        let currentLevelIdx = 0;
        let currentTrack = 0;
        let challengeInTrack = 0;
        let isLocked = false;

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
            loadProgress();
            renderLevelGrid();
            updateStats();
        }

        function loadProgress() {
            const saved = localStorage.getItem('mercado_gigantes_v1');
            if(saved) {
                const data = JSON.parse(saved);
                unlocked = data.unlocked || 1;
                stars = data.stars || Array(12).fill(0);
            }
        }

        function saveProgress() {
            localStorage.setItem('mercado_gigantes_v1', JSON.stringify({ unlocked, stars }));
        }

        function changeScreen(id) {
            playSfx(440, 'triangle', 0.05);
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-' + id).classList.add('active');
            if(id === 'levels') renderLevelGrid();
        }

        function renderLevelGrid() {
            HY.stars.renderGrid('level-grid', {
                onPlay: startLevel,
                emoji: () => '🛒',
                label: (i) => `Pedido ${i + 1}`,
                accentColor: '#10b981'
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

            document.getElementById('game-info').textContent = `Pedido ${currentTrack + 1} — ${challengeInTrack + 1}/5`;
            document.getElementById('instruction').textContent = `Escolha o ${lvl.task.toUpperCase()}!`;

            const area = document.getElementById('market-area');
            area.innerHTML = '';

            // Determinar o valor correto
            const targetVal = lvl.task === 'maior'
                ? Math.max(...lvl.items.map(i => i.val))
                : Math.min(...lvl.items.map(i => i.val));

            lvl.items.forEach(item => {
                const box = document.createElement('div');
                box.className = 'item-box';
                box.innerHTML = `<div class="item-visual">${TYPES[lvl.type](item.val)}</div>`;
                box.onclick = () => handleChoice(box, item.val === targetVal);
                area.appendChild(box);
            });

            changeScreen('game');
        }

        function handleChoice(el, isCorrect) {
            if(isLocked) return;

            if(isCorrect) {
                isLocked = true;
                playSfx(880, 'sine', 0.3);
                HY.playWin();
                HY.score.correct();
                el.style.transform = 'scale(1.3) translateY(-20px)';
                
                // Brilho de sucesso
                const visual = el.querySelector('.item-visual');
                visual.style.filter = 'drop-shadow(0 0 20px gold)';
                
                if(challengeInTrack === 4) {
                    HY.stars.trackComplete(currentTrack);
                    stars[currentTrack] = 1;
                    unlocked = Math.max(unlocked, currentTrack + 2);
                    saveProgress();
                    updateStats();
                }

                setTimeout(() => {
                    if(challengeInTrack < 4) {
                        nextChallenge();
                    } else {
                        const modal = document.getElementById('result-modal');
                        HY.elapsed.stopTrail(); modal.style.display = 'flex';
                    }
                }, 800);
            } else {
                playSfx(220, 'sawtooth', 0.2);
                HY.playLose();
                HY.score.wrong();
                el.style.animation = 'shake 0.4s';
                setTimeout(() => el.style.animation = '', 400);
            }
        }

        function handleModalAction() {
            document.getElementById('result-modal').style.display = 'none';
            changeScreen('levels');
        }

        function nextChallenge() {
            challengeInTrack++;
            currentLevelIdx = currentTrack * 5 + challengeInTrack;
            isLocked = false;
            HY.score.startChallenge();
            const lvl = LEVELS[currentLevelIdx];
            document.getElementById('game-info').textContent = `Pedido ${currentTrack + 1} — ${challengeInTrack + 1}/5`;
            document.getElementById('instruction').textContent = `Escolha o ${lvl.task.toUpperCase()}!`;
            const area = document.getElementById('market-area');
            area.innerHTML = '';
            const targetVal = lvl.task === 'maior'
                ? Math.max(...lvl.items.map(i => i.val))
                : Math.min(...lvl.items.map(i => i.val));
            lvl.items.forEach(item => {
                const box = document.createElement('div');
                box.className = 'item-box';
                box.innerHTML = `<div class="item-visual">${TYPES[lvl.type](item.val)}</div>`;
                box.onclick = () => handleChoice(box, item.val === targetVal);
                area.appendChild(box);
            });
        }

        window.onload = init;