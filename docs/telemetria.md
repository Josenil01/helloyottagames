# Hello Yotta Games — Requisitos de telemetria pedagógica

> Revisão editorial: 09/10/2026. Este documento descreve requisitos de coleta propostos; não implementa armazenamento, envio ou cálculo de indicadores. As 29 seções complementadas nesta data consideram as mecânicas locais ativas. Requisitos anteriores que precisam de atualização de conteúdo estão identificados nas respectivas seções.

## Objetivo

Implementar um sistema de **telemetria** responsável por captar dados da interatividade do jogador (alunos) com as atividades gamificadas da plataforama. Esses dados devem ser tratados como indices pedagógicos que podem auxiliar os professores a identificarem possiveis defasagens no processo de aprendizado individual dos alunos bem como possiveis pendências de conteúdo para a turma como um todo.

Os dados de desempenho dos jogadores devem permitir a construção de indicadores e devem ser divididosem duas categorias:

- **Indicadores gerais:** dados e medidas comuns a todos os jogos.
- **Indicadores específicos:** dados e medidas próprios de um ou mais jogos, conforme sua mecânica e seu conteúdo.

## Regras propostas para as sessões

- **Organização:** durante uma sessão (período de uso pela turma com o professor ou pelo jogador em casa), os desafios devem ser agrupados em trilhas.
- **Espera inicial:** ao iniciar uma sessão de qualquer jogo, o sistema deve apresentar uma contagem regressiva de 10 segundos antes de liberar a interação com o primeiro desafio da trilha.
- **Intervalo entre desafios:** os demais desafios da trilha devem ser liberados após uma espera de 5 segundos.
- **Flexibilidade:** a implementação deve permitir mudanças na quantidade de alternativas e de elementos dos desafios, preservando os atributos e métodos definidos para cada tipo de interação.

Essas regras expressam o comportamento solicitado. Sua presença neste documento não confirma que estejam implementadas em todos os jogos.

## Convenções de coleta

- Registrar os itens efetivamente apresentados, incluindo ordem, alternativas e configurações sorteadas.
- Identificar o desafio e suas subunidades: letra, célula, par, campo ou movimento.
- Distinguir ação exploratória, resposta submetida, acerto parcial, conclusão, expiração, reinício, abandono e falha técnica.
- Não deduzir o número de tentativas a partir de pontos ou estrelas, nem registrar a ausência de conteúdo como erro do jogador.
- Registrar o instante de liberação da interação, as pausas e as animações para distinguir tempo de relógio de tempo ativo. As definições gerais de tempo abaixo preservam o intervalo solicitado originalmente; eventuais medidas de tempo ativo devem ser identificadas separadamente.
- Registrar teclas apenas durante a interação ativa do desafio.
- Em associações, registrar cada par e sua ordem de tentativa, independentemente da quantidade de elementos nas colunas.

**Referências:** [Mecânicas dos jogos](jogos-mecanicas.md), [Análise pedagógica](jogos-pedagogia.md) e scripts ativos indicados nas seções dos jogos.

## Indicadores gerais

- **Método de interação:** identifica se o jogador utiliza mouse ou teclado para interagir com o jogo.
- **Turma do jogador:** informação fornecida pelo ecossistema, associada aos demais dados para apoiar a análise pedagógica e, quando previsto, a adaptação dos desafios.
- **Nível de dificuldade da trilha:** classificação que orienta o conteúdo dos desafios apresentados.
- **Número de tentativas do desafio:** quantidade de respostas submetidas, corretas ou incorretas.
- **Tempo da tentativa:** intervalo entre o término da contagem regressiva que libera a interação e a submissão de cada resposta, correta ou incorreta. O início de referência permanece o mesmo para as tentativas do desafio.
- **Tempo do desafio:** intervalo entre a liberação da interação e a submissão da resposta correta que conclui o desafio.
- **Número de tentativas da trilha:** soma das tentativas dos desafios da trilha.
- **Tempo da trilha:** soma dos tempos dos desafios da trilha.
- **Desafios concluídos na sessão:** quantidade de desafios concluídos durante a sessão.
- **Trilhas concluídas na sessão:** identificação das trilhas concluídas durante a sessão.
- **Data da sessão:** data associada ao período de uso.
- **Horário de início da sessão:** para a consolidação diária, manter apenas o horário de início da primeira sessão do jogador naquele dia, mesmo que haja sessões posteriores.
- **Horário de fim da sessão:** para a consolidação diária, manter apenas o horário de encerramento da última sessão do jogador naquele dia.

**Observação:** os horários consolidados por dia não representam necessariamente uma sessão contínua. A definição de sessão deve preservar essa distinção ao relacionar seus dados com os totais diários.

## Indicadores específicos por jogo

### 1. Caçadores de Coletivos

**Dados do desafio — escolha e preenchimento de frase (desafios 1, 2 e 5)**

- Qual palavra foi apresentada e qual relação de coletivo é solicitada?
- No desafio de frase, qual enunciado e qual palavra ou lacuna devem ser considerados?
- Qual é a resposta correta?
- Quantas alternativas foram apresentadas, quais são seus conteúdos e em qual ordem aparecem?
- Quais palavras representam indivíduos e quais representam coletivos?

**Dados da tentativa — escolha e preenchimento de frase**

- Qual alternativa o jogador escolheu?
- A resposta está correta? Em caso de erro, qual alternativa foi escolhida em lugar da resposta esperada?

**Dados do desafio — associação (desafio 3)**

- Quais palavras ou categorias foram apresentadas em cada coluna, e em qual ordem?
- Quais são os pares corretos?
- Quais palavras representam indivíduos e quais representam coletivos?

**Dados da tentativa — associação**

- Em qual ordem o jogador selecionou os elementos da primeira coluna?
- Para cada par tentado, quais elementos das duas colunas foram escolhidos?
- A associação está correta? Em caso de erro, qual elemento foi escolhido em lugar do correspondente esperado?

**Dados do desafio — identificação do intruso (desafio 4)**

- Quais palavras foram apresentadas e qual relação o enunciado solicita?
- Quantas alternativas foram apresentadas, quais são seus conteúdos e em qual ordem aparecem?
- Qual é a resposta correta?
- Quais palavras representam indivíduos e quais representam coletivos?

**Dados da tentativa — identificação do intruso**

