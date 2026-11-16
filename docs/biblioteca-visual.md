# Biblioteca visual dos jogos

Atualização: 30/10/2026.

Os 40 jogos e o catálogo carregam uma camada visual compartilhada. Cada card recebeu uma composição própria com objetos do tema. Por solicitação do usuário, as caixas sobrepostas com símbolos da habilidade foram removidas; as imagens exibem apenas os objetos. As capas, trilhas e ícones compatíveis usam a mesma biblioteca. A Matemática Pirata mantém suas ilustrações dedicadas, aprovadas anteriormente.

## Padrão aprovado

Exportar os modelos preservados em `tools/3DSVG/Repository/Kenney/` pelo conversor `convert_model.py` e pelo exportador vetorial `blockie-svg.js`, os mesmos usados no estúdio 3DSVG. Servir os SVGs transparentes de `assets/image/SVG/`. As composições dos cards usam coordenadas de 768 × 768; os objetos têm recorte automático e escalam sem depender de resolução de bitmap. Não ampliar previews nem embutir PNGs em SVGs. As cores das texturas são aproximadas por face, conforme o funcionamento do 3DSVG.

Mostrar a face frontal de cada objeto. Os 140 modelos Kenney usados foram comparados em quatro direções; as três expressões da nova Esfinge também têm sua frente definida. `scripts/svg-front-views.json` registra individualmente o eixo frontal e a câmera, pois os pacotes não compartilham uma orientação única. O exportador exige uma orientação revisada para cada novo modelo, evitando herdar uma câmera que mostre as costas. Objetos planos recebem elevação para mostrar sua superfície útil; sólidos simétricos mantêm profundidade visível. Manter iluminação e escala consistentes. O castelo usa base, corpo e telhado; o teclado recebeu teclas para facilitar seu reconhecimento. A Esfinge usa agora uma malha Blockie original em `tools/3DSVG/Repository/HelloYotta/`.

## Correspondência temática

| Grupo de jogos | Referências visuais |
| --- | --- |
| Enigmas da Esfinge | Esfinge Blockie original, com três expressões, e arquitetura de templo |
| Matemática Pirata, Piratas do Troco e Mapa da Ilha do Tesouro | Navios, baús, moedas, palmeiras e ilhas |
| Galáxia Geométrica, Galáxia dos Opostos e Mercado Alien | Naves, astronautas, alienígenas e cristais |
| Defesa do Castelo e Duelo dos Monstros | Castelo, catapulta e personagens de fantasia |
| Escola de Magia e Laboratório das Poções | Poções, livros e objetos de fantasia |
| Fábricas de Acentos, Rimas e Formas | Fábrica, engrenagens, esteira e braço mecânico |
| Jogos de digitação, vogais, sílabas e ortografia | Teclado, livros e objetos reconhecíveis associados às palavras |
| Coletivos, Sinônimos e Contando as Patas | Animais, árvores e referências de exploração |
| Mercados e Balança da Descoberta | Carrinho, caixa, alimentos e indicação de valores ou peso |
| Trem da Soma e Subtração | Locomotiva e vagões |
| Espelho Mágico | Espelho e símbolo de reflexão |
| Gráfico em Ação | Alimentos e gráfico de barras |
| Qual é o próximo, Complete a Cobra, Sudoku e Complete a Sequência | Peças, padrões e símbolos correspondentes à habilidade |
| Combinando Sorvete | Sorvetes |
| Que horas são | Casa e relógio desenhado na composição |
| O Caminho Mais Rápido | Casa, estrada e veículo |
| Organiza Tudo e Qual é o Grupo | Objetos variados e indicação de classificação |

O mapeamento ativo de cada jogo, modelo de origem e composição está em `assets/image/SVG/manifest.json`, publicado também em `utils/visual-manifest.js`. As receitas temáticas originais permanecem em `scripts/build-visual-library.py`; o novo exportador reaproveita essas escolhas. `assets/visuals/` guarda a biblioteca rasterizada anterior e sua procedência, sem ser o caminho ativo da camada compartilhada.

## Preservação didática e funcional

A camada visual pinta imagens sobre os elementos existentes, mantendo textos, nós, eventos e dados do jogo. A imagem só aparece depois de carregar; se falhar, o conteúdo original continua disponível. Não altera respostas, pontuação, progressão ou telemetria.

Não substituir automaticamente desenhos que expressam cores, giros, formas, categorias ou quantidade de patas. Os exercícios de Organiza Tudo, Gráfico em Ação, Contando as Patas, Qual é o Grupo e as combinações de sorvete têm áreas protegidas. Os diagramas geométricos, relógios, padrões e recipientes coloridos mantêm a representação necessária para resolver os desafios. A tabela de equivalência da Matemática Pirata continua fora dos quadros de quantidades.

