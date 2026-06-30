window.HYChallenges = window.HYChallenges || {};

window.HYChallenges.Intruder = function({ level, isSuccess, shakeWrong, wrongAnswers, onAnswer }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-[6rem] md:text-[8rem] mb-8 pop-anim drop-shadow-xl">{level.emoji}</div>

      <div className="bg-slate-800/90 p-6 md:p-10 rounded-[3rem] border-4 border-slate-600 shadow-2xl w-full max-w-3xl relative overflow-hidden">
        <div className="grid grid-cols-2 gap-4 md:gap-6 relative z-10">
          {level.words.map((word, i) => {
            const isCorrectAnswer = word === level.answer;
            const isClickedAndNotIntruder = wrongAnswers.includes(word);
            const isShaking = shakeWrong === word;

            let btnClass = "bg-slate-700 hover:bg-slate-600 border-b-8 border-slate-900 text-amber-400 hover:-translate-y-2";
            if (isSuccess && isCorrectAnswer) {
              btnClass = "bg-emerald-600 border-b-8 border-emerald-800 text-white pop-anim ring-8 ring-emerald-400";
            } else if (isSuccess && !isCorrectAnswer) {
              btnClass = "bg-slate-800 border-b-8 border-slate-900 text-slate-600 opacity-50";
            } else if (isClickedAndNotIntruder) {
              btnClass = "bg-red-600 border-b-8 border-red-800 text-white opacity-80 cursor-not-allowed";
            }

            return (
              <button
                key={i}
                onClick={() => onAnswer(word)}
                disabled={isClickedAndNotIntruder || isSuccess}
                className={`h-24 md:h-36 rounded-2xl md:rounded-[2rem] flex items-center justify-center transition-all duration-300 shadow-lg ${btnClass} ${isShaking ? 'shake-anim' : ''}`}
              >
                <span className="text-xl md:text-4xl font-black tracking-widest">{word}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
