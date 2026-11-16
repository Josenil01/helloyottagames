# Hello Yotta Games — Análise Pedagógica dos Jogos

> Revisão estática: 08/10/2026 (análise inicial de 23/09/2026). Escopo: 40 jogos, com foco no Ensino Fundamental — anos iniciais.
> Documento complementar a [jogos-mecanicas.md](jogos-mecanicas.md). Elaborado a partir da documentação de mecânicas, da inspeção dos fluxos ativos, das configurações de dificuldade e dos bancos locais.
> Os benefícios descritos são possibilidades de uso pedagógico, não resultados de um estudo de eficácia. Não houve aplicação com estudantes nem teste integral de gameplay. Onde o código diverge da documentação anterior, esta análise considera o código.

## Como interpretar esta análise

A finalidade principal é a avaliação **formativa**: identificar o que a criança consegue fazer, em quais condições e qual intervenção pode ajudá-la. Uma resposta correta é uma evidência situada, não uma comprovação isolada de domínio. Repetições do mesmo item, pistas visuais, alternativas eliminadas e ajuda de adultos mudam o significado do resultado.

As faixas de anos sugeridas abaixo são recomendações de entrada, baseadas nas demandas das tarefas. Não são classificação oficial por ano, pré-requisito rígido ou equivalência entre trilha e série. Uma criança de ano posterior pode usar uma atividade inicial para recomposição de aprendizagem.

