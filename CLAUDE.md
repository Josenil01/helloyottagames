# Hello Yotta Games — CLAUDE.md

## Graphify — arquitetura do projeto

Consulte `graphify-out/` para entender fluxo, dependências e acoplamento antes de ler código-fonte. Só leia arquivos diretamente quando precisar da sintaxe exata de um arquivo já identificado pelo grafo.

---

## O que é este repositório

Plataforma de jogos educacionais browser-based para crianças falantes de português (`games.helloyotta.com`). 25 jogos de Português e Matemática, cada um como SPA self-contained em HTML/CSS/JS. Hospedado como site estático no GitHub Pages — sem build step, sem bundler, sem npm.

**Worktree:** use `isolation: "worktree"` no Agent tool para tarefas experimentais ou refatorações de maior risco.

---

## ⚠️ GRUPO DE RISCO — 12 JOGOS REACT+BABEL

Esses jogos usam **React 18 + Babel standalone com `main.js` externo** e **quebram com facilidade**. Leia esta seção antes de tocar em qualquer um deles.

| Jogo                    | Pasta                      |
| ----------------------- | -------------------------- |
| Canhões de Ouro         | `Canhões de ouro/`         |
| Caçadores de Coletivos  | `Caçadores de Coletivos/`  |
| Detetives da Ortografia | `Detetives da Ortografia/` |
| Digitado                | `Digitado/`                |
| Escola de Magia VSA     | `Escola de Magia VSA/`     |
| Fábrica de Acentos      | `Fabrica de Acentos/`      |
| Fábrica de Rimas        | `Fábrica de Rimas/`        |
| Galáxia dos Opostos     | `Galaxia dos Opostos/`     |
| Maiúsculo vs Minúsculo  | `Maisculo vs Minusculo/`   |
| Matemática Pirata       | `Matematica Pirata/`       |
| Organiza Tudo           | `Organiza Tudo/`           |
| Sinônimos               | `Sinonimos/`               |

Em alterações massivas em todos os jogos, divida em duas subtarefas: primeiro Vanilla JS (fora do grupo), depois React+Babel (grupo de risco).

### Por que são frágeis

O `index.html` carrega o Babel, que transpila `main.js` em tempo de execução. Três pontos de falha:

1. **Ordem de scripts é rígida:**

   ```html
   <script src="../utils/audio.js"></script>
   <script src="../utils/score.js"></script>
   <script src="../utils/elapsed.js"></script>
   <script src="../utils/progress.js"></script>
   <script src="../utils/stars.js"></script>
   <!-- qualquer util novo vem aqui, ANTES do babel -->
   <script src="../vendor/babel@7.26.10.min.js"></script>
   <script type="text/babel" src="main.js"></script>
   ```

2. **`<script type="text/babel" src="main.js">` nunca deve ser alterado.** Qualquer mudança nesse tag provoca tela branca sem erro no console.

3. **Todo o jogo vive em `main.js`.** Leia o arquivo inteiro antes de editar — React state e closures se entrelaçam.

### Regras de edição

**Utilitário novo:** adicionar `<script src="../utils/X.js">` imediatamente antes do `babel`.

**Editar `main.js`:**
- Leia o arquivo inteiro primeiro.
- Use substituição de string exata (Edit tool). Diferenças de indentação causam falha silenciosa.
- Nunca adicione `window.onload` ou `DOMContentLoaded` — React já gerencia via `ReactDOM.createRoot`.

**Integração com `HY.score`:**
- `HY.score.reset()` em `startGame()`/`startPhase()`/`startLevel()`
- `HY.score.startChallenge()` ao fim de `resetTurn()`/início de cada desafio
- `HY.playWin(); HY.score.correct();` antes de `setIsSuccess(true)`
- `HY.playLose(); HY.score.wrong();` no branch de erro
- Verificar com grep: `HY\.score\.reset`, `HY\.playWin`, `HY\.playLose`, `HY\.score\.startChallenge`

### Verificação mínima após edição

1. Abrir `index.html` no browser (via Live Server).
2. Console sem erros (`is not defined`, `cannot read properties of undefined`).
3. Tela de capa renderiza e consegue interagir no gameplay.

> Tela branca sem erro = Babel falhou silenciosamente. Verifique a ordem dos scripts.

