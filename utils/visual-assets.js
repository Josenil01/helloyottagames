/* Hello Yotta visual layer. Kenney CC0 renders; no changes to game state/data.
 * Emoji text and SVG nodes remain in place for React, event handlers and labels.
 * Images are painted with CSS only after successful loading. */
(function () {
  'use strict';
  const library = window.HYArtwork;
  if (!library) return;
  const currentScript = document.currentScript;
  const base = new URL(library.base || '../assets/visuals/', currentScript.src).href;
  const folder = decodeURIComponent(location.pathname).split('/').filter(Boolean).slice(-2, -1)[0];
  const config = library.games[folder];
  const cache = new Map();
  const painted = new WeakMap();
  let scheduled = false;
  const pending = new Set();
  const normalize = value => value.replace(/\uFE0F/g, '').trim();
  const symbols = new Map(Object.entries(library.emoji).map(([symbol, key]) => [normalize(symbol), key]));

  function imageUrl(file) { return new URL(file, base).href; }
  function objectFile(key) { return library.assets[key] && library.assets[key].file; }
  function load(file) {
    if (!cache.has(file)) {
      cache.set(file, new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = imageUrl(file);
      }));
    }
    return cache.get(file);
  }

  function paint(element, file, className, original) {
    if (!file || painted.get(element) === file) return;
    painted.set(element, file);
    load(file).then(ok => {
      if (!ok || !element.isConnected || painted.get(element) !== file) return;
      if (original !== undefined && element.textContent.trim() !== original) return;
      element.style.setProperty('--hy-art-image', 'url("' + imageUrl(file) + '")');
      element.classList.add(className || 'hy-art-icon');
      element.dataset.hyArtwork = file;
    });
  }

  function protectedContent(element) {
    if (element.closest('svg,canvas,script,style,textarea,input,option,[contenteditable="true"],.pirate-art-fallback')) return true;
    if (!config) return false;
    return config.guards.some(selector => element.closest(selector));
  }

  function refreshLeaf(element) {
    if (!(element instanceof HTMLElement) || element.children.length || protectedContent(element)) return;
    const text = element.textContent.trim();
    const key = symbols.get(normalize(text));
    if (!key) {
      if (element.classList.contains('hy-art-icon') && !element.classList.contains('hy-art-hero')) {
        element.classList.remove('hy-art-icon');
        element.style.removeProperty('--hy-art-image');
        delete element.dataset.hyArtwork;
        painted.delete(element);
      }
      return;
    }
    paint(element, objectFile(key), 'hy-art-icon', text);
  }

  function decorateCatalog() {
    document.querySelectorAll('.game-card').forEach(card => {
      const path = decodeURIComponent(new URL(card.getAttribute('href'), location.href).pathname);
      const entry = library.games[path.split('/').filter(Boolean).slice(-2, -1)[0]];
      if (!entry) return;
      card.dataset.hyGame = entry.key;
      card.style.setProperty('--hy-game-accent', entry.accent);
      const emblem = card.querySelector('.emoji');
      if (emblem) paint(emblem, entry.hero, 'hy-art-catalog');
    });
    if (document.querySelector('.game-card')) document.body.classList.add('hy-catalog-artwork');
  }

  function coverRoot() {
    // The legacy geometry HTML is hidden; its active cover is #geo-home.
    const explicit = document.querySelector('#geo-home,.sphinx-cover,.pirate-cover,#screen-cover,#screen-start,#screen-home');
    if (explicit) return explicit;
    const h1 = document.querySelector('#root h1');
    if (!h1) return null;
    const root = document.querySelector('#root > :first-child');
    if (!root || !Array.from(root.querySelectorAll('button')).some(b => /jogar|começar|iniciar|explorar|abrir|escolher trilha|decolar/i.test(b.textContent))) return null;
    return root;
  }

  function decorateCover() {
    const root = coverRoot();
    if (!root) return;
    root.classList.add('hy-art-cover');
    // Pirate and Sphinx scenes already have dedicated composition/characters.
    if (!root.matches('.pirate-cover,.sphinx-cover')) {
      root.classList.add('hy-art-scene');
      root.style.setProperty('--hy-scene-left', 'url("' + imageUrl(objectFile(config.objects[0])) + '")');
      root.style.setProperty('--hy-scene-right', 'url("' + imageUrl(objectFile(config.objects[config.objects.length - 1])) + '")');
    }
    let emblem = root.querySelector('.hy-hero,.cover-icon,.cover-emoji');
    if (!emblem && config.coverSymbol) {
      const text = normalize(config.coverSymbol);
      emblem = Array.from(root.querySelectorAll('div,span,strong')).find(e => !e.children.length && normalize(e.textContent) === text && parseFloat(getComputedStyle(e).fontSize) >= 35 && !e.closest('.hy-deco'));
    }
    if (!emblem) {
      const heading = root.querySelector('h1');
      const previous = heading && heading.previousElementSibling;
      if (previous && previous.matches('div,svg') && !previous.querySelector('button,a,input') && !previous.matches('.hy-deco') && previous.textContent.trim().length < 8) emblem = previous;
      if (!emblem && heading) {
        const next = heading.nextElementSibling;
        if (next && next.matches('div') && !next.querySelector('button,a,input') && (next.querySelector('svg') || next.textContent.trim().length < 5)) emblem = next;
      }
    }
    if (emblem && !root.matches('.pirate-cover,.sphinx-cover')) paint(emblem, config.hero, 'hy-art-hero');
  }

  function decorateTracks() {
    document.querySelectorAll('.hy-track-card:not(.hy-locked) .hy-track-emoji').forEach((emblem, i) => {
      // Keep the purpose-built pirate illustrations and locked-state symbols.
      if (emblem.querySelector('img')) return;
      paint(emblem, objectFile(config.objects[i % config.objects.length]), 'hy-art-track');
    });
  }

  function decorateModels() {
    const targets = {
      'Duelo dos Monstros': [['#monster-left .monster-svg', 'orc'], ['#monster-right .monster-svg', 'alien']],
      'monster_typer II': [['#monster-svg', 'alien'], ['#screen-start .monster-anim svg', 'alien']],
      'Trem da Soma e Subtracao': [['#home-train > svg', 'train'], ['.engine-box > svg', 'train']],
      'Defesa do Castelo Matematico': [['.castle-svg', 'castle']],
      'Galáxia da Matemática': [['#geo-ship', 'spaceship']]
    };
    (targets[folder] || []).forEach(([selector,key]) => {
      document.querySelectorAll(selector).forEach(e => paint(e, objectFile(key), 'hy-art-model'));
    });
  }

  function flush() {
    scheduled = false;
    const nodes = Array.from(pending); pending.clear();
    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) refreshLeaf(node.parentElement);
      else if (node.nodeType === Node.ELEMENT_NODE) {
        refreshLeaf(node);
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        let text;
        while ((text = walker.nextNode())) {
          if (symbols.has(normalize(text.nodeValue))) refreshLeaf(text.parentElement);
        }
      }
    });
    if (config) { decorateCover(); decorateTracks(); decorateModels(); }
    else decorateCatalog();
  }
  function enqueue(node) {
    if (node) pending.add(node);
    if (!scheduled) { scheduled = true; requestAnimationFrame(flush); }
  }

  function start() {
    if (config) {
      document.body.dataset.hyTheme = config.key;
      document.body.style.setProperty('--hy-theme-accent', config.accent);
    }
    new MutationObserver(records => records.forEach(record => {
      if (record.type === 'characterData') enqueue(record.target);
      else record.addedNodes.forEach(enqueue);
    })).observe(document.body, {subtree:true,childList:true,characterData:true});
    enqueue(document.body);
    document.body.dataset.hyArtworkReady = 'true';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
