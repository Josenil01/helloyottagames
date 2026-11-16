# Aventureiros da Esfinge

12 personagens do pacote Kenney Mini Characters (CC0), preservado em `tools/3DSVG/Repository/Kenney/kenney_mini-characters/`. Conversão dos OBJ estáticos e exportação de vistas frontais pelo motor 3DSVG, com fundo transparente e sem bitmaps embutidos. Licença original em `License.txt`.

O jogo percorre os 12 personagens em sequência. A mudança acontece ao terminar o redemoinho de uma resposta errada; acertos e avanço de enigma mantêm o personagem atual. Após o último, a sequência recomeça. Sair da tela cancela a animação pendente.

Regenerar: Blender com `--background --python scripts/build-sphinx-visitors.py`; depois `node scripts/export-sphinx-visitors.cjs`.
