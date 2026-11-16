# Zombie Female D · Blockie

Derivação real do modelo Kenney Mini Characters `character-female-d` (CC0), preservando sua malha e penteado. Pele verde, cabelo castanho envelhecido, braços estendidos, olhos assimétricos, dentes faltando, roupas desgastadas e remendos. Tratamento estilizado, sem ferimentos gráficos.

Fontes e entregáveis: `Blender/`, `FBX format/`, `GLB format/`, `OBJ format/` (com MTL), `Textures/`, `Previews/` e `SVG/`. Frente: -Y no Blender, +Z no 3DSVG. A pose foi aplicada à malha para que os formatos estáticos tenham a mesma aparência.

Fonte original em `../../Kenney/kenney_mini-characters/character-female-d/`; licença copiada em `License-Kenney.txt`. O original não é alterado. Estatísticas e procedência em `model.json`; reimportação dos quatro formatos em `validation.json`.

Gerar novamente: Blender com `--background --python scripts/build-zombie-female-d.py`, depois `node scripts/export-zombie-svg.cjs`. Validar com Blender e `--python scripts/verify-zombie-female-d.py`.

No 3DSVG, atualizar a biblioteca e escolher o pacote **Hello Yotta · Blockie**, modelo **zombie-female-d-blockie**.