- Qual alternativa o jogador escolheu?
- A resposta está correta? Em caso de erro, qual alternativa foi escolhida?

**Observações:** A anotação original sobre o desafio 4 aponta a necessidade de revisar a presença de coletivos entre as alternativas. Preservar essa pendência de conteúdo; o roadmap prevê substituir esse desafio por uma segunda associação.

**Unidade e limite:** cada par é uma subunidade; a associação completa conclui um desafio. Registrar a modalidade efetivamente apresentada quando houver substituição por falta de dados.

**Base local:** `Caçadores de Coletivos/main.js`, `utils/challenges.js` e `utils/words.js`.

---

### 2. Enigmas da Esfinge

**Dados do desafio**

- Qual é a trilha, seu tema e a posição do enigma na sequência?
- Qual enunciado foi apresentado? Registrar o texto completo e um identificador do item vinculado à versão do banco.
- Qual é a resposta correta e quais são as alternativas incorretas?
- Quantas alternativas foram apresentadas e em qual ordem foram exibidas após o embaralhamento?
- Qual explicação está associada à resposta correta?
- Quando o enigma foi apresentado e quando a interação ficou disponível?

**Dados da tentativa**

- Qual alternativa o jogador escolheu, considerando seu conteúdo e sua posição na tela?
- A resposta está correta? Em caso de erro, qual alternativa foi escolhida em lugar da resposta esperada?
- Qual é o número da tentativa e quanto tempo decorreu desde a liberação da interação até a escolha?
- Quais alternativas já estavam desabilitadas por erros anteriores e quais ainda estavam disponíveis?
- O jogador acertou na primeira tentativa ou após a eliminação de alternativas?
- Em caso de erro, quando a animação de sucção começou, quando terminou e quando a interação foi liberada novamente?
- Em caso de acerto, quando a explicação foi exibida e quando o jogador acionou o avanço para o próximo enigma ou a conclusão da trilha?
- Houve saída para o mapa, abandono ou reapresentação do enigma? Vincular a nova apresentação ao item original.

**Unidade e limite:** cada escolha aceita pelo jogo é uma tentativa; acertar um enigma conclui um desafio. Cliques em alternativas desabilitadas ou durante o bloqueio de interação não são novas respostas. Separar acerto na primeira tentativa de acerto após eliminação de alternativas. O tempo entre a exibição da explicação e o avanço indica permanência na tela, sem comprovar leitura ou compreensão.

**Observações:** o banco atual contém 12 trilhas de cinco enigmas. Cada enigma oferece uma resposta correta, duas alternativas incorretas e uma explicação. As alternativas são embaralhadas; a escolha incorreta é desabilitada, e a animação de erro bloqueia a interação por aproximadamente 1,7 segundo. O acerto mostra a esfinge feliz e exige avanço manual. Registrar separadamente esses intervalos de feedback e o tempo de interação. A espera de 10 segundos no início e de 3 segundos entre desafios continua sendo uma regra geral proposta neste documento, não um comportamento confirmado desta implementação.

**Base local:** `Canhões de ouro/riddles.js`, `Canhões de ouro/sphinx.js` e a montagem de `SphinxApp` em `Canhões de ouro/main.js`. A pasta e a URL antigas foram preservadas; os requisitos aritméticos legados foram substituídos pelos requisitos da experiência ativa.

---

### 3. Defesa do Castelo Matemático

**Dados do desafio**

- Qual é o valor do primeiro operando?
- Qual é o valor do segundo operando?
- Qual é o resultado da operação e a resposta correta?
- Quantas alternativas foram apresentadas, quais são seus valores e em qual ordem aparecem?

**Dados da tentativa**

- Qual valor o jogador escolheu?
- A resposta está correta?
- Em caso de erro, qual é a diferença numérica entre a resposta escolhida e a resposta correta?

---

### 4. Detetives da Ortografia

**Dados do desafio — escolha e preenchimento de frase (desafios 1, 2 e 5)**

- Qual palavra foi apresentada e qual relação de ortografia é solicitada?
- No desafio de frase, qual enunciado e qual palavra ou lacuna devem ser considerados?
- Qual é a resposta correta?
- Quantas alternativas foram apresentadas, quais são seus conteúdos e em qual ordem aparecem?

**Dados da tentativa — escolha e preenchimento de frase**

- Qual alternativa o jogador escolheu?
- A resposta está correta? Em caso de erro, qual alternativa foi escolhida em lugar da resposta esperada?

**Dados do desafio — associação (desafio 3)**

- Quais palavras ou categorias foram apresentadas em cada coluna, e em qual ordem?
- Quais são os pares corretos?

**Dados da tentativa — associação**

- Em qual ordem o jogador selecionou os elementos da primeira coluna?
- Para cada par tentado, quais elementos das duas colunas foram escolhidos?
- A associação está correta? Em caso de erro, qual elemento foi escolhido em lugar do correspondente esperado?

**Dados do desafio — identificação do intruso (desafio 4)**

- Quais palavras foram apresentadas e qual relação o enunciado solicita?
- Quantas alternativas foram apresentadas, quais são seus conteúdos e em qual ordem aparecem?
- Qual é a resposta correta?

**Dados da tentativa — identificação do intruso**

- Qual alternativa o jogador escolheu?
- A resposta está correta? Em caso de erro, qual alternativa foi escolhida?

**Observações:** A expressão “selecionar coletivo” do texto original foi corrigida para corresponder ao tema de ortografia.

**Unidade e limite:** cada par é uma subunidade; a associação completa conclui um desafio. Registrar a modalidade efetivamente apresentada quando houver substituição por falta de dados.

**Base local:** `Detetives da Ortografia/main.js` e `utils/ortografia.js`.

---

### 5. Digitado

**Dados do desafio**

- Qual palavra foi apresentada?
- Quais caracteres compõem a palavra e quantos são?
- A palavra contém acento? Qual caractere deve ser digitado com acento?

**Dados da tentativa**

- Qual letra o jogador digitou e qual era a letra esperada?
- A letra digitada está correta? Em caso de erro, qual letra foi digitada?
- Quando o caractere esperado é acentuado, o jogador digitou o acento corretamente?

---

### 6. Digite o Resultado

**Dados do desafio**

