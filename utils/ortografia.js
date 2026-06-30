// utils/ortografia.js — HY Ortografia Bank
// Banco de desafios de ortografia para Detetives da Ortografia.
// 60 desafios × 12 trilhas × 5 fases por trilha.
window.HYOrtografia = [
  // TRILHA 1 — X vs CH / S vs SS
  { id: 1,  type: 'match',   target: 'CAI__A',      answer: 'X',   options: ['X', 'CH', 'SS'],               emoji: '📦', instruction: 'É com X ou CH? Arraste a letra certa para consertar a palavra!' },
  { id: 2,  type: 'match',   target: 'PÁ__ARO',     answer: 'SS',  options: ['S', 'SS', 'Ç'],                emoji: '🐦', instruction: 'Como se escreve pássaro? Arraste a opção correta!' },
  { id: 3,  type: 'connect', leftWords: ['CAI__A', 'FLE__A', 'BAI__O'], rightWords: ['FLECHA', 'BAIXO', 'CAIXA'], matches: { 'CAI__A': 'CAIXA', 'FLE__A': 'FLECHA', 'BAI__O': 'BAIXO' }, emoji: '🔗', instruction: 'Ligue a palavra com letras faltando à sua forma escrita corretamente!' },
  { id: 4,  type: 'intruder', words: ['XÍCARA', 'ENXADA', 'XUVEIRO', 'CAIXA'],        answer: 'XUVEIRO',  emoji: '🚿', instruction: 'Atenção, detetive! Qual dessas palavras está escrita ERRADA (é a intrusa)?' },
  { id: 5,  type: 'sentence', preText: 'Eu tomei um ',      boldText: 'XÁ',       postText: ' de camomila.',            answer: 'CHÁ',     options: ['CHÁ', 'XÁ', 'XIA'],                   emoji: '☕', instruction: 'Substitua a palavra incorreta pela escrita corretamente!' },
  // TRILHA 2 — G vs J / S vs SS
  { id: 6,  type: 'match',   target: 'RELÓ__IO',    answer: 'G',   options: ['G', 'J', 'CH'],                emoji: '⌚', instruction: 'Relógio é com G ou com J? Descubra!' },
  { id: 7,  type: 'match',   target: 'VA__OURA',    answer: 'SS',  options: ['S', 'SS', 'Z'],                emoji: '🧹', instruction: 'Vassoura é com S ou SS?' },
  { id: 8,  type: 'connect', leftWords: ['VA__OURA', 'CA__A', 'O__O'], rightWords: ['OSSO', 'VASSOURA', 'CASA'], matches: { 'VA__OURA': 'VASSOURA', 'CA__A': 'CASA', 'O__O': 'OSSO' }, emoji: '🔗', instruction: 'S ou SS? Ligue as palavras e resolva o mistério!' },
  { id: 9,  type: 'intruder', words: ['PÁSSARO', 'OSSO', 'PÊCEGO', 'MASSA'],         answer: 'PÊCEGO',   emoji: '🍑', instruction: 'Tem uma palavra com a ortografia incorreta! Descubra qual é!' },
  { id: 10, type: 'sentence', preText: 'A ',                boldText: 'BRUCHA',    postText: ' voa na vassoura mágica.',  answer: 'BRUXA',   options: ['BRUSHA', 'BRUCHA', 'BRUXA'],          emoji: '🧹', instruction: 'Ops, tem um erro ortográfico! Arraste a palavra corrigida para a frase!' },
  // TRILHA 3 — G vs J
  { id: 11, type: 'match',   target: '__ELO',       answer: 'G',   options: ['G', 'J', 'X'],                 emoji: '🧊', instruction: 'GELO ou JELO? Qual a letra correta?' },
  { id: 12, type: 'match',   target: 'MÁ__ICO',     answer: 'G',   options: ['G', 'J', 'CH'],                emoji: '🪄', instruction: 'Mágico é com G ou J?' },
  { id: 13, type: 'connect', leftWords: ['__ELO', '__ACARÉ', 'MÁ__ICO'], rightWords: ['JACARÉ', 'MÁGICO', 'GELO'], matches: { '__ELO': 'GELO', '__ACARÉ': 'JACARÉ', 'MÁ__ICO': 'MÁGICO' }, emoji: '🐊', instruction: 'Encontre os 3 pares escondidos usando G ou J!' },
  { id: 14, type: 'intruder', words: ['GELO', 'GIRAFA', 'JELADEIRA', 'JACARÉ'],       answer: 'JELADEIRA', emoji: '🧊', instruction: 'Inspecione bem! Qual palavra foi escrita pelo vilão com a letra errada?' },
  { id: 15, type: 'sentence', preText: 'Aquele menino é muito ', boldText: 'CORAGOSO', postText: '.',        answer: 'CORAJOSO', options: ['CORAGOSO', 'CORAJOSO', 'CORAJOZO'],    emoji: '🦸', instruction: 'Como se escreve? Conserte o erro na frase!' },
  // TRILHA 4 — X vs CH / Ç
  { id: 16, type: 'match',   target: 'EN__ERGAR',   answer: 'X',   options: ['X', 'CH', 'S'],                emoji: '👀', instruction: 'ENXERGAR ou ENCHERGAR? Descubra!' },
  { id: 17, type: 'match',   target: 'A__UCAR',     answer: 'Ç',   options: ['Ç', 'SS', 'C'],                emoji: '🍬', instruction: 'Açúcar é com Ç ou C?' },
  { id: 18, type: 'connect', leftWords: ['PI__ADA', 'CA__AMBA', 'LA__O'], rightWords: ['LAÇO', 'PIÇADA', 'CAÇAMBA'], matches: { 'PI__ADA': 'PIÇADA', 'CA__AMBA': 'CAÇAMBA', 'LA__O': 'LAÇO' }, emoji: '🔗', instruction: 'Complete com Ç e ligue as palavras!' },
  { id: 19, type: 'intruder', words: ['AÇÚCAR', 'CAÇAMBA', 'LAÇO', 'CASARÃO'],        answer: 'CASARÃO',  emoji: '🏚️', instruction: 'Qual dessas palavras NÃO tem o som do Ç?' },
  { id: 20, type: 'sentence', preText: 'Ele foi ao médico tomar a ', boldText: 'INJEÇAO', postText: '.',   answer: 'INJEÇÃO', options: ['INJEÇÃO', 'INJEÇAO', 'INJESSÃO'],       emoji: '💉', instruction: 'Qual é a escrita correta?' },
  // TRILHA 5 — X (início de palavra)
  { id: 21, type: 'match',   target: 'E__ERCÍCIO',  answer: 'X',   options: ['X', 'S', 'Z'],                 emoji: '💪', instruction: 'Exercício é com X ou Z?' },
  { id: 22, type: 'match',   target: 'E__PLICAR',   answer: 'X',   options: ['X', 'S', 'EX'],                emoji: '📖', instruction: 'EXPLICAR: qual é a letra correta?' },
  { id: 23, type: 'connect', leftWords: ['E__ERCÍCIO', 'E__PLICAR', 'E__CELENTE'], rightWords: ['EXCELENTE', 'EXERCÍCIO', 'EXPLICAR'], matches: { 'E__ERCÍCIO': 'EXERCÍCIO', 'E__PLICAR': 'EXPLICAR', 'E__CELENTE': 'EXCELENTE' }, emoji: '🔗', instruction: 'Complete com X e ligue os pares!' },
  { id: 24, type: 'intruder', words: ['EXERCÍCIO', 'EXCELENTE', 'EXPLICAR', 'ESPLICAR'], answer: 'ESPLICAR', emoji: '❌', instruction: 'Qual palavra está escrita errada?' },
  { id: 25, type: 'sentence', preText: 'O professor deu um ', boldText: 'EZERCCIO', postText: ' difícil.', answer: 'EXERCÍCIO', options: ['EXERCÍCIO', 'EZERCÍCIO', 'EZERCCIO'],   emoji: '📝', instruction: 'Conserte o erro ortográfico!' },
  // TRILHA 6 — G vs J (em meio a vogais)
  { id: 26, type: 'match',   target: 'HO__E',       answer: 'J',   options: ['J', 'G', 'X'],                 emoji: '📅', instruction: 'HOJE é com J ou G?' },
  { id: 27, type: 'match',   target: 'VIA__EM',     answer: 'G',   options: ['G', 'J', 'X'],                 emoji: '🧳', instruction: 'VIAGEM é com G ou J?' },
  { id: 28, type: 'connect', leftWords: ['HO__E', 'VIA__EM', 'GA__ETA'], rightWords: ['GAZETA', 'HOJE', 'VIAGEM'], matches: { 'HO__E': 'HOJE', 'VIA__EM': 'VIAGEM', 'GA__ETA': 'GAZETA' }, emoji: '🔗', instruction: 'Ligue as palavras com G ou J!' },
  { id: 29, type: 'intruder', words: ['HOJE', 'VIAGEM', 'GARAGEM', 'GENTE'],          answer: 'GENTE',    emoji: '👥', instruction: 'Qual NÃO tem o som J entre vogais?' },
  { id: 30, type: 'sentence', preText: 'A ',                boldText: 'GARAJIM',   postText: ' do carro está fechada.', answer: 'GARAGEM', options: ['GARAGEM', 'GARAJIM', 'GARAJEM'],      emoji: '🚗', instruction: 'Qual é a escrita correta?' },
  // TRILHA 7 — Ç / ção
  { id: 31, type: 'match',   target: 'CORA__ÃO',    answer: 'Ç',   options: ['Ç', 'SS', 'C'],                emoji: '❤️', instruction: 'CORAÇÃO: qual letra faz o som correto?' },
  { id: 32, type: 'match',   target: 'CAN__ÃO',     answer: 'Ç',   options: ['Ç', 'SS', 'C'],                emoji: '🎵', instruction: 'CANÇÃO é com Ç ou C?' },
  { id: 33, type: 'connect', leftWords: ['CORA__ÃO', 'CAN__ÃO', 'NA__ÃO'], rightWords: ['NAÇÃO', 'CORAÇÃO', 'CANÇÃO'], matches: { 'CORA__ÃO': 'CORAÇÃO', 'CAN__ÃO': 'CANÇÃO', 'NA__ÃO': 'NAÇÃO' }, emoji: '🔗', instruction: 'Complete com Ç!' },
  { id: 34, type: 'intruder', words: ['CORAÇÃO', 'CANÇÃO', 'NAÇÃO', 'CASÃO'],         answer: 'CASÃO',    emoji: '🏠', instruction: 'Qual NÃO termina com o som de ção?' },
  { id: 35, type: 'sentence', preText: 'Meu ',              boldText: 'CORASSÃO', postText: ' está feliz!',  answer: 'CORAÇÃO', options: ['CORAÇÃO', 'CORASSÃO', 'CORAÇON'],       emoji: '❤️', instruction: 'Conserte a palavra na frase!' },
  // TRILHA 8 — QU vs K vs C
  { id: 36, type: 'match',   target: '__EIJO',      answer: 'QU',  options: ['QU', 'K', 'C'],                emoji: '🧀', instruction: 'QUEIJO: como se escreve o som /k/ antes de E?' },
  { id: 37, type: 'match',   target: '__ADERNO',    answer: 'C',   options: ['C', 'K', 'QU'],                emoji: '📓', instruction: 'CADERNO: qual letra faz o som /k/ antes de A?' },
  { id: 38, type: 'connect', leftWords: ['__EIJO', '__ADERNO', '__ANDO'], rightWords: ['QUANDO', 'QUEIJO', 'CADERNO'], matches: { '__EIJO': 'QUEIJO', '__ADERNO': 'CADERNO', '__ANDO': 'QUANDO' }, emoji: '🔗', instruction: 'Complete com QU ou C!' },
  { id: 39, type: 'intruder', words: ['QUEIJO', 'QUANDO', 'QUENTE', 'KENTE'],         answer: 'KENTE',    emoji: '❌', instruction: 'Qual palavra está escrita errada?' },
  { id: 40, type: 'sentence', preText: 'Eu como ',          boldText: 'KÊJO',      postText: ' todo dia.',             answer: 'QUEIJO',  options: ['QUEIJO', 'QEIJO', 'KÊJO'],            emoji: '🧀', instruction: 'Conserte o erro!' },
  // TRILHA 9 — Ç no meio de palavra
  { id: 41, type: 'match',   target: 'ESPA__O',     answer: 'Ç',   options: ['Ç', 'SS', 'C'],                emoji: '🌌', instruction: 'ESPAÇO é com Ç ou C?' },
  { id: 42, type: 'match',   target: 'PO__O',       answer: 'Ç',   options: ['Ç', 'SS', 'C'],                emoji: '🪣', instruction: 'POÇO é com Ç ou SS?' },
  { id: 43, type: 'connect', leftWords: ['ESPA__O', 'CA__O', 'FA__O'], rightWords: ['FAÇO', 'ESPAÇO', 'CAÇO'], matches: { 'ESPA__O': 'ESPAÇO', 'CA__O': 'CAÇO', 'FA__O': 'FAÇO' }, emoji: '🔗', instruction: 'Complete com Ç!' },
  { id: 44, type: 'intruder', words: ['ESPAÇO', 'CAÇA', 'FAÇO', 'ESPASSO'],           answer: 'ESPASSO',  emoji: '❌', instruction: 'Qual está escrita errada?' },
  { id: 45, type: 'sentence', preText: 'O foguete foi para o ', boldText: 'ESPASSO', postText: '.',         answer: 'ESPAÇO',  options: ['ESPAÇO', 'ESPASSO', 'ESPASSU'],         emoji: '🚀', instruction: 'Conserte o erro!' },
  // TRILHA 10 — Plurais e terminações
  { id: 46, type: 'match',   target: 'AMOR__O',     answer: 'OS',  options: ['OS', 'OZ', 'OSS'],             emoji: '🍒', instruction: 'AMOROSO: qual terminação é correta?' },
  { id: 47, type: 'match',   target: '__ENDO',      answer: 'V',   options: ['V', 'B', 'F'],                 emoji: '👋', instruction: 'VENDO: qual letra inicial é correta?' },
  { id: 48, type: 'connect', leftWords: ['BELO', 'GELO', 'POLO'], rightWords: ['POLOS', 'BELOS', 'GELOS'], matches: { 'BELO': 'BELOS', 'GELO': 'GELOS', 'POLO': 'POLOS' }, emoji: '🔗', instruction: 'Ligue as palavras ao seu plural correto!' },
  { id: 49, type: 'intruder', words: ['BELOS', 'GELOS', 'POLOS', 'BELOZ'],            answer: 'BELOZ',    emoji: '❌', instruction: 'Qual plural está errado?' },
  { id: 50, type: 'sentence', preText: 'Os ',               boldText: 'GELOZ',     postText: ' estão derretendo.',     answer: 'GELOS',   options: ['GELOS', 'GELOZ', 'GELOSSE'],          emoji: '🧊', instruction: 'Conserte o plural!' },
  // TRILHA 11 — S vs Z / ST
  { id: 51, type: 'match',   target: 'HI__ÓRIA',    answer: 'ST',  options: ['ST', 'EST', 'IST'],             emoji: '📚', instruction: 'HISTÓRIA: como se escreve?' },
  { id: 52, type: 'match',   target: 'DE__AFIO',    answer: 'S',   options: ['S', 'Z', 'SS'],                 emoji: '⚔️', instruction: 'DESAFIO: qual letra faz o som /z/ entre vogais?' },
  { id: 53, type: 'connect', leftWords: ['PREZENTE', 'VIZITA', 'ZUPERIOR'], rightWords: ['SUPERIOR', 'VISITA', 'PRESENTE'], matches: { 'PREZENTE': 'PRESENTE', 'VIZITA': 'VISITA', 'ZUPERIOR': 'SUPERIOR' }, emoji: '🔗', instruction: 'Ligue a palavra errada à palavra correta!' },
  { id: 54, type: 'intruder', words: ['PRESENTE', 'VISITA', 'CASAMENTO', 'PREZENTE'], answer: 'PREZENTE', emoji: '🎁', instruction: 'Qual está escrita errada?' },
  { id: 55, type: 'sentence', preText: 'A ',                boldText: 'VIZITA',    postText: ' ao museu foi incrível.',  answer: 'VISITA',  options: ['VISITA', 'VIZITA', 'VISSITA'],         emoji: '🏛️', instruction: 'Conserte o erro ortográfico!' },
  // TRILHA 12 — Revisão geral
  { id: 56, type: 'match',   target: '__OVEM',      answer: 'J',   options: ['J', 'G', 'X'],                 emoji: '👦', instruction: 'JOVEM é com J ou G?' },
  { id: 57, type: 'match',   target: 'LÁ__IS',      answer: 'P',   options: ['P', 'B', 'PP'],                emoji: '✏️', instruction: 'LÁPIS: a letra correta antes do I é...' },
  { id: 58, type: 'connect', leftWords: ['__OVEM', 'LÁ__IS', '__ARDA'], rightWords: ['GUARDA', 'LÁPIS', 'JOVEM'], matches: { '__OVEM': 'JOVEM', 'LÁ__IS': 'LÁPIS', '__ARDA': 'GUARDA' }, emoji: '🔗', instruction: 'Complete as palavras e ligue os pares!' },
  { id: 59, type: 'intruder', words: ['JOVEM', 'LÁPIS', 'GUARDA', 'LAPIZ'],           answer: 'LAPIZ',    emoji: '❌', instruction: 'Qual está escrita errada?' },
  { id: 60, type: 'sentence', preText: 'O detetive usou o ', boldText: 'LAPIZ',    postText: ' para tomar notas.',     answer: 'LÁPIS',   options: ['LÁPIS', 'LAPIZ', 'LAPISS'],           emoji: '🔍', instruction: 'Conserte o erro e solucione o caso!' },
];