> **⚠️ PowerShell:** nunca escreva conteúdo de arquivo com string interpolada (`"..."`) em PowerShell — o `` `n `` vira literal em vez de newline. Use single-quote heredoc (`@'...'@`) ou a ferramenta Write/Edit do Claude. Esse bug já corrompeu 25 arquivos de uma vez.

---

## ⚠️ REGRA ABSOLUTA — NUNCA APAGAR CÓDIGO

**PROIBIDO remover, esvaziar ou substituir o conteúdo de qualquer arquivo.** Isso inclui `index.html`, `main.js`, CSS e qualquer arquivo com código existente.

- Nunca esvazie um arquivo — nem parcialmente
- Refatorações que movem código só podem ser feitas se o arquivo de origem for **atualizado imediatamente** para referenciar o novo arquivo
- Em caso de dúvida, **edite** — nunca apague

**Motivo:** já perdemos trabalho significativo por causa de código apagado sem commit.

---

## Git — PROIBIDO

**Nunca execute comandos git** (`git add`, `git commit`, `git push`, `git restore`, nem qualquer outro). O controle de versão é feito manualmente pelo usuário.

---

## Escopo de trabalho

Trabalhe **apenas dentro deste repositório**. Novas funcionalidades se limitam a gameplay individual ou multiplayer local dentro dos próprios jogos. Não toque em autenticação, progresso de alunos, analytics ou qualquer serviço externo do ecossistema helloyotta.com.

---

## Fronteiras do ecossistema — NÃO ALTERAR

### 1. URLs dos jogos

Não renomeie pastas, não mova arquivos. Cada jogo é acessível por path direto:
```
/Digitado/index.html
/Matematica Pirata/index.html
/syllables/index.html
```
> **Exceção:** `vowel` usa `vowel.html` como entry point, não `index.html`.

### 2. Formato da API JSON

`/api/games.json` e `/api/games-by-category.json` são contratos públicos. Não adicione, remova ou renomeie campos sem validar com o ecossistema:

```json
{
  "slug": "matematica-pirata",
  "title": "Matemática Pirata",
  "description": "...",
  "icon": "🏴‍☠️",
  "href": "/Matem%C3%A1tica%20Pirata/index.html",
  "url": "https://games.helloyotta.com/...",
  "categories": ["matematica"]
}
```

### 3. Estrutura HTML dos game-cards

O script `generate-games-api.ps1` parseia `index.html` via regex. **Não altere classes, atributos ou ordem:**

```html
<a href="..." class="game-card [outras-classes]" data-category="categoria1 categoria2">
  <div class="emoji">🏴‍☠️</div>
  <div class="title">Título do Jogo</div>
  <div class="description">Descrição do jogo.</div>
</a>
```

Atributos obrigatórios: `href`, `class` (com `game-card`), `data-category`. Divs nessa ordem: `emoji`, `title`, `description`.

---

## Como gerar a API após mudanças no index.html

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/generate-games-api.ps1
```

Commite os JSONs gerados junto com as mudanças no `index.html`.

---

## Utilitários compartilhados (utils/)

Padrão IIFE em `window.HY`. Carregar na ordem (inclua apenas os necessários):

```html
<link rel="stylesheet" href="../styles/game-viewport.css" />
<script src="../utils/audio.js"></script>
<script src="../utils/score.js"></script>
<script src="../utils/elapsed.js"></script>
<script src="../utils/progress.js"></script>
<script src="../utils/stars.js"></script>
<script src="../utils/shuffle.js"></script>
<script src="../utils/timer.js"></script>
<script src="../utils/screen.js"></script>
<script src="../utils/animations.js"></script>
```

> `progress.js` e `stars.js` devem vir **após `elapsed.js`** e **antes do Babel** (React) ou do `main.js` (Vanilla).

### `utils/score.js` — `window.HY.score`

Auto-injeta badge `⭐ N`. Fica oculto até `reset()`.

| Método                      | Efeito                                                                  |
| --------------------------- | ----------------------------------------------------------------------- |
| `HY.score.reset()`          | Zera e exibe badge. Chamar no início de cada nível/jogo.                |
| `HY.score.hide()`           | Esconde o badge.                                                        |
| `HY.score.startChallenge()` | Registra timestamp de início. Chamar antes de cada questão.             |
| `HY.score.correct()`        | +100 + bônus de velocidade (`Math.max(0, 50 - segs*5)`). Retorna total. |
| `HY.score.wrong()`          | -50 (mínimo 0). Retorna total.                                          |
| `HY.score.get()`            | Retorna total sem alterar.                                              |

- **Vanilla JS:** `reset()` em `startLevel()`, `startChallenge()` ao fim de `loadQuestion()`, `correct()`/`wrong()` nos handlers.
- **React:** `reset()` em `startGame()`/`startPhase()`, `startChallenge()` ao fim de `resetTurn()`.
- **Piratas do Troco:** único jogo sem `wrong()` — intencional.

### `utils/elapsed.js` — `window.HY.elapsed`