- Qual é o valor do primeiro operando?
- Qual é o valor do segundo operando?
- Qual é o resultado da operação e a resposta correta?

**Dados da tentativa**

- Qual valor o jogador digitou e submeteu?
- O valor está correto? Em caso de erro, qual valor foi digitado?

---

### 7. Duelo dos Monstros

**Dados do desafio**

- Qual é o valor do primeiro operando?
- Qual é o valor do segundo operando?
- Qual é o resultado da operação e a resposta correta?
- Quantas alternativas foram apresentadas, quais são seus valores e em qual ordem aparecem?

**Dados da tentativa**

- Qual valor o jogador escolheu?
- A resposta está correta?
- Em caso de erro, qual é a diferença numérica entre a resposta escolhida e a resposta correta?

**Observações:** O texto original descreve uma operação e a diferença numérica da resposta; esses requisitos foram preservados como pendência de revisão. O jogo ativo compara dois números por `>`, `<` ou `=`. A coleta deverá registrar a relação escolhida e a esperada, sem calcular diferença numérica entre símbolos.

---

### 8. Escola de Magia VSA

**Dados do desafio — escolha e preenchimento de frase (desafios 1, 2 e 5)**

- Qual palavra foi apresentada e qual relação de classificação gramatical é solicitada?
- No desafio de frase, qual enunciado e qual palavra ou lacuna devem ser considerados?
- Qual é a resposta correta?
- Quantas alternativas foram apresentadas, quais são seus conteúdos e em qual ordem aparecem?
- A qual classe pertence cada palavra: substantivo, verbo ou adjetivo?

**Dados da tentativa — escolha e preenchimento de frase**

- Qual alternativa o jogador escolheu?
- A resposta está correta? Em caso de erro, qual alternativa foi escolhida em lugar da resposta esperada?

**Dados do desafio — associação (desafio 3)**

- Quais palavras ou categorias foram apresentadas em cada coluna, e em qual ordem?
- Quais são os pares corretos?
- A qual classe pertence cada palavra: substantivo, verbo ou adjetivo?

**Dados da tentativa — associação**

- Em qual ordem o jogador selecionou os elementos da primeira coluna?
- Para cada par tentado, quais elementos das duas colunas foram escolhidos?
- A associação está correta? Em caso de erro, qual elemento foi escolhido em lugar do correspondente esperado?

**Dados do desafio — identificação do intruso (desafio 4)**

- Quais palavras foram apresentadas e qual relação o enunciado solicita?
- Quantas alternativas foram apresentadas, quais são seus conteúdos e em qual ordem aparecem?
- Qual é a resposta correta?
- A qual classe pertence cada palavra: substantivo, verbo ou adjetivo?

**Dados da tentativa — identificação do intruso**

- Qual alternativa o jogador escolheu?
- A resposta está correta? Em caso de erro, qual alternativa foi escolhida?

**Observações:** Verificar se a classe gramatical de cada palavra está contemplada nos dados usados pelo sistema. Referências a coletivos foram corrigidas para classes gramaticais.

**Unidade e limite:** cada par é uma subunidade; a associação completa conclui um desafio. Registrar a modalidade efetivamente apresentada quando houver substituição por falta de dados.

**Base local:** `Escola de Magia VSA/main.js` e `utils/gramatica.js`.

---

### 9. Fábrica de Rimas

**Dados do desafio — escolha e preenchimento de frase (desafios 1, 2 e 5)**

- Qual palavra foi apresentada e qual relação de rima é solicitada?
- No desafio de frase, qual enunciado e qual palavra ou lacuna devem ser considerados?
- Qual é a resposta correta?
- Quantas alternativas foram apresentadas, quais são seus conteúdos e em qual ordem aparecem?

**Dados da tentativa — escolha e preenchimento de frase**

- Qual alternativa o jogador escolheu?
- A resposta está correta? Em caso de erro, qual alternativa foi escolhida em lugar da resposta esperada?

**Dados do desafio — associação (desafio 3)**

- Quais palavras ou categorias foram apresentadas em cada coluna, e em qual ordem?
- Quais são os pares corretos?

**Dados da tentativa — associação**

- Em qual ordem o jogador selecionou os elementos da primeira coluna?
- Para cada par tentado, quais elementos das duas colunas foram escolhidos?
- A associação está correta? Em caso de erro, qual elemento foi escolhido em lugar do correspondente esperado?

**Dados do desafio — identificação do intruso (desafio 4)**

- Quais palavras foram apresentadas e qual relação o enunciado solicita?
- Quantas alternativas foram apresentadas, quais são seus conteúdos e em qual ordem aparecem?
- Qual é a resposta correta?

**Dados da tentativa — identificação do intruso**

- Qual alternativa o jogador escolheu?
- A resposta está correta? Em caso de erro, qual alternativa foi escolhida?

**Observações:** Revisar itens com mais de uma alternativa linguisticamente válida: a anotação original cita CEDO com opções MEDO e DEDO. A anotação sobre o desafio 4 também aponta palavras sem relação direta com a proposta; verificar a coerência sonora do grupo e do intruso antes de avaliar respostas.

**Unidade e limite:** cada par é uma subunidade; a associação completa conclui um desafio. Registrar a modalidade efetivamente apresentada quando houver substituição por falta de dados.

**Base local:** `Fábrica de Rimas/main.js`, `utils/challenges.js` e `utils/words.js`.

---

### 10. Fábrica de Acentos

**Dados do desafio**

- Qual palavra foi apresentada e quais caracteres a compõem?
- Qual caractere recebe o sinal e em qual posição da palavra?
- Qual é o sinal correto?

**Dados da tentativa**

- Qual sinal o jogador selecionou?
- O sinal está correto? Em caso de erro, qual sinal foi escolhido em lugar do esperado?

---

### 11. Galáxia Geométrica

**Dados do desafio — reconhecimento (desafios 1–3)**

- Qual figura deve ser reconhecida? Registrar identificador e nome.
- Quais figuras foram oferecidas, em que ordem, com quais cores e orientações?
- Qual alternativa é correta e quantas alternativas foram apresentadas?
- Qual é o repertório de figuras liberado na trilha?

**Dados da tentativa — reconhecimento**

- Qual figura o jogador selecionou e qual confirmou? A seleção anterior à confirmação é exploratória.
- A resposta confirmada está correta? Se não, qual figura foi confundida com o alvo?
- Qual foi o tempo até cada confirmação e quantas confirmações ocorreram até o acerto?

