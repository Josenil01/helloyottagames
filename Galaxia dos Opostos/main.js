if (window.HY && window.HY.stars) HY.stars.init('galaxia-opostos');

const { useState, useEffect } = React;

    // --- DADOS DO JOGO: gerados dinamicamente de utils/words.js ---
    const LEVELS = (function() {
      var banco = window.HYWords || [];
      return window.HY && window.HY.challenges
        ? window.HY.challenges.buildLevels('oposto', banco, 12)
        : [];
    })();
    // Dados originais preservados (não utilizados na execução):
    const _oldLevels = [
      // --- TRILHA 1 ---
      {id:1, type:'match', target:'QUENTE', answer:'FRIO', options:['FRIO','GELADO','MÓRNO'], emoji:'🔥', instruction:'Encontre a palavra com o sentido OPOSTO (contrário)!'},
      {id:2, type:'match', target:'DIA', answer:'NOITE', options:['NOITE','TARDE','MANHÃ'], emoji:'☀️', instruction:'O que é o exato contrário dessa palavra?'},
      {id:3, type:'connect', leftWords:['GRANDE','CLARO','CHEIO'], rightWords:['ESCURO','VAZIO','PEQUENO'], matches:{'GRANDE':'PEQUENO','CLARO':'ESCURO','CHEIO':'VAZIO'}, emoji:'🔗', instruction:'Toque em uma palavra e depois no seu OPOSTO para ligá-las!'},
      {id:4, type:'intruder', words:['CHEIO','LOTADO','REPLETO','VAZIO'], answer:'VAZIO', emoji:'📦', instruction:'Atenção! Três palavras significam a mesma coisa. Qual é a INTRUSA (oposta)?'},
      {id:5, type:'sentence', preText:'O elefante é um animal muito ', boldText:'PEQUENO', postText:'.', answer:'GRANDE', options:['GRANDE','MINÚSCULO','LEVE'], emoji:'🐘', instruction:'Troque a palavra errada pelo seu OPOSTO para a frase fazer sentido!'},
      // --- TRILHA 2 ---
      {id:6, type:'match', target:'CHORAR', answer:'SORRIR', options:['GRITAR','SORRIR','FALAR'], emoji:'😭', instruction:'Arraste o oposto dessa ação!'},
      {id:7, type:'match', target:'FORTE', answer:'FRACO', options:['PODEROSO','FRACO','MUSCULOSO'], emoji:'💪', instruction:'O que é o exato contrário?'},
      {id:8, type:'connect', leftWords:['FORTE','ABERTO','LIMPO'], rightWords:['SUJO','FRACO','FECHADO'], matches:{'FORTE':'FRACO','ABERTO':'FECHADO','LIMPO':'SUJO'}, emoji:'🧩', instruction:'Ligue os pares que são o contrário um do outro!'},
      {id:9, type:'intruder', words:['RÁPIDO','VELOZ','LIGEIRO','LENTO'], answer:'LENTO', emoji:'🐆', instruction:'Ache o intruso! Qual destas tem o sentido contrário das outras?'},
      {id:10, type:'sentence', preText:'O sorvete de morango é bem ', boldText:'QUENTE', postText:'!', answer:'FRIO', options:['QUENTE','FRIO','SALGADO'], emoji:'🍦', instruction:'Troque a palavra errada pelo seu OPOSTO para a frase fazer sentido!'},
      // --- TRILHA 3 ---
      {id:11, type:'match', target:'ALTO', answer:'BAIXO', options:['BAIXO','MÉDIO','ENORME'], emoji:'📏', instruction:'Encontre o contrário!'},
      {id:12, type:'match', target:'DENTRO', answer:'FORA', options:['PERTO','FORA','LONGE'], emoji:'🏠', instruction:'O que é o oposto de DENTRO?'},
      {id:13, type:'connect', leftWords:['ALTO','DENTRO','PERTO'], rightWords:['LONGE','BAIXO','FORA'], matches:{'ALTO':'BAIXO','DENTRO':'FORA','PERTO':'LONGE'}, emoji:'🎯', instruction:'Encontre os 3 pares opostos!'},
      {id:14, type:'intruder', words:['BARULHO','RUÍDO','SOM','SILÊNCIO'], answer:'SILÊNCIO', emoji:'🔊', instruction:'Três palavras combinam. Qual é a intrusa (oposta)?'},
      {id:15, type:'sentence', preText:'A tartaruga caminha de forma ', boldText:'RÁPIDA', postText:'.', answer:'LENTA', options:['LENTA','VELOZ','APRESSADA'], emoji:'🐢', instruction:'Troque a palavra errada pelo seu OPOSTO para a frase fazer sentido!'},
      // --- TRILHA 4 ---
      {id:16, type:'match', target:'ANTIGO', answer:'NOVO', options:['VELHO','NOVO','MODERNO'], emoji:'⌚', instruction:'Qual é o contrário de ANTIGO?'},
      {id:17, type:'match', target:'DORMIR', answer:'ACORDAR', options:['DESCANSAR','ACORDAR','REPOUSAR'], emoji:'😴', instruction:'Encontre o oposto dessa ação!'},
      {id:18, type:'connect', leftWords:['FÁCIL','CEDO','SUJO'], rightWords:['TARDE','DIFÍCIL','LIMPO'], matches:{'FÁCIL':'DIFÍCIL','CEDO':'TARDE','SUJO':'LIMPO'}, emoji:'🔗', instruction:'Ligue cada palavra ao seu contrário!'},
      {id:19, type:'intruder', words:['ALEGRE','FELIZ','CONTENTE','TRISTE'], answer:'TRISTE', emoji:'😊', instruction:'Três palavras significam a mesma coisa. Qual é a intrusa?'},
      {id:20, type:'sentence', preText:'Minha mochila está muito ', boldText:'VAZIA', postText:'.', answer:'CHEIA', options:['CHEIA','LEVE','COLORIDA'], emoji:'🎒', instruction:'Troque pela palavra com o sentido oposto!'},
      // --- TRILHA 5 ---
      {id:21, type:'match', target:'COMPRIDO', answer:'CURTO', options:['CURTO','MÉDIO','GRANDE'], emoji:'📐', instruction:'Qual é o contrário de COMPRIDO?'},
      {id:22, type:'match', target:'COMEÇAR', answer:'TERMINAR', options:['INICIAR','TERMINAR','CONTINUAR'], emoji:'🏁', instruction:'Qual é o oposto de COMEÇAR?'},
      {id:23, type:'connect', leftWords:['COMPRIDO','GORDO','BONITO'], rightWords:['FEIO','CURTO','MAGRO'], matches:{'COMPRIDO':'CURTO','GORDO':'MAGRO','BONITO':'FEIO'}, emoji:'🔗', instruction:'Encontre os 3 pares opostos!'},
      {id:24, type:'intruder', words:['QUENTE','MORNO','TÉPIDO','FRIO'], answer:'FRIO', emoji:'🌡️', instruction:'Três palavras indicam calor. Qual é a intrusa (oposta)?'},
      {id:25, type:'sentence', preText:'A porta estava ', boldText:'ABERTA', postText:'.', answer:'FECHADA', options:['FECHADA','TRANCADA','BLOQUEADA'], emoji:'🚪', instruction:'Troque pela palavra com sentido oposto!'},
      // --- TRILHA 6 ---
      {id:26, type:'match', target:'CÉLEBRE', answer:'DESCONHECIDO', options:['FAMOSO','DESCONHECIDO','POPULAR'], emoji:'🌟', instruction:'Qual é o contrário de famoso?'},
      {id:27, type:'match', target:'LEMBRAR', answer:'ESQUECER', options:['RECORDAR','ESQUECER','MEMORIZAR'], emoji:'🧠', instruction:'Qual é o oposto de LEMBRAR?'},
      {id:28, type:'connect', leftWords:['NOVO','LIMPO','DURO'], rightWords:['MACIO','VELHO','SUJO'], matches:{'NOVO':'VELHO','LIMPO':'SUJO','DURO':'MACIO'}, emoji:'🔗', instruction:'Ligue os opostos!'},
      {id:29, type:'intruder', words:['FRIO','GELADO','CONGELADO','QUENTE'], answer:'QUENTE', emoji:'🧊', instruction:'Qual é o intruso (oposto)?'},
      {id:30, type:'sentence', preText:'O bebê está com fome e começa a ', boldText:'SORRIR', postText:'.', answer:'CHORAR', options:['CHORAR','GRITAR','CANTAR'], emoji:'👶', instruction:'Troque pela ação com sentido oposto!'},
      // --- TRILHA 7 ---
      {id:31, type:'match', target:'ENTRAR', answer:'SAIR', options:['SAIR','CHEGAR','VOLTAR'], emoji:'🚪', instruction:'Qual é o contrário de ENTRAR?'},
      {id:32, type:'match', target:'SUBIR', answer:'DESCER', options:['ESCALAR','DESCER','PULAR'], emoji:'⛰️', instruction:'Encontre o oposto de SUBIR!'},
      {id:33, type:'connect', leftWords:['ENTRAR','SUBIR','GANHAR'], rightWords:['DESCER','PERDER','SAIR'], matches:{'ENTRAR':'SAIR','SUBIR':'DESCER','GANHAR':'PERDER'}, emoji:'🔗', instruction:'Ligue as ações ao seu oposto!'},
      {id:34, type:'intruder', words:['ESCURO','SOMBRIO','TENEBROSO','CLARO'], answer:'CLARO', emoji:'🌑', instruction:'Qual não combina com as outras?'},
      {id:35, type:'sentence', preText:'O avião ', boldText:'DESCEU', postText:' devagar.', answer:'SUBIU', options:['SUBIU','VOOU','POUSOU'], emoji:'✈️', instruction:'Troque pelo oposto da ação!'},
      // --- TRILHA 8 ---
      {id:36, type:'match', target:'CERTO', answer:'ERRADO', options:['CORRETO','ERRADO','VERDADEIRO'], emoji:'✅', instruction:'Qual é o oposto de CERTO?'},
      {id:37, type:'match', target:'CLARO', answer:'ESCURO', options:['BRILHANTE','ESCURO','LUMINOSO'], emoji:'💡', instruction:'Encontre o contrário!'},
      {id:38, type:'connect', leftWords:['FRENTE','SEMPRE','TUDO'], rightWords:['NADA','ATRÁS','NUNCA'], matches:{'FRENTE':'ATRÁS','SEMPRE':'NUNCA','TUDO':'NADA'}, emoji:'🔗', instruction:'Ligue os opostos!'},
      {id:39, type:'intruder', words:['VERDADEIRO','CORRETO','CERTO','ERRADO'], answer:'ERRADO', emoji:'❌', instruction:'Três palavras significam a mesma coisa. Qual é a intrusa?'},
      {id:40, type:'sentence', preText:'O dia estava muito ', boldText:'ESCURO', postText:'.', answer:'CLARO', options:['CLARO','BRILHANTE','RADIANTE'], emoji:'☀️', instruction:'Troque pela palavra com sentido oposto!'},
      // --- TRILHA 9 ---
      {id:41, type:'match', target:'FALAR', answer:'CALAR', options:['GRITAR','CALAR','MURMURAR'], emoji:'🤫', instruction:'Qual é o contrário de FALAR?'},
      {id:42, type:'match', target:'CHEIO', answer:'VAZIO', options:['LOTADO','VAZIO','REPLETO'], emoji:'🪣', instruction:'Encontre o oposto!'},
      {id:43, type:'connect', leftWords:['GUERRA','ÓDIO','TRISTEZA'], rightWords:['ALEGRIA','PAZ','AMOR'], matches:{'GUERRA':'PAZ','ÓDIO':'AMOR','TRISTEZA':'ALEGRIA'}, emoji:'☮️', instruction:'Ligue os sentimentos opostos!'},
      {id:44, type:'intruder', words:['PERTO','PRÓXIMO','JUNTO','LONGE'], answer:'LONGE', emoji:'📍', instruction:'Qual é o intruso (oposto)?'},
      {id:45, type:'sentence', preText:'A criança é muito ', boldText:'TÍMIDA', postText:'.', answer:'CORAJOSA', options:['CORAJOSA','MEDROSA','ASSUSTADA'], emoji:'🦁', instruction:'Troque pela palavra com sentido oposto!'},
      // --- TRILHA 10 ---
      {id:46, type:'match', target:'GORDO', answer:'MAGRO', options:['FORTE','MAGRO','ROBUSTO'], emoji:'⚖️', instruction:'Qual é o contrário?'},
      {id:47, type:'match', target:'RICO', answer:'POBRE', options:['POBRE','ABASTADO','MILIONÁRIO'], emoji:'💰', instruction:'Encontre o oposto de RICO!'},
      {id:48, type:'connect', leftWords:['RICO','FORTE','JOVEM'], rightWords:['VELHO','POBRE','FRACO'], matches:{'RICO':'POBRE','FORTE':'FRACO','JOVEM':'VELHO'}, emoji:'🔗', instruction:'Ligue os pares opostos!'},
      {id:49, type:'intruder', words:['CANSADO','EXAUSTO','FATIGADO','ANIMADO'], answer:'ANIMADO', emoji:'😴', instruction:'Qual não combina?'},
      {id:50, type:'sentence', preText:'O atleta ficou muito ', boldText:'CANSADO', postText:' depois da corrida.', answer:'ANIMADO', options:['ANIMADO','DISPOSTO','ENERGIZADO'], emoji:'🏃', instruction:'Troque pelo contrário!'},
      // --- TRILHA 11 ---
      {id:51, type:'match', target:'SALVAR', answer:'DESTRUIR', options:['PROTEGER','DESTRUIR','GUARDAR'], emoji:'💥', instruction:'Qual é o oposto de SALVAR?'},
      {id:52, type:'match', target:'QUENTE', answer:'GELADO', options:['MORNO','GELADO','TÉPIDO'], emoji:'🌡️', instruction:'Encontre o contrário mais extremo!'},
      {id:53, type:'connect', leftWords:['AMIGO','HERÓI','LUZ'], rightWords:['ESCURIDÃO','INIMIGO','VILÃO'], matches:{'AMIGO':'INIMIGO','HERÓI':'VILÃO','LUZ':'ESCURIDÃO'}, emoji:'⚔️', instruction:'Ligue os opostos!'},
      {id:54, type:'intruder', words:['ALTO','ENORME','GIGANTE','PEQUENO'], answer:'PEQUENO', emoji:'📏', instruction:'Qual é o intruso?'},
      {id:55, type:'sentence', preText:'O vilão era muito ', boldText:'BONDOSO', postText:'.', answer:'MALVADO', options:['MALVADO','CRUEL','TERRÍVEL'], emoji:'😈', instruction:'Troque pelo oposto da qualidade!'},
      // --- TRILHA 12 ---
      {id:56, type:'match', target:'APARECER', answer:'DESAPARECER', options:['SURGIR','DESAPARECER','CHEGAR'], emoji:'✨', instruction:'Qual é o contrário de APARECER?'},
      {id:57, type:'match', target:'AMOR', answer:'ÓDIO', options:['CARINHO','ÓDIO','AFETO'], emoji:'❤️‍🔥', instruction:'Qual é o oposto de AMOR?'},
      {id:58, type:'connect', leftWords:['APARECER','AMOR','ESPERANÇA'], rightWords:['DESESPERO','ÓDIO','DESAPARECER'], matches:{'APARECER':'DESAPARECER','AMOR':'ÓDIO','ESPERANÇA':'DESESPERO'}, emoji:'🔗', instruction:'Ligue os grandes opostos!'},
      {id:59, type:'intruder', words:['ESPERANÇA','OTIMISMO','FÉ','DESESPERO'], answer:'DESESPERO', emoji:'🌈', instruction:'Qual não combina?'},
      {id:60, type:'sentence', preText:'O universo é muito ', boldText:'PEQUENÍSSIMO', postText:'.', answer:'ENORME', options:['ENORME','VASTO','INFINITO'], emoji:'🌌', instruction:'Troque pelo oposto correto!'},
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
          HY.stars.renderGrid('hy-track-grid', { onPlay: startTrack, accentColor: '#9333ea' });
        }
      }, [gameState]);

      // ------------------------------------------------------------------------
      // TELA 1: CAPA
      // ------------------------------------------------------------------------
      if (gameState === 'cover') {
        return (
          <div className="min-h-screen galaxy-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <a href="../index.html" className="absolute top-4 left-4 text-violet-200 hover:text-violet-400 font-bold bg-violet-900/80 hover:bg-violet-800 px-4 py-2 rounded-full transition-colors z-20 border-2 border-violet-400">◀ Voltar</a>
            {/* Decoração Estelar */}
            <div className="absolute top-10 left-10 text-6xl opacity-40 star-anim">⭐</div>
            <div className="absolute top-32 right-10 text-7xl opacity-40 star-anim" style={{animationDelay: '1s'}}>🪐</div>
            <div className="absolute bottom-10 left-20 text-6xl opacity-40 star-anim" style={{animationDelay: '2s'}}>🚀</div>
            <div className="absolute bottom-32 right-32 text-4xl opacity-40 star-anim" style={{animationDelay: '0.5s'}}>✨</div>

            <div className="bg-white/10 backdrop-blur-md p-10 rounded-[3rem] shadow-[0_0_50px_rgba(124,58,237,0.5)] flex flex-col items-center text-center z-10 max-w-xl w-full border-4 border-violet-400 mb-10">
              <div className="text-8xl mb-4">🌌</div>
              <h1 className="text-5xl font-black text-white mb-2 tracking-tight uppercase drop-shadow-lg">
                Galáxia dos<br/><span className="text-5xl text-violet-300">Opostos</span>
              </h1>
              <p className="text-violet-100 mb-8 text-xl font-bold px-4 drop-shadow-md">
                Prepare-se para uma viagem espacial descobrindo as palavras que significam o contrário (antônimos)!
              </p>

              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-pink-500 hover:bg-pink-600 text-white rounded-3xl text-3xl font-black transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(190,24,93)] hover:translate-y-1 active:shadow-none active:translate-y-2 uppercase"
              >
                Decolar!
              </button>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA DE SELEÇÃO DE TRILHA
      // ------------------------------------------------------------------------
      if (gameState === 'trackSelect') {
        return (
          <div className="min-h-screen galaxy-bg flex flex-col items-center p-6 pt-12">
            <a href="../index.html" className="self-start mb-6 font-bold bg-purple-900/60 text-white px-4 py-2 rounded-full border-2 border-purple-400">◀ Voltar</a>
            <h2 className="text-4xl font-black text-white mb-8 uppercase font-game">Escolha a Galáxia</h2>
            <div id="hy-track-grid" style={{width:'100%',maxWidth:'720px'}}></div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA DE TRILHA COMPLETA
      // ------------------------------------------------------------------------
      if (gameState === 'trackComplete') {
        return (
          <div className="min-h-screen galaxy-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="bg-purple-900/80 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center max-w-lg w-full border-4 border-purple-400">
              <div className="text-8xl mb-4 pop-anim">🏆</div>
              <h1 className="text-4xl font-black text-white mb-2 uppercase">Galáxia {currentTrack + 1} Completa!</h1>
              <p className="text-purple-200 mb-6 text-xl font-bold">Você descobriu todos os 5 opostos!</p>
              <div className="bg-purple-950 border-4 border-purple-700 rounded-3xl p-6 mb-8 w-full flex flex-col items-center">
                <div className="flex items-center text-6xl font-black text-amber-400">
                  <span className="mr-4">⭐</span> x{stars}
                </div>
              </div>
              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-amber-400 hover:bg-amber-300 text-purple-950 rounded-3xl text-2xl font-black transition-all transform hover:scale-105 uppercase"
              >
                Próxima Galáxia
              </button>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA FINAL (todas as trilhas completas)
      // ------------------------------------------------------------------------
      if (gameState === 'complete') {
        return (
          <div className="min-h-screen galaxy-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-[3rem] shadow-[0_0_50px_rgba(124,58,237,0.5)] flex flex-col items-center text-center z-10 max-w-lg w-full border-4 border-violet-400">
              <div className="text-8xl mb-4 pop-anim">🏆</div>
              <h1 className="text-5xl font-black text-white mb-2 uppercase drop-shadow-lg">
                Você é um Mestre!
              </h1>
              <p className="text-violet-200 mb-6 text-xl font-bold">Você descobriu todos os antônimos!</p>

              <div className="bg-violet-900/50 border-4 border-violet-400 rounded-3xl p-6 mb-8 w-full flex flex-col items-center">
                <span className="text-violet-200 font-bold uppercase mb-2">Estrelas Espaciais</span>
                <div className="flex items-center text-6xl font-black text-yellow-300">
                  <span className="mr-4">⭐</span> x{stars}
                </div>
              </div>

              <button
                onClick={() => setGameState('trackSelect')}
                className="w-full py-5 px-8 bg-violet-600 hover:bg-violet-700 text-white rounded-3xl text-2xl font-black transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(76,29,149)] hover:translate-y-1 active:shadow-none active:translate-y-2 uppercase"
              >
                Jogar Novamente
              </button>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // TELA 2: JOGABILIDADE (Múltiplas Mecânicas)
      // ------------------------------------------------------------------------
      return (
        <div className="min-h-screen w-full flex flex-col relative galaxy-bg text-white">

          {/* CABEÇALHO */}
          <div className="w-full flex justify-between items-center p-6 z-10 bg-black/20 backdrop-blur-sm shadow-lg rounded-b-3xl border-b border-violet-500/30">
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black uppercase text-violet-200 drop-shadow-md">
                Galáxia {currentTrack + 1} — Fase {(currentPhaseIndex - currentTrack * 5) + 1} de 5
              </h2>
              <span className="text-sm font-bold text-violet-300">{level.instruction}</span>
            </div>

            <div className="flex items-center text-3xl font-black text-yellow-300 drop-shadow-md">
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
