# Próximos Passos — Hello Yotta Games

> **Como usar este documento:**
> Cada seção descreve tarefas pendentes por escopo. Itens marcados com 🐛 são bugs confirmados. Itens marcados com ✨ são novas funcionalidades. Itens marcados com 🔧 são refatorações estruturais.

---

## Todos os Jogos

Estas tarefas se aplicam a **todos os jogos** da plataforma e devem ser implementadas de forma padronizada.

### ✅ Sistema de Pontuação [IMPLEMENTADO]

Implementado via `utils/score.js`. Todos os 25 jogos integrados com `HY.score.reset()`, `HY.score.startChallenge()`, `HY.score.correct()` e `HY.score.wrong()`. Sistemas de pontuação individuais removidos. Ver CLAUDE.md seção "Utilitários compartilhados (utils/)".

### ✅ Feedback Visual e Auditivo [IMPLEMENTADO]

Feedback auditivo implementado via `utils/audio.js` (`HY.playWin()` / `HY.playLose()`). Os arquivos de áudio ainda não existem fisicamente — quando o usuário copiar `win.mp3` e `lose.mp3` para `/assets/audio/`, funcionará automaticamente sem alteração de código.

### ✅ Cronômetro de Tempo [IMPLEMENTADO]

Implementado via `utils/elapsed.js`. Funciona automaticamente via wrapping de `HY.score.reset()` e `HY.score.startChallenge()` — nenhum código adicional por jogo é necessário para exibir o tempo decorrido durante o desafio. Todos os 25 jogos carregam `elapsed.js` e chamam `HY.elapsed.stopTrail()` na tela de resultado.

### 🔧 Padronização de Estrutura: 12 Trilhas × 5 Desafios [IMPLEMENTADO]

Todos os jogos devem ser refatorados para seguir a estrutura:

- **12 trilhas** (níveis progressivos)
- **5 desafios por trilha**

### 🔧 Banco de Palavras Global para Jogos de Português

> **Status:** Partes 1 e 2 implementadas. Partes 3–5 pendentes.

#### Objetivo

Centralizar todos os dados linguísticos em bancos globais (`utils/words.js` e `utils/letters.js`), eliminar listas hardcoded nos jogos e criar um utilitário de geração de desafios compartilhado (`utils/challenges.js`). Com isso, adicionar novas palavras ao banco propaga automaticamente conteúdo para todos os jogos que as consomem.

#### Regra de ouro para esta refatoração

> Se **mais de 1 jogo** utiliza a mesma lógica → vai para `utils/`. Se **somente 1 jogo** usa uma mecânica específica → permanece hardcoded naquele jogo.

#### Regra para novos jogos de português (pós-refatoração)

1. Adicionar o novo atributo à estrutura do objeto em `words.js`
2. Preencher esse atributo em **todas as palavras já existentes** no banco (usar `null` onde não aplicável)
3. Implementar o novo jogo consultando `window.HYWords`

Nenhum jogo deve declarar listas de palavras ou atributos linguísticos localmente.

> **Após concluir todas as partes:** adicionar essas regras ao `CLAUDE.md` como padrão permanente do projeto.

---

#### Schema do objeto em `utils/words.js`

```js
window.HYWords = [
  {
    // Obrigatórios
    palavra: "GATO", // string — palavra em maiúsculo
    tamanho: 4, // number — palavra.length
    minuscula: "gato", // string — palavra.toLowerCase()
    emoji: "🐱", // string — emoji representativo da palavra

    // Atributos linguísticos (null se não aplicável a esta palavra)
    coletivo: "MATILHA", // string | null
    sinonimos: ["FELINO"], // string[] | null
    oposto: null, // string | null
    rimas: ["PATO", "RATO"], // string[] | null
    silabas: ["GA", "TO"], // string[] | null
    dificuldade: "facil", // 'facil' | 'medio' | 'dificil' | null

    // Para jogo Vogais (vowel.html)
    vogalFaltante: { vogal: "O", prefix: "GAT", suffix: "" }, // object | null

    // Para Fábrica de Acentos
    acento: null,
    // Formato quando preenchido:
    // { tipo: 'agudo'|'circunflexo'|'til'|'grave', posicao: number, letra: string }

    // Para Detetives da Ortografia
    erroComum: null, // string | null — grafia incorreta comum (ex: 'XUVEIRO')
    regra: null, // string | null — 'x-vs-ch'|'s-vs-ss'|'g-vs-j'|'c-vs-s-cedilha'|...

    // Frases contextuais para o tipo de desafio 'sentence'
    // (usadas por Sinônimos, Galáxia dos Opostos, Fábrica de Rimas, Caçadores de Coletivos)
    frases: null,
    // Formato quando preenchido:
    // [{ pre: 'O animal é muito ', destaque: 'PEQUENO', pos: '.', resposta: 'GRANDE' }]

    // Categorias para filtragem por jogo
    categorias: ["animais"], // string[]
  },
];
```

#### Schema do objeto em `utils/letters.js`