**Dados do desafio — pilotagem (desafios 4–5)**

- Quais figuras-alvo foram sorteadas, em qual ordem e em quais contagens o alvo muda?
- Qual a meta de coletas, velocidade e frequência de surgimento dos objetos?
- Quais objetos efetivamente surgiram, seus identificadores e o alvo vigente em cada surgimento?

**Dados da tentativa — pilotagem**

- Qual figura foi tocada pela nave, em qual alvo vigente e contagem de coletas?
- A coleta foi correta? Qual a contagem e a pontuação antes/depois do contato?
- Quais figuras passaram sem contato? Registrar como não coletadas, separadas de colisões incorretas.
- Houve pausa manual, perda de foco, troca automática de alvo, retomada ou abandono? Quais durações?
- Quantas coletas corretas e incorretas ocorreram antes da conclusão do voo?

**Unidade e limite:** cada confirmação ou coleta é uma subunidade. Um voo concluído é um desafio, não dez desafios. A pontuação é fixa (+100/−50); a pausa da simulação não garante desconto no tempo compartilhado de estrelas.

**Base local:** `Galáxia da Matemática/geometry-core.js`, `geometry.js` e `geometry-score.js`; o `main.js` aritmético antigo não é carregado.

---

### 12. Galáxia dos Opostos

**Dados do desafio — escolha e preenchimento de frase (desafios 1, 2 e 5)**

- Qual palavra foi apresentada e qual relação de oposição de significado é solicitada?
- No desafio de frase, qual enunciado e qual palavra ou lacuna devem ser considerados?
- Qual é a resposta correta?
- Quantas alternativas foram apresentadas, quais são seus conteúdos e em qual ordem aparecem?

**Dados da tentativa — escolha e preenchimento de frase**

- Qual alternativa o jogador escolheu?
- A resposta está correta? Em caso de erro, qual alternativa foi escolhida em lugar da resposta esperada?

**Dados do desafio — associação (desafio 3)**

- Quais palavras ou categorias foram apresentadas em cada coluna, e em qual ordem?
- Quais são os pares corretos?

**Dados da tentativa — associação**

- Em qual ordem o jogador selecionou os elementos da primeira coluna?
- Para cada par tentado, quais elementos das duas colunas foram escolhidos?
- A associação está correta? Em caso de erro, qual elemento foi escolhido em lugar do correspondente esperado?

**Dados do desafio — escolha adicional (desafio 4)**

- Quais palavras foram apresentadas e qual relação o enunciado solicita?
- Quantas alternativas foram apresentadas, quais são seus conteúdos e em qual ordem aparecem?
- Qual é a resposta correta?

**Dados da tentativa — escolha adicional**

- Qual alternativa o jogador escolheu?
- A resposta está correta? Em caso de erro, qual alternativa foi escolhida?

**Observações:** O requisito original do desafio 4 descrevia um intruso. No gerador ativo, essa modalidade é substituída por uma escolha adicional de antônimo. Registrar a modalidade efetiva; referências a coletivos ou classes gramaticais foram corrigidas para relações entre antônimos.

**Unidade e limite:** cada par é uma subunidade; a associação completa conclui um desafio. Registrar a modalidade efetivamente apresentada quando houver substituição por falta de dados.

**Base local:** `Galaxia dos Opostos/main.js`, `utils/challenges.js` e `utils/words.js`.

---

### 13. Laboratório das Poções

**Dados do desafio**

- Qual o tabuleiro inicial? Registrar a sequência de cores de cada frasco, com convenção explícita de fundo para topo.
- Qual a capacidade dos frascos, quantidade de cores e quantidade de frascos vazios?
- Quais parâmetros de geração foram utilizados e quais condições definem uma solução válida?
- Quais símbolos identificam as cores além da apresentação visual?

**Dados da tentativa**

- Quais frascos foram escolhidos como origem e destino? Qual cor e quantidade seriam transferidas?
- Qual o estado antes e depois da transferência e o número de movimentos acumulado?
- A transferência foi válida? Se não, qual a causa: origem vazia, destino cheio, mesma origem/destino ou cor incompatível?
- Houve cancelamento de seleção, desfazer ou reiniciar? Qual movimento/estado foi restaurado?
- O tabuleiro foi resolvido? Quantos movimentos, tentativas inválidas, desfazimentos e reinícios ocorreram?

**Unidade e limite:** a tentativa é a transferência origem→destino; selecionar um frasco sozinho não é resposta. Resolver um tabuleiro conclui um desafio. Movimento inválido atualmente não chama `HY.score.wrong()`; contar esses eventos exige instrumentação própria.

**Base local:** `Laboratorio das Pocoes/color-sort.js`; a versão aritmética em `main.js` está inativa.

---

### 14. Maiúsculo vs Minúsculo

**Dados do desafio**

- Qual letra-alvo foi apresentada e em qual forma: maiúscula ou minúscula?
- Qual é a direção da correspondência solicitada e sua resposta correta?
- Quais alternativas e distratores foram apresentados, em qual ordem?
- Qual o modo de entrada e a representação gráfica efetivamente utilizada?

**Dados da tentativa**

- Qual letra foi escolhida ou solta na área de resposta?
- A correspondência está correta? Qual par alvo→resposta registra a confusão?
- Quais opções já tinham sido desabilitadas por erro nesta tentativa?
- Quantas respostas foram submetidas e quanto tempo decorreu até cada uma?

**Base local:** `Maisculo vs Minusculo/main.js` e `utils/letters.js`. A sequência de letras das trilhas é fixa no código atual.

---

### 15. Matemática Pirata

**Dados do desafio**

- Quais são os operandos, operador e resultado da igualdade completa?
- Qual termo está oculto: primeiro operando, segundo operando ou resultado?
- Qual o valor correto do termo oculto e quais alternativas foram apresentadas?
- Quais apoios visuais de quantidade foram exibidos e qual critério sorteou a conta?

**Dados da tentativa**

- Qual valor foi escolhido por clique ou arrastar? A resposta está correta para o termo oculto?
- Se incorreta, qual a diferença assinada entre a resposta e o valor correto?
- Quais alternativas já estavam eliminadas e quantas tentativas ocorreram?
- Quando começou o feedback de navio/barril e quando a próxima interação ficou disponível?

