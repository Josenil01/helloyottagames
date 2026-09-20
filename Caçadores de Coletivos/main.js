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
      React.useLayoutEffect(() => {
        const hud = document.getElementById('hy-hud');
        if (hud) hud.style.display = gameState === 'playing' ? 'flex' : 'none';
      }, [gameState]);
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
          HY.stars.renderGrid('hy-track-grid', { onPlay: startTrack, accentColor: '#ffa800' });
        }
      }, [gameState]);

      // ------------------------------------------------------------------------
      // TELA 1: CAPA
      // ------------------------------------------------------------------------
      if (gameState === 'cover') {
        return (
          <div className="hy-stage hy-full hy-theme-safari flex flex-col items-center justify-center gap-4 p-4 text-center">
            <a href="../index.html" className="btn-back" style={{color: "#334155"}}>← Voltar</a>
            {/* Decoração Aventureira */}
            <div className="hy-deco" aria-hidden="true">
              <span style={{top:'8%', left:'6%'}}>🗺️</span>
              <span style={{top:'14%', right:'8%'}}>🦁</span>
              <span style={{top:'54%', left:'4%'}}>🦒</span>
              <span style={{bottom:'8%', left:'14%'}}>🧭</span>
              <span style={{bottom:'10%', right:'14%'}}>🚙</span>
            </div>
            <span className="hy-badge">🔍 Gramática em ação</span>
            <div className="hy-hero">🔦</div>
            <h1 className="hy-title"><span className="l1">Caçadores de</span><span className="l2">Coletivos</span></h1>
            <p className="hy-tagline">
              Pegue sua lupa e seu mapa! Vamos descobrir a palavra secreta que representa grupos inteiros!
            </p>
            <button
              onClick={() => setGameState('trackSelect')}
              className="hy-cta"
            >
              Iniciar Expedição!
            </button>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA: SELEÇÃO DE TRILHA
      // ------------------------------------------------------------------------
      if (gameState === 'trackSelect') {
        return (
          <div className="hy-stage hy-full hy-scroll hy-theme-safari flex flex-col items-center gap-5 p-6">
            <button onClick={() => setGameState('cover')} className="hy-pill-btn self-start">← Voltar</button>
            <h2 className="hy-heading">Escolha a Expedição</h2>
            <div id="hy-track-grid" style={{width:'100%',maxWidth:'720px'}}></div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA: TRILHA COMPLETA
      // ------------------------------------------------------------------------
      if (gameState === 'trackComplete') {
        return (
          <div className="hy-stage hy-full hy-theme-safari flex flex-col items-center justify-center gap-4 p-4 text-center">
            <div className="hy-deco" aria-hidden="true">
              <span style={{top:'10%', left:'8%'}}>⭐</span>
              <span style={{top:'16%', right:'9%'}}>🦁</span>
              <span style={{bottom:'12%', left:'10%'}}>🧭</span>
              <span style={{bottom:'10%', right:'12%'}}>⭐</span>
            </div>
            <div className="hy-hero pop-anim">🎖️</div>
            <h1 className="hy-title"><span className="l1">Expedição {currentTrack + 1}</span><span className="l2">Completa!</span></h1>
            <p className="hy-tagline">Você capturou todos os 5 coletivos!</p>
            <div className="hy-stars-pill"><span>⭐</span> x{stars}</div>
            <button
              onClick={() => setGameState('trackSelect')}
              className="hy-cta"
            >
              Escolher Próxima Expedição
            </button>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 3: FINAL
      // ------------------------------------------------------------------------
      if (gameState === 'complete') {
        return (
          <div className="hy-stage hy-full hy-theme-safari flex flex-col items-center justify-center gap-4 p-4 text-center">
            <div className="hy-deco" aria-hidden="true">
              <span style={{top:'10%', left:'8%'}}>⭐</span>
              <span style={{top:'16%', right:'9%'}}>🦁</span>
              <span style={{bottom:'12%', left:'10%'}}>🧭</span>
              <span style={{bottom:'10%', right:'12%'}}>⭐</span>
            </div>
            <div className="hy-hero pop-anim">🎖️</div>
            <h1 className="hy-title"><span className="l1">Você encontrou todos!</span><span className="l2">Parabéns!</span></h1>
            <p className="hy-tagline">Insígnias de Caçador: todos os coletivos raros!</p>
            <div className="hy-stars-pill"><span>⭐</span> x{stars}</div>
            <button
              onClick={() => setGameState('trackSelect')}
              className="hy-cta"
            >
              Escolher Expedição
            </button>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 2: JOGABILIDADE (Múltiplas Mecânicas)
      // ------------------------------------------------------------------------
      return (
        <div className="min-h-screen w-full flex flex-col relative safari-bg text-stone-800">

          {/* CABEÇALHO */}
          <div className="w-full h-[60px] flexjustify-between items-center p-6 z-10 bg-stone-900/80 backdrop-blur-sm shadow-lg rounded-b-3xl border-b-4 border-stone-700">
            <button onClick={() => setGameState('trackSelect')} className="bg-white text-slate-800 px-4 py-2 rounded-full font-bold">← Voltar</button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 w-full max-w-8xl mx-auto">
              <span className="text-2xl md:text-3xl font-black uppercase p-4 text-black-200 drop-shadow-md">{level.instruction}</span>
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
