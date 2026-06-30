if (window.HY && window.HY.stars) HY.stars.init('maisculo-minusculo');

const { useState, useEffect } = React;

// --- DADOS DO JOGO: gerados dinamicamente de utils/letters.js ---
const ALPHABET_DATA = (function () {
  var letters = window.HYLetters || [];
  return letters.map(function (l) {
    return { u: l.maiusculo, l: l.minusculo, d_u: l.distratoresUpper, d_l: l.distratoresLower };
  });
})();

// Each track is an array of 5 letter indices (0=A, 1=B, ..., 25=Z)
const TRACKS = [
  [0, 1, 2, 3, 4],       // Trilha 1: A, B, C, D, E
  [5, 6, 7, 8, 9],       // Trilha 2: F, G, H, I, J
  [10, 11, 12, 13, 14],  // Trilha 3: K, L, M, N, O
  [15, 16, 17, 18, 19],  // Trilha 4: P, Q, R, S, T
  [20, 21, 22, 23, 24],  // Trilha 5: U, V, W, X, Y
  [25, 0, 4, 8, 14],     // Trilha 6: Z + vogais A,E,I,O
  [1, 3, 6, 9, 16],      // Trilha 7: B,D,G,J,Q (oclusivas)
  [2, 5, 11, 13, 18],    // Trilha 8: C,F,L,N,S (fricativas)
  [7, 10, 12, 15, 21],   // Trilha 9: H,K,M,P,V (mistas)
  [17, 19, 22, 23, 24],  // Trilha 10: R,T,W,X,Y (difíceis)
  [0, 2, 4, 10, 20],     // Trilha 11: Vogais + K e U
  [1, 6, 11, 16, 21],    // Trilha 12: B,G,L,Q,V (revisão)
];