**Base local:** `Matematica Pirata/main.js`, `cannon-feedback.js` e `utils/rand.js`. Registrar os itens sorteados, não o array legado preservado.

---

### 16. Mercado Alien

**Dados do desafio**

- Quais valores ou expressões apareceram à esquerda e à direita?
- Quais os valores numéricos avaliados de cada lado e a relação correta (`>`, `<` ou `=`)?
- Quais símbolos/opções foram oferecidos e quais apoios visuais ou modo estavam ativos?
- Qual prazo, quantidade de escudos e parâmetros de geração estavam configurados?

**Dados da tentativa**

- Qual relação o jogador escolheu? A relação está correta?
- Qual confusão ocorreu entre maior, menor e igualdade?
- A tentativa ocorreu dentro do prazo? Houve expiração sem resposta?
- Quantos escudos havia antes/depois e qual evento causou a perda?

**Unidade e limite:** uma comparação é uma resposta. Registrar expressão exibida e valores reais permite separar cálculo de comparação; perder escudo não identifica sozinho a causa do erro.

**Base local:** `Mercado Alien/main.js`.

---

### 17. Mercado Maior ou Menor

**Dados do desafio**

- Qual comando foi dado: escolher o maior ou o menor?
- Quais objetos, identificadores e valores de tamanho foram apresentados, em qual ordem?
- Qual objeto é a resposta correta e quantas alternativas existem?
- Quais dimensões visuais foram renderizadas para cada objeto?

**Dados da tentativa**

- Qual objeto e valor de tamanho o jogador escolheu?
- A escolha atende ao comando? Foi escolhido o extremo contrário ou um valor intermediário?
- Qual a diferença entre o tamanho escolhido e o tamanho esperado?
- Quantas escolhas foram confirmadas antes do acerto?

**Base local:** `Mercado Maior ou Menor/main.js`. A comparação é de tamanho visual, não de preço ou massa.

---

### 18. Organiza Tudo

**Dados do desafio**

- Qual conjunto e critério de classificação estão ativos: cor, forma ou categoria temática?
- Quais objetos foram apresentados e a qual caixa cada um pertence?
- Quais caixas, rótulos e categorias foram oferecidos?
- Qual a ordem inicial dos objetos e quantos precisam ser classificados?

**Dados da tentativa**

- Qual objeto foi movido para qual caixa, por clique ou arrastar?
- A categoria escolhida está correta? Registrar categoria esperada e caixa escolhida.
- Quantas tentativas ocorreram por objeto e quais objetos já estavam classificados?
- O conjunto foi concluído? Quantos objetos foram classificados na primeira tentativa?

**Unidade e limite:** uma colocação é uma tentativa; a classificação de todos os objetos conclui o conjunto. O banco atual tem seis conjuntos de nove objetos para uma grade de 12 trilhas; ausência de conjunto é falha de conteúdo.

**Base local:** `Organiza Tudo/main.js`.

---

### 19. Piratas do Troco

**Dados do desafio**

- Qual o total de moedas disponível, custo a pagar e restante correto?
- Qual a fase do procedimento: pagamento ou guardar o restante no baú?
- Quais moedas e contadores foram exibidos? O restante já estava visível?

**Dados da tentativa**

- Qual moeda foi selecionada e para qual destino se tentou movê-la?
- A ação foi permitida? Registrar motivo de bloqueio separadamente de erro de cálculo.
- Quantas moedas foram pagas e guardadas antes/depois da ação?
- Quando o pagamento foi completado e quando todas as moedas restantes chegaram ao baú?
- Quanto tempo e quantas ações ocorreram em cada etapa?

**Unidade e limite:** não há submissão numérica livre de troco no fluxo atual. A telemetria registra distribuição de moedas; conclusão e ausência de penalidade não demonstram cálculo mental independente.

**Base local:** `Piratas do Troco/main.js`.

---

### 20. Sinônimos

**Dados do desafio**

- Qual modalidade efetiva foi gerada: escolha, associação, intruso ou completar frase?
- Quais palavras e, quando houver, frase e palavra destacada foram apresentadas?
- Qual relação de sinonímia o gabarito utiliza e quais respostas são aceitas pelo item?
- Quais alternativas, pares ou grupos foram apresentados, em qual ordem?
- Houve fallback de modalidade? Qual item e metadado deram origem ao desafio?

**Dados da tentativa**

- Qual alternativa foi escolhida ou qual par de palavras foi associado?
- A resposta corresponde ao gabarito? Registrar resposta esperada e escolhida.
- Nas associações, qual a ordem de seleção, quais pares foram tentados e quais já estavam resolvidos?
- Quantas tentativas ocorreram por escolha/par e quantas alternativas já estavam eliminadas?
- A frase ou conjunto de pares foi concluído?

**Unidade e limite:** registrar cada par separadamente da conclusão da associação. O gabarito único e o intruso baseado em metadado ausente precisam de revisão semântica antes de fundamentar avaliação.

**Base local:** `Sinonimos/main.js`, `utils/challenges.js` e `utils/words.js`.

---

### 21. Trem da Soma e Subtração

**Dados do desafio**

- Quais operandos, operação e resultado completo foram sorteados?
- Qual valor deve preencher o vagão e quais alternativas estão disponíveis?
- Qual critério de dificuldade, apoio visual e prazo foram utilizados?
- Quantos itens válidos foram realmente sorteados para a trilha?

**Dados da tentativa**

- Qual vagão/valor o jogador escolheu e a resposta está correta?
- Se incorreta, qual a diferença assinada em relação à resposta correta?
- Quantas tentativas e quanto tempo restava em cada submissão?
- Houve expiração, reinício ou conta ausente? Registrar eventos separados.

**Base local:** `Trem da Soma e Subtracao/main.js` e `utils/rand.js`. O jogo ativo continua aritmético; palavras cruzadas são planejamento.

---

### 22. Monster Typer I

**Dados do desafio**

- Qual letra-alvo, palavra-modelo e emoji foram apresentados?
- Qual modo de caixa estava ativo e qual tecla corresponde à resposta esperada?
- Qual prazo de resposta foi configurado?

**Dados da tentativa**

