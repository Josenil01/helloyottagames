// utils/gramatica.js — HY Gramática Bank
// Banco de desafios de classes gramaticais para Escola de Magia VSA.
// 60 desafios × 12 trilhas × 5 fases por trilha.
window.HYGramatica = [
  // TRILHA 1 — Introdução: Verbo, Substantivo, Adjetivo
  { id: 1,  type: 'match',   target: 'AÇÃO (VERBO)',         answer: 'PULAR',    options: ['PULAR', 'BOLA', 'TRISTE'],           emoji: '🏃‍♂️', instruction: 'Qual destas palavras indica uma AÇÃO (algo que você faz)?' },
  { id: 2,  type: 'match',   target: 'NOME (SUBSTANTIVO)',   answer: 'CACHORRO', options: ['CORRER', 'CACHORRO', 'BONITO'],       emoji: '🐶', instruction: 'Qual destas palavras indica um NOME?' },
  { id: 3,  type: 'connect', leftWords: ['BOLA', 'LENTO', 'CAIR'],    rightWords: ['NOME', 'QUALIDADE', 'AÇÃO'],    matches: { 'BOLA': 'NOME', 'LENTO': 'QUALIDADE', 'CAIR': 'AÇÃO' },       emoji: '🔮', instruction: 'Ligue a palavra ao seu tipo mágico correto!' },
  { id: 4,  type: 'intruder', words: ['CANTOU', 'FALOU', 'PULOU', 'MENINO'],         answer: 'MENINO',   emoji: '🧙‍♂️', instruction: 'Atenção! Qual é a intrusa?' },
  { id: 5,  type: 'sentence', preText: 'O gato ',           boldText: '[AÇÃO]',        postText: ' o muro alto.',         answer: 'PULOU',    options: ['PULOU', 'GATO', 'ALTO'],             emoji: '🐈', instruction: 'Arraste a palavra certa para completar o feitiço!' },
  // TRILHA 2 — Adjetivo, Substantivo, Verbo
  { id: 6,  type: 'match',   target: 'QUALIDADE (ADJETIVO)', answer: 'FELIZ',    options: ['FELIZ', 'CADEIRA', 'COMER'],         emoji: '✨', instruction: 'Qual destas palavras indica uma QUALIDADE?' },
  { id: 7,  type: 'match',   target: 'NOME (SUBSTANTIVO)',   answer: 'GATO',     options: ['CORRER', 'GATO', 'BONITO'],          emoji: '🐱', instruction: 'Qual destas palavras indica um NOME?' },
  { id: 8,  type: 'connect', leftWords: ['CANTAR', 'GATO', 'NOVO'],   rightWords: ['AÇÃO', 'NOME', 'QUALIDADE'],   matches: { 'CANTAR': 'AÇÃO', 'GATO': 'NOME', 'NOVO': 'QUALIDADE' },    emoji: '🔮', instruction: 'Ligue a palavra ao seu tipo mágico correto!' },
  { id: 9,  type: 'intruder', words: ['BOLA', 'CASA', 'LÁPIS', 'BONITO'],            answer: 'BONITO',   emoji: '🧙‍♂️', instruction: 'Atenção! Qual é a intrusa?' },
  { id: 10, type: 'sentence', preText: 'A ',                boldText: '[NOME]',        postText: ' estava muito saborosa.',   answer: 'SOPA',     options: ['QUENTE', 'COMER', 'SOPA'],           emoji: '🥣', instruction: 'Arraste a palavra certa para completar o feitiço!' },
  // TRILHA 3 — Substantivo, Adjetivo, Verbo
  { id: 11, type: 'match',   target: 'NOME (SUBSTANTIVO)',   answer: 'ÁGUA',     options: ['ALTO', 'DORMIR', 'ÁGUA'],            emoji: '💧', instruction: 'Qual destas palavras indica um NOME?' },
  { id: 12, type: 'match',   target: 'QUALIDADE (ADJETIVO)', answer: 'NOVO',     options: ['NOVO', 'BOLA', 'CAIR'],              emoji: '✨', instruction: 'Qual destas palavras indica uma QUALIDADE?' },
  { id: 13, type: 'connect', leftWords: ['ALTO', 'DORMIR', 'ÁGUA'], rightWords: ['QUALIDADE', 'AÇÃO', 'NOME'],     matches: { 'ALTO': 'QUALIDADE', 'DORMIR': 'AÇÃO', 'ÁGUA': 'NOME' },    emoji: '🔮', instruction: 'Ligue a palavra ao seu tipo mágico correto!' },
  { id: 14, type: 'intruder', words: ['RÁPIDO', 'FELIZ', 'CORRER', 'ESPERTO'],       answer: 'CORRER',   emoji: '🧙‍♂️', instruction: 'Atenção! Qual é a intrusa?' },
  { id: 15, type: 'sentence', preText: 'O castelo do rei era muito ', boldText: '[QUALIDADE]', postText: '.', answer: 'GRANDE', options: ['MORAR', 'GRANDE', 'REI'],            emoji: '👑', instruction: 'Arraste a palavra certa para completar o feitiço!' },
  // TRILHA 4 — Verbo, Substantivo, Adjetivo
  { id: 16, type: 'match',   target: 'AÇÃO (VERBO)',         answer: 'NADAR',    options: ['NADAR', 'MESA', 'AZUL'],             emoji: '🏊', instruction: 'Qual destas palavras indica uma AÇÃO?' },
  { id: 17, type: 'match',   target: 'NOME (SUBSTANTIVO)',   answer: 'MESA',     options: ['CORRER', 'MESA', 'ALEGRE'],          emoji: '🪑', instruction: 'Qual destas palavras indica um NOME?' },
  { id: 18, type: 'connect', leftWords: ['VERDE', 'VOAR', 'CARRO'],   rightWords: ['NOME', 'AÇÃO', 'QUALIDADE'],   matches: { 'VERDE': 'QUALIDADE', 'VOAR': 'AÇÃO', 'CARRO': 'NOME' },   emoji: '🔮', instruction: 'Ligue a palavra ao seu tipo mágico correto!' },
  { id: 19, type: 'intruder', words: ['CADEIRA', 'CAMA', 'PORTA', 'RINDO'],          answer: 'RINDO',    emoji: '🧙‍♂️', instruction: 'Atenção! Qual é a intrusa?' },
  { id: 20, type: 'sentence', preText: 'A borboleta ',      boldText: '[AÇÃO]',        postText: ' pelo jardim.',          answer: 'VOOU',     options: ['VOOU', 'AZUL', 'FLOR'],              emoji: '🦋', instruction: 'Arraste a palavra certa para completar o feitiço!' },
  // TRILHA 5 — Adjetivo, Substantivo, Verbo
  { id: 21, type: 'match',   target: 'QUALIDADE (ADJETIVO)', answer: 'PEQUENO',  options: ['PEQUENO', 'PULAR', 'LIVRO'],         emoji: '✨', instruction: 'Qual destas palavras indica uma QUALIDADE?' },
  { id: 22, type: 'match',   target: 'NOME (SUBSTANTIVO)',   answer: 'LIVRO',    options: ['CORRER', 'GRANDE', 'LIVRO'],         emoji: '📚', instruction: 'Qual destas palavras indica um NOME?' },
  { id: 23, type: 'connect', leftWords: ['QUENTE', 'ESCREVER', 'ESCOLA'], rightWords: ['AÇÃO', 'NOME', 'QUALIDADE'], matches: { 'QUENTE': 'QUALIDADE', 'ESCREVER': 'AÇÃO', 'ESCOLA': 'NOME' }, emoji: '🔮', instruction: 'Ligue a palavra ao seu tipo mágico correto!' },
  { id: 24, type: 'intruder', words: ['BONITO', 'LINDO', 'ALEGRE', 'COMER'],         answer: 'COMER',    emoji: '🧙‍♂️', instruction: 'Atenção! Qual é a intrusa?' },
  { id: 25, type: 'sentence', preText: 'A criança leu um ', boldText: '[NOME]',       postText: ' divertido.',           answer: 'LIVRO',    options: ['LER', 'LIVRO', 'RÁPIDO'],            emoji: '📖', instruction: 'Arraste a palavra certa para completar o feitiço!' },
  // TRILHA 6 — Verbo, Substantivo, Adjetivo
  { id: 26, type: 'match',   target: 'AÇÃO (VERBO)',         answer: 'DORMIR',   options: ['DORMIR', 'PATO', 'MOLE'],            emoji: '😴', instruction: 'Qual destas palavras indica uma AÇÃO?' },
  { id: 27, type: 'match',   target: 'NOME (SUBSTANTIVO)',   answer: 'PATO',     options: ['CANTAR', 'PATO', 'VERDE'],           emoji: '🦆', instruction: 'Qual destas palavras indica um NOME?' },
  { id: 28, type: 'connect', leftWords: ['BRAVO', 'PULAR', 'SOL'],    rightWords: ['NOME', 'AÇÃO', 'QUALIDADE'],   matches: { 'BRAVO': 'QUALIDADE', 'PULAR': 'AÇÃO', 'SOL': 'NOME' },    emoji: '🔮', instruction: 'Ligue a palavra ao seu tipo mágico correto!' },
  { id: 29, type: 'intruder', words: ['FEIO', 'TRISTE', 'BONITO', 'CORRER'],         answer: 'CORRER',   emoji: '🧙‍♂️', instruction: 'Atenção! Qual é a intrusa?' },
  { id: 30, type: 'sentence', preText: 'O sol é muito ',    boldText: '[QUALIDADE]',   postText: '.',                     answer: 'QUENTE',   options: ['CORRER', 'QUENTE', 'MAR'],           emoji: '☀️', instruction: 'Arraste a palavra certa para completar o feitiço!' },
  // TRILHA 7 — Substantivo, Adjetivo, Verbo
  { id: 31, type: 'match',   target: 'NOME (SUBSTANTIVO)',   answer: 'MONTANHA', options: ['SUBIR', 'MONTANHA', 'ALTA'],         emoji: '⛰️', instruction: 'Qual destas palavras indica um NOME?' },
  { id: 32, type: 'match',   target: 'QUALIDADE (ADJETIVO)', answer: 'ALTA',     options: ['SUBIR', 'MONTANHA', 'ALTA'],         emoji: '✨', instruction: 'Qual destas palavras indica uma QUALIDADE?' },
  { id: 33, type: 'connect', leftWords: ['TRISTE', 'ANDAR', 'CIDADE'], rightWords: ['NOME', 'QUALIDADE', 'AÇÃO'],   matches: { 'TRISTE': 'QUALIDADE', 'ANDAR': 'AÇÃO', 'CIDADE': 'NOME' }, emoji: '🔮', instruction: 'Ligue a palavra ao seu tipo mágico correto!' },
  { id: 34, type: 'intruder', words: ['PEIXE', 'CACHORRO', 'GATO', 'NADAR'],         answer: 'NADAR',    emoji: '🧙‍♂️', instruction: 'Atenção! Qual é a intrusa?' },
  { id: 35, type: 'sentence', preText: 'Meu ',              boldText: '[NOME]',        postText: ' late muito.',            answer: 'CACHORRO', options: ['LATIR', 'CACHORRO', 'FORTE'],         emoji: '🐕', instruction: 'Arraste a palavra certa para completar o feitiço!' },
  // TRILHA 8 — Verbo, Substantivo, Adjetivo
  { id: 36, type: 'match',   target: 'AÇÃO (VERBO)',         answer: 'PINTAR',   options: ['PINTAR', 'TINTA', 'COLORIDA'],       emoji: '🎨', instruction: 'Qual destas palavras indica uma AÇÃO?' },
  { id: 37, type: 'match',   target: 'NOME (SUBSTANTIVO)',   answer: 'TINTA',    options: ['PINTAR', 'TINTA', 'COLORIDA'],       emoji: '🖌️', instruction: 'Qual destas palavras indica um NOME?' },
  { id: 38, type: 'connect', leftWords: ['SUAVE', 'COMER', 'PÃO'],    rightWords: ['NOME', 'AÇÃO', 'QUALIDADE'],   matches: { 'SUAVE': 'QUALIDADE', 'COMER': 'AÇÃO', 'PÃO': 'NOME' },    emoji: '🔮', instruction: 'Ligue a palavra ao seu tipo mágico correto!' },
  { id: 39, type: 'intruder', words: ['FAZER', 'CORRER', 'PULAR', 'BONITA'],         answer: 'BONITA',   emoji: '🧙‍♂️', instruction: 'Atenção! Qual é a intrusa?' },
  { id: 40, type: 'sentence', preText: 'Ela gosta de ',     boldText: '[AÇÃO]',        postText: ' músicas.',              answer: 'CANTAR',   options: ['CANTAR', 'MÚSICA', 'LINDA'],         emoji: '🎵', instruction: 'Arraste a palavra certa para completar o feitiço!' },
  // TRILHA 9 — Adjetivo, Substantivo, Verbo
  { id: 41, type: 'match',   target: 'QUALIDADE (ADJETIVO)', answer: 'GELADO',   options: ['GELADO', 'SORVETE', 'COMER'],        emoji: '❄️', instruction: 'Qual destas palavras indica uma QUALIDADE?' },
  { id: 42, type: 'match',   target: 'NOME (SUBSTANTIVO)',   answer: 'SORVETE',  options: ['GELADO', 'SORVETE', 'COMER'],        emoji: '🍦', instruction: 'Qual destas palavras indica um NOME?' },
  { id: 43, type: 'connect', leftWords: ['FRIO', 'BRINCAR', 'PARQUE'], rightWords: ['NOME', 'QUALIDADE', 'AÇÃO'],  matches: { 'FRIO': 'QUALIDADE', 'BRINCAR': 'AÇÃO', 'PARQUE': 'NOME' }, emoji: '🔮', instruction: 'Ligue a palavra ao seu tipo mágico correto!' },
  { id: 44, type: 'intruder', words: ['ALEGRE', 'FELIZ', 'CONTENTE', 'GRITAR'],      answer: 'GRITAR',   emoji: '🧙‍♂️', instruction: 'Atenção! Qual é a intrusa?' },
  { id: 45, type: 'sentence', preText: 'O ',                boldText: '[NOME]',        postText: ' mora na floresta.',      answer: 'URSO',     options: ['DORMIR', 'URSO', 'GRANDE'],          emoji: '🐻', instruction: 'Arraste a palavra certa para completar o feitiço!' },
  // TRILHA 10 — Verbo, Substantivo, Adjetivo
  { id: 46, type: 'match',   target: 'AÇÃO (VERBO)',         answer: 'ESTUDAR',  options: ['ESTUDAR', 'ESCOLA', 'INTELIGENTE'],  emoji: '📝', instruction: 'Qual destas palavras indica uma AÇÃO?' },
  { id: 47, type: 'match',   target: 'NOME (SUBSTANTIVO)',   answer: 'ESCOLA',   options: ['ESTUDAR', 'ESCOLA', 'INTELIGENTE'],  emoji: '🏫', instruction: 'Qual destas palavras indica um NOME?' },
  { id: 48, type: 'connect', leftWords: ['INTELIGENTE', 'PENSAR', 'LÁPIS'], rightWords: ['NOME', 'AÇÃO', 'QUALIDADE'], matches: { 'INTELIGENTE': 'QUALIDADE', 'PENSAR': 'AÇÃO', 'LÁPIS': 'NOME' }, emoji: '🔮', instruction: 'Ligue a palavra ao seu tipo mágico correto!' },
  { id: 49, type: 'intruder', words: ['CADERNO', 'BORRACHA', 'RÉGUA', 'APAGAR'],     answer: 'APAGAR',   emoji: '🧙‍♂️', instruction: 'Atenção! Qual é a intrusa?' },
  { id: 50, type: 'sentence', preText: 'O aluno é muito ',  boldText: '[QUALIDADE]',   postText: '.',                     answer: 'ESFORÇADO', options: ['ESTUDAR', 'ESFORÇADO', 'LIÇÃO'],     emoji: '🌟', instruction: 'Arraste a palavra certa para completar o feitiço!' },
  // TRILHA 11 — Adjetivo, Substantivo, Verbo
  { id: 51, type: 'match',   target: 'QUALIDADE (ADJETIVO)', answer: 'VELOZ',    options: ['VELOZ', 'TREM', 'VIAJAR'],           emoji: '⚡', instruction: 'Qual destas palavras indica uma QUALIDADE?' },
  { id: 52, type: 'match',   target: 'NOME (SUBSTANTIVO)',   answer: 'TREM',     options: ['VELOZ', 'TREM', 'VIAJAR'],           emoji: '🚂', instruction: 'Qual destas palavras indica um NOME?' },
  { id: 53, type: 'connect', leftWords: ['ALTO', 'VENDER', 'MERCADO'], rightWords: ['NOME', 'AÇÃO', 'QUALIDADE'],   matches: { 'ALTO': 'QUALIDADE', 'VENDER': 'AÇÃO', 'MERCADO': 'NOME' }, emoji: '🔮', instruction: 'Ligue a palavra ao seu tipo mágico correto!' },
  { id: 54, type: 'intruder', words: ['FRUTA', 'VEGETAL', 'CENOURA', 'COZINHAR'],    answer: 'COZINHAR', emoji: '🧙‍♂️', instruction: 'Atenção! Qual é a intrusa?' },
  { id: 55, type: 'sentence', preText: 'O trem ',           boldText: '[AÇÃO]',        postText: ' muito rápido.',         answer: 'PASSA',    options: ['PASSA', 'TREM', 'VELOZ'],            emoji: '🚄', instruction: 'Arraste a palavra certa para completar o feitiço!' },
  // TRILHA 12 — Revisão geral
  { id: 56, type: 'match',   target: 'AÇÃO (VERBO)',         answer: 'PESCAR',   options: ['PESCAR', 'PEIXE', 'SALGADO'],        emoji: '🎣', instruction: 'Qual destas palavras indica uma AÇÃO?' },
  { id: 57, type: 'match',   target: 'NOME (SUBSTANTIVO)',   answer: 'PEIXE',    options: ['PESCAR', 'PEIXE', 'SALGADO'],        emoji: '🐟', instruction: 'Qual destas palavras indica um NOME?' },
  { id: 58, type: 'connect', leftWords: ['SALGADO', 'NADAR', 'OCEANO'], rightWords: ['NOME', 'AÇÃO', 'QUALIDADE'],  matches: { 'SALGADO': 'QUALIDADE', 'NADAR': 'AÇÃO', 'OCEANO': 'NOME' }, emoji: '🔮', instruction: 'Ligue a palavra ao seu tipo mágico correto!' },
  { id: 59, type: 'intruder', words: ['CANTAR', 'DANÇAR', 'PULAR', 'BONITO'],        answer: 'BONITO',   emoji: '🧙‍♂️', instruction: 'Atenção! Qual é a intrusa?' },
  { id: 60, type: 'sentence', preText: 'O ',                boldText: '[NOME]',        postText: ' é muito profundo.',      answer: 'OCEANO',   options: ['NADAR', 'OCEANO', 'AZUL'],           emoji: '🌊', instruction: 'Arraste a palavra certa para completar o feitiço!' },
];
