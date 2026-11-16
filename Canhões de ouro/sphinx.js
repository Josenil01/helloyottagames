window.SphinxApp = function SphinxApp() {
  const [screen, setScreen] = React.useState('cover');
  const [track, setTrack] = React.useState(0);
  const [step, setStep] = React.useState(0);
  const [mood, setMood] = React.useState('idle');
  const [wrong, setWrong] = React.useState([]);
  const [options, setOptions] = React.useState([]);
  const [message, setMessage] = React.useState('');
  const [characterIndex, setCharacterIndex] = React.useState(0);
  const characters = ['female-a','male-a','female-b','male-b','female-c','male-c','female-d','male-d','female-e','male-e','female-f','male-f'];
  const characterFile = '../assets/image/SVG/sphinx-visitors/character-' + characters[characterIndex] + '.svg';
  React.useEffect(() => {
    characters.forEach(name => { const image = new Image(); image.src = '../assets/image/SVG/sphinx-visitors/character-' + name + '.svg'; });
  }, []);
  const timer = React.useRef(null);
  const busy = React.useRef(false);
  const person = React.useRef(null);
  const mouth = React.useRef(null);
  const scene = React.useRef(null);
  const riddle = SPHINX_TRACKS[track].riddles[step];
  React.useEffect(() => () => clearTimeout(timer.current), []);
  React.useLayoutEffect(() => {
    const hud = document.getElementById('hy-hud');
    if (hud) hud.style.display = screen === 'playing' ? 'flex' : 'none';
    if (screen !== 'playing') { HY.elapsed.stopTrail(); HY.progress.hide(); }
  }, [screen]);
  function leave(destination) {
    clearTimeout(timer.current); busy.current = false; setMood('idle'); setScreen(destination);
  }
  function prepare(trackIndex, challengeIndex) {
    clearTimeout(timer.current); busy.current = false;
    setTrack(trackIndex); setStep(challengeIndex); setMood('idle'); setWrong([]); setMessage('');
    setOptions(HY.shuffle(SPHINX_TRACKS[trackIndex].riddles[challengeIndex].slice(1, 4)));
    HY.score.startChallenge();
  }
  function startTrack(index) {
    HY.score.reset(); prepare(index, 0); setScreen('playing');
  }
  React.useEffect(() => {
    if (screen !== 'map') return;
    HY.stars.renderGrid('sphinx-map', { onPlay: startTrack, emoji: () => '𓂀', label: i => `Trilha ${i + 1}`, accentColor: '#b7791f' });
    document.querySelectorAll('#sphinx-map .hy-track-card:not(.hy-locked)').forEach(card => {
      card.tabIndex = 0; card.setAttribute('role', 'button');
      card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } };
    });
  }, [screen]);
  function answer(value) {
    if (busy.current || wrong.includes(value) || mood === 'happy') return;
    busy.current = true;
    if (value === riddle[1]) {
      HY.playWin(); HY.score.correct(); setMood('happy');
      setMessage(`Isso mesmo! ${riddle[4]}`);
      if (step === 4) { HY.stars.trackComplete(track); HY.elapsed.stopTrail(); }
    } else {
      HY.playLose(); HY.score.wrong(); setWrong(previous => [...previous, value]);
      const a = person.current.getBoundingClientRect(), b = mouth.current.getBoundingClientRect();
      scene.current.style.setProperty('--suck-x', `${b.left + b.width / 2 - a.left - a.width / 2}px`);
      scene.current.style.setProperty('--suck-y', `${b.top + b.height / 2 - a.top - a.height / 2}px`);
      setMood('sucking'); setMessage('Ops! A esfinge fez um redemoinho! Você poderá tentar outra resposta.');
      timer.current = setTimeout(() => {
        setCharacterIndex(previous => (previous + 1) % characters.length);
        setMood('idle'); busy.current = false;
        setMessage('Outro aventureiro chegou! Releia as pistas e tente outra alternativa.');
      }, 1700);
    }
  }
  function next() {
    if (mood !== 'happy') return;
    if (step < 4) prepare(track, step + 1);
    else leave('complete');
  }
  function Sphinx({ happy = false, sucking = false }) {
    const [failed, setFailed] = React.useState(false);
    if (failed) return <LegacySphinx happy={happy} sucking={sucking}/>;
    const state = sucking ? '-sucking' : happy ? '-happy' : '';
    return <span className="sphinx-blockie">
      <img src={`../assets/image/SVG/objects/sphinx${state}.svg`} alt={happy ? 'Esfinge Blockie feliz' : sucking ? 'Esfinge Blockie abrindo a boca para o redemoinho' : 'Esfinge Blockie guardiã dos enigmas'} draggable="false" onError={() => setFailed(true)}/>
      <span ref={mouth} className="sphinx-mouth-anchor" aria-hidden="true"/>
    </span>;
  }
  function LegacySphinx({ happy = false, sucking = false }) {
    return <svg viewBox="0 0 400 270" role="img" aria-label={happy ? 'Esfinge feliz' : sucking ? 'Esfinge soprando um redemoinho para dentro da boca' : 'Esfinge guardiã dos enigmas'}>
      <ellipse cx="229" cy="245" rx="157" ry="14" fill="#9a5c2530"/>
      <path d="M129 168 Q213 113 323 170 Q354 189 341 229 H137Z" fill="#cc8d38" stroke="#885221" strokeWidth="4"/>
      <path d="M319 189 Q385 172 374 217 Q366 235 344 220" fill="none" stroke="#b77728" strokeWidth="14" strokeLinecap="round"/>
      <path d="M107 174L86 226 32 229Q20 234 29 245H177V224L167 168" fill="#e6ae55" stroke="#885221" strokeWidth="4"/>
      <path d="M136 180L141 224 91 229Q80 234 90 245H225Q236 229 218 224L210 175" fill="#efbc68" stroke="#885221" strokeWidth="4"/>
      <path d="M100 73Q117 10 174 13Q229 18 240 70L258 166 206 193 158 173 92 164Z" fill="#17697b" stroke="#124b5a" strokeWidth="5"/>
      {[64,87,110,133,156].map(y => <path key={y} d={`M96 ${y}L235 ${y+7}`} stroke="#eebd64" strokeWidth="9"/>)}
      <path d="M124 60Q164 33 203 62L201 125Q181 160 143 141Q118 123 124 60" fill="#f3c879" stroke="#885221" strokeWidth="3"/>
      <path d="M120 58Q160 30 207 56L208 70Q164 48 120 74Z" fill="#e9af42"/>
      <path d="M160 50L169 25 180 49" fill="#e9af42" stroke="#885221" strokeWidth="3"/>
      {happy ? <g stroke="#433321" strokeWidth="4" fill="none" strokeLinecap="round"><path d="M134 87q8-12 16 0"/><path d="M171 87q8-12 16 0"/></g> : <g fill="#302e2b"><ellipse cx="142" cy="86" rx="5" ry="7"/><ellipse cx="180" cy="86" rx="5" ry="7"/></g>}
      <path d="M160 86L153 106 167 106" fill="#dc9f49"/>
      <g ref={mouth}>
        {sucking ? <ellipse cx="157" cy="120" rx="23" ry="25" fill="#442529" stroke="#bd7437" strokeWidth="4"/> : <path d={happy ? 'M139 115Q158 146 180 115Z' : 'M146 120Q159 126 173 120'} fill={happy ? '#fff0c0' : 'none'} stroke="#88462d" strokeWidth="4" strokeLinecap="round"/>}
      </g>
      {happy && <g fill="#ef9271" opacity=".6"><ellipse cx="133" cy="107" rx="9" ry="5"/><ellipse cx="188" cy="107" rx="9" ry="5"/></g>}
    </svg>;
  }
  const intro = <><p className="sphinx-kicker">PORTUGUÊS · RACIOCÍNIO LÓGICO</p><h1>Enigmas<br/><em>da Esfinge</em></h1></>;
  if (screen === 'cover') return <main className="sphinx-app sphinx-cover">
    <a className="sphinx-back" href="../index.html">← Todos os jogos</a>
    {intro}<div className="sphinx-cover-art"><Sphinx happy/></div>
    <p>Entre no Antigo Egito e descubra as respostas<br/>escondidas nas pistas da guardiã.</p>
    <button className="sphinx-primary" onClick={() => leave('map')}>EXPLORAR OS ENIGMAS →</button>
    <small>12 trilhas · 5 enigmas em cada jornada</small>
  </main>;
  if (screen === 'map') return <main className="sphinx-app"><button className="sphinx-back" onClick={() => leave('cover')}>← Início</button><h1>Trilhas do deserto</h1><p>Cada trilha guarda cinco enigmas.</p><div id="sphinx-map"/></main>;
  if (screen === 'complete') return <main className="sphinx-app sphinx-complete"><div className="sphinx-cover-art"><Sphinx happy/></div><h1>Sabedoria conquistada!</h1><p>Você decifrou os cinco enigmas da trilha {track + 1}.</p><p className="sphinx-stars">{'⭐'.repeat(HY.stars.getStars(track))}</p><div className="sphinx-actions"><button className="sphinx-back" onClick={() => leave('map')}>Ver trilhas</button>{track < 11 && <button className="sphinx-primary" onClick={() => startTrack(track + 1)}>PRÓXIMA TRILHA →</button>}</div></main>;
  return <main className="sphinx-app sphinx-playing">
    <header><button className="sphinx-back" onClick={() => leave('map')}>← Trilhas</button><span>Trilha {track + 1} · Enigma {step + 1}/5</span></header>
    <div ref={scene} className={`sphinx-scene ${mood}`}>
      <div className="sphinx-sun"/><div className="sphinx-pyramid pyramid-one"/><div className="sphinx-pyramid pyramid-two"/>
      <div ref={person} className="sphinx-person" role="img" aria-label={`Aventureiro ${characterIndex + 1} à esquerda`}>
        <img src={characterFile} alt="" draggable="false"/>
        <svg viewBox="0 0 100 180"><ellipse cx="51" cy="169" rx="30" ry="6" fill="#9a5c2530"/><path d="M36 112L33 160 45 163 52 120 60 160 73 160 66 111" fill="#725943"/><path d="M29 159h19v10H25q-3-7 4-10M59 159h16q8 2 8 10H60" fill="#473b32"/><path d="M28 63L17 108 28 112 42 79M70 65L84 99 76 107 59 79" fill="#c88753" stroke="#965d37" strokeWidth="2"/><path d="M32 60h36l5 58H28Z" fill="#fff3cc" stroke="#bb954f" strokeWidth="3"/><path d="M42 59L50 78 60 59" fill="#d99857"/><path d="M49 78v35" stroke="#bb954f" strokeWidth="2"/><rect x="32" y="19" width="36" height="43" rx="17" fill="#d99857"/><path d="M31 35Q24 4 50 5Q78 6 70 36" fill="#594333"/><path d="M30 20Q50 7 72 23L77 31H22Z" fill="#d3aa61"/><circle cx="42" cy="38" r="2.5"/><circle cx="60" cy="38" r="2.5"/><path d="M43 49q8 8 15 0" fill="none" stroke="#88462d" strokeWidth="2"/></svg>
      </div>
      <div className="sphinx-wind" aria-hidden="true"><i/><i/><i/></div>
      <div className="sphinx-guardian"><Sphinx happy={mood === 'happy'} sucking={mood === 'sucking'}/></div>
      {mood === 'happy' && <div className="sphinx-celebration" aria-hidden="true">✦ ✨ ✦</div>}
    </div>
    <section className="sphinx-papyrus" aria-labelledby="sphinx-riddle">
      <p className="sphinx-kicker">{SPHINX_TRACKS[track].name}</p>
      <h2 id="sphinx-riddle">{riddle[0]}</h2>
      <div className="sphinx-options">{options.map((value, i) => <button key={value} disabled={wrong.includes(value) || mood !== 'idle'} className={(wrong.includes(value) ? 'wrong' : '') + (mood === 'happy' && value === riddle[1] ? ' correct' : '')} onClick={() => answer(value)}><span>{String.fromCharCode(65+i)}</span>{value}</button>)}</div>
      <p className="sphinx-message" role="status" aria-live="polite">{message || 'Leia as pistas e escolha uma das três respostas.'}</p>
      {mood === 'happy' && <button className="sphinx-primary" onClick={next}>{step === 4 ? 'CONCLUIR TRILHA' : 'PRÓXIMO ENIGMA →'}</button>}
    </section>
  </main>;
};
