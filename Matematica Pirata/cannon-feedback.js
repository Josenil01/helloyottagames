// Feedback trazido de Canhões de Ouro: recuo, trajetória parabólica de 900 ms e explosão.
window.PirateCannonFeedback = function PirateCannonFeedback() {
  const stageRef = React.useRef(null);
  const cannonRef = React.useRef(null);
  const targetRef = React.useRef(null);
  const ballRef = React.useRef(null);
  const [hit, setHit] = React.useState(false);
  React.useEffect(() => {
    let frame;
    const start = performance.now();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setHit(true); return; }
    function update(now) {
      const stage = stageRef.current.getBoundingClientRect();
      const cannon = cannonRef.current.getBoundingClientRect();
      const target = targetRef.current.getBoundingClientRect();
      const t = Math.min((now - start) / 900, 1);
      const x0 = cannon.right - stage.left, y0 = cannon.top + cannon.height / 2 - stage.top;
      const x1 = target.left + target.width / 2 - stage.left, y1 = target.top + target.height / 2 - stage.top;
      ballRef.current.style.transform = `translate(${x0 + (x1 - x0) * t - 9}px, ${y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * Math.min(180, stage.height * .45) - 9}px)`;
      if (t < 1) frame = requestAnimationFrame(update);
      else { ballRef.current.style.display = 'none'; setHit(true); }
    }
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <div className="pirate-cannon-feedback" ref={stageRef} role="status" aria-label="Acertou! O navio dispara e atinge o barril.">
    <strong className="pirate-hit-label">{hit ? 'EM CHEIO! 🪙' : 'RESPOSTA CERTA!'}</strong>
    <div className="pirate-feedback-ship" aria-hidden="true">
      <window.PirateArt name="ship-pirate-large" className="pirate-ship-art">
      <svg className="pirate-original-ship" viewBox="0 0 200 200">
        <path d="M20 140 Q100 180 180 140 L165 170 Q100 190 35 170 Z" fill="#78350f" stroke="#451a03" strokeWidth="2"/>
        {[50,80,120,150].map(x => <circle key={x} cx={x} cy="157" r="5" fill="#333"/>)}
        <rect x="95" y="40" width="8" height="110" fill="#451a03"/>
        <rect x="90" y="35" width="18" height="12" fill="#5c2d12"/>
        <path d="M50 50 Q100 40 150 50 L145 130 Q100 120 55 130 Z" fill="#f3f4f6" stroke="#9ca3af"/>
        <circle cx="100" cy="85" r="14" fill="white"/>
        <path d="M96 92 Q100 95 104 92" fill="none" stroke="black" strokeWidth="1.5"/>
        <path d="M86 78 Q100 70 114 78 L114 84 Q100 76 86 84 Z" fill="#ef4444"/>
        <rect x="103" y="10" width="35" height="22" fill="black" rx="2"/><circle cx="118" cy="21" r="5" fill="white"/><rect x="99" y="5" width="4" height="40" fill="#451a03"/>
      </svg>
      </window.PirateArt>
      <div ref={cannonRef} className="pirate-feedback-cannon"><window.PirateArt name="cannon" className="pirate-cannon-art" />{!hit && <span>💥</span>}</div>
    </div>
    <div ref={targetRef} className={'pirate-feedback-barrel' + (hit ? ' pirate-barrel-explode' : '')} aria-hidden="true">{hit ? '💥' : <window.PirateArt name="barrel" className="pirate-barrel-art">🛢️</window.PirateArt>}</div>
    <div className="pirate-feedback-ball" ref={ballRef} aria-hidden="true"><window.PirateArt name="cannon-ball" className="pirate-ball-art" /></div>
  </div>;
};
