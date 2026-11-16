# Próximos Passos — Hello Yotta Games

> Revisado em 08/10/2026 por inspeção estática das páginas, scripts ativos e bancos locais. Situações implementadas e pendências foram confrontadas com o código. Esta revisão não executou gameplay nem confirma publicação em produção.
> Documento oficial de planejamento: `docs/proximos_passos.md`. Sempre que o usuário mencionar `proximos_passos.md`, considerar este arquivo.
> Consolidado em 25/09/2026 com o planejamento antes mantido na raiz e com as decisões sobre diversificação de mecânicas. A consolidação não constitui uma nova auditoria dos jogos; os itens abaixo são planejamento, salvo indicação explícita de implementação.

## Mudanças ativas confirmadas em 08/10/2026

- **Enigmas da Esfinge:** substituiu a experiência de Canhões de Ouro, preservando a pasta/URL e a montagem por `main.js`. 60 enigmas, três alternativas, explicação e animação de erro.
- **Matemática Pirata:** feedback de navio e barril está integrado por `PirateCannonFeedback`.
- **Galáxia Geométrica:** página da antiga Galáxia da Matemática usa os scripts `geometry*.js`; são três reconhecimentos e dois voos por trilha. Código aritmético preservado e inativo.
- **Laboratório das Poções:** página usa `color-sort.js` para separar cores com desfazer/reiniciar. Código aritmético preservado e inativo.

## Pendências de catálogo e documentação gerada

- Atualizar a descrição de Poções no `index.html`, que ainda promete soma/subtração, e então regenerar os dois JSONs. Duelo dos Monstros ainda descreve contas em vez de comparação, Organiza Tudo descreve letras em vez de classificação, e Rimas promete criação de versos apesar da escolha de relações.
- Preservar URLs e campos da API; os 40 caminhos locais e referências de scripts foram conferidos nesta revisão. Nenhum JSON foi regenerado porque a correção do catálogo ainda é uma tarefa de produto/código.
- `graphify-out/GRAPH_REPORT.md` registra 22/06/2026 e não representa integralmente as substituições atuais. Atualizar o grafo em tarefa própria; não corrigir manualmente apenas o relatório gerado.

## Pendências de conteúdo e progressão confirmadas

- **Vogais:** há 39 entradas para uma grade de 60; sete trilhas completas e quatro itens da oitava. Completar/reorganizar o banco e tratar ausência de item antes de liberar o percurso inteiro.
- **Sílabas:** os primeiros 60 itens ordenados têm oito monossílabos e 52 dissílabos. Implementar seleção por faixa para obter a progressão prevista de três/quatro sílabas.
- **Organiza Tudo:** seis conjuntos de nove objetos para grade de 12 trilhas. Definir seis trilhas ou ampliar o banco; a sétima não encontra `levelData`.
- **Monster Typer II:** revisar grafias sem acento no banco, incluindo `MACA`, `BALAO` e `AGUA`, e o contrato de entrada esperado.
- **Estrelas e avaliação:** Poções não penaliza transferência inválida em `HY.score`; Galáxia Geométrica soma múltiplas coletas por desafio. Rever métricas se houver decisão de avaliar eficiência; a revisão documental não altera a regra compartilhada.

## Todos os jogos

- **Feedback auditivo padrão incompleto:** adicionar `assets/audio/win.mp3` e `assets/audio/lose.mp3`, ainda ausentes. A integração já existe.
- **Estrutura de 12 trilhas × 5 desafios:** corrigir a exceção confirmada na Fábrica de Acentos, cuja trilha 8 tem quatro palavras. A correção dos dados e a centralização do banco estão detalhadas na seção de refatoração ao final deste documento.

## Caçadores de Coletivos

- Corrigir a sequência de mecânicas por trilha para: múltipla escolha, múltipla escolha, associação, associação e completar frase.
- Atualmente o quarto desafio gerado é do tipo intruso. Ajustar a geração para este jogo sem alterar indevidamente os demais consumidores do gerador compartilhado.

## Defesa do Castelo Matemático

- Substituir a estrutura atual de três lobos por cinco lobos simultâneos, com tamanhos crescentes.
- Derrotar um lobo por desafio correto, do menor para o maior.
- Aplicar animações individuais de entrada e derrota; atualmente o código manipula o grupo.

## Digitado

