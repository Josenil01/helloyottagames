# Diretrizes do AvatarStudio HelloYotta

**Atualização:** 4 de novembro de 2026.  
**Local oficial:** `tools/AvatarStudio/`.  
**Status:** editor do personagem quadrado em implementação e validação.

## 1. Objetivo e escopo

Ferramenta web para funcionários criarem avatares e baixarem os assets. A primeira versão não inclui contas, autenticação, publicação de catálogo, alunos ou integração com o ecossistema. O servidor atual é local, restrito ao próprio computador; não representa um controle de acesso de funcionários para hospedagem pública.

A direção visual aprovada é o personagem quadrado original HelloYotta: cabeça grande, corpo pequeno, volumes simples e baixa complexidade. A biblioteca anterior e o compromisso com suas categorias e quantidades foram substituídos por esta decisão.

## 2. Representação e configuração

- Começar sempre de uma configuração base fixa, sem seeds ou sorteio.
- Salvar a aparência como JSON versionado, com identificadores de peças, olhos, boca e cores.
- Manter as malhas e recursos compartilhados fora do banco de dados. Não salvar modelos completos por aluno.
- A versão atual guarda a última configuração no navegador e permite baixá-la em JSON. Não há banco de dados nesta entrega.
- O usuário fornece apenas escolhas de configuração: não há upload de modelos, texturas ou edição de geometria.
- Downloads são gerados sob demanda; o servidor não mantém cópias permanentes de cada avatar exportado.

## 3. Geometria e orçamento visual

A base `square-01` usa uma malha, um material e 180 triângulos. A textura gerada no editor é um atlas PNG de 512 × 512 pixels. As expressões e cores não alteram a geometria nem aumentam o número de materiais.

Cabelo é volume geométrico real, não pintura sobre a cabeça. Esta versão usa um único corte, incorporado à malha de saída. Futuros cortes devem ser recursos compartilhados e substituíveis; apenas o corte selecionado deve compor o avatar. A criação desses cortes não faz parte desta alteração.

## 4. Rosto e expressões

- Nariz fixo em todas as configurações, sem controle de seleção, tamanho ou posição.
- Olhos e bocas selecionáveis de forma independente.
- Expressões prontas combinam os dois controles e podem ser personalizadas depois.
- Desenhos vetoriais próprios inspirados na linguagem dos emojis; não depender dos glifos ou das fontes de emoji do sistema operacional.
- Aplicar os desenhos à região frontal do atlas. Não criar malhas individuais para olhos, boca ou expressões.
- Conjunto inicial: 12 expressões prontas, 9 opções de olhos e 8 opções de boca.
- Exemplos: feliz, rindo, piscando, apaixonado, encantado, surpreso, sonolento, determinado, triste, brincalhão e beijo.
- O SVG é a fonte vetorial dos desenhos faciais. No modelo 3D, esses desenhos são rasterizados no atlas; não prometer resolução infinita da textura.

## 5. Cores

Controles independentes de pele, cabelo, camiseta, calça e sapatos/cinto. Atualizar as cores do atlas sem duplicar as malhas ou os arquivos-base. A geometria do nariz permanece fixa e seu desenho acompanha o tom da pele.

## 6. Exportação

Pacote ZIP com GLB, FBX, OBJ/MTL, Blender (`.blend`), textura PNG e configuração JSON. Os quatro formatos devem representar a mesma configuração capturada no início do download, mesmo se o usuário continuar editando durante a conversão.

O navegador gera a textura a partir das escolhas. O servidor local recebe essa textura derivada e a configuração, valida os limites e chama Blender em segundo plano. Não existe interface de importação de assets pelo usuário. Os arquivos temporários são removidos após a exportação.

GLB e Blender carregam a textura internamente; OBJ deve manter a referência relativa à textura do pacote. O recurso 3D deve abrir no 3DSVG. Captura de poses e exportação de imagens SVG/PNG continuam no 3DSVG, fora do escopo do AvatarStudio.

## 7. Esqueleto e poses

O protótipo quadrado atual é estático e não tem rig. Não afirmar que está pronto para animação. Na etapa de rigging, utilizar o mesmo padrão de esqueleto e poses compartilhadas do 3DSVG, evitando bibliotecas e animações duplicadas. A adequação da malha e sua validação são trabalho pendente; não gerar novos esqueletos independentes por exportação.

## 8. Evolução futura

Funcionários e alunos poderão compartilhar os mesmos ajustes visuais, com permissões e conjuntos de peças distintos. Funcionários terão todas as peças aprovadas. Alunos terão itens desbloqueados pelo uso da plataforma numa versão posterior. Vínculo com contas e integração ao ecossistema pertencem a outra equipe.

## 9. Critérios de validação

1. Abrir o modelo no navegador, girar e conferir frente e costas.
2. Trocar expressões, olhos e bocas sem alterar o nariz.
3. Alterar cores sem mudar a contagem de malhas, materiais ou triângulos.
4. Restaurar o padrão e recuperar a configuração após recarregar.
5. Exportar e verificar arquivos, textura e referências do pacote.
6. Conferir o uso em tela estreita e navegação por teclado.
7. Não alterar jogos ou outros repositórios de assets durante a atualização do módulo.
