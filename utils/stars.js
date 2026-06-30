window.HY = window.HY || {};
(function () {
  'use strict';

  var TOTAL = 12;
  var CHALLENGES = 5;
  var _gameKey = null;
  var _data = null;
  var _wrongs = 0;
  var _trackStart = 0;
  var _onPlay = null;

  /* ── CSS injetado uma vez ── */
  if (!document.getElementById('hy-stars-css')) {
    var s = document.createElement('style');
    s.id = 'hy-stars-css';
    s.textContent =
      '.hy-track-card{background:#fff;border-radius:24px;padding:16px 8px 14px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:3px solid #e2e8f0;cursor:pointer;transition:transform .2s,box-shadow .2s;aspect-ratio:1;user-select:none;font-family:inherit}' +
      '.hy-track-card:not(.hy-locked):hover{transform:translateY(-5px);box-shadow:0 10px 20px rgba(0,0,0,.12)}' +
      '.hy-track-card.hy-locked{filter:grayscale(1);opacity:.55;cursor:not-allowed}' +
      '.hy-track-emoji{font-size:2.2rem;line-height:1;margin-bottom:5px}' +
      '.hy-track-label{font-family:"Luckiest Guy",cursive;font-size:.8rem;letter-spacing:1px;color:#334155;margin-bottom:5px}' +
      '.hy-track-stars{font-size:1rem;line-height:1;letter-spacing:2px}' +
      '.hy-star-full{color:#fbbf24}' +
      '.hy-star-empty{color:#cbd5e1}';
    document.head.appendChild(s);
  }

  /* ── SessionStorage (limpa ao fechar a aba) ── */
  function _load() {
    if (!_gameKey) return { stars: Array(TOTAL).fill(0), unlocked: 1 };
    try {
      var raw = sessionStorage.getItem('hy_stars_' + _gameKey);
      return raw ? JSON.parse(raw) : { stars: Array(TOTAL).fill(0), unlocked: 1 };
    } catch (e) { return { stars: Array(TOTAL).fill(0), unlocked: 1 }; }
  }

  function _persist() {
    if (_gameKey && _data) {
      try { sessionStorage.setItem('hy_stars_' + _gameKey, JSON.stringify(_data)); } catch (e) {}
    }
  }

  /* ── Cálculo de estrelas ──
     3 ★ : sem erros E média ≤ 8 s/desafio
     2 ★ : sem erros OU média ≤ 18 s/desafio
     1 ★ : completou (qualquer desempenho)
  */
  function _calc() {
    var secsEach = (Date.now() - _trackStart) / 1000 / CHALLENGES;
    if (_wrongs === 0 && secsEach <= 8)  return 3;
    if (_wrongs <= 1 || secsEach <= 18) return 2;
    return 1;
  }

  /* ── Wrapping de HY.score ── */
  function _wrapScore() {
    var sc = window.HY && window.HY.score;
    if (!sc) { setTimeout(_wrapScore, 30); return; }
    if (sc.__starsWrapped) return;
    sc.__starsWrapped = true;
    var _r = sc.reset.bind(sc);
    var _w = sc.wrong.bind(sc);
    sc.reset = function () { _wrongs = 0; _trackStart = Date.now(); return _r(); };
    sc.wrong = function () { _wrongs++; return _w(); };
  }
  _wrapScore();

  /* ── API pública ── */

  function init(gameKey) {
    _gameKey = gameKey;
    _data = _load();
  }

  function trackComplete(trackIdx) {
    if (!_data) return 1;
    var earned = _calc();
    if (earned > (_data.stars[trackIdx] || 0)) _data.stars[trackIdx] = earned;
    if (trackIdx + 2 > _data.unlocked) _data.unlocked = Math.min(TOTAL, trackIdx + 2);
    _persist();
    return earned;
  }

  function getStars(trackIdx) {
    var d = _data || _load();
    return d.stars[trackIdx] || 0;
  }

  function getUnlocked() {
    var d = _data || _load();
    return d.unlocked || 1;
  }

  /* ── Renderização do grid 3×4 ──
     opts: {
       onPlay(trackIdx),           obrigatório
       emoji(trackIdx) → string,   opcional — fallback: '🎮'
       label(trackIdx) → string,   opcional — fallback: 'Trilha N'
       accentColor: '#hex'         opcional — cor da borda dos cards desbloqueados
     }
  */
  function renderGrid(containerId, opts) {
    var container = document.getElementById(containerId);
    if (!container) return;
    opts = opts || {};
    var unlocked = getUnlocked();
    var accent = opts.accentColor || 'var(--hy-purple, #48076a)';

    /* Aplica o layout de grid diretamente no container, sem wrapper */
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(2, 1fr)';
    container.style.gap = '14px';
    container.style.width = '100%';
    container.style.maxWidth = '680px';
    container.style.margin = '0 auto';
    container.style.boxSizing = 'border-box';

    /* Breakpoints via media-query injetado se ainda não existir */
    if (!document.getElementById('hy-grid-mq')) {
      var mq = document.createElement('style');
      mq.id = 'hy-grid-mq';
      mq.textContent =
        '@media(min-width:480px){.hy-grid-resp{grid-template-columns:repeat(3,1fr)!important}}' +
        '@media(min-width:768px){.hy-grid-resp{grid-template-columns:repeat(4,1fr)!important;gap:20px!important}}';
      document.head.appendChild(mq);
    }
    container.classList.add('hy-grid-resp');

    _onPlay = opts.onPlay || null;
    window.__HY_starsPlay = function (idx) { if (_onPlay) _onPlay(idx); };

    var html = '';
    for (var i = 0; i < TOTAL; i++) {
      var locked = i >= unlocked;
      var stars  = getStars(i);
      var emoji  = locked ? '🔒' : (opts.emoji ? opts.emoji(i) : '🎮');
      var label  = opts.label ? opts.label(i) : ('Trilha ' + (i + 1));
      var starsHtml = locked ? '' :
        '<div class="hy-track-stars">' +
        '<span class="hy-star-full">★</span>'.repeat(stars) +
        '<span class="hy-star-empty">★</span>'.repeat(3 - stars) +
        '</div>';
      var border = locked ? '' : ('border-color:' + accent + ';');
      html +=
        '<div class="hy-track-card' + (locked ? ' hy-locked' : '') + '" style="' + border + '"' +
        (locked ? '' : ' onclick="window.__HY_starsPlay(' + i + ')"') + '>' +
        '<div class="hy-track-emoji">' + emoji + '</div>' +
        '<div class="hy-track-label">' + label + '</div>' +
        starsHtml +
        '</div>';
    }
    container.innerHTML = html;
  }

  window.HY.stars = {
    init: init,
    trackComplete: trackComplete,
    getStars: getStars,
    getUnlocked: getUnlocked,
    renderGrid: renderGrid
  };
})();