- **Contagem por letra incompleta:** implementar contadores separados de letras corretas e incorretas. Atualmente há avanço por letra correta e penalização por erro, mas a pontuação positiva ocorre ao completar a palavra.
- **Pausa por perda de foco pendente:** definir e implementar o comportamento equivalente na interface atual, que captura teclas globalmente e não possui mais campo de texto. Não há tratamento de foco para pausar e retomar o cronômetro.
- **Quantidade de palavras divergente:** o requisito anterior solicita cinco palavras por desafio; a implementação apresenta cinco palavras por trilha, com uma palavra por desafio. Confirmar qual estrutura deve prevalecer antes de alterar a mecânica.
- **Filtro por tamanho pendente:** o banco global já é consumido, mas os critérios atuais filtram apenas por dificuldade. O planejamento previa dificuldade e tamanho.
- **Validação visual pendente:** verificar se letras minúsculas com descendentes (g, p, q, y) aparecem integralmente nos cartões atuais. O campo de texto citado no bug original deixou de existir; o corte não foi confirmado na interface atual.

## Maiúsculo vs Minúsculo

- Implementar o sorteio das letras a partir do segundo desafio da trilha 6 e nas trilhas 7–12. Atualmente essas sequências são fixas.
- Manter um pool embaralhado das 26 letras, retirar cada letra utilizada e renovar o pool somente quando se esgotar.
- Preservar o Z como primeiro desafio da trilha 6 e evitar repetição dentro da sequência sorteada conforme o requisito original.

## Diversificação de mecânicas — decisões e situação atual

O 1º par foi implementado conforme o registro abaixo. Os demais pares continuam como planejamento para implementação futura.

### 1º par — Canhões de Ouro e Matemática Pirata

> **Implementado em 25/09/2026 — aguardando avaliação do usuário.** Enigmas da Esfinge contém 12 trilhas com 5 enigmas, três alternativas por enigma, explicações de acerto, esfinge feliz e animação de sucção no erro com retorno para nova tentativa. Matemática Pirata recebeu o disparo parabólico do navio e a explosão do barril nos acertos, preservando sua mecânica matemática. Catálogo e APIs atualizados; endereços dos jogos preservados. Verificados: 60 enigmas distintos, carregamento dos arquivos React/Babel e fluxos de acerto e erro no navegador.

#### Canhões de Ouro → Enigmas da Esfinge — especificação já implementada

- Substituir integralmente a mecânica matemática e a temática de Canhões de Ouro por um jogo de **Português e raciocínio lógico**, com enigmas no estilo “o que é, o que é?”.
- Nome definido: **Enigmas da Esfinge**.
- Temática: **Antigo Egito**.
- No topo da tela, apresentar **uma pessoa à esquerda** e **uma esfinge à direita**. A esfinge deve ser maior que a pessoa.
- Abaixo das personagens, apresentar o enunciado do enigma.
- Abaixo do enunciado, apresentar **três alternativas** de resposta.
- Ao acertar, a esfinge fica feliz.
- Ao errar, a esfinge abre a boca e suga a pessoa, com animação inspirada no estilo Kirby.
- Antes de substituir a experiência de Canhões de Ouro, preservar seu feedback de navio atingindo um barril para reutilização em Matemática Pirata.

#### Matemática Pirata — feedback de acerto já incorporado

- Manter a temática e a mecânica atuais de Matemática Pirata.
- Adicionar a animação de **navio atingindo um barril**, proveniente de Canhões de Ouro, **quando o jogador acertar**.

### 2º par — Duelo dos Monstros e Mercado Alien

#### Mercado Alien → Duelo Alien

- Alterar somente o nome exibido para **Duelo Alien**.
- Preservar todo o restante: temática, mecânica e comportamento do jogo.

#### Duelo dos Monstros → Tradutor da Antiguidade

- Substituir a experiência matemática por um jogo de **Português e raciocínio lógico**, baseado na decifração de mensagens.
- Nome definido: **Tradutor da Antiguidade**.
- Temática: **arqueologia do Antigo Egito**.
- Utilizar **emojis para representar os hieróglifos** da atividade.
- Exibir uma sequência de símbolos e, abaixo de cada um, um espaço para digitar uma letra do nosso alfabeto.
- O objetivo é decifrar o conteúdo representado pelos símbolos.
- Apresentar algumas letras **já traduzidas e preenchidas**, oferecendo pistas iniciais ao jogador.
- Manter coerência entre símbolos e letras dentro de cada enigma para permitir deduções a partir das pistas.
- Definir em planejamento posterior o banco de mensagens e a progressão de dificuldade; não há uma sequência de palavras para frases aprovada nesta decisão.

### 3º par — Defesa do Castelo Matemático e Expresso do Trem da Soma e Subtração

#### Substituição do Expresso por um jogo de palavras cruzadas

