# 3DSVG — Estúdio local de assets

A ferramenta está em `tools/3DSVG/`, após a mudança feita pelo usuário. Esta é a ferramenta para explorar os modelos do acervo, abrir novos arquivos e exportar vistas 2D vetoriais. Os modelos e experiências anteriores foram preservados. O pacote original da Esfinge Blockie está em `Repository/HelloYotta/`, com três expressões, fontes Blender, formatos de intercâmbio, textura e previews.

## Abrir a ferramenta

No Windows, dê dois cliques em **Iniciar-3DSVG.cmd**. O iniciador abre `http://127.0.0.1:8768/` no navegador e mantém um servidor apenas local. Para encerrar, feche seu terminal ou pressione Ctrl+C nele. É necessário Python 3 e Blender; o iniciador usa o Python disponível neste ambiente, quando presente, ou o comando `python`.

Também é possível executar `python server.py --open` nesta pasta. Caso o Blender esteja em outro caminho, use `python server.py --blender "C:\caminho\blender.exe" --open`. Outra porta pode ser escolhida com `--port 8770`.

Abrir `index.html` diretamente por `file://` oferece os quatro modelos de demonstração. O catálogo completo e a conversão de arquivos requerem o servidor local.

## Biblioteca e importação

- A biblioteca examina `Repository/` e mantém compatibilidade com `assets/image/*/Models/`. Na estrutura nova, cada pasta de modelo é uma entrada, e seus formatos são agrupados mesmo com nomes de arquivo diferentes. O caminho distingue modelos que usam nomes iguais. GLB é preferido; o menu **Formato de origem** permite escolher outra versão.
- Busque por nome ou selecione um pacote. A lista é exibida por páginas de 80 resultados para não carregar milhares de miniaturas de uma vez.
- Use **Abrir arquivos** para modelos com dependências selecionadas em conjunto. Use **Abrir pasta raiz** para selecionar uma pasta com várias subpastas de modelos, contendo `FBX format/`, `GLB format/`, `OBJ format/` e `Textures/`. A importação preserva essa estrutura e envia arquivos em lotes, sem um limite de 200 MB para o conjunto todo (cada arquivo deve ter até 190 MB). Também é possível arrastar arquivos para o preview.
- GLTF pode depender de `.bin` e imagens; OBJ depende de MTL e suas texturas; projetos Blender devem incluir ou empacotar suas imagens. FBX e GLB podem ter imagens embutidas.
- Novos pacotes colocados no acervo aparecem ao clicar em atualizar. Arquivos importados pela interface ficam em `Repository/Imports/` e permanecem disponíveis após reiniciar. Ao selecionar novamente uma pasta de mesmo nome, é possível adicionar uma cópia separada ou atualizar uma importação existente. Atualizações mantêm os modelos antigos e guardam arquivos substituídos em `.history/`. Importações feitas pela versão anterior em `.cache/imports/` continuam disponíveis.

O acervo Kenney adaptado fica em `Repository/Kenney/<pacote>/<modelo>/`, com formatos, materiais, texturas e previews próprios. Seus originais não foram movidos. Consulte [Repository/README.md](Repository/README.md) para a estrutura completa e os comandos de verificação. Projetos `.blend` não são necessários para os modelos Kenney.

As malhas são convertidas com Blender em segundo plano, com scripts automáticos desativados. Os originais não são modificados. A primeira abertura converte; aberturas seguintes aproveitam o cache em `.cache/models/`. Mudanças no modelo ou nas dependências do pacote invalidam o cache. Não há upload para serviços externos.

Personagens com esqueleto, como os humanoides de Mini Characters, são convertidos sem as malhas auxiliares de controle dos ossos. A esfera oculta criada pelo importador glTF não faz parte do personagem e é excluída do preview e do SVG. Uma esfera que pertença ao modelo continua sendo exibida. O cache também considera a versão do conversor: basta reabrir o personagem após uma correção.

## Escolher ângulos e criar SVGs

Arraste para girar, use a roda ou pinça para zoom, ou use as vistas Frente, Direita, Costas, Esquerda, Topo, Base e Três quartos. Use as setas e +/− com o canvas em foco. Clique em **Baixar SVG** para exportar uma vista fixa, transparente e recortada ao redor da geometria. O modo malha exporta linhas; o modo normal exporta faces coloridas.

