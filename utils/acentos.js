// utils/acentos.js — HY Acentos Bank
// Lookup tables para o jogo Fábrica de Acentos.
// As fases são derivadas de window.HYWords (campo faseAcento).
// DEPRECATED (phases): use HYWords.filter(w => w.faseAcento === N) instead.
window.HYAcentos = {
  accentMap: {
    'Á': { base: 'A', accent: '´' },
    'É': { base: 'E', accent: '´' },
    'Í': { base: 'I', accent: '´' },
    'Ó': { base: 'O', accent: '´' },
    'Ú': { base: 'U', accent: '´' },
    'Â': { base: 'A', accent: '^' },
    'Ê': { base: 'E', accent: '^' },
    'Ô': { base: 'O', accent: '^' },
    'Ã': { base: 'A', accent: '~' },
    'Õ': { base: 'O', accent: '~' }
  },
  phases: [
    // Fase 1: Acento Agudo
    [
      { word: "ÁGUA", emoji: "💧" },
      { word: "CAFÉ", emoji: "☕" },
      { word: "LÁPIS", emoji: "✏️" },
      { word: "ÓCULOS", emoji: "👓" },
      { word: "BAÚ", emoji: "🧰" },
    ],
    // Fase 2: Acento Circunflexo
    [
      { word: "ÔNIBUS", emoji: "🚌" },
      { word: "BEBÊ", emoji: "👶" },
      { word: "ROBÔ", emoji: "🤖" },
      { word: "TÊNIS", emoji: "👟" },
      { word: "LÂMPADA", emoji: "💡" },
    ],
    // Fase 3: Til
    [
      { word: "MAÇÃ", emoji: "🍎" },
      { word: "LEÃO", emoji: "🦁" },
      { word: "MÃO", emoji: "🖐️" },
      { word: "AVIÃO", emoji: "✈️" },
      { word: "CORAÇÃO", emoji: "❤️" },
    ],
    // Fase 4: Mistura Divertida 1
    [
      { word: "PÉ", emoji: "🦶" },
      { word: "AVÔ", emoji: "👴" },
      { word: "MÃE", emoji: "👩" },
      { word: "ÁRVORE", emoji: "🌳" },
      { word: "TRÊS", emoji: "3️⃣" },
    ],
    // Fase 5: Mistura Divertida 2
    [
      { word: "PÁSSARO", emoji: "🐦" },
      { word: "PÊSSEGO", emoji: "🍑" },
      { word: "CAMINHÃO", emoji: "🚛" },
      { word: "RELÓGIO", emoji: "⌚" },
      { word: "ÍNDIO", emoji: "🏹" },
    ],
    // Fase 6: Todas as letras têm caixa (nível 1)
    [
      { word: "XÍCARA", emoji: "☕" },
      { word: "MÁGICA", emoji: "🪄" },
      { word: "BÚSSOLA", emoji: "🧭" },
      { word: "VULCÃO", emoji: "🌋" },
      { word: "PÊNALTI", emoji: "⚽" },
    ],
    // Fase 7: Desafio Master 1
    [
      { word: "MATEMÁTICA", emoji: "🧮" },
      { word: "ECOLÓGICO", emoji: "🌱" },
      { word: "DINÂMICO", emoji: "⚡" },
      { word: "TUBARÃO", emoji: "🦈" },
      { word: "FÁBRICA", emoji: "🏭" },
    ],
    // Fase 8: Acento Agudo avançado
    [
      { word: "HÉROE", emoji: "🦸" },
      { word: "MÉDICO", emoji: "👨‍⚕️" },
      { word: "PÚBLICO", emoji: "🏟️" },
      { word: "MÚSICA", emoji: "🎵" },
      { word: "FÍSICO", emoji: "🔬" },
    ],
    // Fase 9: Circunflexo avançado
    [
      { word: "ÂNCORA", emoji: "⚓" },
      { word: "TÔNICO", emoji: "💊" },
      { word: "ÊXITO", emoji: "🏆" },
      { word: "ÂNGULO", emoji: "📐" },
      { word: "CÔNCAVO", emoji: "🪨" },
    ],
    // Fase 10: Til avançado
    [
      { word: "CIDADÃO", emoji: "🧑" },
      { word: "ESTAÇÃO", emoji: "🚉" },
      { word: "FUNÇÃO", emoji: "📊" },
      { word: "NAÇÃO", emoji: "🏳️" },
      { word: "PORÇÃO", emoji: "🍱" },
    ],
    // Fase 11: Mistura complexa
    [
      { word: "ESPÍRITO", emoji: "👻" },
      { word: "CÂMERA", emoji: "📷" },
      { word: "POLÍTICO", emoji: "🏛️" },
      { word: "HISTÓRICO", emoji: "📜" },
      { word: "TÉCNICO", emoji: "🔧" },
    ],
    // Fase 12: Desafio Master Final
    [
      { word: "CIENTÍFICO", emoji: "🔭" },
      { word: "ECONÔMICO", emoji: "💹" },
      { word: "FANTÁSTICO", emoji: "🌟" },
      { word: "ESPECÍFICO", emoji: "🎯" },
      { word: "GEOGRÁFICO", emoji: "🗺️" },
    ],
  ],
  accentOptions: [
    { symbol: '´', name: 'Agudo', color: 'bg-blue-400' },
    { symbol: '^', name: 'Circunflexo', color: 'bg-purple-400' },
    { symbol: '~', name: 'Til', color: 'bg-pink-400' }
  ]
};
