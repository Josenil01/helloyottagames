# AvatarStudio

Editor web local do personagem quadrado HelloYotta. Execute `Iniciar-AvatarStudio.cmd` e abra http://127.0.0.1:8771.

Escolha entre 12 expressões, 9 olhos, 8 bocas e cinco grupos de cores. Nariz fixo; cabelo com geometria real. A configuração é salva no navegador e pode ser baixada como JSON.

O download gera ZIP com GLB, FBX, OBJ/MTL, Blender, textura e configuração atuais. Requer Python com Pillow e Blender. O iniciador usa o Python do ambiente quando disponível; uma instalação alternativa precisa de Pillow (`python -m pip install Pillow`). O servidor encontra Blender no PATH ou no caminho local conhecido; `AVATAR_BLENDER` permite indicar outro executável.

Modelo estático: 1 malha, 1 material, 180 triângulos. Rig compartilhado e novos cortes de cabelo são etapas futuras. Capturas de poses e imagens permanecem no 3DSVG. O servidor aceita apenas conexões locais e não implementa autenticação para publicação na internet.

- `library/base.glb`: geometria original HelloYotta, copiada do estudo aprovado no 3DSVG.
- `faces.js`: desenhos próprios de olhos e bocas, presets e configuração padrão.
- `studio.js`: montagem do atlas, preview, edição e download.
- `server.py` / `scripts/export_avatar.py`: exportação temporária por Blender.
- `vendor/`: Three.js e licença preservada.
- `DIRETRIZES-SISTEMA-DE-AVATARES.md`: decisões vigentes.