## Arquivos e manutenção

- `scripts/prepare-game-svg.py`: seleciona os modelos usados e executa o conversor real do 3DSVG em lote com o Blender local. Não depende dos pacotes removidos do nível superior.
- `scripts/prepare-game-svg-blender.py` e `scripts/prepare-game-svg-details.py`: conversão em uma sessão e preservação do castelo montado e das teclas do teclado. O orc usa OBJ estático para evitar a geometria de repouso da versão animada GLB.
- `scripts/export-game-svg.cjs`: chama o exportador vetorial do 3DSVG, monta os cards e publica o manifesto ativo.
- `scripts/verify-game-svg.py`: valida XML, fontes, referências dos 40 jogos e ausência de bitmaps embutidos.
- `scripts/build-sphinx-blockie.py`: cria os três modelos originais da Esfinge em `tools/3DSVG/Repository/HelloYotta/`, com Blender, FBX, GLB, OBJ, textura e previews. `scripts/verify-sphinx-blockie.py` reimporta os 12 arquivos de modelo para validar geometria e materiais.
- `assets/image/SVG/objects/`: 124 objetos da biblioteca compartilhada e duas expressões adicionais da Esfinge.
- `assets/image/SVG/pirate/`: 17 objetos usados diretamente pela Matemática Pirata.
- `assets/image/SVG/sphinx-visitors/`: 12 personagens Kenney Mini Characters em vistas frontais. Enigmas da Esfinge troca o personagem somente ao terminar a animação de engolir, mantendo o mesmo enigma e as alternativas já descartadas. Acertos preservam o personagem. Geradores: `scripts/build-sphinx-visitors.py` e `scripts/export-sphinx-visitors.cjs`.
- `assets/image/SVG/games/`: 40 cards vetoriais.
- `assets/image/SVG/licenses/`: licenças dos pacotes utilizados.
- `scripts/build-visual-library.py`: gerador rasterizado anterior e receitas temáticas preservadas.
- `scripts/export-sphinx-art.cjs`: utilitário legado da arte SVG anterior; não integra o fluxo atual da Esfinge Blockie.
- `assets/visuals/objects/`: objetos transparentes em PNG e WebP.
- `assets/visuals/games/`: as 40 composições em PNG e WebP.
- `utils/visual-manifest.js`: manifesto carregado pelas páginas.
- `utils/visual-assets.js` e `styles/visual-assets.css`: aplicação compartilhada e apresentação responsiva.
- `scripts/verify-visual-library.py`: verifica arquivos, transparência, integração das páginas e preservação dos scripts existentes.

Para regenerar a biblioteca ativa, executar `python scripts/prepare-game-svg.py`, `node scripts/export-game-svg.cjs` e `python scripts/verify-game-svg.py`. A preparação requer Blender; os jogos publicados usam somente SVGs estáticos e não requerem Blender nem o servidor 3DSVG. O lote cobre os modelos efetivamente utilizados pelos jogos, não todos os 4.198 modelos do repositório. Para novos modelos, conferir licença e significado antes de associá-los aos exercícios. Para alterar a Esfinge, executar primeiro o Blender com `--background --python scripts/build-sphinx-blockie.py`, preservando as três expressões.

## Licenças

Os modelos Kenney CC0 são preservados em `tools/3DSVG/Repository/Kenney/`. As licenças são copiadas para `assets/image/SVG/licenses/`. A nova Esfinge é uma malha original criada localmente para Hello Yotta em `Repository/HelloYotta/`, com expressões normal, feliz e de redemoinho. O desenho anterior foi preservado como fallback. Nenhum serviço externo de geração de imagem é necessário.

## Verificação desta entrega

O lote atual tem 183 SVGs validados (incluindo duas expressões adicionais da Esfinge), com fontes e 40 pontos de entrada conferidos. As 40 composições foram rasterizadas somente para uma prancha de revisão visual (`preview-cards.png`), sem uso dessa imagem nos jogos. No navegador, o catálogo carregou os 40 cards e Matemática Pirata carregou capa, trilhas e exercício. Na entrega Blockie da Esfinge, foram conferidas capa, expressão normal, erro com redemoinho, expressão feliz e avanço ao próximo enigma, sem erros no console. Os 12 arquivos 3D foram reimportados com materiais e texturas. O 3DSVG foi validado no novo caminho `tools/3DSVG/`, exibindo as três expressões no pacote Hello Yotta · Blockie. Não representa conclusão de todas as fases. A revisão em celular de 390 px pertence à entrega rasterizada anterior e precisa ser repetida para novos ajustes de layout.