Cronômetro. Deve ser carregado **após `score.js`** — wrapa `HY.score` automaticamente; nenhum código adicional por jogo é necessário.

| Método                      | Efeito                                                       |
| --------------------------- | ------------------------------------------------------------ |
| `HY.elapsed.stopTrail()`    | Para o timer e exibe `⏱ Total: Xs`. Chamar na tela resultado. |
| `HY.elapsed.hide()`         | Esconde o badge.                                             |
| `HY.elapsed.getTotal()`     | Retorna ms da trilha atual ou última.                        |
| `HY.elapsed.formatTime(ms)` | Formata em `Xs` ou `Xm Ys`.                                  |

### `utils/progress.js` — `window.HY.progress`

Barra de progresso de trilha (5 desafios por padrão), fixa no topo. **Não requer código adicional por jogo** — wrapa `HY.score` automaticamente: `reset()` → barra vai a 0%, `correct()` → avança 1/5.

| Método                          | Efeito                                          |
| ------------------------------- | ----------------------------------------------- |
| `HY.progress.show(n, total?)`   | Força progresso manual (n/total).               |
| `HY.progress.hide()`            | Esconde a barra.                                |
| `HY.progress.reset()`           | Zera sem chamar `HY.score.reset()`.             |

Carregar **após `elapsed.js`** e antes de `stars.js`.

---

### `utils/stars.js` — `window.HY.stars`

Sistema de estrelas por trilha: 12 trilhas, persistência em `sessionStorage` (limpa ao fechar a aba). Wrapa `HY.score` automaticamente para contar erros e tempo.

**Cálculo:** 3★ = 0 erros E ≤8s/desafio; 2★ = ≤1 erro OU ≤18s/desafio; 1★ = completou.

| Método                               | Efeito                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `HY.stars.init(gameKey)`             | Inicializa com chave única do jogo (string). Chamar no início do jogo. |
| `HY.stars.trackComplete(trackIdx)`   | Salva estrelas da trilha. Retorna quantidade (1–3).                    |
| `HY.stars.getStars(trackIdx)`        | Retorna estrelas salvas (0–3).                                         |
| `HY.stars.getUnlocked()`            | Retorna quantidade de trilhas desbloqueadas.                           |
| `HY.stars.renderGrid(id, opts)`      | Renderiza grid 2→3→4 col no elemento `id`. Ver abaixo.                 |

**`renderGrid(containerId, opts)`** — aplica grid CSS diretamente no container (não gera wrapper interno):
```js
HY.stars.renderGrid('hy-track-grid', {
  onPlay: (i) => startTrack(i),      // obrigatório
  emoji: (i) => '🎮',               // opcional, fallback: '🎮'
  label: (i) => 'Trilha ' + (i+1),  // opcional
  accentColor: '#f97316'             // opcional, cor das bordas
});
```

**React — padrão `useEffect`** (evita conflito DOM/virtual DOM):
```jsx
useEffect(() => {
  if (gameState === 'trackSelect' && window.HY && window.HY.stars) {
    HY.stars.renderGrid('hy-track-grid', { onPlay: startTrack, accentColor: '#hex' });
  }
}, [gameState]);

// JSX da tela de seleção:
if (gameState === 'trackSelect') {
  return (
    <div className="min-h-screen bg-... flex flex-col items-center p-6 pt-12">
      <button onClick={() => setGameState('cover')}>◀ Início</button>
      <h2 className="font-game ...">Escolha a Trilha</h2>
      <div id="hy-track-grid" style={{width:'100%', maxWidth:'720px'}}></div>
    </div>
  );
}
```

> **Atenção:** `renderGrid()` aplica `display:grid` diretamente no container. Não envolva o `<div id="hy-track-grid">` em outro elemento com `display:grid` — causa double-grid nesting.

---

### `utils/rand.js` — `window.HY.rand`

Seleção aleatória de desafios a partir de um pool fixo com critérios pedagógicos por trilha. Depende de `HY.shuffle` — carregar após `shuffle.js`.

| Método | Efeito |
| --- | --- |
| `HY.rand.pick(pool, n, filterFn?)` | Sorteia `n` itens do array, opcionalmente filtrados. Retorna array embaralhado. |
| `HY.rand.pickByTrack(pool, n, criterios, trackIdx)` | Aplica `criterios[trackIdx]` como filtro e sorteia `n` itens. |

**Padrão de uso no `main.js` do jogo:**

