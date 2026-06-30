/* ============================================================
   Hello Yotta Utils — rand.js
   Ponto de acesso unificado aos pools de dados + seletor.

   Depende de:
     - utils/shuffle.js  (HY.shuffle)
     - utils/words.js    (window.HYWords)   — deve carregar antes
     - utils/letters.js  (window.HYLetters) — deve carregar antes

   Como usar em cada jogo:
     // O jogo filtra conforme seus critérios pedagógicos...
     const candidatos = HY.rand.PALAVRAS.filter(w => w.tamanho <= 4);
     // ...depois sorteia N itens sem repetição:
     const desafios = HY.rand.pick(candidatos, 5);
   ============================================================ */

window.HY = window.HY || {};

window.HY.rand = (function () {
  'use strict';

  /* ----------------------------------------------------------
     pick — sorteia n itens de um array sem repetição.
     O jogo filtra o pool antes de chamar esta função.
  ---------------------------------------------------------- */
  function pick(pool, n) {
    return HY.shuffle(pool).slice(0, Math.min(n, pool.length));
  }

  /* ----------------------------------------------------------
     PALAVRAS — referência ao banco global de palavras.
     Fonte: utils/words.js → window.HYWords
     Campos disponíveis em cada item:
       palavra, tamanho, minuscula, emoji,
       dificuldade ('facil'|'medio'|'dificil'),
       categoria (ex: 'animal','fruta','objeto'…)
  ---------------------------------------------------------- */
  var PALAVRAS = window.HYWords || [];

  /* ----------------------------------------------------------
     LETRAS — referência ao banco global de letras.
     Fonte: utils/letters.js → window.HYLetters
     Campos disponíveis em cada item:
       maiusculo, minusculo, indice (0-25),
       dificuldade ('facil'|'medio'|'dificil'),
       eConsoante (boolean),
       distratoresUpper, distratoresLower (arrays de 3)
  ---------------------------------------------------------- */
  var LETRAS = window.HYLetters || [];

  /* ----------------------------------------------------------
     NUMEROS — pool de operações matemáticas pré-calculadas.
     Cada entrada: { n1, n2, op, ans, options, unknown? }
     op: '+' | '-'
     unknown: 'answer' | 'n1' | 'n2'  (qual valor está oculto)
     options: array com 3 valores incluindo o correto
     valorMax: maior número envolvido (para filtrar por dificuldade)
  ---------------------------------------------------------- */
  var NUMEROS = [
    /* ── adição simples, result ≤ 10, unknown='answer' ── */
    { n1: 1, n2: 2, op: '+', answer: 3,  unknown: 'answer', options: [2,  3,  4],  valorMax: 3  },
    { n1: 2, n2: 3, op: '+', answer: 5,  unknown: 'answer', options: [4,  5,  6],  valorMax: 5  },
    { n1: 3, n2: 4, op: '+', answer: 7,  unknown: 'answer', options: [6,  7,  8],  valorMax: 7  },
    { n1: 4, n2: 5, op: '+', answer: 9,  unknown: 'answer', options: [8,  9,  10], valorMax: 9  },
    { n1: 2, n2: 2, op: '+', answer: 4,  unknown: 'answer', options: [3,  4,  5],  valorMax: 4  },
    { n1: 1, n2: 4, op: '+', answer: 5,  unknown: 'answer', options: [4,  5,  6],  valorMax: 5  },
    { n1: 3, n2: 3, op: '+', answer: 6,  unknown: 'answer', options: [5,  6,  7],  valorMax: 6  },
    { n1: 2, n2: 6, op: '+', answer: 8,  unknown: 'answer', options: [7,  8,  9],  valorMax: 8  },
    { n1: 1, n2: 9, op: '+', answer: 10, unknown: 'answer', options: [9,  10, 11], valorMax: 10 },
    { n1: 5, n2: 5, op: '+', answer: 10, unknown: 'answer', options: [9,  10, 11], valorMax: 10 },
    { n1: 4, n2: 3, op: '+', answer: 7,  unknown: 'answer', options: [6,  7,  8],  valorMax: 7  },
    { n1: 6, n2: 2, op: '+', answer: 8,  unknown: 'answer', options: [7,  8,  9],  valorMax: 8  },
    { n1: 7, n2: 3, op: '+', answer: 10, unknown: 'answer', options: [9,  10, 11], valorMax: 10 },

    /* ── subtração simples, result ≥ 0, valorMax ≤ 10, unknown='answer' ── */
    { n1: 5,  n2: 2, op: '-', answer: 3,  unknown: 'answer', options: [2, 3,  4],  valorMax: 5  },
    { n1: 6,  n2: 3, op: '-', answer: 3,  unknown: 'answer', options: [2, 3,  4],  valorMax: 6  },
    { n1: 7,  n2: 4, op: '-', answer: 3,  unknown: 'answer', options: [2, 3,  4],  valorMax: 7  },
    { n1: 8,  n2: 5, op: '-', answer: 3,  unknown: 'answer', options: [2, 3,  4],  valorMax: 8  },
    { n1: 9,  n2: 4, op: '-', answer: 5,  unknown: 'answer', options: [4, 5,  6],  valorMax: 9  },
    { n1: 10, n2: 3, op: '-', answer: 7,  unknown: 'answer', options: [6, 7,  8],  valorMax: 10 },
    { n1: 8,  n2: 3, op: '-', answer: 5,  unknown: 'answer', options: [4, 5,  6],  valorMax: 8  },
    { n1: 10, n2: 7, op: '-', answer: 3,  unknown: 'answer', options: [2, 3,  4],  valorMax: 10 },
    { n1: 9,  n2: 1, op: '-', answer: 8,  unknown: 'answer', options: [7, 8,  9],  valorMax: 9  },
    { n1: 10, n2: 4, op: '-', answer: 6,  unknown: 'answer', options: [5, 6,  7],  valorMax: 10 },
    { n1: 7,  n2: 2, op: '-', answer: 5,  unknown: 'answer', options: [4, 5,  6],  valorMax: 7  },

    /* ── parcela oculta n2, valorMax ≤ 10 ── */
    { n1: 3, n2: 2, op: '+', answer: 5,  unknown: 'n2', options: [1, 2, 3],   valorMax: 5  },
    { n1: 4, n2: 3, op: '+', answer: 7,  unknown: 'n2', options: [2, 3, 4],   valorMax: 7  },
    { n1: 5, n2: 4, op: '+', answer: 9,  unknown: 'n2', options: [3, 4, 5],   valorMax: 9  },
    { n1: 6, n2: 4, op: '+', answer: 10, unknown: 'n2', options: [3, 4, 5],   valorMax: 10 },
    { n1: 8, n2: 2, op: '-', answer: 6,  unknown: 'n2', options: [1, 2, 3],   valorMax: 8  },
    { n1: 9, n2: 4, op: '-', answer: 5,  unknown: 'n2', options: [3, 4, 5],   valorMax: 9  },
    { n1: 2, n2: 5, op: '+', answer: 7,  unknown: 'n2', options: [4, 5, 6],   valorMax: 7  },
    { n1: 7, n2: 3, op: '-', answer: 4,  unknown: 'n2', options: [2, 3, 4],   valorMax: 7  },

    /* ── parcela oculta n1, valorMax ≤ 10 ── */
    { n1: 4, n2: 3, op: '+', answer: 7,  unknown: 'n1', options: [3, 4, 5],   valorMax: 7  },
    { n1: 6, n2: 4, op: '+', answer: 10, unknown: 'n1', options: [5, 6, 7],   valorMax: 10 },
    { n1: 9, n2: 4, op: '-', answer: 5,  unknown: 'n1', options: [8, 9, 10],  valorMax: 9  },
    { n1: 8, n2: 3, op: '-', answer: 5,  unknown: 'n1', options: [7, 8, 9],   valorMax: 8  },
    { n1: 5, n2: 2, op: '+', answer: 7,  unknown: 'n1', options: [4, 5, 6],   valorMax: 7  },
    { n1: 7, n2: 2, op: '-', answer: 5,  unknown: 'n1', options: [6, 7, 8],   valorMax: 7  },

    /* ── adição com dezenas, valorMax 11–20, unknown='answer' ── */
    { n1: 11, n2: 5,  op: '+', answer: 16, unknown: 'answer', options: [15, 16, 17], valorMax: 16 },
    { n1: 12, n2: 6,  op: '+', answer: 18, unknown: 'answer', options: [17, 18, 19], valorMax: 18 },
    { n1: 13, n2: 7,  op: '+', answer: 20, unknown: 'answer', options: [19, 20, 21], valorMax: 20 },
    { n1: 14, n2: 4,  op: '+', answer: 18, unknown: 'answer', options: [16, 18, 20], valorMax: 18 },
    { n1: 10, n2: 8,  op: '+', answer: 18, unknown: 'answer', options: [17, 18, 19], valorMax: 18 },
    { n1: 15, n2: 5,  op: '+', answer: 20, unknown: 'answer', options: [18, 20, 22], valorMax: 20 },
    { n1: 11, n2: 6,  op: '+', answer: 17, unknown: 'answer', options: [16, 17, 18], valorMax: 17 },
    { n1: 10, n2: 9,  op: '+', answer: 19, unknown: 'answer', options: [18, 19, 20], valorMax: 19 },

    /* ── subtração com dezenas, valorMax 11–20, unknown='answer' ── */
    { n1: 15, n2: 5,  op: '-', answer: 10, unknown: 'answer', options: [9,  10, 11], valorMax: 15 },
    { n1: 18, n2: 8,  op: '-', answer: 10, unknown: 'answer', options: [9,  10, 11], valorMax: 18 },
    { n1: 16, n2: 6,  op: '-', answer: 10, unknown: 'answer', options: [8,  10, 12], valorMax: 16 },
    { n1: 20, n2: 7,  op: '-', answer: 13, unknown: 'answer', options: [12, 13, 14], valorMax: 20 },
    { n1: 17, n2: 9,  op: '-', answer: 8,  unknown: 'answer', options: [7,  8,  9],  valorMax: 17 },
    { n1: 15, n2: 8,  op: '-', answer: 7,  unknown: 'answer', options: [6,  7,  8],  valorMax: 15 },
    { n1: 20, n2: 5,  op: '-', answer: 15, unknown: 'answer', options: [14, 15, 16], valorMax: 20 },

    /* ── parcela oculta — dezenas ── */
    { n1: 10, n2: 6,  op: '+', answer: 16, unknown: 'n2', options: [5,  6,  7],  valorMax: 16 },
    { n1: 12, n2: 8,  op: '+', answer: 20, unknown: 'n2', options: [7,  8,  9],  valorMax: 20 },
    { n1: 15, n2: 5,  op: '-', answer: 10, unknown: 'n2', options: [4,  5,  6],  valorMax: 15 },
    { n1: 18, n2: 8,  op: '-', answer: 10, unknown: 'n2', options: [7,  8,  9],  valorMax: 18 },
    { n1: 11, n2: 4,  op: '+', answer: 15, unknown: 'n2', options: [3,  4,  5],  valorMax: 15 },
    { n1: 20, n2: 12, op: '-', answer: 8,  unknown: 'n1', options: [19, 20, 21], valorMax: 20 },
    { n1: 25, n2: 10, op: '-', answer: 15, unknown: 'n1', options: [24, 25, 26], valorMax: 25 },
    { n1: 15, n2: 7,  op: '+', answer: 22, unknown: 'n1', options: [14, 15, 16], valorMax: 22 },
    { n1: 14, n2: 6,  op: '+', answer: 20, unknown: 'n1', options: [13, 14, 15], valorMax: 20 },
    { n1: 18, n2: 5,  op: '-', answer: 13, unknown: 'n1', options: [17, 18, 19], valorMax: 18 },

    /* ── somas maiores, valorMax 21–35, unknown='answer' ── */
    { n1: 15, n2: 6,  op: '+', answer: 21, unknown: 'answer', options: [19, 21, 23], valorMax: 21 },
    { n1: 13, n2: 8,  op: '+', answer: 21, unknown: 'answer', options: [20, 21, 22], valorMax: 21 },
    { n1: 16, n2: 5,  op: '+', answer: 21, unknown: 'answer', options: [19, 21, 23], valorMax: 21 },
    { n1: 14, n2: 7,  op: '+', answer: 21, unknown: 'answer', options: [20, 21, 22], valorMax: 21 },
    { n1: 9,  n2: 9,  op: '+', answer: 18, unknown: 'answer', options: [17, 18, 19], valorMax: 18 },
    { n1: 8,  n2: 7,  op: '+', answer: 15, unknown: 'answer', options: [14, 15, 16], valorMax: 15 },
    { n1: 9,  n2: 6,  op: '+', answer: 15, unknown: 'answer', options: [13, 15, 17], valorMax: 15 },
    { n1: 20, n2: 5,  op: '+', answer: 25, unknown: 'answer', options: [23, 25, 27], valorMax: 25 },

    /* ── subtrações maiores, valorMax 21–35, unknown='answer' ── */
    { n1: 20, n2: 7,  op: '-', answer: 13, unknown: 'answer', options: [12, 13, 14], valorMax: 20 },
    { n1: 25, n2: 10, op: '-', answer: 15, unknown: 'answer', options: [14, 15, 16], valorMax: 25 },
    { n1: 22, n2: 9,  op: '-', answer: 13, unknown: 'answer', options: [12, 13, 14], valorMax: 22 },
    { n1: 18, n2: 5,  op: '-', answer: 13, unknown: 'answer', options: [12, 13, 14], valorMax: 18 },
    { n1: 30, n2: 15, op: '-', answer: 15, unknown: 'answer', options: [14, 15, 16], valorMax: 30 },
    { n1: 28, n2: 8,  op: '-', answer: 20, unknown: 'answer', options: [19, 20, 21], valorMax: 28 },

    /* ── desafio avançado, valorMax > 30, unknown='answer' ── */
    { n1: 25, n2: 8,  op: '+', answer: 33, unknown: 'answer', options: [31, 33, 35], valorMax: 33 },
    { n1: 30, n2: 12, op: '+', answer: 42, unknown: 'answer', options: [40, 42, 44], valorMax: 42 },
    { n1: 28, n2: 9,  op: '+', answer: 37, unknown: 'answer', options: [35, 37, 39], valorMax: 37 },
    { n1: 35, n2: 15, op: '-', answer: 20, unknown: 'answer', options: [18, 20, 22], valorMax: 35 },
    { n1: 45, n2: 25, op: '-', answer: 20, unknown: 'answer', options: [18, 20, 22], valorMax: 45 },
    { n1: 50, n2: 30, op: '-', answer: 20, unknown: 'answer', options: [18, 20, 22], valorMax: 50 },
    { n1: 38, n2: 18, op: '-', answer: 20, unknown: 'answer', options: [19, 20, 21], valorMax: 38 },
    { n1: 40, n2: 22, op: '-', answer: 18, unknown: 'answer', options: [17, 18, 19], valorMax: 40 },

    /* ── parcela oculta avançada, valorMax > 15 ── */
    { n1: 8,  n2: 10, op: '+', answer: 18, unknown: 'n2', options: [9,  10, 11], valorMax: 18 },
    { n1: 15, n2: 8,  op: '+', answer: 23, unknown: 'n2', options: [7,  8,  9],  valorMax: 23 },
    { n1: 12, n2: 8,  op: '+', answer: 20, unknown: 'n2', options: [7,  8,  9],  valorMax: 20 },
    { n1: 20, n2: 15, op: '-', answer: 5,  unknown: 'n2', options: [14, 15, 16], valorMax: 20 },
    { n1: 25, n2: 12, op: '-', answer: 13, unknown: 'n1', options: [24, 25, 26], valorMax: 25 },
    { n1: 20, n2: 8,  op: '+', answer: 28, unknown: 'n1', options: [19, 20, 21], valorMax: 28 },
  ];

  return {
    pick:    pick,
    PALAVRAS: PALAVRAS,
    LETRAS:   LETRAS,
    NUMEROS:  NUMEROS,
  };
})();
