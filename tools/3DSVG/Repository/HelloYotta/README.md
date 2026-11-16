# Esfinge Blockie — Hello Yotta

## Outros modelos do pacote

- `zombie-female-d-blockie/`: zumbi derivado do `character-female-d` do Kenney Mini Characters, com pele verde, penteado preservado, braços estendidos, olhos assimétricos e roupas desgastadas. Inclui Blender, FBX, GLB, OBJ, textura, preview e SVG; veja seu `README.md` e `Overview.html`.

Modelo original criado em Blender para Enigmas da Esfinge, no mesmo padrão dos objetos Blockie: volumes cúbicos, chanfros de um segmento, faces planas e textura de paleta fosca. Corpo de leão deitado, patas, cauda, rosto humano, toucado nemes e barba cerimonial. Não utiliza modelos ou texturas externos.

Três projetos independentes: `esfinge-blockie` (normal), `esfinge-blockie-feliz` (acerto/capa) e `esfinge-blockie-redemoinho` (erro). Cada pasta contém Blender, FBX, GLB, OBJ + MTL, textura PNG e preview transparente de 1024 px. Frente no Blender: -Y; no conversor 3DSVG: +Z.

Abra esta pasta como raiz no 3DSVG ou localize o pacote **Hello Yotta · Blockie** na biblioteca. `Overview.html` reúne as prévias e links dos arquivos.

O jogo usa os SVGs `sphinx.svg`, `sphinx-happy.svg` e `sphinx-sucking.svg` em `assets/image/SVG/objects/`. O card do catálogo usa a mesma esfinge 3D. A boca conserva um ponto de referência para a animação de redemoinho; a arte anterior fica como fallback.

Recriar: Blender em segundo plano com `--python scripts/build-sphinx-blockie.py`; depois executar `scripts/prepare-game-svg.py`, `scripts/set-svg-front-views.py` (somente para os modelos já revisados) e `scripts/export-game-svg.cjs`. Reimportação dos formatos: Blender com `--python scripts/verify-sphinx-blockie.py`. Resultados em `validation.json`.
