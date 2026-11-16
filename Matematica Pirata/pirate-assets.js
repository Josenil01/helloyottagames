// Kenney Pirate Kit (CC0). SVGs vetoriais exportados pelo 3DSVG.
// Regenerar com scripts/prepare-game-svg.py e scripts/export-game-svg.cjs.
window.PirateAssets = {
  base: '../assets/image/SVG/pirate/',
  tracks: ['patch-sand', 'patch-grass', 'patch-sand-foliage', 'palm-bend',
    'crate', 'barrel', 'boat-row-small', 'cannon', 'ship-pirate-small',
    'tower-complete-small', 'ship-pirate-medium', 'chest']
};

window.PirateArt = function PirateArt({ name, alt = '', className = '', children, title }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) return <span className={'pirate-art-fallback ' + className} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={!alt} title={title}>{children || '🏴‍☠️'}</span>;
  return <img src={window.PirateAssets.base + name + '.svg'} alt={alt}
    className={'pirate-art ' + className} draggable="false" title={title}
    onError={() => setFailed(true)} />;
};

window.PirateScenery = function PirateScenery() {
  return <div className="pirate-scenery" aria-hidden="true">
    <div className="pirate-island pirate-island-left">
      <window.PirateArt name="patch-sand" className="pirate-island-ground" />
      <window.PirateArt name="palm-bend" className="pirate-island-palm" />
      <window.PirateArt name="rocks-sand-a" className="pirate-island-rock" />
    </div>
    <div className="pirate-island pirate-island-right">
      <window.PirateArt name="patch-grass" className="pirate-island-ground" />
      <window.PirateArt name="palm-straight" className="pirate-island-palm" />
      <window.PirateArt name="chest" className="pirate-island-rock" />
    </div>
  </div>;
};
