# Hello Yotta Games — Documentação Técnica dos Jogos

> Revisão documental: 08/10/2026. Fontes: catálogo local, páginas HTML e scripts efetivamente carregados por cada jogo. Inspeção estática; esta revisão não executou gameplay no navegador.
> Objetivo: servir de referência para desenvolvedores que vão dar manutenção e para o time de produto entender o que foi implementado.


---

## Índice

1. [Caçadores de Coletivos](#1-caçadores-de-coletivos)
2. [Enigmas da Esfinge](#2-enigmas-da-esfinge)
3. [Defesa do Castelo Matemático](#3-defesa-do-castelo-matemático)
4. [Detetives da Ortografia](#4-detetives-da-ortografia)
5. [Digitado](#5-digitado)
6. [Digite o Resultado](#6-digite-o-resultado)
7. [Duelo dos Monstros](#7-duelo-dos-monstros)
8. [Escola de Magia VSA](#8-escola-de-magia-vsa)
9. [Fábrica de Rimas](#9-fábrica-de-rimas)
10. [Fábrica de Acentos](#10-fábrica-de-acentos)
11. [Galáxia Geométrica](#11-galáxia-geométrica)
12. [Galáxia dos Opostos](#12-galáxia-dos-opostos)
13. [Laboratório das Poções](#13-laboratório-das-poções)
14. [Maiúsculo vs Minúsculo](#14-maiúsculo-vs-minúsculo)
15. [Matemática Pirata](#15-matemática-pirata)
16. [Mercado Alien](#16-mercado-alien)
17. [Mercado Maior ou Menor](#17-mercado-maior-ou-menor)
18. [Organiza Tudo](#18-organiza-tudo)
19. [Piratas do Troco](#19-piratas-do-troco)
20. [Sinônimos](#20-sinônimos)
21. [Trem da Soma e Subtração](#21-trem-da-soma-e-subtração)
22. [Monster Typer I](#22-monster-typer-i)
23. [Monster Typer II](#23-monster-typer-ii)
24. [Syllables (Sílabas)](#24-syllables-sílabas)
25. [Vowel (Vogais)](#25-vowel-vogais)
26. [Mapa da Ilha do Tesouro](#26-mapa-da-ilha-do-tesouro)
27. [Espelho Mágico](#27-espelho-mágico)
28. [Gráfico em Ação](#28-gráfico-em-ação)
29. [Qual é o próximo](#29-qual-é-o-próximo)
30. [Fábrica das Formas](#30-fábrica-das-formas)
31. [Que horas são](#31-que-horas-são)
32. [Complete a Cobra](#32-complete-a-cobra)
33. [Sudoku Mágico](#33-sudoku-mágico)
34. [Combinando Sorvete](#34-combinando-sorvete)
35. [Mercado Matemágico](#35-mercado-matemágico)
36. [O Caminho Mais Rápido](#36-o-caminho-mais-rápido)
37. [Balança da Descoberta](#37-balança-da-descoberta)
38. [Complete a Sequência](#38-complete-a-sequência)
39. [Contando as Patas](#39-contando-as-patas)
40. [Qual é o Grupo?](#40-qual-é-o-grupo)

---

## Convenções deste documento

- **Catálogo:** 40 jogos: 12 React 18 + Babel standalone e 28 Vanilla JS. React, ReactDOM e Babel são arquivos locais em `vendor/`; Tailwind e fontes podem depender de serviços externos.
- **Execução:** a página HTML define a implementação ativa. Arquivos preservados como legado não descrevem necessariamente a experiência atual. Em particular, Galáxia Geométrica carrega `geometry.js` e Poções carrega `color-sort.js`; seus `main.js` antigos não são carregados. Enigmas mantém `main.js` como ponto de montagem de `SphinxApp`, definida em `sphinx.js`.
- **Persistência:** `HY.stars` usa `sessionStorage`, chave `hy_stars_<gameKey>`, para melhores estrelas e desbloqueio da sessão. Alguns jogos também mantêm dados próprios em `localStorage`; as duas camadas não devem ser confundidas.
- **Pontuação padrão:** +100 por conclusão registrada, com bônus inteiro de velocidade entre 0 e 50; erro registrado subtrai 50, com piso zero. Galáxia Geométrica tem pontuação fixa própria (+100/−50), sem bônus. A unidade pontuada varia: palavra, objeto, par ou desafio.
- **Estrelas:** 3 com zero erros e média de até 8 s; 2 com até um erro **ou** média de até 18 s; 1 pela conclusão. A média usa tempo de relógio da trilha dividido por cinco, sem desconto geral de pausas, leitura ou animações.
- **Áudio:** `HY.playWin/playLose` tenta reproduzir MP3 em `assets/audio/`, ausentes nesta revisão. Sons sintetizados locais de alguns jogos constituem uma camada separada.
- **Trilhas:** a grade compartilhada oferece 12 trilhas. O padrão de cinco desafios tem exceções de conteúdo e de unidade de ação documentadas abaixo; a grade não comprova a existência de 60 itens válidos.
- **Jogos 26–40:** compartilham trilhas, estrelas e cinco desafios, com progressão definida por cada gerador. Vários usam blocos de três trilhas e Pointer Events; isso não é uma regra universal para todos os geradores.
- **Rastreabilidade:** [auditoria de 08/10/2026](auditoria-documentacao-2026-10-08.md) lista as páginas e scripts locais dos 40 jogos e as divergências de catálogo.

---

## 1. Caçadores de Coletivos

**Pasta:** `Caçadores de Coletivos/`
**Stack:** React 18 + Babel
**Categoria de conteúdo:** Português — coletivos
**Estrutura ativa:** 12 trilhas × 5 desafios gerados

### Mecânica e comportamento atuais

Usa `HY.challenges.buildLevels('coletivo', HYWords, 12)` e os quatro componentes React compartilhados. Cada trilha normalmente contém dois match, uma associação, um intruso e uma frase; há fallbacks para match quando faltam dados. A sequência solicitada de dois match, duas associações e uma frase ainda não foi implementada.

**Fontes locais:** `utils/words.js`, `utils/challenges.js`, `utils/challenges/`.

---

## 2. Enigmas da Esfinge

**Pasta:** `Canhões de ouro/`
**Stack:** React 18 + Babel
**Categoria de conteúdo:** Português e lógica — interpretação de pistas
**Estrutura ativa:** 12 trilhas × 5 enigmas fixos

### Mecânica e comportamento atuais

O HTML carrega `riddles.js` e `sphinx.js` antes de `main.js`; o final de `main.js` monta `<window.SphinxApp />`. Cada enigma contém enunciado, resposta, dois distratores e explicação. As três alternativas são embaralhadas. Acerto deixa a esfinge feliz e libera avanço manual; erro desabilita a alternativa e anima a sucção do explorador por 1,7 s, permitindo nova tentativa. O código matemático antigo permanece preservado, mas seu componente `App` não é montado. Fluxo: capa → mapa → enigmas → conclusão. Estrelas usam a chave `enigmas-esfinge` inicializada em `main.js`.

**Fontes locais:** `Canhões de ouro/riddles.js`, `sphinx.js`, `main.js`, `sphinx.css`.

---

## 3. Defesa do Castelo Matemático

**Pasta:** `Defesa do Castelo Matematico/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Matemática — adição e subtração
**Estrutura ativa:** 12 trilhas × 5 contas fixas

### Mecânica e comportamento atuais

Escolha do resultado entre alternativas, cronômetro e animação de disparo contra o grupo de lobos. Erros aumentam a escala do grupo. A soma predomina nas trilhas 1–4, subtração nas 5–8 e operações variam nas finais. Ainda não existem cinco lobos derrotados individualmente. Mantém dados próprios em `localStorage` (`math_castle_cannon_v3`) além de `HY.stars`.

**Fontes locais:** `main.js` (`LEVELS`, `checkAnswer`, `animateCannonShot`).

---

## 4. Detetives da Ortografia

**Pasta:** `Detetives da Ortografia/`
**Stack:** React 18 + Babel
**Categoria de conteúdo:** Português — ortografia
**Estrutura ativa:** 12 trilhas × 5 desafios

### Mecânica e comportamento atuais

Consome `window.HYOrtografia`, com escolhas, associação, intruso e completar frase. A renderização já usa `HYChallenges.Match/Connect/Intruder/Sentence`; os componentes são carregados via Babel antes de `main.js`. Não tratar os antigos trechos JSX duplicados como arquitetura atual.

**Fontes locais:** `utils/ortografia.js`, `utils/challenges/`, `main.js`.

---

## 5. Digitado

**Pasta:** `Digitado/`
**Stack:** React 18 + Babel
**Categoria de conteúdo:** Português — transcrição e digitação
**Estrutura ativa:** 12 trilhas × 5 palavras sorteadas

### Mecânica e comportamento atuais

Sorteia cinco entradas de `HY.rand.PALAVRAS` por dificuldade: fácil nas trilhas 1–4, médio nas 5–8 e difícil nas 9–12. Captura `keydown` global durante a partida, sem campo de texto. Mostra emoji e palavra com letras progressivamente preenchidas. Modo infantil usa maiúsculas; fundamental usa inicial maiúscula e demais minúsculas. Valida letra a letra sem remover acentos. Pontua ao completar a palavra; cada tecla incorreta registrada penaliza. Não há boletim por palavra nem pausa por perda de foco nesta implementação.

**Fontes locais:** `main.js`, `utils/rand.js`, `utils/words.js`.

---

## 6. Digite o Resultado

**Pasta:** `Digite o resultado/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Matemática — cálculo e registro numérico
**Estrutura ativa:** 12 trilhas × 5 operações

### Mecânica e comportamento atuais

Gera adições e subtrações e recebe o resultado pelo teclado. `maxVal` vai de 5 a 100 e o prazo por questão de 15 a 8 segundos. Modo infantil acrescenta representações visuais de quantidades. Cada trilha usa `count: 5`; não são quantidades variáveis de operações.

**Fontes locais:** `main.js` (`gameLevels`, geração e handlers de teclado).

---

## 7. Duelo dos Monstros

**Pasta:** `Duelo dos Monstros/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Matemática — comparação de números
**Estrutura ativa:** 12 trilhas × 5 comparações fixas

### Mecânica e comportamento atuais

Compara pares numéricos por `>`, `<` ou `=`, com feedback de monstros. Não é um jogo de escolher o resultado de uma conta, apesar da descrição atual no catálogo. As faixas se sobrepõem e chegam a 100. Mantém `localStorage` próprio (`monstros_comparacao_v1`) e estrelas de sessão.

**Fontes locais:** `main.js` (`LEVELS`, validação de comparação).

---

## 8. Escola de Magia VSA

**Pasta:** `Escola de Magia VSA/`
**Stack:** React 18 + Babel
**Categoria de conteúdo:** Português — substantivos, verbos e adjetivos
**Estrutura ativa:** 12 trilhas × 5 desafios

### Mecânica e comportamento atuais

Consome `window.HYGramatica` de `utils/gramatica.js`. A renderização já foi migrada para os quatro componentes `HYChallenges`, carregados antes de `main.js`. Usa escolhas, associação, intruso e frases; a classificação gramatical presente em `HYWords` não substituiu este banco ativo.

**Fontes locais:** `utils/gramatica.js`, `utils/challenges/`, `main.js`.

---

## 9. Fábrica de Rimas

**Pasta:** `Fábrica de Rimas/`
**Stack:** React 18 + Babel
**Categoria de conteúdo:** Português — relações de rima
**Estrutura ativa:** 12 trilhas × 5 desafios gerados

### Mecânica e comportamento atuais

Usa `HY.challenges.buildLevels('rimas', HYWords, 12)` e componentes compartilhados. O gerador oferece escolhas, associação, intruso e completar frase, com fallbacks. Não exige produção livre de versos. Intrusos ainda são selecionados pela ausência do atributo no banco, sem comprovar diferença sonora em relação ao grupo.

**Fontes locais:** `utils/words.js`, `utils/challenges.js`, `utils/challenges/`, `main.js`.

---

## 10. Fábrica de Acentos

**Pasta:** `Fabrica de Acentos/`
**Stack:** React 18 + Babel
**Categoria de conteúdo:** Português — acentuação
**Estrutura ativa:** 12 trilhas; 59 palavras (trilha 8 com quatro)

### Mecânica e comportamento atuais

As fases já são derivadas de `HYWords` agrupado por `faseAcento`, não de um array hardcoded no jogo. `HYAcentos.accentMap/accentOptions` fornece as tabelas de sinais. Nas trilhas 1–5 a posição-alvo é apoiada visualmente; a partir da 6 é preciso escolher letra e sinal por clique ou arrastar. O gabarito é calculado a partir dos caracteres da palavra. Erro de posição só anima a letra e não chama `HY.score.wrong()`. `HYAcentos.phases` continua preservado como legado.

**Fontes locais:** `main.js`, `utils/words.js`, `utils/acentos.js`.

---

## 11. Galáxia Geométrica

**Pasta:** `Galáxia da Matemática/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Matemática e lógica — reconhecimento de figuras
**Estrutura ativa:** 12 trilhas × 5 desafios (3 escolhas + 2 voos)

### Mecânica e comportamento atuais

A página carrega `geometry-score.js`, `geometry-core.js` e `geometry.js`, sem o `main.js` aritmético antigo. Os três primeiros desafios pedem selecionar uma figura entre três opções e confirmar; cada voo exige coletar dez figuras-alvo. O repertório cresce de três até doze figuras. A partir da trilha 6, o alvo muda após 3 e 6 coletas; a partir da 9, opções do reconhecimento podem aparecer rotacionadas. Nave guiada por mouse, toque ou setas. Há pausa manual e por perda de foco/visibilidade; isso pausa a simulação, sem descontar genericamente o tempo usado pelas estrelas. Pontuação fixa: +100 por resposta/coleta correta e −50 por incorreta, piso zero; erros não removem coletas. Barra de progresso própria e `HY.stars` com chave `galaxia-geometrica`.

**Fontes locais:** `geometry.js`, `geometry-core.js`, `geometry-score.js`, `geometry.css`.

---

## 12. Galáxia dos Opostos

**Pasta:** `Galaxia dos Opostos/`
**Stack:** React 18 + Babel
**Categoria de conteúdo:** Português — antônimos
**Estrutura ativa:** 12 trilhas × 5 desafios gerados

### Mecânica e comportamento atuais

Usa `HY.challenges.buildLevels('oposto', HYWords, 12)` e componentes compartilhados. Normalmente dois match, uma associação, um match adicional no lugar do intruso e uma frase, com fallbacks. A ordem embaralhada não garante progressão lexical entre trilhas.

**Fontes locais:** `utils/words.js`, `utils/challenges.js`, `utils/challenges/`, `main.js`.

---

## 13. Laboratório das Poções

**Pasta:** `Laboratorio das Pocoes/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Lógica — separação de cores e planejamento
**Estrutura ativa:** 12 trilhas × 5 quebra-cabeças

### Mecânica e comportamento atuais

O HTML carrega `color-sort.js`; `main.js` mantém a aritmética anterior sem ser carregado. Cada frasco comporta quatro unidades. O jogador escolhe origem e destino por clique/toque; transfere o bloco contíguo do topo para frasco vazio ou com a mesma cor no topo, respeitando o espaço. Conclui quando todos estão vazios ou completos com uma única cor. Há contagem de movimentos, desfazer e reiniciar. Cores crescem de duas a seis a cada duas trilhas; o embaralhamento usa `12 + trilha*5 + desafio*3` passos (índices zero). Cores têm símbolos para identificação adicional. Movimento inválido toca feedback, mas não chama `HY.score.wrong()`; pontuação é concedida ao resolver o quebra-cabeça. Estrelas usam `laboratorio-pocoes`; o armazenamento antigo de aritmética não é usado pelo fluxo ativo.

**Fontes locais:** `color-sort.js`, `color-sort.css`, `index.html`.

---

## 14. Maiúsculo vs Minúsculo

**Pasta:** `Maisculo vs Minusculo/`
**Stack:** React 18 + Babel
**Categoria de conteúdo:** Português — correspondência entre formas de letras
**Estrutura ativa:** 12 trilhas × 5 letras

### Mecânica e comportamento atuais

Deriva os pares e distratores de `HYLetters`. Permite maiúscula → minúscula ou o inverso, por clique/arrastar. A sequência `TRACKS` é fixa: A–Y nas cinco primeiras trilhas, Z no início da sexta e revisões nas seguintes. O sorteio solicitado a partir do segundo desafio da trilha 6 ainda está pendente.

**Fontes locais:** `main.js` (`TRACKS`), `utils/letters.js`.

---

## 15. Matemática Pirata

**Pasta:** `Matematica Pirata/`
**Stack:** React 18 + Babel
**Categoria de conteúdo:** Matemática — adição, subtração e termo desconhecido
**Estrutura ativa:** 12 trilhas × 5 contas sorteadas

### Mecânica e comportamento atuais

Sorteia de `HY.rand.NUMEROS` pelos critérios de cada trilha. O gabarito ativo é `level[level.unknown || 'answer']`; permite resultado ou termo oculto conforme o filtro. Acerto inclui `PirateCannonFeedback`, com navio, disparo parabólico e explosão do barril; o código está separado em `cannon-feedback.js/css`. Alternativas podem ser selecionadas/arrastadas; erros são desabilitados. O antigo array `_LEVELS_LEGADO` não define os itens da partida.

**Fontes locais:** `main.js`, `cannon-feedback.js`, `cannon-feedback.css`, `utils/rand.js`.

---

## 16. Mercado Alien

**Pasta:** `Mercado Alien/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Matemática — comparação e cálculo de expressões
**Estrutura ativa:** 12 trilhas × 5 comparações

### Mecânica e comportamento atuais

O nome ativo continua Mercado Alien; Duelo Alien é proposta futura. Compara valores usando maior, menor ou igual. `range` cresce de 10 a 100 e `time` cai de 15 a 7 segundos. `complex` passa a verdadeiro na trilha 7, introduzindo expressões na comparação. Possui modos de apresentação e escudos de tentativas.

**Fontes locais:** `main.js` (`levels`, geração de comparações).

---

## 17. Mercado Maior ou Menor

**Pasta:** `Mercado Maior ou Menor/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Matemática — comparação de tamanho visual
**Estrutura ativa:** 12 trilhas × 5 desafios

### Mecânica e comportamento atuais

Escolhe o maior ou menor entre objetos SVG de tamanhos diferentes. O gabarito usa os valores dos itens, não a comparação de preços. Mantém dados próprios em `localStorage` (`mercado_gigantes_v1`) e `HY.stars`.

**Fontes locais:** `main.js` (`TYPES`, `LEVELS`).

---

## 18. Organiza Tudo

**Pasta:** `Organiza Tudo/`
**Stack:** React 18 + Babel
**Categoria de conteúdo:** Lógica e linguagem — classificação
**Estrutura ativa:** 6 conjuntos de 9 objetos; grade compartilhada de 12 trilhas

### Mecânica e comportamento atuais

Distribui objetos em caixas por cor, forma ou categoria temática, por arrastar ou selecionar item e caixa. O banco contém seis conjuntos, não 12 trilhas de cinco palavras; não é um jogo de reorganizar letras. Cada objeto correto pontua. A grade pode liberar a trilha 7, para a qual `LEVELS.find` não fornece conteúdo. Essa incompatibilidade permanece pendente.

**Fontes locais:** `main.js` (`LEVELS`, `startLevel`, `handleAttempt`).

---

## 19. Piratas do Troco

**Pasta:** `Piratas do Troco/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Matemática — pagamento e troco
**Estrutura ativa:** 12 trilhas × 5 desafios

### Mecânica e comportamento atuais

Usa pares fixos de custo e total de moedas. O jogador paga e guarda o restante no baú por arrastar ou selecionar. A conclusão exige distribuir corretamente as moedas; o fluxo não chama `HY.score.wrong()`. Não interpretar estrelas sem erro como evidência de ausência de tentativas inválidas.

**Fontes locais:** `main.js` (`LEVELS`, manipulação de moedas).

---

## 20. Sinônimos

**Pasta:** `Sinonimos/`
**Stack:** React 18 + Babel
**Categoria de conteúdo:** Português — relações de significado
**Estrutura ativa:** 12 trilhas × 5 desafios gerados

### Mecânica e comportamento atuais

Usa `HY.challenges.buildLevels('sinonimos', HYWords, 12)` e os componentes compartilhados. Oferece escolhas, associação, intruso e frases com fallbacks. Relações são selecionadas dos metadados; a ordem das trilhas não constitui escala lexical validada. A ausência do atributo ainda define o intruso.

**Fontes locais:** `utils/words.js`, `utils/challenges.js`, `utils/challenges/`, `main.js`.

---

## 21. Trem da Soma e Subtração

**Pasta:** `Trem da Soma e Subtracao/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Matemática — adição e subtração
**Estrutura ativa:** 12 trilhas × 5 contas sorteadas

### Mecânica e comportamento atuais

Sorteia `HY.rand.NUMEROS` por `CRITERIOS`, com resultado desconhecido nas primeiras trilhas. Escolhe/preenche o vagão numérico e usa cronômetro. Mantém armazenamento próprio (`math_train_v4`) e `HY.stars`. A substituição do catálogo por palavras cruzadas permanece planejada; não há jogo de palavras cruzadas carregado nesta página.

**Fontes locais:** `main.js`, `utils/rand.js`.

---

## 22. Monster Typer I

**Pasta:** `monster_typer I/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Português — letra inicial e teclado
**Estrutura ativa:** 12 trilhas × 5 palavras fixas

### Mecânica e comportamento atuais

Cada trilha pratica uma letra inicial: A, B, C, D, E, F, G, H, I, J, L ou M. O jogador digita a letra-alvo para cada palavra/emoji; não existem três níveis de 40 fases no fluxo atual. Possui cronômetro e modos de apresentação. A grade usa `HY.stars`; também há contador próprio `mt1_unlockedTracks` em `localStorage`.

**Fontes locais:** `main.js` (`TRACKS`, handler de teclado).

---

## 23. Monster Typer II

**Pasta:** `monster_typer II/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Português — transcrição de palavras
**Estrutura ativa:** 12 trilhas × 5 palavras fixas

### Mecânica e comportamento atuais

Captura teclas e avança letra a letra com cronômetro por palavra. Pontuação positiva ocorre na conclusão da palavra, negativa na tecla incorreta registrada. Usa `HY.stars` e contador próprio `mt2_unlockedTracks` em `localStorage`. O banco contém grafias `MACA`, `BALAO` e `AGUA`; não presumir acentuação ortográfica correta.

**Fontes locais:** `main.js` (`TRACKS`, `wordComplete`).

---

## 24. Syllables (Sílabas)

**Pasta:** `syllables/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Português — composição silábica
**Estrutura ativa:** 12 trilhas × 5 itens acessados

### Mecânica e comportamento atuais

Deriva itens com `silabas` de `HYWords`, ordena por quantidade de sílabas e acessa `trilha*5 + desafio`. Monta a palavra com blocos de sílabas por clique/arrastar. Os primeiros 60 itens atuais têm oito palavras monossilábicas e 52 dissilábicas; o comentário de progressão para três/quatro sílabas não corresponde ao percurso ativo.

**Fontes locais:** `main.js` (`levels`, `startTrack`), `utils/words.js`.

---

## 25. Vowel (Vogais)

**Pasta:** `vowel/`
**Stack:** Vanilla JS
**Categoria de conteúdo:** Português — completar vogal
**Estrutura ativa:** Grade de 12 trilhas; banco com 39 itens

### Mecânica e comportamento atuais

Entrada excepcional: `vowel.html`. Deriva itens com `vogalFaltante` de `HYWords`; recebe vogal por botão ou teclado e acessa `trilha*5 + desafio`. O banco cobre sete trilhas completas e quatro itens da oitava, em vez dos 60 necessários. A falta do quinto item da trilha 8 pode interromper o fluxo; a grade não representa conteúdo completo.

**Fontes locais:** `vowel.html`, `main.js`, `utils/words.js`.

---

## 26. Mapa da Ilha do Tesouro

**Pasta:** `Mapa da Ilha do Tesouro/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Coordenadas e Orientação Espacial
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `mapa-ilha-tesouro`)

### Descrição

Mapa de tesouro num grid 6x6 com letras (linhas) e números (colunas). Nos desafios 1-3, o jogo mostra o emoji-alvo e o jogador deve clicar na célula certa do mapa e depois completar a coordenada (letra OU número, sorteado qual falta) digitando no teclado. Nos desafios 4-5 ("Rota do Pirata"), muda para um grid 8x8: um pirata aparece em uma célula aleatória, uma rota até um destino é sorteada e descrita como uma sequência de "cards de passo" (quantidade de casas + seta de direção); o jogador escolhe, entre 3 emojis, qual está esperando no destino da rota.

### Mecânicas

#### Geração da Rota como Segmentos Ortogonais Sem Revisitar Células

A rota é construída segmento a segmento: em cada passo sorteia uma direção (nunca igual à anterior, para sempre haver uma curva) e um comprimento de 1 a 3 casas, testando se o trecho fica dentro do grid e não passa por cima de nenhuma célula já usada.

```js
function generateRoutePath(segmentCount) {
    const start = {
        row: Math.floor(Math.random() * ROUTE_GRID_SIZE),
        col: Math.floor(Math.random() * ROUTE_GRID_SIZE)
    };
    const path = [start];
    const segments = [];
    let lastDir = null;

    for (let s = 0; s < segmentCount; s++) {
        const dirNames = HY.shuffle(Object.keys(ROUTE_DIRS).filter(d => d !== lastDir));
        let placed = false;

        for (const dir of dirNames) {
            const lengths = HY.shuffle([1, 2, 3]);
            for (const len of lengths) {
                const cells = [];
                let { row, col } = path[path.length - 1];
                let valid = true;
                for (let step = 0; step < len; step++) {
                    row += ROUTE_DIRS[dir].dr;
                    col += ROUTE_DIRS[dir].dc;
                    const outOfBounds = row < 0 || row >= ROUTE_GRID_SIZE || col < 0 || col >= ROUTE_GRID_SIZE;
                    const revisited = path.some(p => p.row === row && p.col === col) || cells.some(p => p.row === row && p.col === col);
                    if (outOfBounds || revisited) { valid = false; break; }
                    cells.push({ row, col });
                }
                if (valid) {
                    path.push(...cells);
                    segments.push({ dir, length: len });
                    lastDir = dir;
                    placed = true;
                    break;
                }
            }
            if (placed) break;
        }
        if (!placed) return null;
    }
    return { path, segments };
}
```

#### Reaproveitamento dos Ícones do Mapa da Trilha

Em vez de sortear um novo pool de emojis para a rota, o desafio reaproveita os mesmos ícones já usados no mapa 6x6 daquela trilha, mantendo consistência visual entre desafios da mesma sessão.

```js
const iconPool = mapIcons.map(m => m.icon);
const decorativeExtra = 1 + Math.floor(currentTrack / 4);
const chosenIconCount = Math.min(iconPool.length, 3 + decorativeExtra);
const chosenIcons = HY.rand.pick(iconPool, chosenIconCount);
```

#### Coordenada com Parte Sorteada para Ficar em Branco

A cada desafio de mapa, sorteia-se se a lacuna a completar é a letra da linha ou o número da coluna, capturando a tecla digitada diretamente via `keydown`.

```js
function onKeyDown(e) {
    if (!awaitingCoordInput) return;
    let typed, correct;
    if (missingPart === 'letter') {
        if (!/^[a-fA-F]$/.test(e.key)) return;
        typed = e.key.toUpperCase();
        correct = LETTERS[currentTarget.row];
    } else {
        if (!/^[1-6]$/.test(e.key)) return;
        typed = e.key;
        correct = String(currentTarget.col + 1);
    }
    checkCoordAnswer(typed === correct, typed);
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` (grid de 12 trilhas) → `screen-game`, que alterna internamente entre `.game-layout` (mapa 6x6 + coordenada, desafios 1-3) e `#route-challenge` (grid 8x8 + barra de passos + 3 respostas, desafios 4-5) → modal de resultado com estrelas → volta para `screen-tracks`.

---

## 27. Espelho Mágico

**Pasta:** `Espelho Magico/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Simetria e Reflexão Espacial
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `espelho-magico`)

### Descrição

Jogo de reflexão espelhada usando um banco fixo de 27 poliminos (tetrominós, pentominós e hexa/heptominós, coloridos célula a célula). Nos desafios 1-3 ("Tipo 1"), o jogador vê uma figura original ao lado de um espelho e escolhe, entre 3 cards, qual é o reflexo correto. Nos desafios 4-5 ("Tipo 2"), o jogador clica numa célula vazia da figura espelhada e depois na cor certa da paleta, com uma porcentagem de dicas (células já preenchidas) que diminui conforme a trilha avança.

### Mecânicas

#### Reflexão Geométrica Real por Coordenadas

O reflexo é calculado invertendo o índice de linha e/ou coluna de cada célula dentro dos limites da própria figura — não é uma simples troca de cor visual.

```js
function reflectInstance(instance, axis) {
    const cells = instance.cells.map(cell => {
        let nr = cell.r, nc = cell.c;
        if (axis === 'v' || axis === 'hv') nr = instance.rows - 1 - cell.r;
        if (axis === 'h' || axis === 'hv') nc = instance.cols - 1 - cell.c;
        return { r: nr, c: nc, color: cell.color };
    });
    return { rows: instance.rows, cols: instance.cols, cells };
}
```

#### Eixos Inválidos para Figuras de 1 Linha/Coluna

Uma peça com uma única linha ou coluna (como o tetrominó "I") teria um reflexo idêntico ao original em um dos eixos, o que colidiria com outra opção do Tipo 1. Esses eixos são descartados na hora de sortear o lado do espelho.

```js
function validSidesFor(def) {
    let sides = SIDES;
    if (def.rows === 1) sides = sides.filter(s => s !== 'top' && s !== 'bottom');
    if (def.cols === 1) sides = sides.filter(s => s !== 'left' && s !== 'right');
    return sides;
}
```

#### Porcentagem de Dicas Decrescente por Trilha (Tipo 2)

```js
function hintPercentForTrack(idx) {
    if (idx < 4) return 0.6;
    if (idx < 8) return 0.3;
    return 0;
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game`, alternando `#type1-area` (original + espelho + 3 cards de escolha) e `#type2-area` (original + figura espelhada parcialmente em branco + paleta de cores clicável) → modal de resultado → `screen-tracks`.

---

## 28. Gráfico em Ação

**Pasta:** `Grafico em Acao/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Leitura e Construção de Gráficos
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `grafico-em-acao`)

### Descrição

Uma "cena" de itens espalhados (ex: roupas de cores variadas) é exibida, e o jogador deve montar dois gráficos com a contagem correta — um por tipo de item, outro por cor. O tipo de gráfico muda por bloco de trilhas: barra vertical (1-3), barra horizontal (4-6), pizza (7-9) e gráfico de linha (10-12).

### Mecânicas

#### Tabela de Contingência Consistente entre os Dois Gráficos

Os totais "por tipo" e "por cor" precisam ser compatíveis com o mesmo conjunto de itens da cena. Uma partição aleatória gera os totais de cada eixo, e uma tabela de contingência distribui os itens de forma que ambas as somas fechem exatamente.

```js
function randomPartition(total, parts, min, max) {
    const arr = new Array(parts).fill(min);
    let remaining = total - min * parts;
    let guard = 0;
    while (remaining > 0 && guard < 10000) {
        const idx = Math.floor(Math.random() * parts);
        if (arr[idx] < max) { arr[idx]++; remaining--; }
        guard++;
    }
    return arr;
}

function buildContingencyTable(rowSums, colSums) {
    const rows = rowSums.length, cols = colSums.length;
    const table = Array.from({ length: rows }, () => new Array(cols).fill(0));
    const cs = colSums.slice();
    const rowOrder = HY.shuffle(rowSums.map((_, i) => i));
    rowOrder.forEach(r => {
        let remaining = rowSums[r];
        const colOrder = HY.shuffle(cs.map((_, i) => i));
        colOrder.forEach(c => {
            if (remaining <= 0) return;
            const take = Math.min(remaining, cs[c]);
            if (take > 0) { table[r][c] += take; cs[c] -= take; remaining -= take; }
        });
    });
    return table;
}
```

#### Gráfico de Pizza com Matemática Polar

Cada fatia é desenhada como um `path` SVG usando conversão de coordenadas polares para cartesianas.

```js
function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}
```

#### Overlay de Linha Calculado a Partir das Posições Renderizadas

No gráfico de linha, os pontos não são calculados matematicamente — a posição de cada "bolinha" é lida do DOM já renderizado (`getBoundingClientRect`) e usada para desenhar as linhas de conexão num `<svg>` sobreposto.

```js
function drawLineOverlay(container, key) {
    const row = container.querySelector('.track-row');
    const cols = [...row.querySelectorAll('.track-col')];
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    row.appendChild(svg);

    const points = [];
    cols.forEach((col, i) => {
        const val = values[key][i];
        if (val <= 0) return;
        const dot = col.querySelector('.cell.dot-active');
        if (!dot) return;
        const dotRect = dot.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        points.push({ x: dotRect.left - rowRect.left + dotRect.width / 2, y: dotRect.top - rowRect.top + dotRect.height / 2, color: panels[key][i].color });
    });
    // ... desenha <line> entre pontos consecutivos e um <circle> em cada ponto
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (cena de itens + 2 painéis dependentes do `chartType` da trilha) → modal de resultado → `screen-tracks`.

---

## 29. Qual é o próximo

**Pasta:** `Qual e o proximo/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Padrões e Rotação Geométrica
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `qual-e-o-proximo`)

### Descrição

Uma sequência de 4 a 8 cards mostra uma peça (poliminó colorido) girando sempre no mesmo incremento (90° ou 180°) a cada card. O jogador escolhe, entre 3 opções, qual card viria a seguir. Usa rotação geométrica real de coordenadas, não troca de cor entre casas fixas.

### Mecânicas

#### Rotação Real de 90° e 180° por Transformação de Coordenadas

```js
function rotate90(instance) {
    const cells = instance.cells.map(cell => ({
        r: cell.c,
        c: instance.rows - 1 - cell.r,
        color: cell.color
    }));
    return { rows: instance.cols, cols: instance.rows, cells };
}

function rotate180(instance) {
    const cells = instance.cells.map(cell => ({
        r: instance.rows - 1 - cell.r,
        c: instance.cols - 1 - cell.c,
        color: cell.color
    }));
    return { rows: instance.rows, cols: instance.cols, cells };
}
```

#### Mistura Garantida de Incrementos de 90° e 180° por Trilha

Para a trilha nunca sair inteira só com um tipo de giro, sorteia-se de antemão quantos dos 5 desafios usam 90° (2 ou 3) e embaralha a ordem.

```js
const ninetyCount = 2 + Math.floor(Math.random() * 2); // 2 ou 3
trackIncrements = HY.shuffle(
    Array(CHALLENGES_PER_TRACK).fill(0).map((_, i) => i < ninetyCount ? rotate90 : rotate180)
);
```

#### Distratoras sem Colisão Visual para Formas Simétricas

A segunda opção errada é um espelhamento (não uma rotação), mas formas simétricas podem gerar um espelho idêntico a uma opção já usada. Uma lista de candidatos alternativos é testada até achar uma opção genuinamente diferente.

```js
const usedKeys = states.concat([wrong1Instance]).map(instanceKey);
const candidates = [
    mirrorH(correctInstance),
    mirrorH(wrong1Instance),
    mirrorH(states[0]),
    rotateStep(rotateStep(wrong1Instance)),
    { rows: correctInstance.rows, cols: correctInstance.cols, cells: HY.shuffle(correctInstance.cells.map(c => c.color)).map((color, i) => ({ ...correctInstance.cells[i], color })) }
];
let wrong2Instance = candidates.find(cand => !usedKeys.includes(instanceKey(cand)));
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (sequência de cards + placeholder "?" + 3 opções) → modal de resultado → `screen-tracks`.

---

## 30. Fábrica das Formas

**Pasta:** `Fabrica das Formas/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Atributos e Transformações (Tamanho/Cor)
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `fabrica-das-formas`)

### Descrição

Uma "linha de montagem" mostra uma corrente de 4 a 6 figuras da mesma forma, cada uma diferindo da anterior em tamanho e/ou cor. O jogador arrasta cards de ação ("Aumentar", "Diminuir", cores) para os espaços entre as figuras, descrevendo a transformação correta. Esta implementação também serve de referência para o padrão de drag-and-drop via Pointer Events reutilizado em outros jogos da sessão.

### Mecânicas

#### Geração da Corrente com Cards Obrigatórios por Espaço

Cada transição decide se muda tamanho, cor ou ambos (conforme a chance por nível de dificuldade), evitando crescer além do maior tamanho ou encolher abaixo do menor.

```js
function generateChain() {
    const tier = tierForTrack(currentTrack);
    const numShapes = chainLengthForTier(tier);
    const twoAttrChance = twoAttrChanceForTier(tier);
    const shapeType = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];

    const states = [{ size: Math.floor(Math.random() * 3), color: Math.floor(Math.random() * 3) }];
    const requiredCardsPerBlank = [];

    for (let i = 1; i < numShapes; i++) {
        const prev = states[states.length - 1];
        const canGrow = prev.size < 2;
        const canShrink = prev.size > 0;
        const twoAttrs = Math.random() < twoAttrChance && (canGrow || canShrink);
        // ... decide changeSize/changeColor e empurra os ids exigidos em `required`
        states.push(next);
        requiredCardsPerBlank.push(required);
    }
    return { shapeType, states, requiredCardsPerBlank };
}
```

#### Drag and Drop via Pointer Events (padrão de referência)

Clique sem mover vira seleção por clique; um movimento real cria um "fantasma" que segue o ponteiro e, ao soltar, verifica o elemento embaixo dele via `elementFromPoint`.

```js
function startPointerDrag(e, sourceEl, cardId) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    try { sourceEl.setPointerCapture(e.pointerId); } catch (err) { /* ignora se nao suportado */ }
    pointerDrag = { pointerId: e.pointerId, cardId, sourceEl, ghostEl: null, startX: e.clientX, startY: e.clientY, moved: false };
    sourceEl.addEventListener('pointermove', onPointerDragMove);
    sourceEl.addEventListener('pointerup', onPointerDragEnd);
    sourceEl.addEventListener('pointercancel', onPointerDragCancel);
}

function onPointerDragEnd(e) {
    if (!pointerDrag || e.pointerId !== pointerDrag.pointerId) return;
    const drag = pointerDrag;
    cleanupPointerDrag();
    if (drag.moved) {
        const dropSlot = findSlotAtPoint(e.clientX, e.clientY);
        if (dropSlot) tryPlaceCard(parseInt(dropSlot.dataset.blankIdx, 10), drag.cardId);
    } else {
        selectedCardId = selectedCardId === drag.cardId ? null : drag.cardId;
        updateTraySelection();
    }
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (corrente de figuras com espaços + bandeja de cards arrastáveis) → modal de resultado → `screen-tracks`.

---

## 31. Que horas são

**Pasta:** `Que horas sao/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Leitura de Horas
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `que-horas-sao`)

### Descrição

Relógio analógico desenhado em SVG. Nos desafios 1-3 ("drag"), o jogo mostra um horário por extenso e o jogador arrasta os ponteiros de hora e minuto até a posição certa. Nos desafios 4-5 ("type"), o relógio já mostra as horas e o jogador digita o horário em campos numéricos. A granularidade dos minutos aceitos aumenta por trilha (só :00/:30 no fácil, até qualquer minuto no difícil).

### Mecânicas

#### Ângulo do Ponteiro a Partir da Posição do Ponteiro do Mouse/Toque

Converte a posição do clique/toque em coordenadas locais do SVG e calcula o ângulo em relação ao centro do relógio, ajustando para que 0° aponte para cima (12h).

```js
function angleFromPointer(clientX, clientY) {
    const svg = document.getElementById('clock-svg');
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const localX = (clientX - rect.left) / rect.width * vb.width + vb.x;
    const localY = (clientY - rect.top) / rect.height * vb.height + vb.y;
    const dx = localX - CX, dy = localY - CY;
    let angle = Math.atan2(dx, -dy) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
}

function snapAngle(angle, steps) {
    const unit = 360 / steps;
    return (Math.round(angle / unit) % steps) * unit;
}
```

#### Granularidade de Minutos por Dificuldade

```js
function minuteOptionsForTier(tier) {
    if (tier === 'facil') return [0, 30];
    if (tier === 'medio') return [0, 15, 30, 45];
    return null; // dificil: qualquer minuto 0-59
}
```

#### Dois Tipos de Desafio Alternando na Trilha

```js
const CHALLENGE_TYPES = ['drag', 'drag', 'drag', 'type', 'type'];
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (relógio SVG + ponteiro arrastável OU campos de hora/minuto, dependendo do tipo) → modal de resultado → `screen-tracks`.

---

## 32. Complete a Cobra

**Pasta:** `Complete a Cobra/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Padrões Repetitivos (Sequência de Cores)
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `complete-a-cobra`)

### Descrição

Um caminho em forma de cobra é traçado num grid, com um padrão de cores cíclico (3 a 6 cores conforme a trilha) que se repete ao longo das células. Uma parte da cobra já vem pintada; o jogador arrasta cores de uma bandeja para a célula ativa seguinte, na ordem, até completar o padrão.

### Mecânicas

#### Geração do Caminho por Passeio Aleatório com Folga

O caminho da cobra é um passeio aleatório sem se cruzar (backtracking), com uma regra extra de "clearance": nenhuma célula vizinha ortogonal do próximo passo pode já fazer parte do caminho (exceto a célula de onde se veio), evitando que o desenho passe raspando perto de si mesmo.

```js
function hasClearance(nr, nc, cr, cc) {
    for (const [dr, dc] of ORTHO) {
        const ar = nr + dr, ac = nc + dc;
        if (ar === cr && ac === cc) continue;
        if (visited.has(key(ar, ac))) return false;
    }
    return true;
}

function walk(r, c) {
    visited.add(key(r, c));
    path.push([r, c]);
    if (path.length === length) return true;

    const dirs = HY.shuffle(ORTHO.slice());
    for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (visited.has(key(nr, nc))) continue;
        if (!hasClearance(nr, nc, r, c)) continue;
        if (walk(nr, nc)) return true;
    }
    path.pop();
    visited.delete(key(r, c));
    return false;
}
```

#### Progressão de Padrão, Comprimento e Grid por Bloco de Trilhas

```js
const PATTERN_LEN_BY_BLOCK = [3, 4, 5, 6];
const SNAKE_LEN_BY_BLOCK = [12, 16, 20, 24];
const GRID_BY_BLOCK = [
    { cols: 8, rows: 7 },
    { cols: 9, rows: 8 },
    { cols: 10, rows: 9 },
    { cols: 11, rows: 10 },
];
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (grid da cobra + bandeja de cores arrastáveis) → modal de resultado → `screen-tracks`.

---

## 33. Sudoku Mágico

**Pasta:** `Sudoku Magico/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Lógica e Raciocínio (Sudoku)
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `sudoku-magico`)

### Descrição

Sudoku com símbolos visuais em vez de números tradicionais (cores, formas, emojis, números ou letras — um por desafio, na ordem `CATEGORY_ORDER`). O tamanho do grid cresce por bloco de trilhas: 3×3 (sem quadrante), 4×4 (quadrantes 2×2) e 6×6 (quadrantes 2×3). O jogador seleciona ou arrasta símbolos da bandeja para as células em branco.

### Mecânicas

#### Geração de Solução Válida por Backtracking

```js
function fill(pos) {
    if (pos === n * n) return true;
    const r = Math.floor(pos / n), c = pos % n;
    const candidates = HY.shuffle(Array.from({ length: n }, (_, i) => i));
    for (const v of candidates) {
        if (valid(r, c, v)) {
            grid[r][c] = v;
            if (fill(pos + 1)) return true;
            grid[r][c] = null;
        }
    }
    return false;
}
```

#### Remoção Segura de Casas por Eliminação Simples Repetida

Uma casa só é removida (vira lacuna) se o quebra-cabeça inteiro (todas as brancas já confirmadas + a nova candidata) continuar resolúvel por eliminação simples — evita gerar um puzzle com mais de uma solução possível.

```js
function isSolvableByElimination(blankKeys, n, box, solution) {
    const grid = solution.map(row => row.slice());
    blankKeys.forEach(key => {
        const [r, c] = key.split('_').map(Number);
        grid[r][c] = null;
    });

    const remaining = new Set(blankKeys);
    let progress = true;
    while (progress && remaining.size > 0) {
        progress = false;
        for (const key of remaining) {
            const [r, c] = key.split('_').map(Number);
            const cands = candidatesFor(grid, n, box, r, c);
            if (cands.length === 1) {
                grid[r][c] = cands[0];
                remaining.delete(key);
                progress = true;
            } else if (cands.length === 0) {
                return false;
            }
        }
    }
    return remaining.size === 0;
}
```

#### Tetos de Casas Reveladas (Total e por Símbolo)

Para o tabuleiro não ficar nem muito cheio nem viesado para um símbolo específico, no máximo 1/3 das células ficam reveladas no total, e nenhum símbolo pode ter mais da metade das suas próprias ocorrências como given.

```js
function maxTotalGivens(n) {
    return Math.floor((n * n) / 3);
}
function maxGivensPerSymbol(n) {
    return Math.max(1, Math.floor(n / 2));
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (grid do sudoku com setas de "sentido sem repetição" + bandeja de símbolos) → modal de resultado → `screen-tracks`.

---

## 34. Combinando Sorvete

**Pasta:** `Combinando Sorvete/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Combinatória (Combinações com Repetição)
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `combinando-sorvete`)

### Descrição

O jogador monta casquinhas de sorvete com todas as combinações possíveis de 2 bolas a partir de um conjunto de sabores (2 a 5, conforme a trilha), incluindo repetir o mesmo sabor duas vezes na mesma casquinha. O número de casquinhas exibidas é exatamente o total de combinações possíveis — o jogador deve preenchê-las todas sem repetir nenhuma combinação já usada.

### Mecânicas

#### Cálculo de Combinações com Repetição

```js
function combinationsCount(n) {
    // combinacoes com repeticao (par de sabores, ordem nao importa,
    // incluindo o mesmo sabor duas vezes): n(n+1)/2
    return (n * (n + 1)) / 2;
}
```

#### Validação de Par Único (Incluindo Sabor Repetido)

Ao fechar a segunda bola de uma casquinha, a chave do par (sabores ordenados e concatenados) é comparada com todas as casquinhas já travadas, para impedir combinações duplicadas — inclusive quando as duas bolas são do mesmo sabor.

```js
function pairKeyOf(cone) {
    return cone.scoops.slice().sort().join('|');
}

function tryAddScoop(coneIdx, flavorId) {
    const cone = cones[coneIdx];
    if (!cone || cone.locked) return;
    if (cone.scoops.length >= 2) return;

    if (cone.scoops.length === 1) {
        const first = cone.scoops[0];
        const pairKey = [first, flavorId].sort().join('|');
        const duplicate = cones.some((c, i) => i !== coneIdx && c.locked && pairKeyOf(c) === pairKey);
        if (duplicate) {
            HY.playLose();
            HY.score.wrong();
            shakeCone(coneIdx);
            return;
        }
        cone.scoops.push(flavorId);
        cone.locked = true;
        renderCones();
        checkChallengeComplete();
    } else {
        cone.scoops.push(flavorId);
        renderCones();
    }
}
```

#### Progressão do Número de Sabores por Bloco

```js
const FLAVOR_COUNT_BY_BLOCK = [2, 3, 4, 5];
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (fileira de casquinhas + caixa de sabores clicável/arrastável) → modal de resultado → `screen-tracks`.

---

## 35. Mercado Matemágico

**Pasta:** `Mercado Matematico/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Dinheiro, Orçamento e Troco
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `mercado-matematico`)

### Descrição

Nos desafios 1-3 ("Mercado"), o jogador recebe um saldo inicial e arrasta produtos entre "Podemos comprar" e "Não podemos comprar" sem deixar o saldo negativo, acertando exatamente a quantidade-alvo de itens comprados. Nos desafios 4-5 ("Tabela de Troco"), uma tabela mostra combinações de itens com valor recebido ou troco faltando, e o jogador calcula o campo oculto. A granularidade de preço (reais inteiros, múltiplos de 5 centavos, ou centavos livres) aumenta por bloco de trilhas.

### Mecânicas

#### Saldo Inicial Calculado a Partir de uma Meta de K Itens

O saldo inicial é a soma dos K itens mais baratos (mais uma folga aleatória menor que a diferença para o próximo item), garantindo que comprar exatamente K itens seja sempre possível e comprar K+1 sempre estoure o saldo.

```js
const sorted = pricesCents.slice().sort((a, b) => a - b);
const targetK = 2 + Math.floor(Math.random() * (itemCount - 2));
const sumK = sorted.slice(0, targetK).reduce((s, v) => s + v, 0);
const sumKPlus1 = sorted.slice(0, targetK + 1).reduce((s, v) => s + v, 0);
const gap = sumKPlus1 - sumK;
const slackUnit = marketDecimalMode ? 1 : 100;
const maxSlackSteps = Math.max(0, Math.floor((gap - slackUnit) / slackUnit));
const slack = maxSlackSteps > 0 ? slackUnit * Math.floor(Math.random() * (maxSlackSteps + 1)) : 0;

marketInitialBalance = sumK + slack;
```

#### Troco Proporcional ao Total da Compra

O troco de cada linha da tabela é sorteado como uma fração (~até 60%) do total da compra, sempre em passos da mesma unidade monetária da trilha, para nunca gerar trocos maiores que a própria compra nem trocos irreais.

```js
const trocoUnit = range.centsMode === 'whole' ? 100 : (range.centsMode === 'mult5' ? 5 : 1);
const maxSteps = Math.max(1, Math.floor((itemsTotal / trocoUnit) * 0.6));
const trocoSteps = 1 + Math.floor(Math.random() * maxSteps);
const trocoCents = trocoSteps * trocoUnit;
const recebidoCents = itemsTotal + trocoCents;
```

#### Formatação Monetária Consciente de Modo Decimal

```js
function formatCents(cents, decimalMode) {
    const negative = cents < 0;
    const abs = Math.abs(cents);
    if (!decimalMode) {
        return `${negative ? '-' : ''}R$ ${Math.round(abs / 100)}`;
    }
    const reais = Math.floor(abs / 100);
    const centsPart = abs % 100;
    return `${negative ? '-' : ''}R$ ${reais},${String(centsPart).padStart(2, '0')}`;
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game`, alternando `#market-challenge` (produtos arrastáveis + zonas comprar/não comprar + saldo) e `#troco-challenge` (catálogo + tabela com campos de entrada) → modal de resultado → `screen-tracks`.

---

## 36. O Caminho Mais Rápido

**Pasta:** `O Caminho Mais Rapido/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Grafos e Menor Caminho
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `caminho-mais-rapido`)

### Descrição

Um grafo gerado proceduralmente (6 a 12 nós, letras como identificadores) é exibido em SVG. Nos desafios 1-3, o jogador clica em nós vizinhos para traçar o caminho mais curto de uma pessoa até uma casa. Nos desafios 4-5, 2 a 4 personagens (abas coloridas) precisam cada um traçar seu próprio menor caminho, todos passando obrigatoriamente pelo mesmo nó — o jogador então digita a letra desse nó de cruzamento. É o jogo mais complexo geometricamente da sessão: usa geração de layout com distância mínima entre nós, ângulo mínimo entre arestas do mesmo nó e um algoritmo de "hub primeiro" para garantir múltiplos caminhos disjuntos.

### Mecânicas

#### Ângulo Mínimo Entre Arestas do Mesmo Nó

Duas arestas quase paralelas saindo do mesmo nó confundiriam visualmente o jogador sobre para onde uma linha realmente vai. Toda nova aresta é validada contra esse ângulo mínimo antes de ser aceita.

```js
const MIN_EDGE_ANGLE_DEG = 30;

function violatesAngle(nodes, adjacency, nodeIdx, candidateIdx, minAngleDeg) {
    const node = nodes[nodeIdx];
    const candidateAngle = angleDeg(node, nodes[candidateIdx]);
    for (const neighborIdx of adjacency[nodeIdx]) {
        const existingAngle = angleDeg(node, nodes[neighborIdx]);
        let diff = Math.abs(candidateAngle - existingAngle);
        if (diff > 180) diff = 360 - diff;
        if (diff < minAngleDeg) return true;
    }
    return false;
}
```

#### Construção "Hub Primeiro" para Caminhos Disjuntos

Garantir que um nó suporte K caminhos disjuntos que passam por ele (2 arestas por personagem) é fácil quando esse nó ainda não tem nenhuma aresta — mas quase impossível se tentado depois que o grafo já está denso e o espaço angular ao redor do nó já foi ocupado. Por isso as arestas do hub são criadas primeiro, num grafo vazio, e o resto do grafo é construído em volta delas.

```js
function connectHubFirst(nodes, adjacency, hub, minDegree, minAngleDeg) {
    const others = HY.shuffle(Array.from({ length: nodes.length }, (_, i) => i).filter(i => i !== hub));
    for (const candidate of others) {
        if (adjacency[hub].size >= minDegree) break;
        if (edgeIsValid(nodes, adjacency, hub, candidate, minAngleDeg)) {
            adjacency[hub].add(candidate);
            adjacency[candidate].add(hub);
        }
    }
}
```

#### Caminhos Disjuntos e Sem Ambiguidade de Rota

Um caminho mínimo só é aceito para um personagem se for **único** (sem empate que permitiria ao jogador escolher outra rota válida) e se não compartilhar nenhuma aresta com os caminhos já escolhidos para os outros personagens.

```js
function countShortestPathsAndReconstruct(adjacency, start, target) {
    // BFS que conta quantos caminhos minimos distintos existem ate cada no
    // (nao so a distancia) e reconstroi um deles
    ...
}

function pickPairThroughHub(adjacency, n, hub, distFromHub, usedNodes, usedEdges) {
    ...
    for (const house of HY.shuffle(candidateHouses)) {
        const result = countShortestPathsAndReconstruct(adjacency, start, house);
        if (!result || result.pathCount !== 1) continue;
        const edges = pathToEdgeSet(result.path);
        if (sharesAnyEdge(edges, usedEdges)) continue;
        return { start, house, shortest: result.distance, path: result.path, edges };
    }
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game`, alternando `#single-path-challenge` (grafo + 1 pessoa/1 casa) e `#multi-path-challenge` (grafo + abas de personagens + campo de letra de cruzamento) → modal de resultado → `screen-tracks`.

---

## 37. Balança da Descoberta

**Pasta:** `Balanca da Descoberta/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Adição e Comparação de Pesos
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `balanca-descoberta`)

### Descrição

Uma balança de dois pratos é desenhada em SVG e se inclina animadamente conforme os pesos mudam. O jogo inteiro usa 5 objetos fixos (`FIXED_OBJECTS`) reaproveitados em todos os desafios — só o peso sorteado de cada um muda. Uma tabela mostra os 5 objetos com seus pesos, exceto um em branco; o jogador soma dois objetos de referência exibidos na balança e digita o peso que falta.

### Mecânicas

#### Sorteio do Alvo com Par de Referência Somando Exato

Um objeto é escolhido como "alvo" (peso desconhecido); dois outros objetos recebem partes de um mesmo total que soma exatamente o peso do alvo; os dois restantes recebem pesos decorativos (ruído, não usados no cálculo).

```js
function generateFixedObjectWeights() {
    const indices = FIXED_OBJECTS.map((_, i) => i);
    const blankIdx = Math.floor(Math.random() * FIXED_OBJECTS.length);
    const others = indices.filter(i => i !== blankIdx);
    const shuffledOthers = HY.shuffle(others);
    const pairIndices = shuffledOthers.slice(0, 2);
    const decorIndices = shuffledOthers.slice(2);

    const blankWeight = 2 + Math.floor(Math.random() * (MAX_OBJECT_WEIGHT - 1));
    const pairParts = generateSummingParts(blankWeight, 2);

    const weights = new Array(FIXED_OBJECTS.length).fill(0);
    weights[blankIdx] = blankWeight;
    weights[pairIndices[0]] = pairParts[0];
    weights[pairIndices[1]] = pairParts[1];
    decorIndices.forEach(i => { weights[i] = 1 + Math.floor(Math.random() * MAX_OBJECT_WEIGHT); });

    return { weights, blankIdx, pairIndices };
}
```

#### Balança Animada via Rotação CSS em Torno do Pino Central

A viga e os dois pratos são um único grupo SVG que gira ao redor do pino, com a transição CSS suavizando a animação a cada novo palpite digitado.

```js
function computeTiltAngle(leftWeight, rightWeight) {
    const diff = rightWeight - leftWeight;
    return Math.max(-MAX_TILT_ANGLE, Math.min(MAX_TILT_ANGLE, diff * TILT_SENSITIVITY));
}

function setScaleAngle(prefix, angleDeg) {
    const beam = document.getElementById(`${prefix}-beam`);
    if (beam) beam.style.transform = `rotate(${angleDeg}deg)`;
}
```

> Nota de manutenção: os desafios 4-5 usavam originalmente uma mecânica de drag-and-drop separada (`loadBalanceChallenge`, `isSubsetSumUnique`) que foi substituída pela mesma mecânica dos desafios 1-3 a pedido do usuário. Esse código permanece no arquivo, sem uso, por causa da regra do projeto de nunca apagar código existente.

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (balança SVG animada + tabela de 5 objetos + campo de palpite) → modal de resultado → `screen-tracks`.

---

## 38. Complete a Sequência

**Pasta:** `Complete a Sequencia/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Progressão Aritmética
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `complete-a-sequencia`)

### Descrição

Uma sequência de 10 termos é exibida com 2 a 4 lacunas (conforme a trilha) para o jogador preencher. Usa progressão aritmética simples ou com passos em ciclo (alternando entre 2 ou 3 valores de incremento diferentes), podendo ser ascendente ou descendente nas trilhas mais avançadas.

### Mecânicas

#### Geração de Passos em Ciclo

O "passo" da progressão pode ser um único valor fixo (PA simples) ou um ciclo de 2-3 valores que se repete ao longo da sequência, dependendo do bloco de dificuldade.

```js
const STEP_COUNT_BY_BLOCK = [1, 1, 2, 3];

function generateSequence() {
    const block = blockForTrack(currentTrack);
    const maxCycleLen = STEP_COUNT_BY_BLOCK[block];
    const cycleLen = 1 + Math.floor(Math.random() * maxCycleLen);
    const isDescending = canDescend && Math.random() < 0.5;

    const stepMagnitudes = [];
    for (let i = 0; i < cycleLen; i++) {
        stepMagnitudes.push(magRange.min + Math.floor(Math.random() * (magRange.max - magRange.min + 1)));
    }
    const steps = stepMagnitudes.map(m => isDescending ? -m : m);

    const terms = [startValue];
    for (let i = 0; i < SEQUENCE_LENGTH - 1; i++) {
        terms.push(terms[terms.length - 1] + steps[i % cycleLen]);
    }
    return terms;
}
```

#### Valor Inicial Calculado para Nunca Ficar Negativo

Em sequências descendentes, o valor inicial é calculado a partir da maior "queda" acumulada possível ao longo da sequência, garantindo que nenhum termo intermediário fique abaixo de zero.

```js
let cumulative = 0, minCumulative = 0;
for (let i = 0; i < SEQUENCE_LENGTH - 1; i++) {
    cumulative += steps[i % cycleLen];
    if (cumulative < minCumulative) minCumulative = cumulative;
}
startValue = Math.abs(minCumulative) + 1 + Math.floor(Math.random() * 10);
```

#### Lacunas Nunca Adjacentes

Para sempre sobrar um número visível ao lado de qualquer lacuna como ponto de apoio para o cálculo, o sorteio de posições de lacuna é repetido até não haver duas posições vizinhas.

```js
function hasAdjacentPositions(sortedPositions) {
    for (let i = 1; i < sortedPositions.length; i++) {
        if (sortedPositions[i] - sortedPositions[i - 1] === 1) return true;
    }
    return false;
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (linha de 10 células, com `<input>` nas posições de lacuna) → modal de resultado → `screen-tracks`.

---

## 39. Contando as Patas

**Pasta:** `Contando as Patas/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Multiplicação (Contagem de Grupos)
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `contando-as-patas`)

### Descrição

O jogador vê um animal (2, 4, 6 ou 8 patas) e deve dizer quantas patas ele tem; no mesmo desafio, um grupo do mesmo tipo de animal (ou, nas trilhas mais avançadas, de um animal diferente) é exibido, e o jogador calcula o total de patas do grupo. Só conta como acerto quando as duas respostas estão corretas ao mesmo tempo.

### Mecânicas

#### Banco de Animais por Número de Patas

```js
const LEG_ANIMALS = {
    2: ['🐔', '🐧', '🦆', '🦩'],
    4: ['🐶', '🐱', '🐴', '🐄', '🐷', '🦁'],
    6: ['🐜', '🐝', '🐞'],
    8: ['🕷️', '🐙']
};
```

#### Animal do Grupo Podendo Diferir do Animal Individual (Trilhas Avançadas)

Nos 3 primeiros blocos, a mesma espécie é usada nas duas perguntas do desafio. No bloco mais avançado, cada pergunta sorteia sua própria espécie independentemente.

```js
const SAME_ANIMAL_BY_BLOCK = [true, true, true, false];

function generateChallenge() {
    ...
    let groupLegCount, groupAnimal;
    if (sameAnimal) {
        groupLegCount = singleLegCount;
        groupAnimal = singleAnimal;
    } else {
        groupLegCount = pickLegCount(legOptions);
        groupAnimal = pickAnimal(groupLegCount);
    }
    ...
}
```

#### Verificação Dupla Simultânea

```js
function verifyChallenge() {
    const singleCorrect = !isNaN(singleGuess) && singleGuess === currentChallenge.singleLegCount;
    const groupCorrect = !isNaN(groupGuess) && groupGuess === currentChallenge.groupTotal;
    // so avanca se singleCorrect && groupCorrect
}
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (2 painéis lado a lado: animal individual e grupo, cada um com campo de resposta) → modal de resultado → `screen-tracks`.

---

## 40. Qual é o Grupo?

**Pasta:** `Qual e o Grupo/`
**Stack:** Vanilla JS
**Categoria:** Matemática — Classificação e Diagramas de Venn
**Fases:** 12 trilhas × 5 desafios
**Persistência:** `sessionStorage` (via `HY.stars`, chave `qual-e-o-grupo`)

### Descrição

Evolução de "Organiza Tudo" para múltiplas características simultâneas: um diagrama de Venn de 2 ou 3 círculos (conforme a trilha) é desenhado com cores primárias que se misturam opticamente nas interseções via `mix-blend-mode:multiply`. O jogador arrasta itens de uma bandeja para a região correta do diagrama, entre 7 temas possíveis (animais, frutas/vegetais, transportes, esportes, clima, material escolar, espaço), cada um com objetos-isca que não pertencem a nenhum círculo.

### Mecânicas

#### Layout Geométrico dos Círculos (2 ou 3)

```js
function getCircleLayout(circleCount) {
    const cx = 210, cy = 190;
    if (circleCount === 2) {
        const r = 125, d = 105;
        return [
            { cx: cx - d / 2, cy: cy, r },
            { cx: cx + d / 2, cy: cy, r }
        ];
    }
    const r = 110, d = 110;
    const h = d * Math.sqrt(3) / 2;
    return [
        { cx: cx - d / 2, cy: cy - h / 3, r },
        { cx: cx + d / 2, cy: cy - h / 3, r },
        { cx: cx, cy: cy + 2 * h / 3, r }
    ];
}
```

#### Determinação de Região por Distância Euclidiana

Cada item carrega um vetor de tags booleanas (pertence/não pertence a cada círculo do tema). A região onde o item foi solto é calculada verificando em quais círculos o ponto cai dentro do raio, e comparada com o vetor esperado.

```js
function computeRegion(pt, circles) {
    return circles.map(c => Math.hypot(pt.x - c.cx, pt.y - c.cy) <= c.r);
}

function verifyDiagram() {
    items.forEach(item => {
        let itemCorrect;
        if (item.location !== 'placed') {
            itemCorrect = false;
        } else {
            const region = computeRegion({ x: item.x, y: item.y }, currentCircles);
            const expected = item.tags.slice(0, currentCircles.length);
            itemCorrect = region.every((v, i) => v === expected[i]);
        }
        item.feedback = itemCorrect ? 'correct' : 'wrong';
    });
}
```

#### 7 Temas com Itens e Isca Pré-Anotados

Cada tema define rótulos por círculo e uma lista de itens com um vetor `tags` de booleanos correspondente; itens com todas as tags `false` funcionam como isca (não pertencem a nenhum grupo).

```js
const THEMES = [
    {
        labels: ['Voa', 'Tem 4 patas', 'Vive na água'],
        items: [
            { icon: '🦆', tags: [true, false, true] },
            { icon: '🐧', tags: [false, false, true] },
            // ...
            { icon: '🐌', tags: [false, false, false] } // isca
        ]
    },
    // + Frutas/Vegetais, Transportes, Esportes, Clima, Material Escolar, Espaço
];

const CIRCLE_COUNT_BY_BLOCK = [2, 2, 3, 3];
const ITEM_COUNT_BY_BLOCK = [6, 8, 9, 11];
```

### Fluxo de telas

`screen-cover` → `screen-tracks` → `screen-game` (legenda de cores + diagrama SVG + bandeja de itens arrastáveis) → modal de resultado → `screen-tracks`.

---

## Apêndice — Utilitários Compartilhados

### `utils/shuffle.js`

Exposto como `HY.shuffle(array)`. Usado em Monster Typer I, Maiúsculo vs Minúsculo, Syllables e em todos os 15 jogos das seções 26-40.

### `utils/stars.js`, `utils/progress.js`, `utils/elapsed.js`

Trio usado por todos os jogos das seções 26-40 (padrão de 12 trilhas × 5 desafios): `HY.stars.init/renderGrid/trackComplete` para seleção de trilha e persistência de estrelas em `sessionStorage`; `HY.progress` e `HY.elapsed` envolvem `HY.score` automaticamente, sem código extra por jogo. Ver seção "Utilitários compartilhados (utils/)" do `CLAUDE.md` do projeto para a documentação completa da API.

### `utils/rand.js`

Exposto como `HY.rand.pick(pool, n, filterFn?)` e `HY.rand.pickByTrack(pool, n, criterios, trackIdx)`. Sorteia itens de um pool fixo, com filtro pedagógico opcional por trilha. Usado em Mapa da Ilha do Tesouro, Mercado Matemágico, Balança da Descoberta e Qual é o Grupo?.

### `utils/animations.js`

Exposto como `HY.shake(element)`. Aplica a classe `.shake-anim` e a remove após timeout.

### `utils/screen.js` e `utils/timer.js`

Utilitários de controle de tela e timer compartilhados entre jogos Vanilla JS.

### `styles/game-viewport.css`

CSS global. Define:
- Tokens de cor (`--hy-purple`, `--hy-orange`, `--hy-green`, `--hy-red`, etc.)
- Fontes (Luckiest Guy, Nunito)
- Classes de animação (`.shake-anim`, `.pop-anim`, `.float-anim`, `.line-anim`, `.gear-anim`, `.correct-anim`)
- Classes de estado (`.state-correct`, `.state-wrong`, `.state-neutral`)
- Componentes utilitários (`.btn-back`, `.btn-3d`, `.draggable`, `.dropzone`)

---

## Apêndice — Família de Jogos com 4 Mecânicas

Os seguintes jogos compartilham os quatro componentes de apresentação React em `utils/challenges/`. A origem dos dados e os fallbacks diferem entre jogos:

| Jogo | Conteúdo | Tema Visual |
|---|---|---|
| Caçadores de Coletivos | Substantivos Coletivos | Safári/Aventura |
| Detetives da Ortografia | Ortografia (X/CH, S/SS, G/J) | Detetive Noir |
| Escola de Magia VSA | Classes Gramaticais | Escola de Magia |
| Fábrica de Rimas | Rimas | Industrial/Fábrica |
| Galáxia dos Opostos | Antônimos | Espacial |
| Sinônimos | Sinônimos | Selva |

**Arquitetura comum:**
- Capa → seleção de trilha → partida → conclusão; nomes dos estados variam por jogo.
- `checkAnswer(value)` valida match/intruder/sentence
- `handleConnectRight(rightWord)` valida connect
- `handleWin()` avança fase ou encerra
- `resetTurn()` limpa todos os estados de interação
- Drag & Drop com `handleDragStart`, `handleDragOver`, `handleDrop`
- SVG de linhas animadas no connect com posições em `['16.66%', '50%', '83.33%']`

Os componentes compartilhados já são consumidos pelos seis jogos desta família. Ortografia e VSA usam bancos específicos; Coletivos, Rimas, Opostos e Sinônimos usam o gerador sobre `HYWords`. Opostos troca intruso por match. Não presumir que todos os quatro tipos sejam exibidos em toda trilha.
