const { select, input, checkbox } = require('@inquirer/prompts');
const fs = require('fs').promises;
//const path = require('path');
const { randomUUID } = require('crypto'); //módulo nativo q gera id

// tem q ver pra qq serveconst DATA_FILE = path.resolve(__dirname, 'biblioteca.json'); // arquivo onde persistimos
let livros = []

const carregarLivros = async () => {
    try {
        const dados = await fs.readFile("livros.json", "utf-8");
        livros = JSON.parse(dados);
    } catch (erro) {
        livros = [];
    }
}

const salvarLivros = async () => {
    await fs.writeFile("livros.json", JSON.stringify(livros, null, 2));
}

const cadastrarLivro = async () => {
    const titulo = await input({ message: "Digite o título:" });
    const autor = await input({ message: "Digite o autor:" });
    const paginas = await input({ message: "Digite a quantidade de páginas:" });
    const genero = await input({ message: "Digite o gênero:" });
    
        //verifica se o valor existe. every = verifica se todos os itens do array atendem as condições 
    if (![titulo, autor, paginas, genero].every(campo => campo && campo.trim())) {
        console.log('Todos os campos devem ser preenchdos.');
        return;
    }
    
    //Coverte o valor de páginas que tava em texto pra núm
    const pagge = Number(paginas);

    //se pagge n for válida ou <0
    if (!pagge || pagge<= 0) {
        console.log("Número de páginas inválido. Insira um número (maior que 0).");
        return;
    }


    console.log(`Livro cadastrado com sucesso! ${titulo}`)

    livros.push({ 
            id: randomUUID(),
            titulo: titulo, 
            autor: autor, 
            paginas: paginas, 
            genero: genero, 
            status: 'quero_ler',   // status inicial
            paginaAtual: 0,
            avaliacao: null,
            dataInicio: null,
            dataFim: null
        });
}

async function atualizarStatus() {
  if (livros.length === 0) {
    console.log("\nNenhum livro cadastrado.\n");
    return;
  }

  const livroSelecionado = await select({
    message: "Selecione o livro para atualizar:",
    choices: livros.map(l => ({
      name: `${l.titulo} (${l.status})`,
      value: l.id
    }))
  });

  const novoStatus = await select({
    message: "Qual o novo status?",
    choices: [
      { name: "📖 Quero ler", value: "quero_ler" },
      { name: "📚 Lendo", value: "lendo" },
      { name: "✅ Lido", value: "lido" }
    ]
  });

  const livro = livros.find(l => l.id === livroSelecionado);
  livro.status = novoStatus;

  // Se marcar como lido, pode pedir avaliação
  if (novoStatus === "lido") {
    const avaliacaoStr = await input({
      message: "De 1 a 5 estrelas, quanto você avalia esse livro?"
    });

    const avaliacao = parseInt(avaliacaoStr);
    if (avaliacao >= 1 && avaliacao <= 5) {
      livro.avaliacao = avaliacao;
    } else {
      console.log("⚠️ Avaliação inválida, valor ignorado.");
    }
  }

  console.log("✅ Status atualizado com sucesso!");
  await salvarLivros(); // salva no JSON
}


const start = async () => {
    await carregarLivros();

    while (true) {
        await salvarLivros()

        const opcao = await select({
            message: "Menu >",
            choices: [
                {
                    name: "Cadastrar Livro",
                    value: "cadastrar"
                },
                {
                    name: "Atualizar STATUS do Livro",
                    value: "atualizarStatus"
                },
                {
                    name: "Sair",
                    value: "sair"
                }
            ]
        });

        switch (opcao) {
            case "cadastrar":
                await cadastrarLivro();
                break;
            case "atualizarStatus":
                await atualizarStatus();
                break;
            case "sair":
                console.log('Até a próxima!');
                return;
        }
    }
}

start();