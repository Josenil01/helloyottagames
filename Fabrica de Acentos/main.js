if (window.HY && window.HY.stars) HY.stars.init('fabrica-acentos');

const { useState, useEffect } = React;

    // --- DADOS DO JOGO ---
    const ACCENT_MAP     = (window.HYAcentos || {}).accentMap     || {};
    const ACCENT_OPTIONS = (window.HYAcentos || {}).accentOptions || [];

    // Deriva fases de HYWords: agrupa por faseAcento 1..12, cada grupo = array de { word, emoji }
    const PHASES = (() => {
      const words = window.HYWords || [];
      const phases = [];
      for (let i = 1; i <= 12; i++) {
        const group = words
          .filter(w => w.faseAcento === i)
          .map(w => ({ word: w.palavra, emoji: w.emoji }));
        phases.push(group);
      }
      return phases;
    })();

    function App() {
      const [gameState, setGameState] = useState('cover'); 
      const [unlockedPhases, setUnlockedPhases] = useState(() => window.HY && window.HY.stars ? HY.stars.getUnlocked() : 1);
      
      const [currentPhase, setCurrentPhase] = useState(1);
      const [currentWordIndex, setCurrentWordIndex] = useState(0);
      
      const [wrongAnswers, setWrongAnswers] = useState([]); 
      const [isSuccess, setIsSuccess] = useState(false); 
      
      // Novos estados para suportar o arrastar/clicar individual em cada letra
      const [dragOverIndex, setDragOverIndex] = useState(null);
      const [selectedLetterIndex, setSelectedLetterIndex] = useState(null);
      const [shakeIndex, setShakeIndex] = useState(null);
      
      const [startTime, setStartTime] = useState(0);
      const [metrics, setMetrics] = useState([]);

      const startPhase = (phaseNumber) => {
        setCurrentPhase(phaseNumber);
        setCurrentWordIndex(0);
        setMetrics([]);
        setWrongAnswers([]);
        setIsSuccess(false);
        setDragOverIndex(null);
        setSelectedLetterIndex(null);
        setGameState('playing');
        setStartTime(Date.now());
        HY.score.reset();
        HY.score.startChallenge();
      };

      // Lógica principal: Verifica se o acento e a letra estão corretos
      const checkAnswer = (accentSymbol, dropIndex) => {
        if (isSuccess || wrongAnswers.includes(accentSymbol)) return;

        const phaseWords = PHASES[currentPhase - 1];
        const currentItem = phaseWords[currentWordIndex];
        
        // Encontra qual é a letra correta que precisa do acento
        const wordArray = currentItem.word.split('');
        const targetIndex = wordArray.findIndex(char => ACCENT_MAP[char]);
        const targetChar = wordArray[targetIndex];
        const expectedAccent = ACCENT_MAP[targetChar].accent;

        // Validação se o jogador tocou no botão de acento sem selecionar a caixa (Fases 6 e 7)
        if (currentPhase >= 6 && dropIndex === undefined && selectedLetterIndex === null) {
          alert("Toque numa caixinha amarela primeiro para escolher a letra!");
          return;
        }

        // Define o índice final onde o acento está a ser tentado
        const finalDropIndex = dropIndex !== undefined ? dropIndex : (currentPhase >= 6 ? selectedLetterIndex : targetIndex);

        // 1. Verificamos se o aluno colocou na letra certa (importante para fases 6 e 7)
        if (finalDropIndex !== targetIndex) {
          // Errou a letra onde se coloca o acento
          setShakeIndex(finalDropIndex);
          setTimeout(() => setShakeIndex(null), 300);
          return; // Não bloqueia o acento, pois ele pode ser o correto, apenas colocado no lugar errado
        }

        // 2. Verificamos se escolheu o acento certo
        if (accentSymbol === expectedAccent) {
          // Acertou na mouche!
          HY.playWin();
          HY.score.correct();
          setIsSuccess(true);
          const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1); 
          setMetrics(prev => [...prev, { word: currentItem.word, time: timeTaken }]);

          setTimeout(() => {
            if (currentWordIndex + 1 < phaseWords.length) {
              setCurrentWordIndex(prev => prev + 1);
              setWrongAnswers([]);
              setIsSuccess(false);
              setSelectedLetterIndex(null);
              setDragOverIndex(null);
              HY.score.startChallenge();
              setStartTime(Date.now());
            } else {
              // Concluiu a fase
              if (window.HY && window.HY.stars) HY.stars.trackComplete(currentPhase - 1);
              if (currentPhase === unlockedPhases && currentPhase < PHASES.length) {
                setUnlockedPhases(prev => prev + 1);
              }
              HY.elapsed.stopTrail();
              setGameState('phaseComplete');
            }
          }, 1500); 
          
        } else {
          // Errou o acento
          HY.playLose();
          HY.score.wrong();
          setWrongAnswers(prev => [...prev, accentSymbol]);
          setShakeIndex(targetIndex);
          setTimeout(() => setShakeIndex(null), 300);
        }
      };

      // --- Handlers de Drag and Drop Individuais ---
      const handleDragStart = (e, symbol) => {
        e.dataTransfer.setData('text/plain', symbol);
        e.dataTransfer.effectAllowed = 'move';
      };

      const handleDragOverLetter = (e, index) => {
        e.preventDefault(); 
        e.dataTransfer.dropEffect = 'move';
        if (dragOverIndex !== index) setDragOverIndex(index);
      };

      const handleDragLeaveLetter = (e, index) => {
        e.preventDefault();
        if (dragOverIndex === index) setDragOverIndex(null);
      };

      const handleDropLetter = (e, index) => {
        e.preventDefault();
        setDragOverIndex(null);
        const droppedSymbol = e.dataTransfer.getData('text/plain');
        if (droppedSymbol) {
          checkAnswer(droppedSymbol, index);
        }
      };

      const handleLetterClick = (index) => {
        if (currentPhase >= 6 && !isSuccess) {
          setSelectedLetterIndex(index);
        }
      };

      useEffect(() => {
        if (gameState === 'phaseSelect' && window.HY && window.HY.stars) {
          HY.stars.renderGrid('hy-track-grid', { onPlay: (i) => startPhase(i + 1), accentColor: '#6366f1' });
        }
      }, [gameState]);

      // ------------------------------------------------------------------------
      // TELA 1: CAPA
      // ------------------------------------------------------------------------
      if (gameState === 'cover') {
        return (
          <div className="min-h-screen bg-violet-600 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
            <a href="../index.html" className="absolute top-4 left-4 text-violet-200 hover:text-violet-400 font-bold bg-violet-700/80 hover:bg-violet-800 px-4 py-2 rounded-full transition-colors z-20 border-2 border-violet-400">◀ Voltar</a>
            <div className="absolute top-10 left-10 text-6xl opacity-30 animate-bounce">´</div>
            <div className="absolute top-20 right-20 text-7xl opacity-30 text-yellow-300">^</div>
            <div className="absolute bottom-20 left-20 text-8xl opacity-30 text-pink-300 rotate-12">~</div>

            <div className="bg-white/95 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center z-10 max-w-lg w-full border-8 border-violet-300">
              <div className="text-8xl mb-4">🎩</div>
              <h1 className="text-5xl font-extrabold text-violet-700 mb-2 tracking-tight leading-tight">
                Fábrica de<br/><span className="text-4xl text-violet-500">Acentos</span>
              </h1>
              <p className="text-gray-500 mb-8 text-lg font-medium">Coloque a "coroazinha" certa na letra correta!</p>
              
              <button 
                onClick={() => setGameState('phaseSelect')}
                className="w-full py-5 px-8 bg-yellow-400 hover:bg-yellow-500 text-white rounded-[2rem] text-3xl font-black transition-transform transform hover:scale-105 shadow-[0_8px_0_rgb(202,138,4)] hover:translate-y-1 active:shadow-none active:translate-y-2"
              >
                JOGAR
              </button>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 2: MAPA DE FASES
      // ------------------------------------------------------------------------
      if (gameState === 'phaseSelect') {
        return (
          <div className="min-h-screen bg-violet-600 flex flex-col items-center p-6 pt-12">
            <button onClick={() => setGameState('cover')} className="self-start mb-6 font-bold bg-violet-900/60 text-violet-200 px-4 py-2 rounded-full border-2 border-violet-400">◀ Início</button>
            <h2 className="text-4xl font-black text-white mb-8 uppercase font-game">Mapa do Jogo</h2>
            <div id="hy-track-grid" style={{width:'100%',maxWidth:'720px'}}></div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 3: FIM DE FASE (BOLETIM)
      // ------------------------------------------------------------------------
      if (gameState === 'phaseComplete') {
        const totalTime = metrics.reduce((acc, curr) => acc + parseFloat(curr.time), 0).toFixed(1);
        const hasNextPhase = currentPhase < PHASES.length;
        
        return (
          <div className="min-h-screen bg-yellow-100 flex flex-col items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border-4 border-yellow-300">
              <div className="text-6xl mb-4 animate-bounce">🏆</div>
              <h1 className="text-4xl font-bold text-yellow-500 mb-2">Fase {currentPhase} Concluída!</h1>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6 mt-6 shadow-inner">
                <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Palavras que aprendeste</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {metrics.map((m, i) => (
                    <div key={i} className="flex flex-col items-center bg-white p-2 rounded-xl shadow border border-gray-100 w-[45%]">
                      <span className="text-lg font-bold text-indigo-600 mb-1">{m.word}</span>
                      <span className="text-xs text-gray-400 font-bold">{m.time}s</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t flex justify-between items-center font-bold text-gray-800 text-xl">
                  <span>Tempo Total:</span>
                  <span className="text-green-600">{totalTime}s</span>
                </div>
              </div>

              <div className="space-y-3">
                {hasNextPhase && (
                  <button 
                    onClick={() => startPhase(currentPhase + 1)}
                    className="w-full py-4 px-6 bg-yellow-400 hover:bg-yellow-500 text-white rounded-2xl text-xl font-bold shadow-[0_6px_0_rgb(202,138,4)] hover:shadow-none hover:translate-y-1 transition-all"
                  >
                    Próxima Fase ➡️
                  </button>
                )}
                <button 
                  onClick={() => setGameState('phaseSelect')}
                  className="w-full py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl text-lg font-bold transition-colors"
                >
                  Voltar ao Mapa
                </button>
              </div>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 4: O JOGO (GAMEPLAY MAIN)
      // ------------------------------------------------------------------------
      const phaseWords = PHASES[currentPhase - 1];
      const currentItem = phaseWords[currentWordIndex];
      const wordArray = currentItem.word.split('');
      
      const targetIndex = wordArray.findIndex(char => ACCENT_MAP[char]);
      const targetData = ACCENT_MAP[wordArray[targetIndex]];

      const instructionText = currentPhase >= 6 
        ? "Arraste o acento para a letra certa (ou toque na letra e depois no acento)!" 
        : "Arraste o acento que falta na palavra!";

      return (
        <div className="min-h-screen bg-violet-100 flex flex-col items-center justify-center p-4 font-sans">
          
          <button 
            onClick={() => setGameState('phaseSelect')}
            className="absolute top-4 left-4 text-violet-700 hover:text-violet-900 font-bold bg-white/50 hover:bg-white px-4 py-2 rounded-full transition-colors z-20"
          >
            ⏸ Pausar
          </button>


          <div className="flex flex-col items-center justify-center w-full max-w-4xl mt-8">
            
            {/* Imagem (Emoji) animado */}
            <div className={`text-[6rem] leading-none mb-6 filter drop-shadow-xl transition-all duration-500 ${isSuccess ? 'scale-125 animate-bounce' : ''}`}>
              {currentItem.emoji}
            </div>
            
            <div className="text-violet-700 text-sm md:text-lg uppercase tracking-widest font-extrabold mb-10 bg-white/60 px-6 py-2 rounded-full text-center">
              {instructionText}
            </div>

            {/* --- ÁREA DA PALAVRA --- */}
            <div className="flex flex-row flex-wrap items-end justify-center gap-1 md:gap-3 mb-16 w-full px-2">
                 
              {wordArray.map((char, index) => {
                
                const isTarget = index === targetIndex;
                const showDropzone = currentPhase >= 6 || isTarget;

                if (showDropzone) {
                  const isHoveredOrSelected = dragOverIndex === index || selectedLetterIndex === index;
                  const isSuccessThisBox = isSuccess && isTarget;

                  return (
                    <div key={index} 
                         className={`flex flex-col items-center justify-end h-32 md:h-40 cursor-pointer ${shakeIndex === index ? 'shake-anim' : ''}`}
                         onDragOver={(e) => handleDragOverLetter(e, index)}
                         onDragLeave={(e) => handleDragLeaveLetter(e, index)}
                         onDrop={(e) => handleDropLetter(e, index)}
                         onClick={() => handleLetterClick(index)}
                    >
                      {/* Espaço pontilhado (Dropzone) ou Animação de sucesso */}
                      {isSuccessThisBox ? (
                        <div className="text-4xl md:text-5xl font-black text-green-500 mb-2 animate-bounce">
                          {targetData.accent}
                        </div>
                      ) : (
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border-4 border-dashed mb-2 flex items-center justify-center text-3xl md:text-5xl font-black transition-colors ${
                          isHoveredOrSelected ? 'border-yellow-400 bg-yellow-100 text-yellow-500 scale-105' : 'border-violet-300 text-violet-200'
                        }`}>
                          {isHoveredOrSelected ? (dragOverIndex === index ? '📥' : '👆') : ''}
                        </div>
                      )}

                      {/* Letra Base */}
                      <div className={`rounded-xl border-b-8 flex items-center justify-center w-14 h-16 md:w-20 md:h-24 text-4xl md:text-6xl font-bold shadow-md transition-all duration-300 ${
                        isSuccessThisBox 
                          ? 'bg-green-400 text-white border-green-600 scale-110 shadow-xl' 
                          : (isHoveredOrSelected ? 'bg-yellow-100 text-yellow-600 border-yellow-300' : 'bg-white text-indigo-400 border-gray-200')
                      }`}>
                        {/* Mostra a letra normal não acentuada, a não ser que tenha acertado a caixa correta */}
                        {isSuccessThisBox ? char : (isTarget ? targetData.base : char)}
                      </div>
                    </div>
                  );
                }

                // Letras normais que não precisam de acento nas Fases 1 a 5
                return (
                  <div key={index} className="flex flex-col justify-end h-32 md:h-40 pb-0">
                    <div className="bg-white rounded-xl border-b-8 border-gray-200 flex items-center justify-center w-14 h-16 md:w-20 md:h-24 text-4xl md:text-6xl font-bold text-indigo-800 shadow-md">
                      {char}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- OPÇÕES DE ACENTOS --- */}
            <div className="flex flex-row justify-center gap-6 md:gap-12 w-full px-4">
              {ACCENT_OPTIONS.map((opt, i) => {
                const isWrong = wrongAnswers.includes(opt.symbol);
                
                let btnClass = `${opt.color} text-white border-b-8 shadow-lg hover:-translate-y-2 hover:scale-105 cursor-grab active:cursor-grabbing`;
                
                if (opt.color === 'bg-blue-400') btnClass += ' border-blue-600 hover:bg-blue-300';
                if (opt.color === 'bg-purple-400') btnClass += ' border-purple-600 hover:bg-purple-300';
                if (opt.color === 'bg-pink-400') btnClass += ' border-pink-600 hover:bg-pink-300';

                if (isWrong) {
                  btnClass = "bg-red-200 text-red-500 border-b-8 border-red-300 opacity-50 cursor-not-allowed transform translate-y-2";
                } else if (isSuccess) {
                  btnClass = "bg-gray-200 text-gray-400 border-b-8 border-gray-300 opacity-50 cursor-not-allowed";
                }

                return (
                  <button
                    key={i}
                    draggable={!isWrong && !isSuccess}
                    onDragStart={(e) => handleDragStart(e, opt.symbol)}
                    onClick={() => checkAnswer(opt.symbol)} // Fallback para toque no ecrã
                    disabled={isWrong || isSuccess}
                    className={`rounded-3xl flex flex-col items-center justify-center w-28 h-32 md:w-36 md:h-40 transition-all duration-300 ${btnClass}`}
                  >
                    <span className="text-[4rem] md:text-[5rem] font-black leading-none mb-1">{opt.symbol}</span>
                    <span className="text-sm md:text-base font-bold bg-black/20 px-3 py-1 rounded-full uppercase tracking-wider">{opt.name}</span>
                  </button>
                );
              })}
            </div>
            
          </div>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);