- **Retirar o Expresso do Trem da Soma e Subtração do catálogo** e colocar **um novo jogo de palavras cruzadas em seu lugar**.
- A solicitação de criar um jogo de palavras cruzadas é atendida por esta substituição: **não criar um segundo jogo de palavras cruzadas separado**.
- O novo jogo será de **Português e raciocínio lógico**, com uma grade de palavras que se cruzam e pistas para descobrir e preencher as respostas. As letras compartilhadas entre palavras devem ajudar na resolução.
- Nome, temática visual, conteúdo das pistas e progressão de dificuldade: **a definir**. Não presumir que a temática de trem será mantida.
- A retirada é do catálogo; exclusão de arquivos e mudanças de endereço não foram definidas nesta decisão.
- Preservar Defesa do Castelo Matemático nesta proposta de diferenciação. As pendências próprias desse jogo, registradas anteriormente neste documento, continuam válidas.

## Novo jogo — comparação de letra de forma e cursiva

- Criar um jogo com a **mesma jogabilidade de Maiúsculo vs Minúsculo**, adaptando o conteúdo para reconhecer correspondências entre **letra de forma e letra cursiva**.
- Organizar **maiúsculas e minúsculas separadamente**, sem misturá-las no mesmo conjunto de desafios.
- No conjunto de maiúsculas, comparar a letra maiúscula de forma com sua equivalente maiúscula cursiva.
- No conjunto de minúsculas, comparar a letra minúscula de forma com sua equivalente minúscula cursiva.
- Usar representações cursivas legíveis e adequadas à identificação de cada letra.
- Nome do jogo e organização específica dos conjuntos em modos ou trilhas: **a definir**.

---

## 🎯 Objetivo Principal

Implementar **mini-jogos intermediários** (na tela de login ou lobby) antes ou entre as fases principais com o propósito de realizar uma **coleta de dados telemétricos (método de interação)**, avaliando a precisão e a destreza dos alunos no uso dos periféricos (mouse ou teclado).

---

## ⚙️ Funcionamento Geral

- **Seleção Dinâmica:** O sistema verifica por telemetria qual é o método de interação adequado para o aluno ou jogo (mouse ou teclado) e direciona para o mini-jogo correspondente.
- **Comando de Atalho:** Os mini-jogos ocorrem rotineiramente, mas podem ser encerrados e o acesso ao jogo principal liberado a qualquer momento através de uma combinação de teclas (**Ctrl+L**).

---

## 🎮 Detalhes dos Mini-Jogos

### 1. Mini-Jogo de Teclado (Foco em Digitação)

- **Dinâmica:** Um jogo de digitação onde a palavra solicitada será sempre o **nome e sobrenome do aluno**.
- **Métrica Coletada:** Precisão e velocidade na digitação das letras.

### 2. Mini-Jogo de Mouse (Foco em Clique - "Caça-Quadrados")

- **Dinâmica:**
  1. Um quadrado vermelho (representando um botão) aparece em um local aleatório e espaçado da tela.
  2. O aluno deve clicar no centro do quadrado.
  3. Ao registrar o clique, o quadrado vermelho muda para a cor azul claro (com baixa opacidade e tamanho menor).
  4. O cursor do mouse deve permanecer contido dentro dessa área azul até que um novo quadrado vermelho apareça em outro ponto aleatório da tela, permitindo que o usuário se desloque para o próximo botão.
- **Métrica Coletada:** Precisão e tempo de resposta dos cliques.

## 📊 Finalidade e Telemetria

Os dados coletados de precisão (letras no teclado e cliques no mouse) servirão para:

- **Mapeamento de Desempenho:** Estabelecer um _range_ (intervalo) de resultados, identificando desde o desempenho mais otimizado (aluno com maior domínio e agilidade) até o menor resultado.
- **Identificação de Necessidades:** Detectar quais alunos possuem alto domínio das ferramentas e quais precisam de **reforço específico no uso do mouse ou do teclado**.

---

## Refatoração de dados e componentes — implementação parcial confirmada

> A origem das fases de Acentos e os componentes React compartilhados já foram migrados. A lista abaixo preserva o contexto da decisão e explicita o que falta; não deve ser executada como se toda a refatoração ainda estivesse por começar.

### Implementado no fluxo atual

