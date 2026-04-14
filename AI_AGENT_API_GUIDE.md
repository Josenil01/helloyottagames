# Guia de Integração para Agente de IA

Este guia ensina um agente de IA a se conectar na API pública da plataforma Hello Yotta Games e consumir os dados de catálogo.

## Base da API

- Domínio público: https://games.helloyotta.com
- Endpoint de catálogo completo: https://games.helloyotta.com/api/games.json
- Endpoint agrupado por categoria: https://games.helloyotta.com/api/games-by-category.json
- Método HTTP: GET
- Autenticação: não precisa
- Formato de resposta: application/json

## Fluxo recomendado de consumo

1. Buscar https://games.helloyotta.com/api/games.json.
2. Validar se os campos de topo existem: version, generatedAt, total, games.
3. Validar se games é lista e se total bate com o tamanho da lista.
4. Para cada jogo, ler: slug, title, description, icon, href, url, categories.
5. Se precisar navegar por tema, usar também https://games.helloyotta.com/api/games-by-category.json.

## Contrato esperado de games.json

Objeto raiz:
- version: string
- generatedAt: string (data UTC em ISO)
- total: número de jogos
- games: lista de jogos

Cada item em games:
- slug: identificador estável do jogo
- title: nome público do jogo
- description: descrição curta
- icon: emoji do jogo
- href: caminho relativo dentro do site
- url: URL absoluta do jogo
- categories: lista de categorias, por exemplo portugues, matematica, logica, novos

## Contrato esperado de games-by-category.json

Objeto raiz:
- version: string
- generatedAt: string
- totalCategories: número de categorias
- totalGames: número total de jogos
- categories: lista de grupos

Cada item em categories:
- slug: categoria
- total: quantidade de jogos naquela categoria
- games: lista de jogos completos (mesmo formato de games.json)

## Regras de robustez para o agente

- Se a requisição falhar, tentar novamente até 3 vezes com backoff curto.
- Se total não bater com o tamanho da lista, considerar resposta inconsistente e registrar aviso.
- Se algum jogo vier sem url, montar URL a partir de https://games.helloyotta.com + href.
- Tratar acentos e emojis em UTF-8.
- Não assumir ordem fixa dos itens.

## Exemplo de estratégia para perguntas do usuário final

Objetivo: "me mostre jogos de matemática"

Passos:
1. Ler games-by-category.json.
2. Localizar categoria com slug matematica.
3. Retornar title, description, icon e url de cada jogo encontrado.

Objetivo: "quais são os jogos novos"

Passos:
1. Ler games-by-category.json.
2. Localizar categoria com slug novos.
3. Retornar a lista completa com links.

## Exemplo de resposta que o agente pode montar

Para cada jogo:
- Nome: title
- Ícone: icon
- Descrição: description
- Link: url
- Categorias: categories

## Fonte dos dados

- Catálogo base: index.html da plataforma
- Arquivo gerado de catálogo: api/games.json
- Arquivo gerado por categoria: api/games-by-category.json
- Gerador automático: scripts/generate-games-api.ps1

## Atualização dos dados

Quando novos jogos forem adicionados ao catálogo, execute o gerador da API para atualizar os arquivos JSON:

powershell -ExecutionPolicy Bypass -File ./scripts/generate-games-api.ps1

Depois da atualização, o agente já pode consumir os novos jogos sem alteração no código de leitura.
