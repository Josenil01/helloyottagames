/* ============================================================
   Hello Yotta Utils — timer.js
   Temporizador de contagem regressiva com barra de progresso visual.
   Usa as cores da paleta HY para feedback (verde → laranja → vermelho).
   ============================================================ */

window.HY = window.HY || {};

/**
 * Cria e retorna um objeto timer controlável.
 *
 * @param {object} options
 * @param {number}      options.duration     - Duração total em milissegundos
 * @param {HTMLElement} [options.barEl]      - Elemento da barra de progresso (style.width será atualizado)
 * @param {function}    [options.onTick]     - Chamado a cada tick com o percentual restante (0–100)
 * @param {function}    [options.onEnd]      - Chamado quando o tempo esgota
 *
 * @returns {{ start, stop, reset, getRemaining }}
 *
 * Uso:
 *   const t = HY.createTimer({ duration: 10000, barEl: document.getElementById('timer-bar'), onEnd: handleTimeout });
 *   t.start();
 *   t.stop();
 *   t.reset();
 */
window.HY.createTimer = function ({ duration, barEl, onTick, onEnd }) {
  const TICK_MS = 100;
  const decrement = (TICK_MS / duration) * 100;
  let interval = null;
  let remaining = 100;

  function updateBar(pct) {
    if (!barEl) return;
    barEl.style.width = pct + '%';
    barEl.style.backgroundColor =
      pct > 50 ? 'var(--hy-teal)' :
      pct > 20 ? 'var(--hy-orange)' :
                 'var(--hy-red)';
  }

  return {
    start() {
      this.stop();
      remaining = 100;
      updateBar(100);
      interval = setInterval(() => {
        remaining = Math.max(0, remaining - decrement);
        updateBar(remaining);
        if (onTick) onTick(remaining);
        if (remaining <= 0) {
          this.stop();
          if (onEnd) onEnd();
        }
      }, TICK_MS);
    },

    stop() {
      clearInterval(interval);
      interval = null;
    },

    reset() {
      this.stop();
      remaining = 100;
      updateBar(100);
    },

    getRemaining() {
      return remaining;
    },
  };
};