```js
window.HYLetters = [
  {
    maiusculo: "A", // string — letra maiúscula
    minusculo: "a", // string — letra minúscula
    indice: 0, // number — posição no alfabeto (0 = A)
    dificuldade: "facil", // 'facil' | 'medio' | 'dificil'
    // Usado por: Maiúsculo vs Minúsculo
  },
];
```

---

#### Divisão em 5 partes

##### ✅ Parte 1 — Bancos de dados (`utils/words.js` + `utils/letters.js`) [IMPLEMENTADO]

- Criar `utils/words.js` com o schema acima
- Extrair todas as palavras de: Caçadores de Coletivos, Sinônimos, Fábrica de Rimas, Galáxia dos Opostos, Digitado, Syllables, Vogais (vowel), Detetives da Ortografia, Fábrica de Acentos
- Preencher todos os atributos para cada palavra; `null` onde não aplicável
- Criar `utils/letters.js` com as 26 letras do alfabeto
- **Nenhum jogo é alterado nesta parte**

##### ✅ Parte 2 — `utils/challenges.js` + 4 jogos de par linguístico [IMPLEMENTADO]

Criar `utils/challenges.js` com `window.HY.challenges`:

```js
HY.challenges.gerarMatch(palavra, atributo, banco);
// Retorna: { type:'match', target, answer, options:[...3], emoji, instruction }

HY.challenges.gerarConnect(palavras, atributo, banco);
// Retorna: { type:'connect', leftWords, rightWords, matches, emoji, instruction }

HY.challenges.gerarIntruder(palavras, atributo, banco);
// Retorna: { type:'intruder', words:[...4], answer, emoji, instruction }

HY.challenges.gerarSentence(palavra, atributo, banco);
// Retorna: { type:'sentence', preText, boldText, postText, answer, options:[...3], emoji, instruction }
```

- Opções incorretas sorteadas aleatoriamente de outras entradas do banco com o mesmo atributo
- Migrar: **Sinônimos** (`atributo: 'sinonimos'`), **Fábrica de Rimas** (`atributo: 'rimas'`), **Galáxia dos Opostos** (`atributo: 'oposto'`), **Caçadores de Coletivos** (`atributo: 'coletivo'`)
- Adicionar `challenges.js` ao `index.html` de cada jogo migrado, antes do `main.js`

##### Parte 3 — Digitado + Syllables + Vogais

- **Digitado:** filtra `HYWords` por `dificuldade` e `tamanho`; lógica de digitação permanece hardcoded (único jogo com essa mecânica)
- **Syllables:** filtra `HYWords` onde `silabas !== null`; lógica de arrastar sílabas permanece hardcoded
- **Vogais:** filtra `HYWords` onde `vogalFaltante !== null`; lógica de completar vogal permanece hardcoded

##### Parte 4 — Detetives da Ortografia + Fábrica de Acentos

- **Detetives:** filtra `HYWords` onde `erroComum !== null`, agrupando por `regra`; geração dos tipos de desafio hardcoded (único jogo com essa mecânica)
- **Fábrica de Acentos:** filtra `HYWords` onde `acento !== null`, agrupando por `acento.tipo`; lógica de arrastar acento hardcoded (único jogo)

##### Parte 5 — Maiúsculo vs Minúsculo + documentação

- Migrar para `HYLetters`; lógica de exibição maiúsculo/minúsculo hardcoded (único jogo com letras)
- Atualizar `CLAUDE.md` com as regras do banco de palavras
- Atualizar este documento marcando cada parte como `✅ [IMPLEMENTADO]`

---

#### Ordem de carregamento nos `index.html` após a refatoração

**Jogos Vanilla JS (Parte 2–5):**

```html
<script src="../utils/words.js"></script>
<!-- ou letters.js -->
<script src="../utils/challenges.js"></script>
<!-- apenas jogos Parte 2 -->
<script src="main.js"></script>
```

**Jogos React+Babel (Parte 2–4):**

```html
<!-- antes do babel@7.26.10.min.js -->
<script src="../utils/words.js"></script>
<script src="../utils/challenges.js"></script>
<!-- apenas jogos Parte 2 -->
<script src="../vendor/babel@7.26.10.min.js"></script>
<script type="text/babel" src="main.js"></script>
```

---

## Caçadores de Coletivos

### ✨ Sequência de Mecânicas por Trilha

O jogo possui 3 mecânicas distintas:

1. **Múltipla escolha** — clicar na resposta correta
2. **Associação** — conectar cards da coluna esquerda com cards da coluna direita
3. **Completar frases** — preencher o espaço em branco na frase

Na nova estrutura de 5 desafios por trilha, a sequência obrigatória é:

- Desafio 1 → Mecânica 1
- Desafio 2 → Mecânica 1
- Desafio 3 → Mecânica 2
- Desafio 4 → Mecânica 2
- Desafio 5 → Mecânica 3

---

## Canhões de Ouro

### ✨ Novos Tipos de Desafio

- Adicionar desafios com operação de **subtração** (atualmente o jogo só tem adição)

---

## Defesa do Castelo Matemático

### 🐛 Timer continua rodando ao voltar para a tela inicial