Amostramos a cor da textura em cada face para manter o SVG inteiramente vetorial. Isso funciona especialmente bem com os modelos de paleta e poucos polígonos do acervo. Texturas fotográficas, transparências e materiais procedurais são aproximados. Animações não são exportadas; projetos Blender mostram a geometria estática visível da cena.

O preview aceita modelos de até 150 mil triângulos; acima disso, pede simplificação. A exportação SVG limita a malha a 10 mil triângulos para evitar arquivos excessivos e processamento muito pesado. **Simplificar para SVG** cria uma versão de aproximadamente 6 mil triângulos na conversão; reabra o modelo após alterar essa opção. O original é preservado.

## Organização

| Arquivo | Função |
| --- | --- |
| `index.html`, `studio.css`, `studio.js` | Interface da biblioteca e do estúdio |
| `server.py` | Catálogo, importação local e cache |
| `repository.py` | Identidade por pasta e agrupamento dos formatos |
| `organize_kenney.py` | Adaptação verificável dos pacotes Kenney, preservando originais |
| `convert_model.py` | Conversão de geometria e cores usando Blender |
| `import_ascii_fbx.py` | Leitura de malhas estáticas, materiais e UV de FBX ASCII 7.x legado |
| `blockie-viewer.js` | Renderização WebGL, câmera, zoom e vistas |
| `blockie-svg.js` | Projeção vetorial e ordenação das faces por BSP |
| `blockie-model-data.js` | Quatro demonstrações que também funcionam offline |
| `Overview-Blockie.html` | Galeria original do conjunto Blockie |
| `legacy-image-gallery.html` | Primeira experiência com imagens geradas |
| `Repository/` | Acervo adaptado, importações persistentes e instruções de organização |
| `.cache/` | Conversões e dados de testes locais, ignorados pelo controle de versão |

## Histórico dos modelos de demonstração

Validação da ferramenta: `scripts/verify-3dsvg.py` confere os formatos e a simplificação; `scripts/verify-3dsvg-repository.py` verifica pastas de modelos com arquivos homônimos e a adaptação idempotente; `scripts/verify-3dsvg-repository-http.py` exercita a importação em lotes, as variantes, a atualização e o histórico; `scripts/verify-3dsvg-normalized.py` carrega modelos de pastas adaptadas; `scripts/verify-blockie-svg.cjs` confere os SVGs em múltiplos ângulos e estilos. A adaptação completa é auditada com `python organize_kenney.py --verify`, que confere arquivos, formatos, caminhos de materiais e hashes dos originais.

## Conjunto 3D Blockie — cogumelo, cano, moeda e bloco

### Exportação de assets 2D em SVG

No visualizador, escolha o modelo, ajuste o ângulo e clique em **Baixar SVG do ângulo atual**. O download tem fundo transparente, margens recortadas e nome com modelo, ângulos e horário. O giro automático é pausado ao exportar. Com **Ver malha** ativo, o SVG contém linhas; no modo normal, contém faces preenchidas com as cores e iluminação do visualizador.

O SVG é vetorial de verdade: contém caminhos projetados da geometria, sem PNG ou textura rasterizada embutidos. A aparência de cada face é calculada a partir da paleta de cores dos modelos atuais. A ordenação espacial BSP resolve a sobreposição das superfícies. A imagem pode ser redimensionada sem pixelização, mas representa um único ângulo fixo. Sua iluminação é a versão simplificada do visualizador, não uma renderização fotográfica do Blender. Para usar na página, basta referenciar o arquivo em um elemento `img`.

A implementação está em `blockie-svg.js`. `scripts/verify-blockie-svg.cjs` testa os quatro modelos em seis ângulos, nos modos preenchido e malha, e confere a ordenação de profundidade em um caso controlado.

O arquivo `Overview-Blockie.html` inclui um visualizador WebGL offline: seleção dos quatro modelos, rotação por mouse/toque/teclado, zoom, giro automático, malha e restauração da vista. Funciona diretamente por `file://`, sem dependências externas ou servidor. O script `scripts/build-blockie-viewer-data.py` lê os GLBs e empacota sua geometria, normais e cores da textura em `blockie-model-data.js`; execute-o novamente após atualizar os GLBs. `blockie-viewer.js` cuida apenas da visualização. Os downloads continuam sendo os modelos originais.

Abra `Overview-Blockie.html` para consultar o conjunto e `Preview-blockie-set.png` para ver os quatro modelos juntos. O cogumelo aprovado foi preservado; os três novos objetos seguem a mesma direção visual e o mesmo estúdio de renderização.