- Qual tecla válida o jogador digitou e qual foi seu valor após a normalização usada pelo jogo?
- A tecla corresponde à letra-alvo? Se não, qual letra foi confundida?
- Quanto tempo decorreu até cada tecla e até a primeira tecla correta?
- Houve expiração ou reapresentação da palavra? Quantas?

**Unidade e limite:** o desafio exige uma letra inicial, não a palavra completa. Teclas de controle ignoradas pela validação não devem ser contadas como erro pedagógico.

**Base local:** `monster_typer I/main.js`.

---

### 23. Monster Typer II

**Dados do desafio**

- Qual palavra-modelo foi apresentada, sua extensão e sequência de caracteres?
- Qual prazo e posição inicial de digitação estavam ativos?
- A grafia do banco está revisada? Quais acentos seriam esperados na grafia convencional?

**Dados da tentativa**

- Qual posição estava sendo preenchida, qual caractere era esperado e qual tecla foi digitada?
- A letra foi aceita? Qual posição e trecho já haviam sido completados?
- Qual o tempo entre início/reapresentação e cada tentativa de letra?
- Houve expiração e reinício da mesma palavra? Registrar nova apresentação ligada ao item original.
- A palavra foi concluída sem erro e sem reinício ou após correções?

**Unidade e limite:** a tentativa é por letra e a conclusão por palavra. Preservar a grafia efetivamente usada para distinguir erro do jogador de erro do banco (`MACA`, `BALAO`, `AGUA`).

**Base local:** `monster_typer II/main.js`.

---

### 24. Sílabas

**Dados do desafio**

- Qual palavra e emoji foram apresentados? A palavra inteira estava visível como apoio?
- Quais blocos silábicos, identificadores e ordem embaralhada foram oferecidos?
- Qual a sequência correta, quantidade de sílabas e posições a preencher?
- Qual a estrutura silábica real do item, além da dificuldade nominal da trilha?

**Dados da tentativa**

- Qual bloco foi escolhido e para qual posição foi enviado?
- A colocação corresponde à sílaba esperada nessa posição?
- Houve retirada, reposição, cancelamento ou tentativa incorreta? Em qual posição?
- Em qual ordem as posições foram preenchidas e quantas tentativas ocorreram por bloco?
- A palavra foi montada corretamente e com quantas colocações incorretas?

**Unidade e limite:** colocação de bloco é subunidade; palavra montada conclui um desafio. O percurso atual de 60 itens não alcança a progressão prometida para três/quatro sílabas.

**Base local:** `syllables/main.js` e `utils/words.js`.

---

### 25. Vogais

**Dados do desafio**

- Qual palavra foi representada por prefixo, lacuna, sufixo e emoji?
- Qual vogal completa a lacuna e qual sua posição na palavra?
- Quais botões/teclas de resposta estavam disponíveis e qual modo de caixa estava ativo?
- O item existe e é válido para o índice solicitado pela trilha?

**Dados da tentativa**

- Qual vogal foi escolhida por botão ou teclado?
- A resposta está correta? Registrar vogal esperada e escolhida.
- Quantas respostas válidas foram submetidas antes do acerto e quais tempos?
- Houve abandono ou falha por item ausente? Distinguir da resposta errada.

**Base local:** `vowel/vowel.html`, `vowel/main.js` e `utils/words.js`. O banco atual tem 39 itens; posição sem conteúdo não gera tentativa pedagógica.

---

### 26. Mapa da Ilha do Tesouro

**Dados do desafio — coordenadas**

- Qual a dimensão da malha, seus rótulos de linhas/colunas e os ícones nas células?
- Qual ícone/célula é o alvo e qual a coordenada correta?
- Qual componente da coordenada ficou em branco: letra da linha ou número da coluna?
- Quais pistas e elementos decorativos foram apresentados?

**Dados da tentativa — coordenadas**

- Qual célula o jogador selecionou e qual componente digitou?
- A localização e o preenchimento estão corretos? Registrar linha e coluna separadamente.
- Qual a diferença entre posição escolhida e alvo? Houve troca dos referenciais?

**Dados do desafio — rota**

- Qual malha, ponto inicial, sequência de direções e comprimentos dos segmentos foram apresentados?
- Qual percurso e destino corretos e quais ícones de resposta foram oferecidos?

**Dados da tentativa — rota**

- Qual ícone de destino foi escolhido e a resposta está correta?
- Quantas escolhas ocorreram e quais alternativas estavam eliminadas?

**Unidade e limite:** localizar uma coordenada e inferir destino de rota são modalidades distintas; registrar a modalidade de cada desafio.

**Base local:** `Mapa da Ilha do Tesouro/main.js`.

---

### 27. Espelho Mágico

**Dados do desafio**

- Qual figura/matriz de cores original, eixo de reflexão e imagem correta?
- Qual modalidade: escolher o reflexo ou completar uma imagem?
- Nas escolhas, quais alternativas, transformações e ordem foram apresentadas?
- No preenchimento, quais células já estavam dadas, quais faltavam e qual proporção real de pistas?

**Dados da tentativa**

- Qual alternativa foi escolhida ou qual cor foi aplicada a qual célula?
- A escolha corresponde à reflexão correta? No preenchimento, qual era a cor esperada?
- Houve revisão de célula ou escolha de um reflexo em eixo incorreto?
- Quantas ações e respostas incorretas ocorreram por célula e até completar a imagem?

**Unidade e limite:** distinguir escolha de figura, colocação de cor e conclusão da matriz; seleção de cor sem destino é ação exploratória.

**Base local:** `Espelho Magico/main.js`.

---

### 28. Gráfico em Ação

**Dados do desafio**

- Qual cena foi gerada: objetos, tipos, cores e total de itens?
- Quais categorias e frequências corretas por tipo e por cor?
- Quais painéis, representação gráfica, orientação, escala e valores permitidos foram apresentados?
- Qual configuração inicial de cada categoria/campo e qual relação há entre os painéis?

**Dados da tentativa**

- Qual categoria de qual painel foi alterada, de qual valor para qual valor?
- Qual conjunto de frequências estava preenchido no momento da verificação?
- Quais frequências estavam corretas e quais diferenças assinadas/absolutas em relação ao gabarito?
- A soma informada corresponde ao total da cena? Os dois painéis foram completados?
- Quantas alterações e verificações ocorreram até a solução?

