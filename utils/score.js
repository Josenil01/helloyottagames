window.HY = window.HY || {};
(function () {
  let _total = 0;
  let _challengeStart = 0;

  const _badge = document.createElement('div');
  _badge.id = 'hy-score-badge';
  _badge.style.cssText = [
    'position:fixed',
    'top:30px',
    'right:120px',
    'z-index:9999',
    'background:rgba(255,255,255,1  )',
    'color:#ffa800',
    'font-size:1rem',
    'font-weight:800',
    'padding:5px 14px',
    'border-radius:999px',
    'border:2px solid #ffa800',
    'display:none',
    'pointer-events:none',
    'letter-spacing:0.03em'
  ].join(';');

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(_badge);
  });

  function _update() {
    _badge.innerText = '⭐ ' + _total;
  }

  window.HY.score = {
    reset: function () {
      _total = 0;
      _badge.style.display = 'block';
      _update();
    },
    hide: function () {
      _badge.style.display = 'none';
    },
    startChallenge: function () {
      _challengeStart = Date.now();
    },
    correct: function () {
      var secs = (Date.now() - _challengeStart) / 1000;
      var bonus = Math.max(0, Math.round(50 - secs * 5));
      _total += 100 + bonus;
      _update();
      return _total;
    },
    wrong: function () {
      _total = Math.max(0, _total - 50);
      _update();
      return _total;
    },
    get: function () {
      return _total;
    }
  };
})();