| Modelo | Nome dos arquivos | Particularidades |
| --- | --- | --- |
| Cano | `cano-blockie` | Tubo quadrado chanfrado com abertura, parede interna e fundo geométricos |
| Moeda | `moeda-blockie` | Contorno de 12 lados e relevo retangular nas duas faces |
| Bloco | `bloco-blockie` | Cubo chanfrado com interrogações em volumes quadrados nas faces frontal e direita |

Para cada novo modelo há `.blend`, `.fbx`, `.glb`, `.obj` e `.mtl`, além de três previews transparentes. A vista principal tem 1024 × 1024 pixels; frente e costas têm 512 × 512. A textura dos três novos objetos é o atlas `Models/Textures/blockie-items-palette.png`, de 512 × 64 pixels, com oito cores. O material é fosco e as normais são planas.

GLB e FBX contêm textura embutida. Os arquivos OBJ usam o MTL correspondente e o caminho relativo `../Textures/blockie-items-palette.png`. Cada modelo tem uma malha e um material; origem centralizada na base, unidades em metros.

Geração: `scripts/build-gpt-blockie-items.py`, executado no Blender em segundo plano. Validação: `scripts/verify-gpt-blockie-items.py`. Metadados em `blockie-items-manifest.json`; resultados da reimportação em `validation-items.json`. Os modelos ainda não foram aplicados aos jogos.

## Teste 3D Blockie — 29/10/2026

O teste novo é um modelo real, criado no Blender, independente das imagens geradas anteriormente. Abra `Overview.html` para visualizar suas três vistas e acessar os arquivos.

| Entrega | Caminho |
| --- | --- |
| Fonte editável e estúdio | `Models/Blender/cogumelo-blockie.blend` |
| FBX com textura embutida | `Models/FBX format/cogumelo-blockie.fbx` |
| GLB com textura embutida | `Models/GLB format/cogumelo-blockie.glb` |
| OBJ e material MTL | `Models/OBJ format/` |
| Atlas de cores, 256 × 64 | `Models/Textures/blockie-palette.png` |
| Preview em três quartos, 1024 × 1024 | `Previews/cogumelo-blockie.png` |
| Vistas frontal e posterior, 512 × 512 | `Previews/cogumelo-blockie-frente.png`, `Previews/cogumelo-blockie-costas.png` |

Uma malha com 264 vértices, 286 polígonos e 484 triângulos; um material com UV. Unidades em metros e origem na base. Geometria composta por volumes cúbicos chanfrados e detalhes quadrados, com superfícies planas e material fosco.

Os três formatos foram reimportados no Blender, com conferência de dimensões, UV, materiais e carregamento das texturas. O resultado está em `validation.json`; os metadados do teste estão em `blockie-manifest.json`. O OBJ depende do MTL e do caminho relativo `../Textures/blockie-palette.png`.

Para reproduzir, execute o Blender com `--background --python scripts/build-gpt-blockie-test.py`, a partir da raiz do projeto. O script `scripts/verify-gpt-blockie-test.py` faz a verificação por reimportação. Este teste não foi aplicado aos jogos.

## Primeira experiência — imagens geradas

Criado em 29/10/2026 com a ferramenta integrada de geração de imagens.

Quatro imagens PNG individuais, em 1254 × 1254 pixels, com canal alfa transparente:

| Arquivo | Elemento |
| --- | --- |
| `cogumelo.png` | Cogumelo vermelho com manchas brancas |
| `cano.png` | Cano verde com abertura superior |
| `bloco-interrogacao.png` | Bloco amarelo com interrogação |
| `moeda.png` | Moeda dourada |

Direção visual: aparência de objetos 3D estilizados, superfícies simplificadas, bordas arredondadas, cores vivas, câmera em três quartos e iluminação suave à esquerda. São imagens rasterizadas geradas, não modelos 3D editáveis. Os prompts completos estão em `manifest.json`.

Abra `index.html` para visualizar as quatro peças sobre fundos claros e escuros. Não foram aplicadas automaticamente a nenhum jogo.

As solicitações de estrela, flor de fogo, Goomba e castelo foram recusadas pelo serviço de imagens e não produziram arquivos entregáveis.

Este conjunto é fan art baseada na franquia Super Mario. Sua procedência é distinta dos pacotes Kenney CC0; não é material oficial da Nintendo.
