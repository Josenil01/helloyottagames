// utils/progress.js — HY.progress
// Barra de progresso de trilha (5 desafios). Wrapa HY.score automaticamente:
//   reset()   → barra vai a 0%
//   correct() → barra avança 1/5
// Não requer nenhuma mudança de código nos jogos além de carregar este script.
window.HY = window.HY || {};

(function () {
  'use strict';

  var TOTAL = 5;
  var count = 0;
  var wrapper = null;
  var fill = null;

  function build() {
    wrapper = document.createElement('div');
    wrapper.id = 'hy-progress';
    wrapper.setAttribute('style', [
      'position:fixed',
      'top:0',
      'left:0',
      'right:0',
      'z-index:9999',
      'display:none',
      'padding:5px 16px',
      'pointer-events:none',
    ].join(';'));

    var track = document.createElement('div');
    track.setAttribute('style', [
      'width:100%',
      'max-width:640px',
      'margin:0 auto',
      'height:14px',
      'background:rgba(255,255,255,0.30)',
      'border-radius:999px',
      'overflow:hidden',
      'border:2px solid rgba(255,255,255,0.55)',
      'box-shadow:inset 0 1px 4px rgba(0,0,0,0.12)',
    ].join(';'));

    fill = document.createElement('div');
    fill.setAttribute('style', [
      'height:100%',
      'background:#ffa800',
      'border-radius:999px',
      'width:0%',
      'transition:width 0.45s cubic-bezier(0.4,0,0.2,1)',
      'box-shadow:0 0 10px rgba(255,168,0,0.75)',
    ].join(';'));

    track.appendChild(fill);
    wrapper.appendChild(track);

    var attach = function () { document.body.appendChild(wrapper); };
    if (document.body) { attach(); }
    else { document.addEventListener('DOMContentLoaded', attach); }
  }

  function _setPercent(pct) {
    if (!wrapper) build();
    fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
    wrapper.style.display = 'block';
  }

  function _hide() {
    if (wrapper) wrapper.style.display = 'none';
  }

  // --- Wrapa HY.score assim que estiver disponível ---
  function wrapScore() {
    var s = window.HY && window.HY.score;
    if (!s) { setTimeout(wrapScore, 30); return; }
    if (s.__progressWrapped) return;
    s.__progressWrapped = true;

    var _reset   = s.reset.bind(s);
    var _correct = s.correct.bind(s);
    var _hide_s  = s.hide.bind(s);

    s.reset = function () {
      count = 0;
      _setPercent(0);
      return _reset();
    };

    s.correct = function () {
      count = Math.min(TOTAL, count + 1);
      _setPercent((count / TOTAL) * 100);
      return _correct();
    };

    s.hide = function () {
      _hide();
      return _hide_s();
    };
  }
  wrapScore();

  window.HY.progress = {
    show: function (n, total) { _setPercent((n / (total || TOTAL)) * 100); },
    hide: _hide,
    reset: function () { count = 0; _setPercent(0); },
  };
})();
