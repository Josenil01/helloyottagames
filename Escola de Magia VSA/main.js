if (window.HY && window.HY.stars) HY.stars.init('escola-magia');

const { useState, useEffect } = React;

    // --- DADOS DO JOGO: carregados de utils/gramatica.js ---
    const LEVELS = window.HYGramatica || [];


    function App() {
      const [gameState, setGameState] = useState('cover'); 
      const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
      const [stars, setStars] = useState(0);
      const [currentTrack, setCurrentTrack] = useState(0);
      const [unlockedTracks, setUnlockedTracks] = useState(() => window.HY && window.HY.stars ? HY.stars.getUnlocked() : 1);

      const [draggedOption, setDraggedOption] = useState(null);
      const [isSuccess, setIsSuccess] = useState(false);
      const [shakeWrong, setShakeWrong] = useState(null); 
      const [wrongAnswers, setWrongAnswers] = useState([]);

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

      const handleConnectRight = (rightWord) => {
        if (!selectedLeft) {
          alert("Jovem Mago, escolha primeiro uma palavra da coluna da esquerda!");
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
          HY.stars.renderGrid('hy-track-grid', { onPlay: startTrack, accentColor: '#c026d3' });
        }
      }, [gameState]);

      // ------------------------------------------------------------------------
      // TELA 1: CAPA
      // ------------------------------------------------------------------------
      if (gameState === 'cover') {
        return (
          <div className="min-h-screen magic-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <a href="../index.html" className="absolute top-4 left-4 text-fuchsia-200 hover:text-fuchsia-400 font-bold bg-fuchsia-900/60 hover:bg-fuchsia-800 px-4 py-2 rounded-full transition-colors z-20 border-2 border-fuchsia-400">◀ Voltar</a>
            {/* Decoração Mágica */}
            <div className="absolute top-10 left-10 text-6xl opacity-40 float-anim">🪄</div>
            <div className="absolute top-32 right-10 text-7xl opacity-40 float-anim" style={{animationDelay: '1s'}}>📜</div>
            <div className="absolute bottom-10 left-20 text-6xl opacity-40 float-anim" style={{animationDelay: '2s'}}>🧪</div>
            <div className="absolute bottom-32 right-32 text-6xl opacity-40 float-anim" style={{animationDelay: '0.5s'}}>🔮</div>

            <div className="bg-fuchsia-900/60 backdrop-blur-md p-10 rounded-[3rem] shadow-[0_0_60px_rgba(217,70,239,0.4)] flex flex-col items-center text-center z-10 max-w-xl w-full border-4 border-fuchsia-400 mb-10">
              <div className="text-8xl mb-4">🧙‍♂️</div>
              <h1 className="text-5xl font-black text-white mb-2 tracking-tight uppercase">
                Escola de<br/><span className="text-5xl text-fuchsia-400">Magia</span>
              </h1>
              <p className="text-fuchsia-200 mb-8 text-xl font-bold px-4">
                Pegue sua varinha! Vamos aprender os feitiços secretos dos Nomes, Ações e Qualidades!
              </p>
              
              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-amber-400 hover:bg-amber-300 text-fuchsia-950 rounded-3xl text-3xl font-black transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(217,119,6)] hover:translate-y-1 active:shadow-none active:translate-y-2 uppercase"
              >
                Escolher Trilha
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
          <div className="min-h-screen magic-bg flex flex-col items-center p-6 pt-12">
            <a href="../index.html" className="self-start mb-6 font-bold bg-fuchsia-900/60 text-fuchsia-200 px-4 py-2 rounded-full border-2 border-fuchsia-400">◀ Voltar</a>
            <h2 className="text-4xl font-black text-white mb-8 uppercase font-game">Escolha a Aula</h2>
            <div id="hy-track-grid" style={{width:'100%',maxWidth:'720px'}}></div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA: AULA COMPLETA
      // ------------------------------------------------------------------------
      if (gameState === 'trackComplete') {
        return (
          <div className="min-h-screen magic-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="bg-fuchsia-900/80 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center max-w-lg w-full border-4 border-fuchsia-400">
              <div className="text-8xl mb-4 pop-anim">🎓</div>
              <h1 className="text-4xl font-black text-white mb-2 uppercase">Aula {currentTrack + 1} Completa!</h1>
              <p className="text-fuchsia-200 mb-6 text-xl font-bold">Você dominou os 5 feitiços!</p>
              <div className="bg-fuchsia-950 border-4 border-fuchsia-700 rounded-3xl p-6 mb-8 w-full flex flex-col items-center">
                <div className="flex items-center text-6xl font-black text-amber-400">
                  <span className="mr-4">🧪</span> x{stars}
                </div>
              </div>
              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-amber-400 hover:bg-amber-300 text-fuchsia-950 rounded-3xl text-2xl font-black transition-all transform hover:scale-105 uppercase"
              >
                Próxima Aula
              </button>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 2: JOGABILIDADE (Múltiplas Mecânicas)
      // ------------------------------------------------------------------------
      return (
        <div className="min-h-screen w-full flex flex-col relative magic-bg text-fuchsia-50">
          
          {/* CABEÇALHO */}
          <div className="w-full flex justify-between items-center p-6 z-10 bg-fuchsia-950/80 backdrop-blur-md shadow-xl rounded-b-3xl border-b-2 border-fuchsia-700">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-fuchsia-400">{level.instruction}</span>
            </div>
            
            <div className="flex items-center text-3xl font-black text-amber-400 drop-shadow-md">
              <span className="mr-2">x{stars}</span>
              <span className="pop-anim">🧪</span>
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