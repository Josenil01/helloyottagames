/* ============================================================
   Hello Yotta Utils — audio.js
   Feedback auditivo padronizado para todos os jogos.
   Os arquivos de áudio devem estar em /assets/audio/.
   Uso: HY.playWin()  → toca win.mp3 (resposta correta)
        HY.playLose() → toca lose.mp3 (resposta errada)
   ============================================================ */

window.HY = window.HY || {};

(function () {
  const _win  = new Audio('../assets/audio/win.mp3');
  const _lose = new Audio('../assets/audio/lose.mp3');

  window.HY.playWin = function () {
    try { _win.currentTime = 0; _win.play().catch(() => {}); } catch (e) {}
  };

  window.HY.playLose = function () {
    try { _lose.currentTime = 0; _lose.play().catch(() => {}); } catch (e) {}
  };
})();
