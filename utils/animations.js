/* ============================================================
   Hello Yotta Utils — animations.js
   Aciona animações CSS via toggle de classe com reflow forçado,
   garantindo que a animação reinicia mesmo se já estava rodando.
   Depende de: game-viewport.css (define as @keyframes)
   ============================================================ */

window.HY = window.HY || {};

/**
 * Aciona uma classe de animação CSS em um elemento, reiniciando se necessário.
 * @param {HTMLElement} el - Elemento alvo
 * @param {string} className - Classe CSS da animação (ex: 'shake', 'pop-in')
 * @param {number} [removeAfterMs] - Se fornecido, remove a classe após N ms
 */
window.HY.triggerAnim = function (el, className, removeAfterMs) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth; // força reflow para reiniciar a animação
  el.classList.add(className);
  if (removeAfterMs != null) {
    setTimeout(() => el.classList.remove(className), removeAfterMs);
  }
};

/**
 * Ação de erro: tremida horizontal (usa classe .shake do game-viewport.css).
 * @param {HTMLElement} el
 */
window.HY.shake = function (el) {
  HY.triggerAnim(el, 'shake', 400);
};

/**
 * Ação de acerto: pop de escala (usa classe .pop-in do game-viewport.css).
 * @param {HTMLElement} el
 */
window.HY.pop = function (el) {
  HY.triggerAnim(el, 'pop-in', 450);
};

/**
 * Aplica animação de flutuação contínua (usa classe .float do game-viewport.css).
 * @param {HTMLElement} el
 */
window.HY.float = function (el) {
  if (el) el.classList.add('float');
};