A referência curricular geral é a [BNCC — Educação Infantil e Ensino Fundamental, MEC](https://basenacionalcomum.mec.gov.br/images/BNCC_EI_EF_110518_versaofinal_site.pdf), especialmente Língua Portuguesa e Matemática nos anos iniciais. A análise dialoga com alfabetização, análise linguística, números, álgebra, geometria, grandezas e medidas e probabilidade e estatística. Os enquadramentos por jogo são interpretações pedagógicas deste documento; não constituem certificação de alinhamento nem mapeamento validado de códigos de habilidades.

### O que existe hoje e o que ainda precisa ser coletado

| Camada | Situação e uso possível |
|---|---|
| Resultado do jogo | Há pontuação, tempo e estrelas por trilha nos utilitários compartilhados. São sinais de desempenho na atividade, não notas de aprendizagem. |
| Persistência compartilhada | `utils/stars.js` guarda melhores estrelas e desbloqueios por jogo em `sessionStorage`. Não guarda um histórico completo de respostas por estudante. Alguns jogos também possuem registros locais próprios. |
| Pontuação | O padrão de `utils/score.js` combina acertos, bônus de rapidez e penalizações. Galáxia Geométrica usa pontuação fixa própria, sem bônus. O mesmo total pode resultar de percursos diferentes; não permite reconstruir a taxa de acerto. |
| Tempo | `utils/elapsed.js` mede tempo de relógio; não desconta genericamente perda de foco, mediação, leitura ou animações. Não equivale automaticamente a tempo de raciocínio. |
| Estrelas | A regra ativa concede 3 estrelas com zero erros e até 8 s por desafio; 2 com até um erro **ou** até 18 s; 1 pela conclusão. Divide o tempo por cinco, mesmo quando a unidade de ação do jogo é diferente. |
| Indicadores específicos deste documento | São propostas extraíveis das ações e dos conteúdos, mediante registro adicional. Não se deve presumir que já exista painel, armazenamento ou exportação dessas medidas. |
| Observação docente | Explicações orais, estratégias de cálculo, leitura em voz alta, autonomia e transferência para papel precisam de observação ou tarefa complementar. Cliques não revelam tudo isso. |

**Legenda dos indicadores:** **[E]** requer registro de eventos do jogo; **[M]** requer mediação/observação docente. Os sinais compartilhados já existentes estão descritos acima e não são repetidos como se fossem indicadores específicos de cada jogo.

### Regras comuns de cálculo

- **A1 — acerto na primeira tentativa:** unidades respondidas corretamente antes de feedback ÷ unidades com primeira resposta válida. Mostrar numerador e denominador, por exemplo, 7/10. Registrar tempo esgotado e abandono separadamente.
- **Unidade de análise:** pode ser palavra, par, célula, letra, campo ou problema. Cada seção explicita a unidade; não misturar três pares de associação com uma única alternativa como se tivessem a mesma carga.
- **Erro específico:** primeiras respostas com determinado erro ÷ oportunidades em que esse erro poderia ocorrer. Separar erro de conteúdo de gesto inválido, clique fora da área e falha técnica.
- **Revisão após feedback:** unidades corrigidas após um erro ÷ unidades inicialmente erradas e reapresentadas. Indica aproveitamento do feedback; não é acerto independente.
- **Tempo comparável:** mediana do tempo ativo até a primeira resposta, por tipo e dificuldade, somente após registrar pausas. Não comparar diretamente um Sudoku com uma escolha de letra.
- **Evolução:** comparar o mesmo aluno em itens novos, de exigência e apoio semelhantes. Mudança de trilha ou repetição decorada não bastam. Não estabelecer percentuais universais de “domínio” sem validação.

Antes de interpretar, verificar compreensão da instrução, acesso ao teclado/mouse/toque, legibilidade e distinção das cores. Rapidez motora ou familiaridade digital não são sinônimos de aprendizagem. Os jogos não permitem diagnosticar transtornos, inteligência ou traços de personalidade.

## Índice dos jogos

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
24. [Sílabas](#24-sílabas)
25. [Vogais](#25-vogais)
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

## 1. Caçadores de Coletivos

**Entrada sugerida:** 3º–5º ano; requer leitura de palavras e frases curtas.

**Benefícios e avaliação:** ampliar vocabulário e relacionar indivíduos a nomes de conjuntos. Permite observar reconhecimento de coletivos, associação de pares e escolha contextual; não comprova emprego espontâneo em produção textual.

**Progressão efetiva:** `buildLevels('coletivo')` embaralha o banco sem ordenação por dificuldade. Cada trilha combina duas escolhas, associação, intruso e frase, com substituições quando faltam dados. Há variedade de tarefas, mas não uma escala lexical crescente.

**Indicadores individuais:**

- **[E] A1 por relação indivíduo–coletivo**, usando cada escolha ou par como unidade; registrar quais coletivos geram mais confusão.
- **[E] A1 em palavra isolada versus frase**, com conteúdos equivalentes; indica necessidade de apoio contextual.
- **[M] Uso de um coletivo em frase nova**, com registro da adequação semântica e da ajuda recebida.

**Limite importante:** o gerador identifica intruso pela ausência do atributo no banco, não por uma relação linguística validada entre as quatro palavras. Não usar essa modalidade como evidência de domínio antes de revisar os itens.

**Base local:** `Caçadores de Coletivos/main.js`, `utils/challenges.js`, `utils/words.js`.

## 2. Enigmas da Esfinge

**Entrada sugerida:** anos iniciais, com mediação de leitura conforme a autonomia da criança; a idade de entrada depende do enigma.

**Benefícios e avaliação:** interpretar pistas, relacionar características a objetos e fenômenos e justificar uma hipótese. Trabalha vocabulário e inferência em enunciados curtos, com três alternativas.

**Progressão efetiva:** 12 conjuntos temáticos fixos de cinco enigmas. Alternativas são embaralhadas; a mudança de tema não comprova aumento uniforme de dificuldade. Acerto apresenta explicação; erro elimina a alternativa escolhida e permite nova tentativa após a animação.

**Indicadores individuais propostos:**

- **[E] A1 por enigma e tipo de pista**, unidade: resposta confirmada antes da explicação.
- **[E] Revisão após feedback**, separada do acerto independente, registrando alternativas já eliminadas.
- **[M] Explicação das pistas utilizadas** e resposta a um enigma novo sem alternativas.

**Limites:** leitura e repertório cultural influenciam a resposta. Pontuação após eliminação não demonstra inferência independente. A antiga validação aritmética de Canhões permanece em código legado, mas não é parte do jogo montado atualmente.

**Base local:** `Canhões de ouro/index.html`, `riddles.js`, `sphinx.js` e montagem de `SphinxApp` ao final de `main.js`.

---

## 3. Defesa do Castelo Matemático

**Entrada sugerida:** 1º–3º ano, após compreender as operações sem pressão temporal.

**Benefícios e avaliação:** exercitar fatos aditivos e subtrativos e manter a operação em foco durante a seleção de resposta. O resultado informa desempenho de cálculo sob prazo, não capacidade geral de concentração.

**Progressão efetiva:** adições nas trilhas 1–4, subtrações em 5–8 e alternância posterior, com números maiores. O avanço dos lobos acrescenta pressão temporal e visual, distinta da dificuldade matemática.

**Indicadores individuais:**

- **[E] A1 por operação**, unidade: problema, discriminando faixa numérica.
- **[E] Proporção de tempos esgotados**, separada da proporção de respostas matematicamente erradas.
- **[M] Comparação do raciocínio em itens equivalentes sem prazo**, para verificar se a dificuldade está no cálculo ou nas condições de execução.

**Limite:** derrota ou lentidão não demonstram desconhecimento da operação. O jogo ainda apresenta três lobos, não a progressão de cinco adversários prevista em outro documento.

**Base local:** `Defesa do Castelo Matematico/main.js` e `index.html`.

## 4. Detetives da Ortografia

**Entrada sugerida:** 2º–5º ano, conforme a regularidade ortográfica trabalhada.

**Benefícios e avaliação:** comparar grafias, reconhecer formas convencionais e discutir regularidades contextuais. Observa discriminação ortográfica em alternativas, pares e frases; não substitui escrita sob ditado ou produção autônoma.

**Progressão efetiva:** 60 itens organizados por conjuntos como X/CH, S/SS, G/J, Ç, QU/K/C e terminações, com revisão final. A mudança é sobretudo de conteúdo; as quatro modalidades reaparecem ao longo das trilhas. Não há evidência de calibração empírica da dificuldade.

**Indicadores individuais:**

- **[E] A1 por contraste ortográfico**, unidade: escolha ou par.
- **[E] Matriz de confusões**, registrando grafia escolhida e esperada em cada oportunidade.
- **[M] Explicação da escolha e escrita de palavra nova com a mesma regularidade**, diferenciando memorização do item e generalização.

**Limite:** revisar cada gabarito e a adequação das alternativas antes de interpretar o erro do aluno.

**Base local:** `Detetives da Ortografia/main.js`, `utils/ortografia.js`.

## 5. Digitado

**Entrada sugerida:** 1º–3º ano, com familiarização prévia com o teclado.

**Benefícios e avaliação:** acompanhar a ordem das letras, comparar modelo e resposta e exercitar transcrição digital. A palavra fica visível: observa cópia orientada e reconhecimento gráfico, não escrita de memória nem compreensão leitora.

**Progressão efetiva:** cinco palavras por trilha, sorteadas do banco: fácil em 1–4, médio em 5–8 e difícil em 9–12. A seleção usa a etiqueta de dificuldade, sem controle explícito de extensão ou estrutura silábica. Há modos de apresentação de caixa, preservando acentos na comparação.

**Indicadores individuais:**

- **[E] Precisão por tecla alfabética:** teclas corretas ÷ teclas alfabéticas aceitas; unidade: posição da palavra.
- **[E] Confusões de letras e acentos**, registrando caractere esperado e digitado.
- **[E] Palavras transcritas sem erro ÷ palavras tentadas**, por extensão e estrutura silábica anotadas.
- **[M] Leitura e explicação do significado após a cópia**, para não presumir leitura pela digitação.

**Limite:** pausas fora da janela e dificuldade de inserir acentos no dispositivo afetam tempo e erros.

**Base local:** `Digitado/main.js`, `utils/rand.js`, `utils/words.js`.

## 6. Digite o Resultado

**Entrada sugerida:** 1º–4º ano, conforme a faixa dos operandos.

**Benefícios e avaliação:** produzir numericamente o resultado de adições e subtrações sem escolher entre alternativas. Favorece acompanhamento de cálculo e registro numérico; erros de digitação precisam ser separados dos de cálculo.

**Progressão efetiva:** parâmetro `maxVal` de 5 até 100, operações inicialmente separadas e depois misturadas. O prazo passa de 15 para 8 segundos. O teto de um operando não deve ser confundido com teto do resultado de uma soma.

**Indicadores individuais:**

- **[E] A1 por operação e presença de passagem pela dezena**, unidade: resultado submetido.
- **[E] Erro numérico assinado:** resposta menos resultado correto, agrupado por padrões recorrentes, sem atribuir causa automaticamente.
- **[E] Taxa de expiração e de correção da entrada antes do envio**, separadas dos erros confirmados.

**Mediação:** pedir a resolução oral de um item errado para distinguir compreensão, cálculo e registro.

**Base local:** `Digite o resultado/main.js` (`gameLevels`, geração e entrada de resposta).

## 7. Duelo dos Monstros

**Entrada sugerida:** 1º–3º ano.

**Benefícios e avaliação:** comparar números naturais e relacionar “maior”, “menor” e “igual” a seus símbolos. Ajuda a identificar trocas de orientação dos sinais e dificuldade de comparar dezenas.

**Progressão efetiva:** pares pequenos inicialmente, depois números de duas ordens e valores até 100. Os pares são fixos e os patamares se sobrepõem; a trilha não representa uma escala contínua validada.

**Indicadores individuais:**

- **[E] A1 por relação `>`, `<` e `=`**, unidade: comparação.
- **[E] Inversões entre maior e menor ÷ comparações desiguais respondidas**.
- **[E] A1 por distância entre os números e por igualdade/diferença de dezenas**, anotando os operandos.

**Mediação e limite:** solicitar “leia essa comparação em voz alta”; isso ajuda a distinguir conceito de magnitude e convenção do símbolo. Repetir pares fixos pode medir memória da resposta.

**Base local:** `Duelo dos Monstros/main.js`.

## 8. Escola de Magia VSA

**Entrada sugerida:** 3º–5º ano; usar exemplos orais antes da nomenclatura quando necessário.

**Benefícios e avaliação:** distinguir palavras que nomeiam, expressam ações ou qualificam, relacionando-as à construção de frases. Observa classificação e adequação em frases curtas; não avalia toda a compreensão gramatical.

**Progressão efetiva:** 60 itens com escolhas, associação, intruso e frases. Variam o vocabulário e as formas verbais, mas as três classes permanecem; não existe ordenação automática por complexidade sintática.

**Indicadores individuais:**

- **[E] A1 e matriz de confusão entre substantivo, verbo e adjetivo**, unidade: palavra classificada.
- **[E] Diferença entre classificação isolada e preenchimento de frase**, por classe.
- **[M] Justificativa contextual:** explicar o papel da palavra em uma frase nova.

**Limite:** “verbo = ação” é uma aproximação inicial e não cobre todos os verbos. A classe depende do uso; evitar tratar toda palavra isolada como unívoca.

**Base local:** `Escola de Magia VSA/main.js`, `utils/gramatica.js`.

## 9. Fábrica de Rimas

**Entrada sugerida:** 1º–3º ano; mediação oral para crianças em alfabetização.

**Benefícios e avaliação:** explorar semelhanças sonoras finais e ampliar repertório de palavras. Com leitura em voz alta pode apoiar consciência de rimas; sem áudio de palavras, o jogo também exige leitura e pode ser resolvido por semelhança gráfica.

**Progressão efetiva:** o banco de rimas é embaralhado pelo gerador compartilhado. As modalidades se repetem, sem gradação garantida de transparência sonora, frequência lexical ou extensão.

**Indicadores individuais:**

- **[E] A1 por par de rimas validado**, unidade: escolha/par, separando famílias sonoras.
- **[M] Reconhecimento oral dos mesmos pares sem texto**, comparado ao desempenho com palavras visíveis.
- **[M] Produção de outra palavra que rime**, registrando adequação sonora e ajuda.

**Limite crítico:** a ausência de `rimas` no banco não define um intruso em relação às demais palavras. Revisar os desafios gerados, os distratores e os pares antes de usar os resultados como evidência fonológica.

**Base local:** `Fábrica de Rimas/main.js`, `utils/challenges.js`, `utils/words.js`.

## 10. Fábrica de Acentos

**Entrada sugerida:** 3º–5º ano, conforme o repertório de palavras e regras já trabalhadas.

**Benefícios e avaliação:** reconhecer sinais gráficos e localizar a letra que os recebe. Pode apoiar discussão de tonicidade e nasalização com mediação; escolher um sinal não demonstra, sozinho, conhecimento da regra que o justifica.

**Progressão efetiva:** início por agudo, circunflexo e til; depois mistura. A partir da fase 6, a criança também precisa selecionar a posição. As fases posteriores incluem palavras mais extensas. A trilha 8 ainda tem quatro palavras; os grupos de `faseAcento` em `HYWords` totalizam 59 entradas.

**Indicadores individuais:**

- **[E] A1 do sinal escolhido**, por agudo/circunflexo/til, unidade: palavra.
- **[E] A1 da posição escolhida**, separado do acerto do sinal, nas fases que exigem localização.
- **[M] Leitura, identificação da sílaba tônica e explicação da marca**, sem confundir til com regra geral de acento tônico.

**Limite:** os metadados têm posições inconsistentes e TRÊS está classificado como agudo no banco; o jogo calcula a marca a partir dos caracteres. Corrigir os metadados antes de usá-los para agrupar indicadores. Erros de posição não passam necessariamente pela penalização padrão.

**Base local:** `Fabrica de Acentos/main.js` (fases derivadas de `HYWords`), `utils/acentos.js` (lookup), `utils/words.js`. A migração da origem das fases já está implementada; a qualidade dos metadados continua pendente.

## 11. Galáxia Geométrica

**Entrada sugerida:** anos iniciais, com seleção das trilhas conforme o repertório de figuras e acesso aos controles.

**Benefícios e avaliação:** reconhecer figuras planas e manter um critério de seleção durante a pilotagem. Separar reconhecimento conceitual de coordenação motora e atenção na coleta.

**Progressão efetiva:** 12 trilhas, cada uma com três escolhas entre figuras e dois voos de dez coletas. O repertório cresce de três até doze figuras. A partir da trilha 6 o alvo muda após 3 e 6 coletas; nas trilhas 9–12 algumas opções são rotacionadas. O voo acelera conforme a trilha.

**Indicadores individuais propostos:**

- **[E] A1 no reconhecimento por figura**, unidade: alternativa confirmada; registrar orientação e distratores.
- **[E] Coletas corretas e incorretas por alvo**, separando as transições de alvo das escolhas estáticas.
- **[M] Nomeação e descrição das propriedades da figura**, fora da pilotagem.

**Limites:** +100/−50 são pontos fixos, sem bônus de velocidade. A simulação pausa por foco/visibilidade, mas o cálculo compartilhado de estrelas continua usando tempo de relógio dividido por cinco; 20 coletas não equivalem a duas escolhas simples. As etiquetas acessíveis incluem os nomes das figuras, portanto o apoio recebido também depende do modo de acesso. O conjunto inclui estrela e oval; discutir suas características sem reduzir toda figura a um polígono regular.

**Base local:** `Galáxia da Matemática/index.html`, `geometry-core.js`, `geometry.js`, `geometry-score.js`. `main.js` aritmético está preservado e não é carregado.

---

## 12. Galáxia dos Opostos

**Entrada sugerida:** 2º–4º ano, com mediação de leitura quando necessária.

**Benefícios e avaliação:** estabelecer relações de oposição e interpretar mudanças de sentido. Observa vocabulário receptivo e escolha em frases, não produção textual autônoma.

**Progressão efetiva:** palavras com `oposto` são embaralhadas. O gerador utiliza escolhas, associação e frases; substitui a modalidade intruso por uma escolha adicional. A dificuldade lexical não é ordenada entre trilhas.

**Indicadores individuais:**

- **[E] A1 por par de antônimos**, unidade: relação respondida.
- **[E] A1 em contexto versus palavra isolada**, com os pares equivalentes.
- **[M] Explicação de uma oposição em frase nova**, distinguindo contraste pertinente de palavra apenas diferente.

**Limite:** o oposto depende do sentido empregado. Um gabarito único precisa ser revisado quando a palavra admite mais de uma leitura.

**Base local:** `Galaxia dos Opostos/main.js`, `utils/challenges.js`, `utils/words.js`.

## 13. Laboratório das Poções

**Entrada sugerida:** anos iniciais, conforme a quantidade de cores e a autonomia para planejar movimentos.

**Benefícios e avaliação:** classificação por cor, antecipação de consequências, planejamento e revisão de estratégias sob restrições. A versão ativa é um quebra-cabeça de separar cores em frascos.

**Progressão efetiva:** 12 trilhas de cinco quebra-cabeças. Duas a seis cores, aumentando a cada duas trilhas; cada frasco comporta quatro unidades e há dois frascos vazios no gerador. O número de passos de embaralhamento cresce, sem constituir medida validada da dificuldade mínima de solução. Transfere-se o bloco contíguo do topo para cor igual ou frasco vazio com espaço.

**Indicadores individuais propostos:**

- **[E] Movimentos válidos, tentativas inválidas, desfazimentos e reinícios**, unidade: tentativa de transferência, mantendo os tipos separados.
- **[M] Antecipação do próximo movimento e justificativa** da necessidade de manter espaço livre.
- **[E] Conclusão por configuração efetiva e apoio utilizado**, registrando o tabuleiro inicial para comparações.

**Limites:** movimento inválido não chama `HY.score.wrong()`; estrelas não medem diretamente eficiência ou tentativas inválidas. Desfazer e reiniciar são apoios à exploração. Cores possuem símbolos adicionais. Não interpretar a temática como ensino de química, volume ou cálculo aritmético.

**Base local:** `Laboratorio das Pocoes/index.html`, `color-sort.js`, `color-sort.css`. O antigo `main.js` aritmético não é carregado.

---

## 14. Maiúsculo vs Minúsculo

**Entrada sugerida:** 1º–2º ano.

**Benefícios e avaliação:** reconhecer a identidade da letra em duas formas gráficas. Ajuda a localizar correspondências ainda instáveis; não avalia nomeação oral, relação fonema–grafema ou escrita cursiva.

**Progressão efetiva:** A–Y nas primeiras cinco trilhas; Z inicia a sexta, seguido de listas fixas de revisão. Os modos permitem as duas direções de conversão. Não há pool aleatório progressivo nas trilhas finais.

**Indicadores individuais:**

- **[E] A1 por letra e direção de conversão**, unidade: correspondência.
- **[E] Matriz letra-alvo × alternativa escolhida**, para localizar confusões gráficas recorrentes.
- **[M] Reconhecimento da mesma letra em outra fonte ou suporte**, verificando transferência além do desenho treinado.

**Limite:** a ordem alfabética é uma organização de conteúdo, não uma comprovação de dificuldade crescente.

**Base local:** `Maisculo vs Minusculo/main.js`, `utils/letters.js`.

## 15. Matemática Pirata

**Entrada sugerida:** 1º–3º ano.

**Benefícios e avaliação:** relacionar quantidades, numerais e igualdade, resolvendo resultados e termos ausentes. A representação visual pode apoiar a passagem da contagem para relações parte–todo.

**Progressão efetiva:** início com soma/subtração até 10; segundo termo oculto na trilha 4 e primeiro na 5; depois faixas maiores e nova retomada de termos ocultos na 10. O filtro consulta o banco de operações, e não as antigas listas preservadas no arquivo.

**Indicadores individuais:**

- **[E] A1 por posição do termo desconhecido**, unidade: igualdade.
- **[E] A1 por operação e faixa numérica**, separando itens com apoio de quantidades visuais.
- **[M] Estratégia de resolução do termo ausente:** tentativa, contagem, complemento ou operação inversa.

**Limite:** resolver com figuras não garante resolução simbólica independente; propor uma igualdade equivalente sem apoio para observar transferência.

**Base local:** `Matematica Pirata/main.js`, `utils/rand.js`.

## 16. Mercado Alien

**Entrada sugerida:** 1º–3º ano; etapas com expressões após compreensão de adição.

**Benefícios e avaliação:** comparar magnitudes e, em parte das tarefas, calcular antes de comparar. Permite distinguir leitura de numerais, uso de sinais e comparação de uma soma com outro número.

**Progressão efetiva:** parâmetro de faixa de 10 a 100 e prazo de 15 a 7 segundos. A partir da trilha 7, pode aparecer uma expressão de soma em um lado; ela é sorteada, não garantida em todo desafio. A fórmula de geração pode produzir números além do parâmetro nominal.

**Indicadores individuais:**

- **[E] A1 em número–número versus soma–número**, unidade: comparação.
- **[E] Confusões entre `>`, `<` e `=`**, separadas por tipo de apresentação.
- **[E] Erros e expirações por faixa real de valores**, registrando os valores gerados, não apenas o número da trilha.

**Limite:** escudos perdidos misturam consequências de jogo; não substituem uma classificação dos erros matemáticos.

**Base local:** `Mercado Alien/main.js` (`levels`, `generateProblem`).

## 17. Mercado Maior ou Menor

**Entrada sugerida:** 1º–2º ano.

**Benefícios e avaliação:** comparar tamanhos e comprimentos representados e compreender ordens como maior e menor. Observa escolha de extremos e compreensão do vocabulário relacional.

**Progressão efetiva:** duas alternativas em itens iniciais e três em muitos posteriores; mudam objetos, instruções e tamanhos. Diferenças visuais frequentemente aumentam, o que pode facilitar a discriminação. Não há progressão monotônica comprovada.

**Indicadores individuais:**

- **[E] A1 por comando maior/menor**, unidade: conjunto comparado.
- **[E] A1 com duas versus três alternativas**, controlando a diferença relativa entre tamanhos.
- **[M] Explicação do atributo comparado:** altura, comprimento ou tamanho visual, conforme a figura.

**Limite:** tamanho da imagem não mede massa, capacidade ou valor monetário. O tema de mercado não autoriza interpretar a tarefa como educação financeira.

**Base local:** `Mercado Maior ou Menor/main.js`.

## 18. Organiza Tudo

**Entrada sugerida:** 1º–2º ano; retomada em outros anos para explicitar critérios.

**Benefícios e avaliação:** classificar objetos por um critério e justificar pertencimento. Permite observar reconhecimento de cor, forma, função e categoria semântica.

**Progressão efetiva:** o banco ativo tem seis conjuntos temáticos, com nove itens cada: cores, formas, categorias gerais, natureza, vestuário e alimentos. A troca é de critério, não de dificuldade graduada. A grade compartilhada de 12 trilhas não corresponde a 12 conjuntos implementados.

**Indicadores individuais:**

- **[E] A1 por item e critério de classificação**, unidade: primeiro destino do objeto.
- **[E] Matriz categoria esperada × caixa escolhida**, para diferenciar confusão de critério e erro pontual.
- **[M] Reclassificação dos mesmos objetos por outro critério**, registrando se a criança explica a mudança.

**Limite:** associações como caixa–quadrado ou elementos da natureza são simplificações temáticas. Não inferir conhecimento formal de sólidos geométricos nem taxonomia científica.

**Base local:** `Organiza Tudo/main.js` (`LEVELS`, `startLevel`, grade de seleção).

## 19. Piratas do Troco

**Entrada sugerida:** 1º–2º ano.

**Benefícios e avaliação:** representar subtração por retirada, contar o restante e coordenar ações uma a uma. A atividade oferece suporte concreto virtual para relações parte–todo.

**Progressão efetiva:** listas aumentam, em geral, o total de moedas e o custo. A criança retira a quantidade solicitada e guarda as restantes. O resultado e o contador são exibidos durante o percurso.

**Indicadores individuais:**

- **[E] Tempo ativo por moeda movimentada**, como descrição operacional, sem convertê-lo em nota de cálculo.
- **[E] Conclusões do procedimento ÷ desafios iniciados**, registrando ajuda, interrupções e quantidade de moedas.
- **[M] Previsão do restante antes de a interface revelá-lo**, unidade: problema; esta é a evidência mais útil de subtração independente.

**Limite:** o fluxo restringe ações e não registra erro pelo sistema padrão. Zero erros não significa domínio; o restante já mostrado impede usar apenas a conclusão para avaliar cálculo mental de troco.

**Base local:** `Piratas do Troco/main.js` (`handleCoinClick`, `prepareChestPhase`).

## 20. Sinônimos

**Entrada sugerida:** 2º–5º ano, conforme o vocabulário.

**Benefícios e avaliação:** ampliar repertório lexical e perceber aproximações de sentido. Pode apoiar revisão textual quando seguido de discussão; observa principalmente reconhecimento entre alternativas e adequação em frases curtas.

**Progressão efetiva:** o gerador embaralha palavras elegíveis, sem ordenar frequência, abstração ou registro. As mesmas modalidades reaparecem em cada trilha; chegar à última não demonstra acesso a vocabulário mais complexo.

**Indicadores individuais:**

- **[E] A1 por relação de sinonímia revisada**, unidade: escolha/par.
- **[E] A1 em frases versus pares isolados**, com o mesmo sentido lexical.
- **[M] Substituição de palavra em texto novo e justificativa da preservação do sentido**, registrando adequação ao contexto.

**Limite crítico:** sinônimos não são intercambiáveis em qualquer frase. O intruso baseado em campo ausente no banco não garante relação de sinonímia entre os demais; excluir itens ambíguos da avaliação.

**Base local:** `Sinonimos/main.js`, `utils/challenges.js`, `utils/words.js`.

## 21. Trem da Soma e Subtração

**Entrada sugerida:** 1º–3º ano.

**Benefícios e avaliação:** exercitar cálculo de soma e diferença e relacionar a resposta à operação apresentada. Pode apoiar fluência em fatos conhecidos, desde que a pressão do timer não preceda a compreensão.

**Progressão efetiva:** somas com filtros até 5, 8, 10 e 15; subtrações até 10, 15 e 20; retomadas em faixas maiores e mistura final. A seleção depende do número de itens elegíveis no banco, não apenas do teto do filtro.

**Indicadores individuais:**

- **[E] A1 por operação e faixa real**, unidade: problema.
- **[E] Acertos independentes por fato numérico em reapresentações**, distinguindo repetição do mesmo item de generalização.
- **[E] Expiração versus erro de resposta**, com tempo ativo e prazo configurado.

**Limite:** verificar quantidade suficiente de itens por trilha; `pick` pode devolver menos que cinco quando o filtro deixa um banco pequeno. Não interpretar interrupção técnica como fracasso pedagógico.

**Base local:** `Trem da Soma e Subtracao/main.js`, `utils/rand.js`.

## 22. Monster Typer I

**Entrada sugerida:** 1º ano e recomposição de reconhecimento de letras.

**Benefícios e avaliação:** associar uma letra visível à tecla correspondente e explorar palavras iniciadas por ela. A resposta exigida é uma letra, não a digitação da palavra inteira.

**Progressão efetiva:** trilhas por A, B, C, D, E, F, G, H, I, J, L e M, com cinco exemplos por letra. O prazo de 10 segundos é fixo. Ordem de letras e palavras não constitui aumento de complexidade fonológica.

**Indicadores individuais:**

- **[E] A1 por letra-alvo**, unidade: apresentação da letra.
- **[E] Teclas trocadas e latência até a tecla correta**, interpretadas como correspondência visual e acesso ao teclado.
- **[M] Identificação oral do som inicial em palavras apropriadas**, sem atribuir som próprio ao H nem supor que cada letra tenha um único som.

**Limite:** a letra já está exposta e se repete na trilha. Acertar não comprova análise do som inicial nem reconhecimento das demais letras do alfabeto.

**Base local:** `monster_typer I/main.js` (`TRACKS`, evento de teclado).

## 23. Monster Typer II

**Entrada sugerida:** 1º–3º ano, com domínio operacional do teclado.

**Benefícios e avaliação:** transcrever palavras mantendo a ordem das letras e monitorar correspondências entre modelo e tecla. Pode favorecer familiaridade com sequências gráficas; não equivale a escrita espontânea.

**Progressão efetiva:** 12 listas fixas de cinco palavras; as primeiras incluem muitas palavras de quatro letras, mas listas posteriores voltam a palavras curtas. Não há crescimento regular. O timer reinicia a apresentação após expirar, sem ser necessariamente contabilizado como erro padrão.

**Indicadores individuais:**

- **[E] Precisão de teclas por posição e extensão da palavra**, unidade: tentativa de letra.
- **[E] Palavras completadas sem erro e sem reinício ÷ palavras iniciadas**.
- **[E] Reinícios por tempo esgotado por palavra**, para distinguir conclusão assistida por repetição de execução contínua.

**Erro de conteúdo:** há entradas como AGUA e BALAO sem os acentos convencionais. Corrigir antes de usar o jogo como modelo ortográfico ou indicador de acentuação.

**Base local:** `monster_typer II/main.js`.

## 24. Sílabas

**Entrada sugerida:** 1º–2º ano.

**Benefícios e avaliação:** ordenar blocos silábicos e relacioná-los à estrutura gráfica da palavra. Com leitura oral e retirada do modelo, pode apoiar síntese e segmentação; na interface atual a palavra completa é mostrada como pista.

**Progressão efetiva:** o banco é ordenado por número de sílabas e as trilhas acessam blocos consecutivos de cinco itens. Na versão auditada, os primeiros 60 têm oito monossílabos e 52 dissílabos. A promessa comentada de 2, 3 e 4 sílabas por blocos de trilhas não se realiza no percurso acessado.

**Indicadores individuais:**

- **[E] A1 por colocação de sílaba**, discriminando posição inicial, medial e final quando disponíveis.
- **[E] Palavras montadas sem reposição incorreta ÷ palavras apresentadas**, por estrutura silábica.
- **[M] Segmentação e recomposição oral sem modelo escrito**, separadas do desempenho de cópia dos blocos.

**Limite:** não inferir evolução para palavras polissilábicas a partir das trilhas finais atuais. Revisar a segmentação do banco antes de avaliar.

**Base local:** `syllables/main.js`, `utils/words.js`; contagem direta dos 60 itens acessíveis pelo índice das trilhas.

## 25. Vogais

**Entrada sugerida:** 1º–2º ano.

**Benefícios e avaliação:** completar uma palavra com uma vogal e relacionar pistas gráficas e semânticas. O emoji auxilia a identificação da palavra, mas não oferece evidência direta da análise de seu som.

**Progressão efetiva:** filtra entradas com `vogalFaltante` na ordem do banco, sem gradação por posição ou complexidade. Há modos de caixa. O banco atual tem 39 itens para uma navegação que pode solicitar 60 posições; a partir do quinto desafio da trilha 8 falta conteúdo.

**Indicadores individuais:**

- **[E] A1 por vogal esperada**, unidade: lacuna válida.
- **[E] Matriz vogal esperada × vogal escolhida**, discriminando posição da lacuna na palavra.
- **[M] Pronúncia da palavra e explicação da escolha**, verificando se o acerto veio de leitura, memória visual ou pista do desenho.

**Limite:** excluir posições sem conteúdo; jamais registrar essa falha como erro ou ausência de aprendizagem do aluno. Completar uma lacuna não equivale a escrever a palavra inteira.

**Base local:** `vowel/main.js`, `utils/words.js`.

## 26. Mapa da Ilha do Tesouro

**Entrada sugerida:** 2º–5º ano, com familiarização com linhas, colunas e direções.

**Benefícios e avaliação:** localizar posições numa malha, articular dois referenciais e executar instruções de deslocamento. Observa leitura de coordenadas e acompanhamento de percursos.

**Progressão efetiva:** localização em grade 6×6 com distratores decorativos de 2 a 15. Nos dois últimos desafios de cada trilha há rota em grade 8×8; o número de segmentos passa de 2 para 5 em blocos de três trilhas.

**Indicadores individuais:**

- **[E] A1 do componente letra e do componente número**, unidade: coordenada solicitada.
- **[E] Erros de linha versus coluna**, registrando posição escolhida e alvo.
- **[E] A1 do destino da rota por número de segmentos e direções**, sem confundir com localização direta.
- **[M] Descrição oral do percurso**, verificando uso de referências espaciais.

**Limite:** mais figuras aumentam busca visual, não necessariamente o conceito de coordenada.

**Base local:** `Mapa da Ilha do Tesouro/main.js`.

## 27. Espelho Mágico

**Entrada sugerida:** 2º–5º ano, começando com figuras e eixos simples.

**Benefícios e avaliação:** reconhecer reflexão e conservar posições relativas e cores. Permite observar correspondência entre partes de uma figura e sua imagem refletida.

**Progressão efetiva:** três níveis em blocos de quatro trilhas. Nos desafios de completar, a proporção de pistas cai de aproximadamente 60% para 30% e depois zero; também muda a complexidade das figuras. Há reconhecimento entre alternativas e construção por preenchimento.

**Indicadores individuais:**

- **[E] A1 da figura refletida por eixo**, unidade: escolha.
- **[E] A1 por célula preenchida**, discriminando quantidade de pistas e posição relativa ao eixo.
- **[E] Escolha de reflexão em eixo incorreto ÷ escolhas válidas**, distinguindo os tipos de alternativa.

**Mediação:** pedir que a criança mostre qual parte corresponde à outra. Tempo de preenchimento inclui controle motor e número de células.

**Base local:** `Espelho Magico/main.js` (`tierForTrack`, `hintPercentForTrack`).

## 28. Gráfico em Ação

**Entrada sugerida:** 2º–5º ano; setores e linhas exigem discussão específica da representação.

**Benefícios e avaliação:** contar itens, classificar por dois critérios e representar frequências. Ajuda a observar a passagem de uma coleção para registros gráficos, conservando o total.

**Progressão efetiva:** barras verticais em 1–3, horizontais em 4–6, setores em 7–9 e linhas em 10–12. Dentro de cada bloco a coleção cresce de 6–8 para 10–14 itens. Trocar de representação não é, por si, uma escala linear de dificuldade.

**Indicadores individuais:**

- **[E] A1 por frequência de categoria**, unidade: valor/categoria; separar contagem por tipo e por cor.
- **[E] Erro absoluto por categoria e diferença entre soma informada e total da cena**.
- **[E] A1 por representação gráfica**, controlando número de itens e categorias.
- **[M] Leitura de maior/menor frequência e justificativa do gráfico escolhido**.

**Limite pedagógico:** ligar categorias nominais por uma linha pode sugerir continuidade inexistente. Não interpretar o desempenho nesse modo como leitura de tendências temporais; discutir quando barras, setores ou linhas são adequados.

**Base local:** `Grafico em Acao/main.js`.

## 29. Qual é o próximo

**Entrada sugerida:** 2º–5º ano, com exploração concreta de giros.

**Benefícios e avaliação:** antecipar transformações espaciais e reconhecer uma regra de rotação repetida. Observa diferença entre continuar uma rotação e escolher uma imagem espelhada.

**Progressão efetiva:** figuras de complexidade fácil, média e difícil em blocos de quatro trilhas. Giros de 90° e 180° aparecem em cada trilha; sequências de 4–8 figuras são sorteadas, sem crescimento garantido por trilha.

**Indicadores individuais:**

- **[E] A1 por giro de 90°/180° e complexidade da figura**, unidade: sequência.
- **[E] Escolhas do distrator espelhado versus do giro excedente**, divididas pelas oportunidades correspondentes.
- **[M] Demonstração da regra com uma peça física**, verificando se a criança consegue explicar e continuar a transformação.

**Limite:** figuras com simetria e a leitura das cores alteram a tarefa; registrar a figura efetiva, não apenas o nível nominal.

**Base local:** `Qual e o proximo/main.js`.

## 30. Fábrica das Formas

**Entrada sugerida:** 1º–3º ano, com expansão para explicações mais formais.

**Benefícios e avaliação:** identificar atributos que mudam e representar uma transformação por comandos. Favorece pensamento relacional: comparar estados e descrever o que aconteceu entre eles.

**Progressão efetiva:** cadeias de 4, 5 e 6 figuras em blocos de quatro trilhas. No fácil muda um atributo; no médio e difícil a chance de mudar cor e tamanho simultaneamente é de 40% e 60%.

**Indicadores individuais:**

- **[E] A1 por transição de cor, tamanho ou ambos**, unidade: conjunto de comandos de uma lacuna.
- **[E] Omissões de um atributo ÷ transições com duas mudanças**.
- **[M] Descrição verbal ou criação de uma transformação equivalente**, verificando uso de aumentar, diminuir e mudar cor.

**Limite:** contar cada cartão como um desafio completo distorce a comparação entre transições simples e duplas. Registrar também a solução da lacuna inteira.

**Base local:** `Fabrica das Formas/main.js`.

## 31. Que horas são

**Entrada sugerida:** 2º–5º ano, conforme a precisão dos minutos.

**Benefícios e avaliação:** relacionar horários numéricos ao relógio analógico e distinguir funções dos ponteiros. Observa leitura e representação de horas; não avalia automaticamente cálculo de duração.

**Progressão efetiva:** trilhas 1–4 usam horas inteiras e meias; 5–8 acrescentam quartos de hora; 9–12 usam qualquer minuto. Em cada trilha, três desafios pedem posicionamento dos ponteiros e dois pedem digitação a partir do relógio.

**Indicadores individuais:**

- **[E] A1 da hora e do minuto separadamente**, unidade: componente do horário.
- **[E] A1 na conversão número→relógio versus relógio→número**, por granularidade.
- **[E] Trocas de ponteiros e erro de minutos**, separando aproximação motora de leitura conceitual.

**Mediação:** perguntar como o ponteiro das horas se move entre duas horas. O comando atual apresenta o horário numericamente, embora a documentação antiga mencione horário por extenso.

**Base local:** `Que horas sao/main.js`.

## 32. Complete a Cobra

**Entrada sugerida:** 1º–3º ano.

**Benefícios e avaliação:** identificar unidade de repetição e continuar um padrão ao longo de um percurso. Observa manutenção da regra em mudanças de direção.

**Progressão efetiva:** blocos de três trilhas usam padrões de 3, 4, 5 e 6 cores e cobras de 12, 16, 20 e 24 células, com malhas maiores. A demanda aumenta tanto pela regra quanto pela extensão do trabalho.

**Indicadores individuais:**

- **[E] A1 por célula, posição no ciclo e tamanho do padrão**.
- **[E] Erros na passagem do fim para o início do ciclo ÷ oportunidades dessa passagem**.
- **[M] Identificação da menor unidade que se repete e previsão de uma posição distante**, com registro da justificativa.

**Limite:** uma célula de cada vez permite seguir pistas locais. Completar não garante que a criança verbalize a regra. Usar símbolos adicionais às cores em uma aplicação acessível.

**Base local:** `Complete a Cobra/main.js`.

## 33. Sudoku Mágico

**Entrada sugerida:** 2º–5º ano; 3×3 pode ser explorado antes com mediação.

**Benefícios e avaliação:** coordenar restrições e eliminar possibilidades. Pode apoiar argumentação lógica quando a criança explica por que um símbolo cabe numa posição. Não mede cálculo aritmético, mesmo quando usa números.

**Progressão efetiva:** 3×3 nas trilhas 1–3, 4×4 com regiões 2×2 em 4–6 e 6×6 com regiões 2×3 em 7–12. Alternam-se cores, formas, emojis, números e letras; não há novo aumento de dimensão depois da trilha 7.

**Indicadores individuais:**

- **[E] A1 por célula preenchível**, por dimensão, quantidade real de pistas e símbolo.
- **[E] Violações de linha, coluna e região por tentativa**, permitindo mais de uma marcação quando a jogada viola várias regras.
- **[M] Justificativas por eliminação versus tentativas sem justificativa**, observadas em algumas jogadas.

**Limite:** rapidez ou ausência de erros não comprovam uma estratégia dedutiva. Registrar o tabuleiro efetivo e sua validade antes de comparar desempenhos.

**Base local:** `Sudoku Magico/main.js`.

## 34. Combinando Sorvete

**Entrada sugerida:** 2º–5º ano, por enumeração concreta, sem exigir fórmula.

**Benefícios e avaliação:** organizar possibilidades, evitar duplicações e reconhecer que trocar a ordem de duas bolas não cria novo par. Trabalha contagem combinatória inicial e sistematização.

**Progressão efetiva:** 2, 3, 4 e 5 sabores em blocos de três trilhas, produzindo respectivamente 3, 6, 10 e 15 pares possíveis. Repetir o mesmo sabor é permitido; a ordem das bolas não distingue combinações.

**Indicadores individuais:**

- **[E] Cobertura:** pares distintos válidos encontrados ÷ total de pares possíveis.
- **[E] Duplicações por inversão de ordem ÷ pares submetidos**, separadas de repetição idêntica.
- **[M] Estratégia de enumeração**, por exemplo, fixar um sabor e variar o segundo, com explicação de como sabe que terminou.

**Limite:** a quantidade de casquinhas já revela quantas combinações faltam. Concluir o preenchimento não demonstra previsão independente do total.

**Base local:** `Combinando Sorvete/main.js`.

## 35. Mercado Matemágico

**Entrada sugerida:** 2º–5º ano; centavos e operações decimais nas etapas posteriores.

**Benefícios e avaliação:** planejar compras dentro de um orçamento, compor preços e relacionar total, pagamento e troco. Oferece evidências de cálculo monetário e seleção sob restrições.

**Progressão efetiva:** 5–8 produtos por blocos de três trilhas. Preços inteiros em 1–6; centavos em múltiplos de cinco em 7–9 e centavos livres em 10–12. Cada trilha combina três desafios de compra e dois de tabela de troco; as combinações da tabela podem ter mais itens nos blocos finais.

**Indicadores individuais:**

- **[E] Planos de compra válidos na primeira verificação ÷ planos submetidos**, considerando simultaneamente saldo e quantidade-alvo.
- **[E] A1 por campo da tabela**, separando total recebido e troco, inteiros e decimais.
- **[E] Revisões do conjunto de compras até cumprir o orçamento**, como descrição de busca, não medida automática de planejamento.
- **[M] Justificativa das escolhas e conferência da relação pagamento = compra + troco**.

**Limite:** comprar a quantidade máxima é a meta do jogo, não um critério geral de consumo responsável; discutir necessidades e escolhas fora dele.

**Base local:** `Mercado Matematico/main.js`.

## 36. O Caminho Mais Rápido

**Entrada sugerida:** 3º–5º ano, após exploração de mapas e percursos.

**Benefícios e avaliação:** comparar rotas, antecipar consequências de escolhas e coordenar caminhos com um ponto comum. Trabalha resolução de problemas espaciais e argumentação sobre eficiência.

**Progressão efetiva:** rede de aproximadamente 6 a 12 pontos. Nos três primeiros desafios há uma rota; nos dois últimos, rotas de 2, 2, 3 e 4 personagens por blocos de três trilhas. A geração pode reduzir personagens quando não encontra uma configuração válida.

**Indicadores individuais:**

- **[E] Excesso de percurso:** número de arestas da rota válida escolhida menos o mínimo necessário.
- **[E] A1 da identificação do ponto comum**, separado da validade das rotas de cada personagem.
- **[E] Revisões de percurso e escolhas de pontos não adjacentes**, distinguindo entendimento da rede e controle de interface.
- **[M] Justificativa de por que uma rota é mínima**.

**Limite:** o critério é quantidade de conexões, não distância física nem tempo real de viagem. Registrar a rede e o número efetivo de personagens.

**Base local:** `O Caminho Mais Rapido/main.js`.

## 37. Balança da Descoberta

**Entrada sugerida:** 1º–3º ano.

**Benefícios e avaliação:** interpretar equivalência e descobrir um valor a partir da soma de dois valores conhecidos. Ajuda a trabalhar igualdade como relação, além de resultado de uma conta.

**Progressão efetiva:** o fluxo ativo usa “Descubra o Peso” nos cinco desafios. O valor desconhecido varia de 2 a 20, com dois valores que somam esse total e outros valores distratores. As faixas crescentes declaradas em outra parte do arquivo pertencem à mecânica inativa; não há aumento efetivo dessa faixa entre trilhas.

**Indicadores individuais:**

- **[E] A1 do peso desconhecido**, unidade: problema de equivalência.
- **[E] Respostas compatíveis com soma de valores distratores**, anotadas como padrão observado, sem presumir a estratégia mental.
- **[M] Explicação da igualdade entre os pratos e representação por uma sentença numérica**.

**Limite:** o tema de peso não comprova compreensão de unidades de massa ou medição real. A inclinação após um palpite fornece feedback; separar primeira resposta e acerto após ajustes.

**Base local:** `Balanca da Descoberta/main.js` (`loadChallenge`, `loadWeightChallenge`, `MAX_OBJECT_WEIGHT`).

## 38. Complete a Sequência

**Entrada sugerida:** 1º–5º ano, conforme a regra e a magnitude dos passos.

**Benefícios e avaliação:** descobrir regularidades numéricas, antecipar termos e coordenar adição/subtração com posição. Favorece pensamento algébrico inicial sem exigir notação formal.

**Progressão efetiva:** sequências de dez termos. Nos quatro blocos de três trilhas há até 1, 1, 2 e 3 passos distintos no ciclo; magnitudes de 1–2, 1–5, 1–6 e 1–9. As lacunas passam de duas a quatro e os blocos finais permitem descida. Lacunas não são adjacentes.

**Indicadores individuais:**

- **[E] A1 por lacuna e tipo de regra**, distinguindo passo fixo e ciclo.
- **[E] Erro de sinal ou de posição no ciclo**, quando a resposta coincide com um desses procedimentos possíveis.
- **[M] Explicitação da regra e cálculo de um termo fora da sequência exibida**.

**Limite:** acertar a lacuna com apoio dos vizinhos não demonstra generalização para posições distantes. Descrever erros como compatíveis com uma hipótese, não como prova do procedimento usado.

**Base local:** `Complete a Sequencia/main.js`.

## 39. Contando as Patas

**Entrada sugerida:** 2º–4º ano, com contagem agrupada antes da formalização multiplicativa.

**Benefícios e avaliação:** relacionar quantidade por animal, número de animais e total. Pode apoiar a passagem da contagem unitária para adição de parcelas iguais e multiplicação.

**Progressão efetiva:** grupos de 2–4, 2–6, 2–8 e 2–10 animais. Entram animais de 2/4 patas, depois 6 e 8. No bloco final o animal individual pode diferir daquele do grupo. As duas respostas são verificadas juntas.

**Indicadores individuais:**

- **[E] A1 da quantidade por animal e do total do grupo, separadamente**, unidade: campo.
- **[E] A1 do total condicionada ao conhecimento da quantidade por animal**, para não confundir conhecimento do animal com multiplicação.
- **[M] Estratégia usada:** contar uma a uma, somar grupos ou multiplicar; pedir representação correspondente.

**Erro conceitual a revisar:** o banco inclui polvo no grupo de oito “patas”; seus apêndices são braços. Ajustar enunciado ou exemplos antes de atribuir ao jogo benefício de classificação zoológica.

**Base local:** `Contando as Patas/main.js`.

## 40. Qual é o Grupo?

**Entrada sugerida:** 2º–5º ano, com explicação inicial das regiões do diagrama.

**Benefícios e avaliação:** classificar por atributos simultâneos, reconhecer interseções e identificar elementos que não pertencem aos grupos. Pode desenvolver justificativas com “e”, “não” e “pertence a”.

**Progressão efetiva:** dois círculos nos blocos 1–2 e três nos blocos 3–4; pedidos de 6, 8, 9 e 11 itens, limitados pelo tamanho do banco temático. Temas são sorteados. A dificuldade depende também de quantas interseções e itens externos foram efetivamente apresentados.

**Indicadores individuais:**

- **[E] A1 por região exclusiva, interseção dupla, tripla e exterior**, unidade: objeto classificado.
- **[E] Atributos omitidos ou acrescentados na região escolhida**, comparando pertencimentos esperados e selecionados.
- **[M] Justificativa de um item em interseção e de outro fora dos grupos**, verificando coordenação de critérios.

**Limite:** revisar as etiquetas semânticas dos objetos e distinguir erro conceitual de soltura perto da borda. O tema pode introduzir conhecimento de mundo não igualmente familiar a todos.

**Base local:** `Qual e o Grupo/main.js`.

## Síntese para uso pedagógico

| Objetivo de intervenção | Jogos que oferecem evidências relacionadas | Complemento necessário |
|---|---|---|
| Reconhecimento de letras e transcrição | Maiúsculo vs Minúsculo, Monster Typer I/II, Digitado | Leitura oral, escrita sem modelo e observação do acesso ao teclado. |
| Estrutura sonora e gráfica de palavras | Vogais, Sílabas, Rimas | Atividades orais sem texto e revisão dos bancos. |
| Vocabulário e análise linguística | Coletivos, Sinônimos, Opostos, Escola de Magia, Detetives, Acentos | Justificativas, frases novas e produção textual. |
| Número, operações e igualdade | Castelo, Digite o Resultado, Matemática Pirata, Trem, Balança | Estratégias explicadas, problemas contextualizados e resolução sem alternativas. |
| Comparação e classificação | Duelo, Mercado Alien, Mercado Maior ou Menor, Organiza Tudo, Qual é o Grupo? | Explicitação do critério e transferência para objetos reais. |
| Educação financeira inicial | Piratas do Troco, Mercado Matemágico | Antecipação do troco e discussão de consumo e orçamento. |
| Espaço, transformações e medidas | Galáxia Geométrica, Mapa, Espelho, Qual é o próximo, Fábrica das Formas, Que horas são, Caminho | Percursos físicos, manipulação de peças, explicações e situações de duração. |
| Interpretação de pistas | Enigmas da Esfinge | Justificar pistas e resolver enigmas novos sem eliminação de alternativas. |
| Regularidades e resolução de problemas | Poções, Cobra, Sequência, Sudoku, Sorvete, Contando as Patas | Descrição da regra, enumeração organizada e argumentos de solução. |
| Tratamento de dados | Gráfico em Ação | Pesquisa real, escolha de representação e leitura crítica dos gráficos. |

Esta matriz organiza intervenções; não recomenda somar resultados de jogos diferentes num “índice geral de aprendizagem”. Há cobertura parcial de Língua Portuguesa e Matemática, com pouca evidência direta de produção textual extensa, oralidade, compreensão de textos longos, elaboração de problemas e argumentação escrita.

## Condições para transformar eventos em indicadores confiáveis

### Registro mínimo proposto — ainda não implementado por este documento

Para cada sessão e oportunidade de resposta, registrar: identificador da sessão; jogo e versão do conteúdo; trilha; identificador do item gerado; enunciado e alternativas efetivamente apresentados; habilidade/atributo revisado; valores reais da dificuldade; tipo de apoio; resposta esperada e dada; número da tentativa; resultado; início, primeira resposta, feedback e término; pausas; expiração; abandono; falha técnica; modo de entrada e ajuda recebida.

Nos jogos gerados aleatoriamente, guardar o item efetivo ou dados suficientes para reconstruí-lo: só o número da trilha não permite comparação. Nos jogos compostos, registrar também a subunidade: letra, par, célula, campo, objeto, rota ou comando. Não coletar teclas fora do contexto ativo da tarefa. O vínculo longitudinal com um aluno exige uma solução própria do ecossistema; não existe por ser possível guardar estrelas numa aba.

### Exemplo de leitura de um indicador

“Em dez comparações novas de duas dezenas, acertou oito na primeira tentativa. Nas duas demais, inverteu o sinal de maior/menor. Em explicação oral, apontou corretamente o maior número.” Essa combinação sugere trabalhar a convenção do símbolo, sem concluir automaticamente que a criança desconhece magnitude. Registrar apoio e tamanho da amostra torna a hipótese verificável.

### Validação antes de uso avaliativo

1. Revisar gabaritos, linguagem, pistas que revelam a resposta e disponibilidade de conteúdo. Itens inválidos devem ser excluídos das medidas.
2. Verificar em execução se cada ação gera um único evento e se acerto parcial, acerto final, erro, expiração e falha técnica são distinguíveis.
3. Aplicar com mediação docente e confrontar os indicadores com explicações e tarefas fora do jogo.
4. Comparar o aluno consigo mesmo em condições equivalentes, mantendo separadas prática, primeira exposição e reapresentação.

## Prioridades pedagógicas confirmadas na revisão de 08/10/2026

- **Corrigir antes de avaliar:** falta de itens em Vogais; metadados e trilha incompleta de Acentos; grafias sem acento em Monster Typer II; intrusos definidos por ausência de dados em vez de relações linguísticas.
- **Rever a progressão declarada:** Sílabas não alcança três/quatro sílabas no percurso de 60 itens; Balança mantém a faixa ativa; Organiza Tudo tem seis conjuntos para uma grade de 12; jogos linguísticos gerados não ordenam dificuldade lexical.
- **Rever a validade do conteúdo:** gráficos de linha para categorias nominais, rimas e relações semânticas, exemplos zoológicos e categorias temáticas ambíguas.
- **Separar as dimensões dos resultados:** precisão conceitual, uso de ajuda, revisão e tempo. Pontos e estrelas permanecem recursos de feedback lúdico, não medidas intercambiáveis de domínio.
- **Criar progressão pedagógica explícita quando ausente:** selecionar previamente o atributo que deve crescer — complexidade silábica, frequência lexical, faixa numérica, quantidade de restrições ou retirada de pistas — e verificar se o item gerado corresponde a esse atributo.

## Fontes e limites da revisão

- [Documentação de mecânicas](jogos-mecanicas.md), usada como ponto de partida e confrontada com a implementação.
- Páginas HTML, scripts ativos (incluindo `sphinx.js`, `geometry*.js` e `color-sort.js`) e bancos/utilitários citados nas respectivas seções; `api/games.json` para o catálogo de 40 jogos.
- `utils/score.js`, `utils/elapsed.js` e `utils/stars.js` para distinguir sinais atuais de indicadores propostos.
- [BNCC — documento oficial do MEC](https://basenacionalcomum.mec.gov.br/images/BNCC_EI_EF_110518_versaofinal_site.pdf), referência curricular geral, consultada em 23/09/2026.

Os achados descrevem a versão local examinada. Não foram alterados jogos, bancos, pontuação, armazenamento ou integrações. Recomendações e indicadores são propostas pedagógicas para orientar observação, revisão e futura instrumentação; sua capacidade de representar aprendizagem precisa ser validada em uso com professores e estudantes.

A referência curricular de 23/09/2026 foi preservada; não houve nova consulta externa à BNCC nesta revisão. Sugestões de anos e indicadores continuam sendo interpretações pedagógicas, sem nova validação com estudantes. A auditoria local confirmou 39 itens de Vogais e, no percurso de 60 itens de Sílabas, oito monossílabos e 52 dissílabos. Ver [registro da revisão](auditoria-documentacao-2026-10-08.md).
