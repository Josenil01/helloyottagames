HY.stars.init('syllables');

/**
 * Configuração dos níveis do jogo.
 * 12 Trilhas × 5 Desafios = 60 itens.
 * Trilhas 1-4: Fácil (2 sílabas).
 * Trilhas 5-8: Médio (3 sílabas).
 * Trilhas 9-12: Difícil (4 sílabas).
 */
const levels = (function () {
  var banco = window.HYWords || [];
  var withSilabas = banco.filter(function (w) { return w.silabas && w.silabas.length; });
  withSilabas.sort(function (a, b) { return a.silabas.length - b.silabas.length; });
  return withSilabas.map(function (w) {
    var n = w.silabas.length;
    var diff = n <= 2 ? 'Fácil' : n === 3 ? 'Médio' : 'Difícil';
    return { difficulty: diff, word: w.palavra, syllables: w.silabas, emoji: w.emoji };
  });
})();

        let currentTrack = 0;
        let challengeInTrack = 0;
        let currentLevelIdx = 0; // = currentTrack * 5 + challengeInTrack
        let unlockedTracks = 1;
        let syllableState = [];
        let selectedSyllable = null;

        function showScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
            document.getElementById(screenId).classList.add('active-screen');
            if (screenId === 'screen-levels') renderTracksGrid();
        }

        function renderTracksGrid() {
            HY.stars.renderGrid('levels-container', {
                onPlay: startTrack,
                emoji: (i) => levels[i * 5].emoji,
                accentColor: '#7c3aed'
            });
        }

        function startTrack(trackIdx) {
            currentTrack = trackIdx;
            challengeInTrack = 0;
            currentLevelIdx = trackIdx * 5;
            HY.score.reset();
            showScreen('screen-game');
            initLevel();
        }

        function initLevel() {
            const data = levels[currentLevelIdx];
            const slotsContainer = document.getElementById('slots-container');
            const syllablesBank = document.getElementById('syllables-bank');
            
            slotsContainer.innerHTML = '';
            syllablesBank.innerHTML = '';
            syllableState = new Array(data.syllables.length).fill(null);
            document.getElementById('win-modal').classList.add('hidden');
            
            document.getElementById('word-emoji').innerText = data.emoji;
            document.getElementById('word-hint').innerText = data.word;

            data.syllables.forEach((syl, i) => {
                const slot = document.createElement('div');
                slot.className = 'slot h-20 md:h-24 px-4 border-4 border-purple-50 rounded-3xl flex items-center justify-center text-2xl md:text-3xl font-game text-purple-600 bg-purple-50/50 shadow-inner';
                slot.dataset.index = i;
                slot.dataset.target = syl;
                
                slot.ondragover = (e) => e.preventDefault();
                slot.ondrop = (e) => {
                    const text = e.dataTransfer.getData('text');
                    const id = e.dataTransfer.getData('id');
                    handleSyllablePlacement(slot, text, id);
                };

                slot.onclick = () => {
                    if (selectedSyllable) {
                        handleSyllablePlacement(slot, selectedSyllable.text, selectedSyllable.id);
                        deselectSyllable();
                    }
                };
                
                slotsContainer.appendChild(slot);
            });

            const shuffledSyllables = [...data.syllables].sort(() => Math.random() - 0.5);
            shuffledSyllables.forEach((syl, i) => {
                const box = document.createElement('div');
                const id = `s-${i}`;
                box.id = id;
                box.className = 'syllable-card min-w-[70px] px-6 h-16 bg-white border-4 border-yellow-300 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-game text-purple-700 shadow-lg';
                box.innerText = syl;
                box.draggable = true;
                
                box.ondragstart = (e) => {
                    e.dataTransfer.setData('text', syl);
                    e.dataTransfer.setData('id', id);
                };
                
                box.onclick = (e) => {
                    e.stopPropagation();
                    if (selectedSyllable?.id === id) {
                        deselectSyllable();
                    } else {
                        selectSyllable(box, syl, id);
                    }
                };

                syllablesBank.appendChild(box);
            });
            HY.score.startChallenge();
        }

        function selectSyllable(el, text, id) {
            deselectSyllable();
            selectedSyllable = { el, text, id };
            el.classList.add('ring-4', 'ring-purple-500', 'scale-110', 'rotate-2');
        }

        function deselectSyllable() {
            if (selectedSyllable) {
                selectedSyllable.el.classList.remove('ring-4', 'ring-purple-500', 'scale-110', 'rotate-2');
                selectedSyllable = null;
            }
        }

        function handleSyllablePlacement(slot, text, id) {
            const index = parseInt(slot.dataset.index);
            const target = slot.dataset.target;

            if (text === target) {
                HY.playWin();
                HY.score.correct();
                slot.innerText = text;
                slot.className = 'slot h-20 md:h-24 px-6 border-4 rounded-3xl flex items-center justify-center text-3xl font-game correct shadow-lg';
                
                const syllableEl = document.getElementById(id);
                if (syllableEl) syllableEl.style.visibility = 'hidden';
                
                syllableState[index] = text;
                checkWin();
            } else {
                const oldClass = slot.className;
                const oldText = slot.innerText;
                slot.innerText = text;
                HY.playLose();
                HY.score.wrong();
                slot.className = 'slot h-20 md:h-24 px-6 border-4 rounded-3xl flex items-center justify-center text-3xl font-game incorrect shadow-lg';
                
                setTimeout(() => {
                    if (!syllableState[index]) {
                        slot.innerText = oldText;
                        slot.className = oldClass;
                    }
                }, 600);
            }
        }

        function checkWin() {
            if (syllableState.every(s => s !== null)) {
                challengeInTrack++;
                if (challengeInTrack < 5) {
                    currentLevelIdx = currentTrack * 5 + challengeInTrack;
                    setTimeout(() => {
                        HY.elapsed.stopTrail();
                        document.getElementById('win-modal').classList.remove('hidden');
                    }, 600);
                } else {
                    HY.stars.trackComplete(currentTrack);
                    unlockedTracks = HY.stars.getUnlocked();
                    if (currentTrack + 1 === unlockedTracks && unlockedTracks < 12) {
                        unlockedTracks++;
                    }
                    setTimeout(() => {
                        HY.elapsed.stopTrail();
                        document.getElementById('win-modal').classList.remove('hidden');
                    }, 600);
                }
            }
        }

        function handleNextLevel() {
            if (challengeInTrack < 5) {
                initLevel();
            } else {
                showScreen('screen-levels');
            }
        }

        window.onclick = () => deselectSyllable();