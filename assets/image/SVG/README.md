# Assets vetoriais Hello Yotta

O jogo Enigmas da Esfinge também usa 12 personagens em `sphinx-visitors/`, exportados do acervo Kenney pelo 3DSVG. Cada personagem engolido é substituído pelo próximo ao terminar a animação; acertos mantêm o personagem atual.

183 SVGs gerados: 124 objetos compartilhados, duas expressões adicionais da Esfinge, 17 objetos próprios da Matemática Pirata e 40 composições para os cards dos jogos. Fontes 3D preservadas em `../../../tools/3DSVG/Repository/Kenney/` e `../../../tools/3DSVG/Repository/HelloYotta/`; não é necessário restaurar os pacotes removidos do nível superior. Outras pastas SVG adicionadas pelo usuário são independentes deste lote e foram preservadas.

Exportados pelo mesmo `convert_model.py` e `blockie-svg.js` do estúdio 3DSVG. Os arquivos contêm caminhos vetoriais, com fundo transparente. Texturas são aproximadas por face; não há screenshots nem bitmaps embutidos. A Esfinge usa o modelo Blockie original da Hello Yotta; o desenho anterior permanece como fallback no jogo.

`manifest.json` registra as associações e fontes. `validation.json` contém a conferência automática. `preview-cards.png` é somente uma prancha de revisão; o site carrega os SVGs. Licenças Kenney CC0 em `licenses/`.

Todas as vistas usam a face frontal revisada de cada modelo, registrada em `scripts/svg-front-views.json`. Os pacotes têm eixos frontais diferentes; não aplicar uma câmera universal. Novos modelos exigem conferência visual e uma entrada nesse arquivo antes da exportação.

Regenerar a partir da raiz do projeto:

```text
python scripts/prepare-game-svg.py
node scripts/export-game-svg.cjs
python scripts/verify-game-svg.py
```

O primeiro passo exige Blender instalado. O site continua estático e não depende do Blender ou do servidor 3DSVG durante o uso.