- `HYWords` contém 226 entradas, 97 com `classe`, e campos `acento` (objeto com `tipo`, `posicao`, `letra`) e `faseAcento`; não existe contrato ativo separado `posicaoAcento`.
- Fábrica de Acentos agrupa `HYWords` por `faseAcento` 1–12. Os grupos somam 59 palavras; a trilha 8 mantém quatro.
- `utils/challenges/ChallengeMatch.js`, `ChallengeConnect.js`, `ChallengeIntruder.js` e `ChallengeSentence.js` já existem e são usados por Detetives, Escola de Magia, Coletivos, Rimas, Opostos e Sinônimos.
- Coletivos, Rimas, Opostos e Sinônimos já usam `HY.challenges.buildLevels` sobre `HYWords`. Ortografia e VSA mantêm bancos próprios.

### Pendências desta refatoração

- Revisar os valores de `acento.posicao` e `acento.tipo`, preservando a convenção de índice de caractere quando aprovada; o gabarito do jogo atual é extraído dos caracteres.
- Completar a trilha 8 e validar os 12 grupos de Acentos.
- Decidir a compatibilidade do legado `HYAcentos.phases`, ainda presente e marcado deprecated. Não remover sem verificar consumidores.
- Revisar semanticamente intrusos e distratores do gerador; ausência de metadado não comprova relação linguística.
- A extensão para um banco matemático compartilhado e componentes além das mecânicas atuais continua futura. `HY.rand.NUMEROS` já existe; avaliar seu uso antes de propor outro banco.

### Contexto

Este repositório é uma plataforma de jogos educacionais browser-based (sem build step, sem npm, sem bundler). Os jogos React+Babel são frágeis — leia o CLAUDE.md antes de tocar em qualquer arquivo.

A refatoração tem como objetivo centralizar dados e mecânicas de jogo em arquivos compartilhados (`utils/`), eliminando duplicação entre os jogos.

---

### Arquitetura atual e direção futura

```
utils/
  words.js          ← banco compartilhado; classe, acento e faseAcento já presentes
  letters.js        ← fonte de verdade sobre letras (já existe)
  ortografia.js     ← desafios de ortografia — manter como está
  gramatica.js      ← desafios gramaticais — manter por ora, será parcialmente substituído
  acentos.js        ← lookup de sinais e fases legadas deprecated; migração das fases já feita
  challenges/
    ChallengeMatch.js      ← componente React reutilizável (type="text/babel")
    ChallengeConnect.js    ← componente React reutilizável (type="text/babel")
    ChallengeIntruder.js   ← componente React reutilizável (type="text/babel")
    ChallengeSentence.js   ← componente React reutilizável (type="text/babel")
```

---

### Fase 1 — Dados migrados; revisão de qualidade pendente

O contrato atual usa `classe`, `acento: { tipo, posicao, letra }` e `faseAcento`; a proposta antiga de `acento` como símbolo separado de `posicaoAcento` não corresponde ao formato implementado.

A classificação e os metadados já foram preenchidos em parte do banco. Verificar consistência por palavra antes de usar esses campos em indicadores ou migrar VSA. A Fábrica de Acentos já deriva `PHASES` de `HYWords`; não repetir essa migração. `acentos.js` ainda conserva o banco anterior como legado deprecated, além das tabelas ativas.

### Fase 2 — Componentes compartilhados implementados

Os quatro componentes já estão em `utils/challenges/` e expõem `window.HYChallenges`. As páginas dos seis consumidores carregam esses scripts com `type="text/babel"` após Babel e antes de `main.js`.

Detetives da Ortografia e Escola de Magia VSA já usam `HYChallenges.Match`, `.Connect`, `.Intruder` e `.Sentence`; a prova de conceito e expansão para a família foram executadas. Manter a interface e a ordem de carregamento. Novas migrações dependem de compatibilidade real com a mecânica; não há tarefa pendente de criar novamente esses arquivos.

### Fase 3 — (Futuro) Novos domínios

Com a arquitetura pronta, criar `utils/matematica.js` (ou similar) com desafios de matemática que reutilizam os mesmos componentes `ChallengeMatch`, `ChallengeConnect`, etc.

---

### Regras que devem ser seguidas durante toda a refatoração

- **Nunca executar comandos git** — controle de versão é manual pelo usuário
- **Nunca apagar código** sem garantir que o arquivo de origem foi atualizado para referenciar o novo arquivo
- **Jogos React+Babel**: ordem de scripts é rígida; `<script type="text/babel" src="main.js">` nunca deve ser alterado
- **Testar no Live Server** após cada fase — o preview interno do Claude Code não funciona para jogos React+Babel
- **Pedir QA ao usuário** após cada jogo migrado antes de avançar
- **Trabalhar em fases verificáveis** — não migrar todos os jogos de uma vez
