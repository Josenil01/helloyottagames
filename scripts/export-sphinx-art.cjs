/* Preserve the game's actual Sphinx artwork in the catalog, instead of
 * substituting an unrelated animal. Exports its existing SVG to a sharp PNG.
 * Usage: node scripts/export-sphinx-art.cjs <directory containing sharp>
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const sharp = require(require.resolve('sharp', { paths: [process.argv[2] || root] }));
const sandbox = { window: {}, React: {
  useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}],
  useRef: initial => ({ current: initial }), useEffect() {}, useLayoutEffect() {},
  createElement: (type, props, ...children) => ({ type, props: props || {}, children })
}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'vendor/babel@7.26.10.min.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'Canhões de ouro/riddles.js'), 'utf8'), sandbox);
sandbox.SPHINX_TRACKS = sandbox.window.SPHINX_TRACKS;
const jsx = fs.readFileSync(path.join(root, 'Canhões de ouro/sphinx.js'), 'utf8');
vm.runInContext(sandbox.Babel.transform(jsx, { presets: ['react'] }).code, sandbox);
function find(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { for (const child of node) { const found = find(child); if (found) return found; } return; }
  if (typeof node.type === 'function') return find(node.type({ ...node.props, children: node.children }));
  if (node.type === 'svg') return node;
  return find(node.children);
}
function escape(value) { return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function serialize(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (Array.isArray(node)) return node.map(serialize).join('');
  if (typeof node !== 'object') return escape(node);
  if (typeof node.type === 'function') return serialize(node.type({ ...node.props, children: node.children }));
  const attrs = Object.entries(node.props).filter(([k,v]) => !['ref','key','children'].includes(k) && v != null && typeof v !== 'function').map(([k,v]) => {
    const name = k === 'className' ? 'class' : k === 'viewBox' ? k : k.replace(/[A-Z]/g, x => '-' + x.toLowerCase());
    return name + '="' + escape(v) + '"';
  }).join(' ');
  return '<' + node.type + ' ' + attrs + '>' + serialize(node.children) + '</' + node.type + '>';
}
const svg = find(sandbox.window.SphinxApp());
if (!svg) throw new Error('Sphinx SVG not found');
svg.props = { ...svg.props, xmlns: 'http://www.w3.org/2000/svg', width: 512, height: 512 };
const xml = serialize(svg);
fs.mkdirSync(path.join(root, 'assets/visuals/source'), { recursive: true });
fs.mkdirSync(path.join(root, 'assets/visuals/objects'), { recursive: true });
fs.writeFileSync(path.join(root, 'assets/visuals/source/sphinx.svg'), xml);
sharp(Buffer.from(xml)).png().toFile(path.join(root, 'assets/visuals/objects/sphinx.png')).then(() => process.stdout.write('Sphinx original exportada em 512 px.\n'));
