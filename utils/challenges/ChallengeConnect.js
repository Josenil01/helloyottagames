window.HYChallenges = window.HYChallenges || {};

window.HYChallenges.Connect = function({ level, shakeWrong, solvedPairs, selectedLeft, onSelectLeft, onConnectRight }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-[5rem] mb-4 pop-anim">{level.emoji}</div>

      <div className="bg-slate-800/90 p-4 md:p-8 rounded-[3rem] border-4 border-slate-600 shadow-2xl w-full max-w-4xl relative">
        <div className="flex justify-between h-[360px] md:h-[420px] relative w-full">

          {/* Coluna da Esquerda */}
          <div className="flex flex-col justify-around w-[35%] z-10">
            {level.leftWords.map((word) => {
              const isSolved = solvedPairs.includes(word);
              const isSelected = selectedLeft === word;
              let btnClass = "bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-800 text-slate-200 transition-all hover:-translate-y-1 shadow-md";
              if (isSolved) {
                btnClass = "bg-emerald-600 border-b-4 border-emerald-800 text-white opacity-90 cursor-default scale-105";
              } else if (isSelected) {
                btnClass = "bg-amber-500 border-b-4 border-amber-700 text-slate-900 ring-4 ring-amber-300 scale-105";
              }
              return (
                <button
                  key={`L-${word}`}
                  onClick={() => !isSolved && onSelectLeft(word)}
                  className={`h-20 md:h-24 rounded-2xl flex items-center justify-center px-2 md:px-6 ${btnClass}`}
                >
                  <span className="text-lg md:text-2xl lg:text-3xl font-black uppercase tracking-wider">{word}</span>
                </button>
              );
            })}
          </div>

          {/* SVG linhas */}
          <svg className="absolute top-0 bottom-0 left-[35%] w-[30%] h-full pointer-events-none z-0">
            {solvedPairs.map((leftWord) => {
              const rightWord = level.matches[leftWord];
              const leftIndex = level.leftWords.indexOf(leftWord);
              const rightIndex = level.rightWords.indexOf(rightWord);
              const y1 = ['16.66%', '50%', '83.33%'][leftIndex];
              const y2 = ['16.66%', '50%', '83.33%'][rightIndex];
              return (
                <g key={`line-${leftWord}`}>
                  <line x1="0%" y1={y1} x2="100%" y2={y2} stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" className="line-anim" />
                  <circle cx="0%" cy={y1} r="8" fill="#d97706" className="pop-anim" />
                  <circle cx="100%" cy={y2} r="8" fill="#d97706" className="pop-anim" />
                </g>
              );
            })}
          </svg>

          {/* Coluna da Direita */}
          <div className="flex flex-col justify-around w-[35%] z-10">
            {level.rightWords.map((word) => {
              const isSolved = Object.keys(level.matches).find(l => level.matches[l] === word && solvedPairs.includes(l));
              const isShaking = shakeWrong === word;
              let btnClass = "bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-800 text-slate-200 transition-all hover:-translate-y-1 shadow-md";
              if (isSolved) {
                btnClass = "bg-emerald-600 border-b-4 border-emerald-800 text-white opacity-90 cursor-default scale-105";
              } else if (isShaking) {
                btnClass = "bg-red-600 border-b-4 border-red-800 text-white";
              }
              return (
                <button
                  key={`R-${word}`}
                  onClick={() => !isSolved && onConnectRight(word)}
                  className={`h-20 md:h-24 rounded-2xl flex items-center justify-center px-1 md:px-4 ${btnClass} ${isShaking ? 'shake-anim' : ''}`}
                >
                  <span className="text-base md:text-xl lg:text-3xl font-black uppercase tracking-wider">{word}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
