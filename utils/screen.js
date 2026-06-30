/* ============================================================
   Hello Yotta Utils — screen.js
   Gerenciamento de telas para jogos Vanilla JS (não-React).
   Mostra uma tela e esconde todas as outras.
   ============================================================ */

window.HY = window.HY || {};

/**
 * Exibe a tela com o ID fornecido e oculta todas as demais.
 *
 * @param {string} screenId                  - ID do elemento a exibir
 * @param {string} [selector='.screen']      - Seletor CSS para todas as telas do jogo
 * @param {string} [displayValue='flex']     - Valor de display para a tela ativa
 *
 * Uso:
 *   HY.showScreen('screen-game');
 *   HY.showScreen('screen-result', '.game-screen', 'block');
 */
window.HY.showScreen = function (screenId, selector, displayValue) {
  const sel = selector || '.screen';
  const display = displayValue || 'flex';

  document.querySelectorAll(sel).forEach(function (s) {
    s.style.display = 'none';
    s.classList.remove('active-screen');
  });

  const target = document.getElementById(screenId);
  if (target) {
    target.style.display = display;
    target.classList.add('active-screen');
  }
};
