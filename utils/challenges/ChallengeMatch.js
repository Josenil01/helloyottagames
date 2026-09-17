window.HYChallenges = window.HYChallenges || {};

window.HYChallenges.Match = function({ level, isSuccess, shakeWrong, wrongAnswers, onAnswer, onDragStart, onDragOver, onDrop }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col items-center mb-12 w-full">
        {/* Emoji do Nível */}
        <div className="text-6xl mb-4 pop-anim drop-shadow-xl">{level.emoji}</div>

        {/* Container das Caixas e Sinal de Igual (Lado a Lado / Largura Total) */}
        <div className="flex flex-row items-center justify-center w-full gap-4 md:gap-6">

          {/* Caixa do Alvo - Largura dinâmica adaptada ao texto */}
          <div className="bg-slate-800 rounded-[2rem] border-4 border-slate-600 px-8 py-6 md:px-12 md:py-8 shadow-xl text-center relative flex items-center justify-center">
            <span className="text-4xl md:text-6xl font-black text-white tracking-wider relative z-10 whitespace-nowrap">
              {level.target}
            </span>
          </div>

          {/* Sinal de Igual */}
          <div className="text-4xl md:text-5xl font-black text-slate-500">=</div>

          {/* Zona de Soltar (Drop Zone) - Largura dinâmica adaptada à resposta */}
          <div
            className={`rounded-[2rem] border-4 px-8 md:px-12 min-w-[12rem] md:min-w-[16rem] h-32 md:h-40 shadow-xl flex items-center justify-center transition-all ${
              isSuccess
                ? 'bg-emerald-600 border-emerald-400 pop-anim shadow-[0_0_30px_rgba(16,185,129,0.5)] text-white'
                : 'bg-slate-900/50 border-amber-500 border-dashed backdrop-blur-sm text-amber-500'
            } ${shakeWrong ? 'shake-anim border-red-500 bg-red-900/80' : ''}`}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            {isSuccess ? (
              <span className="text-4xl md:text-6xl font-black drop-shadow-md whitespace-nowrap">
                {level.answer}
              </span>
            ) : (
              <span className="opacity-60 text-lg md:text-xl font-black animate-pulse uppercase text-center px-2 whitespace-nowrap">
                Arraste a<br/>letra aqui!
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Botões de Opções - Largura dinâmica adaptada a cada palavra */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full">
        {level.options.map((opt, i) => {
          const isWrong = wrongAnswers.includes(opt);
          let btnClass = "bg-amber-500 hover:bg-amber-400 border-b-8 border-amber-700 text-slate-900 cursor-grab active:cursor-grabbing hover:-translate-y-2";

          if (isWrong) {
            btnClass = "bg-slate-700 border-b-8 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed transform translate-y-2";
          } else if (isSuccess) {
            btnClass = "bg-amber-500 opacity-0 pointer-events-none";
          }

          return (
            <button
              key={i}
              draggable={!isWrong && !isSuccess}
              onDragStart={(e) => onDragStart(e, opt)}
              onClick={() => onAnswer(opt)}
              disabled={isWrong || isSuccess}
              className={`px-6 py-4 md:px-10 md:py-6 min-w-fit rounded-2xl md:rounded-[2rem] flex items-center justify-center transition-all duration-300 shadow-xl ${btnClass} ${shakeWrong === opt ? 'shake-anim' : ''}`}
            >
              <span className="text-3xl md:text-5xl font-black tracking-widest uppercase whitespace-nowrap">
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
