const { useState, useEffect, useRef } = React;

if (window.HY && window.HY.stars) HY.stars.init('canhoes-ouro');

    // Texto de tarefa por trilha (decorativo)
    const TRACK_TASKS = [
      'Soma as moedas!', 'Retira as joias!', 'Adição até 10!', 'Subtração até 10!',
      'Parcela oculta!', 'Grande Tesouro!', 'Esvazia o barril!', 'Somas maiores!',
      'Joias Brilhantes!', 'Ataque Pesado!', 'Desafio avançado!', 'Mestre do Tesouro!',
    ];

    // Critérios de filtragem por trilha — ajustar conforme demanda pedagógica
    const CRITERIOS = [
      c => c.op === '+' && c.valorMax <= 10  && c.unknown === 'answer', // T1  Adição simples
      c => c.op === '-' && c.valorMax <= 10  && c.unknown === 'answer', // T2  Subtração simples
      c => c.op === '+' && c.valorMax <= 10  && c.unknown === 'answer', // T3  Adição até 10
      c => c.op === '-' && c.valorMax <= 10  && c.unknown === 'answer', // T4  Subtração até 10
      c =>                 c.valorMax <= 10  && c.unknown !== 'answer', // T5  Parcela oculta
      c => c.op === '+' && c.valorMax <= 20  && c.unknown === 'answer', // T6  Dezenas soma
      c => c.op === '-' && c.valorMax <= 20  && c.unknown === 'answer', // T7  Dezenas subtração
      c => c.op === '+' && c.valorMax <= 21  && c.unknown === 'answer', // T8  Somas maiores
      c => c.op === '+' && c.valorMax <= 18  && c.unknown === 'answer', // T9  Joias (result ≤ 18)
      c => c.op === '-' && c.valorMax <= 30  && c.unknown === 'answer', // T10 Ataque Pesado
      c =>                 c.valorMax > 20   && c.unknown === 'answer', // T11 Desafio avançado
      c =>                 c.valorMax > 30   && c.unknown === 'answer', // T12 Mestre
    ];

    // Dados legado preservados (não utilizados na execução):
    const _LEVELS_LEGADO = [
      // TRILHA 1 - Adição simples
      { id: 1, n1: 2, n2: 3, op: '+', ans: 5, options: [4, 5, 6], task: "Soma as moedas!" },
      { id: 2, n1: 4, n2: 1, op: '+', ans: 5, options: [5, 3, 7], task: "Junta as joias!" },
      { id: 3, n1: 1, n2: 6, op: '+', ans: 7, options: [6, 7, 8], task: "Conta o tesouro!" },
      { id: 4, n1: 3, n2: 4, op: '+', ans: 7, options: [6, 7, 8], task: "Soma as moedas!" },
      { id: 5, n1: 5, n2: 2, op: '+', ans: 7, options: [5, 6, 7], task: "Calcula o ouro!" },
      // TRILHA 2 - Subtração simples
      { id: 6, n1: 8, n2: 3, op: '-', ans: 5, options: [4, 5, 6], task: "Retira as joias!" },
      { id: 7, n1: 9, n2: 4, op: '-', ans: 5, options: [3, 5, 7], task: "Paga o pirata!" },
      { id: 8, n1: 7, n2: 2, op: '-', ans: 5, options: [4, 5, 6], task: "Subtrai o tesouro!" },
      { id: 9, n1: 10, n2: 3, op: '-', ans: 7, options: [6, 7, 8], task: "Calcula o troco!" },
      { id: 10, n1: 6, n2: 1, op: '-', ans: 5, options: [4, 5, 6], task: "Retira as moedas!" },
      // TRILHA 3 - Adição até 10
      { id: 11, n1: 5, n2: 5, op: '+', ans: 10, options: [9, 10, 11], task: "Tesouro Dobrado!" },
      { id: 12, n1: 7, n2: 3, op: '+', ans: 10, options: [9, 10, 11], task: "Soma total!" },
      { id: 13, n1: 6, n2: 4, op: '+', ans: 10, options: [8, 10, 12], task: "Junta tudo!" },
      { id: 14, n1: 8, n2: 2, op: '+', ans: 10, options: [9, 10, 11], task: "O baú está cheio!" },
      { id: 15, n1: 9, n2: 1, op: '+', ans: 10, options: [9, 10, 11], task: "Conta as moedas!" },
      // TRILHA 4 - Subtração até 10
      { id: 16, n1: 10, n2: 4, op: '+', ans: 14, options: [12, 14, 16], task: "Dezenas e Unidades" },
      { id: 17, n1: 10, n2: 7, op: '-', ans: 3, options: [2, 3, 4], task: "Sobra quanto?" },
      { id: 18, n1: 10, n2: 5, op: '-', ans: 5, options: [4, 5, 6], task: "Metade do tesouro!" },
      { id: 19, n1: 10, n2: 6, op: '-', ans: 4, options: [3, 4, 5], task: "Paga o mapa!" },
      { id: 20, n1: 10, n2: 8, op: '-', ans: 2, options: [1, 2, 3], task: "Calcula o resto!" },
      // TRILHA 5 - Parcela oculta (álgebra inicial)
      { id: 21, n1: 3, n2: null, op: '+', ans: 8, missing: 'n2', options: [4, 5, 6], task: "Quem falta no canhão?" },
      { id: 22, n1: null, n2: 5, op: '+', ans: 9, missing: 'n1', options: [3, 4, 5], task: "Qual era o tesouro?" },
      { id: 23, n1: 7, n2: null, op: '-', ans: 3, missing: 'n2', options: [3, 4, 5], task: "Quantas foram gastas?" },
      { id: 24, n1: null, n2: 4, op: '+', ans: 10, missing: 'n1', options: [5, 6, 7], task: "Quem falta no baú?" },
      { id: 25, n1: 6, n2: null, op: '+', ans: 11, missing: 'n2', options: [4, 5, 6], task: "Encontra a moeda!" },
      // TRILHA 6 - Adição com dezenas
      { id: 26, n1: 12, n2: 6, op: '+', ans: 18, options: [16, 18, 20], task: "Grande Tesouro!" },
      { id: 27, n1: 11, n2: 7, op: '+', ans: 18, options: [17, 18, 19], task: "Soma o ouro!" },
      { id: 28, n1: 13, n2: 5, op: '+', ans: 18, options: [16, 18, 20], task: "Baú de moedas!" },
      { id: 29, n1: 10, n2: 9, op: '+', ans: 19, options: [18, 19, 20], task: "Junta os tesouros!" },
      { id: 30, n1: 14, n2: 4, op: '+', ans: 18, options: [16, 18, 20], task: "Conta tudo!" },
      // TRILHA 7 - Subtração com dezenas
      { id: 31, n1: 15, n2: 5, op: '-', ans: 10, options: [9, 10, 11], task: "Esvazia o barril!" },
      { id: 32, n1: 18, n2: 8, op: '-', ans: 10, options: [9, 10, 11], task: "Paga o capitão!" },
      { id: 33, n1: 16, n2: 6, op: '-', ans: 10, options: [8, 10, 12], task: "Retira joias!" },
      { id: 34, n1: 17, n2: 7, op: '-', ans: 10, options: [9, 10, 11], task: "Sobra o tesouro!" },
      { id: 35, n1: 19, n2: 9, op: '-', ans: 10, options: [9, 10, 11], task: "Calcula o resto!" },
      // TRILHA 8 - Somas maiores
      { id: 36, n1: 9, n2: 4, op: '-', ans: 5, options: [4, 5, 6], task: "Limpar o convés" },
      { id: 37, n1: 15, n2: 6, op: '+', ans: 21, options: [19, 21, 23], task: "Tesouro maior!" },
      { id: 38, n1: 13, n2: 8, op: '+', ans: 21, options: [20, 21, 22], task: "Soma o ouro pirata!" },
      { id: 39, n1: 16, n2: 5, op: '+', ans: 21, options: [19, 21, 23], task: "Junta os cofres!" },
      { id: 40, n1: 14, n2: 7, op: '+', ans: 21, options: [20, 21, 22], task: "Ouro acumulado!" },
      // TRILHA 9 - Joias Brilhantes
      { id: 41, n1: 8, n2: 7, op: '+', ans: 15, options: [14, 15, 16], task: "Joias Brilhantes" },
      { id: 42, n1: 9, n2: 6, op: '+', ans: 15, options: [13, 15, 17], task: "Conta as gemas!" },
      { id: 43, n1: 7, n2: 8, op: '+', ans: 15, options: [14, 15, 16], task: "Rubis e esmeraldas!" },
      { id: 44, n1: 10, n2: 5, op: '+', ans: 15, options: [13, 15, 17], task: "Diamantes!" },
      { id: 45, n1: 11, n2: 4, op: '+', ans: 15, options: [14, 15, 16], task: "Ouro em pépita!" },
      // TRILHA 10 - Ataque Pesado
      { id: 46, n1: 20, n2: 10, op: '-', ans: 10, options: [8, 10, 12], task: "Ataque Pesado!" },
      { id: 47, n1: 25, n2: 15, op: '-', ans: 10, options: [9, 10, 11], task: "Perdas de guerra!" },
      { id: 48, n1: 30, n2: 20, op: '-', ans: 10, options: [8, 10, 12], task: "Saques do pirata!" },
      { id: 49, n1: 22, n2: 12, op: '-', ans: 10, options: [9, 10, 11], task: "Retira o tributo!" },
      { id: 50, n1: 18, n2: 8, op: '-', ans: 10, options: [9, 10, 11], task: "Paga a tripulação!" },
      // TRILHA 11 - Desafio avançado
      { id: 51, n1: 25, n2: 8, op: '+', ans: 33, options: [31, 33, 35], task: "Acúmulo de riqueza!" },
      { id: 52, n1: 30, n2: 12, op: '+', ans: 42, options: [40, 42, 44], task: "Grande tesouro!" },
      { id: 53, n1: 28, n2: 9, op: '+', ans: 37, options: [35, 37, 39], task: "Soma o espólio!" },
      { id: 54, n1: null, n2: 15, op: '+', ans: 30, missing: 'n1', options: [13, 15, 17], task: "Quem faltava?" },
      { id: 55, n1: 40, n2: null, op: '-', ans: 25, missing: 'n2', options: [13, 15, 17], task: "Quantas gastaste?" },
      // TRILHA 12 - Mestre do Tesouro
      { id: 56, n1: 35, n2: 15, op: '-', ans: 20, options: [18, 20, 22], task: "Divide o tesouro!" },
      { id: 57, n1: 45, n2: 25, op: '-', ans: 20, options: [18, 20, 22], task: "Paga os piratas!" },
      { id: 58, n1: 50, n2: 30, op: '-', ans: 20, options: [18, 20, 22], task: "Retira do cofre!" },
      { id: 59, n1: 38, n2: 18, op: '-', ans: 20, options: [19, 20, 21], task: "Sobra do tesouro!" },
      { id: 60, n1: 42, n2: 22, op: '-', ans: 20, options: [18, 20, 22], task: "Mestre do Ouro!" },
    ];

    function App() {
      const trackChallengesRef = useRef([]);

      // --- Estados Principais ---
      const [gameState, setGameState] = useState('cover'); // cover, trackSelect, playing, trackComplete
      const [firing, setFiring] = useState(false);
      const [hit, setHit] = useState(false);
      const [wrong, setWrong] = useState([]);

      // --- Estados de Progresso (Trilhas) ---
      const [currentTrack, setCurrentTrack] = useState(0);
      const [challengeInTrack, setChallengeInTrack] = useState(0);

      const ballRef = useRef(null);
      const cannonRef = useRef(null);
      const targetRef = useRef(null);

      const level = trackChallengesRef.current[challengeInTrack] || {};

      const startTrack = (trackIdx) => {
        const raw = HY.rand.pick(HY.rand.NUMEROS.filter(CRITERIOS[trackIdx]), 5);
        trackChallengesRef.current = raw.map(c => ({ ...c, task: TRACK_TASKS[trackIdx] }));
        setCurrentTrack(trackIdx);
        setChallengeInTrack(0);
        setWrong([]); setFiring(false); setHit(false);
        HY.score.reset();
        HY.score.startChallenge();
        setGameState('playing');
      };

      useEffect(() => {
        if (gameState === 'trackSelect' && window.HY && window.HY.stars) {
          HY.stars.renderGrid('hy-track-grid', { onPlay: startTrack, accentColor: '#fbbf24' });
        }
      }, [gameState]);

      const playTone = (freq, type = 'sine', duration = 0.1) => {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
          osc.connect(gain); gain.connect(audioCtx.destination);
          osc.start(); osc.stop(audioCtx.currentTime + duration);
        } catch(e) {}
      };

      const checkAnswer = (val) => {
        if (firing || hit) return;
        const expected = level.unknown === 'n2' ? level.answerwer - level.n1 : level.unknown === 'n1' ? level.answerwer - level.n2 : level.answerwer;

        if (val === expected) {
          animateShot();
        } else {
          HY.playLose();
          HY.score.wrong();
          setWrong(prev => [...prev, val]);
          playTone(150, 'sawtooth', 0.3);
        }
      };

      const animateShot = () => {
        setFiring(true);
        playTone(100, 'sine', 0.5);

        const ball = ballRef.current;
        const cannon = cannonRef.current.getBoundingClientRect();
        const target = targetRef.current.getBoundingClientRect();

        const startX = cannon.right - 10;
        const startY = cannon.top + cannon.height / 2;
        const endX = target.left + target.width / 2;
        const endY = target.top + target.height / 2;

        ball.style.display = 'block';
        const startTime = performance.now();
        const duration = 900;
        const peakHeight = 180;

        function update(time) {
          const elapsed = time - startTime;
          const t = Math.min(elapsed / duration, 1);
          const x = startX + (endX - startX) * t;
          const y = startY + (endY - startY) * t - Math.sin(t * Math.PI) * peakHeight;
          ball.style.left = `${x}px`;
          ball.style.top = `${y}px`;

          if (t < 1) {
            requestAnimationFrame(update);
          } else {
            ball.style.display = 'none';
            setHit(true);
            playTone(400, 'square', 0.2);

            // Lógica de Estrelas (3 estrelas se não errou nada, 2 se errou 1, 1 se errou mais)
            const earnedStars = Math.max(1, 3 - wrong.length);

            setTimeout(() => {
              HY.playWin();
              HY.score.correct();
              if (challengeInTrack + 1 < 5) {
                setChallengeInTrack(prev => prev + 1);
                setWrong([]); setFiring(false); setHit(false);
                HY.score.startChallenge();
              } else {
                if (window.HY && window.HY.stars) HY.stars.trackComplete(currentTrack);
                HY.elapsed.stopTrail();
                setGameState('trackComplete');
              }
            }, 1000);
          }
        }
        requestAnimationFrame(update);
      };

      const VisualItems = ({ count }) => {
        if (count === null || count === undefined) return null;
        if (count >= 10) {
          return (
            <div className="flex flex-wrap justify-center gap-1 max-w-[120px]">
              {Array.from({ length: Math.floor(count/10) }).map((_, i) => <span key={`t-${i}`} className="text-3xl md:text-4xl drop-shadow">🧰</span>)}
              {Array.from({ length: count % 10 }).map((_, i) => <span key={`o-${i}`} className="text-xl md:text-2xl drop-shadow">🪙</span>)}
            </div>
          );
        }
        return (
          <div className="flex flex-wrap justify-center gap-1 max-w-[120px]">
            {Array.from({ length: count }).map((_, i) => <span key={i} className="text-2xl md:text-3xl drop-shadow">💎</span>)}
          </div>
        );
      };

      // --- TELA DE CAPA ---
      if (gameState === 'cover') {
        return (
          <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-sky-300">
            <div className="mb-8 text-[8rem] md:text-[10rem] animate-bounce">🏴‍☠️</div>
            <h1 className="text-5xl md:text-7xl font-black text-indigo-900 mb-4 uppercase tracking-tighter">Canhões de Ouro</h1>
            <p className="text-xl md:text-2xl text-indigo-700 font-bold mb-10">O Mapa do Tesouro espera por ti!</p>
            <button
              onClick={() => { playTone(500); setGameState('trackSelect'); }}
              className="bg-yellow-400 text-indigo-900 px-12 py-6 rounded-full text-3xl md:text-4xl font-black shadow-[0_10px_0_#b45309] hover:translate-y-1 hover:shadow-[0_5px_0_#b45309] active:translate-y-2 active:shadow-none transition-all uppercase"
            >
              Abrir Mapa
            </button>
          </div>
        );
      }

      // --- TELA DE SELECÇÃO DE TRILHAS ---
      if (gameState === 'trackSelect') {
        return (
          <div key="trackSelect" className="h-screen flex flex-col items-center p-6 bg-sky-300">
            <div className="w-full max-w-4xl flex justify-between items-center mb-8">
              <button onClick={() => setGameState('cover')} className="bg-indigo-900 text-white p-4 rounded-full shadow-lg">🏠</button>
              <h2 className="text-4xl font-black text-indigo-900 uppercase">Mapa das Ilhas</h2>
            </div>
            <div id="hy-track-grid" style={{width:'100%', maxWidth:'720px'}}></div>
          </div>
        );
      }

      // --- TELA DE TRILHA CONCLUÍDA ---
      if (gameState === 'trackComplete') {
        return (
          <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-indigo-900/90 text-white backdrop-blur-md">
            <div className="mb-6 text-9xl animate-bounce">⚓</div>
            <h1 className="text-5xl font-black mb-2">Ilha {currentTrack + 1} Conquistada!</h1>
            <p className="text-2xl mb-12">5 canhonadas certeiras!</p>
            <div className="flex gap-6">
              <button onClick={() => setGameState('trackSelect')} className="bg-zinc-700 text-white px-8 py-5 rounded-3xl text-2xl font-black shadow-[0_8px_0_#000]">Mapa</button>
              {currentTrack + 1 < 12 && <button onClick={() => startTrack(currentTrack + 1)} className="bg-yellow-400 text-indigo-900 px-12 py-5 rounded-3xl text-3xl font-black shadow-[0_8px_0_#b45309]">Próxima!</button>}
            </div>
          </div>
        );
      }

      // --- TELA DE JOGO ---
      return (
        <div className="h-screen w-full flex flex-col relative overflow-hidden bg-sky-200">

          <div ref={ballRef} className="cannon-ball"></div>

          {/* HUD Superior */}
          <div className="p-4 md:p-6 flex justify-between items-center z-10">
            <button onClick={() => setGameState('trackSelect')} className="bg-white/90 px-5 py-2 rounded-full border-4 border-indigo-900 font-black text-lg">
              ◀ Sair
            </button>
            <span className="text-sm text-indigo-500 font-bold">Ilha {currentTrack + 1} — {challengeInTrack + 1}/5</span>
          </div>

          {/* ÁREA DA EQUAÇÃO */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 -mt-12">
            <div className="bg-white/95 p-4 md:p-8 rounded-[2.5rem] border-8 border-indigo-900 shadow-2xl flex items-center gap-3 md:gap-6 justify-center max-w-full">
              <div className="flex flex-col items-center">
                {level.unknown === 'n1' ? (
                  <div className="w-14 h-14 md:w-20 md:h-20 border-4 border-dashed border-indigo-300 rounded-2xl flex items-center justify-center text-4xl text-indigo-200 animate-pulse">?</div>
                ) : (
                  <>
                    <VisualItems count={level.n1} />
                    <span className="text-3xl md:text-5xl font-black mt-2 text-indigo-900">{level.n1}</span>
                  </>
                )}
              </div>

              <span className="text-4xl md:text-6xl font-black text-sky-500">{level.op}</span>

              <div className="flex flex-col items-center">
                {level.unknown === 'n2' ? (
                  <div className="w-14 h-14 md:w-20 md:h-20 border-4 border-dashed border-indigo-300 rounded-2xl flex items-center justify-center text-4xl text-indigo-200 animate-pulse">?</div>
                ) : (
                  <>
                    <VisualItems count={level.n2} />
                    <span className="text-3xl md:text-5xl font-black mt-2 text-indigo-900">{level.n2}</span>
                  </>
                )}
              </div>

              <span className="text-4xl md:text-6xl font-black text-sky-500">=</span>

              <div className="flex flex-col items-center">
                {(level.unknown === 'answer') ? (
                  <div className="w-14 h-14 md:w-20 md:h-20 border-4 border-dashed border-indigo-300 rounded-2xl flex items-center justify-center text-4xl text-indigo-200 animate-pulse">?</div>
                ) : (
                  <>
                    <VisualItems count={level.answer} />
                    <span className="text-3xl md:text-5xl font-black mt-2 text-indigo-900">{level.answer}</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-indigo-900 text-white px-8 py-2 rounded-full font-bold uppercase tracking-widest text-sm md:text-base shadow-lg">
              {level.task}
            </div>
          </div>

          {/* ÁREA DO MAR E ACÇÃO */}
          <div className="h-[42vh] md:h-[48vh] sea-bg relative border-t-8 border-white/20">

            {/* NAVIO */}
            <div className={`absolute bottom-24 left-4 md:left-20 ship-float ${firing ? 'cannon-recoil' : ''}`}>
                <div className="relative w-[180px] md:w-[240px]">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                        <path d="M20 140 Q100 180 180 140 L165 170 Q100 190 35 170 Z" fill="#78350f" stroke="#451a03" strokeWidth="2"/>
                        <circle cx="50" cy="155" r="5" fill="#333" /><circle cx="80" cy="160" r="5" fill="#333" /><circle cx="120" cy="160" r="5" fill="#333" /><circle cx="150" cy="155" r="5" fill="#333" />
                        <rect x="95" y="40" width="8" height="110" fill="#451a03" />
                        <rect x="90" y="35" width="18" height="12" fill="#5c2d12" />
                        <path d="M50 50 Q100 40 150 50 L145 130 Q100 120 55 130 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1"/>
                        <circle cx="100" cy="85" r="14" fill="white" />
                        <path d="M96 92 Q100 95 104 92" fill="none" stroke="black" strokeWidth="1.5"/>
                        <path d="M86 78 Q100 70 114 78 L114 84 Q100 76 86 84 Z" fill="#ef4444" />
                        <rect x="103" y="10" width="35" height="22" fill="black" rx="2" /><circle cx="118" cy="21" r="5" fill="white" /><rect x="99" y="5" width="4" height="40" fill="#451a03" />
                    </svg>
                    <div ref={cannonRef} className="absolute top-[135px] right-[-10px] w-12 md:w-16 h-6 md:h-8 bg-zinc-800 rounded-r-full border-2 border-zinc-900 shadow-lg z-20">
                         {firing && <div className="absolute -right-8 -top-4 text-4xl md:text-5xl animate-pulse">💥</div>}
                    </div>
                </div>
            </div>

            {/* ALVO */}
            <div ref={targetRef} className={`absolute bottom-28 right-8 md:right-32 text-6xl md:text-8xl transition-all duration-300 ${hit ? 'explode' : ''}`}>
              {hit ? '💥' : '🛢️'}
            </div>

            {/* BOTÕES */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 md:gap-8 px-4">
              {level.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={wrong.includes(opt) || firing || hit}
                  onClick={() => checkAnswer(opt)}
                  className={`
                    w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center text-4xl md:text-6xl font-black transition-all
                    ${wrong.includes(opt) ? 'bg-red-500/50 opacity-50 translate-y-4 shadow-none' : 'bg-zinc-800 text-white shadow-[0_10px_0_#000] hover:-translate-y-2 active:translate-y-1 active:shadow-none'}
                    ${firing || hit ? 'opacity-70 grayscale cursor-not-allowed' : ''}
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
