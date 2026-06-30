HY.stars.init('vowel');

const LEVELS = (function () {
  var banco = window.HYWords || [];
  return banco
    .filter(function (w) { return w.vogalFaltante !== null && w.vogalFaltante !== undefined; })
    .map(function (w) {
      return { prefix: w.vogalFaltante.prefix, vowel: w.vogalFaltante.vogal, suffix: w.vogalFaltante.suffix, emoji: w.emoji };
    });
})();

let unlockedTracks = 1;
let currentTrack = 0;
let challengeInTrack = 0;
let canType = false;
let gameMode = 'infantil';

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    document.getElementById(screenId).classList.add('active-screen');
    document.getElementById('win-modal').classList.add('hidden');
    if (screenId === 'screen-levels') renderTracksGrid();
}

function setMode(mode) {
    gameMode = mode;
    showScreen('screen-levels');
}

function renderTracksGrid() {
    HY.stars.renderGrid('levels-grid', {
        onPlay: startTrack,
        emoji: (i) => LEVELS[i * 5] ? LEVELS[i * 5].emoji : '🎮',
        accentColor: '#3b82f6'
    });
}

function startTrack(trackIdx) {
    currentTrack = trackIdx;
    challengeInTrack = 0;
    HY.score.reset();
    showScreen('screen-game');
    initPhase();
}

function formatText(text) {
    if (!text) return '';
    return gameMode === 'infantil' ? text.toUpperCase() : text.toLowerCase();
}

function initPhase() {
    const data = LEVELS[currentTrack * 5 + challengeInTrack];
    const prefixEl = document.getElementById('word-prefix');
    const suffixEl = document.getElementById('word-suffix');
    const gapEl = document.getElementById('word-gap');

    canType = true;
    document.getElementById('display-emoji').innerText = data.emoji;

    let displayPrefix = data.prefix;
    let displaySuffix = data.suffix;

    if (gameMode === 'fundamental') {
        if (displayPrefix.length > 0) {
            displayPrefix = displayPrefix.charAt(0).toUpperCase() + displayPrefix.slice(1).toLowerCase();
            displaySuffix = displaySuffix.toLowerCase();
        } else if (displaySuffix.length > 0) {
            displaySuffix = displaySuffix.toLowerCase();
        }
    }

    prefixEl.innerText = displayPrefix;
    suffixEl.innerText = displaySuffix;

    gapEl.innerText = '_';
    gapEl.className = 'text-transparent mx-2 relative top-[-5px] border-b-8 border-gray-400 min-w-[50px] md:min-w-[80px] inline-block text-center transition-all duration-200';

    if (gameMode === 'infantil') {
        prefixEl.classList.add('uppercase');
        suffixEl.classList.add('uppercase');
    } else {
        prefixEl.classList.remove('uppercase');
        suffixEl.classList.remove('uppercase');
    }
    HY.score.startChallenge();
}


function quitGame() {
    showScreen('screen-levels');
}

function checkVowel(vowel) {
    if (!canType) return;

    const btn = document.getElementById(`btn-${vowel}`);
    if (btn) {
        btn.classList.add('active-press');
        setTimeout(() => btn.classList.remove('active-press'), 150);
    }

    const data = LEVELS[currentTrack * 5 + challengeInTrack];
    const gapEl = document.getElementById('word-gap');

    if (vowel === data.vowel) {
        canType = false;
        let displayVowel = vowel;
        if (gameMode === 'fundamental' && data.prefix.length > 0) {
            displayVowel = vowel.toLowerCase();
        } else if (gameMode === 'fundamental' && data.prefix.length === 0) {
            displayVowel = vowel.toUpperCase();
        }
        gapEl.innerText = displayVowel;
        HY.playWin();
        HY.score.correct();
        gapEl.classList.remove('text-transparent', 'border-gray-400', 'border-b-8', 'shake-anim', 'top-[-5px]');
        gapEl.classList.add('text-green-500', 'border-transparent', 'correct-anim');
        setTimeout(nextPhase, 1200);
    } else {
        HY.playLose();
        HY.score.wrong();
        HY.shake(gapEl);
    }
}

window.addEventListener('keydown', (e) => {
    if (!document.getElementById('screen-game').classList.contains('active-screen') || !canType) return;
    const typedKey = e.key.toUpperCase();
    if (['A', 'E', 'I', 'O', 'U'].includes(typedKey)) {
        checkVowel(typedKey);
    }
});

function nextPhase() {
    challengeInTrack++;
    if (challengeInTrack < 5) {
        initPhase();
    } else {
        HY.stars.trackComplete(currentTrack);
        unlockedTracks = HY.stars.getUnlocked();
        if (currentTrack + 1 === unlockedTracks && unlockedTracks < 12) {
            unlockedTracks++;
        }
        const isFinalTrack = currentTrack + 1 >= Math.floor(LEVELS.length / 5);
        document.getElementById('modal-title').innerText = isFinalTrack ? 'JOGO CONCLUÍDO!' : 'TRILHA CONCLUÍDA!';
        HY.elapsed.stopTrail();
        document.getElementById('win-modal').classList.remove('hidden');
    }
}
