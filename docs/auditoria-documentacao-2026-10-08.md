# Auditoria documental — Hello Yotta Games

> Data: 08/10/2026. Escopo: versão local do repositório. Método: inspeção estática de catálogo, páginas, scripts carregados e bancos. Sem execução de gameplay, consulta ao site publicado ou nova validação pedagógica.

## Evidências e cobertura

- 40 entradas em `api/games.json` e 40 cartões no catálogo raiz; páginas locais existentes.
- 12 páginas React+Babel e 28 Vanilla JS. Todos os scripts locais declarados pelas 40 páginas existem e foram lidos na auditoria.
- `HYWords`: 226 palavras; 97 com classe; 59 com `faseAcento` (grupos 5,5,5,5,5,5,5,4,5,5,5,5); 39 com `vogalFaltante`.
- Percurso de Sílabas: oito monossílabos e 52 dissílabos entre os primeiros 60 itens após a ordenação usada pelo jogo.
- `HY.stars` persiste melhores estrelas e desbloqueio em `sessionStorage`; armazenamento próprio em `localStorage` varia por implementação.
- Grafo existente consultado para orientar a leitura, mas o relatório de 22/06/2026 precede as substituições. O grafo não foi reconstruído nesta revisão.

## Correções documentais realizadas

- Nomes e mecânicas ativas de Enigmas da Esfinge, Galáxia Geométrica e Poções; código legado distinguido do carregado.
- Estruturas de trilhas, bancos e entrada dos jogos 1–25; trechos de implementação antiga substituídos por descrições do fluxo atual. Seções 26–40 mantidas como referência dos geradores existentes.
- Análise pedagógica das três experiências substituídas e matriz de objetivos; indicadores continuam propostas dependentes de instrumentação/mediação.
- Roadmap distingue componentes e migrações implementados de pendências de conteúdo, dados, nomes e novas propostas.
- Orientação do repositório e guias da API corrigidos quanto ao número de jogos, fontes ativas e natureza estática do catálogo.

## Divergências que exigem mudança de produto/código

| Item | Evidência atual | Ação pendente |
|---|---|---|
| Poções | `index.html` carrega `color-sort.js`; cartão/JSON promete soma e subtração | Corrigir cartão e regenerar JSONs |
| Duelo dos Monstros | `LEVELS` define comparações `>`, `<`, `=`; cartão fala em contas | Corrigir descrição |
| Organiza Tudo | Seis conjuntos de nove objetos; cartão fala em organizar letras | Corrigir descrição e compatibilizar grade/banco |
| Fábrica de Rimas | Seleção de relações e completar frases; cartão promete criar versos | Ajustar descrição ao comportamento |
| Vogais | 39 itens para 12×5; quinto item da trilha 8 não existe | Completar/reorganizar banco e tratar falta de dados |
| Acentos | 59 entradas; trilha 8 com quatro; metadados divergentes | Completar grupo e revisar metadados |
| Sílabas | Percurso não chega a palavras de três/quatro sílabas | Implementar seleção por faixa |
| Grafo | Relatório datado de 22/06/2026 | Atualizar grafo e relatórios em conjunto |

## Inventário de execução dos 40 jogos

Os títulos abaixo vêm do catálogo local; URLs são preservadas. “Scripts do jogo” lista apenas os arquivos da mesma pasta da página; utilitários e bibliotecas compartilhadas são identificados no HTML de cada entrada.