```js
// Pool global de desafios com metadados
const POOL = [
  { palavra: 'sol',  letras: 3, dificuldade: 'facil' },
  { palavra: 'casa', letras: 4, dificuldade: 'facil' },
  { palavra: 'escola', letras: 6, dificuldade: 'medio' },
  // ...
];

// Critério por trilha (0-based) — muda conforme demanda pedagógica
const CRITERIOS = [
  item => item.letras <= 4,   // Trilha 1
  item => item.letras <= 4,   // Trilha 2
  item => item.letras <= 4,   // Trilha 3
  item => item.letras <= 6,   // Trilha 4
  // ...
];

// No startTrack:
const desafios = HY.rand.pickByTrack(POOL, 5, CRITERIOS, trackIdx);
```

> Critérios são funções `item => boolean` — simples de alterar sem tocar na lógica do jogo.

---

### `utils/audio.js` — `HY.playWin()` / `HY.playLose()`

MPs3 em `/assets/audio/win.mp3` e `/assets/audio/lose.mp3` — ainda não existem, funcionarão quando criados.

---

## Identidade Visual

### Paleta de cores

| Token CSS        | Hex       | Uso                           |
| ---------------- | --------- | ----------------------------- |
| `--hy-purple`    | `#48076a` | Cor primária da marca         |
| `--hy-orange`    | `#ffa800` | Destaque / acento 1           |
| `--hy-pink`      | `#d046d9` | Acento 2                      |
| `--hy-teal`      | `#01bebc` | Acento 3 / feedback drag-over |
| `--hy-green`     | `#6ce67d` | Correto / sucesso             |
| `--hy-red`       | `#ff3041` | Errado / perigo               |
| `--hy-blue-dark` | `#004b9a` | Borda/sombra de azul          |
| `--hy-blue`      | `#0a40b5` | Acento 5                      |
| `--hy-white`     | `#ffffff` | Fundo e texto claro           |

Disponíveis via `var(--hy-*)` após importar `game-viewport.css`. Cada cor tem par `--hy-*-dark` para bordas e efeitos 3D.

### Fontes

| Fonte            | Uso                                  |
| ---------------- | ------------------------------------ |
| **Luckiest Guy** | Títulos, headings — use `.font-game` |
| **Nunito**       | Corpo, instruções, UI                |

### Classes de feedback e animação

Estados: `.state-correct` (verde), `.state-wrong` (vermelho), `.state-neutral` (cinza).

Animações: `.shake`/`.shake-anim`, `.pop-in`/`.pop-anim`, `.float`/`.float-anim`, `.pulse-hy`, `.line-anim`, `.zoom-in`.

Botões: `.btn-back` (voltar, absolute top-left), `.btn-3d` (efeito 3D).

Drag & Drop: `.draggable`, `.dropzone`, `.dragging` (no item), `.drag-over` (na zona).

---

## Padrões de código

**Fluxo de telas:** seleção → gameplay → resultado.

**Botão voltar:** `<button onclick="window.location.href='../index.html'">← Voltar</button>`

**Identificar arquitetura:** `<script type="text/babel">` no HTML = React; senão = Vanilla JS.

**Dependências React** sempre de `/vendor/`, nunca CDN externo:
```html
<script src="../vendor/react@18.3.1.production.min.js" crossorigin></script>
<script src="../vendor/react-dom@18.3.1.production.min.js" crossorigin></script>
<script src="../vendor/babel@7.26.10.min.js"></script>
```

**Deploy:** caminhos relativos sempre (`../styles/`, `../vendor/`, `../utils/`). Verificar que assets referenciados existem no repositório. Nomes de pasta com acentos e espaços são válidos — não renomear.

---

## Como adicionar um novo jogo

1. Crie a pasta com o nome do jogo
2. Crie `[nome]/index.html` com a estrutura padrão (seleção → gameplay → resultado)
3. Importe `../styles/game-viewport.css` e os utils necessários
4. Adicione o game-card no `index.html` raiz respeitando a estrutura do regex
5. Rode `generate-games-api.ps1`

---

## Fluxo de trabalho

**Testar localmente:** usar Live Server do VS Code (não abrir por `file://` — CORS). Botão direito no `index.html` → "Open with Live Server".

> **Preview server interno do Claude Code não funciona para jogos React+Babel** — Babel faz XHR para buscar `main.js` e falha silenciosamente. Use sempre Live Server para verificar esses jogos.

**QA:** após qualquer fix ou feature, pedir ao usuário para testar e confirmar. Nunca assumir que está funcionando sem confirmação do usuário.

---

## Referências

- [AI_AGENT_API_GUIDE.md](AI_AGENT_API_GUIDE.md) — documentação da API (PT)
- [AI_AGENT_API_GUIDE_EN.md](AI_AGENT_API_GUIDE_EN.md) — documentação da API (EN)
- Produção: `https://games.helloyotta.com`
