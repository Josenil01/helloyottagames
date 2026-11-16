// Original vector drawings, independent of system emoji fonts.
export const eyes={
 neutral:['Clássicos','<ellipse cx="31" cy="40" rx="5" ry="7"/><ellipse cx="69" cy="40" rx="5" ry="7"/>'],
 happy:['Felizes','<path d="M23 43 Q31 28 39 43 M61 43 Q69 28 77 43" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>'],
 wink:['Piscando','<ellipse cx="31" cy="40" rx="5" ry="7"/><path d="M61 42 Q69 32 77 42" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>'],
 hearts:['Corações','<path fill="#ec3974" d="M31 48 C8 33 23 23 31 33 C39 23 54 33 31 48 M69 48 C46 33 61 23 69 33 C77 23 92 33 69 48"/>'],
 stars:['Estrelas','<path fill="#e5a500" d="M31 25 L35 35 L46 35 L38 42 L41 53 L31 47 L21 53 L24 42 L16 35 L27 35 Z M69 25 L73 35 L84 35 L76 42 L79 53 L69 47 L59 53 L62 42 L54 35 L65 35 Z"/>'],
 surprised:['Surpresos','<ellipse cx="31" cy="40" rx="8" ry="10" fill="white"/><ellipse cx="69" cy="40" rx="8" ry="10" fill="white"/><circle cx="31" cy="40" r="4"/><circle cx="69" cy="40" r="4"/>'],
 sleepy:['Fechados','<path d="M23 38 Q31 47 39 38 M61 38 Q69 47 77 38" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>'],
 angry:['Determinados','<path d="M22 28 L39 33 M61 33 L78 28" fill="none" stroke="currentColor" stroke-width="4"/><ellipse cx="31" cy="41" rx="5" ry="6"/><ellipse cx="69" cy="41" rx="5" ry="6"/>'],
 sad:['Tristes','<path d="M23 30 L38 25 M62 25 L77 30" fill="none" stroke="currentColor" stroke-width="3"/><ellipse cx="31" cy="41" rx="5" ry="6"/><ellipse cx="69" cy="41" rx="5" ry="6"/>']
};
export const mouths={
 smile:['Sorriso','<path d="M34 69 Q50 84 66 69" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none"/>'],
 neutral:['Neutra','<path d="M36 74 H64" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>'],
 laugh:['Gargalhada','<path d="M31 67 H69 Q67 88 50 88 Q33 88 31 67Z"/><path d="M35 68 H65 L63 74 H37Z" fill="white"/><path d="M40 85 Q50 75 60 85 Q50 90 40 85" fill="#ed6a85"/>'],
 open:['Surpresa','<ellipse cx="50" cy="75" rx="8" ry="11"/>'],
 sad:['Triste','<path d="M35 79 Q50 64 65 79" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none"/>'],
 tongue:['Língua','<path d="M33 69 Q50 83 67 69" stroke="currentColor" stroke-width="4" fill="none"/><path d="M48 75 H61 V83 Q54 94 48 83Z" fill="#ee6c90"/>'],
 kiss:['Beijo','<path d="M46 68 L56 73 L47 77 L55 81 L46 85" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'],
 teeth:['Dentes','<rect x="31" y="68" width="38" height="15" rx="6" fill="white" stroke="currentColor" stroke-width="3"/><path d="M33 75 H67" stroke="currentColor" stroke-width="1.5"/>']
};
export const presets=[['Sereno','neutral','smile'],['Feliz','happy','smile'],['Rindo','happy','laugh'],['Piscadinha','wink','smile'],['Apaixonado','hearts','smile'],['Encantado','stars','laugh'],['Surpreso','surprised','open'],['Sonolento','sleepy','neutral'],['Determinado','angry','neutral'],['Triste','sad','sad'],['Brincalhão','wink','tongue'],['Beijinho','sleepy','kiss']];
export const defaults={version:1,base:'square-01',eyes:'neutral',mouth:'smile',colors:{skin:'#bb733d',hair:'#241c18',shirt:'#245b52',pants:'#29343e',shoes:'#38281f'}};
export function faceSVG(config){return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 100 100"><rect width="100" height="100" fill="${config.colors.skin}"/><g fill="#30251f" color="#30251f">${eyes[config.eyes][1]}<path d="M46 53 H54 V61 H46Z" fill="#000" opacity=".16"/>${mouths[config.mouth][1]}</g></svg>`;}
export function validate(c){return c?.version===1&&c.base==='square-01'&&Object.hasOwn(eyes,c.eyes)&&Object.hasOwn(mouths,c.mouth)&&Object.keys(defaults.colors).every(k=>/^#[0-9a-f]{6}$/i.test(c.colors?.[k]));}
