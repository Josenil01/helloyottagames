if (window.HY && window.HY.stars) HY.stars.init('cacadores-coletivos');

const { useState, useEffect } = React;

    // --- DADOS DO JOGO: gerados dinamicamente de utils/words.js ---
    const LEVELS = (function() {
      var banco = window.HYWords || [];
      return window.HY && window.HY.challenges
        ? window.HY.challenges.buildLevels('coletivo', banco, 12)
        : [];
    })();


    function App() {
      // Estados globais
      const [gameState, setGameState] = useState('cover');
      const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
      const [stars, setStars] = useState(0);
      const [currentTrack, setCurrentTrack] = useState(0);
      const [unlockedTracks, setUnlockedTracks] = useState(() => window.HY && window.HY.stars ? HY.stars.getUnlocked() : 1);

      // Estados interativos
      const [draggedOption, setDraggedOption] = useState(null);
      const [isSuccess, setIsSuccess] = useState(false);
      const [shakeWrong, setShakeWrong] = useState(null);
      const [wrongAnswers, setWrongAnswers] = useState([]);

      // Estados para a mecânica de "Ligar Pontos"
      const [selectedLeft, setSelectedLeft] = useState(null);
      const [solvedPairs, setSolvedPairs] = useState([]);

      const level = LEVELS[currentPhaseIndex];

      const startTrack = (trackIdx) => {
        setCurrentTrack(trackIdx);
        setCurrentPhaseIndex(trackIdx * 5);
        setStars(0);
        setGameState('playing');
        HY.score.reset();
        resetTurn();
      };

      const resetTurn = () => {
        setIsSuccess(false);
        setWrongAnswers([]);
        setDraggedOption(null);
        setSelectedLeft(null);
        setSolvedPairs([]);
        setShakeWrong(null);
        HY.score.startChallenge();
      };

      // Função genérica de vitória
      const handleWin = () => {
        HY.playWin();
        HY.score.correct();
        setIsSuccess(true);
        setStars(prev => prev + 1);
        setTimeout(() => {
          const phaseInTrack = (currentPhaseIndex - currentTrack * 5);
          if (phaseInTrack + 1 < 5) {
            setCurrentPhaseIndex(prev => prev + 1);
            resetTurn();
          } else {
            if (window.HY && window.HY.stars) HY.stars.trackComplete(currentTrack);
            setUnlockedTracks(prev => Math.max(prev, currentTrack + 2));
            HY.elapsed.stopTrail();
            setGameState('trackComplete');
          }
        }, 2500);
      };

      // Lógica de Validação: Match, Intruder, Sentence
      const checkAnswer = (value) => {
        if (isSuccess || wrongAnswers.includes(value)) return;

        if (value === level.answer) {
          handleWin();
        } else {
          HY.playLose();
          HY.score.wrong();
          setWrongAnswers(prev => [...prev, value]);
          setShakeWrong(value);
          setTimeout(() => setShakeWrong(null), 400);
        }
      };

      // Lógica de Validação: Ligar Pontos
      const handleConnectRight = (rightWord) => {
        if (!selectedLeft) {
          alert("Caçador, escolha primeiro uma palavra da coluna da esquerda!");
          return;
        }

        if (level.matches[selectedLeft] === rightWord) {
          const newSolved = [...solvedPairs, selectedLeft];
          setSolvedPairs(newSolved);
          setSelectedLeft(null);

          if (newSolved.length === level.leftWords.length) {
            handleWin();
          }
        } else {
          HY.playLose();
          HY.score.wrong();
          setShakeWrong(rightWord);
          setTimeout(() => setShakeWrong(null), 400);
          setSelectedLeft(null);
        }
      };

      // --- Drag & Drop Handlers ---
      const handleDragStart = (e, value) => {
        setDraggedOption(value);
        e.dataTransfer.setData('text/plain', value);
      };
      const handleDragOver = (e) => e.preventDefault();
      const handleDrop = (e) => {
        e.preventDefault();
        const value = e.dataTransfer.getData('text/plain');
        if (value) checkAnswer(value);
      };

      useEffect(() => {
        if (gameState === 'trackSelect' && window.HY && window.HY.stars) {
          HY.stars.renderGrid('hy-track-grid', { onPlay: startTrack, accentColor: '#f97316' });
        }
      }, [gameState]);

      // ------------------------------------------------------------------------
      // TELA 1: CAPA
      // ------------------------------------------------------------------------
      if (gameState === 'cover') {
        return (
          <div className="min-h-screen safari-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Decoração Aventureira */}
            <div className="absolute top-10 left-10 text-6xl opacity-40 float-anim">🗺️</div>
            <div className="absolute top-32 right-10 text-7xl opacity-40 float-anim" style={{animationDelay: '1s'}}>🦁</div>
            <div className="absolute bottom-10 left-20 text-6xl opacity-40 float-anim" style={{animationDelay: '2s'}}>🧭</div>
            <div className="absolute bottom-32 right-32 text-6xl opacity-40 float-anim" style={{animationDelay: '0.5s'}}>🚙</div>

            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(217,119,6,0.2)] flex flex-col items-center text-center z-10 max-w-xl w-full border-8 border-orange-500 mb-10">
              <div className="text-8xl mb-4">🔦</div>
              <h1 className="text-5xl font-black text-stone-800 mb-2 tracking-tight uppercase">
                Caçadores de<br/><span className="text-5xl text-orange-600">Coletivos</span>
              </h1>
              <p className="text-stone-600 mb-8 text-xl font-bold px-4">
                Pegue sua lupa e seu mapa! Vamos descobrir a palavra secreta que representa grupos inteiros!
              </p>

              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl text-3xl font-black transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(5,150,105)] hover:translate-y-1 active:shadow-none active:translate-y-2 uppercase"
              >
                Iniciar Expedição!
              </button>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA: SELEÇÃO DE TRILHA
      // ------------------------------------------------------------------------
      if (gameState === 'trackSelect') {
        return (
          <div className="min-h-screen safari-bg flex flex-col items-center p-6 pt-12">
            <a href="../index.html" className="self-start mb-6 font-bold bg-amber-200/80 text-stone-900 px-4 py-2 rounded-full border-2 border-amber-400">◀ Voltar</a>
            <h2 className="text-4xl font-black text-white mb-8 uppercase font-game">Escolha a Expedição</h2>
            <div id="hy-track-grid" style={{width:'100%',maxWidth:'720px'}}></div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA: TRILHA COMPLETA
      // ------------------------------------------------------------------------
      if (gameState === 'trackComplete') {
        return (
          <div className="min-h-screen safari-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="bg-white/90 p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(217,119,6,0.2)] flex flex-col items-center text-center z-10 max-w-lg w-full border-8 border-orange-500">
              <div className="text-8xl mb-4 pop-anim">🎖️</div>
              <h1 className="text-4xl font-black text-stone-800 mb-2 uppercase">Expedição {currentTrack + 1} Completa!</h1>
              <p className="text-stone-600 mb-6 text-xl font-bold">Você capturou todos os 5 coletivos!</p>
              <div className="bg-amber-100 border-4 border-amber-400 rounded-3xl p-6 mb-8 w-full flex flex-col items-center">
                <div className="flex items-center text-6xl font-black text-orange-500">
                  <span className="mr-4">⭐</span> x{stars}
                </div>
              </div>
              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl text-2xl font-black transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(5,150,105)] uppercase"
              >
                Escolher Próxima Expedição
              </button>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 3: FINAL
      // ------------------------------------------------------------------------
      if (gameState === 'complete') {
        return (
          <div className="min-h-screen safari-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(217,119,6,0.2)] flex flex-col items-center text-center z-10 max-w-lg w-full border-8 border-orange-500">
              <div className="text-8xl mb-4 pop-anim">🎖️</div>
              <h1 className="text-5xl font-black text-stone-800 mb-2 uppercase">
                Parabéns!
              </h1>
              <p className="text-stone-600 mb-6 text-xl font-bold">Você encontrou todos os coletivos raros!</p>

              <div className="bg-amber-100 border-4 border-amber-400 rounded-3xl p-6 mb-8 w-full flex flex-col items-center">
                <span className="text-amber-800 font-bold uppercase mb-2">Insígnias de Caçador</span>
                <div className="flex items-center text-6xl font-black text-orange-500">
                  <span className="mr-4">⭐</span> x{stars}
                </div>
              </div>

              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl text-2xl font-black transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(5,150,105)] hover:translate-y-1 active:shadow-none active:translate-y-2 uppercase"
              >
                Escolher Expedição
              </button>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 2: JOGABILIDADE (Múltiplas Mecânicas)
      // ------------------------------------------------------------------------
      return (
        <div className="min-h-screen w-full flex flex-col relative safari-bg text-stone-800">

          {/* CABEÇALHO */}
          <div className="w-full flex justify-between items-center p-6 z-10 bg-stone-900/80 backdrop-blur-sm shadow-lg rounded-b-3xl border-b-4 border-stone-700">
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black uppercase text-amber-100 drop-shadow-md">
                Mapa {level.id} de {LEVELS.length}
              </h2>
              <span className="text-sm font-bold text-amber-300">{level.instruction}</span>
            </div>

            <div className="flex items-center text-3xl font-black text-orange-400 drop-shadow-md">
              <span className="mr-2">x{stars}</span>
              <span className="pop-anim">⭐</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 w-full max-w-5xl mx-auto">

            {level.type === 'match' && (
              <HYChallenges.Match
                level={level}
                isSuccess={isSuccess}
                shakeWrong={shakeWrong}
                wrongAnswers={wrongAnswers}
                onAnswer={checkAnswer}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            )}

            {level.type === 'connect' && (
              <HYChallenges.Connect
                level={level}
                shakeWrong={shakeWrong}
                solvedPairs={solvedPairs}
                selectedLeft={selectedLeft}
                onSelectLeft={setSelectedLeft}
                onConnectRight={handleConnectRight}
              />
            )}

            {level.type === 'intruder' && (
              <HYChallenges.Intruder
                level={level}
                isSuccess={isSuccess}
                shakeWrong={shakeWrong}
                wrongAnswers={wrongAnswers}
                onAnswer={checkAnswer}
              />
            )}

            {level.type === 'sentence' && (
              <HYChallenges.Sentence
                level={level}
                isSuccess={isSuccess}
                shakeWrong={shakeWrong}
                wrongAnswers={wrongAnswers}
                onAnswer={checkAnswer}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            )}

          </div>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
