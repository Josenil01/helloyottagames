// utils/challenges.js — HY Challenges Generator
// Gera desafios dinamicamente a partir de window.HYWords.
// Regra: se mais de 1 jogo usa a mesma lógica → vai para utils/.
window.HY = window.HY || {};
(function () {

  // ── Utilitários internos ────────────────────────────────────────────────

  function _shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function _attrValue(word, atributo) {
    var v = word[atributo];
    if (v === null || v === undefined) return null;
    if (Array.isArray(v)) return v.length ? v[0] : null;
    return v;
  }

  function _hasAttr(word, atributo) {
    var v = word[atributo];
    if (v === null || v === undefined) return false;
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === 'string' && v.length > 0;
  }

  function _eligible(banco, atributo) {
    return banco.filter(function (w) { return _hasAttr(w, atributo); });
  }

  function _distractors(targetWord, atributo, banco, count) {
    var answer = _attrValue(targetWord, atributo);
    var pool = banco.filter(function (w) {
      if (w.palavra === targetWord.palavra) return false;
      if (!_hasAttr(w, atributo)) return false;
      return _attrValue(w, atributo) !== answer;
    });
    return _shuffle(pool).slice(0, count).map(function (w) {
      return _attrValue(w, atributo);
    });
  }

  var INSTRUCTIONS = {
    sinonimos: {
      match:    'Encontre a palavra que significa o mesmo!',
      connect:  'Ligue cada palavra ao seu sinônimo!',
      intruder: 'Qual NÃO tem o mesmo significado que as outras?',
      sentence: 'Substitua a palavra em destaque pelo seu sinônimo!',
    },
    rimas: {
      match:    'Qual palavra RIMA com a destacada?',
      connect:  'Ligue os pares que rimam!',
      intruder: 'Qual NÃO rima com as outras?',
      sentence: 'Complete com a palavra que rima!',
    },
    oposto: {
      match:    'Encontre a palavra com sentido OPOSTO!',
      connect:  'Ligue cada palavra ao seu oposto!',
      intruder: 'Qual NÃO é o oposto das outras?',
      sentence: 'Substitua pela palavra de sentido OPOSTO!',
    },
    coletivo: {
      match:    'Qual é o coletivo deste grupo?',
      connect:  'Ligue o animal ao seu coletivo!',
      intruder: 'Qual dessas palavras NÃO é um coletivo?',
      sentence: 'Substitua pelo coletivo correspondente!',
    },
  };

  function _instr(atributo, tipo) {
    var map = INSTRUCTIONS[atributo] || {};
    return map[tipo] || '';
  }

  // ── Funções públicas ────────────────────────────────────────────────────

  function gerarMatch(palavra, atributo, banco) {
    var word = banco.find(function (w) { return w.palavra === palavra; });
    if (!word || !_hasAttr(word, atributo)) return null;
    var answer = _attrValue(word, atributo);
    var dist = _distractors(word, atributo, banco, 2);
    if (dist.length < 2) return null;
    return {
      type: 'match',
      target: word.palavra,
      answer: answer,
      options: _shuffle([answer].concat(dist)),
      emoji: word.emoji,
      instruction: _instr(atributo, 'match'),
    };
  }

  function gerarConnect(palavras, atributo, banco) {
    var words = palavras.map(function (p) {
      return banco.find(function (w) { return w.palavra === p; });
    }).filter(function (w) { return w && _hasAttr(w, atributo); });
    if (words.length < 2) return null;
    var leftWords = words.map(function (w) { return w.palavra; });
    var matches = {};
    var rightWords = [];
    // usedRight garante que rightWords não dupliquem leftWords nem entre si
    var usedRight = {};
    leftWords.forEach(function (p) { usedRight[p] = true; });

    words.forEach(function (w) {
      var raw = w[atributo];
      var chosen;
      if (Array.isArray(raw)) {
        // Para atributos array (rimas, sinonimos): escolhe o primeiro valor não usado
        chosen = raw.find(function (v) { return !usedRight[v]; });
        if (!chosen) chosen = raw[0];
      } else {
        chosen = raw;
      }
      usedRight[chosen] = true;
      matches[w.palavra] = chosen;
      rightWords.push(chosen);
    });

    return {
      type: 'connect',
      leftWords: leftWords,
      rightWords: _shuffle(rightWords),
      matches: matches,
      emoji: words[0].emoji,
      instruction: _instr(atributo, 'connect'),
    };
  }

  // palavras: array de 4 strings; o que não tiver o atributo é o intruso
  function gerarIntruder(palavras, atributo, banco) {
    var objs = palavras.map(function (p) {
      return banco.find(function (w) { return w.palavra === p; }) || null;
    });
    var intruderIdx = -1;
    var intruder = palavras.find(function (p, i) {
      if (!objs[i] || !_hasAttr(objs[i], atributo)) { intruderIdx = i; return true; }
      return false;
    });
    if (!intruder) return null;
    // Usa o emoji do intruso como dica visual — mesma convenção do design original
    var intruderObj = objs[intruderIdx];
    return {
      type: 'intruder',
      words: _shuffle(palavras.slice()),
      answer: intruder,
      emoji: intruderObj ? intruderObj.emoji : '🔍',
      instruction: _instr(atributo, 'intruder'),
    };
  }

  function gerarSentence(palavra, atributo, banco) {
    var word = banco.find(function (w) { return w.palavra === palavra; });
    if (!word || !word.frases || !word.frases.length) return null;
    var attrVal = word[atributo];
    if (attrVal === null || attrVal === undefined) return null;
    var validAnswers = Array.isArray(attrVal) ? attrVal : [attrVal];
    // Percorre todas as frases e usa a primeira cujo resposta é válida para este atributo
    var frase = null;
    for (var fi = 0; fi < word.frases.length; fi++) {
      if (validAnswers.indexOf(word.frases[fi].resposta) !== -1) { frase = word.frases[fi]; break; }
    }
    if (!frase) return null;
    var dist = _distractors(word, atributo, banco, 2);
    if (dist.length < 2) return null;
    return {
      type: 'sentence',
      preText: frase.pre,
      boldText: frase.destaque,
      postText: frase.pos,
      answer: frase.resposta,
      options: _shuffle([frase.resposta].concat(dist)),
      emoji: word.emoji,
      instruction: _instr(atributo, 'sentence'),
    };
  }

  // ── buildLevels ─────────────────────────────────────────────────────────
  // Gera até trackCount trilhas × 5 desafios.
  // Sequência por trilha: match, match, connect(3 pares), intruder, sentence/match.
  // Garante exatamente trackCount*5 níveis reciclando as palavras se necessário.

  function buildLevels(atributo, banco, trackCount) {
    var pool = _shuffle(_eligible(banco, atributo));
    if (pool.length === 0) return [];

    // Palavras sem o atributo (para o intruso)
    var noAttr = banco.filter(function (w) { return !_hasAttr(w, atributo); });
    // Palavras com frases válidas (para sentence)
    var withFrases = pool.filter(function (w) { return w.frases && w.frases.length; });

    var levels = [];
    var idx = 0;
    var fraseIdx = 0;

    for (var t = 0; t < trackCount; t++) {
      // Reinicia pool ciclicamente se necessário
      if (idx + 3 > pool.length) {
        pool = _shuffle(pool);
        idx = 0;
      }

      var w1 = pool[idx % pool.length];
      var w2 = pool[(idx + 1) % pool.length];
      var w3 = pool[(idx + 2) % pool.length];
      var w4 = pool[(idx + 3) % pool.length];
      var w5 = pool[(idx + 4) % pool.length];
      idx += 5;

      // Para connect: precisamos de 3 pares com valores distintos
      var connectWords = _pickDistinctConnect([w1, w2, w3], atributo, pool);

      var m1 = gerarMatch(w1.palavra, atributo, banco);
      var m2 = gerarMatch(w2.palavra, atributo, banco);
      var conn = connectWords ? gerarConnect(connectWords.map(function (w) { return w.palavra; }), atributo, banco) : gerarMatch(w3.palavra, atributo, banco);

      // Intruso: 3 palavras com atributo + 1 sem.
      // Exceção: 'oposto' — intruder não faz sentido pedagógico com palavra aleatória sem oposto;
      // usa match adicional como fallback garantido.
      var intr;
      if (atributo === 'oposto') {
        intr = gerarMatch(w4 ? w4.palavra : w3.palavra, atributo, banco) || gerarMatch(w3.palavra, atributo, banco);
      } else {
        var intruderWord = noAttr[Math.floor(Math.random() * noAttr.length)];
        intr = intruderWord
          ? gerarIntruder([w1.palavra, w2.palavra, w3.palavra, intruderWord.palavra], atributo, banco)
          : gerarMatch(w3.palavra, atributo, banco);
      }

      // Sentence: usa palavra com frase, ciclando; fallback = match
      var sentWord = withFrases.length ? withFrases[fraseIdx % withFrases.length] : null;
      fraseIdx++;
      var sent = sentWord ? gerarSentence(sentWord.palavra, atributo, banco) : null;
      if (!sent) sent = gerarMatch(w5.palavra, atributo, banco);

      // Só adiciona trilha se todos os desafios são válidos
      if (m1 && m2 && conn && intr && sent) {
        levels.push(m1, m2, conn, intr, sent);
      } else {
        // Tenta pelo menos 2 matches para não perder a trilha
        var fallback1 = m1 || gerarMatch(w2.palavra, atributo, banco);
        var fallback2 = gerarMatch(w3.palavra, atributo, banco) || fallback1;
        var fallback3 = gerarMatch(w4.palavra, atributo, banco) || fallback1;
        if (fallback1 && fallback2 && fallback3) {
          levels.push(fallback1, fallback2, fallback3, fallback3, fallback3);
        }
      }
    }

    // Garante exatamente trackCount*5 níveis
    var target = trackCount * 5;
    while (levels.length < target) {
      var fill = gerarMatch(pool[Math.floor(Math.random() * pool.length)].palavra, atributo, banco);
      if (fill) levels.push(fill);
      else break;
    }
    levels = levels.slice(0, target);

    return levels.map(function (l, i) {
      return Object.assign({}, l, { id: i + 1 });
    });
  }

  function _pickDistinctConnect(candidates, atributo, pool) {
    // Garante que os 3 candidatos tenham valores distintos para o atributo
    var used = {};
    var picked = [];
    var all = _shuffle(pool);
    for (var i = 0; i < all.length && picked.length < 3; i++) {
      var v = _attrValue(all[i], atributo);
      if (v && !used[v]) { used[v] = true; picked.push(all[i]); }
    }
    return picked.length >= 2 ? picked : null;
  }

  // ── Exportação ──────────────────────────────────────────────────────────

  window.HY.challenges = {
    shuffle:      _shuffle,
    gerarMatch:   gerarMatch,
    gerarConnect: gerarConnect,
    gerarIntruder: gerarIntruder,
    gerarSentence: gerarSentence,
    buildLevels:  buildLevels,
  };

})();
