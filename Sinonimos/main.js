if (window.HY && window.HY.stars) HY.stars.init('sinonimos');

const { useState, useEffect } = React;

    // --- DADOS DO JOGO: gerados dinamicamente de utils/words.js ---
    const LEVELS = (function() {
      var banco = window.HYWords || [];
      return window.HY && window.HY.challenges
        ? window.HY.challenges.buildLevels('sinonimos', banco, 12)
        : [];
    })();
    // Dados originais preservados (não utilizados na execução):
    const _oldLevels = [
      // TRILHA 1
      { id: 1, type: 'match', target: 'FELIZ', answer: 'CONTENTE', options: ['CONTENTE', 'TRISTE', 'ZANGADO'], emoji: '😄', instruction: 'Encontre a palavra que significa o mesmo!' },
      { id: 2, type: 'match', target: 'RÁPIDO', answer: 'VELOZ', options: ['LENTO', 'VELOZ', 'PESADO'], emoji: '🐆', instruction: 'Qual destas palavras também significa rápido?' },
      { id: 3, type: 'connect', leftWords: ['CASA', 'PULAR', 'GAROTO'], rightWords: ['MENINO', 'LAR', 'SALTAR'], matches: { 'CASA': 'LAR', 'PULAR': 'SALTAR', 'GAROTO': 'MENINO' }, emoji: '🔗', instruction: 'Ligue cada palavra ao seu sinônimo!' },
      { id: 4, type: 'intruder', words: ['LINDO', 'BONITO', 'BELO', 'FEIO'], answer: 'FEIO', emoji: '🕵️‍♂️', instruction: 'Clique na palavra INTRUSA (a que é diferente das outras)!' },
      { id: 5, type: 'sentence', preText: 'O cachorro é muito ', boldText: 'ESPERTO', postText: '.', answer: 'INTELIGENTE', options: ['INTELIGENTE', 'DORMINHOCO', 'LIGEIRO'], emoji: '🐶', instruction: 'Mude a palavra destacada pelo seu sinônimo!' },
      // TRILHA 2
      { id: 6, type: 'match', target: 'SALTO', answer: 'PULO', options: ['PASSO', 'CORRIDA', 'PULO'], emoji: '🦘', instruction: 'O que é o mesmo que um salto?' },
      { id: 7, type: 'match', target: 'BONITO', answer: 'LINDO', options: ['FEIO', 'LINDO', 'TRISTE'], emoji: '🌟', instruction: 'Qual palavra tem o mesmo significado?' },
      { id: 8, type: 'connect', leftWords: ['GRANDE', 'BEM', 'CEDO'], rightWords: ['BOM', 'ENORME', 'LOGO'], matches: { 'GRANDE': 'ENORME', 'BEM': 'BOM', 'CEDO': 'LOGO' }, emoji: '🧩', instruction: 'Ligue os pares de sinônimos!' },
      { id: 9, type: 'intruder', words: ['GRANDE', 'ENORME', 'GIGANTE', 'PEQUENO'], answer: 'PEQUENO', emoji: '🐘', instruction: 'Qual destas NÃO é sinônimo das outras?' },
      { id: 10, type: 'sentence', preText: 'A sopa está muito ', boldText: 'SABOROSA', postText: '!', answer: 'DELICIOSA', options: ['QUENTE', 'DELICIOSA', 'SALGADA'], emoji: '🍲', instruction: 'Mude a palavra destacada pelo seu sinônimo!' },
      // TRILHA 3
      { id: 11, type: 'match', target: 'TRISTE', answer: 'ABATIDO', options: ['FELIZ', 'ABATIDO', 'ALEGRE'], emoji: '😢', instruction: 'Qual palavra significa a mesma coisa que TRISTE?' },
      { id: 12, type: 'match', target: 'COMEÇAR', answer: 'INICIAR', options: ['TERMINAR', 'INICIAR', 'PARAR'], emoji: '🚀', instruction: 'Encontre o sinônimo!' },
      { id: 13, type: 'connect', leftWords: ['INÍCIO', 'LENTO', 'FÁCIL'], rightWords: ['SIMPLES', 'COMEÇO', 'DEVAGAR'], matches: { 'INÍCIO': 'COMEÇO', 'LENTO': 'DEVAGAR', 'FÁCIL': 'SIMPLES' }, emoji: '🎯', instruction: 'Encontre os 3 pares!' },
      { id: 14, type: 'intruder', words: ['GULOSO', 'FURIOSO', 'ZANGADO', 'IRRITADO'], answer: 'GULOSO', emoji: '😡', instruction: 'Três palavras são sinônimos. Qual é a intrusa?' },
      { id: 15, type: 'sentence', preText: 'Aquele castelo é ', boldText: 'ANTIGO', postText: '.', answer: 'VELHO', options: ['NOVO', 'GIGANTE', 'VELHO'], emoji: '🏰', instruction: 'Mude a palavra destacada pelo seu sinônimo!' },
      // TRILHA 4
      { id: 16, type: 'match', target: 'CORAGEM', answer: 'BRAVURA', options: ['MEDO', 'BRAVURA', 'FRAQUEZA'], emoji: '🦁', instruction: 'Qual palavra tem o mesmo significado que CORAGEM?' },
      { id: 17, type: 'match', target: 'CHORO', answer: 'PRANTO', options: ['RISO', 'PRANTO', 'GRITO'], emoji: '😭', instruction: 'Encontre o sinônimo de CHORO!' },
      { id: 18, type: 'connect', leftWords: ['ANTIGO', 'BONITO', 'RÁPIDO'], rightWords: ['VELOZ', 'VELHO', 'LINDO'], matches: { 'ANTIGO': 'VELHO', 'BONITO': 'LINDO', 'RÁPIDO': 'VELOZ' }, emoji: '🔗', instruction: 'Ligue os sinônimos!' },
      { id: 19, type: 'intruder', words: ['ALEGRE', 'FELIZ', 'CONTENTE', 'ZANGADO'], answer: 'ZANGADO', emoji: '😊', instruction: 'Qual é a palavra intrusa?' },
      { id: 20, type: 'sentence', preText: 'O menino ficou ', boldText: 'ASSUSTADO', postText: ' com o trovão.', answer: 'APAVORADO', options: ['APAVORADO', 'ANIMADO', 'CONTENTE'], emoji: '⛈️', instruction: 'Substitua pelo sinônimo correto!' },
      // TRILHA 5
      { id: 21, type: 'match', target: 'CAMINHO', answer: 'TRILHA', options: ['PAREDE', 'TRILHA', 'TETO'], emoji: '🛤️', instruction: 'Qual palavra significa o mesmo que CAMINHO?' },
      { id: 22, type: 'match', target: 'OCEANO', answer: 'MAR', options: ['RIO', 'MAR', 'LAGO'], emoji: '🌊', instruction: 'Encontre o sinônimo de OCEANO!' },
      { id: 23, type: 'connect', leftWords: ['AJUDAR', 'OLHAR', 'FALAR'], rightWords: ['DIZER', 'AUXILIAR', 'ENXERGAR'], matches: { 'AJUDAR': 'AUXILIAR', 'OLHAR': 'ENXERGAR', 'FALAR': 'DIZER' }, emoji: '🤝', instruction: 'Ligue os pares de ações sinônimas!' },
      { id: 24, type: 'intruder', words: ['MAR', 'OCEANO', 'LAGO', 'AZUL'], answer: 'AZUL', emoji: '🌊', instruction: 'Qual não é sinônimo das outras?' },
      { id: 25, type: 'sentence', preText: 'A criança está muito ', boldText: 'CANSADA', postText: '.', answer: 'EXAUSTA', options: ['EXAUSTA', 'ANIMADA', 'ACORDADA'], emoji: '😴', instruction: 'Substitua pelo sinônimo correto!' },
      // TRILHA 6
      { id: 26, type: 'match', target: 'PRESENTE', answer: 'BRINDE', options: ['PASSADO', 'BRINDE', 'FUTURO'], emoji: '🎁', instruction: 'Qual palavra significa presente (gift)?' },
      { id: 27, type: 'match', target: 'IRMÃO', answer: 'MANO', options: ['PRIMO', 'MANO', 'TATA'], emoji: '👫', instruction: 'Encontre um sinônimo informal para IRMÃO!' },
      { id: 28, type: 'connect', leftWords: ['TRABALHO', 'PREGUIÇA', 'VITÓRIA'], rightWords: ['CONQUISTA', 'TAREFA', 'MOLEZA'], matches: { 'TRABALHO': 'TAREFA', 'PREGUIÇA': 'MOLEZA', 'VITÓRIA': 'CONQUISTA' }, emoji: '🏆', instruction: 'Ligue os sinônimos!' },
      { id: 29, type: 'intruder', words: ['RÁPIDO', 'VELOZ', 'LIGEIRO', 'DEVAGAR'], answer: 'DEVAGAR', emoji: '🐢', instruction: 'Qual não combina com as outras?' },
      { id: 30, type: 'sentence', preText: 'O professor deu uma ', boldText: 'EXPLICAÇÃO', postText: ' muito boa.', answer: 'AULA', options: ['AULA', 'PROVA', 'RECREIO'], emoji: '📚', instruction: 'Substitua pelo sinônimo correto!' },
      // TRILHA 7
      { id: 31, type: 'match', target: 'GORDO', answer: 'ROBUSTO', options: ['MAGRO', 'ROBUSTO', 'ALTO'], emoji: '💪', instruction: 'Encontre um sinônimo positivo para GORDO!' },
      { id: 32, type: 'match', target: 'MORRER', answer: 'FALECER', options: ['NASCER', 'FALECER', 'CRESCER'], emoji: '🕊️', instruction: 'Qual é o sinônimo mais formal?' },
      { id: 33, type: 'connect', leftWords: ['ESCURO', 'SILÊNCIO', 'FRIO'], rightWords: ['GELO', 'TREVAS', 'QUIETUDE'], matches: { 'ESCURO': 'TREVAS', 'SILÊNCIO': 'QUIETUDE', 'FRIO': 'GELO' }, emoji: '🌙', instruction: 'Ligue as palavras de mesma ideia!' },
      { id: 34, type: 'intruder', words: ['FALAR', 'DIZER', 'NARRAR', 'CALAR'], answer: 'CALAR', emoji: '🗣️', instruction: 'Qual não é sinônimo das outras?' },
      { id: 35, type: 'sentence', preText: 'O céu está ', boldText: 'LIMPO', postText: ' hoje.', answer: 'CLARO', options: ['CLARO', 'NUBLADO', 'ESCURO'], emoji: '☀️', instruction: 'Substitua pelo sinônimo correto!' },
      // TRILHA 8
      { id: 36, type: 'match', target: 'BRINCAR', answer: 'JOGAR', options: ['ESTUDAR', 'JOGAR', 'DORMIR'], emoji: '🎮', instruction: 'Qual palavra é sinônimo de BRINCAR?' },
      { id: 37, type: 'match', target: 'ESPERTO', answer: 'INTELIGENTE', options: ['BURRO', 'INTELIGENTE', 'LENTO'], emoji: '🧠', instruction: 'Encontre o sinônimo!' },
      { id: 38, type: 'connect', leftWords: ['COMPRAR', 'VENDER', 'TROCAR'], rightWords: ['PERMUTAR', 'ADQUIRIR', 'COMERCIAR'], matches: { 'COMPRAR': 'ADQUIRIR', 'VENDER': 'COMERCIAR', 'TROCAR': 'PERMUTAR' }, emoji: '💰', instruction: 'Ligue os sinônimos de comércio!' },
      { id: 39, type: 'intruder', words: ['ESTUDAR', 'APRENDER', 'MEMORIZAR', 'ESQUECER'], answer: 'ESQUECER', emoji: '📖', instruction: 'Qual não combina com as outras?' },
      { id: 40, type: 'sentence', preText: 'A menina é muito ', boldText: 'ESTUDIOSA', postText: '.', answer: 'APLICADA', options: ['APLICADA', 'PREGUIÇOSA', 'DESATENTA'], emoji: '📝', instruction: 'Substitua pelo sinônimo correto!' },
      // TRILHA 9
      { id: 41, type: 'match', target: 'VIAJAR', answer: 'PERCORRER', options: ['PARAR', 'PERCORRER', 'FICAR'], emoji: '✈️', instruction: 'Qual palavra tem o mesmo sentido de VIAJAR?' },
      { id: 42, type: 'match', target: 'DESCOBRIR', answer: 'ENCONTRAR', options: ['PERDER', 'ENCONTRAR', 'ESCONDER'], emoji: '🔍', instruction: 'Encontre o sinônimo!' },
      { id: 43, type: 'connect', leftWords: ['FELICIDADE', 'TRISTEZA', 'RAIVA'], rightWords: ['IRA', 'ALEGRIA', 'MELANCOLIA'], matches: { 'FELICIDADE': 'ALEGRIA', 'TRISTEZA': 'MELANCOLIA', 'RAIVA': 'IRA' }, emoji: '❤️', instruction: 'Ligue os sentimentos sinônimos!' },
      { id: 44, type: 'intruder', words: ['CORAJOSO', 'BRAVO', 'VALENTE', 'MEDROSO'], answer: 'MEDROSO', emoji: '🛡️', instruction: 'Qual não é sinônimo das outras?' },
      { id: 45, type: 'sentence', preText: 'O gato é ', boldText: 'ÁGIL', postText: ' e rápido.', answer: 'VELOZ', options: ['VELOZ', 'LENTO', 'CANSADO'], emoji: '🐈', instruction: 'Substitua pelo sinônimo correto!' },
      // TRILHA 10
      { id: 46, type: 'match', target: 'CONSTRUIR', answer: 'EDIFICAR', options: ['DESTRUIR', 'EDIFICAR', 'DERRUBAR'], emoji: '🏗️', instruction: 'Qual é o sinônimo mais formal de CONSTRUIR?' },
      { id: 47, type: 'match', target: 'MÁGICO', answer: 'ENCANTADOR', options: ['CHATO', 'ENCANTADOR', 'NORMAL'], emoji: '🪄', instruction: 'Encontre o sinônimo!' },
      { id: 48, type: 'connect', leftWords: ['AMIGO', 'INIMIGO', 'ESTRANHO'], rightWords: ['DESCONHECIDO', 'COMPANHEIRO', 'ADVERSÁRIO'], matches: { 'AMIGO': 'COMPANHEIRO', 'INIMIGO': 'ADVERSÁRIO', 'ESTRANHO': 'DESCONHECIDO' }, emoji: '👥', instruction: 'Ligue os sinônimos!' },
      { id: 49, type: 'intruder', words: ['BONITO', 'LINDO', 'BELO', 'HORRÍVEL'], answer: 'HORRÍVEL', emoji: '💐', instruction: 'Qual não é sinônimo das outras?' },
      { id: 50, type: 'sentence', preText: 'O menino ', boldText: 'CORREU', postText: ' até a escola.', answer: 'APRESSOU-SE', options: ['APRESSOU-SE', 'CAMINHOU', 'PAROU'], emoji: '🏃', instruction: 'Substitua pelo sinônimo correto!' },
      // TRILHA 11
      { id: 51, type: 'match', target: 'CONVERSA', answer: 'DIÁLOGO', options: ['BRIGA', 'DIÁLOGO', 'SILÊNCIO'], emoji: '💬', instruction: 'Qual palavra significa CONVERSA?' },
      { id: 52, type: 'match', target: 'ALEGRE', answer: 'ANIMADO', options: ['TRISTE', 'ANIMADO', 'QUIETO'], emoji: '🎉', instruction: 'Encontre o sinônimo!' },
      { id: 53, type: 'connect', leftWords: ['PEIXE', 'AVE', 'INSETO'], rightWords: ['BORBOLETA', 'SARDINHA', 'GAVIÃO'], matches: { 'PEIXE': 'SARDINHA', 'AVE': 'GAVIÃO', 'INSETO': 'BORBOLETA' }, emoji: '🐠', instruction: 'Ligue o tipo ao exemplo!' },
      { id: 54, type: 'intruder', words: ['MENTIRA', 'FALSIDADE', 'ENGANO', 'VERDADE'], answer: 'VERDADE', emoji: '🤥', instruction: 'Qual não é sinônimo das outras?' },
      { id: 55, type: 'sentence', preText: 'A festa foi ', boldText: 'MARAVILHOSA', postText: '!', answer: 'FANTÁSTICA', options: ['FANTÁSTICA', 'HORRÍVEL', 'CHATA'], emoji: '🎊', instruction: 'Substitua pelo sinônimo correto!' },
      // TRILHA 12
      { id: 56, type: 'match', target: 'ESQUECER', answer: 'OLVIDAR', options: ['LEMBRAR', 'OLVIDAR', 'RECORDAR'], emoji: '🧠', instruction: 'Qual é o sinônimo mais literário de ESQUECER?' },
      { id: 57, type: 'match', target: 'MOSTRAR', answer: 'EXIBIR', options: ['ESCONDER', 'EXIBIR', 'GUARDAR'], emoji: '🎭', instruction: 'Encontre o sinônimo!' },
      { id: 58, type: 'connect', leftWords: ['TERRA', 'LUA', 'SOL'], rightWords: ['ASTRO', 'PLANETA', 'SATÉLITE'], matches: { 'TERRA': 'PLANETA', 'LUA': 'SATÉLITE', 'SOL': 'ASTRO' }, emoji: '🌍', instruction: 'Ligue cada astro ao seu tipo!' },
      { id: 59, type: 'intruder', words: ['DORMINDO', 'REPOUSANDO', 'DESCANSANDO', 'CORRENDO'], answer: 'CORRENDO', emoji: '😴', instruction: 'Qual não é sinônimo das outras?' },
      { id: 60, type: 'sentence', preText: 'O herói foi muito ', boldText: 'CORAJOSO', postText: '.', answer: 'VALENTE', options: ['VALENTE', 'COVARDE', 'ASSUSTADO'], emoji: '🦸', instruction: 'Substitua pelo sinônimo correto!' },
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
      const [shakeWrong, setShakeWrong] = useState(null); // Agora guarda o valor específico para animar apenas o botão errado
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
          alert("Escolha primeiro uma palavra da coluna da esquerda!");
          return;
        }
        
        if (level.matches[selectedLeft] === rightWord) {
          // Acertou o par
          const newSolved = [...solvedPairs, selectedLeft];
          setSolvedPairs(newSolved);
          setSelectedLeft(null);
          
          // Verifica se terminou todas as 3 ligações
          if (newSolved.length === level.leftWords.length) {
            handleWin();
          }
        } else {
          // Errou a ligação
          setShakeWrong(rightWord);
          setTimeout(() => setShakeWrong(null), 400);
          setSelectedLeft(null); // Limpa a seleção para a criança tentar novamente do zero
        }
      };

      // --- Drag & Drop Handlers (usado nas mecânicas 1 e 4) ---
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
          HY.stars.renderGrid('hy-track-grid', { onPlay: startTrack, accentColor: '#10b981' });
        }
      }, [gameState]);

      // ------------------------------------------------------------------------
      // TELA 1: CAPA
      // ------------------------------------------------------------------------
      if (gameState === 'cover') {
        return (
          <div className="min-h-screen jungle-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <a href="../index.html" className="absolute top-4 left-4 text-green-900 hover:text-green-700 font-bold bg-green-200/80 hover:bg-green-300 px-4 py-2 rounded-full transition-colors z-20 border-2 border-green-400">◀ Voltar</a>
            <div className="absolute top-10 left-10 text-6xl opacity-40 leaf-anim">🌿</div>
            <div className="absolute top-32 right-10 text-7xl opacity-40 leaf-anim" style={{animationDelay: '1s'}}>🦜</div>
            <div className="absolute bottom-10 left-20 text-6xl opacity-40 leaf-anim" style={{animationDelay: '2s'}}>🐒</div>

            <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center z-10 max-w-xl w-full border-8 border-emerald-600 mb-10">
              <div className="text-8xl mb-4">🧭</div>
              <h1 className="text-5xl font-black text-emerald-800 mb-2 tracking-tight uppercase">
                Exploradores de<br/><span className="text-5xl text-emerald-500">Sinônimos</span>
              </h1>
              <p className="text-gray-600 mb-8 text-xl font-bold px-4">
                Prepare-se para uma aventura na selva das palavras que significam o mesmo!
              </p>
              
              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-amber-500 hover:bg-amber-600 text-white rounded-3xl text-3xl font-black transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(217,119,6)] hover:translate-y-1 active:shadow-none active:translate-y-2 uppercase"
              >
                Iniciar Aventura!
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
          <div className="min-h-screen jungle-bg flex flex-col items-center p-6 pt-12">
            <a href="../index.html" className="self-start mb-6 font-bold bg-green-200/80 text-green-900 px-4 py-2 rounded-full border-2 border-green-400">◀ Voltar</a>
            <h2 className="text-4xl font-black text-white mb-8 uppercase font-game">Escolha a Trilha</h2>
            <div id="hy-track-grid" style={{width:'100%',maxWidth:'720px'}}></div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA: TRILHA COMPLETA
      // ------------------------------------------------------------------------
      if (gameState === 'trackComplete') {
        return (
          <div className="min-h-screen jungle-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center max-w-lg w-full border-8 border-emerald-600">
              <div className="text-8xl mb-4 pop-anim">🏆</div>
              <h1 className="text-4xl font-black text-emerald-800 mb-2 uppercase">Trilha {currentTrack + 1} Completa!</h1>
              <p className="text-gray-600 mb-6 text-xl font-bold">Você dominou todos os 5 desafios!</p>
              <div className="bg-emerald-100 border-4 border-emerald-400 rounded-3xl p-6 mb-8 w-full flex flex-col items-center">
                <div className="flex items-center text-6xl font-black text-amber-500">
                  <span className="mr-4">⭐</span> x{stars}
                </div>
              </div>
              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl text-2xl font-black transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(5,150,105)] uppercase"
              >
                Escolher Próxima Trilha
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
          <div className="min-h-screen jungle-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center z-10 max-w-lg w-full border-8 border-emerald-600">
              <div className="text-8xl mb-4 pop-anim">🏆</div>
              <h1 className="text-5xl font-black text-emerald-800 mb-2 uppercase">
                Parabéns!
              </h1>
              <p className="text-gray-600 mb-6 text-xl font-bold">Você descobriu todos os sinônimos!</p>

              <div className="bg-emerald-100 border-4 border-emerald-400 rounded-3xl p-6 mb-8 w-full flex flex-col items-center">
                <span className="text-emerald-800 font-bold uppercase mb-2">Estrelas de Explorador</span>
                <div className="flex items-center text-6xl font-black text-amber-500">
                  <span className="mr-4">⭐</span> x{stars}
                </div>
              </div>

              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl text-2xl font-black transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(5,150,105)] hover:translate-y-1 active:shadow-none active:translate-y-2 uppercase"
              >
                Escolher Trilha
              </button>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 2: JOGABILIDADE (Múltiplas Mecânicas)
      // ------------------------------------------------------------------------
      return (
        <div className="min-h-screen w-full flex flex-col relative jungle-bg text-emerald-900">
          
          {/* CABEÇALHO */}
          <div className="w-full flex justify-between items-center p-6 z-10 bg-white/30 backdrop-blur-sm shadow-sm rounded-b-3xl">
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black uppercase text-emerald-800">
                Fase {level.id} de {LEVELS.length}
              </h2>
              <span className="text-sm font-bold text-emerald-700">{level.instruction}</span>
            </div>
            
            <div className="flex items-center text-3xl font-black text-amber-500 drop-shadow-md">
              <span className="mr-2">x{stars}</span>
              <span>⭐</span>
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