function App() {
  const [gameState, setGameState] = useState('cover');
  const [mode, setMode] = useState('upperToLower');
  const [currentTrack, setCurrentTrack] = useState(0);
  const [letterInTrack, setLetterInTrack] = useState(0);
  const [options, setOptions] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const currentLetterData = ALPHABET_DATA[TRACKS[currentTrack][letterInTrack]];

  const generateOptionsForLetter = (letterData, currentMode) => {
    let correct, distractors;
    if (currentMode === 'upperToLower') {
      correct = letterData.l;
      distractors = [...letterData.d_l];
    } else {
      correct = letterData.u;
      distractors = [...letterData.d_u];
    }
    const selected = HY.shuffle(distractors).slice(0, 2);
    return HY.shuffle([correct, ...selected]);
  };

  const startLetter = (track, lIdx, m) => {
    const letterData = ALPHABET_DATA[TRACKS[track][lIdx]];
    const opts = generateOptionsForLetter(letterData, m || mode);
    setOptions(opts);
    setWrongAnswers([]);
    setIsSuccess(false);
    setIsDragOver(false);
    HY.score.startChallenge();
  };

  const startTrack = (trackIdx) => {
    setCurrentTrack(trackIdx);
    setLetterInTrack(0);
    setGameState('playing');
    HY.score.reset();
    startLetter(trackIdx, 0, mode);
  };

  const handleAnswer = (answer) => {
    if (isSuccess || wrongAnswers.includes(answer)) return;
    const correct = mode === 'upperToLower' ? currentLetterData.l : currentLetterData.u;
    if (answer === correct) {
      HY.playWin();
      HY.score.correct();
      setIsSuccess(true);
      setTimeout(() => {
        const nextLIdx = letterInTrack + 1;
        if (nextLIdx < 5) {
          setLetterInTrack(nextLIdx);
          startLetter(currentTrack, nextLIdx, mode);
        } else {
          if (window.HY && window.HY.stars) HY.stars.trackComplete(currentTrack);
          HY.elapsed.stopTrail();
          setGameState('trackComplete');
        }
      }, 1500);
    } else {
      HY.playLose();
      HY.score.wrong();
      setWrongAnswers(prev => [...prev, answer]);
    }
  };

  useEffect(() => {
    if (gameState === 'trackSelect' && window.HY && window.HY.stars) {
      HY.stars.renderGrid('hy-track-grid', {
        onPlay: startTrack,
        emoji: (i) => ALPHABET_DATA[TRACKS[i][0]].u,
        accentColor: '#d046d9'
      });
    }
  }, [gameState]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); const a = e.dataTransfer.getData('text/plain'); if (a) handleAnswer(a); };

  if (gameState === 'cover') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{background: 'linear-gradient(135deg, #48076a 0%, #d046d9 100%)'}}>
        <a href="../index.html" className="absolute top-4 left-4 bg-white/20 text-white px-4 py-2 rounded-full font-bold">◀ Voltar</a>
        <div className="text-8xl mb-6">🔤</div>
        <h1 className="text-5xl font-black text-white mb-4 uppercase font-game">Maiúsculo<br/>vs Minúsculo</h1>
        <p className="text-xl text-purple-200 mb-8">Associe as letras grandes com as pequenas!</p>
        <div className="flex gap-4 mb-8">
          <button onClick={() => setMode('upperToLower')} className={`px-6 py-3 rounded-3xl font-black text-lg border-4 transition-all ${mode === 'upperToLower' ? 'bg-white text-purple-700 border-white' : 'bg-transparent text-white border-white/50'}`}>A → a</button>
          <button onClick={() => setMode('lowerToUpper')} className={`px-6 py-3 rounded-3xl font-black text-lg border-4 transition-all ${mode === 'lowerToUpper' ? 'bg-white text-purple-700 border-white' : 'bg-transparent text-white border-white/50'}`}>a → A</button>
        </div>
        <button onClick={() => setGameState('trackSelect')} className="bg-white text-purple-700 px-12 py-5 rounded-full text-3xl font-black shadow-xl hover:-translate-y-1 transition-all">Jogar!</button>
      </div>
    );
  }

  if (gameState === 'trackSelect') {
    return (
      <div key="trackSelect" className="min-h-screen flex flex-col items-center p-6" style={{background: 'linear-gradient(135deg, #48076a 0%, #d046d9 100%)'}}>
        <button onClick={() => setGameState('cover')} className="self-start bg-white/20 text-white px-4 py-2 rounded-full font-bold mb-6">◀ Voltar</button>
        <h2 className="text-4xl font-black text-white mb-8 uppercase font-game">Escolha a Trilha</h2>
        <div id="hy-track-grid" style={{width:'100%', maxWidth:'720px'}}></div>
      </div>
    );
  }

  if (gameState === 'trackComplete') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{background: 'linear-gradient(135deg, #48076a 0%, #d046d9 100%)'}}>
        <div className="text-8xl mb-4">🏆</div>
        <h1 className="text-5xl font-black text-white mb-2 font-game">Trilha {currentTrack + 1} Concluída!</h1>
        <p className="text-xl text-purple-200 mb-8">5 letras dominadas!</p>
        <div className="flex gap-4">
          <button onClick={() => setGameState('trackSelect')} className="bg-white/20 text-white px-8 py-4 rounded-3xl text-xl font-black border-2 border-white">Trilhas</button>
          {currentTrack + 1 < 12 && <button onClick={() => startTrack(currentTrack + 1)} className="bg-white text-purple-700 px-8 py-4 rounded-3xl text-xl font-black">Próxima! →</button>}
        </div>
      </div>
    );
  }

  // Playing screen
  const question = mode === 'upperToLower' ? currentLetterData.u : currentLetterData.l;
  const correctAnswer = mode === 'upperToLower' ? currentLetterData.l : currentLetterData.u;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{background: 'linear-gradient(135deg, #48076a 0%, #d046d9 100%)'}}>
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setGameState('trackSelect')} className="bg-white/20 text-white px-4 py-2 rounded-full font-bold">◀ Sair</button>
          <span className="text-white font-black">Trilha {currentTrack + 1} — {letterInTrack + 1}/5</span>
        </div>

        <div className="text-center mb-8">
          <p className="text-purple-200 text-lg font-bold mb-4">{mode === 'upperToLower' ? 'Qual é a minúscula?' : 'Qual é a maiúscula?'}</p>
          <div
            className={`text-[8rem] font-black font-game text-white mb-6 transition-all ${isSuccess ? 'text-green-300 scale-110' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {question}
          </div>
        </div>

        <div className="flex justify-center gap-6">
          {options.map((opt, i) => {
            const isWrong = wrongAnswers.includes(opt);
            return (
              <button
                key={i}
                draggable={!isWrong && !isSuccess}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', opt)}
                onClick={() => handleAnswer(opt)}
                disabled={isWrong || isSuccess}
                className={`w-24 h-24 rounded-3xl text-4xl font-black font-game border-4 transition-all ${isSuccess && opt === correctAnswer ? 'bg-green-400 border-green-300 text-white scale-110' : isWrong ? 'bg-red-500/50 border-red-700 text-red-200 opacity-50' : 'bg-white border-purple-200 text-purple-700 hover:-translate-y-2 shadow-xl'}`}
              >
                {opt}
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
