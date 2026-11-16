# Repositório local do 3DSVG

## Estrutura dos modelos

```text
Pasta raiz/
├── Modelo A/
│   ├── FBX format/
│   ├── GLB format/
│   ├── OBJ format/       # OBJ e MTL
│   └── Textures/
└── Modelo B/
    ├── FBX format/
    ├── GLB format/
    ├── OBJ format/
    └── Textures/
```

Cada pasta de modelo gera uma entrada na biblioteca. Os formatos são variantes da mesma entrada; não precisam ter nomes iguais. Arquivos chamados `scene.glb` em duas pastas diferentes não são misturados. O menu **Formato de origem** permite escolher qual versão abrir. Nenhum arquivo `.blend` é obrigatório.

## Alimentar a biblioteca

1. Inicie o 3DSVG com `Iniciar-3DSVG.cmd`.
2. Clique em **Abrir pasta raiz** e selecione a pasta que contém os modelos.
3. Aguarde a cópia em lotes e a organização da biblioteca.
4. Escolha um modelo, o formato de origem e a vista desejada. Exporte com **Baixar SVG**.

Se já existir uma importação com o mesmo nome, a ferramenta oferece criar uma cópia separada ou atualizar uma pasta existente. A atualização adiciona modelos e substitui os arquivos enviados, sem excluir os modelos anteriores. Versões substituídas ficam em `.history/` dentro da pasta importada; esse histórico não aparece como modelos duplicados.

Também é possível copiar uma pasta raiz organizada para este diretório e clicar em atualizar na biblioteca. A identificação considera o caminho completo de cada modelo.

## Pastas mantidas pela ferramenta

- **Kenney/**: cópias dos modelos do acervo Kenney organizadas por pacote e modelo. Cada modelo contém seus formatos, materiais, texturas e preview, quando disponível. As licenças permanecem na pasta de cada pacote.
- **Imports/**: pastas recebidas pela interface. `import-info.json` guarda o nome da importação e seu estado; importações incompletas não entram na biblioteca.

Os arquivos originais em `assets/image/kenney_*/` são preservados para manter os jogos e seus caminhos funcionando. A versão adaptada não depende desses caminhos para carregar seus modelos. OBJ e MTL recebem referências relativas para suas próprias texturas. FBX e GLB são copiados sem alterar seus bytes.

`Kenney/repository-manifest.json` contém a relação completa dos modelos adaptados. O `model.json` de cada modelo registra os arquivos, as origens e os hashes para verificação. Esses metadados são gerados pelo adaptador; não são necessários para importar pastas criadas pelo usuário.

## Repetir a adaptação Kenney

Na pasta 3DSVG, execute `python organize_kenney.py` para conferir o plano. Para aplicar e verificar, use `python organize_kenney.py --apply --verify`. O comando só administra pastas com seu próprio marcador de geração; não sobrescreve pastas de modelos desconhecidas.

A conversão para o preview é feita sob demanda. Não é necessário gerar milhares de projetos Blender nem renderizar todo o acervo antecipadamente.