| Jogo no catálogo | Página local | Arquitetura | Scripts do jogo |
|---|---|---|---|
| Enigmas da Esfinge | `Canhões de ouro/index.html` | React 18 + Babel | `riddles.js`, `sphinx.js`, `main.js` |
| Caçadores de Coletivos | `Caçadores de Coletivos/index.html` | React 18 + Babel | `main.js` |
| Complete com Vogais | `vowel/vowel.html` | Vanilla JS | `main.js` |
| Defesa do Castelo Matemático | `Defesa do Castelo Matematico/index.html` | Vanilla JS | `main.js` |
| Detetives da Ortografia | `Detetives da Ortografia/index.html` | React 18 + Babel | `main.js` |
| Digite o Resultado | `Digite o resultado/index.html` | Vanilla JS | `main.js` |
| Digitado | `Digitado/index.html` | React 18 + Babel | `main.js` |
| Duelo dos Monstros | `Duelo dos Monstros/index.html` | Vanilla JS | `main.js` |
| Escola de Magia VSA | `Escola de Magia VSA/index.html` | React 18 + Babel | `main.js` |
| Fábrica de Acentos | `Fabrica de Acentos/index.html` | React 18 + Babel | `main.js` |
| Fábrica de Rimas | `Fábrica de Rimas/index.html` | React 18 + Babel | `main.js` |
| Galáxia Geométrica | `Galáxia da Matemática/index.html` | Vanilla JS | `geometry-score.js`, `geometry-core.js`, `geometry.js` |
| Galáxia dos Opostos | `Galaxia dos Opostos/index.html` | React 18 + Babel | `main.js` |
| Laboratório das Poções | `Laboratorio das Pocoes/index.html` | Vanilla JS | `color-sort.js` |
| Maiúsculo vs Minúsculo | `Maisculo vs Minusculo/index.html` | React 18 + Babel | `main.js` |
| Matemática Pirata | `Matematica Pirata/index.html` | React 18 + Babel | `cannon-feedback.js`, `main.js` |
| Mercado Alien | `Mercado Alien/index.html` | Vanilla JS | `main.js` |
| Mercado Maior ou Menor | `Mercado Maior ou Menor/index.html` | Vanilla JS | `main.js` |
| Monster Typer I | `monster_typer I/index.html` | Vanilla JS | `main.js` |
| Monster Typer II | `monster_typer II/index.html` | Vanilla JS | `main.js` |
| Organiza Tudo | `Organiza Tudo/index.html` | React 18 + Babel | `main.js` |
| Piratas do Troco | `Piratas do Troco/index.html` | Vanilla JS | `main.js` |
| Separando Sílabas | `syllables/index.html` | Vanilla JS | `main.js` |
| Sinônimos | `Sinonimos/index.html` | React 18 + Babel | `main.js` |
| Trem da Soma e Subtração | `Trem da Soma e Subtracao/index.html` | Vanilla JS | `main.js` |
| Mapa da Ilha do Tesouro | `Mapa da Ilha do Tesouro/index.html` | Vanilla JS | `main.js` |
| Espelho Mágico | `Espelho Magico/index.html` | Vanilla JS | `main.js` |
| Gráfico em Ação | `Grafico em Acao/index.html` | Vanilla JS | `main.js` |
| Qual é o próximo | `Qual e o proximo/index.html` | Vanilla JS | `main.js` |
| Fábrica das Formas | `Fabrica das Formas/index.html` | Vanilla JS | `main.js` |
| Que horas são | `Que horas sao/index.html` | Vanilla JS | `main.js` |
| Complete a Cobra | `Complete a Cobra/index.html` | Vanilla JS | `main.js` |
| Sudoku Mágico | `Sudoku Magico/index.html` | Vanilla JS | `main.js` |
| Combinando Sorvete | `Combinando Sorvete/index.html` | Vanilla JS | `main.js` |
| Mercado Matemágico | `Mercado Matematico/index.html` | Vanilla JS | `main.js` |
| O Caminho Mais Rápido | `O Caminho Mais Rapido/index.html` | Vanilla JS | `main.js` |
| Balança da Descoberta | `Balanca da Descoberta/index.html` | Vanilla JS | `main.js` |
| Complete a Sequência | `Complete a Sequencia/index.html` | Vanilla JS | `main.js` |
| Contando as Patas | `Contando as Patas/index.html` | Vanilla JS | `main.js` |
| Qual é o Grupo? | `Qual e o Grupo/index.html` | Vanilla JS | `main.js` |

## Verificação documental

Os sete documentos revisados passaram pela conferência de UTF-8, fechamento de blocos de código, links locais e âncoras dos índices. Mecânicas e pedagogia mantêm 40 seções numeradas. Foram conferidos os 40 cartões, totais dos dois JSONs, presença dos campos de contrato, páginas locais e a distribuição de 12 jogos React e 28 Vanilla. A avaliação direta dos bancos confirmou os totais de palavras e 12 grupos de cinco enigmas. Esses controles verificam estrutura e evidências estáticas; não substituem teste de execução dos jogos.

## Limites da revisão

Foram alterados somente arquivos Markdown. Jogos, bancos, catálogo HTML, contratos e arquivos JSON não foram alterados. As correções não confirmam que a versão local tenha sido publicada. Não houve nova aplicação com estudantes nem teste integral dos 40 jogos. A referência à BNCC já existente foi preservada sem nova consulta externa.
