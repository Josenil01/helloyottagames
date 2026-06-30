/* ============================================================
   Hello Yotta Utils — shuffle.js
   Embaralha arrays usando Fisher-Yates (resultado imprevisível e uniforme).
   Uso: const novo = HY.shuffle(array);
   ============================================================ */

window.HY = window.HY || {};

/**
 * Retorna uma cópia embaralhada do array (não modifica o original).
 * @param {Array} array
 * @returns {Array}
 */
window.HY.shuffle = function (array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
