if (window.HY && window.HY.stars) HY.stars.init('fabrica-rimas');

const { useState, useEffect } = React;

    // --- DADOS DO JOGO: gerados dinamicamente de utils/words.js ---
    const LEVELS = (function() {
      var banco = window.HYWords || [];
      return window.HY && window.HY.challenges
        ? window.HY.challenges.buildLevels('rimas', banco, 12)
        : [];
    })();
    // Dados originais preservados (não utilizados na execução):
    const _oldLevels = [
      // TRILHA 1 (Rimas em -ATO)
      { id: 1, type: 'match', target: 'GATO', answer: 'RATO', options: ['RATO', 'MALA', 'FOGO'], emoji: '🐱', instruction: 'Encontre a palavra que RIMA!' },
      { id: 2, type: 'match', target: 'PATO', answer: 'DATO', options: ['DATO', 'BOLA', 'CASA'], emoji: '🦆', instruction: 'O que rima com PATO?' },
      { id: 3, type: 'connect', leftWords: ['GATO', 'PATO', 'FATO'], rightWords: ['MATO', 'RATO', 'NATO'], matches: { 'GATO': 'MATO', 'PATO': 'RATO', 'FATO': 'NATO' }, emoji: '🔗', instruction: 'Ligue os pares de rimas!' },
      { id: 4, type: 'intruder', words: ['GATO', 'PATO', 'RATO', 'BOLA'], answer: 'BOLA', emoji: '⚽', instruction: 'Qual NÃO rima com as outras?' },
      { id: 5, type: 'sentence', preText: 'O ', boldText: 'SAPATO', postText: ' do pirata é de ', answer: 'BARATO', options: ['BARATO', 'CARO', 'BONITO'], emoji: '👟', instruction: 'Complete com a palavra que rima com SAPATO!' },

      // TRILHA 2 (Rimas em -OLA)
      { id: 6, type: 'match', target: 'BOLA', answer: 'COLA', options: ['COLA', 'DADO', 'MESA'], emoji: '⚽', instruction: 'O que rima com BOLA?' },
      { id: 7, type: 'match', target: 'MOLA', answer: 'ESCOLA', options: ['ESCOLA', 'CASA', 'LIVRO'], emoji: '⚙️', instruction: 'Encontre a rima de MOLA!' },
      { id: 8, type: 'connect', leftWords: ['BOLA', 'MOLA', 'COLA'], rightWords: ['GOLA', 'ESCOLA', 'PISTOLA'], matches: { 'BOLA': 'GOLA', 'MOLA': 'ESCOLA', 'COLA': 'PISTOLA' }, emoji: '🔗', instruction: 'Ligue os pares de rimas!' },
      { id: 9, type: 'intruder', words: ['BOLA', 'COLA', 'MOLA', 'PATO'], answer: 'PATO', emoji: '🦆', instruction: 'Qual palavra NÃO rima?' },
      { id: 10, type: 'sentence', preText: 'A criança joga a ', boldText: 'BOLA', postText: ' com a ', answer: 'COLA', options: ['COLA', 'FACA', 'PORTA'], emoji: '🧴', instruction: 'Escolha a rima para completar o verso!' },

      // TRILHA 3 (Rimas em -ÃO)
      { id: 11, type: 'match', target: 'MÃO', answer: 'PÃO', options: ['PÃO', 'MESA', 'GATO'], emoji: '🖐️', instruction: 'O que rima com MÃO?' },
      { id: 12, type: 'match', target: 'AVIÃO', answer: 'CAMINHÃO', options: ['CAMINHÃO', 'BOLA', 'CASA'], emoji: '✈️', instruction: 'Encontre a rima de AVIÃO!' },
      { id: 13, type: 'connect', leftWords: ['MÃO', 'PÃO', 'AVIÃO'], rightWords: ['CAMINHÃO', 'BALÃO', 'FEIJÃO'], matches: { 'MÃO': 'FEIJÃO', 'PÃO': 'BALÃO', 'AVIÃO': 'CAMINHÃO' }, emoji: '🎈', instruction: 'Ligue os pares de rimas em -ÃO!' },
      { id: 14, type: 'intruder', words: ['MÃO', 'PÃO', 'AVIÃO', 'CARRO'], answer: 'CARRO', emoji: '🚗', instruction: 'Qual NÃO rima com as outras?' },
      { id: 15, type: 'sentence', preText: 'O menino come o ', boldText: 'FEIJÃO', postText: ' com ', answer: 'PÃO', options: ['PÃO', 'FACA', 'ÁGUA'], emoji: '🍞', instruction: 'Complete o verso com a rima certa!' },

      // TRILHA 4 (Rimas em -EGA)
      { id: 16, type: 'match', target: 'VELA', answer: 'JANELA', options: ['JANELA', 'PATO', 'DADO'], emoji: '🕯️', instruction: 'O que rima com VELA?' },
      { id: 17, type: 'match', target: 'PANELA', answer: 'JANELA', options: ['JANELA', 'BOLA', 'LIVRO'], emoji: '🍳', instruction: 'Encontre a rima de PANELA!' },
      { id: 18, type: 'connect', leftWords: ['VELA', 'PANELA', 'BELA'], rightWords: ['JANELA', 'CANELA', 'ESTRELA'], matches: { 'VELA': 'ESTRELA', 'PANELA': 'JANELA', 'BELA': 'CANELA' }, emoji: '🔗', instruction: 'Ligue os pares de rimas em -ELA!' },
      { id: 19, type: 'intruder', words: ['VELA', 'PANELA', 'JANELA', 'GATO'], answer: 'GATO', emoji: '🐱', instruction: 'Qual palavra NÃO rima?' },
      { id: 20, type: 'sentence', preText: 'A ', boldText: 'VELA', postText: ' ilumina a ', answer: 'JANELA', options: ['JANELA', 'PORTA', 'MESA'], emoji: '🕯️', instruction: 'Complete com a palavra que rima com VELA!' },

      // TRILHA 5 (Rimas em -EDO)
      { id: 21, type: 'match', target: 'DEDO', answer: 'MEDO', options: ['MEDO', 'BOLA', 'CASA'], emoji: '🤚', instruction: 'O que rima com DEDO?' },
      { id: 22, type: 'match', target: 'PENTE', answer: 'DENTE', options: ['DENTE', 'BOLA', 'CASA'], emoji: '🪮', instruction: 'O que rima com PENTE?' },
      { id: 23, type: 'connect', leftWords: ['DEDO', 'MEDO', 'CEDO'], rightWords: ['SEGREDO', 'BREDO', 'REDO'], matches: { 'DEDO': 'SEGREDO', 'MEDO': 'BREDO', 'CEDO': 'REDO' }, emoji: '🔗', instruction: 'Ligue os pares de rimas!' },
      { id: 24, type: 'intruder', words: ['DEDO', 'MEDO', 'CEDO', 'BOLA'], answer: 'BOLA', emoji: '⚽', instruction: 'Qual NÃO rima com as outras?' },
      { id: 25, type: 'sentence', preText: 'Ela tem muito ', boldText: 'MEDO', postText: ' do ', answer: 'DEDO', options: ['DEDO', 'BRAÇO', 'PÉ'], emoji: '😨', instruction: 'Complete o verso com a rima de MEDO!' },

      // TRILHA 6 (Rimas em -OGO)
      { id: 26, type: 'match', target: 'FOGO', answer: 'JOGO', options: ['JOGO', 'BOLA', 'CASA'], emoji: '🔥', instruction: 'O que rima com FOGO?' },
      { id: 27, type: 'match', target: 'LOGO', answer: 'JOGO', options: ['JOGO', 'BOLA', 'GATO'], emoji: '⏱️', instruction: 'O que rima com LOGO?' },
      { id: 28, type: 'connect', leftWords: ['FOGO', 'JOGO', 'LOGO'], rightWords: ['AFOGO', 'RELÓGIO', 'DIÁLOGO'], matches: { 'FOGO': 'AFOGO', 'JOGO': 'RELÓGIO', 'LOGO': 'DIÁLOGO' }, emoji: '🎮', instruction: 'Ligue os pares de rimas em -OGO!' },
      { id: 29, type: 'intruder', words: ['FOGO', 'JOGO', 'LOGO', 'PATO'], answer: 'PATO', emoji: '🦆', instruction: 'Qual palavra NÃO rima?' },
      { id: 30, type: 'sentence', preText: 'O menino brinca no ', boldText: 'JOGO', postText: ' perto do ', answer: 'FOGO', options: ['FOGO', 'LIVRO', 'PARQUE'], emoji: '🔥', instruction: 'Complete o verso com a rima de JOGO!' },

      // TRILHA 7 (Rimas em -UAL)
      { id: 31, type: 'match', target: 'LUA', answer: 'RUA', options: ['RUA', 'BOLA', 'CASA'], emoji: '🌙', instruction: 'O que rima com LUA?' },
      { id: 32, type: 'match', target: 'FADA', answer: 'ESPADA', options: ['ESPADA', 'BOLA', 'LIVRO'], emoji: '🧚', instruction: 'O que rima com FADA?' },
      { id: 33, type: 'connect', leftWords: ['LUA', 'RUA', 'PUA'], rightWords: ['PEDRUA', 'ALELUIA', 'ESTATUA'], matches: { 'LUA': 'ALELUIA', 'RUA': 'ESTATUA', 'PUA': 'PEDRUA' }, emoji: '🌙', instruction: 'Ligue os pares de rimas!' },
      { id: 34, type: 'intruder', words: ['LUA', 'RUA', 'PUA', 'GATO'], answer: 'GATO', emoji: '🐱', instruction: 'Qual NÃO rima com as outras?' },
      { id: 35, type: 'sentence', preText: 'A ', boldText: 'LUA', postText: ' brilha na ', answer: 'RUA', options: ['RUA', 'CASA', 'ESCOLA'], emoji: '🌙', instruction: 'Complete o verso com a rima de LUA!' },

      // TRILHA 8 (Rimas em -INHA)
      { id: 36, type: 'match', target: 'GALINHA', answer: 'VIZINHA', options: ['VIZINHA', 'BOLA', 'DADO'], emoji: '🐔', instruction: 'O que rima com GALINHA?' },
      { id: 37, type: 'match', target: 'RAINHA', answer: 'VIZINHA', options: ['VIZINHA', 'BOLA', 'GATO'], emoji: '👑', instruction: 'O que rima com RAINHA?' },
      { id: 38, type: 'connect', leftWords: ['GALINHA', 'RAINHA', 'VIZINHA'], rightWords: ['COZINHA', 'FARINHA', 'LINHA'], matches: { 'GALINHA': 'FARINHA', 'RAINHA': 'LINHA', 'VIZINHA': 'COZINHA' }, emoji: '🔗', instruction: 'Ligue os pares de rimas em -INHA!' },
      { id: 39, type: 'intruder', words: ['GALINHA', 'VIZINHA', 'RAINHA', 'PATO'], answer: 'PATO', emoji: '🦆', instruction: 'Qual palavra NÃO rima?' },
      { id: 40, type: 'sentence', preText: 'A ', boldText: 'GALINHA', postText: ' vive na ', answer: 'COZINHA', options: ['COZINHA', 'SALA', 'GARAGEM'], emoji: '🐔', instruction: 'Complete o verso com a rima de GALINHA!' },

      // TRILHA 9 (Rimas em -AÇÃO)
      { id: 41, type: 'match', target: 'CANÇÃO', answer: 'CORAÇÃO', options: ['CORAÇÃO', 'BOLA', 'GATO'], emoji: '🎵', instruction: 'O que rima com CANÇÃO?' },
      { id: 42, type: 'match', target: 'EMOÇÃO', answer: 'CORAÇÃO', options: ['CORAÇÃO', 'JANELA', 'MESA'], emoji: '💖', instruction: 'O que rima com EMOÇÃO?' },
      { id: 43, type: 'connect', leftWords: ['CANÇÃO', 'EMOÇÃO', 'PAIXÃO'], rightWords: ['CORAÇÃO', 'TRAIÇÃO', 'SOLUÇÃO'], matches: { 'CANÇÃO': 'SOLUÇÃO', 'EMOÇÃO': 'CORAÇÃO', 'PAIXÃO': 'TRAIÇÃO' }, emoji: '🎶', instruction: 'Ligue os pares de rimas em -ÃO!' },
      { id: 44, type: 'intruder', words: ['CANÇÃO', 'CORAÇÃO', 'EMOÇÃO', 'BOLA'], answer: 'BOLA', emoji: '⚽', instruction: 'Qual NÃO rima com as outras?' },
      { id: 45, type: 'sentence', preText: 'Ela canta a ', boldText: 'CANÇÃO', postText: ' com o ', answer: 'CORAÇÃO', options: ['CORAÇÃO', 'BRAÇO', 'PÉ'], emoji: '🎵', instruction: 'Complete com a rima de CANÇÃO!' },

      // TRILHA 10 (Rimas em -EIRO)
      { id: 46, type: 'match', target: 'JANEIRO', answer: 'JANEIRO', options: ['FEVEREIRO', 'BOLA', 'DADO'], emoji: '📅', instruction: 'O que rima com JANEIRO?' },
      { id: 47, type: 'match', target: 'CARNEIRO', answer: 'FEVEREIRO', options: ['FEVEREIRO', 'GATO', 'CASA'], emoji: '🐑', instruction: 'O que rima com CARNEIRO?' },
      { id: 48, type: 'connect', leftWords: ['CARNEIRO', 'CAVALEIRO', 'GUERREIRO'], rightWords: ['FEVEREIRO', 'MADEIREIRO', 'FERREIRO'], matches: { 'CARNEIRO': 'FERREIRO', 'CAVALEIRO': 'MADEIREIRO', 'GUERREIRO': 'FEVEREIRO' }, emoji: '⚔️', instruction: 'Ligue os pares de rimas em -EIRO!' },
      { id: 49, type: 'intruder', words: ['CARNEIRO', 'CAVALEIRO', 'GUERREIRO', 'BOLA'], answer: 'BOLA', emoji: '⚽', instruction: 'Qual NÃO rima com as outras?' },
      { id: 50, type: 'sentence', preText: 'O corajoso ', boldText: 'CAVALEIRO', postText: ' luta como um ', answer: 'GUERREIRO', options: ['GUERREIRO', 'PRÍNCIPE', 'REI'], emoji: '⚔️', instruction: 'Complete o verso com a rima de CAVALEIRO!' },

      // TRILHA 11 (Rimas em -UCHO)
      { id: 51, type: 'match', target: 'MACACO', answer: 'PALHAÇO', options: ['PALHAÇO', 'BOLA', 'GATO'], emoji: '🐒', instruction: 'O que rima com MACACO?' },
      { id: 52, type: 'match', target: 'BURACO', answer: 'PALHAÇO', options: ['PALHAÇO', 'LIVRO', 'CASA'], emoji: '🕳️', instruction: 'O que rima com BURACO?' },
      { id: 53, type: 'connect', leftWords: ['MACACO', 'BURACO', 'BARRACO'], rightWords: ['PALHAÇO', 'CARACOL', 'ESPANTALHO'], matches: { 'MACACO': 'BARRACO', 'BURACO': 'ESPANTALHO', 'BARRACO': 'PALHAÇO' }, emoji: '🎪', instruction: 'Ligue os pares de rimas!' },
      { id: 54, type: 'intruder', words: ['MACACO', 'BURACO', 'BARRACO', 'GATO'], answer: 'GATO', emoji: '🐱', instruction: 'Qual NÃO rima com as outras?' },
      { id: 55, type: 'sentence', preText: 'O ', boldText: 'MACACO', postText: ' caiu no ', answer: 'BURACO', options: ['BURACO', 'GALHO', 'RIO'], emoji: '🐒', instruction: 'Complete o verso com a rima de MACACO!' },

      // TRILHA 12 (Rimas em -UVA)
      { id: 56, type: 'match', target: 'UVAUMA', answer: 'CHUVA', options: ['CHUVA', 'BOLA', 'DADO'], emoji: '🍇', instruction: 'O que rima com UVA?' },
      { id: 57, type: 'match', target: 'LUVA', answer: 'CHUVA', options: ['CHUVA', 'GATO', 'CASA'], emoji: '🧤', instruction: 'O que rima com LUVA?' },
      { id: 58, type: 'connect', leftWords: ['UVA', 'LUVA', 'CHUVA'], rightWords: ['BRUTA', 'LARVA', 'LUTA'], matches: { 'UVA': 'BRUTA', 'LUVA': 'LUTA', 'CHUVA': 'LARVA' }, emoji: '🌧️', instruction: 'Ligue os pares de rimas!' },
      { id: 59, type: 'intruder', words: ['UVA', 'LUVA', 'CHUVA', 'PATO'], answer: 'PATO', emoji: '🦆', instruction: 'Qual NÃO rima com as outras?' },
      { id: 60, type: 'sentence', preText: 'Fui à feira comprar ', boldText: 'UVA', postText: ' e tomei ', answer: 'CHUVA', options: ['CHUVA', 'SOL', 'VENTO'], emoji: '🍇', instruction: 'Complete o verso com a rima de UVA!' },
    ];

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
          const phaseInTrack = currentPhaseIndex - currentTrack * 5;
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
          alert("Escolha primeiro uma palavra da coluna da esquerda!");
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

      // ------------------------------------------------------------------------
      // TELA 1: CAPA
      // ------------------------------------------------------------------------
      if (gameState === 'cover') {
        return (
          <div className="min-h-screen factory-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <a href="../index.html" className="absolute top-4 left-4 text-orange-200 hover:text-orange-400 font-bold bg-slate-800/80 hover:bg-slate-700 px-4 py-2 rounded-full transition-colors z-20 border-2 border-orange-400">◀ Voltar</a>
            {/* Decoração Industrial */}
            <div className="absolute top-10 left-10 text-6xl opacity-30 gear-anim">⚙️</div>
            <div className="absolute top-32 right-10 text-7xl opacity-30 gear-anim-reverse" style={{animationDelay: '1s'}}>⚙️</div>
            <div className="absolute bottom-10 left-20 text-6xl opacity-30 gear-anim" style={{animationDelay: '2s'}}>🔩</div>
            <div className="absolute bottom-32 right-32 text-4xl opacity-30 gear-anim-reverse" style={{animationDelay: '0.5s'}}>🔧</div>

            <div className="bg-slate-800/80 backdrop-blur-md p-10 rounded-[3rem] shadow-[0_0_50px_rgba(249,115,22,0.3)] flex flex-col items-center text-center z-10 max-w-xl w-full border-4 border-slate-600 mb-10">
              <div className="text-8xl mb-4">🏭</div>
              <h1 className="text-5xl font-black text-slate-100 mb-2 tracking-tight uppercase drop-shadow-lg">
                Fábrica de<br/><span className="text-5xl text-orange-400">Rimas</span>
              </h1>
              <p className="text-slate-300 mb-8 text-xl font-bold px-4 drop-shadow-md">
                Entre na linha de montagem e junte as palavras que terminam com o mesmo som!
              </p>

              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-3xl text-3xl font-black transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(194,65,12)] hover:translate-y-1 active:shadow-none active:translate-y-2 uppercase"
              >
                Escolher Trilha
              </button>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 2: SELEÇÃO DE TRILHA
      // ------------------------------------------------------------------------
      if (gameState === 'trackSelect') {
        return (
          <div className="min-h-screen factory-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <a href="../index.html" className="absolute top-4 left-4 text-orange-200 hover:text-orange-400 font-bold bg-slate-800/80 hover:bg-slate-700 px-4 py-2 rounded-full transition-colors z-20 border-2 border-orange-400">◀ Voltar</a>
            <h2 className="text-4xl font-black text-white mb-8 uppercase">Escolha a Trilha</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-2xl">
              {Array.from({length: 12}, (_, i) => {
                const locked = i + 1 > unlockedTracks;
                return (
                  <button
                    key={i}
                    disabled={locked}
                    onClick={() => startTrack(i)}
                    className={`aspect-square rounded-3xl flex flex-col items-center justify-center text-2xl font-black border-4 transition-all ${locked ? 'bg-slate-700 border-slate-600 opacity-50' : 'bg-orange-500 border-orange-300 hover:-translate-y-2 shadow-xl text-white'}`}
                  >
                    {locked ? '🔒' : <><span>{i + 1}</span><span className="text-sm">⚙️</span><span style={{color:'#fbbf24',fontSize:'0.9rem'}}>{'★'.repeat(window.HY && window.HY.stars ? HY.stars.getStars(i) : 0)}{'☆'.repeat(3 - (window.HY && window.HY.stars ? HY.stars.getStars(i) : 0))}</span></>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 3: TRILHA CONCLUÍDA
      // ------------------------------------------------------------------------
      if (gameState === 'trackComplete') {
        return (
          <div className="min-h-screen factory-bg flex flex-col items-center justify-center p-4">
            <div className="bg-slate-800/90 p-10 rounded-[3rem] border-4 border-orange-400 flex flex-col items-center text-center max-w-lg w-full">
              <div className="text-8xl mb-4">🏭</div>
              <h1 className="text-4xl font-black text-white mb-2">Trilha {currentTrack + 1} Concluída!</h1>
              <p className="text-slate-300 mb-6 text-xl">Você fabricou {stars} rimas!</p>
              <div className="flex gap-4 w-full">
                <button onClick={() => setGameState('trackSelect')} className="flex-1 py-4 bg-slate-700 text-white rounded-3xl text-xl font-black">Trilhas</button>
                {currentTrack + 1 < 12 && <button onClick={() => startTrack(currentTrack + 1)} className="flex-1 py-4 bg-orange-500 text-white rounded-3xl text-xl font-black">Próxima!</button>}
              </div>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 2: JOGABILIDADE (Múltiplas Mecânicas)
      // ------------------------------------------------------------------------
      return (
        <div className="min-h-screen w-full flex flex-col relative factory-bg text-white">
          
          {/* CABEÇALHO */}
          <div className="w-full flex justify-between items-center p-6 z-10 bg-slate-900/50 backdrop-blur-sm shadow-lg rounded-b-3xl border-b border-slate-700">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-400">{level.instruction}</span>
            </div>
            
            <div className="flex items-center text-3xl font-black text-amber-400 drop-shadow-md">
              <span className="mr-2">x{stars}</span>
              <span className="gear-anim">⚙️</span>
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