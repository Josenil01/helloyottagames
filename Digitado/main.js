if (window.HY && window.HY.stars) HY.stars.init('digitado');

const { useState, useEffect } = React;

// Critérios de filtragem por trilha — ajustar conforme demanda pedagógica
const CRITERIOS = [
  w => w.dificuldade === 'facil',   // Trilha 1
  w => w.dificuldade === 'facil',   // Trilha 2
  w => w.dificuldade === 'facil',   // Trilha 3
  w => w.dificuldade === 'facil',   // Trilha 4
  w => w.dificuldade === 'medio',   // Trilha 5
  w => w.dificuldade === 'medio',   // Trilha 6
  w => w.dificuldade === 'medio',   // Trilha 7
  w => w.dificuldade === 'medio',   // Trilha 8
  w => w.dificuldade === 'dificil', // Trilha 9
  w => w.dificuldade === 'dificil', // Trilha 10
  w => w.dificuldade === 'dificil', // Trilha 11
  w => w.dificuldade === 'dificil', // Trilha 12
];

function App() {
  const trackWordsRef = useRef([]);
  const [gameState, setGameState] = useState('cover');
  const [mode, setMode] = useState('infantil');
  const [currentTrack, setCurrentTrack] = useState(0);
  const [wordInTrack, setWordInTrack] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentEmoji, setCurrentEmoji] = useState('');
  const [typedCount, setTypedCount] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getDisplayWord = (word, m) => m === 'infantil' ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

  const startTrack = (trackIdx) => {
    const raw = HY.rand.pick(HY.rand.PALAVRAS.filter(CRITERIOS[trackIdx]), 5);
    trackWordsRef.current = raw.map(w => ({ word: w.palavra, emoji: w.emoji }));
    setCurrentTrack(trackIdx);
    setWordInTrack(0);
    setGameState('playing');
    HY.score.reset();
    const entry = trackWordsRef.current[0];
    setCurrentWord(getDisplayWord(entry.word, mode));
    setCurrentEmoji(entry.emoji);
    setTypedCount(0);
    setIsSuccess(false);
    setWrongFlash(false);
    HY.score.startChallenge();
  };

  const advanceWord = (track, wIdx) => {
    const nextWIdx = wIdx + 1;
    if (nextWIdx < 5) {
      setWordInTrack(nextWIdx);
      const entry = trackWordsRef.current[nextWIdx];
      setCurrentWord(getDisplayWord(entry.word, mode));
      setCurrentEmoji(entry.emoji);
      setTypedCount(0);
      setIsSuccess(false);
      HY.score.startChallenge();
    } else {
      if (window.HY && window.HY.stars) HY.stars.trackComplete(track);
      HY.elapsed.stopTrail();
      setGameState('trackComplete');
    }
  };

  useEffect(() => {
    if (gameState === 'trackSelect' && window.HY && window.HY.stars) {
      HY.stars.renderGrid('hy-track-grid', {
        onPlay: startTrack,
        emoji: (i) => TRACKS[i][0].emoji,
        accentColor: '#0d9488'
      });
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const handler = (e) => {
      if (isSuccess) return;
      const key = e.key.toUpperCase();
      if (!/^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÚÜÇ]$/.test(key)) return;
      const expected = currentWord[typedCount];
      if (!expected) return;
      if (key === expected.toUpperCase() || key === expected) {
        const newTyped = typedCount + 1;
        setTypedCount(newTyped);
        if (newTyped === currentWord.length) {
          HY.playWin();
          HY.score.correct();
          setIsSuccess(true);
          setTimeout(() => advanceWord(currentTrack, wordInTrack), 1200);
        }
      } else {
        HY.playLose();
        HY.score.wrong();
        setWrongFlash(true);
        setTimeout(() => setWrongFlash(false), 400);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, currentWord, typedCount, isSuccess, currentTrack, wordInTrack]);

  if (gameState === 'cover') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-teal-500 to-teal-700">
        <a href="../index.html" className="absolute top-4 left-4 bg-white/20 text-white px-4 py-2 rounded-full font-bold">◀ Voltar</a>
        <div className="text-8xl mb-6 animate-bounce">⌨️</div>
        <h1 className="text-6xl font-black text-white mb-4 uppercase font-game">Digitado</h1>
        <p className="text-xl text-teal-100 mb-8">Escolha o modo e pratique a digitação!</p>
        <div className="flex gap-4 mb-8">
          <button onClick={() => setMode('infantil')} className={`px-6 py-3 rounded-3xl font-black text-lg border-4 transition-all ${mode === 'infantil' ? 'bg-white text-teal-700 border-white' : 'bg-transparent text-white border-white/50'}`}>MAIÚSCULAS</button>
          <button onClick={() => setMode('fundamental')} className={`px-6 py-3 rounded-3xl font-black text-lg border-4 transition-all ${mode === 'fundamental' ? 'bg-white text-teal-700 border-white' : 'bg-transparent text-white border-white/50'}`}>minúsculas</button>
        </div>
        <button onClick={() => setGameState('trackSelect')} className="bg-white text-teal-700 px-12 py-5 rounded-full text-3xl font-black shadow-xl hover:-translate-y-1 transition-all">Começar!</button>
      </div>
    );
  }

  if (gameState === 'trackSelect') {
    return (
      <div key="trackSelect" className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-b from-teal-500 to-teal-700">
        <button onClick={() => setGameState('cover')} className="self-start bg-white/20 text-white px-4 py-2 rounded-full font-bold mb-6">◀ Voltar</button>
        <h2 className="text-4xl font-black text-white mb-8 uppercase font-game">Escolha a Fase</h2>
        <div id="hy-track-grid" style={{width:'100%', maxWidth:'720px'}}></div>
      </div>
    );
  }

  if (gameState === 'trackComplete') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-teal-500 to-teal-700">
        <div className="text-8xl mb-4">🏆</div>
        <h1 className="text-5xl font-black text-white mb-2 font-game">Fase {currentTrack + 1} Concluída!</h1>
        <p className="text-xl text-teal-100 mb-8">Você digitou 5 palavras!</p>
        <div className="flex gap-4">
          <button onClick={() => setGameState('trackSelect')} className="bg-white/20 text-white px-8 py-4 rounded-3xl text-xl font-black border-2 border-white">Fases</button>
          {currentTrack + 1 < 12 && <button onClick={() => startTrack(currentTrack + 1)} className="bg-white text-teal-700 px-8 py-4 rounded-3xl text-xl font-black">Próxima! →</button>}
        </div>
      </div>
    );
  }

  // Playing screen
  const letters = currentWord.split('');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-teal-500 to-teal-700">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setGameState('trackSelect')} className="bg-white/20 text-white px-4 py-2 rounded-full font-bold">◀ Sair</button>
        </div>

        <div className="text-center mb-8">
          <div className="text-8xl mb-4">{currentEmoji}</div>
          <div className="flex justify-center gap-2 flex-wrap">
            {letters.map((letter, i) => (
              <span key={i} className={`text-4xl font-black font-game px-3 py-2 rounded-2xl border-4 transition-all ${i < typedCount ? 'bg-green-400 border-green-300 text-white' : i === typedCount ? 'bg-white border-teal-300 text-teal-700 animate-pulse' : 'bg-white/20 border-white/30 text-white/50'} ${wrongFlash && i === typedCount ? 'bg-red-400 border-red-300' : ''}`}>
                {letter}
              </span>
            ))}
          </div>
          {isSuccess && <div className="text-green-300 text-2xl font-black mt-4 animate-bounce">✓ Correto!</div>}
        </div>

        <div className="text-center text-teal-100 text-sm">Use o teclado para digitar a palavra</div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')); root.render(<App />);