**Causa confirmada:** a função `changeScreen()` não cancela o `timerInterval` ao sair da tela `game`. O timer continua em background e, ao atingir zero, dispara `destroyCastle()`, que exibe o modal de resultado mesmo o jogador estando na tela inicial.

**Correção:** dentro de `changeScreen()`, ao trocar para qualquer tela que não seja `game`, executar `clearInterval(timerInterval)`.

**Comportamento esperado:** nenhuma mecânica de gameplay (timer, input, botões de resposta) deve estar ativa antes do jogador pressionar o botão de iniciar na tela inicial ou selecionar uma trilha na tela de níveis.

### 🔧 Refatoração dos Inimigos para 5 Lobos

Na estrutura atual há 3 lobos que são derrotados todos de uma vez ao acertar. Com a nova estrutura de 5 desafios por trilha:

- Exibir **5 lobos simultaneamente** na tela
- Os lobos devem ter **tamanhos crescentes**: o 1º (menor) ao 5º (maior)
- A cada desafio acertado, o próximo lobo é derrotado individualmente (do menor para o maior)
- Os lobos devem aparecer e desaparecer com animação individual

---

## Digitado (ABC Palavras Mágicas)

### 🐛 Letras digitadas não são contabilizadas

O jogo não registra acertos nem erros por letra digitada. Implementar contagem de:

- Letras digitadas corretamente
- Letras digitadas incorretamente

### 🐛 Jogador pode digitar mais caracteres que o tamanho da palavra

O campo de input não possui limite de caracteres. O número máximo de caracteres digitáveis deve ser calculado dinamicamente com base no tamanho da palavra atual:

```js
inputElement.maxLength = palavraAtual.length;
```

### 🐛 Letras minúsculas com descendentes (g, p, q, y) estão sendo cortadas

A parte inferior de letras com haste descendente está sendo cortada. Corrigir a centralização vertical e aumentar levemente a altura do campo de texto.

### 🐛 Jogo não distingue letras com e sem acento

O jogo aceita `A` como resposta correta para `Ã`. Implementar comparação estrita de caracteres, sem normalização (`normalize('NFD')`).

### 🐛 Timer não pausa quando o cursor sai do campo de texto

O cronômetro deve pausar quando o campo de texto perde o foco (`blur`) e retomar ao ganhar foco novamente (`focus`).

### 🔧 Padrão de palavras por desafio

Cada desafio deve apresentar **5 palavras** para o jogador digitar.

---

## Maiúsculo vs Minúsculo

### 🐛 Pontuação não é contabilizada

O jogo não registra pontos por tentativas corretas e incorretas. Implementar o sistema de pontuação padrão descrito na seção "Todos os Jogos".

### 🔧 Estrutura das 12 Trilhas (26 letras do alfabeto)

Cada desafio exibe **1 letra**. A distribuição das letras pelas 12 trilhas segue a regra abaixo:

| Trilhas        | Regra                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Trilhas 1 a 5  | Letras A–Y em ordem alfabética (5 letras por trilha = 25 letras)                   |
| Trilha 6       | 1º desafio sempre com a letra **Z**; desafios 2–5 em ordem aleatória sem repetição |
| Trilhas 7 a 12 | Letras em ordem aleatória, sem repetir letras já utilizadas na mesma sequência     |

**Comportamento do pool aleatório (trilhas 6–12):**

- Manter um pool das 26 letras embaralhado
- Remover cada letra do pool conforme é utilizada
- Quando o pool esgotar, reembaralhar todas as 26 letras e reiniciar

---

## Detetives da Ortografia

> Sem anotações — jogo ainda não testado.

---

## Digite o Resultado

> Sem anotações — jogo ainda não testado.

---

## Duelo dos Monstros

> Sem anotações — jogo ainda não testado.

---

## Escola de Magia VSA

> Sem anotações — jogo ainda não testado.

---

## Fábrica de Rimas

> Sem anotações — jogo ainda não testado.

---

## Fábrica de Acentos

> Sem anotações — jogo ainda não testado.

---

## Galáxia da Matemática

> Sem anotações — jogo ainda não testado.

---

## Galáxia dos Opostos

> Sem anotações — jogo ainda não testado.

---

## Laboratório das Poções

> Sem anotações — jogo ainda não testado.

---

## Matemática Pirata

> Sem anotações — jogo ainda não testado.

---

## Mercado Alien

> Sem anotações — jogo ainda não testado.

---

## Mercado Maior ou Menor

> Sem anotações — jogo ainda não testado.

---

## Organiza Tudo

> Sem anotações — jogo ainda não testado.

---

## Piratas do Troco

> Sem anotações — jogo ainda não testado.

---

## Sinônimos

> Sem anotações — jogo ainda não testado.

---

## Trem da Soma e Subtração

> Sem anotações — jogo ainda não testado.

---

## Monster Typer I

> Sem anotações — jogo ainda não testado.

---

## Monster Typer II

> Sem anotações — jogo ainda não testado.

---

## Syllables (Sílabas)

> Sem anotações — jogo ainda não testado.

---

## Vowel (Vogais)

> Sem anotações — jogo ainda não testado.
