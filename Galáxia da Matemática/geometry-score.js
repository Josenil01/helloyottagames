// Pontuação fixa desta atividade, sem o bônus de velocidade de outros jogos.
window.HY = window.HY || {};
(() => {
    let total = 0;
    function update() { document.getElementById('geo-score').textContent = `${total} pontos`; return total; }
    HY.score = {
        reset() { total = 0; update(); },
        correct() { total += 100; return update(); },
        wrong() { total = Math.max(0, total - 50); return update(); },
        startChallenge() {}, hide() {}, get() { return total; }
    };
})();
