# Estudo independente: explorador HelloYotta

Criado em 4 de novembro de 2026 a partir da referência visual fornecida pelo usuário. Não modifica o AvatarStudio, sua biblioteca ou suas diretrizes aprovadas.

Três exemplares: sorridente, apaixonado e surpreso. A geometria é idêntica; apenas os olhos e a boca na textura variam. Nariz tridimensional fixo e cabelo com volume real na frente, lateral e atrás. Gola em relevo; botões e distintivo desenhados no atlas. Materiais e desenhos são próprios.

Cada personagem: **1 malha, 1 material, 804 triângulos**, atlas PNG 512 × 512. A contagem é maior que os 180 triângulos da base do AvatarStudio devido aos chanfros, mãos e detalhes volumétricos. É um estudo visual para aprovação, não uma substituição automática da base.

Cada pasta segue o padrão GLB format / FBX format / OBJ format / Blender / Textures / Previews. Os ZIPs incluem configuração textual e relatório de contagem. Modelos estáticos, sem rig ou clipes de animação. Rig compartilhado permanece uma etapa futura. Frente -Y no Blender e +Z no GLB.

Abra Overview.html para comparar os previews e baixar os pacotes. Abra os GLBs no 3DSVG para inspeção 3D. Overview.png é uma prancha de comparação.

Reprodução: execute build_textures.py com Python/Pillow, build_models.py com Blender em background e package_study.py com Python/Pillow. Não é necessário instalar recursos no editor atual.
