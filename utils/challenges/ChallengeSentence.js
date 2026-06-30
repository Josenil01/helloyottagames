window.HYChallenges = window.HYChallenges || {};

window.HYChallenges.Sentence = function({ level, isSuccess, shakeWrong, wrongAnswers, onAnswer, onDragStart, onDragOver, onDrop }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-[5rem] mb-4 pop-anim">{level.emoji}</div>

      <div className="bg-slate-800 rounded-[2rem] border-4 border-slate-600 p-8 md:p-12 shadow-2xl text-center mb-12 max-w-4xl w-full leading-relaxed relative overflow-hidden">
        <span className="text-3xl md:text-5xl font-bold text-slate-200 relative z-10">
          {level.preText}
        </span>

        <span
          className={`inline-block mx-2 px-6 py-2 rounded-2xl border-4 align-middle transition-all relative z-10 ${
            isSuccess
              ? 'bg-emerald-600 border-emerald-400 text-white pop-anim shadow-lg'
              : 'bg-slate-900 border-amber-500 border-dashed text-amber-500'
          } ${shakeWrong ? 'shake-anim border-red-500 bg-red-900/80 text-red-200' : ''}`}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => {
            if (!isSuccess) alert("Toque ou arraste uma das opções amarelas aqui para dentro para consertar a frase!");
          }}
        >
          {isSuccess ? (
            <span className="font-black text-2xl md:text-5xl uppercase">{level.answer}</span>
          ) : (
            <span className="font-black text-2xl md:text-5xl uppercase line-through opacity-60 text-red-400 decoration-red-500 decoration-4">
              {level.boldText}
            </span>
          )}
        </span>

        <span className="text-3xl md:text-5xl font-bold text-slate-200 relative z-10">
          {level.postText}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-4 md:gap-8 w-full">
        {level.options.map((opt, i) => {
          const isWrong = wrongAnswers.includes(opt);
          let btnClass = "bg-amber-500 hover:bg-amber-400 border-b-8 border-amber-700 text-slate-900 cursor-grab active:cursor-grabbing hover:-translate-y-2 shadow-lg";
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
              className={`px-4 py-4 md:px-8 md:py-5 rounded-2xl md:rounded-[2rem] flex items-center justify-center transition-all duration-300 ${btnClass} ${shakeWrong === opt ? 'shake-anim' : ''}`}
            >
              <span className="text-xl md:text-3xl font-black uppercase tracking-wider">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