**Unidade e limite:** ajustes exploratórios não equivalem a submissões. Registrar resultados por categoria e a verificação global. O modo de linhas usa categorias; não presumir tarefa de tendência temporal.

**Base local:** `Grafico em Acao/main.js`.

---

### 29. Qual é o próximo

**Dados do desafio**

- Qual figura-base/matriz de cores e sequência de orientações foram apresentadas?
- Qual a regra de giro (90°/180°), sentido e quantidade de figuras visíveis?
- Qual figura/orientação continua corretamente a sequência?
- Quais alternativas e transformações dos distratores foram oferecidas, em qual ordem?

**Dados da tentativa**

- Qual alternativa foi escolhida e qual transformação ela representa?
- A resposta está correta? Foi escolhido reflexo, giro excedente ou outro distrator?
- Qual o tempo e número de escolhas até o acerto?

**Base local:** `Qual e o proximo/main.js`. Registrar a figura real, pois sua simetria pode alterar a dificuldade.

---

### 30. Fábrica das Formas

**Dados do desafio**

- Qual cadeia de figuras foi apresentada, com forma, cor e tamanho de cada estado?
- Quais transições/lacunas precisam de comandos e quais atributos mudam em cada uma?
- Quais cartões de comando foram oferecidos e quais combinações resolvem cada lacuna?
- Quantas transições envolvem apenas um atributo ou cor e tamanho simultaneamente?

**Dados da tentativa**

- Qual cartão foi colocado em qual lacuna e quais comandos já estavam nela?
- A ação é compatível com a transformação? Qual atributo foi omitido ou alterado indevidamente?
- Houve retirada, substituição ou cancelamento de cartão?
- Quando cada lacuna e a cadeia inteira foram concluídas? Quantas tentativas por transição?

**Unidade e limite:** cartão é ação parcial; uma lacuna com duas mudanças pode exigir mais de um comando. Registrar combinação inteira para comparar transições.

**Base local:** `Fabrica das Formas/main.js`.

---

### 31. Que horas são

**Dados do desafio**

- Qual horário correto, modalidade e granularidade: hora inteira, meia hora, quarto ou minuto livre?
- No posicionamento, qual horário numérico foi mostrado e quais posições iniciais dos ponteiros?
- Na leitura, quais posições do relógio foram apresentadas e quais campos devem ser digitados?
- Qual convenção de 12 horas e precisão/tolerância efetivamente usada pela validação?

**Dados da tentativa**

- Qual ponteiro foi manipulado e qual posição foi confirmada? Ou quais valores foram digitados para hora e minuto?
- Hora e minuto estão corretos separadamente? Qual diferença em minutos na representação confirmada?
- Houve troca aparente entre funções dos ponteiros ou revisão de campos?
- Quantas verificações ocorreram até o horário completo correto?

**Unidade e limite:** manipulação contínua é exploração; a submissão é a verificação do horário. Registrar ambos os componentes sem transformar cada deslocamento do ponteiro em erro.

**Base local:** `Que horas sao/main.js`.

---

### 32. Complete a Cobra

**Dados do desafio**

- Qual ciclo de cores foi sorteado e qual sua ordem?
- Qual percurso da cobra, quantidade de células, malha e cores inicialmente dadas?
- Qual cor é correta em cada posição do percurso e quais opções foram oferecidas?

**Dados da tentativa**

- Qual posição recebeu qual cor e qual era a cor esperada?
- A resposta está correta? Qual posição no ciclo e direção do percurso estavam envolvidas?
- Houve correção, cancelamento ou repetição de escolha?
- Quantas colocações corretas/incorretas e quanto tempo até completar a cobra?

**Unidade e limite:** célula é subunidade; cobra completa conclui o desafio. Distinguir erro na regra de repetição de dificuldades em seguir visualmente o percurso.

**Base local:** `Complete a Cobra/main.js`.

---

### 33. Sudoku Mágico

**Dados do desafio**

- Qual tabuleiro inicial, dimensão, regiões e conjunto de símbolos foram gerados?
- Quais células são pistas e quais são preenchíveis? Quantas pistas reais existem?
- Qual solução de referência e quais regras de linha, coluna e região se aplicam?
- Qual correspondência entre símbolos visuais e identificadores internos?

**Dados da tentativa**

- Qual símbolo foi colocado em qual linha/coluna e qual o estado anterior do tabuleiro?
- A colocação foi aceita pelo gabarito ativo? Qual símbolo era esperado?
- A jogada viola linha, coluna ou região? Registrar todas as restrições aplicáveis, separadas do resultado do gabarito.
- Houve revisão/cancelamento e quantas tentativas ocorreram por célula?
- Quando todas as células foram preenchidas corretamente?

**Unidade e limite:** uma colocação em célula preenchível é tentativa; selecionar um símbolo é exploração. A validação atual compara com `solutionIdx`; classificar violações exige cálculo adicional sobre o tabuleiro.

**Base local:** `Sudoku Magico/main.js`.

---

### 34. Combinando Sorvete

**Dados do desafio**

- Quais sabores foram oferecidos, sua quantidade e as duas posições de bola em cada cone?
- Qual conjunto completo de pares válidos e seu total?
- Qual configuração inicial de cones e quais pistas de quantidade estão visíveis?
- Qual regra de equivalência de pares: repetição permitida e ordem das bolas irrelevante?

**Dados da tentativa**

- Quais sabores foram colocados em qual cone e qual par completo resultou?
- O par é válido e novo? Repete um par idêntico ou inverte a ordem de um par já usado?
- Houve retirada/substituição de bola? Qual o conjunto de pares válidos encontrado após a ação?
- Quantos pares distintos foram encontrados e quantas duplicações ocorreram até a conclusão?

**Unidade e limite:** colocação de bola é ação parcial; avaliar combinação quando houver duas bolas. Registrar o par sem ordem e a ordem escolhida permite identificar duplicação por inversão.

**Base local:** `Combinando Sorvete/main.js`.

---

### 35. Mercado Matemágico

**Dados do desafio — compras (desafios 1–3)**

- Quais produtos, identificadores e preços foram apresentados? Registrar valores inteiros em centavos.
- Qual saldo inicial, quantidade-alvo de produtos e configurações de preço inteiro/decimal?
- Quais condições simultâneas tornam o plano de compra válido?

