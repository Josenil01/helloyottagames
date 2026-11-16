// Cada entrada: enigma, resposta, duas alternativas e explicação.
window.SPHINX_TRACKS = [
  { name: 'Primeiros passos', riddles: [
    ['O que é, o que é? Tem dentes, mas não come; ajuda a arrumar o cabelo.', 'Pente', 'Garfo', 'Escova de dentes', 'Os dentes do pente passam entre os fios de cabelo.'],
    ['O que é, o que é? Cai do céu em gotas e molha o chão.', 'Chuva', 'Sol', 'Vento', 'A chuva é formada por gotas de água que caem das nuvens.'],
    ['O que é, o que é? Ilumina o dia e aquece a Terra.', 'Sol', 'Lua', 'Nuvem', 'O Sol fornece luz e calor à Terra.'],
    ['O que é, o que é? Tem capa e páginas, mas não é uma pessoa.', 'Livro', 'Caixa', 'Mesa', 'A capa protege as páginas do livro.'],
    ['O que é, o que é? Você calça para proteger os pés ao caminhar.', 'Sapato', 'Luva', 'Chapéu', 'O sapato protege os pés.']
  ]},
  { name: 'Objetos misteriosos', riddles: [
    ['O que é, o que é? Tem pernas, mas não anda; serve para você se sentar.', 'Cadeira', 'Cavalo', 'Mochila', 'As pernas sustentam a cadeira, mas não caminham.'],
    ['O que é, o que é? Tem ponteiros e mostra as horas.', 'Relógio', 'Bússola', 'Balança', 'Os ponteiros do relógio indicam horas, minutos e, às vezes, segundos.'],
    ['O que é, o que é? Abre e fecha para deixar você entrar em um cômodo.', 'Porta', 'Tapete', 'Teto', 'A porta permite a passagem entre ambientes.'],
    ['O que é, o que é? Mostra seu rosto sem tirar fotografia.', 'Espelho', 'Rádio', 'Caderno', 'O espelho reflete a sua imagem.'],
    ['O que é, o que é? Tem cabo, abre sobre a cabeça e protege da chuva.', 'Guarda-chuva', 'Colher', 'Balde', 'O guarda-chuva aberto impede que as gotas atinjam você diretamente.']
  ]},
  { name: 'Vozes da natureza', riddles: [
    ['O que é, o que é? Você sente no rosto, balança as folhas, mas não consegue ver.', 'Vento', 'Pedra', 'Areia', 'O vento é o ar em movimento.'],
    ['O que é, o que é? Nasce de uma semente e pode dar sombra e frutos.', 'Árvore', 'Rio', 'Montanha', 'Uma semente pode germinar e crescer até se tornar uma árvore.'],
    ['O que é, o que é? Aparece no céu com faixas coloridas quando há sol e gotas de água.', 'Arco-íris', 'Relâmpago', 'Neve', 'A luz do Sol atravessando gotas de água pode formar um arco-íris.'],
    ['O que é, o que é? Nasce lagarta e, depois de se transformar, ganha asas coloridas.', 'Borboleta', 'Formiga', 'Peixe', 'A lagarta passa pela metamorfose e se torna borboleta.'],
    ['O que é, o que é? Tem casca, cresce na árvore e guarda sementes por dentro.', 'Fruto', 'Ninho', 'Galho', 'Os frutos protegem as sementes de muitas plantas.']
  ]},
  { name: 'Pistas da escola', riddles: [
    ['O que é, o que é? Fica menor quando é apontado e deixa traços no papel.', 'Lápis', 'Régua', 'Tesoura', 'Ao apontar o lápis, retiramos parte de sua madeira e de sua ponta.'],
    ['O que é, o que é? Apaga marcas de lápis e se gasta ao trabalhar.', 'Borracha', 'Cola', 'Caneta', 'A borracha remove o grafite e perde pequenos pedaços com o uso.'],
    ['O que é, o que é? Tem duas lâminas que se encontram para cortar papel.', 'Tesoura', 'Apontador', 'Grampeador', 'As duas lâminas da tesoura cortam quando se fecham.'],
    ['O que é, o que é? Vai nas costas e leva seus materiais para a escola.', 'Mochila', 'Estojo', 'Carteira', 'As alças permitem carregar a mochila nas costas.'],
    ['O que é, o que é? Tem linhas e folhas, mas não é uma árvore; recebe suas anotações.', 'Caderno', 'Jardim', 'Régua', 'As folhas do caderno são páginas de papel para escrever.']
  ]},
  { name: 'Segredos do deserto', riddles: [
    ['O que é, o que é? É um lugar com água e vegetação cercado pelo deserto.', 'Oásis', 'Vulcão', 'Geleira', 'O oásis tem água disponível, permitindo a presença de plantas.'],
    ['O que é, o que é? É feita de grãos de areia e muda de forma com o vento.', 'Duna', 'Pirâmide', 'Ponte', 'O vento transporta areia e modifica as dunas.'],
    ['O que é, o que é? Tem uma corcova e é conhecido por viajar pelo deserto.', 'Dromedário', 'Crocodilo', 'Elefante', 'O dromedário tem uma corcova e adaptações à vida em regiões secas.'],
    ['O que é, o que é? Parece água ao longe no deserto, mas desaparece quando você se aproxima.', 'Miragem', 'Lago', 'Fonte', 'A miragem é um efeito da luz ao atravessar camadas de ar com temperaturas diferentes.'],
    ['O que é, o que é? Foi usada no Egito antigo como material para escrever, feita de uma planta.', 'Papiro', 'Vidro', 'Lã', 'Tiras da planta papiro eram usadas para formar uma superfície de escrita.']
  ]},
  { name: 'Sentidos escondidos', riddles: [
    ['O que é, o que é? Tem boca, mas não fala; leva água até outro rio ou até o mar.', 'Rio', 'Boneca', 'Garrafa', 'A desembocadura de um rio também pode ser chamada de boca.'],
    ['O que é, o que é? Tem asa e bico, mas não voa; serve para preparar chá.', 'Bule', 'Pássaro', 'Avião', 'A alça é a asa do bule, e o bico serve para despejar o chá.'],
    ['O que é, o que é? Tem olho, mas não vê; ajuda a costurar.', 'Agulha', 'Óculos', 'Binóculo', 'O olho da agulha é o pequeno furo por onde passa a linha.'],
    ['O que é, o que é? Tem cabeça e dentes, mas é um tempero.', 'Alho', 'Leão', 'Pente', 'Uma cabeça de alho é formada por vários dentes.'],
    ['O que é, o que é? Tem braços e recebe abraços de quem se senta, mas é um móvel.', 'Poltrona', 'Camisa', 'Árvore', 'Os braços da poltrona são apoios para os braços de quem se senta.']
  ]},
  { name: 'Pistas em movimento', riddles: [
    ['O que é, o que é? Quanto mais seca o seu corpo, mais molhada fica.', 'Toalha', 'Sabonete', 'Pente', 'A toalha absorve a água do corpo e fica molhada.'],
    ['O que é, o que é? Quanto mais terra você tira dele, maior ele fica.', 'Buraco', 'Monte', 'Tijolo', 'Retirar terra aumenta o espaço vazio do buraco.'],
    ['O que é, o que é? Corre pela casa quando você varre, mas não tem pernas.', 'Poeira', 'Gato', 'Cadeira', 'A vassoura movimenta a poeira pelo chão.'],
    ['O que é, o que é? Você enche de ar, amarra e pode usar para decorar uma festa.', 'Balão', 'Pedra', 'Livro', 'O balão aumenta de tamanho quando recebe ar.'],
    ['O que é, o que é? Cresce para baixo no teto de uma caverna.', 'Estalactite', 'Árvore', 'Escada', 'Estalactites se formam no teto das cavernas e crescem para baixo.']
  ]},
  { name: 'Palavras com segredos', riddles: [
    ['O que é, o que é? Está no começo de “areia” e no fim de “lua”.', 'A letra A', 'A letra R', 'A letra L', 'AREIA começa com A e LUA termina com A.'],
    ['O que é, o que é? Está no meio de “ovo”.', 'A letra V', 'A letra O', 'A letra U', 'A palavra OVO tem V entre dois Os.'],
    ['O que é, o que é? Ao tirar o primeiro S de “sapo”, aparece no começo da palavra que sobra.', 'A letra A', 'A letra P', 'A letra O', 'Sem o primeiro S, sobram as letras APO; a primeira é A.'],
    ['O que é, o que é? Em “arara”, aparece mais vezes do que a outra letra.', 'A letra A', 'A letra R', 'A letra E', 'ARARA tem três letras A e duas letras R.'],
    ['O que é, o que é? Você forma trocando o P de “pato” por um G.', 'Gato', 'Galo', 'Rato', 'Ao trocar apenas a primeira letra de PATO por G, temos GATO.']
  ]},
  { name: 'O invisível', riddles: [
    ['O que é, o que é? Repete sua voz sem ter boca, quando o som volta até você.', 'Eco', 'Sombra', 'Perfume', 'O eco acontece quando o som é refletido e retorna.'],
    ['O que é, o que é? Acompanha seu corpo na luz, mas some na escuridão completa.', 'Sombra', 'Pegada', 'Roupa', 'A sombra aparece quando seu corpo bloqueia a luz.'],
    ['O que é, o que é? É seu, mas outras pessoas costumam usá-lo para chamar você.', 'Seu nome', 'Seu sapato', 'Seu travesseiro', 'As pessoas usam seu nome para chamar ou identificar você.'],
    ['O que é, o que é? Você pode quebrar apenas começando a falar.', 'Silêncio', 'Pedra', 'Corda', 'Falar produz som e interrompe o silêncio.'],
    ['O que é, o que é? Permite sentir o aroma de uma flor mesmo de olhos fechados.', 'Olfato', 'Visão', 'Tato', 'O olfato é o sentido que percebe os cheiros.']
  ]},
  { name: 'Pensar de outro jeito', riddles: [
    ['O que é, o que é? Tem cidades, rios e estradas desenhados, mas ninguém mora nele.', 'Mapa', 'Aquário', 'Jardim', 'O mapa representa lugares por meio de desenhos e símbolos.'],
    ['O que é, o que é? Tem teclas e espaço, mas esse espaço não é um quarto.', 'Teclado', 'Casa', 'Mala', 'O teclado tem teclas, incluindo a barra de espaço.'],
    ['O que é, o que é? Pode atravessar uma janela de vidro fechada e iluminar o quarto.', 'Luz', 'Pedra', 'Bola', 'O vidro transparente deixa a luz passar.'],
    ['O que é, o que é? Você precisa quebrar sua casca para fazer uma omelete.', 'Ovo', 'Batata', 'Cenoura', 'A casca do ovo precisa ser aberta para usar seu conteúdo na omelete.'],
    ['O que é, o que é? Quanto mais você caminha sobre a areia, mais deixa para trás.', 'Pegadas', 'Asas', 'Nuvens', 'Seus passos deixam marcas na areia: as pegadas.']
  ]},
  { name: 'Câmara das deduções', riddles: [
    ['A esfinge escondeu um pergaminho em uma caixa. Não está na vermelha nem na azul. Entre estas três, onde está?', 'Na caixa verde', 'Na caixa azul', 'Na caixa vermelha', 'Eliminando a vermelha e a azul, resta apenas a caixa verde.'],
    ['Lia chegou antes de Bia. Bia chegou antes de Caio. Quem chegou primeiro?', 'Lia', 'Bia', 'Caio', 'A ordem é Lia, Bia e Caio.'],
    ['O enigma diz: “Sou uma palavra que nomeia um animal e rima com sapato”. Qual alternativa atende às duas pistas?', 'Gato', 'Prato', 'Cachorro', 'GATO nomeia um animal e rima com SAPATO. PRATO não é animal e CACHORRO não tem essa rima.'],
    ['Há uma pena, uma pedra e uma folha. A esfinge escolheu o objeto que não veio de um animal nem de uma planta. Qual escolheu?', 'Pedra', 'Pena', 'Folha', 'A pena veio de uma ave e a folha, de uma planta. A pedra é a opção restante.'],
    ['Uma pista diz: “Tenho páginas, conto uma história e não preciso de bateria”. Qual objeto combina com todas as pistas?', 'Livro de histórias', 'Lanterna', 'Relógio digital', 'O livro tem páginas, pode contar histórias e funciona sem bateria.']
  ]},
  { name: 'Sabedoria da esfinge', riddles: [
    ['O que é, o que é? Você pode dar a alguém e ainda continuar sabendo.', 'Uma informação', 'Sua única chave', 'Seu único lápis', 'Compartilhar uma informação não apaga o que você sabe.'],
    ['O que é, o que é? Está sempre chegando, mas, quando chega, passa a se chamar hoje.', 'Amanhã', 'Ontem', 'Meio-dia', 'Quando o dia seguinte começa, ele deixa de ser amanhã e se torna hoje.'],
    ['O que é, o que é? Para mantê-la, você precisa cumprir o que disse que faria.', 'Promessa', 'Sombra', 'Fotografia', 'Manter uma promessa é cumprir o compromisso assumido.'],
    ['Um pergaminho diz: “A chave está antes do vaso e depois do livro”. Qual é a ordem correta?', 'Livro, chave, vaso', 'Chave, livro, vaso', 'Vaso, chave, livro', 'A chave fica entre o livro, que vem antes, e o vaso, que vem depois.'],
    ['A esfinge pede algo que abre caminhos para aprender: começa com uma dúvida e termina com um ponto de interrogação. O que é?', 'Pergunta', 'Resposta', 'Despedida', 'Uma pergunta expressa uma dúvida e, na escrita, termina com ponto de interrogação.']
  ]}
];
