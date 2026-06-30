if (window.HY && window.HY.stars) HY.stars.init('matematica-pirata');

const { useState, useEffect, useRef } = React;

    // Emojis decorativos por trilha
    const TRACK_EMOJIS = ['☠️','🪙','💎','🦜','⚓','🐙','⛵','💣','🗡️','👑','🏴‍☠️','🎲'];

    // Critérios de filtragem por trilha — ajustar conforme demanda pedagógica
    const CRITERIOS = [
      c => c.op === '+' && c.valorMax <= 10  && c.unknown === 'answer', // T1  Soma básica
      c => c.op === '-' && c.valorMax <= 10  && c.unknown === 'answer', // T2  Subtração básica
      c => c.op === '+' && c.valorMax <= 10  && c.unknown === 'answer', // T3  Soma até 10
      c =>                 c.valorMax <= 10  && c.unknown === 'n2',     // T4  Parcela oculta n2
      c =>                 c.valorMax <= 10  && c.unknown === 'n1',     // T5  Parcela oculta n1
      c => c.op === '+' && c.valorMax <= 20  && c.unknown === 'answer', // T6  Dezenas soma
      c => c.op === '-' && c.valorMax <= 20  && c.unknown === 'answer', // T7  Dezenas subtração
      c => c.op === '+' && c.valorMax <= 21  && c.unknown === 'answer', // T8  Soma mista
      c => c.op === '-' && c.valorMax <= 25  && c.unknown === 'answer', // T9  Subtração mista
      c =>                 c.valorMax <= 23  && c.unknown !== 'answer', // T10 Parcela oculta avançada
      c =>                 c.valorMax > 20   && c.unknown === 'answer', // T11 Triplo desafio
      c =>                 c.valorMax > 30   && c.unknown === 'answer', // T12 Mestre Pirata
    ];

    // --- DADOS DO JOGO ---
    const _LEVELS_LEGADO = [
      // TRILHA 1 — Soma básica
      { id: 1, n1: 4, n2: 4, op: '+', answer: 8, options: [7, 8, 9], emoji: '☠️', unknown: 'answer' },
      { id: 2, n1: 3, n2: 5, op: '+', answer: 8, options: [7, 8, 9], emoji: '🪙', unknown: 'answer' },
      { id: 3, n1: 6, n2: 2, op: '+', answer: 8, options: [7, 8, 9], emoji: '💎', unknown: 'answer' },
      { id: 4, n1: 1, n2: 7, op: '+', answer: 8, options: [6, 7, 8], emoji: '🦜', unknown: 'answer' },
      { id: 5, n1: 5, n2: 3, op: '+', answer: 8, options: [7, 8, 9], emoji: '⚓', unknown: 'answer' },
      // TRILHA 2 — Subtração básica
      { id: 6, n1: 9, n2: 4, op: '-', answer: 5, options: [4, 5, 6], emoji: '🐙', unknown: 'answer' },
      { id: 7, n1: 8, n2: 3, op: '-', answer: 5, options: [4, 5, 6], emoji: '⛵', unknown: 'answer' },
      { id: 8, n1: 7, n2: 2, op: '-', answer: 5, options: [3, 5, 7], emoji: '💣', unknown: 'answer' },
      { id: 9, n1: 10, n2: 5, op: '-', answer: 5, options: [4, 5, 6], emoji: '🗡️', unknown: 'answer' },
      { id: 10, n1: 6, n2: 1, op: '-', answer: 5, options: [4, 5, 6], emoji: '👑', unknown: 'answer' },
      // TRILHA 3 — Soma até 10
      { id: 11, n1: 5, n2: 5, op: '+', answer: 10, options: [9, 10, 11], emoji: '🏴‍☠️', unknown: 'answer' },
      { id: 12, n1: 7, n2: 3, op: '+', answer: 10, options: [9, 10, 11], emoji: '🪙', unknown: 'answer' },
      { id: 13, n1: 6, n2: 4, op: '+', answer: 10, options: [8, 10, 12], emoji: '💎', unknown: 'answer' },
      { id: 14, n1: 8, n2: 2, op: '+', answer: 10, options: [9, 10, 11], emoji: '🦜', unknown: 'answer' },
      { id: 15, n1: 9, n2: 1, op: '+', answer: 10, options: [9, 10, 11], emoji: '⚓', unknown: 'answer' },
      // TRILHA 4 — Parcela oculta (n2)
      { id: 16, n1: 3, n2: 5, op: '+', answer: 8, options: [4, 5, 6], emoji: '🦜', unknown: 'n2' },
      { id: 17, n1: 4, n2: 6, op: '+', answer: 10, options: [5, 6, 7], emoji: '💎', unknown: 'n2' },
      { id: 18, n1: 7, n2: 3, op: '+', answer: 10, options: [2, 3, 4], emoji: '🪙', unknown: 'n2' },
      { id: 19, n1: 5, n2: 4, op: '+', answer: 9, options: [3, 4, 5], emoji: '⚓', unknown: 'n2' },
      { id: 20, n1: 6, n2: 5, op: '+', answer: 11, options: [4, 5, 6], emoji: '🏴‍☠️', unknown: 'n2' },
      // TRILHA 5 — Parcela oculta (n1)
      { id: 21, n1: 9, n2: 4, op: '-', answer: 5, options: [8, 9, 10], emoji: '💎', unknown: 'n1' },
      { id: 22, n1: 8, n2: 3, op: '-', answer: 5, options: [7, 8, 9], emoji: '🦜', unknown: 'n1' },
      { id: 23, n1: 10, n2: 6, op: '-', answer: 4, options: [9, 10, 11], emoji: '🪙', unknown: 'n1' },
      { id: 24, n1: 7, n2: 2, op: '-', answer: 5, options: [6, 7, 8], emoji: '⚓', unknown: 'n1' },
      { id: 25, n1: 11, n2: 5, op: '-', answer: 6, options: [10, 11, 12], emoji: '🏴‍☠️', unknown: 'n1' },
      // TRILHA 6 — Dezenas (soma)
      { id: 26, n1: 12, n2: 4, op: '+', answer: 16, options: [15, 16, 17], emoji: '🪙', unknown: 'answer' },
      { id: 27, n1: 13, n2: 5, op: '+', answer: 18, options: [17, 18, 19], emoji: '💎', unknown: 'answer' },
      { id: 28, n1: 11, n2: 7, op: '+', answer: 18, options: [17, 18, 19], emoji: '🦜', unknown: 'answer' },
      { id: 29, n1: 14, n2: 4, op: '+', answer: 18, options: [16, 18, 20], emoji: '⚓', unknown: 'answer' },
      { id: 30, n1: 10, n2: 9, op: '+', answer: 19, options: [18, 19, 20], emoji: '🏴‍☠️', unknown: 'answer' },
      // TRILHA 7 — Dezenas (subtração)
      { id: 31, n1: 15, n2: 3, op: '-', answer: 12, options: [11, 12, 13], emoji: '🪙', unknown: 'answer' },
      { id: 32, n1: 18, n2: 8, op: '-', answer: 10, options: [9, 10, 11], emoji: '💎', unknown: 'answer' },
      { id: 33, n1: 16, n2: 6, op: '-', answer: 10, options: [8, 10, 12], emoji: '🦜', unknown: 'answer' },
      { id: 34, n1: 20, n2: 8, op: '-', answer: 12, options: [11, 12, 13], emoji: '⚓', unknown: 'answer' },
      { id: 35, n1: 17, n2: 5, op: '-', answer: 12, options: [11, 12, 13], emoji: '🏴‍☠️', unknown: 'answer' },
      // TRILHA 8 — Soma mista (múltiplas estratégias)
      { id: 36, n1: 9, n2: 9, op: '+', answer: 18, options: [17, 18, 19], emoji: '🎲', unknown: 'answer' },
      { id: 37, n1: 15, n2: 6, op: '+', answer: 21, options: [19, 21, 23], emoji: '🪙', unknown: 'answer' },
      { id: 38, n1: 13, n2: 8, op: '+', answer: 21, options: [20, 21, 22], emoji: '💎', unknown: 'answer' },
      { id: 39, n1: 6, n2: 6, op: '+', answer: 12, options: [11, 12, 13], emoji: '🦜', unknown: 'answer' },
      { id: 40, n1: 8, n2: 8, op: '+', answer: 16, options: [15, 16, 17], emoji: '⚓', unknown: 'answer' },
      // TRILHA 9 — Subtração mista
      { id: 41, n1: 20, n2: 7, op: '-', answer: 13, options: [12, 13, 14], emoji: '🏴‍☠️', unknown: 'answer' },
      { id: 42, n1: 25, n2: 10, op: '-', answer: 15, options: [14, 15, 16], emoji: '🪙', unknown: 'answer' },
      { id: 43, n1: 22, n2: 9, op: '-', answer: 13, options: [12, 13, 14], emoji: '💎', unknown: 'answer' },
      { id: 44, n1: 18, n2: 5, op: '-', answer: 13, options: [12, 13, 14], emoji: '🦜', unknown: 'answer' },
      { id: 45, n1: 30, n2: 15, op: '-', answer: 15, options: [14, 15, 16], emoji: '⚓', unknown: 'answer' },
      // TRILHA 10 — Parcela oculta avançada
      { id: 46, n1: 8, n2: 10, op: '+', answer: 18, options: [9, 10, 11], emoji: '🏴‍☠️', unknown: 'n2' },
      { id: 47, n1: 15, n2: 8, op: '+', answer: 23, options: [7, 8, 9], emoji: '🪙', unknown: 'n2' },
      { id: 48, n1: 20, n2: 15, op: '-', answer: 5, options: [19, 20, 21], emoji: '💎', unknown: 'n1' },
      { id: 49, n1: 25, n2: 12, op: '-', answer: 13, options: [24, 25, 26], emoji: '🦜', unknown: 'n1' },
      { id: 50, n1: 12, n2: 8, op: '+', answer: 20, options: [7, 8, 9], emoji: '⚓', unknown: 'n2' },
      // TRILHA 11 — Triplo desafio
      { id: 51, n1: 25, n2: 8, op: '+', answer: 33, options: [31, 33, 35], emoji: '🏴‍☠️', unknown: 'answer' },
      { id: 52, n1: 30, n2: 12, op: '+', answer: 42, options: [40, 42, 44], emoji: '🪙', unknown: 'answer' },
      { id: 53, n1: 28, n2: 9, op: '+', answer: 37, options: [35, 37, 39], emoji: '💎', unknown: 'answer' },
      { id: 54, n1: 35, n2: 15, op: '-', answer: 20, options: [18, 20, 22], emoji: '🦜', unknown: 'answer' },
      { id: 55, n1: 40, n2: 18, op: '-', answer: 22, options: [20, 22, 24], emoji: '⚓', unknown: 'answer' },
      // TRILHA 12 — Mestre Pirata
      { id: 56, n1: 45, n2: 25, op: '-', answer: 20, options: [18, 20, 22], emoji: '🏴‍☠️', unknown: 'answer' },
      { id: 57, n1: 50, n2: 30, op: '-', answer: 20, options: [18, 20, 22], emoji: '🪙', unknown: 'answer' },
      { id: 58, n1: 38, n2: 18, op: '-', answer: 20, options: [19, 20, 21], emoji: '💎', unknown: 'answer' },
      { id: 59, n1: 15, n2: 25, op: '+', answer: 40, options: [38, 40, 42], emoji: '🦜', unknown: 'answer' },
      { id: 60, n1: 20, n2: 20, op: '+', answer: 40, options: [38, 40, 42], emoji: '👑', unknown: 'answer' },
    ];

    function App() {
      const trackChallengesRef = useRef([]);

      // Estados
      const [gameState, setGameState] = useState('cover'); // cover, trackSelect, playing, trackComplete
      const [currentTrack, setCurrentTrack] = useState(0);
      const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
      const [coins, setCoins] = useState(0);

      const [draggedOption, setDraggedOption] = useState(null);
      const [isSuccess, setIsSuccess] = useState(false);
      const [shakeWrong, setShakeWrong] = useState(false);
      const [animateCoin, setAnimateCoin] = useState(false);
      const [wrongAnswers, setWrongAnswers] = useState([]);

      const level = trackChallengesRef.current[currentPhaseIndex % 5] || {};

      const startTrack = (trackIdx) => {
        const raw = HY.rand.pick(HY.rand.NUMEROS.filter(CRITERIOS[trackIdx]), 5);
        trackChallengesRef.current = raw.map(c => ({ ...c, emoji: TRACK_EMOJIS[trackIdx] }));
        setCurrentTrack(trackIdx);
        setCurrentPhaseIndex(0);
        setCoins(0);
        setGameState('playing');
        HY.score.reset();
        setIsSuccess(false);
        setWrongAnswers([]);
        setDraggedOption(null);
        setShakeWrong(false);
        HY.score.startChallenge();
      };

      useEffect(() => {
        if (gameState === 'trackSelect' && window.HY && window.HY.stars) {
          HY.stars.renderGrid('hy-track-grid', { onPlay: startTrack, accentColor: '#fbbf24' });
        }
      }, [gameState]);

      const resetTurn = () => {
        setIsSuccess(false);
        setWrongAnswers([]);
        setDraggedOption(null);
        HY.score.startChallenge();
      };

      // --- Lógica de Validação ---
      const checkAnswer = (value) => {
        if (isSuccess || wrongAnswers.includes(value)) return;

        // O valor correto agora depende de qual parcela está oculta (n1, n2 ou answer)
        const expectedValue = level[level.unknown || 'answer'];

        if (value === expectedValue) {
          // Acertou!
          HY.playWin();
          HY.score.correct();
          setIsSuccess(true);
          setCoins(prev => prev + 1);
          setAnimateCoin(true);
          setTimeout(() => setAnimateCoin(false), 600);

          setTimeout(() => {
            if (currentPhaseIndex + 1 < 5) {
              setCurrentPhaseIndex(prev => prev + 1);
              setIsSuccess(false);
              setWrongAnswers([]);
              setDraggedOption(null);
              setShakeWrong(false);
              HY.score.startChallenge();
            } else {
              if (window.HY && window.HY.stars) HY.stars.trackComplete(currentTrack);
              HY.elapsed.stopTrail();
              setGameState('trackComplete');
            }
          }, 2000); // 2 segundos para ver a animação de sucesso
        } else {
          // Errou
          HY.playLose();
          HY.score.wrong();
          setWrongAnswers(prev => [...prev, value]);
          setShakeWrong(true);
          setTimeout(() => setShakeWrong(false), 400);
        }
      };

      // --- Drag & Drop ---
      const handleDragStart = (e, value) => {
        setDraggedOption(value);
        e.dataTransfer.setData('text/plain', value);
      };

      const handleDragOver = (e) => {
        e.preventDefault();
      };

      const handleDrop = (e) => {
        e.preventDefault();
        const value = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(value)) {
          checkAnswer(value);
        }
      };

      // Componente que desenha as grelhas com as carinhas/icones
      const RenderVisualItems = ({ count, emoji }) => {
        // Mecânica 12: Agrupamento em Dezenas (Baús)
        if (count >= 10) {
          const tens = Math.floor(count / 10);
          const ones = count % 10;
          return (
            <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-1 md:gap-2 relative">
              <div className="flex gap-1 md:gap-2">
                {Array.from({ length: tens }).map((_, i) => (
                  <span key={`t-${i}`} className="text-4xl md:text-6xl lg:text-7xl drop-shadow-md pop-anim" style={{animationDelay: `${i * 0.05}s`}} title="1 Baú = 10">
                    🧰
                  </span>
                ))}
              </div>
              {ones > 0 && (
                <div className="flex flex-wrap justify-center gap-1 md:gap-2 max-w-[90%]">
                  {Array.from({ length: ones }).map((_, i) => (
                    <span key={`o-${i}`} className="text-2xl md:text-4xl lg:text-5xl drop-shadow-md pop-anim" style={{animationDelay: `${(tens + i) * 0.05}s`}}>
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
              {/* Dica visual do número para ajudar na Base 10 */}
              <div className="absolute top-2 right-2 text-xs md:text-sm font-bold text-gray-400 bg-gray-100 rounded-full px-2 border-2 border-gray-200">
                {count}
              </div>
            </div>
          );
        }

        // Grade normal para quantidades < 10
        return (
          <div className={`grid gap-1 md:gap-2 place-items-center w-full h-full p-2 ${
            count <= 4 ? 'grid-cols-2 grid-rows-2' :
            count <= 6 ? 'grid-cols-3 grid-rows-2' :
            'grid-cols-3 grid-rows-3'
          }`}>
            {Array.from({ length: count }).map((_, i) => (
              <span key={i} className="text-3xl md:text-5xl lg:text-6xl drop-shadow-md pop-anim" style={{animationDelay: `${i * 0.05}s`}}>
                {emoji}
              </span>
            ))}
          </div>
        );
      };

      // Componente: Caixa de Soltar (Dropzone) Dinâmica
      const Dropzone = () => {
        const expectedValue = level[level.unknown || 'answer'];
        return (
          <div
            className={`rounded-3xl border-4 md:border-8 w-28 h-28 md:w-48 md:h-48 lg:w-64 lg:h-64 shadow-xl flex items-center justify-center transition-all ${
              isSuccess ? 'bg-green-400 border-green-600 pop-anim' : 'bg-white border-indigo-900 border-dashed'
            } ${shakeWrong ? 'shake-anim border-red-500 bg-red-50' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isSuccess ? (
              <span className="text-[5rem] md:text-[8rem] lg:text-[10rem] font-black text-white drop-shadow-lg leading-none">
                {expectedValue}
              </span>
            ) : (
              <span className="text-indigo-200 text-[4rem] md:text-[6rem] opacity-40 font-black animate-pulse">?</span>
            )}
          </div>
        );
      };

      // Componente: Caixa Estática (Exibe o que já é conhecido)
      const StaticBox = ({ value }) => (
        <div className="bg-white rounded-3xl border-4 md:border-8 border-indigo-900 w-28 h-28 md:w-48 md:h-48 lg:w-64 lg:h-64 shadow-xl flex items-center justify-center overflow-hidden">
          <RenderVisualItems count={value} emoji={level.emoji} />
        </div>
      );

      // ------------------------------------------------------------------------
      // TELA 1: CAPA
      // ------------------------------------------------------------------------
      if (gameState === 'cover') {
        return (
          <div className="min-h-screen bg-sky-300 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <a href="../index.html" className="absolute top-4 left-4 text-blue-100 hover:text-blue-300 font-bold bg-blue-900/80 hover:bg-blue-800 px-4 py-2 rounded-full transition-colors z-20 border-2 border-blue-400">◀ Voltar</a>
            {/* Decoração Fundo */}
            <div className="absolute top-10 left-10 text-8xl opacity-50">☁️</div>
            <div className="absolute top-20 right-20 text-8xl opacity-50">☁️</div>

            {/* Mar */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 sea-bg flex items-end justify-center pb-10">
              <div className="text-8xl md:text-[10rem] animate-pulse">⛵</div>
            </div>

            <div className="bg-white/95 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center z-10 max-w-lg w-full border-8 border-indigo-900 mb-20">
              <div className="text-8xl mb-4">🏴‍☠️</div>
              <h1 className="text-5xl font-black text-indigo-900 mb-2 tracking-tight leading-tight uppercase">
                Matemática<br/><span className="text-4xl text-sky-500">Pirata!</span>
              </h1>
              <p className="text-gray-600 mb-8 text-xl font-bold">Vamos contar o tesouro?</p>

              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-yellow-400 hover:bg-yellow-500 text-indigo-900 rounded-3xl text-3xl font-black transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(180,83,9)] hover:shadow-[0_4px_0_rgb(180,83,9)] hover:translate-y-1 active:shadow-none active:translate-y-2 uppercase"
              >
                Jogar!
              </button>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 1B: SELEÇÃO DE TRILHA
      // ------------------------------------------------------------------------
      if (gameState === 'trackSelect') {
        return (
          <div key="trackSelect" className="min-h-screen flex flex-col items-center justify-center p-6 bg-blue-950">
            <h2 className="text-4xl font-black text-yellow-400 mb-8 uppercase">⚓ Escolha a Ilha</h2>
            <div id="hy-track-grid" style={{width:'100%', maxWidth:'720px'}}></div>
            <button onClick={() => setGameState('cover')} className="mt-8 bg-blue-800 text-white px-8 py-3 rounded-full font-black">← Voltar</button>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 3: TRILHA COMPLETA
      // ------------------------------------------------------------------------
      if (gameState === 'trackComplete') {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-blue-950 text-white text-center">
            <div className="text-8xl mb-4">🏴‍☠️</div>
            <h1 className="text-5xl font-black text-yellow-400 mb-2">Ilha {currentTrack + 1} Conquistada!</h1>
            <p className="text-2xl mb-8 text-blue-200">5 desafios superados!</p>
            <div className="flex gap-4">
              <button onClick={() => setGameState('trackSelect')} className="bg-blue-700 text-white px-8 py-4 rounded-3xl text-xl font-black">Mapa</button>
              {currentTrack + 1 < 12 && <button onClick={() => startTrack(currentTrack + 1)} className="bg-yellow-400 text-blue-950 px-8 py-4 rounded-3xl text-xl font-black">Próxima! →</button>}
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 2: JOGABILIDADE (LAYOUT BASEADO NA IMAGEM)
      // ------------------------------------------------------------------------
      return (
        <div className="h-screen w-full flex flex-col relative bg-sky-200">

          {/* Nuvens de fundo decorativas */}
          <div className="absolute top-8 left-[10%] text-white opacity-80" style={{fontSize: '8rem'}}>☁️</div>
          <div className="absolute top-4 right-[20%] text-white opacity-80" style={{fontSize: '10rem'}}>☁️</div>

          {/* CABEÇALHO */}
          <div className="w-full flex justify-between items-center p-6 md:p-8 z-10">

            {/* Contador de Moedas */}
            <div className="flex items-center text-3xl md:text-4xl font-black text-yellow-400 drop-shadow-sm">
              <span className={`mr-2 transition-all ${animateCoin ? 'text-yellow-500 scale-125' : ''}`}>
                x{coins}
              </span>
              <span className={`text-5xl md:text-6xl ${animateCoin ? 'coin-anim' : ''}`}>💰</span>
            </div>
          </div>

          {/* ÁREA DA EQUAÇÃO (CENTRO DO CÉU) */}
          <div className="flex-1 flex items-center justify-center z-10 w-full px-2 mt-[-5vh]">
            <div className="flex flex-row items-center justify-center gap-2 md:gap-6 w-full max-w-5xl">

              {/* Caixa 1: N1 */}
              {(level.unknown === 'n1') ? <Dropzone /> : <StaticBox value={level.n1} />}

              {/* Operador matemático */}
              <div className="text-5xl md:text-7xl lg:text-9xl font-black text-indigo-900 drop-shadow-md pb-2">
                {level.op}
              </div>

              {/* Caixa 2: N2 */}
              {(level.unknown === 'n2') ? <Dropzone /> : <StaticBox value={level.n2} />}

              {/* Sinal de Igual */}
              <div className="text-5xl md:text-7xl lg:text-9xl font-black text-indigo-900 drop-shadow-md pb-2">
                =
              </div>

              {/* Caixa 3: Resposta */}
              {(level.unknown === 'answer' || !level.unknown) ? <Dropzone /> : <StaticBox value={level.answer} />}

            </div>
          </div>

          {/* ÁREA DO MAR (BOTÕES DE OPÇÕES NA PARTE INFERIOR) */}
          <div className="h-[35vh] md:h-[40vh] w-full sea-bg flex items-center justify-center relative shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] border-t-[6px] border-[#81e6d9]/30">

            {/* Detalhes das ondas no mar */}
            <div className="sea-line w-32 h-2 top-8 left-10"></div>
            <div className="sea-line w-48 h-2 top-20 right-20"></div>
            <div className="sea-line w-24 h-2 bottom-12 left-1/4"></div>
            <div className="sea-line w-64 h-2 bottom-8 right-1/3"></div>

            <div className="flex flex-row justify-center gap-4 md:gap-8 lg:gap-12 w-full max-w-4xl px-4 z-10 relative mt-4 md:mt-8">
              {level.options.map((opt, i) => {
                const isWrong = wrongAnswers.includes(opt);

                // Usando a cor baseada na imagem (um roxo/magenta escuro)
                let btnClass = "bg-[#6A045E] hover:bg-[#8B0A7A] border-b-[8px] md:border-b-[12px] border-[#4A0241] text-white cursor-grab active:cursor-grabbing hover:-translate-y-2 hover:shadow-2xl";

                if (isWrong) {
                  btnClass = "bg-gray-400 text-gray-200 border-b-[8px] md:border-b-[12px] border-gray-500 opacity-50 cursor-not-allowed transform translate-y-4";
                } else if (isSuccess) {
                  btnClass = "bg-[#6A045E] border-[#4A0241] opacity-50 cursor-not-allowed";
                }

                return (
                  <button
                    key={i}
                    draggable={!isWrong && !isSuccess}
                    onDragStart={(e) => handleDragStart(e, opt)}
                    onClick={() => checkAnswer(opt)} // Permite o clique como alternativa ao arrasto
                    disabled={isWrong || isSuccess}
                    className={`w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center transition-all duration-300 shadow-xl ${btnClass}`}
                  >
                    <span className="text-[5rem] md:text-[7rem] lg:text-[8rem] font-black drop-shadow-md leading-none mt-2">
                      {opt}
                    </span>
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