**Dados da tentativa — compras**

- Quais produtos foram adicionados/retirados e qual saldo após cada alteração?
- Qual cesta, custo total e saldo foram submetidos à verificação?
- A quantidade-alvo foi atendida e o saldo ficou não negativo? Qual condição falhou?

**Dados do desafio — tabela de troco (desafios 4–5)**

- Qual catálogo, combinação de produtos, preço total, pagamento e troco corretos por linha?
- Qual campo ficou oculto em cada linha: recebido ou troco?

**Dados da tentativa — tabela de troco**

- Qual texto foi digitado, qual valor em centavos foi interpretado e qual campo/linha foi verificado?
- O valor está correto? É entrada inválida ou erro monetário? Qual diferença em centavos?
- Quais linhas estão corretas e quantas verificações ocorreram até completar a tabela?

**Unidade e limite:** movimentar produto é exploração; a verificação submete um plano. Na tabela, registrar resultado por campo e conclusão conjunta, sem duplicar contagem de desafios.

**Base local:** `Mercado Matematico/main.js`.

---

### 36. O Caminho Mais Rápido

**Dados do desafio**

- Qual rede efetiva: identificadores/posições dos nós e conexões permitidas?
- Qual modalidade: rota individual ou rotas de vários personagens com ponto comum?
- Quais pontos iniciais, casas de destino e número real de personagens?
- Qual número mínimo de conexões por rota e quais restrições do ponto comum e das rotas?
- Qual nó comum correto e quais rotas de referência ou condições de validade?

**Dados da tentativa**

- Qual personagem foi selecionado e qual sequência de nós compõe sua rota?
- Houve seleção de nó não adjacente, retorno, reinício ou troca de personagem?
- Quais rotas e letra do ponto comum foram submetidas à verificação?
- Cada rota chega ao destino e atende ao mínimo? Qual excesso de conexões?
- O ponto comum está correto e as condições conjuntas foram atendidas?

**Unidade e limite:** clique em nó é ação de construção; verificar rota/conjunto é submissão. O mínimo usa quantidade de conexões, não distância visual. Registrar eventual redução do número de personagens pelo gerador.

**Base local:** `O Caminho Mais Rapido/main.js`.

---

### 37. Balança da Descoberta

**Dados do desafio**

- Quais objetos, identificadores e valores foram apresentados nos pratos?
- Qual peso está oculto, quais dois valores conhecidos determinam seu total e qual a resposta correta?
- Quais valores distratores e apoios visuais foram mostrados?
- Qual a faixa real de valores do item gerado?

**Dados da tentativa**

- Qual peso foi digitado e confirmado? A entrada numérica é válida?
- A resposta corresponde ao peso oculto? Qual diferença assinada em relação ao correto?
- Qual feedback/inclinação foi exibido e quantos palpites ocorreram até o acerto?
- Houve alteração do palpite após feedback ou abandono?

**Unidade e limite:** documentar a modalidade ativa “Descubra o Peso”. Não coletar como se o jogador precisasse distribuir pesos na mecânica legada inativa.

**Base local:** `Balanca da Descoberta/main.js` (`loadWeightChallenge`, `verifyWeightGuess`).

---

### 38. Complete a Sequência

**Dados do desafio**

- Qual sequência completa de termos foi gerada e quais posições ficaram em branco?
- Qual valor inicial, ciclo de passos, sinais e regra definem os termos?
- Qual o valor correto de cada lacuna e quais termos permaneceram visíveis?
- Qual quantidade real de lacunas e magnitude dos passos?

**Dados da tentativa**

- Quais valores foram digitados e submetidos em cada posição?
- Cada lacuna está correta? Qual a diferença assinada entre valor informado e esperado?
- A entrada é inválida, vazia ou numérica incorreta?
- Quais lacunas foram revisadas entre verificações e quando o conjunto ficou correto?

**Unidade e limite:** registrar campos individualmente e a submissão conjunta. Classificar resposta como compatível com erro de sinal/ciclo é hipótese derivada, não prova da estratégia mental do aluno.

**Base local:** `Complete a Sequencia/main.js`.

---

### 39. Contando as Patas

**Dados do desafio**

- Qual animal foi apresentado na pergunta individual e qual quantidade de patas o banco atribui a ele?
- Qual espécie aparece no grupo, quantos animais existem e quantas patas cada um tem segundo o gabarito?
- Qual total correto do grupo e quais dois campos devem ser preenchidos?
- Animal individual e espécie do grupo são iguais ou diferentes?

**Dados da tentativa**

- Quais respostas foram submetidas para quantidade individual e total do grupo?
- Cada campo está correto separadamente? Qual diferença numérica em cada um?
- Houve entrada inválida, revisão de um campo ou reapresentação?
- Quantas verificações ocorreram até os dois campos corretos?

**Unidade e limite:** os dois campos são verificados juntos, mas precisam de resultados separados. Registrar espécie e gabarito para não atribuir ao aluno erros conceituais do banco, como tratar braços do polvo como patas.

**Base local:** `Contando as Patas/main.js`.

---

### 40. Qual é o Grupo?

**Dados do desafio**

- Qual tema, quantidade de círculos, rótulos e critérios de pertencimento foram apresentados?
- Quais objetos foram sorteados e qual vetor de pertencimento de cada um?
- Qual região correta por objeto: grupo exclusivo, interseção dupla/tripla ou exterior?
- Qual geometria dos círculos e quantidade real de itens, incluindo itens que não pertencem a nenhum grupo?

**Dados da tentativa**

- Qual objeto foi colocado em qual posição e qual vetor de pertencimento resulta dessa posição?
- Na verificação, o objeto estava colocado ou ainda na bandeja?
- O vetor escolhido corresponde ao esperado? Quais atributos foram acrescentados ou omitidos?
- Houve reposicionamento e qual proximidade da soltura às bordas dos círculos?
- Quais objetos estavam corretos em cada verificação e quando o diagrama inteiro foi concluído?

**Unidade e limite:** arrastar/selecionar é ação de construção; a verificação avalia o conjunto. Não confundir objeto ainda não colocado com objeto intencionalmente colocado no exterior. Proximidade à borda ajuda a distinguir erro de gesto de interpretação.

**Base local:** `Qual e o Grupo/main.js` (`computeRegion`, `verifyDiagram`).
