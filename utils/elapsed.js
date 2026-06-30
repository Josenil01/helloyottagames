window.HY = window.HY || {};
(function () {
  var _trailStart = 0;
  var _challengeStart = 0;
  var _tickInterval = null;
  var _running = false;
  var _total = 0;

  var _badge = document.createElement('div');
  _badge.id = 'hy-elapsed-badge';
  _badge.style.cssText = [
    'background:rgba(255,255,255,1  )', 'color:#01bebc', 'font-size:1rem',
    'font-weight:800', 'padding:5px 14px', 'border-radius:999px',
    'border:2px solid #01bebc', 'display:none', 'pointer-events:none',
    'letter-spacing:0.03em', 'white-space:nowrap'
  ].join(';');

  document.addEventListener('DOMContentLoaded', function () {
    var hud = document.createElement('div');
    hud.id = 'hy-hud';
    hud.style.cssText = [
      'position:fixed', 'top:24px', 'left:50%', 'transform:translateX(-50%)',
      'z-index:9999', 'display:flex', 'gap:8px', 'align-items:center',
      'pointer-events:none'
    ].join(';');

    var scoreBadge = document.getElementById('hy-score-badge');
    if (scoreBadge) {
      scoreBadge.style.position = 'static';
      scoreBadge.style.top = '';
      scoreBadge.style.right = '';
      hud.appendChild(scoreBadge);
    }

    hud.appendChild(_badge);
    document.body.appendChild(hud);
  });

  function _fmt(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return m > 0 ? m + 'm ' + (s < 10 ? '0' : '') + s + 's' : s + 's';
  }

  function _tick() {
    if (!_running) return;
    _badge.innerText = '⏱ ' + _fmt(Date.now() - _challengeStart);
  }

  // Wrap HY.score so no per-game calls to startTrail/startChallenge are needed
  var _origReset = HY.score.reset;
  HY.score.reset = function () {
    _origReset.call(HY.score);
    _trailStart = Date.now();
    _challengeStart = _trailStart;
    _running = true;
    _badge.style.display = 'block';
    clearInterval(_tickInterval);
    _tickInterval = setInterval(_tick, 100);
  };

  var _origStartChallenge = HY.score.startChallenge;
  HY.score.startChallenge = function () {
    _origStartChallenge.call(HY.score);
    _challengeStart = Date.now();
  };

  window.HY.elapsed = {
    stopTrail: function () {
      _running = false;
      clearInterval(_tickInterval);
      _total = Date.now() - _trailStart;
      _badge.innerText = '⏱ Total: ' + _fmt(_total);
    },
    hide: function () { _badge.style.display = 'none'; },
    getTotal: function () { return _running ? Date.now() - _trailStart : _total; },
    formatTime: _fmt
  };
})();
